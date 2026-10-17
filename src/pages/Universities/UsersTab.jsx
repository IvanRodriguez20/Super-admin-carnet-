import { useCallback, useEffect, useState } from 'react'
import { superAdminService } from '../../services/superAdminService'
import { useToast } from '../../context/ToastContext'
import { Modal, Field, Avatar, Switch, Empty, Skeleton, Spinner } from '../../components/ui'
import { ROLE_GROUPS, ROLE_LABELS } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'

const EMPTY_USER = { name: '', document: '', email: '', phone: '', role: 'admin', career: '', sendEmail: false }
const LIMIT = 15

function RoleSelect({ value, onChange }) {
  return (
    <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
      {ROLE_GROUPS.map(g => (
        <optgroup key={g.group} label={g.group}>
          {g.roles.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </optgroup>
      ))}
    </select>
  )
}

function UserFormModal({ university, user, onClose, onSaved }) {
  const toast = useToast()
  const editing = !!user?._id
  const [form, setForm] = useState(editing ? { ...EMPTY_USER, ...user } : EMPTY_USER)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        const { name, email, phone, role, career } = form
        await superAdminService.updateUser(university._id, user._id, { name, email, phone, role, career })
        toast.success('Usuario actualizado')
      } else {
        await superAdminService.createUser(university._id, form)
        toast.success(`Usuario creado · contraseña inicial: su cédula`)
      }
      onSaved()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open title={editing ? 'Editar usuario' : 'Nuevo usuario'} subtitle={university.name} onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" form="user-form" disabled={saving}>{saving ? <Spinner /> : editing ? 'Guardar cambios' : 'Crear usuario'}</button>
      </>}
    >
      <form id="user-form" className="stack" style={{ gap: 14 }} onSubmit={save}>
        <Field label="Nombre completo *"><input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <div className="grid grid-2">
          <Field label="Cédula *" hint={editing ? 'No editable' : 'Será la contraseña inicial'}>
            <input className="input" required disabled={editing} inputMode="numeric" value={form.document} onChange={(e) => set('document', e.target.value)} />
          </Field>
          <Field label="Rol *"><RoleSelect value={form.role} onChange={(v) => set('role', v)} /></Field>
        </div>
        <div className="grid grid-2">
          <Field label="Correo *"><input className="input" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} /></Field>
          <Field label="Teléfono"><input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
        </div>
        <Field label="Cargo / programa"><input className="input" value={form.career} onChange={(e) => set('career', e.target.value)} placeholder="Administrador del Sistema" /></Field>
        {!editing && (
          <label className="row" style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={form.sendEmail} onChange={(e) => set('sendEmail', e.target.checked)} />
            <span>Enviar correo de bienvenida con sus credenciales</span>
          </label>
        )}
      </form>
    </Modal>
  )
}

export default function UsersTab({ university, onChanged }) {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [filters, setFilters] = useState({ search: '', role: '', isActive: '', page: 1 })
  const [editing, setEditing] = useState(null)
  const [resetting, setResetting] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      setData(await superAdminService.listUsers(university._id, { ...filters, limit: LIMIT }))
    } catch (e) { toast.error(e.message) }
  }, [university._id, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(load, filters.search ? 300 : 0)
    return () => clearTimeout(t)
  }, [load, filters.search])

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }))

  const toggle = async (u) => {
    try {
      const r = await superAdminService.toggleUser(university._id, u._id)
      toast.success(`${u.name} ${r.isActive ? 'activado' : 'desactivado'}`)
      load(); onChanged()
    } catch (e) { toast.error(e.message) }
  }

  const doReset = async () => {
    setBusy(true)
    try {
      await superAdminService.resetPassword(university._id, resetting._id)
      toast.success(`Contraseña de ${resetting.name} restablecida a su cédula`)
      setResetting(null); load()
    } catch (e) { toast.error(e.message) } finally { setBusy(false) }
  }

  return (
    <div className="card">
      <div className="row wrap" style={{ gap: 12, marginBottom: 16 }}>
        <input className="input" style={{ maxWidth: 280 }} placeholder="Buscar por nombre, cédula o correo…" value={filters.search} onChange={(e) => setFilter('search', e.target.value)} />
        <select className="select" style={{ width: 200 }} value={filters.role} onChange={(e) => setFilter('role', e.target.value)} aria-label="Rol">
          <option value="">Todos los roles</option>
          {ROLE_GROUPS.map(g => (
            <optgroup key={g.group} label={g.group}>{g.roles.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}</optgroup>
          ))}
        </select>
        <div className="segmented">
          {[['', 'Todos'], ['true', 'Activos'], ['false', 'Inactivos']].map(([v, l]) => (
            <button key={v} className={filters.isActive === v ? 'on' : ''} onClick={() => setFilter('isActive', v)}>{l}</button>
          ))}
        </div>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setEditing({})}>＋ Nuevo usuario</button>
      </div>

      {!data ? <div className="stack" style={{ gap: 8 }}>{[...Array(5)].map((_, i) => <Skeleton key={i} h={46} />)}</div>
        : data.users.length === 0 ? <Empty icon="👤" title="No hay usuarios con estos filtros" /> : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Usuario</th><th>Cédula</th><th>Rol</th><th>Estado</th><th>Creado</th><th style={{ textAlign: 'right' }}>Acciones</th></tr>
                </thead>
                <tbody>
                  {data.users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="row">
                          <Avatar name={u.name} photo={u.photo} color={university.primaryColor} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700 }}>{u.name}</div>
                            <div className="muted" style={{ fontSize: 12 }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="tabular">{u.document}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'plan-pro' : ''}`}>{ROLE_LABELS[u.role] || u.role}</span>
                        {u.firstLogin && <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>Pendiente primer ingreso</div>}
                      </td>
                      <td>
                        <div className="row" style={{ gap: 8 }}>
                          <Switch on={u.isActive} onChange={() => toggle(u)} label={u.isActive ? 'Desactivar usuario' : 'Activar usuario'} />
                          <span className="text-2" style={{ fontSize: 12.5 }}>{u.isActive ? 'Activo' : 'Inactivo'}</span>
                        </div>
                      </td>
                      <td className="muted">{formatDate(u.createdAt)}</td>
                      <td>
                        <div className="row" style={{ justifyContent: 'flex-end', gap: 6 }}>
                          <button className="btn btn-sm" onClick={() => setEditing(u)}>✎ Editar</button>
                          <button className="btn btn-sm" onClick={() => setResetting(u)} title="Restablecer contraseña">🔑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="row between" style={{ marginTop: 14 }}>
              <span className="muted">{data.total} usuario(s) · página {data.page} de {Math.max(1, data.pages)}</span>
              <div className="row">
                <button className="btn btn-sm" disabled={data.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Anterior</button>
                <button className="btn btn-sm" disabled={data.page >= data.pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Siguiente →</button>
              </div>
            </div>
          </>
        )}

      {editing && (
        <UserFormModal
          university={university} user={editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); onChanged() }}
        />
      )}

      <Modal
        open={!!resetting} title="Restablecer contraseña" onClose={() => setResetting(null)}
        footer={<>
          <button className="btn" onClick={() => setResetting(null)}>Cancelar</button>
          <button className="btn btn-primary" onClick={doReset} disabled={busy}>{busy ? <Spinner /> : 'Restablecer'}</button>
        </>}
      >
        <div className="text-2">
          La contraseña de <b>{resetting?.name}</b> volverá a ser su cédula (<b>{resetting?.document}</b>), deberá cambiarla
          al ingresar y se le enviará un correo a <b>{resetting?.email}</b>.
        </div>
      </Modal>
    </div>
  )
}

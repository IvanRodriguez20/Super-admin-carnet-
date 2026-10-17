import { useState } from 'react'
import { superAdminService } from '../../services/superAdminService'
import { useToast } from '../../context/ToastContext'
import { Field, Spinner } from '../../components/ui'
import CarnetPreview from '../../components/CarnetPreview'
import IdentityFields, { useLogoPreview } from './IdentityFields'

const FIELDS = ['name', 'primaryColor', 'secondaryColor', 'email', 'phone', 'address', 'city', 'country', 'website']

export default function SettingsTab({ university, onSaved }) {
  const toast = useToast()
  const initial = Object.fromEntries(FIELDS.map(k => [k, university[k] || '']))
  const [form, setForm] = useState({ ...initial, logo: university.logo || '' })
  const [saving, setSaving] = useState(false)
  const logoUrl = useLogoPreview(form.logo)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const dirty = FIELDS.some(k => form[k] !== initial[k]) || form.logo instanceof File

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('El nombre es obligatorio')
    setSaving(true)
    try {
      await superAdminService.updateUniversity(university._id, form)
      toast.success('Cambios guardados')
      onSaved()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const input = (k, props = {}) => <input className="input" value={form[k]} onChange={(e) => set(k, e.target.value)} {...props} />

  return (
    <form className="grid grid-main" style={{ alignItems: 'start' }} onSubmit={save}>
      <div className="stack">
        <div className="card stack">
          <div className="card-title">Identidad</div>
          <Field label="Nombre *">{input('name')}</Field>
          <Field label="Subdominio" hint="El slug no se puede cambiar: lo usan la app móvil, el panel web y los QR emitidos">
            <div className="input-prefix">
              <input className="input" value={university.slug} disabled />
              <span>.carnetdigital.com</span>
            </div>
          </Field>
          <IdentityFields form={form} set={set} />
        </div>

        <div className="card stack">
          <div className="card-title">Contacto</div>
          <div className="grid grid-2">
            <Field label="Correo institucional">{input('email', { type: 'email' })}</Field>
            <Field label="Teléfono">{input('phone')}</Field>
          </div>
          <Field label="Dirección">{input('address')}</Field>
          <div className="grid grid-2">
            <Field label="Ciudad">{input('city')}</Field>
            <Field label="País">{input('country')}</Field>
          </div>
          <Field label="Sitio web">{input('website')}</Field>
        </div>

        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" disabled={!dirty} onClick={() => setForm({ ...initial, logo: university.logo || '' })}>Descartar</button>
          <button className="btn btn-primary" disabled={!dirty || saving}>{saving ? <Spinner /> : '💾 Guardar cambios'}</button>
        </div>
      </div>

      <div className="stack" style={{ position: 'sticky', top: 90 }}>
        <div className="card-sub" style={{ textAlign: 'center' }}>Así se verá el carné</div>
        <CarnetPreview name={form.name} primaryColor={form.primaryColor} secondaryColor={form.secondaryColor} logoUrl={logoUrl} />
      </div>
    </form>
  )
}

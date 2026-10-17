import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlatform } from '../../context/PlatformContext'
import { useToast } from '../../context/ToastContext'
import { superAdminService } from '../../services/superAdminService'
import { UniLogo, PlanBadge, StatusBadge, Switch, Skeleton, Empty } from '../../components/ui'
import ToggleUniversityModal from './ToggleUniversityModal'
import { PLANS } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'

export default function UniversitiesPage() {
  const { universities, loading, refresh } = usePlatform()
  const toast = useToast()
  const navigate = useNavigate()
  const [view, setView] = useState('grid')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [plan, setPlan] = useState('')
  const [toggling, setToggling] = useState(null)

  const filtered = useMemo(() => universities.filter(u => {
    if (status === 'active' && !u.isActive) return false
    if (status === 'inactive' && u.isActive) return false
    if (plan && u.plan !== plan) return false
    const term = q.trim().toLowerCase()
    return !term || [u.name, u.slug, u.city].some(v => v?.toLowerCase().includes(term))
  }), [universities, q, status, plan])

  const confirmToggle = async () => {
    const u = toggling
    try {
      await superAdminService.toggleUniversity(u._id)
      toast.success(`${u.name} ${u.isActive ? 'desactivada' : 'activada'}`)
      setToggling(null)
      refresh()
    } catch (e) { toast.error(e.message) }
  }

  const open = (u) => navigate(`/universities/${u._id}`)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Universidades</div>
          <div className="page-sub">Cada universidad es un tenant aislado con sus propios usuarios, equipos y accesos</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/universities/new')}>✨ Nueva universidad</button>
      </div>

      <div className="row wrap" style={{ marginBottom: 18, gap: 12 }}>
        <input className="input" style={{ maxWidth: 300 }} placeholder="Filtrar por nombre, slug o ciudad…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="segmented" aria-label="Estado">
          {[['all', 'Todas'], ['active', 'Activas'], ['inactive', 'Inactivas']].map(([v, l]) => (
            <button key={v} className={status === v ? 'on' : ''} onClick={() => setStatus(v)}>{l}</button>
          ))}
        </div>
        <select className="select" style={{ width: 170 }} value={plan} onChange={(e) => setPlan(e.target.value)} aria-label="Plan">
          <option value="">Todos los planes</option>
          {PLANS.map(p => <option key={p.value} value={p.value}>{p.icon} {p.label}</option>)}
        </select>
        <div className="segmented" style={{ marginLeft: 'auto' }} aria-label="Vista">
          <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')}>▦ Tarjetas</button>
          <button className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}>☰ Tabla</button>
        </div>
      </div>

      {loading && !universities.length ? (
        <div className="uni-grid">{[...Array(3)].map((_, i) => <Skeleton key={i} h={280} />)}</div>
      ) : view === 'grid' ? (
        <>
          <div className="uni-grid">
            {filtered.map(u => (
              <div key={u._id} className={`card uni-card ${u.isActive ? '' : 'uni-inactive'}`}>
                <div className="uni-band" style={{ background: `linear-gradient(120deg, ${u.primaryColor}, ${u.secondaryColor})` }} />
                <UniLogo university={u} />
                <div className="uni-plan">
                  <PlanBadge plan={u.plan} daysLeft={u.trialDaysLeft} />
                </div>
                <div className="uni-body">
                  <div className="uni-name">{u.name}</div>
                  <div className="uni-slug">{u.slug}.carnetdigital.com{u.city ? ` · ${u.city}` : ''}</div>
                  <div className="uni-metrics">
                    <div className="uni-metric"><b>{u.metrics.users}</b><span>Usuarios</span></div>
                    <div className="uni-metric"><b>{u.metrics.equipment}</b><span>Equipos</span></div>
                    <div className="uni-metric"><b>{u.metrics.access30d}</b><span>Accesos 30d</span></div>
                  </div>
                  <div className="row between">
                    <div className="row" style={{ gap: 8 }}>
                      <Switch on={u.isActive} onChange={() => setToggling(u)} label={u.isActive ? 'Desactivar' : 'Activar'} />
                      <StatusBadge active={u.isActive} />
                    </div>
                    <button className="btn btn-sm" onClick={() => open(u)}>Gestionar →</button>
                  </div>
                </div>
              </div>
            ))}
            <button className="card uni-new" onClick={() => navigate('/universities/new')}>
              <div>
                <div className="uni-new-plus">＋</div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Agregar universidad</div>
                <div className="muted" style={{ fontSize: 12.5 }}>Crea un nuevo tenant en menos de un minuto</div>
              </div>
            </button>
          </div>
          {filtered.length === 0 && universities.length > 0 && <Empty icon="🔍" title="Ninguna universidad coincide con los filtros" />}
        </>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {filtered.length === 0 ? <Empty icon="🔍" title="Ninguna universidad coincide con los filtros" /> : (
            <div className="table-wrap" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Universidad</th><th>Plan</th><th>Estado</th><th className="num">Usuarios</th>
                    <th className="num">Equipos</th><th className="num">Préstamos</th><th>Creada</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="row">
                          <UniLogo university={u} className="avatar" />
                          <div>
                            <div style={{ fontWeight: 700 }}>{u.name}</div>
                            <div className="muted" style={{ fontSize: 12 }}>{u.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td><PlanBadge plan={u.plan} daysLeft={u.trialDaysLeft} /></td>
                      <td>
                        <div className="row" style={{ gap: 8 }}>
                          <Switch on={u.isActive} onChange={() => setToggling(u)} label={u.isActive ? 'Desactivar' : 'Activar'} />
                          <StatusBadge active={u.isActive} />
                        </div>
                      </td>
                      <td className="num">{u.metrics.users}</td>
                      <td className="num">{u.metrics.equipment}</td>
                      <td className="num">{u.metrics.loans}</td>
                      <td className="muted">{formatDate(u.createdAt)}</td>
                      <td><button className="btn btn-sm" onClick={() => open(u)}>Gestionar →</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ToggleUniversityModal university={toggling} onClose={() => setToggling(null)} onConfirm={confirmToggle} />
    </div>
  )
}

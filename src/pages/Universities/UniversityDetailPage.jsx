import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { superAdminService } from '../../services/superAdminService'
import { usePlatform } from '../../context/PlatformContext'
import { useToast } from '../../context/ToastContext'
import { Kpi, Skeleton, Empty, UniLogo, PlanBadge, StatusBadge, Avatar } from '../../components/ui'
import AreaChart from '../../components/charts/AreaChart'
import BarList from '../../components/charts/BarList'
import StackBar from '../../components/charts/StackBar'
import ToggleUniversityModal from './ToggleUniversityModal'
import UsersTab from './UsersTab'
import SettingsTab from './SettingsTab'
import PlanTab from './PlanTab'
import { EQUIPMENT_STATUS, LOAN_STATUS, ROLE_LABELS } from '../../utils/constants'
import { formatDate, timeAgo } from '../../utils/formatters'

const TABS = [
  ['overview', '📊 Resumen'],
  ['users', '👥 Usuarios'],
  ['settings', '🎨 Identidad y datos'],
  ['plan', '💳 Plan y estado'],
]

const ADMIN_WEB_URL = import.meta.env.VITE_ADMIN_WEB_URL

const trialDaysLeft = (u) => (u.plan === 'trial' && u.trialEndsAt
  ? Math.ceil((new Date(u.trialEndsAt).getTime() - Date.now()) / 86400000)
  : null)

function OverviewTab({ detail, onGoUsers }) {
  const { metrics, usersByRole, equipmentByStatus, loansByStatus, accessTimeline, admins, recentAccess } = detail
  return (
    <div className="stack">
      <div className="grid grid-kpi">
        <Kpi icon="👥" label="Usuarios" value={metrics.users} foot={`${metrics.activeUsers} activos`} glow="rgba(57,135,229,0.22)" />
        <Kpi icon="💻" label="Equipos" value={metrics.equipment} foot="Inventario activo" glow="rgba(34,211,238,0.18)" />
        <Kpi icon="🔄" label="Préstamos" value={metrics.loans} foot="Históricos" glow="rgba(236,72,153,0.16)" />
        <Kpi icon="🚪" label="Accesos (30 días)" value={accessTimeline.reduce((a, d) => a + d.count, 0)} foot="Escaneos QR" glow="rgba(12,163,12,0.18)" />
      </div>

      <div className="grid grid-main">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Accesos al campus</div>
              <div className="card-sub">Escaneos QR diarios · últimos 30 días</div>
            </div>
          </div>
          <AreaChart data={accessTimeline} label="Accesos" />
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Administradores</div>
              <div className="card-sub">Gestionan la universidad en web_carne</div>
            </div>
            <button className="btn btn-sm" onClick={onGoUsers}>＋ Agregar</button>
          </div>
          {admins.length === 0 ? <Empty icon="🔑" title="Sin administradores">Crea uno en la pestaña Usuarios</Empty> : (
            <div className="feed">
              {admins.map(a => (
                <div key={a._id} className="feed-item">
                  <Avatar name={a.name} photo={a.photo} color="#7c5cff" />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{a.name}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{ROLE_LABELS[a.role]} · {a.document}</div>
                  </div>
                  <span className="feed-time">
                    {a.firstLogin ? <span className="badge warning">Sin primer ingreso</span> : <span className="badge good">Activo</span>}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card">
          <div className="card-head"><div className="card-title">Usuarios por rol</div></div>
          <BarList unit="usuarios" items={usersByRole.map(r => ({ key: r.role, label: ROLE_LABELS[r.role] || r.role, value: r.count }))} />
        </div>
        <div className="card stack" style={{ gap: 26 }}>
          <div>
            <div className="card-title" style={{ marginBottom: 12 }}>Estado de equipos</div>
            <StackBar items={equipmentByStatus.map(s => ({ key: s.status, value: s.count, ...EQUIPMENT_STATUS[s.status] }))} />
          </div>
          <div>
            <div className="card-title" style={{ marginBottom: 12 }}>Estado de préstamos</div>
            <StackBar items={loansByStatus.map(s => ({ key: s.status, value: s.count, ...LOAN_STATUS[s.status] }))} />
          </div>
        </div>
        <div className="card">
          <div className="card-head"><div className="card-title">Últimos accesos</div></div>
          {recentAccess.length === 0 ? <Empty icon="🚪" title="Sin escaneos todavía" /> : (
            <div className="feed">
              {recentAccess.slice(0, 6).map(a => (
                <div key={a._id} className="feed-item">
                  <span className={`badge ${a.type === 'entrada' ? 'good' : 'info'}`}>{a.type === 'entrada' ? '↘' : '↗'}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{a.user?.name || 'Usuario'}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{a.type} · {a.location}</div>
                  </div>
                  <span className="feed-time">{timeAgo(a.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UniversityDetailPage() {
  const { id } = useParams()
  const { refresh: refreshPlatform } = usePlatform()
  const toast = useToast()
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('overview')
  const [toggling, setToggling] = useState(false)

  const load = useCallback(async () => {
    try {
      setError(null)
      setDetail(await superAdminService.universityDetail(id))
    } catch (e) { setError(e.message) }
  }, [id])

  useEffect(() => { setDetail(null); setTab('overview'); load() }, [load])

  const reloadAll = () => { load(); refreshPlatform() }

  const confirmToggle = async () => {
    try {
      await superAdminService.toggleUniversity(id)
      toast.success(detail.university.isActive ? 'Universidad desactivada' : 'Universidad activada')
      setToggling(false)
      reloadAll()
    } catch (e) { toast.error(e.message) }
  }

  if (error) return <div className="page"><div className="card"><Empty icon="🛑" title="No se pudo cargar la universidad">{error}</Empty></div></div>
  if (!detail) return <div className="page stack"><Skeleton h={150} /><Skeleton h={40} w={420} /><Skeleton h={320} /></div>

  const u = detail.university

  return (
    <div className="page">
      <div className="crumbs"><Link to="/universities">Universidades</Link> › {u.name}</div>

      <div className="uni-hero">
        <div className="uni-hero-bg" style={{ background: `linear-gradient(120deg, ${u.primaryColor}, ${u.secondaryColor})` }} />
        <div className="uni-hero-content">
          <UniLogo university={u} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="row wrap" style={{ gap: 8, marginBottom: 6 }}>
              <StatusBadge active={u.isActive} />
              <PlanBadge plan={u.plan} daysLeft={trialDaysLeft(u)} />
            </div>
            <div className="page-title">{u.name}</div>
            <div className="text-2" style={{ marginTop: 4 }}>
              🌐 {u.slug}.carnetdigital.com {u.city && <>· 📍 {u.city}, {u.country}</>} · Creada {formatDate(u.createdAt)}
            </div>
          </div>
          <div className="row wrap">
            {ADMIN_WEB_URL && (
              <a className="btn" href={`${ADMIN_WEB_URL}/login`} target="_blank" rel="noreferrer" title="Panel administrativo de la universidad (web_carne)">
                ↗ Abrir panel de la universidad
              </a>
            )}
            <button className={`btn ${u.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => setToggling(true)}>
              {u.isActive ? '⛔ Desactivar' : '✅ Activar'}
            </button>
          </div>
        </div>
      </div>

      {!u.isActive && (
        <div className="alert critical" style={{ marginBottom: 18 }}>
          <span>⛔</span><span>Esta universidad está <b>inactiva</b>: sus usuarios no pueden iniciar sesión. Puedes seguir gestionándola desde aquí.</span>
        </div>
      )}

      <div className="tabs" role="tablist">
        {TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab detail={detail} onGoUsers={() => setTab('users')} />}
      {tab === 'users'    && <UsersTab university={u} onChanged={reloadAll} />}
      {tab === 'settings' && <SettingsTab university={u} onSaved={reloadAll} />}
      {tab === 'plan'     && <PlanTab university={u} onSaved={reloadAll} onToggle={() => setToggling(true)} />}

      <ToggleUniversityModal
        university={toggling ? { ...u, metrics: detail.metrics } : null}
        onClose={() => setToggling(false)} onConfirm={confirmToggle}
      />
    </div>
  )
}

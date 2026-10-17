import { useNavigate } from 'react-router-dom'
import { usePlatform } from '../../context/PlatformContext'
import { useAuth } from '../../context/AuthContext'
import { Kpi, Skeleton, UniLogo, PlanBadge, StatusBadge, Empty, Avatar } from '../../components/ui'
import AreaChart from '../../components/charts/AreaChart'
import BarList from '../../components/charts/BarList'
import { ROLE_LABELS, PLANS } from '../../utils/constants'
import { formatNumber, timeAgo } from '../../utils/formatters'

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}

export default function DashboardPage() {
  const { overview, loading, error, refresh } = usePlatform()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (loading && !overview) {
    return (
      <div className="page stack">
        <Skeleton h={40} w={320} />
        <div className="grid grid-kpi">{[...Array(5)].map((_, i) => <Skeleton key={i} h={140} />)}</div>
        <Skeleton h={280} />
      </div>
    )
  }

  if (error && !overview) {
    return (
      <div className="page">
        <div className="card">
          <Empty icon="📡" title="No se pudo cargar la plataforma">
            {error}<br />
            <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={refresh}>Reintentar</button>
          </Empty>
        </div>
      </div>
    )
  }

  const { totals, plans, usersByRole, accessTimeline, recentAccess, alerts, universities } = overview
  const open = (u) => navigate(`/universities/${u._id || u}`)
  const ranked = [...universities].sort((a, b) => b.metrics.users - a.metrics.users)
  const access30 = accessTimeline.reduce((a, d) => a + d.count, 0)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">{greeting()}, {user?.name?.split(' ')[0] || 'admin'} ✦</div>
          <div className="page-sub">Así está la red de Carné Digital hoy · {universities.length} universidades conectadas</div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="stack" style={{ gap: 8, marginBottom: 20 }}>
          {alerts.map((a, i) => (
            <div key={i} className={`alert ${a.type === 'trial_ending' ? '' : 'critical'}`}>
              <span>{a.type === 'inactive' ? '⛔' : '⏳'}</span>
              <span><b>{a.name}</b> — {a.message}</span>
              <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={() => open(a.universityId)}>Revisar →</button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-kpi" style={{ marginBottom: 16 }}>
        <Kpi hero icon="🏛️" label="Universidades activas" value={`${totals.activeUniversities}/${totals.universities}`} foot="Tenants en operación" />
        <Kpi icon="👥" label="Usuarios totales" value={formatNumber(totals.users)} foot={`${formatNumber(totals.activeUsers)} activos`} glow="rgba(57,135,229,0.22)" />
        <Kpi icon="💻" label="Equipos registrados" value={formatNumber(totals.equipment)} foot="En inventario activo" glow="rgba(34,211,238,0.18)" />
        <Kpi icon="🔄" label="Préstamos" value={formatNumber(totals.loans)} foot={`${totals.openLoans} en curso`} glow="rgba(236,72,153,0.16)" />
        <Kpi icon="🚪" label="Accesos (30 días)" value={formatNumber(totals.access30d)} foot="Escaneos de carné QR" glow="rgba(12,163,12,0.18)" />
      </div>

      <div className="grid grid-main" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Accesos en toda la red</div>
              <div className="card-sub">Escaneos QR diarios · últimos 30 días · {access30} en total</div>
            </div>
          </div>
          <AreaChart data={accessTimeline} label="Accesos" />
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Planes contratados</div>
              <div className="card-sub">Universidades por plan</div>
            </div>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            {PLANS.map(p => {
              const count = plans.find(x => x.plan === p.value)?.count || 0
              return (
                <div key={p.value} className="row" style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{p.label}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{p.desc}</div>
                  </div>
                  <b className="tabular" style={{ fontSize: 20 }}>{count}</b>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Usuarios por universidad</div>
              <div className="card-sub">Clic para gestionar</div>
            </div>
          </div>
          <BarList
            unit="usuarios"
            items={ranked.map(u => ({
              key: u._id, label: u.name, value: u.metrics.users, onClick: () => open(u),
              prefix: <span className="tenant-dot" style={{ background: u.primaryColor }} />,
            }))}
          />
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Roles en la plataforma</div>
              <div className="card-sub">Los 8 roles más comunes</div>
            </div>
          </div>
          <BarList unit="usuarios" items={usersByRole.slice(0, 8).map(r => ({ key: r.role, label: ROLE_LABELS[r.role] || r.role, value: r.count }))} />
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Actividad reciente</div>
              <div className="card-sub">Últimos escaneos en todas las sedes</div>
            </div>
          </div>
          {recentAccess.length === 0 ? <Empty icon="🛰️" title="Aún no hay escaneos" /> : (
            <div className="feed">
              {recentAccess.map(a => (
                <div key={a._id} className="feed-item">
                  <Avatar name={a.user?.name || '?'} color={a.university?.primaryColor || '#3b4a7a'} size={32} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {a.user?.name || 'Usuario'}{' '}
                      <span className={`badge ${a.type === 'entrada' ? 'good' : 'info'}`}>{a.type === 'entrada' ? '↘ Entrada' : '↗ Salida'}</span>
                    </div>
                    <div className="muted" style={{ fontSize: 12 }}>{a.university?.name} · {a.location}</div>
                  </div>
                  <span className="feed-time">{timeAgo(a.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Salud de los tenants</div>
            <div className="card-sub">Resumen operativo por universidad</div>
          </div>
          <button className="btn btn-sm" onClick={() => navigate('/universities')}>Ver todas →</button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Universidad</th><th>Estado</th><th>Plan</th>
                <th className="num">Usuarios</th><th className="num">Equipos</th><th className="num">Préstamos</th><th className="num">Accesos 30d</th>
              </tr>
            </thead>
            <tbody>
              {universities.map(u => (
                <tr key={u._id} className="clickable" onClick={() => open(u)}>
                  <td>
                    <div className="row">
                      <UniLogo university={u} className="avatar" />
                      <div>
                        <div style={{ fontWeight: 700 }}>{u.name}</div>
                        <div className="muted" style={{ fontSize: 12 }}>{u.slug}.carnetdigital.com</div>
                      </div>
                    </div>
                  </td>
                  <td><StatusBadge active={u.isActive} /></td>
                  <td><PlanBadge plan={u.plan} daysLeft={u.trialDaysLeft} /></td>
                  <td className="num">{u.metrics.users}</td>
                  <td className="num">{u.metrics.equipment}</td>
                  <td className="num">{u.metrics.loans}</td>
                  <td className="num">{u.metrics.access30d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

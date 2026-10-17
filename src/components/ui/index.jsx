import { useEffect } from 'react'
import { getInitials, readableOn } from '../../utils/formatters'
import { PLAN_LABELS } from '../../utils/constants'

export function Modal({ open, title, subtitle, onClose, children, footer, width }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal" role="dialog" aria-modal="true" style={width ? { maxWidth: width } : undefined}>
        <div className="modal-head">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>
            {subtitle && <div className="card-sub">{subtitle}</div>}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function Field({ label, hint, error, children }) {
  return (
    <label className="field">
      {label && <span className="label">{label}</span>}
      {children}
      {error ? <span className="hint" style={{ color: '#ff9c9c' }}>{error}</span> : hint && <span className="hint">{hint}</span>}
    </label>
  )
}

export function Switch({ on, onChange, disabled, label }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} aria-label={label}
      className={`switch ${on ? 'on' : ''}`} onClick={onChange} disabled={disabled}
    />
  )
}

export function StatusBadge({ active }) {
  return active
    ? <span className="badge good"><span className="badge-dot" />Activa</span>
    : <span className="badge critical"><span className="badge-dot" />Inactiva</span>
}

export function PlanBadge({ plan, daysLeft }) {
  return (
    <span className={`badge plan-${plan}`}>
      {PLAN_LABELS[plan] || plan}
      {plan === 'trial' && daysLeft !== null && daysLeft !== undefined && (
        <span style={{ opacity: .8 }}>· {daysLeft > 0 ? `${daysLeft}d` : 'vencido'}</span>
      )}
    </span>
  )
}

export function UniLogo({ university, className = 'uni-logo', style }) {
  const bg = university?.primaryColor || '#1a3a6b'
  return (
    <div className={className} style={{ background: bg, color: readableOn(bg), ...style }}>
      {university?.logo
        ? <img src={university.logo} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        : getInitials(university?.name)}
    </div>
  )
}

export function Avatar({ name, photo, color = '#3b4a7a', size = 34 }) {
  return (
    <div className="avatar" style={{ background: color, width: size, height: size, color: readableOn(color) }}>
      {photo ? <img src={photo} alt="" /> : getInitials(name)}
    </div>
  )
}

export function Empty({ icon = '🗂️', title, children }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <div style={{ fontWeight: 700, color: 'var(--text-2)' }}>{title}</div>
      {children && <div style={{ marginTop: 6, fontSize: 13 }}>{children}</div>}
    </div>
  )
}

export function Skeleton({ h = 16, w = '100%', style }) {
  return <div className="skeleton" style={{ height: h, width: w, ...style }} />
}

export function Kpi({ icon, label, value, foot, glow, hero }) {
  return (
    <div className={`card kpi ${hero ? 'kpi-hero' : ''}`} style={glow ? { '--glow': glow } : undefined}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value tabular">{value}</div>
      {foot && <div className="kpi-foot">{foot}</div>}
    </div>
  )
}

export function Spinner() {
  return <span className="spinner" aria-label="Cargando" />
}

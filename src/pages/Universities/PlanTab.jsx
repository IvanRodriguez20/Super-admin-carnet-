import { useState } from 'react'
import { superAdminService } from '../../services/superAdminService'
import { useToast } from '../../context/ToastContext'
import { Field, Spinner, StatusBadge } from '../../components/ui'
import { PLANS } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'

const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '')

export default function PlanTab({ university, onSaved, onToggle }) {
  const toast = useToast()
  const [plan, setPlan] = useState(university.plan)
  const [trialEndsAt, setTrialEndsAt] = useState(toInputDate(university.trialEndsAt))
  const [saving, setSaving] = useState(false)

  const dirty = plan !== university.plan || (plan === 'trial' && trialEndsAt !== toInputDate(university.trialEndsAt))

  const extend = (days) => {
    const base = Math.max(Date.now(), new Date(university.trialEndsAt || Date.now()).getTime())
    setTrialEndsAt(toInputDate(base + days * 86400000))
  }

  const save = async () => {
    setSaving(true)
    try {
      await superAdminService.setPlan(university._id, { plan, ...(plan === 'trial' && trialEndsAt && { trialEndsAt }) })
      toast.success('Plan actualizado')
      onSaved()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Plan de suscripción</div>
            <div className="card-sub">Define qué incluye el servicio para {university.name}</div>
          </div>
        </div>
        <div className="grid grid-kpi">
          {PLANS.map(p => (
            <button
              key={p.value} type="button" onClick={() => setPlan(p.value)} className="card"
              style={{
                textAlign: 'left', padding: 18, cursor: 'pointer',
                borderColor: plan === p.value ? 'var(--brand)' : undefined,
                background: plan === p.value ? 'var(--brand-soft)' : undefined,
              }}
            >
              <div style={{ fontSize: 24 }}>{p.icon}</div>
              <div style={{ fontWeight: 800, marginTop: 8 }}>{p.label} {plan === p.value && '✓'}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{p.desc}</div>
              {university.plan === p.value && <div className="badge info" style={{ marginTop: 10 }}>Plan actual</div>}
            </button>
          ))}
        </div>

        {plan === 'trial' && (
          <div className="row wrap" style={{ marginTop: 18, gap: 12, alignItems: 'flex-end' }}>
            <Field label="Fin del periodo de prueba">
              <input className="input" type="date" value={trialEndsAt} onChange={(e) => setTrialEndsAt(e.target.value)} style={{ width: 200 }} />
            </Field>
            <button className="btn btn-sm" onClick={() => extend(7)}>+7 días</button>
            <button className="btn btn-sm" onClick={() => extend(30)}>+30 días</button>
            <span className="muted" style={{ fontSize: 12.5 }}>Actual: {formatDate(university.trialEndsAt)}</span>
          </div>
        )}

        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
          <button className="btn btn-primary" disabled={!dirty || saving} onClick={save}>{saving ? <Spinner /> : 'Guardar plan'}</button>
        </div>
      </div>

      <div className="card" style={{ borderColor: 'rgba(208,59,59,0.35)' }}>
        <div className="card-head">
          <div>
            <div className="card-title">Estado del tenant</div>
            <div className="card-sub">Desactivar bloquea el acceso de todos sus usuarios sin borrar datos</div>
          </div>
          <StatusBadge active={university.isActive} />
        </div>
        <button className={`btn ${university.isActive ? 'btn-danger' : 'btn-success'}`} onClick={onToggle}>
          {university.isActive ? '⛔ Desactivar universidad' : '✅ Activar universidad'}
        </button>
      </div>
    </div>
  )
}

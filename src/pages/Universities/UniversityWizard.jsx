import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePlatform } from '../../context/PlatformContext'
import { useToast } from '../../context/ToastContext'
import { superAdminService } from '../../services/superAdminService'
import { Field, Spinner } from '../../components/ui'
import CarnetPreview from '../../components/CarnetPreview'
import IdentityFields, { useLogoPreview } from './IdentityFields'
import { PLANS, PLAN_LABELS } from '../../utils/constants'
import { slugify } from '../../utils/formatters'

const STEPS = ['Identidad', 'Contacto', 'Administrador', 'Plan y confirmar']

const INITIAL = {
  name: '', slug: '', primaryColor: '#1a3a6b', secondaryColor: '#FFD700', logo: null,
  email: '', phone: '', address: '', city: '', country: 'Colombia', website: '',
  adminName: '', adminDocument: '', adminEmail: '',
  plan: 'trial',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function UniversityWizard() {
  const { universities, refresh } = usePlatform()
  const toast = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL)
  const [slugTouched, setSlugTouched] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const logoUrl = useLogoPreview(form.logo)

  const set = (k, v) => setForm(f => {
    const next = { ...f, [k]: v }
    if (k === 'name' && !slugTouched) next.slug = slugify(v)
    return next
  })

  const validate = (s) => {
    const e = {}
    if (s === 0) {
      if (!form.name.trim()) e.name = 'El nombre es obligatorio'
      if (!/^[a-z0-9-]+$/.test(form.slug)) e.slug = 'Solo minúsculas, números y guiones'
      else if (universities.some(u => u.slug === form.slug)) e.slug = `El slug "${form.slug}" ya está en uso`
    }
    if (s === 1 && form.email && !EMAIL_RE.test(form.email)) e.email = 'Correo inválido'
    if (s === 2) {
      const any = form.adminName || form.adminDocument || form.adminEmail
      if (any) {
        if (!form.adminName.trim()) e.adminName = 'Requerido'
        if (!/^\d{5,15}$/.test(form.adminDocument)) e.adminDocument = 'Cédula numérica (5 a 15 dígitos)'
        if (!EMAIL_RE.test(form.adminEmail)) e.adminEmail = 'Correo inválido'
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => validate(step) && setStep(s => s + 1)

  const create = async () => {
    if (![0, 1, 2].every(validate)) return
    setSaving(true)
    try {
      const { plan, ...data } = form
      const uni = await superAdminService.createUniversity(data)
      if (plan !== 'trial') await superAdminService.setPlan(uni._id, { plan })
      await refresh()
      toast.success(`🎉 ${uni.name} ya está en la plataforma`)
      navigate(`/universities/${uni._id}`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const input = (k, props = {}) => (
    <input className={`input ${errors[k] ? 'error' : ''}`} value={form[k]} onChange={(e) => set(k, e.target.value)} {...props} />
  )

  return (
    <div className="page">
      <div className="crumbs"><Link to="/universities">Universidades</Link> › Nueva</div>
      <div className="page-head">
        <div>
          <div className="page-title">Nueva universidad ✨</div>
          <div className="page-sub">Crea un tenant nuevo: su subdominio, su identidad visual y su primer administrador</div>
        </div>
      </div>

      <div className="steps">
        {STEPS.map((s, i) => (
          <button
            key={s} type="button" className={`step ${i === step ? 'on' : i < step ? 'done' : ''}`}
            onClick={() => i < step && setStep(i)} style={{ cursor: i < step ? 'pointer' : 'default' }}
          >
            <span className="step-n">{i < step ? '✓' : i + 1}</span>
            <span className="step-text">{s}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-main" style={{ alignItems: 'start' }}>
        <div className="card stack" style={{ padding: 24 }}>
          {step === 0 && (
            <>
              <Field label="Nombre de la universidad *" error={errors.name}>
                {input('name', { placeholder: 'Universidad de los Andes', autoFocus: true })}
              </Field>
              <Field label="Subdominio (slug) *" error={errors.slug} hint="Identifica al tenant: header X-University-Slug y su URL pública">
                <div className="input-prefix">
                  <input
                    className={`input ${errors.slug ? 'error' : ''}`} value={form.slug} placeholder="uniandes"
                    onChange={(e) => { setSlugTouched(true); set('slug', e.target.value.toLowerCase()) }}
                  />
                  <span>.carnetdigital.com</span>
                </div>
              </Field>
              <IdentityFields form={form} set={set} />
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-2">
                <Field label="Correo institucional" error={errors.email}>{input('email', { type: 'email', placeholder: 'info@universidad.edu.co' })}</Field>
                <Field label="Teléfono">{input('phone', { placeholder: '(601) 000 0000' })}</Field>
              </div>
              <Field label="Dirección">{input('address', { placeholder: 'Cra. 1 # 18A-12' })}</Field>
              <div className="grid grid-2">
                <Field label="Ciudad">{input('city', { placeholder: 'Bogotá' })}</Field>
                <Field label="País">{input('country')}</Field>
              </div>
              <Field label="Sitio web">{input('website', { placeholder: 'https://www.universidad.edu.co' })}</Field>
            </>
          )}

          {step === 2 && (
            <>
              <div className="alert" style={{ borderColor: 'rgba(124,92,255,0.4)', background: 'var(--brand-soft)' }}>
                <span>🔑</span>
                <span>El administrador gestionará la universidad desde el panel <b>web_carne</b>. Su contraseña inicial será su <b>cédula</b> y deberá cambiarla en el primer ingreso.</span>
              </div>
              <Field label="Nombre completo" error={errors.adminName}>{input('adminName', { placeholder: 'Laura Martínez' })}</Field>
              <div className="grid grid-2">
                <Field label="Cédula" error={errors.adminDocument}>{input('adminDocument', { inputMode: 'numeric', placeholder: '1012345678' })}</Field>
                <Field label="Correo" error={errors.adminEmail}>{input('adminEmail', { type: 'email', placeholder: 'admin@universidad.edu.co' })}</Field>
              </div>
              <div className="hint">Puedes omitir este paso y crear administradores después desde la pestaña Usuarios.</div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="label">Plan</div>
              <div className="grid grid-2">
                {PLANS.map(p => (
                  <button
                    key={p.value} type="button" onClick={() => set('plan', p.value)}
                    className="card" style={{
                      textAlign: 'left', padding: 16, cursor: 'pointer',
                      borderColor: form.plan === p.value ? 'var(--brand)' : undefined,
                      background: form.plan === p.value ? 'var(--brand-soft)' : undefined,
                    }}
                  >
                    <div style={{ fontSize: 22 }}>{p.icon}</div>
                    <div style={{ fontWeight: 800, marginTop: 6 }}>{p.label} {form.plan === p.value && '✓'}</div>
                    <div className="muted" style={{ fontSize: 12.5 }}>{p.desc}</div>
                  </button>
                ))}
              </div>

              <div className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="card-title" style={{ marginBottom: 10 }}>Resumen</div>
                <div className="stack" style={{ gap: 6, fontSize: 13.5 }}>
                  <div className="row between"><span className="muted">Universidad</span><b>{form.name}</b></div>
                  <div className="row between"><span className="muted">URL</span><b>{form.slug}.carnetdigital.com</b></div>
                  <div className="row between"><span className="muted">Ubicación</span><b>{[form.city, form.country].filter(Boolean).join(', ') || '—'}</b></div>
                  <div className="row between"><span className="muted">Administrador</span><b>{form.adminName || 'Sin asignar'}</b></div>
                  <div className="row between"><span className="muted">Plan</span><b>{PLAN_LABELS[form.plan]}</b></div>
                </div>
              </div>
            </>
          )}

          <div className="row between" style={{ marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => (step ? setStep(step - 1) : navigate('/universities'))}>
              ← {step ? 'Atrás' : 'Cancelar'}
            </button>
            {step < STEPS.length - 1
              ? <button className="btn btn-primary" onClick={next}>Continuar →</button>
              : <button className="btn btn-primary btn-lg" onClick={create} disabled={saving}>{saving ? <Spinner /> : '🚀 Crear universidad'}</button>}
          </div>
        </div>

        <div className="stack" style={{ position: 'sticky', top: 90 }}>
          <div className="card-sub" style={{ textAlign: 'center' }}>Vista previa del carné en la app</div>
          <CarnetPreview name={form.name} primaryColor={form.primaryColor} secondaryColor={form.secondaryColor} logoUrl={logoUrl} />
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Field, Spinner } from '../../components/ui'

const PLANETS = [
  { top: '8%',  left: '44%', bg: '#1a3a6b', t: 'UC' },
  { top: '68%', left: '12%', bg: '#7b1e3a', t: 'UN' },
  { top: '34%', left: '4%',  bg: '#0f5132', t: 'UA' },
  { top: '82%', left: '62%', bg: '#4c1d95', t: 'UJ' },
]

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ document: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.document.trim(), form.password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <section className="login-art">
        <div className="brand" style={{ padding: 0 }}>
          <div className="brand-logo">🛰️</div>
          <div>
            <div className="brand-title">Carné Digital</div>
            <div className="brand-sub">Plataforma SaaS</div>
          </div>
        </div>

        <div className="orbit" aria-hidden="true">
          <div className="orbit-ring r1" />
          <div className="orbit-ring r2" />
          <div className="orbit-core">🎓</div>
          {PLANETS.map(p => (
            <div key={p.t} className="planet" style={{ top: p.top, left: p.left, background: p.bg }}>{p.t}</div>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <h1>Todas tus universidades, <span className="gradient-text">un solo centro de control.</span></h1>
          <p className="text-2" style={{ marginTop: 14, maxWidth: 440, fontSize: 15 }}>
            Crea tenants, define su identidad visual, asigna planes y supervisa usuarios, accesos y préstamos de toda la red.
          </p>
          <div className="muted" style={{ fontSize: 12, marginTop: 40 }}>Acceso exclusivo para superadministradores</div>
        </div>
      </section>

      <section className="login-form-wrap">
        <form className="card login-card" onSubmit={submit} style={{ padding: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>Bienvenido de nuevo 👋</div>
          <div className="text-2" style={{ marginBottom: 24 }}>Ingresa con tu cuenta de superadministrador</div>

          <div className="stack" style={{ gap: 14 }}>
            <Field label="Cédula">
              <input
                className="input" inputMode="numeric" autoComplete="username" autoFocus required
                placeholder="0000000000" value={form.document}
                onChange={(e) => setForm({ ...form, document: e.target.value })}
              />
            </Field>
            <Field label="Contraseña">
              <input
                className="input" type="password" autoComplete="current-password" required
                placeholder="••••••••" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Field>

            {error && <div className="alert critical" role="alert">⚠️ {error}</div>}

            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
              {loading ? <Spinner /> : 'Entrar al panel →'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

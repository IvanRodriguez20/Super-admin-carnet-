import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePlatform } from '../../context/PlatformContext'
import { Avatar, UniLogo, StatusBadge } from '../ui'

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const { universities, overview } = usePlatform()
  const navigate = useNavigate()
  const alerts = overview?.alerts?.length || 0

  return (
    <>
      <div className={`backdrop ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-logo">🛰️</div>
          <div>
            <div className="brand-title">Carné Digital</div>
            <div className="brand-sub">Super Admin</div>
          </div>
        </div>

        <div className="nav-label">Plataforma</div>
        <NavLink to="/" end className="nav-link" onClick={onClose}>
          <span className="nav-icon">🌐</span> Centro de control
          {alerts > 0 && <span className="nav-count" style={{ background: 'var(--warning-soft)', color: '#ffd27a' }}>{alerts}</span>}
        </NavLink>
        <NavLink to="/universities" end className="nav-link" onClick={onClose}>
          <span className="nav-icon">🏛️</span> Universidades
          <span className="nav-count">{universities.length}</span>
        </NavLink>
        <NavLink to="/universities/new" className="nav-link" onClick={onClose}>
          <span className="nav-icon">✨</span> Nueva universidad
        </NavLink>

        <div className="nav-label">Tenants</div>
        <div className="tenant-list">
          {universities.map(u => (
            <NavLink key={u._id} to={`/universities/${u._id}`} className="tenant-link" onClick={onClose} title={u.name}>
              <span className="tenant-dot" style={{ background: u.isActive ? u.primaryColor : 'var(--muted)' }} />
              <span className="tenant-name">{u.name}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="me">
            <Avatar name={user?.name || 'SA'} color="#7c5cff" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div className="muted" style={{ fontSize: 11.5 }}>Superadministrador</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/login') }}>⎋ Cerrar sesión</button>
        </div>
      </aside>
    </>
  )
}

function GlobalSearch() {
  const { universities } = usePlatform()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)
  const [idx, setIdx] = useState(0)

  // Atajo Ctrl/Cmd + K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return universities.slice(0, 6)
    return universities.filter(u =>
      [u.name, u.slug, u.city, u.email].some(v => v?.toLowerCase().includes(term))
    ).slice(0, 8)
  }, [q, universities])

  const go = (u) => {
    navigate(`/universities/${u._id}`)
    setQ('')
    inputRef.current?.blur()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[idx]) go(results[idx])
    if (e.key === 'Escape') inputRef.current?.blur()
  }

  return (
    <div className="search">
      <span className="search-icon">⌕</span>
      <input
        ref={inputRef} value={q} placeholder="Buscar universidad por nombre, slug o ciudad…"
        onChange={(e) => { setQ(e.target.value); setIdx(0) }}
        onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={onKeyDown} aria-label="Buscar universidad"
      />
      <span className="kbd" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>Ctrl K</span>
      {focused && (
        <div className="search-results">
          {results.length === 0 && <div className="muted" style={{ padding: 12 }}>Sin coincidencias para “{q}”</div>}
          {results.map((u, i) => (
            <button key={u._id} className={`search-item ${i === idx ? 'focused' : ''}`} onMouseDown={() => go(u)} onMouseEnter={() => setIdx(i)}>
              <UniLogo university={u} className="avatar" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{u.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{u.slug} · {u.metrics.users} usuarios</div>
              </div>
              <StatusBadge active={u.isActive} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { refresh } = usePlatform()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

  return (
    <div className="shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="main">
        <header className="topbar">
          <button className="btn btn-icon menu-btn" onClick={() => setOpen(true)} aria-label="Abrir menú">☰</button>
          <GlobalSearch />
          <div className="row" style={{ marginLeft: 'auto' }}>
            <button className="btn btn-sm" onClick={refresh} title="Actualizar datos">⟳ Actualizar</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/universities/new')}>＋ Universidad</button>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  )
}

export const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const timeAgo = (date) => {
  if (!date) return '—'
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'hace un momento'
  const m = Math.floor(s / 60)
  if (m < 60) return `hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  if (d < 30) return `hace ${d} d`
  return formatDate(date)
}

export const formatNumber = (n) => new Intl.NumberFormat('es-CO').format(n || 0)

export const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()

export const slugify = (text = '') =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/^universidad\s+(de\s+|del\s+|la\s+)*/, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30)

/** Texto legible (blanco/oscuro) sobre un color de fondo */
export const readableOn = (hex = '#000000') => {
  const c = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return L > 0.45 ? '#0b1020' : '#ffffff'
}

// Debe coincidir con ROLES en carne_backend/src/modules/user/models/User.js
export const ROLE_GROUPS = [
  { group: 'Directivos',      roles: ['rector', 'vicerrector', 'decano', 'subdecano', 'director_programa'] },
  { group: 'Académicos',      roles: ['docente', 'coordinador', 'tutor'] },
  { group: 'Estudiantes',     roles: ['estudiante', 'egresado'] },
  { group: 'Administrativos', roles: ['administrativo', 'secretaria', 'tesoreria', 'bienestar', 'biblioteca'] },
  { group: 'Operativos',      roles: ['guardia', 'sistemas', 'mantenimiento', 'monitor', 'asesor_academico'] },
  { group: 'Sistema',         roles: ['admin'] },
]

export const ROLE_LABELS = {
  rector: 'Rector', vicerrector: 'Vicerrector', decano: 'Decano', subdecano: 'Subdecano',
  director_programa: 'Director de programa', docente: 'Docente', coordinador: 'Coordinador',
  tutor: 'Tutor', estudiante: 'Estudiante', egresado: 'Egresado', administrativo: 'Administrativo',
  secretaria: 'Secretaría', tesoreria: 'Tesorería', bienestar: 'Bienestar', biblioteca: 'Biblioteca',
  guardia: 'Guardia', sistemas: 'Sistemas', mantenimiento: 'Mantenimiento', monitor: 'Monitor',
  asesor_academico: 'Asesor académico', admin: 'Admin universidad', superadmin: 'Super admin',
}

export const PLANS = [
  { value: 'trial',      label: 'Prueba',     icon: '⏳', desc: '30 días para evaluar la plataforma' },
  { value: 'basic',      label: 'Básico',     icon: '🌱', desc: 'Carné digital y control de acceso' },
  { value: 'pro',        label: 'Pro',        icon: '🚀', desc: 'Préstamos de equipos y notificaciones' },
  { value: 'enterprise', label: 'Enterprise', icon: '🏛️', desc: 'Multi-sede, soporte prioritario' },
]
export const PLAN_LABELS = Object.fromEntries(PLANS.map(p => [p.value, p.label]))

// Colores de estado: reservados, siempre acompañados de etiqueta
export const EQUIPMENT_STATUS = {
  disponible:    { label: 'Disponible',    color: 'var(--good)' },
  prestado:      { label: 'Prestado',      color: 'var(--chart-1)' },
  mantenimiento: { label: 'Mantenimiento', color: 'var(--warning)' },
  dañado:        { label: 'Dañado',        color: 'var(--critical)' },
}

export const LOAN_STATUS = {
  pendiente: { label: 'Pendiente', color: 'var(--warning)' },
  aceptado:  { label: 'Aceptado',  color: 'var(--chart-1)' },
  rechazado: { label: 'Rechazado', color: 'var(--critical)' },
  devuelto:  { label: 'Devuelto',  color: 'var(--good)' },
}

export const BRAND_PRESETS = [
  ['#1a3a6b', '#FFD700'], ['#7b1e3a', '#f2c14e'], ['#0f5132', '#a3e635'],
  ['#1e3a8a', '#38bdf8'], ['#4c1d95', '#f472b6'], ['#111827', '#f97316'],
  ['#9a3412', '#fde68a'], ['#134e4a', '#5eead4'],
]

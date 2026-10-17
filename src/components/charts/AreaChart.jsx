import { useId, useMemo, useRef, useState } from 'react'

const W = 640, PAD = { t: 12, r: 8, b: 26, l: 30 }

const fmtDay = (iso) => {
  const [, m, d] = iso.split('-')
  return `${Number(d)}/${Number(m)}`
}

/**
 * Serie temporal única (área + línea 2px) con crosshair y tooltip.
 * data: [{ date: 'YYYY-MM-DD', count }]
 */
export default function AreaChart({ data = [], label = 'Valor', height = 200 }) {
  const gid = useId()
  const ref = useRef(null)
  const [hover, setHover] = useState(null)

  const { pts, ticks } = useMemo(() => {
    const max = Math.max(4, ...data.map(d => d.count))
    const niceMax = Math.ceil(max / 4) * 4
    const iw = W - PAD.l - PAD.r, ih = height - PAD.t - PAD.b
    const pts = data.map((d, i) => ({
      ...d,
      x: PAD.l + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw),
      y: PAD.t + ih - (d.count / niceMax) * ih,
    }))
    const ticks = [0, 0.5, 1].map(f => ({ v: Math.round(niceMax * f), y: PAD.t + ih - f * ih }))
    return { pts, ticks }
  }, [data, height])

  if (!data.length) return null

  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ')
  const base = height - PAD.b
  const area = `${line} L${pts.at(-1).x},${base} L${pts[0].x},${base} Z`
  const total = data.reduce((a, d) => a + d.count, 0)
  const labelStep = Math.max(1, Math.ceil(data.length / 8))

  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    let best = 0
    pts.forEach((p, i) => { if (Math.abs(p.x - x) < Math.abs(pts[best].x - x)) best = i })
    setHover(best)
  }

  const hp = hover !== null ? pts[hover] : null

  return (
    <div className="chart">
      <svg
        ref={ref} viewBox={`0 0 ${W} ${height}`} role="img"
        aria-label={`${label}: ${total} en ${data.length} días`}
        onMouseMove={onMove} onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map(t => (
          <g key={t.v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={t.y} y2={t.y} stroke="var(--chart-grid)" />
            <text x={PAD.l - 8} y={t.y + 4} textAnchor="end" fontSize="10" fill="var(--muted)" className="tabular">{t.v}</text>
          </g>
        ))}
        <path d={area} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke="var(--chart-1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => ((pts.length - 1 - i) % labelStep === 0) && (
          <text key={p.date} x={p.x} y={height - 6} textAnchor="middle" fontSize="10" fill="var(--muted)">{fmtDay(p.date)}</text>
        ))}
        {hp && (
          <g>
            <line x1={hp.x} x2={hp.x} y1={PAD.t} y2={base} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
            <circle cx={hp.x} cy={hp.y} r="5" fill="var(--chart-1)" stroke="var(--surface-solid)" strokeWidth="2" />
          </g>
        )}
        <rect x={PAD.l} y={0} width={W - PAD.l - PAD.r} height={height} fill="transparent" />
      </svg>
      {hp && (
        <div className="chart-tooltip" style={{ left: `${(hp.x / W) * 100}%`, top: `${(hp.y / height) * 100}%` }}>
          <div className="muted">{fmtDay(hp.date)}</div>
          <b>{hp.count}</b> <span className="text-2">{label.toLowerCase()}</span>
        </div>
      )}
    </div>
  )
}

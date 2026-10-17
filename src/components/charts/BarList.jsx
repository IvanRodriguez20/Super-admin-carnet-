import { Empty } from '../ui'

/**
 * Barras horizontales de una sola serie (magnitud → un solo tono).
 * items: [{ key, label, value, prefix? (nodo), onClick? }]
 */
export default function BarList({ items = [], unit = '', emptyText = 'Sin datos todavía' }) {
  const max = Math.max(1, ...items.map(i => i.value))
  if (!items.length || items.every(i => !i.value)) return <Empty icon="📊" title={emptyText} />

  return (
    <div className="bar-list">
      {items.map(i => (
        <div
          key={i.key} className="bar-row" title={`${i.label}: ${i.value} ${unit}`}
          onClick={i.onClick} style={i.onClick ? { cursor: 'pointer' } : undefined}
        >
          <span className="bar-label">{i.prefix}{i.label}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${Math.max(i.value ? 3 : 0, (i.value / max) * 100)}%` }} />
          </div>
          <span className="bar-value">{i.value}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Barra apilada de partes de un todo, con leyenda siempre visible (etiqueta + valor),
 * para que el color de estado nunca sea la única señal.
 * items: [{ key, label, value, color }]
 */
export default function StackBar({ items = [] }) {
  const total = items.reduce((a, i) => a + i.value, 0)

  return (
    <div>
      <div className="stack-bar" role="img" aria-label={items.map(i => `${i.label}: ${i.value}`).join(', ')}>
        {total > 0 && items.filter(i => i.value > 0).map(i => (
          <div
            key={i.key} className="stack-seg" title={`${i.label}: ${i.value} (${Math.round((i.value / total) * 100)}%)`}
            style={{ flexGrow: i.value, background: i.color }}
          />
        ))}
      </div>
      <div className="legend">
        {items.map(i => (
          <span key={i.key} className="legend-item">
            <span className="legend-swatch" style={{ background: i.color }} />
            {i.label} <b>{i.value}</b>
          </span>
        ))}
      </div>
    </div>
  )
}

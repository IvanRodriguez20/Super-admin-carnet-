import { useEffect, useState } from 'react'
import { Field } from '../../components/ui'
import { BRAND_PRESETS } from '../../utils/constants'

function ColorField({ label, value, onChange }) {
  return (
    <Field label={label}>
      <div className="color-input">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} />
        <input type="text" value={value} maxLength={7} onChange={(e) => onChange(e.target.value)} aria-label={`${label} (hex)`} />
      </div>
    </Field>
  )
}

/** Hook: URL de vista previa para el logo (archivo local o URL guardada). */
export function useLogoPreview(logo) {
  const [url, setUrl] = useState(typeof logo === 'string' ? logo : '')
  useEffect(() => {
    if (logo instanceof File) {
      const u = URL.createObjectURL(logo)
      setUrl(u)
      return () => URL.revokeObjectURL(u)
    }
    setUrl(typeof logo === 'string' ? logo : '')
  }, [logo])
  return url
}

/**
 * Colores institucionales + logo. Usado en el asistente de creación y en la edición.
 */
export default function IdentityFields({ form, set }) {
  return (
    <>
      <div className="grid grid-2">
        <ColorField label="Color primario" value={form.primaryColor} onChange={(v) => set('primaryColor', v)} />
        <ColorField label="Color secundario" value={form.secondaryColor} onChange={(v) => set('secondaryColor', v)} />
      </div>
      <div className="field">
        <span className="label">Combinaciones sugeridas</span>
        <div className="swatches" role="group" aria-label="Combinaciones sugeridas">
          {BRAND_PRESETS.map(([p, s]) => (
            <button
              key={p + s} type="button" title={`${p} + ${s}`}
              className={`swatch ${form.primaryColor === p && form.secondaryColor === s ? 'on' : ''}`}
              style={{ background: `linear-gradient(135deg, ${p} 50%, ${s} 50%)`, width: 34, height: 26 }}
              onClick={() => { set('primaryColor', p); set('secondaryColor', s) }}
            />
          ))}
        </div>
      </div>
      <Field label="Logo (opcional)" hint="JPG, PNG o WEBP · máx. 2 MB · se sube a S3">
        <input
          className="input" type="file" accept=".jpg,.jpeg,.png,.webp"
          onChange={(e) => set('logo', e.target.files?.[0] || form.logo)}
        />
      </Field>
    </>
  )
}

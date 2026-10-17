import { readableOn, getInitials } from '../utils/formatters'

/**
 * Vista previa del carné digital tal como lo verá un usuario en la app móvil,
 * usando los colores institucionales de la universidad.
 */
export default function CarnetPreview({ name, primaryColor = '#1a3a6b', secondaryColor = '#FFD700', logoUrl }) {
  const ink = readableOn(primaryColor)
  const accentInk = readableOn(secondaryColor)

  return (
    <div
      className="carnet"
      style={{ background: `linear-gradient(160deg, ${primaryColor} 0%, ${primaryColor}dd 55%, #0b1020 140%)`, color: ink }}
    >
      <div className="carnet-head">
        <div className="carnet-logo" style={{ color: secondaryColor }}>
          {logoUrl ? <img src={logoUrl} alt="" /> : getInitials(name || 'U')}
        </div>
        <div>
          <div className="carnet-kicker" style={{ color: secondaryColor }}>Carné universitario</div>
          <div className="carnet-uni">{name || 'Nombre de la universidad'}</div>
        </div>
      </div>

      <div className="carnet-photo" style={{ borderColor: secondaryColor }}>👤</div>
      <div className="carnet-name">María García López</div>
      <span className="carnet-role" style={{ background: secondaryColor, color: accentInk }}>ESTUDIANTE</span>

      <div className="carnet-row"><span style={{ opacity: .75 }}>Cédula</span><b>1001234567</b></div>
      <div className="carnet-row"><span style={{ opacity: .75 }}>Programa</span><b>Ing. de Sistemas</b></div>

      <div className="carnet-qr" aria-hidden="true" />
    </div>
  )
}

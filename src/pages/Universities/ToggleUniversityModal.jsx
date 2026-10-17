import { useState } from 'react'
import { Modal, Spinner } from '../../components/ui'

/** Confirmación antes de activar/desactivar un tenant completo. */
export default function ToggleUniversityModal({ university, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false)
  if (!university) return null
  const deactivating = university.isActive

  const run = async () => {
    setBusy(true)
    try { await onConfirm() } finally { setBusy(false) }
  }

  return (
    <Modal
      open title={deactivating ? `¿Desactivar ${university.name}?` : `¿Activar ${university.name}?`} onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className={`btn ${deactivating ? 'btn-danger' : 'btn-success'}`} onClick={run} disabled={busy}>
          {busy ? <Spinner /> : deactivating ? '⛔ Sí, desactivar' : '✅ Sí, activar'}
        </button>
      </>}
    >
      {deactivating ? (
        <div className="alert critical">
          <span>⚠️</span>
          <span>
            Sus <b>{university.metrics?.users ?? 0} usuarios</b> no podrán iniciar sesión en la app ni en el panel
            de la universidad, y los escaneos QR dejarán de funcionar. Los datos se conservan y puedes reactivarla en cualquier momento.
          </span>
        </div>
      ) : (
        <div className="text-2">La universidad y todos sus usuarios activos recuperarán el acceso inmediatamente.</div>
      )}
    </Modal>
  )
}

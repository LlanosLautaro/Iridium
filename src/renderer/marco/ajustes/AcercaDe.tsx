// Ajustes › Acerca de (CO-I5, Q-103): la versión de Iridium y cuándo se armó (modulos/compartir/ux.md › CO-5).
import { fechaExacta } from '../../../compartido/fechas'

export function AcercaDe() {
  return <VersionDeIridium />
}

/** La versión de esta app: en desarrollo, los cambios en vivo; armada, cuándo y con qué commit. */
function VersionDeIridium() {
  const a = __ARMADO__
  const desarrollo = import.meta.env.DEV
  let detalle = 'En modo desarrollo: los cambios en vivo, sin armar.'
  if (!desarrollo)
    detalle = `Armada el ${fechaExacta(a.fecha)}${a.mensaje ? `, con «${a.mensaje}»` : ''}${a.sinGuardar ? ' y cambios sin commitear' : ''}.`
  return (
    <div className="campo-ajuste version-iridium">
      <div>
        <div className="r">Versión de Iridium</div>
        <div className="d">{detalle}</div>
      </div>
      <span className="valor">
        {window.iridium.version}
        {!desarrollo && a.commit ? ` · ${a.commit}` : ''}
      </span>
    </div>
  )
}

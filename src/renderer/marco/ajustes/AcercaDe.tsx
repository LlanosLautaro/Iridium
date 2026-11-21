// Ajustes › Acerca de (CO-I5, Q-103): la versión de Iridium y cuándo se armó (modulos/compartir/ux.md › CO-5).
import { fechaExacta } from '../../../compartido/fechas'
import { primeraFrase } from '../../../compartido/versiones'
import { Ajuste } from './Ajuste'

export function AcercaDe() {
  return <VersionDeIridium />
}

/** La versión de esta app: en desarrollo, los cambios en vivo; armada, cuándo y con qué commit (la primera frase de su
 * mensaje; el mensaje entero, al pasar el mouse, T-104). */
function VersionDeIridium() {
  const a = __ARMADO__
  const desarrollo = import.meta.env.DEV
  let detalle = 'En modo desarrollo: los cambios en vivo, sin armar.'
  if (!desarrollo)
    detalle = `Armada el ${fechaExacta(a.fecha)}${a.mensaje ? `, con «${primeraFrase(a.mensaje)}»` : ''}${a.sinGuardar ? ' y cambios sin commitear' : ''}.`
  return (
    <Ajuste titulo="Versión" clase="version-iridium">
      <span className="fija">
        {window.iridium.version}
        {!desarrollo && a.commit ? ` · ${a.commit}` : ''}
      </span>
      <span className="expl" title={!desarrollo && a.mensaje ? a.mensaje : undefined}>
        {detalle}
      </span>
    </Ajuste>
  )
}

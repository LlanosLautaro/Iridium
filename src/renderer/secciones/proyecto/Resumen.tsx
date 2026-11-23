// La vista de entrada de un proyecto (D-043, D-044): lo que espera del usuario, para responder ahí mismo (los de
// W-5). Solo la bandeja: los scripts están en su sección (R-70).
import { tarjetaDe, usarEstado } from '../../estado'
import { ListaPendientes, useLeerPendientes } from '../pendientes/Pendientes'

export function Resumen({ ruta }: { ruta: string }) {
  const p = usarEstado((s) => tarjetaDe(s.lista, ruta))
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  useLeerPendientes(ruta)

  if (!p) return null
  return (
    <div className="resumen">
      <section className="principal-pend" aria-label="Pendientes">
        <ListaPendientes
          p={p}
          abrirDoc={(d) => abrirDoc(ruta, d)}
          cabecera={{ titulo: 'Bandeja de entrada' }}
        />
      </section>
    </div>
  )
}

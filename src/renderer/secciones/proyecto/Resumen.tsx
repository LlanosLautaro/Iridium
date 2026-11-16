// La vista de entrada de un proyecto (D-043, D-044): lo que espera del usuario, para responder ahí mismo (los de
// W-5). Solo la bandeja: los scripts están en su sección (R-70).
import { useEffect } from 'react'
import { tarjetaDe, usarEstado } from '../../estado'
import { ListaPendientes } from '../pendientes/Pendientes'

export function Resumen({ ruta }: { ruta: string }) {
  const p = usarEstado((s) => tarjetaDe(s.lista, ruta))
  const lista = usarEstado((s) => s.lista)
  const ponerPendientes = usarEstado((s) => s.ponerPendientes)
  const abrirDoc = usarEstado((s) => s.abrirDoc)

  // Se relee cada vez que cambia la lista: la vigilancia avisa cuando cambia un `estado.md` o una respuesta.
  useEffect(() => {
    if (!lista) return
    let vigente = true
    void window.iridium.pendientes(ruta).then((x) => {
      if (vigente) ponerPendientes(x)
    })
    return () => {
      vigente = false
    }
  }, [ruta, lista, ponerPendientes])

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

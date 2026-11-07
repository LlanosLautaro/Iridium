// La vista de entrada de un proyecto (D-043, D-044): lo que espera del usuario y los scripts. Primero sus pendientes
// para responder ahí mismo (los de W-5); a continuación, en lista, un botón por cada script de `docs/scripts.md`
// (C-11). La sección Scripts los muestra con su descripción entera.
import { useEffect } from 'react'
import { tarjetaDe, usarEstado } from '../../estado'
import { ListaPendientes } from '../pendientes/Pendientes'
import { ListaScripts } from './Scripts'

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
          pie={<ListaScripts ruta={ruta} />}
          cabecera={{ titulo: 'Bandeja de entrada' }}
        />
      </section>
    </div>
  )
}

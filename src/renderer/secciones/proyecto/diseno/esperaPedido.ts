// La espera de un pedido de Diseño citado en la conversación (D-196): otra versión o una dirección nueva. Mientras la
// cita está, se espera a que el usuario la mande; mandada, a que llegue lo pedido. Termina cuando llega, cuando la IA
// termina su turno sin escribirlo, o cuando la cita se saca sin mandarla (y no arranca ningún turno en 5 s).
import { useEffect, useRef } from 'react'

export type FinEspera = 'llego' | 'no-llego' | 'sacada'

export function useEsperaPedido({
  esperando,
  llego,
  citada,
  trabajando,
  terminar,
}: {
  /** Hay un pedido esperando. */
  esperando: boolean
  /** Ya está lo pedido. */
  llego: boolean
  /** La cita sigue en la conversación, sin mandar. */
  citada: boolean
  /** La IA del proyecto está trabajando. */
  trabajando: boolean
  terminar: (fin: FinEspera) => void
}): void {
  const huboTrabajo = useRef(false)
  const fin = useRef(terminar)
  fin.current = terminar
  useEffect(() => {
    if (!esperando) {
      huboTrabajo.current = false
      return
    }
    if (llego) {
      huboTrabajo.current = false
      fin.current('llego')
    } else if (citada) huboTrabajo.current = false
    else if (trabajando) huboTrabajo.current = true
    else if (huboTrabajo.current) {
      huboTrabajo.current = false
      fin.current('no-llego')
    } else {
      // Sin la cita y sin trabajo: se mandó y el turno todavía no arrancó, o se sacó. Se espera un poco.
      const t = setTimeout(() => fin.current('sacada'), 5000)
      return () => clearTimeout(t)
    }
  }, [esperando, llego, citada, trabajando])
}

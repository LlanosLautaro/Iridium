// La lista de «/» de cada carpeta (frente Paridad, PA-1; D-169 › 2): se le pide al motor sin gastar y se recuerda
// mientras Iridium está abierto; a los 10 minutos se vuelve a pedir. Una sesión que descubre skills la pone al día.
import type { ComandoMotor, ListaComandos } from '../../compartido/comandos'
import type { Motor } from '../motor/motor'

/** Cuánto vale la lista de una carpeta antes de volver a pedirla. */
export const VIGENCIA_COMANDOS_MS = 10 * 60_000

export interface DependenciasComandos {
  motor: Motor
  /** Los usados hace poco, de todas las conversaciones (`config.json` › `comandosRecientes`). */
  recientes: () => Promise<string[]>
  /** La lista de una carpeta cambió mientras una sesión trabajaba: la ventana se pone al día. */
  alCambio?: (ruta: string, comandos: ComandoMotor[]) => void
  ahora?: () => number
}

export class Comandos {
  private readonly listas = new Map<string, { comandos: ComandoMotor[]; desde: number }>()
  private readonly pidiendo = new Map<string, Promise<ComandoMotor[] | null>>()
  private readonly ahora: () => number

  constructor(private readonly d: DependenciasComandos) {
    this.ahora = d.ahora ?? Date.now
  }

  /** La lista de la carpeta con los usados hace poco; `comandos` null si el motor no la pudo dar. */
  async de(ruta: string): Promise<ListaComandos> {
    const [comandos, recientes] = await Promise.all([this.lista(ruta), this.d.recientes().catch(() => [])])
    return { comandos, recientes }
  }

  private lista(ruta: string): Promise<ComandoMotor[] | null> {
    if (!this.d.motor.capacidades().comandos) return Promise.resolve([])
    const guardada = this.listas.get(ruta)
    if (guardada && this.ahora() - guardada.desde < VIGENCIA_COMANDOS_MS)
      return Promise.resolve(guardada.comandos)
    let pedido = this.pidiendo.get(ruta)
    if (!pedido) {
      pedido = this.d.motor
        .comandos(ruta)
        .then((comandos) => {
          this.listas.set(ruta, { comandos, desde: this.ahora() })
          return comandos
        })
        // Si no se pudo, la de antes (aunque sea vieja) antes que nada.
        .catch(() => guardada?.comandos ?? null)
        .finally(() => this.pidiendo.delete(ruta))
      this.pidiendo.set(ruta, pedido)
    }
    return pedido
  }

  /** Una sesión avisó que la lista cambió (`commands_changed`): reemplaza la de esa carpeta y lo avisa. */
  poner(ruta: string, comandos: ComandoMotor[]): void {
    this.listas.set(ruta, { comandos, desde: this.ahora() })
    this.d.alCambio?.(ruta, comandos)
  }
}

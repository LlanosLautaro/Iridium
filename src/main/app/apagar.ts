// Apagar al terminar (T-134, D-195): con el botón de la conversación armado, Iridium apaga la PC cuando ninguna IA
// trabaja ni espera lo que dejó de fondo, sin gastar uso ni pasar por la IA. Antes cuenta un minuto, que se cancela
// desde el aviso o con el mismo botón; si en ese rato vuelve a trabajar una IA, la cuenta se corta y espera de nuevo.
// Armado con todo quieto no cuenta: espera a que una IA trabaje y termine (Q-296: el botón es «al terminar», no «ya»;
// así se arma antes de escribir el pedido).
import type { EstadoApagar } from '../../compartido/puente'

/** Cuánto se cuenta antes de apagar: el rato para cancelar si el usuario sigue ahí. */
export const CUENTA_MS = 60_000

export interface DependenciasApagar {
  /** Cuántas conversaciones trabajan o esperan lo que dejaron de fondo, en cualquier proyecto. */
  ocupadas: () => number
  /** Apaga la PC (en las pruebas, lo anota). */
  apagar: () => Promise<void>
  alCambio: (e: EstadoApagar) => void
  cuentaMs?: number
  ahora?: () => number
  registrar?: (texto: string) => void
}

export class ApagarAlTerminar {
  private armado = false
  /** Desde que se armó, alguna IA trabajó: sin eso no hay nada que terminar y no se cuenta. */
  private trabajo = false
  private apagaEn: number | null = null
  private temporizador: NodeJS.Timeout | null = null
  private apagando = false
  private ultimoAviso = ''
  private readonly ahora: () => number

  constructor(private readonly d: DependenciasApagar) {
    this.ahora = d.ahora ?? Date.now
  }

  estado(): EstadoApagar {
    return { armado: this.armado, apagaEn: this.apagaEn, esperando: this.armado ? this.d.ocupadas() : 0 }
  }

  /** Arma o desarma (el botón de la conversación, o Cancelar en el aviso). */
  poner(armado: boolean): void {
    if (this.apagando) return
    this.armado = armado
    this.trabajo = false
    this.d.registrar?.(`Apagar al terminar: ${armado ? 'armado' : 'desarmado'}`)
    if (!armado) this.cortar()
    this.revisar(true)
  }

  /**
   * Cambió una conversación: con todo quieto, después de que alguna IA trabajó, empieza la cuenta; con una IA trabajando, la corta y espera. Armado, avisa
   * a la ventana lo que cambió (la cuenta, cuántas faltan); desarmado, solo si se lo pide.
   */
  revisar(avisar = false): void {
    if (!this.armado || this.apagando) {
      if (avisar) this.d.alCambio(this.estado())
      this.ultimoAviso = ''
      return
    }
    if (this.d.ocupadas() > 0) {
      this.trabajo = true
      this.cortar()
    } else if (this.trabajo && this.apagaEn === null) {
      const ms = this.d.cuentaMs ?? CUENTA_MS
      this.apagaEn = this.ahora() + ms
      this.temporizador = setTimeout(() => void this.alFinal(), ms)
      this.temporizador.unref?.()
    }
    // La conversación cambia muchas veces por turno: a la ventana va solo lo que cambió.
    const e = this.estado()
    const clave = `${e.armado}|${e.apagaEn}|${e.esperando}`
    if (avisar || clave !== this.ultimoAviso) this.d.alCambio(e)
    this.ultimoAviso = clave
  }

  /** El avance solo no toma nada nuevo mientras está armado: la PC se va a apagar. */
  get estaArmado(): boolean {
    return this.armado
  }

  cerrar(): void {
    this.cortar()
  }

  private cortar(): void {
    if (this.temporizador) clearTimeout(this.temporizador)
    this.temporizador = null
    this.apagaEn = null
  }

  private async alFinal(): Promise<void> {
    this.temporizador = null
    // En el último momento se mira de nuevo: si algo volvió a trabajar sin avisar, se espera.
    if (!this.armado || this.d.ocupadas() > 0) {
      this.apagaEn = null
      this.revisar(true)
      return
    }
    this.apagando = true
    this.d.registrar?.('Apagar al terminar: apagando la PC')
    try {
      await this.d.apagar()
    } catch (e) {
      // No se pudo: queda desarmado y la ventana lo dice.
      this.d.registrar?.(`Apagar al terminar: falló: ${e instanceof Error ? e.message : String(e)}`)
      this.apagando = false
      this.armado = false
      this.trabajo = false
      this.apagaEn = null
      this.d.alCambio({ ...this.estado(), fallo: 'Windows no dejó apagar la PC.' })
      return
    }
    this.apagando = false
    this.armado = false
    this.trabajo = false
    this.apagaEn = null
    this.d.alCambio(this.estado())
  }
}

// El uso de la suscripción (H-12, D-045): se lee al abrir la app sin gastar, llega con cada respuesta de cualquier
// sesión (y cada tanto mientras trabaja) y se relee solo cada tanto, al volver a la ventana y cuando se libera una
// ventana. Lo ve toda la app: va en la barra de estado.
import type { UsoSuscripcion } from '../../compartido/puente'
import { proximaLectura, usoSuscripcion, usoViejo } from '../core/uso'
import type { Motor, UsoMotor } from '../motor/motor'

export interface DependenciasUso {
  motor: Pick<Motor, 'uso'>
  alCambio: (uso: UsoSuscripcion) => void
  ahora?: () => number
}

export class UsoDeLaSuscripcion {
  private actual: UsoSuscripcion | null = null
  private temporizador: NodeJS.Timeout | null = null
  private cerrado = false
  private leyendo: Promise<void> | null = null
  private readonly ahora: () => number

  constructor(private readonly d: DependenciasUso) {
    this.ahora = d.ahora ?? Date.now
  }

  get(): UsoSuscripcion | null {
    return this.actual
  }

  /** Lo que informó el motor (al verificar o al terminar un turno). */
  poner(uso: UsoMotor): void {
    if (this.cerrado) return
    this.actual = usoSuscripcion(uso, this.ahora())
    this.d.alCambio(this.actual)
    this.programar()
  }

  /** Lo vuelve a leer sin mandar mensajes. Si no se puede, queda lo último y se intenta más tarde. */
  leer(): Promise<void> {
    this.leyendo ??= (async () => {
      const uso = await this.d.motor.uso().catch(() => null)
      if (uso) this.poner(uso)
      else this.programar()
    })().finally(() => {
      this.leyendo = null
    })
    return this.leyendo
  }

  /** Al volver a la ventana: lo gastado afuera (VS Code, claude.ai) aparece sin esperar a la próxima lectura. */
  alVolver(): Promise<void> {
    if (this.cerrado || !usoViejo(this.actual, this.ahora())) return Promise.resolve()
    return this.leer()
  }

  private programar(): void {
    if (this.temporizador) clearTimeout(this.temporizador)
    if (this.cerrado) return
    this.temporizador = setTimeout(() => void this.leer(), proximaLectura(this.actual, this.ahora()))
    this.temporizador.unref?.()
  }

  cerrar(): void {
    this.cerrado = true
    if (this.temporizador) clearTimeout(this.temporizador)
  }
}

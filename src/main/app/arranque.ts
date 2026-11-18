// El arranque del período de 5 horas (frente Arranque, D-149): espera el próximo momento con un solo temporizador,
// recalculado al cambiar el ajuste o el uso y al despertar la PC; al llegar, lee el uso de nuevo, busca el proyecto que
// espera hace más con respuestas del usuario y le abre una conversación nueva, como el botón Nueva. Lo que pasó va a
// `arranques.json`.
import type { AjusteArranque, PendienteVista, TarjetaProyecto, UsoSuscripcion } from '../../compartido/puente'
import {
  bloqueo,
  type Candidato,
  elegir,
  type Momento,
  pendienteAlAbrir,
  proximoMomento,
} from '../core/arranque'
import type { ArchivoArranques, RenglonArranque } from '../infra/arranques'

/**
 * Lo más que se espera de una vez: si el reloj de la PC cambia (la hora local, la suspensión que el aviso de Windows
 * no contó), a lo sumo esto tarda en notarse. No es mirar cada minuto (D-149 › 1).
 */
const ESPERA_MAXIMA_MS = 15 * 60_000

export interface DependenciasArranque {
  ajuste: () => Promise<AjusteArranque>
  /** El uso que ya se conoce, para programar sin gastar. */
  usoActual: () => UsoSuscripcion | null
  /** El uso leído de nuevo, sin gastar; null si no se pudo leer. */
  leerUso: () => Promise<UsoSuscripcion | null>
  /** Los proyectos con trabajo listo (`candidatosDe`). */
  candidatos: () => Promise<Candidato[]>
  /** Hay sesión de Claude para abrir una conversación. */
  sesionLista: () => Promise<boolean>
  /** Abre la conversación nueva, marcada con `marca` en `sesiones.json`. */
  arrancar: (ruta: string, marca: number) => Promise<void>
  archivo: ArchivoArranques
  /** Cuántos segundos lleva Iridium sin usarse (T-67). */
  segundosSinUsar: () => number
  /** Lo que pasó, para el registro del día. */
  registrar?: (texto: string) => void
  ahora?: () => number
  /** Solo pruebas (`IRIDIUM_ARRANQUE_EN`): el primer momento, a tantos segundos de empezar. */
  primeroEnSegundos?: number
}

export class Arranque {
  private temporizador: NodeJS.Timeout | null = null
  private programado: Momento | null = null
  /** El último momento que se hizo: no se repite. */
  private hecho: number | null = null
  private haciendo = false
  private durmiendo = false
  private cerrado = false
  private primero: number | null
  private readonly ahora: () => number

  constructor(private readonly d: DependenciasArranque) {
    this.ahora = d.ahora ?? Date.now
    this.primero = d.primeroEnSegundos !== undefined ? this.ahora() + d.primeroEnSegundos * 1000 : null
  }

  /** Al abrir Iridium: si el momento programado cayó en el reinicio de Actualizar solo, se hace; si no, se programa. */
  async iniciar(): Promise<void> {
    const { programado } = await this.d.archivo.leer().catch(() => ({ programado: null }))
    const ajuste = await this.d.ajuste()
    if (ajuste.prendido && pendienteAlAbrir(programado, this.ahora()) && programado !== null)
      return this.hacer({ cuando: programado, momento: 'hora' })
    return this.recalcular()
  }

  /** Cambió el ajuste o el uso: se vuelve a calcular el próximo momento. */
  async recalcular(): Promise<void> {
    if (this.cerrado || this.haciendo) return
    this.parar()
    const ajuste = await this.d.ajuste()
    if (this.cerrado || this.haciendo) return
    const ahora = this.ahora()
    let proximo = proximoMomento(ajuste, this.d.usoActual(), ahora, this.hecho)
    if (proximo && this.primero !== null && this.primero < proximo.cuando)
      proximo = { cuando: this.primero, momento: 'hora' }
    const antes = this.programado?.cuando ?? null
    this.programado = proximo
    if (antes !== (proximo?.cuando ?? null))
      await this.d.archivo.guardar({ programado: proximo?.cuando ?? null }).catch(() => {})
    if (!proximo || this.durmiendo || this.cerrado) return
    this.parar()
    this.temporizador = setTimeout(
      () => void this.revisar(),
      Math.min(Math.max(0, proximo.cuando - ahora), ESPERA_MAXIMA_MS),
    )
    this.temporizador.unref?.()
  }

  /** Windows avisó que la PC se suspende: el temporizador no sirve mientras duerme. */
  alSuspender(): void {
    this.durmiendo = true
    this.parar()
  }

  /** La PC volvió: si un momento cayó mientras dormía, se hace ahora, una vez (D-149 › 2). */
  alDespertar(): Promise<void> {
    this.durmiendo = false
    return this.revisar()
  }

  /** Lo que está programado (para las pruebas y el detalle del uso). */
  proximo(): Momento | null {
    return this.programado
  }

  cerrar(): void {
    this.cerrado = true
    this.parar()
  }

  private parar(): void {
    if (this.temporizador) clearTimeout(this.temporizador)
    this.temporizador = null
  }

  private revisar(): Promise<void> {
    const m = this.programado
    if (m && m.cuando <= this.ahora()) return this.hacer(m)
    return this.recalcular()
  }

  private async hacer(m: Momento): Promise<void> {
    if (this.haciendo || this.cerrado) return
    this.haciendo = true
    this.parar()
    this.hecho = Math.max(m.cuando, this.ahora())
    if (this.primero !== null && this.primero <= this.hecho) this.primero = null
    const sinUsarIridium = this.d.segundosSinUsar()
    let renglon: RenglonArranque
    try {
      renglon = { cuando: this.ahora(), momento: m.momento, sinUsarIridium, ...(await this.decidir()) }
    } catch (e) {
      this.d.registrar?.(`Arranque: falló al decidir: ${e instanceof Error ? e.message : String(e)}`)
      renglon = { cuando: this.ahora(), momento: m.momento, sinUsarIridium, resultado: 'sin-uso' }
    }
    if (renglon.resultado === 'arranco' && renglon.proyecto)
      await this.d.arrancar(renglon.proyecto.ruta, renglon.cuando).catch((e) => {
        this.d.registrar?.(
          `Arranque: no se pudo abrir la conversación: ${e instanceof Error ? e.message : e}`,
        )
      })
    this.d.registrar?.(
      `Arranque (${m.momento}): ${renglon.resultado}${renglon.proyecto ? ` — ${renglon.proyecto.nombre}` : ''}`,
    )
    await this.d.archivo.anotar(renglon).catch(() => {})
    this.haciendo = false
    return this.recalcular()
  }

  private async decidir(): Promise<Pick<RenglonArranque, 'resultado' | 'proyecto'>> {
    const uso = await this.d.leerUso()
    const no = bloqueo(uso, this.ahora())
    if (no) return { resultado: no }
    const elegido = elegir(await this.d.candidatos())
    if (!elegido) return { resultado: 'nada-listo' }
    if (!(await this.d.sesionLista())) return { resultado: 'sin-sesion' }
    return {
      resultado: 'arranco',
      proyecto: { ruta: elegido.ruta, nombre: elegido.nombre, preguntas: elegido.preguntas },
    }
  }
}

export interface DependenciasCandidatos {
  /** Los proyectos con la IA trabajando en Iridium. */
  enMarcha: () => string[]
  /** Si la última conversación del proyecto se usó en VS Code hace poco (D-027). */
  usadaAfuera: (ruta: string) => Promise<boolean>
  pendientes: (ruta: string) => Promise<PendienteVista[] | null>
  /** Cuándo se escribió la respuesta (`respuestas/Q-n.md`); null si no se puede leer. */
  fechaRespuesta: (ruta: string, codigo: string) => Promise<number | null>
}

/**
 * Los proyectos con trabajo listo (D-149 › 4): siguen el framework, no están archivados, no trabajan en Iridium ni se
 * usaron hace poco en VS Code, y tienen respuestas del usuario sin procesar que no son «Más tarde». Cuenta la más vieja.
 */
export async function candidatosDe(
  tarjetas: readonly TarjetaProyecto[],
  d: DependenciasCandidatos,
): Promise<Candidato[]> {
  const trabajando = new Set(d.enMarcha())
  const candidatos: Candidato[] = []
  for (const t of tarjetas) {
    if (t.archivado || t.framework === null || t.framework === 'viejo') continue
    if (t.preguntas.respondidas === 0 || trabajando.has(t.ruta)) continue
    const listas = ((await d.pendientes(t.ruta)) ?? []).filter(
      (p) => p.estado === 'respondida' && !p.postergada,
    )
    if (listas.length === 0 || (await d.usadaAfuera(t.ruta))) continue
    const fechas = await Promise.all(listas.map((p) => d.fechaRespuesta(t.ruta, p.codigo)))
    const conocidas = fechas.filter((f): f is number => f !== null)
    candidatos.push({
      ruta: t.ruta,
      nombre: t.nombre,
      preguntas: listas.map((p) => p.codigo),
      desde: conocidas.length > 0 ? Math.min(...conocidas) : Number.MAX_SAFE_INTEGER,
    })
  }
  return candidatos
}

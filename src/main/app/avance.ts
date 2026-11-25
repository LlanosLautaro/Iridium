// El avance solo (frente Frentes, D-176, D-178; `modulos/frentes/diseno-tecnico.md`): con Iridium sin usar, mira cada
// minuto si se cumplen las condiciones baratas; recién entonces lee el uso, arma la fila y abre una conversación nueva
// con el paso elegido, de a uno. Lo que tomó va a `arranques.json` (momento `avance`) con el uso al empezar; al
// terminar la sesión, el de después.
import type { AjusteAvance, AvanceApagado, UsoSuscripcion } from '../../compartido/puente'
import {
  apagado,
  clave,
  claveRevision,
  disponible,
  type Eleccion,
  elegirPaso,
  NO_REPETIR_MS,
  type PasoSolo,
  puedeMirar,
  REVISAR_CADA_MS,
  type RespuestasSolas,
  type RevisionSola,
  TEXTO_REVISION,
  textoDe,
} from '../core/avance'
import type { ArchivoArranques, RenglonArranque } from '../infra/arranques'

/** Cada cuánto mira (D-178 › 2): las condiciones cambian con el uso de la PC y con las sesiones, no con el reloj. */
const CADA_MS = 60_000

/** Si una sesión se quedó sin uso y no se sabe cuándo se libera, cuánto espera antes de volver a mirar. */
const ESPERA_SIN_HORA_MS = 30 * 60_000

export interface DependenciasAvance {
  ajuste: () => Promise<AjusteAvance>
  apagados: () => Promise<AvanceApagado>
  /** El uso que ya se conoce, para no leerlo cada minuto. */
  usoActual: () => UsoSuscripcion | null
  /** El uso leído de nuevo, sin gastar; null si no se pudo leer. */
  leerUso: () => Promise<UsoSuscripcion | null>
  /** Los proyectos con respuestas del usuario sin procesar (`candidatosDe`, la lectura del Arranque). */
  bandeja: () => Promise<RespuestasSolas[]>
  /** Los pasos `[ ]` marcados `sola` de los proyectos que se pueden tocar, en el orden de los proyectos y la ruta. */
  pasos: () => Promise<PasoSolo[]>
  /** Lo que cada proyecto que se puede tocar tiene para revisar (D-193); sin esto, no revisa. */
  revisiones?: () => Promise<RevisionSola[]>
  /** Los proyectos con la IA trabajando en Iridium. */
  enMarcha: () => string[]
  /** Hay sesión de Claude para abrir una conversación. */
  sesionLista: () => Promise<boolean>
  /** Abre la conversación nueva con ese primer mensaje, marcada con `marca` y el motivo `avance`. */
  arrancar: (ruta: string, marca: number, texto: string | null) => Promise<void>
  archivo: ArchivoArranques
  /** Cuántos segundos lleva Iridium sin usarse (T-67). */
  segundosSinUsar: () => number
  /** Solo pruebas (`IRIDIUM_AVANCE_SIN_USAR`): reemplaza los minutos sin usar del ajuste y mira cada segundo. */
  sinUsarS?: number
  registrar?: (texto: string) => void
  ahora?: () => number
  /** Cambió lo que se muestra en el aviso al volver. */
  alCambio?: () => void
  /** La PC se apaga al terminar (T-134): no toma nada nuevo. */
  quieto?: () => boolean
}

const usoAnotado = (u: UsoSuscripcion | null) => ({
  periodo: u?.cincoHoras?.usado ?? 0,
  semana: u?.semana?.usado ?? 0,
})

export class AvanceSolo {
  private temporizador: NodeJS.Timeout | null = null
  private mirando = false
  private cerrado = false
  /** Lo que tomó y sigue trabajando: al terminar se anota lo gastado. */
  private tomado: { ruta: string; cuando: number } | null = null
  /** Lo último que tomó, aunque ya haya terminado: si se cortó sin uso, se lo marca (D-194). */
  private ultimo: { ruta: string; cuando: number } | null = null
  /** Hasta cuándo no toma nada: una sesión se quedó sin uso y el período todavía no se liberó (D-194). */
  private esperaHasta = 0
  private readonly ahora: () => number

  constructor(private readonly d: DependenciasAvance) {
    this.ahora = d.ahora ?? Date.now
  }

  /** Al abrir Iridium: empieza a mirar. */
  iniciar(): void {
    if (this.cerrado || this.temporizador) return
    this.temporizador = setInterval(() => void this.mirar(), this.d.sinUsarS !== undefined ? 1000 : CADA_MS)
    this.temporizador.unref?.()
  }

  cerrar(): void {
    this.cerrado = true
    if (this.temporizador) clearInterval(this.temporizador)
    this.temporizador = null
  }

  /** Una mirada: anota lo gastado si terminó lo que tomó y, si se cumple todo, toma el paso siguiente. */
  async mirar(): Promise<void> {
    if (this.mirando || this.cerrado) return
    this.mirando = true
    try {
      await this.terminado()
      await this.tomar()
    } catch (e) {
      this.d.registrar?.(`Avance solo: falló al mirar: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      this.mirando = false
    }
  }

  /**
   * Una sesión se cortó por el uso agotado (D-194): no toma nada hasta que se libere (sin la hora, media hora) y, si era
   * la suya, la marca para que no cuente como tomada y el aviso diga que se quedó sin uso.
   */
  sinUso(ruta: string, libera: number | null): void {
    const ahora = this.ahora()
    this.esperaHasta = Math.max(
      this.esperaHasta,
      libera && libera > ahora ? libera : ahora + ESPERA_SIN_HORA_MS,
    )
    this.d.registrar?.(
      `Avance solo: sin uso, espera hasta ${new Date(this.esperaHasta).toLocaleTimeString()}`,
    )
    const u = this.ultimo
    if (!u || u.ruta !== ruta) return
    this.ultimo = null
    void this.d.archivo
      .cambiar(u.cuando, { agotado: true })
      .then(() => this.d.alCambio?.())
      .catch(() => {})
  }

  /** La sesión que abrió terminó: lee el uso y anota el de después (D-178 › 6). */
  private async terminado(): Promise<void> {
    const t = this.tomado
    if (!t || this.d.enMarcha().includes(t.ruta)) return
    this.tomado = null
    const uso = await this.d.leerUso().catch(() => null)
    const r = (await this.d.archivo.leer()).momentos.find((m) => m.cuando === t.cuando)
    if (r?.uso)
      await this.d.archivo.cambiar(t.cuando, { uso: { ...r.uso, despues: uso ? usoAnotado(uso) : null } })
    this.d.alCambio?.()
  }

  private async tomar(): Promise<void> {
    if (this.ahora() < this.esperaHasta || this.d.quieto?.()) return
    const ajuste = await this.d.ajuste()
    const condiciones = {
      ajuste,
      ahora: this.ahora(),
      segundosSinUsar: this.d.segundosSinUsar(),
      sinUsarS: this.d.sinUsarS ?? null,
      trabajando: this.d.enMarcha().length,
    }
    const conocido = this.d.usoActual()
    if (!puedeMirar({ ...condiciones, uso: conocido })) return
    // La fila primero, con el uso que ya se conoce (sin él, como con el período entero): leer el uso abre Claude Code,
    // y sin nada para tomar no se lo abre cada minuto toda la noche (paso 8).
    const fila = await this.fila()
    const elegir = (libre: number) =>
      elegirPaso(fila.bandeja, fila.pasos, libre, ajuste, fila.tomados, fila.revisiones)
    if (!elegir(conocido ? (disponible(conocido, ajuste, this.ahora()) ?? 0) : 100)) return
    const uso = await this.d.leerUso()
    const libre = disponible(uso, ajuste, this.ahora())
    if (libre === null || libre <= 0) return
    const elegido = elegir(libre)
    if (!elegido) return
    // Mientras leía, pudo volver el usuario o arrancar otra sesión.
    if (
      !puedeMirar({
        ...condiciones,
        segundosSinUsar: this.d.segundosSinUsar(),
        trabajando: this.d.enMarcha().length,
        uso,
      })
    )
      return
    if (!(await this.d.sesionLista())) return
    await this.empezar(elegido, uso)
  }

  /**
   * Lo que podría tomar, sin mirar el uso: lo que no está apagado y las claves de lo tomado hace menos de 12 horas (las
   * revisiones, de un día).
   */
  private async fila(): Promise<{
    bandeja: RespuestasSolas[]
    pasos: PasoSolo[]
    revisiones: RevisionSola[]
    tomados: Set<string>
  }> {
    const [apagados, bandeja, pasos, revisiones, datos] = await Promise.all([
      this.d.apagados(),
      this.d.bandeja(),
      this.d.pasos(),
      this.d.revisiones?.() ?? Promise.resolve([]),
      this.d.archivo.leer().catch(() => ({ momentos: [] as RenglonArranque[] })),
    ])
    const ahora = this.ahora()
    const tomados = new Set<string>()
    for (const m of datos.momentos) {
      // Lo que se quedó sin uso no lo frenó nada del proyecto: se vuelve a tomar cuando se libera.
      if (m.momento !== 'avance' || !m.proyecto || m.agotado) continue
      const k = clave(m.proyecto.ruta, m.paso, m.proyecto.preguntas)
      const cada = k === claveRevision(m.proyecto.ruta) ? REVISAR_CADA_MS : NO_REPETIR_MS
      if (m.cuando >= ahora - cada) tomados.add(k)
    }
    return {
      bandeja: bandeja.filter((c) => !apagado(apagados, c.ruta)),
      pasos: pasos.filter((p) => !apagado(apagados, p.ruta, p.carpeta)),
      revisiones: revisiones.filter((r) => !apagado(apagados, r.ruta)),
      tomados,
    }
  }

  private async empezar(e: Eleccion, uso: UsoSuscripcion | null): Promise<void> {
    const cuando = this.ahora()
    const ruta =
      e.tipo === 'bandeja' ? e.candidato.ruta : e.tipo === 'revision' ? e.revision.ruta : e.paso.ruta
    // La revisión se anota como un paso chico sin carpeta (D-193): así el aviso al volver la cuenta como los demás.
    const paso =
      e.tipo === 'paso'
        ? {
            frente: e.paso.frente,
            carpeta: e.paso.carpeta,
            texto: e.paso.texto,
            tamano: e.paso.tamano,
            linea: e.paso.linea,
          }
        : e.tipo === 'revision'
          ? { frente: 'Revisión', carpeta: '', texto: TEXTO_REVISION, tamano: 'chico' as const, linea: 0 }
          : null
    const renglon: RenglonArranque = {
      cuando,
      momento: 'avance',
      resultado: 'arranco',
      proyecto:
        e.tipo === 'bandeja'
          ? { ruta, nombre: e.candidato.nombre, preguntas: e.candidato.preguntas }
          : { ruta, nombre: e.tipo === 'revision' ? e.revision.nombre : e.paso.proyecto, preguntas: [] },
      sinUsarIridium: this.d.segundosSinUsar(),
      ...(paso ? { paso } : {}),
      uso: { antes: usoAnotado(uso), despues: null },
    }
    // Se anota antes de arrancar: si arrancar falla, no se insiste con el mismo paso en 12 horas.
    await this.d.archivo.anotar(renglon).catch(() => {})
    this.tomado = { ruta, cuando }
    this.ultimo = { ruta, cuando }
    this.d.registrar?.(
      `Avance solo: ${renglon.proyecto?.nombre}${paso ? ` — «${paso.texto}» (${paso.frente}, ${paso.tamano})` : ' — sus respuestas'}`,
    )
    await this.d.arrancar(ruta, cuando, e.tipo === 'bandeja' ? null : textoDe(e)).catch((err) => {
      this.d.registrar?.(
        `Avance solo: no se pudo abrir la conversación: ${err instanceof Error ? err.message : err}`,
      )
    })
    this.d.alCambio?.()
  }
}

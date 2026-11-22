// La sincronización con GitHub (D-159, D-172): al abrir y cada cinco minutos, de a un proyecto, trae lo del remoto de
// los que tienen su rama en uno, y lo pone encima si se puede sin juntar nada. Así lo que se hizo en la otra PC se ve
// acá sin pedírselo a nadie. No toca un proyecto donde trabaja la IA ni uno que se está armando. Al entrar a un
// proyecto, si hace más de un minuto que no se miró, pasa primero en la fila; lo que cambia archivos (mandarle algo a
// la IA, Arranque, Commit) espera a que su proyecto se haya mirado, hasta unos 15 s (`alDia`).
import type { SincroniaGit } from '../../compartido/puente'

/** Cada cuánto se mira (un `fetch` por proyecto con remoto). */
const CADA_MS = 5 * 60_000
/** La primera vuelta, apenas abre (que la lista de proyectos esté leída). */
const PRIMERA_MS = 2_000
/** Al entrar a un proyecto, si se miró hace menos que esto, no se vuelve a mirar. */
const RECIENTE_MS = 60_000
/** Lo más que espera lo que cambia archivos: después sigue igual y lo avisa (D-172 › 3). */
export const ESPERA_MS = 15_000

export interface DependenciasSincronia {
  /** Las carpetas de los proyectos (sin los archivados). */
  proyectos(): Promise<string[]>
  /** Trae lo del remoto; null si el proyecto no tiene su rama en uno. */
  traer(ruta: string): Promise<SincroniaGit | null>
  /** La IA trabaja en el proyecto o se está armando: no se toca. */
  ocupado(ruta: string): Promise<boolean>
  ahora(): number
  registrar(texto: string): void
  /** Trajo commits: lo que se muestra del proyecto cambió. */
  alTraer?(ruta: string): void
}

/**
 * Cómo quedó un proyecto antes de cambiarle archivos: `esperó` si hubo que mirarlo ahora; `aviso`, en palabras del
 * usuario, si sigue sin estar al día (sin conexión, sin sesión, los dos lados con commits propios o tardó demasiado).
 */
export interface AlDia {
  espero: boolean
  aviso: string | null
}

/** El aviso de lo que se hace sin estar al día con GitHub; null si quedó al día (o no tiene remoto). */
export function avisoDeAlDia(s: SincroniaGit | null): string | null {
  if (!s) return null
  switch (s.resultado) {
    case 'al-dia':
    case 'bajado':
      return null
    case 'separada':
      return 'Esta PC y GitHub tienen commits distintos: Sincronizar, en Git, los junta.'
    case 'choca':
      return s.motivo ?? 'Hay cambios sin guardar en los mismos archivos que trae GitHub.'
    case 'sin-conexion':
    case 'error':
      return s.motivo ?? 'No se pudo revisar GitHub.'
  }
}

export class VigiaSincronia {
  private reloj: ReturnType<typeof setTimeout> | null = null
  /** Los proyectos por mirar, en orden; el que se pide (`revisar`, `alDia`) va adelante. */
  private fila: string[] = []
  /** La promesa de cada proyecto en la fila o mirándose: se cumple al terminar de mirarlo. */
  private esperas = new Map<string, { promesa: Promise<void>; cumplir: () => void }>()
  private mirando = false
  private estados = new Map<string, SincroniaGit>()
  /** Los proyectos mirados desde que abrió Iridium (con remoto o sin él). */
  private mirados = new Set<string>()
  private cerrado = false

  constructor(private readonly d: DependenciasSincronia) {}

  vigilar(primeraMs = PRIMERA_MS): void {
    this.cerrado = false
    this.programar(primeraMs)
  }

  cerrar(): void {
    this.cerrado = true
    if (this.reloj) clearTimeout(this.reloj)
    this.reloj = null
    this.fila = []
    for (const e of this.esperas.values()) e.cumplir()
    this.esperas.clear()
  }

  /** La última vez que se miró ese proyecto; null si todavía no. */
  de(ruta: string): SincroniaGit | null {
    return this.estados.get(ruta) ?? null
  }

  /** Lo que pasó al sincronizar a mano: cuenta como mirado. */
  anotar(ruta: string, s: SincroniaGit): void {
    this.estados.set(ruta, s)
    this.mirados.add(ruta)
  }

  /** Al entrar a un proyecto: si no se miró hace poco, pasa primero en la fila. */
  revisar(ruta: string): Promise<void> {
    const ultimo = this.estados.get(ruta)
    if (this.cerrado || (ultimo && this.d.ahora() - ultimo.cuando < RECIENTE_MS)) return Promise.resolve()
    return this.pedir(ruta, true)
  }

  /**
   * Antes de cambiarle archivos (D-172): si todavía no se miró desde que abrió Iridium, pasa primero y se lo espera,
   * hasta `limiteMs`. Lo ya mirado no espera nada.
   */
  async alDia(ruta: string, limiteMs = ESPERA_MS): Promise<AlDia> {
    if (this.cerrado || this.mirados.has(ruta)) return { espero: false, aviso: avisoDeAlDia(this.de(ruta)) }
    let reloj: ReturnType<typeof setTimeout> | undefined
    const tarde = new Promise<'tarde'>((cumplir) => {
      reloj = setTimeout(() => cumplir('tarde'), limiteMs)
    })
    const r = await Promise.race([this.pedir(ruta, true).then(() => 'listo' as const), tarde])
    clearTimeout(reloj)
    if (r === 'tarde') {
      this.d.registrar(
        `Sincronizar: ${ruta} no terminó de mirarse en ${limiteMs / 1000} s; se sigue sin esperar`,
      )
      return { espero: true, aviso: 'GitHub tardó demasiado en contestar: se siguió sin ponerse al día.' }
    }
    return { espero: true, aviso: avisoDeAlDia(this.de(ruta)) }
  }

  /** Una vuelta por todos los proyectos, de a uno; se cumple cuando se miraron todos. */
  async vuelta(): Promise<void> {
    let rutas: string[]
    try {
      rutas = await this.d.proyectos()
    } catch (e) {
      this.d.registrar(`Sincronizar: no se pudo mirar — ${e instanceof Error ? e.message : e}`)
      return
    }
    await Promise.all(rutas.map((r) => this.pedir(r, false)))
  }

  private programar(ms: number): void {
    if (this.reloj) clearTimeout(this.reloj)
    this.reloj = setTimeout(() => {
      void this.vuelta().finally(() => {
        if (!this.cerrado) this.programar(CADA_MS)
      })
    }, ms)
  }

  /** Suma el proyecto a la fila (adelante si se pide) y da la promesa de cuando termine de mirarse. */
  private pedir(ruta: string, primero: boolean): Promise<void> {
    if (this.cerrado) return Promise.resolve()
    let espera = this.esperas.get(ruta)
    if (!espera) {
      let cumplir = () => {}
      const promesa = new Promise<void>((c) => {
        cumplir = c
      })
      espera = { promesa, cumplir }
      this.esperas.set(ruta, espera)
      this.fila.push(ruta)
    }
    if (primero && this.fila.includes(ruta)) this.fila = [ruta, ...this.fila.filter((r) => r !== ruta)]
    void this.trabajar()
    return espera.promesa
  }

  /** Mira la fila de a un proyecto hasta vaciarla. */
  private async trabajar(): Promise<void> {
    if (this.mirando) return
    this.mirando = true
    try {
      for (let ruta = this.fila.shift(); ruta !== undefined && !this.cerrado; ruta = this.fila.shift()) {
        try {
          await this.uno(ruta)
        } catch (e) {
          this.d.registrar(`Sincronizar: no se pudo mirar ${ruta} — ${e instanceof Error ? e.message : e}`)
        } finally {
          this.esperas.get(ruta)?.cumplir()
          this.esperas.delete(ruta)
        }
      }
    } finally {
      this.mirando = false
    }
  }

  private async uno(ruta: string): Promise<void> {
    if (await this.d.ocupado(ruta)) return
    const r = await this.d.traer(ruta)
    this.mirados.add(ruta)
    if (!r) {
      this.estados.delete(ruta)
      return
    }
    this.estados.set(ruta, r)
    if (r.resultado === 'bajado') {
      this.d.registrar(`Sincronizar: ${ruta} trajo ${r.bajados} commit(s) del remoto`)
      this.d.alTraer?.(ruta)
    }
  }
}

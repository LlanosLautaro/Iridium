// La sincronización con GitHub (D-159): al abrir y cada cinco minutos, de a un proyecto, trae lo del remoto de los
// que tienen su rama en uno, y lo pone encima si se puede sin juntar nada. Así lo que se hizo en la otra PC se ve acá
// sin pedírselo a nadie. No toca un proyecto donde trabaja la IA ni uno que se está armando. Al entrar a un proyecto,
// si hace más de un minuto que no se miró, lo mira ya.
import type { SincroniaGit } from '../../compartido/puente'

/** Cada cuánto se mira (un `fetch` por proyecto con remoto). */
const CADA_MS = 5 * 60_000
/** La primera vuelta, un rato después de abrir (que la grilla y el motor arranquen primero). */
const PRIMERA_MS = 20_000
/** Al entrar a un proyecto, si se miró hace menos que esto, no se vuelve a mirar. */
const RECIENTE_MS = 60_000

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

export class VigiaSincronia {
  private reloj: ReturnType<typeof setTimeout> | null = null
  private cola: Promise<void> = Promise.resolve()
  private estados = new Map<string, SincroniaGit>()
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
  }

  /** La última vez que se miró ese proyecto; null si todavía no. */
  de(ruta: string): SincroniaGit | null {
    return this.estados.get(ruta) ?? null
  }

  /** Lo que pasó al sincronizar a mano: cuenta como mirado. */
  anotar(ruta: string, s: SincroniaGit): void {
    this.estados.set(ruta, s)
  }

  /** Al entrar a un proyecto: si no se miró hace poco, se mira ya (en la fila, sin pisar otra vuelta). */
  revisar(ruta: string): Promise<void> {
    const ultimo = this.estados.get(ruta)
    if (this.cerrado || (ultimo && this.d.ahora() - ultimo.cuando < RECIENTE_MS)) return Promise.resolve()
    return this.enFila(() => this.uno(ruta))
  }

  /** Una vuelta por todos los proyectos, de a uno. */
  vuelta(): Promise<void> {
    return this.enFila(async () => {
      for (const ruta of await this.d.proyectos()) {
        if (this.cerrado) return
        await this.uno(ruta)
      }
    })
  }

  private programar(ms: number): void {
    if (this.reloj) clearTimeout(this.reloj)
    this.reloj = setTimeout(() => {
      void this.vuelta().finally(() => {
        if (!this.cerrado) this.programar(CADA_MS)
      })
    }, ms)
  }

  private enFila(f: () => Promise<void>): Promise<void> {
    this.cola = this.cola
      .then(f)
      .catch((e) => this.d.registrar(`Sincronizar: no se pudo mirar — ${e instanceof Error ? e.message : e}`))
    return this.cola
  }

  private async uno(ruta: string): Promise<void> {
    if (await this.d.ocupado(ruta)) return
    const r = await this.d.traer(ruta)
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

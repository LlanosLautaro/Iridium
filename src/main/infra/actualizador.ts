// Las versiones nuevas de una copia instalada (D-171, modulos/compartir/diseno-tecnico.md › Iridium instalado): las
// baja electron-updater de las versiones de GitHub, solo lo que cambió, y entran al cerrar Iridium. Para la ventana es
// lo mismo que la versión nueva lista de la copia del usuario (CO-I2): el mismo aviso y el mismo Reiniciar ahora.
// electron-updater queda detrás de `Actualizable` (`actualizador-electron.ts`), así se prueba con uno falso.
import type { VersionNueva } from '../../compartido/puente'
import { lanzarVentana, type VentanaActualizando } from './ventana-actualizando'

/** Cada cuánto se mira si hay una versión nueva. */
const CADA_MS = 6 * 60 * 60 * 1000
/** La primera vez, un rato después de abrir: que no compita con el arranque. */
const PRIMERA_MS = 20_000

/** Lo que dice `latest.yml` de la versión bajada (`tools/publicar.ts` le suma el commit y su primera línea). */
export interface InfoBajada {
  version: string
  releaseDate?: string
  commit?: unknown
  releaseNotes?: unknown
}

/** Lo que Iridium usa de electron-updater. */
export interface Actualizable {
  /** Mira la última versión y, si es otra, la baja. */
  buscar(): Promise<void>
  /** Cierra Iridium y pone la versión bajada, sin preguntar; con `abrir`, la abre al terminar. */
  instalarYSalir(abrir: boolean): void
  alBajar(f: (info: InfoBajada) => void): void
}

/** La versión bajada como la muestra el aviso de versión nueva. */
export function versionDeInfo(info: InfoBajada): VersionNueva {
  const fecha = info.releaseDate ? new Date(info.releaseDate) : null
  const d = (n: number) => String(n).padStart(2, '0')
  const local =
    fecha && !Number.isNaN(fecha.getTime())
      ? `${fecha.getFullYear()}-${d(fecha.getMonth() + 1)}-${d(fecha.getDate())}T${d(fecha.getHours())}:${d(fecha.getMinutes())}:${d(fecha.getSeconds())}`
      : ''
  return {
    fecha: local,
    commit: typeof info.commit === 'string' && info.commit ? info.commit : `v${info.version}`,
    mensaje: typeof info.releaseNotes === 'string' ? (info.releaseNotes.split('\n')[0]?.trim() ?? '') : '',
    sinGuardar: false,
    noEntro: null,
  }
}

export class Actualizador {
  private actual: VersionNueva | null = null
  private numero: string | undefined
  private avisar: ((v: VersionNueva | null) => void) | null = null
  private relojes: ReturnType<typeof setTimeout>[] = []

  constructor(
    private readonly o: {
      updater: Actualizable
      anotar: (texto: string) => void
      primeraMs?: number
      cadaMs?: number
      /**
       * La ventanita «Actualizando Iridium…» (T-128): `carpeta` es la de Iridium.exe, `pendiente` la de
       * electron-updater (el instalador corre desde ahí) y `temporal` donde se copia.
       */
      ventana?: VentanaActualizando & { carpeta: string; pendiente: string; temporal: string }
    },
  ) {
    o.updater.alBajar((info) => {
      this.actual = versionDeInfo(info)
      this.numero = info.version
      o.anotar(`Actualizaciones: bajada la versión ${info.version} (${this.actual.commit})`)
      this.avisar?.(this.actual)
    })
  }

  ultima(): VersionNueva | null {
    return this.actual
  }

  /** Mira un rato después de abrir y después cada seis horas; avisa cuando hay una versión bajada. */
  vigilar(alCambiar: (v: VersionNueva | null) => void): void {
    this.avisar = alCambiar
    this.relojes.push(
      setTimeout(() => void this.mirar(), this.o.primeraMs ?? PRIMERA_MS),
      setInterval(() => void this.mirar(), this.o.cadaMs ?? CADA_MS),
    )
  }

  /** Una vuelta: sin internet o con GitHub caído, lo anota y vuelve a probar en la próxima. */
  async mirar(): Promise<void> {
    if (this.actual) return
    try {
      await this.o.updater.buscar()
    } catch (e) {
      this.o.anotar(
        `Actualizaciones: no se pudo mirar (${e instanceof Error ? e.message.split('\n')[0] : e})`,
      )
    }
  }

  cerrar(): void {
    for (const r of this.relojes) clearTimeout(r)
    this.relojes = []
  }

  /**
   * Al cerrarse Iridium, si hay una versión bajada: con `abrir` (Reiniciar ahora) la pone y la abre; sin él la pone
   * electron-updater solo cuando Iridium termina de salir. En los dos casos, antes, la ventanita que muestra cómo va
   * (T-128, Q-280): mira este Iridium cerrarse y el instalador correr; si no arranca, la versión entra igual.
   */
  async ponerAlCerrar(abrir: boolean): Promise<boolean> {
    if (!this.actual) return false
    const v = this.o.ventana
    if (v)
      await lanzarVentana(v, {
        temporal: v.temporal,
        carpeta: v.carpeta,
        abrir,
        version: this.numero,
        instalada: { iridium: process.pid, pendiente: v.pendiente },
      }).catch((e) => this.o.anotar(`Actualizaciones: no se pudo mostrar la ventanita (${e})`))
    if (abrir) this.o.updater.instalarYSalir(true)
    return true
  }
}

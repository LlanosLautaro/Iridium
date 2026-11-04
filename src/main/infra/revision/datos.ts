// `revision.json` en los datos del Centro (diseno-tecnico.md › Datos): direcciones recordadas y la última conexión de
// la extensión. Se puede rehacer: si falta o está roto, se vuelve a resolver o a preguntar.
import { mkdir, readFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { z } from 'zod'
import { escribirAtomico } from '../escritura'

const Datos = z.object({
  version: z.literal(1).catch(1),
  /** `localhost:5173` → ruta del proyecto, con la fecha en que se resolvió o se eligió. */
  direcciones: z.record(z.string(), z.object({ ruta: z.string(), fecha: z.string() })).catch({}),
  /** Carpeta de una app Electron que no está dentro de un proyecto (una instalada) → el proyecto que se eligió. */
  carpetas: z.record(z.string(), z.object({ ruta: z.string(), fecha: z.string() })).catch({}),
  /** Última vez que la extensión habló con Iridium, y con qué versión. */
  extension: z.object({ ultima: z.string(), version: z.string() }).nullable().catch(null),
})
export type DatosRevision = z.infer<typeof Datos>

const VACIO: DatosRevision = { version: 1, direcciones: {}, carpetas: {}, extension: null }

export class ArchivoRevision {
  private actual: DatosRevision | null = null
  private escribiendo: Promise<void> = Promise.resolve()

  constructor(private readonly archivo: string) {}

  async leer(): Promise<DatosRevision> {
    if (this.actual) return this.actual
    try {
      this.actual = Datos.parse(JSON.parse(await readFile(this.archivo, 'utf8')))
    } catch {
      this.actual = structuredClone(VACIO)
    }
    return this.actual
  }

  /** Cambia los datos y los guarda; los cambios se escriben de a uno. */
  async cambiar(cambio: (d: DatosRevision) => void): Promise<void> {
    const d = await this.leer()
    cambio(d)
    const texto = `${JSON.stringify(d, null, 2)}\n`
    this.escribiendo = this.escribiendo.then(async () => {
      await mkdir(dirname(this.archivo), { recursive: true })
      await escribirAtomico(this.archivo, texto)
    })
    await this.escribiendo
  }
}

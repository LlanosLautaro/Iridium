// Lo que ya se miró de cada maqueta (frente Diseño, DS-3): `diseno.json` en los datos del Centro, con la huella vista
// de cada archivo por proyecto. Se puede perder: todo vuelve a contar como visto.
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { z } from 'zod'
import { escribirAtomico, leerDatos } from '../escritura'

const Archivo = z.object({
  version: z.literal(1),
  proyectos: z.record(z.string(), z.record(z.string(), z.string().catch(''))),
})

export class ArchivoVistos {
  private actual: Map<string, Map<string, string>> | null = null
  private escribiendo: Promise<void> = Promise.resolve()

  constructor(private readonly archivo: string) {}

  private async todos(): Promise<Map<string, Map<string, string>>> {
    if (this.actual) return this.actual
    this.actual = new Map()
    const datos = await leerDatos(this.archivo, (t) => Archivo.parse(JSON.parse(t)))
    for (const [ruta, vistos] of Object.entries(datos?.proyectos ?? {}))
      this.actual.set(ruta, new Map(Object.entries(vistos)))
    return this.actual
  }

  /** Las huellas vistas de un proyecto, o null si nunca se abrió su Diseño. */
  async de(proyecto: string): Promise<ReadonlyMap<string, string> | null> {
    return (await this.todos()).get(proyecto) ?? null
  }

  /** Marca vistas esas huellas (las demás del proyecto quedan como estaban). */
  async marcar(proyecto: string, huellas: Readonly<Record<string, string>>): Promise<void> {
    const todos = await this.todos()
    const vistos = todos.get(proyecto) ?? new Map<string, string>()
    let cambio = !todos.has(proyecto)
    for (const [archivo, huella] of Object.entries(huellas))
      if (vistos.get(archivo) !== huella) {
        vistos.set(archivo, huella)
        cambio = true
      }
    todos.set(proyecto, vistos)
    if (!cambio) return
    const contenido = `${JSON.stringify(
      {
        version: 1,
        proyectos: Object.fromEntries([...todos].map(([r, v]) => [r, Object.fromEntries(v)])),
      },
      null,
      2,
    )}\n`
    this.escribiendo = this.escribiendo
      .catch(() => {})
      .then(async () => {
        await mkdir(dirname(this.archivo), { recursive: true })
        await escribirAtomico(this.archivo, contenido)
      })
    await this.escribiendo
  }
}

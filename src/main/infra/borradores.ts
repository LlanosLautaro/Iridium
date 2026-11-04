// Las respuestas guardadas «a medias» (W-6, D-039): `borradores.json` en la carpeta de datos del Centro, fuera del
// proyecto, para que la IA no las lea ni las procese. Si falta o está roto, se arranca vacío.
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { z } from 'zod'
import { escribirAtomico, leerDatos } from './escritura'

/** El borrador de `compartido/respuestas.ts`. */
const EsquemaBorrador = z.object({
  opcion: z.string().nullable(),
  otro: z.string(),
  nota: z.string(),
  marcas: z.array(z.boolean()),
  notas: z.array(z.string()),
})

const Guardado = z.object({
  /** La pregunta tal como estaba: si la IA la cambia, el borrador ya no es de ella. */
  pregunta: z.string(),
  borrador: EsquemaBorrador,
  /** Cuándo se guardó (milisegundos). */
  guardado: z.number(),
})
export type BorradorGuardado = z.infer<typeof Guardado>

const Archivo = z.object({
  version: z.literal(1),
  borradores: z.record(
    z.string(),
    Guardado.catch(() => null as unknown as BorradorGuardado),
  ),
})

const clave = (ruta: string, codigo: string) => `${ruta}|${codigo}`

export class ArchivoBorradores {
  private actual: Map<string, BorradorGuardado> | null = null
  private escribiendo: Promise<void> = Promise.resolve()

  constructor(private readonly archivo: string) {}

  private async todos(): Promise<Map<string, BorradorGuardado>> {
    if (this.actual) return this.actual
    this.actual = new Map()
    // Sin archivo o roto, se arranca vacío (el roto queda aparte).
    const datos = await leerDatos(this.archivo, (t) => Archivo.parse(JSON.parse(t)))
    for (const [k, b] of Object.entries(datos?.borradores ?? {})) if (b) this.actual.set(k, b)
    return this.actual
  }

  async de(ruta: string, codigo: string): Promise<BorradorGuardado | null> {
    return (await this.todos()).get(clave(ruta, codigo)) ?? null
  }

  async guardar(ruta: string, codigo: string, guardado: BorradorGuardado): Promise<void> {
    const todos = await this.todos()
    todos.set(clave(ruta, codigo), guardado)
    await this.escribir(todos)
  }

  async quitar(ruta: string, codigo: string): Promise<void> {
    const todos = await this.todos()
    if (!todos.delete(clave(ruta, codigo))) return
    await this.escribir(todos)
  }

  /** Una escritura detrás de la otra: dos guardados seguidos no se pisan. */
  private async escribir(todos: Map<string, BorradorGuardado>): Promise<void> {
    const texto = `${JSON.stringify({ version: 1, borradores: Object.fromEntries(todos) }, null, 2)}\n`
    this.escribiendo = this.escribiendo
      .catch(() => {})
      .then(async () => {
        await mkdir(dirname(this.archivo), { recursive: true })
        await escribirAtomico(this.archivo, texto)
      })
    await this.escribiendo
  }
}

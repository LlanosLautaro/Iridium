// Lo escrito en el cuadro de cada conversación y todavía no enviado (D-060): `escritos.json` en la carpeta de datos de
// Iridium, fuera de los proyectos. Así no se pierde al cambiar de proyecto ni al cerrar. Si falta o está roto, vacío.
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { z } from 'zod'
import { escribirAtomico, leerDatos } from './escritura'

const Archivo = z.object({
  version: z.literal(1),
  escritos: z.record(z.string(), z.string().catch('')),
})

export class ArchivoEscritos {
  private actual: Map<string, string> | null = null
  private escribiendo: Promise<void> = Promise.resolve()

  constructor(private readonly archivo: string) {}

  async todos(): Promise<Map<string, string>> {
    if (this.actual) return this.actual
    this.actual = new Map()
    // Sin archivo o roto, se arranca vacío (el roto queda aparte).
    const datos = await leerDatos(this.archivo, (t) => Archivo.parse(JSON.parse(t)))
    for (const [ruta, texto] of Object.entries(datos?.escritos ?? {}))
      if (texto !== '') this.actual.set(ruta, texto)
    return this.actual
  }

  /** Lo escrito en el chat de una carpeta que se mudó pasa a la ruta nueva (D-083). */
  async mudarRuta(antes: string, despues: string): Promise<void> {
    const texto = (await this.todos()).get(antes)
    if (texto === undefined) return
    await this.guardar(antes, '')
    await this.guardar(despues, texto)
  }

  /** Guarda lo escrito de esa conversación; vacío (o solo espacios), lo borra. */
  async guardar(ruta: string, texto: string): Promise<void> {
    const todos = await this.todos()
    if (texto.trim() === '') {
      if (!todos.delete(ruta)) return
    } else if (todos.get(ruta) === texto) return
    else todos.set(ruta, texto)
    const contenido = `${JSON.stringify({ version: 1, escritos: Object.fromEntries(todos) }, null, 2)}\n`
    // Una escritura detrás de la otra: dos guardados seguidos no se pisan.
    this.escribiendo = this.escribiendo
      .catch(() => {})
      .then(async () => {
        await mkdir(dirname(this.archivo), { recursive: true })
        await escribirAtomico(this.archivo, contenido)
      })
    await this.escribiendo
  }
}

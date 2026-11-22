// Lo escrito en el cuadro de cada conversación y todavía no enviado (D-060): `escritos.json` en la carpeta de datos de
// Iridium, fuera de los proyectos. Así no se pierde al cambiar de proyecto ni al cerrar. Si falta o está roto, vacío.
// Desde la versión 2 guarda también los adjuntos sin mandar (frente Paridad, D-169 › 8); la 1, solo texto, se lee igual.
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { z } from 'zod'
import type { AdjuntoPedido } from '../../compartido/adjuntos'
import { escribirAtomico, leerDatos } from './escritura'

/** Lo escrito de una conversación: el texto y sus adjuntos. */
export interface EscritoGuardado {
  texto: string
  adjuntos: AdjuntoPedido[]
}

const Adjunto = z.union([
  z.object({ tipo: z.enum(['foto', 'archivo']), ruta: z.string().min(1) }),
  z.object({ tipo: z.literal('pegado'), texto: z.string() }),
])

const Archivo = z.union([
  z.object({
    version: z.literal(2),
    escritos: z.record(
      z.string(),
      z
        .object({ texto: z.string().catch(''), adjuntos: z.array(Adjunto).catch([]) })
        .catch({ texto: '', adjuntos: [] }),
    ),
  }),
  z
    .object({ version: z.literal(1), escritos: z.record(z.string(), z.string().catch('')) })
    .transform((v1) => ({
      version: 2 as const,
      escritos: Object.fromEntries(
        Object.entries(v1.escritos).map(([r, texto]) => [r, { texto, adjuntos: [] }]),
      ),
    })),
])

const vacio = (e: EscritoGuardado) => e.texto.trim() === '' && e.adjuntos.length === 0

export class ArchivoEscritos {
  private actual: Map<string, EscritoGuardado> | null = null
  private escribiendo: Promise<void> = Promise.resolve()

  constructor(private readonly archivo: string) {}

  async todos(): Promise<Map<string, EscritoGuardado>> {
    if (this.actual) return this.actual
    this.actual = new Map()
    // Sin archivo o roto, se arranca vacío (el roto queda aparte).
    const datos = await leerDatos(this.archivo, (t) => Archivo.parse(JSON.parse(t)))
    for (const [ruta, escrito] of Object.entries(datos?.escritos ?? {}))
      if (!vacio(escrito)) this.actual.set(ruta, escrito)
    return this.actual
  }

  /** Las rutas de todos los adjuntos sin mandar (para no borrar una foto pegada que sigue en un cuadro). */
  async rutasAdjuntas(): Promise<Set<string>> {
    const rutas = new Set<string>()
    for (const e of (await this.todos()).values())
      for (const a of e.adjuntos) if (a.tipo !== 'pegado') rutas.add(a.ruta)
    return rutas
  }

  /** Lo escrito en el chat de una carpeta que se mudó pasa a la ruta nueva (D-083). */
  async mudarRuta(antes: string, despues: string): Promise<void> {
    const escrito = (await this.todos()).get(antes)
    if (escrito === undefined) return
    await this.guardar(antes, { texto: '', adjuntos: [] })
    await this.guardar(despues, escrito)
  }

  /** Guarda lo escrito de esa conversación; sin texto (o solo espacios) ni adjuntos, lo borra. */
  async guardar(ruta: string, escrito: EscritoGuardado): Promise<void> {
    const todos = await this.todos()
    if (vacio(escrito)) {
      if (!todos.delete(ruta)) return
    } else if (JSON.stringify(todos.get(ruta)) === JSON.stringify(escrito)) return
    else todos.set(ruta, escrito)
    const contenido = `${JSON.stringify({ version: 2, escritos: Object.fromEntries(todos) }, null, 2)}\n`
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

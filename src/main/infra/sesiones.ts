// El resumen de cada conversación que usó el Centro: `sesiones.json` en su carpeta de datos
// (05-arquitectura.md › Modelo de datos). No depende del historial interno de Claude Code (D-007).
// Se puede rehacer: si falta o está roto, se arranca vacío.
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { z } from 'zod'
import { escribirAtomico, leerDatos } from './escritura'

/** El contexto que informó la sesión al terminar su último turno, con el desglose (R-89). */
const Contexto = z.object({
  porcentaje: z.number(),
  usados: z.number(),
  maximo: z.number(),
  categorias: z
    .array(
      z.object({
        id: z.string(),
        nombre: z.string(),
        tokens: z.number(),
        clase: z.enum(['usado', 'libre', 'reserva']),
      }),
    )
    .nullable(),
  cacheMs: z.number().nullable(),
  ultimoPedido: z.number().nullable(),
})

const Resumen = z.object({
  /** La carpeta del proyecto. */
  ruta: z.string(),
  /** Si la empezó el Centro o ya existía (VS Code). */
  empezadaEn: z.enum(['iridium', 'afuera']),
  /** Última vez que el Centro terminó un turno en ella (milisegundos). */
  ultimoUso: z.number().nullable(),
  /** El último turno lo cortó el usuario con Detener: el próximo mensaje se lo avisa a la IA. */
  detenida: z.boolean(),
  ultimoEstado: z.enum(['terminada', 'detenida', 'error']).nullable(),
  /** Las preguntas que dejó en su último turno. */
  preguntas: z.array(z.string()),
  /**
   * El contexto al terminar el último turno en el Centro: el desglose solo lo da una sesión abierta, y así sigue
   * ahí al volver a abrir la app (R-89). Falta en las conversaciones de antes.
   */
  contexto: Contexto.nullable().optional().catch(undefined),
  /** La empezó Iridium para abrir el período (frente Arranque, D-149 › 7): cuándo. Falta en las demás. */
  arranque: z.number().nullable().optional().catch(undefined),
})
export type ResumenSesion = z.infer<typeof Resumen>

const Archivo = z.object({
  version: z.literal(1),
  conversaciones: z.record(
    z.string(),
    Resumen.catch(() => null as unknown as ResumenSesion),
  ),
})

export class ArchivoSesiones {
  private actual: Map<string, ResumenSesion> | null = null
  private escribiendo: Promise<void> = Promise.resolve()

  constructor(private readonly archivo: string) {}

  private async todas(): Promise<Map<string, ResumenSesion>> {
    if (this.actual) return this.actual
    this.actual = new Map()
    // Sin archivo o roto, se arranca vacío (el roto queda aparte).
    const datos = await leerDatos(this.archivo, (t) => Archivo.parse(JSON.parse(t)))
    for (const [id, r] of Object.entries(datos?.conversaciones ?? {})) if (r) this.actual.set(id, r)
    return this.actual
  }

  async de(id: string): Promise<ResumenSesion | null> {
    return (await this.todas()).get(id) ?? null
  }

  /** Las conversaciones de una carpeta que se mudó pasan a la ruta nueva (D-083). */
  async mudarRuta(antes: string, despues: string): Promise<void> {
    const todas = await this.todas()
    const ids = [...todas].filter(([, r]) => r.ruta === antes).map(([id]) => id)
    if (ids.length === 0) return
    const [primera, ...resto] = ids
    for (const id of resto) todas.set(id, { ...(todas.get(id) as ResumenSesion), ruta: despues })
    if (primera) await this.guardar(primera, todas.get(primera) as ResumenSesion, { ruta: despues })
  }

  /** Guarda el resumen de una conversación; si no existía, `inicial` dice cómo empieza. */
  async guardar(
    id: string,
    inicial: ResumenSesion,
    cambio: Partial<ResumenSesion> = {},
  ): Promise<ResumenSesion> {
    const todas = await this.todas()
    const nuevo = { ...(todas.get(id) ?? inicial), ...cambio }
    todas.set(id, nuevo)
    const texto = `${JSON.stringify({ version: 1, conversaciones: Object.fromEntries(todas) }, null, 2)}\n`
    // Una escritura detrás de la otra: dos sesiones que terminan juntas no se pisan.
    this.escribiendo = this.escribiendo
      .catch(() => {})
      .then(async () => {
        await mkdir(dirname(this.archivo), { recursive: true })
        await escribirAtomico(this.archivo, texto)
      })
    await this.escribiendo
    return nuevo
  }
}

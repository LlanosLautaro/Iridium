// Lo que pasó en cada momento del arranque (frente Arranque, D-149 › 6): `arranques.json` en la carpeta de datos.
// Se puede rehacer: si falta o está roto, se arranca vacío. Guarda solo los últimos 7 días.
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { z } from 'zod'
import { DIAS_GUARDADOS } from '../core/arranque'
import { escribirAtomico, leerDatos } from './escritura'

const DIA = 24 * 3_600_000

const Renglon = z.object({
  cuando: z.number(),
  momento: z.enum(['hora', 'vencimiento']),
  resultado: z.enum(['arranco', 'periodo-abierto', 'nada-listo', 'semana', 'sin-uso', 'sin-sesion']),
  /** El proyecto que arrancó: su conversación se encuentra por la marca `arranque` de `sesiones.json` (= `cuando`). */
  proyecto: z.object({ ruta: z.string(), nombre: z.string(), preguntas: z.array(z.string()) }).optional(),
  /** Cuánto llevaba Iridium sin usarse: el aviso al volver muestra solo los de 5 minutos o más (D-149 › 8). */
  sinUsarIridium: z.number(),
})
export type RenglonArranque = z.infer<typeof Renglon>

const Archivo = z.object({
  version: z.literal(1),
  /** Hasta cuándo ya se mostró en el aviso al volver (Listo). */
  vistoHasta: z.number().nullable().catch(null),
  /** El momento que estaba programado: si al abrir pasó hace poco (el reinicio de Actualizar solo), se hace. */
  programado: z.number().nullable().catch(null),
  momentos: z.array(Renglon.catch(() => null as unknown as RenglonArranque)).catch([]),
})
export type DatosArranques = z.infer<typeof Archivo>

const VACIO: DatosArranques = { version: 1, vistoHasta: null, programado: null, momentos: [] }

export class ArchivoArranques {
  private actual: DatosArranques | null = null
  private escribiendo: Promise<void> = Promise.resolve()

  constructor(private readonly archivo: string) {}

  async leer(): Promise<DatosArranques> {
    if (this.actual) return this.actual
    const leido = await leerDatos(this.archivo, (t) => Archivo.parse(JSON.parse(t)))
    this.actual = leido ? { ...leido, momentos: leido.momentos.filter(Boolean) } : { ...VACIO }
    return this.actual
  }

  /** Suma un renglón y deja solo los de los últimos 7 días. */
  async anotar(r: RenglonArranque): Promise<void> {
    const d = await this.leer()
    const desde = r.cuando - DIAS_GUARDADOS * DIA
    await this.guardar({ momentos: [...d.momentos.filter((m) => m.cuando >= desde), r] })
  }

  async guardar(cambio: Partial<Omit<DatosArranques, 'version'>>): Promise<void> {
    const nuevo = { ...(await this.leer()), ...cambio }
    this.actual = nuevo
    const texto = `${JSON.stringify(nuevo, null, 2)}\n`
    // Una escritura detrás de la otra, como `sesiones.json`.
    this.escribiendo = this.escribiendo
      .catch(() => {})
      .then(async () => {
        await mkdir(dirname(this.archivo), { recursive: true })
        await escribirAtomico(this.archivo, texto)
      })
    await this.escribiendo
  }
}

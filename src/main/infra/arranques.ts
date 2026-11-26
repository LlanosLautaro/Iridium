// Lo que pasó en cada momento del arranque (frente Arranque, D-149 › 6): `arranques.json` en la carpeta de datos.
// Se puede rehacer: si falta o está roto, se arranca vacío. Guarda solo los últimos 7 días.
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { z } from 'zod'
import { DIAS_GUARDADOS } from '../core/arranque'
import { escribirAtomico, leerDatos } from './escritura'

const DIA = 24 * 3_600_000

const UsoAnotado = z.object({ periodo: z.number(), semana: z.number() })

const Renglon = z.object({
  cuando: z.number(),
  /** `avance`: lo tomó el avance solo (frente Frentes, D-178 › 6). */
  momento: z.enum(['hora', 'vencimiento', 'avance']),
  resultado: z.enum(['arranco', 'periodo-abierto', 'nada-listo', 'semana', 'sin-uso', 'sin-sesion']),
  /** El proyecto que arrancó: su conversación se encuentra por la marca `arranque` de `sesiones.json` (= `cuando`). */
  proyecto: z.object({ ruta: z.string(), nombre: z.string(), preguntas: z.array(z.string()) }).optional(),
  /** Cuánto llevaba Iridium sin usarse: el aviso al volver muestra solo los de 5 minutos o más (D-149 › 8). */
  sinUsarIridium: z.number(),
  /** El paso que tomó el avance solo; falta en los de la Bandeja y en los del Arranque. */
  paso: z
    .object({
      frente: z.string(),
      carpeta: z.string(),
      texto: z.string(),
      tamano: z.enum(['chico', 'mediano', 'grande']),
      linea: z.number(),
    })
    .optional()
    .catch(undefined),
  /** El uso al empezar y al terminar (% del período y de la semana): lo gastado, para compararlo con el tamaño. */
  uso: z.object({ antes: UsoAnotado, despues: UsoAnotado.nullable() }).optional().catch(undefined),
  /** La sesión del avance solo se quedó sin uso (D-194): no cuenta como tomado y el aviso no la da por fallada. */
  agotado: z.boolean().optional().catch(undefined),
})
export type RenglonArranque = z.infer<typeof Renglon>

/** Una app que se armó sola con Iridium sin usar (frente Abrir, T-86): el aviso al volver la cuenta. */
const Armado = z.object({
  cuando: z.number(),
  ruta: z.string(),
  nombre: z.string(),
  resultado: z.enum(['ok', 'falla']),
  motivo: z.string().optional().catch(undefined),
})
export type ArmadoSinUsar = z.infer<typeof Armado>

const Archivo = z.object({
  version: z.literal(1),
  /** Hasta cuándo ya se mostró en el aviso al volver (Listo). */
  vistoHasta: z.number().nullable().catch(null),
  /** El momento que estaba programado: si al abrir pasó hace poco (el reinicio de Actualizar solo), se hace. */
  programado: z.number().nullable().catch(null),
  momentos: z.array(Renglon.catch(() => null as unknown as RenglonArranque)).catch([]),
  /** Lo que se armó solo mientras no estaba el usuario; falta en los archivos de antes. */
  armados: z.array(Armado.catch(() => null as unknown as ArmadoSinUsar)).catch([]),
})
export type DatosArranques = z.infer<typeof Archivo>

const VACIO: DatosArranques = { version: 1, vistoHasta: null, programado: null, momentos: [], armados: [] }

export class ArchivoArranques {
  private actual: DatosArranques | null = null
  private escribiendo: Promise<void> = Promise.resolve()

  constructor(private readonly archivo: string) {}

  async leer(): Promise<DatosArranques> {
    if (this.actual) return this.actual
    const leido = await leerDatos(this.archivo, (t) => Archivo.parse(JSON.parse(t)))
    this.actual = leido
      ? { ...leido, momentos: leido.momentos.filter(Boolean), armados: leido.armados.filter(Boolean) }
      : { ...VACIO }
    return this.actual
  }

  /** Suma un renglón y deja solo los de los últimos 7 días. */
  async anotar(r: RenglonArranque): Promise<void> {
    const d = await this.leer()
    const desde = r.cuando - DIAS_GUARDADOS * DIA
    await this.guardar({ momentos: [...d.momentos.filter((m) => m.cuando >= desde), r] })
  }

  /** Suma un armado hecho sin el usuario y deja solo los de los últimos 7 días. */
  async anotarArmado(a: ArmadoSinUsar): Promise<void> {
    const d = await this.leer()
    const desde = a.cuando - DIAS_GUARDADOS * DIA
    await this.guardar({ armados: [...d.armados.filter((m) => m.cuando >= desde), a] })
  }

  /** Cambia el renglón de `cuando` (lo gastado, al terminar la sesión del avance solo). */
  async cambiar(cuando: number, cambio: Partial<RenglonArranque>): Promise<void> {
    const d = await this.leer()
    if (!d.momentos.some((m) => m.cuando === cuando)) return
    await this.guardar({ momentos: d.momentos.map((m) => (m.cuando === cuando ? { ...m, ...cambio } : m)) })
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

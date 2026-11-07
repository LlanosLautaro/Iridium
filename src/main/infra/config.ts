// Datos propios del Centro: `config.json` en su carpeta de datos (05-arquitectura.md › Modelo de datos).
// Se pueden rehacer: si el archivo falta o está roto, se arranca con los valores de siempre.
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { z } from 'zod'
import { ANCHO_CONVERSACION, migrarAnchos, PROYECTOS_CON_ANCHO } from '../../compartido/ancho-conversacion'
import {
  ANCHO_LISTA_IDEAS,
  ANCHO_LISTA_SKILLS,
  ESFUERZOS,
  LARGO_AJUSTES,
  type Preferencias,
  TEMAS,
} from '../../compartido/puente'
import { escribirAtomico, leerDatos } from './escritura'

/** El modelo y el esfuerzo de un proyecto; null = el de Claude Code. */
export const AjusteIa = z.object({
  modelo: z.string().min(1).max(200).nullable(),
  esfuerzo: z.enum(ESFUERZOS).nullable(),
})

const Ancho = z.number().int().min(ANCHO_CONVERSACION.minimo).max(ANCHO_CONVERSACION.maximo)

/** El ancho de la conversación de cada vista (D-098); uno roto se descarta solo. */
export const AnchosConversacion = z.object({
  general: Ancho.optional(),
  skills: Ancho.optional(),
  proyectos: z
    .record(z.string().min(1).max(1024), Ancho)
    .refine((p) => Object.keys(p).length <= PROYECTOS_CON_ANCHO),
  otras: Ancho.optional(),
})

const Config = z.object({
  version: z.literal(1).catch(1),
  /** Carpeta de proyectos; si falta, `Documentos\Proyectos` (D-083). */
  raiz: z.string().min(1).optional().catch(undefined),
  /**
   * Una carpeta de Iridium de antes, con Ideas y Skills por mudar a `.iridium` (D-083 la tenía aparte; D-087 la deja al
   * cambiar de carpeta de proyectos).
   */
  carpetaIridium: z.string().min(1).optional().catch(undefined),
  verArchivados: z.boolean().catch(false),
  /** Hasta OR-I2 era un número, el mismo en todas las vistas. */
  anchoConversacion: z.preprocess(
    migrarAnchos,
    z
      .object({
        general: Ancho.optional().catch(undefined),
        skills: Ancho.optional().catch(undefined),
        proyectos: z
          .record(z.string(), Ancho.optional().catch(undefined))
          .catch({})
          .transform((p) =>
            Object.fromEntries(
              Object.entries(p)
                .filter((e): e is [string, number] => e[1] !== undefined)
                .slice(-PROYECTOS_CON_ANCHO),
            ),
          ),
        otras: Ancho.optional().catch(undefined),
      })
      .catch({ proyectos: {} }),
  ),
  anchoListaSkills: z
    .number()
    .int()
    .min(ANCHO_LISTA_SKILLS.minimo)
    .max(ANCHO_LISTA_SKILLS.maximo)
    .catch(ANCHO_LISTA_SKILLS.inicial),
  anchoListaIdeas: z
    .number()
    .int()
    .min(ANCHO_LISTA_IDEAS.minimo)
    .max(ANCHO_LISTA_IDEAS.maximo)
    .catch(ANCHO_LISTA_IDEAS.inicial),
  anchoHoja: z.enum(['angosto', 'normal', 'ancho']).catch('normal'),
  pestanas: z.array(z.string()).max(50).catch([]),
  /** El modelo y el esfuerzo de cada proyecto (C-58), por ruta; uno roto se descarta solo. */
  ajustesIa: z.record(z.string(), AjusteIa.optional().catch(undefined)).catch({}),
  /** El proyecto abierto al cerrar (D-060): al abrir se vuelve a él. */
  abierto: z.string().min(1).max(1024).nullable().catch(null),
  // Ajustes (D-065): el tema, los nombres de la conversación y el tono de la IA.
  tema: z.enum(TEMAS).catch('iridium'),
  nombreUsuario: z.string().max(LARGO_AJUSTES.nombreUsuario).catch(''),
  nombreIa: z.string().max(LARGO_AJUSTES.nombreIa).catch(''),
  tono: z.string().max(LARGO_AJUSTES.tono).catch(''),
  /** El tamaño de todo, con Ctrl+= y Ctrl+- (Defecto 17): 1 = normal. */
  zoom: z.number().min(0.5).max(3).catch(1),
})
export type Config = z.infer<typeof Config>

const PREDETERMINADA: Config = {
  version: 1,
  verArchivados: false,
  anchoConversacion: { proyectos: {} },
  anchoListaSkills: ANCHO_LISTA_SKILLS.inicial,
  anchoListaIdeas: ANCHO_LISTA_IDEAS.inicial,
  anchoHoja: 'normal',
  pestanas: [],
  ajustesIa: {},
  abierto: null,
  tema: 'iridium',
  nombreUsuario: '',
  nombreIa: '',
  tono: '',
  zoom: 1,
}

export function preferenciasDe(c: Config): Preferencias {
  return {
    verArchivados: c.verArchivados,
    anchoConversacion: c.anchoConversacion,
    anchoListaSkills: c.anchoListaSkills,
    anchoListaIdeas: c.anchoListaIdeas,
    anchoHoja: c.anchoHoja,
    pestanas: c.pestanas,
    ajustesIa: Object.fromEntries(
      Object.entries(c.ajustesIa).filter((e): e is [string, z.infer<typeof AjusteIa>] => e[1] !== undefined),
    ),
    abierto: c.abierto,
    tema: c.tema,
    nombreUsuario: c.nombreUsuario,
    nombreIa: c.nombreIa,
    tono: c.tono,
  }
}

export class ArchivoConfig {
  private actual: Config | null = null

  constructor(private readonly archivo: string) {}

  async leer(): Promise<Config> {
    if (this.actual) return this.actual
    // Sin archivo o roto, los valores de siempre (el roto queda aparte).
    const leida = await leerDatos(this.archivo, (texto) => {
      // `conversacionALaDerecha` y `anchoPanel` eran del panel desplegable (D-031); D-041 los dejó sin uso.
      const { conversacionALaDerecha: _, anchoPanel: __, ...leido } = JSON.parse(texto)
      return Config.parse({ ...PREDETERMINADA, ...leido })
    })
    this.actual = leida ?? { ...PREDETERMINADA }
    return this.actual
  }

  async guardar(cambio: Partial<Config>): Promise<Config> {
    const anterior = await this.leer()
    const nueva = { ...anterior, ...cambio }
    this.actual = nueva
    try {
      await mkdir(dirname(this.archivo), { recursive: true })
      await escribirAtomico(this.archivo, `${JSON.stringify(nueva, null, 2)}\n`)
    } catch (e) {
      // No se pudo escribir: sigue como antes (lo que muestra la ventana también vuelve atrás).
      if (this.actual === nueva) this.actual = anterior
      throw e
    }
    return nueva
  }
}

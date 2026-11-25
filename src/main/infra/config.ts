// Datos propios del Centro: `config.json` en su carpeta de datos (05-arquitectura.md › Modelo de datos).
// Se pueden rehacer: si el archivo falta o está roto, se arranca con los valores de siempre.
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { z } from 'zod'
import { ANCHO_CONVERSACION, migrarAnchos, PROYECTOS_CON_ANCHO } from '../../compartido/ancho-conversacion'
import { RECIENTES } from '../../compartido/comandos'
import {
  ALTO_CONSOLAS,
  ANCHO_LISTA_IDEAS,
  ANCHO_LISTA_SKILLS,
  ESFUERZOS,
  LARGO_AJUSTES,
  PLEGADAS_POR_PROYECTO,
  type Preferencias,
} from '../../compartido/puente'
import { AJUSTE_INICIAL, HORA_ARRANQUE } from '../core/arranque'
import { AJUSTE_AVANCE_INICIAL, LIMITES_AVANCE, NINGUNO_APAGADO } from '../core/avance'
import { AJUSTE_SONIDO_INICIAL, SONIDOS } from '../core/sonido'
import { escribirAtomico, leerDatos } from './escritura'

/** El modelo y el esfuerzo de un proyecto; null = el de Claude Code. */
export const AjusteIa = z.object({
  modelo: z.string().min(1).max(200).nullable(),
  esfuerzo: z.enum(ESFUERZOS).nullable(),
})

const Hora = z.string().regex(HORA_ARRANQUE)
const Entre = (l: { minimo: number; maximo: number }) => z.number().int().min(l.minimo).max(l.maximo)

/** El avance solo (frente Frentes, FS-2, D-178). */
export const AjusteAvance = z.object({
  prendido: z.boolean(),
  horario: z.object({ desde: Hora, hasta: Hora }).strict().nullable(),
  minutosSinUsar: Entre(LIMITES_AVANCE.minutosSinUsar),
  libre: Entre(LIMITES_AVANCE.libre),
  semana: Entre(LIMITES_AVANCE.semana),
  tamanos: z.array(z.enum(['chico', 'mediano', 'grande'])).max(3),
})

/** El sonido al terminar (T-52, D-183). */
export const AjusteSonido = z.object({
  prendido: z.boolean(),
  cual: z.enum(SONIDOS as [string, ...string[]]),
  conAvance: z.boolean(),
})

/** Capacidades (T-28, D-189): el navegador, la PC y los conectores apagados en Iridium. */
export const AjusteCapacidades = z.object({
  navegador: z.boolean(),
  pc: z.boolean(),
  conectoresApagados: z.array(z.string().min(1).max(200)).max(200),
})

/** De entrada, todo apagado y ningún conector apagado (P2). */
export const CAPACIDADES_INICIALES = { navegador: false, pc: false, conectoresApagados: [] as string[] }

/** Lo apagado del avance solo (FS-3). */
export const AvanceApagado = z.object({
  proyectos: z.array(z.string().min(1).max(1024)).max(500),
  frentes: z
    .array(z.object({ ruta: z.string().min(1).max(1024), carpeta: z.string().min(1).max(200) }).strict())
    .max(1000),
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
  altoConsolas: z
    .number()
    .int()
    .min(ALTO_CONSOLAS.minimo)
    .max(ALTO_CONSOLAS.maximo)
    .catch(ALTO_CONSOLAS.inicial),
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
  /** El frente elegido en la Bandeja de cada proyecto (R-55), por ruta (`''`, el núcleo); uno roto se descarta solo. */
  filtrosBandeja: z.record(z.string(), z.string().max(200).optional().catch(undefined)).catch({}),
  /** Las preguntas plegadas en la Bandeja de cada proyecto (R-104), por ruta; una lista rota se descarta sola. */
  qPlegadas: z
    .record(z.string(), z.array(z.string().max(20)).max(PLEGADAS_POR_PROYECTO).optional().catch(undefined))
    .catch({}),
  /** El proyecto abierto al cerrar (D-060): al abrir se vuelve a él. */
  abierto: z.string().min(1).max(1024).nullable().catch(null),
  // Ajustes (D-065): los nombres de la conversación y el tono de la IA. El tema ya no se guarda: hay uno solo (D-104).
  nombreUsuario: z.string().max(LARGO_AJUSTES.nombreUsuario).catch(''),
  nombreIa: z.string().max(LARGO_AJUSTES.nombreIa).catch(''),
  tono: z.string().max(LARGO_AJUSTES.tono).catch(''),
  /** Abrir el período de Claude (frente Arranque, AR-1): apagado si falta o está roto. */
  arranque: z
    .object({ prendido: z.boolean(), hora: z.string().regex(HORA_ARRANQUE) })
    .catch({ ...AJUSTE_INICIAL }),
  /** El avance solo (frente Frentes, FS-2): apagado si falta o está roto. */
  avanceSolo: AjusteAvance.catch({ ...AJUSTE_AVANCE_INICIAL }),
  avanceApagado: AvanceApagado.catch({ ...NINGUNO_APAGADO }),
  /** El sonido al terminar (T-52): prendido con la campana si falta o está roto. */
  sonido: AjusteSonido.catch({ ...AJUSTE_SONIDO_INICIAL }),
  /** El botón «Apagar al terminar» (T-134): escondido si falta o está roto. */
  botonApagar: z.boolean().catch(false),
  /** Capacidades (T-28): si falta o está roto, todo apagado. */
  capacidades: AjusteCapacidades.catch({ ...CAPACIDADES_INICIALES, conectoresApagados: [] }),
  /** El tamaño de todo, con Ctrl+= y Ctrl+- (Defecto 17): 1 = normal. */
  zoom: z.number().min(0.5).max(3).catch(1),
  /** La ventana como quedó al cerrar (T-66): su lugar y tamaño sin maximizar, y si estaba maximizada. */
  ventana: z
    .object({
      x: z.number().int(),
      y: z.number().int(),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      maximizada: z.boolean(),
    })
    .nullable()
    .catch(null),
  /**
   * Actualizar solo reinició sin Iridium al frente (T-67): cuándo. Al volver abre minimizada, sin tapar lo que se
   * esté usando; se borra al abrir.
   */
  abrirDeFondo: z.number().nullable().catch(null),
  /** Los proyectos con la actualización automática apagada (frente Abrir, D-154); si falta o está roto, ninguno. */
  actualizacionApagada: z.array(z.string().min(1).max(1024)).max(500).catch([]),
  /** Los comandos con «/» usados hace poco, de todas las conversaciones (frente Paridad, PA-1); el más nuevo primero. */
  comandosRecientes: z.array(z.string().min(1).max(200)).max(RECIENTES).catch([]),
})
export type Config = z.infer<typeof Config>

const PREDETERMINADA: Config = {
  version: 1,
  verArchivados: false,
  anchoConversacion: { proyectos: {} },
  anchoListaSkills: ANCHO_LISTA_SKILLS.inicial,
  anchoListaIdeas: ANCHO_LISTA_IDEAS.inicial,
  altoConsolas: ALTO_CONSOLAS.inicial,
  anchoHoja: 'normal',
  pestanas: [],
  ajustesIa: {},
  filtrosBandeja: {},
  qPlegadas: {},
  abierto: null,
  nombreUsuario: '',
  nombreIa: '',
  tono: '',
  arranque: { ...AJUSTE_INICIAL },
  avanceSolo: { ...AJUSTE_AVANCE_INICIAL },
  avanceApagado: { ...NINGUNO_APAGADO },
  sonido: { ...AJUSTE_SONIDO_INICIAL },
  botonApagar: false,
  capacidades: { ...CAPACIDADES_INICIALES, conectoresApagados: [] },
  zoom: 1,
  ventana: null,
  abrirDeFondo: null,
  actualizacionApagada: [],
  comandosRecientes: [],
}

export function preferenciasDe(c: Config): Preferencias {
  return {
    verArchivados: c.verArchivados,
    anchoConversacion: c.anchoConversacion,
    anchoListaSkills: c.anchoListaSkills,
    anchoListaIdeas: c.anchoListaIdeas,
    altoConsolas: c.altoConsolas,
    anchoHoja: c.anchoHoja,
    pestanas: c.pestanas,
    ajustesIa: Object.fromEntries(
      Object.entries(c.ajustesIa).filter((e): e is [string, z.infer<typeof AjusteIa>] => e[1] !== undefined),
    ),
    filtrosBandeja: Object.fromEntries(
      Object.entries(c.filtrosBandeja).filter((e): e is [string, string] => e[1] !== undefined),
    ),
    qPlegadas: Object.fromEntries(
      Object.entries(c.qPlegadas).filter((e): e is [string, string[]] => e[1] !== undefined),
    ),
    abierto: c.abierto,
    nombreUsuario: c.nombreUsuario,
    nombreIa: c.nombreIa,
    tono: c.tono,
    arranque: c.arranque,
    actualizacionApagada: c.actualizacionApagada,
    avanceSolo: c.avanceSolo as Preferencias['avanceSolo'],
    avanceApagado: c.avanceApagado,
    sonido: c.sonido as Preferencias['sonido'],
    botonApagar: c.botonApagar,
    capacidades: c.capacidades,
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

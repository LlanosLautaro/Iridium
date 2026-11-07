// El ancho de la conversación (04-ux.md › W-12, D-098): 360 px (300 en una ventana de menos de 1100), se arrastra entre
// 300 px y la mitad de la ventana y cada vista recuerda el suyo: la general (Proyectos e Ideas), Skills y cada proyecto.

/** Los anchos guardados; una vista sin el suyo usa `otras` (el ancho de antes, D-098) o el de entrada. */
export interface AnchosConversacion {
  general?: number | undefined
  skills?: number | undefined
  proyectos: Record<string, number>
  /** El ancho único de antes de D-098, si el usuario lo había cambiado: la primera vez vale para todas las vistas. */
  otras?: number | undefined
}

/** Dónde está la conversación: la vista general, Skills o un proyecto (su ruta). */
export type VistaConversacion = 'general' | 'skills' | { proyecto: string }

export const ANCHO_CONVERSACION = {
  minimo: 300,
  inicial: 360,
  /** El de entrada en una ventana chica. */
  chico: 300,
  /** Menos que esto es una ventana chica. */
  ventanaChica: 1100,
  /** Lo más que se guarda; en la pantalla, además, no pasa de la mitad. */
  maximo: 1400,
} as const

/** El ancho único de antes (`config.json` hasta OR-I2): si era el de entrada de entonces, no se arrastra a las vistas. */
const INICIAL_DE_ANTES = 440

/** Cuántos proyectos recuerdan su ancho (los últimos que se cambiaron). */
export const PROYECTOS_CON_ANCHO = 200

export const SIN_ANCHOS: AnchosConversacion = { proyectos: {} }

/** El ancho de entrada según la ventana. */
export function anchoInicial(ventana: number): number {
  return ventana < ANCHO_CONVERSACION.ventanaChica ? ANCHO_CONVERSACION.chico : ANCHO_CONVERSACION.inicial
}

/** El ancho de una vista: el suyo, el de antes o el de entrada. */
export function anchoDe(anchos: AnchosConversacion, vista: VistaConversacion, ventana: number): number {
  const propio =
    vista === 'general'
      ? anchos.general
      : vista === 'skills'
        ? anchos.skills
        : anchos.proyectos[vista.proyecto]
  return propio ?? anchos.otras ?? anchoInicial(ventana)
}

/** Los anchos con el de una vista cambiado; el proyecto cambiado pasa al final y se olvidan los más viejos. */
export function conAncho(
  anchos: AnchosConversacion,
  vista: VistaConversacion,
  px: number,
): AnchosConversacion {
  if (vista === 'general') return { ...anchos, general: px }
  if (vista === 'skills') return { ...anchos, skills: px }
  const { [vista.proyecto]: _, ...resto } = anchos.proyectos
  const proyectos = Object.entries({ ...resto, [vista.proyecto]: px }).slice(-PROYECTOS_CON_ANCHO)
  return { ...anchos, proyectos: Object.fromEntries(proyectos) }
}

/** Lo que había en `config.json`: el número de antes pasa a `otras` (salvo el de entrada de entonces). */
export function migrarAnchos(valor: unknown): unknown {
  if (typeof valor !== 'number') return valor
  return valor === INICIAL_DE_ANTES ? { proyectos: {} } : { proyectos: {}, otras: valor }
}

// El borrador de una respuesta desde Pendientes (H-10, H-11) y las reglas que la ventana necesita mientras se
// escribe: si ya se puede enviar y si hay algo para guardar a medias. Las usan los dos lados del puente.

/** «Otro»: la respuesta con palabras propias en una pregunta con opciones. */
export const OTRO = 'Otro'

/** Una prueba postergada con el botón de Pendientes (D-063): aprobada provisional, con lo que dice. */
export const POSTERGADA = 'Postergada'

/**
 * La línea de la opción de una prueba postergada. Le dice a la IA qué hacer con ella, así no depende de la guía ni de
 * la instrucción de Iridium (también se lee desde VS Code).
 */
export const LINEA_POSTERGADA =
  '**Opción:** Postergada: tomala como aprobada provisional; anotala con sus puntos en las pruebas manuales ' +
  'pendientes del documento de construcción y sumale dónde mirar si falla (archivo, decisión, prueba automática ' +
  'que lo cubre).'

/** Lo que el usuario lleva escrito en un pendiente. */
export interface Borrador {
  /** Letra de la opción, `Otro` o null. */
  opcion: string | null
  /** Lo que escribió en «Otro». */
  otro: string
  /** La nota (o la respuesta entera, si la pregunta no tiene opciones ni puntos). */
  nota: string
  /** Un valor por punto de la prueba: marcado o no. */
  marcas: boolean[]
  /** La nota de cada punto. */
  notas: string[]
}

export function borradorVacio(puntos: number): Borrador {
  return {
    opcion: null,
    otro: '',
    nota: '',
    marcas: Array.from({ length: puntos }, () => false),
    notas: Array.from({ length: puntos }, () => ''),
  }
}

/** ¿Se puede enviar? Con opciones, hay que elegir una (Otro, con algo escrito); con puntos, marcar o anotar algo. */
export function puedeEnviar(
  b: Borrador,
  q: { opciones: readonly unknown[]; puntos: readonly string[] },
): boolean {
  const elegida = b.opcion !== null && (b.opcion !== OTRO || b.otro.trim() !== '' || b.nota.trim() !== '')
  if (q.puntos.length > 0) return elegida || tieneAlgo(b)
  if (q.opciones.length > 0) return elegida
  return b.nota.trim() !== ''
}

/** ¿El borrador dice algo? (para guardarlo a medias) */
export function tieneAlgo(b: Borrador): boolean {
  return (
    b.opcion !== null ||
    b.otro.trim() !== '' ||
    b.nota.trim() !== '' ||
    b.marcas.some(Boolean) ||
    b.notas.some((n) => n.trim() !== '')
  )
}

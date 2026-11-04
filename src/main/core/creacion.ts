// Copiado de la app anterior de proyectos (D-026).
// Reglas del nombre de un proyecto nuevo (D-020): sin disco ni VS Code.

/** Largo máximo del nombre: deja margen al límite de rutas de Windows dentro del proyecto. */
export const LIMITE_NOMBRE_PROYECTO = 80

const CARACTERES_PROHIBIDOS = /[<>:"/\\|?*\p{Cc}]/u
/** Nombres que Windows reserva, con o sin extensión (CON, CON.txt…). */
const RESERVADOS = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i

/**
 * Por qué el nombre no sirve para la carpeta de un proyecto nuevo; null si sirve.
 * `existentes`: nombres de lo que ya hay en la raíz (carpetas y archivos). Se compara sin mayúsculas, como Windows.
 */
export function problemaNombreProyecto(nombre: string, existentes: readonly string[]): string | null {
  const n = nombre.trim()
  if (n.length === 0) return 'Escribí un nombre.'
  if (n.length > LIMITE_NOMBRE_PROYECTO) return `Hasta ${LIMITE_NOMBRE_PROYECTO} caracteres.`
  if (CARACTERES_PROHIBIDOS.test(n)) return 'No puede tener ninguno de estos caracteres: < > : " / \\ | ? *'
  if (n.startsWith('.')) return 'No puede empezar con punto: el gestor ignora esas carpetas.'
  if (n.endsWith('.')) return 'No puede terminar en punto.'
  if (RESERVADOS.test(n)) return 'Windows reserva ese nombre.'
  const comparable = n.toLocaleLowerCase('es')
  if (existentes.some((e) => e.toLocaleLowerCase('es') === comparable))
    return 'Ya hay una carpeta con ese nombre.'
  return null
}

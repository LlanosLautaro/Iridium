// Crear el repositorio y publicarlo en GitHub desde la sección Git (D-081): las reglas que usan la ventana y el
// proceso principal. El nombre lo propone Iridium a partir de la carpeta y GitHub solo acepta algunos caracteres.

/** Lo más largo que GitHub acepta como nombre de repositorio. */
export const LARGO_NOMBRE_REPO = 100

/** ¿GitHub lo acepta como nombre? Letras sin acento, números, `.`, `-` y `_`; ni `.` ni `..` solos. */
export function esNombreRepo(nombre: string): boolean {
  return (
    nombre.length > 0 &&
    nombre.length <= LARGO_NOMBRE_REPO &&
    /^[A-Za-z0-9._-]+$/.test(nombre) &&
    nombre !== '.' &&
    nombre !== '..'
  )
}

/** El nombre que se propone para una carpeta: «Centro de Desarrollo» → «Centro-de-Desarrollo», sin acentos. */
export function nombreRepoDe(carpeta: string): string {
  const n = carpeta
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+|-+$/g, '')
    .slice(0, LARGO_NOMBRE_REPO)
  return esNombreRepo(n) ? n : 'proyecto'
}

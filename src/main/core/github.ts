// Crear el repositorio de un proyecto (D-081): qué queda afuera del primer commit. Las dependencias (`node_modules`)
// y los archivos que suelen tener claves no se guardan nunca: se agregan al `.gitignore` antes del commit, así
// tampoco suben a GitHub al publicar.

/** Los archivos con claves: `.env` (menos los de ejemplo), certificados y llaves privadas. */
export function tieneClaves(ruta: string): boolean {
  const nombre = (ruta.split('/').at(-1) ?? ruta).toLowerCase()
  if (nombre === '.env' || nombre.startsWith('.env.'))
    return !/\.(example|sample|template|ejemplo)$/.test(nombre)
  if (/\.(pem|key|pfx|p12)$/.test(nombre)) return true
  return /^id_(rsa|dsa|ecdsa|ed25519)$/.test(nombre)
}

/** El bloque que se agrega al `.gitignore`; null si no hace falta nada. */
export function bloqueGitignore(conDependencias: boolean, claves: string[]): string | null {
  const lineas = [...(conDependencias ? ['node_modules/'] : []), ...claves.map((r) => `/${r}`)]
  if (lineas.length === 0) return null
  return `# Lo agregó Iridium al crear el repositorio: dependencias y archivos con claves\n${lineas.join('\n')}\n`
}

/** El `.gitignore` con el bloque al final (con un salto antes si el archivo no termina en uno). */
export function agregarAGitignore(actual: string, bloque: string): string {
  if (!actual) return bloque
  return `${actual}${actual.endsWith('\n') ? '' : '\n'}\n${bloque}`
}

/** Lo que se le dice al usuario de lo que quedó afuera. */
export function avisoDeAfuera(claves: string[]): string | null {
  if (claves.length === 0) return null
  const lista =
    claves.length > 3 ? `${claves.slice(0, 3).join(', ')} y ${claves.length - 3} más` : claves.join(', ')
  return `Quedaron afuera porque suelen tener claves: ${lista} (están en el .gitignore).`
}

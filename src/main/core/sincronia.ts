// Reglas de la sincronización con GitHub (D-159): qué hacer según lo que tiene cada lado y lo que git contesta, en
// palabras del usuario. Sin disco ni procesos: `infra/sincronia.ts` corre git. Lo que usa también la ventana, en
// `compartido/sincronia.ts`.
/**
 * Qué hace Iridium sola con un proyecto, según sus commits de cada lado: nada (al día), traerlos (solo hay nuevos en el
 * remoto: se pueden poner encima sin juntar nada) o avisar (los dos lados tienen commits propios: lo junta Sincronizar).
 */
export function queTraer(adelante: number, atras: number): 'al-dia' | 'traer' | 'separada' {
  if (atras === 0) return 'al-dia'
  return adelante > 0 ? 'separada' : 'traer'
}

/** `git rev-list --left-right --count HEAD...@{u}`: los commits solo de esta PC y los solo del remoto. */
export function ladosDe(salida: string): { adelante: number; atras: number } | null {
  const m = /^\s*(\d+)\s+(\d+)\s*$/.exec(salida)
  return m ? { adelante: Number(m[1]), atras: Number(m[2]) } : null
}

/** Lo que contestó git al conectarse, en palabras del usuario. */
export function motivoDeRed(error: string): { resultado: 'sin-conexion' | 'error'; motivo: string } {
  const t = error.toLowerCase()
  if (
    /could not resolve host|unable to access|timed out|connection (refused|reset)|network is unreachable/.test(
      t,
    )
  )
    return { resultado: 'sin-conexion', motivo: 'No se pudo conectar con el remoto. ¿Hay internet?' }
  if (
    /authentication failed|could not read (username|password)|terminal prompts disabled|403|permission denied/.test(
      t,
    )
  )
    return {
      resultado: 'error',
      motivo: 'No hay una sesión de GitHub con permiso para este repositorio en esta PC.',
    }
  if (/repository .* not found|not found|does not appear to be a git repository/.test(t))
    return { resultado: 'error', motivo: 'El repositorio ya no está en el remoto, o esta cuenta no lo ve.' }
  const linea =
    error
      .trim()
      .split('\n')[0]
      ?.replace(/^(fatal|error): /i, '') ?? ''
  return { resultado: 'error', motivo: linea || 'git no pudo conectarse con el remoto.' }
}

/** Lo que contestó git al juntar lo del remoto con lo de esta PC. */
export function motivoAlJuntar(error: string): string {
  if (/would be overwritten|untracked working tree files/i.test(error))
    return 'Hay cambios sin guardar en los mismos archivos que trae el remoto: haz el commit primero y vuelve a sincronizar.'
  if (/conflict/i.test(error))
    return 'Esta PC y el remoto cambiaron las mismas líneas: no se juntó nada. Pídele a la IA que los junte.'
  return (
    error
      .trim()
      .split('\n')[0]
      ?.replace(/^(fatal|error): /i, '') || 'No se pudo juntar con el remoto.'
  )
}

/** Lo que contestó git al hacer el commit. */
export function motivoAlGuardar(error: string): string {
  if (/please tell me who you are|empty ident|user\.email/i.test(error))
    return 'Git no sabe tu nombre en esta PC: pídele a la IA que lo configure (git config user.name y user.email).'
  if (/index\.lock/i.test(error))
    return 'Otro programa está usando git en este proyecto (quizás la IA): prueba de nuevo en un momento.'
  if (/nothing to commit|no changes added/i.test(error)) return 'No hay cambios para guardar.'
  return (
    error
      .trim()
      .split('\n')[0]
      ?.replace(/^(fatal|error): /i, '') || 'No se pudo hacer el commit.'
  )
}

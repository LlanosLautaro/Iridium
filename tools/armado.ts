// Con qué se armó esta versión (`__ARMADO__`, que `electron.vite.config.ts` pone en la ventana y en el proceso
// principal): cuándo, el commit, si había cambios sin commitear y los últimos commits.
import { execSync } from 'node:child_process'

/** Acerca de lo muestra (CO-I5) y publicar lo mira (D-191). Sin git, sin commit ni cambios. */
export function armado(carpeta = process.cwd()) {
  const git = (comando: string) => {
    try {
      return execSync(`git ${comando}`, {
        cwd: carpeta,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim()
    } catch {
      return ''
    }
  }
  const [commit = '', mensaje = ''] = git('log -1 --format=%h%n%s').split('\n')
  // `docs/` no va en la app: una respuesta o una idea sin commitear no cambia lo armado (y frenaba publicar, D-191).
  const sinGuardar = git('status --porcelain -- . ":(exclude)docs"') !== ''
  return { fecha: Date.now(), commit, mensaje, sinGuardar, cambios: cambiosArmados(git) }
}

/** Los últimos commits, del más nuevo al más viejo: la versión que se abre por primera vez dice qué trae (Q-290). */
function cambiosArmados(git: (comando: string) => string) {
  return git('log -40 --format=%h%x09%ct%x09%s')
    .split('\n')
    .map((l) => l.split('\t'))
    .filter((c): c is [string, string, string] => c.length === 3)
    .map(([commit, fecha, mensaje]) => ({ commit, fecha: Number(fecha) * 1000, mensaje }))
}

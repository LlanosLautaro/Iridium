// El número de cada versión armada (D-171): la fecha y la hora del armado, `AAAA.MDD.HMM`. Lo pone
// `tools/actualizar.ps1` (con la misma cuenta) y lo compara electron-updater en las copias instaladas: crece solo.

/** El número de la versión armada en esa fecha: `2026.1122.1700` (sin ceros adelante, como pide semver). */
export function numeroDeVersion(fecha: Date): string {
  return `${fecha.getFullYear()}.${(fecha.getMonth() + 1) * 100 + fecha.getDate()}.${fecha.getHours() * 100 + fecha.getMinutes()}`
}

/** La primera frase del mensaje de un commit, para mostrarla sola (T-104): hasta el primer punto seguido y, si es
 * muy larga, cortada en una palabra. El mensaje entero va al pasar el mouse. */
export function primeraFrase(mensaje: string, largo = 140): string {
  const texto = mensaje.replace(/\s+/g, ' ').trim()
  const fin = /[.!?](?=\s|$)/.exec(texto)
  const frase = fin ? texto.slice(0, fin.index + 1) : texto
  if (frase.length <= largo) return frase
  const corte = frase.lastIndexOf(' ', largo - 1)
  return `${frase.slice(0, corte > 0 ? corte : largo - 1).replace(/[,;:]$/, '')}…`
}

/**
 * `resources/app-update.yml` de una copia instalada (D-171): de dónde baja sus versiones electron-updater y en qué
 * carpeta las guarda mientras tanto (la misma donde el instalador deja su copia, `<nombre>-updater`).
 */
export function appUpdateYml(repo: string, nombre = 'iridium'): string {
  const [dueño, nombreRepo] = repo.split('/')
  return `owner: ${dueño}\nrepo: ${nombreRepo}\nprovider: github\nupdaterCacheDirName: ${nombre}-updater\n`
}

/** Le suma a `latest.yml` el commit y su primera línea, que la copia instalada muestra en el aviso de versión nueva. */
export function completarLatest(texto: string, commit: string, mensaje: string): string {
  const sin = texto.replace(/^(commit|releaseNotes):.*\n?/gm, '').replace(/\n*$/, '\n')
  return `${sin}commit: ${JSON.stringify(commit)}\nreleaseNotes: ${JSON.stringify(mensaje)}\n`
}

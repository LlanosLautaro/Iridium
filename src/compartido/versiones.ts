// El número de cada versión armada (Q-269, D-182): `1.0.x`. Los dos primeros son los del `version` del `package.json`
// (el del medio lo sube la IA al cerrar un frente; el primero, solo con el ok del usuario); el último cuenta los commits
// desde que se cambió ese número. Lo calcula `tools/version.ts` para `tools/actualizar.ps1` y lo compara
// electron-updater en las copias instaladas: crece con cada commit y vuelve a 0 cuando sube el del medio.

/** `1.0.12`: los dos primeros números de `base` (el `version` del `package.json`) y los commits desde que cambió. */
export function numeroDeVersion(base: string, cambios: number): string {
  const [mayor = '1', medio = '0'] = base.split('.')
  return `${Number(mayor)}.${Number(medio)}.${Math.max(0, Math.floor(cambios))}`
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

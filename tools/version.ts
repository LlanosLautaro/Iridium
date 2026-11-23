// El número de la versión que se arma ahora (Q-269, D-182, compartido/versiones.ts › numeroDeVersion): lo escribe en
// la salida para `tools/actualizar.ps1`. Los commits se cuentan desde el último que cambió el `version` del
// `package.json`; si ese número cambió y todavía no se commiteó, empieza en 0.
// Uso: node --experimental-strip-types tools/version.ts
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { numeroDeVersion } from '../src/compartido/versiones.ts'

const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const leer = (texto: string) => String(JSON.parse(texto).version)

const base = leer(readFileSync('package.json', 'utf8'))
let cambios = 0
if (leer(git('show', 'HEAD:package.json')) === base) {
  const desde = git('log', '-1', '--format=%H', '-G"version":', '--', 'package.json')
  cambios = Number(git('rev-list', '--count', desde ? `${desde}..HEAD` : 'HEAD'))
}
console.log(numeroDeVersion(base, cambios))

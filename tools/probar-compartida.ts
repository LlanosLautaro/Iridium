// D-085 de punta a punta, con GitHub de verdad: arma una «copia compartida» vieja (la app armada que se le pasa, con
// `actualizaciones.json` de un commit que no existe), la abre con el motor falso y espera a que baje la última versión
// publicada; saca una captura del aviso, la cierra y comprueba que el ayudante puso la versión nueva. No toca la app
// de uso diario ni los proyectos: todo pasa en una carpeta temporal.
// Uso: node --experimental-strip-types tools/probar-compartida.ts <carpeta con win-unpacked> [dueño/nombre]
// Deja la captura en tools/salida/compartida-*.png.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { _electron as electron } from '@playwright/test'

const origen = process.argv[2]
if (!origen || !existsSync(join(origen, 'win-unpacked', 'Iridium.exe')))
  throw new Error('Falta la carpeta con win-unpacked\\Iridium.exe.')
const repo =
  process.argv[3] ??
  /github\.com[/:]([\w.-]+\/[\w.-]+?)(\.git)?$/.exec(
    execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim(),
  )?.[1]
if (!repo) throw new Error('Falta el repositorio.')

const base = await mkdtemp(join(tmpdir(), 'iridium-compartida-'))
const release = join(base, 'Iridium-app')
const app = join(release, 'win-unpacked')
console.log(`1/5  Copia vieja en ${release}…`)
await cp(join(origen, 'win-unpacked'), app, { recursive: true })
await writeFile(
  join(app, 'resources', 'actualizaciones.json'),
  JSON.stringify({ repo, commit: '0000000', fecha: '2026-01-01T00:00:00Z', mensaje: 'Una versión vieja' }),
)
const datos = join(base, 'datos')
await mkdir(join(datos, 'Proyectos', 'Alfa', 'docs'), { recursive: true })
await writeFile(join(datos, 'Proyectos', 'Alfa', 'docs', 'estado.md'), '# Estado\n')
await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz: join(datos, 'Proyectos') }))
await mkdir('tools/salida', { recursive: true })

const env = {
  ...process.env,
  IRIDIUM_DATOS: datos,
  IRIDIUM_MOTOR: 'falso',
  IRIDIUM_REVISION: 'no',
  IRIDIUM_OCULTA: '1',
} as Record<string, string>
delete env.ELECTRON_RUN_AS_NODE

console.log('2/5  Abriendo la copia: a los 20 s mira GitHub y baja la versión…')
const t0 = Date.now()
const electronApp = await electron.launch({ executablePath: join(app, 'Iridium.exe'), env })
const win = await electronApp.firstWindow()
await win.setViewportSize({ width: 1440, height: 900 })
const aviso = win.getByText('Versión nueva lista · entra al cerrar')
await aviso.waitFor({ timeout: 15 * 60 * 1000 })
const lista = JSON.parse(await readFile(join(release, 'nueva', 'lista.json'), 'utf8'))
console.log(`3/5  Bajada en ${Math.round((Date.now() - t0) / 1000)} s: ${lista.commit} («${lista.mensaje}»)`)
await win.screenshot({ path: 'tools/salida/compartida-aviso.png' })
// Sin Armar: una copia compartida no tiene código.
const armar = await win.getByRole('button', { name: 'Armar' }).count()

console.log('4/5  Cerrando: el ayudante pone la versión nueva…')
await electronApp.close()
const limite = Date.now() + 90_000
let puesta: { commit?: string } = {}
while (Date.now() < limite) {
  try {
    puesta = JSON.parse(await readFile(join(app, 'resources', 'actualizaciones.json'), 'utf8'))
    if (puesta.commit === lista.commit && !existsSync(join(release, 'nueva'))) break
  } catch {}
  await new Promise((r) => setTimeout(r, 1000))
}
const ok = puesta.commit === lista.commit
console.log(
  ok
    ? `5/5  Listo: la copia quedó en ${puesta.commit}. Sin Armar: ${armar === 0 ? 'sí' : 'NO'}.`
    : `5/5  FALLÓ: la copia sigue en ${puesta.commit}. Mirá ${join(release, 'actualizacion.log')}.`,
)
if (ok) await rm(base, { recursive: true, force: true })
process.exit(ok && armar === 0 ? 0 : 1)

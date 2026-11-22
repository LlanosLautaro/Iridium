// D-171 (CO-I10): prueba de punta a punta del instalador y de su actualizador, con instaladores de verdad. Arma la app
// con el código de ahora dos veces (la versión A y la B), arma sus instaladores con otro nombre interno (no choca con un
// Iridium instalado: otra carpeta, otra entrada en «Aplicaciones instaladas» y sin accesos directos), instala la A en
// una carpeta temporal y la abre con datos aparte y el motor falso, mirando las versiones en un servidor de prueba que
// sirve la B. Espera a que la baje, la cierra y mira que quedó la B. Después vuelve a la A y prueba Reiniciar ahora: la
// pone y la abre sola (el botón Actualizar de la barra de abajo). Al final desinstala y borra todo.
// Uso: node --experimental-strip-types tools/probar-instalador.ts [--sin-armar <carpeta con a/ y b/ de una vuelta anterior>]
import { execFileSync, execSync, spawnSync } from 'node:child_process'
import { createReadStream, existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { homedir, tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { _electron as electron } from '@playwright/test'
import { armarInstalador, type Instalador, versionDeApp } from './instalador.ts'

const NOMBRE = 'iridium-prueba'
const A = '2026.101.1000'
const B = '2026.101.1100'
const raiz = join(import.meta.dirname, '..')
const opcion = (n: string) => {
  const i = process.argv.indexOf(n)
  return i > 0 ? (process.argv[i + 1] ?? null) : null
}
const previa = opcion('--sin-armar')
const trabajo = previa ?? (await mkdtemp(join(tmpdir(), 'iridium-instalador-')))
const instalada = join(trabajo, 'instalada')
const datos = join(trabajo, 'datos')
const cache = join(process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local'), `${NOMBRE}-updater`)
const paso = (t: string) => console.log(`\n» ${t}`)
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms))
const resultado: Record<string, unknown> = {}
let bien = false

async function hasta<T>(que: string, f: () => Promise<T | null | false>, ms = 180_000): Promise<T> {
  const fin = Date.now() + ms
  while (Date.now() < fin) {
    const r = await f()
    if (r) return r
    await esperar(1000)
  }
  throw new Error(`No pasó a tiempo: ${que}`)
}

/** La app armada con el código de ahora y ese número (sin compilar de nuevo: lo hace `pnpm build` una vez). */
function armarApp(version: string, salida: string) {
  execFileSync(
    process.execPath,
    [
      join(raiz, 'node_modules', 'electron-builder', 'cli.js'),
      '--win',
      'dir',
      '--config',
      'electron-builder.yml',
      `-c.directories.output=${salida}`,
      `-c.extraMetadata.version=${version}`,
    ],
    { cwd: raiz, stdio: ['ignore', 'ignore', 'inherit'] },
  )
}

async function instalador(version: string): Promise<Instalador> {
  const carpeta = join(trabajo, version)
  const exe = join(carpeta, 'salida', `Iridium-Setup-${version}.exe`)
  if (existsSync(exe))
    return { version, exe, blockmap: `${exe}.blockmap`, latest: join(carpeta, 'salida', 'latest.yml') }
  await rm(carpeta, { recursive: true, force: true })
  armarApp(version, join(carpeta, 'armada'))
  return armarInstalador({
    app: join(carpeta, 'armada', 'win-unpacked'),
    trabajo: carpeta,
    repo: 'prueba/iridium',
    commit: `prueba${version.slice(-4)}`,
    mensaje: `La versión ${version}`,
    nombre: NOMBRE,
    config: [
      '-c.appId=com.lautaro.iridium.prueba',
      '-c.nsis.createDesktopShortcut=false',
      '-c.nsis.createStartMenuShortcut=false',
      '-c.nsis.runAfterFinish=false',
    ],
  })
}

/** Un servidor como las versiones de GitHub: `latest.yml`, los instaladores y sus `.blockmap`, con rangos. */
async function servidor(sirve: Instalador, viejos: Instalador[]) {
  const archivos = new Map<string, string>([
    ['latest.yml', sirve.latest],
    [basename(sirve.exe), sirve.exe],
    [basename(sirve.blockmap), sirve.blockmap],
    ...viejos.map((v) => [basename(v.blockmap), v.blockmap] as [string, string]),
  ])
  const pedidos: { archivo: string; bytes: number }[] = []
  const s = createServer(async (req, res) => {
    const nombre = decodeURIComponent((req.url ?? '/').split('?')[0]?.slice(1) ?? '')
    const archivo = archivos.get(nombre)
    if (!archivo) {
      res.writeHead(404).end()
      return
    }
    const tam = (await stat(archivo)).size
    const rango = /^bytes=(\d+)-(\d+)$/.exec(req.headers.range ?? '')
    const [desde, hastaB] = rango ? [Number(rango[1]), Number(rango[2])] : [0, tam - 1]
    pedidos.push({ archivo: nombre, bytes: hastaB - desde + 1 })
    res.writeHead(rango ? 206 : 200, {
      'Content-Length': hastaB - desde + 1,
      'Accept-Ranges': 'bytes',
      ...(rango ? { 'Content-Range': `bytes ${desde}-${hastaB}/${tam}` } : {}),
    })
    createReadStream(archivo, { start: desde, end: hastaB }).pipe(res)
  })
  await new Promise<void>((r) => s.listen(0, '127.0.0.1', r))
  return { url: `http://127.0.0.1:${(s.address() as AddressInfo).port}/`, pedidos, cerrar: () => s.close() }
}

function instalar(i: Instalador) {
  // NSIS: /S sin preguntas, /D la carpeta (último y sin comillas).
  const r = spawnSync(i.exe, ['/S', `/D=${instalada}`], { stdio: 'inherit' })
  if (r.status !== 0) throw new Error(`El instalador ${i.version} terminó con ${r.status}`)
}

async function registro(): Promise<string> {
  const carpeta = join(datos, 'registros')
  if (!existsSync(carpeta)) return ''
  const { readdir } = await import('node:fs/promises')
  const textos = await Promise.all((await readdir(carpeta)).map((a) => readFile(join(carpeta, a), 'utf8')))
  return textos.join('\n')
}

const versionInstalada = () => (existsSync(join(instalada, 'Iridium.exe')) ? versionDeApp(instalada) : null)

/** Abre la copia instalada mirando el servidor; espera a que baje la versión nueva. */
async function abrirYBajar(url: string, version: string) {
  await rm(datos, { recursive: true, force: true })
  await mkdir(datos, { recursive: true })
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_OCULTA: '1',
    // Sin reiniciar solo al rato sin uso (T-67): la prueba decide cuándo.
    IRIDIUM_ACTUALIZAR_SOLO: 'no',
    IRIDIUM_ACTUALIZAR_DESDE: url,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch({ executablePath: join(instalada, 'Iridium.exe'), env })
  const win = await app.firstWindow()
  await hasta(`que baje la ${version}`, async () =>
    (await registro()).includes(`bajada la versión ${version}`),
  )
  // La ventana muestra el aviso de siempre.
  await win.getByRole('button', { name: 'Actualizar' }).waitFor({ timeout: 15_000 })
  return { app, win }
}

const procesosDesde = (carpeta: string) =>
  execFileSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-Command',
      `(Get-CimInstance Win32_Process | ? { $_.Path -and $_.Path.StartsWith('${carpeta}', 'CurrentCultureIgnoreCase') }).Count`,
    ],
    { encoding: 'utf8' },
  ).trim()

try {
  if (!previa) {
    paso('Compilando el código de ahora (pnpm build)…')
    execSync('pnpm build', { cwd: raiz, stdio: ['ignore', 'ignore', 'inherit'] })
  }
  paso(`Armando la app y el instalador de la ${A} y de la ${B}…`)
  const ia = await instalador(A)
  const ib = await instalador(B)
  const mb = async (f: string) => Math.round((await stat(f)).size / 1024 / 1024)
  resultado.instaladorMB = await mb(ib.exe)

  paso(`Instalando la ${A} en ${instalada}…`)
  await rm(instalada, { recursive: true, force: true })
  await rm(cache, { recursive: true, force: true })
  instalar(ia)
  resultado.instalada = versionInstalada()
  resultado.copiaDelInstalador = existsSync(join(cache, 'installer.exe'))
  if (resultado.instalada !== A) throw new Error(`Se instaló ${resultado.instalada}, no la ${A}.`)

  paso('1) La abre, baja la versión nueva y la pone al cerrar…')
  const s1 = await servidor(ib, [ia])
  const { app } = await abrirYBajar(s1.url, B)
  const bajado = s1.pedidos.filter((p) => p.archivo === basename(ib.exe)).reduce((t, p) => t + p.bytes, 0)
  resultado.bajadoMB = +(bajado / 1024 / 1024).toFixed(1)
  resultado.diferencial = s1.pedidos.some((p) => p.archivo === basename(ia.blockmap))
  await app.evaluate(({ app }) => app.quit())
  await hasta('que se ponga la B', async () => versionInstalada() === B)
  await hasta('que el instalador termine', async () => procesosDesde(instalada) === '0', 60_000)
  resultado.alCerrar = versionInstalada()
  s1.cerrar()

  paso(`2) Reiniciar ahora: vuelve a la ${A}, baja la ${B}, la pone y la abre sola…`)
  instalar(ia)
  if (versionInstalada() !== A) throw new Error('No volvió a la A.')
  const s2 = await servidor(ib, [ia])
  const segunda = await abrirYBajar(s2.url, B)
  await segunda.win.getByRole('button', { name: 'Actualizar' }).click()
  await hasta('que se ponga la B', async () => versionInstalada() === B)
  resultado.reiniciarAhora = versionInstalada()
  // Se abre sola: un Iridium corriendo desde la carpeta instalada.
  resultado.seAbrioSola = await hasta(
    'que se abra sola',
    async () => procesosDesde(instalada) !== '0' && true,
    60_000,
  )
  s2.cerrar()
  bien = true
} finally {
  paso('Cerrando y desinstalando…')
  spawnSync('powershell.exe', [
    '-NoProfile',
    '-Command',
    `Get-CimInstance Win32_Process | ? { $_.Path -and $_.Path.StartsWith('${instalada}', 'CurrentCultureIgnoreCase') } | % { Stop-Process -Id $_.ProcessId -Force }`,
  ])
  const desinstalar = join(instalada, 'Uninstall Iridium.exe')
  if (existsSync(desinstalar)) spawnSync(desinstalar, ['/S'], { stdio: 'inherit' })
  await esperar(3000)
  await rm(cache, { recursive: true, force: true })
  console.log('\nResultado:', JSON.stringify(resultado, null, 2))
  // Si algo falló, lo armado queda para volver a probar sin armar (--sin-armar).
  if (bien && !previa) await rm(trabajo, { recursive: true, force: true }).catch(() => {})
  else console.log(`Lo armado quedó en ${trabajo}`)
}

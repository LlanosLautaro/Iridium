// Publica la app de uso diario como versión de GitHub (D-085, scripts.md › Publicar la versión para compartir): la
// copia de `release/win-unpacked` con `resources/actualizaciones.json` (el repositorio y el commit), en un `.zip`
// con la carpeta `win-unpacked` adentro. Las copias compartidas la bajan solas y la ponen al cerrar Iridium.
// Publica lo que marca `main` (lo que se armó por última vez, D-070); si `main` no está en GitHub, lo sube.
// Con `--desde <carpeta>`, la versión armada en otra carpeta (`tools/actualizar.ps1 -Release <carpeta>`), con el commit
// de su `nueva/lista.json`: sirve para publicar sin cambiar la app de uso diario.
// La sesión de GitHub es la de git (D-081): si no hay, git abre su ventana.
// Uso: node --experimental-strip-types tools/publicar.ts [--repo dueño/nombre] [--desde carpeta]
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { etiquetaVersion } from '../src/compartido/versiones.ts'

const API = 'https://api.github.com'
const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' }).trim()

function repoDeOrigin(): string {
  const url = git('remote', 'get-url', 'origin')
  const m = /github\.com[/:]([\w.-]+\/[\w.-]+?)(\.git)?$/.exec(url)
  if (!m?.[1]) throw new Error(`origin no es un repositorio de GitHub: ${url}`)
  return m[1]
}

function clave(): string {
  const salida = execFileSync('git', ['credential', 'fill'], {
    input: 'protocol=https\nhost=github.com\n\n',
    encoding: 'utf8',
  })
  const c = /^password=(.+)$/m.exec(salida)?.[1]?.trim()
  if (!c) throw new Error('No hay sesión de GitHub en git.')
  return c
}

const opcion = (nombre: string) => {
  const i = process.argv.indexOf(nombre)
  return i > 0 ? (process.argv[i + 1] ?? null) : null
}
const repo = opcion('--repo') ?? repoDeOrigin()
const desde = opcion('--desde')
const app = desde ? join(desde, 'nueva', 'win-unpacked') : join('release', 'win-unpacked')
if (!existsSync(join(app, 'Iridium.exe'))) throw new Error(`No está la app armada (${app}).`)

const ref = desde
  ? (JSON.parse((await readFile(join(desde, 'nueva', 'lista.json'), 'utf8')).replace(/^﻿/, '')) as {
      commit: string
      sinGuardar: boolean
    })
  : null
if (ref?.sinGuardar)
  throw new Error('Esa versión se armó con cambios sin commitear: commitealos y armala de nuevo.')
const base = ref?.commit ?? 'main'
const commit = git('rev-parse', '--short', base)
const largo = git('rev-parse', base)
const mensaje = git('log', '-1', '--format=%s', base)
const fecha = new Date()
const etiqueta = etiquetaVersion(fecha, commit)
console.log(`Publicando ${commit} («${mensaje}») en ${repo} como ${etiqueta}…`)

const token = clave()
const encabezados = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'User-Agent': 'Iridium',
  'X-GitHub-Api-Version': '2022-11-28',
}

// La etiqueta apunta al commit publicado: tiene que estar en GitHub.
if (!desde) {
  const remoto = execFileSync('git', ['ls-remote', 'origin', 'refs/heads/main'], { encoding: 'utf8' }).split(
    '\t',
  )[0]
  if (remoto !== largo) {
    console.log('1/4  Subiendo main a GitHub…')
    git('push', 'origin', 'main:refs/heads/main')
  } else console.log('1/4  main ya está en GitHub.')
} else {
  const ramas = git('branch', '-r', '--contains', largo)
  if (!ramas) throw new Error(`El commit ${commit} no está en GitHub: subilo antes (git push).`)
  console.log(`1/4  ${commit} ya está en GitHub.`)
}

// La misma versión no se publica dos veces.
const ultima = await fetch(`${API}/repos/${repo}/releases/latest`, { headers: encabezados })
if (ultima.ok) {
  const d = (await ultima.json()) as { tag_name?: string }
  if (d.tag_name?.endsWith(`-${commit}`)) {
    console.log(`Esa versión ya está publicada (${d.tag_name}). Nada que hacer.`)
    process.exit(0)
  }
}

console.log('2/4  Armando el .zip (copia de la app con actualizaciones.json)…')
const temporal = await mkdtemp(join(tmpdir(), 'iridium-publicar-'))
try {
  const copia = join(temporal, 'win-unpacked')
  await cp(app, copia, { recursive: true })
  await writeFile(
    join(copia, 'resources', 'actualizaciones.json'),
    JSON.stringify({ repo, commit, fecha: fecha.toISOString(), mensaje }, null, 2),
  )
  const zip = join(temporal, `Iridium-${commit}.zip`)
  const tar = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe')
  execFileSync(tar, ['-a', '-c', '-f', zip, '-C', temporal, 'win-unpacked'])
  const peso = (await stat(zip)).size
  console.log(`     ${(peso / 1024 / 1024).toFixed(0)} MB`)

  console.log('3/4  Creando la versión en GitHub…')
  const r = await fetch(`${API}/repos/${repo}/releases`, {
    method: 'POST',
    headers: encabezados,
    body: JSON.stringify({
      tag_name: etiqueta,
      target_commitish: largo,
      name: `Iridium · ${fecha.toLocaleDateString('es-AR')} · ${commit}`,
      body: mensaje,
      make_latest: 'true',
    }),
  })
  if (!r.ok) throw new Error(`GitHub no creó la versión: ${r.status} ${await r.text()}`)
  const version = (await r.json()) as { id: number; upload_url: string; html_url: string }

  console.log('4/4  Subiendo el .zip…')
  const subir = version.upload_url.replace(/\{.*\}$/, `?name=Iridium-${commit}.zip`)
  const s = await fetch(subir, {
    method: 'POST',
    headers: { ...encabezados, 'Content-Type': 'application/zip', 'Content-Length': String(peso) },
    body: await readFile(zip),
  })
  if (!s.ok) {
    // Sin el .zip la versión no sirve: se borra para que no quede como la última.
    await fetch(`${API}/repos/${repo}/releases/${version.id}`, { method: 'DELETE', headers: encabezados })
    await fetch(`${API}/repos/${repo}/git/refs/tags/${etiqueta}`, { method: 'DELETE', headers: encabezados })
    throw new Error(`No se pudo subir el .zip: ${s.status} ${await s.text()}`)
  }
  console.log('')
  console.log(`Listo: ${version.html_url}`)
  console.log(
    'Las copias compartidas la bajan solas (al abrir y cada seis horas) y la ponen al cerrar Iridium.',
  )
} finally {
  await rm(temporal, { recursive: true, force: true })
}

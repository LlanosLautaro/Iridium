// Publica la app de uso diario como versión de GitHub (D-085, D-171, scripts.md › Publicar la versión para compartir):
// arma su instalador desde `release/win-unpacked` (`tools/instalador.ts`) y lo sube con su `.blockmap` y `latest.yml`.
// Las copias instaladas la bajan solas con electron-updater (solo lo que cambió) y la ponen al cerrar Iridium.
// Publica lo que marca `main` (lo que se armó por última vez, D-070); si `main` no está en GitHub, lo sube. Con
// `--commit`, ese: la app de uso diario se publica sola con el commit de la versión en uso (T-132).
// Después, borra de GitHub las versiones viejas: quedan las últimas 5 (Q-290 y Q-291, `versionesParaBorrar`).
// Con `--desde <carpeta>`, la versión armada en otra carpeta (`tools/actualizar.ps1 -Release <carpeta>`): la de
// `nueva`, con el commit de su `lista.json`, o, si ya se puso, la de `win-unpacked` con `--commit`. Sirve para publicar
// sin cambiar la app de uso diario.
// La sesión de GitHub es la de git (D-081): si no hay, git abre su ventana.
// Uso: node --experimental-strip-types tools/publicar.ts [--repo dueño/nombre] [--commit c] [--desde carpeta]
//      [--version número]
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { VERSIONES_PUBLICADAS, versionesParaBorrar } from '../src/compartido/versiones.ts'
import { armarInstalador, versionDeApp } from './instalador.ts'

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
const lista = desde ? join(desde, 'nueva', 'lista.json') : null
const conLista = lista !== null && existsSync(lista)
const app = desde ? join(desde, conLista ? 'nueva' : '', 'win-unpacked') : join('release', 'win-unpacked')
if (!existsSync(join(app, 'Iridium.exe'))) throw new Error(`No está la app armada (${app}).`)

const ref =
  lista && conLista
    ? (JSON.parse((await readFile(lista, 'utf8')).replace(/^﻿/, '')) as {
        commit: string
        sinGuardar: boolean
      })
    : null
if (ref?.sinGuardar)
  throw new Error('Esa versión se armó con cambios sin commitear: commitealos y armala de nuevo.')
if (desde && !ref && !opcion('--commit')) throw new Error('Sin nueva/lista.json, falta --commit.')
const base = ref?.commit ?? opcion('--commit') ?? 'main'
const commit = git('rev-parse', '--short', base)
const largo = git('rev-parse', base)
const mensaje = git('log', '-1', '--format=%s', base)
const version = versionDeApp(app)
// Con `--version` (la que se publica sola, T-132): desde D-198 `win-unpacked` puede tener un armado que el Iridium
// instalado todavía no puso. Se publica lo que está en uso, así que ese espera a entrar.
const enUso = opcion('--version')
if (enUso && enUso !== version) {
  console.log(
    `La versión armada (${version}) todavía no es la que está en uso (${enUso}): se publica cuando entre.`,
  )
  process.exit(0)
}
// Las versiones armadas antes de D-171 no tienen número: electron-updater no sabría si es más nueva.
if (version === '0.1.0')
  throw new Error('Esa app se armó sin número de versión: armala de nuevo (pnpm actualizar).')
// electron-updater busca el .blockmap de la versión anterior cambiando el número en la dirección: la etiqueta es él.
const etiqueta = `v${version}`
const fecha = new Date()
console.log(`Publicando ${commit} («${mensaje}») en ${repo} como ${etiqueta}…`)

const token = clave()
const encabezados = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'User-Agent': 'Iridium',
  'X-GitHub-Api-Version': '2022-11-28',
}

/** Borra las versiones que pasan de las últimas 5 (la etiqueta queda); si no puede, lo dice y sigue. */
async function borrarViejas(): Promise<void> {
  const r = await fetch(`${API}/repos/${repo}/releases?per_page=100`, { headers: encabezados })
  if (!r.ok) return console.log(`No se pudieron ver las versiones viejas: ${r.status}`)
  const viejas = versionesParaBorrar(
    (await r.json()) as {
      id: number
      tag_name: string
      draft: boolean
      published_at: string | null
    }[],
  )
  for (const v of viejas) {
    const b = await fetch(`${API}/repos/${repo}/releases/${v.id}`, { method: 'DELETE', headers: encabezados })
    console.log(b.ok ? `     Borrada ${v.tag_name}` : `     No se pudo borrar ${v.tag_name}: ${b.status}`)
  }
  if (viejas.length) console.log(`Quedan las últimas ${VERSIONES_PUBLICADAS} versiones.`)
}

// La etiqueta apunta al commit publicado: tiene que estar en GitHub. Con `--commit` y sin `--desde` (la app de uso
// diario la publica sola, T-132), el commit de la versión en uso, que `main` ya puede haber pasado.
if (!desde && largo === git('rev-parse', 'main')) {
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
const ya = await fetch(`${API}/repos/${repo}/releases/tags/${etiqueta}`, { headers: encabezados })
if (ya.ok) {
  console.log(`Esa versión ya está publicada (${etiqueta}). Nada que subir.`)
  await borrarViejas()
  process.exit(0)
}

console.log('2/4  Armando el instalador…')
const temporal = await mkdtemp(join(tmpdir(), 'iridium-publicar-'))
try {
  const instalador = await armarInstalador({ app, trabajo: temporal, repo, commit, mensaje })
  const mb = async (archivo: string) => `${((await stat(archivo)).size / 1024 / 1024).toFixed(0)} MB`
  console.log(`     ${basename(instalador.exe)}: ${await mb(instalador.exe)}`)

  // Se crea como borrador y se publica al final: mientras se sube, las copias instaladas no la ven.
  console.log('3/4  Creando la versión en GitHub…')
  const r = await fetch(`${API}/repos/${repo}/releases`, {
    method: 'POST',
    headers: encabezados,
    body: JSON.stringify({
      tag_name: etiqueta,
      target_commitish: largo,
      name: `Iridium · ${fecha.toLocaleDateString('es-AR')} · ${commit}`,
      body: mensaje,
      draft: true,
    }),
  })
  if (!r.ok) throw new Error(`GitHub no creó la versión: ${r.status} ${await r.text()}`)
  const creada = (await r.json()) as { id: number; upload_url: string }
  const borrar = () =>
    fetch(`${API}/repos/${repo}/releases/${creada.id}`, { method: 'DELETE', headers: encabezados })

  console.log('4/4  Subiendo el instalador…')
  const subir = async (archivo: string, tipo: string) => {
    const nombre = basename(archivo)
    const cuerpo = await readFile(archivo)
    const url = creada.upload_url.replace(/\{.*\}$/, `?name=${encodeURIComponent(nombre)}`)
    const s = await fetch(url, {
      method: 'POST',
      headers: { ...encabezados, 'Content-Type': tipo, 'Content-Length': String(cuerpo.length) },
      body: cuerpo,
    })
    if (s.ok) return
    // Sin todo lo suyo la versión no sirve: se borra el borrador.
    await borrar()
    throw new Error(`No se pudo subir ${nombre}: ${s.status} ${await s.text()}`)
  }
  await subir(instalador.exe, 'application/octet-stream')
  await subir(instalador.blockmap, 'application/octet-stream')
  await subir(instalador.latest, 'text/yaml')
  const p = await fetch(`${API}/repos/${repo}/releases/${creada.id}`, {
    method: 'PATCH',
    headers: encabezados,
    body: JSON.stringify({ draft: false, make_latest: 'true' }),
  })
  if (!p.ok) {
    await borrar()
    throw new Error(`GitHub no publicó la versión: ${p.status} ${await p.text()}`)
  }
  const publicada = (await p.json()) as { html_url: string }
  console.log('')
  console.log(`Listo: ${publicada.html_url}`)
  console.log(
    'Las copias instaladas la bajan solas (al abrir y cada seis horas) y la ponen al cerrar Iridium.',
  )
  await borrarViejas()
} finally {
  await rm(temporal, { recursive: true, force: true })
}

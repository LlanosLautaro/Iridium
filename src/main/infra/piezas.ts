// Las piezas de una versión publicada (D-161, T-37): la app armada se parte en tres, Electron (el programa y lo que
// trae), Claude Code (el SDK con su `claude.exe`) y la app (el código de Iridium, la extensión y los complementos).
// `tools/publicar.ts` guarda la huella de cada una en `resources/piezas.json` y sube, además del `.zip` completo, la
// pieza de la app sola. La copia compartida que ya tiene Electron y Claude Code con la misma huella baja solo esa
// pieza (unos MB en vez de unos 300) y copia el resto de la versión que está usando.
// El programa (`Iridium.exe`) lleva grabada la huella de `app.asar` («integridad»), así que cambia en cada armado
// aunque Electron sea el mismo: su huella se toma con ese valor en ceros, `piezas.json` guarda el de la versión y la
// copia lo escribe en el programa que copia.
// Sin dependencias del resto de la app: lo usa también `tools/publicar.ts`.
import { createHash } from 'node:crypto'
import * as fsDeNode from 'node:fs'
import { createRequire } from 'node:module'
import { join, relative, sep } from 'node:path'

/**
 * Los archivos tal como están en el disco (T-111). Dentro de Electron, `node:fs` trata cada `.asar` como una carpeta:
 * listar una versión daba también los archivos de adentro de su `app.asar` (la huella nunca coincidía con la
 * publicada) y borrar una carpeta con un `.asar` lo dejaba abierto y fallaba (EBUSY), así que la copia compartida no
 * se actualizaba más. `original-fs` es el de Node sin eso; fuera de Electron (las pruebas, `tools/`), el de siempre.
 */
export const fsReal: typeof fsDeNode = process.versions.electron
  ? createRequire(import.meta.url)('original-fs')
  : fsDeNode
const { createReadStream } = fsReal
const { open, readdir, readFile } = fsReal.promises

export type Pieza = 'electron' | 'claude' | 'app'
export interface Huellas {
  electron: string
  claude: string
  app: string
  /** La integridad grabada en el programa de esta versión; null si no tiene. */
  integridad: string | null
}

/** Lo que cambia en cada versión publicada y no forma parte de ninguna pieza. */
const PROPIOS_DE_LA_VERSION = new Set(['resources/actualizaciones.json', 'resources/piezas.json'])

/** Lo que precede a la integridad de `app.asar` dentro del programa (un JSON en sus recursos). */
const MARCA = Buffer.from('"file":"resources\\\\app.asar","alg":"SHA256","value":"')
const HEX = /^[0-9a-f]{64}$/

/** A qué pieza va un archivo (ruta relativa a `win-unpacked`, con `/`); null si es propio de la versión. */
export function piezaDe(ruta: string): Pieza | null {
  if (PROPIOS_DE_LA_VERSION.has(ruta)) return null
  if (ruta.startsWith('resources/app.asar.unpacked/')) return 'claude'
  if (ruta.startsWith('resources/') && ruta !== 'resources/default_app.asar') return 'app'
  return 'electron'
}

/** El programa: un `.exe` suelto en `win-unpacked`. */
export const esPrograma = (ruta: string) => !ruta.includes('/') && ruta.toLowerCase().endsWith('.exe')

/** Todos los archivos de la carpeta, relativos y con `/`, ordenados. */
export async function archivosDe(carpeta: string): Promise<string[]> {
  const entradas = await readdir(carpeta, { recursive: true, withFileTypes: true })
  return entradas
    .filter((e) => e.isFile())
    .map((e) => relative(carpeta, join(e.parentPath, e.name)).split(sep).join('/'))
    .sort()
}

function huellaDeArchivo(archivo: string): Promise<string> {
  return new Promise((listo, fallo) => {
    const h = createHash('sha256')
    createReadStream(archivo)
      .on('data', (d) => h.update(d))
      .on('error', fallo)
      .on('end', () => listo(h.digest('hex')))
  })
}

/** Dónde está la integridad en el contenido de un programa y cuál es; null si no la tiene. */
function integridadEn(contenido: Buffer): { posicion: number; valor: string } | null {
  const i = contenido.indexOf(MARCA)
  if (i < 0) return null
  const posicion = i + MARCA.length
  const valor = contenido.subarray(posicion, posicion + 64).toString('latin1')
  return HEX.test(valor) ? { posicion, valor } : null
}

/** La huella del programa con la integridad en ceros, y la integridad. */
async function huellaDePrograma(archivo: string): Promise<{ huella: string; integridad: string | null }> {
  const contenido = await readFile(archivo)
  const i = integridadEn(contenido)
  if (i) contenido.fill('0', i.posicion, i.posicion + 64)
  return { huella: createHash('sha256').update(contenido).digest('hex'), integridad: i?.valor ?? null }
}

/** Escribe la integridad de otra versión en un programa copiado. Tira si el programa no la tiene. */
export async function ponerIntegridad(archivo: string, valor: string): Promise<void> {
  if (!HEX.test(valor)) throw new Error('integridad inválida')
  const i = integridadEn(await readFile(archivo))
  if (!i) throw new Error('el programa no tiene la integridad')
  const f = await open(archivo, 'r+')
  try {
    await f.write(Buffer.from(valor, 'latin1'), 0, 64, i.posicion)
  } finally {
    await f.close()
  }
}

/** La huella de cada pieza de una app armada (`win-unpacked`): cambia si cambia, se suma o se saca un archivo. */
export async function huellasDe(carpeta: string): Promise<Huellas> {
  const sumas: Record<Pieza, ReturnType<typeof createHash>> = {
    electron: createHash('sha256'),
    claude: createHash('sha256'),
    app: createHash('sha256'),
  }
  let integridad: string | null = null
  for (const ruta of await archivosDe(carpeta)) {
    const pieza = piezaDe(ruta)
    if (!pieza) continue
    let huella: string
    if (esPrograma(ruta)) {
      const p = await huellaDePrograma(join(carpeta, ruta))
      huella = p.huella
      integridad ??= p.integridad
    } else huella = await huellaDeArchivo(join(carpeta, ruta))
    sumas[pieza].update(`${ruta}\0${huella}\n`)
  }
  return {
    electron: sumas.electron.digest('hex'),
    claude: sumas.claude.digest('hex'),
    app: sumas.app.digest('hex'),
    integridad,
  }
}

/** Lee un `piezas.json` (el de `resources` o el publicado); null si falta o no tiene las tres huellas. */
export function leerHuellas(datos: unknown): Huellas | null {
  if (typeof datos !== 'object' || datos === null) return null
  const d = datos as Record<string, unknown>
  const ok = (v: unknown): v is string => typeof v === 'string' && HEX.test(v)
  if (!ok(d.electron) || !ok(d.claude) || !ok(d.app)) return null
  if (d.integridad !== undefined && d.integridad !== null && !ok(d.integridad)) return null
  return {
    electron: d.electron,
    claude: d.claude,
    app: d.app,
    integridad: ok(d.integridad) ? d.integridad : null,
  }
}

export async function leerArchivoHuellas(archivo: string): Promise<Huellas | null> {
  try {
    return leerHuellas(JSON.parse((await readFile(archivo, 'utf8')).replace(/^﻿/, '')))
  } catch {
    return null
  }
}

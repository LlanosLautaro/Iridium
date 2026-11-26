// Iridium instalado también en la PC donde se arma (Q-304 A, D-198, modulos/compartir/diseno-tecnico.md › Iridium
// instalado en esta PC): `tools/actualizar.ps1` deja el instalador de cada armado en `release/instalador` y anota en
// los datos de Iridium dónde está el código (`codigo.json`). La copia instalada de esta PC baja sus versiones de esa
// carpeta con el mismo electron-updater que la otra PC baja de GitHub: Iridium la sirve en 127.0.0.1 mientras corre.
import { createReadStream, existsSync, readFileSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { basename, join } from 'node:path'

/** Cada cuánto se mira si apareció un armado nuevo: un `stat` de `latest.yml`. */
const CADA_MS = 5000

/**
 * La carpeta del código de Iridium según `codigo.json` (lo escribe `tools/actualizar.ps1`), si sigue teniendo su
 * `release`; null en cualquier otra PC.
 */
export function leerCodigoLocal(carpetaDatos: string): string | null {
  try {
    const d = JSON.parse(readFileSync(join(carpetaDatos, 'codigo.json'), 'utf8').replace(/^﻿/, ''))
    const carpeta = typeof d?.carpeta === 'string' ? d.carpeta : null
    return carpeta && existsSync(join(carpeta, 'release')) ? carpeta : null
  } catch {
    return null
  }
}

/**
 * Sirve los archivos sueltos de `carpeta` (sin subcarpetas) en 127.0.0.1, con rangos de a uno: lo que pide
 * electron-updater para bajar solo lo que cambió.
 */
export async function servirVersiones(carpeta: string): Promise<{ url: string; cerrar: () => void }> {
  const s = createServer(async (req, res) => {
    const nombre = decodeURIComponent((req.url ?? '/').split('?')[0]?.slice(1) ?? '')
    if (!nombre || nombre !== basename(nombre) || nombre.startsWith('.')) {
      res.writeHead(404).end()
      return
    }
    const archivo = join(carpeta, nombre)
    const tam = await stat(archivo).then(
      (e) => (e.isFile() ? e.size : null),
      () => null,
    )
    if (tam === null) {
      res.writeHead(404).end()
      return
    }
    const rango = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range ?? '')
    const desde = rango ? Number(rango[1]) : 0
    const hasta = rango?.[2] ? Math.min(Number(rango[2]), tam - 1) : tam - 1
    if (desde > hasta && tam > 0) {
      res.writeHead(416, { 'Content-Range': `bytes */${tam}` }).end()
      return
    }
    res.writeHead(rango ? 206 : 200, {
      'Content-Length': tam === 0 ? 0 : hasta - desde + 1,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store',
      ...(rango ? { 'Content-Range': `bytes ${desde}-${hasta}/${tam}` } : {}),
    })
    if (tam === 0 || req.method === 'HEAD') res.end()
    else createReadStream(archivo, { start: desde, end: hasta }).pipe(res)
  })
  await new Promise<void>((listo) => s.listen(0, '127.0.0.1', listo))
  return { url: `http://127.0.0.1:${(s.address() as AddressInfo).port}/`, cerrar: () => s.close() }
}

/** Llama a `alCambiar` cada vez que `archivo` aparece o cambia (no al empezar); devuelve cómo dejar de mirar. */
export function vigilarArchivo(archivo: string, alCambiar: () => void, cadaMs = CADA_MS): () => void {
  let antes: number | null | undefined
  const mirar = async () => {
    const ahora = await stat(archivo).then(
      (e) => e.mtimeMs,
      () => null,
    )
    if (antes !== undefined && ahora !== null && ahora !== antes) alCambiar()
    antes = ahora
  }
  void mirar()
  const reloj = setInterval(() => void mirar(), cadaMs)
  return () => clearInterval(reloj)
}

/** Dónde queda Iridium instalado para este usuario (electron-builder.yml › nsis, por usuario). */
export function exeInstalado(localAppData: string): string {
  return join(localAppData, 'Programs', 'iridium', 'Iridium.exe')
}

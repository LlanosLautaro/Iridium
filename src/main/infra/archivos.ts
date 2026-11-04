// Disco de Archivos (H-15): lo que hay en una carpeta del proyecto y el contenido de un archivo, solo lectura.
// La ventana nombra rutas relativas; acá se comprueba que, siguiendo los enlaces simbólicos, no salgan del proyecto.
import { open, readdir, realpath, stat } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import type { CarpetaArchivos, ContenidoArchivo, NodoArchivo } from '../../compartido/puente'
import {
  CARPETAS_OCULTAS,
  colorear,
  esBinario,
  LIMITE_IMAGEN_BYTES,
  LIMITE_TEXTO_BYTES,
  lenguajeDe,
  MUESTRA_BINARIO_BYTES,
  nombreLenguaje,
  ordenarNodos,
  rutaDeArchivoValida,
  tipoImagen,
} from '../core/archivos'
import { esRutaDeDocumento } from '../core/visor/documentos'

/** La ruta en el disco, o null si sale del proyecto (también a través de un enlace). */
async function enElProyecto(proyecto: string, ruta: string): Promise<string | null> {
  if (!rutaDeArchivoValida(ruta)) return null
  const base = await realpath(proyecto)
  const real = await realpath(join(base, ...ruta.split('/').filter(Boolean)))
  const r = relative(base, real)
  if (r === '') return real
  return r.startsWith('..') || r.includes(`..${sep}`) || /^[a-z]:/i.test(r) ? null : real
}

function motivo(e: unknown): string {
  const codigo = (e as NodeJS.ErrnoException)?.code
  if (codigo === 'EACCES' || codigo === 'EPERM') return `No hay permiso para leerlo (${codigo}).`
  if (codigo === 'EBUSY') return 'Otro programa lo tiene bloqueado (EBUSY).'
  return e instanceof Error ? e.message : String(e)
}

export async function leerCarpeta(proyecto: string, carpeta: string): Promise<CarpetaArchivos> {
  try {
    const real = await enElProyecto(proyecto, carpeta)
    if (real === null) return { tipo: 'error', mensaje: 'Esa carpeta no es del proyecto.' }
    const entradas = await readdir(real, { withFileTypes: true })
    const hijos: NodoArchivo[] = []
    for (const e of entradas) {
      const ruta = carpeta === '' ? e.name : `${carpeta}/${e.name}`
      let esCarpeta = e.isDirectory()
      if (e.isSymbolicLink()) {
        try {
          esCarpeta = (await stat(join(real, e.name))).isDirectory()
        } catch {
          continue
        }
      } else if (!esCarpeta && !e.isFile()) continue
      if (esCarpeta && CARPETAS_OCULTAS.has(e.name)) continue
      hijos.push({ nombre: e.name, ruta, tipo: esCarpeta ? 'carpeta' : 'archivo' })
    }
    return { tipo: 'ok', hijos: ordenarNodos(hijos) }
  } catch (e) {
    if ((e as NodeJS.ErrnoException)?.code === 'ENOENT')
      return { tipo: 'error', mensaje: 'La carpeta ya no existe.' }
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

export async function leerArchivo(proyecto: string, archivo: string): Promise<ContenidoArchivo> {
  try {
    if (archivo === '') return { tipo: 'no-existe' }
    const real = await enElProyecto(proyecto, archivo)
    if (real === null) return { tipo: 'error', mensaje: 'Ese archivo no es del proyecto.' }
    const s = await stat(real)
    if (!s.isFile()) return { tipo: 'no-existe' }
    const bytes = s.size
    const nombre = archivo.split('/').at(-1) ?? archivo
    const mime = tipoImagen(nombre)
    const f = await open(real, 'r')
    try {
      if (mime) {
        if (bytes > LIMITE_IMAGEN_BYTES) return { tipo: 'grande', bytes }
        const datos = await f.readFile()
        return { tipo: 'imagen', url: `data:${mime};base64,${datos.toString('base64')}`, bytes }
      }
      const muestra = Buffer.alloc(Math.min(bytes, MUESTRA_BINARIO_BYTES))
      await f.read(muestra, 0, muestra.length, 0)
      if (esBinario(muestra)) return { tipo: 'binario', bytes }
      if (bytes > LIMITE_TEXTO_BYTES) return { tipo: 'grande', bytes }
      const texto = (await f.readFile({ encoding: 'utf8' })).toString()
      return {
        tipo: 'texto',
        lineas: colorear(texto, lenguajeDe(nombre)),
        lenguaje: nombreLenguaje(nombre),
        bytes,
        // Docs lee los `.md` de la raíz y de `docs/` (infra/documentos.ts).
        documento: esRutaDeDocumento(archivo) && (archivo.startsWith('docs/') || !archivo.includes('/')),
      }
    } finally {
      await f.close()
    }
  } catch (e) {
    if ((e as NodeJS.ErrnoException)?.code === 'ENOENT') return { tipo: 'no-existe' }
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

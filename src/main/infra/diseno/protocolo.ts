// Las maquetas vivas (frente Diseño, S-4; `modulos/diseno/diseno-tecnico.md` › Mostrarlas vivas). Las miniaturas
// piden `maqueta://<id>/<archivo>` y este lado sirve solo archivos de `docs/diseno/` de un proyecto abierto en Diseño,
// con una política de contenido sin red. La grande usa `file://` y las mismas carpetas deciden qué puede cargar.
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { carpetaDiseno } from './archivos'

export const ESQUEMA_MAQUETA = 'maqueta'

/** Sin `connect-src` ni orígenes de afuera: una maqueta no pide nada a la red ni a Iridium. */
export const POLITICA_MAQUETA =
  "default-src 'none'; style-src maqueta: 'unsafe-inline'; script-src maqueta: 'unsafe-inline'; img-src maqueta: data:; font-src maqueta: data:"

const TIPOS: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
}

/** Si `ruta` está dentro de `carpeta` (o es ella), sin salir con `..`. */
export function estaDentro(carpeta: string, ruta: string): boolean {
  const r = relative(normalize(carpeta).toLowerCase(), normalize(ruta).toLowerCase())
  return r === '' || (!r.startsWith('..') && !r.includes(`..${sep}`) && !/^[a-z]:/i.test(r))
}

/** Los proyectos abiertos en Diseño: cada uno con un id corto, la huella de su ruta. */
export class MaquetasAbiertas {
  private readonly porId = new Map<string, string>()

  /** Da de alta el proyecto y devuelve su id (siempre el mismo para la misma ruta). */
  abrir(proyecto: string): string {
    const id = createHash('sha256').update(normalize(proyecto).toLowerCase()).digest('hex').slice(0, 12)
    this.porId.set(id, normalize(proyecto))
    return id
  }

  /** El archivo de disco que pide una dirección `maqueta://<id>/<archivo>`, o null si no se puede servir. */
  archivoDe(url: string): string | null {
    let u: URL
    try {
      u = new URL(url)
    } catch {
      return null
    }
    const proyecto = this.porId.get(u.hostname)
    if (u.protocol !== `${ESQUEMA_MAQUETA}:` || !proyecto) return null
    let camino: string
    try {
      camino = decodeURIComponent(u.pathname)
    } catch {
      return null
    }
    if (camino.split(/[\\/]/).includes('..')) return null
    // Con una dirección puesta (DI-I4) la base es `maqueta://<id>/~<dirección>/`: lo mismo, salvo `tokens.css`, que
    // es `direcciones/<dirección>.css`.
    const conDireccion = /^\/~([^/\\]+)\/(.*)$/.exec(camino)
    if (conDireccion) {
      const [, nombre = '', resto = ''] = conDireccion
      if (!nombre || nombre.includes('..')) return null
      camino = resto.toLowerCase() === 'tokens.css' ? `direcciones/${nombre}.css` : resto
    }
    const base = carpetaDiseno(proyecto)
    const archivo = normalize(join(base, camino))
    return estaDentro(base, archivo) && archivo !== normalize(base) ? archivo : null
  }

  /** El proyecto cuya `docs/diseno/` contiene esa dirección `file://`, si está abierto en Diseño; si no, null. */
  proyectoDeArchivo(url: string): string | null {
    let ruta: string
    try {
      if (!url.startsWith('file:')) return null
      ruta = fileURLToPath(url.replace(/[?#].*$/, ''))
    } catch {
      return null
    }
    for (const p of this.porId.values()) if (estaDentro(carpetaDiseno(p), ruta)) return p
    return null
  }

  /** La respuesta para `protocol.handle`: el archivo con la política sin red, o un 404. */
  async responder(url: string): Promise<Response> {
    const archivo = this.archivoDe(url)
    if (!archivo) return new Response('No es una maqueta', { status: 404 })
    try {
      const datos = await readFile(archivo)
      return new Response(new Uint8Array(datos), {
        headers: {
          'content-type': TIPOS[extname(archivo).toLowerCase()] ?? 'application/octet-stream',
          'content-security-policy': POLITICA_MAQUETA,
          'cache-control': 'no-store',
        },
      })
    } catch {
      return new Response('No está', { status: 404 })
    }
  }
}

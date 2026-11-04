// De la pila del JSX (React 19, `_debugStack`) al archivo y la línea del proyecto (research/revision-extension.md › 2).
// Reglas puras: bajar el módulo y leer el mapa lo hace el caso de uso.

export interface Marco {
  url: string
  linea: number
  columna: number
}

const LOCALES = new Set(['localhost', '127.0.0.1', '[::1]', '::1'])

/** Solo las direcciones de la PC: Iridium nunca baja nada de afuera (diseno-tecnico.md › Seguridad). */
export function esDireccionLocal(url: string): boolean {
  try {
    const u = new URL(url)
    return (u.protocol === 'http:' || u.protocol === 'https:') && LOCALES.has(u.hostname)
  } catch {
    return false
  }
}

/** `localhost:5173`: la misma app se reconoce aunque se abra por `127.0.0.1` o `[::1]`. */
export function direccionDe(url: string): string | null {
  try {
    const u = new URL(url)
    if (!LOCALES.has(u.hostname)) return null
    return `localhost:${u.port || (u.protocol === 'https:' ? '443' : '80')}`
  } catch {
    return null
  }
}

/** El puerto de una dirección `localhost:5173`; null si no tiene. */
export function puertoDe(direccion: string): number | null {
  const n = Number(/:(\d{1,5})$/.exec(direccion)?.[1])
  return n > 0 && n < 65536 ? n : null
}

/**
 * El primer renglón de la pila que es código del proyecto: fuera de `node_modules` y de los módulos internos del
 * servidor de desarrollo (`/@vite/…`, `/@react-refresh`), servido desde la PC.
 */
export function primerMarco(pila: string | null): Marco | null {
  if (!pila) return null
  for (const m of pila.matchAll(/(https?:\/\/[^\s)]+?):(\d+):(\d+)/g)) {
    const url = m[1] ?? ''
    if (!esDireccionLocal(url)) continue
    const camino = new URL(url).pathname
    if (camino.includes('/node_modules/') || camino.startsWith('/@') || camino.includes('/.vite/')) continue
    return { url, linea: Number(m[2]), columna: Number(m[3]) }
  }
  return null
}

/** El mapa de fuentes pegado al final del módulo (`sourceMappingURL=data:…;base64,…`), como texto JSON. */
export function mapaEnLinea(codigo: string): string | null {
  const m =
    /[#@]\s*sourceMappingURL=data:application\/json;(?:charset=utf-8;)?base64,([A-Za-z0-9+/=]+)\s*$/m.exec(
      codigo,
    )
  return m?.[1] ? Buffer.from(m[1], 'base64').toString('utf8') : null
}

/**
 * Las rutas relativas que pueden ser el archivo, de la más probable a la menos: lo que dice el mapa resuelto contra
 * la dirección del módulo, y la dirección misma (Vite sirve `/src/Tarjeta.jsx` desde la raíz de la app).
 */
export function candidatosDeRuta(urlModulo: string, fuente: string | null): string[] {
  const salida: string[] = []
  const agregar = (r: string) => {
    const limpia = decodeURIComponent(r)
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
      .replace(/^@fs\/[A-Za-z]:\//, '')
    if (limpia && !limpia.includes('..') && !salida.includes(limpia)) salida.push(limpia)
  }
  const base = new URL(urlModulo)
  if (fuente && !/^[a-z]+:/i.test(fuente)) agregar(new URL(fuente, base).pathname)
  else if (fuente?.startsWith('file:')) agregar(fuente.replace(/^file:\/\/\/?/, ''))
  agregar(base.pathname)
  return salida
}

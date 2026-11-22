// Los adjuntos del chat (frente Paridad, PA-2 a PA-5; D-169 › 5, 8 y 11): las fotos, los archivos y el texto largo
// pegado que van con un mensaje. Las reglas son de Iridium, iguales con cualquier motor: el umbral del texto pegado y las
// marcas `iridium-*` con que viajan dentro del texto, que la IA ve como bloques y que Iridium reconoce al leer el
// historial (una ruta escrita a mano no se vuelve ficha).

/** Un adjunto sin mandar, como lo junta el compositor y lo guarda `escritos.json`: la foto y el archivo, su ruta. */
export type AdjuntoPedido = { tipo: 'foto' | 'archivo'; ruta: string } | { tipo: 'pegado'; texto: string }

/** Un adjunto en un mensaje mandado (`Entrada` del usuario): la foto llega como `data:`. */
export type AdjuntoVista =
  | { tipo: 'foto'; src: string; nombre: string | null }
  | { tipo: 'archivo'; ruta: string }
  | { tipo: 'pegado'; lineas: number; texto: string }

/** Cuántos adjuntos entran en un mensaje (`ux.md` › Muchos adjuntos). */
export const MAX_ADJUNTOS = 20

/** El texto pegado que pasa de esto va como ficha (PA-4). */
export const PEGADO_LARGO = { lineas: 40, caracteres: 2000 }

/** Un texto pegado no pasa de esto (1 MB): más grande, va mejor como archivo (paso 8). */
export const PEGADO_MAXIMO = 1024 * 1024

/** Lo escrito en el cuadro y lo que se manda como texto no pasan de esto (`escritos.json`, el puente). */
export const LARGO_ESCRITO = 100_000

/** Las fotos que el compositor muestra como miniatura (PNG, JPEG, GIF y WebP), por la extensión del archivo. */
const EXTENSIONES_FOTO = /\.(png|jpe?g|gif|webp)$/i

export function esFoto(ruta: string): boolean {
  return EXTENSIONES_FOTO.test(ruta)
}

/** El adjunto de una ruta elegida o soltada: foto o archivo, por su extensión. */
export function adjuntoDeRuta(ruta: string): AdjuntoPedido {
  return { tipo: esFoto(ruta) ? 'foto' : 'archivo', ruta }
}

/** Cuántas líneas tiene un texto (sin contar el salto del final). */
export function lineasDe(texto: string): number {
  return texto.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n').length
}

/** «340 líneas», «1 línea»: lo que dice la ficha de un texto pegado. */
export function textoLineas(n: number): string {
  return `${n} ${n === 1 ? 'línea' : 'líneas'}`
}

/** Si un pegado es largo: más de 40 líneas o más de 2.000 caracteres (PA-4). */
export function esPegadoLargo(texto: string): boolean {
  return lineasDe(texto) > PEGADO_LARGO.lineas || texto.length > PEGADO_LARGO.caracteres
}

/** El nombre de un archivo por su ruta (`D:\Descargas\registro.log` → `registro.log`). */
export function nombreDe(ruta: string): string {
  return ruta.split(/[\\/]/).filter(Boolean).at(-1) ?? ruta
}

/** Los adjuntos sumados a los de antes, sin repetir una ruta y hasta 20; `sobran`, los que no entraron. */
export function sumarAdjuntos(
  antes: readonly AdjuntoPedido[],
  nuevos: readonly AdjuntoPedido[],
): { adjuntos: AdjuntoPedido[]; sobran: number } {
  const adjuntos = [...antes]
  let sobran = 0
  for (const a of nuevos) {
    if (a.tipo !== 'pegado' && adjuntos.some((b) => b.tipo !== 'pegado' && mismaRuta(b.ruta, a.ruta)))
      continue
    if (adjuntos.length >= MAX_ADJUNTOS) sobran++
    else adjuntos.push(a)
  }
  return { adjuntos, sobran }
}

function mismaRuta(a: string, b: string): boolean {
  const n = (r: string) => r.replace(/[\\/]+/g, '\\').toLowerCase()
  return n(a) === n(b)
}

const PEGADO = /^<iridium-pegado lineas="(\d+)">\n([\s\S]*?)\n<\/iridium-pegado>(?:\n\n|\n?$)/
const ARCHIVOS = /^<iridium-archivos>\n([\s\S]*?)\n<\/iridium-archivos>(?:\n\n|\n?$)/
/** El cierre de un pegado dentro de su texto se rompe con un espacio: así no corta el bloque antes de tiempo. */
const CIERRE_PEGADO = /<\/iridium-pegado>/g
/** Y al leerlo vuelve a ser el de antes: la ficha muestra lo que se pegó. */
const CIERRE_ROTO = /<\/ iridium-pegado>/g

/**
 * El texto que sale con los adjuntos (D-169 › 5): primero cada texto pegado en su `<iridium-pegado>`, después las rutas
 * de los archivos en `<iridium-archivos>` (una por renglón) y al final lo escrito. Las fotos no van acá: viajan aparte.
 */
export function mensajeConAdjuntos(
  adjuntos: { pegados: readonly string[]; archivos: readonly string[] },
  texto: string,
): string {
  const partes = adjuntos.pegados.map(
    (p) =>
      `<iridium-pegado lineas="${lineasDe(p)}">\n${p.replace(CIERRE_PEGADO, '</ iridium-pegado>')}\n</iridium-pegado>`,
  )
  if (adjuntos.archivos.length)
    partes.push(`<iridium-archivos>\n${adjuntos.archivos.join('\n')}\n</iridium-archivos>`)
  if (texto.trim()) partes.push(texto)
  return partes.join('\n\n')
}

/**
 * Lo contrario, para mostrar un mensaje mandado: los bloques del principio (pegados y archivos) y lo escrito después.
 * Solo los del principio: una marca escrita en el medio del texto queda como texto.
 */
export function leerAdjuntos(mensaje: string): {
  pegados: { lineas: number; texto: string }[]
  archivos: string[]
  texto: string
} {
  let resto = mensaje.replace(/\r\n/g, '\n')
  const pegados: { lineas: number; texto: string }[] = []
  const archivos: string[] = []
  while (true) {
    const p = PEGADO.exec(resto)
    if (p) {
      pegados.push({ lineas: Number(p[1]), texto: (p[2] ?? '').replace(CIERRE_ROTO, '</iridium-pegado>') })
      resto = resto.slice(p[0].length)
      continue
    }
    const a = ARCHIVOS.exec(resto)
    if (a) {
      archivos.push(...(a[1] ?? '').split('\n').filter((r) => r.trim() !== ''))
      resto = resto.slice(a[0].length)
      continue
    }
    break
  }
  return pegados.length || archivos.length
    ? { pegados, archivos, texto: resto }
    : { pegados, archivos, texto: mensaje }
}

/**
 * Un mensaje que empieza con un comando lleva los adjuntos después del comando, como lo que se le escribe (D-169 › 7):
 * `/nombre lo escrito`, los bloques y lo citado. Sin comando, los bloques van al principio.
 */
export function conAdjuntosDespuesDelComando(
  texto: string,
  adjuntos: { pegados: readonly string[]; archivos: readonly string[] },
  esComando: boolean,
): string {
  if (!esComando) return mensajeConAdjuntos(adjuntos, texto)
  const t = texto.trim()
  const corte = t.search(/\n\n/)
  const comando = corte === -1 ? t : t.slice(0, corte)
  const despues = corte === -1 ? '' : t.slice(corte + 2)
  const bloques = mensajeConAdjuntos(adjuntos, despues)
  return bloques ? `${comando}\n\n${bloques}` : comando
}

/** Un mensaje de comando mandado, al leerlo: el comando, los bloques que siguen y lo escrito después. */
export function leerAdjuntosDeComando(
  mensaje: string,
): ReturnType<typeof leerAdjuntos> & { comando: string } {
  const t = mensaje.replace(/\r\n/g, '\n').trim()
  const corte = t.search(/\n\n/)
  const comando = corte === -1 ? t : t.slice(0, corte)
  const leidos = leerAdjuntos(corte === -1 ? '' : t.slice(corte + 2))
  return { comando, ...leidos }
}

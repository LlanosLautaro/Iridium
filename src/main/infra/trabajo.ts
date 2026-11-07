// Anotar sin la IA (frente Orden, `modulos/orden/diseno-tecnico.md` › Anotar sin la IA): Iridium agrega una idea a un
// archivo que una sesión puede estar escribiendo (`docs/trabajo.md` o `ideas.md`). Lee el archivo y su fecha de
// modificación, arma el texto nuevo y lo escribe solo si la fecha no cambió desde que leyó; si cambió, vuelve a leer.
// Del otro lado, las herramientas de edición de Claude Code se niegan a escribir un archivo que cambió desde que lo
// leyeron. Ninguna de las dos pisa a la otra.
import { mkdir, readFile, stat } from 'node:fs/promises'
import { dirname } from 'node:path'
import { escribirAtomico } from './escritura'

const INTENTOS = 3

async function leer(archivo: string): Promise<{ texto: string | null; fecha: number | null }> {
  try {
    const [texto, s] = await Promise.all([readFile(archivo, 'utf8'), stat(archivo)])
    return { texto, fecha: s.mtimeMs }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return { texto: null, fecha: null }
    throw e
  }
}

async function fechaDe(archivo: string): Promise<number | null> {
  try {
    return (await stat(archivo)).mtimeMs
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw e
  }
}

/**
 * Cambia el archivo con `cambiar` (recibe el texto actual, null si no existe) sin pisar una escritura de otro: si el
 * archivo cambió entre la lectura y la escritura, vuelve a empezar, hasta tres veces. `antesDeEscribir` es para las
 * pruebas (simula a la sesión escribiendo en el medio).
 */
export async function cambiarSinPisar<T>(
  archivo: string,
  cambiar: (texto: string | null) => { texto: string; valor: T },
  antesDeEscribir?: () => Promise<void>,
): Promise<T> {
  for (let intento = 1; ; intento++) {
    const { texto, fecha } = await leer(archivo)
    const nuevo = cambiar(texto)
    await antesDeEscribir?.()
    if ((await fechaDe(archivo)) === fecha) {
      await mkdir(dirname(archivo), { recursive: true })
      await escribirAtomico(archivo, nuevo.texto)
      return nuevo.valor
    }
    if (intento >= INTENTOS)
      throw new Error(
        'el archivo cambió mientras se escribía (la IA lo está editando): probá de nuevo en un momento',
      )
  }
}

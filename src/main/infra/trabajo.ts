// Iridium escribe `docs/trabajo.md` sin pisar a la IA (`modulos/orden/diseno-tecnico.md` › Anotar sin la IA, D-130):
// lee, cambia y escribe solo si el archivo sigue como estaba; si cambió en el medio, vuelve a leer.
import { join } from 'node:path'
import { leerSiExiste } from './documentos'
import { escribirAtomico } from './escritura'

export const INTENTOS_TRABAJO = 3

/** Lo que devuelve el cambio: el texto nuevo, o un error que no se reintenta (la idea ya no está, por ejemplo). */
export type CambioTrabajo<T> = { texto: string; dato: T } | { error: string }

export type ResultadoCambioTrabajo<T> = { tipo: 'ok'; dato: T } | { tipo: 'error'; mensaje: string }

/**
 * Aplica `cambiar` al texto de `archivo` (vacío si no existe) y lo escribe solo si, justo antes, el archivo tiene el
 * mismo texto y la misma fecha que al leerlo. Si no, vuelve a empezar, hasta `INTENTOS_TRABAJO` veces.
 */
export async function cambiarConCuidado<T>(
  carpeta: string,
  archivo: string,
  cambiar: (texto: string) => CambioTrabajo<T>,
): Promise<ResultadoCambioTrabajo<T>> {
  for (let intento = 1; intento <= INTENTOS_TRABAJO; intento++) {
    const antes = await leerSiExiste(carpeta, archivo)
    const r = cambiar(antes?.texto ?? '')
    if ('error' in r) return { tipo: 'error', mensaje: r.error }
    if (r.texto === (antes?.texto ?? '')) return { tipo: 'ok', dato: r.dato }
    const ahora = await leerSiExiste(carpeta, archivo)
    if (ahora?.texto !== antes?.texto || ahora?.modificado !== antes?.modificado) continue
    await escribirAtomico(join(carpeta, ...archivo.split('/')), r.texto)
    return { tipo: 'ok', dato: r.dato }
  }
  return {
    tipo: 'error',
    mensaje: `${archivo} cambió ${INTENTOS_TRABAJO} veces mientras se escribía (la IA lo está usando). Prueba de nuevo en un momento.`,
  }
}

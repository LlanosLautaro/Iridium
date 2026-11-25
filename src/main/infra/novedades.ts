// Lo nuevo de una versión en el disco (Q-290, D-192): `novedades.json`, el último commit que se vio en esta PC. Sin él
// (la primera vez), se anota el de ahora sin avisar nada; si está roto, igual.
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { z } from 'zod'
import { type CambioArmado, type Novedades, novedadesDesde, type Visto } from '../../compartido/novedades'
import { escribirAtomico, leerDatos } from './escritura'

const Archivo = z.object({ version: z.literal(1), commit: z.string(), fecha: z.number() })

export function archivoNovedades(archivo: string, armado: { version: string; cambios: CambioArmado[] }) {
  const actual: Visto | null = armado.cambios[0]
    ? { commit: armado.cambios[0].commit, fecha: armado.cambios[0].fecha }
    : null
  const anotar = async (): Promise<void> => {
    if (!actual) return
    await mkdir(dirname(archivo), { recursive: true })
    await escribirAtomico(archivo, `${JSON.stringify({ version: 1, ...actual }, null, 2)}\n`)
  }
  return {
    /** Lo que trae esta versión desde la última vista; null si nada (o la primera vez, que queda anotada). */
    async pendientes(): Promise<Novedades | null> {
      const visto = await leerDatos(archivo, (t) => Archivo.parse(JSON.parse(t))).catch(() => null)
      if (!visto) {
        await anotar()
        return null
      }
      return novedadesDesde({ version: armado.version, cambios: armado.cambios, visto })
    },
    /** Listo en el aviso: lo de esta versión no vuelve a aparecer. */
    vistas: anotar,
  }
}

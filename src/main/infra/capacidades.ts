// `capacidades.json` (Q-287): la última lista de Ajustes › Capacidades, para mostrarla al abrir la sección mientras
// Claude Code dice la nueva, que tarda unos segundos. Es un recuerdo: si no está o está roto, se pide como siempre.
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { z } from 'zod'
import type { CapacidadesSesion } from '../../compartido/capacidades'
import { escribirAtomico, leerDatos } from './escritura'

const Lista = z.object({
  version: z.literal(1),
  complementos: z.array(
    z.object({
      nombre: z.string(),
      autor: z.string().nullable(),
      origen: z.enum(['cuenta', 'iridium']),
      skills: z.number(),
      conectores: z.number(),
    }),
  ),
  conectores: z.array(
    z.object({
      nombre: z.string(),
      estado: z.enum(['conectado', 'falta-sesion', 'falla', 'sin-configurar', 'apagado-afuera']),
    }),
  ),
})

export function archivoCapacidades(archivo: string) {
  let escribiendo: Promise<void> = Promise.resolve()
  return {
    async leer(): Promise<CapacidadesSesion | null> {
      const d = await leerDatos(archivo, (t) => Lista.parse(JSON.parse(t)))
      return d && { complementos: d.complementos, conectores: d.conectores }
    },
    async guardar(lista: CapacidadesSesion): Promise<void> {
      const texto = `${JSON.stringify({ version: 1, ...lista }, null, 2)}\n`
      // Una escritura detrás de la otra: dos listas seguidas (abrir y Conectar) no se pisan.
      escribiendo = escribiendo
        .catch(() => {})
        .then(async () => {
          await mkdir(dirname(archivo), { recursive: true })
          await escribirAtomico(archivo, texto)
        })
      await escribiendo
    },
  }
}

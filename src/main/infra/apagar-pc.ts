// Apagar la PC (T-134, D-195): Windows apaga en un minuto (con su propio aviso, y `shutdown /a` lo cancela) y Iridium se
// cierra como siempre en ese rato, así guarda lo suyo y la versión lista entra antes de que se apague. Cierra los
// programas abiertos sin preguntar (`/f`, el que trae `/t` mayor que cero): si uno quedara pidiendo guardar, la PC no se
// apagaría nunca. En las pruebas nunca apaga: con `IRIDIUM_APAGAR` lo anota en ese archivo; sin él, solo en el registro.
import { execFile } from 'node:child_process'
import { appendFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Cuánto le da Windows a Iridium y a lo demás para cerrarse. */
export const SEGUNDOS_WINDOWS = 60

export interface OpcionesApagar {
  /** `IRIDIUM_APAGAR`: el archivo donde se anota en vez de apagar. */
  anotarEn: string | null
  /** Las pruebas (`IRIDIUM_DATOS`): sin `anotarEn`, no apaga. */
  prueba: boolean
  /** Cierra Iridium sin preguntar, como «Cerrar igual». */
  cerrarIridium: () => void
  registrar: (texto: string) => void
}

export function apagadorDePc(o: OpcionesApagar): () => Promise<void> {
  return async () => {
    if (o.anotarEn) {
      await appendFile(o.anotarEn, `apagar ${new Date().toISOString()}\n`, 'utf8')
      return
    }
    if (o.prueba || process.platform !== 'win32') {
      o.registrar('Apagar al terminar: en una prueba no se apaga')
      return
    }
    const shutdown = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'shutdown.exe')
    await new Promise<void>((listo, falla) =>
      execFile(
        shutdown,
        [
          '/s',
          '/t',
          String(SEGUNDOS_WINDOWS),
          '/c',
          'Iridium: la IA terminó y se apaga la PC, como pediste.',
        ],
        { windowsHide: true },
        (e) => (e ? falla(e) : listo()),
      ),
    )
    o.cerrarIridium()
  }
}

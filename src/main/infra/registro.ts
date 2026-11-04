// El registro de Iridium (05-arquitectura.md › Errores y registros): un archivo por día en `registros/` de los datos
// del Centro, con los arranques, los errores del motor con su motivo y las fallas de lectura; nunca el texto de las
// conversaciones. Los de más de 14 días se borran al arrancar.
import { appendFile, mkdir, readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

export const DIAS_DE_REGISTRO = 14
const DIA = 24 * 3_600_000
const NOMBRE = /^(\d{4})-(\d{2})-(\d{2})\.log$/

const dos = (n: number) => String(n).padStart(2, '0')

/** `2026-10-29.log`, en la fecha local. */
export function nombreDelDia(ms: number): string {
  const f = new Date(ms)
  return `${f.getFullYear()}-${dos(f.getMonth() + 1)}-${dos(f.getDate())}.log`
}

/** Una línea del registro, sin saltos adentro (un motivo de varias líneas queda en una). */
export function lineaDeRegistro(ms: number, texto: string): string {
  const f = new Date(ms)
  return `${dos(f.getHours())}:${dos(f.getMinutes())}:${dos(f.getSeconds())} ${texto.replace(/\s*\r?\n\s*/g, ' · ')}\n`
}

export class Registro {
  /** Las líneas se escriben en orden, de a una. */
  private cola: Promise<unknown> = Promise.resolve()

  constructor(
    private readonly carpeta: string,
    private readonly ahora: () => number = Date.now,
  ) {}

  escribir(texto: string): void {
    const ms = this.ahora()
    this.cola = this.cola
      .then(async () => {
        await mkdir(this.carpeta, { recursive: true })
        await appendFile(join(this.carpeta, nombreDelDia(ms)), lineaDeRegistro(ms, texto), 'utf8')
      })
      .catch(() => {
        // Sin registro no se frena nada: es para revisar después.
      })
  }

  /** Espera a que se escriba lo pendiente (las pruebas y el cierre de la app). */
  listo(): Promise<unknown> {
    return this.cola
  }

  /** Borra los registros de más de 14 días. */
  async limpiar(): Promise<void> {
    let nombres: string[]
    try {
      nombres = await readdir(this.carpeta)
    } catch {
      return
    }
    const limite = this.ahora() - DIAS_DE_REGISTRO * DIA
    await Promise.all(
      nombres.map(async (n) => {
        const m = NOMBRE.exec(n)
        if (!m) return
        const dia = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime()
        if (dia + DIA <= limite) await rm(join(this.carpeta, n), { force: true }).catch(() => {})
      }),
    )
  }
}

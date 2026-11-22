// Las fotos del chat (frente Paridad, PA-2 y PA-3; D-169 › 8 y 9): leerlas para mandarlas, achicar las que pasan los
// límites del motor, las miniaturas y la foto grande para la ventana (que no lee el disco) y las fotos pegadas, que se
// guardan en `pegadas/` de los datos de Iridium hasta mandarlas y se borran solas al abrir si ningún escrito las nombra.
// Qué es cada archivo y cuánto mide se lee del contenido, no del nombre; achicar lo hace Electron (`nativeImage`, que
// entra por `Imagenes`: las pruebas usan otra).
import { randomBytes } from 'node:crypto'
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { CapacidadesMotor } from '../../compartido/comandos'
import type { FotoMotor } from '../motor/motor'

export type MedioFoto = FotoMotor['medio']
type Limites = NonNullable<CapacidadesMotor['fotos']>

/** El tipo de imagen por sus primeros bytes; null si no es una de las cuatro. */
export function medioDe(b: Uint8Array): MedioFoto | null {
  const ascii = (desde: number, n: number) => String.fromCharCode(...b.subarray(desde, desde + n))
  if (b.length >= 8 && b[0] === 0x89 && ascii(1, 3) === 'PNG') return 'image/png'
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (b.length >= 6 && (ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a')) return 'image/gif'
  if (b.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') return 'image/webp'
  return null
}

/** Cuánto mide una imagen, leído de su cabecera; null si no se entiende. */
export function medidasDe(b: Uint8Array): { ancho: number; alto: number } | null {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength)
  const medio = medioDe(b)
  try {
    if (medio === 'image/png') return valido(v.getUint32(16), v.getUint32(20))
    if (medio === 'image/gif') return valido(v.getUint16(6, true), v.getUint16(8, true))
    if (medio === 'image/webp') {
      const trozo = String.fromCharCode(...b.subarray(12, 16))
      if (trozo === 'VP8 ') return valido(v.getUint16(26, true) & 0x3fff, v.getUint16(28, true) & 0x3fff)
      if (trozo === 'VP8L') {
        const [b1 = 0, b2 = 0, b3 = 0, b4 = 0] = b.subarray(21, 25)
        return valido(
          1 + (((b2 & 0x3f) << 8) | b1),
          1 + (((b4 & 0xf) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)),
        )
      }
      if (trozo === 'VP8X') {
        const tres = (i: number) => (b[i] ?? 0) | ((b[i + 1] ?? 0) << 8) | ((b[i + 2] ?? 0) << 16)
        return valido(1 + tres(24), 1 + tres(27))
      }
      return null
    }
    if (medio === 'image/jpeg') {
      // Los segmentos hasta el que dice el tamaño (SOF0 a SOF15, salvo C4, C8 y CC).
      let i = 2
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) return null
        const marca = b[i + 1] ?? 0
        if (marca >= 0xc0 && marca <= 0xcf && marca !== 0xc4 && marca !== 0xc8 && marca !== 0xcc)
          return valido(v.getUint16(i + 7), v.getUint16(i + 5))
        i += 2 + v.getUint16(i + 2)
      }
    }
  } catch {
    // Una cabecera cortada: no se entiende.
  }
  return null
}

function valido(ancho: number, alto: number): { ancho: number; alto: number } | null {
  return ancho > 0 && alto > 0 ? { ancho, alto } : null
}

/** Lo que hace Electron con una imagen PNG o JPEG: achicarla hasta ese lado y pasarla a PNG o a JPEG. */
export interface Imagenes {
  /** null si no la pudo leer. */
  achicar(bytes: Buffer, lado: number, formato: 'png' | 'jpeg'): Buffer | null
}

/** Una foto leída para mandar, o por qué no va (lo dice la ficha al pasar el mouse). */
export type FotoLeida = { tipo: 'ok'; foto: FotoMotor } | { tipo: 'no-va'; motivo: string }

/** Lo que pesa una foto mandada como base64 (lo que cuenta para el límite del motor). */
const enBase64 = (bytes: number) => Math.ceil(bytes / 3) * 4

/**
 * Lee una foto para mandarla (D-169 › 9): si pasa los límites del motor, la achica (a JPEG si hace falta para el peso).
 * Una GIF o una WebP que pasa no se puede achicar: no va, y la ficha lo dice.
 */
export async function leerFoto(ruta: string, limites: Limites, imagenes: Imagenes): Promise<FotoLeida> {
  let bytes: Buffer
  try {
    bytes = await readFile(ruta)
  } catch {
    return { tipo: 'no-va', motivo: `Ya no está en ${ruta}` }
  }
  const medio = medioDe(bytes)
  const medidas = medidasDe(bytes)
  if (!medio || !medidas || !limites.medios.includes(medio))
    return { tipo: 'no-va', motivo: 'No se puede mandar: no es una imagen válida' }
  const lado = Math.max(medidas.ancho, medidas.alto)
  if (enBase64(bytes.length) <= limites.maxBytes && lado <= limites.maxLado)
    return { tipo: 'ok', foto: { medio, datos: bytes.toString('base64') } }
  if (medio === 'image/gif' || medio === 'image/webp')
    return {
      tipo: 'no-va',
      motivo: 'No se puede mandar: es demasiado grande y una GIF o WebP no se puede achicar',
    }
  // Primero a lo que deja el motor, en su formato; si sigue pesando, a JPEG y cada vez más chica.
  let objetivo = Math.min(lado, limites.maxLado)
  let formato: 'png' | 'jpeg' = medio === 'image/png' ? 'png' : 'jpeg'
  for (let intento = 0; intento < 8; intento++) {
    const chica = imagenes.achicar(bytes, objetivo, formato)
    if (!chica) return { tipo: 'no-va', motivo: 'No se puede mandar: no es una imagen válida' }
    if (enBase64(chica.length) <= limites.maxBytes)
      return {
        tipo: 'ok',
        foto: { medio: formato === 'png' ? 'image/png' : 'image/jpeg', datos: chica.toString('base64') },
      }
    if (formato === 'png') formato = 'jpeg'
    else objetivo = Math.round(objetivo * 0.75)
  }
  return { tipo: 'no-va', motivo: 'No se puede mandar: no se pudo achicar lo suficiente' }
}

/** Las miniaturas de las fichas (160 px) y lo más grande que se manda a la ventana para una GIF o WebP. */
const LADO_MINIATURA = 160
const MAX_SIN_ACHICAR = 8 * 2 ** 20
const EXTENSION: Record<MedioFoto, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

/** La foto grande del visor: su `data:`, cuánto mide y cuánto pesa. */
export interface FotoGrande {
  src: string
  ancho: number
  alto: number
  bytes: number
}

export class Fotos {
  constructor(
    /** `pegadas/` en los datos de Iridium. */
    private readonly carpeta: string,
    readonly imagenes: Imagenes,
  ) {}

  /** Guarda una foto pegada (PA-3) y da su ruta; null si los bytes no son una imagen. */
  async guardarPegada(bytes: Uint8Array): Promise<string | null> {
    const medio = medioDe(bytes)
    if (!medio || !medidasDe(bytes)) return null
    await mkdir(this.carpeta, { recursive: true })
    const ruta = join(
      this.carpeta,
      `pegada-${Date.now()}-${randomBytes(3).toString('hex')}.${EXTENSION[medio]}`,
    )
    await writeFile(ruta, bytes)
    return ruta
  }

  /** Si una ruta es de una foto pegada (su nombre, al pasar el mouse: «Imagen pegada»). */
  esPegada(ruta: string): boolean {
    return ruta.toLowerCase().startsWith(join(this.carpeta, 'pegada-').toLowerCase())
  }

  private async imagen(
    ruta: string,
  ): Promise<{ bytes: Buffer; medio: MedioFoto; ancho: number; alto: number } | null> {
    try {
      const info = await stat(ruta)
      if (!info.isFile()) return null
      const bytes = await readFile(ruta)
      const medio = medioDe(bytes)
      const medidas = medidasDe(bytes)
      return medio && medidas ? { bytes, medio, ...medidas } : null
    } catch {
      return null
    }
  }

  /** La miniatura de una foto (160 px), como `data:`; null si no es una imagen o ya no está. */
  async miniatura(ruta: string): Promise<string | null> {
    const i = await this.imagen(ruta)
    if (!i) return null
    if (i.medio === 'image/png' || i.medio === 'image/jpeg') {
      const chica = this.imagenes.achicar(
        i.bytes,
        Math.min(LADO_MINIATURA * 2, Math.max(i.ancho, i.alto)),
        'png',
      )
      return chica ? `data:image/png;base64,${chica.toString('base64')}` : null
    }
    // Una GIF o una WebP la muestra la ventana tal cual, si no es enorme.
    return i.bytes.length <= MAX_SIN_ACHICAR ? `data:${i.medio};base64,${i.bytes.toString('base64')}` : null
  }

  /** La foto entera para el visor; null si no es una imagen o ya no está. */
  async grande(ruta: string): Promise<FotoGrande | null> {
    const i = await this.imagen(ruta)
    if (!i) return null
    return {
      src: `data:${i.medio};base64,${i.bytes.toString('base64')}`,
      ancho: i.ancho,
      alto: i.alto,
      bytes: i.bytes.length,
    }
  }

  /** Al abrir Iridium: borra las pegadas que ningún escrito nombra (ya se mandaron o se sacaron). */
  async limpiar(nombradas: ReadonlySet<string>): Promise<number> {
    let nombres: string[]
    try {
      nombres = await readdir(this.carpeta)
    } catch {
      return 0
    }
    const usadas = new Set([...nombradas].map((r) => r.toLowerCase()))
    let borradas = 0
    for (const n of nombres) {
      const ruta = join(this.carpeta, n)
      if (!n.startsWith('pegada-') || usadas.has(ruta.toLowerCase())) continue
      await rm(ruta, { force: true }).catch(() => {})
      borradas++
    }
    return borradas
  }
}

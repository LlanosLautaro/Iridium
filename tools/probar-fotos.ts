// Prueba real de las fotos del chat (frente Paridad, PA-I2) contra el Claude Code de la PC, con un modelo barato y una
// carpeta descartable: manda una foto con un archivo en su marca, pregunta qué ve y lee la conversación guardada (la
// foto y la marca de Iridium tienen que volver). Gasta un poco de uso.
// Uso: npx jiti tools/probar-fotos.ts <carpeta vacía fuera de este repo> (con `node --experimental-strip-types` no carga
// el motor: sus importaciones van sin extensión).
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { crc32, deflateSync } from 'node:zlib'
import { mensajeConAdjuntos } from '../src/compartido/adjuntos.ts'
import { INSTRUCCION_CENTRO } from '../src/main/core/sesiones.ts'
import type { EventoMotor } from '../src/main/motor/motor.ts'
import { crearMotorSdk } from '../src/main/motor/sdk.ts'

const carpeta = process.argv[2] ?? ''
if (!carpeta) throw new Error('Falta la carpeta de prueba')
await mkdir(carpeta, { recursive: true })

/** Una PNG de un solo color (rojo), de 200×120. */
function pngRoja(ancho: number, alto: number): Buffer {
  const trozo = (tipo: string, datos: Buffer) => {
    const largo = Buffer.alloc(4)
    largo.writeUInt32BE(datos.length)
    const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(cuerpo))
    return Buffer.concat([largo, cuerpo, crc])
  }
  const cabecera = Buffer.alloc(13)
  cabecera.writeUInt32BE(ancho, 0)
  cabecera.writeUInt32BE(alto, 4)
  cabecera[8] = 8
  cabecera[9] = 2
  const fila = ancho * 3 + 1
  const crudo = Buffer.alloc(fila * alto)
  for (let y = 0; y < alto; y++)
    for (let x = 0; x < ancho; x++) crudo.set([220, 20, 30], y * fila + 1 + x * 3)
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', cabecera),
    trozo('IDAT', deflateSync(crudo)),
    trozo('IEND', Buffer.alloc(0)),
  ])
}

const archivo = join(carpeta, 'nota.txt')
await writeFile(archivo, 'La clave de la prueba es: girasol.\n')
const motor = crearMotorSdk({ modelo: 'haiku' })
const t0 = Date.now()
const log = (...a: unknown[]) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a)

const texto = mensajeConAdjuntos(
  { pegados: [], archivos: [archivo] },
  'Mirá la foto y el archivo. Respondé en una línea: el color de la foto y la clave del archivo.',
)
const id = await new Promise<string | null>((listo) => {
  let id: string | null = null
  const s = motor.abrir(
    {
      carpeta,
      conversacion: null,
      instruccion: INSTRUCCION_CENTRO,
      ajuste: { modelo: null, esfuerzo: null },
      tono: null,
    },
    (e: EventoMotor) => {
      if (e.tipo === 'conversacion') id = e.id
      if (e.tipo === 'mensaje') log(JSON.stringify(e.mensaje).slice(0, 300))
      else if (e.tipo === 'turno') log(JSON.stringify(e))
      if (e.tipo === 'cerrada') listo(id)
    },
  )
  s.enviar(texto, [{ medio: 'image/png', datos: pngRoja(200, 120).toString('base64') }])
})
if (id) {
  const [primero] = await motor.mensajes(carpeta, id)
  log(
    'guardado:',
    JSON.stringify({
      ...primero,
      ...(primero?.tipo === 'usuario' && primero.fotos
        ? { fotos: primero.fotos.map((f) => `${f.medio} ${f.datos.length} caracteres`) }
        : {}),
    }),
  )
}

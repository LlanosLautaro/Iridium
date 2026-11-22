// PA-I2 (frente Paridad): archivos y fotos en el chat. Las reglas de los adjuntos (las marcas ida y vuelta), las fotos
// (qué es cada archivo por su contenido, achicar las que pasan los límites, las pegadas y su limpieza), la frontera real
// con muestras del SDK (sin datos del usuario) y la conversación con el motor falso (no abre Claude Code ni gasta uso).
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  adjuntoDeRuta,
  conAdjuntosDespuesDelComando,
  esPegadoLargo,
  leerAdjuntos,
  leerAdjuntosDeComando,
  MAX_ADJUNTOS,
  mensajeConAdjuntos,
  sumarAdjuntos,
  textoLineas,
} from '../src/compartido/adjuntos'
import type { CambioConversacion, Entrada } from '../src/compartido/puente'
import { Conversaciones } from '../src/main/app/conversacion'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { Fotos, type Imagenes, leerFoto, medidasDe, medioDe } from '../src/main/infra/fotos'
import { ArchivoSesiones } from '../src/main/infra/sesiones'
import { AdjuntoPedido, Pedido } from '../src/main/ipc/esquemas'
import { crearMotorFalso, type Motor } from '../src/main/motor/motor'
import { contenidoDe, fotosDe, textoDeUsuario } from '../src/main/motor/sdk'

/** Lo justo de cada formato para que se reconozca y se lea su tamaño (el resto, relleno). */
function png(ancho: number, alto: number, relleno = 16): Buffer {
  const b = Buffer.alloc(24 + relleno)
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0)
  b.writeUInt32BE(13, 8)
  b.write('IHDR', 12, 'ascii')
  b.writeUInt32BE(ancho, 16)
  b.writeUInt32BE(alto, 20)
  return b
}
function gif(ancho: number, alto: number): Buffer {
  const b = Buffer.alloc(16)
  b.write('GIF89a', 0, 'ascii')
  b.writeUInt16LE(ancho, 6)
  b.writeUInt16LE(alto, 8)
  return b
}
function jpeg(ancho: number, alto: number): Buffer {
  const app0 = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, ...Array(14).fill(0)])
  const sof = Buffer.alloc(19)
  sof.writeUInt16BE(0xffc0, 0)
  sof.writeUInt16BE(17, 2)
  sof.writeUInt8(8, 4)
  sof.writeUInt16BE(alto, 5)
  sof.writeUInt16BE(ancho, 7)
  return Buffer.concat([app0, sof])
}
function webp(ancho: number, alto: number): Buffer {
  const b = Buffer.alloc(32)
  b.write('RIFF', 0, 'ascii')
  b.write('WEBPVP8X', 8, 'ascii')
  b.writeUIntLE(ancho - 1, 24, 3)
  b.writeUIntLE(alto - 1, 27, 3)
  return b
}

const LIMITES = {
  medios: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  maxBytes: 5 * 2 ** 20,
  maxLado: 8000,
}

/** Achicar de mentira: anota cada pedido; la PNG sigue pesando mucho, la JPEG pesa poco. */
function imagenesFalsas(pngPesada = false) {
  const pedidos: string[] = []
  const imagenes: Imagenes = {
    achicar(_bytes, lado, formato) {
      pedidos.push(`${formato} ${lado}`)
      return Buffer.alloc(formato === 'png' && pngPesada ? 6 * 2 ** 20 : 1000)
    },
  }
  return { imagenes, pedidos }
}

describe('las reglas de los adjuntos (D-169 › 5, 8 y 11)', () => {
  it('un pegado es largo desde 41 líneas o 2.001 caracteres', () => {
    expect(esPegadoLargo(Array(40).fill('x').join('\n'))).toBe(false)
    expect(esPegadoLargo(Array(41).fill('x').join('\n'))).toBe(true)
    expect(esPegadoLargo('x'.repeat(2000))).toBe(false)
    expect(esPegadoLargo('x'.repeat(2001))).toBe(true)
  })

  it('la ficha de un texto pegado dice sus líneas en singular o plural (PA-I3)', () => {
    expect(textoLineas(1)).toBe('1 línea')
    expect(textoLineas(340)).toBe('340 líneas')
  })

  it('una ruta es foto o archivo por su extensión', () => {
    expect(adjuntoDeRuta('D:\\Capturas\\pantalla.PNG')).toEqual({
      tipo: 'foto',
      ruta: 'D:\\Capturas\\pantalla.PNG',
    })
    expect(adjuntoDeRuta('D:\\Descargas\\registro.log').tipo).toBe('archivo')
    expect(adjuntoDeRuta('D:\\Descargas\\carpeta').tipo).toBe('archivo')
  })

  it('sumar no repite una ruta (sin mirar mayúsculas ni barras) y entran hasta 20', () => {
    const uno = { tipo: 'archivo' as const, ruta: 'D:\\a.txt' }
    expect(sumarAdjuntos([uno], [{ tipo: 'archivo', ruta: 'd:/A.txt' }])).toEqual({
      adjuntos: [uno],
      sobran: 0,
    })
    const muchos = Array.from({ length: 25 }, (_, i) => ({ tipo: 'archivo' as const, ruta: `D:\\${i}.txt` }))
    const r = sumarAdjuntos([], muchos)
    expect(r.adjuntos).toHaveLength(MAX_ADJUNTOS)
    expect(r.sobran).toBe(5)
  })

  it('las marcas ida y vuelta: los pegados, los archivos y lo escrito', () => {
    const pegado = 'Error: <div>roto</div>\n  at main.ts:3'
    const mensaje = mensajeConAdjuntos({ pegados: [pegado], archivos: ['D:\\a.log', 'D:\\b'] }, 'Míralo')
    expect(mensaje).toBe(
      `<iridium-pegado lineas="2">\n${pegado}\n</iridium-pegado>\n\n<iridium-archivos>\nD:\\a.log\nD:\\b\n</iridium-archivos>\n\nMíralo`,
    )
    expect(leerAdjuntos(mensaje)).toEqual({
      pegados: [{ lineas: 2, texto: pegado }],
      archivos: ['D:\\a.log', 'D:\\b'],
      texto: 'Míralo',
    })
  })

  it('una ruta escrita a mano o una marca en el medio del texto no se vuelven fichas', () => {
    const escrito = 'Mirá D:\\a.log\n\n<iridium-archivos>\nD:\\b\n</iridium-archivos>'
    expect(leerAdjuntos(escrito)).toEqual({ pegados: [], archivos: [], texto: escrito })
  })

  it('con un comando, los bloques van después del comando y se leen igual', () => {
    const m = conAdjuntosDespuesDelComando(
      '/mi-skill revisalo\n\n> Revisar R-3',
      { pegados: [], archivos: ['D:\\a.log'] },
      true,
    )
    expect(m).toBe(
      '/mi-skill revisalo\n\n<iridium-archivos>\nD:\\a.log\n</iridium-archivos>\n\n> Revisar R-3',
    )
    expect(leerAdjuntosDeComando(m)).toEqual({
      comando: '/mi-skill revisalo',
      pegados: [],
      archivos: ['D:\\a.log'],
      texto: '> Revisar R-3',
    })
  })

  it('el puente acepta hasta 20 adjuntos con rutas absolutas', () => {
    expect(AdjuntoPedido.safeParse({ tipo: 'foto', ruta: 'D:\\a.png' }).success).toBe(true)
    expect(AdjuntoPedido.safeParse({ tipo: 'foto', ruta: '\\\\servidor\\a.png' }).success).toBe(true)
    expect(AdjuntoPedido.safeParse({ tipo: 'archivo', ruta: 'docs/estado.md' }).success).toBe(false)
    const muchos = Array.from({ length: 21 }, (_, i) => ({ tipo: 'archivo', ruta: `D:\\${i}` }))
    expect(Pedido.safeParse({ adjuntos: muchos.slice(0, 20) }).success).toBe(true)
    expect(Pedido.safeParse({ adjuntos: muchos }).success).toBe(false)
  })
})

describe('las fotos (D-169 › 9)', () => {
  let carpeta: string
  beforeEach(async () => {
    carpeta = await mkdtemp(join(tmpdir(), 'iridium-pa2-fotos-'))
  })
  afterEach(async () => {
    await rm(carpeta, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
  })

  it('reconoce cada formato por su contenido y lee cuánto mide', () => {
    expect([medioDe(png(10, 20)), medidasDe(png(10, 20))]).toEqual(['image/png', { ancho: 10, alto: 20 }])
    expect([medioDe(gif(30, 40)), medidasDe(gif(30, 40))]).toEqual(['image/gif', { ancho: 30, alto: 40 }])
    expect([medioDe(jpeg(1920, 1080)), medidasDe(jpeg(1920, 1080))]).toEqual([
      'image/jpeg',
      { ancho: 1920, alto: 1080 },
    ])
    expect([medioDe(webp(640, 480)), medidasDe(webp(640, 480))]).toEqual([
      'image/webp',
      { ancho: 640, alto: 480 },
    ])
    expect(medioDe(Buffer.from('hola, no soy una foto'))).toBeNull()
  })

  it('una foto que entra va tal cual; una que pasa el lado se achica a lo que deja el motor', async () => {
    const chica = join(carpeta, 'chica.png')
    await writeFile(chica, png(800, 600))
    const { imagenes, pedidos } = imagenesFalsas()
    const r = await leerFoto(chica, LIMITES, imagenes)
    expect(r).toEqual({ tipo: 'ok', foto: { medio: 'image/png', datos: png(800, 600).toString('base64') } })
    expect(pedidos).toEqual([])
    const ancha = join(carpeta, 'ancha.png')
    await writeFile(ancha, png(12000, 3000))
    expect((await leerFoto(ancha, LIMITES, imagenes)).tipo).toBe('ok')
    expect(pedidos).toEqual(['png 8000'])
  })

  it('una PNG que pesa demasiado pasa a JPEG', async () => {
    const pesada = join(carpeta, 'pesada.png')
    await writeFile(pesada, png(3000, 2000, 6 * 2 ** 20))
    const { imagenes, pedidos } = imagenesFalsas(true)
    const r = await leerFoto(pesada, LIMITES, imagenes)
    expect(r.tipo === 'ok' && r.foto.medio).toBe('image/jpeg')
    expect(pedidos).toEqual(['png 3000', 'jpeg 3000'])
  })

  it('una GIF grande, un archivo que no es imagen o uno que ya no está no van, y dicen por qué', async () => {
    const { imagenes } = imagenesFalsas()
    const grande = join(carpeta, 'grande.gif')
    await writeFile(grande, gif(9000, 10))
    expect(await leerFoto(grande, LIMITES, imagenes)).toMatchObject({
      tipo: 'no-va',
      motivo: expect.stringContaining('GIF'),
    })
    const falsa = join(carpeta, 'falsa.png')
    await writeFile(falsa, 'no soy una foto')
    expect(await leerFoto(falsa, LIMITES, imagenes)).toMatchObject({
      tipo: 'no-va',
      motivo: expect.stringContaining('no es una imagen válida'),
    })
    expect(await leerFoto(join(carpeta, 'no-esta.png'), LIMITES, imagenes)).toMatchObject({
      tipo: 'no-va',
      motivo: expect.stringContaining('Ya no está'),
    })
  })

  it('las pegadas se guardan en su carpeta y al abrir se borran las que ningún escrito nombra', async () => {
    const fotos = new Fotos(join(carpeta, 'pegadas'), imagenesFalsas().imagenes)
    expect(await fotos.guardarPegada(Buffer.from('texto'))).toBeNull()
    const una = (await fotos.guardarPegada(png(10, 10))) as string
    const otra = (await fotos.guardarPegada(jpeg(10, 10))) as string
    expect(una).toMatch(/pegada-.*\.png$/)
    expect(otra).toMatch(/pegada-.*\.jpg$/)
    expect(fotos.esPegada(una)).toBe(true)
    expect(fotos.esPegada(join(carpeta, 'otra.png'))).toBe(false)
    expect(await fotos.limpiar(new Set([una]))).toBe(1)
    expect(await readdir(join(carpeta, 'pegadas'))).toEqual([una.split(/[\\/]/).at(-1)])
  })

  it('la miniatura y la foto grande solo salen de una imagen de verdad', async () => {
    const fotos = new Fotos(join(carpeta, 'pegadas'), imagenesFalsas().imagenes)
    const foto = join(carpeta, 'foto.gif')
    await writeFile(foto, gif(30, 40))
    expect(await fotos.miniatura(foto)).toMatch(/^data:image\/gif;base64,/)
    expect(await fotos.grande(foto)).toMatchObject({ ancho: 30, alto: 40, bytes: 16 })
    const texto = join(carpeta, 'secreto.png')
    await writeFile(texto, 'una clave')
    expect(await fotos.miniatura(texto)).toBeNull()
    expect(await fotos.grande(texto)).toBeNull()
  })
})

describe('la frontera real (D-169 › 5 y 6)', () => {
  it('sin fotos el mensaje sale como texto, igual que antes; con fotos, ellas primero', () => {
    expect(contenidoDe('hola', [])).toBe('hola')
    expect(contenidoDe('Mirala', [{ medio: 'image/png', datos: 'AAAA' }])).toEqual([
      { type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'AAAA' } },
      { type: 'text', text: 'Mirala' },
    ])
    expect(contenidoDe('', [{ medio: 'image/jpeg', datos: 'BBBB' }])).toHaveLength(1)
  })

  it('del historial: las fotos y las marcas de Iridium quedan; lo que agrega Claude Code, no', () => {
    const contenido = [
      { type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'AAAA' } },
      {
        type: 'text',
        text: '<ide_opened_file>a.ts</ide_opened_file><iridium-archivos>\nD:\\a.log\n</iridium-archivos>\n\nMirala',
      },
    ]
    expect(fotosDe(contenido)).toEqual([{ medio: 'image/png', datos: 'AAAA' }])
    expect(textoDeUsuario(contenido)).toEqual({
      tipo: 'usuario',
      texto: '<iridium-archivos>\nD:\\a.log\n</iridium-archivos>\n\nMirala',
      cuando: null,
      fotos: [{ medio: 'image/png', datos: 'AAAA' }],
    })
    // Solo una foto, sin texto: igual es un mensaje del usuario.
    expect(textoDeUsuario([contenido[0]])).toMatchObject({ tipo: 'usuario', texto: '' })
  })
})

describe('mandar con adjuntos desde la conversación (PA-2, PA-5, PA-6)', () => {
  let raiz: string
  let alfa: string
  let cambios: CambioConversacion[]
  beforeEach(async () => {
    raiz = await mkdtemp(join(tmpdir(), 'iridium-pa2-'))
    alfa = join(raiz, 'Alfa')
    await mkdir(join(alfa, 'docs'), { recursive: true })
    await writeFile(join(alfa, 'docs', 'estado.md'), '# Estado\n\n## Preguntas abiertas\n(ninguna)\n')
    await writeFile(join(raiz, 'captura.png'), png(800, 600))
    cambios = []
  })
  afterEach(async () => {
    await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
  })

  async function hasta(condicion: () => boolean, ms = 2_000): Promise<void> {
    const fin = Date.now() + ms
    while (!condicion()) {
      if (Date.now() > fin) throw new Error('No pasó a tiempo')
      await new Promise((r) => setTimeout(r, 5))
    }
  }
  const ficha = () => cambios.filter((x) => x.ruta === alfa).at(-1)?.ficha ?? null
  const entradas = (): Entrada[] => cambios.flatMap((x) => x.entradas)

  function armar(motor: Motor = crearMotorFalso({ pasoMs: 5 })) {
    return new Conversaciones({
      motor,
      registro: new ArchivoSesiones(join(raiz, 'datos', 'sesiones.json')),
      preguntas: leerPreguntasAbiertas,
      alCambio: (x) => cambios.push(x),
      leerFoto: (ruta, limites) => leerFoto(ruta, limites, imagenesFalsas().imagenes),
      esPegada: () => false,
    })
  }

  it('la foto va dentro del mensaje y el archivo como su ruta; el hilo muestra las fichas', async () => {
    const motor = crearMotorFalso({ pasoMs: 5 })
    const c = armar(motor)
    const archivo = join(raiz, 'registro.log')
    await c.seguir(alfa, {
      texto: 'Ahí va el error',
      adjuntos: [
        { tipo: 'foto', ruta: join(raiz, 'captura.png') },
        { tipo: 'archivo', ruta: archivo },
      ],
    })
    await hasta(() => ficha()?.estado === 'terminada')
    expect(entradas()[0]).toEqual({
      tipo: 'usuario',
      id: expect.any(String),
      texto: 'Ahí va el error',
      cuando: expect.any(Number),
      adjuntos: [
        {
          tipo: 'foto',
          src: `data:image/png;base64,${png(800, 600).toString('base64')}`,
          nombre: 'captura.png',
        },
        { tipo: 'archivo', ruta: archivo },
      ],
    })
    // La IA falsa dice lo que le llegó.
    expect(entradas().find((e) => e.tipo === 'ia' && e.final)).toMatchObject({
      html: expect.stringContaining('Vi 1 foto, 1 archivo.'),
    })
    // Al reabrir desde ◔ (otra vez Iridium), las mismas fichas.
    const id = cambios.at(-1)?.id as string
    const enviado = (await motor.mensajes(alfa, id))[0]
    expect(enviado).toMatchObject({
      tipo: 'usuario',
      texto: `<iridium-archivos>\n${archivo}\n</iridium-archivos>\n\nAhí va el error`,
      fotos: [{ medio: 'image/png' }],
    })
    const otra = await armar(motor).abrir(alfa)
    expect(otra.entradas[0]).toMatchObject({
      tipo: 'usuario',
      texto: 'Ahí va el error',
      adjuntos: [
        { tipo: 'foto', nombre: null },
        { tipo: 'archivo', ruta: archivo },
      ],
    })
  })

  it('solo con adjuntos sale sin texto, no como «Seguí»', async () => {
    const motor = crearMotorFalso({ pasoMs: 5 })
    const c = armar(motor)
    await c.seguir(alfa, { adjuntos: [{ tipo: 'foto', ruta: join(raiz, 'captura.png') }] })
    await hasta(() => ficha()?.estado === 'terminada')
    expect(entradas()[0]).toMatchObject({ tipo: 'usuario', texto: '', adjuntos: [{ tipo: 'foto' }] })
    const enviado = (await motor.mensajes(alfa, cambios.at(-1)?.id as string))[0]
    expect(enviado).toMatchObject({ texto: '', fotos: [{ medio: 'image/png' }] })
  })

  it('un motor sin fotos recibe la foto como archivo, con su ruta (PA-6)', async () => {
    const c = armar(crearMotorFalso({ pasoMs: 5, fotos: false }))
    const foto = join(raiz, 'captura.png')
    await c.seguir(alfa, { texto: 'Mirala', adjuntos: [{ tipo: 'foto', ruta: foto }] })
    await hasta(() => ficha()?.estado === 'terminada')
    expect(entradas()[0]).toMatchObject({ adjuntos: [{ tipo: 'archivo', ruta: foto }] })
    expect(entradas().find((e) => e.tipo === 'ia' && e.final)).toMatchObject({
      html: expect.stringContaining('Vi 1 archivo.'),
    })
  })

  it('una foto que no se puede leer va como archivo, sin frenar el mensaje', async () => {
    const c = armar()
    const rota = join(raiz, 'rota.png')
    await writeFile(rota, 'no soy una foto')
    await c.seguir(alfa, { texto: 'Mirala', adjuntos: [{ tipo: 'foto', ruta: rota }] })
    await hasta(() => ficha()?.estado === 'terminada')
    expect(entradas()[0]).toMatchObject({ adjuntos: [{ tipo: 'archivo', ruta: rota }] })
  })

  it('un comando de una skill lleva los adjuntos después del comando', async () => {
    const motor = crearMotorFalso({ pasoMs: 5 })
    const c = armar(motor)
    const archivo = join(raiz, 'registro.log')
    await c.seguir(alfa, { texto: '/mi-skill revisalo', adjuntos: [{ tipo: 'archivo', ruta: archivo }] })
    await hasta(() => ficha()?.estado === 'terminada')
    expect(entradas()[0]).toMatchObject({ texto: '/mi-skill revisalo', adjuntos: [{ tipo: 'archivo' }] })
    const enviado = (await motor.mensajes(alfa, cambios.at(-1)?.id as string))[0]
    expect(enviado).toMatchObject({
      texto: `/mi-skill revisalo\n\n<iridium-archivos>\n${archivo}\n</iridium-archivos>`,
    })
    expect(entradas().find((e) => e.tipo === 'ia')).toMatchObject({
      html: expect.stringContaining('Vi 1 archivo.'),
    })
  })

  it('sin sesión iniciada, Reintentar guarda también los adjuntos', async () => {
    const c = new Conversaciones({
      motor: crearMotorFalso({ pasoMs: 5 }),
      registro: new ArchivoSesiones(join(raiz, 'datos', 'sesiones.json')),
      preguntas: leerPreguntasAbiertas,
      alCambio: (x) => cambios.push(x),
      motorListo: async () => ({ tipo: 'sin-sesion' }),
    })
    const adjuntos = [{ tipo: 'archivo' as const, ruta: join(raiz, 'a.log') }]
    await c.seguir(alfa, { texto: 'hola', adjuntos })
    expect(entradas()[0]).toMatchObject({ tipo: 'sin-sesion', reintentar: 'hola', adjuntos })
  })
})

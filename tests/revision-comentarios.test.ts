// R-I2: la sección Revisión del lado de Iridium (diseno-tecnico.md › Sección Revisión, › Enviar ahora, › Que la IA los
// encuentre y los cierre): leer, cerrar y reabrir un `R-n.md`, el mensaje para la IA, Enviar ahora, el contador y la
// instrucción de la sesión.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { leerCitas, mensajeConCitas } from '../src/compartido/citas'
import { armarMensaje, citaComentario, leerMensaje } from '../src/compartido/mensaje-revision'
import type { PedidoComentario } from '../src/compartido/revision'
import { Conversaciones } from '../src/main/app/conversacion'
import { contarRevisionAbiertos, leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { Comentarios, revisionElectron } from '../src/main/app/revision/comentarios'
import { Revision } from '../src/main/app/revision/recibir'
import {
  armarComentario,
  cierreDe,
  conEstado,
  conHistoria,
  fueReabierto,
  leerComentario,
  reabierto,
} from '../src/main/core/revision/comentario'
import { instruccionRevision } from '../src/main/core/sesiones'
import { proyectoAfectado } from '../src/main/core/vigilancia'
import { ArchivoRevision } from '../src/main/infra/revision/datos'
import { ArchivoSesiones } from '../src/main/infra/sesiones'
import { crearMotorFalso, type Motor, type OpcionesSesion } from '../src/main/motor/motor'

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const FECHA = new Date(2026, 9, 29, 14, 32)
const DESPUES = new Date(2026, 9, 29, 15, 5)

function comentario(numero: number, cambios: Partial<Parameters<typeof armarComentario>[0]> = {}): string {
  return armarComentario({
    numero,
    id: `id-${numero}-abcdefgh`,
    texto: 'el botón queda muy pegado al título; separalo',
    archivo: { ruta: 'src/Tarjeta.jsx', linea: 6 },
    componentes: ['Tarjeta', 'App'],
    url: 'http://localhost:5173/ajustes',
    elemento: { etiqueta: 'button', texto: 'Guardar', selector: 'main > button' },
    conCaptura: true,
    fecha: FECHA,
    ...cambios,
  })
}

/** Lo que hace la IA al cerrarlo, a mano (como lo haría con su herramienta de edición). */
const cerrarComoLaIa = (t: string, que: string) =>
  conHistoria(conEstado(t, 'cerrado'), DESPUES, `cerrado por la IA: ${que}`)

describe('El R-n.md: cerrar y reabrir', () => {
  test('cerrar cambia el estado y suma la línea al final de la historia', () => {
    const t = cerrarComoLaIa(comentario(14), 'separó el título con 12 px')
    expect(t).toContain('**Estado:** cerrado')
    expect(t).toMatch(
      /## Historia\n- 2026-10-29 14:32 — dejado\n- 2026-10-29 15:05 — cerrado por la IA: separó/,
    )
    const c = leerComentario('R-14.md', t)
    expect(c?.estado).toBe('cerrado')
    expect(c && cierreDe(c)).toEqual({ fecha: '2026-10-29 15:05', que: 'separó el título con 12 px' })
  })

  test('reabrir vuelve a abierto con la nota en la historia', () => {
    const t = reabierto(cerrarComoLaIa(comentario(3), 'listo'), DESPUES, 'en el celular\nsigue chico')
    const c = leerComentario('R-3.md', t)
    expect(c?.estado).toBe('abierto')
    expect(c?.historia.at(-1)).toEqual({
      fecha: '2026-10-29 15:05',
      texto: 'reabierto: en el celular sigue chico',
    })
    expect(c && fueReabierto(c)).toBe(true)
    expect(c && cierreDe(c)).toBeNull()
  })

  test('sin nota dice solo «reabierto»; sin sección Historia, la crea', () => {
    expect(reabierto(comentario(1), DESPUES, '  ')).toContain('— reabierto\n')
    const sin = '# R-2 — algo\n\n**Estado:** cerrado\n\n## Comentario\nalgo\n'
    const t = reabierto(sin, DESPUES, '')
    expect(t).toMatch(/\*\*Estado:\*\* abierto/)
    expect(t).toMatch(/## Historia\n- 2026-10-29 15:05 — reabierto\n$/)
  })

  test('sumar a la historia respeta lo que viene después de la sección', () => {
    const t = conHistoria(`${comentario(5)}\n## Notas\nalgo\n`, DESPUES, 'enviado a la sesión')
    expect(t).toMatch(/— dejado\n- 2026-10-29 15:05 — enviado a la sesión\n\n## Notas/)
  })
})

describe('El mensaje para la IA (W-R4)', () => {
  test('lleva el código, el texto, dónde y la captura, y la ventana lo reconoce', () => {
    const m = armarMensaje({
      codigo: 'R-14',
      texto: 'el botón queda muy pegado\nal título',
      archivo: { ruta: 'src/Tarjeta.jsx', linea: 6 },
      pagina: 'http://localhost:5173/',
      captura: 'R-14.png',
    })
    expect(m.split('\n')[0]).toBe('[Comentario R-14 de la Revisión · docs/revision/R-14.md]')
    expect(m).toContain('Dónde: src/Tarjeta.jsx, línea 6 · Captura: docs/revision/R-14.png')
    expect(m).toContain('cerralo')
    expect(leerMensaje(m)).toEqual({
      codigo: 'R-14',
      texto: 'el botón queda muy pegado\nal título',
      archivo: { ruta: 'src/Tarjeta.jsx', linea: 6 },
    })
  })

  test('sin archivo va la página; un mensaje común no es un comentario', () => {
    const m = armarMensaje({
      codigo: 'R-2',
      texto: 'no anda',
      archivo: null,
      pagina: 'file:///app',
      captura: null,
    })
    expect(m).toContain('Página: file:///app')
    expect(leerMensaje(m)).toEqual({ codigo: 'R-2', texto: 'no anda', archivo: null })
    expect(leerMensaje('Seguí con el proyecto.')).toBeNull()
    expect(leerMensaje('[Comentario de algo]')).toBeNull()
  })

  test('Mandar a la IA lo cita en la conversación (R-101): sale con lo escrito y el hilo lo reconoce', () => {
    const cita = citaComentario({
      codigo: 'R-7',
      texto: 'el título tiene que ir en negrita\ny más grande',
      archivo: { ruta: 'src/Tarjeta.jsx', linea: 6 },
      pagina: null,
      conCaptura: true,
      maqueta: null,
    })
    expect(cita).toMatchObject({ clave: 'comentario:R-7', tipo: 'Comentario' })
    expect(cita.nombre).toBe('R-7 · el título tiene que ir en negrita')
    expect(cita.texto).toContain('Captura: docs/revision/R-7.png')
    const { citas, texto } = leerCitas(mensajeConCitas([cita], 'Mirá también el color'))
    expect(texto).toBe('Mirá también el color')
    expect(leerMensaje(citas[0] ?? '')).toEqual({
      codigo: 'R-7',
      texto: 'el título tiene que ir en negrita\ny más grande',
      archivo: { ruta: 'src/Tarjeta.jsx', linea: 6 },
    })
  })

  test('la instrucción de la sesión cuenta los abiertos y dice cómo cerrarlos', () => {
    expect(instruccionRevision(0)).toBeNull()
    expect(instruccionRevision(1)).toMatch(/^Hay 1 comentario de la Revisión abierto en docs\/revision\//)
    expect(instruccionRevision(3)).toMatch(/^Hay 3 comentarios .* abiertos/)
    expect(instruccionRevision(3)).toContain('cerrado por la IA')
  })
})

describe('Con carpetas', () => {
  let raiz: string
  let alfa: string
  let carpeta: string
  let enviados: { ruta: string; texto: string }[]
  let abierto: boolean

  beforeEach(async () => {
    raiz = await mkdtemp(join(tmpdir(), 'iridium-rev2-'))
    alfa = join(raiz, 'Alfa')
    carpeta = join(alfa, 'docs', 'revision')
    await mkdir(carpeta, { recursive: true })
    await mkdir(join(alfa, 'src'), { recursive: true })
    await writeFile(join(alfa, 'src', 'Tarjeta.jsx'), 'export {}\n')
    enviados = []
    abierto = true
  })
  afterEach(async () => {
    await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
  })

  const armar = () =>
    new Comentarios({
      sesionAbierta: async () => abierto,
      enviarALaSesion: async (ruta, texto) => {
        enviados.push({ ruta, texto })
      },
      ultimaConexion: async () => '2026-10-29T17:32:00.000Z',
      ahora: () => DESPUES,
    })

  async function tres() {
    await writeFile(join(carpeta, 'R-1.md'), cerrarComoLaIa(comentario(1), 'separó el título'))
    await writeFile(join(carpeta, 'R-1.png'), Buffer.from(PNG, 'base64'))
    await writeFile(join(carpeta, 'R-2.md'), comentario(2, { archivo: { ruta: 'src/Viejo.jsx', linea: 3 } }))
    await writeFile(join(carpeta, 'R-3.md'), comentario(3, { conCaptura: false, archivo: null }))
    await writeFile(join(carpeta, 'R-4.md'), '# algo que no es un comentario\n')
    await writeFile(join(carpeta, 'notas.md'), 'no cuenta')
  }

  test('listar: del más nuevo al más viejo, con lo que falta marcado y los ilegibles aparte', async () => {
    await tres()
    const l = await armar().listar(alfa)
    if (l.tipo !== 'ok') throw new Error(l.mensaje)
    expect(l.comentarios.map((c) => [c.codigo, c.estado])).toEqual([
      ['R-3', 'abierto'],
      ['R-2', 'abierto'],
      ['R-1', 'cerrado'],
    ])
    const [r3, r2, r1] = l.comentarios
    expect(r1).toMatchObject({
      conCaptura: true,
      archivo: { ruta: 'src/Tarjeta.jsx', linea: 6, existe: true },
      cierre: { fecha: '2026-10-29 15:05', que: 'separó el título' },
      dejado: '2026-10-29 14:32',
    })
    expect(r2?.archivo).toEqual({ ruta: 'src/Viejo.jsx', linea: 3, existe: false })
    // R-2 dice que tiene captura, pero no está en el disco.
    expect(r2?.conCaptura).toBe(false)
    expect(r3).toMatchObject({ archivo: null, conCaptura: false, pagina: 'http://localhost:5173/ajustes' })
    expect(l.ilegibles).toEqual(['R-4.md'])
    expect(l.extension).toBe('2026-10-29T17:32:00.000Z')
    expect(l.electron).toEqual({ esElectron: false, cargaLinea: false })
  })

  test('sin carpeta docs/revision: lista vacía, sin error', async () => {
    const l = await armar().listar(join(raiz, 'Otro'))
    expect(l).toMatchObject({ tipo: 'ok', comentarios: [], ilegibles: [] })
  })

  test('la captura llega como data: y solo la del comentario', async () => {
    await tres()
    const c = armar()
    expect(await c.captura(alfa, 'R-1')).toBe(`data:image/png;base64,${PNG}`)
    expect(await c.captura(alfa, 'R-3')).toBeNull()
    await writeFile(join(carpeta, 'R-5.md'), comentario(5).replace('(R-5.png)', '(../../secreto.png)'))
    expect(await c.captura(alfa, 'R-5')).toBeNull()
  })

  test('Enviar ahora con el proyecto abierto: el mensaje va a la sesión y la historia lo anota', async () => {
    await tres()
    expect(await armar().enviar(alfa, 'R-2')).toBe('enviado')
    expect(enviados).toHaveLength(1)
    expect(enviados[0]?.ruta).toBe(alfa)
    expect(leerMensaje(enviados[0]?.texto ?? '')).toMatchObject({ codigo: 'R-2' })
    const t = await readFile(join(carpeta, 'R-2.md'), 'utf8')
    expect(t).toContain('- 2026-10-29 15:05 — enviado a la sesión')
  })

  test('Enviar ahora sin el proyecto abierto: queda guardado y no toca nada', async () => {
    await tres()
    abierto = false
    const antes = await readFile(join(carpeta, 'R-2.md'), 'utf8')
    expect(await armar().enviar(alfa, 'R-2')).toBe('sin-sesion')
    expect(enviados).toEqual([])
    expect(await readFile(join(carpeta, 'R-2.md'), 'utf8')).toBe(antes)
    expect(await armar().enviar(alfa, 'R-99')).toBe('no-existe')
  })

  test('reabrir un cerrado lo pasa a Abiertos', async () => {
    await tres()
    const c = armar()
    await c.reabrir(alfa, 'R-1', 'en el celular sigue chico')
    const l = await c.listar(alfa)
    const r1 = l.tipo === 'ok' ? l.comentarios.find((x) => x.codigo === 'R-1') : null
    expect(r1).toMatchObject({ estado: 'abierto', reabierto: true, cierre: null })
    await expect(c.reabrir(alfa, 'R-77', '')).rejects.toThrow()
  })

  test('el contador de abiertos y la vigilancia de docs/revision', async () => {
    await tres()
    expect(await contarRevisionAbiertos(alfa)).toBe(2)
    expect(await contarRevisionAbiertos(join(raiz, 'Otro'))).toBe(0)
    expect(proyectoAfectado('Alfa/docs/revision/R-3.md')).toBe('Alfa')
    expect(proyectoAfectado('Alfa/docs/revision/R-3.png')).toBeNull()
  })

  test('Electron: se reconoce por el package.json y la línea por ayudante.mjs en el código', async () => {
    expect(await revisionElectron(alfa)).toEqual({ esElectron: false, cargaLinea: false })
    await writeFile(join(alfa, 'package.json'), JSON.stringify({ devDependencies: { electron: '44.0.0' } }))
    expect(await revisionElectron(alfa)).toEqual({ esElectron: true, cargaLinea: false })
    // En node_modules o en docs no cuenta.
    await mkdir(join(alfa, 'node_modules', 'x'), { recursive: true })
    await writeFile(join(alfa, 'node_modules', 'x', 'a.js'), "import('ayudante.mjs')")
    expect((await revisionElectron(alfa)).cargaLinea).toBe(false)
    await mkdir(join(alfa, 'src', 'main'), { recursive: true })
    await writeFile(join(alfa, 'src', 'main', 'index.ts'), "join(APPDATA, 'electron', 'ayudante.mjs')")
    expect(await revisionElectron(alfa)).toEqual({ esElectron: true, cargaLinea: true })
  })

  test('el receptor: con Enviar ahora, guarda y manda; sin él, solo guarda', async () => {
    const pedidos: string[] = []
    const r = new Revision({
      proyectos: async () => [{ nombre: 'Alfa', ruta: alfa }],
      datos: new ArchivoRevision(join(raiz, 'datos', 'revision.json')),
      lineasDelPuerto: async () => [],
      enviar: async (_ruta, codigo) => {
        pedidos.push(codigo)
        return abierto ? 'enviado' : 'sin-sesion'
      },
    })
    const pedido = (enviar: boolean): PedidoComentario => ({
      id: `id-${Math.random().toString(36).slice(2, 12)}`,
      url: 'http://localhost:5173/',
      texto: 'separalo',
      elemento: { etiqueta: 'button', texto: '', selector: 'button', rect: { x: 0, y: 0, w: 1, h: 1 } },
      componentes: [],
      pila: null,
      ventana: { ancho: 800, alto: 600 },
      captura: null,
      proyecto: 'Alfa',
      creado: '2026-10-29T17:32:00.000Z',
      enviar,
    })
    expect(await r.comentario(pedido(false))).toMatchObject({ codigo: 'R-1', envio: null })
    expect(await r.comentario(pedido(true))).toMatchObject({ codigo: 'R-2', envio: 'enviado' })
    abierto = false
    expect(await r.comentario(pedido(true))).toMatchObject({ codigo: 'R-3', envio: 'sin-sesion' })
    expect(pedidos).toEqual(['R-2', 'R-3'])
  })

  test('la sesión de Iridium se abre con los comentarios abiertos en la instrucción (H-R6)', async () => {
    await tres()
    await writeFile(join(alfa, 'docs', 'estado.md'), '# Estado\n\n## Preguntas abiertas\n(ninguna)\n')
    const opciones: OpcionesSesion[] = []
    const base = crearMotorFalso({ pasoMs: 5 })
    const motor: Motor = {
      ...base,
      abrir: (o, f) => {
        opciones.push(o)
        return base.abrir(o, f)
      },
    }
    const c = new Conversaciones({
      motor,
      registro: new ArchivoSesiones(join(raiz, 'datos', 'sesiones.json')),
      preguntas: leerPreguntasAbiertas,
      alCambio: () => {},
      instruccion: async (ruta) => instruccionRevision(await contarRevisionAbiertos(ruta)),
    })
    await c.seguir(alfa, {})
    expect(opciones[0]?.instruccion).toMatch(/Trabajás desde Iridium.* Hay 2 comentarios de la Revisión/)
    c.cerrarTodo()
  })
})

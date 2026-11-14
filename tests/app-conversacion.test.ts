// I-2: los casos de uso de la conversación con el motor falso (no abre Claude Code ni gasta uso).
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { CambioConversacion } from '../src/compartido/puente'
import { Conversaciones } from '../src/main/app/conversacion'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { AVISO_DETENIDA, MENSAJE_SEGUI } from '../src/main/core/sesiones'
import { ArchivoSesiones } from '../src/main/infra/sesiones'
import { crearMotorFalso, type EventoMotor, type Motor } from '../src/main/motor/motor'

let raiz: string
let alfa: string
let beta: string
let cambios: CambioConversacion[]

const estado = (preguntas = '(ninguna)') =>
  `# Estado\n\n## Preguntas abiertas\n${preguntas}\n\n## Próximo paso\nHacer la grilla.\n`

beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-conv-'))
  alfa = join(raiz, 'Alfa')
  beta = join(raiz, 'Beta')
  for (const p of [alfa, beta]) {
    await mkdir(join(p, 'docs'), { recursive: true })
    await writeFile(join(p, 'docs', 'estado.md'), estado('- **Q-1 — ¿Vieja?**'))
  }
  cambios = []
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

/** Espera a que se cumpla algo (los turnos del motor falso tardan unos milisegundos). */
async function hasta(condicion: () => boolean, ms = 2_000): Promise<void> {
  const fin = Date.now() + ms
  while (!condicion()) {
    if (Date.now() > fin) throw new Error('No pasó a tiempo')
    await new Promise((r) => setTimeout(r, 5))
  }
}

function armar(motor: Motor = crearMotorFalso({ pasoMs: 5 })) {
  const registro = new ArchivoSesiones(join(raiz, 'datos', 'sesiones.json'))
  const c = new Conversaciones({
    motor,
    registro,
    preguntas: leerPreguntasAbiertas,
    alCambio: (x) => cambios.push(x),
  })
  return { c, registro, motor }
}

const fichaDe = (ruta: string) => cambios.filter((x) => x.ruta === ruta).at(-1)?.ficha ?? null

describe('Conversaciones', () => {
  it('un proyecto sin conversaciones se abre vacío y sin gastar uso', async () => {
    const { c } = armar()
    const v = await c.abrir(alfa)
    expect(v).toMatchObject({ id: null, entradas: [], anteriores: 0, ficha: null, usadaAfuera: null })
    expect(cambios).toEqual([])
  })

  it('Seguí trabaja y termina; la conversación queda para volver a verla', async () => {
    const { c, registro } = armar()
    await c.seguir(alfa, {})
    expect(fichaDe(alfa)?.estado).toBe('trabajando')
    await hasta(() => fichaDe(alfa)?.estado === 'terminada')

    const v = await c.abrir(alfa)
    expect(v.entradas.map((e) => e.tipo)).toEqual(['usuario', 'herramienta', 'ia', 'herramienta', 'ia'])
    expect(v.entradas[0]).toMatchObject({ tipo: 'usuario', texto: MENSAJE_SEGUI })
    expect(v.entradas[2]).toMatchObject({
      tipo: 'ia',
      html: expect.stringContaining('<code>docs/estado.md</code>'),
    })
    expect(v.origen).toBe('iridium')
    await hasta(() => cambios.length > 0)
    const resumen = v.id ? await registro.de(v.id) : null
    await hasta(() => resumen !== null)
    expect(resumen).toMatchObject({ ruta: alfa, empezadaEn: 'iridium' })
  })

  it('al terminar muestra las preguntas nuevas que dejó y la ficha dice cuántas (H-5)', async () => {
    const motor = crearMotorFalso({
      pasoMs: 5,
      alTurno: async (carpeta) => {
        const ruta = join(carpeta, 'docs', 'estado.md')
        const t = await readFile(ruta, 'utf8')
        await writeFile(ruta, t.replace('- **Q-1', '- **Q-2 — ¿Nueva?**\n  Tipo: prueba · frena\n- **Q-1'))
      },
    })
    const { c } = armar(motor)
    await c.seguir(alfa, {})
    await hasta(() => (fichaDe(alfa)?.preguntas.length ?? 0) > 0)
    expect(fichaDe(alfa)?.preguntas).toEqual([
      { codigo: 'Q-2', pregunta: '¿Nueva?', tipo: 'prueba', frena: true, enPausa: false, frente: null },
    ])
    const ultima = cambios.at(-1)?.entradas.at(-1)
    expect(ultima).toMatchObject({ tipo: 'preguntas', preguntas: [{ codigo: 'Q-2' }] })
  })

  it('Detener frena en el acto y el próximo mensaje se lo avisa a la IA (H-14)', async () => {
    const { c, motor } = armar()
    await c.seguir(alfa, { texto: 'Hacé algo lento' })
    await c.detener(alfa)
    await hasta(() => fichaDe(alfa)?.estado === 'terminada')
    const avisos = cambios.flatMap((x) => x.entradas).filter((e) => e.tipo === 'aviso')
    expect(avisos).toMatchObject([{ clase: 'detenida', texto: 'Detuviste a la IA.' }])

    await c.seguir(alfa, {})
    const ias = () => cambios.flatMap((x) => x.entradas).filter((e) => e.tipo === 'ia').length
    await hasta(() => fichaDe(alfa)?.estado === 'terminada' && ias() === 2)
    const id = cambios.at(-1)?.id as string
    const enviados = (await motor.mensajes(alfa, id)).filter((m) => m.tipo === 'usuario')
    expect(enviados.map((m) => m.tipo === 'usuario' && m.texto)).toEqual([
      'Hacé algo lento',
      `${AVISO_DETENIDA}\n\n${MENSAJE_SEGUI}`,
    ])
    // Lo que se muestra es lo que escribió el usuario, no el aviso.
    const v = await c.abrir(alfa)
    expect(v.entradas.filter((e) => e.tipo === 'usuario').at(-1)).toMatchObject({ texto: MENSAJE_SEGUI })
  })

  it('dos proyectos trabajan a la vez, una sesión por proyecto (H-6, D-015)', async () => {
    const abiertas: string[] = []
    const falso = crearMotorFalso({ pasoMs: 20 })
    const motor: Motor = {
      ...falso,
      abrir: (o, f) => {
        abiertas.push(o.carpeta)
        return falso.abrir(o, f)
      },
    }
    const { c } = armar(motor)
    await Promise.all([c.seguir(alfa, {}), c.seguir(beta, {}), c.seguir(alfa, { texto: 'Y además esto' })])
    expect(c.enMarcha().sort()).toEqual([beta, alfa].sort())
    expect(abiertas.sort()).toEqual([beta, alfa].sort())
    await hasta(() => c.enMarcha().length === 0, 4_000)
    const v = await c.abrir(alfa)
    expect(
      v.entradas.filter((e) => e.tipo === 'usuario').map((e) => e.tipo === 'usuario' && e.texto),
    ).toEqual([MENSAJE_SEGUI, 'Y además esto'])
  })

  it('Nueva empieza otra conversación; la anterior queda guardada', async () => {
    const { c } = armar()
    await c.seguir(alfa, {})
    await hasta(() => fichaDe(alfa)?.estado === 'terminada')
    const primera = cambios.at(-1)?.id
    await c.seguir(alfa, { nueva: true })
    const reinicio = cambios.find((x) => x.reiniciar)
    expect(reinicio?.entradas).toMatchObject([{ tipo: 'usuario', texto: MENSAJE_SEGUI }])
    await hasta(() => fichaDe(alfa)?.estado === 'terminada')
    expect(cambios.at(-1)?.id).not.toBe(primera)
    c.cerrarFicha(alfa)
    expect(fichaDe(alfa)).toBeNull()
  })

  it('una conversación de VS Code usada hace poco se avisa antes de retomarla (D-027)', async () => {
    const motor: Motor = {
      ...crearMotorFalso(),
      conversaciones: async () => [{ id: 'vscode-1', modificada: Date.now() - 3 * 60_000, titulo: 'Hola' }],
      mensajes: async () => [{ tipo: 'usuario', texto: 'Hola desde VS Code', cuando: null }],
    }
    const { c } = armar(motor)
    const v = await c.abrir(alfa)
    expect(v).toMatchObject({ id: 'vscode-1', origen: 'vscode', entradas: [{ texto: 'Hola desde VS Code' }] })
    expect(v.usadaAfuera).not.toBeNull()
  })

  it('una sesión que se cae sin terminar el turno queda en error', async () => {
    let emitir: (e: EventoMotor) => void = () => {}
    const motor: Motor = {
      ...crearMotorFalso(),
      abrir: (_o, f) => {
        emitir = f
        return {
          enviar: () => true,
          ajustar: () => {},
          ponerTono: () => {},
          detener: async () => {},
          cerrar: () => {},
        }
      },
    }
    const { c } = armar(motor)
    await c.seguir(alfa, {})
    emitir({ tipo: 'conversacion', id: 'x' })
    emitir({ tipo: 'cerrada' })
    expect(fichaDe(alfa)).toMatchObject({ estado: 'error', motivo: expect.stringContaining('sin terminar') })
    const avisos = cambios.flatMap((x) => x.entradas).filter((e) => e.tipo === 'aviso')
    expect(avisos.map((a) => a.tipo === 'aviso' && a.clase)).toEqual(['error'])
  })

  it('con algo de fondo, el turno termina esperándolo y la IA retoma sola cuando termina (T-65)', async () => {
    const { c } = armar()
    await c.seguir(alfa, { texto: 'Corré las pruebas de fondo' })
    await hasta(() => fichaDe(alfa)?.estado === 'terminada' && (fichaDe(alfa)?.fondo?.length ?? 0) > 0)
    expect(fichaDe(alfa)?.fondo).toEqual(['Pruebas con la app abierta (de prueba)'])
    // Mientras espera, la sesión sigue abierta: la conversación no se avisa como usada afuera.
    expect((await c.abrir(alfa)).ficha?.fondo).toHaveLength(1)
    const antes = cambios.length
    await hasta(() => cambios.slice(antes).some((x) => x.ficha?.estado === 'trabajando'))
    await hasta(() => fichaDe(alfa)?.estado === 'terminada' && !fichaDe(alfa)?.fondo)
    const textos = cambios.flatMap((x) => x.entradas).map((e) => (e.tipo === 'ia' ? e.html : ''))
    expect(textos.some((t) => t.includes('Terminaron las pruebas de fondo'))).toBe(true)
  })

  it('Detener mientras espera lo de fondo lo corta y cierra la sesión (T-65)', async () => {
    const { c } = armar(crearMotorFalso({ pasoMs: 50 }))
    await c.seguir(alfa, { texto: 'Corré las pruebas de fondo' })
    await hasta(() => (fichaDe(alfa)?.fondo?.length ?? 0) > 0 && fichaDe(alfa)?.estado === 'terminada')
    await c.detener(alfa)
    expect(fichaDe(alfa)).toMatchObject({ estado: 'terminada' })
    expect(fichaDe(alfa)?.fondo).toBeUndefined()
    // No retoma: lo de fondo se cortó.
    const despues = cambios.length
    await new Promise((r) => setTimeout(r, 300))
    expect(cambios.slice(despues).some((x) => x.ficha?.estado === 'trabajando')).toBe(false)
  })

  it('lo que Claude Code escribe al cerrar la sesión, después del turno, no es «usada afuera» (R-54)', async () => {
    let emitir: (e: EventoMotor) => void = () => {}
    let reloj = 1_000_000_000
    let modificada = reloj
    const motor: Motor = {
      ...crearMotorFalso(),
      conversaciones: async () => [{ id: 'x', modificada, titulo: 'Hola' }],
      mensajes: async () => [],
      abrir: (_o, f) => {
        emitir = f
        return {
          enviar: () => true,
          ajustar: () => {},
          ponerTono: () => {},
          detener: async () => {},
          cerrar: () => {},
        }
      },
    }
    const registro = new ArchivoSesiones(join(raiz, 'datos', 'sesiones.json'))
    const armarCon = () =>
      new Conversaciones({
        motor,
        registro,
        preguntas: leerPreguntasAbiertas,
        alCambio: (x) => cambios.push(x),
        ahora: () => reloj,
      })
    const c = armarCon()
    await c.seguir(alfa, { texto: 'Hola' })
    emitir({ tipo: 'conversacion', id: 'x' })
    emitir({ tipo: 'turno', resultado: 'ok', motivo: null, sigue: false })
    await hasta(() => fichaDe(alfa)?.estado === 'terminada')
    // Diez minutos después termina lo de fondo y Claude Code escribe sus últimas líneas al cerrarse.
    reloj += 9 * 60_000
    modificada = reloj
    emitir({ tipo: 'cerrada' })
    await c.detenerTodo()
    reloj += 60_000
    expect((await armarCon().abrir(alfa)).usadaAfuera).toBeNull()
  })
})

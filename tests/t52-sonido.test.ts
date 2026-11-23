// T-52 (D-183): el sonido al terminar. Suena cuando la IA terminó su trabajo de verdad (después de lo que dejó de
// fondo y del control), no en cada turno; se elige y se apaga en Ajustes › Notificaciones.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { CambioConversacion } from '../src/compartido/puente'
import { Conversaciones } from '../src/main/app/conversacion'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { AJUSTE_SONIDO_INICIAL, type FinDeTrabajo, sonidoAlTerminar } from '../src/main/core/sonido'
import { ArchivoConfig } from '../src/main/infra/config'
import { ArchivoSesiones } from '../src/main/infra/sesiones'
import { CambioPreferencias } from '../src/main/ipc/esquemas'
import { crearMotorFalso } from '../src/main/motor/motor'

describe('sonidoAlTerminar', () => {
  const bien: FinDeTrabajo = { resultado: 'ok', fondo: 0, avance: false }

  it('al principio suena la campana cuando la IA termina bien', () => {
    expect(sonidoAlTerminar(AJUSTE_SONIDO_INICIAL, bien)).toBe('campana')
  })

  it('no suena si quedó algo de fondo: la IA todavía espera y retoma sola', () => {
    expect(sonidoAlTerminar(AJUSTE_SONIDO_INICIAL, { ...bien, fondo: 1 })).toBeNull()
  })

  it('no suena si la detuviste o falló', () => {
    expect(sonidoAlTerminar(AJUSTE_SONIDO_INICIAL, { ...bien, resultado: 'detenida' })).toBeNull()
    expect(sonidoAlTerminar(AJUSTE_SONIDO_INICIAL, { ...bien, resultado: 'error' })).toBeNull()
  })

  it('apagado no suena; el elegido es el que suena', () => {
    expect(sonidoAlTerminar({ ...AJUSTE_SONIDO_INICIAL, prendido: false }, bien)).toBeNull()
    expect(sonidoAlTerminar({ ...AJUSTE_SONIDO_INICIAL, cual: 'gota' }, bien)).toBe('gota')
  })

  it('con el avance solo, solo si se prendió', () => {
    expect(sonidoAlTerminar(AJUSTE_SONIDO_INICIAL, { ...bien, avance: true })).toBeNull()
    expect(sonidoAlTerminar({ ...AJUSTE_SONIDO_INICIAL, conAvance: true }, { ...bien, avance: true })).toBe(
      'campana',
    )
  })
})

describe('la conversación avisa cuándo terminó', () => {
  let raiz: string
  let alfa: string
  let cambios: CambioConversacion[]
  let fines: FinDeTrabajo[]

  beforeEach(async () => {
    raiz = await mkdtemp(join(tmpdir(), 'iridium-sonido-'))
    alfa = join(raiz, 'Alfa')
    await mkdir(join(alfa, 'docs'), { recursive: true })
    await writeFile(join(alfa, 'docs', 'estado.md'), '# Estado\n\n## Preguntas abiertas\n(ninguna)\n')
    cambios = []
    fines = []
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

  function armar(control?: () => Promise<null>) {
    return new Conversaciones({
      motor: crearMotorFalso({ pasoMs: 5 }),
      registro: new ArchivoSesiones(join(raiz, 'datos', 'sesiones.json')),
      preguntas: leerPreguntasAbiertas,
      alCambio: (x) => cambios.push(x),
      alTerminar: (_ruta, fin) => fines.push(fin),
      ...(control ? { control } : {}),
    })
  }
  const sonaria = () => fines.filter((f) => sonidoAlTerminar(AJUSTE_SONIDO_INICIAL, f)).length

  it('un turno común: una vez, al terminar (después del control)', async () => {
    let controles = 0
    const c = armar(async () => {
      controles++
      return null
    })
    await c.seguir(alfa, { texto: 'Hola' })
    await hasta(() => fines.length > 0)
    expect(controles).toBe(1)
    expect(fines).toEqual([{ resultado: 'ok', fondo: 0, avance: false }])
    expect(sonaria()).toBe(1)
  })

  it('con pruebas de fondo, no suena al dejarlas corriendo: suena cuando la IA retoma y termina', async () => {
    const c = armar()
    await c.seguir(alfa, { texto: 'Corré las pruebas de fondo' })
    await hasta(() => fines.length === 2)
    expect(fines.map((f) => f.fondo)).toEqual([1, 0])
    expect(sonaria()).toBe(1)
  })

  it('Detener no suena', async () => {
    const c = new Conversaciones({
      motor: crearMotorFalso({ pasoMs: 200 }),
      registro: new ArchivoSesiones(join(raiz, 'datos', 'sesiones.json')),
      preguntas: leerPreguntasAbiertas,
      alCambio: (x) => cambios.push(x),
      alTerminar: (_ruta, fin) => fines.push(fin),
    })
    await c.seguir(alfa, { texto: 'Hola' })
    await c.detener(alfa)
    await hasta(() => fines.length > 0)
    expect(fines[0]?.resultado).toBe('detenida')
    expect(sonaria()).toBe(0)
  })
})

describe('el ajuste guardado', () => {
  let carpeta: string
  beforeEach(async () => {
    carpeta = await mkdtemp(join(tmpdir(), 'iridium-sonido-config-'))
  })
  afterEach(async () => {
    await rm(carpeta, { recursive: true, force: true })
  })

  it('sin él (un config.json de antes) o roto, prendido con la campana', async () => {
    await writeFile(join(carpeta, 'a.json'), JSON.stringify({ version: 1 }))
    expect((await new ArchivoConfig(join(carpeta, 'a.json')).leer()).sonido).toEqual(AJUSTE_SONIDO_INICIAL)
    await writeFile(join(carpeta, 'b.json'), JSON.stringify({ version: 1, sonido: { cual: 'trompeta' } }))
    expect((await new ArchivoConfig(join(carpeta, 'b.json')).leer()).sonido).toEqual(AJUSTE_SONIDO_INICIAL)
  })

  it('se guarda y se vuelve a leer', async () => {
    const archivo = join(carpeta, 'config.json')
    await new ArchivoConfig(archivo).guardar({ sonido: { prendido: true, cual: 'acorde', conAvance: true } })
    expect((await new ArchivoConfig(archivo).leer()).sonido).toEqual({
      prendido: true,
      cual: 'acorde',
      conAvance: true,
    })
  })

  it('el puente no acepta un sonido que no existe', () => {
    expect(
      CambioPreferencias.safeParse({ sonido: { prendido: true, cual: 'trompeta', conAvance: false } })
        .success,
    ).toBe(false)
    expect(
      CambioPreferencias.safeParse({ sonido: { prendido: false, cual: 'gota', conAvance: false } }).success,
    ).toBe(true)
  })
})

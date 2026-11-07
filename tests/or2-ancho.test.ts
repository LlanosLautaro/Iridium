// OR-I2, D-098: la conversación de 360 px (300 en una ventana chica), hasta la mitad, y el ancho de cada vista.
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  anchoDe,
  anchoInicial,
  conAncho,
  PROYECTOS_CON_ANCHO,
  SIN_ANCHOS,
} from '../src/compartido/ancho-conversacion'
import { ArchivoConfig } from '../src/main/infra/config'
import { CambioPreferencias } from '../src/main/ipc/esquemas'

describe('el ancho de la conversación', () => {
  it('arranca en 360 px y en 300 en una ventana de menos de 1100', () => {
    expect(anchoInicial(1440)).toBe(360)
    expect(anchoInicial(1100)).toBe(360)
    expect(anchoInicial(1099)).toBe(300)
    expect(anchoDe(SIN_ANCHOS, 'general', 1440)).toBe(360)
    expect(anchoDe(SIN_ANCHOS, { proyecto: 'C:/P/Alfa' }, 1000)).toBe(300)
  })

  it('cada vista recuerda el suyo: la general, Skills y cada proyecto', () => {
    let a = conAncho(SIN_ANCHOS, 'general', 500)
    a = conAncho(a, 'skills', 420)
    a = conAncho(a, { proyecto: 'C:/P/Alfa' }, 600)
    expect(anchoDe(a, 'general', 1440)).toBe(500)
    expect(anchoDe(a, 'skills', 1440)).toBe(420)
    expect(anchoDe(a, { proyecto: 'C:/P/Alfa' }, 1440)).toBe(600)
    expect(anchoDe(a, { proyecto: 'C:/P/Beta' }, 1440)).toBe(360)
  })

  it('recuerda los últimos proyectos que se cambiaron, no todos', () => {
    let a = SIN_ANCHOS
    for (let i = 0; i <= PROYECTOS_CON_ANCHO; i++) a = conAncho(a, { proyecto: `P${i}` }, 400)
    expect(Object.keys(a.proyectos)).toHaveLength(PROYECTOS_CON_ANCHO)
    expect(a.proyectos.P0).toBeUndefined()
    a = conAncho(a, { proyecto: 'P1' }, 500)
    a = conAncho(a, { proyecto: 'nuevo' }, 500)
    expect(a.proyectos.P1).toBe(500)
    expect(a.proyectos.P2).toBeUndefined()
  })
})

describe('config.json', () => {
  let raiz: string
  beforeEach(async () => {
    raiz = await mkdtemp(join(tmpdir(), 'iridium-ancho-'))
  })
  afterEach(async () => {
    await rm(raiz, { recursive: true, force: true })
  })

  it('el ancho único de antes vale para todas las vistas la primera vez; el de entrada de antes, no', async () => {
    const archivo = join(raiz, 'config.json')
    await writeFile(archivo, JSON.stringify({ anchoConversacion: 520 }))
    const a = (await new ArchivoConfig(archivo).leer()).anchoConversacion
    expect(a).toEqual({ proyectos: {}, otras: 520 })
    expect(anchoDe(a, 'skills', 1440)).toBe(520)
    expect(anchoDe(conAncho(a, 'skills', 380), 'skills', 1440)).toBe(380)

    await writeFile(archivo, JSON.stringify({ anchoConversacion: 440 }))
    const b = (await new ArchivoConfig(archivo).leer()).anchoConversacion
    expect(anchoDe(b, { proyecto: 'C:/P/Alfa' }, 1440)).toBe(360)
  })

  it('guarda los anchos de cada vista y descarta los rotos', async () => {
    const archivo = join(raiz, 'config.json')
    const c = new ArchivoConfig(archivo)
    await c.guardar({ anchoConversacion: { general: 480, proyectos: { 'C:/P/Alfa': 640 } } })
    expect((await new ArchivoConfig(archivo).leer()).anchoConversacion).toEqual({
      general: 480,
      proyectos: { 'C:/P/Alfa': 640 },
    })
    await writeFile(
      archivo,
      JSON.stringify({ anchoConversacion: { general: 5, skills: 'ancho', proyectos: { A: 400, B: 99999 } } }),
    )
    expect((await new ArchivoConfig(archivo).leer()).anchoConversacion).toEqual({ proyectos: { A: 400 } })
  })

  it('lo que llega de la ventana se valida', () => {
    expect(CambioPreferencias.safeParse({ anchoConversacion: { proyectos: { A: 400 } } }).success).toBe(true)
    expect(CambioPreferencias.safeParse({ anchoConversacion: 400 }).success).toBe(false)
    expect(CambioPreferencias.safeParse({ anchoConversacion: { proyectos: {}, general: 200 } }).success).toBe(
      false,
    )
  })
})

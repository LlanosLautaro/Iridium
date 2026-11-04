// D-060: lo escrito en el chat queda guardado, Iridium recuerda el proyecto abierto y el chat de la vista de Proyectos
// trabaja en la carpeta Ideas con su propia instrucción. Con el motor falso (no abre Claude Code ni gasta uso).
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CARPETA_GENERAL } from '../src/compartido/puente'
import { Conversaciones } from '../src/main/app/conversacion'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { INSTRUCCION_CENTRO, INSTRUCCION_GENERAL } from '../src/main/core/sesiones'
import { ArchivoConfig, preferenciasDe } from '../src/main/infra/config'
import { ArchivoEscritos } from '../src/main/infra/escritos'
import { ArchivoSesiones } from '../src/main/infra/sesiones'
import { CambioPreferencias, Escrito } from '../src/main/ipc/esquemas'
import { crearMotorFalso, type Motor } from '../src/main/motor/motor'

let raiz: string

beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-d060-'))
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

describe('lo escrito en el cuadro de la conversación (D-060)', () => {
  it('se guarda por proyecto, sobrevive a cerrar Iridium y vacío se borra', async () => {
    const archivo = join(raiz, 'datos', 'escritos.json')
    const e = new ArchivoEscritos(archivo)
    await e.guardar('C:/Alfa', 'Quiero que el chat\nguarde lo que escribo')
    await e.guardar('C:/Beta', 'Otra cosa')
    // Otra vez la app: lo lee del disco.
    const otra = new ArchivoEscritos(archivo)
    expect(Object.fromEntries(await otra.todos())).toEqual({
      'C:/Alfa': 'Quiero que el chat\nguarde lo que escribo',
      'C:/Beta': 'Otra cosa',
    })
    // Al enviar queda vacío: se borra.
    await otra.guardar('C:/Alfa', '   ')
    expect(Object.fromEntries(await new ArchivoEscritos(archivo).todos())).toEqual({
      'C:/Beta': 'Otra cosa',
    })
  })

  it('un escritos.json roto no frena la app', async () => {
    const archivo = join(raiz, 'escritos.json')
    await writeFile(archivo, '{ roto')
    expect((await new ArchivoEscritos(archivo).todos()).size).toBe(0)
    await new ArchivoEscritos(archivo).guardar('C:/Alfa', 'hola')
    expect(JSON.parse(await readFile(archivo, 'utf8'))).toEqual({
      version: 1,
      escritos: { 'C:/Alfa': 'hola' },
    })
  })

  it('la ventana no puede mandar un texto enorme', () => {
    expect(Escrito.safeParse('x'.repeat(100_000)).success).toBe(true)
    expect(Escrito.safeParse('x'.repeat(100_001)).success).toBe(false)
  })
})

describe('el proyecto abierto al cerrar (D-060)', () => {
  it('se guarda en config.json y al abrir se lee; sin guardar, el inicio', async () => {
    const archivo = join(raiz, 'config.json')
    expect(preferenciasDe(await new ArchivoConfig(archivo).leer()).abierto).toBeNull()
    expect(CambioPreferencias.safeParse({ abierto: 'C:/Alfa' }).success).toBe(true)
    await new ArchivoConfig(archivo).guardar({ abierto: 'C:/Alfa' })
    expect(preferenciasDe(await new ArchivoConfig(archivo).leer()).abierto).toBe('C:/Alfa')
    expect(CambioPreferencias.safeParse({ abierto: null }).success).toBe(true)
    expect(CambioPreferencias.safeParse({ abierto: 3 }).success).toBe(false)
  })

  it('uno roto vuelve al inicio sin perder lo demás', async () => {
    const archivo = join(raiz, 'config.json')
    await writeFile(archivo, JSON.stringify({ abierto: 42, verArchivados: true }))
    const p = preferenciasDe(await new ArchivoConfig(archivo).leer())
    expect(p).toMatchObject({ abierto: null, verArchivados: true })
  })
})

describe('el chat de la vista de Proyectos (D-060)', () => {
  it('trabaja en la carpeta Ideas con la instrucción del chat general; un proyecto, con la del Centro', async () => {
    const ideas = join(raiz, CARPETA_GENERAL)
    const alfa = join(raiz, 'Alfa')
    await mkdir(join(alfa, 'docs'), { recursive: true })
    await mkdir(ideas, { recursive: true })
    await writeFile(join(alfa, 'docs', 'estado.md'), '# Estado\n\n## Preguntas abiertas\n(ninguna)\n')
    const abiertas: { carpeta: string; instruccion: string }[] = []
    const falso = crearMotorFalso({ pasoMs: 2 })
    const motor: Motor = {
      ...falso,
      abrir: (o, f) => {
        abiertas.push({ carpeta: o.carpeta, instruccion: o.instruccion })
        return falso.abrir(o, f)
      },
    }
    const terminadas = new Set<string>()
    const c = new Conversaciones({
      motor,
      registro: new ArchivoSesiones(join(raiz, 'sesiones.json')),
      preguntas: leerPreguntasAbiertas,
      alCambio: (x) => {
        if (x.ficha?.estado === 'terminada') terminadas.add(x.ruta)
      },
      instruccionBase: (ruta) =>
        basename(ruta) === CARPETA_GENERAL ? INSTRUCCION_GENERAL : INSTRUCCION_CENTRO,
    })
    await c.seguir(ideas, { texto: 'Una idea: un lanzador de juegos' })
    await c.seguir(alfa, {})
    const fin = Date.now() + 2000
    while (terminadas.size < 2 && Date.now() < fin) await new Promise((r) => setTimeout(r, 5))
    expect(abiertas).toEqual([
      { carpeta: ideas, instruccion: INSTRUCCION_GENERAL },
      { carpeta: alfa, instruccion: INSTRUCCION_CENTRO },
    ])
    // El chat general conversa: no le pide anotar preguntas en un estado.md que esa carpeta no tiene.
    expect(INSTRUCCION_GENERAL).not.toMatch(/estado\.md/)
    expect(INSTRUCCION_GENERAL).toMatch(/CLAUDE\.md/)
  })
})

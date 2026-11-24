// T-116 (D-184, D-185): las consolas adentro. Las reglas del panel (cómo va cada pestaña, qué se ve dónde, qué cuenta
// la barra, el recorte de lo guardado) y la pieza con una consola de verdad: se le escribe, responde, Detener corta lo
// que corre adentro sin dejar nada vivo y Scripts corre ahí en lugar de abrir una ventana.
import { execSync } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  type ConsolaVista,
  consolasDe,
  detalleDePestana,
  estadoAlTerminar,
  recortarSalida,
  type SalidaConsola,
  textoDeCierre,
  textoDeLaBarra,
} from '../src/compartido/consolas'
import { Consolas } from '../src/main/infra/consolas'
import { ejecutarPlan } from '../src/main/infra/ejecutar'
import { crearMotorSdk } from '../src/main/motor/sdk'

const consola = (c: Partial<ConsolaVista>): ConsolaVista => ({
  id: 'c1',
  nombre: 'Correr las pruebas',
  proyecto: 'D:\\P\\Alfa',
  estado: 'corriendo',
  codigo: null,
  desde: 0,
  ...c,
})

describe('las reglas del panel', () => {
  it('guarda solo las últimas líneas', () => {
    const texto = Array.from({ length: 10 }, (_, i) => `línea ${i}`).join('\n')
    expect(recortarSalida(texto, 3)).toBe('línea 7\nlínea 8\nlínea 9')
    expect(recortarSalida('corta\n', 3)).toBe('corta\n')
    expect(recortarSalida(`${'x\n'.repeat(6000)}fin`).split('\n')).toHaveLength(5000)
  })

  it('al terminar: bien con 0, falló con otro código y detenida si la detuvo el usuario', () => {
    expect(estadoAlTerminar(0, false)).toBe('ok')
    expect(estadoAlTerminar(1, false)).toBe('fallo')
    expect(estadoAlTerminar(1, true)).toBe('detenida')
  })

  it('un proyecto ve las suyas y las de Iridium; el inicio, todas', () => {
    const lista = [
      consola({ id: 'a' }),
      consola({ id: 'b', proyecto: 'D:\\P\\Beta' }),
      consola({ id: 'c', proyecto: null, nombre: 'Iniciar sesión en Claude' }),
    ]
    expect(consolasDe(lista, 'd:\\p\\alfa').map((c) => c.id)).toEqual(['a', 'c'])
    expect(consolasDe(lista, null).map((c) => c.id)).toEqual(['a', 'b', 'c'])
  })

  it('la barra cuenta las que corren y, sin ninguna, las que quedaron para leer', () => {
    expect(textoDeLaBarra([])).toBeNull()
    expect(textoDeLaBarra([consola({}), consola({ id: 'b', estado: 'ok' })])).toEqual({
      texto: '1 corriendo',
      corriendo: true,
    })
    expect(textoDeLaBarra([consola({ estado: 'fallo', codigo: 2 })])).toEqual({
      texto: '1 consola',
      corriendo: false,
    })
  })

  it('cada pestaña dice cómo va', () => {
    expect(detalleDePestana(consola({ estado: 'fallo', codigo: 2 }))).toBe(
      'Correr las pruebas · falló (código 2)',
    )
    expect(detalleDePestana(consola({ estado: 'ok' }))).toBe('Correr las pruebas · terminó bien')
  })

  it('al cerrar con consolas corriendo, la confirmación las nombra (I-10)', () => {
    expect(textoDeCierre([], 1, false)).toEqual({
      titulo: '1 consola corriendo',
      texto: 'Cerrar la detiene: lo que estaba haciendo se corta.',
    })
    expect(textoDeCierre([], 2, true).texto).toBe('Reiniciar las detiene: lo que estaba haciendo se corta.')
    // Con la IA trabajando, el título es de los proyectos y las consolas van al final.
    const ambas = textoDeCierre(['Alfa', 'Beta'], 1, false)
    expect(ambas.titulo).toBe('Alfa y Beta están trabajando')
    expect(ambas.texto).toMatch(/^Cerrar las frena\. .* También se detiene 1 consola corriendo\.$/)
    expect(textoDeCierre(['Alfa'], 0, false)).toEqual({
      titulo: 'Alfa está trabajando',
      texto:
        'Cerrar la frena. Las conversaciones quedan guardadas: con Continuar se retoman y la IA sabe que la detuviste.',
    })
  })

  it('Iniciar sesión en Claude corre en una consola de adentro: si pide pegar un código, se pega ahí', async () => {
    const pedidos: string[][] = []
    const motor = crearMotorSdk({
      rutaClaude: 'C:\\Claude\\claude.exe',
      consola: async (nombre, comando) => {
        pedidos.push([nombre, comando])
      },
    })
    await motor.iniciarSesion()
    expect(pedidos).toEqual([['Iniciar sesión en Claude', '"C:\\Claude\\claude.exe" auth login --claudeai']])
  })
})

/** Cuántos `ping` hay corriendo en la PC. */
const pings = () =>
  execSync('tasklist /FI "IMAGENAME eq PING.EXE" /FO CSV /NH')
    .toString()
    .split('\n')
    .filter((l) => l.includes('PING')).length

const hasta = async (cumple: () => boolean, ms = 15_000) => {
  const fin = Date.now() + ms
  while (!cumple()) {
    if (Date.now() > fin) throw new Error('no pasó a tiempo')
    await new Promise((r) => setTimeout(r, 50))
  }
}

describe.skipIf(process.platform !== 'win32')('la consola de verdad', () => {
  let carpeta: string
  let salida: SalidaConsola[]
  let listas: ConsolaVista[][]
  let consolas: Consolas
  const texto = (id: string) =>
    salida
      .filter((s) => s.id === id)
      .map((s) => s.datos)
      .join('')
      // biome-ignore lint/suspicious/noControlCharactersInRegex: saca las secuencias de color para leer el texto.
      .replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '')

  beforeEach(async () => {
    carpeta = await mkdtemp(join(tmpdir(), 'iridium-consolas-'))
    salida = []
    listas = []
    consolas = new Consolas({ alCambiar: (l) => listas.push(l), alSalir: (s) => salida.push(s) })
  })
  afterEach(async () => {
    consolas.cerrarTodas()
    await rm(carpeta, { recursive: true, force: true })
  })

  it('corre el comando en la carpeta, con lo que imprime, y termina bien', async () => {
    const c = consolas.abrir({ nombre: 'Saludo', proyecto: carpeta, cwd: carpeta, comando: 'echo hola-%CD%' })
    expect(await consolas.esperar(c.id)).toBe(0)
    await hasta(() => texto(c.id).includes('hola-'))
    expect(texto(c.id)).toContain(`hola-${carpeta}`)
    expect(consolas.lista()[0]).toMatchObject({ estado: 'ok', codigo: 0 })
    // Lo guardado es lo mismo que se mandó, y dice hasta dónde llega.
    const g = consolas.guardado(c.id)
    expect(g?.hasta).toBe(salida.filter((s) => s.id === c.id).reduce((n, s) => n + s.datos.length, 0))
  }, 20_000)

  it('un comando que falla queda como falló, con su código', async () => {
    const c = consolas.abrir({ nombre: 'Falla', proyecto: carpeta, cwd: carpeta, comando: 'exit /b 3' })
    expect(await consolas.esperar(c.id)).toBe(3)
    expect(consolas.lista()[0]).toMatchObject({ estado: 'fallo', codigo: 3 })
  }, 20_000)

  it('se le escribe: lo que espera una respuesta la recibe', async () => {
    const c = consolas.abrir({
      nombre: 'Pregunta',
      proyecto: carpeta,
      cwd: carpeta,
      comando: 'set /p R=nombre? && call echo recibido-%R%',
    })
    await hasta(() => texto(c.id).includes('nombre?'))
    consolas.escribir(c.id, 'Alfa\r')
    expect(await consolas.esperar(c.id)).toBe(0)
    await hasta(() => texto(c.id).includes('recibido-Alfa'))
  }, 20_000)

  it('Detener corta lo que corre adentro y no deja nada vivo; la pestaña queda para leer', async () => {
    const antes = pings()
    const c = consolas.abrir({
      nombre: 'Ping',
      proyecto: carpeta,
      cwd: carpeta,
      comando: 'ping -t 127.0.0.1',
    })
    await hasta(() => pings() > antes)
    consolas.detener(c.id)
    await consolas.esperar(c.id)
    expect(consolas.lista()[0]).toMatchObject({ estado: 'detenida' })
    await hasta(() => pings() === antes, 7000)
    // La × la saca de la lista.
    consolas.cerrar(c.id)
    expect(consolas.lista()).toEqual([])
    expect(listas.at(-1)).toEqual([])
  }, 30_000)

  it('Scripts corre un comando en la consola en lugar de abrir una ventana', async () => {
    const abiertas: string[] = []
    const r = await ejecutarPlan(
      { tipo: 'terminal', nombre: 'Saludo', cwd: carpeta, comando: 'echo hola' },
      async () => '',
      undefined,
      {
        proyecto: carpeta,
        abrir: (p) => {
          abiertas.push(p.nombre)
          return consolas.abrir(p)
        },
      },
    )
    expect(r).toEqual({ tipo: 'ok', mensaje: 'Corriendo en la consola de abajo.' })
    expect(abiertas).toEqual(['Saludo'])
    await consolas.esperar(consolas.lista()[0]?.id ?? '')
  }, 20_000)
})

// T-134 (D-195): apagar al terminar cuenta solo con todo quieto, corta la cuenta si una IA vuelve a trabajar y apaga
// una sola vez.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { EstadoApagar } from '../src/compartido/puente'
import { ApagarAlTerminar, CUENTA_MS } from '../src/main/app/apagar'

let ocupadas = 0
let apagadas = 0
let avisos: EstadoApagar[] = []
let apagar: () => Promise<void>

const nuevo = () =>
  new ApagarAlTerminar({
    ocupadas: () => ocupadas,
    apagar: () => apagar(),
    alCambio: (e) => avisos.push(e),
  })

beforeEach(() => {
  vi.useFakeTimers()
  ocupadas = 0
  apagadas = 0
  avisos = []
  apagar = async () => {
    apagadas++
  }
})
afterEach(() => vi.useRealTimers())

/** Una IA trabaja un turno y termina. */
const trabajaYTermina = (a: ApagarAlTerminar) => {
  ocupadas = 1
  a.revisar()
  ocupadas = 0
  a.revisar()
}

describe('apagar al terminar', () => {
  it('sin armar no hace nada aunque todo esté quieto', async () => {
    const a = nuevo()
    a.revisar()
    await vi.advanceTimersByTimeAsync(CUENTA_MS * 2)
    expect(apagadas).toBe(0)
    expect(avisos).toEqual([])
  })

  it('armado con una IA trabajando espera; al terminar cuenta un minuto y apaga una vez', async () => {
    ocupadas = 1
    const a = nuevo()
    a.poner(true)
    expect(a.estado()).toMatchObject({ armado: true, apagaEn: null, esperando: 1 })
    await vi.advanceTimersByTimeAsync(CUENTA_MS * 2)
    expect(apagadas).toBe(0)

    ocupadas = 0
    a.revisar()
    expect(a.estado().apagaEn).not.toBeNull()
    await vi.advanceTimersByTimeAsync(CUENTA_MS - 1000)
    expect(apagadas).toBe(0)
    await vi.advanceTimersByTimeAsync(1000)
    expect(apagadas).toBe(1)
    expect(a.estado().armado).toBe(false)
    a.revisar()
    await vi.advanceTimersByTimeAsync(CUENTA_MS * 2)
    expect(apagadas).toBe(1)
  })

  it('armado con todo quieto no cuenta: espera a que una IA trabaje y termine (Q-296)', async () => {
    const a = nuevo()
    a.poner(true)
    expect(a.estado()).toMatchObject({ armado: true, apagaEn: null })
    await vi.advanceTimersByTimeAsync(CUENTA_MS * 5)
    a.revisar()
    expect(apagadas).toBe(0)
    expect(a.estado().apagaEn).toBeNull()
    ocupadas = 1
    a.revisar()
    ocupadas = 0
    a.revisar()
    expect(a.estado().apagaEn).not.toBeNull()
    await vi.advanceTimersByTimeAsync(CUENTA_MS)
    expect(apagadas).toBe(1)
  })

  it('si una IA vuelve a trabajar durante la cuenta, la corta y vuelve a contar al terminar', async () => {
    const a = nuevo()
    a.poner(true)
    trabajaYTermina(a)
    await vi.advanceTimersByTimeAsync(CUENTA_MS / 2)
    ocupadas = 1
    a.revisar()
    expect(a.estado().apagaEn).toBeNull()
    await vi.advanceTimersByTimeAsync(CUENTA_MS * 2)
    expect(apagadas).toBe(0)
    ocupadas = 0
    a.revisar()
    await vi.advanceTimersByTimeAsync(CUENTA_MS)
    expect(apagadas).toBe(1)
  })

  it('desarmar durante la cuenta no apaga', async () => {
    const a = nuevo()
    a.poner(true)
    trabajaYTermina(a)
    await vi.advanceTimersByTimeAsync(CUENTA_MS / 2)
    a.poner(false)
    await vi.advanceTimersByTimeAsync(CUENTA_MS * 2)
    expect(apagadas).toBe(0)
    expect(avisos.at(-1)).toMatchObject({ armado: false, apagaEn: null })
  })

  it('si Windows no deja apagar, queda desarmado y lo dice', async () => {
    apagar = () => Promise.reject(new Error('acceso denegado'))
    const a = nuevo()
    a.poner(true)
    trabajaYTermina(a)
    await vi.advanceTimersByTimeAsync(CUENTA_MS)
    expect(a.estado().armado).toBe(false)
    expect(avisos.at(-1)?.fallo).toBeTruthy()
  })

  it('a la ventana no le manda lo mismo dos veces mientras la IA trabaja', () => {
    ocupadas = 1
    const a = nuevo()
    a.poner(true)
    const antes = avisos.length
    for (let i = 0; i < 20; i++) a.revisar()
    expect(avisos.length).toBe(antes)
  })
})

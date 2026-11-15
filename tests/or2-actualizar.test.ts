// OR-I2, Actualizar (R-12, T-46, 04-ux.md › W-1 y F-7): los estados del botón único y lo que lee la vigía del armado
// (desde cuándo arma, por qué falló, Cancelar).
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  actualizarSolo,
  estadoActualizar,
  queHacerSolo,
  SOLO,
  tiempoArmando,
} from '../src/compartido/actualizar'
import type { SinArmar, VersionNueva } from '../src/compartido/puente'
import { leerFalloArmado, marcaDeArmado, VigiaSinArmar } from '../src/main/infra/sin-armar'

const base: SinArmar = {
  carpeta: 'C:\\Iridium',
  pendiente: null,
  armando: false,
  desde: null,
  fallo: null,
  limpio: true,
  retenido: null,
}
const pendiente = { commit: 'abc1234', mensaje: 'Orden: Actualizar' }
const version: VersionNueva = {
  fecha: '2026-11-06T14:05:00',
  commit: 'abc1234',
  mensaje: 'Orden: Actualizar',
  sinGuardar: false,
  noEntro: null,
}

describe('el estado del botón', () => {
  it('al día: nada que mostrar', () => {
    expect(estadoActualizar({ sinArmar: base, version: null, iaTrabajando: false })).toEqual({
      tipo: 'al-dia',
    })
    expect(estadoActualizar({ sinArmar: null, version: null, iaTrabajando: false })).toEqual({
      tipo: 'al-dia',
    })
  })

  it('con cambios sin armar: disponible, arma antes, con el detalle', () => {
    expect(
      estadoActualizar({ sinArmar: { ...base, pendiente }, version: null, iaTrabajando: false }),
    ).toEqual({
      tipo: 'disponible',
      lista: false,
      detalle: 'Trae «Orden: Actualizar» (abc1234) y lo anterior que falte',
    })
  })

  it('con una versión lista (armada o bajada de GitHub): disponible, solo reinicia', () => {
    const e = estadoActualizar({ sinArmar: null, version, iaTrabajando: false })
    expect(e).toMatchObject({ tipo: 'disponible', lista: true })
    expect(e.tipo === 'disponible' && e.detalle).toBe(
      'Trae «Orden: Actualizar» (abc1234), armada el 6 nov 2026, 14:05',
    )
    // Si ya no entró una vez, el motivo va en el detalle.
    const noEntro = { fecha: '2026-11-06T18:30:00', motivo: 'Windows no soltó la carpeta.' }
    const otra = estadoActualizar({ sinArmar: null, version: { ...version, noEntro }, iaTrabajando: false })
    expect(otra.tipo === 'disponible' && otra.detalle).toMatch(
      /El 6 nov 2026, 18:30 no entró: Windows no soltó/,
    )
  })

  it('armando gana a todo, con desde cuándo', () => {
    const s = { ...base, pendiente, armando: true, desde: 1000 }
    expect(estadoActualizar({ sinArmar: s, version, iaTrabajando: true })).toEqual({
      tipo: 'armando',
      desde: 1000,
    })
  })

  it('falló: con el motivo, mientras siga habiendo algo sin armar', () => {
    const fallo = { fecha: '2026-11-06T14:05:00', motivo: 'No se pudo armar. Iridium quedó como estaba.' }
    expect(
      estadoActualizar({ sinArmar: { ...base, pendiente, fallo }, version: null, iaTrabajando: false }),
    ).toEqual({ tipo: 'fallo', motivo: fallo.motivo })
    // Ya armado por otro lado (main al día): el fallo viejo no se muestra.
    expect(estadoActualizar({ sinArmar: { ...base, fallo }, version: null, iaTrabajando: false }).tipo).toBe(
      'al-dia',
    )
  })

  it('con la IA de Iridium trabajando, no arma (bloqueado); con una versión lista sí reinicia', () => {
    expect(
      estadoActualizar({ sinArmar: { ...base, pendiente }, version: null, iaTrabajando: true }).tipo,
    ).toBe('bloqueado')
    expect(estadoActualizar({ sinArmar: base, version, iaTrabajando: true }).tipo).toBe('disponible')
  })

  it('cuánto lleva armando', () => {
    expect(tiempoArmando(null, 0)).toBe('')
    expect(tiempoArmando(0, 30_000)).toBe('menos de un minuto')
    expect(tiempoArmando(0, 12 * 60_000 + 5)).toBe('12 min')
  })
})

describe('Actualizar solo (T-67)', () => {
  const libre = { iaIridiumOcupada: false, algunaOcupada: false, fallido: null }

  it('arma con commits sin armar, sin cambios a medias y la IA de Iridium libre', () => {
    expect(queHacerSolo({ ...libre, sinArmar: { ...base, pendiente }, version: null })).toBe('armar')
    // Con una versión lista vieja y un commit nuevo, arma antes de reiniciar.
    expect(queHacerSolo({ ...libre, sinArmar: { ...base, pendiente }, version })).toBe('armar')
  })

  it('no arma con cambios sin commitear, con la IA de Iridium trabajando o esperando, ni mientras arma', () => {
    const s = { ...base, pendiente }
    expect(queHacerSolo({ ...libre, sinArmar: { ...s, limpio: false }, version: null })).toBeNull()
    expect(queHacerSolo({ ...libre, iaIridiumOcupada: true, sinArmar: s, version: null })).toBeNull()
    expect(queHacerSolo({ ...libre, sinArmar: { ...s, armando: true }, version })).toBeNull()
  })

  it('no reintenta solo el commit que ya falló; con otro commit, sí', () => {
    const fallo = { fecha: '2026-11-15T10:00:00', motivo: 'No se pudo armar.' }
    const s = { ...base, pendiente, fallo }
    expect(queHacerSolo({ ...libre, fallido: 'abc1234', sinArmar: s, version: null })).toBeNull()
    expect(queHacerSolo({ ...libre, fallido: 'zzz0000', sinArmar: s, version: null })).toBe('armar')
  })

  it('no arma lo que `pnpm volver` dejó afuera; con un commit nuevo, sí', () => {
    const s = { ...base, pendiente, retenido: 'abc1234' }
    expect(queHacerSolo({ ...libre, sinArmar: s, version: null })).toBeNull()
    expect(queHacerSolo({ ...libre, sinArmar: { ...s, retenido: 'zzz0000' }, version: null })).toBe('armar')
  })

  it('reinicia con la versión lista solo si ninguna IA trabaja ni espera, y no si ya no entró una vez', () => {
    expect(queHacerSolo({ ...libre, sinArmar: base, version })).toBe('reiniciar')
    expect(queHacerSolo({ ...libre, sinArmar: null, version })).toBe('reiniciar')
    expect(queHacerSolo({ ...libre, algunaOcupada: true, sinArmar: base, version })).toBeNull()
    const noEntro = { fecha: '2026-11-06T18:30:00', motivo: 'Windows no soltó la carpeta.' }
    expect(queHacerSolo({ ...libre, sinArmar: base, version: { ...version, noEntro } })).toBeNull()
    expect(queHacerSolo({ ...libre, sinArmar: base, version: null })).toBeNull()
  })

  it('prendido salvo con «no»; un número es la espera de las pruebas, sin esperar a la PC quieta', () => {
    expect(actualizarSolo(undefined)).toEqual(SOLO)
    expect(actualizarSolo('no')).toBeNull()
    expect(actualizarSolo('500')).toEqual({ esperaMs: 500, quietoSeg: 0 })
    expect(actualizarSolo('cualquier cosa')).toEqual(SOLO)
  })
})

describe('la vigía del armado', () => {
  let carpeta: string
  let release: string
  beforeEach(async () => {
    carpeta = await mkdtemp(join(tmpdir(), 'iridium-actualizar-'))
    release = join(carpeta, 'release')
    await mkdir(release, { recursive: true })
  })
  afterEach(async () => {
    await rm(carpeta, { recursive: true, force: true, maxRetries: 5 })
  })

  it('lee desde cuándo arma y, si el proceso ya no está, lo toma como un armado cortado', async () => {
    await writeFile(
      join(release, 'armando.json'),
      `\uFEFF${JSON.stringify({ pid: process.pid, desde: '2026-11-06T14:05:00' })}`,
    )
    expect(await marcaDeArmado(release)).toEqual({
      estado: 'vivo',
      pid: process.pid,
      desde: Date.parse('2026-11-06T14:05:00'),
    })
    expect(await leerFalloArmado(release)).toBeNull()
    await writeFile(join(release, 'armando.json'), JSON.stringify({ pid: 999_999_9 }))
    expect((await marcaDeArmado(release))?.estado).toBe('cortado')
    expect((await leerFalloArmado(release))?.motivo).toBe('El armado se cortó antes de terminar.')
  })

  it('el motivo que dejó el script', async () => {
    const motivo = { fecha: '2026-11-06T14:05:00', motivo: 'No se pudo armar. Iridium quedó como estaba.' }
    await writeFile(join(release, 'armado-fallo.json'), `\uFEFF${JSON.stringify(motivo)}`)
    expect(await leerFalloArmado(release)).toEqual(motivo)
  })

  it('armar borra el fallo anterior y queda armando; Cancelar corta el proceso y su marca', async () => {
    await writeFile(join(release, 'armado-fallo.json'), JSON.stringify({ fecha: 'x', motivo: 'viejo' }))
    // Un «script» que deja su marca y se queda esperando, como `actualizar.ps1` mientras arma.
    const script = join(carpeta, 'armar.mjs')
    await writeFile(
      script,
      `import { writeFileSync } from 'node:fs'
writeFileSync(${JSON.stringify(join(release, 'armando.json'))}, JSON.stringify({ pid: process.pid, desde: new Date().toISOString() }))
setInterval(() => {}, 1000)`,
    )
    const vigia = new VigiaSinArmar(carpeta, release, `node "${script}"`)
    expect(await vigia.armar()).toEqual({ tipo: 'ok', mensaje: 'Armando.' })
    expect(vigia.ultimo()).toMatchObject({ armando: true, fallo: null })
    await expect.poll(() => marcaDeArmado(release), { timeout: 10_000 }).toMatchObject({ estado: 'vivo' })
    expect(await leerFalloArmado(release)).toBeNull()
    expect(vigia.consola()).toBe(join(release, 'armado.log'))
    const marca = await marcaDeArmado(release)

    await vigia.cancelar()
    expect(await marcaDeArmado(release)).toBeNull()
    expect(vigia.ultimo()).toMatchObject({ armando: false, fallo: null })
    expect(() => process.kill(marca?.pid ?? 0, 0)).toThrow()
  }, 30_000)
})

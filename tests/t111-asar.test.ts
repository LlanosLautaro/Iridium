// T-111: dentro de Electron, `node:fs` trata cada `.asar` como una carpeta. El actualizador de la copia compartida
// listaba los archivos de adentro de `app.asar` (la huella nunca coincidía con la publicada) y no podía borrar una
// versión a medio bajar (EBUSY), así que la copia no se actualizaba más. Con `fsReal` (original-fs) ve el disco.
import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import electron from 'electron'
import { describe, expect, it } from 'vitest'

describe('las piezas dentro de Electron', () => {
  it('una versión con app.asar se lista como está en el disco y se borra entera', async () => {
    const version = async () => {
      const carpeta = await mkdtemp(join(tmpdir(), 'iridium-asar-'))
      await mkdir(join(carpeta, 'resources'))
      // Un `.asar` de verdad: el que trae Electron.
      await copyFile(
        join(dirname(electron as unknown as string), 'resources', 'default_app.asar'),
        join(carpeta, 'resources', 'app.asar'),
      )
      await writeFile(join(carpeta, 'Iridium.exe'), 'programa')
      return carpeta
    }
    const [carpeta, otra] = [await version(), await version()]
    const salida = execFileSync(
      electron as unknown as string,
      [resolve('tests/muestras/piezas-en-electron.mjs'), resolve('src/main/infra/piezas.ts'), carpeta, otra],
      { env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }, encoding: 'utf8' },
    )
    const r = JSON.parse(salida.trim().split('\n').pop() ?? '{}')
    expect(r.electron).toBe(true)
    // El `fs` de Electron ve adentro del `.asar`: lo que hacía fallar la huella.
    expect(r.conAsar).toBeGreaterThan(2)
    expect(r.archivos).toEqual(['Iridium.exe', 'resources/app.asar'])
    expect(r.borrada).toBe(true)
    await rm(otra, { recursive: true, force: true })
  })
})

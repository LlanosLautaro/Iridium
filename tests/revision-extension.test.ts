// La extensión en su carpeta fija (infra/revision/extension.ts): se copia cuando cambia y el ayudante de Electron la
// carga recién después. Antes se cargaba mientras se copiaba y F8 no andaba en la primera apertura (Q-74).
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { despuesDeCopiar, instalarExtension } from '../src/main/infra/revision/extension'

let base: string
beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-ext-'))
})
afterEach(async () => {
  await rm(base, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

async function armada(carpeta: string, compilacion: string): Promise<void> {
  await mkdir(join(carpeta, 'js'), { recursive: true })
  await writeFile(join(carpeta, 'compilacion.txt'), compilacion)
  await writeFile(join(carpeta, 'manifest.json'), '{}')
  await writeFile(join(carpeta, 'js', 'selector.js'), `// ${compilacion}`)
}

describe('la carpeta de la extensión', () => {
  test('el ayudante se carga recién cuando la copia terminó, y la encuentra entera', async () => {
    const origen = join(base, 'armada')
    const destino = join(base, 'extension')
    await armada(origen, 'v1')
    await instalarExtension(origen, destino)
    await armada(origen, 'v2')

    let soltar: () => void = () => {}
    const espera = new Promise<void>((r) => {
      soltar = r
    })
    const copia = espera.then(() => instalarExtension(origen, destino))
    const vio: string[][] = []
    const carga = despuesDeCopiar(copia, async () => {
      vio.push(await readdir(join(destino, 'js')))
    })
    await new Promise((r) => setTimeout(r, 30))
    expect(vio).toEqual([]) // mientras la copia no termina, no carga
    soltar()
    await carga
    expect(vio).toEqual([['selector.js']])
  })

  test('si la copia falla, el ayudante se carga igual (con lo que haya)', async () => {
    let cargo = false
    await despuesDeCopiar(Promise.reject(new Error('sin permiso')), async () => {
      cargo = true
    })
    expect(cargo).toBe(true)
  })

  test('si cargar falla, no rompe el arranque', async () => {
    await expect(
      despuesDeCopiar(Promise.resolve(), async () => {
        throw new Error('sin Iridium')
      }),
    ).resolves.toBeUndefined()
  })
})

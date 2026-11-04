// Copiado de la app anterior de proyectos (D-026).
// Eliminar con carpetas temporales falsas y una papelera falsa. Nunca sobre los proyectos reales.
import { mkdir, mkdtemp, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ejecutarEliminacion, medirRegenerables, prepararEliminacion } from '../../src/main/app/eliminacion'

let base: string
let raiz: string
let tacho: string
const proyecto = () => join(raiz, 'Alfa')

async function archivo(relativa: string, contenido = 'x') {
  const ruta = join(proyecto(), relativa)
  await mkdir(dirname(ruta), { recursive: true })
  await writeFile(ruta, contenido)
}

/** Papelera falsa: mueve a otra carpeta y anota qué recibió. */
function papeleraFalsa(fallaConCarpetaEntera = false) {
  const recibidos: string[] = []
  const papelera = async (ruta: string) => {
    if (fallaConCarpetaEntera && ruta === proyecto()) {
      const quedan = await readdir(ruta)
      if (quedan.length > 0) throw new Error('La función no es compatible')
    }
    recibidos.push(ruta)
    await rename(ruta, join(tacho, `${recibidos.length}-${basename(ruta)}`))
  }
  return { papelera, recibidos }
}

beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'gestor-eliminar-'))
  raiz = join(base, 'PROYECTOS')
  tacho = join(base, 'papelera')
  await mkdir(raiz)
  await mkdir(tacho)
  await mkdir(proyecto())
  await mkdir(join(raiz, 'Beta'))
})
afterEach(async () => {
  await rm(base, { recursive: true, force: true })
})

describe('prepararEliminacion', () => {
  it('separa lo regenerable (con tamaño) de lo que va a la papelera', async () => {
    await archivo('package.json', '{}')
    await archivo('.gitignore', 'dist/\n')
    await archivo('src/index.ts', '12345')
    await archivo('node_modules/react/index.js', 'abcdefghij')
    await archivo('dist/main.js', 'abc')
    await archivo('out/main.js', 'no está en el .gitignore')
    await archivo('.git/HEAD', 'ref')

    const r = await prepararEliminacion(raiz, proyecto(), undefined)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.nombre).toBe('Alfa')
    expect(r.plan.regenerables).toEqual([
      { relativa: 'dist', bytes: null },
      { relativa: 'node_modules', bytes: null },
    ])
    const medido = await medirRegenerables(r.ruta, r.plan)
    expect(medido.regenerables).toEqual([
      { relativa: 'dist', bytes: 3 },
      { relativa: 'node_modules', bytes: 10 },
    ])
    // package.json, .gitignore, src/index.ts y out/main.js; .git no se recorre.
    expect(r.plan.papelera.archivos).toBe(4)
    expect(r.plan.papelera.conGit).toBe(true)
  })

  it('encuentra node_modules en subcarpetas, sin entrar en las ya encontradas', async () => {
    await archivo('web/package.json', '{}')
    await archivo('web/node_modules/a/node_modules/b/index.js')
    await archivo('node_modules/suelto.js')
    const r = await prepararEliminacion(raiz, proyecto(), undefined)
    if (!r.ok) throw new Error(r.mensaje)
    // El node_modules de la raíz no tiene package.json al lado: va a la papelera.
    expect(r.plan.regenerables.map((x) => x.relativa)).toEqual(['web/node_modules'])
  })

  it('dentro de un node_modules que no se borra no busca regenerables (app ya empaquetada)', async () => {
    await archivo('.gitignore', 'build/')
    await archivo('release/app/node_modules/watcher/package.json', '{}')
    await archivo('release/app/node_modules/watcher/build/w.node')
    const r = await prepararEliminacion(raiz, proyecto(), undefined)
    if (!r.ok) throw new Error(r.mensaje)
    expect(r.plan.regenerables).toEqual([])
    expect(r.plan.papelera.archivos).toBe(3)
  })

  it('no deja eliminar el proyecto abierto en la ventana, ni uno fuera de la raíz', async () => {
    const abierto = await prepararEliminacion(raiz, proyecto(), join(proyecto(), 'src'))
    expect(abierto).toMatchObject({ ok: false, mensaje: expect.stringContaining('abierto') })
    const afuera = await prepararEliminacion(raiz, tacho, undefined)
    expect(afuera).toMatchObject({ ok: false, mensaje: 'El proyecto ya no está en la carpeta raíz.' })
  })
})

describe('ejecutarEliminacion', () => {
  it('borra las regenerables y manda la carpeta entera a la papelera', async () => {
    await archivo('package.json', '{}')
    await archivo('src/index.ts')
    await archivo('node_modules/react/index.js')
    const r = await prepararEliminacion(raiz, proyecto(), undefined)
    if (!r.ok) throw new Error(r.mensaje)
    const { papelera, recibidos } = papeleraFalsa()

    expect(await ejecutarEliminacion(raiz, r.ruta, r.plan, undefined, papelera)).toEqual({ ok: true })
    expect(recibidos).toEqual([proyecto()])
    expect(await readdir(raiz)).toEqual(['Beta'])
    // En la papelera está el proyecto sin node_modules.
    expect((await readdir(join(tacho, '1-Alfa'))).sort()).toEqual(['package.json', 'src'])
  })

  it('si la carpeta entera no se puede mandar, manda el contenido uno por uno y después la carpeta vacía', async () => {
    await archivo('a.txt')
    await archivo('src/b.ts')
    const r = await prepararEliminacion(raiz, proyecto(), undefined)
    if (!r.ok) throw new Error(r.mensaje)
    const { papelera, recibidos } = papeleraFalsa(true)

    expect(await ejecutarEliminacion(raiz, r.ruta, r.plan, undefined, papelera)).toEqual({ ok: true })
    expect(recibidos.map((x) => basename(x)).sort()).toEqual(['Alfa', 'a.txt', 'src'])
    expect(await readdir(raiz)).toEqual(['Beta'])
  })

  it('si algo falla a mitad de camino lo dice y no borra nada más', async () => {
    await archivo('a.txt')
    const r = await prepararEliminacion(raiz, proyecto(), undefined)
    if (!r.ok) throw new Error(r.mensaje)
    const falla = async () => {
      throw new Error('en uso')
    }
    const resultado = await ejecutarEliminacion(raiz, r.ruta, r.plan, undefined, falla)
    expect(resultado).toMatchObject({ ok: false, mensaje: expect.stringContaining('solo una parte') })
    expect(await readdir(proyecto())).toEqual(['a.txt'])
  })

  it('nunca borra una ruta del plan que salga del proyecto', async () => {
    await archivo('a.txt')
    const plan = {
      regenerables: [{ relativa: '../Beta', bytes: 0 }],
      papelera: { archivos: 1, conGit: false },
    }
    const { papelera } = papeleraFalsa()
    await ejecutarEliminacion(raiz, proyecto(), plan, undefined, papelera)
    expect(await readdir(raiz)).toEqual(['Beta'])
  })

  it('vuelve a comprobar que el proyecto no esté abierto al confirmar', async () => {
    const r = await prepararEliminacion(raiz, proyecto(), undefined)
    if (!r.ok) throw new Error(r.mensaje)
    const { papelera, recibidos } = papeleraFalsa()
    const resultado = await ejecutarEliminacion(raiz, r.ruta, r.plan, proyecto(), papelera)
    expect(resultado.ok).toBe(false)
    expect(recibidos).toEqual([])
  })
})

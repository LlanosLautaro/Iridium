// DI-I4: las versiones de una maqueta (frente Diseño, DS-5): leerlas, la próxima letra, el pedido a la IA, quedarse con
// una (sus enlaces siguen andando desde `pantallas/` y lo de antes va a la papelera) y el control de su frase.
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { quedarmeConVersion, vistaDiseno } from '../src/main/app/diseno'
import { correrControl } from '../src/main/core/control'
import type { ArchivosDiseno } from '../src/main/core/control/tipos'
import { pedidoOtraVersion } from '../src/main/core/diseno/pedidos'
import {
  carpetaVersiones,
  fraseLimpia,
  letraDe,
  proximaLetra,
  reubicar,
  sinDescripcion,
  versionesDe,
} from '../src/main/core/diseno/versiones'
import { leerArchivosDiseno } from '../src/main/infra/diseno/archivos'
import { ArchivoVistos } from '../src/main/infra/diseno/vistos'

const MUESTRA = join(__dirname, 'muestras', 'diseno')

/** Una versión de `pantallas/lista.html` de la muestra, como la escribiría la IA. */
const VERSION_B = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Lista</title>
<meta name="descripcion" content="la lista como tarjetas grandes">
<link rel="stylesheet" href="../../tokens.css"><link rel="stylesheet" href="../../piezas.css"></head>
<body>
<header class="cabecera"><strong>Notas</strong> <a class="boton" id="abrir" href="../../pantallas/nota.html#arriba">Abrir</a></header>
<div class="tarjeta">Comprar pan</div>
<a href="#">ancla</a>
</body></html>
`

describe('las versiones de una maqueta', () => {
  it('viven en `versiones/<maqueta>/`, en orden y con su letra', () => {
    expect(carpetaVersiones('pantallas/bandeja.html')).toBe('versiones/bandeja/')
    expect(carpetaVersiones('piezas.html')).toBeNull()
    expect(carpetaVersiones('versiones/bandeja/a.html')).toBeNull()
    const archivos = [
      'pantallas/bandeja.html',
      'versiones/bandeja/b.html',
      'versiones/bandeja/a.html',
      'versiones/bandeja/notas.md',
      'versiones/bandeja-vacia/a.html',
      'versiones/bandeja/otra/c.html',
    ]
    expect(versionesDe('pantallas/bandeja.html', archivos)).toEqual([
      'versiones/bandeja/a.html',
      'versiones/bandeja/b.html',
    ])
    expect(letraDe('versiones/bandeja/b.html')).toBe('B')
  })
  it('la versión nueva lleva la primera letra libre', () => {
    expect(proximaLetra([])).toBe('a')
    expect(proximaLetra(['versiones/x/a.html', 'versiones/x/c.html'])).toBe('b')
    const todas = Array.from({ length: 26 }, (_, i) => `versiones/x/${String.fromCharCode(97 + i)}.html`)
    expect(proximaLetra(todas)).toBeNull()
  })
  it('el pedido dice dónde escribirla, con la frase y sin tocar la de hoy', () => {
    const p = pedidoOtraVersion(
      'pantallas/bandeja.html',
      'versiones/bandeja/b.html',
      fraseLimpia('  la bandeja\n como   una sola lista '),
    )
    expect(p).toContain('`docs/diseno/pantallas/bandeja.html`')
    expect(p).toContain('`docs/diseno/versiones/bandeja/b.html`')
    expect(p).toContain('«la bandeja como una sola lista»')
    expect(p).toContain('`../../tokens.css`')
    expect(p).toContain('<meta name="descripcion"')
    expect(p).toContain('No cambies la maqueta de hoy ni el índice')
    expect(p).toContain('`referencias/06-ui.md` › Maquetas')
  })
  it('al pasar a `pantallas/`, sus enlaces siguen apuntando a los mismos archivos', () => {
    const r = reubicar(VERSION_B, 'versiones/lista/b.html', 'pantallas/lista.html')
    expect(r).toContain('href="../tokens.css"')
    expect(r).toContain('href="../piezas.css"')
    expect(r).toContain('href="nota.html#arriba"')
    expect(r).toContain('href="#"')
    expect(reubicar('<a href="https://ejemplo.invalid/">', 'versiones/l/a.html', 'pantallas/l.html')).toBe(
      '<a href="https://ejemplo.invalid/">',
    )
    expect(
      reubicar(
        `<p style="background: url('../../fondo.png?v=2')">`,
        'versiones/l/a.html',
        'pantallas/l.html',
      ),
    ).toBe(`<p style="background: url('../fondo.png?v=2')">`)
    expect(reubicar('<style>@import "../../x.css";</style>', 'versiones/l/a.html', 'pantallas/l.html')).toBe(
      '<style>@import "../x.css";</style>',
    )
    // Lo que sale de la carpeta queda como está (el control lo marca).
    expect(reubicar('<img src="../../../afuera.png">', 'versiones/l/a.html', 'pantallas/l.html')).toBe(
      '<img src="../../../afuera.png">',
    )
  })
  it('sin la frase del pedido: ya no es una versión', () => {
    const r = sinDescripcion(VERSION_B)
    expect(r).not.toContain('descripcion')
    expect(r).toContain('<title>Lista</title>\n<link')
  })
})

describe('las versiones en la sección y Quedarme con esta', () => {
  let base: string
  let proyecto: string
  let papelera: string[]
  const aLaPapelera = async (p: string) => {
    papelera.push(p)
    await rm(p, { recursive: true, force: true })
  }
  const diseno = (...p: string[]) => join(proyecto, 'docs', 'diseno', ...p)

  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'iridium-di4-'))
    proyecto = join(base, 'Alfa')
    await cp(MUESTRA, proyecto, { recursive: true })
    await mkdir(diseno('versiones', 'lista'), { recursive: true })
    await writeFile(diseno('versiones', 'lista', 'b.html'), VERSION_B)
    papelera = []
  })
  afterEach(() => rm(base, { recursive: true, force: true }))

  it('cada maqueta trae sus versiones, con su letra, su frase y el punto de una nueva', async () => {
    const vistos = new ArchivoVistos(join(base, 'diseno.json'))
    const v = await vistaDiseno(proyecto, 'maqueta://x/', vistos)
    if (v.tipo !== 'diseno') throw new Error('sin diseño')
    const lista = v.grupos.flatMap((g) => g.maquetas).find((m) => m.archivo === 'pantallas/lista.html')
    expect(lista?.versiones).toMatchObject([
      {
        archivo: 'versiones/lista/b.html',
        letra: 'B',
        nombre: 'Lista · versión B',
        descripcion: 'la lista como tarjetas grandes',
        rota: null,
        cambiada: false,
      },
    ])
    expect(
      v.grupos.flatMap((g) => g.maquetas).find((m) => m.archivo === 'pantallas/nota.html')?.versiones,
    ).toEqual([])
    // La IA escribe otra: llega con el punto.
    await writeFile(
      diseno('versiones', 'lista', 'c.html'),
      VERSION_B.replace('tarjetas grandes', 'una tabla'),
    )
    const v2 = await vistaDiseno(proyecto, 'maqueta://x/', vistos)
    if (v2.tipo !== 'diseno') throw new Error('sin diseño')
    const lista2 = v2.grupos.flatMap((g) => g.maquetas).find((m) => m.archivo === 'pantallas/lista.html')
    expect(lista2?.versiones.map((x) => [x.letra, x.cambiada, x.descripcion])).toEqual([
      ['B', false, 'la lista como tarjetas grandes'],
      ['C', true, 'la lista como una tabla'],
    ])
  })
  it('con una versión: pasa a ser la maqueta, anda desde su carpeta y lo de antes va a la papelera', async () => {
    const antes = await readFile(diseno('pantallas', 'lista.html'), 'utf8')
    await quedarmeConVersion(proyecto, 'pantallas/lista.html', 'versiones/lista/b.html', aLaPapelera)
    const ahora = await readFile(diseno('pantallas', 'lista.html'), 'utf8')
    expect(ahora).not.toBe(antes)
    expect(ahora).toContain('href="../tokens.css"')
    expect(ahora).toContain('href="nota.html#arriba"')
    expect(ahora).not.toContain('descripcion')
    expect(papelera).toEqual([diseno('pantallas', 'lista.html'), diseno('versiones', 'lista')])
    // Y el control no dice nada: sus enlaces resuelven desde `pantallas/`.
    expect(control(await leerArchivosDiseno(proyecto)).filter((a) => a.includes('lista'))).toEqual([])
  })
  it('con la de hoy: la maqueta queda y solo se van las versiones', async () => {
    const antes = await readFile(diseno('pantallas', 'lista.html'), 'utf8')
    await quedarmeConVersion(proyecto, 'pantallas/lista.html', null, aLaPapelera)
    expect(await readFile(diseno('pantallas', 'lista.html'), 'utf8')).toBe(antes)
    expect(papelera).toEqual([diseno('versiones', 'lista')])
  })
  it('una versión o una maqueta que no está no toca nada', async () => {
    await expect(
      quedarmeConVersion(proyecto, 'pantallas/lista.html', 'versiones/lista/z.html', aLaPapelera),
    ).rejects.toThrow('Esa versión ya no está')
    await expect(quedarmeConVersion(proyecto, 'pantallas/nada.html', null, aLaPapelera)).rejects.toThrow(
      'Esa maqueta ya no está',
    )
    // Una versión de otra maqueta tampoco.
    await expect(
      quedarmeConVersion(proyecto, 'pantallas/nota.html', 'versiones/lista/b.html', aLaPapelera),
    ).rejects.toThrow('Esa versión ya no está')
    expect(papelera).toEqual([])
  })
  it('el control: una versión con su frase no dice nada; sin ella, lo pide', async () => {
    expect(control(await leerArchivosDiseno(proyecto)).filter((a) => a.includes('versiones/'))).toEqual([])
    await writeFile(diseno('versiones', 'lista', 'c.html'), sinDescripcion(VERSION_B))
    expect(control(await leerArchivosDiseno(proyecto)).filter((a) => a.includes('versiones/'))).toEqual([
      'docs/diseno/versiones/lista/c.html a la versión le falta la frase con que se pidió: `<meta name="descripcion" content="…">` en su `<head>`',
    ])
  })
})

const control = (diseno: ArchivosDiseno | null): string[] =>
  correrControl({ estados: [], trabajo: null, respuestas: new Map(), documentos: [], frentes: [], diseno })
    .filter((x) => x.regla === 'diseno')
    .map((x) => `${x.archivo}${x.linea ? `:${x.linea}` : ''} ${x.texto}`)

describe('el framework', () => {
  it('le dice a la IA cómo escribir una versión: las hojas a dos carpetas, la frase y sin tocar la de hoy', async () => {
    const base = join(__dirname, '..', 'recursos/plugins/iridium/skills/iridium')
    const ui = await readFile(join(base, 'referencias/06-ui.md'), 'utf8')
    expect(ui).toContain('`../../tokens.css`')
    expect(ui).toContain('<meta name="descripcion"')
    expect(ui).toContain('No toques la de hoy ni el índice')
    expect(await readFile(join(base, 'SKILL.md'), 'utf8')).toContain(
      '`versiones/<maqueta>/<letra>.html`: de una maqueta que existe, con `<meta name="descripcion"',
    )
  })
})

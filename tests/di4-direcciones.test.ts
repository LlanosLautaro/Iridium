// DI-I4: probar una dirección (frente Diseño, DS-5, DS-9): leerlas con su frase y si sus variables son las de
// `tokens.css`, servir las maquetas con sus tokens (`maqueta://<id>/~<dirección>/`), el pedido a la IA, elegirla (los
// tokens de hoy quedan como otra dirección y se puede volver) y descartarla (a la papelera).
import { cp, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { descartarDireccion, elegirDireccion, vistaDiseno } from '../src/main/app/diseno'
import { correrControl } from '../src/main/core/control'
import {
  archivoAnterior,
  comoAnterior,
  comoTokens,
  descripcionDireccion,
  direccionesDe,
  nombreDireccion,
  paraEncima,
  problemaDireccion,
} from '../src/main/core/diseno/direcciones'
import { pedidoDireccion } from '../src/main/core/diseno/pedidos'
import { leerArchivosDiseno } from '../src/main/infra/diseno/archivos'
import { MaquetasAbiertas } from '../src/main/infra/diseno/protocolo'
import { ArchivoVistos } from '../src/main/infra/diseno/vistos'

const MUESTRA = join(__dirname, 'muestras', 'diseno')
const DIA = new Date(2026, 10, 26, 10, 30)

describe('las direcciones', () => {
  it('viven en `direcciones/`, en orden, con su nombre', () => {
    expect(
      direccionesDe([
        'tokens.css',
        'direcciones/verde.css',
        'direcciones/azul-apagado.css',
        'direcciones/notas.md',
        'direcciones/otra/x.css',
      ]),
    ).toEqual(['direcciones/azul-apagado.css', 'direcciones/verde.css'])
    expect(nombreDireccion('direcciones/azul-apagado.css')).toBe('azul-apagado')
  })
  it('su frase es el comentario con que empieza', () => {
    expect(descripcionDireccion('/* Negro con azul apagado. */\n:root {\n  --fondo: #000;\n}')).toBe(
      'Negro con azul apagado.',
    )
    expect(descripcionDireccion('/* Una frase\n   en dos líneas */ :root{}')).toBe('Una frase en dos líneas')
    expect(descripcionDireccion(':root {\n  --fondo: #000; /* el fondo */\n}')).toBeNull()
  })
  it('dice si sus variables no son las de `tokens.css`', () => {
    const nombres = new Set(['--fondo', '--texto', '--borde', '--ui'])
    expect(
      problemaDireccion(nombres, ':root { --fondo: #000; --texto: #fff; --borde: #222; --ui: x; }'),
    ).toBeNull()
    expect(problemaDireccion(nombres, ':root { --fondo: #000; --otra: 1px; }')).toBe(
      'le faltan --texto, --borde, --ui; sobran --otra',
    )
    expect(problemaDireccion(nombres, '/* nada */')).toBe('no tiene un bloque :root con variables')
  })
  it('los tokens de hoy se guardan como `anterior-AAAA-MM-DD`, sin pisar otra del mismo día', () => {
    expect(archivoAnterior(DIA, [])).toBe('direcciones/anterior-2026-11-26.css')
    expect(
      archivoAnterior(DIA, ['direcciones/anterior-2026-11-26.css', 'direcciones/anterior-2026-11-26-2.css']),
    ).toBe('direcciones/anterior-2026-11-26-3.css')
  })
  it('la de antes lleva una frase que dice de dónde salió, y la pierde al volver a ser los tokens', () => {
    const hoy = '/* Los tokens de Alfa. */\n:root {\n  --fondo: #000;\n}\n'
    const anterior = comoAnterior(hoy, 'azul-apagado', DIA)
    expect(descripcionDireccion(anterior)).toBe('La de antes de elegir «azul apagado» (2026-11-26).')
    expect(comoTokens(anterior)).toBe(hoy)
    // Guardada otra vez, no se le apilan las frases.
    expect(comoAnterior(anterior, 'verde', DIA)).toBe(comoAnterior(hoy, 'verde', DIA))
  })
  it('encima de una maqueta, su `:root` gana sin importar el orden de las hojas', () => {
    expect(paraEncima(':root {\n  --fondo: #000;\n}')).toBe(':root:root:root {\n  --fondo: #000;\n}')
  })
  it('el pedido a la IA dice dónde, que lo que se prueba va después de la cita, y que no toque lo de hoy', () => {
    const p = pedidoDireccion(['azul-apagado'])
    expect(p).toContain('`docs/diseno/direcciones/<nombre>.css`')
    expect(p).toContain('lo que te pido después de esta cita')
    expect(p).toContain('las mismas variables')
    expect(p).toContain('`azul-apagado`')
    expect(p).toContain('En la primera línea, un comentario')
    expect(p).toContain('No cambies `tokens.css`, `piezas.css` ni las maquetas')
    expect(p).toContain('`referencias/06-ui.md` › Maquetas')
    expect(pedidoDireccion([])).not.toContain('Ya están')
  })
})

describe('las maquetas con una dirección puesta (`maqueta://<id>/~<dirección>/`)', () => {
  const abiertas = new MaquetasAbiertas()
  const proyecto = join(tmpdir(), 'Alfa')
  const id = abiertas.abrir(proyecto)
  const diseno = (...p: string[]) => join(proyecto, 'docs', 'diseno', ...p)

  it('`tokens.css` es la dirección; lo demás, lo de siempre', () => {
    expect(abiertas.archivoDe(`maqueta://${id}/~azul-apagado/tokens.css`)).toBe(
      diseno('direcciones', 'azul-apagado.css'),
    )
    expect(abiertas.archivoDe(`maqueta://${id}/~azul-apagado/pantallas/lista.html`)).toBe(
      diseno('pantallas', 'lista.html'),
    )
    expect(abiertas.archivoDe(`maqueta://${id}/~azul-apagado/piezas.css`)).toBe(diseno('piezas.css'))
    expect(abiertas.archivoDe(`maqueta://${id}/~negro%20azul/tokens.css`)).toBe(
      diseno('direcciones', 'negro azul.css'),
    )
    // Sin dirección, igual que antes.
    expect(abiertas.archivoDe(`maqueta://${id}/tokens.css`)).toBe(diseno('tokens.css'))
  })
  it('no sale de la carpeta', () => {
    expect(abiertas.archivoDe(`maqueta://${id}/~../tokens.css`)).toBeNull()
    // Los `..` los resuelve la dirección misma: a lo sumo, la raíz de `docs/diseno/`.
    expect(abiertas.archivoDe(`maqueta://${id}/~x/%2E%2E/%2E%2E/%2E%2E/secreto.txt`)).toBe(
      diseno('secreto.txt'),
    )
    expect(abiertas.archivoDe(`maqueta://${id}/~%2E%2E/tokens.css`)).toBeNull()
  })
})

describe('las direcciones en la sección, Elegir y Descartar', () => {
  let base: string
  let proyecto: string
  let papelera: string[]
  const aLaPapelera = async (p: string) => {
    papelera.push(p)
    await rm(p, { recursive: true, force: true })
  }
  const diseno = (...p: string[]) => join(proyecto, 'docs', 'diseno', ...p)

  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'iridium-di4d-'))
    proyecto = join(base, 'Alfa')
    await cp(MUESTRA, proyecto, { recursive: true })
    papelera = []
  })
  afterEach(() => rm(base, { recursive: true, force: true }))

  it('la vista trae cada dirección con su frase, sus tokens para la grande y si se puede elegir', async () => {
    await writeFile(
      diseno('direcciones', 'rota.css'),
      '/* Le falta casi todo. */\n:root {\n  --fondo: #101010;\n}\n',
    )
    const v = await vistaDiseno(proyecto, 'maqueta://x/', new ArchivoVistos(join(base, 'diseno.json')))
    if (v.tipo !== 'diseno') throw new Error('sin diseño')
    expect(
      v.direcciones.map((d) => [d.archivo, d.nombre, d.descripcion, d.problema?.slice(0, 10) ?? null]),
    ).toEqual([
      ['direcciones/azul-apagado.css', 'azul-apagado', 'Negro con azul apagado.', null],
      ['direcciones/rota.css', 'rota', 'Le falta casi todo.', 'le faltan '],
    ])
    expect(v.direcciones[0]?.css).toContain(':root:root:root {')
    expect(v.direcciones[0]?.huella).toMatch(/^\d+-\d+$/)
  })
  it('Elegir: la dirección pasa a ser los tokens, los de hoy quedan como dirección, y se puede volver', async () => {
    const hoy = await readFile(diseno('tokens.css'), 'utf8')
    const azul = await readFile(diseno('direcciones', 'azul-apagado.css'), 'utf8')
    const anterior = await elegirDireccion(proyecto, 'direcciones/azul-apagado.css', aLaPapelera, DIA)
    expect(anterior).toBe('direcciones/anterior-2026-11-26.css')
    expect(await readFile(diseno('tokens.css'), 'utf8')).toBe(azul)
    expect(papelera).toEqual([diseno('direcciones', 'azul-apagado.css')])
    const guardada = await readFile(diseno('direcciones', 'anterior-2026-11-26.css'), 'utf8')
    expect(guardada).toContain('La de antes de elegir «azul apagado» (2026-11-26)')
    expect(guardada).toContain(hoy)
    // Las variables siguen siendo las mismas: el control no dice nada de las direcciones.
    const avisos = control(await leerArchivosDiseno(proyecto))
    expect(avisos.filter((a) => a.includes('direcciones/'))).toEqual([])
    // Volver: elegir la anterior deja los tokens como estaban.
    await elegirDireccion(proyecto, 'direcciones/anterior-2026-11-26.css', aLaPapelera, DIA)
    expect(await readFile(diseno('tokens.css'), 'utf8')).toBe(hoy)
    expect((await readdir(diseno('direcciones'))).sort()).toEqual(['anterior-2026-11-26-2.css'])
  })
  it('Descartar: su archivo va a la papelera y los tokens no cambian', async () => {
    const hoy = await readFile(diseno('tokens.css'), 'utf8')
    await descartarDireccion(proyecto, 'direcciones/azul-apagado.css', aLaPapelera)
    expect(papelera).toEqual([diseno('direcciones', 'azul-apagado.css')])
    expect(await readFile(diseno('tokens.css'), 'utf8')).toBe(hoy)
  })
  it('una dirección que no está, o algo que no es una dirección, no toca nada', async () => {
    await expect(elegirDireccion(proyecto, 'direcciones/nada.css', aLaPapelera)).rejects.toThrow(
      'Esa dirección ya no está',
    )
    await expect(descartarDireccion(proyecto, 'tokens.css', aLaPapelera)).rejects.toThrow(
      'Esa dirección ya no está',
    )
    await expect(descartarDireccion(proyecto, 'pantallas/lista.html', aLaPapelera)).rejects.toThrow(
      'Esa dirección ya no está',
    )
    expect(papelera).toEqual([])
  })
})

const control = (diseno: Awaited<ReturnType<typeof leerArchivosDiseno>>): string[] =>
  correrControl({ estados: [], trabajo: null, respuestas: new Map(), documentos: [], frentes: [], diseno })
    .filter((x) => x.regla === 'diseno')
    .map((x) => `${x.archivo}${x.linea ? `:${x.linea}` : ''} ${x.texto}`)

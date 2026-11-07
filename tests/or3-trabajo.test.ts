// OR-I3: el trabajo de un proyecto (W-11, H-19) y anotar una idea sin la IA, sin pisar a una sesión (H-18).
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Documentos } from '../src/main/app/documentos'
import { anotarEnProyecto, anotarSuelta, trabajoDelProyecto } from '../src/main/app/trabajo'
import { conIdeaSuelta, leerIdeas } from '../src/main/core/ideas'
import { conIdeaNueva, leerTrabajo } from '../src/main/core/trabajo'
import { cambiarSinPisar } from '../src/main/infra/trabajo'

let raiz: string
const HOY = new Date(2026, 10, 7)

async function escribir(ruta: string, texto: string) {
  await mkdir(join(raiz, ruta, '..'), { recursive: true })
  await writeFile(join(raiz, ruta), texto)
}

const TRABAJO = `# Trabajo

## T-1 — Bandeja agrupada por frente
Estado: en curso · Frente: Orden · Fecha: 2026-11-05 · Origen: D-2
Con filtros arriba.

## T-3 — Exportar el plan
Estado: nueva · Fecha: 2026-11-06

## T-2 — Algo mal escrito
Estado: completo · Fecha: 2026-11-01
`

beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-trabajo-'))
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true })
})

describe('conIdeaNueva', () => {
  it('agrega al final el T-n que sigue al más alto, como nueva y con la fecha', () => {
    const r = conIdeaNueva(TRABAJO, 'Un atajo para Seguí', '2026-11-07')
    expect(r.codigo).toBe('T-4')
    expect(r.texto.startsWith(TRABAJO.trimEnd())).toBe(true)
    expect(r.texto.endsWith('\n\n## T-4 — Un atajo para Seguí\nEstado: nueva · Fecha: 2026-11-07\n')).toBe(
      true,
    )
    expect(leerTrabajo(r.texto).items.find((i) => i.codigo === 'T-4')).toMatchObject({ estado: 'nueva' })
  })
  it('sin archivo, lo crea con su título y empieza en T-1', () => {
    const r = conIdeaNueva(null, 'Primera', '2026-11-07')
    expect(r).toEqual({
      codigo: 'T-1',
      texto: '# Trabajo\n\n## T-1 — Primera\nEstado: nueva · Fecha: 2026-11-07\n',
    })
  })
})

describe('conIdeaSuelta', () => {
  const IDEAS = `# Ideas

> Cómo se usa: ver \`CLAUDE.md\`.

## Sueltas
Ideas que todavía no tienen proyecto.

### Una vieja — 2026-10-01
Texto.

## Integradas
Las que pasaron.
`
  it('va arriba de Sueltas, debajo de la línea que la explica', () => {
    const t = conIdeaSuelta(IDEAS, 'Una app de recetas', '2026-11-07')
    expect(t).toContain(
      'Ideas que todavía no tienen proyecto.\n\n### Una app de recetas — 2026-11-07\n\n### Una vieja',
    )
    const leidas = leerIdeas(t)
    expect(leidas.tipo === 'secciones' && leidas.secciones[0]?.ideas.map((i) => i.titulo)).toEqual([
      'Una app de recetas',
      'Una vieja',
    ])
  })
  it('sin la sección Sueltas, la crea debajo del título; sin archivo, el de la carpeta nueva', () => {
    const t = conIdeaSuelta('# Ideas\n\n## Integradas\nNada.\n', 'Otra', '2026-11-07')
    expect(t).toBe(
      '# Ideas\n\n## Sueltas\nIdeas que todavía no tienen proyecto.\n\n### Otra — 2026-11-07\n\n## Integradas\nNada.\n',
    )
    expect(conIdeaSuelta(null, 'Primera', '2026-11-07')).toContain(
      '## Sueltas\nIdeas que todavía no tienen proyecto.\n\n### Primera — 2026-11-07\n',
    )
  })
})

describe('anotar sin pisar a la sesión', () => {
  it('si la sesión escribe en el medio, vuelve a leer y no pierde lo suyo', async () => {
    const archivo = join(raiz, 'docs', 'trabajo.md')
    await escribir('docs/trabajo.md', TRABAJO)
    let veces = 0
    const r = await anotarEnProyecto(raiz, 'La de Iridium', HOY, async () => {
      // La primera vez, la sesión agrega su T-4 entre la lectura y la escritura de Iridium.
      if (veces++ === 0) {
        await new Promise((ok) => setTimeout(ok, 20))
        await writeFile(
          archivo,
          `${TRABAJO}\n## T-4 — La de la sesión\nEstado: pendiente · Fecha: 2026-11-07\n`,
        )
      }
    })
    expect(r).toEqual({ tipo: 'ok', codigo: 'T-5' })
    const texto = await readFile(archivo, 'utf8')
    expect(texto).toContain('## T-4 — La de la sesión')
    expect(texto).toContain('## T-5 — La de Iridium\nEstado: nueva · Fecha: 2026-11-07')
    expect(veces).toBe(2)
  })
  it('si cambia siempre, a la tercera devuelve el motivo y no escribe', async () => {
    const archivo = join(raiz, 'x.md')
    await writeFile(archivo, 'a')
    let n = 0
    await expect(
      cambiarSinPisar(
        archivo,
        (t) => ({ texto: `${t}!`, valor: null }),
        async () => {
          await new Promise((ok) => setTimeout(ok, 20))
          await writeFile(archivo, `sesion ${n++}`)
        },
      ),
    ).rejects.toThrow(/cambió mientras se escribía/)
    expect(await readFile(archivo, 'utf8')).toBe('sesion 2')
  })
  it('sin trabajo.md lo crea; vacía no anota; la suelta crea la carpeta Ideas', async () => {
    expect(await anotarEnProyecto(raiz, '  Una   idea  ', HOY)).toEqual({ tipo: 'ok', codigo: 'T-1' })
    expect(await readFile(join(raiz, 'docs', 'trabajo.md'), 'utf8')).toBe(
      '# Trabajo\n\n## T-1 — Una idea\nEstado: nueva · Fecha: 2026-11-07\n',
    )
    expect(await anotarEnProyecto(raiz, '   ', HOY)).toMatchObject({ tipo: 'error' })
    expect(await anotarSuelta(join(raiz, 'Ideas'), 'Suelta', HOY)).toEqual({ tipo: 'ok', codigo: '' })
    expect(await readFile(join(raiz, 'Ideas', 'ideas.md'), 'utf8')).toContain('### Suelta — 2026-11-07')
  })
})

describe('trabajoDelProyecto', () => {
  it('con framework, los T-n con su texto, su origen enlazado y el estado de afuera como null', async () => {
    await escribir('docs/estado.md', '# Estado\n\n## Hito actual\n1 — Exploración — en curso\n')
    await escribir('docs/README.md', '# Docs\n\n**Framework:** 2026-11-06\n')
    await escribir('docs/decisiones.md', '# Decisiones\n\n## D-2 — Filtros\nTexto.\n')
    await escribir('docs/trabajo.md', TRABAJO)
    const t = trabajoDelProyecto(await new Documentos().de(raiz))
    expect(t.tipo).toBe('trabajo')
    if (t.tipo !== 'trabajo') return
    expect(t.items.map((i) => [i.codigo, i.estado, i.frente])).toEqual([
      ['T-1', 'en curso', 'Orden'],
      ['T-3', 'nueva', null],
      ['T-2', null, null],
    ])
    expect(t.items[0]?.html).toContain('Con filtros arriba.')
    expect(t.items[0]?.origenHtml).toContain('data-codigo="D-2"')
    expect(t.items[2]?.estadoTexto).toBe('completo')
  })
  it('con framework viejo, las ideas de la guía; sin estado.md, nada', async () => {
    await escribir('docs/estado.md', '# Estado\n')
    await escribir('docs/00-idea.md', '# Idea\n\n## Ideas para después\n- Una\n- Otra\n')
    const t = trabajoDelProyecto(await new Documentos().de(raiz))
    expect(t.tipo === 'viejo' && t.ideas.secciones[0]?.cantidad).toBe(2)
    await rm(join(raiz, 'docs'), { recursive: true })
    expect(trabajoDelProyecto(await new Documentos().de(raiz))).toEqual({ tipo: 'sin-docs' })
  })
})

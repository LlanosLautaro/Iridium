// OR-I3: el trabajo de un proyecto (W-11, H-19). Anotar sin la IA se fue con Ideas como bloc de notas (D-112, D-126).
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Documentos } from '../src/main/app/documentos'
import { trabajoDelProyecto } from '../src/main/app/trabajo'

let raiz: string

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

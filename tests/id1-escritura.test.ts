// ID-I1, parte 3: la sección Ideas en el disco (D-130). Leer las ideas de un proyecto; anotar, aprobar, rechazar,
// cambiar el título y guardar la nota, cada cambio en `trabajo.md` sin pisar lo que la IA escribió en el medio.
import { writeFileSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  anotarIdea,
  cambiarEstadoIdea,
  guardarIdea,
  ideasDeProyecto,
  leerNotaIdea,
} from '../src/main/app/ideas'
import { cambiarConCuidado, INTENTOS_TRABAJO } from '../src/main/infra/trabajo'

const README = '# Documentación\n\n**Framework:** 2026-11-01\n'

const TRABAJO = `# Trabajo

## T-1 — Un modo foco
Estado: nueva · Idea: usuario · Fecha: 2026-11-14

## T-2 — Exportar a PDF
Estado: nueva · Fecha: 2026-11-15
Lo propone la IA.

## T-3 — Ordenar los tests
Estado: en curso · Fecha: 2026-11-15
`

const HOY = new Date(2026, 10, 16)

let carpeta: string
const archivo = (r: string) => join(carpeta, ...r.split('/'))
const leer = (r: string) => readFile(archivo(r), 'utf8')
const existe = (r: string) =>
  stat(archivo(r)).then(
    () => true,
    () => false,
  )

beforeEach(async () => {
  carpeta = await mkdtemp(join(tmpdir(), 'iridium-ideas-'))
  await mkdir(join(carpeta, 'docs'))
  await writeFile(archivo('docs/README.md'), README)
  await writeFile(archivo('docs/trabajo.md'), TRABAJO)
})
afterEach(async () => {
  await rm(carpeta, { recursive: true, force: true })
})

describe('leer las ideas de un proyecto', () => {
  it('trae las ideas de trabajo.md y cuáles tienen nota', async () => {
    await mkdir(archivo('docs/ideas'))
    await writeFile(archivo('docs/ideas/T-1.md'), 'Esconder todo menos la conversación.\n')
    const r = await ideasDeProyecto(carpeta)
    expect(r.tipo).toBe('ok')
    if (r.tipo !== 'ok') return
    expect(r.ideas.map((i) => [i.codigo, i.de, i.conNota])).toEqual([
      ['T-2', 'IA', false],
      ['T-1', 'usuario', true],
    ])
  })

  it('un proyecto sin framework no tiene ideas de trabajo.md', async () => {
    await rm(archivo('docs/README.md'))
    expect(await ideasDeProyecto(carpeta)).toEqual({ tipo: 'sin-framework' })
  })

  it('sin trabajo.md, la lista está vacía', async () => {
    await rm(archivo('docs/trabajo.md'))
    expect(await ideasDeProyecto(carpeta)).toEqual({ tipo: 'ok', ideas: [] })
  })
})

describe('anotar', () => {
  it('una idea va al final con Idea: usuario, y lo de abajo del título, a su nota', async () => {
    const r = await anotarIdea(carpeta, 'Pegar capturas\nCon Ctrl+V, como en el bloc.', HOY)
    expect(r).toEqual({ tipo: 'ok', codigo: 'T-4' })
    const texto = await leer('docs/trabajo.md')
    expect(texto.startsWith(TRABAJO.trimEnd())).toBe(true)
    expect(
      texto.endsWith('## T-4 — Pegar capturas\nEstado: nueva · Idea: usuario · Fecha: 2026-11-16\n'),
    ).toBe(true)
    expect(await leer('docs/ideas/T-4.md')).toBe('Con Ctrl+V, como en el bloc.\n')
  })

  it('una idea de una línea no crea nota', async () => {
    await anotarIdea(carpeta, 'Solo el título', HOY)
    expect(await existe('docs/ideas/T-4.md')).toBe(false)
  })

  it('un enlace solo va con Idea: enlace, su dirección y lo demás como descripción', async () => {
    const r = await anotarIdea(carpeta, 'https://github.com/alfa/beluga\nMirar cómo arma los diagramas.', HOY)
    expect(r).toEqual({ tipo: 'ok', codigo: 'T-4' })
    expect(await leer('docs/trabajo.md')).toContain(
      '## T-4 — alfa/beluga\nEstado: nueva · Idea: enlace · Fecha: 2026-11-16 · Enlace: https://github.com/alfa/beluga\nMirar cómo arma los diagramas.\n',
    )
    expect(await existe('docs/ideas/T-4.md')).toBe(false)
  })

  it('sin trabajo.md lo crea con su título', async () => {
    await rm(archivo('docs/trabajo.md'))
    await anotarIdea(carpeta, 'La primera', HOY)
    expect(await leer('docs/trabajo.md')).toBe(
      '# Trabajo\n\n## T-1 — La primera\nEstado: nueva · Idea: usuario · Fecha: 2026-11-16\n',
    )
  })

  it('respeta los fines de línea de Windows', async () => {
    await writeFile(archivo('docs/trabajo.md'), TRABAJO.replace(/\n/g, '\r\n'))
    await anotarIdea(carpeta, 'Otra', HOY)
    const texto = await leer('docs/trabajo.md')
    expect(texto.replace(/\r\n/g, '')).not.toContain('\n')
    expect(texto).toContain('## T-4 — Otra\r\n')
  })

  it('no escribe nada vacío ni en un proyecto sin framework', async () => {
    expect((await anotarIdea(carpeta, '  \n ', HOY)).tipo).toBe('error')
    await rm(archivo('docs/README.md'))
    expect((await anotarIdea(carpeta, 'Algo', HOY)).tipo).toBe('error')
    expect(await leer('docs/trabajo.md')).toBe(TRABAJO)
  })
})

describe('escribir sin pisar a la IA', () => {
  it('si la IA escribió trabajo.md en el medio, vuelve a leer y suma los dos cambios', async () => {
    let vueltas = 0
    const r = await cambiarConCuidado(carpeta, 'docs/trabajo.md', (texto) => {
      vueltas++
      if (vueltas === 1)
        // La IA agrega un pendiente entre la lectura y la escritura de Iridium.
        writeFileSync(archivo('docs/trabajo.md'), `${TRABAJO}\n## T-4 — De la IA\nEstado: pendiente\n`)
      return { texto: `${texto}\n## T-9 — De Iridium\n`, dato: null }
    })
    expect(r.tipo).toBe('ok')
    expect(vueltas).toBe(2)
    const texto = await leer('docs/trabajo.md')
    expect(texto).toContain('## T-4 — De la IA')
    expect(texto).toContain('## T-9 — De Iridium')
  })

  it('si cambia cada vez, se rinde sin escribir y lo dice', async () => {
    let vueltas = 0
    const r = await cambiarConCuidado(carpeta, 'docs/trabajo.md', (texto) => {
      vueltas++
      writeFileSync(archivo('docs/trabajo.md'), `${TRABAJO}\n<!-- ${vueltas} -->\n`)
      return { texto: `${texto}\n## T-9 — De Iridium\n`, dato: null }
    })
    expect(vueltas).toBe(INTENTOS_TRABAJO)
    expect(r.tipo).toBe('error')
    expect(await leer('docs/trabajo.md')).not.toContain('De Iridium')
  })
})

describe('aprobar, rechazar y marcar revisado', () => {
  it('aprobar pasa a pendiente y volver, a nueva; una de la IA sin Idea: se queda con Idea: IA', async () => {
    expect(await cambiarEstadoIdea(carpeta, 'T-2', 'pendiente')).toEqual({ tipo: 'ok', codigo: 'T-2' })
    expect(await leer('docs/trabajo.md')).toContain(
      '## T-2 — Exportar a PDF\nEstado: pendiente · Idea: IA · Fecha: 2026-11-15',
    )
    expect(await cambiarEstadoIdea(carpeta, 'T-2', 'nueva')).toEqual({ tipo: 'ok', codigo: 'T-2' })
    expect(await leer('docs/trabajo.md')).toBe(TRABAJO.replace('nueva · Fecha', 'nueva · Idea: IA · Fecha'))
  })

  it('rechazar sin motivo escribe «Rechazada por el usuario.»', async () => {
    await cambiarEstadoIdea(carpeta, 'T-1', 'descartado')
    expect(await leer('docs/trabajo.md')).toContain(
      '## T-1 — Un modo foco\nEstado: descartado · Idea: usuario · Fecha: 2026-11-14\nRechazada por el usuario.\n',
    )
  })

  it('no toca lo que no es una idea, ni marca revisada una idea que no es un enlace', async () => {
    expect((await cambiarEstadoIdea(carpeta, 'T-3', 'pendiente')).tipo).toBe('error')
    expect((await cambiarEstadoIdea(carpeta, 'T-1', 'hecho')).tipo).toBe('error')
    expect((await cambiarEstadoIdea(carpeta, 'T-40', 'pendiente')).tipo).toBe('error')
    expect(await leer('docs/trabajo.md')).toBe(TRABAJO)
  })

  it('un enlace revisado pasa a hecho', async () => {
    await anotarIdea(carpeta, 'https://ejemplo.com/recetas', HOY)
    await cambiarEstadoIdea(carpeta, 'T-4', 'hecho')
    expect(await leer('docs/trabajo.md')).toContain('Estado: hecho · Idea: enlace')
  })
})

describe('escribir en una idea abierta', () => {
  it('la primera línea cambia el título y el resto va a la nota', async () => {
    const r = await guardarIdea(carpeta, 'T-1', 'Modo foco\nEsconder todo menos la conversación.\n\nCon F11.')
    expect(r).toEqual({ tipo: 'ok', codigo: 'T-1' })
    expect(await leer('docs/trabajo.md')).toContain('## T-1 — Modo foco\nEstado: nueva')
    expect(await leer('docs/ideas/T-1.md')).toBe('Esconder todo menos la conversación.\n\nCon F11.\n')
    expect(await leerNotaIdea(carpeta, 'T-1')).toEqual({
      tipo: 'ok',
      texto: 'Esconder todo menos la conversación.\n\nCon F11.',
    })
  })

  it('con el mismo título no reescribe trabajo.md', async () => {
    const antes = (await stat(archivo('docs/trabajo.md'))).mtimeMs
    await guardarIdea(carpeta, 'T-1', 'Un modo foco\nAlgo más.')
    expect((await stat(archivo('docs/trabajo.md'))).mtimeMs).toBe(antes)
    expect(await leer('docs/ideas/T-1.md')).toBe('Algo más.\n')
  })

  it('sin nada debajo del título, la nota se borra', async () => {
    await guardarIdea(carpeta, 'T-1', 'Un modo foco\nAlgo.')
    await guardarIdea(carpeta, 'T-1', 'Un modo foco\n\n')
    expect(await existe('docs/ideas/T-1.md')).toBe(false)
    expect(await leerNotaIdea(carpeta, 'T-1')).toEqual({ tipo: 'ok', texto: '' })
  })

  it('no escribe una idea de la IA ni un título vacío', async () => {
    expect((await guardarIdea(carpeta, 'T-2', 'Otro título')).tipo).toBe('error')
    expect((await guardarIdea(carpeta, 'T-1', '   \nNota sin título')).tipo).toBe('error')
    expect(await leer('docs/trabajo.md')).toBe(TRABAJO)
    expect(await existe('docs/ideas')).toBe(false)
  })
})

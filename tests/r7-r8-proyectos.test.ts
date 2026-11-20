// R-7 y R-8 (D-089): las ideas y las skills de un proyecto, Nuevo proyecto y VS Code. Con carpetas temporales.
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { controlarProyecto } from '../src/main/app/control'
import { crearProyecto } from '../src/main/app/creacion'
import { Documentos } from '../src/main/app/documentos'
import { ideasDelProyecto } from '../src/main/app/ideas'
import { listarProyectos } from '../src/main/app/proyectos'
import { skillsDelProyecto } from '../src/main/app/skills'
import { seccionDeIdeas } from '../src/main/core/ideas-proyecto'
import { proyectoAfectado } from '../src/main/core/vigilancia'
import { argumentosVsCode, candidatosVsCode } from '../src/main/infra/vscode'

let raiz: string
beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-r7r8-'))
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true })
})

async function escribir(relativa: string, texto: string) {
  await mkdir(join(raiz, relativa, '..'), { recursive: true })
  await writeFile(join(raiz, relativa), texto)
}

describe('seccionDeIdeas (R-8)', () => {
  const idea = [
    '# Idea',
    '',
    '## Qué es',
    'Una app.',
    '',
    '## Ideas para después (sin compromiso)',
    'Funcionalidades:',
    '- Una vista de plan.',
    '  - con sub-punto, que no cuenta',
    '- Un canvas.',
    '',
    '```',
    '## Ideas falsas dentro de código',
    '- no',
    '```',
    '### Técnicas',
    '1. Usar la suscripción.',
    '',
    '## Otra sección',
    '- no es idea',
  ].join('\n')

  it('toma la sección por el comienzo del título, hasta la siguiente del mismo nivel', () => {
    const s = seccionDeIdeas(idea, 'ideas para después')
    expect(s?.titulo).toBe('Ideas para después (sin compromiso)')
    expect(s?.cuerpo.startsWith('Funcionalidades:')).toBe(true)
    expect(s?.cuerpo).toContain('### Técnicas')
    expect(s?.cuerpo).not.toContain('Otra sección')
    // Los puntos de primer nivel, también los numerados; no los de adentro ni los del bloque de código.
    expect(s?.cantidad).toBe(3)
  })

  it('sin la sección, null', () => {
    expect(seccionDeIdeas(idea, 'ideas nuevas')).toBeNull()
    expect(seccionDeIdeas('', 'ideas nuevas')).toBeNull()
  })
})

describe('ideasDelProyecto (R-8)', () => {
  it('las ideas nuevas primero y las de la idea después, pintadas como en Docs', async () => {
    await escribir('Alfa/docs/00-idea.md', '# Idea\n\n## Ideas para después\n- Un **canvas**.\n')
    await escribir(
      'Alfa/docs/07-construccion.md',
      '# Construcción\n\n## Ideas nuevas (pendientes)\n- Ver D-1.\n- Otra.\n\n## Deuda técnica\n- x\n',
    )
    await escribir('Alfa/docs/decisiones.md', '# Decisiones\n\n## D-1 — Algo\nTexto.\n')
    const r = ideasDelProyecto(await new Documentos().de(join(raiz, 'Alfa')))
    expect(r.secciones.map((s) => [s.documento, s.titulo, s.cantidad])).toEqual([
      ['docs/07-construccion.md', 'Ideas nuevas (pendientes)', 2],
      ['docs/00-idea.md', 'Ideas para después', 1],
    ])
    expect(r.secciones[0]?.ancla).toBeTruthy()
    expect(r.secciones[0]?.html).toContain('data-doc="docs/decisiones.md"')
    expect(r.secciones[1]?.html).toContain('<strong>canvas</strong>')
  })

  it('sin documentos de la guía, ninguna sección', async () => {
    await mkdir(join(raiz, 'Beta'))
    expect(ideasDelProyecto(await new Documentos().de(join(raiz, 'Beta')))).toEqual({ secciones: [] })
  })
})

describe('skills del proyecto (R-8)', () => {
  it('lista las de .claude/skills con SKILL.md, con nombre y descripción, y la tarjeta las cuenta', async () => {
    await escribir(
      'Alfa/.claude/skills/deploy/SKILL.md',
      '---\nname: deploy-alfa\ndescription: Cómo publicar Alfa.\n---\n\n# Deploy\n',
    )
    await escribir('Alfa/.claude/skills/sin-encabezado/SKILL.md', '# Nada\n')
    await escribir('Alfa/.claude/skills/vacia/notas.md', 'no es una skill')
    await mkdir(join(raiz, 'Beta'))

    expect(await skillsDelProyecto(join(raiz, 'Alfa'))).toEqual([
      {
        nombre: 'deploy-alfa',
        descripcion: 'Cómo publicar Alfa.',
        archivo: '.claude/skills/deploy/SKILL.md',
      },
      { nombre: 'sin-encabezado', descripcion: null, archivo: '.claude/skills/sin-encabezado/SKILL.md' },
    ])
    expect(await skillsDelProyecto(join(raiz, 'Beta'))).toEqual([])

    const lista = await listarProyectos(raiz)
    const skills = lista.tipo === 'lista' ? lista.proyectos.map((p) => [p.nombre, p.skills]) : []
    expect(skills).toEqual([
      ['Alfa', 2],
      ['Beta', 0],
    ])
  })

  it('la grilla se relee cuando cambia una skill del proyecto', () => {
    expect(proyectoAfectado('Alfa/.claude/skills/deploy')).toBe('Alfa')
    expect(proyectoAfectado('Alfa\\.claude\\skills\\deploy\\SKILL.md')).toBe('Alfa')
    expect(proyectoAfectado('Alfa/.claude/skills/deploy/referencias/x.md')).toBeNull()
    expect(proyectoAfectado('Alfa/.claude/settings.json')).toBeNull()
  })
})

describe('Nuevo proyecto (R-7, C-10, R-14)', () => {
  const plantillas = join(
    import.meta.dirname,
    '..',
    'recursos',
    'plugins',
    'iridium',
    'skills',
    'iridium',
    'plantillas',
  )

  it('arma la plantilla básica del framework, sin corchetes en lo que lee Iridium', async () => {
    const r = await crearProyecto(raiz, 'Gamma', plantillas, new Date(2026, 10, 7))
    if (!r.ok) throw new Error(r.mensaje)
    expect((await readdir(r.ruta)).sort()).toEqual(['.proyecto.json', 'CLAUDE.md', 'docs'])
    expect((await readdir(join(r.ruta, 'docs'))).sort()).toEqual([
      'README.md',
      'decisiones.md',
      'estado.md',
      'perfil-proyecto.md',
      'scripts.md',
      'trabajo.md',
    ])
    const estado = await readFile(join(r.ruta, 'docs', 'estado.md'), 'utf8')
    expect(estado).toContain('**Proyecto:** Gamma')
    expect(estado).toContain('**Última actualización:** 2026-11-07')
    expect(estado).toContain('## Hito actual\n0 — Idea cruda — en curso')
    expect(estado).toContain('| 0 | Idea cruda | en curso |')
    expect(estado).toContain('## Próximo paso\nHito 0: escribir la idea cruda con lo que cuente el usuario')
    expect(estado).not.toMatch(/\[(Hasta|Una acción|N\]|nombre\])/)
    expect(await readFile(join(r.ruta, 'docs', 'README.md'), 'utf8')).toContain('**Framework:** 2026-11-07')
    const claude = await readFile(join(r.ruta, 'CLAUDE.md'), 'utf8')
    expect(claude).toContain('la skill `iridium`')
    expect(claude).not.toContain('Guardar en la raíz')
    expect(await readFile(join(r.ruta, 'docs', 'trabajo.md'), 'utf8')).not.toContain('T-1')
    expect(await readFile(join(r.ruta, 'docs', 'decisiones.md'), 'utf8')).not.toContain('D-001')
    expect(JSON.parse(await readFile(join(r.ruta, '.proyecto.json'), 'utf8'))).toMatchObject({
      estado: 'idea',
    })
  })

  it('el control no marca nada y la tarjeta muestra el hito 0 y el próximo paso', async () => {
    const r = await crearProyecto(raiz, 'Gamma', plantillas)
    if (!r.ok) throw new Error(r.mensaje)
    expect(await controlarProyecto(r.ruta)).toEqual([])
    const lista = await listarProyectos(raiz)
    const gamma = lista.tipo === 'lista' ? lista.proyectos.find((p) => p.nombre === 'Gamma') : undefined
    expect(gamma?.estado).toBe('idea')
    expect(JSON.stringify(gamma)).toContain('Hito 0: escribir la idea cruda con lo que cuente el usuario')
  })

  it('sin las plantillas no crea nada', async () => {
    expect(await crearProyecto(raiz, 'Gamma', join(raiz, 'no-existe'))).toMatchObject({ ok: false })
    expect(await readdir(raiz)).toEqual([])
  })
})

describe('candidatosVsCode (C-12)', () => {
  it('al lado de cada bin\\code.cmd del PATH, después las dos instalaciones, sin repetir', () => {
    const env = { LOCALAPPDATA: 'C:\\Users\\u\\AppData\\Local', ProgramFiles: 'C:\\Program Files' }
    expect(
      candidatosVsCode(
        [
          'C:\\Users\\u\\AppData\\Local\\Programs\\Microsoft VS Code\\bin\\code',
          'C:\\Users\\u\\AppData\\Local\\Programs\\Microsoft VS Code\\bin\\code.cmd',
          'D:\\Otra\\VS Code\\bin\\code.cmd',
        ],
        env,
      ),
    ).toEqual([
      join('C:\\Users\\u\\AppData\\Local\\Programs\\Microsoft VS Code', 'Code.exe'),
      join('D:\\Otra\\VS Code', 'Code.exe'),
      join('C:\\Program Files', 'Microsoft VS Code', 'Code.exe'),
    ])
  })
})

describe('argumentosVsCode (Archivos, DI-I3 tanda 12)', () => {
  it('la carpeta sola, o la carpeta y el archivo en su línea (la primera si no viene)', () => {
    expect(argumentosVsCode('C:PAlfa')).toEqual(['C:PAlfa'])
    expect(argumentosVsCode('C:PAlfa', { real: 'C:PAlfasrca.ts', linea: 12 })).toEqual([
      'C:PAlfa',
      '-g',
      'C:PAlfasrca.ts:12',
    ])
    expect(argumentosVsCode('C:PAlfa', { real: 'C:PAlfa\b.md', linea: null })).toEqual([
      'C:PAlfa',
      '-g',
      'C:PAlfa\b.md:1',
    ])
  })
})

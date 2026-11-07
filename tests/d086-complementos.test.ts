// D-086 y OR-1: Iridium carga en sus conversaciones el framework (la skill de Iridium) y nada más: la guía de hitos ya
// no viaja (D-092).
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { elegirComplementos } from '../src/main/core/complementos'
import { correrControl, tieneFramework } from '../src/main/core/control'

const base = join('C:', 'app', 'plugins')

describe('elegirComplementos', () => {
  it('carga el framework, aunque haya otra cosa armada al lado', () => {
    const armados = new Set([
      join(base, 'iridium', '.claude-plugin', 'plugin.json'),
      join(base, 'guia', '.claude-plugin', 'plugin.json'),
    ])
    expect(elegirComplementos(base, (r) => armados.has(r))).toEqual([join(base, 'iridium')])
  })

  it('sin el framework armado, no carga nada', () => {
    expect(elegirComplementos(base, () => false)).toEqual([])
  })
})

const carpeta = join('recursos', 'plugins', 'iridium')
const skill = join(carpeta, 'skills', 'iridium')
const leer = (...r: string[]) => readFile(join(skill, ...r), 'utf8')

async function todos(dir: string): Promise<string[]> {
  const entradas = await readdir(dir, { withFileTypes: true })
  const hijos = await Promise.all(
    entradas.map((e) => (e.isDirectory() ? todos(join(dir, e.name)) : Promise.resolve([join(dir, e.name)]))),
  )
  return hijos.flat()
}

describe('el framework (OR-1)', () => {
  it('tiene su manifiesto y su SKILL.md con nombre y descripción', async () => {
    expect(JSON.parse(await readFile(join(carpeta, '.claude-plugin', 'plugin.json'), 'utf8')).name).toBe(
      'iridium',
    )
    expect(await leer('SKILL.md')).toMatch(/^---\r?\nname: iridium\r?\ndescription: .+\r?\n---/)
  })

  it('cada referencia y plantilla que nombra SKILL.md existe, y hay una referencia por hito', async () => {
    const texto = await leer('SKILL.md')
    const citadas = new Set(texto.match(/(?:referencias|plantillas)\/[\w/-]+\.md/g) ?? [])
    expect(citadas.size).toBeGreaterThan(15)
    const existentes = (await todos(skill)).map((r) => r.slice(skill.length + 1).replaceAll('\\', '/'))
    for (const c of citadas) expect(existentes, c).toContain(c)
    for (let h = 0; h <= 10; h++) {
      const prefijo = `referencias/${String(h).padStart(2, '0')}-`
      expect(
        existentes.some((e) => e.startsWith(prefijo)),
        prefijo,
      ).toBe(true)
    }
  })

  it('las pruebas van solo con casillas (Q-115) y un comentario de la Revisión se cierra o se anota', async () => {
    const texto = await leer('SKILL.md')
    expect(texto).toContain('solo casillas')
    expect(texto).toContain('cerrado por la IA')
    expect(texto).toContain('anotado por la IA')
    const ejemplo = texto.slice(texto.indexOf('**Q-4 —'), texto.indexOf('```', texto.indexOf('**Q-4 —')))
    expect(ejemplo).not.toContain('Opciones:')
  })

  it('ningún archivo nombra los proyectos ni las carpetas de nadie (D-082)', async () => {
    for (const r of await todos(skill)) {
      const texto = await readFile(r, 'utf8')
      expect(texto, r).not.toMatch(/\b[A-Z]:\\|PROYECTOS/)
      expect(texto, r).not.toMatch(/bedrock|nexus|mesiversario|minecraft/i)
    }
  })

  it('las plantillas ya no tienen las listas ni los estados de antes', async () => {
    const plantillas = (await todos(join(skill, 'plantillas'))).filter((r) => r.endsWith('.md'))
    for (const r of plantillas) {
      const texto = await readFile(r, 'utf8')
      expect(texto, r).not.toMatch(/\b(saltado|reabierto|bloqueado|validado)\b/)
      expect(texto, r).not.toMatch(
        /^## Pendientes|Ideas para después|Formato de la guía|hitos-desarrollo-app/m,
      )
    }
  })

  it('un proyecto recién armado con las plantillas pasa el control sin avisos', async () => {
    const conFecha = (t: string) => t.replaceAll('AAAA-MM-DD', '2026-11-06')
    expect(tieneFramework(conFecha(await leer('plantillas', 'README-docs.md')))).toBe(true)
    const avisos = correrControl({
      estados: [{ ruta: 'docs/estado.md', texto: conFecha(await leer('plantillas', 'estado.md')) }],
      trabajo: conFecha(await leer('plantillas', 'trabajo.md')),
      respuestas: new Map(),
      documentos: [],
      frentes: [],
    })
    expect(avisos).toEqual([])
  })

  it('el ejemplo de preguntas del SKILL.md pasa el control', async () => {
    const texto = (await leer('SKILL.md')).replaceAll('\r\n', '\n')
    const marca = '```markdown\n## Preguntas abiertas'
    const desde = texto.indexOf(marca) + '```markdown\n'.length
    const ejemplo = texto.slice(desde, texto.indexOf('```', desde))
    const estado = `# Estado\n\n**Última actualización:** 2026-11-06\n\n## Hito actual\n7 — Construcción — en curso\n\n${ejemplo}\n## Próximo paso\nSeguir.\n`
    const avisos = correrControl({
      estados: [{ ruta: 'docs/estado.md', texto: estado }],
      trabajo: '# Trabajo\n',
      respuestas: new Map(),
      documentos: [],
      frentes: [{ carpeta: 'compartir', nombre: 'Compartir' }],
    })
    expect(avisos).toEqual([])
  })
})

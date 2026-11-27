// Frente Plantillas (D-208): las recetas del framework. Cada una dice para qué tipos de app vale, cuándo se aplica y
// cómo se prueba, y SKILL.md nombra todas las que hay (y ninguna que no exista).
import { readdirSync, readFileSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const MARCO = join('recursos', 'plugins', 'iridium', 'skills', 'iridium')
const RECETAS = join(MARCO, 'recetas')

describe('las recetas del framework', () => {
  const archivos = readdirSync(RECETAS).filter((a) => a.endsWith('.md'))
  const skill = readFileSync(join(MARCO, 'SKILL.md'), 'utf8')

  it('están las dos primeras', () => {
    expect(archivos.sort()).toEqual(['actualizacion-sola.md', 'pruebas-sin-ventanas.md'])
  })

  it.each(archivos)('%s tiene título, Para, Se aplica y Cómo se prueba', async (a) => {
    const lineas = (await readFile(join(RECETAS, a), 'utf8')).split(/\r?\n/)
    expect(lineas[0]).toMatch(/^# \S/)
    expect(lineas[2]).toMatch(/^\*\*Para:\*\* \S/)
    expect(lineas[3]).toMatch(/^\*\*Se aplica:\*\* \S/)
    expect(lineas).toContain('## Cómo se prueba')
  })

  it('SKILL.md › Las recetas nombra cada una, y lo que cita de recetas/ existe', () => {
    for (const a of archivos) expect(skill).toContain(`\`recetas/${a}\``)
    const citadas = [...skill.matchAll(/`recetas\/([\w-]+\.md)`/g)].map((m) => m[1])
    for (const c of citadas) expect(archivos).toContain(c)
  })

  it('el framework ya no cita la guía en su lugar viejo', async () => {
    const refs = await readdir(join(MARCO, 'referencias'))
    expect(refs).not.toContain('actualizacion-sola.md')
    expect(skill).not.toContain('referencias/actualizacion-sola.md')
  })
})

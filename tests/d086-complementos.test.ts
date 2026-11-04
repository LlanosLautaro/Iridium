// D-086: Iridium carga en sus conversaciones la skill de Iridium siempre, y la guía de hitos solo si la PC no la tiene.
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { elegirComplementos } from '../src/main/core/complementos'

const base = join('C:', 'app', 'plugins')
const claude = join('C:', 'Usuarios', 'alguien', '.claude')
const conGuia = join(claude, 'skills', 'hitos-desarrollo-app', 'SKILL.md')
const armados = new Set([
  join(base, 'iridium', '.claude-plugin', 'plugin.json'),
  join(base, 'guia', '.claude-plugin', 'plugin.json'),
])

describe('elegirComplementos', () => {
  it('sin la guía instalada (quien recibe Iridium), carga las dos', () => {
    expect(elegirComplementos(base, claude, (r) => armados.has(r))).toEqual([
      join(base, 'iridium'),
      join(base, 'guia'),
    ])
  })

  it('con la guía instalada, usa esa: solo la skill de Iridium', () => {
    expect(elegirComplementos(base, claude, (r) => armados.has(r) || r === conGuia)).toEqual([
      join(base, 'iridium'),
    ])
  })

  it('una versión armada sin la guía no la ofrece', () => {
    const soloIridium = (r: string) => r === join(base, 'iridium', '.claude-plugin', 'plugin.json')
    expect(elegirComplementos(base, claude, soloIridium)).toEqual([join(base, 'iridium')])
  })
})

describe('la skill de Iridium', () => {
  const carpeta = join('recursos', 'plugins', 'iridium')

  it('tiene su manifiesto y su SKILL.md con nombre y descripción', async () => {
    expect(JSON.parse(await readFile(join(carpeta, '.claude-plugin', 'plugin.json'), 'utf8')).name).toBe(
      'iridium',
    )
    const skill = await readFile(join(carpeta, 'skills', 'iridium', 'SKILL.md'), 'utf8')
    expect(skill).toMatch(/^---\r?\nname: iridium\r?\ndescription: .+\r?\n---/)
  })

  it('dice que las pruebas van solo con casillas (Q-115) y cómo se cierra un comentario de la Revisión', async () => {
    const skill = await readFile(join(carpeta, 'skills', 'iridium', 'SKILL.md'), 'utf8')
    expect(skill).toContain('Las pruebas y las tareas van solo con casillas')
    expect(skill).toContain('cerrado por la IA')
    // El ejemplo de prueba no trae «Todo bien».
    const ejemplo = skill.slice(skill.indexOf('**Q-4 —'), skill.indexOf('```', skill.indexOf('**Q-4 —')))
    expect(ejemplo).not.toContain('Todo bien')
  })

  it('no nombra los proyectos ni las carpetas de nadie (D-082)', async () => {
    const skill = await readFile(join(carpeta, 'skills', 'iridium', 'SKILL.md'), 'utf8')
    expect(skill).not.toMatch(/[A-Z]:[\\/]|PROYECTOS/)
    expect(existsSync(join(carpeta, 'skills', 'iridium', 'SKILL.md'))).toBe(true)
  })
})

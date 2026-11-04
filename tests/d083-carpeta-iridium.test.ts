// D-083: la carpeta Iridium con Ideas y Skills, aparte de los proyectos; crearlas al abrir y mudar las de antes con
// lo que depende de su ruta (enlaces de las skills, conversaciones de Claude Code, lo que recuerda Iridium).
import { mkdir, mkdtemp, readdir, readFile, readlink, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { listarProyectos } from '../src/main/app/proyectos'
import { carpetaDeConversaciones, rutaMudada } from '../src/main/core/carpeta-iridium'
import { instruccionGeneral } from '../src/main/core/sesiones'
import {
  moverCarpeta,
  moverConversaciones,
  prepararCarpetaIridium,
  reenlazarSkills,
} from '../src/main/infra/carpeta-iridium'
import { ArchivoEscritos } from '../src/main/infra/escritos'
import { ArchivoSesiones } from '../src/main/infra/sesiones'

let base: string
let raiz: string
let iridium: string

async function archivo(ruta: string, texto: string) {
  await mkdir(join(ruta, '..'), { recursive: true })
  await writeFile(ruta, texto)
}

beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-d083-'))
  raiz = join(base, 'Proyectos')
  iridium = join(base, 'Iridium')
  await mkdir(join(raiz, 'Alfa'), { recursive: true })
})
afterEach(async () => {
  await rm(base, { recursive: true, force: true, maxRetries: 5 })
})

describe('prepararCarpetaIridium', () => {
  it('sin nada, crea Ideas y Skills con lo mínimo y no hay mudanza', async () => {
    const r = await prepararCarpetaIridium(iridium, raiz)
    expect(r).toEqual({
      rutas: { ideas: join(iridium, 'Ideas'), skills: join(iridium, 'Skills') },
      mudanza: null,
    })
    expect((await readdir(join(iridium, 'Ideas'))).sort()).toEqual(['CLAUDE.md', 'ideas.md'])
    expect((await readdir(join(iridium, 'Skills'))).sort()).toEqual(['CLAUDE.md', 'skills'])
    expect(await readFile(join(iridium, 'Ideas', 'ideas.md'), 'utf8')).toContain('## Integradas')
  })

  it('no pisa lo que ya está', async () => {
    await archivo(join(iridium, 'Ideas', 'CLAUDE.md'), '# Mías\n')
    await prepararCarpetaIridium(iridium, raiz)
    expect(await readFile(join(iridium, 'Ideas', 'CLAUDE.md'), 'utf8')).toBe('# Mías\n')
  })

  it('con las de antes en la carpeta de proyectos, las usa, ofrece mudarlas y no crea las nuevas', async () => {
    await archivo(join(raiz, 'Ideas', 'ideas.md'), '# Ideas\n')
    await archivo(join(raiz, 'Skills y Claude', 'CLAUDE.md'), '# Skills\n')
    const r = await prepararCarpetaIridium(iridium, raiz)
    expect(r.rutas).toEqual({ ideas: join(raiz, 'Ideas'), skills: join(raiz, 'Skills y Claude') })
    expect(r.mudanza).toEqual(r.rutas)
    expect(await readdir(base)).not.toContain('Iridium')
  })

  it('si solo falta mudar una, la otra se crea en la carpeta Iridium', async () => {
    await archivo(join(raiz, 'Ideas', 'ideas.md'), '# Ideas\n')
    const r = await prepararCarpetaIridium(iridium, raiz)
    expect(r.rutas).toEqual({ ideas: join(raiz, 'Ideas'), skills: join(iridium, 'Skills') })
    expect(r.mudanza).toEqual({ ideas: join(raiz, 'Ideas'), skills: null })
  })
})

describe('listarProyectos con la carpeta Iridium', () => {
  it('Ideas y Skills llegan aparte; las de antes no salen en la grilla', async () => {
    await archivo(join(raiz, 'Ideas', 'ideas.md'), '# Ideas\n')
    const enDisco = await prepararCarpetaIridium(iridium, raiz)
    const lista = await listarProyectos(raiz, iridium, enDisco)
    if (lista.tipo !== 'lista') throw new Error(lista.tipo)
    expect(lista.proyectos.map((p) => p.nombre)).toEqual(['Alfa'])
    expect(lista.iridium.carpeta).toBe(iridium)
    expect(lista.iridium.ideas?.ruta).toBe(join(raiz, 'Ideas'))
    expect(lista.iridium.skills?.ruta).toBe(join(iridium, 'Skills'))
    expect(lista.iridium.mudanza).toEqual({ ideas: join(raiz, 'Ideas'), skills: null })
  })

  it('sin carpeta de proyectos, Ideas y Skills igual están', async () => {
    const enDisco = await prepararCarpetaIridium(iridium, join(base, 'no-existe'))
    const lista = await listarProyectos(join(base, 'no-existe'), iridium, enDisco)
    expect(lista.tipo).toBe('error')
    expect(lista.iridium.ideas?.ruta).toBe(join(iridium, 'Ideas'))
  })
})

describe('la mudanza', () => {
  it('mueve la carpeta entera y no pisa una que ya existe', async () => {
    await archivo(join(raiz, 'Ideas', '.git', 'HEAD'), 'ref: refs/heads/main\n')
    await archivo(join(raiz, 'Ideas', 'ideas.md'), '# Ideas\n')
    await moverCarpeta(join(raiz, 'Ideas'), join(iridium, 'Ideas'))
    expect((await readdir(join(iridium, 'Ideas'))).sort()).toEqual(['.git', 'ideas.md'])
    expect(await readdir(raiz)).toEqual(['Alfa'])
    await mkdir(join(raiz, 'Otra'))
    await expect(moverCarpeta(join(raiz, 'Otra'), join(iridium, 'Ideas'))).rejects.toThrow('Ya existe')
  })

  it('rehace los enlaces de las skills propias y deja los demás', async () => {
    const antes = join(raiz, 'Skills y Claude')
    const despues = join(iridium, 'Skills')
    const claude = join(base, '.claude')
    await archivo(join(antes, 'skills', 'guia', 'SKILL.md'), '# guía\n')
    await archivo(join(base, 'afuera', 'ajena', 'SKILL.md'), '# ajena\n')
    await mkdir(join(claude, 'skills'), { recursive: true })
    await symlink(join(antes, 'skills', 'guia'), join(claude, 'skills', 'guia'), 'junction')
    await symlink(join(base, 'afuera', 'ajena'), join(claude, 'skills', 'ajena'), 'junction')
    await moverCarpeta(antes, despues)
    expect(await reenlazarSkills(claude, antes, despues)).toEqual([])
    expect(await readlink(join(claude, 'skills', 'guia'))).toMatch(
      /Iridium[\\/]Skills[\\/]skills[\\/]guia[\\/]?$/,
    )
    expect(await readFile(join(claude, 'skills', 'guia', 'SKILL.md'), 'utf8')).toBe('# guía\n')
    expect(await readlink(join(claude, 'skills', 'ajena'))).toMatch(/afuera[\\/]ajena[\\/]?$/)
  })

  it('lleva las conversaciones de Claude Code; si ya había, las suma', async () => {
    const claude = join(base, '.claude')
    const antes = join(raiz, 'Ideas')
    const despues = join(iridium, 'Ideas')
    // Claude Code a veces guarda la letra del disco en minúscula.
    const vieja = carpetaDeConversaciones(antes).replace(/^./, (l) => l.toLowerCase())
    await archivo(join(claude, 'projects', vieja, 'a.jsonl'), '{}\n')
    await moverConversaciones(claude, antes, despues)
    expect(await readdir(join(claude, 'projects', carpetaDeConversaciones(despues)))).toEqual(['a.jsonl'])

    await archivo(join(claude, 'projects', vieja, 'b.jsonl'), '{}\n')
    await moverConversaciones(claude, antes, despues)
    expect((await readdir(join(claude, 'projects', carpetaDeConversaciones(despues)))).sort()).toEqual([
      'a.jsonl',
      'b.jsonl',
    ])
  })

  it('lo que recuerda Iridium pasa a la ruta nueva', async () => {
    const sesiones = new ArchivoSesiones(join(base, 'datos', 'sesiones.json'))
    const escritos = new ArchivoEscritos(join(base, 'datos', 'escritos.json'))
    const resumen = {
      ruta: 'C:/P/Ideas',
      empezadaEn: 'iridium' as const,
      ultimoUso: 1,
      detenida: false,
      ultimoEstado: 'terminada' as const,
      preguntas: [],
    }
    await sesiones.guardar('uno', resumen)
    await sesiones.guardar('dos', resumen)
    await sesiones.guardar('otra', { ...resumen, ruta: 'C:/P/Alfa' })
    await escritos.guardar('C:/P/Ideas', 'a medio escribir')
    await sesiones.mudarRuta('C:/P/Ideas', 'C:/I/Ideas')
    await escritos.mudarRuta('C:/P/Ideas', 'C:/I/Ideas')
    const releidas = new ArchivoSesiones(join(base, 'datos', 'sesiones.json'))
    expect((await releidas.de('uno'))?.ruta).toBe('C:/I/Ideas')
    expect((await releidas.de('dos'))?.ruta).toBe('C:/I/Ideas')
    expect((await releidas.de('otra'))?.ruta).toBe('C:/P/Alfa')
    const todos = await new ArchivoEscritos(join(base, 'datos', 'escritos.json')).todos()
    expect([...todos]).toEqual([['C:/I/Ideas', 'a medio escribir']])
  })
})

describe('rutaMudada', () => {
  it('cambia lo que está adentro, sin distinguir mayúsculas, y deja lo de afuera', () => {
    expect(rutaMudada('D:\\P\\Skills y Claude\\skills\\x', 'd:\\p\\skills y claude', 'D:\\I\\Skills')).toBe(
      join('D:\\I\\Skills', 'skills', 'x'),
    )
    expect(rutaMudada('D:\\P\\Skills y Claude', 'D:\\P\\Skills y Claude', 'D:\\I\\Skills')).toBe(
      'D:\\I\\Skills',
    )
    expect(rutaMudada('D:\\P\\Skills y Claude 2\\x', 'D:\\P\\Skills y Claude', 'D:\\I\\Skills')).toBeNull()
    expect(rutaMudada('E:\\otra\\x', 'D:\\P\\Skills y Claude', 'D:\\I\\Skills')).toBeNull()
  })
})

describe('la instrucción del chat general', () => {
  it('dice dónde está la carpeta de proyectos', () => {
    expect(instruccionGeneral('D:\\Proyectos')).toContain('La carpeta de proyectos es D:\\Proyectos')
  })
})

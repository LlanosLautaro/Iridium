import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { listarProyectos } from '../src/main/app/proyectos'
import { ArchivoConfig } from '../src/main/infra/config'
import { vigilar } from '../src/main/infra/vigilancia'
import { estadoDeCuenta } from '../src/main/motor/sdk'

let raiz: string
beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-app-'))
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true })
})

async function proyecto(nombre: string, archivos: Record<string, string>) {
  for (const [ruta, texto] of Object.entries(archivos)) {
    await mkdir(join(raiz, nombre, ruta, '..'), { recursive: true })
    await writeFile(join(raiz, nombre, ruta), texto)
  }
}
const ficha = (estado: string, extra: Record<string, unknown> = {}) =>
  JSON.stringify({
    version: 1,
    descripcion: `Proyecto ${estado}`,
    estado,
    etiquetas: [],
    icono: null,
    archivado: false,
    reemplazadoPor: null,
    ...extra,
  })

describe('listarProyectos', () => {
  it('arma las tarjetas con ícono, hito y preguntas, en el orden de H-1', async () => {
    await proyecto('Alfa', {
      '.proyecto.json': ficha('en-desarrollo', { icono: '.proyecto-icono.svg' }),
      '.proyecto-icono.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>',
      'docs/estado.md':
        '# Estado\n\n## Hito actual\n7 — Construcción\n\n## Preguntas abiertas\n- **Q-3 — ¿Sí?**\n  Tipo: decisión · frena\n- **Q-4 — ¿No?**\n  Contexto: x\n\n## Próximo paso\nI-2.\n',
      'docs/respuestas/Q-4.md': '# Q-4 — ¿No?\n\nNo.\n',
      'docs/modulos/puente/estado.md': '## Preguntas abiertas\n- **Q-5 — ¿Módulo?**\n  Contexto: y\n',
    })
    await proyecto('Archivo', { '.proyecto.json': ficha('en-uso', { archivado: true }) })
    await proyecto('Idea', { '.proyecto.json': ficha('idea') })
    await proyecto('Suelto', { 'README.md': 'sin ficha' })
    await mkdir(join(raiz, '.oculta'))
    await writeFile(join(raiz, 'nota.txt'), 'no es un proyecto')

    const lista = await listarProyectos(raiz)
    if (lista.tipo !== 'lista') throw new Error('debería ser una lista')
    expect(lista.proyectos.map((p) => p.nombre)).toEqual(['Alfa', 'Idea', 'Suelto', 'Archivo'])
    const alfa = lista.proyectos[0]
    expect(alfa?.icono).toMatch(/^data:image\/svg\+xml;base64,/)
    expect(alfa?.hito).toEqual({ numero: 7, nombre: 'Construcción', proximoPaso: 'I-2.' })
    expect(alfa?.preguntas).toEqual({ sinResponder: 2, frenan: 1, respondidas: 1 })
    expect(lista.proyectos[2]?.estado).toBeNull()
  })

  it('un ícono que no existe o sale de la carpeta del proyecto se muestra como la inicial', async () => {
    await proyecto('A', { '.proyecto.json': ficha('idea', { icono: 'no-esta.svg' }) })
    await proyecto('B', { '.proyecto.json': ficha('idea', { icono: '../A/.proyecto.json' }) })
    const lista = await listarProyectos(raiz)
    if (lista.tipo !== 'lista') throw new Error('debería ser una lista')
    expect(lista.proyectos.map((p) => p.icono)).toEqual([null, null])
  })

  it('una carpeta que no existe es un error con su ruta, no una excepción', async () => {
    const lista = await listarProyectos(join(raiz, 'no-existe'))
    expect(lista).toMatchObject({ tipo: 'error', raiz: join(raiz, 'no-existe') })
  })

  it('una carpeta vacía es una lista vacía', async () => {
    expect(await listarProyectos(raiz)).toMatchObject({ tipo: 'lista', raiz, proyectos: [] })
  })
})

describe('ArchivoConfig', () => {
  it('arranca con los valores de siempre, guarda y vuelve a leer', async () => {
    const archivo = join(raiz, 'datos', 'config.json')
    const c = new ArchivoConfig(archivo)
    expect(await c.leer()).toMatchObject({
      verArchivados: false,
      anchoConversacion: { proyectos: {} },
      anchoListaSkills: 264,
      anchoListaIdeas: 264,
      anchoHoja: 'normal',
      pestanas: [],
    })
    await c.guardar({ verArchivados: true, raiz: 'E:/P' })
    const otra = await new ArchivoConfig(archivo).leer()
    expect(otra).toMatchObject({ verArchivados: true, raiz: 'E:/P' })
  })

  it('un config.json roto o con valores raros no frena la app', async () => {
    const archivo = join(raiz, 'config.json')
    await writeFile(archivo, '{ roto')
    expect((await new ArchivoConfig(archivo).leer()).anchoConversacion).toEqual({ proyectos: {} })
    await writeFile(
      archivo,
      JSON.stringify({
        verArchivados: 'sí',
        anchoConversacion: 5,
        anchoListaSkills: 9000,
        anchoListaIdeas: 12,
        anchoHoja: 'enorme',
      }),
    )
    expect(await new ArchivoConfig(archivo).leer()).toMatchObject({
      verArchivados: false,
      anchoConversacion: { proyectos: {} },
      anchoListaSkills: 264,
      anchoListaIdeas: 264,
      anchoHoja: 'normal',
    })
  })

  it('las preferencias del panel desplegable (D-031) se dejan de guardar', async () => {
    const archivo = join(raiz, 'viejo.json')
    await writeFile(
      archivo,
      JSON.stringify({ verArchivados: true, conversacionALaDerecha: true, anchoPanel: 500 }),
    )
    const c = await new ArchivoConfig(archivo).leer()
    expect(c).toMatchObject({ verArchivados: true, anchoConversacion: { proyectos: {} } })
    expect(c).not.toHaveProperty('anchoPanel')
    expect(c).not.toHaveProperty('conversacionALaDerecha')
  })
})

describe('vigilar', () => {
  it('avisa una vez por ráfaga, con los proyectos que cambiaron', async () => {
    await proyecto('Alfa', { 'docs/estado.md': 'a', 'src/x.ts': '1' })
    const avisos: string[][] = []
    const v = vigilar(raiz, (p) => avisos.push([...p]), 100)
    try {
      await new Promise((r) => setTimeout(r, 100))
      await writeFile(join(raiz, 'Alfa', 'src', 'x.ts'), '2')
      await writeFile(join(raiz, 'Alfa', 'docs', 'estado.md'), 'b')
      await writeFile(join(raiz, 'Alfa', 'docs', 'estado.md'), 'c')
      await new Promise((r) => setTimeout(r, 600))
      expect(avisos).toEqual([['Alfa']])
      expect(await readFile(join(raiz, 'Alfa', 'docs', 'estado.md'), 'utf8')).toBe('c')
    } finally {
      v.cerrar()
    }
  })
})

describe('estadoDeCuenta (verificar)', () => {
  it('con la suscripción, listo', () => {
    expect(estadoDeCuenta({ email: 'a@b', subscriptionType: 'Claude Pro', apiKeySource: 'none' })).toEqual({
      tipo: 'listo',
      suscripcion: 'Claude Pro',
      modelos: [],
    })
  })
  it('una clave de API pisando la suscripción se avisa', () => {
    expect(estadoDeCuenta({ apiKeySource: 'ANTHROPIC_API_KEY' })).toEqual({
      tipo: 'clave-api',
      origen: 'ANTHROPIC_API_KEY',
    })
  })
  it('con la cuenta de antes pero sin sesión según auth status, sin sesión (R-5)', () => {
    expect(estadoDeCuenta({ email: 'a@b', apiKeySource: 'none' }, false)).toEqual({ tipo: 'sin-sesion' })
    expect(estadoDeCuenta({ email: 'a@b', apiKeySource: 'none' }, null).tipo).toBe('listo')
  })
  it('sin datos de cuenta, sin sesión', () => {
    expect(estadoDeCuenta({})).toEqual({ tipo: 'sin-sesion' })
  })
})

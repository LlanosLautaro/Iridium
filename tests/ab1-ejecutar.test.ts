// AB-I1 (frente Abrir, D-156): la marca `**Marca:**` en `docs/scripts.md`, su control, qué ejecuta cada proyecto (la
// tarjeta) y Ejecutar Alfa con el programa que todavía no está armado (AB-2). Con carpetas temporales.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { listarProyectos } from '../src/main/app/proyectos'
import { DocumentosProyecto } from '../src/main/app/visor'
import { puedeArmarse, queEjecuta } from '../src/main/core/abrir'
import { type ArchivosControl, correrControl } from '../src/main/core/control'
import { leerMarca, leerScripts } from '../src/main/core/visor/scripts'
import { ejecutarPlan } from '../src/main/infra/ejecutar'

const SCRIPTS = `# Scripts

## Abrir la app
La versión armada, con los **últimos** cambios.
**Ejecutar:** \`dist/Alfa.exe\`
**Marca:** ejecutar · escritorio

## Armar la app
Arma la versión de uso. Cerrala antes.
**Ejecutar:** \`npm run armar\`
**Marca:** armar

## Ver la documentación
**Abrir:** \`https://ejemplo.com/docs\`
`

function control(scripts: string): string[] {
  const a: ArchivosControl = {
    estados: [],
    trabajo: '# Trabajo\n',
    respuestas: new Map(),
    documentos: [{ ruta: 'docs/scripts.md', texto: scripts }],
    frentes: [],
  }
  return correrControl(a)
    .filter((x) => x.regla === 'scripts')
    .map((x) => `${x.linea}: ${x.texto}`)
}

describe('la marca en scripts.md', () => {
  it('lee cada tipo, con o sin acento y comillas', () => {
    expect(leerMarca('ejecutar · escritorio')).toEqual({ tipo: 'ejecutar', como: 'escritorio' })
    expect(leerMarca('ejecutar · página')).toEqual({ tipo: 'ejecutar', como: 'pagina' })
    expect(leerMarca('`Ejecutar · consola`')).toEqual({ tipo: 'ejecutar', como: 'consola' })
    expect(leerMarca('armar')).toEqual({ tipo: 'armar' })
    expect(leerMarca('ejecutar')).toBeNull()
    expect(leerMarca('abrir · escritorio')).toBeNull()
  })

  it('la marca no queda en la descripción y las direcciones valen en **Abrir:**', () => {
    const s = leerScripts(SCRIPTS)
    expect(s.map((x) => x.marca)).toEqual([{ tipo: 'ejecutar', como: 'escritorio' }, { tipo: 'armar' }, null])
    expect(s[0]?.descripcion).toBe('La versión armada, con los **últimos** cambios.')
    expect(s[2]).toMatchObject({ accion: 'abrir', valor: 'https://ejemplo.com/docs' })
  })

  it('qué ejecuta el proyecto: el detalle según el tipo y la descripción, sin Markdown', () => {
    expect(queEjecuta(leerScripts(SCRIPTS))).toEqual({
      como: 'escritorio',
      detalle: 'Abre la app. La versión armada, con los últimos cambios.',
    })
    expect(puedeArmarse(leerScripts(SCRIPTS))).toBe(true)
    expect(queEjecuta(leerScripts('## Correr\n**Ejecutar:** `npm start`\n'))).toBeNull()
    const pagina = '## Ver\n**Abrir:** `https://ejemplo.com`\n**Marca:** ejecutar · página\n'
    expect(queEjecuta(leerScripts(pagina))).toEqual({ como: 'pagina', detalle: 'Abre en el navegador.' })
    expect(puedeArmarse(leerScripts(pagina))).toBe(false)
  })
})

describe('el control de las marcas', () => {
  it('bien escritas, no dice nada', () => {
    expect(control(SCRIPTS)).toEqual([])
  })

  it('marca cada error del formato', () => {
    const mal = `# Scripts

## Uno
**Ejecutar:** \`npm start\`
**Marca:** ejecutar · consola

## Dos
**Ejecutar:** \`npm run dev\`
**Marca:** ejecutar · consola

## Tres
**Ejecutar:** \`npm run x\`
**Marca:** lanzar

## Cuatro
**Ejecutar:** \`npm run y\`
**Marca:** ejecutar · página

## Cinco
**Abrir:** \`docs\`
**Marca:** armar

## Seis
Sin acción.
**Marca:** ejecutar · escritorio

## Siete
**Ejecutar:** \`https://ejemplo.com\`
`
    const avisos = control(mal)
    expect(avisos).toEqual([
      expect.stringMatching(/^25: «Seis» tiene \*\*Marca:\*\* pero no/),
      expect.stringMatching(/^9: «Dos»: ya marca `ejecutar` «Uno»/),
      expect.stringMatching(/^13: «Tres»: la marca «lanzar» no se entiende/),
      expect.stringMatching(/^17: «Cuatro»: ya marca/),
      expect.stringMatching(/^17: «Cuatro»: `ejecutar · página` va con \*\*Abrir:\*\*/),
      expect.stringMatching(/^21: «Cinco»: `armar` va con \*\*Ejecutar:\*\*/),
      expect.stringMatching(/^27: «Siete»: una dirección web va con \*\*Abrir:\*\*/),
      expect.stringMatching(/^21: «Cinco»: `armar` pide otro script marcado `ejecutar · escritorio`/),
    ])
  })

  it('sin scripts.md, no dice nada', () => {
    expect(
      correrControl({ estados: [], trabajo: '', respuestas: new Map(), documentos: [], frentes: [] }).filter(
        (a) => a.regla === 'scripts',
      ),
    ).toEqual([])
  })
})

describe('Ejecutar Alfa', () => {
  let base: string
  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'iridium-ab1-'))
  })
  afterEach(async () => {
    await rm(base, { recursive: true, force: true })
  })

  async function proyecto(nombre: string, scripts: string | null): Promise<string> {
    const p = join(base, nombre)
    await mkdir(join(p, 'docs'), { recursive: true })
    await writeFile(join(p, 'docs', 'estado.md'), '# Estado\n\n## Hito actual\n7 — Construcción — en curso\n')
    if (scripts !== null) await writeFile(join(p, 'docs', 'scripts.md'), scripts)
    return p
  }

  async function documentos(p: string): Promise<DocumentosProyecto> {
    const d = new DocumentosProyecto(p, () => null)
    await d.cargar()
    return d
  }

  it('la tarjeta dice qué ejecuta solo con la marca', async () => {
    await proyecto('Alfa', SCRIPTS)
    await proyecto('Beta', '# Scripts\n\n## Correr\n**Ejecutar:** `npm start`\n')
    await proyecto('Gamma', null)
    const lista = await listarProyectos(base)
    if (lista.tipo !== 'lista') throw new Error('sin lista')
    const de = (n: string) => lista.proyectos.find((t) => t.nombre === n)?.ejecutar
    expect(de('Alfa')).toEqual({
      como: 'escritorio',
      detalle: 'Abre la app. La versión armada, con los últimos cambios.',
    })
    expect(de('Beta')).toBeNull()
    expect(de('Gamma')).toBeNull()
  })

  it('sin el programa armado, dice sin-armar y si sabe armarse (AB-2)', async () => {
    const p = await proyecto('Alfa', SCRIPTS)
    expect(await (await documentos(p)).prepararEjecutar()).toEqual({ tipo: 'sin-armar', armar: true })
    const solo = SCRIPTS.split('## Armar la app')[0] ?? ''
    const q = await proyecto('Beta', solo)
    expect(await (await documentos(q)).prepararEjecutar()).toEqual({ tipo: 'sin-armar', armar: false })
  })

  it('con el programa armado, lo abre con Windows; Armar ahora corre su comando a la vista', async () => {
    const p = await proyecto('Alfa', SCRIPTS)
    await mkdir(join(p, 'dist'))
    await writeFile(join(p, 'dist', 'Alfa.exe'), 'no es un programa')
    const d = await documentos(p)
    expect(await d.prepararEjecutar()).toEqual({
      tipo: 'sistema',
      nombre: 'Abrir la app',
      ruta: join(p, 'dist', 'Alfa.exe'),
      modo: 'lanzar',
    })
    expect(await d.prepararArmar()).toEqual({
      tipo: 'terminal',
      nombre: 'Armar la app',
      cwd: p,
      comando: 'npm run armar',
    })
  })

  it('una página con dirección la abre el navegador', async () => {
    const p = await proyecto(
      'Alfa',
      '## Ver\nEl sitio.\n**Abrir:** `https://ejemplo.com`\n**Marca:** ejecutar · página\n',
    )
    const plan = await (await documentos(p)).prepararEjecutar()
    expect(plan).toEqual({ tipo: 'web', nombre: 'Ver', direccion: 'https://ejemplo.com' })
    const abiertas: string[] = []
    if (plan.tipo !== 'web') throw new Error('no es web')
    const r = await ejecutarPlan(
      plan,
      async () => '',
      async (u) => {
        abiertas.push(u)
      },
    )
    expect(r.tipo).toBe('ok')
    expect(abiertas).toEqual(['https://ejemplo.com'])
  })

  it('sin la marca, Ejecutar no hace nada y lo dice', async () => {
    const p = await proyecto('Alfa', '## Correr\n**Ejecutar:** `npm start`\n')
    expect((await (await documentos(p)).prepararEjecutar()).tipo).toBe('error')
  })
})

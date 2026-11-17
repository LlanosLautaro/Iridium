// I-4 con un proyecto de verdad en una carpeta temporal: el Mapa (H-7), los documentos de Docs (H-8), Archivos (H-15)
// y las conversaciones anteriores (H-17, con el motor falso).
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { CambioConversacion } from '../src/compartido/puente'
import { Conversaciones } from '../src/main/app/conversacion'
import { Documentos } from '../src/main/app/documentos'
import { mapaDe } from '../src/main/app/mapa'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { LIMITE_TEXTO_BYTES } from '../src/main/core/archivos'
import { leerArchivo, leerCarpeta } from '../src/main/infra/archivos'
import { ejecutarPlan } from '../src/main/infra/ejecutar'
import { ArchivoSesiones } from '../src/main/infra/sesiones'
import { crearMotorFalso } from '../src/main/motor/motor'

let raiz: string
let carpeta: string

async function escribir(ruta: string, texto: string | Buffer) {
  await mkdir(join(carpeta, ruta, '..'), { recursive: true })
  await writeFile(join(carpeta, ruta), texto)
}

const ESTADO = `# Estado

## Hito actual
7 — Construcción — I-2 (conversar), en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 4 | UX | completo | \`04-ux.md\` |
| 6 | UI | en curso | \`06-ui.md\` |
| 7 | Construcción | en curso | \`07-construccion.md\` |

## Preguntas abiertas
- **Q-3 — ¿Probaste I-1?**
  Tipo: prueba · frena

## Próximo paso
Seguir con I-2 (ver D-5 y \`04-ux.md\` › H-1).
`

const MODULO = `# Estado del módulo: Diseño de la app

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | completo (D-9) | \`propuesta.md\` |
| 2. Definición | en curso | \`definicion.md\` |
| 3. Investigación | pendiente | \`investigacion.md\` |

## En qué estamos ahora
Definiendo el alcance.

## Preguntas abiertas
- **Q-4 — ¿Qué entra en el MVP del módulo?**
  Tipo: decisión

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| D-I1 | Biblioteca | pendiente |

## Próximo paso
Cerrar la definición.
`

beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-i4-'))
  carpeta = join(raiz, 'Alfa')
  await escribir('docs/estado.md', ESTADO)
  await escribir(
    'docs/04-ux.md',
    '# UX\n\n## H-1 — Ver los proyectos\nTexto.\n\n## Portón\n- [x] Historias.\n- [ ] Flujos.\n',
  )
  await escribir(
    'docs/07-construccion.md',
    '# Construcción\n\n## Plan\n| ID | Objetivo | Estado |\n|---|---|---|\n| I-1 | Esqueleto | aprobada |\n| I-2 | Conversar | pendiente |\n\n### I-1 — Esqueleto\nHecho.\n\n### I-2 — Conversar\nEn eso.\n',
  )
  await escribir('docs/decisiones.md', '# Decisiones\n\n## D-5 — Algo\nSí.\n')
  await escribir('docs/modulos/diseno/estado.md', MODULO)
  await escribir('docs/modulos/diseno/propuesta.md', '# Propuesta\n')
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

describe('Mapa (H-7)', () => {
  it('antes del hito 10, los hitos como camino; el actual con sus iteraciones como ramas; el frente con su camino', async () => {
    const d = await new Documentos().de(carpeta)
    const m = mapaDe(d, await leerPreguntasAbiertas(carpeta))
    if (m.tipo !== 'mapa') throw new Error(m.tipo)
    expect(m.hito).toEqual({ numero: 7, nombre: 'Construcción' })
    expect(m.documento).toBe('docs/07-construccion.md')
    expect(m.hitos?.map((h) => [h.texto, h.marca, h.destino?.documento ?? null])).toEqual([
      ['UX', 'hecho', 'docs/04-ux.md'],
      ['UI', 'viene', null],
      ['Construcción', 'viene', 'docs/07-construccion.md'],
    ])
    // Hito 7: las iteraciones como ramas, sin el código, cada una a su sección (D-142, MA-5).
    expect(m.hitos?.[2]?.ramas).toEqual([
      {
        texto: 'Esqueleto',
        marca: 'hecho',
        espera: null,
        destino: { documento: 'docs/07-construccion.md', ancla: 'i-1' },
        ramas: [],
      },
      {
        texto: 'Conversar',
        marca: 'viene',
        espera: null,
        destino: { documento: 'docs/07-construccion.md', ancla: 'i-2' },
        ramas: [],
      },
    ])
    // Los otros hitos no despliegan sus pasos.
    expect(m.hitos?.[0]?.ramas).toEqual([])
    // El frente, sin ruta: los pasos del método, cada uno a su documento (MA-9).
    expect(m.frentes).toHaveLength(1)
    const f = m.frentes[0]
    expect(f).toMatchObject({
      clave: 'diseno',
      nombre: 'Diseño de la app',
      documento: 'docs/modulos/diseno/estado.md',
      sinRuta: true,
      estado: 'en curso',
    })
    expect(f?.pasos.map((p) => [p.texto, p.marca, p.destino?.documento ?? null])).toEqual([
      ['1. Propuesta', 'hecho', 'docs/modulos/diseno/propuesta.md'],
      ['2. Definición', 'viene', null],
      ['3. Investigación', 'viene', null],
    ])
  })

  it('sin estado.md: «no sigue la guía» con sus documentos', async () => {
    await rm(join(carpeta, 'docs', 'estado.md'))
    await escribir('README.md', '# Alfa\n')
    const m = mapaDe(await new Documentos().de(carpeta), [])
    expect(m).toEqual({
      tipo: 'sin-guia',
      documentos: [
        'docs/04-ux.md',
        'docs/07-construccion.md',
        'docs/decisiones.md',
        'docs/modulos/diseno/estado.md',
        'docs/modulos/diseno/propuesta.md',
        'README.md',
      ],
    })
  })

  it('sin la tabla de hitos, el hito actual igual está en el camino', async () => {
    await escribir(
      'docs/estado.md',
      '# Estado\n\n## Hito actual\n3 — Investigación\n\n## Próximo paso\nLeer.\n',
    )
    const m = mapaDe(await new Documentos().de(carpeta), [])
    expect(m).toMatchObject({
      tipo: 'mapa',
      hito: { numero: 3, nombre: 'Investigación' },
      hitos: [{ texto: 'Investigación', marca: 'viene' }],
    })
  })
})

describe('Archivos (H-15)', () => {
  it('lista una carpeta sin node_modules ni .git, carpetas primero', async () => {
    await escribir('node_modules/x/index.js', '')
    await escribir('.git/HEAD', 'ref')
    await escribir('src/a.ts', 'const a = 1\n')
    await escribir('.claude/settings.json', '{}')
    const r = await leerCarpeta(carpeta, '')
    expect(r).toEqual({
      tipo: 'ok',
      hijos: [
        { nombre: '.claude', ruta: '.claude', tipo: 'carpeta' },
        { nombre: 'docs', ruta: 'docs', tipo: 'carpeta' },
        { nombre: 'src', ruta: 'src', tipo: 'carpeta' },
      ],
    })
    expect(await leerCarpeta(carpeta, 'src')).toEqual({
      tipo: 'ok',
      hijos: [{ nombre: 'a.ts', ruta: 'src/a.ts', tipo: 'archivo' }],
    })
  })

  it('no sale del proyecto', async () => {
    await mkdir(join(raiz, 'Otro'))
    await writeFile(join(raiz, 'Otro', 'secreto.txt'), 'no')
    expect(await leerCarpeta(carpeta, '../Otro')).toMatchObject({ tipo: 'error' })
    expect(await leerArchivo(carpeta, '../Otro/secreto.txt')).toMatchObject({ tipo: 'error' })
    expect(await leerArchivo(carpeta, 'node_modules/x/index.js')).toMatchObject({ tipo: 'error' })
  })

  it('texto con colores; un .md de docs también se abre en Docs', async () => {
    await escribir('src/a.ts', 'const a = 1\n')
    expect(await leerArchivo(carpeta, 'src/a.ts')).toEqual({
      tipo: 'texto',
      lineas: ['<span class="k">const</span> a = <span class="n">1</span>'],
      lenguaje: 'TypeScript',
      bytes: 12,
      documento: false,
    })
    expect(await leerArchivo(carpeta, 'docs/04-ux.md')).toMatchObject({ tipo: 'texto', documento: true })
  })

  it('una imagen se ve; lo binario, lo muy grande y lo que no existe lo dicen', async () => {
    const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex')
    await escribir('icono.png', png)
    await escribir('datos.bin', Buffer.from([1, 0, 2, 3]))
    await escribir('grande.txt', 'a'.repeat(LIMITE_TEXTO_BYTES + 1))
    expect(await leerArchivo(carpeta, 'icono.png')).toEqual({
      tipo: 'imagen',
      url: `data:image/png;base64,${png.toString('base64')}`,
      bytes: png.length,
    })
    expect(await leerArchivo(carpeta, 'datos.bin')).toEqual({ tipo: 'binario', bytes: 4 })
    expect(await leerArchivo(carpeta, 'grande.txt')).toEqual({
      tipo: 'grande',
      bytes: LIMITE_TEXTO_BYTES + 1,
    })
    expect(await leerArchivo(carpeta, 'no-esta.ts')).toEqual({ tipo: 'no-existe' })
  })
})

describe('Conversaciones anteriores (H-17)', () => {
  it('las lista con título y origen, y elegir una la muestra y la continúa', async () => {
    const cambios: CambioConversacion[] = []
    const registro = new ArchivoSesiones(join(raiz, 'datos', 'sesiones.json'))
    const docs = new Documentos()
    const c = new Conversaciones({
      motor: crearMotorFalso({ pasoMs: 5 }),
      registro,
      preguntas: leerPreguntasAbiertas,
      alCambio: (x) => cambios.push(x),
      html: async (ruta) => {
        const d = await docs.de(ruta)
        return (t) => d.html(t, '')
      },
    })
    // Cada turno avisa varios cambios con la ficha terminada (el contexto llega después): se espera a que no trabaje.
    const terminada = async (_n: number) => {
      const fin = Date.now() + 2000
      while (c.enMarcha().length > 0 || cambios.at(-1)?.ficha?.estado !== 'terminada') {
        if (Date.now() > fin) throw new Error('No terminó')
        await new Promise((r) => setTimeout(r, 5))
      }
    }
    await c.seguir(carpeta, { texto: 'La primera, ver D-5' })
    await terminada(1)
    await c.seguir(carpeta, { texto: 'Otra charla', nueva: true })
    await terminada(2)

    const lista = await c.lista(carpeta)
    expect(lista.map((x) => [x.titulo, x.origen])).toEqual([
      ['Otra charla', 'iridium'],
      ['La primera, ver D-5', 'iridium'],
    ])
    const vieja = lista[1]?.id ?? ''
    const v = await c.elegir(carpeta, vieja)
    expect(v.id).toBe(vieja)
    expect(v.titulo).toBe('La primera, ver D-5')
    expect(v.entradas[0]).toMatchObject({ tipo: 'usuario', texto: 'La primera, ver D-5' })
    // Volver a abrir el proyecto sigue mostrando la elegida, no la última.
    expect((await c.abrir(carpeta)).id).toBe(vieja)
    // Lo que se escribe la continúa; los códigos de la IA son enlaces a su sección (F-4).
    await c.seguir(carpeta, { texto: 'Sigo acá' })
    await terminada(3)
    expect(cambios.at(-1)?.id).toBe(vieja)
    const ia = (await c.abrir(carpeta)).entradas.find((e) => e.tipo === 'ia')
    expect(ia?.tipo === 'ia' && ia.html).toContain('data-doc="docs/estado.md"')
  })
})

describe('Scripts como botones (C-11, D-043)', () => {
  it('un comando corre en su consola, en la carpeta del proyecto; un archivo se abre con Windows', async () => {
    await escribir(
      'docs/scripts.md',
      '# Scripts\n\n## Dejar una marca\nEscribe un archivo.\n**Ejecutar:** `echo listo> marca.txt && exit`\n\n## Ver los docs\n**Abrir:** `docs`\n\n## Instalar\n**Ejecutar:** `dist/Instalador.exe`\n',
    )
    const d = await new Documentos().de(carpeta)
    expect(d.scripts().map((s) => [s.nombre, s.modo, s.falta])).toEqual([
      ['Dejar una marca', 'comando', null],
      ['Ver los docs', 'abrir', null],
      ['Instalar', 'lanzar', 'No se encuentra dist/Instalador.exe.'],
    ])
    const [marca, verDocs, instalar] = d.scripts()
    const abiertos: string[] = []
    const abrir = async (r: string) => {
      abiertos.push(r)
      return ''
    }
    expect(await ejecutarPlan(await d.prepararScript(marca?.id ?? ''), abrir)).toMatchObject({ tipo: 'ok' })
    const fin = Date.now() + 10_000
    while (!(await readFile(join(carpeta, 'marca.txt'), 'utf8').catch(() => ''))) {
      if (Date.now() > fin) throw new Error('El comando no corrió')
      await new Promise((r) => setTimeout(r, 100))
    }
    expect((await readFile(join(carpeta, 'marca.txt'), 'utf8')).trim()).toBe('listo')
    expect(await ejecutarPlan(await d.prepararScript(verDocs?.id ?? ''), abrir)).toEqual({
      tipo: 'ok',
      mensaje: 'Abierto.',
    })
    expect(abiertos).toEqual([join(carpeta, 'docs')])
    expect(await ejecutarPlan(await d.prepararScript(instalar?.id ?? ''), abrir)).toEqual({
      tipo: 'error',
      mensaje: 'No se encuentra dist/Instalador.exe.',
    })
    expect(await ejecutarPlan(await d.prepararScript('no-existe'), abrir)).toMatchObject({ tipo: 'error' })
  })
})

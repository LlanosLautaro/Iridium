// MA-I2: el Mapa nuevo en operación (D-141, D-144, D-145). Cada frente con su ruta: las marcas, las ramas, «Te espera»
// con la pregunta abierta, el paso que lleva a su iteración, lo aprobado sin lugar en la ruta y «Por empezar».
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Documentos } from '../src/main/app/documentos'
import { mapaDe } from '../src/main/app/mapa'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { listasDelMapa } from '../src/main/core/ruta'

let raiz: string

async function escribir(ruta: string, texto: string) {
  await mkdir(join(raiz, ruta, '..'), { recursive: true })
  await writeFile(join(raiz, ruta), texto)
}

const ESTADO = `# Estado del proyecto

## Hito actual
10 — Operación — en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 10 | Operación | en curso | \`10-operacion.md\` |

## Módulos
| Frente | Tipo | Paso | Estado |
|---|---|---|---|
| Notas (\`modulos/notas/estado.md\`) | sección | en operación | hecho |
| Mapa (\`modulos/mapa/estado.md\`) | sección | 7. Construcción | en curso |
| Avisos (\`modulos/avisos/estado.md\`) | sección | 8. Calidad | en pausa |
| Exportar (T-20) | sección | 1. Propuesta | pendiente |

## Preguntas abiertas
- **Q-5 — ¿Se ve bien el camino?**
  Tipo: prueba · Frente: Mapa

## Próximo paso
Seguir.
`

const MAPA = `# Estado del módulo: Mapa

**Tipo:** sección (el camino de cada frente; T-10)

## En qué estamos ahora
Construyendo.

## Ruta
- [x] Pensar para qué sirve (D-1)
- [x] Escribir la ruta en el framework (MA-I1)
- [ ] Dibujar el camino (Q-5)
  - [ ] Las ramas con su codo
  - [-] Un gráfico con Mermaid
- [ ] Ver lo que está por empezar (Q-4)
- [ ] Ubicar lo aprobado (T-11)

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| MA-I1 | La ruta en el framework | hecho |

### MA-I1 — La ruta en el framework
Hecho.
`

const AVISOS = `# Estado del módulo: Avisos

## Ruta
- [x] Avisar cuando termina
- [ ] Sonar al terminar
- [?] Algo que no se entiende
`

const NOTAS = `# Estado del módulo: Notas

## Ruta
- [x] Crear una nota
- [x] Buscar entre las notas
`

const TRABAJO = `# Trabajo

## T-10 — El Mapa como un camino
Estado: en curso · Frente: Mapa · Fecha: 2026-11-17

## T-11 — Ubicar lo aprobado
Estado: pendiente · Frente: Mapa · Fecha: 2026-11-17

## T-12 — Mostrar la ruta en el celular
Estado: pendiente · Frente: Mapa · Fecha: 2026-11-17

## T-20 — Exportar a un archivo
Estado: pendiente · Fecha: 2026-11-17

## T-21 — Exportar a PDF
Estado: pendiente · Frente: Exportar · Fecha: 2026-11-17

## T-30 — Un sonido al terminar, con un título larguísimo que tiene que bajar de renglón en la lista
Estado: pendiente · Fecha: 2026-11-17
`

beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-ma2-'))
  await escribir('docs/estado.md', ESTADO)
  await escribir('docs/README.md', '# Docs\n\n**Framework:** 2026-11-17\n')
  await escribir('docs/trabajo.md', TRABAJO)
  await escribir('docs/modulos/mapa/estado.md', MAPA)
  await escribir('docs/modulos/avisos/estado.md', AVISOS)
  await escribir('docs/modulos/notas/estado.md', NOTAS)
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

async function mapa() {
  const m = mapaDe(await new Documentos().de(raiz), await leerPreguntasAbiertas(raiz))
  if (m.tipo !== 'mapa') throw new Error(m.tipo)
  return m
}

describe('El Mapa en operación (MA-I2)', () => {
  it('la barra: el activo primero, después en el orden de la tabla, cada uno con su estado en palabras (MA-1, MA-3)', async () => {
    const m = await mapa()
    expect(m.hitos).toBeNull()
    expect(m.frentes.map((f) => [f.nombre, f.estado])).toEqual([
      ['Mapa', 'en curso'],
      ['Notas', 'en uso'],
      ['Avisos', 'en pausa'],
    ])
  })

  it('el camino: las marcas, las ramas, sin códigos; «Te espera» solo con la pregunta abierta (MA-1, MA-2)', async () => {
    const f = (await mapa()).frentes[0]
    expect(f?.sinRuta).toBe(false)
    expect(f?.pasos.map((p) => [p.texto, p.marca, p.espera])).toEqual([
      ['Pensar para qué sirve', 'hecho', null],
      ['Escribir la ruta en el framework', 'hecho', null],
      ['Dibujar el camino', 'viene', 'Q-5'],
      // Q-4 no está abierta: no espera a nadie.
      ['Ver lo que está por empezar', 'viene', null],
      ['Ubicar lo aprobado', 'viene', null],
    ])
    expect(f?.pasos[2]?.ramas.map((r) => [r.texto, r.marca])).toEqual([
      ['Las ramas con su codo', 'viene'],
      ['Un gráfico con Mermaid', 'descartado'],
    ])
  })

  it('un paso que nombra su iteración lleva a su sección en Docs (MA-4)', async () => {
    const f = (await mapa()).frentes[0]
    expect(f?.pasos[1]?.destino).toEqual({
      documento: 'docs/modulos/mapa/estado.md',
      ancla: 'ma-i1--la-ruta-en-el-framework',
    })
    expect(f?.pasos[0]?.destino).toBeNull()
  })

  it('lo aprobado sin lugar en la ruta: ni lo que la ruta nombra ni lo que originó el frente (MA-8)', async () => {
    const f = (await mapa()).frentes[0]
    expect(f?.sinLugar).toEqual([{ codigo: 'T-12', titulo: 'Mostrar la ruta en el celular' }])
  })

  it('una línea que no se entiende va tal cual, como «otro» (MA-9)', async () => {
    const avisos = (await mapa()).frentes[2]
    expect(avisos?.pasos.map((p) => [p.texto, p.marca])).toEqual([
      ['Avisar cuando termina', 'hecho'],
      ['Sonar al terminar', 'viene'],
      ['Algo que no se entiende', 'otro'],
    ])
  })

  it('«Por empezar»: el frente que espera con su trabajo y lo aprobado sin frente (MA-6)', async () => {
    const m = await mapa()
    expect(m.porEmpezar).toEqual({
      frentes: [{ nombre: 'Exportar', pasos: [{ codigo: 'T-21', titulo: 'Exportar a PDF' }] }],
      sinFrente: [
        {
          codigo: 'T-30',
          titulo:
            'Un sonido al terminar, con un título larguísimo que tiene que bajar de renglón en la lista',
          enCurso: false,
        },
      ],
    })
  })

  it('cuando la IA abre la carpeta del frente, deja «Por empezar» y aparece en la barra (MA-7)', async () => {
    await escribir(
      'docs/estado.md',
      ESTADO.replace(
        '| Exportar (T-20) | sección | 1. Propuesta | pendiente |',
        '| Exportar (`modulos/exportar/estado.md`; T-20) | sección | 1. Propuesta | pendiente |',
      ),
    )
    await escribir(
      'docs/modulos/exportar/estado.md',
      '# Estado del módulo: Exportar\n\n## Ruta\n- [ ] Exportar a PDF (T-21)\n',
    )
    const m = await mapa()
    expect(m.porEmpezar.frentes).toEqual([])
    expect(m.frentes.map((f) => [f.nombre, f.estado])).toContainEqual(['Exportar', 'sin empezar'])
    expect(m.frentes.find((f) => f.nombre === 'Exportar')?.sinLugar).toEqual([])
  })

  it('un frente sin ruta: los pasos del método (MA-9)', async () => {
    await escribir(
      'docs/modulos/notas/estado.md',
      '# Estado del módulo: Notas\n\n## Progreso\n| Paso | Estado |\n|---|---|\n| 1. Propuesta | hecho |\n| 2. Definición | descartado |\n| 3. UX | pendiente |\n',
    )
    const notas = (await mapa()).frentes[1]
    expect(notas?.sinRuta).toBe(true)
    expect(notas?.pasos.map((p) => [p.texto, p.marca])).toEqual([
      ['1. Propuesta', 'hecho'],
      ['2. Definición', 'descartado'],
      ['3. UX', 'viene'],
    ])
  })
})

describe('Los bordes del Mapa (MA-I3)', () => {
  it('un frente cuyo estado.md se borró: un Recuadro de error en su pestaña; los demás siguen (MA-12)', async () => {
    await rm(join(raiz, 'docs/modulos/avisos'), { recursive: true })
    const m = await mapa()
    expect(m.frentes.map((f) => [f.nombre, f.error === null])).toEqual([
      ['Mapa', true],
      ['Notas', true],
      ['Avisos', false],
    ])
    const avisos = m.frentes.find((f) => f.nombre === 'Avisos')
    expect(avisos?.estado).toBe('en pausa')
    expect(avisos?.pasos).toEqual([])
    expect(avisos?.error).toContain('docs/modulos/avisos/estado.md')
  })

  it('un estado.md sin ruta ni progreso, o vacío: el error dice qué le falta (MA-12)', async () => {
    await escribir('docs/modulos/notas/estado.md', '# Estado del módulo: Notas\n\nSin nada más.\n')
    await escribir('docs/modulos/avisos/estado.md', '')
    const m = await mapa()
    const de = (n: string) => m.frentes.find((f) => f.nombre === n)
    expect(de('Notas')?.error).toMatch(/no tiene camino/)
    expect(de('Notas')?.sinRuta).toBe(false)
    expect(de('Avisos')?.error).toMatch(/No se puede leer/)
    expect(de('Mapa')?.error).toBeNull()
  })

  it('un frente que espera sin carpeta sigue en «Por empezar», sin error', async () => {
    const m = await mapa()
    expect(m.frentes.some((f) => f.error !== null)).toBe(false)
    expect(m.porEmpezar.frentes.map((f) => f.nombre)).toEqual(['Exportar'])
  })
})

describe('listasDelMapa', () => {
  it('lo que nombra una ruta de otro frente no va a «Sin frente»', () => {
    const l = listasDelMapa(
      [{ nombres: ['Alfa'], ruta: { pasos: [], problemas: [] }, origen: [] }],
      [],
      [
        { codigo: 'T-1', titulo: 'Suelto', estado: 'pendiente', frente: null },
        { codigo: 'T-2', titulo: 'En curso', estado: 'en curso', frente: null },
        { codigo: 'T-3', titulo: 'Nueva', estado: 'nueva', frente: null },
      ],
    )
    expect(l.porEmpezar.sinFrente.map((t) => t.codigo)).toEqual(['T-2', 'T-1'])
    const conRuta = listasDelMapa(
      [
        {
          nombres: ['Alfa'],
          ruta: {
            pasos: [
              {
                texto: 'x',
                marca: 'viene',
                preguntas: [],
                trabajo: ['T-1'],
                iteracion: null,
                linea: 1,
                ramas: [],
              },
            ],
            problemas: [],
          },
          origen: ['T-2'],
        },
      ],
      [],
      [
        { codigo: 'T-1', titulo: 'Suelto', estado: 'pendiente', frente: null },
        { codigo: 'T-2', titulo: 'Origen', estado: 'en curso', frente: null },
      ],
    )
    expect(conRuta.porEmpezar.sinFrente).toEqual([])
  })
})

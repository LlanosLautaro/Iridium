// Frente Orden, paso 8 (calidad): los casos raros del control y de los lectores que usa la Bandeja y Trabajo.
// Archivos escritos por otras herramientas (Bloc de notas con BOM, finales de línea de Windows, tabulaciones),
// archivos vacíos o enormes, y lo que el control no tiene que marcar de más.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { controlarProyecto, leerArchivosControl } from '../src/main/app/control'
import { type ArchivosControl, correrControl } from '../src/main/core/control'
import { contarPendientes, leerTipo } from '../src/main/core/pendientes'
import { leerTrabajo } from '../src/main/core/trabajo'
import { leerPreguntas } from '../src/main/core/visor/preguntas'

const ESTADO = `# Estado del proyecto

**Última actualización:** 2026-11-26

## Hito actual
10 — Operación — en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 0 | Idea cruda | hecho | \`00-idea.md\` |

## Preguntas abiertas
- **Q-3 — ¿Lista o grilla? — la de la portada**
  Tipo: decisión · frena
  Contexto: \`04-ux.md\` › Pantalla principal.
  Opciones: A) Lista (recomendada: entra más) · B) Grilla
- **Q-4 — Probá la primera versión**
  Tipo: prueba · Frente: Compartir
  - [ ] Se puede crear una nota

## Próximo paso
Construir la grilla.
`

const TRABAJO = `# Trabajo

## T-1 — Bandeja agrupada por frente
Estado: pendiente · Frente: Orden · Fecha: 2026-11-05 · Origen: D-091
Con filtros arriba.

## T-2 — Otra idea
Estado: nueva · Fecha: 2026-11-06 · Idea: IA
`

function archivos(estado = ESTADO, trabajo: string | null = TRABAJO, cambios: Partial<ArchivosControl> = {}) {
  return {
    estados: [{ ruta: 'docs/estado.md', texto: estado }],
    trabajo,
    respuestas: new Map(),
    documentos: [],
    frentes: [
      { carpeta: 'orden', nombre: 'Orden' },
      { carpeta: 'compartir', nombre: 'Compartir' },
    ],
    ...cambios,
  } satisfies ArchivosControl
}

const conCrlf = (t: string) => t.replaceAll('\n', '\r\n')
const conBom = (t: string) => `﻿${t}`

describe('Orden, calidad: archivos escritos por otras herramientas', () => {
  it('con finales de línea de Windows y BOM, el control no marca nada y lee lo mismo', () => {
    expect(correrControl(archivos())).toEqual([])
    expect(correrControl(archivos(conBom(conCrlf(ESTADO)), conBom(conCrlf(TRABAJO))))).toEqual([])
    const normal = leerPreguntas(ESTADO).map((p) => [p.codigo, p.pregunta, p.opciones.length])
    expect(
      leerPreguntas(conBom(conCrlf(ESTADO))).map((p) => [p.codigo, p.pregunta, p.opciones.length]),
    ).toEqual(normal)
    const t = leerTrabajo(conBom(conCrlf(TRABAJO)))
    expect(t.items.map((i) => [i.codigo, i.estado, i.frente])).toEqual([
      ['T-1', 'pendiente', 'Orden'],
      ['T-2', 'nueva', null],
    ])
    expect(t.problemas).toEqual([])
  })

  it('la línea Tipo con final de Windows dice igual qué tipo es y si frena', () => {
    const p = leerPreguntas(conCrlf(ESTADO))
    expect(leerTipo(p[0]?.contexto ?? '')).toMatchObject({ tipo: 'decisión', frena: true })
    expect(leerTipo('Tipo: prueba · Frente: Compartir\r\n- [ ] algo')).toMatchObject({
      tipo: 'prueba',
      frente: 'Compartir',
    })
  })

  it('una raya larga dentro del título de la pregunta no corta el título', () => {
    expect(leerPreguntas(ESTADO)[0]?.pregunta).toBe('¿Lista o grilla? — la de la portada')
  })
})

describe('Orden, calidad: vacío y enorme', () => {
  it('un trabajo.md vacío o sin ítems no marca nada', () => {
    expect(correrControl(archivos(ESTADO, ''))).toEqual([])
    expect(correrControl(archivos(ESTADO, '# Trabajo\n'))).toEqual([])
    expect(leerTrabajo('').items).toEqual([])
  })

  it('sin preguntas, «(ninguna)» no cuenta nada pendiente', () => {
    const sin = ESTADO.replace(
      /## Preguntas abiertas[\s\S]*?## Próximo paso/,
      '## Preguntas abiertas\n(ninguna)\n\n## Próximo paso',
    )
    expect(correrControl(archivos(sin))).toEqual([])
    expect(leerPreguntas(sin)).toEqual([])
    expect(contarPendientes([sin], () => null)).toEqual({ sinResponder: 0, frenan: 0, respondidas: 0 })
  })

  it('un trabajo.md de 3000 ítems y 400 preguntas se revisa en menos de medio segundo', () => {
    const muchos = Array.from(
      { length: 3000 },
      (_, i) =>
        `## T-${i + 1} — Ítem ${i + 1}\nEstado: ${i % 3 ? 'hecho' : 'pendiente'} · Fecha: 2026-11-01\nTexto del ítem.\n`,
    ).join('\n')
    const preguntas = Array.from(
      { length: 400 },
      (_, i) => `- **Q-${i + 10} — Pregunta ${i}**\n  Tipo: prueba\n  - [ ] Una casilla`,
    ).join('\n')
    const estado = ESTADO.replace('## Próximo paso', `${preguntas}\n\n## Próximo paso`)
    const t0 = performance.now()
    const avisos = correrControl(archivos(estado, `# Trabajo\n\n${muchos}`))
    expect(performance.now() - t0).toBeLessThan(500)
    expect(avisos).toEqual([])
  })
})

describe('Orden, calidad: lo que lee del disco', () => {
  let carpeta = ''
  afterEach(async () => {
    if (carpeta) await rm(carpeta, { recursive: true, force: true })
  })

  async function proyecto(): Promise<string> {
    carpeta = await mkdtemp(join(tmpdir(), 'iridium-or-calidad-'))
    await mkdir(join(carpeta, 'docs', 'respuestas'), { recursive: true })
    await writeFile(join(carpeta, 'docs', 'README.md'), '# Docs\n\n**Framework:** 2026-11-26\n')
    await writeFile(join(carpeta, 'docs', 'estado.md'), conCrlf(ESTADO))
    await writeFile(join(carpeta, 'docs', 'trabajo.md'), conBom(TRABAJO))
    for (const f of ['orden', 'compartir'])
      await mkdir(join(carpeta, 'docs', 'modulos', f), { recursive: true })
    return carpeta
  }

  it('un proyecto con BOM y finales de Windows da cero avisos, también con una respuesta en minúsculas procesada', async () => {
    const ruta = await proyecto()
    await writeFile(
      join(ruta, 'docs', 'respuestas', 'q-2.md'),
      '# Q-2 — Algo de antes\n\n**Opción:** A) Sí\n\n> Procesada el 2026-11-20 → D-1\n',
    )
    expect(await controlarProyecto(ruta)).toEqual([])
    expect((await leerArchivosControl(ruta)).respuestas.has('Q-2')).toBe(true)
  })

  it('una respuesta sin procesar de una pregunta que ya salió se marca, aunque el archivo venga con BOM', async () => {
    const ruta = await proyecto()
    await writeFile(
      join(ruta, 'docs', 'respuestas', 'Q-2.md'),
      conBom('# Q-2 — Algo de antes\n\n**Opción:** A) Sí\n'),
    )
    const avisos = (await controlarProyecto(ruta)) ?? []
    expect(avisos.map((a) => a.regla)).toEqual(['respuestas'])
  })

  it('un archivo que no es texto dentro de docs no rompe el control', async () => {
    const ruta = await proyecto()
    await writeFile(join(ruta, 'docs', 'notas.md'), Buffer.from([0xff, 0xfe, 0x00, 0x41, 0x00, 0x00, 0x9c]))
    await writeFile(join(ruta, 'docs', 'imagen.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]))
    expect(await controlarProyecto(ruta)).toEqual([])
  })

  it('sin docs/README.md con Framework, el control no corre', async () => {
    const ruta = await proyecto()
    await writeFile(join(ruta, 'docs', 'README.md'), '# Docs\n')
    expect(await controlarProyecto(ruta)).toBeNull()
  })
})

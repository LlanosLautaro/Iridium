// OR-I1: el vocabulario, las preguntas con frente y en pausa, `trabajo.md` y el control (frente Orden).
import { describe, expect, it } from 'vitest'
import {
  type ArchivosControl,
  correrControl,
  mensajeDelControl,
  tieneFramework,
} from '../src/main/core/control'
import { leerEstado, leerEstadoViejo } from '../src/main/core/estados'
import { contarPendientes, leerTipo } from '../src/main/core/pendientes'
import { leerTrabajo, siguienteCodigo, textoDeIdea } from '../src/main/core/trabajo'

const ESTADO_BIEN = `# Estado del proyecto

**Última actualización:** 2026-11-06

## Hito actual
10 — Operación — en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 0 | Idea cruda | hecho | \`00-idea.md\` |
| 1 | Exploración | en curso | \`01-exploracion.md\` |

## Preguntas abiertas
- **Q-3 — ¿Lista o grilla?**
  Tipo: decisión · frena
  Contexto: \`04-ux.md\` › Pantalla principal.
  Opciones: A) Lista (recomendada) · B) Grilla
- **Q-4 — Probá la primera versión**
  Tipo: prueba · Frente: Compartir
  - [ ] Se puede crear una nota

## Próximo paso
Construir la grilla.
`

const TRABAJO_BIEN = `# Trabajo

## T-1 — Bandeja agrupada por frente
Estado: pendiente · Frente: Orden · Fecha: 2026-11-05 · Origen: D-091
Con filtros arriba.

## T-2 — Otra idea
Estado: nueva · Fecha: 2026-11-06
`

function archivos(cambios: Partial<ArchivosControl> = {}, estado = ESTADO_BIEN): ArchivosControl {
  return {
    estados: [{ ruta: 'docs/estado.md', texto: estado }],
    trabajo: TRABAJO_BIEN,
    respuestas: new Map(),
    documentos: [],
    frentes: [
      { carpeta: 'orden', nombre: 'Orden' },
      { carpeta: 'compartir', nombre: 'Compartir' },
    ],
    ...cambios,
  }
}

const reglas = (a: ArchivosControl) => correrControl(a).map((x) => `${x.regla}: ${x.texto}`)

describe('el vocabulario de estados (OR-5)', () => {
  it('lee las palabras con acentos, mayúsculas, género y texto de más', () => {
    expect(leerEstado('Hecha')).toBe('hecho')
    expect(leerEstado('**en curso**: la arquitectura')).toBe('en curso')
    expect(leerEstado('En pausa')).toBe('en pausa')
    expect(leerEstado('descartada (no va)')).toBe('descartado')
    expect(leerEstado('nueva')).toBe('nueva')
  })
  it('las palabras de antes no son del vocabulario, pero se traducen en un framework viejo', () => {
    expect(leerEstado('completo')).toBeNull()
    expect(leerEstadoViejo('completo (portón aprobado)')).toBe('hecho')
    expect(leerEstadoViejo('saltado')).toBe('descartado')
    expect(leerEstadoViejo('reabierto')).toBe('en curso')
    expect(leerEstadoViejo('cualquier cosa')).toBeNull()
  })
})

describe('las preguntas con frente y en pausa (OR-3, OR-6)', () => {
  it('lee el frente en la línea Tipo o en una propia, y en pausa', () => {
    expect(leerTipo('Tipo: tarea · frena · Frente: Compartir')).toEqual({
      tipo: 'tarea',
      frena: true,
      enPausa: false,
      frente: 'Compartir',
    })
    expect(leerTipo('Tipo: consulta · en pausa\nFrente: Orden')).toMatchObject({
      enPausa: true,
      frente: 'Orden',
    })
    expect(leerTipo('Contexto: nada')).toMatchObject({ tipo: 'consulta', frente: null })
  })
  it('las que están en pausa no cuentan', () => {
    const estado = `## Preguntas abiertas
- **Q-1 — Una**
  Tipo: consulta · en pausa
- **Q-2 — Otra**
  Tipo: decisión · frena
`
    expect(contarPendientes([estado], () => null)).toEqual({ sinResponder: 1, frenan: 1, respondidas: 0 })
  })
})

describe('trabajo.md (D-094)', () => {
  it('lee los ítems con sus datos y su texto', () => {
    const { items, problemas } = leerTrabajo(TRABAJO_BIEN)
    expect(problemas).toEqual([])
    expect(items[0]).toMatchObject({
      codigo: 'T-1',
      titulo: 'Bandeja agrupada por frente',
      estado: 'pendiente',
      frente: 'Orden',
      fecha: '2026-11-05',
      origen: 'D-091',
      texto: 'Con filtros arriba.',
    })
    expect(items[1]).toMatchObject({ codigo: 'T-2', estado: 'nueva', frente: null, texto: '' })
    expect(siguienteCodigo(items)).toBe('T-3')
  })
  it('arma el texto de una idea nueva', () => {
    expect(textoDeIdea('T-3', '  Una  idea ', '2026-11-06', 'Orden')).toBe(
      '## T-3 — Una idea\nEstado: nueva · Frente: Orden · Fecha: 2026-11-06\n',
    )
    expect(leerTrabajo(textoDeIdea('T-3', 'Suelta', '2026-11-06', null)).items[0]).toMatchObject({
      estado: 'nueva',
      frente: null,
    })
  })
})

describe('el control (OR-2)', () => {
  it('un proyecto bien escrito da cero', () => {
    expect(correrControl(archivos())).toEqual([])
  })

  it('una pregunta suelta y una con título `### Q-n` (A-14, A-15)', () => {
    const estado = ESTADO_BIEN.replace(
      '## Próximo paso',
      'Q-9 — ¿Algo suelto?\n### Q-10 — Como título\nTipo: consulta\n\n## Próximo paso',
    )
    const r = reglas(archivos({}, estado))
    expect(r).toContainEqual(expect.stringMatching(/^preguntas: texto suelto/))
    expect(r).toContainEqual(expect.stringMatching(/^preguntas: la pregunta es un título/))
  })

  it('una prueba con opciones y sin casillas (A-13)', () => {
    const estado = ESTADO_BIEN.replace(
      '  - [ ] Se puede crear una nota',
      '  Opciones: A) Todo bien (recomendada) · B) Algo falla',
    )
    const r = reglas(archivos({}, estado))
    expect(r).toContain('preguntas: Q-4: una prueba va solo con casillas, sin «Opciones:»')
    expect(r).toContain('preguntas: Q-4: una prueba lleva un `- [ ]` corto por cosa a mirar')
  })

  it('una decisión sin Tipo, con opciones en la misma línea o sin recomendada', () => {
    const sinTipo = ESTADO_BIEN.replace('  Tipo: decisión · frena\n', '')
    expect(reglas(archivos({}, sinTipo))).toContain(
      'preguntas: Q-3: falta la línea «Tipo:» debajo del título',
    )
    const enLinea = ESTADO_BIEN.replace(
      '  Contexto: `04-ux.md` › Pantalla principal.\n  Opciones:',
      '  Contexto: `04-ux.md` › Pantalla principal. Opciones:',
    )
    expect(reglas(archivos({}, enLinea))).toContain('preguntas: Q-3: «Opciones:» va en una línea propia')
    const sinRecomendada = ESTADO_BIEN.replace(' (recomendada)', '')
    expect(reglas(archivos({}, sinRecomendada))).toContain(
      'preguntas: Q-3: falta marcar la opción (recomendada)',
    )
  })

  it('un tipo o un frente que no existen', () => {
    const estado = ESTADO_BIEN.replace('Tipo: decisión · frena', 'Tipo: urgente · frena · Frente: Diseño')
    const r = reglas(archivos({}, estado))
    expect(r).toContainEqual(expect.stringContaining('«urgente» no es un tipo'))
    expect(r).toContainEqual(expect.stringContaining('el frente «Diseño» no existe'))
  })

  it('una prueba fuera de Preguntas abiertas (A-14)', () => {
    const estado = ESTADO_BIEN.replace(
      '## Próximo paso',
      '## Verificación manual pendiente\n- [ ] Abrir\n\n## Próximo paso',
    )
    expect(reglas(archivos({}, estado))).toContainEqual(
      expect.stringMatching(/fuera de «Preguntas abiertas»/),
    )
  })

  it('una respuesta sin «Procesada» cuya pregunta ya salió (A-17)', () => {
    const respuestas = new Map([
      ['Q-1', '# Q-1 — Vieja\n\n**Opción:** A) Sí\n'],
      ['Q-2', '# Q-2 — Hecha\n\n**Opción:** A) Sí\n\n> Procesada el 2026-11-01 → D-3\n'],
      ['Q-3', '# Q-3 — ¿Lista o grilla?\n\n**Opción:** A) Lista\n'],
    ])
    const r = correrControl(archivos({ respuestas }))
    expect(r.map((x) => x.archivo)).toEqual(['docs/respuestas/Q-1.md'])
  })

  it('trabajo.md: falta, estado fuera del vocabulario, frente que no existe y código repetido', () => {
    expect(reglas(archivos({ trabajo: null }))).toEqual([
      'trabajo: falta `docs/trabajo.md` (las ideas y los pendientes)',
    ])
    const trabajo = `${TRABAJO_BIEN}\n## T-2 — Repetida\nEstado: terminado · Frente: Diseño\n\n## Sin código\nEstado: nueva\n`
    const r = reglas(archivos({ trabajo }))
    expect(r).toContain('trabajo: T-2: el código está repetido: renumerá el más nuevo')
    expect(r).toContainEqual(expect.stringContaining('«terminado» no es un estado'))
    expect(r).toContain('trabajo: T-2: el frente «Diseño» no existe')
    expect(r).toContain('trabajo: el título no empieza con `T-n — `')
  })

  it('un estado fuera del vocabulario en una tabla y los campos que faltan', () => {
    const estado = ESTADO_BIEN.replace('| hecho |', '| completo |')
      .replace('**Última actualización:** 2026-11-06\n', '')
      .replace('10 — Operación — en curso', '10 — Operación')
    const r = correrControl(archivos({}, estado))
    expect(r).toContainEqual(expect.objectContaining({ regla: 'estados', linea: 10 }))
    expect(r.filter((x) => x.regla === 'campos')).toHaveLength(2)
  })

  it('un dibujo con un símbolo que no está en la letra (R-13)', () => {
    const documentos = [
      { ruta: 'docs/04-ux.md', texto: '# UX\n\n```\n┌──────┐\n│ ⚙ Ajustes │\n└──────┘\n```\n' },
      { ruta: 'docs/bien.md', texto: '```\n┌──┐\n│ ● ✓ → │\n└──┘\n```\n\n```\nnpm ⚙ sin cuadro\n```\n' },
    ]
    const r = correrControl(archivos({ documentos }))
    expect(r).toEqual([expect.objectContaining({ regla: 'dibujos', archivo: 'docs/04-ux.md', linea: 3 })])
    expect(r[0]?.texto).toContain('⚙')
  })

  it('el mensaje para la IA y cuándo corre', () => {
    const m = mensajeDelControl([
      { regla: 'preguntas', archivo: 'docs/estado.md', linea: 4, texto: 'Q-1: falta «Tipo:»' },
    ])
    expect(m).toBe(
      'El control de Iridium encontró esto mal escrito; corregilo y no hagas nada más:\n\n- `docs/estado.md:4` — Q-1: falta «Tipo:»',
    )
    expect(tieneFramework('# Docs\n\n**Framework:** 2026-11-06\n')).toBe(true)
    expect(tieneFramework('**Formato de la guía:** 2026-11-01')).toBe(false)
    expect(tieneFramework(null)).toBe(false)
  })
})

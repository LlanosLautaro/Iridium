// Copiado de la app anterior de proyectos (D-026).
// Reglas de códigos del visor (D-028, D-033) con fragmentos como los de los proyectos reales.
import { describe, expect, it } from 'vitest'
import {
  codigoAlInicio,
  construirIndice,
  encabezadosDe,
  resolverCodigo,
} from '../../src/main/core/visor/codigos'
import { slug, textoPlano, titulos } from '../../src/main/core/visor/lineas'

const decisiones = `# Decisiones

## D-001 — Plataforma: extensión de VS Code
Texto.

## D-025 — Próxima versión: el Visor
Ver D-1.

\`\`\`markdown
## D-099 — Dentro de un bloque de código no nace
\`\`\`
`

const ux = `# UX
### H15 — Abrir la documentación
### H-2 — Moverme entre documentos
## Pantallas
## Pantallas
`

const investigacion = `# Investigación
| Código | Pregunta |
|---|---|
| S-2 | ¿Cómo reconocer códigos? |
| S-3 | ¿Qué librería? |

| Prioridad | Qué |
|---|---|
| P0 | urgente |
| P0 | otra urgente |
| P1 | normal |
`

const estado = `# Estado

## Preguntas abiertas
- **Q-7 — ¿La miniatura muestra el modelo 3D?**
  Contexto: D-25. Opciones: A) 3D (recomendada) · B) plana.

## Próximo paso
- Q-8 — fuera de la sección no nace
`

const indice = () =>
  construirIndice([
    { ruta: 'docs/decisiones.md', texto: decisiones },
    { ruta: 'docs/04-ux.md', texto: ux },
    { ruta: 'docs/03-investigacion.md', texto: investigacion },
    { ruta: 'docs/estado.md', texto: estado },
  ])

describe('códigos', () => {
  it('guion y ceros opcionales: H15 = H-15, D-001 = D-1', () => {
    expect(codigoAlInicio('H15 — Abrir')).toBe('H-15')
    expect(codigoAlInicio('D-001 — Plataforma')).toBe('D-1')
    expect(codigoAlInicio('Pantallas')).toBeNull()
  })

  it('P1–P5 no son códigos', () => {
    expect(codigoAlInicio('P1 — Local')).toBeNull()
    expect(codigoAlInicio('P7 — otra cosa')).toBe('P-7')
  })

  it('nacen en títulos, en una sola fila de tabla y en las preguntas abiertas', () => {
    const i = indice()
    expect(i.codigos.get('D-1')?.[0]).toMatchObject({
      ruta: 'docs/decisiones.md',
      nace: 'titulo',
      ancla: 'd-1',
    })
    expect(i.codigos.get('H-15')?.[0]).toMatchObject({ ruta: 'docs/04-ux.md', ancla: 'h-15' })
    expect(i.codigos.get('S-2')?.[0]).toMatchObject({ ruta: 'docs/03-investigacion.md', nace: 'tabla' })
    expect(i.codigos.get('Q-7')?.[0]).toMatchObject({
      ruta: 'docs/estado.md',
      nace: 'pregunta',
      ancla: 'q-7',
    })
  })

  it('no nacen: dentro de un bloque de código, categorías repetidas ni P1', () => {
    const i = indice()
    expect(i.codigos.has('D-99')).toBe(false)
    expect(i.codigos.has('P-0')).toBe(false)
    expect(i.codigos.has('P-1')).toBe(false)
    expect(i.codigos.has('Q-8')).toBe(false)
  })

  it('si el mismo código titula secciones de dos documentos, gana el del mismo documento o el más cercano', () => {
    const i = construirIndice([
      { ruta: 'docs/04-ux.md', texto: '### H-1 — General' },
      { ruta: 'docs/modulos/visor/ux.md', texto: '### H-1 — Del visor' },
    ])
    expect(resolverCodigo(i, 'H-1', 'docs/modulos/visor/estado.md')?.ruta).toBe('docs/modulos/visor/ux.md')
    expect(resolverCodigo(i, 'H-1', 'docs/estado.md')?.ruta).toBe('docs/04-ux.md')
  })

  it('la Q-n nace en su pregunta; el título de su respuesta solo cuenta si la pregunta ya no está', () => {
    const conPregunta = construirIndice([
      { ruta: 'docs/estado.md', texto: estado },
      { ruta: 'docs/respuestas/Q-7.md', texto: '# Q-7 — ¿La miniatura?\n\nA' },
    ])
    expect(conPregunta.codigos.get('Q-7')?.[0]?.ruta).toBe('docs/estado.md')
    const sinPregunta = construirIndice([
      { ruta: 'docs/respuestas/Q-7.md', texto: '# Q-7 — ¿La miniatura?\n\nA' },
    ])
    expect(sinPregunta.codigos.get('Q-7')?.[0]?.ruta).toBe('docs/respuestas/Q-7.md')
  })
})

describe('títulos y anclas', () => {
  it('el ancla es el código; si no hay código, el estilo de GitHub sin repetir', () => {
    expect(encabezadosDe(ux).map((e) => e.ancla)).toEqual(['ux', 'h-15', 'h-2', 'pantallas', 'pantallas-1'])
  })

  it('texto plano y slug', () => {
    expect(textoPlano('**D-025** — `markdown-it` y [enlace](x.md)')).toBe('D-025 — markdown-it y enlace')
    expect(slug('H-5 — Responder una pregunta abierta')).toBe('h-5--responder-una-pregunta-abierta')
  })

  it('no ve títulos dentro de bloques ~~~ ni ```', () => {
    const t = titulos(['# Uno', '~~~markdown', '## Dentro', '```', '## Sigue dentro', '```', '~~~', '## Dos'])
    expect(t.map((x) => x.texto)).toEqual(['Uno', 'Dos'])
  })
})

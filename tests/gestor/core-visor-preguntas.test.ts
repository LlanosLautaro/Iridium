// Copiado de la app anterior de proyectos (D-026).
// Preguntas abiertas, respuestas y documentos del visor (D-033, D-035).
import { describe, expect, it } from 'vitest'
import { construirIndice } from '../../src/main/core/visor/codigos'
import { armarArbol, documentoInicial, seccionDe } from '../../src/main/core/visor/documentos'
import { esDocumentoDeEstado, leerOpciones, leerPreguntas } from '../../src/main/core/visor/preguntas'
import {
  armarRespuesta,
  esImagenDe,
  estadoDe,
  huella,
  leerRespuesta,
  siguienteCaptura,
} from '../../src/main/core/visor/respuestas'

describe('preguntas', () => {
  const estado = `# Estado

## Preguntas abiertas
- **Q-7 — ¿La miniatura muestra el modelo 3D o la textura plana?**
  Contexto: D-032 (miniaturas), \`04-ux.md\` › W-14. Opciones: A) 3D (recomendada) · B) plana.
- Q-8: ¿Nombre del botón?
  Contexto: D-026. Sin opciones.
- Una nota que no es pregunta.

## Próximo paso
- **Q-9 — fuera de la sección no cuenta**
`

  it('lee las Q-n con y sin negrita, con guion largo o dos puntos', () => {
    const qs = leerPreguntas(estado)
    expect(qs.map((q) => q.codigo)).toEqual(['Q-7', 'Q-8'])
    expect(qs[0]?.pregunta).toBe('¿La miniatura muestra el modelo 3D o la textura plana?')
    expect(qs[1]?.pregunta).toBe('¿Nombre del botón?')
  })

  it('lee también las Q-n escritas como título dentro de la sección, con el bloque que sigue (Defecto 13)', () => {
    const qs = leerPreguntas(`# Estado

## Preguntas abiertas
### Q-14 — Segunda ronda de la prueba de sonidos
- **Qué pasa:** el cerdo y la vaca sonaron normal.
- **Qué probar:** pegarle una vez a cada uno.

### Q-13 — Probar Mi pack PC (en pausa)
- **Qué pasa:** el usuario la retoma cuando quiera.

Respuesta: en el chat o en \`respuestas/Q-n.md\`.

### Una nota que no es pregunta

## Próximo paso
### Q-15 — fuera de la sección no cuenta
`)
    expect(qs.map((q) => q.codigo)).toEqual(['Q-14', 'Q-13'])
    expect(qs[0]?.pregunta).toBe('Segunda ronda de la prueba de sonidos')
    expect(qs[0]?.contexto).toBe(
      '- **Qué pasa:** el cerdo y la vaca sonaron normal.\n- **Qué probar:** pegarle una vez a cada uno.',
    )
    expect(qs[1]?.contexto).toBe('- **Qué pasa:** el usuario la retoma cuando quiera.')
    expect(qs[0]?.linea).toBe(3)
    expect(qs[0]?.hasta).toBe(5)
  })

  it('separa las opciones del contexto; la recomendada y el punto final se quitan del texto', () => {
    const q = leerPreguntas(estado)[0]
    expect(q?.contexto).toBe('Contexto: D-032 (miniaturas), `04-ux.md` › W-14.')
    expect(q?.opciones).toEqual([
      { letra: 'A', texto: '3D', recomendada: true },
      { letra: 'B', texto: 'plana', recomendada: false },
    ])
  })

  it('sin tramo Opciones, la pregunta no tiene opciones y el contexto queda entero', () => {
    const q = leerPreguntas(estado)[1]
    expect(q?.opciones).toEqual([])
    expect(q?.contexto).toBe('Contexto: D-026. Sin opciones.')
  })

  it('opciones que no se entienden: ninguna (se muestra el campo de texto)', () => {
    expect(leerOpciones('A) sí · lo que sea')).toEqual([])
    expect(leerOpciones('A) sí · B) no.')).toHaveLength(2)
  })

  it('una sola opción también vale; lo demás va en Otro (Q-70 de Iridium)', () => {
    const texto = [
      '## Preguntas abiertas',
      '- **Q-70 — ¿Comentar tus apps funciona?**',
      '  Tipo: prueba · no frena',
      '  Contexto: R-I1.',
      '  1. Apretá `F8` → aparece el aviso.',
      '  Opciones: A) Funciona (recomendada).',
    ].join('\n')
    const q = leerPreguntas(texto)[0]
    expect(q?.opciones).toEqual([{ letra: 'A', texto: 'Funciona', recomendada: true }])
    expect(q?.contexto).toBe('Tipo: prueba · no frena\nContexto: R-I1.\n1. Apretá `F8` → aparece el aviso.')
  })

  it('una opción por línea y «(recomendada: motivo)» (Q-65 de Iridium)', () => {
    const texto = [
      '## Preguntas abiertas',
      '- **Q-65 — ¿Modelo y esfuerzo?**',
      '  Tipo: decisión · no frena',
      '  Contexto: ya estaba en H-12.',
      '  Opciones:',
      '  A) En I-6, con selectores (cada proyecto recuerda los suyos) (recomendada: entra en la misma iteración).',
      '  B) El uso queda arriba.',
      '  C) Después del MVP.',
      '',
    ].join('\n')
    const q = leerPreguntas(texto)[0]
    expect(q?.contexto).toBe('Tipo: decisión · no frena\nContexto: ya estaba en H-12.')
    expect(q?.opciones).toEqual([
      {
        letra: 'A',
        texto: 'En I-6, con selectores (cada proyecto recuerda los suyos) (entra en la misma iteración)',
        recomendada: true,
      },
      { letra: 'B', texto: 'El uso queda arriba', recomendada: false },
      { letra: 'C', texto: 'Después del MVP', recomendada: false },
    ])
  })

  it('acepta finales de línea de Windows (CRLF)', () => {
    const qs = leerPreguntas(estado.replace(/\n/g, '\r\n'))
    expect(qs.map((q) => q.codigo)).toEqual(['Q-7', 'Q-8'])
    expect(qs[0]?.opciones).toHaveLength(2)
  })

  it('solo los estado.md general y de módulos', () => {
    expect(esDocumentoDeEstado('docs/estado.md')).toBe(true)
    expect(esDocumentoDeEstado('docs/modulos/visor/estado.md')).toBe(true)
    expect(esDocumentoDeEstado('docs/research/estado.md')).toBe(false)
  })
})

describe('respuestas', () => {
  const opciones = [
    { letra: 'A', texto: '3D', recomendada: true },
    { letra: 'B', texto: 'plana', recomendada: false },
  ]
  const base = {
    codigo: 'Q-7',
    pregunta: '¿Miniatura 3D?',
    opciones: [],
    opcion: null,
    texto: '',
    imagenes: [],
  }

  it('ida y vuelta sin opciones: título, texto e imágenes', () => {
    const texto = armarRespuesta({
      ...base,
      texto: 'Prefiero 3D.\n\nMirá la captura.',
      imagenes: ['Q-7/captura-1.png'],
    })
    expect(texto).toBe(
      '# Q-7 — ¿Miniatura 3D?\n\nPrefiero 3D.\n\nMirá la captura.\n\n![captura 1](Q-7/captura-1.png)\n',
    )
    expect(leerRespuesta(texto, 'Q-7')).toEqual({
      opcion: null,
      otro: '',
      texto: 'Prefiero 3D.\n\nMirá la captura.',
      imagenes: ['Q-7/captura-1.png'],
      procesada: null,
    })
  })

  it('con una opción: solo la opción (el texto y las capturas no van)', () => {
    const texto = armarRespuesta({
      ...base,
      opciones,
      opcion: 'A',
      texto: 'algo',
      imagenes: ['Q-7/captura-1.png'],
    })
    expect(texto).toBe('# Q-7 — ¿Miniatura 3D?\n\n**Opción:** A) 3D\n')
    expect(leerRespuesta(texto, 'Q-7').opcion).toBe('A')
  })

  it('con Otro: la opción, el texto y las capturas', () => {
    const texto = armarRespuesta({ ...base, opciones, opcion: 'Otro', texto: 'Las dos.' })
    expect(texto).toBe('# Q-7 — ¿Miniatura 3D?\n\n**Opción:** Otro\n\nLas dos.\n')
    expect(leerRespuesta(texto, 'Q-7')).toMatchObject({ opcion: 'Otro', texto: 'Las dos.' })
  })

  it('Otro sin texto, o vacía: queda solo el título (sin responder)', () => {
    const otro = armarRespuesta({ ...base, opciones, opcion: 'Otro' })
    expect(otro).toBe('# Q-7 — ¿Miniatura 3D?\n')
    expect(estadoDe(leerRespuesta(otro, 'Q-7'))).toBe('sin-responder')
  })

  it('lectura tolerante: archivo a mano, Procesada en cualquier lugar', () => {
    const r = leerRespuesta(
      '> Procesada el 2026-10-10 → D-33\n\nSí, la 3D.\n![](Q-7/foto.png)\nMás texto.',
      'Q-7',
    )
    expect(r).toEqual({
      opcion: null,
      otro: '',
      texto: 'Sí, la 3D.\nMás texto.',
      imagenes: ['Q-7/foto.png'],
      procesada: { fecha: '2026-10-10', destino: 'D-33' },
    })
    expect(estadoDe(r)).toBe('procesada')
  })

  it('estado: sin archivo, vacía, respondida', () => {
    expect(estadoDe(null)).toBe('sin-responder')
    expect(estadoDe(leerRespuesta('# Q-7 — x\n', 'Q-7'))).toBe('sin-responder')
    expect(estadoDe(leerRespuesta('# Q-7 — x\n\nsí\n', 'Q-7'))).toBe('respondida')
  })

  it('imágenes de la respuesta: solo dentro de Q-n/', () => {
    expect(esImagenDe('Q-7', 'Q-7/captura-1.png')).toBe(true)
    expect(esImagenDe('Q-7', 'Q-7/../../x.png')).toBe(false)
    expect(esImagenDe('Q-7', 'Q-8/captura-1.png')).toBe(false)
  })

  it('la próxima captura usa el número siguiente al mayor; nunca reutiliza', () => {
    expect(siguienteCaptura([], 'png')).toBe('captura-1.png')
    expect(siguienteCaptura(['captura-1.png', 'captura-3.jpg', 'foto.png'], 'png')).toBe('captura-4.png')
  })

  it('la huella cambia con el contenido y es vacía sin archivo', () => {
    expect(huella(null)).toBe('')
    expect(huella('a')).not.toBe(huella('b'))
    expect(huella('a')).toBe(huella('a'))
  })
})

describe('documentos', () => {
  const rutas = [
    'docs/10-operacion.md',
    'docs/00-idea.md',
    'docs/02-definicion.md',
    'docs/decisiones.md',
    'docs/estado.md',
    'docs/README.md',
    'docs/modulos/visor/estado.md',
    'README.md',
    'CLAUDE.md',
  ]

  it('orden natural, con estado.md y decisiones.md primero y los archivos antes que las carpetas', () => {
    const { docs, raiz } = armarArbol(rutas)
    expect(docs.map((n) => n.nombre)).toEqual([
      'estado.md',
      'decisiones.md',
      '00-idea.md',
      '02-definicion.md',
      '10-operacion.md',
      'README.md',
      'modulos',
    ])
    expect(raiz.map((n) => n.nombre)).toEqual(['CLAUDE.md', 'README.md'])
  })

  it('documento inicial: docs/estado.md → README.md → el primero', () => {
    expect(documentoInicial(rutas)).toBe('docs/estado.md')
    expect(documentoInicial(['CLAUDE.md', 'README.md', 'docs/00-idea.md'])).toBe('README.md')
    expect(documentoInicial(['docs/b.md', 'docs/a.md', 'z.md'])).toBe('docs/a.md')
    expect(documentoInicial([])).toBeNull()
  })

  it('vista previa: el comienzo de la sección (unas 12 líneas) y si sigue', () => {
    const lineas = Array.from({ length: 20 }, (_, i) => `Línea ${i + 1}`)
    const texto = `# D\n\n## D-1 — Primera\n\n${lineas.join('\n')}\n\n## D-2 — Segunda\nOtra.\n`
    const indice = construirIndice([{ ruta: 'docs/decisiones.md', texto }])
    const e = indice.codigos.get('D-1')?.[0]
    if (!e) throw new Error('falta D-1')
    const s = seccionDe(texto, e, indice)
    expect(s?.titulo).toBe('D-1 — Primera')
    expect(s?.markdown.split('\n')).toHaveLength(12)
    expect(s?.cortada).toBe(true)
  })

  it('vista previa de una fila: la fila con los encabezados de su tabla', () => {
    const texto = '| Código | Pregunta |\n|---|---|\n| S-2 | ¿Códigos? |\n| S-3 | ¿Markdown? |\n'
    const indice = construirIndice([{ ruta: 'docs/03-investigacion.md', texto }])
    const e = indice.codigos.get('S-3')?.[0]
    if (!e) throw new Error('falta S-3')
    expect(seccionDe(texto, e, indice)?.markdown).toBe(
      '| Código | Pregunta |\n|---|---|\n| S-3 | ¿Markdown? |',
    )
  })

  it('un corte dentro de un bloque de código lo cierra', () => {
    const codigo = Array.from({ length: 20 }, (_, i) => `x${i}`)
    const texto = `## D-1 — Con código\n\n\`\`\`ts\n${codigo.join('\n')}\n\`\`\`\n`
    const indice = construirIndice([{ ruta: 'docs/d.md', texto }])
    const e = indice.codigos.get('D-1')?.[0]
    if (!e) throw new Error('falta D-1')
    expect(seccionDe(texto, e, indice)?.markdown.split('\n').at(-1)).toBe('```')
  })
})

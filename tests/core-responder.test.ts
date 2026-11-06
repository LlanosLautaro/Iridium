// Responder desde Pendientes (H-10, H-11): las partes del formulario, el archivo que se escribe y su lectura de vuelta.
import { describe, expect, it } from 'vitest'
import { borradorVacio, puedeEnviar, tieneAlgo } from '../src/compartido/respuestas'
import { armarRespuestaDe, borradorDeRespuesta, partesDelContexto } from '../src/main/core/responder'
import { leerOpciones } from '../src/main/core/visor/preguntas'
import { estadoDe, leerRespuesta } from '../src/main/core/visor/respuestas'

const opciones = leerOpciones('A) Funciona, se aprueba (recomendada) · B) Encontré algo')
const prueba = {
  codigo: 'Q-12',
  pregunta: '¿I-4 funciona como esperabas?',
  opciones,
  puntos: ['Abre la app sin errores', 'Clasifica en Pendientes', 'El número baja al responder'],
}

describe('partesDelContexto', () => {
  it('quita la línea Tipo y el rótulo Contexto, y saca los puntos de la prueba (D-019)', () => {
    const contexto = [
      'Tipo: prueba · frena',
      'Contexto: instalá la última versión (`scripts.md` › Instalar).',
      '- [ ] Abre la app sin errores',
      '- [x] Clasifica en Pendientes',
    ].join('\n')
    expect(partesDelContexto(contexto)).toEqual({
      texto: 'instalá la última versión (`scripts.md` › Instalar).',
      puntos: ['Abre la app sin errores', 'Clasifica en Pendientes'],
    })
  })

  it('los pasos numerados también son puntos (Q-70)', () => {
    const contexto = [
      'Tipo: prueba · no frena',
      'Contexto: R-I1.',
      '1. Apretá `F8` → aviso.',
      '2) Clic → tarjeta.',
    ].join('\n')
    expect(partesDelContexto(contexto)).toEqual({
      texto: 'R-I1.',
      puntos: ['Apretá `F8` → aviso.', 'Clic → tarjeta.'],
    })
  })

  it('sin Tipo ni puntos, el contexto queda igual', () => {
    expect(partesDelContexto('D-32 (miniaturas), `04-ux.md` › W-14.')).toEqual({
      texto: 'D-32 (miniaturas), `04-ux.md` › W-14.',
      puntos: [],
    })
  })
})

describe('armarRespuestaDe', () => {
  it('una decisión: la opción y la nota, que el lector de la guía entiende', () => {
    const q = {
      codigo: 'Q-7',
      pregunta: '¿3D o plana?',
      opciones: leerOpciones('A) 3D · B) plana'),
      puntos: [],
    }
    const texto = armarRespuestaDe(q, { ...borradorVacio(0), opcion: 'A', nota: 'Mejor con sombra.' })
    expect(texto).toBe('# Q-7 — ¿3D o plana?\n\n**Opción:** A) 3D\n\nMejor con sombra.\n')
    expect(leerRespuesta(texto, 'Q-7')).toMatchObject({ opcion: 'A', texto: 'Mejor con sombra.' })
  })

  it('Otro va en la línea de la opción, en una sola línea', () => {
    const q = {
      codigo: 'Q-7',
      pregunta: '¿3D o plana?',
      opciones: leerOpciones('A) 3D · B) plana'),
      puntos: [],
    }
    const texto = armarRespuestaDe(q, {
      ...borradorVacio(0),
      opcion: 'Otro',
      otro: 'las dos,\nsegún el caso',
    })
    expect(texto).toBe('# Q-7 — ¿3D o plana?\n\n**Opción:** Otro: las dos, según el caso\n')
    expect(leerRespuesta(texto, 'Q-7').opcion).toBe('Otro')
    // R-11: sin nota, lo escrito en Otro ya es una respuesta (antes la pregunta volvía a quedar vacía).
    expect(estadoDe(leerRespuesta(texto, 'Q-7'))).toBe('respondida')
    expect(estadoDe(leerRespuesta('# Q-7 — ¿3D o plana?\n\n**Opción:** Otro\n', 'Q-7'))).toBe('sin-responder')
  })

  it('una prueba repite cada punto, marcado o no, con su nota después de « — » (D-019)', () => {
    const b = {
      ...borradorVacio(3),
      opcion: 'B',
      marcas: [true, false, true],
      notas: ['', 'no aparece la tarjeta', ''],
      nota: 'El resto, bien.',
    }
    expect(armarRespuestaDe(prueba, b)).toBe(
      [
        '# Q-12 — ¿I-4 funciona como esperabas?',
        '',
        '**Opción:** B) Encontré algo',
        '',
        '- [x] Abre la app sin errores',
        '- [ ] Clasifica en Pendientes — no aparece la tarjeta',
        '- [x] El número baja al responder',
        '',
        'El resto, bien.',
        '',
      ].join('\n'),
    )
  })

  it('una consulta sin opciones: el texto tal cual', () => {
    const q = { codigo: 'Q-3', pregunta: '¿Qué nombre?', opciones: [], puntos: [] }
    expect(armarRespuestaDe(q, { ...borradorVacio(0), nota: 'Iridium.\n\nO Osmio.' })).toBe(
      '# Q-3 — ¿Qué nombre?\n\nIridium.\n\nO Osmio.\n',
    )
  })
})

describe('borradorDeRespuesta', () => {
  it('lee de vuelta lo que escribió Iridium (para Corregir)', () => {
    const b = {
      ...borradorVacio(3),
      opcion: 'B',
      marcas: [true, false, true],
      notas: ['', 'no aparece — ni con F5', ''],
      nota: 'El resto, bien.',
    }
    expect(borradorDeRespuesta(armarRespuestaDe(prueba, b), prueba)).toEqual(b)
  })

  it('lee Otro con su texto', () => {
    const q = {
      codigo: 'Q-7',
      pregunta: '¿3D o plana?',
      opciones: leerOpciones('A) 3D · B) plana'),
      puntos: [],
    }
    const b = { ...borradorVacio(0), opcion: 'Otro', otro: 'las dos', nota: 'Una nota.' }
    expect(borradorDeRespuesta(armarRespuestaDe(q, b), q)).toEqual(b)
  })

  it('tolera una respuesta escrita a mano: los puntos por su orden si cambió el texto', () => {
    const texto =
      '# Q-12 — ¿I-4 funciona como esperabas?\n\n- [x] Abre\n- [ ] Clasifica — no anda\n\nNada más.\n'
    expect(borradorDeRespuesta(texto, prueba)).toMatchObject({
      opcion: null,
      marcas: [true, false, false],
      notas: ['', 'no anda', ''],
      nota: 'Nada más.',
    })
  })

  it('una opción que la pregunta ya no tiene no se elige', () => {
    expect(borradorDeRespuesta('# Q-12 — x\n\n**Opción:** D) otra\n', prueba).opcion).toBeNull()
  })
})

describe('puedeEnviar y tieneAlgo', () => {
  const decision = { opciones, puntos: [] }
  it('una decisión necesita una opción; Otro, con algo escrito', () => {
    expect(puedeEnviar(borradorVacio(0), decision)).toBe(false)
    expect(puedeEnviar({ ...borradorVacio(0), opcion: 'A' }, decision)).toBe(true)
    expect(puedeEnviar({ ...borradorVacio(0), opcion: 'Otro' }, decision)).toBe(false)
    expect(puedeEnviar({ ...borradorVacio(0), opcion: 'Otro', otro: 'así' }, decision)).toBe(true)
  })

  it('una prueba se envía con un punto marcado o una nota', () => {
    expect(puedeEnviar(borradorVacio(3), prueba)).toBe(false)
    expect(puedeEnviar({ ...borradorVacio(3), marcas: [true, false, false] }, prueba)).toBe(true)
    expect(puedeEnviar({ ...borradorVacio(3), notas: ['', 'falla', ''] }, prueba)).toBe(true)
  })

  it('una consulta, con texto', () => {
    const consulta = { opciones: [], puntos: [] }
    expect(puedeEnviar({ ...borradorVacio(0), nota: '  ' }, consulta)).toBe(false)
    expect(puedeEnviar({ ...borradorVacio(0), nota: 'sí' }, consulta)).toBe(true)
  })

  it('tieneAlgo: cualquier marca, opción o texto', () => {
    expect(tieneAlgo(borradorVacio(2))).toBe(false)
    expect(tieneAlgo({ ...borradorVacio(2), marcas: [false, true] })).toBe(true)
  })
})

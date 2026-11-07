// OR-I2, el esqueleto: por dónde se entra a un proyecto la primera vez (04-ux.md › W-3).
import { describe, expect, it } from 'vitest'
import type { TarjetaProyecto } from '../src/compartido/puente'
import { seccionDeEntrada } from '../src/renderer/secciones/proyecto/entrada'

function tarjeta(cambio: Partial<TarjetaProyecto> = {}): TarjetaProyecto {
  return {
    nombre: 'Alfa',
    ruta: 'C:/proyectos/Alfa',
    inicial: 'A',
    estado: 'en-desarrollo',
    descripcion: '',
    archivado: false,
    reemplazadoPor: null,
    icono: null,
    problema: null,
    hito: { numero: 7, nombre: 'Construcción', proximoPaso: 'Hacer la grilla.' },
    preguntas: { sinResponder: 0, frenan: 0, respondidas: 0 },
    revision: 0,
    skills: 0,
    framework: { avisos: [] },
    ...cambio,
  }
}

describe('por dónde se entra a un proyecto', () => {
  it('a la Bandeja de entrada si hay algo sin responder', () => {
    expect(seccionDeEntrada(tarjeta({ preguntas: { sinResponder: 2, frenan: 0, respondidas: 0 } }))).toBe(
      'pendientes',
    )
  })

  it('también si solo hay respuestas sin procesar: se ven en la Bandeja', () => {
    expect(seccionDeEntrada(tarjeta({ preguntas: { sinResponder: 0, frenan: 0, respondidas: 1 } }))).toBe(
      'pendientes',
    )
  })

  it('al Mapa si la bandeja está vacía', () => {
    expect(seccionDeEntrada(tarjeta())).toBe('mapa')
  })

  it('una carpeta sin docs/estado.md, a Archivos (carpeta simple, D-095)', () => {
    expect(seccionDeEntrada(tarjeta({ hito: null, framework: null }))).toBe('archivos')
  })

  it('sin la tarjeta todavía (la lista no cargó), a la Bandeja como antes', () => {
    expect(seccionDeEntrada(null)).toBe('pendientes')
  })
})

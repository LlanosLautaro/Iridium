import { describe, expect, it } from 'vitest'
import { marcaDeBandeja } from '../src/compartido/cuentas'
import type { TarjetaProyecto } from '../src/compartido/puente'
import { armarTarjeta, ordenarTarjetas } from '../src/main/core/grilla'
import { leerMetadatos } from '../src/main/core/metadatos'
import { contarPendientes, leerTipo } from '../src/main/core/pendientes'
import { proyectoAfectado } from '../src/main/core/vigilancia'

const ficha = (estado: string, extra: Record<string, unknown> = {}) =>
  leerMetadatos(
    JSON.stringify({
      version: 1,
      descripcion: 'd',
      estado,
      etiquetas: [],
      icono: null,
      archivado: false,
      reemplazadoPor: null,
      ...extra,
    }),
  )
const sinPreguntas = { sinResponder: 0, frenan: 0, respondidas: 0 }
const tarjeta = (nombre: string, metadatos: ReturnType<typeof leerMetadatos> | null): TarjetaProyecto =>
  armarTarjeta({ nombre, ruta: `R/${nombre}`, metadatos, guia: null, icono: null, preguntas: sinPreguntas })

describe('armarTarjeta', () => {
  it('toma estado, descripción, archivado y reemplazo de la ficha', () => {
    const t = armarTarjeta({
      nombre: 'Alfa',
      ruta: 'R/Alfa',
      metadatos: ficha('en-rescate', { reemplazadoPor: 'Beta', archivado: true }),
      guia: {
        hito: 7,
        nombreHito: 'Construcción',
        estadoHito: null,
        proximoPaso: 'Seguir',
        actualizado: null,
      },
      icono: 'data:image/svg+xml;base64,AA==',
      preguntas: { sinResponder: 2, frenan: 1, respondidas: 0 },
    })
    expect(t).toMatchObject({
      inicial: 'A',
      estado: 'en-rescate',
      archivado: true,
      reemplazadoPor: 'Beta',
      hito: { numero: 7, nombre: 'Construcción', proximoPaso: 'Seguir' },
      preguntas: { sinResponder: 2, frenan: 1, respondidas: 0 },
      problema: null,
    })
  })

  it('una ficha dañada lleva el motivo y ningún estado', () => {
    const t = tarjeta('Roto', leerMetadatos('{ "version": 1, '))
    expect(t.estado).toBeNull()
    expect(t.problema).not.toBeNull()
  })

  it('sin estado.md, el hito es null ("Sin estado")', () => {
    expect(tarjeta('X', ficha('idea')).hito).toBeNull()
  })

  it('el reemplazo solo cuenta en los que están en rescate', () => {
    expect(tarjeta('X', ficha('en-uso', { reemplazadoPor: 'Y' })).reemplazadoPor).toBeNull()
  })
})

describe('ordenarTarjetas (H-1, D-136)', () => {
  const con = (t: TarjetaProyecto, ultimoCambio: number | null): TarjetaProyecto => ({ ...t, ultimoCambio })
  it('todos por el último cambio, sin agrupar por estado; después los archivados y al final las fichas dañadas', () => {
    const orden = ordenarTarjetas([
      con(tarjeta('Roto', leerMetadatos('no es json')), 900),
      con(tarjeta('zeta', ficha('en-uso', { archivado: true })), 800),
      con(tarjeta('Sin ficha', null), 300),
      con(tarjeta('Pausa', ficha('pausado')), 500),
      con(tarjeta('Idea', ficha('idea')), null),
      con(tarjeta('delta', ficha('en-desarrollo')), 100),
      con(tarjeta('Uso', ficha('en-uso')), 700),
      con(tarjeta('Viejo', ficha('en-rescate', { archivado: true })), 50),
    ]).map((t) => t.nombre)
    expect(orden).toEqual(['Uso', 'Pausa', 'Sin ficha', 'delta', 'Idea', 'zeta', 'Viejo', 'Roto'])
  })
  it('sin cambios, o con el mismo, por nombre', () => {
    const orden = ordenarTarjetas([
      con(tarjeta('beta', ficha('idea')), null),
      con(tarjeta('Alfa', ficha('en-uso')), null),
      con(tarjeta('Gamma', ficha('pausado')), 10),
      con(tarjeta('delta', ficha('en-desarrollo')), 10),
    ]).map((t) => t.nombre)
    expect(orden).toEqual(['delta', 'Gamma', 'Alfa', 'beta'])
  })
})

describe('leerTipo (D-019)', () => {
  it('lee el tipo y si frena de la primera línea', () => {
    expect(leerTipo('Tipo: prueba · frena\nContexto: x')).toMatchObject({ tipo: 'prueba', frena: true })
    expect(leerTipo('Tipo: decision')).toMatchObject({ tipo: 'decisión', frena: false })
    expect(leerTipo('Tipo: decisión · frena (el diseño técnico)')).toMatchObject({
      tipo: 'decisión',
      frena: true,
    })
    expect(leerTipo('Tipo: prueba · no frena')).toMatchObject({ tipo: 'prueba', frena: false })
  })
  it('sin línea Tipo, o con un tipo raro, es una consulta que no frena', () => {
    expect(leerTipo('Contexto: D-1. Opciones: A) a · B) b')).toMatchObject({ tipo: 'consulta', frena: false })
    expect(leerTipo('Tipo: otra cosa · frena')).toMatchObject({ tipo: 'consulta', frena: true })
    expect(leerTipo('')).toMatchObject({ tipo: 'consulta', frena: false })
  })
})

const ESTADO = `# Estado

## Preguntas abiertas
- **Q-7 — ¿Seguimos?**
  Tipo: decisión · frena
  Contexto: algo. Opciones: A) sí (recomendada) · B) no
- **Q-8 — ¿Probaste I-1?**
  Tipo: prueba
  Contexto: instalá.
- **Q-9 — ¿Vieja, sin tipo?**
  Contexto: nada.

## Próximo paso
Seguir.
`

describe('contarPendientes', () => {
  it('cuenta las sin responder y las que frenan', () => {
    expect(contarPendientes([ESTADO], () => null)).toEqual({ sinResponder: 3, frenan: 1, respondidas: 0 })
  })

  it('una respondida cuenta aparte y una procesada no cuenta; una respuesta de otra pregunta con el mismo código, sí', () => {
    const respuestas: Record<string, string> = {
      'Q-7': '# Q-7 — ¿Seguimos?\n\n**Opción:** A) sí\n',
      'Q-8': '# Q-8 — ¿Otra pregunta vieja?\n\nSí.\n',
      'Q-9': '# Q-9 — ¿Vieja, sin tipo?\n\nListo.\n\n> Procesada el 2026-10-20 → D-1\n',
    }
    expect(contarPendientes([ESTADO], (c) => respuestas[c] ?? null)).toEqual({
      sinResponder: 1,
      frenan: 0,
      respondidas: 1,
    })
  })

  it('un código repetido en un módulo cuenta una vez', () => {
    expect(contarPendientes([ESTADO, ESTADO], () => null).sinResponder).toBe(3)
  })

  it('el estado.md real de este proyecto se lee sin fallar', () => {
    expect(contarPendientes(['# Estado\n\n## Preguntas abiertas\n(ninguna)\n'], () => null)).toEqual({
      sinResponder: 0,
      frenan: 0,
      respondidas: 0,
    })
  })
})

describe('proyectoAfectado (vigilancia)', () => {
  it.each([
    ['Alfa', 'Alfa'],
    ['Alfa\\.proyecto.json', 'Alfa'],
    ['Alfa\\.proyecto-icono.svg', 'Alfa'],
    ['Alfa\\docs\\estado.md', 'Alfa'],
    ['Alfa/docs/respuestas/Q-3.md', 'Alfa'],
    ['Alfa\\docs\\respuestas', 'Alfa'],
    ['Alfa\\docs\\modulos\\puente\\estado.md', 'Alfa'],
    // Si sigue el framework y los avisos del control (W-2).
    ['Alfa\\docs\\README.md', 'Alfa'],
    ['Alfa/docs/trabajo.md', 'Alfa'],
  ])('%s cambia la tarjeta de %s', (ruta, proyecto) => {
    expect(proyectoAfectado(ruta)).toBe(proyecto)
  })

  it.each([
    '.git',
    'Alfa\\src\\index.ts',
    'Alfa\\node_modules\\x\\icono.svg',
    'Alfa\\docs\\04-ux.md',
    'Alfa\\docs\\modulos\\puente\\diseno.md',
    'Alfa\\README.md',
  ])('%s no cambia ninguna tarjeta', (ruta) => {
    expect(proyectoAfectado(ruta)).toBeNull()
  })
})

describe('la marca de la bandeja en la tarjeta (R-81)', () => {
  it('con algo sin responder, la cuenta; todo respondido, el tilde; vacía o sin empezar, el círculo', () => {
    expect(marcaDeBandeja({ sinResponder: 2, respondidas: 1 }, true)).toBe('cuenta')
    expect(marcaDeBandeja({ sinResponder: 0, respondidas: 3 }, true)).toBe('respondida')
    expect(marcaDeBandeja({ sinResponder: 0, respondidas: 0 }, true)).toBe('vacia')
    expect(marcaDeBandeja({ sinResponder: 0, respondidas: 0 }, false)).toBe('sin-empezar')
  })
})

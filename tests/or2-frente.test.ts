// OR-I2, W-2: la línea de en qué anda cada tarjeta, el frente en curso y su paso o, sin frentes, el Próximo paso.
import { describe, expect, it } from 'vitest'
import { textoFrente } from '../src/compartido/en-que'
import { armarTarjeta } from '../src/main/core/grilla'
import { leerGuia } from '../src/main/core/guia'
import { frenteActivo } from '../src/main/core/mapa'

const ESTADO = (filas: string, cab = '| Frente | Tipo | Paso | Estado |') => `# Estado del proyecto

## Hito actual
10 — Operación — en curso

## Módulos
${cab}
|---|---|---|---|
${filas}

## Próximo paso
Probar la I-3.
`

describe('el frente activo de la tabla «Módulos»', () => {
  it('la fila en curso, sin la ruta ni lo que va entre paréntesis', () => {
    const t = ESTADO(
      [
        '| Revisión (`modulos/revision/estado.md`) | producto hermano | en operación (con el hito 10) | hecho |',
        '| Orden (`modulos/orden/estado.md`) | sección | 7. Construcción (OR-I2 en curso) | en curso |',
      ].join('\n'),
    )
    expect(frenteActivo(t)).toEqual({ nombre: 'Orden', paso: '7. Construcción' })
  })

  it('sin ninguno en curso, o sin la tabla, no hay', () => {
    expect(frenteActivo(ESTADO('| Skills | sección | en operación | hecho |'))).toBeNull()
    expect(frenteActivo(ESTADO(''))).toBeNull()
    expect(frenteActivo('## Hito actual\n7 — Construcción\n')).toBeNull()
  })

  it('con el framework viejo: la columna Módulo, «Paso actual» y «reabierto»', () => {
    const t = ESTADO(
      '| **Pagos** | sección | 4. UX | reabierto |',
      '| Módulo | Tipo | Paso actual | Estado |',
    )
    expect(frenteActivo(t)).toEqual({ nombre: 'Pagos', paso: '4. UX' })
  })

  it('sin la columna Paso, solo el nombre', () => {
    const t = '## Módulos\n| Frente | Estado |\n|---|---|\n| Pagos | en curso |\n'
    expect(frenteActivo(t)).toEqual({ nombre: 'Pagos', paso: null })
  })
})

describe('la línea de la tarjeta', () => {
  const sinPreguntas = { sinResponder: 0, frenan: 0, respondidas: 0 }
  const tarjeta = (estado: string) =>
    armarTarjeta({
      nombre: 'Alfa',
      ruta: 'R/Alfa',
      metadatos: null,
      guia: leerGuia(estado),
      icono: null,
      preguntas: sinPreguntas,
    })

  it('con un frente en curso, «Orden · 4. UX»', () => {
    const t = tarjeta(ESTADO('| Orden | sección | 4. UX | en curso |'))
    expect(t.hito?.frente).toEqual({ nombre: 'Orden', paso: '4. UX' })
    expect(textoFrente(t.hito)).toBe('Orden · 4. UX')
  })

  it('sin frentes, el Próximo paso', () => {
    expect(textoFrente(tarjeta(ESTADO('')).hito)).toBe('Próximo: Probar la I-3.')
  })

  it('sin estado.md, nada', () => {
    expect(textoFrente(tarjeta('').hito)).toBeNull()
  })
})

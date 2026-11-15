// T-66: la ventana vuelve como quedó al cerrar (maximizada o con su lugar y tamaño), salvo que ese lugar ya no se vea.
import { describe, expect, it } from 'vitest'
import { comoAbrir, seVe } from '../src/main/core/ventana'

const pantalla = { x: 0, y: 0, width: 1920, height: 1040 }
const segunda = { x: 1920, y: 0, width: 1920, height: 1040 }
const minimo = { width: 1024, height: 640 }

describe('la ventana como quedó (T-66)', () => {
  it('sin nada guardado, el tamaño de siempre', () => {
    expect(comoAbrir(null, [pantalla], minimo)).toEqual({ rect: null, maximizada: false })
  })

  it('vuelve maximizada, con el lugar de antes para cuando se desmaximice', () => {
    const guardada = { x: 100, y: 50, width: 1300, height: 800, maximizada: true }
    expect(comoAbrir(guardada, [pantalla], minimo)).toEqual({
      rect: { x: 100, y: 50, width: 1300, height: 800 },
      maximizada: true,
    })
  })

  it('en el segundo monitor, si sigue conectado; si no, el tamaño de siempre (y maximizada si lo estaba)', () => {
    const guardada = { x: 2000, y: 100, width: 1200, height: 700, maximizada: false }
    expect(comoAbrir(guardada, [pantalla, segunda], minimo).rect).toEqual({
      x: 2000,
      y: 100,
      width: 1200,
      height: 700,
    })
    expect(comoAbrir(guardada, [pantalla], minimo)).toEqual({ rect: null, maximizada: false })
    expect(comoAbrir({ ...guardada, maximizada: true }, [pantalla], minimo)).toEqual({
      rect: null,
      maximizada: true,
    })
  })

  it('nunca más chica que el mínimo', () => {
    const r = comoAbrir({ x: 0, y: 0, width: 500, height: 300, maximizada: false }, [pantalla], minimo)
    expect(r.rect).toMatchObject({ width: 1024, height: 640 })
  })

  it('se ve si su barra de arriba cae en una pantalla, aunque sea en parte', () => {
    expect(seVe({ x: -1000, y: 10, width: 1200, height: 700 }, [pantalla])).toBe(true)
    expect(seVe({ x: -1150, y: 10, width: 1200, height: 700 }, [pantalla])).toBe(false)
    expect(seVe({ x: 100, y: -500, width: 1200, height: 700 }, [pantalla])).toBe(false)
  })
})

// D-172 (T-114): lo que cambia archivos espera a que su proyecto esté al día con GitHub, por proyecto. La vuelta va de a
// uno y el proyecto que se pide pasa primero; lo ya mirado no espera; sin conexión o pasado el límite, sigue y avisa.
import { describe, expect, it } from 'vitest'
import type { SincroniaGit } from '../src/compartido/puente'
import { avisoDeAlDia, VigiaSincronia } from '../src/main/app/sincronia'
import { motivoDeRed } from '../src/main/core/sincronia'

const estado = (resultado: SincroniaGit['resultado'], motivo: string | null = null): SincroniaGit => ({
  cuando: 0,
  resultado,
  bajados: resultado === 'bajado' ? 1 : 0,
  motivo,
})

/** Una vigía cuyo `traer` espera a que la prueba lo suelte, para ver el orden de la fila. */
function vigiaControlada(respuestas: Record<string, SincroniaGit | null> = {}) {
  const mirados: string[] = []
  const soltar = new Map<string, () => void>()
  const registro: string[] = []
  const v = new VigiaSincronia({
    proyectos: async () => ['Alfa', 'Beta', 'Gamma', 'Delta'],
    traer: (r) => {
      mirados.push(r)
      return new Promise((cumplir) => soltar.set(r, () => cumplir(respuestas[r] ?? estado('al-dia'))))
    },
    ocupado: async () => false,
    ahora: () => 0,
    registrar: (t) => registro.push(t),
  })
  /** Espera a que se esté mirando `r`. */
  const mirando = async (r: string) => {
    for (let i = 0; i < 50 && !soltar.has(r); i++) await new Promise((c) => setTimeout(c, 1))
  }
  /** Espera a que se esté mirando `r` y lo suelta. */
  const terminar = async (r: string) => {
    await mirando(r)
    const f = soltar.get(r)
    if (!f) throw new Error(`${r} no se estaba mirando (mirados: ${mirados.join(', ')})`)
    soltar.delete(r)
    f()
  }
  return { v, mirados, mirando, terminar, registro }
}

describe('la espera antes de cambiar archivos (D-172)', () => {
  it('el proyecto que se pide pasa primero en la vuelta', async () => {
    const { v, mirados, mirando, terminar } = vigiaControlada()
    const vuelta = v.vuelta()
    await terminar('Alfa')
    // Mientras se mira Beta, se entra a Delta: va antes que Gamma.
    await mirando('Beta')
    const entrar = v.revisar('Delta')
    await terminar('Beta')
    await terminar('Delta')
    await entrar
    await terminar('Gamma')
    await vuelta
    expect(mirados).toEqual(['Alfa', 'Beta', 'Delta', 'Gamma'])
    v.cerrar()
  })

  it('espera al proyecto sin mirar; lo ya mirado no espera', async () => {
    const { v, mirados, terminar } = vigiaControlada()
    const alDia = v.alDia('Gamma')
    await terminar('Gamma')
    expect(await alDia).toEqual({ espero: true, aviso: null })
    expect(await v.alDia('Gamma')).toEqual({ espero: false, aviso: null })
    expect(mirados).toEqual(['Gamma'])
    v.cerrar()
  })

  it('pedirlo mientras se mira no lo vuelve a mirar', async () => {
    const { v, mirados, mirando, terminar } = vigiaControlada()
    const vuelta = v.vuelta()
    await mirando('Alfa')
    const alDia = v.alDia('Alfa')
    await terminar('Alfa')
    expect((await alDia).espero).toBe(true)
    await terminar('Beta')
    await terminar('Gamma')
    await terminar('Delta')
    await vuelta
    expect(mirados).toEqual(['Alfa', 'Beta', 'Gamma', 'Delta'])
    v.cerrar()
  })

  it('pasado el límite, sigue y lo avisa', async () => {
    const { v, registro } = vigiaControlada()
    const r = await v.alDia('Alfa', 20)
    expect(r.espero).toBe(true)
    expect(r.aviso).toMatch(/tardó demasiado/)
    expect(registro.join('\n')).toMatch(/Alfa no terminó de mirarse/)
    v.cerrar()
  })

  it('sin conexión o sin sesión, sigue con el motivo', async () => {
    const motivo = 'No se pudo conectar con el remoto. ¿Hay internet?'
    const { v, terminar } = vigiaControlada({ Alfa: estado('sin-conexion', motivo), Beta: null })
    const sin = v.alDia('Alfa')
    await terminar('Alfa')
    expect(await sin).toEqual({ espero: true, aviso: motivo })
    // Sin remoto, no hay nada que esperar ni avisar.
    const sinRemoto = v.alDia('Beta')
    await terminar('Beta')
    expect(await sinRemoto).toEqual({ espero: true, aviso: null })
    expect(await v.alDia('Beta')).toEqual({ espero: false, aviso: null })
    v.cerrar()
  })

  it('cerrar suelta a los que esperaban', async () => {
    const { v } = vigiaControlada()
    const alDia = v.alDia('Alfa')
    v.cerrar()
    expect(await alDia).toEqual({ espero: true, aviso: null })
  })

  it('dice qué pasa en palabras del usuario', () => {
    expect(avisoDeAlDia(null)).toBeNull()
    expect(avisoDeAlDia(estado('bajado'))).toBeNull()
    expect(avisoDeAlDia(estado('separada'))).toMatch(/Sincronizar/)
    expect(avisoDeAlDia(estado('error', 'No hay una sesión de GitHub'))).toBe('No hay una sesión de GitHub')
    // Un remoto que ya no está (una carpeta borrada) se dice igual que uno que GitHub no encuentra.
    expect(motivoDeRed("fatal: 'C:/x/nube' does not appear to be a git repository").motivo).toMatch(
      /ya no está en el remoto/,
    )
  })
})

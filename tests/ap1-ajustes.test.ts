// AP-I1 (módulo Apariencia y ajustes): los ajustes en `config.json`, el tono en las sesiones y los estilos de
// Claude Code. Con el motor falso: no abre Claude Code ni gasta uso.
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { CambioConversacion } from '../src/compartido/puente'
import { Conversaciones } from '../src/main/app/conversacion'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { ArchivoConfig, preferenciasDe } from '../src/main/infra/config'
import { ArchivoSesiones } from '../src/main/infra/sesiones'
import { CambioPreferencias } from '../src/main/ipc/esquemas'
import { crearMotorFalso, type Motor, type OpcionesSesion } from '../src/main/motor/motor'
import { encabezadoDeEstilo, tonoDeSesion } from '../src/main/motor/sdk'

let raiz: string
beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-ap1-'))
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

describe('los ajustes en config.json (D-065)', () => {
  it('sin nada guardado: «Vos», «IA» y el tono de Claude Code; el tema ya no se guarda (D-104)', async () => {
    const p = preferenciasDe(await new ArchivoConfig(join(raiz, 'config.json')).leer())
    expect(p).toMatchObject({ nombreUsuario: '', nombreIa: '', tono: '' })
    expect(p).not.toHaveProperty('tema')
  })

  it('se guardan y siguen al volver a abrir', async () => {
    const archivo = join(raiz, 'datos', 'config.json')
    await new ArchivoConfig(archivo).guardar({
      nombreUsuario: 'Lautaro',
      nombreIa: 'Iri',
      tono: 'Explanatory',
    })
    expect(preferenciasDe(await new ArchivoConfig(archivo).leer())).toMatchObject({
      nombreUsuario: 'Lautaro',
      nombreIa: 'Iri',
      tono: 'Explanatory',
    })
  })

  it('valores rotos vuelven a los de siempre sin perder los demás; un tema de antes se ignora', async () => {
    const archivo = join(raiz, 'config.json')
    await writeFile(
      archivo,
      JSON.stringify({ tema: 'rosa', nombreUsuario: 'x'.repeat(500), nombreIa: 3, tono: 'Learning' }),
    )
    expect(await new ArchivoConfig(archivo).leer()).toMatchObject({
      nombreUsuario: '',
      nombreIa: '',
      tono: 'Learning',
    })
  })

  it('si no se puede escribir, sigue como antes', async () => {
    // La «carpeta» de datos es un archivo: no se puede crear config.json adentro.
    await writeFile(join(raiz, 'ocupado'), '')
    const c = new ArchivoConfig(join(raiz, 'ocupado', 'config.json'))
    await expect(c.guardar({ nombreUsuario: 'Lau' })).rejects.toThrow()
    expect((await c.leer()).nombreUsuario).toBe('')
  })

  it('desde la ventana: sin tema (D-104) y textos de largo razonable', () => {
    expect(CambioPreferencias.safeParse({ tema: 'carbon' }).success).toBe(false)
    expect(CambioPreferencias.safeParse({ nombreUsuario: 'x'.repeat(61) }).success).toBe(false)
    expect(CambioPreferencias.safeParse({ nombreIa: 'x'.repeat(41) }).success).toBe(false)
    expect(CambioPreferencias.safeParse({ tono: 'x'.repeat(101) }).success).toBe(false)
  })
})

describe('el tono en las sesiones (AJ-3)', () => {
  it('va como ajuste propio de la sesión; sin tono no se pasa nada', () => {
    expect(tonoDeSesion('Explanatory')).toEqual({ settings: { outputStyle: 'Explanatory' } })
    expect(tonoDeSesion(null)).toEqual({})
  })

  it('cada sesión se abre con el tono guardado, y uno nuevo llega a las sesiones abiertas', async () => {
    const alfa = join(raiz, 'Alfa')
    await mkdir(join(alfa, 'docs'), { recursive: true })
    await writeFile(join(alfa, 'docs', 'estado.md'), '# Estado\n\n## Preguntas abiertas\n(ninguna)\n')
    const falso = crearMotorFalso({ pasoMs: 30 })
    const abiertas: OpcionesSesion[] = []
    const puestos: (string | null)[] = []
    const motor: Motor = {
      ...falso,
      abrir: (o, f) => {
        abiertas.push(o)
        const s = falso.abrir(o, f)
        return {
          ...s,
          ponerTono: (t) => {
            puestos.push(t)
            s.ponerTono(t)
          },
        }
      },
    }
    let tono: string | null = 'Learning'
    const cambios: CambioConversacion[] = []
    const c = new Conversaciones({
      motor,
      registro: new ArchivoSesiones(join(raiz, 'sesiones.json')),
      preguntas: leerPreguntasAbiertas,
      alCambio: (x) => cambios.push(x),
      tono: async () => tono,
    })
    await c.seguir(alfa, {})
    expect(abiertas[0]?.tono).toBe('Learning')
    tono = null
    c.ponerTono(null)
    expect(puestos).toEqual([null])
    // La IA falsa dice el estilo con el que respondió: el cambio vale desde el mensaje siguiente.
    const fin = Date.now() + 3000
    while (!cambios.some((x) => x.ficha?.estado === 'terminada') && Date.now() < fin)
      await new Promise((r) => setTimeout(r, 10))
    const textos = cambios.flatMap((x) => x.entradas).filter((e) => e.tipo === 'ia')
    expect(textos.some((e) => e.tipo === 'ia' && e.html.includes('Estilo'))).toBe(false)
  })
})

describe('los estilos de Claude Code', () => {
  it('el motor falso trae los de Claude Code; sin sesión, ninguno', async () => {
    expect((await crearMotorFalso().estilos())?.map((e) => e.id)).toEqual([
      'default',
      'Explanatory',
      'Learning',
    ])
    expect(await crearMotorFalso({ estado: { tipo: 'sin-sesion' } }).estilos()).toBeNull()
  })

  it('la descripción de un estilo propio sale de su encabezado', async () => {
    const texto = '---\r\nname: Pirata\r\ndescription: "Habla como un pirata"\r\n---\r\n\r\nArr.'
    expect(encabezadoDeEstilo(texto)).toEqual({ nombre: 'Pirata', descripcion: 'Habla como un pirata' })
    expect(encabezadoDeEstilo('sin encabezado')).toEqual({ nombre: null, descripcion: null })
    await writeFile(join(raiz, 'x.md'), texto)
    expect(encabezadoDeEstilo(await readFile(join(raiz, 'x.md'), 'utf8')).nombre).toBe('Pirata')
  })
})

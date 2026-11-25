// PA-I5 (frente Paridad, Capacidades, T-28; D-189 › 4): el navegador. Con qué navegador va en palabras, buscar la
// extensión «Claude» en los perfiles de Chrome, Brave y Edge, `--chrome` en la sesión y que llegue a las sesiones
// nuevas. Sin abrir Claude Code.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ID_EXTENSION_CLAUDE, textoNavegador } from '../src/compartido/capacidades'
import { Conversaciones } from '../src/main/app/conversacion'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { navegadoresConClaude } from '../src/main/infra/capacidades'
import { ArchivoSesiones } from '../src/main/infra/sesiones'
import { crearMotorFalso } from '../src/main/motor/motor'
import { describirHerramienta, navegadorDeSesion } from '../src/main/motor/sdk'

let raiz: string
beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-pa5-'))
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

/** Un perfil de navegador de muestra, con la extensión o con otra. */
async function perfil(navegador: string[], nombre: string, extension: string) {
  await mkdir(join(raiz, ...navegador, 'User Data', nombre, 'Extensions', extension, '1.0.109_0'), {
    recursive: true,
  })
}

describe('con qué navegador va, en palabras (ux.md › Navegador)', () => {
  it('uno, dos o ninguno; en el orden Chrome, Brave, Edge', () => {
    expect(textoNavegador(['Brave'])).toBe('Brave, con la extensión «Claude»')
    expect(textoNavegador(['Edge', 'Brave'])).toBe('Brave y Edge, con la extensión «Claude»')
    expect(textoNavegador(['Edge', 'Chrome', 'Brave'])).toBe(
      'Chrome, Brave y Edge, con la extensión «Claude»',
    )
    expect(textoNavegador([])).toBeNull()
  })
})

describe('buscar la extensión en la PC (D-189 › 4)', () => {
  it('la encuentra en cualquier perfil, no solo en el de entrada', async () => {
    await perfil(['BraveSoftware', 'Brave-Browser'], 'Profile 2', ID_EXTENSION_CLAUDE)
    await perfil(['BraveSoftware', 'Brave-Browser'], 'Default', 'otraextension')
    expect(await navegadoresConClaude(raiz)).toEqual(['Brave'])
  })

  it('en varios navegadores, todos; un navegador con otras extensiones no cuenta', async () => {
    await perfil(['Microsoft', 'Edge'], 'Default', ID_EXTENSION_CLAUDE)
    await perfil(['Google', 'Chrome'], 'Default', ID_EXTENSION_CLAUDE)
    await perfil(['BraveSoftware', 'Brave-Browser'], 'Default', 'otraextension')
    expect(await navegadoresConClaude(raiz)).toEqual(['Chrome', 'Edge'])
  })

  it('sin navegadores, o con un archivo donde iría la carpeta, ninguno y sin fallar', async () => {
    expect(await navegadoresConClaude(join(raiz, 'no-existe'))).toEqual([])
    await mkdir(join(raiz, 'Google', 'Chrome', 'User Data', 'Default', 'Extensions'), { recursive: true })
    await writeFile(
      join(raiz, 'Google', 'Chrome', 'User Data', 'Default', 'Extensions', ID_EXTENSION_CLAUDE),
      '',
    )
    await writeFile(join(raiz, 'Google', 'Chrome', 'User Data', 'Local State'), '{}')
    expect(await navegadoresConClaude(raiz)).toEqual([])
  })
})

describe('la sesión (D-189 › 4)', () => {
  it('con el navegador, `--chrome`; apagado, nada', () => {
    expect(navegadorDeSesion(true)).toEqual({ extraArgs: { chrome: null } })
    expect(navegadorDeSesion(false)).toEqual({})
    expect(navegadorDeSesion()).toEqual({})
  })

  it('las sesiones nuevas se abren con el navegador si está prendido, y sin él si no', async () => {
    const alfa = join(raiz, 'Alfa')
    await mkdir(join(alfa, 'docs'), { recursive: true })
    await writeFile(join(alfa, 'docs', 'estado.md'), '# Estado\n\n## Preguntas abiertas\n(ninguna)\n')
    for (const prendido of [true, false]) {
      const vistos: boolean[] = []
      const c = new Conversaciones({
        motor: crearMotorFalso({ pasoMs: 1, alNavegador: (_, n) => vistos.push(n) }),
        registro: new ArchivoSesiones(join(raiz, `datos-${prendido}`, 'sesiones.json')),
        preguntas: leerPreguntasAbiertas,
        alCambio: () => {},
        navegador: async () => prendido,
      })
      await c.seguir(alfa, { texto: 'hola' })
      expect(vistos).toEqual([prendido])
    }
  })

  it('si no se puede leer el ajuste, la sesión va sin el navegador (P2: apagado de entrada)', async () => {
    const alfa = join(raiz, 'Alfa')
    await mkdir(join(alfa, 'docs'), { recursive: true })
    await writeFile(join(alfa, 'docs', 'estado.md'), '# Estado\n\n## Preguntas abiertas\n(ninguna)\n')
    const vistos: boolean[] = []
    const c = new Conversaciones({
      motor: crearMotorFalso({ pasoMs: 1, alNavegador: (_, n) => vistos.push(n) }),
      registro: new ArchivoSesiones(join(raiz, 'datos', 'sesiones.json')),
      preguntas: leerPreguntasAbiertas,
      alCambio: () => {},
      navegador: async () => {
        throw new Error('config.json roto')
      },
    })
    await c.seguir(alfa, { texto: 'hola' })
    expect(vistos).toEqual([false])
  })
})

describe('los pasos en el navegador, en palabras (ux.md › PA-10)', () => {
  const paso = (h: string, entrada: unknown) => {
    const d = describirHerramienta(`mcp__claude-in-chrome__${h}`, entrada, 'D:Alfa')
    return `${d.accion} ${d.objeto ?? ''}`.trim()
  }
  it('abrir, leer, buscar y el mouse y el teclado', () => {
    expect(paso('navigate', { url: 'https://example.com', tabId: 1 })).toBe(
      'En el navegador: abrió https://example.com',
    )
    expect(paso('tabs_context_mcp', {})).toBe('En el navegador: miró las pestañas')
    expect(paso('get_page_text', { tabId: 1 })).toBe('En el navegador: leyó la página')
    expect(paso('find', { query: 'el botón de entrar' })).toBe(
      'En el navegador: buscó en la página el botón de entrar',
    )
    expect(paso('computer', { action: 'left_click', coordinate: [10, 20] })).toBe(
      'En el navegador: hizo clic',
    )
    expect(paso('computer', { action: 'screenshot' })).toBe('En el navegador: sacó una captura')
  })
  it('lo escrito no se muestra (puede ser una clave); una herramienta nueva, con su nombre', () => {
    expect(paso('computer', { action: 'type', text: 'mi-clave-secreta' })).toBe('En el navegador: escribió')
    expect(paso('form_input', { ref: 'x', value: 'mi-clave-secreta' })).toBe(
      'En el navegador: completó un campo',
    )
    expect(paso('herramienta_nueva', {})).toBe('En el navegador: usó herramienta_nueva')
  })
  it('las de otros conectores siguen como antes', () => {
    const d = describirHerramienta('mcp__claude_ai_Gmail__search', {}, 'D:Alfa')
    expect(`${d.accion} ${d.objeto}`).toBe('Usó claude_ai_Gmail · search')
  })
})

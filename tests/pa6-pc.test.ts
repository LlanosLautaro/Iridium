// PA-I6 (frente Paridad, Capacidades, T-28; D-189 › 5 y 6): usar la PC con Windows-MCP. Buscarlo y buscar uv en la
// PC, Instalar (uv con winget si falta y después Windows-MCP, solo esos comandos), `mcpServers.pc` en la sesión, que
// llegue a las sesiones nuevas solo prendido e instalado, y los pasos en palabras. Sin abrir Claude Code.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Capacidades, INSTALAR_UV, instalarWindowsMcp } from '../src/main/app/capacidades'
import { Conversaciones } from '../src/main/app/conversacion'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { buscarPc, type PcEnLaPc } from '../src/main/infra/capacidades'
import { ArchivoSesiones } from '../src/main/infra/sesiones'
import { crearMotorFalso } from '../src/main/motor/motor'
import { AVISO_PC, describirHerramienta, instruccionDeSesion, pcDeSesion } from '../src/main/motor/sdk'

let raiz: string
let inicio: string
let local: string
beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-pa6-'))
  inicio = join(raiz, 'inicio')
  local = join(raiz, 'local')
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

async function archivo(...partes: string[]): Promise<string> {
  const ruta = join(...partes)
  await mkdir(join(ruta, '..'), { recursive: true })
  await writeFile(ruta, '')
  return ruta
}

describe('buscar Windows-MCP y uv en la PC (D-189 › 6)', () => {
  it('sin nada, ninguno y sin fallar', async () => {
    expect(await buscarPc(inicio, local, '')).toEqual({ ejecutable: null, uv: null })
  })

  it('Windows-MCP donde lo deja `uv tool install`; una carpeta con su nombre no cuenta', async () => {
    await mkdir(join(inicio, '.local', 'bin', 'windows-mcp.exe'), { recursive: true })
    expect((await buscarPc(inicio, local, '')).ejecutable).toBeNull()
    await rm(join(inicio, '.local', 'bin', 'windows-mcp.exe'), { recursive: true })
    const exe = await archivo(inicio, '.local', 'bin', 'windows-mcp.exe')
    expect((await buscarPc(inicio, local, '')).ejecutable).toBe(exe)
  })

  it('uv en el PATH antes que en las carpetas de winget', async () => {
    const enPath = await archivo(raiz, 'herramientas', 'uv.exe')
    await archivo(local, 'Microsoft', 'WinGet', 'Links', 'uv.exe')
    expect((await buscarPc(inicio, local, `C:\\no-existe;${join(raiz, 'herramientas')};`)).uv).toBe(enPath)
  })

  it('recién instalado con winget, sin estar en el PATH: en Links o en su paquete', async () => {
    const paquete = await archivo(
      local,
      'Microsoft',
      'WinGet',
      'Packages',
      'astral-sh.uv_Microsoft.Winget.Source_8wekyb3d8bbwe',
      'uv.exe',
    )
    expect((await buscarPc(inicio, local, '')).uv).toBe(paquete)
    const link = await archivo(local, 'Microsoft', 'WinGet', 'Links', 'uv.exe')
    expect((await buscarPc(inicio, local, '')).uv).toBe(link)
  })

  it('el de su propio instalador (`.local\\bin`) también', async () => {
    const uv = await archivo(inicio, '.local', 'bin', 'uv.exe')
    expect((await buscarPc(inicio, local, '')).uv).toBe(uv)
  })
})

describe('Instalar (D-189 › 6)', () => {
  /** Una PC de muestra: cada consola deja lo que instalaría. */
  function pcDeMuestra(inicial: PcEnLaPc, deja: Record<string, Partial<PcEnLaPc>>) {
    let pc = { ...inicial }
    const corridos: [string, string][] = []
    return {
      corridos,
      dep: {
        buscar: async () => ({ ...pc }),
        consola: async (nombre: string, comando: string) => {
          corridos.push([nombre, comando])
          pc = { ...pc, ...deja[nombre] }
        },
      },
    }
  }
  const capacidades = (pc: ReturnType<typeof pcDeMuestra>['dep']) =>
    new Capacidades({ motor: crearMotorFalso({ pasoMs: 1 }), apagados: async () => [], pc })

  it('sin uv: winget primero y después Windows-MCP con el uv que quedó', async () => {
    const m = pcDeMuestra(
      { ejecutable: null, uv: null },
      {
        'Instalar uv': { uv: 'C:\\L\\uv.exe' },
        'Instalar Windows-MCP': { ejecutable: 'C:\\U\\.local\\bin\\windows-mcp.exe' },
      },
    )
    const c = capacidades(m.dep)
    expect(await c.pcInstalada()).toBe(false)
    expect(await c.instalarPc()).toBe(true)
    expect(m.corridos).toEqual([
      ['Instalar uv', INSTALAR_UV],
      ['Instalar Windows-MCP', '"C:\\L\\uv.exe" tool install windows-mcp'],
    ])
    expect(INSTALAR_UV).toMatch(/^winget install --id astral-sh\.uv -e /)
    expect(await c.pcInstalada()).toBe(true)
  })

  it('con uv: solo Windows-MCP; ya instalado, nada', async () => {
    const m = pcDeMuestra(
      { ejecutable: null, uv: 'C:\\uv.exe' },
      { 'Instalar Windows-MCP': { ejecutable: 'C:\\w.exe' } },
    )
    const c = capacidades(m.dep)
    expect(await c.instalarPc()).toBe(true)
    expect(await c.instalarPc()).toBe(true)
    expect(m.corridos.map(([n]) => n)).toEqual(['Instalar Windows-MCP'])
  })

  it('si uv no quedó (cerraron la consola), no sigue y dice que no', async () => {
    const m = pcDeMuestra({ ejecutable: null, uv: null }, {})
    expect(await capacidades(m.dep).instalarPc()).toBe(false)
    expect(m.corridos.map(([n]) => n)).toEqual(['Instalar uv'])
  })

  it('si Windows-MCP no quedó, o la consola no abre, dice que no', async () => {
    const m = pcDeMuestra({ ejecutable: null, uv: 'C:\\uv.exe' }, {})
    expect(await capacidades(m.dep).instalarPc()).toBe(false)
    const rota = new Capacidades({
      motor: crearMotorFalso({ pasoMs: 1 }),
      apagados: async () => [],
      pc: {
        buscar: async () => ({ ejecutable: null, uv: 'C:\\uv.exe' }),
        consola: async () => {
          throw new Error('La consola de Iridium no cargó.')
        },
      },
    })
    expect(await rota.instalarPc()).toBe(false)
  })

  it('dos clics seguidos instalan una vez', async () => {
    const m = pcDeMuestra(
      { ejecutable: null, uv: 'C:\\uv.exe' },
      { 'Instalar Windows-MCP': { ejecutable: 'C:\\w.exe' } },
    )
    const c = capacidades(m.dep)
    expect(await Promise.all([c.instalarPc(), c.instalarPc()])).toEqual([true, true])
    expect(m.corridos).toHaveLength(1)
  })

  it('sin la consola de Iridium, no hay PC', async () => {
    const c = new Capacidades({ motor: crearMotorFalso({ pasoMs: 1 }), apagados: async () => [] })
    expect(await c.pcInstalada()).toBe(false)
    expect(await c.instalarPc()).toBe(false)
  })

  it('la ruta de uv va entre comillas (puede tener espacios)', () => {
    expect(instalarWindowsMcp('C:\\Users\\Ana María\\uv.exe')).toBe(
      '"C:\\Users\\Ana María\\uv.exe" tool install windows-mcp',
    )
  })
})

describe('la sesión (D-189 › 5)', () => {
  it('con la PC, Windows-MCP como `pc` sin PowerShell, archivos ni registro y sin su aviso de uso', () => {
    expect(pcDeSesion({ ejecutable: 'C:\\U\\.local\\bin\\windows-mcp.exe' })).toEqual({
      mcpServers: {
        pc: {
          type: 'stdio',
          command: 'C:\\U\\.local\\bin\\windows-mcp.exe',
          args: ['serve', '--transport', 'stdio', '--exclude-tools', 'PowerShell,FileSystem,Registry'],
          env: { ANONYMIZED_TELEMETRY: 'false' },
        },
      },
    })
    expect(pcDeSesion(null)).toEqual({})
    expect(pcDeSesion()).toEqual({})
  })

  it('con la PC, la IA sabe que los atajos de Windows en español cambian (Ctrl+A abría un archivo); sin ella, no', () => {
    expect(instruccionDeSesion('Base.', { ejecutable: 'C:\\w.exe' })).toBe(`Base. ${AVISO_PC}`)
    expect(AVISO_PC).toContain('Ctrl+E selecciona todo')
    expect(instruccionDeSesion('Base.', null)).toBe('Base.')
  })

  async function sesionCon(pc: () => Promise<{ ejecutable: string } | null>) {
    const alfa = join(raiz, 'Alfa')
    await mkdir(join(alfa, 'docs'), { recursive: true })
    await writeFile(join(alfa, 'docs', 'estado.md'), '# Estado\n\n## Preguntas abiertas\n(ninguna)\n')
    const vistos: ({ ejecutable: string } | null)[] = []
    const c = new Conversaciones({
      motor: crearMotorFalso({ pasoMs: 1, alPc: (_, p) => vistos.push(p) }),
      registro: new ArchivoSesiones(join(raiz, 'datos', 'sesiones.json')),
      preguntas: leerPreguntasAbiertas,
      alCambio: () => {},
      pc,
    })
    await c.seguir(alfa, { texto: 'hola' })
    return vistos
  }

  it('las sesiones nuevas van con la PC si está prendida e instalada; si no, sin ella', async () => {
    expect(await sesionCon(async () => ({ ejecutable: 'C:\\w.exe' }))).toEqual([{ ejecutable: 'C:\\w.exe' }])
    expect(await sesionCon(async () => null)).toEqual([null])
  })

  it('si no se puede leer el ajuste, la sesión va sin la PC (P2: apagada de entrada)', async () => {
    expect(
      await sesionCon(async () => {
        throw new Error('config.json roto')
      }),
    ).toEqual([null])
  })
})

describe('los pasos en la PC, en palabras', () => {
  const paso = (h: string, entrada: unknown) => {
    const d = describirHerramienta(`mcp__pc__${h}`, entrada, 'D:Alfa')
    return `${d.accion} ${d.objeto ?? ''}`.trim()
  }
  it('capturas, clics y programas', () => {
    expect(paso('Screenshot', {})).toBe('En la PC: sacó una captura')
    expect(paso('Snapshot', { use_vision: false })).toBe('En la PC: miró la pantalla')
    expect(paso('Click', { loc: [10, 20] })).toBe('En la PC: hizo clic')
    expect(paso('App', { mode: 'launch', name: 'Bloc de notas' })).toBe('En la PC: abrió Bloc de notas')
    expect(paso('App', { name: 'Bloc de notas' })).toBe('En la PC: abrió Bloc de notas')
    expect(paso('App', { mode: 'switch', name: 'Bedrock Studio' })).toBe('En la PC: pasó a Bedrock Studio')
    expect(paso('App', { mode: 'resize', name: 'Bloc de notas' })).toBe(
      'En la PC: cambió el tamaño de Bloc de notas',
    )
    expect(paso('App', { mode: 'otro' })).toBe('En la PC: abrió o cambió de programa')
  })
  it('lo escrito y lo copiado no se muestran; una herramienta nueva, con su nombre', () => {
    expect(paso('Type', { text: 'mi-clave-secreta' })).toBe('En la PC: escribió')
    expect(paso('Clipboard', { mode: 'set', text: 'mi-clave-secreta' })).toBe('En la PC: usó el portapapeles')
    expect(paso('Nueva', {})).toBe('En la PC: usó Nueva')
  })
})

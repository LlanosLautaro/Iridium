// AB-I3 (frente Abrir, D-158): la app que se usa instalada fuera del proyecto. **Ejecutar:** con una ruta que empieza
// con una variable de Windows (`%LOCALAPPDATA%\…`): Ejecutar la abre, la actualización vigila ese `.exe` y el control
// marca una ruta fija. Con carpetas temporales.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { planDeArmado } from '../src/main/app/abrir'
import { DocumentosProyecto, rutaDeScript } from '../src/main/app/visor'
import { puedeArmarse } from '../src/main/core/abrir'
import { type ArchivosControl, correrControl } from '../src/main/core/control'
import { esRutaFija, leerScripts, rutaConVariable } from '../src/main/core/visor/scripts'

const SCRIPTS = `# Scripts

## Abrir Alfa
La que está instalada.
**Ejecutar:** \`%IRIDIUM_PRUEBA_INSTALADA%\\Alfa\\Alfa.exe\`
**Marca:** ejecutar · escritorio

## Actualizar Alfa
Arma el instalador y lo instala sin ventanas.
**Ejecutar:** \`npm run instalador && instalador\\Alfa-instalador.exe /S\`
**Marca:** armar
`

function control(scripts: string): string[] {
  const a: ArchivosControl = {
    estados: [],
    trabajo: '# Trabajo\n',
    respuestas: new Map(),
    documentos: [{ ruta: 'docs/scripts.md', texto: scripts }],
    frentes: [],
  }
  return correrControl(a)
    .filter((x) => x.regla === 'scripts')
    .map((x) => x.texto)
}

describe('la ruta con una variable de Windows', () => {
  it('se reconoce la variable y lo que sigue', () => {
    expect(rutaConVariable('%LOCALAPPDATA%\\Programs\\alfa\\Alfa.exe')).toEqual({
      variable: 'LOCALAPPDATA',
      resto: 'Programs\\alfa\\Alfa.exe',
    })
    expect(rutaConVariable('%APPDATA%/Alfa')).toEqual({ variable: 'APPDATA', resto: 'Alfa' })
    expect(rutaConVariable('dist/Alfa.exe')).toBeNull()
    expect(rutaConVariable('%%\\Alfa.exe')).toBeNull()
  })

  it('una ruta fija es la que empieza con una unidad o una barra', () => {
    expect(esRutaFija('C:\\Programas\\Alfa.exe')).toBe(true)
    expect(esRutaFija('\\\\equipo\\Alfa.exe')).toBe(true)
    expect(esRutaFija('%LOCALAPPDATA%\\Alfa.exe')).toBe(false)
    expect(esRutaFija('dist/Alfa.exe')).toBe(false)
  })

  it('la ruta completa sale de la variable (sin distinguir mayúsculas) o de la carpeta del proyecto', () => {
    const env = { LocalAppData: join('C:', 'Usuarios', 'Ana', 'Local') }
    expect(rutaDeScript('C:/P/Alfa', '%LOCALAPPDATA%\\Programs\\alfa\\Alfa.exe', env)).toBe(
      join('C:', 'Usuarios', 'Ana', 'Local', 'Programs', 'alfa', 'Alfa.exe'),
    )
    expect(rutaDeScript('C:/P/Alfa', '%NO_EXISTE%\\Alfa.exe', env)).toBeNull()
    expect(rutaDeScript('C:/P/Alfa', 'dist/Alfa.exe', env)).toBe(join('C:/P/Alfa', 'dist', 'Alfa.exe'))
    expect(rutaDeScript('C:/P/Alfa', 'C:\\Alfa.exe', env)).toBeNull()
  })
})

describe('el control', () => {
  it('acepta la app instalada con su variable', () => {
    expect(control(SCRIPTS)).toEqual([])
  })

  it('marca una ruta fija en lo que abre el proyecto', () => {
    const avisos = control(SCRIPTS.replace('%IRIDIUM_PRUEBA_INSTALADA%', 'C:\\Programas'))
    expect(avisos).toHaveLength(1)
    expect(avisos[0]).toContain('una ruta fija no sirve en otra PC')
  })
})

describe('la actualización de la app instalada', () => {
  it('vigila el .exe instalado y arma con el comando del proyecto', () => {
    const scripts = leerScripts(SCRIPTS)
    expect(puedeArmarse(scripts)).toBe(true)
    const env = { IRIDIUM_PRUEBA_INSTALADA: join('C:', 'Instaladas') }
    expect(planDeArmado(join('C:', 'P', 'Alfa'), scripts, env)).toEqual({
      exe: join('C:', 'Instaladas', 'Alfa', 'Alfa.exe'),
      comando: 'npm run instalador && instalador\\Alfa-instalador.exe /S',
      cwd: join('C:', 'P', 'Alfa'),
    })
    expect(planDeArmado(join('C:', 'P', 'Alfa'), scripts, {})).toBeNull()
  })
})

describe('Ejecutar la app instalada', () => {
  let base: string
  const antes = process.env.IRIDIUM_PRUEBA_INSTALADA
  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'iridium-ab3-'))
    process.env.IRIDIUM_PRUEBA_INSTALADA = join(base, 'instaladas')
  })
  afterEach(async () => {
    if (antes === undefined) delete process.env.IRIDIUM_PRUEBA_INSTALADA
    else process.env.IRIDIUM_PRUEBA_INSTALADA = antes
    await rm(base, { recursive: true, force: true })
  })

  async function documentos(scripts: string): Promise<DocumentosProyecto> {
    const p = join(base, 'Alfa')
    await mkdir(join(p, 'docs'), { recursive: true })
    await writeFile(join(p, 'docs', 'scripts.md'), scripts)
    const d = new DocumentosProyecto(p, () => null)
    await d.cargar()
    return d
  }

  it('sin instalar, dice sin-armar; instalada, la abre con Windows desde donde está', async () => {
    expect(await (await documentos(SCRIPTS)).prepararEjecutar()).toEqual({ tipo: 'sin-armar', armar: true })
    const exe = join(base, 'instaladas', 'Alfa', 'Alfa.exe')
    await mkdir(join(base, 'instaladas', 'Alfa'), { recursive: true })
    await writeFile(exe, 'no es un programa')
    expect(await (await documentos(SCRIPTS)).prepararEjecutar()).toEqual({
      tipo: 'sistema',
      nombre: 'Abrir Alfa',
      ruta: exe,
      modo: 'lanzar',
    })
  })

  it('**Abrir:** con una variable abre esa carpeta (antes decía que no se encontraba)', async () => {
    await mkdir(join(base, 'instaladas', 'Alfa', 'extension'), { recursive: true })
    const d = await documentos(
      '## Ver la extensión\n**Abrir:** `%IRIDIUM_PRUEBA_INSTALADA%\\Alfa\\extension`\n',
    )
    const id = d.scripts()[0]?.id ?? ''
    expect(d.scripts()[0]?.falta).toBeNull()
    expect(await d.prepararScript(id)).toEqual({
      tipo: 'sistema',
      nombre: 'Ver la extensión',
      ruta: join(base, 'instaladas', 'Alfa', 'extension'),
      modo: 'abrir',
    })
  })
})

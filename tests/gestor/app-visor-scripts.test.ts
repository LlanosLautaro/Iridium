// Copiado de la app anterior de proyectos (D-026).
// Scripts del usuario en el visor (D-039): leer `docs/scripts.md`, decidir qué hace cada botón y mostrar sus
// tarjetas en el documento.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DocumentosProyecto, rutaDelProyecto } from '../../src/main/app/visor'
import { leerScripts, modoDeEjecutar } from '../../src/main/core/visor/scripts'

const SCRIPTS = `# Scripts

> Lo que el usuario ejecuta a mano.

## Instalar la última versión
Instala o actualiza la app. Cerrala antes (D-1).
**Ejecutar:** \`dist/Mi App Setup 1.0.exe\`

## Instalador que todavía no se armó
**Ejecutar:** \`dist/otro.msi\`

## Abrir en modo desarrollo
Abre la versión en desarrollo.
**Carpeta:** \`app\`
**Ejecutar:** \`pnpm dev\`

## Abrir la carpeta de salida
**Abrir:** \`dist\`

## Sección sin acción
Solo texto.

\`\`\`
## No es un título
**Ejecutar:** \`rm -rf /\`
\`\`\`
`

describe('leer docs/scripts.md', () => {
  it('lee cada sección ## con su acción, su carpeta y su descripción; ignora las demás y los bloques de código', () => {
    const s = leerScripts(SCRIPTS)
    expect(s.map((x) => [x.nombre, x.accion, x.valor, x.carpeta])).toEqual([
      ['Instalar la última versión', 'ejecutar', 'dist/Mi App Setup 1.0.exe', null],
      ['Instalador que todavía no se armó', 'ejecutar', 'dist/otro.msi', null],
      ['Abrir en modo desarrollo', 'ejecutar', 'pnpm dev', 'app'],
      ['Abrir la carpeta de salida', 'abrir', 'dist', null],
    ])
    expect(s[0]?.descripcion).toBe('Instala o actualiza la app. Cerrala antes (D-1).')
    expect(s[2]?.descripcion).toBe('Abre la versión en desarrollo.')
    expect(s[3]?.descripcion).toBe('')
  })

  it('acepta CRLF, la negrita con los dos puntos afuera y un guion de lista', () => {
    const s = leerScripts('## Uno\r\nTexto.\r\n- **Abrir**: `a/b`\r\n')
    expect(s.map((x) => [x.accion, x.valor, x.descripcion])).toEqual([['abrir', 'a/b', 'Texto.']])
  })

  it('Ejecutar: un archivo que existe se lanza; un ejecutable que falta, falta; lo demás es un comando', () => {
    expect(modoDeEjecutar('dist/setup.exe', true)).toBe('lanzar')
    expect(modoDeEjecutar('dist/setup.exe', false)).toBe('falta')
    expect(modoDeEjecutar('versiones/x.vsix', false)).toBe('falta')
    expect(modoDeEjecutar('pnpm lanzar', false)).toBe('comando')
  })

  it('las rutas son del proyecto: ni absolutas ni afuera de la carpeta', () => {
    expect(rutaDelProyecto('dist\\setup.exe')).toBe('dist/setup.exe')
    expect(rutaDelProyecto('./dist/')).toBe('dist')
    expect(rutaDelProyecto('C:\\Windows\\notepad.exe')).toBeNull()
    expect(rutaDelProyecto('/etc/passwd')).toBeNull()
    expect(rutaDelProyecto('../otro/setup.exe')).toBeNull()
  })
})

describe('scripts en el visor', () => {
  let carpeta: string
  const escribir = async (ruta: string, texto: string) => {
    const abs = join(carpeta, ...ruta.split('/'))
    await mkdir(join(abs, '..'), { recursive: true })
    await writeFile(abs, texto)
  }
  async function proyecto(): Promise<DocumentosProyecto> {
    const p = new DocumentosProyecto(carpeta, (r) => `uri:${r}`)
    await p.cargar()
    return p
  }

  beforeEach(async () => {
    carpeta = await mkdtemp(join(tmpdir(), 'gestor-scripts-'))
    await escribir('docs/scripts.md', SCRIPTS)
    await escribir('docs/decisiones.md', '# Decisiones\n\n## D-1 — Primera\n')
    await escribir('dist/Mi App Setup 1.0.exe', 'MZ')
  })
  afterEach(async () => {
    await rm(carpeta, { recursive: true, force: true })
  })

  it('la vista trae los scripts con su modo, lo que falta y la descripción con los códigos enlazados', async () => {
    const v = (await proyecto()).vista()
    if (v.tipo !== 'documentos') throw new Error(v.tipo)
    expect(v.scripts.map((s) => [s.nombre, s.modo, s.falta])).toEqual([
      ['Instalar la última versión', 'lanzar', null],
      ['Instalador que todavía no se armó', 'lanzar', 'No se encuentra dist/otro.msi.'],
      ['Abrir en modo desarrollo', 'comando', 'No se encuentra la carpeta app.'],
      ['Abrir la carpeta de salida', 'abrir', null],
    ])
    expect(v.scripts[0]?.id).toBe('instalar-la-última-versión')
    expect(v.scripts[0]?.descripcionHtml).toContain('data-codigo="D-1"')
  })

  it('el botón: lanza el instalador, abre la carpeta, corre el comando en su carpeta y avisa lo que falta', async () => {
    await mkdir(join(carpeta, 'app'))
    const p = await proyecto()
    const [instalar, falta, dev, salida] = p.scripts().map((s) => s.id)
    expect(await p.prepararScript(instalar ?? '')).toEqual({
      tipo: 'sistema',
      nombre: 'Instalar la última versión',
      ruta: join(carpeta, 'dist', 'Mi App Setup 1.0.exe'),
      modo: 'lanzar',
    })
    expect(await p.prepararScript(salida ?? '')).toMatchObject({ tipo: 'sistema', modo: 'abrir' })
    expect(await p.prepararScript(dev ?? '')).toEqual({
      tipo: 'terminal',
      nombre: 'Abrir en modo desarrollo',
      cwd: join(carpeta, 'app'),
      comando: 'pnpm dev',
    })
    expect(await p.prepararScript(falta ?? '')).toEqual({
      tipo: 'error',
      mensaje: 'No se encuentra dist/otro.msi.',
    })
    expect((await p.prepararScript('no-existe')).tipo).toBe('error')
  })

  it('si el instalador aparece después, al revisar cambia sin recargar el documento', async () => {
    const p = await proyecto()
    expect(p.scripts()[1]?.falta).not.toBeNull()
    expect(await p.revisarScripts()).toBe(false)
    await escribir('dist/otro.msi', 'x')
    expect(await p.revisarScripts()).toBe(true)
    expect(p.scripts()[1]?.falta).toBeNull()
  })

  it('el documento muestra el título de cada script y, en lugar de su sección, el lugar de la tarjeta', async () => {
    const p = await proyecto()
    const d = p.documento('docs/scripts.md')
    if (d.tipo !== 'ok') throw new Error(d.tipo)
    expect(d.html.match(/data-script="/g)).toHaveLength(4)
    expect(d.html).toContain('<div class="gp-script" data-script="instalar-la-última-versión"></div>')
    expect(d.html).toContain('Instalar la última versión</h2>')
    expect(d.html).not.toContain('Cerrala antes')
    expect(d.html).toContain('Solo texto.')
    expect(d.html).toContain('Lo que el usuario ejecuta a mano.')
    expect(d.html).toContain('No es un título')
    // Otro documento con el mismo texto no tiene tarjetas.
    await escribir('docs/otro.md', SCRIPTS)
    await p.cargar()
    const otro = p.documento('docs/otro.md')
    expect(otro.tipo === 'ok' && !otro.html.includes('data-script')).toBe(true)
  })
})

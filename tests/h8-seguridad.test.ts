// Hito 8, tanda 2 (08-calidad.md › Seguridad): lo que la ventana muestra de un proyecto nunca se ejecuta, y lo que pide
// leer nunca sale de la carpeta del proyecto (ni con `..`, ni con una ruta absoluta, ni a través de un enlace).
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { colorear, type Lenguaje } from '../src/main/core/archivos'
import { htmlDeMensaje } from '../src/main/core/sesiones'
import { construirIndice } from '../src/main/core/visor/codigos'
import { esRutaDeDocumento } from '../src/main/core/visor/documentos'
import { renderizar } from '../src/main/core/visor/markdown'
import { leerArchivo, leerCarpeta } from '../src/main/infra/archivos'

/** Lo que no puede aparecer en el HTML que inserta la ventana. */
function sinCodigo(html: string): void {
  // Solo se miran las etiquetas de verdad: lo escapado (`&lt;script&gt;`) es texto que se ve tal cual.
  const etiquetas = html.match(/<[a-z][^>]*>/gi) ?? []
  expect(etiquetas.length).toBeGreaterThan(0)
  for (const e of etiquetas) {
    expect(e).not.toMatch(/^<(script|iframe|object|embed|meta|base|form|svg|style|link)\b/i)
    // Los nombres de los atributos, sin sus valores (adentro, las comillas del texto van escapadas: `&quot;`).
    expect(e.replace(/="[^"]*"/g, '')).not.toMatch(/\s(on\w+|srcdoc)\b/i)
    expect(e.replace(/="[^"]*"/g, '')).not.toMatch(/[='`]/)
    expect(e).not.toMatch(/(href|src)="\s*(javascript|vbscript|file|data:text)/i)
  }
}

const HOSTIL = [
  '<script>alert(1)</script>',
  '<img src=x onerror="alert(2)">',
  '<svg onload=alert(3)></svg>',
  '<iframe srcdoc="<script>alert(4)</script>"></iframe>',
  '[a](javascript:alert(5)) [b](JaVaScRiPt:alert(6)) [c](vbscript:x) [d](file:///C:/Windows/win.ini)',
  '[e](data:text/html,<script>alert(7)</script>)',
  '![f](x" onerror="alert(8)) ![g](javascript:alert(9))',
  '[h](<x" onclick="alert(10)>)',
  '## Título <img src=x onerror=alert(11)>',
  '| col |\n|---|\n| <script>alert(12)</script> |',
  '- [ ] casilla <b onmouseover=alert(13)>x</b>',
  '`<script>alert(14)</script>`',
  '```html\n<script>alert(15)</script>\n```',
  'Q-1 D-2 [cita](docs/x.md"><script>alert(16)</script>)',
].join('\n\n')

describe('el Markdown de los documentos no ejecuta nada', () => {
  const doc = {
    ruta: 'docs/estado.md',
    texto: `# Estado\n\n## Preguntas abiertas\n- **Q-1 — ¿Sí?**\n\n${HOSTIL}`,
  }
  const entorno = {
    ruta: doc.ruta,
    indice: construirIndice([doc]),
    existe: () => true,
    imagen: (r: string) => `data:image/png;base64,${r}`,
    preguntas: true,
  }

  it('ni el HTML incrustado, ni enlaces peligrosos, ni atributos inyectados', () => {
    sinCodigo(renderizar(doc.texto, entorno))
  })

  it('tampoco en los mensajes de la conversación', () => {
    sinCodigo(htmlDeMensaje(HOSTIL))
  })
})

describe('el visor de código muestra el texto, no lo interpreta', () => {
  const lenguajes: Lenguaje[] = ['js', 'json', 'css', 'html', 'md', 'numeral', 'texto']
  for (const lenguaje of lenguajes)
    it(lenguaje, () => {
      const lineas = colorear(`${HOSTIL}\n/* <script> */ "<img src=x onerror=alert(1)>"`, lenguaje)
      for (const l of lineas) {
        // Las únicas etiquetas son los colores propios.
        expect(l.replace(/<span class="[ckns]">|<\/span>/g, '')).not.toMatch(/[<>]/)
      }
    })
})

describe('lo que la ventana pide leer no sale del proyecto', () => {
  let base: string
  let proyecto: string
  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'iridium-h8-seg-'))
    proyecto = join(base, 'proyecto')
    await mkdir(join(proyecto, 'docs'), { recursive: true })
    await mkdir(join(base, 'afuera'))
    await writeFile(join(base, 'afuera', 'secreto.txt'), 'secreto')
    await writeFile(join(base, 'secreto.txt'), 'secreto')
    await writeFile(join(proyecto, 'docs', 'estado.md'), '# Estado\n')
    // Un enlace de carpeta (junction en Windows: no pide permisos) que apunta afuera.
    await symlink(join(base, 'afuera'), join(proyecto, 'enlace'), 'junction')
  })
  afterEach(async () => {
    await rm(base, { recursive: true, force: true })
  })

  it('un archivo del proyecto se lee', async () => {
    expect((await leerArchivo(proyecto, 'docs/estado.md')).tipo).toBe('texto')
  })

  it.each([
    '../secreto.txt',
    'docs/../../secreto.txt',
    '..\\secreto.txt',
    'docs\\..\\..\\secreto.txt',
    '<base>\\secreto.txt',
    '<base>/secreto.txt',
    '/secreto.txt',
    'enlace/secreto.txt',
    '.git/config',
    'node_modules/x/package.json',
  ])('no lee %s', async (pedida) => {
    // `<base>`: la carpeta de arriba del proyecto, con su ruta absoluta.
    const ruta = pedida.replace('<base>', pedida.includes('\\') ? base : base.replace(/\\/g, '/'))
    const r = await leerArchivo(proyecto, ruta)
    expect(r.tipo).not.toBe('texto')
    if (r.tipo === 'texto') expect(r.lineas.join('')).not.toContain('secreto')
  })

  it.each(['..', 'docs/../..', '<base>/afuera', 'enlace'])('no lista la carpeta %s', async (pedida) => {
    const r = await leerCarpeta(proyecto, pedida.replace('<base>', base.replace(/\\/g, '/')))
    expect(r.tipo).toBe('error')
  })

  it('el enlace que sale del proyecto se ve en la lista pero no se puede abrir', async () => {
    const r = await leerCarpeta(proyecto, '')
    expect(r.tipo).toBe('ok')
    expect((await leerCarpeta(proyecto, 'enlace')).tipo).toBe('error')
  })

  it.each(['../x.md', 'docs/../../x.md', '/x.md', 'C:/x.md', 'c:x.md', 'docs\\x.md', 'docs//x.md', './x.md'])(
    'un documento no puede ser %s',
    (ruta) => {
      expect(esRutaDeDocumento(ruta)).toBe(false)
    },
  )
})

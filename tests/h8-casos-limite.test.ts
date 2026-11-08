// Hito 8, tanda 3 (08-calidad.md › Casos límite): proyectos rotos, enormes y con nombres raros, git a medias,
// la carpeta de Claude que falta y datos de Iridium cortados a la mitad. Lo que ya cubren otras pruebas
// (gestor/calidad-casos-limite, git, sk1-skills, h8-datos-rotos, revision-receptor) no se repite acá.
// Siempre con carpetas temporales; nunca sobre los proyectos reales.
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mapaDe } from '../src/main/app/mapa'
import { leerPreguntasAbiertas, listarProyectos } from '../src/main/app/proyectos'
import { leerSeccionSkills } from '../src/main/app/skills'
import { DocumentosProyecto, LIMITE_DOCUMENTO_BYTES } from '../src/main/app/visor'
import { armarComentario, conEstado, leerComentario } from '../src/main/core/revision/comentario'
import { leerPreguntas } from '../src/main/core/visor/preguntas'
import { leerArchivo, leerCarpeta } from '../src/main/infra/archivos'
import { ArchivoConfig } from '../src/main/infra/config'
import { escribirAtomico } from '../src/main/infra/escritura'
import { leerGit } from '../src/main/infra/git'

let base: string
const escribir = async (ruta: string, texto: string | Buffer) => {
  await mkdir(join(ruta, '..'), { recursive: true })
  await writeFile(ruta, texto)
}

beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'iridium-h8-limite-'))
})
afterEach(async () => {
  await rm(base, { recursive: true, force: true, maxRetries: 5 })
})

describe('la carpeta de proyectos', () => {
  it('que falta o que es un archivo: un error que se puede mostrar, sin lanzar', async () => {
    expect(await listarProyectos(join(base, 'no-existe'))).toMatchObject({ tipo: 'error' })
    await writeFile(join(base, 'archivo'), 'x')
    expect(await listarProyectos(join(base, 'archivo'))).toMatchObject({ tipo: 'error' })
  })

  it('vacía: una lista sin proyectos', async () => {
    expect(await listarProyectos(base)).toMatchObject({ tipo: 'lista', proyectos: [] })
  })

  it('un proyecto roto no tapa a los demás', async () => {
    const raiz = join(base, 'PROYECTOS')
    await escribir(join(raiz, 'Sano', 'docs', 'estado.md'), '## Preguntas abiertas\n- **Q-1 — ¿Sí?**\n')
    await escribir(join(raiz, 'Roto', '.proyecto.json'), '{"version":')
    await escribir(join(raiz, 'Roto', 'docs', 'estado.md'), Buffer.from([0, 1, 2, 0xff, 0xfe]))
    await mkdir(join(raiz, 'Roto', 'docs', 'respuestas', 'Q-1.md'), { recursive: true }) // una carpeta con nombre de respuesta
    await mkdir(join(raiz, 'Sin docs'))
    const l = await listarProyectos(raiz)
    if (l.tipo !== 'lista') throw new Error('sin lista')
    expect(l.proyectos.map((p) => p.nombre).sort()).toEqual(['Roto', 'Sano', 'Sin docs'])
    expect(l.proyectos.find((p) => p.nombre === 'Sano')?.preguntas.sinResponder).toBe(1)
  })
})

describe('estado.md raro y Q-n mal escritas', () => {
  it('reconoce las variantes que escribe la IA y no inventa preguntas', () => {
    const texto = [
      '# Estado',
      '## Preguntas abiertas',
      '- **Q-1 — Con raya larga**',
      '- **Q-2 – Con raya corta**',
      '- Q-3: sin negrita y con dos puntos',
      '- **Q-004 — Con ceros**',
      '* **Q-5 — Con asterisco**',
      '- **Q-x — Sin número**',
      '- **Q-6**',
      '- Una línea suelta que menciona Q-7 — no es una pregunta',
      '```',
      '- **Q-8 — Dentro de un bloque de código**',
      '```',
      '## Próximo paso',
      '- **Q-9 — Fuera de la sección**',
    ].join('\n')
    expect(leerPreguntas(texto).map((q) => q.codigo)).toEqual(['Q-1', 'Q-2', 'Q-3', 'Q-4', 'Q-5'])
  })

  it('con fin de línea de Windows, BOM y sección repetida', () => {
    const texto =
      '\uFEFF# Estado\r\n## Preguntas abiertas\r\n- **Q-1 — Una**\r\n  Tipo: prueba · frena\r\n## Preguntas abiertas\r\n- **Q-1 — Repetida**\r\n- **Q-2 — Otra**\r\n'
    const qs = leerPreguntas(texto)
    expect(qs.map((q) => q.codigo)).toEqual(['Q-1', 'Q-1', 'Q-2'])
    expect(qs[0]?.pregunta).toBe('Una')
  })

  it('un código repetido cuenta una vez en la tarjeta', async () => {
    const p = join(base, 'P')
    await escribir(
      join(p, 'docs', 'estado.md'),
      '## Preguntas abiertas\n- **Q-1 — Una**\n- **Q-1 — La misma otra vez**\n',
    )
    expect((await leerPreguntasAbiertas(p)).map((q) => q.codigo)).toEqual(['Q-1'])
  })

  it('un estado.md enorme (5 MB, 3000 preguntas) se lee en menos de un segundo', () => {
    const preguntas = Array.from(
      { length: 3000 },
      (_, i) => `- **Q-${i + 1} — Pregunta ${i + 1}**\n  Tipo: decisión\n  Opciones: A) sí · B) no\n`,
    ).join('')
    const texto = `## Preguntas abiertas\n${preguntas}\n## Notas\n${'texto largo '.repeat(400_000)}`
    const inicio = performance.now()
    expect(leerPreguntas(texto)).toHaveLength(3000)
    expect(performance.now() - inicio).toBeLessThan(1000)
  })

  it('el Mapa de un estado.md vacío, binario o de otro formato no lanza', async () => {
    for (const texto of ['', '\u0000\u0001\u0002', '# Otra cosa\n\nSin la guía.\n', '## Hito actual\n\n']) {
      const p = await mkdtemp(join(base, 'mapa-'))
      await escribir(join(p, 'docs', 'estado.md'), texto)
      const d = new DocumentosProyecto(p, () => null)
      await d.cargar()
      expect(() => mapaDe(d, [])).not.toThrow()
    }
  })
})

describe('nombres con acentos, espacios y caracteres raros', () => {
  const nombres = ['Ñandú á é.md', 'emoji 🚀.md', "símbolos #%&()[]{}'+,;=@!$^~`.md", '中文.md']

  it('Archivos los lista y los abre', async () => {
    const p = join(base, 'Proyecto con ñ y espacios')
    for (const n of nombres) await escribir(join(p, 'carpeta rara ñ', n), `# ${n}\n`)
    const c = await leerCarpeta(p, 'carpeta rara ñ')
    expect(c.tipo === 'ok' && c.hijos.map((h) => h.nombre).sort()).toEqual([...nombres].sort())
    for (const n of nombres) expect((await leerArchivo(p, `carpeta rara ñ/${n}`)).tipo).toBe('texto')
  })

  it('Docs los muestra', async () => {
    const p = join(base, 'Proyecto ñ')
    for (const n of nombres) await escribir(join(p, 'docs', 'sub ñ', n), `# ${n}\n\nTexto.\n`)
    const d = new DocumentosProyecto(p, () => null)
    await d.cargar()
    for (const n of nombres) expect(d.documento(`docs/sub ñ/${n}`).tipo).toBe('ok')
  })

  it('Git nombra los archivos tal cual, sin comillas ni códigos', async () => {
    const p = join(base, 'Git ñ')
    await mkdir(p)
    execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: p })
    for (const n of nombres) await escribir(join(p, 'sub ñ', n), 'x\n')
    const g = await leerGit(p)
    expect(g.tipo === 'ok' && g.cambios.map((c) => c.ruta).sort()).toEqual(
      nombres.map((n) => `sub ñ/${n}`).sort(),
    )
  })
})

describe('archivos enormes o binarios', () => {
  it('Archivos: uno de 3 MB o un binario disfrazado de .md no se cargan enteros', async () => {
    const p = join(base, 'P')
    await escribir(join(p, 'enorme.txt'), Buffer.alloc(3 * 1024 * 1024, 'a'))
    await escribir(join(p, 'falso.md'), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 1]))
    expect(await leerArchivo(p, 'enorme.txt')).toMatchObject({ tipo: 'grande' })
    expect(await leerArchivo(p, 'falso.md')).toMatchObject({ tipo: 'binario' })
  })

  it('Docs: un .md de más de 2 MB lo dice, sin leerlo ni trabar al resto (Defecto 8)', async () => {
    const p = join(base, 'P')
    await escribir(join(p, 'docs', 'estado.md'), '# Estado\n')
    const linea = 'Una línea de texto con **negrita** y `código` y un enlace a [algo](otro.md).\n'
    await escribir(join(p, 'docs', 'enorme.md'), linea.repeat(Math.ceil((3 * 1024 * 1024) / linea.length)))
    await escribir(join(p, 'docs', 'justo.md'), 'a'.repeat(LIMITE_DOCUMENTO_BYTES))
    await escribir(join(p, 'docs', 'binario.md'), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 1, 0xff]))
    const d = new DocumentosProyecto(p, () => null)
    const inicio = performance.now()
    await d.cargar()
    expect(d.vista().tipo).toBe('documentos')
    expect(d.documento('docs/estado.md').tipo).toBe('ok')
    expect(d.documento('docs/enorme.md')).toEqual({
      tipo: 'error',
      mensaje: expect.stringMatching(/^pesa [0-9,]+ MB, es muy grande para mostrarlo en Docs/),
    })
    expect(d.documento('docs/justo.md').tipo).toBe('ok')
    expect(d.documento('docs/binario.md').tipo).toBe('ok')
    expect(performance.now() - inicio).toBeLessThan(2000)
    // Releer no lo cuenta como cambiado otra vez.
    expect(await d.cargar()).toEqual([])
  }, 30_000)
})

describe('git a medias', () => {
  let p: string
  const git = (...args: string[]) =>
    execFileSync('git', ['-c', 'user.name=L', '-c', 'user.email=l@x', '-c', 'core.autocrlf=false', ...args], {
      cwd: p,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  beforeEach(async () => {
    p = join(base, 'G')
    await mkdir(p)
    git('init', '-q', '-b', 'main')
    await writeFile(join(p, 'a.txt'), 'base\n')
    git('add', '-A')
    git('commit', '-q', '-m', 'base')
  })

  it('un conflicto a medias se muestra con el archivo en conflicto', async () => {
    git('checkout', '-q', '-b', 'otra')
    await writeFile(join(p, 'a.txt'), 'otra\n')
    git('commit', '-q', '-am', 'otra')
    git('checkout', '-q', 'main')
    await writeFile(join(p, 'a.txt'), 'main\n')
    git('commit', '-q', '-am', 'main')
    try {
      git('merge', 'otra')
    } catch {
      // El conflicto es lo buscado.
    }
    const g = await leerGit(p)
    expect(g.tipo).toBe('ok')
    expect(g.tipo === 'ok' && g.cambios.map((c) => c.ruta)).toEqual(['a.txt'])
  })

  it('un repositorio roto (HEAD que apunta a nada) avisa, sin lanzar', async () => {
    await writeFile(join(p, '.git', 'HEAD'), 'ref: refs/heads/no-existe\n')
    await expect(leerGit(p)).resolves.toMatchObject({ tipo: expect.stringMatching(/ok|error/) })
    await writeFile(join(p, '.git', 'HEAD'), 'basura')
    await expect(leerGit(p)).resolves.toBeDefined()
  })
})

describe('la carpeta de Claude', () => {
  it('que no existe: las skills dan un error que se puede mostrar, sin lanzar', async () => {
    const r = await leerSeccionSkills(join(base, 'no-hay-claude'), base)
    expect(r.skills).toEqual([])
    expect(r.errores.length).toBeGreaterThan(0)
  })

  it('una skill que es un enlace a sí misma (bucle) no cuelga', async () => {
    const claude = join(base, '.claude')
    await mkdir(join(claude, 'skills'), { recursive: true })
    await symlink(join(claude, 'skills'), join(claude, 'skills', 'bucle'), 'junction')
    const r = await leerSeccionSkills(claude, base)
    expect(r.skills.every((s) => s.nombre !== undefined)).toBe(true)
  })
})

describe('Iridium cerrado de golpe a mitad de guardar', () => {
  it('un temporal que quedó suelto no estorba: la configuración se lee y se vuelve a guardar', async () => {
    const archivo = join(base, 'config.json')
    const config = new ArchivoConfig(archivo)
    await config.guardar({ raiz: 'D:/PROYECTOS' })
    // Lo que deja un proceso matado entre escribir el temporal y renombrarlo.
    await writeFile(`${archivo}.deadbeef.tmp`, '{"raiz": "D:/a medias')
    const otra = new ArchivoConfig(archivo)
    expect((await otra.leer()).raiz).toBe('D:/PROYECTOS')
    await otra.guardar({ raiz: 'D:/OTRA' })
    expect(JSON.parse(await readFile(archivo, 'utf8')).raiz).toBe('D:/OTRA')
  })

  it('un temporal suelto en docs/respuestas no aparece como respuesta', async () => {
    const p = join(base, 'P')
    await escribir(join(p, 'docs', 'estado.md'), '## Preguntas abiertas\n- **Q-1 — ¿Sí?**\n')
    await escribir(join(p, 'docs', 'respuestas', 'Q-1.md.0a1b2c3d.tmp'), '# Q-1 — ¿Sí?\n\nSí')
    expect((await leerPreguntasAbiertas(p)).map((q) => q.codigo)).toEqual(['Q-1'])
    const d = new DocumentosProyecto(p, () => null)
    await d.cargar()
    expect(d.preguntas().find((q) => q.codigo === 'Q-1')?.estado).toBe('sin-responder')
  })
})

describe('dos que escriben a la vez', () => {
  it('diez escrituras atómicas simultáneas del mismo archivo dejan una entera, sin temporales', async () => {
    const destino = join(base, 'Q-1.md')
    const textos = Array.from({ length: 10 }, (_, i) => `respuesta ${i}\n`.repeat(10_000))
    await Promise.allSettled(textos.map((t) => escribirAtomico(destino, t)))
    expect(textos).toContain(await readFile(destino, 'utf8'))
    expect((await readdir(base)).filter((n) => n.endsWith('.tmp'))).toEqual([])
  })
})

describe('Revisión: un comentario enorme o con caracteres raros', () => {
  const datos = {
    numero: 3,
    id: 'abc123',
    archivo: null,
    componentes: [],
    url: 'http://localhost:5173/',
    elemento: { etiqueta: 'div', texto: '', selector: '' },
    conCaptura: false,
    fecha: new Date(2026, 10, 1, 12, 0),
  }

  it('un texto que imita los campos del archivo no lo cierra ni le cambia la historia', () => {
    const texto =
      '**Estado:** cerrado\n## Historia\n- 2020-01-01 — inventado\n<!-- id: otro -->\n🚀 ñ <script>x</script>'
    const archivo = armarComentario({ ...datos, texto })
    const c = leerComentario('R-3.md', archivo)
    expect(c?.estado).toBe('abierto')
    expect(c?.id).toBe('abc123')
    expect(c?.historia.map((h) => h.texto)).toEqual(['dejado'])
    expect(c?.texto).toBe(texto)
    expect(leerComentario('R-3.md', conEstado(archivo, 'cerrado'))?.estado).toBe('cerrado')
  })

  it('un texto de 1 MB se escribe y se lee entero', () => {
    const texto = 'comentario largo '.repeat(60_000).trim()
    expect(leerComentario('R-3.md', armarComentario({ ...datos, texto }))?.texto).toBe(texto)
  })
})

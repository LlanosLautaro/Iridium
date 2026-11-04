// I-4: las reglas del Mapa (la tabla de hitos, el portón y las iteraciones de estado.md, D-019) y las de Archivos
// (qué se muestra del árbol, qué ruta se acepta y los colores del texto). Sin disco.
import { describe, expect, it } from 'vitest'
import { ordenDeDocumentos } from '../src/main/app/documentos'
import { colorear, esBinario, lenguajeDe, ordenarNodos, rutaDeArchivoValida } from '../src/main/core/archivos'
import {
  celdas,
  clasificarHito,
  clasificarIteracion,
  leerHitos,
  leerIteraciones,
  leerPorton,
  proximoPaso,
} from '../src/main/core/mapa'
import { documentoAfectado } from '../src/main/core/vigilancia'

const ESTADO = `# Estado del proyecto

## Hito actual
7 — Construcción — I-4 (marco de tres paneles), por empezar

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 0 | Idea cruda | completo | \`00-idea.md\` |
| 3 | Investigación | reabierto: falta el video | \`03-investigacion.md\` |
| 7 | Construcción | en curso | \`07-construccion.md\` |
| 8 | Pruebas | saltado (app personal) | \`08-calidad.md\` |
| 9 | Lanzamiento | a medias, depende de Q-12 | — |

## Próximo paso
Empezar I-4 por el marco.
**Leer antes:** \`07-construccion.md\` › I-4.

## Hitos con huecos aceptados
(ninguno)
`

const CONSTRUCCION = `# Construcción

## Plan de iteraciones
| ID | Objetivo | Historias | Estado |
|---|---|---|---|
| 2026-10-28 | Un ajuste que quedó en la tabla equivocada | ajuste | Es C-11 |
| I-1 | Esqueleto | H-1, H-3 | aprobada por el usuario (Q-57) |
| I-3 | Pendientes | H-9 | probada; espera la prueba de los ajustes |
| I-4 | Marco de tres paneles \\| Mapa | H-7 | pendiente |
| I-5 | Git del proyecto | H-16 | pendiente |

## Portón
- [ ] Esto no se lee: el hito 7 tiene iteraciones.
`

describe('Mapa: estado.md y los documentos de los hitos', () => {
  it('lee la línea de hitos con su estado en palabras; lo que no se entiende queda tal cual', () => {
    expect(leerHitos(ESTADO)).toEqual([
      {
        numero: 0,
        nombre: 'Idea cruda',
        estadoTexto: 'completo',
        estado: 'completo',
        documento: '00-idea.md',
      },
      {
        numero: 3,
        nombre: 'Investigación',
        estadoTexto: 'reabierto: falta el video',
        estado: 'reabierto',
        documento: '03-investigacion.md',
      },
      {
        numero: 7,
        nombre: 'Construcción',
        estadoTexto: 'en curso',
        estado: 'en-curso',
        documento: '07-construccion.md',
      },
      {
        numero: 8,
        nombre: 'Pruebas',
        estadoTexto: 'saltado (app personal)',
        estado: 'saltado',
        documento: '08-calidad.md',
      },
      {
        numero: 9,
        nombre: 'Lanzamiento',
        estadoTexto: 'a medias, depende de Q-12',
        estado: 'otro',
        documento: null,
      },
    ])
    expect(leerHitos('# Estado\n\nSin tabla.')).toEqual([])
  })

  it('las palabras fijas de D-019, con acentos y mayúsculas', () => {
    expect(clasificarHito('Validado por el usuario')).toBe('completo')
    expect(clasificarHito('aprobada provisional')).toBe('completo')
    expect(clasificarHito('**En curso**')).toBe('en-curso')
    expect(clasificarHito('bloqueado por Q-3')).toBe('bloqueado')
    expect(clasificarIteracion('aprobada por el usuario (Q-57)')).toBe('hecho')
    expect(clasificarIteracion('probada; espera la prueba')).toBe('espera')
    expect(clasificarIteracion('construida; espera la prueba del usuario (Q-62)')).toBe('espera')
    expect(clasificarIteracion('por empezar')).toBe('pendiente')
    expect(clasificarIteracion('vaya uno a saber')).toBe('otro')
  })

  it('las iteraciones del plan: solo las filas I-n, y la que nombra «Hito actual» está en curso', () => {
    const it4 = leerIteraciones(CONSTRUCCION, 'Construcción — I-4 (marco de tres paneles), por empezar')
    expect(it4.map((p) => [p.codigo, p.estado])).toEqual([
      ['I-1', 'hecho'],
      ['I-3', 'espera'],
      ['I-4', 'en-curso'],
      ['I-5', 'pendiente'],
    ])
    expect(it4[2]?.texto).toBe('I-4 — Marco de tres paneles | Mapa')
    expect(leerIteraciones(CONSTRUCCION, null)[2]?.estado).toBe('pendiente')
  })

  it('el portón como lista de casillas; sin portón, nada', () => {
    const doc =
      '# UX\n\n## Portón\n- [x] Historias con **criterios**.\n- [ ] Wireframes.\n\n## Después\n- [ ] no\n'
    expect(leerPorton(doc)).toEqual([
      { texto: 'Historias con criterios.', estado: 'hecho', estadoTexto: '', codigo: null },
      { texto: 'Wireframes.', estado: 'pendiente', estadoTexto: '', codigo: null },
    ])
    expect(leerPorton('# Idea\n\nNada.')).toEqual([])
  })

  it('el Próximo paso entero, con todas sus líneas', () => {
    expect(proximoPaso(ESTADO)).toBe('Empezar I-4 por el marco.\n**Leer antes:** `07-construccion.md` › I-4.')
  })

  it('las celdas de una tabla respetan las barras dentro de código', () => {
    expect(celdas('| a | `b | c` | d \\| e |')).toEqual(['a', '`b | c`', 'd | e'])
  })
})

describe('Docs: el orden del menú', () => {
  it('estado, perfil, los hitos en orden, decisiones, scripts, el resto; sin respuestas', () => {
    expect(
      ordenDeDocumentos([
        'README.md',
        'docs/scripts.md',
        'docs/10-operacion.md',
        'docs/respuestas/Q-1.md',
        'docs/research/sdk.md',
        'docs/decisiones.md',
        'docs/02-definicion.md',
        'docs/estado.md',
        'docs/plan-desarrollo.md',
        'docs/perfil-proyecto.md',
        'docs/modulos/diseno/estado.md',
      ]),
    ).toEqual([
      'docs/estado.md',
      'docs/perfil-proyecto.md',
      'docs/02-definicion.md',
      'docs/10-operacion.md',
      'docs/decisiones.md',
      'docs/scripts.md',
      'docs/plan-desarrollo.md',
      'docs/modulos/diseno/estado.md',
      'docs/research/sdk.md',
      'README.md',
    ])
  })

  it('la vigilancia avisa de los .md de docs/ y de la raíz', () => {
    expect(documentoAfectado('Alfa\\docs\\04-ux.md')).toBe('Alfa')
    expect(documentoAfectado('Alfa/README.md')).toBe('Alfa')
    expect(documentoAfectado('Alfa/docs/research/a.md')).toBe('Alfa')
    expect(documentoAfectado('Alfa/src/notas.md')).toBeNull()
    expect(documentoAfectado('Alfa/docs/estado.txt')).toBeNull()
    expect(documentoAfectado('Alfa/docs/.oculta/a.md')).toBeNull()
  })
})

describe('Archivos: reglas', () => {
  it('carpetas primero y orden natural', () => {
    const n = (nombre: string, tipo: 'carpeta' | 'archivo') => ({ nombre, tipo, ruta: nombre })
    expect(
      ordenarNodos([
        n('b.ts', 'archivo'),
        n('src', 'carpeta'),
        n('a10.ts', 'archivo'),
        n('a2.ts', 'archivo'),
      ]).map((x) => x.nombre),
    ).toEqual(['src', 'a2.ts', 'a10.ts', 'b.ts'])
  })

  it('una ruta del proyecto: relativa, sin subir y sin entrar a node_modules ni .git', () => {
    expect(rutaDeArchivoValida('')).toBe(true)
    expect(rutaDeArchivoValida('src/main/index.ts')).toBe(true)
    expect(rutaDeArchivoValida('.claude/settings.json')).toBe(true)
    for (const mala of [
      '../otro',
      'a/../../b',
      '/etc/passwd',
      'C:/Windows',
      'a\\b',
      'node_modules/x',
      '.git/config',
    ])
      expect(rutaDeArchivoValida(mala)).toBe(false)
  })

  it('binario: un byte nulo en la muestra', () => {
    expect(esBinario(new Uint8Array([72, 0, 105]))).toBe(true)
    expect(esBinario(new TextEncoder().encode('hola'))).toBe(false)
  })

  it('el lenguaje sale de la extensión o del nombre', () => {
    expect(lenguajeDe('App.tsx')).toBe('js')
    expect(lenguajeDe('package.json')).toBe('json')
    expect(lenguajeDe('README.md')).toBe('md')
    expect(lenguajeDe('.gitignore')).toBe('numeral')
    expect(lenguajeDe('LICENSE')).toBe('texto')
  })

  it('colorea comentarios, cadenas, números y palabras clave, y escapa el HTML', () => {
    expect(colorear('const a = "<b>" // x\nlet n = 42', 'js')).toEqual([
      '<span class="k">const</span> a = <span class="s">"&lt;b&gt;"</span> <span class="c">// x</span>',
      '<span class="k">let</span> n = <span class="n">42</span>',
    ])
  })

  it('un comentario de varias líneas se colorea en cada una; el salto final no suma una línea', () => {
    expect(colorear('/* uno\ndos */\nx\n', 'js')).toEqual([
      '<span class="c">/* uno</span>',
      '<span class="c">dos */</span>',
      'x',
    ])
  })

  it('en JSON la clave va distinta del valor; en Markdown, los títulos y el código', () => {
    expect(colorear('{ "a": "b", "n": 1 }', 'json')).toEqual([
      '{ <span class="k">"a"</span>: <span class="s">"b"</span>, <span class="k">"n"</span>: <span class="n">1</span> }',
    ])
    expect(colorear('# Título\nUsá `pnpm` & listo', 'md')).toEqual([
      '<span class="k"># Título</span>',
      'Usá <span class="s">`pnpm`</span> &amp; listo',
    ])
  })

  it('el texto sin lenguaje conocido va tal cual, escapado', () => {
    expect(colorear('a < b\r\nc', 'texto')).toEqual(['a &lt; b', 'c'])
  })
})

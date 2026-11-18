// Copiado de la app anterior de proyectos (D-026).
// Markdown seguro del visor (D-027) y sus reglas propias: anclas, códigos, citas, enlaces, imágenes, casillas y
// lugares de las tarjetas de pregunta (diseno-tecnico.md del módulo › Mostrar un documento).
import { describe, expect, it } from 'vitest'
import { construirIndice, type DocumentoFuente } from '../../src/main/core/visor/codigos'
import { type EntornoRender, renderizar, renderizarEnLinea, unir } from '../../src/main/core/visor/markdown'

const docs: DocumentoFuente[] = [
  {
    ruta: 'docs/decisiones.md',
    texto: '# Decisiones\n\n## D-025 — Próxima versión\nTexto.\n\n## D-027 — Markdown seguro\n',
  },
  { ruta: 'docs/04-ux.md', texto: '# UX\n\n## Pantallas\n\n### W-14 — Miniatura\n\n## Pantallas finales\n' },
  {
    ruta: 'docs/estado.md',
    texto:
      '# Estado\n\n## Preguntas abiertas\n- **Q-7 — ¿Miniatura 3D?**\n  Contexto: D-25. Opciones: A) 3D · B) plana.\n\n## Próximo paso\nNada.\n',
  },
  { ruta: 'docs/modulos/visor/estado.md', texto: '# Estado del visor\n' },
  { ruta: 'README.md', texto: '# Léame\n' },
]

function entorno(ruta: string, preguntas = false): EntornoRender {
  const rutas = new Set(docs.map((d) => d.ruta))
  return {
    ruta,
    indice: construirIndice(docs),
    existe: (r) => rutas.has(r),
    imagen: (r) => `vscode-webview://x/${r}`,
    preguntas,
  }
}
const html = (md: string, ruta = 'docs/estado.md', preguntas = false) =>
  renderizar(md, entorno(ruta, preguntas))

describe('seguridad (D-027)', () => {
  it('el HTML incrustado se ve como texto y nunca se ejecuta', () => {
    const r = html('<script>alert(1)</script>\n\n<img src=x onerror="alert(2)">\n\nhola <b>negrita</b>')
    expect(r).not.toContain('<script')
    expect(r).not.toContain('<img src=x')
    expect(r).not.toContain('<b>')
    expect(r).toContain('&lt;script&gt;')
  })

  it('no crea enlaces javascript: ni file:', () => {
    const r = html('[malo](javascript:alert(3)) y [archivo](file:///c:/x)')
    expect(r).not.toContain('<a')
    expect(r).not.toMatch(/href="(javascript|file):/i)
  })

  it('las imágenes de internet no se cargan: recuadro con el enlace', () => {
    const r = html('![logo](https://ejemplo.com/logo.png)')
    expect(r).not.toContain('<img')
    expect(r).toContain('Imagen externa: no se carga')
    expect(r).toContain('data-externo="https://ejemplo.com/logo.png"')
  })
})

describe('códigos como enlaces (D-028)', () => {
  it('un código que nace en el proyecto es enlace; los demás quedan como texto', () => {
    const r = html('Ver D-025, D-27, H-99 y SHA-256.')
    expect(r).toContain('data-codigo="D-25" data-doc="docs/decisiones.md" data-ancla="d-25">D-025</a>')
    expect(r).toContain('data-codigo="D-27"')
    expect(r).not.toContain('H-99</a>')
    expect(r).not.toContain('SHA-256</a>')
  })

  it('nunca dentro de bloques de código ni de código en línea', () => {
    const r = html('```\nD-025\n```\n\n`D-025`')
    expect(r).not.toContain('gp-codigo-enlace')
  })

  it('el título donde nace un código no se enlaza a sí mismo, pero sí a otros', () => {
    const texto = '## D-025 — Próxima versión (ver D-027)'
    const indice = construirIndice([
      ...docs.filter((d) => d.ruta !== 'docs/decisiones.md'),
      {
        ruta: 'docs/decisiones.md',
        texto: `${texto}

## D-027 — Otra`,
      },
    ])
    const r = renderizar(texto, { ...entorno('docs/decisiones.md'), indice })
    expect(r).toContain('<h2 id="d-25"')
    expect(r).not.toContain('data-codigo="D-25"')
    expect(r).toContain('data-codigo="D-27"')
  })

  it('los títulos llevan ancla y la fila donde nace un código también', () => {
    const tabla = '| Código | Qué |\n|---|---|\n| S-2 | spike |\n'
    const indice = construirIndice([{ ruta: 'docs/03-investigacion.md', texto: tabla }])
    const r = renderizar(tabla, { ...entorno('docs/03-investigacion.md'), indice })
    expect(r).toContain('<tr id="s-2">')
    expect(r).toContain('<div class="gp-tabla-caja"><table>')
  })
})

describe('citas de documentos', () => {
  it('`archivo.md` es enlace si existe (relativo al documento, a docs/ o a la raíz)', () => {
    const r = html('Ver `04-ux.md`, `modulos/visor/estado.md`, `README.md` y `no-existe.md`.')
    expect(r).toContain('data-doc="docs/04-ux.md"')
    expect(r).toContain('data-doc="docs/modulos/visor/estado.md"')
    expect(r).toContain('data-doc="README.md"')
    expect(r).toContain('<code>no-existe.md</code>')
  })

  it('`archivo.md` › Sección enlaza la sección cuyo título coincide con el texto más largo', () => {
    const r = html('Leer `04-ux.md` › Pantallas finales y después nada.')
    expect(r).toContain(
      'data-doc="docs/04-ux.md" data-ancla="pantallas-finales">Pantallas finales</a> y después',
    )
    const corta = html('Leer `04-ux.md` › Pantallas, después.')
    expect(corta).toContain('data-ancla="pantallas">Pantallas</a>, después')
  })

  it('`archivo.md` › W-14 enlaza el título de ese documento que empieza por el código', () => {
    const r = html('`04-ux.md` › W-14 (miniatura)')
    expect(r).toContain('data-doc="docs/04-ux.md" data-ancla="w-14">W-14</a> (miniatura)')
  })
})

describe('enlaces e imágenes', () => {
  it('a un .md → visor (con sección); a otro archivo → editor; a internet → navegador', () => {
    const r = html(
      '[ux](04-ux.md#pantallas) [código](../src/index.ts) [web](https://ejemplo.com) [aquí](#preguntas)',
    )
    expect(r).toContain('data-doc="docs/04-ux.md" data-ancla="pantallas"')
    expect(r).toContain('data-archivo="src/index.ts"')
    expect(r).toContain('data-externo="https://ejemplo.com"')
    expect(r).toContain('data-doc="docs/estado.md" data-ancla="preguntas"')
    expect(r).not.toContain('href="04-ux.md')
  })

  it('las imágenes relativas usan la dirección de la pestaña', () => {
    const r = html('![captura](respuestas/Q-7/captura-1.png)')
    expect(r).toContain('src="vscode-webview://x/docs/respuestas/Q-7/captura-1.png"')
    expect(r).toContain('data-ruta="respuestas/Q-7/captura-1.png"')
  })

  it('una imagen que sale de la carpeta no se muestra', () => {
    const r = html('![x](../../afuera.png)')
    expect(r).toContain('Imagen no encontrada')
  })

  it('unir normaliza y no deja salir de la carpeta', () => {
    expect(unir('docs/modulos/visor', '../../06-ui.md')).toBe('docs/06-ui.md')
    expect(unir('docs', '../../x.md')).toBeNull()
  })
})

describe('casillas y preguntas', () => {
  it('las casillas se dibujan (no son controles)', () => {
    const r = html('- [ ] pendiente\n- [x] hecha')
    expect(r).toContain(
      '<li class="casilla-doc"><span class="casilla-doc-caja" role="img" aria-label="Pendiente">',
    )
    expect(r).toContain('class="casilla-doc hecha"')
    expect(r).not.toContain('<input')
  })

  it('cada Q-n de "Preguntas abiertas" deja el lugar de su tarjeta, solo al mostrar un estado.md', () => {
    const texto = docs[2]?.texto ?? ''
    const conTarjeta = renderizar(texto, entorno('docs/estado.md', true))
    expect(conTarjeta).toContain('<li class="gp-pregunta" id="q-7" data-pregunta="Q-7"></li>')
    expect(conTarjeta).not.toContain('¿Miniatura 3D?')
    const sinTarjeta = renderizar(texto, entorno('docs/estado.md', false))
    expect(sinTarjeta).not.toContain('data-pregunta')
  })

  it('el contexto de una pregunta se convierte en línea, con sus códigos', () => {
    expect(renderizarEnLinea('Contexto: D-25.', entorno('docs/estado.md'))).toContain('data-codigo="D-25"')
  })
})

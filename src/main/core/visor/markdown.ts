// Copiado de la app anterior de proyectos (D-026).
// Markdown → HTML del visor (D-027, D-031). markdown-it con `html: false`: el HTML incrustado queda como texto y
// los enlaces peligrosos (`javascript:`, `file:`…) no se crean. Encima, reglas propias: anclas en los títulos,
// códigos y citas como enlaces, enlaces e imágenes del proyecto, casillas y lugares para las tarjetas de pregunta.
// Todo el HTML propio se arma acá y se escapa; la pestaña solo lo inserta.
// Iridium exporta `documentoCitado` y `seccionCitada` para las citas de Pendientes (core/citas.ts).
import MarkdownIt, { type StateCore, type Token } from 'markdown-it'
import { CITA, type Encabezado, type Indice, normalizarCodigo, resolverCodigo } from './codigos'

export interface EntornoRender {
  /** Documento que se convierte, relativo a la carpeta abierta. */
  ruta: string
  indice: Indice
  /** ¿Existe este `.md` (relativo a la carpeta)? */
  existe: (ruta: string) => boolean
  /** Dirección para mostrar una imagen del proyecto (relativa a la carpeta); null si no se puede. */
  imagen: (ruta: string) => string | null
  /** Marcar las preguntas de "Preguntas abiertas" para montar sus tarjetas (solo al mostrar un `estado.md`). */
  preguntas: boolean
  /** Scripts de `docs/scripts.md` (D-039): el cuerpo de cada sección se reemplaza por el lugar de su tarjeta. */
  scripts?: { linea: number; hasta: number; id: string }[]
}

const md = new MarkdownIt({ html: false, linkify: false, typographer: false, breaks: true })
const esc = md.utils.escapeHtml

md.renderer.rules.table_open = () => '<div class="gp-tabla-caja"><table>\n'
md.renderer.rules.table_close = () => '</table></div>\n'

md.core.ruler.push('gp_bloques', (state) => {
  const env = state.env.gp as EntornoRender | undefined
  if (!env?.indice) return
  marcarTitulosYFilas(state.tokens, env)
  if (env.preguntas) marcarPreguntas(state, env)
  if (env.scripts?.length) marcarScripts(state, env.scripts)
  marcarCasillas(state)
})

md.core.ruler.push('gp_enlaces', (state) => {
  const env = state.env.gp as EntornoRender | undefined
  if (!env?.indice) return
  let codigoPropio: string | null = null
  for (const [i, bloque] of state.tokens.entries()) {
    if (bloque.type === 'heading_open')
      codigoPropio = (bloque.meta?.codigo as string | null | undefined) ?? null
    if (bloque.type !== 'inline' || !bloque.children) continue
    bloque.children = enlazar(
      state,
      bloque.children,
      env,
      state.tokens[i - 1]?.type === 'heading_open' ? codigoPropio : null,
    )
  }
})

/** Convierte un documento entero. */
export function renderizar(texto: string, entorno: EntornoRender): string {
  return md.render(texto, { gp: entorno })
}

/** Convierte un tramo en línea (el contexto de una pregunta), sin párrafo alrededor. */
export function renderizarEnLinea(texto: string, entorno: EntornoRender): string {
  return md.renderInline(texto, { gp: entorno })
}

// ---------- Bloques ----------

function marcarTitulosYFilas(tokens: Token[], env: EntornoRender): void {
  const encabezados = env.indice.encabezados.get(env.ruta) ?? []
  const porLinea = new Map(encabezados.map((e) => [e.n, e]))
  const filas = env.indice.filas.get(env.ruta)
  for (const t of tokens) {
    if (t.type === 'heading_open' && t.map) {
      const e = porLinea.get(t.map[0])
      if (!e) continue
      t.attrSet('id', e.ancla)
      if (e.slug !== e.ancla) t.attrSet('data-slug', e.slug)
      t.meta = { codigo: e.codigo }
    } else if (t.type === 'tr_open' && t.map && filas) {
      const ancla = filas.get(t.map[0])
      if (ancla) t.attrSet('id', ancla)
    }
  }
}

/** Cada ítem `Q-n` de "Preguntas abiertas" se reemplaza por el lugar donde la pestaña monta su tarjeta. */
function marcarPreguntas(state: StateCore, env: EntornoRender): void {
  const preguntas = env.indice.preguntas.get(env.ruta)
  if (!preguntas?.length) return
  const porLinea = new Map(preguntas.map((q) => [q.linea, q.codigo]))
  const tokens = state.tokens
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t?.type === 'heading_open' && t.map) {
      // Una Q-n escrita como título queda como título, con el ancla para los enlaces.
      const codigo = porLinea.get(t.map[0])
      if (codigo) t.attrSet('id', codigo.toLowerCase())
      continue
    }
    if (t?.type !== 'list_item_open' || !t.map) continue
    const codigo = porLinea.get(t.map[0])
    if (!codigo) continue
    let fin = i + 1
    while (
      fin < tokens.length &&
      !(tokens[fin]?.type === 'list_item_close' && tokens[fin]?.level === t.level)
    )
      fin++
    const lugar = new state.Token('html_block', '', 0)
    lugar.content = `<li class="gp-pregunta" id="${esc(codigo.toLowerCase())}" data-pregunta="${esc(codigo)}"></li>\n`
    tokens.splice(i, fin - i + 1, lugar)
  }
}

/** Después del título de cada script, su sección (descripción y acción) pasa a ser el lugar de su tarjeta. */
function marcarScripts(state: StateCore, scripts: NonNullable<EntornoRender['scripts']>): void {
  const porLinea = new Map(scripts.map((s) => [s.linea, s]))
  const tokens = state.tokens
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t?.type !== 'heading_open' || !t.map) continue
    const s = porLinea.get(t.map[0])
    if (!s) continue
    const desde = i + 3 // heading_open, inline, heading_close
    let fin = desde
    while (fin < tokens.length) {
      const x = tokens[fin]
      if (!x || x.type === 'heading_open' || (x.level === 0 && x.map && x.map[0] > s.hasta)) break
      fin++
    }
    const lugar = new state.Token('html_block', '', 0)
    lugar.content = `<div class="gp-script" data-script="${esc(s.id)}"></div>
`
    tokens.splice(desde, fin - desde, lugar)
  }
}

/** `- [ ] tarea` y `- [x] hecha`: casilla dibujada (no es un control). */
function marcarCasillas(state: StateCore): void {
  const tokens = state.tokens
  for (let i = 0; i < tokens.length; i++) {
    const li = tokens[i]
    if (li?.type !== 'list_item_open') continue
    const inline = tokens[i + 1]?.type === 'paragraph_open' ? tokens[i + 2] : undefined
    const primero = inline?.children?.[0]
    if (!inline?.children || primero?.type !== 'text') continue
    const m = /^\[([ xX])\][ \t]+/.exec(primero.content)
    if (!m) continue
    const hecha = m[1] !== ' '
    primero.content = primero.content.slice(m[0].length)
    li.attrJoin('class', hecha ? 'casilla-doc hecha' : 'casilla-doc')
    const abre = new state.Token('html_inline', '', 0)
    abre.content = `<span class="casilla-doc-caja" role="img" aria-label="${hecha ? 'Hecho' : 'Pendiente'}"></span><span>`
    const cierra = new state.Token('html_inline', '', 0)
    cierra.content = '</span>'
    inline.children = [abre, ...inline.children, cierra]
  }
}

// ---------- En línea ----------

function enlazar(state: StateCore, hijos: Token[], env: EntornoRender, codigoPropio: string | null): Token[] {
  const conCitas = citasDeDocumentos(state, hijos, env)
  const salida: Token[] = []
  let dentroDeEnlace = 0
  for (const t of conCitas) {
    if (t.type === 'link_open') {
      if (!t.meta?.gp) clasificarEnlace(t, env)
      dentroDeEnlace++
      salida.push(t)
    } else if (t.type === 'link_close') {
      dentroDeEnlace = Math.max(0, dentroDeEnlace - 1)
      salida.push(t)
    } else if (t.type === 'image') {
      salida.push(imagen(state, t, env))
    } else if (t.type === 'text' && dentroDeEnlace === 0) {
      salida.push(...citasDeCodigos(state, t.content, env, codigoPropio))
    } else salida.push(t)
  }
  return salida
}

function texto(state: StateCore, contenido: string): Token {
  const t = new state.Token('text', '', 0)
  t.content = contenido
  return t
}

function enlace(state: StateCore, atributos: Record<string, string>, contenido: Token[]): Token[] {
  const abre = new state.Token('link_open', 'a', 1)
  abre.attrSet('href', '#')
  abre.meta = { gp: true }
  for (const [k, v] of Object.entries(atributos)) abre.attrSet(k, v)
  return [abre, ...contenido, new state.Token('link_close', 'a', -1)]
}

/** Cada código citado que nace en el proyecto pasa a ser un enlace; los demás quedan como texto (D-028). */
function citasDeCodigos(
  state: StateCore,
  contenido: string,
  env: EntornoRender,
  propio: string | null,
): Token[] {
  const r: Token[] = []
  let ultimo = 0
  for (const m of contenido.matchAll(CITA)) {
    if (!m[1] || !m[2] || m.index === undefined) continue
    const codigo = normalizarCodigo(m[1], m[2])
    if (codigo === propio) continue
    const e = resolverCodigo(env.indice, codigo, env.ruta)
    if (!e) continue
    if (m.index > ultimo) r.push(texto(state, contenido.slice(ultimo, m.index)))
    r.push(
      ...enlace(
        state,
        { class: 'gp-codigo-enlace', 'data-codigo': codigo, 'data-doc': e.ruta, 'data-ancla': e.ancla },
        [texto(state, m[0])],
      ),
    )
    ultimo = m.index + m[0].length
  }
  if (ultimo === 0) return [texto(state, contenido)]
  if (ultimo < contenido.length) r.push(texto(state, contenido.slice(ultimo)))
  return r
}

/** `` `archivo.md` `` → enlace al documento; `` `archivo.md` › Sección `` → además, enlace a la sección. */
function citasDeDocumentos(state: StateCore, hijos: Token[], env: EntornoRender): Token[] {
  const r: Token[] = []
  for (let i = 0; i < hijos.length; i++) {
    const t = hijos[i]
    if (!t) continue
    const destino = t.type === 'code_inline' ? documentoCitado(t.content, env) : null
    if (!destino) {
      r.push(t)
      continue
    }
    const abre = new state.Token('html_inline', '', 0)
    abre.content = '<code>'
    const cierra = new state.Token('html_inline', '', 0)
    cierra.content = '</code>'
    r.push(
      abre,
      ...enlace(state, { 'data-doc': destino, 'data-ancla': '' }, [texto(state, t.content)]),
      cierra,
    )
    const siguiente = hijos[i + 1]
    const flecha = siguiente?.type === 'text' ? /^(\s*›\s*)/.exec(siguiente.content) : null
    if (!siguiente || !flecha?.[1]) continue
    const resto = siguiente.content.slice(flecha[1].length)
    const seccion = seccionCitada(resto, env.indice.encabezados.get(destino) ?? [])
    if (!seccion) continue
    r.push(texto(state, flecha[1]))
    r.push(
      ...enlace(state, { 'data-doc': destino, 'data-ancla': seccion.ancla }, [texto(state, seccion.texto)]),
    )
    siguiente.content = resto.slice(seccion.texto.length)
    if (siguiente.content === '') i++
  }
  return r
}

const MD = /\.md$/i

/** Documento al que apunta una ruta citada: relativa al documento, a `docs/` o a la raíz. */
export function documentoCitado(
  contenido: string,
  env: Pick<EntornoRender, 'ruta' | 'existe'>,
): string | null {
  const c = contenido.trim()
  if (!MD.test(c) || /\s/.test(c) || /^[a-z]+:/i.test(c)) return null
  for (const base of [dirname(env.ruta), 'docs', '']) {
    const ruta = unir(base, c)
    if (ruta && env.existe(ruta)) return ruta
  }
  return null
}

/** Título del documento citado que coincide con el texto más largo posible después de ›. */
export function seccionCitada(
  resto: string,
  encabezados: Encabezado[],
): { ancla: string; texto: string } | null {
  let mejor: { ancla: string; texto: string } | null = null
  const minus = resto.toLowerCase()
  for (const e of encabezados) {
    const t = e.texto
    if (t === '' || !minus.startsWith(t.toLowerCase())) continue
    if (/[\p{L}\p{N}]/u.test(resto.charAt(t.length))) continue
    if (!mejor || t.length > mejor.texto.length) mejor = { ancla: e.ancla, texto: resto.slice(0, t.length) }
  }
  if (mejor) return mejor
  // `ux.md › W-14 (…)`: el código de un título de ese documento.
  const m = /^([A-Z]{1,4})-?(\d{1,4})(?![\w-])/.exec(resto)
  if (m?.[1] && m[2]) {
    const codigo = normalizarCodigo(m[1], m[2])
    const e = encabezados.find((x) => x.codigo === codigo)
    if (e) return { ancla: e.ancla, texto: m[0] }
  }
  return null
}

/** Enlaces Markdown: a un `.md` → visor; a otro archivo del proyecto → editor; a internet → navegador. */
function clasificarEnlace(t: Token, env: EntornoRender): void {
  const href = decodificar(String(t.attrGet('href') ?? ''))
  t.attrSet('href', '#')
  if (/^(https?:|mailto:)/i.test(href)) {
    t.attrSet('data-externo', href)
    t.attrSet('title', href)
    return
  }
  if (href.startsWith('#')) {
    t.attrSet('data-doc', env.ruta)
    t.attrSet('data-ancla', href.slice(1))
    return
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return
  const [camino = '', fragmento = ''] = href.split('#', 2)
  const ruta = unir(camino.startsWith('/') ? '' : dirname(env.ruta), camino.replace(/^\/+/, ''))
  if (ruta === null) return
  if (MD.test(ruta) && env.existe(ruta)) {
    t.attrSet('data-doc', ruta)
    t.attrSet('data-ancla', fragmento)
  } else {
    t.attrSet('data-archivo', ruta)
    t.attrSet('title', ruta)
  }
}

const ICONO_IMAGEN = '<span class="gp-ico codicon codicon-file-media" aria-hidden="true"></span>'

/** Imágenes relativas → dirección de la pestaña; de internet → recuadro con el enlace (no se cargan). */
function imagen(state: StateCore, t: Token, env: EntornoRender): Token {
  const src = decodificar(String(t.attrGet('src') ?? ''))
  const alt = t.content
  const html = new state.Token('html_inline', '', 0)
  if (/^https?:/i.test(src)) {
    html.content = `<span class="gp-imagen-falta">${ICONO_IMAGEN}Imagen externa: no se carga · <a href="#" data-externo="${esc(src)}">${esc(src)}</a></span>`
    return html
  }
  if (/^data:image\//i.test(src)) {
    html.content = `<img src="${esc(src)}" alt="${esc(alt)}">`
    return html
  }
  const ruta = /^[a-z][a-z0-9+.-]*:/i.test(src) ? null : unir(dirname(env.ruta), src.split('#')[0] ?? '')
  const uri = ruta === null ? null : env.imagen(ruta)
  html.content =
    uri === null
      ? `<span class="gp-imagen-falta">${ICONO_IMAGEN}Imagen no encontrada: <span class="gp-meta">${esc(src)}</span></span>`
      : `<img src="${esc(uri)}" alt="${esc(alt)}" data-ruta="${esc(src)}" loading="lazy">`
  return html
}

// ---------- Rutas (siempre con `/`, relativas a la carpeta abierta) ----------

function decodificar(s: string): string {
  try {
    return decodeURI(s)
  } catch {
    return s
  }
}

export function dirname(ruta: string): string {
  const i = ruta.lastIndexOf('/')
  return i < 0 ? '' : ruta.slice(0, i)
}

/** Une y normaliza; null si la ruta sale de la carpeta abierta. */
export function unir(base: string, relativa: string): string | null {
  const partes: string[] = []
  for (const p of `${base}/${relativa}`.replace(/\\/g, '/').split('/')) {
    if (p === '' || p === '.') continue
    if (p === '..') {
      if (partes.length === 0) return null
      partes.pop()
    } else partes.push(p)
  }
  return partes.length ? partes.join('/') : null
}

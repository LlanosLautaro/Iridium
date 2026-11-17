// DI-I3: el control de estilos de la app (frente Diseño, modulos/diseno/diseno-tecnico.md › Pasar al código en Iridium).
// Los estilos de cada sección no escriben colores ni rehacen las piezas; las piezas de la app son las de las maquetas.
// Mientras las secciones pasan a las piezas, tanda por tanda, lo que falta queda anotado acá abajo y solo puede bajar:
// al pasar una sección, se saca de las listas lo que ya no está (la prueba avisa qué).
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const RAIZ = join(__dirname, '..')
const ESTILOS = join(RAIZ, 'src/renderer/estilos')
/** El texto de un archivo, sin los finales de línea de Windows (Git los pone al sacar los archivos). */
const texto = (ruta: string) => readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n')
const leer = (ruta: string) => texto(join(RAIZ, ruta))
const sinComentarios = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

/** Las hojas de cada sección: todas menos las piezas y el puente de los tokens de antes. */
const SECCIONES = readdirSync(ESTILOS)
  .filter((f) => f.endsWith('.css') && f !== 'piezas.css' && f !== 'tokens-viejos.css')
  .sort()

/** Las clases que aparecen en los selectores de una hoja. */
function clasesDe(css: string): Set<string> {
  const clases = new Set<string>()
  for (const m of sinComentarios(css).matchAll(/([^{}]+)\{/g)) {
    const selector = (m[1] ?? '').trim()
    if (selector.startsWith('@')) continue
    for (const c of selector.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (c[1]) clases.add(c[1])
  }
  return clases
}

/** Los bloques de cada pieza de una hoja (desde su título `───── PZ-n` o «Información a pedido» hasta el siguiente). */
function bloquesDePiezas(css: string): Map<string, string> {
  const bloques = new Map<string, string>()
  const partes = css.split(/(?=\/\* ───────── )/)
  for (const p of partes) {
    const titulo = p.match(/^\/\* ───────── (.+?) ─────────/)?.[1]
    if (titulo && (titulo.startsWith('PZ-') || titulo === 'Información a pedido'))
      bloques.set(titulo, p.trim())
  }
  return bloques
}

/** La clase de cada pieza (sin sus variantes): una sección no las vuelve a definir (ux.md › Reglas). */
const PIEZAS = [
  'boton',
  'filas',
  'fila',
  'bloque',
  'bloque-titulo',
  'recuadro',
  'campo',
  'selector',
  'area',
  'etiqueta-campo',
  'casilla',
  'opcion',
  'interruptor',
  'filtros',
  'filtro',
  'cuenta',
  'punto',
  'senal',
  'menu',
  'velo',
  'cuadro',
  'ventana',
  'cabecera',
  'pestanas',
  'pestana',
  'arbol',
  'nodo',
  'texto-doc',
  'cuerpo-fila',
  'info',
  'nota-enlace',
  'camino',
]

/** Las variantes del Botón (PZ-1), que van solas en el HTML junto a `.boton`: una sección no las usa para otra cosa. */
const VARIANTES = ['principal', 'secundario', 'sin-fondo', 'peligroso', 'solo-icono']

/**
 * Las clases de hoy que reemplazan las piezas (ux.md › Las piezas, columna Reemplaza), sin las que siguen en el marco
 * nuevo (`.proy`, `.act`, `.cerrar`) ni las que son variantes de una pieza (`.aviso`, `.mensaje`).
 */
const VIEJAS = [
  'btn',
  'chip',
  'btn-ic',
  'peligro',
  'actualizar',
  'atras',
  'reabrir',
  'mini-link',
  'sk-fila',
  'sk-proy',
  'tb-fila',
  'fila-com',
  'commit',
  'arch',
  'script-fila',
  'script',
  'fila-git',
  'columna',
  'sk-grupo',
  'bloque-frentes',
  'hito-card',
  'proximo',
  'remoto',
  'plegable',
  'panel-doc',
  'respuesta',
  'pend',
  'aviso-doc',
  'aviso-detalle',
  'aviso-git',
  'aviso-grilla',
  'aviso-afuera',
  'sin-guia',
  'recuadro-simple',
  'falla-motor',
  'ajustes-error',
  'rev-vacio',
  'mudanza',
  'sk-avisos',
  'falla',
  'campo-ajuste',
  'anotar',
  'tono',
  'gp-casilla',
  'menu-boton',
  'ancho-lectura',
  'cuenta-bandeja',
  'badge',
  'frena-punto',
  'aviso-punto',
  'aviso-fw',
  'frente-q',
  'medidor',
  'menu-lista',
  'menu-contextual',
  'dialogo',
  'ajustes',
  'barra-doc',
  'chat-cab',
  'cab-panel',
  'ses',
  'md',
  'doc-texto',
  // DI-I3, tanda 2: lo que usaba el nombre de una pieza para otra cosa, renombrado hasta que su sección pase a la pieza
  'cab-filtros',
  'cab-filtro',
  'arbol-lista',
  'arbol-nodo',
  'git-cuenta',
  'opcion-radio',
  'campo-texto',
  'punto-casilla',
  'cuenta-proy',
  'desplegable',
  'pestana-ses',
  'cab-proyecto',
  'fila-comp',
  'filas-mapa',
  'fila-mapa',
  'interruptor-arch',
  'selector-ia',
  'velo-dialogo',
]

// ── Lo que falta pasar (DI-I3; el punto de partida es la tanda 1). Solo baja. ──

/** Las clases viejas que todavía tiene cada sección. */
const VIEJAS_PENDIENTES: Record<string, string[]> = {
  'ajustes.css': ['ajustes-error', 'campo-ajuste', 'tono', 'ajustes'],
  'base.css': ['mini-link', 'cab-filtros', 'cab-filtro'],
  'git.css': ['commit', 'arch', 'fila-git', 'remoto', 'plegable', 'aviso-git', 'arbol-lista', 'git-cuenta'],
  // DI-I3, tanda 8: Ideas es el bloc de notas (D-112); queda Abrir como proyecto en la columna de Skills
  'ideas.css': ['columna'],
  'marco.css': ['actualizar', 'menu-boton', 'menu-lista', 'desplegable'],
  // DI-I3, tanda 6: la Bandeja pasó a las piezas; quedan el texto de los documentos y la columna de Skills
  'pendientes.css': ['columna', 'aviso-doc', 'gp-casilla', 'doc-texto'],
  // DI-I3, tanda 7: el Mapa pasó a las piezas
  'proyecto.css': [
    'atras',
    'script',
    'aviso-doc',
    'recuadro-simple',
    'menu-boton',
    'ancho-lectura',
    'menu-lista',
    'barra-doc',
    'cab-panel',
    'doc-texto',
    'arbol-lista',
    'arbol-nodo',
  ],
  'proyectos.css': [
    'peligro',
    'aviso-grilla',
    'mudanza',
    'aviso-fw',
    'menu-contextual',
    'cab-proyecto',
    'interruptor-arch',
  ],
  'revision.css': ['reabrir', 'fila-com', 'rev-vacio'],
  'skills.css': [
    'sk-fila',
    'sk-proy',
    'sk-grupo',
    'aviso-detalle',
    'sk-avisos',
    'aviso-punto',
    'arbol-lista',
    'arbol-nodo',
  ],
  'uso.css': ['menu-boton', 'medidor', 'menu-lista', 'dialogo', 'velo-dialogo'],
}

/** Cuántas veces se usa cada token de antes (`tokens-viejos.css`) en la app: como mucho esto. */
const TOKENS_VIEJOS_PENDIENTES: Record<string, number> = {
  '--lateral': 3,
  '--barra': 1,
  '--caja': 21,
  '--medidor-fondo': 5,
  '--primario': 21,
  '--primario-texto': 7,
  '--ok': 13,
  '--esp-sm': 4,
  '--esp-md': 3,
  '--esp-lg': 7,
  '--radio-medidor': 4,
  '--sombra-flotante': 1,
}

/** Lo que encuentra cada regla, por hoja, para compararlo con lo anotado. */
function porHoja(buscar: (clases: Set<string>) => string[]): Record<string, string[]> {
  const r: Record<string, string[]> = {}
  for (const f of SECCIONES) {
    const hallado = buscar(clasesDe(texto(join(ESTILOS, f))))
    if (hallado.length) r[f] = hallado
  }
  return r
}

/** Todos los archivos del renderer, para contar los tokens de antes. */
function archivosDelRenderer(carpeta = join(RAIZ, 'src/renderer')): string[] {
  return readdirSync(carpeta, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? archivosDelRenderer(join(carpeta, e.name))
      : /\.(css|ts|tsx)$/.test(e.name) && e.name !== 'tokens-viejos.css'
        ? [join(carpeta, e.name)]
        : [],
  )
}

describe('el control de estilos (DI-I3)', () => {
  it('ninguna hoja de la app escribe un color: solo var(--…)', () => {
    const color = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(/
    const malos: string[] = []
    for (const f of [...SECCIONES, 'piezas.css', 'tokens-viejos.css'])
      sinComentarios(texto(join(ESTILOS, f)))
        .split('\n')
        .forEach((l, i) => {
          if (color.test(l)) malos.push(`${f}:${i + 1} ${l.trim()}`)
        })
    expect(malos).toEqual([])
  })

  it('las piezas de la app son las de las maquetas, bloque por bloque', () => {
    const maquetas = bloquesDePiezas(leer('docs/diseno/piezas.css'))
    const app = bloquesDePiezas(leer('src/renderer/estilos/piezas.css'))
    expect([...app.keys()]).toEqual([...maquetas.keys()])
    for (const [titulo, bloque] of maquetas) expect(app.get(titulo), titulo).toBe(bloque)
    expect(maquetas.size).toBe(16)
  })

  it('cada var(--…) de la app existe en los tokens o la define la app', () => {
    const definidos = new Set<string>()
    // `--zoom` lo pone el preload; las variables con valor de respaldo (`var(--nivel, 0)`) no cuentan.
    const tokens = [
      leer('docs/diseno/tokens.css'),
      leer('src/preload/index.ts'),
      ...archivosDelRenderer().map(texto),
    ]
    for (const t of [...tokens, leer('src/renderer/estilos/tokens-viejos.css')])
      for (const m of t.matchAll(/(--[a-z][\w-]*)\s*['"]?\s*:/g)) if (m[1]) definidos.add(m[1])
    const usados = new Set<string>()
    for (const a of archivosDelRenderer())
      for (const m of texto(a).matchAll(/var\((--[a-z][\w-]*)\)/g)) if (m[1]) usados.add(m[1])
    expect([...usados].filter((u) => !definidos.has(u))).toEqual([])
  })

  it('las piezas entran a la app y ninguna sección usa sus nombres para otra cosa', () => {
    // Después de la base y antes de las secciones: una sección acomoda una pieza, no la pisa.
    expect(leer('src/renderer/main.tsx')).toContain(
      "import './estilos/base.css'\nimport './estilos/piezas.css'\n",
    )
    expect(
      porHoja((c) => PIEZAS.filter((p) => c.has(p))),
      'una sección no rehace una pieza ni usa su nombre: usá la pieza o poné otro nombre',
    ).toEqual({})
    // Las variantes del Botón tampoco: el área `.principal` de antes (una columna) partía en dos el botón principal.
    expect(
      porHoja((c) => VARIANTES.filter((v) => c.has(v))),
      'una variante de una pieza no es una clase de sección: poné otro nombre',
    ).toEqual({})
  })

  it('los botones son la pieza Botón (PZ-1): ningún componente usa btn ni btn-ic', () => {
    const malos = archivosDelRenderer()
      .filter((a) => a.endsWith('.tsx'))
      .flatMap((a) =>
        texto(a)
          .split('\n')
          .map((l, i) => [l, i] as const)
          .filter(([l]) => /['"`](?:[^'"`]* )?btn(?:-ic)?(?=[ '"`])/.test(l))
          .map(([l, i]) => `${a.slice(RAIZ.length + 1)}:${i + 1} ${l.trim()}`),
      )
    expect(malos).toEqual([])
  })

  it('las clases viejas del inventario se van (lo que falta pasar, solo baja)', () => {
    const hoy = porHoja((c) => VIEJAS.filter((v) => c.has(v)))
    expect(
      hoy,
      'si una clase vieja ya no está, sacala de VIEJAS_PENDIENTES; una nueva no se suma: usá la pieza',
    ).toEqual(VIEJAS_PENDIENTES)
  })

  it('los tokens de antes no se usan más que al empezar', () => {
    const textos = archivosDelRenderer().map(texto)
    const puente = [...leer('src/renderer/estilos/tokens-viejos.css').matchAll(/^\s*(--[\w-]+):/gm)].map(
      (m) => m[1],
    )
    expect(puente.sort()).toEqual(Object.keys(TOKENS_VIEJOS_PENDIENTES).sort())
    for (const [token, maximo] of Object.entries(TOKENS_VIEJOS_PENDIENTES)) {
      const usos = textos.reduce((n, t) => n + t.split(`var(${token})`).length - 1, 0)
      expect(
        usos,
        `${token}: bajá TOKENS_VIEJOS_PENDIENTES a ${usos} o pasá a un token de docs/diseno/tokens.css`,
      ).toBe(maximo)
    }
  })
})

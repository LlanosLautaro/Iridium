// Diseño › Sistema (DS-13): de qué está hecha la interfaz. Los tokens de `docs/diseno/tokens.css` dibujados por grupo
// (colores, letra, estilos de texto, tamaños, espacios y esquinas, medidas fijas, sombras), cada uno con su uso (D-114), y
// las piezas: sus fichas por grupo (T-62, D-117) y la maqueta `piezas.html`, viva y grande.
import type { CSSProperties } from 'react'
import type { FichaVista, GrupoToken, SistemaDiseno, TokenVista } from '../../../../compartido/diseno'
import { Icono } from '../../../ui/Icono'
import { Miniatura } from './Miniatura'

const GRUPOS: readonly { grupo: GrupoToken; nombre: string }[] = [
  { grupo: 'colores', nombre: 'Colores' },
  { grupo: 'letra', nombre: 'Letra' },
  { grupo: 'estilos', nombre: 'Estilos de texto' },
  { grupo: 'tamanos', nombre: 'Tamaños de letra' },
  { grupo: 'espacios', nombre: 'Espacios y esquinas' },
  { grupo: 'medidas', nombre: 'Medidas fijas' },
  { grupo: 'sombras', nombre: 'Sombras' },
  { grupo: 'otras', nombre: 'Otras' },
]

/** Lo más alto que se dibuja una medida fija en su tamaño real; una más alta (una ventana) se corta. */
const ALTO_MAXIMO = 48

/** Los píxeles de una medida fija (`36px`), o null si va en otra unidad. */
function pixeles(valor: string): number | null {
  const m = /^(\d*\.?\d+)px$/.exec(valor.trim())
  return m?.[1] ? Number(m[1]) : null
}

/**
 * Una medida fija (T-63): un alto, en su tamaño real hasta 48px (más, cortado); un ancho, como barra proporcional al más
 * ancho del grupo, porque un panel no entra en la columna.
 */
function estiloMedida(nombre: string, valor: string, anchoMayor: number): CSSProperties | null {
  const px = pixeles(valor)
  if (px === null) return null
  if (/^alto-/.test(nombre)) return { height: Math.min(px, ALTO_MAXIMO) }
  return { width: `${Math.max(2, (px / anchoMayor) * 100)}%` }
}

/** El dibujo de un token: el valor es del proyecto y va como propiedad de estilo, nunca como texto de CSS. */
function Muestra({ t, anchoMayor = 0 }: { t: TokenVista; anchoMayor?: number }) {
  const nombre = t.nombre.replace(/^--/, '')
  let estilo: CSSProperties | null = null
  let clase = 'di-muestra'
  if (t.grupo === 'colores') estilo = { background: t.valor }
  else if (t.grupo === 'espacios')
    estilo = /radio/.test(nombre) ? { borderRadius: t.valor } : { width: t.valor }
  else if (t.grupo === 'medidas') {
    estilo = estiloMedida(nombre, t.valor, anchoMayor)
    const alto = /^alto-/.test(nombre)
    clase = `di-muestra ${alto ? 'di-alto' : 'di-ancho'}${alto && (pixeles(t.valor) ?? 0) > ALTO_MAXIMO ? ' cortada' : ''}`
  } else if (t.grupo === 'sombras') estilo = { boxShadow: t.valor }
  return (
    <li className={`di-token di-g-${t.grupo}`}>
      {t.grupo === 'letra' ? (
        <span className="di-letra" style={{ fontFamily: t.valor }}>
          Aa Iridium
        </span>
      ) : t.grupo === 'estilos' ? (
        // El atajo `font` con los tokens del proyecto ya puestos (T-61); si no se entiende, el ejemplo queda tachado.
        <span
          className={t.muestra ? 'di-estilo' : 'di-estilo roto'}
          style={t.muestra ? { font: t.muestra } : undefined}
          title={t.muestra ? undefined : 'No se entiende: va como «peso tamaño/interlineado letra»'}
        >
          Una línea de ejemplo
        </span>
      ) : t.grupo === 'tamanos' ? (
        <span className="di-tam" style={{ fontSize: t.valor }}>
          Una línea de ejemplo
        </span>
      ) : (
        estilo && <span className={clase} style={estilo} />
      )}
      <span className="di-token-n">{nombre}</span>
      <span className="di-token-v">
        {/* En los estilos, `600 tam-titulo/1.35 ui`: los tokens por su nombre, para que entre en la columna. */}
        {t.grupo === 'estilos' ? t.valor.replace(/var\(--([\w-]+)\)/g, '$1') : t.valor}
      </span>
      {t.uso && <span className="di-token-uso">{t.uso}</span>}
    </li>
  )
}

/** Las fichas de `piezas.css` por grupo, en el orden en que aparece cada grupo; las sin grupo, al final. */
function Fichas({ fichas }: { fichas: FichaVista[] }) {
  const grupos: { nombre: string; fichas: FichaVista[] }[] = []
  for (const f of fichas) {
    const nombre = f.grupo ?? 'Sin grupo'
    let g = grupos.find((x) => x.nombre === nombre)
    if (!g) {
      g = { nombre, fichas: [] }
      grupos.push(g)
    }
    g.fichas.push(f)
  }
  grupos.sort((a, b) => Number(a.nombre === 'Sin grupo') - Number(b.nombre === 'Sin grupo'))
  return (
    <div className="di-fichas">
      {grupos.map((g) => (
        <section key={g.nombre} aria-label={g.nombre}>
          <h4 className="di-fichas-g">{g.nombre}</h4>
          <ul>
            {g.fichas.map((f) => (
              <li key={`${f.codigo ?? ''}${f.nombre}`} className="di-ficha">
                <span className="di-ficha-n">
                  {f.nombre}
                  {f.codigo && <span className="di-ficha-c">{f.codigo}</span>}
                </span>
                <span className="di-ficha-q">{f.paraQue.charAt(0).toUpperCase() + f.paraQue.slice(1)}</span>
                {f.estados.length > 0 && (
                  <span className="di-ficha-e">
                    <span className="di-ficha-r">Estados</span>
                    <span>{f.estados.join(' · ')}</span>
                  </span>
                )}
                {f.tokens.length > 0 && (
                  <span className="di-ficha-t">
                    <span className="di-ficha-r">Tokens</span>
                    <span className="di-ficha-lista">
                      {f.tokens.map((t, i) => (
                        <span key={t.nombre}>
                          {i > 0 && ' '}
                          <span
                            className={t.existe ? undefined : 'roto'}
                            title={t.existe ? undefined : 'No está en tokens.css'}
                          >
                            {t.nombre.replace(/^--/, '')}
                          </span>
                        </span>
                      ))}
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function Sistema({
  sistema,
  base,
  ancho,
  agrandar,
  abrirTokens,
  pedir,
}: {
  sistema: SistemaDiseno
  base: string
  ancho: number
  agrandar: (archivo: string) => void
  abrirTokens: () => void
  /** Pedírselo a la IA, si faltan las piezas; null mientras trabaja. */
  pedir: (() => void) | null
}) {
  return (
    <div className="di-sistema">
      {sistema.errores.length > 0 && (
        <div className="di-error" role="alert">
          <Icono nombre="error" />
          <div>
            {sistema.errores.map((e) => (
              <p key={`${e.linea}-${e.texto}`}>
                <code>tokens.css{e.linea ? `:${e.linea}` : ''}</code> {e.texto}
              </p>
            ))}
          </div>
        </div>
      )}
      <div className="di-sistema-acc">
        <button type="button" className="boton sin-fondo chico" onClick={abrirTokens}>
          <Icono nombre="archivo" />
          Abrir tokens
        </button>
      </div>
      {GRUPOS.map(({ grupo, nombre }) => {
        const del = sistema.tokens.filter((t) => t.grupo === grupo)
        if (del.length === 0) return null
        // Los anchos se dibujan contra el más ancho del grupo.
        const anchoMayor = Math.max(
          1,
          ...del.flatMap((t) => (/^--ancho-/.test(t.nombre) ? (pixeles(t.valor) ?? []) : [])),
        )
        return (
          <section key={grupo} className="di-bloque" aria-label={nombre}>
            <h3 className="di-grupo-t">
              {nombre} <span className="n">{del.length}</span>
            </h3>
            <ul className={`di-tokens di-g-${grupo}`}>
              {del.map((t) => (
                <Muestra key={t.nombre} t={t} anchoMayor={anchoMayor} />
              ))}
            </ul>
          </section>
        )
      })}
      <section className="di-bloque" aria-label="Piezas">
        <h3 className="di-grupo-t">
          Piezas {sistema.fichas.length > 0 && <span className="n">{sistema.fichas.length}</span>}
        </h3>
        {sistema.fichas.length > 0 && <Fichas fichas={sistema.fichas} />}
        {sistema.piezas ? (
          <Miniatura
            base={base}
            maqueta={sistema.piezas}
            ancho={Math.max(ancho, 480)}
            agrandar={() => agrandar('piezas.html')}
          />
        ) : (
          <div className="recuadro punteado di-falta" role="note">
            <div className="cuerpo-recuadro">
              <strong>Las piezas todavía no están dibujadas</strong>
              <span>
                La IA las arma en <code>piezas.html</code>, con cada pieza y sus variantes.
              </span>
              {pedir && (
                <div className="acciones-recuadro">
                  <button type="button" className="boton secundario chico" onClick={pedir}>
                    Pedírselo a la IA
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

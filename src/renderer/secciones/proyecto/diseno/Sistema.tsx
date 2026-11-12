// Diseño › Sistema (DS-13): de qué está hecha la interfaz. Los tokens de `docs/diseno/tokens.css` dibujados por grupo
// (colores, letra, estilos de texto, tamaños, espacios y esquinas, sombras), cada uno con su uso (D-114), y las piezas, la maqueta
// `piezas.html`, viva y grande.
import type { CSSProperties } from 'react'
import type { GrupoToken, SistemaDiseno, TokenVista } from '../../../../compartido/diseno'
import { Icono } from '../../../ui/Icono'
import { Miniatura } from './Miniatura'

const GRUPOS: readonly { grupo: GrupoToken; nombre: string }[] = [
  { grupo: 'colores', nombre: 'Colores' },
  { grupo: 'letra', nombre: 'Letra' },
  { grupo: 'estilos', nombre: 'Estilos de texto' },
  { grupo: 'tamanos', nombre: 'Tamaños de letra' },
  { grupo: 'espacios', nombre: 'Espacios y esquinas' },
  { grupo: 'sombras', nombre: 'Sombras' },
  { grupo: 'otras', nombre: 'Otras' },
]

/** El dibujo de un token: el valor es del proyecto y va como propiedad de estilo, nunca como texto de CSS. */
function Muestra({ t }: { t: TokenVista }) {
  const nombre = t.nombre.replace(/^--/, '')
  let estilo: CSSProperties | null = null
  if (t.grupo === 'colores') estilo = { background: t.valor }
  else if (t.grupo === 'espacios')
    estilo = /radio/.test(nombre) ? { borderRadius: t.valor } : { width: t.valor }
  else if (t.grupo === 'sombras') estilo = { boxShadow: t.valor }
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
        estilo && <span className="di-muestra" style={estilo} />
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
        <button type="button" className="btn fantasma chico" onClick={abrirTokens}>
          <Icono nombre="archivo" />
          Abrir tokens
        </button>
      </div>
      {GRUPOS.map(({ grupo, nombre }) => {
        const del = sistema.tokens.filter((t) => t.grupo === grupo)
        if (del.length === 0) return null
        return (
          <section key={grupo} className="di-bloque" aria-label={nombre}>
            <h3 className="di-grupo-t">
              {nombre} <span className="n">{del.length}</span>
            </h3>
            <ul className={`di-tokens di-g-${grupo}`}>
              {del.map((t) => (
                <Muestra key={t.nombre} t={t} />
              ))}
            </ul>
          </section>
        )
      })}
      <section className="di-bloque" aria-label="Piezas">
        <h3 className="di-grupo-t">Piezas</h3>
        {sistema.piezas ? (
          <Miniatura
            base={base}
            maqueta={sistema.piezas}
            ancho={Math.max(ancho, 480)}
            agrandar={() => agrandar('piezas.html')}
          />
        ) : (
          <div className="recuadro-simple" role="note">
            <b>Las piezas todavía no están dibujadas</b>
            <p>
              La IA las arma en <code>piezas.html</code>, con cada pieza y sus variantes.
            </p>
            {pedir && (
              <button type="button" className="btn secundario chico" onClick={pedir}>
                Pedírselo a la IA
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

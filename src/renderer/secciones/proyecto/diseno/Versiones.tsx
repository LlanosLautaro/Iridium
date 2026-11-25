// Las versiones de una maqueta lado a lado (DS-5, DS-12; DI-I4): la de hoy y cada versión vivas, a lo ancho del lienzo,
// cada una con su frase, Agrandar (a la grande, para usarla y comentarla con F8: un solo `webview` a la vez) y
// Quedarme con esta. Mientras la IA escribe una versión pedida, su lugar lo dice. Guardar para después vuelve a la
// grande sin tocar nada.
import { useEffect, useRef, useState } from 'react'
import type { MaquetaVista } from '../../../../compartido/diseno'
import { Icono } from '../../../ui/Icono'
import { ALTO_MAQUETA, ANCHO_MAQUETA } from './Miniatura'

/** Una maqueta viva al ancho de su columna: un `iframe` aislado, como las miniaturas, pero que se puede usar. */
function Viva({ base, maqueta }: { base: string; maqueta: MaquetaVista }) {
  const marco = useRef<HTMLDivElement>(null)
  const [ancho, setAncho] = useState(0)
  useEffect(() => {
    const el = marco.current
    if (!el) return
    const o = new ResizeObserver(([e]) => setAncho(e?.contentRect.width ?? 0))
    o.observe(el)
    return () => o.disconnect()
  }, [])
  const escala = ancho / ANCHO_MAQUETA
  return (
    <div
      ref={marco}
      className={maqueta.rota ? 'di-marco di-version-marco rota' : 'di-marco di-version-marco'}
      style={{ aspectRatio: `${ANCHO_MAQUETA} / ${ALTO_MAQUETA}` }}
    >
      {maqueta.rota ? (
        <span className="di-motivo">{maqueta.rota}</span>
      ) : (
        ancho > 0 && (
          <iframe
            key={maqueta.huella}
            title={maqueta.nombre}
            src={`${base}${maqueta.archivo}?v=${maqueta.huella}`}
            sandbox="allow-scripts"
            style={{ width: ANCHO_MAQUETA, height: ALTO_MAQUETA, transform: `scale(${escala})` }}
          />
        )
      )}
    </div>
  )
}

export function Versiones({
  base,
  hoy,
  pidiendo,
  noLlego,
  error,
  trabajando,
  quieto,
  agrandar,
  quedarme,
  otraVersion,
  volver,
}: {
  /** La de las miniaturas: `maqueta://<id>/`. */
  base: string
  /** La maqueta del índice, con sus versiones. */
  hoy: MaquetaVista
  /**
   * La versión pedida (`versiones/bandeja/b.html`), o null: citada en la conversación sin mandar todavía, o ya mandada
   * y la IA escribiéndola (D-196).
   */
  pidiendo: { archivo: string; citada: boolean } | null
  /** La IA terminó sin escribir la versión pedida: su letra, o null. */
  noLlego: string | null
  error: string | null
  trabajando: boolean
  /** Hay un cuadro abierto encima: Esc es suyo. */
  quieto: boolean
  agrandar: (archivo: string) => void
  /** Null: quedarse con la de hoy. */
  quedarme: (version: string | null) => void
  otraVersion: () => void
  volver: () => void
}) {
  useEffect(() => {
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !quieto) volver()
    }
    window.addEventListener('keydown', alTeclado)
    return () => window.removeEventListener('keydown', alTeclado)
  }, [volver, quieto])

  const esperando = pidiendo && !hoy.versiones.some((v) => v.archivo === pidiendo.archivo) ? pidiendo : null
  const n = hoy.versiones.length
  const columnas = [
    { m: hoy, titulo: 'Hoy', frase: null as string | null, version: null as string | null },
    ...hoy.versiones.map((v) => ({
      m: v as MaquetaVista,
      titulo: `Versión ${v.letra}`,
      frase: v.descripcion,
      version: v.archivo as string | null,
    })),
  ]
  const ocupado = trabajando ? 'Su IA está trabajando' : undefined

  return (
    <div className="di-grande">
      <div className="di-grande-cab">
        <button type="button" className="boton sin-fondo chico" onClick={volver} title="Volver (Esc)">
          <Icono nombre="atras" />
          Volver
        </button>
        <span className="di-grande-t" aria-live="polite">
          <b>{hoy.nombre}</b>
          {n > 0 && <span className="sub"> · {n === 1 ? '1 versión' : `${n} versiones`}</span>}
        </span>
        <button
          type="button"
          className="boton sin-fondo chico"
          disabled={trabajando}
          title={ocupado ?? 'Deja el pedido citado en la conversación: lo mandás con lo que quieras probar'}
          onClick={otraVersion}
        >
          <Icono nombre="mas" />
          Otra versión
        </button>
        <button
          type="button"
          className="boton sin-fondo chico"
          title="Deja las versiones guardadas y vuelve a la de hoy"
          onClick={volver}
        >
          Guardar para después
        </button>
      </div>
      {error && (
        <p className="script-msg error" role="alert">
          <Icono nombre="error" />
          {error}
        </p>
      )}
      {noLlego && (
        <p className="di-aviso" role="note">
          <Icono nombre="espera" />
          La IA terminó sin escribir la versión {noLlego}: mirá la conversación.
        </p>
      )}
      <div className="di-versiones">
        {columnas.map((c) => (
          <section key={c.m.archivo} className="di-version" aria-label={c.titulo}>
            <div className="di-version-cab">
              <div className="di-version-t">
                <span className="di-nombre">
                  <b>{c.titulo}</b>
                  {c.m.cambiada && <span className="di-punto" aria-hidden="true" />}
                </span>
                <span className="di-version-frase" title={c.frase ?? undefined}>
                  {c.frase ?? (c.version ? 'Sin la frase con que se pidió' : 'La maqueta como está')}
                </span>
              </div>
              <button
                type="button"
                className="boton sin-fondo chico"
                title="Agrandarla para usarla y comentarla con F8"
                onClick={() => agrandar(c.m.archivo)}
              >
                Agrandar
              </button>
              {n > 0 && (
                <button
                  type="button"
                  className="boton secundario chico"
                  disabled={trabajando}
                  title={
                    ocupado ??
                    (c.version
                      ? 'Esta pasa a ser la maqueta y las versiones van a la papelera'
                      : 'La maqueta queda como está y las versiones van a la papelera')
                  }
                  onClick={() => quedarme(c.version)}
                >
                  Quedarme con esta
                </button>
              )}
            </div>
            <Viva base={base} maqueta={c.m} />
          </section>
        ))}
        {esperando && (
          <section className="di-version" aria-label="Versión nueva">
            <div className="di-version-cab">
              <div className="di-version-t">
                <span className="di-nombre">
                  <b>
                    Versión{' '}
                    {(esperando.archivo.split('/').pop() ?? '').replace(/\.html?$/i, '').toUpperCase()}
                  </b>
                </span>
                <span className="di-version-frase">
                  {esperando.citada
                    ? 'Citada en la conversación: escribí qué probar y mandala'
                    : 'Pedida en la conversación'}
                </span>
              </div>
            </div>
            <div
              className="di-marco di-version-marco rota di-escribiendo"
              style={{ aspectRatio: `${ANCHO_MAQUETA} / ${ALTO_MAQUETA}` }}
              role="status"
            >
              <span>
                {esperando.citada
                  ? 'Aparece acá cuando la IA la escriba'
                  : 'La IA está escribiendo la versión…'}
              </span>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

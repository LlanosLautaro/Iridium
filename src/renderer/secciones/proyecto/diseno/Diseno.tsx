// Diseño de un proyecto (frente Diseño, DS-8 a DS-13; D-105): las maquetas HTML de `docs/diseno/` vivas en un lienzo,
// agrupadas por sección (Pantallas), los tokens y las piezas (Sistema) y una maqueta grande para usarla y comentarla
// con F8. Se redibuja sola cuando la IA cambia algo; lo que cambió y no se miró lleva un punto. Sin `docs/diseno/`,
// ofrece pedírselo a la IA (gasta uso: lo dice antes).
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react'
import type { MaquetaVista, VistaDiseno } from '../../../../compartido/diseno'
import { fichaDe, tarjetaDe, usarEstado, vistaDe } from '../../../estado'
import { Cabecera, Filtros } from '../../../ui/Cabecera'
import { Icono } from '../../../ui/Icono'
import { mismaRuta } from '../enlaces'
import { Grande } from './Grande'
import { Miniatura } from './Miniatura'
import { Sistema } from './Sistema'

const ANCHOS = { chico: 240, grande: 400 } as const
type Tamano = keyof typeof ANCHOS

/** El cuadro antes de un pedido a la IA: dice qué hace y que gasta uso. */
function ConfirmarPedido({
  conCodigo,
  pedir,
  cerrar,
}: {
  conCodigo: boolean
  pedir: () => void
  cerrar: () => void
}) {
  const primero = useRef<HTMLButtonElement>(null)
  useEffect(() => primero.current?.focus(), [])
  return (
    <div className="velo">
      <div
        className="dialogo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="di-pedir-t"
        aria-describedby="di-pedir-d"
        onKeyDown={(e) => e.key === 'Escape' && cerrar()}
      >
        <h2 id="di-pedir-t">Pedirle el diseño a la IA</h2>
        <p id="di-pedir-d">
          {conCodigo
            ? 'La IA dibuja las pantallas como están hoy en la app, desde su código, con los tokens y las piezas.'
            : 'La IA dibuja las pantallas desde la UX del proyecto (04-ux.md), con los tokens y las piezas.'}{' '}
          Van apareciendo acá a medida que las guarda. Gasta uso de tu suscripción.
        </p>
        <div className="acc">
          <button ref={primero} type="button" className="btn secundario" onClick={cerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn primario"
            onClick={() => {
              pedir()
              cerrar()
            }}
          >
            Pedírselo
          </button>
        </div>
      </div>
    </div>
  )
}

export function Diseno({ ruta }: { ruta: string }) {
  const [vista, setVista] = useState<VistaDiseno | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pestana, setPestana] = useState<'pantallas' | 'sistema'>('pantallas')
  const [tamano, setTamano] = useState<Tamano>('chico')
  const [grande, setGrande] = useState<string | null>(null)
  const [confirmar, setConfirmar] = useState(false)
  const [pedido, setPedido] = useState<string | null>(null)
  const trabajando = usarEstado((s) => fichaDe(s.fichas, ruta)?.estado === 'trabajando')
  const comentarios = usarEstado((s) => tarjetaDe(s.lista, ruta)?.revision ?? 0)
  const abrirSeccion = usarEstado((s) => s.abrirSeccion)
  const abrirArchivo = usarEstado((s) => s.abrirArchivo)
  const pedida = usarEstado((s) => vistaDe(s.vistas, ruta).maqueta)
  const cambiarVista = usarEstado((s) => s.cambiarVista)
  const [noEsta, setNoEsta] = useState<string | null>(null)
  const botones = useRef(new Map<string, HTMLButtonElement>())
  const volverA = useRef<string | null>(null)

  const leer = useCallback(() => {
    void window.iridium.abrirDiseno(ruta).then(
      (v) => {
        setVista(v)
        setError(null)
      },
      (e: unknown) => setError(e instanceof Error ? e.message : String(e)),
    )
  }, [ruta])
  useEffect(leer, [leer])
  useEffect(() => window.iridium.alCambiarDiseno((c) => mismaRuta(c.ruta, ruta) && leer()), [ruta, leer])

  const maquetas: MaquetaVista[] =
    vista?.tipo === 'diseno'
      ? [...vista.grupos.flatMap((g) => g.maquetas), ...(vista.sistema.piezas ? [vista.sistema.piezas] : [])]
      : []
  const enLienzo = vista?.tipo === 'diseno' ? vista.grupos.flatMap((g) => g.maquetas) : []

  /** Agrandar marca vista la maqueta (se va el punto). */
  const agrandar = useCallback(
    (archivo: string) => {
      setGrande(archivo)
      setVista((v) =>
        v?.tipo === 'diseno'
          ? {
              ...v,
              grupos: v.grupos.map((g) => ({
                ...g,
                maquetas: g.maquetas.map((m) => (m.archivo === archivo ? { ...m, cambiada: false } : m)),
              })),
              sistema: {
                ...v.sistema,
                piezas:
                  v.sistema.piezas?.archivo === archivo
                    ? { ...v.sistema.piezas, cambiada: false }
                    : v.sistema.piezas,
              },
            }
          : v,
      )
      void window.iridium.marcarVista(ruta, archivo).catch(() => {})
    },
    [ruta],
  )
  // Desde un comentario de la Revisión: esa maqueta grande o, si ya no está, el aviso.
  useEffect(() => {
    if (!pedida || vista?.tipo !== 'diseno') return
    cambiarVista(ruta, { maqueta: null })
    const existe = [
      ...vista.grupos.flatMap((g) => g.maquetas),
      ...(vista.sistema.piezas ? [vista.sistema.piezas] : []),
    ].some((m) => m.archivo === pedida)
    if (existe) {
      setNoEsta(null)
      agrandar(pedida)
    } else setNoEsta(pedida)
  }, [pedida, vista, ruta, cambiarVista, agrandar])

  const volver = useCallback(() => {
    setGrande((g) => {
      volverA.current = g
      return null
    })
  }, [])
  // Al volver, el foco queda en la miniatura que se agrandó.
  useEffect(() => {
    if (grande || !volverA.current) return
    botones.current.get(volverA.current)?.focus()
    volverA.current = null
  }, [grande])

  const pedir = () => {
    setPedido(null)
    window.iridium.pedirDiseno(ruta, 'empezar').then(
      () => setPedido('La IA está armando el diseño: las maquetas aparecen a medida que las guarda.'),
      (e: unknown) => setPedido(`No se pudo mandar el pedido: ${e instanceof Error ? e.message : String(e)}`),
    )
  }

  // En el lienzo, las flechas pasan de una miniatura a otra (Enter agranda: es un botón).
  const alTeclado = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return
    const lista = enLienzo.map((m) => botones.current.get(m.archivo)).filter((b) => b !== undefined)
    const i = lista.findIndex((b) => b === document.activeElement)
    if (i < 0) return
    e.preventDefault()
    const paso = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1
    lista[Math.min(lista.length - 1, Math.max(0, i + paso))]?.focus()
  }

  if (vista?.tipo === 'diseno' && grande)
    return (
      <Grande
        carpeta={vista.carpeta}
        maquetas={grande === 'piezas.html' ? maquetas.filter((m) => m.archivo === grande) : enLienzo}
        archivo={grande}
        elegir={agrandar}
        volver={volver}
      />
    )

  const sinDiseno = vista?.tipo === 'sin-diseno'
  const cuenta = enLienzo.length
  return (
    <>
      <Cabecera
        titulo="Diseño"
        cuenta={cuenta > 0 ? cuenta : undefined}
        acciones={
          comentarios > 0 && (
            <button
              type="button"
              className="btn fantasma chico"
              title="Los comentarios abiertos de la Revisión"
              onClick={() => abrirSeccion(ruta, 'revision')}
            >
              <Icono nombre="revision" />
              {comentarios === 1 ? '1 comentario' : `${comentarios} comentarios`}
            </button>
          )
        }
        filtros={
          vista?.tipo === 'diseno' && (
            <>
              <Filtros
                filtros={[
                  { clave: 'pantallas', nombre: 'Pantallas' },
                  { clave: 'sistema', nombre: 'Sistema' },
                ]}
                elegido={pestana}
                elegir={(c) => setPestana(c as typeof pestana)}
                etiqueta="Pantallas o sistema"
              />
              {pestana === 'pantallas' && (
                <div className="di-tamano">
                  <Filtros
                    filtros={[
                      { clave: 'chico', nombre: 'Chicas' },
                      { clave: 'grande', nombre: 'Grandes' },
                    ]}
                    elegido={tamano}
                    elegir={(c) => setTamano(c as Tamano)}
                    etiqueta="Tamaño de las miniaturas"
                  />
                </div>
              )}
            </>
          )
        }
      />
      {error && (
        <p className="script-msg error" role="alert">
          <Icono nombre="error" />
          No se pudo leer: {error}
        </p>
      )}
      {!vista && !error && <p className="nota">Leyendo…</p>}
      {noEsta && (
        <p className="di-aviso" role="note">
          <Icono nombre="espera" />
          La maqueta {noEsta} ya no está.
        </p>
      )}
      {pedido && (
        <p className="di-pedido" role="status">
          {pedido}
        </p>
      )}
      {sinDiseno && (
        <div className="recuadro-simple" role="note">
          <b>Este proyecto todavía no tiene su diseño</b>
          <p>
            Las pantallas se diseñan como maquetas que la IA escribe en <code>docs/diseno/</code>: se ven
            vivas acá, se usan y se comentan con F8.
          </p>
          <button
            type="button"
            className="btn secundario chico"
            disabled={trabajando}
            title={
              trabajando ? 'Su IA está trabajando' : 'Le manda el pedido a la IA del proyecto: gasta uso'
            }
            onClick={() => setConfirmar(true)}
          >
            Pedírselo a la IA
          </button>
        </div>
      )}
      {vista?.tipo === 'diseno' && vista.problemaIndice && (
        <p className="di-aviso" role="note">
          <Icono nombre="espera" />
          {vista.problemaIndice}. La IA lo corrige al terminar su próximo turno.
        </p>
      )}
      {vista?.tipo === 'diseno' && pestana === 'pantallas' && (
        // biome-ignore lint/a11y/noStaticElementInteractions: las flechas mueven el foco entre los botones de adentro.
        <div className="di-lienzo" onKeyDown={alTeclado}>
          {vista.grupos.length === 0 && !vista.problemaIndice && (
            <p className="cab-vacia">
              Todavía no hay pantallas en el índice. Aparecen acá cuando la IA las guarda.
            </p>
          )}
          {vista.grupos.map((g) => (
            <section key={g.seccion} className="di-grupo" aria-label={`${g.seccion}: ${g.maquetas.length}`}>
              <h3 className="di-grupo-t">
                {g.seccion} <span className="n">{g.maquetas.length}</span>
              </h3>
              <div className="di-fila">
                {g.maquetas.map((m) => (
                  <Miniatura
                    key={m.archivo}
                    base={vista.base}
                    maqueta={m}
                    ancho={ANCHOS[tamano]}
                    agrandar={() => agrandar(m.archivo)}
                    boton={(b) => {
                      if (b) botones.current.set(m.archivo, b)
                      else botones.current.delete(m.archivo)
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      {vista?.tipo === 'diseno' && pestana === 'sistema' && (
        <Sistema
          sistema={vista.sistema}
          base={vista.base}
          ancho={ANCHOS.grande}
          agrandar={agrandar}
          abrirTokens={() => abrirArchivo(ruta, 'docs/diseno/tokens.css')}
          pedir={trabajando ? null : () => setConfirmar(true)}
        />
      )}
      {confirmar && (
        <ConfirmarPedido
          conCodigo={vista?.tipo === 'sin-diseno' ? vista.conCodigo : true}
          pedir={pedir}
          cerrar={() => setConfirmar(false)}
        />
      )}
    </>
  )
}

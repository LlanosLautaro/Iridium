// Los adjuntos del chat (frente Paridad, PA-2 a PA-5; maquetas `paridad-adjuntos.html` y `paridad-enviado.html`): las
// fichas arriba del cuadro (la Ficha, PZ-16: la foto como miniatura, el archivo con su ícono y su nombre, la ✕ que lo
// saca), las mismas sin ✕ en un mensaje mandado y el visor, el cuadro de siempre (PZ-8) con la foto o el texto adentro.
// La ventana no lee el disco: las miniaturas y la foto grande las da el puente.
import { type ReactNode, useEffect, useRef, useState } from 'react'
import {
  type AdjuntoPedido,
  type AdjuntoVista,
  lineasDe,
  nombreDe,
  textoLineas,
} from '../../../compartido/adjuntos'
import type { FotoGrande } from '../../../compartido/puente'
import { usarEstado } from '../../estado'
import { Icono } from '../../ui/Icono'

/** Lo que muestra el visor: una foto (por su ruta o ya leída) o un texto pegado. */
export type EnVisor =
  | { tipo: 'foto'; ruta: string; nombre: string }
  | { tipo: 'foto-leida'; src: string; nombre: string }
  | { tipo: 'texto'; texto: string; lineas: number }

const kb = (bytes: number) =>
  bytes >= 2 ** 20 ? `${(bytes / 2 ** 20).toFixed(1).replace('.', ',')} MB` : `${Math.ceil(bytes / 1024)} KB`

/** El visor (`ux.md` › El visor): grande y centrado sobre el velo; Esc o un clic afuera lo cierran. */
export function Visor({ que, cerrar }: { que: EnVisor; cerrar: () => void }) {
  const [grande, setGrande] = useState<FotoGrande | null | 'cargando'>(
    que.tipo === 'foto' ? 'cargando' : null,
  )
  const caja = useRef<HTMLDivElement>(null)
  // Esc lo cierra aunque el foco haya salido del cuadro (como el menú del clic derecho), y al cerrar el foco vuelve a
  // donde estaba (la ficha que lo abrió), como en Ajustes.
  const alCerrar = useRef(cerrar)
  alCerrar.current = cerrar
  useEffect(() => {
    const antes = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const tecla = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      e.stopPropagation()
      alCerrar.current()
    }
    document.addEventListener('keydown', tecla, true)
    return () => {
      document.removeEventListener('keydown', tecla, true)
      antes?.focus()
    }
  }, [])
  useEffect(() => {
    caja.current?.focus()
    if (que.tipo !== 'foto') return
    let vigente = true
    void window.iridium
      .fotoGrande(que.ruta)
      .then((g) => vigente && setGrande(g))
      .catch(() => vigente && setGrande(null))
    return () => {
      vigente = false
    }
  }, [que])
  const titulo = que.tipo === 'texto' ? 'Texto pegado' : que.nombre
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: el velo solo cierra con un clic afuera del cuadro.
    // biome-ignore lint/a11y/useKeyWithClickEvents: Esc lo atiende la página entera, mientras está abierto.
    <div className="velo capa-cuadro" onClick={(e) => e.target === e.currentTarget && cerrar()}>
      <div
        ref={caja}
        className={`cuadro visor-adjunto${que.tipo === 'texto' ? ' texto' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
      >
        {que.tipo === 'texto' ? (
          <pre className="texto-pegado">{que.texto}</pre>
        ) : que.tipo === 'foto-leida' ? (
          <img src={que.src} alt={que.nombre} />
        ) : grande === 'cargando' ? (
          <p className="nota">Abriendo la foto…</p>
        ) : grande ? (
          <img src={grande.src} alt={que.nombre} />
        ) : (
          <p className="nota">No se puede abrir: ya no está o no es una imagen.</p>
        )}
        <div className="pie">
          <span className="nota pie-visor">
            {titulo}
            {que.tipo === 'texto' && ` · ${textoLineas(que.lineas)}`}
            {que.tipo === 'foto' &&
              grande &&
              grande !== 'cargando' &&
              ` · ${grande.ancho}×${grande.alto} · ${kb(grande.bytes)}`}
          </span>
          <button type="button" className="boton sin-fondo" onClick={cerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

/** Las miniaturas ya pedidas, por ruta: al volver al proyecto no se piden de nuevo. */
const miniaturas = new Map<string, string | null>()

function useMiniatura(ruta: string): string | null | 'cargando' {
  const [src, setSrc] = useState<string | null | 'cargando'>(() =>
    miniaturas.has(ruta) ? (miniaturas.get(ruta) ?? null) : 'cargando',
  )
  useEffect(() => {
    if (miniaturas.has(ruta)) return setSrc(miniaturas.get(ruta) ?? null)
    let vigente = true
    void window.iridium
      .miniatura(ruta)
      .catch(() => null)
      .then((m) => {
        miniaturas.set(ruta, m)
        if (vigente) setSrc(m)
      })
    return () => {
      vigente = false
    }
  }, [ruta])
  return src
}

/** El nombre de una foto en su ficha: la pegada no tiene uno propio. */
function nombreDeFoto(ruta: string, pegada: boolean): string {
  return pegada ? 'Imagen pegada' : nombreDe(ruta)
}

/** Si una ruta es de una foto pegada (se guardan en `pegadas/` de los datos de Iridium con este nombre). */
const esPegada = (ruta: string) => /[\\/]pegadas[\\/]pegada-[^\\/]+$/i.test(ruta)

/** Una foto del compositor: la miniatura o, si no se puede leer, el borde rojo y por qué no va. */
function FichaFoto({
  ruta,
  quitar,
  abrir,
  alNoVa,
}: {
  ruta: string
  quitar: () => void
  abrir: () => void
  alNoVa: (noVa: boolean) => void
}) {
  const src = useMiniatura(ruta)
  const noVa = src === null
  useEffect(() => alNoVa(noVa), [noVa, alNoVa])
  const nombre = nombreDeFoto(ruta, esPegada(ruta))
  return (
    <span
      className={`ficha foto${noVa ? ' no-va' : ''}`}
      title={noVa ? 'No se puede mandar: no es una imagen válida o ya no está' : nombre}
    >
      <button
        type="button"
        className="abrir-ficha"
        aria-label={`Ver ${nombre}`}
        disabled={noVa}
        onClick={abrir}
      >
        {src && src !== 'cargando' ? <img src={src} alt="" /> : <Icono nombre={noVa ? 'error' : 'imagen'} />}
      </button>
      <button type="button" className="quitar" aria-label={`Sacar ${nombre}`} title="Sacar" onClick={quitar}>
        <Icono nombre="x" />
      </button>
    </span>
  )
}

/** Una ficha del compositor que no es un adjunto: «Sobre la skill …» o una cita (PA-I3: pasan a la Ficha, PZ-16). */
export function FichaCita({
  icono,
  titulo,
  clase,
  quitar,
  textoQuitar,
  children,
}: {
  icono: Parameters<typeof Icono>[0]['nombre']
  titulo: string
  clase: string
  quitar: () => void
  textoQuitar: string
  children: ReactNode
}) {
  return (
    <span className={`ficha ${clase}`} title={titulo}>
      <Icono nombre={icono} />
      <span className="nombre-ficha">{children}</span>
      <button type="button" className="quitar" aria-label={textoQuitar} title={textoQuitar} onClick={quitar}>
        <Icono nombre="x" />
      </button>
    </span>
  )
}

/**
 * Las fichas arriba del cuadro (PA-2): una por adjunto, con su ✕. `alNoVa` dice qué fotos no se pueden mandar (el
 * mensaje no sale hasta sacarlas). `antes`: las de «Sobre la skill» y las citas, en la misma fila.
 */
export function FichasCompositor({
  adjuntos,
  quitar,
  ver,
  alNoVa,
  antes,
}: {
  adjuntos: AdjuntoPedido[]
  quitar: (i: number) => void
  ver: (que: EnVisor) => void
  alNoVa: (ruta: string, noVa: boolean) => void
  antes?: ReactNode
}) {
  return (
    <div className="fichas">
      {antes}
      {adjuntos.map((a, i) =>
        a.tipo === 'pegado' ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: dos textos pegados pueden ser iguales; su lugar no cambia.
          <span key={`pegado-${i}`} className="ficha pegado">
            <button
              type="button"
              className="abrir-ficha"
              title="Abrir para leerlo"
              onClick={() => ver({ tipo: 'texto', texto: a.texto, lineas: lineasDe(a.texto) })}
            >
              <Icono nombre="docs" />
              <b>Texto pegado</b>
              {textoLineas(lineasDe(a.texto))}
            </button>
            <button
              type="button"
              className="quitar"
              aria-label="Sacar el texto pegado"
              title="Sacar"
              onClick={() => quitar(i)}
            >
              <Icono nombre="x" />
            </button>
          </span>
        ) : a.tipo === 'foto' ? (
          <FichaFoto
            key={a.ruta}
            ruta={a.ruta}
            quitar={() => quitar(i)}
            abrir={() => ver({ tipo: 'foto', ruta: a.ruta, nombre: nombreDeFoto(a.ruta, esPegada(a.ruta)) })}
            alNoVa={(n) => alNoVa(a.ruta, n)}
          />
        ) : (
          <span key={a.ruta} className="ficha" title={a.ruta}>
            <Icono nombre="archivo" />
            <b>{nombreDe(a.ruta)}</b>
            <button
              type="button"
              className="quitar"
              aria-label={`Sacar ${nombreDe(a.ruta)}`}
              title="Sacar"
              onClick={() => quitar(i)}
            >
              <Icono nombre="x" />
            </button>
          </span>
        ),
      )}
    </div>
  )
}

/** Un archivo de un mensaje mandado: un clic lo abre (del proyecto, en Archivos; de afuera, con Windows). */
function FichaArchivoEnviada({ ruta, archivo }: { ruta: string; archivo: string }) {
  const abrirArchivo = usarEstado((s) => s.abrirArchivo)
  const [aviso, setAviso] = useState<string | null>(null)
  const abrir = async () => {
    const r = await window.iridium.abrirAdjunto(ruta, archivo).catch(() => null)
    if (r?.tipo === 'en-proyecto') abrirArchivo(ruta, r.archivo)
    setAviso(
      !r
        ? 'No se pudo abrir'
        : r.tipo === 'no-esta'
          ? `Ya no está en ${archivo}`
          : r.tipo === 'error'
            ? r.mensaje
            : null,
    )
  }
  return (
    <button type="button" className="ficha" title={aviso ?? archivo} onClick={() => void abrir()}>
      <Icono nombre={aviso ? 'error' : 'archivo'} />
      <b>{nombreDe(archivo)}</b>
      {aviso && <span className="nota">{aviso}</span>}
    </button>
  )
}

/** Las fichas de un mensaje mandado (PA-5): sin ✕, la foto un poco más grande. */
export function FichasEnviadas({ ruta, adjuntos }: { ruta: string; adjuntos: AdjuntoVista[] }) {
  const [enVisor, setEnVisor] = useState<EnVisor | null>(null)
  return (
    <div className="fichas enviadas">
      {adjuntos.map((a, i) =>
        a.tipo === 'foto' ? (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: las fichas de un mensaje mandado no cambian de orden.
            key={i}
            type="button"
            className="ficha foto"
            title={a.nombre ?? 'Foto'}
            aria-label={`Ver ${a.nombre ?? 'la foto'}`}
            onClick={() => setEnVisor({ tipo: 'foto-leida', src: a.src, nombre: a.nombre ?? 'Foto' })}
          >
            <img src={a.src} alt="" />
          </button>
        ) : a.tipo === 'archivo' ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: las fichas de un mensaje mandado no cambian de orden.
          <FichaArchivoEnviada key={i} ruta={ruta} archivo={a.ruta} />
        ) : (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: las fichas de un mensaje mandado no cambian de orden.
            key={i}
            type="button"
            className="ficha"
            title="Abrir para leerlo"
            onClick={() => setEnVisor({ tipo: 'texto', texto: a.texto, lineas: a.lineas })}
          >
            <Icono nombre="docs" />
            <b>Texto pegado</b>
            {textoLineas(a.lineas)}
          </button>
        ),
      )}
      {enVisor && <Visor que={enVisor} cerrar={() => setEnVisor(null)} />}
    </div>
  )
}

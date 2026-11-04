// El detalle de una skill (SK-1 a SK-3): el origen en palabras y la carpeta arriba; abajo, el árbol de su carpeta con
// «Resumen» primero (los avisos —está dos veces, enlace roto—, la descripción entera y, en la guía, cuántos proyectos
// están atrasados) y el visor de Archivos para leer cada archivo sin salir de Iridium (Q-95).
import { useMemo, useState } from 'react'
import type { Skill } from '../../../compartido/skills'
import { usarEstado } from '../../estado'
import { Icono } from '../../ui/Icono'
import { ArbolArchivos, alternarCarpeta, type FuenteArchivos, VisorArchivo } from '../proyecto/Archivos'
import { dondeEsta, origenEnPalabras, pedidoArreglar, pedidoSacar, porQueNoSeEdita } from './textos'

/** El aviso dentro del detalle (DESIGN.md › Aviso del detalle): ⚠, un título, el texto y un botón. */
function Aviso({
  titulo,
  children,
  accion,
}: {
  titulo: string
  children: React.ReactNode
  accion?: React.ReactNode
}) {
  return (
    <div className="aviso-detalle" role="note">
      <div className="tit">
        <Icono nombre="espera" />
        {titulo}
      </div>
      <p>{children}</p>
      {accion && <div className="acc">{accion}</div>}
    </div>
  )
}

export function DetalleSkill({
  s,
  atrasados,
  verAtrasados,
  pedir,
  hayChat,
}: {
  s: Skill
  /** Cuántos proyectos están atrasados: solo en la guía; null en las demás. */
  atrasados: number | null
  verAtrasados: () => void
  /** Escribe un pedido en el chat de la derecha, sin enviarlo. */
  pedir: (texto: string) => void
  hayChat: boolean
}) {
  const [error, setError] = useState<string | null>(null)
  const abrir = () => {
    setError(null)
    window.iridium.abrirCarpetaSkill(s.id).catch(() => setError('No se pudo abrir la carpeta.'))
  }
  const noSeEdita = porQueNoSeEdita(s.origen)
  const lugar = usarEstado((e) => e.skills.archivos[s.id]) ?? { archivo: null, carpetas: [] }
  const cambiarSkills = usarEstado((e) => e.cambiarSkills)
  const archivos = usarEstado((e) => e.skills.archivos)
  const recordar = (cambio: Partial<typeof lugar>) =>
    cambiarSkills({ archivos: { ...archivos, [s.id]: { ...lugar, ...cambio } } })
  const fuente = useMemo<FuenteArchivos>(
    () => ({
      clave: `skill|${s.id}`,
      carpeta: (c) => window.iridium.carpetaSkill(s.id, c),
      archivo: (a) => window.iridium.archivoSkill(s.id, a),
    }),
    [s.id],
  )
  return (
    <section className="sk-detalle" aria-label={`La skill ${s.nombre}`}>
      <div className="cab">
        <h2 title={s.nombre}>{s.nombre}</h2>
        <div className="origen">
          <span>{origenEnPalabras(s)}</span>
          <button type="button" className="btn secundario chico" onClick={abrir}>
            <Icono nombre="carpeta" />
            Abrir carpeta
          </button>
        </div>
        <span className="ruta" title={s.id}>
          {s.id}
        </span>
        {error && (
          <span className="sk-falla" role="alert">
            {error}
          </span>
        )}
      </div>
      <div className="partida sk-partida">
        <nav className="arbol" aria-label={`Archivos de ${s.nombre}`}>
          <button
            type="button"
            className={lugar.archivo === null ? 'nodo sel sk-resumen' : 'nodo sk-resumen'}
            aria-current={lugar.archivo === null}
            onClick={() => recordar({ archivo: null })}
          >
            <span className="chev" />
            <Icono nombre={s.doble || s.problema === 'enlace-roto' ? 'espera' : 'skills'} />
            <span className="nombre">Resumen</span>
          </button>
          <h3>Archivos</h3>
          <ArbolArchivos
            fuente={fuente}
            eleccion={{
              abiertas: lugar.carpetas,
              alternar: (c) => recordar({ carpetas: alternarCarpeta(lugar.carpetas, c) }),
              elegido: lugar.archivo,
              elegir: (a) => recordar({ archivo: a }),
            }}
          />
        </nav>
        {lugar.archivo !== null ? (
          <VisorArchivo fuente={fuente} archivo={lugar.archivo} />
        ) : (
          <div className="cuerpo">
            {s.doble && (
              <Aviso
                titulo="Está dos veces"
                accion={
                  s.doble.sobra !== null && (
                    <button
                      type="button"
                      className="btn secundario chico"
                      disabled={!hayChat}
                      title="Escribe el pedido en el chat de la derecha: lo mandás o lo cambiás antes"
                      onClick={() => pedir(pedidoSacar(s))}
                    >
                      Pedir que la saquen
                    </button>
                  )
                }
              >
                También llega {dondeEsta(s.doble.otraOrigen, s.doble.otraComplemento)} ({s.doble.otraNombre}).{' '}
                {s.doble.motivo}
              </Aviso>
            )}
            {s.problema === 'enlace-roto' && (
              <Aviso
                titulo="El enlace no lleva a ningún lado"
                accion={
                  <button
                    type="button"
                    className="btn secundario chico"
                    disabled={!hayChat}
                    title="Escribe el pedido en el chat de la derecha: lo mandás o lo cambiás antes"
                    onClick={() => pedir(pedidoArreglar(s))}
                  >
                    Pedir que lo arreglen
                  </button>
                }
              >
                Lleva a <code>{s.destino}</code>, que ya no existe.
              </Aviso>
            )}
            {s.descripcion ? (
              <p className="desc">{s.descripcion}</p>
            ) : (
              <>
                <p className="desc vacia">Sin descripción</p>
                {s.problema === 'sin-descripcion' && (
                  <p className="sk-nota">El archivo SKILL.md no tiene descripción.</p>
                )}
              </>
            )}
            {atrasados !== null && atrasados > 0 && (
              <button type="button" className="sk-enlace" onClick={verAtrasados}>
                <Icono nombre="sync" />
                {atrasados === 1 ? '1 proyecto atrasado' : `${atrasados} proyectos atrasados`} con un formato
                viejo
                <span className="ver">Ver</span>
              </button>
            )}
            {noSeEdita && <p className="sk-nota">{noSeEdita} Igual se puede hablar de ella en el chat.</p>}
          </div>
        )}
      </div>
    </section>
  )
}

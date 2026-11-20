// El detalle de una skill (SK-1 a SK-3; DI-I3, tanda 9: la maqueta `docs/diseno/pantallas/skill.html`): la cabecera
// con su nombre, de dónde llega y Abrir carpeta; las Pestañas Resumen (los avisos —está dos veces, enlace roto— como
// Recuadro y la descripción entera) y Archivos, el árbol de su carpeta con el visor para leer cada archivo sin salir
// de Iridium (Q-95).
import { type KeyboardEvent, type ReactNode, useMemo, useRef, useState } from 'react'
import type { Skill } from '../../../compartido/skills'
import { usarEstado } from '../../estado'
import { Cabecera } from '../../ui/Cabecera'
import { Icono } from '../../ui/Icono'
import {
  ArbolArchivos,
  alternarCarpeta,
  type FuenteArchivos,
  useArchivo,
  VisorArchivo,
} from '../proyecto/Archivos'
import { dondeEsta, origenEnPalabras, pedidoArreglar, pedidoSacar, porQueNoSeEdita } from './textos'

/** El archivo que se abre al pasar a Archivos sin uno elegido. */
const PRIMER_ARCHIVO = 'SKILL.md'

/** Un aviso del Resumen como Recuadro (PZ-4): el título, el texto y su botón. */
function Aviso({ titulo, children, accion }: { titulo: string; children: ReactNode; accion?: ReactNode }) {
  return (
    <div className="recuadro aviso" role="note">
      <Icono nombre="espera" />
      <div className="cuerpo-recuadro">
        <strong>{titulo}</strong>
        <span>{children}</span>
        {accion && <div className="acciones-recuadro">{accion}</div>}
      </div>
    </div>
  )
}

/** Resumen y Archivos (Pestañas, PZ-10), con las flechas como las de los frentes del Mapa. */
function PestanasSkill({ archivos, elegir }: { archivos: boolean; elegir: (archivos: boolean) => void }) {
  const barra = useRef<HTMLDivElement>(null)
  const flechas = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    elegir(!archivos)
    requestAnimationFrame(() => barra.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus())
  }
  const pestana = (nombre: string, esta: boolean) => (
    <button
      type="button"
      role="tab"
      aria-selected={esta === archivos}
      tabIndex={esta === archivos ? 0 : -1}
      className={esta === archivos ? 'pestana elegida' : 'pestana'}
      onClick={() => elegir(esta)}
    >
      {nombre}
    </button>
  )
  return (
    <div
      ref={barra}
      className="pestanas sk-pestanas"
      role="tablist"
      aria-label="Vistas de la skill"
      onKeyDown={flechas}
    >
      {pestana('Resumen', false)}
      {pestana('Archivos', true)}
    </div>
  )
}

export function DetalleSkill({
  s,
  pedir,
  hayChat,
}: {
  s: Skill
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
  const enArchivos = lugar.archivo !== null
  const pedirBoton = (texto: string, nombre: string) => (
    <button
      type="button"
      className="boton secundario chico"
      disabled={!hayChat}
      title="Escribe el pedido en el chat de la derecha: lo envías o lo cambias antes"
      onClick={() => pedir(texto)}
    >
      {nombre}
    </button>
  )
  return (
    <section className="sk-detalle" aria-label={`La skill ${s.nombre}`}>
      <Cabecera
        titulo={s.nombre}
        sub={origenEnPalabras(s)}
        acciones={
          <>
            {error && (
              <span className="senal rojo" role="alert">
                {error}
              </span>
            )}
            <button type="button" className="boton sin-fondo" title={s.id} onClick={abrir}>
              <Icono nombre="carpeta" />
              Abrir carpeta
            </button>
          </>
        }
        filtros={
          <PestanasSkill
            archivos={enArchivos}
            elegir={(a) => recordar({ archivo: a ? (lugar.archivo ?? PRIMER_ARCHIVO) : null })}
          />
        }
      />
      {enArchivos ? (
        <div className="archivos-cols sk-partida">
          <nav className="arbol" aria-label={`Archivos de ${s.nombre}`}>
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
          <VisorSkill fuente={fuente} archivo={lugar.archivo ?? PRIMER_ARCHIVO} />
        </div>
      ) : (
        <div className="sk-resumen" role="tabpanel" aria-label="Resumen">
          {s.doble && (
            <Aviso
              titulo="Está dos veces"
              accion={s.doble.sobra !== null && pedirBoton(pedidoSacar(s), 'Pedir que la saquen')}
            >
              También llega {dondeEsta(s.doble.otraOrigen, s.doble.otraComplemento)} ({s.doble.otraNombre}).{' '}
              {s.doble.motivo}
            </Aviso>
          )}
          {s.problema === 'enlace-roto' && (
            <Aviso
              titulo="El enlace no lleva a ningún lado"
              accion={pedirBoton(pedidoArreglar(s), 'Pedir que lo arreglen')}
            >
              Lleva a <code>{s.destino}</code>, que ya no existe.
            </Aviso>
          )}
          <div className="texto-doc">
            {s.descripcion ? (
              <p className="sk-descripcion">{s.descripcion}</p>
            ) : (
              <p className="sk-sin-descripcion">
                Sin descripción
                {s.problema === 'sin-descripcion' && ': el archivo SKILL.md no tiene descripción.'}
              </p>
            )}
          </div>
          {noSeEdita && <p className="sk-nota">{noSeEdita} Igual se puede hablar de ella en el chat.</p>}
        </div>
      )}
    </section>
  )
}

/** El archivo elegido de la skill, con el visor de Archivos. */
function VisorSkill({ fuente, archivo }: { fuente: FuenteArchivos; archivo: string }) {
  const [contenido] = useArchivo(fuente, archivo)
  return <VisorArchivo contenido={contenido} archivo={archivo} />
}

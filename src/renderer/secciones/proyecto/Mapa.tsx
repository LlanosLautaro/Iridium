// El Mapa (D-141, D-144; `modulos/mapa/ux.md` › W-7): qué se va a hacer y en qué orden, frente por frente. Arriba, la
// barra con un frente por pestaña (el activo primero) y «Por empezar»; debajo, el camino del frente elegido (la pieza
// Camino, PZ-15): lo hecho antes plegado, el último hecho, el que sigue resaltado y lo que viene, con sus ramas. Antes
// del hito 10 o sin frentes, el camino son los hitos (D-142). La pestaña elegida se recuerda en la vista del proyecto
// (D-145). Se relee solo cuando cambia un documento del proyecto, sin mover la pestaña ni lo desplegado.
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react'
import type { FrenteMapa, MapaProyecto, PasoCamino, TrabajoMapa } from '../../../compartido/puente'
import { usarEstado, vistaDe } from '../../estado'
import { Cabecera } from '../../ui/Cabecera'
import { Icono } from '../../ui/Icono'
import { nombreDoc, useDocsCambian } from './enlaces'

type MapaLeido = Extract<MapaProyecto, { tipo: 'mapa' }>

const HITOS = 'hitos'
const POR_EMPEZAR = 'por-empezar'

const ESTADO_FRENTE: Record<FrenteMapa['estado'], string> = {
  'en curso': 'En curso',
  'en uso': 'En uso',
  'en pausa': 'En pausa',
  'sin empezar': 'Sin empezar',
  otro: '',
}

function useMapa(ruta: string): MapaProyecto | null {
  const [mapa, setMapa] = useState<MapaProyecto | null>(null)
  const leer = useCallback(() => {
    void window.iridium.mapa(ruta).then(setMapa)
  }, [ruta])
  useEffect(leer, [leer])
  useDocsCambian(ruta, leer)
  return mapa
}

export function Mapa({ ruta }: { ruta: string }) {
  const m = useMapa(ruta)
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  const hito = m?.tipo === 'mapa' ? m.hito : null
  const documento = m?.tipo === 'mapa' ? m.documento : null
  return (
    <>
      <Cabecera
        titulo="Mapa"
        sub={hito && `Hito ${hito.numero}${hito.nombre ? ` · ${hito.nombre}` : ''}`}
        acciones={
          documento && (
            <button
              type="button"
              className="boton sin-fondo"
              onClick={() => abrirDoc(ruta, { documento, ancla: '' })}
            >
              <Icono nombre="docs" />
              Abrir {nombreDoc(documento)}
            </button>
          )
        }
      />
      <CuerpoMapa ruta={ruta} m={m} />
    </>
  )
}

function CuerpoMapa({ ruta, m }: { ruta: string; m: MapaProyecto | null }) {
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  if (!m) return <div className="mapa carga" aria-busy="true" />
  if (m.tipo === 'error')
    return (
      <div className="mapa">
        <div className="recuadro error" role="alert">
          <Icono nombre="error" />
          <div className="cuerpo-recuadro">{m.mensaje}</div>
        </div>
      </div>
    )
  if (m.tipo === 'sin-guia')
    return (
      <div className="mapa">
        <div className="recuadro punteado">
          <div className="cuerpo-recuadro">
            <strong>Este proyecto no sigue el framework todavía</strong>
            <p>
              No tiene <code>docs/estado.md</code>, así que no hay hitos para mostrar.
              {m.documentos.length > 0
                ? ' Estos son los documentos que tiene:'
                : ' Tampoco tiene documentos.'}
            </p>
          </div>
        </div>
        {m.documentos.length > 0 && (
          <div className="filas docs-sin-guia">
            {m.documentos.map((d) => (
              <button
                key={d}
                type="button"
                className="fila se-abre"
                onClick={() => abrirDoc(ruta, { documento: d, ancla: '' })}
              >
                <Icono nombre="docs" />
                <span className="principal-fila">
                  <span className="titulo-fila">{nombreDoc(d)}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  return <MapaConCamino ruta={ruta} m={m} />
}

interface Pestana {
  clave: string
  nombre: string
  cuenta?: number
}

function MapaConCamino({ ruta, m }: { ruta: string; m: MapaLeido }) {
  const guardada = usarEstado((s) => vistaDe(s.vistas, ruta).pestanaMapa)
  const cambiarVista = usarEstado((s) => s.cambiarVista)
  const cuenta = m.porEmpezar.frentes.length + m.porEmpezar.sinFrente.length
  const pestanas: Pestana[] = [
    ...(m.hitos ? [{ clave: HITOS, nombre: 'Hitos' }] : []),
    ...m.frentes.map((f) => ({ clave: f.clave, nombre: f.nombre })),
    ...(cuenta > 0 ? [{ clave: POR_EMPEZAR, nombre: 'Por empezar', cuenta }] : []),
  ]
  // La que se dejó; si ya no está, la primera: los hitos antes del 10, si no el frente activo (MA-3).
  const elegida = pestanas.find((p) => p.clave === guardada)?.clave ?? pestanas[0]?.clave ?? HITOS
  const elegir = (clave: string) => cambiarVista(ruta, { pestanaMapa: clave })
  const frente = m.frentes.find((f) => f.clave === elegida)
  return (
    <div className="mapa">
      <div className="mapa-int">
        {pestanas.length > 1 && <BarraFrentes pestanas={pestanas} elegida={elegida} elegir={elegir} />}
        {elegida === POR_EMPEZAR ? (
          <PorEmpezar ruta={ruta} m={m} />
        ) : frente ? (
          <VistaFrente key={frente.clave} ruta={ruta} f={frente} />
        ) : (
          <VistaHitos ruta={ruta} m={m} />
        )}
      </div>
    </div>
  )
}

/** La barra de frentes (MA-3): la pieza Pestañas; con el foco en ella, las flechas pasan de una a otra. */
function BarraFrentes({
  pestanas,
  elegida,
  elegir,
}: {
  pestanas: Pestana[]
  elegida: string
  elegir: (clave: string) => void
}) {
  const barra = useRef<HTMLDivElement>(null)
  // Con muchos frentes la barra se desplaza de costado: la elegida queda a la vista.
  useEffect(() => {
    barra.current
      ?.querySelector<HTMLElement>(`[data-clave="${CSS.escape(elegida)}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [elegida])
  const flechas = (e: KeyboardEvent<HTMLDivElement>) => {
    const paso = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!paso) return
    const i = pestanas.findIndex((p) => p.clave === elegida)
    const otra = pestanas[i + paso]
    if (!otra) return
    e.preventDefault()
    elegir(otra.clave)
    requestAnimationFrame(() => barra.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus())
  }
  return (
    <div
      ref={barra}
      className="pestanas barra-frentes"
      role="tablist"
      aria-label="Frentes"
      onKeyDown={flechas}
    >
      {pestanas.map((p) => (
        <button
          key={p.clave}
          type="button"
          role="tab"
          data-clave={p.clave}
          aria-selected={p.clave === elegida}
          tabIndex={p.clave === elegida ? 0 : -1}
          className={`pestana${p.clave === elegida ? ' elegida' : ''}${p.clave === POR_EMPEZAR ? ' por-empezar' : ''}`}
          onClick={() => elegir(p.clave)}
        >
          {p.nombre}
          {p.cuenta !== undefined && <span className="cuenta">{p.cuenta}</span>}
        </button>
      ))}
    </div>
  )
}

function VistaFrente({ ruta, f }: { ruta: string; f: FrenteMapa }) {
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  const abrirTrabajo = usarEstado((s) => s.abrirTrabajo)
  const todoHecho = f.pasos.length > 0 && !f.pasos.some((p) => p.marca === 'viene' || p.marca === 'otro')
  return (
    <section className="frente-mapa" aria-label={f.nombre}>
      <div className="cab-frente">
        <h3>
          <button
            type="button"
            className="nombre-frente"
            title={`Abrir ${f.documento}`}
            onClick={() => abrirDoc(ruta, { documento: f.documento, ancla: '' })}
          >
            {f.nombre}
          </button>
        </h3>
        <span className={f.estado === 'otro' ? 'estado-frente fuera' : 'estado-frente'}>
          {ESTADO_FRENTE[f.estado] || f.estadoTexto}
        </span>
      </div>
      {f.error && (
        <div className="recuadro error" role="alert">
          <Icono nombre="error" />
          <div className="cuerpo-recuadro">{f.error}</div>
        </div>
      )}
      {f.sinRuta && (
        <p className="gris-mapa">
          Todavía sin ruta: la IA la escribe la próxima vez que trabaje en este frente.
        </p>
      )}
      {!f.error && <Camino ruta={ruta} pasos={f.pasos} pausa={f.estado === 'en pausa'} />}
      {todoHecho && !f.sinRuta && (
        <p className="gris-mapa al-pie">Todo hecho por ahora. Lo que venga, la IA lo suma a la ruta.</p>
      )}
      {f.sinLugar.length > 0 && (
        <section className="bloque aparte-mapa">
          <h3 className="bloque-titulo">
            Aprobado, sin lugar en la ruta <span className="cuenta">{f.sinLugar.length}</span>
          </h3>
          <ListaTrabajo ruta={ruta} items={f.sinLugar} abrir={abrirTrabajo} />
        </section>
      )}
    </section>
  )
}

function VistaHitos({ ruta, m }: { ruta: string; m: MapaLeido }) {
  const sinFrentes = m.frentes.length === 0 && (m.hito?.numero ?? 0) >= 10
  return (
    <section className="frente-mapa" aria-label="Hitos">
      <Camino ruta={ruta} pasos={m.hitos ?? []} pausa={false} />
      {sinFrentes && (
        <p className="gris-mapa al-pie">
          Todavía no hay frentes: la IA abre uno cuando haya algo grande para hacer.
        </p>
      )}
    </section>
  )
}

/** Una lista de trabajo de `trabajo.md`: el título tal cual, que baja de renglón; un clic lo abre en Docs. */
function ListaTrabajo({
  ruta,
  items,
  abrir,
}: {
  ruta: string
  items: (TrabajoMapa & { enCurso?: boolean })[]
  abrir: (ruta: string, codigo: string) => void
}) {
  return (
    <div className="filas lista-mapa">
      {items.map((t) => (
        <button
          key={t.codigo}
          type="button"
          className="fila se-abre"
          title="Abrir en trabajo.md"
          onClick={() => abrir(ruta, t.codigo)}
        >
          <span className="principal-fila">
            <span className="titulo-fila">{t.titulo}</span>
          </span>
          {t.enCurso && <span className="senal blanco">En curso</span>}
        </button>
      ))}
    </div>
  )
}

/** Por empezar (MA-6, MA-7): los frentes que esperan sin carpeta, con su trabajo, y lo aprobado sin frente. */
function PorEmpezar({ ruta, m }: { ruta: string; m: MapaLeido }) {
  const abrirTrabajo = usarEstado((s) => s.abrirTrabajo)
  const citar = usarEstado((s) => s.citar)
  const { frentes, sinFrente } = m.porEmpezar
  return (
    <section className="frente-mapa" aria-label="Por empezar">
      {frentes.map((f) => (
        <section key={f.nombre} className="bloque">
          <h3 className="bloque-titulo">
            {f.nombre}
            <span className="derecha">
              <button
                type="button"
                className="boton sin-fondo chico"
                title="Queda citado en la conversación, sin enviar"
                onClick={() =>
                  citar(ruta, {
                    clave: `frente:${f.nombre}`,
                    tipo: 'Frente',
                    nombre: f.nombre,
                    texto: `Empezá el frente ${f.nombre}`,
                  })
                }
              >
                <Icono nombre="comentar" />
                Empezar este frente
              </button>
            </span>
          </h3>
          {f.pasos.length > 0 ? (
            <ListaTrabajo ruta={ruta} items={f.pasos} abrir={abrirTrabajo} />
          ) : (
            <p className="gris-mapa">Los pasos se escriben al empezarlo.</p>
          )}
        </section>
      ))}
      {sinFrente.length > 0 && (
        <section className="bloque">
          <h3 className="bloque-titulo">
            Sin frente <span className="cuenta">{sinFrente.length}</span>
          </h3>
          <ListaTrabajo ruta={ruta} items={sinFrente} abrir={abrirTrabajo} />
        </section>
      )}
    </section>
  )
}

/**
 * El camino (la pieza Camino, PZ-15): los hechos antes del último, plegados en una línea; el que sigue (el primero
 * que viene) resaltado, o con «Te espera» si nombra una pregunta abierta, o con «En pausa» si el frente lo está.
 */
function Camino({ ruta, pasos, pausa }: { ruta: string; pasos: PasoCamino[]; pausa: boolean }) {
  const [abierto, setAbierto] = useState(false)
  if (pasos.length === 0) return <p className="gris-mapa">Sin pasos todavía.</p>
  const ultimoHecho = pasos.map((p) => p.marca).lastIndexOf('hecho')
  const sigue = pasos.findIndex((p) => p.marca === 'viene')
  const desde = abierto ? 0 : Math.max(0, ultimoHecho)
  const ultimo = pasos.length - 1
  const plegados = pasos.slice(0, desde).filter((p) => p.marca === 'hecho').length
  const conPlegado = desde > 0 || (abierto && ultimoHecho > 0)
  return (
    <div className="camino">
      {conPlegado && (
        <div className="tramo principal hecho plegado">
          <div className="carril abajo">
            <span className="punto-camino" aria-hidden="true">
              {desde > 0 ? '+' : '−'}
            </span>
          </div>
          <div className="texto-tramo">
            <button
              type="button"
              className="nombre-tramo"
              aria-expanded={desde === 0}
              onClick={() => setAbierto(desde > 0)}
            >
              {desde > 0
                ? `${plegados} ${plegados === 1 ? 'hecho' : 'hechos'} antes`
                : 'Plegar los hechos de antes'}
            </button>
          </div>
        </div>
      )}
      {pasos.map((p, i) => {
        if (i < desde) return null
        const lineas = `${i > desde || conPlegado ? 'arriba' : ''} ${i < ultimo ? 'abajo' : ''}`
        return (
          <TramoConRamas
            // biome-ignore lint/suspicious/noArrayIndexKey: dos pasos pueden decir lo mismo; el orden es el de la ruta.
            key={`${i}-${p.texto}`}
            ruta={ruta}
            p={p}
            foco={i === sigue}
            pausa={pausa}
            lineas={lineas}
            sigue={i < ultimo}
          />
        )
      })}
    </div>
  )
}

function TramoConRamas({
  ruta,
  p,
  foco,
  pausa,
  lineas,
  sigue,
}: {
  ruta: string
  p: PasoCamino
  foco: boolean
  pausa: boolean
  lineas: string
  sigue: boolean
}) {
  return (
    <>
      <Tramo ruta={ruta} p={p} foco={foco} pausa={pausa} carriles={[lineas]} />
      {p.ramas.map((r, j) => (
        <Tramo
          // biome-ignore lint/suspicious/noArrayIndexKey: las ramas no tienen otra clave que su lugar.
          key={j}
          ruta={ruta}
          p={r}
          foco={false}
          pausa={false}
          carriles={[
            sigue ? 'sigue' : '',
            `${j === 0 ? 'codo' : 'arriba'} ${j < p.ramas.length - 1 ? 'abajo' : ''}`,
          ]}
        />
      ))}
    </>
  )
}

/** Un paso del camino: uno o dos carriles (la rama lleva el del camino y el suyo), el nombre y su señal. */
function Tramo({
  ruta,
  p,
  foco,
  pausa,
  carriles,
}: {
  ruta: string
  p: PasoCamino
  foco: boolean
  pausa: boolean
  carriles: string[]
}) {
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  const responderEn = usarEstado((s) => s.responderEn)
  const viene = p.marca === 'viene'
  const espera = viene && p.espera !== null
  const enPausa = foco && pausa && !espera
  const clase = !viene ? p.marca : espera ? 'espera' : enPausa ? 'pausa' : foco ? 'foco' : ''
  const rama = carriles.length > 1
  const destino = p.destino
  const titulo =
    p.marca === 'otro' ? 'Iridium no entiende esta línea de la ruta: se muestra tal cual' : undefined
  return (
    <div
      className={`tramo ${rama ? 'rama' : 'principal'} ${clase}`.trim()}
      aria-current={foco ? 'step' : undefined}
    >
      {carriles.map((c, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: el primer carril es el del camino, el segundo el de la rama.
        <div key={i} className={`carril ${c}`.trim()}>
          {i === carriles.length - 1 && <span className="punto-camino" aria-hidden="true" />}
        </div>
      ))}
      <div className="texto-tramo">
        {destino ? (
          <button
            type="button"
            className="nombre-tramo"
            title="Abrir su sección en Docs"
            onClick={() => abrirDoc(ruta, destino)}
          >
            {p.texto}
          </button>
        ) : (
          <span className="nombre-tramo" title={titulo}>
            {p.texto}
          </span>
        )}
        {espera && (
          <button
            type="button"
            className="senal ambar"
            title={`Responder ${p.espera} en la Bandeja`}
            onClick={() => responderEn(ruta)}
          >
            Te espera
          </button>
        )}
        {enPausa && <span className="senal ambar">En pausa</span>}
      </div>
    </div>
  )
}

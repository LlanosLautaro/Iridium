// Frentes (antes el Mapa; D-141, D-144, D-180, D-181; `modulos/frentes/ux.md` › Parte 2): qué se va a hacer y en qué
// orden, frente por frente. A la izquierda una tarjeta por frente (el nombre, lo que sigue, el robot si la IA avanza sola
// y las preguntas que te esperan), el Núcleo, «Por empezar» y los archivados; al centro, el frente elegido: su
// interruptor, sus preguntas y su camino (la pieza Camino, PZ-15) con el código, el tamaño y «sola» de cada paso. Antes
// del hito 10 o sin frentes, el camino son los hitos (D-142). La tarjeta elegida se recuerda en la vista del proyecto
// (D-145). Se relee solo cuando cambia un documento del proyecto, sin mover la elegida ni lo desplegado. Los frentes en
// uso sin nada por hacer se archivan: no están en la columna salvo con «Archivados» prendido, y ahí van en gris (D-152).
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react'
import type {
  FrenteMapa,
  MapaProyecto,
  PasoCamino,
  PreguntaMapa,
  TrabajoMapa,
} from '../../../compartido/puente'
import { usarEstado, vistaDe } from '../../estado'
import { Cabecera } from '../../ui/Cabecera'
import { Icono } from '../../ui/Icono'
import { nombreDoc, useDocsCambian } from './enlaces'
import { enOrden, queSigue } from './frentes'

type MapaLeido = Extract<MapaProyecto, { tipo: 'mapa' }>

const HITOS = 'hitos'
const NUCLEO = 'nucleo'
/** La clave de un frente por empezar: no tiene carpeta, va por su nombre. */
const EMPEZAR = 'empezar:'

const ESTADO_FRENTE: Record<FrenteMapa['estado'], string> = {
  'en curso': 'En curso',
  'en uso': 'En uso',
  'en pausa': 'En pausa',
  'sin empezar': 'Sin empezar',
  otro: '',
}

/** En uso, sin nada que venga en la ruta ni trabajo aprobado sin lugar: no tiene nada por hacer (R-91, D-152). */
export function archivado(f: FrenteMapa): boolean {
  return (
    f.estado === 'en uso' &&
    !f.error &&
    f.sinLugar.length === 0 &&
    !f.pasos.some((p) => p.marca === 'viene' || p.marca === 'otro')
  )
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
  const archivados = m?.tipo === 'mapa' ? m.frentes.filter(archivado).length : 0
  return (
    <>
      <Cabecera
        titulo="Frentes"
        sub={hito && `Hito ${hito.numero}${hito.nombre ? ` · ${hito.nombre}` : ''}`}
        acciones={
          <>
            {archivados > 0 && <InterruptorArchivados ruta={ruta} cuenta={archivados} />}
            {documento && (
              <button
                type="button"
                className="boton sin-fondo"
                onClick={() => abrirDoc(ruta, { documento, ancla: '' })}
              >
                <Icono nombre="docs" />
                Abrir {nombreDoc(documento)}
              </button>
            )}
          </>
        }
      />
      <CuerpoMapa ruta={ruta} m={m} />
    </>
  )
}

/** Arriba a la derecha: muestra u oculta los frentes archivados; se recuerda en la vista del proyecto. */
function InterruptorArchivados({ ruta, cuenta }: { ruta: string; cuenta: number }) {
  const ver = usarEstado((s) => vistaDe(s.vistas, ruta).mapaArchivados)
  const cambiarVista = usarEstado((s) => s.cambiarVista)
  return (
    <label className="interruptor" title="Los frentes en uso sin nada por hacer">
      <input
        type="checkbox"
        role="switch"
        aria-checked={ver}
        checked={ver}
        onChange={(e) => cambiarVista(ruta, { mapaArchivados: e.target.checked })}
      />
      Archivados <span className="cuenta">{cuenta}</span>
    </label>
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

/** Una tarjeta de la columna (FS-6): el nombre, debajo lo que sigue; a la derecha el robot o «apagada» y las preguntas. */
interface Tarjeta {
  clave: string
  nombre: string
  detalle: string
  preguntas: number
  avance: 'sola' | 'apagada' | null
  grupo: 'activos' | 'empezar' | 'archivados'
}

function detalleDe(f: FrenteMapa): string {
  if (f.error) return 'No se puede leer'
  return queSigue(f.pasos)?.texto ?? 'Todo hecho'
}

/** Si el avance solo va a tomar algo de este frente: prendido en Ajustes, en el proyecto y en el frente, con un paso `sola`. */
function useAvance(ruta: string): (f: FrenteMapa) => Tarjeta['avance'] {
  const ajuste = usarEstado((s) => s.preferencias.avanceSolo)
  const apagados = usarEstado((s) => s.preferencias.avanceApagado)
  return (f) => {
    if (f.estado === 'en uso' || f.error) return null
    if (apagados.frentes.some((x) => x.ruta === ruta && x.carpeta === f.clave)) return 'apagada'
    if (!ajuste.prendido || apagados.proyectos.includes(ruta)) return null
    return enOrden(f.pasos).some((p) => p.marca === 'viene' && p.espera === null && p.marcas?.sola)
      ? 'sola'
      : null
  }
}

/** El que cambió último, arriba (FS-6); a la misma fecha, el orden del Mapa (el frente en curso primero). */
const porFecha = (a: FrenteMapa, b: FrenteMapa) => (b.actualizado ?? '').localeCompare(a.actualizado ?? '')

function MapaConCamino({ ruta, m }: { ruta: string; m: MapaLeido }) {
  const guardada = usarEstado((s) => vistaDe(s.vistas, ruta).pestanaMapa)
  const verArchivados = usarEstado((s) => vistaDe(s.vistas, ruta).mapaArchivados)
  const cambiarVista = usarEstado((s) => s.cambiarVista)
  const avance = useAvance(ruta)
  const activos = m.frentes.filter((f) => !archivado(f)).sort(porFecha)
  const archivados = verArchivados ? m.frentes.filter(archivado) : []
  const { sinFrente } = m.porEmpezar
  const deFrente = (f: FrenteMapa, grupo: Tarjeta['grupo']): Tarjeta => ({
    clave: f.clave,
    nombre: f.nombre,
    detalle: detalleDe(f),
    preguntas: f.preguntas.length,
    avance: grupo === 'activos' ? avance(f) : null,
    grupo,
  })
  // El Núcleo, solo con frentes: sin ellos el camino son los hitos y las preguntas están en la Bandeja.
  const nucleo: Tarjeta[] =
    m.frentes.length > 0 && (sinFrente.length > 0 || m.nucleo.length > 0)
      ? [
          {
            clave: NUCLEO,
            nombre: 'Núcleo',
            detalle: (sinFrente.find((t) => t.enCurso) ?? sinFrente[0])?.titulo ?? 'Nada aprobado sin frente',
            preguntas: m.nucleo.length,
            avance: null,
            grupo: 'activos',
          },
        ]
      : []
  const deActivos = activos.map((f) => deFrente(f, 'activos'))
  const tarjetas: Tarjeta[] = [
    ...(m.hitos
      ? [
          {
            clave: HITOS,
            nombre: 'Hitos',
            detalle: queSigue(m.hitos)?.texto ?? 'Todo hecho',
            preguntas: 0,
            avance: null,
            grupo: 'activos' as const,
          },
        ]
      : []),
    // El Núcleo, debajo del frente que cambió último (D-181).
    ...deActivos.slice(0, 1),
    ...nucleo,
    ...deActivos.slice(1),
    ...m.porEmpezar.frentes.map((f) => ({
      clave: `${EMPEZAR}${f.nombre}`,
      nombre: f.nombre,
      detalle: `${f.pasos.length} ${f.pasos.length === 1 ? 'aprobado' : 'aprobados'}`,
      preguntas: f.preguntas.length,
      avance: null,
      grupo: 'empezar' as const,
    })),
    ...archivados.map((f) => deFrente(f, 'archivados')),
  ]
  // La que se dejó; si ya no está, la primera: los hitos antes del 10, si no el frente que cambió último (MA-3).
  const elegida = tarjetas.find((t) => t.clave === guardada)?.clave ?? tarjetas[0]?.clave ?? HITOS
  const elegir = (clave: string) => cambiarVista(ruta, { pestanaMapa: clave })
  const frente = m.frentes.find((f) => f.clave === elegida && tarjetas.some((t) => t.clave === f.clave))
  const empezar = m.porEmpezar.frentes.find((f) => `${EMPEZAR}${f.nombre}` === elegida)
  const todosArchivados = !m.hitos && m.frentes.length > 0 && tarjetas.length === 0
  const soloHitos = tarjetas.length <= 1 && !!m.hitos
  const centro = todosArchivados ? (
    <p className="gris-mapa">
      Todos los frentes están archivados: ninguno tiene nada por hacer. Activa «Archivados» para verlos.
    </p>
  ) : elegida === NUCLEO ? (
    <VistaNucleo ruta={ruta} m={m} />
  ) : empezar ? (
    <PorEmpezar key={empezar.nombre} ruta={ruta} f={empezar} />
  ) : frente ? (
    <VistaFrente key={frente.clave} ruta={ruta} f={frente} />
  ) : (
    <VistaHitos ruta={ruta} m={m} />
  )
  if (soloHitos || todosArchivados)
    return (
      <div className="mapa">
        <div className="mapa-int">{centro}</div>
      </div>
    )
  return (
    <div className="tablero-frentes">
      <ColumnaFrentes tarjetas={tarjetas} elegida={elegida} elegir={elegir} />
      <div className="centro-frentes">
        <div className="mapa-int">{centro}</div>
      </div>
    </div>
  )
}

/**
 * La columna de tarjetas (FS-6): una pestaña por frente, con las flechas para pasar de una a otra; debajo, «Por
 * empezar» y los archivados. Con la sección angosta pasa a ser una barra arriba, solo con los nombres.
 */
function ColumnaFrentes({
  tarjetas,
  elegida,
  elegir,
}: {
  tarjetas: Tarjeta[]
  elegida: string
  elegir: (clave: string) => void
}) {
  const col = useRef<HTMLDivElement>(null)
  useEffect(() => {
    col.current
      ?.querySelector<HTMLElement>(`[data-clave="${CSS.escape(elegida)}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [elegida])
  const flechas = (e: KeyboardEvent<HTMLDivElement>) => {
    const paso =
      e.key === 'ArrowDown' || e.key === 'ArrowRight'
        ? 1
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft'
          ? -1
          : 0
    if (!paso) return
    const i = tarjetas.findIndex((t) => t.clave === elegida)
    const otra = tarjetas[i + paso]
    if (!otra) return
    e.preventDefault()
    elegir(otra.clave)
    requestAnimationFrame(() => col.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus())
  }
  const grupo = (g: Tarjeta['grupo']) => tarjetas.filter((t) => t.grupo === g)
  const lista = (ts: Tarjeta[]) =>
    ts.map((t) => (
      <button
        key={t.clave}
        type="button"
        role="tab"
        data-clave={t.clave}
        aria-label={t.nombre}
        aria-selected={t.clave === elegida}
        tabIndex={t.clave === elegida ? 0 : -1}
        title={t.detalle}
        className={`fila con-detalle tarjeta-frente${t.clave === elegida ? ' elegida' : ''}${t.grupo === 'archivados' ? ' archivado' : ''}`}
        onClick={() => elegir(t.clave)}
      >
        <span className="principal-fila">
          <span className="titulo-fila">{t.nombre}</span>
          <span className="detalle">{t.detalle}</span>
        </span>
        {(t.avance || t.preguntas > 0) && (
          <span className="marcas-tarjeta">
            {t.avance === 'sola' && (
              <span className="senal" title="La IA avanza sola en este frente">
                <Icono nombre="robot" />
              </span>
            )}
            {t.avance === 'apagada' && <span className="senal">apagada</span>}
            {t.preguntas > 0 && (
              <span
                className="cuenta frena"
                title={`${t.preguntas} ${t.preguntas === 1 ? 'pregunta te espera' : 'preguntas te esperan'}`}
              >
                {t.preguntas}
              </span>
            )}
          </span>
        )}
      </button>
    ))
  const empezar = grupo('empezar')
  const archivados = grupo('archivados')
  return (
    <div
      ref={col}
      className="columna-frentes"
      role="tablist"
      aria-label="Frentes"
      aria-orientation="vertical"
      onKeyDown={flechas}
    >
      <div className="filas lista-frentes">{lista(grupo('activos'))}</div>
      {empezar.length > 0 && (
        <section className="bloque grupo-frentes">
          <h2 className="bloque-titulo">
            Por empezar <span className="cuenta">{empezar.length}</span>
          </h2>
          <div className="filas lista-frentes">{lista(empezar)}</div>
        </section>
      )}
      {archivados.length > 0 && (
        <section className="bloque grupo-frentes">
          <h2 className="bloque-titulo">
            Archivados <span className="cuenta">{archivados.length}</span>
          </h2>
          <div className="filas lista-frentes">{lista(archivados)}</div>
        </section>
      )}
    </div>
  )
}

/** «Te esperan N» (FS-7): las preguntas abiertas del frente, arriba del camino; un clic lleva a la Bandeja. */
function PreguntasFrente({ ruta, preguntas }: { ruta: string; preguntas: PreguntaMapa[] }) {
  const responderEn = usarEstado((s) => s.responderEn)
  if (preguntas.length === 0) return null
  return (
    <section className="bloque preguntas-frente">
      <h3 className="bloque-titulo">
        Te {preguntas.length === 1 ? 'espera' : 'esperan'}{' '}
        <span className="cuenta frena">{preguntas.length}</span>
      </h3>
      <div className="filas">
        {preguntas.map((q) => (
          <button
            key={q.codigo}
            type="button"
            className="fila se-abre"
            title={`Responder ${q.codigo} en la Bandeja`}
            onClick={() => responderEn(ruta)}
          >
            <span className="codigo">{q.codigo}</span>
            <span className="principal-fila">
              <span className="titulo-fila">{q.titulo}</span>
            </span>
            <span className="meta">{q.tipo}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function VistaFrente({ ruta, f }: { ruta: string; f: FrenteMapa }) {
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  const abrirTrabajo = usarEstado((s) => s.abrirTrabajo)
  const todoHecho = f.pasos.length > 0 && !f.pasos.some((p) => p.marca === 'viene' || p.marca === 'otro')
  return (
    <section className="frente-mapa" aria-label={f.nombre}>
      <div className="cab-frente">
        <h2>
          <button
            type="button"
            className="nombre-frente"
            title={`Abrir ${f.documento}`}
            onClick={() => abrirDoc(ruta, { documento: f.documento, ancla: '' })}
          >
            {f.nombre}
          </button>
        </h2>
        <span className={f.estado === 'otro' ? 'estado-frente fuera' : 'estado-frente'}>
          {archivado(f) ? 'Archivado' : ESTADO_FRENTE[f.estado] || f.estadoTexto}
        </span>
        {f.estado !== 'en uso' && <InterruptorAvance ruta={ruta} carpeta={f.clave} />}
      </div>
      <PreguntasFrente ruta={ruta} preguntas={f.preguntas} />
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

/** Si la IA puede seguir sola los pasos marcados de este frente (Frentes, FS-3); prendido de entrada. */
function InterruptorAvance({ ruta, carpeta }: { ruta: string; carpeta: string }) {
  const apagados = usarEstado((s) => s.preferencias.avanceApagado)
  const guardar = usarEstado((s) => s.guardarPreferencias)
  const prendido = !apagados.frentes.some((x) => x.ruta === ruta && x.carpeta === carpeta)
  return (
    <label className="interruptor avance-frente" title="Si la IA puede seguir sola los pasos marcados «sola»">
      <input
        type="checkbox"
        role="switch"
        aria-checked={prendido}
        checked={prendido}
        onChange={(e) => {
          const otros = apagados.frentes.filter((x) => !(x.ruta === ruta && x.carpeta === carpeta))
          guardar({
            avanceApagado: {
              ...apagados,
              frentes: e.target.checked ? otros : [...otros, { ruta, carpeta }],
            },
          })
        }}
      />
      {prendido ? 'Avanza sola' : 'No avanza sola'}
    </label>
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

/** Una lista de trabajo de `trabajo.md`: el código y el título tal cual, que baja de renglón; un clic lo abre en Docs. */
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
          <span className="codigo">{t.codigo}</span>
          <span className="principal-fila">
            <span className="titulo-fila">{t.titulo}</span>
          </span>
          {t.enCurso && <span className="senal blanco">En curso</span>}
        </button>
      ))}
    </div>
  )
}

/** El Núcleo (FS-8): lo que no es de ningún frente, con las preguntas sin frente y lo aprobado sin frente. */
function VistaNucleo({ ruta, m }: { ruta: string; m: MapaLeido }) {
  const abrirTrabajo = usarEstado((s) => s.abrirTrabajo)
  const { sinFrente } = m.porEmpezar
  return (
    <section className="frente-mapa" aria-label="Núcleo">
      <div className="cab-frente">
        <h2>Núcleo</h2>
        <span className="estado-frente">Lo que no es de ningún frente</span>
      </div>
      <PreguntasFrente ruta={ruta} preguntas={m.nucleo} />
      {sinFrente.length > 0 ? (
        <section className="bloque">
          <h3 className="bloque-titulo">
            Aprobado <span className="cuenta">{sinFrente.length}</span>
          </h3>
          <ListaTrabajo ruta={ruta} items={sinFrente} abrir={abrirTrabajo} />
        </section>
      ) : (
        <p className="gris-mapa">Nada aprobado sin frente.</p>
      )}
    </section>
  )
}

/** Un frente por empezar (FS-8): lo aprobado para él y «Empezar este frente»; la ruta la escribe la IA al empezarlo. */
function PorEmpezar({ ruta, f }: { ruta: string; f: MapaLeido['porEmpezar']['frentes'][number] }) {
  const abrirTrabajo = usarEstado((s) => s.abrirTrabajo)
  const citar = usarEstado((s) => s.citar)
  return (
    <section className="frente-mapa" aria-label={f.nombre}>
      <div className="cab-frente">
        <h2>{f.nombre}</h2>
        <span className="estado-frente">Por empezar</span>
        <button
          type="button"
          className="boton sin-fondo chico empezar-frente"
          title="Queda citado en la conversación, sin enviar"
          onClick={() =>
            citar(ruta, {
              clave: `frente:${f.nombre}`,
              tipo: 'Frente',
              nombre: f.nombre,
              texto: `Empieza el frente ${f.nombre}`,
            })
          }
        >
          <Icono nombre="comentar" />
          Empezar este frente
        </button>
      </div>
      <PreguntasFrente ruta={ruta} preguntas={f.preguntas} />
      {f.pasos.length > 0 ? (
        <section className="bloque">
          <h3 className="bloque-titulo">
            Aprobado <span className="cuenta">{f.pasos.length}</span>
          </h3>
          <ListaTrabajo ruta={ruta} items={f.pasos} abrir={abrirTrabajo} />
        </section>
      ) : (
        <p className="gris-mapa">Los pasos se escriben al empezarlo.</p>
      )}
    </section>
  )
}

/**
 * El camino (la pieza Camino, PZ-15): los hechos antes del último, plegados en una línea; el que sigue resaltado (el
 * mismo que dice su tarjeta: el primero que la IA puede hacer, camino o rama; D-181), o con «En pausa» si el frente lo
 * está; el que nombra una pregunta abierta, con «Te espera».
 */
function Camino({ ruta, pasos, pausa }: { ruta: string; pasos: PasoCamino[]; pausa: boolean }) {
  const [abierto, setAbierto] = useState(false)
  if (pasos.length === 0) return <p className="gris-mapa">Sin pasos todavía.</p>
  const ultimoHecho = pasos.map((p) => p.marca).lastIndexOf('hecho')
  const foco = queSigue(pasos)
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
            foco={foco}
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
  foco: PasoCamino | null
  pausa: boolean
  lineas: string
  sigue: boolean
}) {
  return (
    <>
      <Tramo ruta={ruta} p={p} foco={p === foco} pausa={pausa} carriles={[lineas]} />
      {p.ramas.map((r, j) => (
        <Tramo
          // biome-ignore lint/suspicious/noArrayIndexKey: las ramas no tienen otra clave que su lugar.
          key={j}
          ruta={ruta}
          p={r}
          foco={r === foco}
          pausa={pausa}
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
        {(p.codigo || (viene && (p.marcas || espera || enPausa))) && (
          <span className="pie-paso">
            {p.codigo && <span className="codigo">{p.codigo}</span>}
            {viene && !espera && p.marcas?.tamano && <span title="Cuánto cuesta">{p.marcas.tamano}</span>}
            {espera ? (
              <button
                type="button"
                className="senal ambar"
                title={`Responder ${p.espera} en la Bandeja`}
                onClick={() => responderEn(ruta)}
              >
                Te espera · {p.espera}
              </button>
            ) : enPausa ? (
              <span className="senal ambar">En pausa</span>
            ) : (
              viene &&
              p.marcas?.sola && (
                <span className="senal" title="La IA lo puede hacer sola">
                  <Icono nombre="robot" />
                  sola
                </span>
              )
            )}
          </span>
        )}
      </div>
    </div>
  )
}

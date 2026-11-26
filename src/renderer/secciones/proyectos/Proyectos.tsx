// Proyectos (H-1, 04-ux.md › W-2): los proyectos en una grilla, con su hito y lo que esperan del usuario. Ideas y
// Skills están en la carpeta Iridium, aparte (D-083). A la derecha, el chat general (D-060): la conversación de la
// carpeta Ideas, para ideas sueltas, proyectos nuevos y lo que toca a varios. Arriba, Nuevo proyecto; en cada tarjeta, el
// menú del clic derecho (R-7).
import { type CSSProperties, type ReactNode, useCallback, useState } from 'react'
import type { ListaProyectos, TarjetaProyecto } from '../../../compartido/puente'
import { fichaDe, usarEstado } from '../../estado'
import { Cabecera } from '../../ui/Cabecera'
import { Divisor, useAnchoConversacion } from '../../ui/Divisor'
import { Icono } from '../../ui/Icono'
import { type Punto, puntoDelMenu } from '../../ui/MenuContextual'
import { ChatGeneral } from '../inicio/ChatGeneral'
import { EliminarProyecto } from './EliminarProyecto'
import { type AvisoGrilla, MenuTarjeta } from './MenuTarjeta'
import { NuevoProyecto } from './NuevoProyecto'
import { Tarjeta } from './Tarjeta'

/**
 * La mudanza (D-083, D-087): Ideas y Skills siguen donde estaban antes (en otra carpeta de Iridium). Mover las lleva a `.iridium`, después de confirmarlo.
 */
function Mudanza({ lista }: { lista: ListaProyectos }) {
  const ponerLista = usarEstado((s) => s.ponerLista)
  const ponerPreferencias = usarEstado((s) => s.ponerPreferencias)
  const [moviendo, setMoviendo] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)
  const { mudanza, carpeta } = lista.iridium
  if (!mudanza)
    return resultado ? (
      <p className="recuadro mudar" role="status">
        {resultado}
      </p>
    ) : null
  const nombres = [mudanza.ideas, mudanza.skills].filter((r) => r !== null).map((r) => r.split(/[\\/]/).pop())
  const mover = async () => {
    setMoviendo(true)
    setResultado(null)
    try {
      const r = await window.iridium.mudar()
      if (r.tipo === 'ok') {
        ponerLista(r.lista)
        // Las pestañas y el proyecto abierto cambiaron de ruta.
        ponerPreferencias(await window.iridium.leerPreferencias())
        setResultado(['Listo: se movieron a la carpeta de Iridium.', ...r.avisos].join(' '))
      } else if (r.tipo === 'error') setResultado(r.mensaje)
    } finally {
      setMoviendo(false)
    }
  }
  return (
    <div className="recuadro aviso mudar" role="status">
      <Icono nombre="carpeta" />
      <div className="cuerpo-recuadro">
        <span>
          <strong>{nombres.join(' y ')}</strong> {nombres.length > 1 ? 'siguen' : 'sigue'} donde{' '}
          {nombres.length > 1 ? 'estaban' : 'estaba'} antes. Iridium ahora{' '}
          {nombres.length > 1 ? 'las guarda' : 'la guarda'} en la carpeta de Iridium, dentro de tus proyectos:{' '}
          <span className="fija">{carpeta}</span>.
        </span>
        {resultado && <span className="senal rojo">{resultado}</span>}
        <span className="acciones-recuadro">
          <button type="button" className="boton secundario chico" onClick={mover} disabled={moviendo}>
            {moviendo ? 'Moviendo…' : 'Mover'}
          </button>
        </span>
      </div>
    </div>
  )
}

function Siluetas() {
  const silueta = (i: number) => (
    <div key={i} className="tarjeta silueta">
      <div className="cab-t">
        <span className="logo" />
        <div className="nombre-t">
          <span className="barra-s" style={{ width: '60%' }} />
          <span className="barra-s" style={{ width: '35%' }} />
        </div>
      </div>
      <div className="desc">
        <span className="barra-s" />
        <span className="barra-s" style={{ width: '75%' }} />
      </div>
    </div>
  )
  return (
    <div className="grilla carga" role="status" aria-busy="true" aria-label="Cargando proyectos">
      {Array.from({ length: 9 }, (_, i) => silueta(i))}
    </div>
  )
}

export function Proyectos() {
  const lista = usarEstado((s) => s.lista)
  const verArchivados = usarEstado((s) => s.preferencias.verArchivados)
  const guardarPreferencias = usarEstado((s) => s.guardarPreferencias)
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  const verFramework = usarEstado((s) => s.verFramework)
  const fichas = usarEstado((s) => s.fichas)
  const ponerLista = usarEstado((s) => s.ponerLista)
  const [eligiendo, setEligiendo] = useState(false)
  const [menu, setMenu] = useState<{ p: TarjetaProyecto; en: Punto } | null>(null)
  const [aviso, setAviso] = useState<AvisoGrilla | null>(null)
  const [nuevo, setNuevo] = useState(false)
  const [eliminando, setEliminando] = useState<TarjetaProyecto | null>(null)
  const cerrarEliminar = useCallback(() => setEliminando(null), [])
  const cerrarMenu = useCallback(() => setMenu(null), [])
  const cerrarNuevo = useCallback(() => setNuevo(false), [])
  const creado = async (ruta: string) => {
    setNuevo(false)
    setAviso(null)
    ponerLista(await window.iridium.listarProyectos())
    abrirProyecto(ruta)
  }

  const elegirCarpeta = async () => {
    setEligiendo(true)
    try {
      const nueva = await window.iridium.elegirCarpeta()
      if (nueva) ponerLista(nueva)
    } finally {
      setEligiendo(false)
    }
  }
  const reintentar = async () => ponerLista(await window.iridium.listarProyectos())

  const proyectos = lista?.tipo === 'lista' ? lista.proyectos : []
  const archivados = proyectos.filter((p) => p.archivado).length
  const visibles = verArchivados ? proyectos : proyectos.filter((p) => !p.archivado)
  const conGrilla = lista?.tipo === 'lista' && proyectos.length > 0

  let contenido: ReactNode
  if (lista === null) contenido = <Siluetas />
  else if (lista.tipo === 'error') {
    contenido = (
      <div className="mensaje error" role="alert">
        <span className="senal rojo">
          <Icono nombre="error" />
          No se puede leer
        </span>
        <h2>No encuentro la carpeta de proyectos</h2>
        <span className="ruta">{lista.raiz}</span>
        <p>Puede que el disco no esté conectado o que la carpeta se haya movido.</p>
        <div className="acc">
          <button type="button" className="boton principal" onClick={elegirCarpeta} disabled={eligiendo}>
            <Icono nombre="carpeta" />
            Elegir la carpeta
          </button>
          <button type="button" className="boton secundario" onClick={reintentar}>
            <Icono nombre="reintentar" />
            Reintentar
          </button>
        </div>
      </div>
    )
  } else if (proyectos.length === 0) {
    contenido = (
      <div className="mensaje" role="status">
        <h2>Esta carpeta no tiene proyectos</h2>
        <p>Iridium busca proyectos en las carpetas que están dentro de:</p>
        <span className="ruta">{lista.raiz}</span>
        <p>Crea un proyecto nuevo ahí o elige otra carpeta de proyectos.</p>
        <div className="acc">
          <button type="button" className="boton principal" onClick={() => setNuevo(true)}>
            <Icono nombre="mas" />
            Nuevo proyecto
          </button>
          <button type="button" className="boton secundario" onClick={elegirCarpeta} disabled={eligiendo}>
            <Icono nombre="carpeta" />
            Elegir otra carpeta
          </button>
        </div>
      </div>
    )
  } else {
    contenido = (
      <div className="grilla">
        {visibles.map((p) => (
          <Tarjeta
            key={p.ruta}
            p={p}
            ficha={fichaDe(fichas, p.ruta)}
            abrir={() => abrirProyecto(p.ruta)}
            verAvisos={() => verFramework(p.ruta)}
            menu={(e) => {
              e.preventDefault()
              setMenu({ p, en: puntoDelMenu(e) })
            }}
          />
        ))}
      </div>
    )
  }

  const ancho = useAnchoConversacion('general')
  return (
    <main className="trabajo proyecto" style={{ '--ancho-chat': `${ancho}px` } as CSSProperties}>
      <section className="zona-principal grilla-proyectos" aria-label="Proyectos">
        <Cabecera
          nivel={1}
          titulo="Proyectos"
          cuenta={
            conGrilla && (
              <span className="cuenta" title="Proyectos sin archivar">
                {proyectos.length - archivados}
              </span>
            )
          }
          sub={lista && <span title={lista.raiz}>{lista.raiz}</span>}
          acciones={
            lista?.tipo === 'lista' && (
              <>
                {conGrilla && (
                  <label className="interruptor" title="Mostrar los archivados al final, más tenues">
                    <input
                      type="checkbox"
                      role="switch"
                      aria-checked={verArchivados}
                      checked={verArchivados}
                      onChange={(e) => guardarPreferencias({ verArchivados: e.target.checked })}
                    />
                    Archivados <span className="cuenta">{archivados}</span>
                  </label>
                )}
                <button type="button" className="boton principal" onClick={() => setNuevo(true)}>
                  <Icono nombre="mas" />
                  Nuevo proyecto
                </button>
              </>
            )
          }
        />
        <div className="lienzo">
          <div className="arriba-grilla">
            {lista && <Mudanza lista={lista} />}
            {aviso && (
              <div
                className={aviso.error ? 'recuadro error aviso-accion' : 'recuadro aviso-accion'}
                role={aviso.error ? 'alert' : 'status'}
              >
                <Icono nombre={aviso.error ? 'error' : 'check'} />
                <div className="cuerpo-recuadro">
                  <span>{aviso.texto}</span>
                </div>
                <button
                  type="button"
                  className="boton solo-icono chico"
                  aria-label="Cerrar el aviso"
                  onClick={() => setAviso(null)}
                >
                  <Icono nombre="x" />
                </button>
              </div>
            )}
          </div>
          {contenido}
        </div>
        {menu && (
          <MenuTarjeta
            p={menu.p}
            en={menu.en}
            cerrar={cerrarMenu}
            abrir={() => abrirProyecto(menu.p.ruta)}
            ponerLista={ponerLista}
            avisar={setAviso}
            eliminar={() => setEliminando(menu.p)}
          />
        )}
        {eliminando && (
          <EliminarProyecto
            p={eliminando}
            cerrar={cerrarEliminar}
            listo={(lista) => {
              ponerLista(lista)
              setAviso({ texto: `«${eliminando.nombre}» está en la papelera de Windows.`, error: false })
              setEliminando(null)
            }}
          />
        )}
        {nuevo && <NuevoProyecto cerrar={cerrarNuevo} listo={(r) => void creado(r)} />}
      </section>
      <Divisor vista="general" ancho={ancho} />
      <aside className="chat" aria-label="Chat general">
        <ChatGeneral />
      </aside>
    </main>
  )
}

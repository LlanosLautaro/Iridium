// Ideas de un proyecto (frente Ideas, D-128 a D-130; `modulos/ideas/ux.md` › W-10; la maqueta
// `docs/diseno/pantallas/ideas-proyecto-c.html`): las ideas y los enlaces para revisar, que son `T-n` de `trabajo.md`
// con `Idea:`. Arriba se anota; cada idea se abre en su lugar (la Fila que se abre, PZ-13) y se aprueba o se rechaza.
// Lo que no se pudo guardar no se pierde: queda escrito y copiado, con el Recuadro de error arriba (ID-11).
// Revisar con la IA y Hablar de esta idea quedan citados en la conversación de al lado, sin enviar (ID-4, ID-6, Q-182);
// en cada renglón, con el botón de enviar (R-75, R-77). La nota de una idea abierta es una hoja como la del bloc, con
// enlaces e imágenes (`NotaDeIdea`, ID-I3); Borrar pide confirmar en el cuadro del centro (ID-8, PZ-8; Q-189).
import { type KeyboardEvent, type MouseEvent, useCallback, useEffect, useRef, useState } from 'react'
import { diaCorto } from '../../../compartido/fechas'
import {
  bloquesDeIdea,
  citaHablar,
  citaRevisar,
  contarPorFiltro,
  type EstadoDesdeIdeas,
  entraEnFiltro,
  escritoDeIdea,
  FILTROS_IDEAS,
  type FiltroIdeas,
  type IdeasDeProyecto,
  type IdeaVista,
} from '../../../compartido/ideas'
import { tarjetaDe, usarEstado } from '../../estado'
import { Cabecera, Filtros } from '../../ui/Cabecera'
import { guardarLuego, noGuardar } from '../../ui/guardarLuego'
import { Icono } from '../../ui/Icono'
import { MenuContextual, type Punto, puntoDelMenu } from '../../ui/MenuContextual'
import { useDocsCambian } from './enlaces'
import { NotaDeIdea } from './NotaDeIdea'

const NOMBRES: Record<FiltroIdeas, string> = {
  todo: 'Todo',
  'para-revisar': 'Para revisar',
  'sin-evaluar': 'Sin evaluar',
  aprobadas: 'Aprobadas',
  rechazadas: 'Rechazadas',
  hechas: 'Hechas',
}

/** Lo que dice un filtro sin nada (W-10 › Un filtro sin nada). */
const SIN_NADA: Record<FiltroIdeas, string> = {
  todo: 'No hay nada por pensar: lo demás está en Hechas.',
  'para-revisar': 'No hay enlaces para revisar.',
  'sin-evaluar': 'No hay ideas sin evaluar.',
  aprobadas: 'No hay ideas aprobadas.',
  rechazadas: 'No hay ideas rechazadas.',
  hechas: 'No hay ideas hechas.',
}

interface Fallo {
  titulo: string
  mensaje: string
  /** Lo escrito que no se guardó: queda en su lugar y, además, copiado. */
  copiado?: boolean
}

/** Lo que espera para guardarse de una idea abierta (`guardarLuego`). */
const claveGuardar = (ruta: string, codigo: string) => `idea|${ruta}|${codigo}`

/** El sitio de una dirección, sin `www.`; null si no se entiende. */
function sitioDe(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/** La primera línea de un texto en Markdown, para el detalle de un enlace. */
function primeraLinea(texto: string): string {
  return (
    texto
      .split(/\r?\n/)
      .find((l) => l.trim())
      ?.trim() ?? ''
  )
}

function Senal({ idea }: { idea: IdeaVista }) {
  if (idea.de === 'enlace') return idea.estado === 'hecha' ? <span className="senal">Revisado</span> : null
  if (idea.estado === 'aprobada') return <span className="senal verde">Aprobada</span>
  if (idea.estado === 'rechazada') return <span className="senal rojo">Rechazada</span>
  if (idea.estado === 'hecha') return <span className="senal">Hecha</span>
  return null
}

function IconoIdea({ idea }: { idea: IdeaVista }) {
  if (idea.de === 'enlace')
    return (
      <span className="icono-fila">
        <Icono nombre="abrir" />
      </span>
    )
  if (idea.de === 'IA')
    return (
      <span className="icono-fila" role="img" aria-label="Anotada por la IA" title="Anotada por la IA">
        <Icono nombre="robot" />
      </span>
    )
  return (
    <span className="icono-fila">
      <Icono nombre="ideas" />
    </span>
  )
}

export function IdeasProyecto({ ruta }: { ruta: string }) {
  const [datos, setDatos] = useState<IdeasDeProyecto | null>(null)
  const [filtro, setFiltro] = useState<FiltroIdeas>('todo')
  const [escrito, setEscrito] = useState('')
  const [anotando, setAnotando] = useState(false)
  const [fallo, setFallo] = useState<Fallo | null>(null)
  const [abierta, setAbierta] = useState<string | null>(null)
  /** El texto de la idea abierta: el título en la primera línea y la nota debajo; null mientras se lee. */
  const [texto, setTexto] = useState<string | null>(null)
  /** La nota de la idea abierta como se leyó, para pintar su hoja al abrirla. */
  const [leida, setLeida] = useState<{ nota: string; imagenes: Record<string, string> } | null>(null)
  /** La idea o el enlace que pide confirmar Borrar (ID-8). */
  const [borrando, setBorrando] = useState<string | null>(null)
  const [menu, setMenu] = useState<{ codigo: string; en: Punto } | null>(null)
  const nombre = usarEstado((s) => tarjetaDe(s.lista, ruta)?.nombre ?? 'este proyecto')
  const citar = usarEstado((s) => s.citar)
  const campo = useRef<HTMLTextAreaElement>(null)
  /** Lo último guardado de la idea abierta, para no volver a guardar lo mismo. */
  const guardado = useRef<string | null>(null)

  const leer = useCallback(
    () =>
      window.iridium.ideasProyecto(ruta).then(
        (r) => {
          setDatos(r)
          return r
        },
        (e: unknown) => {
          const r: IdeasDeProyecto = { tipo: 'error', mensaje: e instanceof Error ? e.message : String(e) }
          setDatos(r)
          return r
        },
      ),
    [ruta],
  )
  useEffect(() => {
    void leer()
  }, [leer])
  // La IA cambia `trabajo.md` seguido: la lista se relee sola; lo que se está escribiendo es de la pantalla y no se toca.
  useDocsCambian(ruta, leer)

  const ideas = datos?.tipo === 'ok' ? datos.ideas : []
  const ideaAbierta = ideas.find((i) => i.codigo === abierta) ?? null

  // Si la idea abierta ya no está (la IA la sacó), se cierra.
  useEffect(() => {
    if (abierta && datos?.tipo === 'ok' && !datos.ideas.some((i) => i.codigo === abierta)) setAbierta(null)
  }, [abierta, datos])

  const guardar = useCallback(
    async (codigo: string, t: string) => {
      if (t === guardado.current) return true
      const r = await window.iridium.guardarIdea(ruta, codigo, t)
      if (r.tipo === 'ok') {
        guardado.current = t
        setFallo(null)
        return true
      }
      const copiado = await navigator.clipboard.writeText(t).then(
        () => true,
        () => false,
      )
      setFallo({ titulo: 'No se pudo guardar la idea', mensaje: r.mensaje, copiado })
      return false
    },
    [ruta],
  )

  /** Cierra la idea abierta guardando ya lo que esperaba; con la primera línea vacía, no se cierra. */
  const cerrar = useCallback(async () => {
    if (abierta && texto !== null && ideaAbierta?.de === 'usuario') {
      noGuardar(claveGuardar(ruta, abierta))
      if (!texto.split(/\r?\n/)[0]?.trim()) {
        setFallo({ titulo: 'La idea necesita un título', mensaje: 'Escribilo en la primera línea.' })
        return false
      }
      if (!(await guardar(abierta, texto))) return false
    }
    setAbierta(null)
    setTexto(null)
    setLeida(null)
    setBorrando(null)
    guardado.current = null
    return true
  }, [ruta, abierta, texto, ideaAbierta, guardar])

  const abrir = async (idea: IdeaVista) => {
    if (idea.de === 'enlace') {
      if (idea.enlace) window.open(idea.enlace)
      return
    }
    if (abierta === idea.codigo) {
      await cerrar()
      return
    }
    if (!(await cerrar())) return
    setAbierta(idea.codigo)
    if (idea.de !== 'usuario') return
    setTexto(null)
    const r = await window.iridium.notaIdea(ruta, idea.codigo)
    if (r.tipo === 'error') {
      setFallo({ titulo: 'No se pudo leer la nota', mensaje: r.mensaje })
      setAbierta(null)
      return
    }
    // Lo guardado, con la forma en que la hoja lo devuelve: abrir sin escribir no vuelve a guardar.
    const t = escritoDeIdea(bloquesDeIdea(idea.titulo, r.texto))
    guardado.current = t
    setLeida({ nota: r.texto, imagenes: r.imagenes })
    setTexto(t)
  }

  const escribir = (t: string) => {
    setTexto(t)
    const codigo = abierta
    if (!codigo || !t.split(/\r?\n/)[0]?.trim()) return
    guardarLuego(claveGuardar(ruta, codigo), () => void guardar(codigo, t))
  }

  // Borrar (ID-8): solo las del usuario y los enlaces, después de confirmar. Lo que esperaba guardarse ya no se guarda.
  const borrar = async (i: IdeaVista) => {
    setBorrando(null)
    if (abierta === i.codigo) {
      noGuardar(claveGuardar(ruta, i.codigo))
      setAbierta(null)
      setTexto(null)
      setLeida(null)
      guardado.current = null
    }
    const r = await window.iridium.borrarIdea(ruta, i.codigo)
    if (r.tipo === 'error') setFallo({ titulo: 'No se pudo borrar', mensaje: r.mensaje })
    else setFallo(null)
    await leer()
  }
  const sePuedeBorrar = (i: IdeaVista) => i.de !== 'IA'

  const cambiarEstado = async (idea: IdeaVista, estado: EstadoDesdeIdeas) => {
    const r = await window.iridium.estadoIdea(ruta, idea.codigo, estado)
    if (r.tipo === 'error') setFallo({ titulo: 'No se pudo cambiar el estado', mensaje: r.mensaje })
    else setFallo(null)
    await leer()
  }
  // El mismo botón otra vez la vuelve a sin evaluar (ID-3).
  const aprobar = (i: IdeaVista) => cambiarEstado(i, i.estado === 'aprobada' ? 'nueva' : 'pendiente')
  const rechazar = (i: IdeaVista) => cambiarEstado(i, i.estado === 'rechazada' ? 'nueva' : 'descartado')
  const revisado = (i: IdeaVista) => cambiarEstado(i, i.estado === 'hecha' ? 'nueva' : 'hecho')

  // Revisar con la IA (ID-9, Q-182): el pedido queda citado arriba del campo de la conversación de al lado; sale con
  // lo que escriba el usuario, o solo.
  const revisarConIa = (i: IdeaVista) => {
    if (i.enlace) citar(ruta, citaRevisar(i, nombre))
  }

  // Hablar de esta idea (ID-6, Q-182): queda citada en la conversación, sin enviar. Lo que esperaba guardarse se
  // guarda antes, para que la IA lea la nota como está.
  const hablar = async (i: IdeaVista) => {
    const primera = i.codigo === abierta && texto !== null ? texto.split(/\r?\n/)[0]?.trim() : ''
    if (primera && i.de === 'usuario' && texto !== null) {
      noGuardar(claveGuardar(ruta, i.codigo))
      if (!(await guardar(i.codigo, texto))) return
    }
    const titulo = primera || i.titulo
    citar(ruta, citaHablar({ codigo: i.codigo, titulo }))
  }

  const anotar = async () => {
    if (!escrito.trim() || anotando) return
    setAnotando(true)
    const r = await window.iridium.anotarIdea(ruta, escrito)
    setAnotando(false)
    campo.current?.focus()
    if (r.tipo === 'error') {
      const copiado = await navigator.clipboard.writeText(escrito).then(
        () => true,
        () => false,
      )
      setFallo({ titulo: 'No se pudo anotar', mensaje: r.mensaje, copiado })
      return
    }
    setFallo(null)
    setEscrito('')
    const l = await leer()
    // Si el filtro elegido no la muestra, se vuelve a Todo para verla primera.
    const nueva = l.tipo === 'ok' ? l.ideas.find((i) => i.codigo === r.codigo) : undefined
    if (nueva && !entraEnFiltro(nueva, filtro)) setFiltro('todo')
  }

  const alTeclaCampo = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      void anotar()
    }
  }

  // Esc cierra la idea abierta (ID-2), si no hay un menú abierto (que se cierra con su propio Esc).
  useEffect(() => {
    if (!abierta || menu) return
    const tecla = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (borrando) setBorrando(null)
      else void cerrar()
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [abierta, menu, cerrar, borrando])

  const cabecera = { titulo: 'Ideas' }

  if (!datos) return <Cabecera {...cabecera} />
  if (datos.tipo === 'sin-framework')
    return (
      <Cabecera
        {...cabecera}
        vacia="Este proyecto no tiene docs/trabajo.md: sus ideas no se pueden anotar acá."
      />
    )
  if (datos.tipo === 'error')
    return (
      <>
        <Cabecera {...cabecera} />
        <div className="idp-cuerpo">
          <div className="idp-col">
            <div className="recuadro error" role="alert">
              <Icono nombre="error" />
              <div className="cuerpo-recuadro">
                <strong>No se pueden leer las ideas</strong>
                <span>{datos.mensaje}</span>
                <div className="acciones-recuadro">
                  <button type="button" className="boton secundario chico" onClick={() => void leer()}>
                    <Icono nombre="reintentar" />
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )

  const cuentas = contarPorFiltro(ideas)
  const filtros = FILTROS_IDEAS.map((f) => ({ clave: f, nombre: NOMBRES[f], n: cuentas[f] }))
  const visibles = ideas.filter((i) => entraEnFiltro(i, filtro))
  const grupos = [
    { titulo: 'Enlaces', ideas: visibles.filter((i) => i.de === 'enlace') },
    { titulo: 'Ideas', ideas: visibles.filter((i) => i.de !== 'enlace') },
  ].filter((g) => g.ideas.length > 0)
  const hoy = new Date()
  const ideaDelMenu = menu ? ideas.find((i) => i.codigo === menu.codigo) : undefined
  const ideaBorrando = borrando ? ideas.find((i) => i.codigo === borrando) : undefined

  // Borrar desde el menú o desde la idea abierta: la confirmación es el cuadro del centro (Q-189).
  const borrarDelMenu = ideaDelMenu && (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        setMenu(null)
        setBorrando(ideaDelMenu.codigo)
      }}
    >
      <Icono nombre="eliminar" />
      Borrar
    </button>
  )

  const alMenu = (e: MouseEvent<HTMLElement>, idea: IdeaVista) => {
    e.preventDefault()
    setMenu({ codigo: idea.codigo, en: puntoDelMenu(e) })
  }

  // Enviar a la conversación (R-75, R-77; el ícono de compartir, Q-183): el mismo botón en cada renglón, a la vista al
  // pasar el mouse. Una idea queda citada como Hablar de esta idea; un enlace, con el pedido de revisarlo. Sale con el
  // próximo mensaje.
  const enviar = (idea: IdeaVista) => (
    <button
      type="button"
      className="boton solo-icono chico"
      aria-label="Enviar a la conversación"
      title="La cita en la conversación de al lado: va con tu próximo mensaje"
      onClick={() => (idea.de === 'enlace' ? revisarConIa(idea) : void hablar(idea))}
    >
      <Icono nombre="compartir" />
    </button>
  )

  const fila = (idea: IdeaVista) => {
    const enlace = idea.de === 'enlace'
    const sitio = idea.enlace ? sitioDe(idea.enlace) : null
    const detalle = enlace ? [sitio ?? idea.enlace, primeraLinea(idea.texto)].filter(Boolean).join(' · ') : ''
    const clases = [
      'fila',
      'idp-item',
      enlace ? 'con-detalle' : '',
      idea.codigo === abierta ? 'abierta' : '',
      !enlace && idea.estado === 'aprobada' ? 'idp-aprobada' : '',
      !enlace && idea.estado === 'rechazada' ? 'idp-rechazada' : '',
    ]
      .filter(Boolean)
      .join(' ')
    const meta = (
      <span className="meta idp-meta">
        <Senal idea={idea} />
        {idea.fecha && diaCorto(idea.fecha, hoy)}
      </span>
    )
    return (
      <div key={idea.codigo} className={clases} data-codigo={idea.codigo}>
        <button
          type="button"
          className="idp-abrir"
          aria-expanded={enlace ? undefined : idea.codigo === abierta}
          title={enlace ? (idea.enlace ?? undefined) : idea.titulo}
          onClick={() => void abrir(idea)}
          onContextMenu={(e) => alMenu(e, idea)}
        >
          <IconoIdea idea={idea} />
          <span className="principal-fila">
            <span className="titulo-fila">{idea.titulo}</span>
            {detalle && <span className="detalle">{detalle}</span>}
          </span>
          {!enlace && meta}
        </button>
        {!enlace && <span className="acciones">{enviar(idea)}</span>}
        {enlace && (
          <>
            <span className="acciones">
              {enviar(idea)}
              <button
                type="button"
                className="boton solo-icono chico"
                aria-label={idea.estado === 'hecha' ? 'Volver a para revisar' : 'Marcar como revisado'}
                aria-pressed={idea.estado === 'hecha'}
                title={idea.estado === 'hecha' ? 'Volver a para revisar' : 'Marcar como revisado'}
                onClick={() => void revisado(idea)}
              >
                <Icono nombre="check" />
              </button>
            </span>
            {meta}
          </>
        )}
      </div>
    )
  }

  const cuerpo = (idea: IdeaVista) => (
    <div className="cuerpo-fila" key={`${idea.codigo}-cuerpo`}>
      {idea.de === 'usuario' ? (
        texto === null ? (
          <p className="idp-leyendo">Leyendo…</p>
        ) : (
          <NotaDeIdea
            key={idea.codigo}
            ruta={ruta}
            codigo={idea.codigo}
            titulo={idea.titulo}
            nota={leida?.nota ?? ''}
            imagenes={leida?.imagenes ?? {}}
            alCambiar={escribir}
            alFallo={(mensaje) => setFallo({ titulo: 'No se pegó la imagen', mensaje })}
          />
        )
      ) : (
        <div className="texto-doc idp-texto-ia">{idea.texto.trim() || 'Sin más texto que el título.'}</div>
      )}
      <div className="pie-fila">
        <button
          type="button"
          className="boton sin-fondo chico"
          title="La cita en la conversación de al lado, para que escribas sobre ella"
          onClick={() => void hablar(idea)}
        >
          <Icono nombre="comentar" />
          Hablar de esta idea
        </button>
        {idea.estado !== 'hecha' && (
          <>
            <button
              type="button"
              className={
                idea.estado === 'aprobada'
                  ? 'boton sin-fondo chico idp-elegido-bien'
                  : 'boton sin-fondo chico'
              }
              aria-pressed={idea.estado === 'aprobada'}
              onClick={() => void aprobar(idea)}
            >
              <Icono nombre="check" />
              Aprobar
            </button>
            <button
              type="button"
              className={
                idea.estado === 'rechazada'
                  ? 'boton sin-fondo chico idp-elegido-mal'
                  : 'boton sin-fondo chico'
              }
              aria-pressed={idea.estado === 'rechazada'}
              onClick={() => void rechazar(idea)}
            >
              <Icono nombre="x" />
              Rechazar
            </button>
          </>
        )}
        {sePuedeBorrar(idea) && (
          <button type="button" className="boton sin-fondo chico" onClick={() => setBorrando(idea.codigo)}>
            <Icono nombre="eliminar" />
            Borrar
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      <Cabecera
        {...cabecera}
        filtros={
          <Filtros
            filtros={filtros}
            elegido={filtro}
            elegir={(c) => setFiltro(c as FiltroIdeas)}
            etiqueta="Filtrar ideas"
          />
        }
      />
      <div className="idp-cuerpo">
        <div className="idp-col">
          <div className="idp-anotar">
            <textarea
              ref={campo}
              className="campo idp-campo"
              rows={1}
              placeholder="Una idea, o pegá un enlace para revisar…"
              aria-label="Anotar una idea o un enlace"
              value={escrito}
              onChange={(e) => setEscrito(e.target.value)}
              onKeyDown={alTeclaCampo}
            />
            <button
              type="button"
              className="boton secundario"
              disabled={!escrito.trim() || anotando}
              onClick={() => void anotar()}
            >
              Anotar
            </button>
          </div>

          {fallo && (
            <div className="recuadro error" role="alert">
              <Icono nombre="error" />
              <div className="cuerpo-recuadro">
                <strong>{fallo.titulo}</strong>
                <span>{fallo.mensaje}</span>
                {fallo.copiado && <span>Lo que escribiste sigue ahí y quedó copiado.</span>}
                <div className="acciones-recuadro">
                  <button type="button" className="boton secundario chico" onClick={() => setFallo(null)}>
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}

          {ideas.length === 0 ? (
            <p className="idp-vacio">
              Todavía no hay ideas. Escribí una arriba o pegá un enlace para revisar.
            </p>
          ) : grupos.length === 0 ? (
            <p className="idp-vacio">{SIN_NADA[filtro]}</p>
          ) : (
            grupos.map((g) => (
              <section key={g.titulo} className="bloque" aria-label={g.titulo}>
                <h2 className="bloque-titulo">
                  {g.titulo} <span className="cuenta">{g.ideas.length}</span>
                </h2>
                <div className="filas con-lineas">
                  {g.ideas.flatMap((i) => (i.codigo === abierta ? [fila(i), cuerpo(i)] : [fila(i)]))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      {menu && ideaDelMenu && (
        <MenuContextual en={menu.en} etiqueta={`Idea ${ideaDelMenu.titulo}`} cerrar={() => setMenu(null)}>
          {ideaDelMenu.de === 'enlace' ? (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenu(null)
                  if (ideaDelMenu.enlace) window.open(ideaDelMenu.enlace)
                }}
              >
                <Icono nombre="abrir" />
                Abrir en el navegador
              </button>
              {ideaDelMenu.estado !== 'hecha' && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenu(null)
                    revisarConIa(ideaDelMenu)
                  }}
                >
                  <Icono nombre="comentar" />
                  Revisar con la IA
                </button>
              )}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenu(null)
                  void revisado(ideaDelMenu)
                }}
              >
                <Icono nombre="check" />
                {ideaDelMenu.estado === 'hecha' ? 'Volver a para revisar' : 'Marcar como revisado'}
              </button>
              {borrarDelMenu}
            </>
          ) : (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenu(null)
                  void hablar(ideaDelMenu)
                }}
              >
                <Icono nombre="comentar" />
                Hablar de esta idea
              </button>
              {ideaDelMenu.estado !== 'hecha' && (
                <>
                  <button
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={ideaDelMenu.estado === 'aprobada'}
                    onClick={() => {
                      setMenu(null)
                      void aprobar(ideaDelMenu)
                    }}
                  >
                    <Icono nombre="check" />
                    {ideaDelMenu.estado === 'aprobada' ? 'Quitar la aprobación' : 'Aprobar'}
                  </button>
                  <button
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={ideaDelMenu.estado === 'rechazada'}
                    onClick={() => {
                      setMenu(null)
                      void rechazar(ideaDelMenu)
                    }}
                  >
                    <Icono nombre="x" />
                    {ideaDelMenu.estado === 'rechazada' ? 'Quitar el rechazo' : 'Rechazar'}
                  </button>
                </>
              )}
              {sePuedeBorrar(ideaDelMenu) && borrarDelMenu}
            </>
          )}
        </MenuContextual>
      )}
      {ideaBorrando && (
        <CuadroBorrar
          idea={ideaBorrando}
          borrar={() => void borrar(ideaBorrando)}
          cancelar={() => setBorrando(null)}
        />
      )}
    </>
  )
}

/** «¿Borrar esta idea?» en el cuadro del centro (PZ-8): el foco empieza en No, así Enter no borra; Esc es No. */
function CuadroBorrar({
  idea,
  borrar,
  cancelar,
}: {
  idea: IdeaVista
  borrar: () => void
  cancelar: () => void
}) {
  const no = useRef<HTMLButtonElement>(null)
  useEffect(() => no.current?.focus(), [])
  const enlace = idea.de === 'enlace'
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: el velo solo cierra con un clic afuera del cuadro.
    // biome-ignore lint/a11y/useKeyWithClickEvents: Esc lo atiende el cuadro.
    <div className="velo" onClick={(e) => e.target === e.currentTarget && cancelar()}>
      <div
        className="cuadro"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="borrar-idea-t"
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return
          e.stopPropagation()
          cancelar()
        }}
      >
        <h2 id="borrar-idea-t">{enlace ? '¿Borrar este enlace?' : '¿Borrar esta idea?'}</h2>
        <p>
          «{idea.titulo}»{enlace ? '' : ', con su nota y sus imágenes'}. No se puede deshacer.
        </p>
        <div className="pie">
          <button ref={no} type="button" className="boton sin-fondo" onClick={cancelar}>
            No
          </button>
          <button type="button" className="boton peligroso" onClick={borrar}>
            Sí, borrar
          </button>
        </div>
      </div>
    </div>
  )
}

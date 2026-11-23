// Las consolas adentro (T-116, D-184, D-185; `cambios/consolas.md` › Qué ves): un panel abajo de la sección, plegado
// hasta que se ejecuta algo, con una pestaña por consola, Detener, Limpiar y plegar; en la barra de abajo, «▶ N
// corriendo». La consola es de verdad (xterm.js, la de VS Code): se le escribe, tiene colores y se copia con el mouse.
import { FitAddon } from '@xterm/addon-fit'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { useEffect, useRef } from 'react'
import { type ConsolaVista, consolasDe, detalleDePestana, textoDeLaBarra } from '../../compartido/consolas'
import { usarEstado } from '../estado'
import { Icono } from '../ui/Icono'

/** Un color de `tokens.css`, para la consola (xterm no lee las variables de CSS). */
const token = (nombre: string) => getComputedStyle(document.documentElement).getPropertyValue(nombre).trim()

/** La consola elegida, dibujada: lo guardado primero y después lo que va llegando. */
function Pantalla({ consola }: { consola: ConsolaVista }) {
  const caja = useRef<HTMLDivElement>(null)
  const id = consola.id
  useEffect(() => {
    const el = caja.current
    if (!el) return
    const api = window.iridium
    const term = new Terminal({
      fontFamily: token('--mono') || 'Consolas, monospace',
      fontSize: 13,
      cursorBlink: true,
      scrollback: 5000,
      allowProposedApi: false,
      theme: {
        background: token('--fondo'),
        foreground: token('--texto-2'),
        cursor: token('--texto-2'),
        selectionBackground: token('--seleccion'),
      },
    })
    const ajuste = new FitAddon()
    term.loadAddon(ajuste)
    term.open(el)
    // Ctrl+C con algo marcado copia (como VS Code); sin nada marcado, corta lo que corre. Ctrl+V pega.
    term.attachCustomKeyEventHandler((e) => {
      if (e.type !== 'keydown' || !e.ctrlKey || e.altKey) return true
      if (e.key === 'c' && term.hasSelection()) {
        void navigator.clipboard.writeText(term.getSelection())
        term.clearSelection()
        return false
      }
      return e.key !== 'v'
    })
    // Lo que llega antes de lo guardado espera; después, se escribe lo que sigue a `hasta`.
    let hasta: number | null = null
    const enEspera: { desde: number; datos: string }[] = []
    const escribir = (desde: number, datos: string) => {
      if (hasta === null) return void enEspera.push({ desde, datos })
      const fin = desde + datos.length
      if (fin <= hasta) return
      term.write(datos.slice(Math.max(0, hasta - desde)))
      hasta = fin
    }
    const quitar = api.alSalirConsola((s) => {
      if (s.id === id) escribir(s.desde, s.datos)
    })
    void api.guardadoConsola(id).then((g) => {
      term.write(g?.texto ?? '')
      hasta = g?.hasta ?? 0
      for (const p of enEspera.splice(0)) escribir(p.desde, p.datos)
    })
    const alEscribir = term.onData((d) => void api.escribirConsola(id, d))
    const medir = () => {
      if (!el.offsetWidth || !el.offsetHeight) return
      ajuste.fit()
      void api.tamanoConsola(id, term.cols, term.rows)
    }
    const vigia = new ResizeObserver(medir)
    vigia.observe(el)
    medir()
    term.focus()
    // Limpiar (el botón del panel): se borra lo dibujado; lo guardado ya lo borró el proceso principal.
    const limpiar = (e: Event) => {
      if ((e as CustomEvent<string>).detail === id) term.clear()
    }
    window.addEventListener('limpiar-consola', limpiar)
    return () => {
      window.removeEventListener('limpiar-consola', limpiar)
      vigia.disconnect()
      alEscribir.dispose()
      quitar()
      term.dispose()
    }
  }, [id])
  return <div ref={caja} className="pantalla-consola" data-consola={id} />
}

function IconoEstado({ c }: { c: ConsolaVista }) {
  switch (c.estado) {
    case 'corriendo':
      return (
        <span className="corre">
          <Icono nombre="play" />
        </span>
      )
    case 'ok':
      return (
        <span className="termino">
          <Icono nombre="check" />
        </span>
      )
    case 'fallo':
      return (
        <span className="fallo">
          <Icono nombre="x" />
        </span>
      )
    case 'detenida':
      return (
        <span className="termino">
          <Icono nombre="cuadro" />
        </span>
      )
  }
}

/**
 * El panel, abajo de la sección (en un proyecto, `lugar` es su carpeta: sus consolas y las de Iridium) o del inicio
 * (`null`: todas). Plegado, no se ve.
 */
export function PanelConsolas({ lugar }: { lugar: string | null }) {
  const todas = usarEstado((s) => s.consolas)
  const abierto = usarEstado((s) => s.panelConsolas)
  const plegar = usarEstado((s) => s.plegarConsolas)
  const clave = (lugar ?? '').toLowerCase()
  const elegidaId = usarEstado((s) => s.consolaElegida[clave])
  const elegir = usarEstado((s) => s.elegirConsola)
  const lista = consolasDe(todas, lugar)
  if (!abierto || lista.length === 0) return null
  const elegida = lista.find((c) => c.id === elegidaId) ?? lista[lista.length - 1]
  if (!elegida) return null
  const api = window.iridium
  const limpiar = () => {
    void api.limpiarConsola(elegida.id)
    window.dispatchEvent(new CustomEvent('limpiar-consola', { detail: elegida.id }))
  }
  return (
    <section className="consolas" aria-label="Consolas">
      <div className="cab-consolas">
        <div className="pestanas" role="tablist" aria-label="Consolas abiertas">
          {lista.map((c) => (
            <div
              key={c.id}
              role="tab"
              tabIndex={0}
              aria-selected={c.id === elegida.id}
              className={c.id === elegida.id ? 'pestana consola-pestana elegida' : 'pestana consola-pestana'}
              title={detalleDePestana(c)}
              onClick={() => elegir(clave, c.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') elegir(clave, c.id)
              }}
            >
              <IconoEstado c={c} />
              <span className="nombre-consola">{c.nombre}</span>
              <button
                type="button"
                className="cerrar-consola"
                title={c.estado === 'corriendo' ? 'Cerrar (la detiene)' : 'Cerrar'}
                aria-label={`Cerrar ${c.nombre}`}
                onClick={(e) => {
                  e.stopPropagation()
                  void api.cerrarConsola(c.id)
                }}
              >
                <Icono nombre="x" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="boton sin-fondo chico"
          disabled={elegida.estado !== 'corriendo'}
          onClick={() => void api.detenerConsola(elegida.id)}
        >
          Detener
        </button>
        <button type="button" className="boton sin-fondo chico" onClick={limpiar}>
          Limpiar
        </button>
        <button
          type="button"
          className="boton solo-icono chico plegar-consolas"
          title="Plegar"
          aria-label="Plegar las consolas"
          onClick={() => plegar(false)}
        >
          <Icono nombre="chev" />
        </button>
      </div>
      <Pantalla key={elegida.id} consola={elegida} />
    </section>
  )
}

/** En la barra de abajo: «▶ N corriendo» (o cuántas quedaron para leer); abre y pliega el panel. */
export function SenalConsolas() {
  const todas = usarEstado((s) => s.consolas)
  const seccion = usarEstado((s) => s.seccion)
  const ruta = usarEstado((s) => s.proyectoAbierto)
  const abierto = usarEstado((s) => s.panelConsolas)
  const plegar = usarEstado((s) => s.plegarConsolas)
  const barra = textoDeLaBarra(consolasDe(todas, seccion === 'proyecto' ? ruta : null))
  if (!barra) return null
  return (
    <span className="it consolas-it">
      <button
        type="button"
        className={barra.corriendo ? 'senal-consolas corriendo' : 'senal-consolas'}
        aria-expanded={abierto}
        title={abierto ? 'Plegar las consolas' : 'Ver las consolas'}
        onClick={() => plegar(!abierto)}
      >
        {barra.corriendo && <Icono nombre="play" />}
        {barra.texto}
      </button>
    </span>
  )
}

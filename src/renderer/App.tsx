// La ventana: el marco y la sección elegida. Al abrir pide la lista de proyectos y escucha sus cambios.
import { useEffect, useRef } from 'react'
import { usarEstado } from './estado'
import { Marco } from './marco/Marco'
import { SECCIONES } from './secciones'
import { VistaProyecto } from './secciones/proyecto/VistaProyecto'
import { textoHito } from './secciones/proyectos/Tarjeta'
import { guardarTodoYa } from './ui/guardarLuego'

function useConexion() {
  const ponerLista = usarEstado((s) => s.ponerLista)
  const ponerMotor = usarEstado((s) => s.ponerMotor)
  const ponerPreferencias = usarEstado((s) => s.ponerPreferencias)
  const aplicarCambio = usarEstado((s) => s.aplicarCambio)
  const ponerUso = usarEstado((s) => s.ponerUso)
  const ponerCierre = usarEstado((s) => s.ponerCierre)
  const ponerVersionNueva = usarEstado((s) => s.ponerVersionNueva)
  const ponerSinArmar = usarEstado((s) => s.ponerSinArmar)
  const ponerEscritos = usarEstado((s) => s.ponerEscritos)
  const volverAlAbierto = usarEstado((s) => s.volverAlAbierto)
  useEffect(() => {
    const api = window.iridium
    // Con las preferencias y la lista, se vuelve al proyecto que estaba abierto al cerrar (D-060).
    void Promise.all([
      api.leerPreferencias().then(ponerPreferencias),
      api.listarProyectos().then(ponerLista),
    ]).then(volverAlAbierto)
    void api.leerEscritos().then(ponerEscritos)
    // Lo que se escribió recién y todavía esperaba para guardarse, se guarda al cerrar.
    window.addEventListener('beforeunload', guardarTodoYa)
    void api.estadoMotor().then(ponerMotor)
    void api.uso().then((u) => u && ponerUso(u))
    void api.versionNueva().then(ponerVersionNueva)
    void api.sinArmar().then(ponerSinArmar)
    const quitar = [
      api.alCambiarProyectos(ponerLista),
      api.alCambiarMotor(ponerMotor),
      api.alCambiarConversacion(aplicarCambio),
      api.alCambiarUso(ponerUso),
      api.alPedirCierre(ponerCierre),
      api.alCambiarVersionNueva(ponerVersionNueva),
      api.alCambiarSinArmar(ponerSinArmar),
    ]
    return () => {
      window.removeEventListener('beforeunload', guardarTodoYa)
      for (const q of quitar) q()
    }
  }, [
    ponerLista,
    ponerMotor,
    ponerPreferencias,
    aplicarCambio,
    ponerUso,
    ponerCierre,
    ponerVersionNueva,
    ponerSinArmar,
    ponerEscritos,
    volverAlAbierto,
  ])
}

/** Ctrl+1 Proyectos, Ctrl+2 Pendientes (04-ux.md › Principios de interacción); Ctrl+, los Ajustes (AJ-W1); Ctrl+= y Ctrl+- el tamaño. */
function useAtajos() {
  const irA = usarEstado((s) => s.irA)
  const abrirAjustes = usarEstado((s) => s.abrirAjustes)
  useEffect(() => {
    const alTeclado = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.altKey) return
      // Agrandar la letra (Defecto 17): la ventana no tiene menú, que es el que trae estos atajos. `+` llega con Shift.
      const paso = e.key === '=' || e.key === '+' ? 1 : e.key === '-' ? -1 : e.key === '0' ? 0 : null
      if (paso !== null) {
        e.preventDefault()
        void window.iridium.zoom(paso)
        return
      }
      if (e.shiftKey) return
      if (e.key === ',') {
        e.preventDefault()
        abrirAjustes()
        return
      }
      const s = SECCIONES.find((x) => x.atajo === e.key)
      if (!s) return
      e.preventDefault()
      irA(s.id)
    }
    window.addEventListener('keydown', alTeclado)
    return () => window.removeEventListener('keydown', alTeclado)
  }, [irA, abrirAjustes])
}

/**
 * Al cambiar de pantalla (un atajo, abrir un proyecto con Enter), el foco va a su título: el próximo Tab sigue desde
 * ahí y no desde las pestañas de arriba (Defecto 19). No se lo saca a un campo donde se está escribiendo.
 */
function useFocoAlCambiar(seccion: string, ruta: string | null) {
  const primera = useRef(true)
  // biome-ignore lint/correctness/useExhaustiveDependencies: corre cuando cambia la pantalla, no lee los valores.
  useEffect(() => {
    if (primera.current) {
      primera.current = false
      return
    }
    const enfocar = () => {
      // El título de la pantalla; sin él (Pendientes vacío), el primero que tenga.
      const titulo =
        document.querySelector<HTMLElement>('main h1') ?? document.querySelector<HTMLElement>('main h2')
      if (!titulo) return
      titulo.tabIndex = -1
      titulo.focus({ preventScroll: true })
    }
    const cuadro = requestAnimationFrame(() => {
      const activo = document.activeElement
      if (activo instanceof HTMLTextAreaElement || activo instanceof HTMLInputElement) return
      enfocar()
    })
    // La pantalla puede cambiar enseguida (Pendientes carga y se rearma): si el título se fue y el foco quedó en el
    // aire, va al nuevo. Solo el primer segundo; después lo mueve el usuario.
    const vigia = new MutationObserver(() => {
      if (document.activeElement === document.body) enfocar()
    })
    vigia.observe(document.body, { childList: true, subtree: true })
    const fin = setTimeout(() => vigia.disconnect(), 1000)
    return () => {
      cancelAnimationFrame(cuadro)
      clearTimeout(fin)
      vigia.disconnect()
    }
  }, [seccion, ruta])
}

/** El tema elegido (D-066) en <html>: toda la app cambia en el momento, también lo que está detrás de Ajustes. */
function useTema() {
  const tema = usarEstado((s) => s.preferencias.tema)
  useEffect(() => {
    if (tema === 'iridium') delete document.documentElement.dataset.tema
    else document.documentElement.dataset.tema = tema
  }, [tema])
}

export function App() {
  useConexion()
  useAtajos()
  useTema()
  const seccion = usarEstado((s) => s.seccion)
  const lista = usarEstado((s) => s.lista)
  const ruta = usarEstado((s) => s.proyectoAbierto)
  const Vista = SECCIONES.find((s) => s.id === seccion)?.Vista
  useFocoAlCambiar(seccion, ruta)

  const hito =
    seccion === 'proyecto' && lista?.tipo === 'lista'
      ? lista.proyectos.find((p) => p.ruta === ruta)?.hito
      : null
  const estado = hito ? <span className="it">{textoHito(hito)}</span> : undefined

  return (
    <Marco estado={estado}>{seccion === 'proyecto' ? <VistaProyecto /> : Vista ? <Vista /> : null}</Marco>
  )
}

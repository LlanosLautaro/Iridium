// La ventana: el marco y la sección elegida. Al abrir pide la lista de proyectos y escucha sus cambios.
import { useEffect, useRef } from 'react'
import { usarEstado } from './estado'
import { Marco } from './marco/Marco'
import { tocarSonido } from './marco/sonido'
import { SECCIONES } from './secciones'
import { VistaProyecto } from './secciones/proyecto/VistaProyecto'
import { guardarTodoYa } from './ui/guardarLuego'

function useConexion() {
  const ponerLista = usarEstado((s) => s.ponerLista)
  const ponerMotor = usarEstado((s) => s.ponerMotor)
  const ponerPreferencias = usarEstado((s) => s.ponerPreferencias)
  const aplicarCambio = usarEstado((s) => s.aplicarCambio)
  const ponerUso = usarEstado((s) => s.ponerUso)
  const ponerArranque = usarEstado((s) => s.ponerArranque)
  const ponerActualizaciones = usarEstado((s) => s.ponerActualizaciones)
  const ponerCierre = usarEstado((s) => s.ponerCierre)
  const ponerVersionNueva = usarEstado((s) => s.ponerVersionNueva)
  const ponerSinArmar = usarEstado((s) => s.ponerSinArmar)
  const ponerEscritos = usarEstado((s) => s.ponerEscritos)
  const volverAlAbierto = usarEstado((s) => s.volverAlAbierto)
  const ponerConsolas = usarEstado((s) => s.ponerConsolas)
  const consolaAbierta = usarEstado((s) => s.consolaAbierta)
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
    void api.arranque().then(ponerArranque)
    void api.actualizaciones().then(ponerActualizaciones)
    void api.versionNueva().then(ponerVersionNueva)
    void api.sinArmar().then(ponerSinArmar)
    void api.consolas().then(ponerConsolas)
    const quitar = [
      api.alCambiarConsolas(ponerConsolas),
      api.alAbrirConsola(consolaAbierta),
      api.alCambiarProyectos(ponerLista),
      api.alCambiarMotor(ponerMotor),
      api.alCambiarConversacion(aplicarCambio),
      api.alCambiarUso(ponerUso),
      api.alCambiarArranque(ponerArranque),
      api.alTerminarTrabajo(tocarSonido),
      api.alCambiarActualizaciones(ponerActualizaciones),
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
    ponerArranque,
    ponerActualizaciones,
    ponerCierre,
    ponerVersionNueva,
    ponerSinArmar,
    ponerEscritos,
    volverAlAbierto,
    ponerConsolas,
    consolaAbierta,
  ])
}

/** Ctrl+1 Proyectos, Ctrl+2 Skills, Ctrl+3 Ideas (04-ux.md › Principios de interacción, D-111); Ctrl+, los Ajustes (AJ-W1); Ctrl+= y Ctrl+- el tamaño. */
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
      // El título de la pantalla (en un proyecto, el de la sección a la vista: el h1 del proyecto es solo para el lector de pantalla, D-125); sin
      // él (Pendientes vacío), el primero que tenga.
      const raiz =
        document.querySelector('main .seccion-vista:not([hidden])') ?? document.querySelector('main')
      const titulo = raiz?.querySelector<HTMLElement>('h1') ?? raiz?.querySelector<HTMLElement>('h2')
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

export function App() {
  useConexion()
  useAtajos()
  const seccion = usarEstado((s) => s.seccion)
  const ruta = usarEstado((s) => s.proyectoAbierto)
  const Vista = SECCIONES.find((s) => s.id === seccion)?.Vista
  useFocoAlCambiar(seccion, ruta)

  return <Marco>{seccion === 'proyecto' ? <VistaProyecto /> : Vista ? <Vista /> : null}</Marco>
}

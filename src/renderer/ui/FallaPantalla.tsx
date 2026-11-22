// Si algo se rompe al dibujar, la ventana muestra qué pasó y cómo seguir en vez de quedar en negro (T-111). React
// manda el error a la consola, y el proceso principal anota en el registro del día lo que la consola marca como error.
import { Component, type ReactNode } from 'react'
import { Icono } from './Icono'

export class FallaPantalla extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state = { error: null as Error | null }

  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error : new Error(String(error)) }
  }

  override render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div className="mensaje error" role="alert">
        <span className="senal rojo">
          <Icono nombre="error" />
          Algo falló
        </span>
        <h2>Iridium no pudo mostrar esta pantalla</h2>
        <span className="ruta">{error.message}</span>
        <p>
          Quedó anotado en el registro de hoy. Volver a cargar suele alcanzar; si vuelve a pasar, avisá con
          ese registro.
        </p>
        <div className="acc">
          <button type="button" className="boton principal" onClick={() => location.reload()}>
            <Icono nombre="reintentar" />
            Volver a cargar
          </button>
        </div>
      </div>
    )
  }
}

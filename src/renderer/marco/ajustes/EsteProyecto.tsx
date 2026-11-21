// Ajustes › Este proyecto (frente Abrir, AB-4; `modulos/abrir/ux.md` › Ajustes del proyecto): solo dentro de un
// proyecto. La actualización automática: el interruptor, la última vez y Actualizar ahora; si el proyecto no marca
// cómo se arma, para qué sirve y que su IA lo puede preparar (T-106).
import { useState } from 'react'
import type { ActualizacionProyecto } from '../../../compartido/puente'
import { tarjetaDe, usarEstado } from '../../estado'
import { Icono } from '../../ui/Icono'
import { cuandoFue } from '../../ui/tiempo'
import type { PropsSeccion } from '../Ajustes'
import { Ajuste } from './Ajuste'

/** «Actualizada hoy a las 14:02», «Falló hoy a las 14:02», «Actualizándose…» (AB-4). */
export function ultimaVez(a: ActualizacionProyecto): string {
  if (a.armando !== null) return 'Actualizándose…'
  const u = a.ultimo
  if (!u) return 'Todavía no se armó desde Iridium.'
  const cuando = cuandoFue(u.cuando)
  if (u.resultado === 'ok') return `Actualizada ${cuando}`
  if (u.resultado === 'ocupada')
    return `No se pudo ${cuando}: estaba abierta. Se actualiza cuando la cierres.`
  return `Falló ${cuando}`
}

export function EsteProyecto({ cambiar }: PropsSeccion) {
  const ruta = usarEstado((s) => s.proyectoAbierto)
  const nombre = usarEstado((s) => tarjetaDe(s.lista, s.proyectoAbierto)?.nombre)
  const a = usarEstado((s) => (s.proyectoAbierto ? s.actualizaciones[s.proyectoAbierto] : undefined))
  const apagadas = usarEstado((s) => s.preferencias.actualizacionApagada)
  const [pidiendo, setPidiendo] = useState(false)
  if (!ruta) return null
  if (!a)
    return (
      <Ajuste titulo="Actualización automática" clase="actualizacion-proyecto">
        <span className="expl">
          Para las apps de escritorio: Iridium las arma solas cuando tienen cambios y están cerradas. Este
          proyecto todavía no está preparado; pídeselo a su IA («prepara cómo se arma la app»).
        </span>
      </Ajuste>
    )
  const prendida = !apagadas.includes(ruta)
  const actualizar = async () => {
    setPidiendo(true)
    try {
      await window.iridium.actualizarAhora(ruta)
    } finally {
      setPidiendo(false)
    }
  }
  return (
    <Ajuste
      titulo="Actualización automática"
      detalle={`Arma ${nombre ?? 'la app'} sola cuando tiene cambios y está cerrada, sin IA y sin gastar uso`}
      id="ajuste-actualizacion"
      clase="actualizacion-proyecto"
    >
      <label className="interruptor">
        <input
          type="checkbox"
          role="switch"
          aria-checked={prendida}
          aria-labelledby="ajuste-actualizacion"
          checked={prendida}
          onChange={(e) =>
            void cambiar({
              actualizacionApagada: e.target.checked
                ? apagadas.filter((r) => r !== ruta)
                : [...apagadas, ruta],
            })
          }
        />
        {prendida ? 'Prendida' : 'Apagada'}
      </label>
      <span className={a.fallo ? 'expl ultima fallo' : 'expl ultima'}>
        {ultimaVez(a)}
        {a.ultimo && a.ultimo.resultado !== 'ok' && a.armando === null && (
          <>
            {' · '}
            <button type="button" className="enlace" onClick={() => void window.iridium.consolaArmado(ruta)}>
              Ver la consola
            </button>
          </>
        )}
      </span>
      <button
        type="button"
        className="boton sin-fondo chico"
        disabled={pidiendo || a.armando !== null}
        onClick={() => void actualizar()}
      >
        <Icono nombre="sync" gira={a.armando !== null} />
        Actualizar ahora
      </button>
    </Ajuste>
  )
}

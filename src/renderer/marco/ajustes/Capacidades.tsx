// Ajustes › Capacidades (frente Paridad, segunda parte, T-28; ux.md › PA-7 a PA-9; maqueta
// diseno/pantallas/paridad-capacidades.html): los complementos que cargan las sesiones de Iridium y sus conectores con
// el estado en palabras, Conectar en la consola de abajo y un interruptor para apagarlos solo en Iridium. Se pide cada
// vez que se abre la sección, sin gastar. El navegador y la PC llegan con PA-I5 y PA-I6.
import { useCallback, useEffect, useState } from 'react'
import {
  accionDe,
  cambiarApagado,
  deDonde,
  detalleComplemento,
  estadoEnPalabras,
  nombreVisible,
  ordenarComplementos,
  ordenarConectores,
  type VistaCapacidades,
} from '../../../compartido/capacidades'
import { usarEstado } from '../../estado'
import { Icono } from '../../ui/Icono'
import type { PropsSeccion } from '../Ajustes'

type Carga = { tipo: 'cargando' } | VistaCapacidades

export function Capacidades({ cambiar }: PropsSeccion) {
  const ajuste = usarEstado((e) => e.preferencias.capacidades)
  const [carga, setCarga] = useState<Carga>({ tipo: 'cargando' })
  const [conectando, setConectando] = useState<string | null>(null)

  const pedir = useCallback(() => {
    setCarga({ tipo: 'cargando' })
    void window.iridium
      .capacidadesSesion()
      .then((v) => setCarga(v ?? { tipo: 'error' }))
      .catch(() => setCarga({ tipo: 'error' }))
  }, [])
  useEffect(pedir, [pedir])

  const conectar = (nombre: string) => {
    setConectando(nombre)
    void window.iridium
      .conectar(nombre)
      .then((v) => v && setCarga(v))
      .catch(() => {})
      .finally(() => setConectando(null))
  }

  const usar = (nombre: string, prendido: boolean) =>
    void cambiar({
      capacidades: {
        ...ajuste,
        conectoresApagados: cambiarApagado(ajuste.conectoresApagados, nombre, prendido),
      },
    })

  if (carga.tipo === 'cargando')
    return (
      <div className="capacidades" role="status" aria-busy="true" aria-label="Leyendo lo que tiene la IA">
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className="silueta-capacidad">
            <span className="linea-silueta" />
            <span className="linea-silueta" />
          </div>
        ))}
      </div>
    )

  if (carga.tipo === 'error')
    return (
      <div className="recuadro error" role="alert">
        <Icono nombre="error" />
        <div className="cuerpo-recuadro">
          No se pudo saber qué tiene la IA.
          <div className="acciones-recuadro">
            <button type="button" className="boton chico" onClick={pedir}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )

  if (carga.complementos.length === 0 && carga.conectores.length === 0)
    return (
      <div className="capacidades">
        <p className="nota-capacidades">
          La IA usa solo lo de Claude Code. Los complementos se suman en claude.ai.
        </p>
      </div>
    )

  // El orden es el de cuando se abrió: apagar uno no lo mueve de lugar.
  const conectores = ordenarConectores(carga.conectores)
  return (
    <div className="capacidades">
      {carga.complementos.length > 0 && (
        <>
          <h4>Complementos</h4>
          <div className="filas con-lineas">
            {ordenarComplementos(carga.complementos).map((c) => (
              <div key={`${c.origen}:${c.nombre}`} className="fila con-detalle">
                <span className="icono-fila">
                  <Icono nombre="archivos" />
                </span>
                <span className="principal-fila">
                  <span className="titulo-fila">{c.nombre}</span>
                  <span className="detalle">{detalleComplemento(c)}</span>
                </span>
                <span className="meta">{c.origen === 'iridium' ? 'de Iridium' : 'de tu cuenta'}</span>
              </div>
            ))}
          </div>
          <p className="nota-capacidades">
            Se suman o se sacan en claude.ai. Lo que traen se ve en «/» y en Skills.
          </p>
        </>
      )}
      {conectores.length > 0 && (
        <>
          <h4>Conectores</h4>
          <div className="filas con-lineas">
            {conectores.map((c) => {
              const nombre = nombreVisible(c.nombre)
              const apagado = ajuste.conectoresApagados.includes(c.nombre)
              const estado = estadoEnPalabras(c.estado, apagado)
              const accion = accionDe(c.estado, apagado)
              const esperando = conectando === c.nombre
              return (
                <div key={c.nombre} className="fila" data-conector={c.nombre}>
                  <span className="principal-fila">
                    <span className="titulo-fila">{nombre}</span>
                    <span className="detalle">{deDonde(c.nombre)}</span>
                  </span>
                  <span className={estado.tono ? `senal ${estado.tono}` : 'senal'}>
                    {estado.tono === 'verde' && <Icono nombre="check" />}
                    {estado.tono === 'rojo' && <Icono nombre="error" />}
                    {estado.texto}
                  </span>
                  <span className="acciones siempre">
                    {accion === 'conectar' && (
                      <button
                        type="button"
                        className="boton chico"
                        disabled={conectando !== null}
                        aria-label={`Conectar ${nombre}`}
                        onClick={() => conectar(c.nombre)}
                      >
                        {esperando ? 'Conectando…' : 'Conectar'}
                      </button>
                    )}
                    {accion === 'reintentar' && (
                      <button
                        type="button"
                        className="boton sin-fondo chico"
                        aria-label={`Reintentar ${nombre}`}
                        onClick={pedir}
                      >
                        Reintentar
                      </button>
                    )}
                    <label className="interruptor">
                      <input
                        type="checkbox"
                        role="switch"
                        aria-label={`Usar ${nombre}`}
                        aria-checked={!apagado}
                        checked={!apagado}
                        onChange={(e) => usar(c.nombre, e.target.checked)}
                      />
                    </label>
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
      <p className="nota-capacidades">
        Vale para las conversaciones nuevas: las abiertas siguen como estaban hasta Nueva.
        {conectando && ' Iniciá sesión en el navegador que se abrió; al terminar, esta lista se pone al día.'}
      </p>
    </div>
  )
}

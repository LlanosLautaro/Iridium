// Ajustes › Capacidades (frente Paridad, segunda parte, T-28; ux.md › PA-7 a PA-9; maqueta
// diseno/pantallas/paridad-capacidades.html): los complementos que cargan las sesiones de Iridium y sus conectores con
// el estado en palabras, Conectar en la consola de abajo y un interruptor para apagarlos solo en Iridium. Se pide cada
// vez que se abre la sección, sin gastar; mientras llega, va la última lista que se supo (Q-287), con «Poniéndose al
// día…». Arriba, el navegador (PA-I5, PA-10): un interruptor para las conversaciones nuevas y con qué navegador va; y la
// PC (PA-I6, D-189 › 5 y 6): Windows-MCP, con Instalar en la consola de abajo si falta.
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import {
  accionDe,
  cambiarApagado,
  deDonde,
  detalleComplemento,
  estadoEnPalabras,
  type Navegador,
  nombreVisible,
  ordenarComplementos,
  ordenarConectores,
  PAGINA_EXTENSION_CLAUDE,
  textoNavegador,
  type VistaCapacidades,
} from '../../../compartido/capacidades'
import type { AjusteCapacidades } from '../../../compartido/puente'
import { usarEstado } from '../../estado'
import { Icono } from '../../ui/Icono'
import type { PropsSeccion } from '../Ajustes'
import { Ajuste } from './Ajuste'

type Carga = { tipo: 'cargando' } | VistaCapacidades

export function Capacidades({ cambiar }: PropsSeccion) {
  const ajuste = usarEstado((e) => e.preferencias.capacidades)
  const poner = (cambio: Partial<AjusteCapacidades>) =>
    void cambiar({ capacidades: { ...ajuste, ...cambio } })
  return (
    <div className="capacidades">
      <FilaNavegador prendido={ajuste.navegador} poner={(navegador) => poner({ navegador })} />
      <FilaPc prendido={ajuste.pc} poner={(pc) => poner({ pc })} />
      <Lista ajuste={ajuste} poner={poner} />
    </div>
  )
}

/** El navegador (PA-10, D-189 › 4): el interruptor, con qué navegador va y, si ninguno tiene la extensión, el aviso. */
function FilaNavegador({ prendido, poner }: { prendido: boolean; poner: (prendido: boolean) => void }) {
  const [encontrados, setEncontrados] = useState<Navegador[] | null>(null)
  useEffect(() => {
    void window.iridium
      .navegadoresConClaude()
      .catch((): Navegador[] => [])
      .then(setEncontrados)
  }, [])
  const con = encontrados && textoNavegador(encontrados)
  return (
    <Ajuste
      titulo="Navegador"
      detalle="La IA abre páginas, lee y hace clic en tu navegador, con tus cuentas"
      id="ajuste-navegador"
      atributos={{ 'data-navegador': prendido ? 'prendido' : 'apagado' }}
    >
      <label className="interruptor">
        <input
          type="checkbox"
          role="switch"
          aria-label="Usar el navegador"
          aria-checked={prendido}
          checked={prendido}
          onChange={(e) => poner(e.target.checked)}
        />
        {prendido ? 'Prendido' : 'Apagado'}
      </label>
      {con && (
        <span className="senal">
          <Icono nombre="check" />
          {con}
        </span>
      )}
      {encontrados && !con && prendido && (
        <>
          <span className="senal ambar" role="status">
            <Icono nombre="espera" />
            No encontré la extensión «Claude»
          </span>
          <span className="expl">
            La busqué en Chrome, Brave y Edge. El interruptor queda prendido: vale cuando la instales.
          </span>
          <a className="boton chico" href={PAGINA_EXTENSION_CLAUDE} target="_blank" rel="noreferrer">
            Cómo instalarla
          </a>
        </>
      )}
      <span className="expl">
        Para las conversaciones nuevas. Una página puede traer instrucciones escondidas: prendelo cuando lo
        uses. La extensión te pide permiso por sitio.
      </span>
    </Ajuste>
  )
}

/**
 * Usar la PC (D-189 › 5 y 6): Windows-MCP. Sin instalar, el interruptor no se puede prender y la fila tiene Instalar,
 * que corre en la consola de abajo; al terminar, la fila se pone al día.
 */
function FilaPc({ prendido, poner }: { prendido: boolean; poner: (prendido: boolean) => void }) {
  const [instalada, setInstalada] = useState<boolean | null>(null)
  const [instalando, setInstalando] = useState(false)
  /** Se intentó y no quedó instalado. */
  const [fallo, setFallo] = useState(false)
  useEffect(() => {
    void window.iridium
      .pcInstalada()
      .catch(() => false)
      .then(setInstalada)
  }, [])
  const instalar = () => {
    setInstalando(true)
    setFallo(false)
    void window.iridium
      .instalarPc()
      .catch(() => false)
      .then((listo) => {
        setInstalada(listo)
        setFallo(!listo)
        // Recién instalado, queda prendido: para eso se instaló.
        if (listo && !prendido) poner(true)
      })
      .finally(() => setInstalando(false))
  }
  // Prendido de antes y sin instalar (lo desinstalaron): se ve prendido, pero las sesiones van sin la PC.
  const falta = instalada === false
  return (
    <Ajuste
      titulo="Usar la PC"
      detalle="Mouse, teclado y capturas de pantalla"
      id="ajuste-pc"
      atributos={{ 'data-pc': prendido ? 'prendido' : 'apagado' }}
    >
      <label className="interruptor">
        <input
          type="checkbox"
          role="switch"
          aria-label="Usar la PC"
          aria-checked={prendido}
          checked={prendido}
          disabled={falta && !prendido}
          onChange={(e) => poner(e.target.checked)}
        />
        {prendido ? 'Prendido' : 'Apagado'}
      </label>
      {instalada && (
        <span className="senal">
          <Icono nombre="check" />
          Windows-MCP, instalado
        </span>
      )}
      {falta && (
        <>
          <span className={prendido ? 'senal ambar' : 'senal'} role={prendido ? 'status' : undefined}>
            {prendido && <Icono nombre="espera" />}
            Windows-MCP · falta instalarlo
          </span>
          <button type="button" className="boton chico" disabled={instalando} onClick={instalar}>
            {instalando ? 'Instalando…' : 'Instalar'}
          </button>
        </>
      )}
      {instalando && (
        <span className="expl" role="status">
          Se está instalando en la consola de abajo; al terminar, esta fila se pone al día.
        </span>
      )}
      {fallo && !instalando && (
        <span className="expl" role="status">
          No quedó instalado: mirá en la consola de abajo qué pasó y probá Instalar de nuevo.
        </span>
      )}
      <span className="expl">
        Se instala una vez, en la consola de abajo. Con la PC prendida, la IA mueve el mouse y escribe:
        prendelo solo cuando lo uses.
      </span>
    </Ajuste>
  )
}

/** Los complementos y los conectores (PA-7 a PA-9). */
function Lista({
  ajuste,
  poner,
}: {
  ajuste: AjusteCapacidades
  poner: (cambio: Partial<AjusteCapacidades>) => void
}): ReactNode {
  const [carga, setCarga] = useState<Carga>({ tipo: 'cargando' })
  const [conectando, setConectando] = useState<string | null>(null)
  /** Se muestra la lista guardada y se está pidiendo la nueva (`poniendo`), o la nueva no llegó (`sin-poner`). */
  const [alDia, setAlDia] = useState<'si' | 'poniendo' | 'sin-poner'>('si')
  const llego = useRef(false)

  const pedir = useCallback(() => {
    llego.current = false
    setCarga({ tipo: 'cargando' })
    setAlDia('si')
    // La guardada se ve solo si llega antes que la nueva.
    void window.iridium
      .capacidadesGuardadas()
      .then((v) => {
        if (v?.tipo !== 'ok' || llego.current) return
        setCarga(v)
        setAlDia('poniendo')
      })
      .catch(() => {})
    void window.iridium
      .capacidadesSesion()
      .then((v) => v ?? { tipo: 'error' as const })
      .catch(() => ({ tipo: 'error' as const }))
      .then((v) => {
        llego.current = true
        // Si falla con la guardada a la vista, queda la guardada y lo dice.
        setCarga((antes) => (v.tipo === 'error' && antes.tipo === 'ok' ? antes : v))
        setAlDia((antes) => (v.tipo === 'error' && antes === 'poniendo' ? 'sin-poner' : 'si'))
      })
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
    poner({ conectoresApagados: cambiarApagado(ajuste.conectoresApagados, nombre, prendido) })

  if (carga.tipo === 'cargando')
    return (
      <div role="status" aria-busy="true" aria-label="Leyendo lo que tiene la IA">
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
      <p className="nota-capacidades">
        La IA usa solo lo de Claude Code. Los complementos se suman en claude.ai.
      </p>
    )

  // El orden es el de cuando se abrió: apagar uno no lo mueve de lugar.
  const conectores = ordenarConectores(carga.conectores)
  return (
    <div aria-busy={alDia === 'poniendo'}>
      {alDia === 'poniendo' && (
        <p className="nota-capacidades" role="status">
          Poniéndose al día…
        </p>
      )}
      {alDia === 'sin-poner' && (
        <p className="nota-capacidades" role="status">
          Es la lista de la última vez: no se pudo poner al día.{' '}
          <button type="button" className="boton sin-fondo chico" onClick={pedir}>
            Reintentar
          </button>
        </p>
      )}
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

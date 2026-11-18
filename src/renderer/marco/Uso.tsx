// El uso de la suscripción en la barra de estado (H-12, D-045): la ventana de 5 horas y la semana con medidores finos
// (D-032). Tocándolos se despliega el detalle (R-1): cuándo se libera cada una y si el ritmo alcanza hasta el reinicio.
import { type CSSProperties, useState } from 'react'
import { fechaRelativa } from '../../compartido/fechas'
import type { RenglonArranqueVista, RitmoSemana, UsoSuscripcion, VentanaUso } from '../../compartido/puente'
import { usarEstado } from '../estado'
import { Icono } from '../ui/Icono'
import { Menu } from '../ui/Menu'
import { cuandoFue, cuandoSera, duracionDias, pc } from '../ui/tiempo'
import { cuandoYPorQue, queDejo } from './arranque'

/** Desde acá el medidor se marca en naranja, y desde USO_CRITICO en rojo (Q-77). */
export const USO_ALTO = 75
export const USO_CRITICO = 85

export function nivel(v: VentanaUso): 'agotada' | 'critica' | 'alta' | undefined {
  if (v.agotada) return 'agotada'
  if (v.usado >= USO_CRITICO) return 'critica'
  return v.usado >= USO_ALTO ? 'alta' : undefined
}

function Medidor({ etiqueta, v }: { etiqueta: string; v: VentanaUso }) {
  const estilo = { '--v': `${Math.min(100, v.usado)}%` } as CSSProperties
  return (
    <span className="medidor" data-nivel={nivel(v)}>
      {etiqueta}
      <span className="barra" style={estilo}>
        <b />
      </span>
      <span className="pc">{v.agotada ? 'agotado' : pc(v.usado)}</span>
      {v.agotada && v.libera !== null && <span className="libera">· se libera {cuandoSera(v.libera)}</span>}
    </span>
  )
}

function Ventana({ titulo, v }: { titulo: string; v: VentanaUso | null }) {
  if (!v)
    return (
      <div className="ventana-uso">
        <b>{titulo}</b>
        <span className="nota">Claude Code no la informa.</span>
      </div>
    )
  return (
    <div className="ventana-uso" data-nivel={nivel(v)}>
      <b>{titulo}</b>
      <span className="pc">{v.agotada ? 'Agotada' : `${pc(v.usado)} usado`}</span>
      <span className="barra" style={{ '--v': `${Math.min(100, v.usado)}%` } as CSSProperties}>
        <b />
      </span>
      <span className="libera">
        {v.libera === null ? 'No dice cuándo se libera.' : `Se libera ${cuandoSera(v.libera)}.`}
      </span>
    </div>
  )
}

/** El ritmo de la semana en palabras (R-1): lo que se usa por día y si alcanza hasta el reinicio. */
function Ritmo({ r, semana }: { r: RitmoSemana; semana: VentanaUso }) {
  const queda = Math.max(0, 100 - semana.usado)
  if (semana.agotada || queda === 0)
    return (
      <p className="ritmo" data-alcanza="no">
        <Icono nombre="error" />
        <span>
          La semana está agotada. Mientras tanto, Continuar no funciona en ningún proyecto; las conversaciones
          quedan para después.
        </span>
      </p>
    )
  const alcanza = r.agotaria === null
  return (
    <p className="ritmo" data-alcanza={alcanza ? 'si' : 'no'}>
      <Icono nombre={alcanza ? 'check' : 'espera'} />
      <span>
        Vas usando unos <b>{pc(r.porDia)} por día</b> (el ritmo parejo es {pc(r.parejo)}).{' '}
        {alcanza ? (
          <>
            A este ritmo llegás al reinicio: quedan {pc(queda)} para {duracionDias(r.diasQuedan)}, hasta{' '}
            {pc(r.alcanzaPorDia)} por día.
          </>
        ) : (
          <>
            A este ritmo se agota {r.agotaria !== null && cuandoSera(r.agotaria)}, antes del reinicio. Para
            llegar, hasta <b>{pc(r.alcanzaPorDia)} por día</b> en los {duracionDias(r.diasQuedan)} que faltan.
          </>
        )}
      </span>
    </p>
  )
}

/** Un momento del arranque en el detalle: «Último arranque: Alfa, hoy a las 03:02 · terminó» con Abrir, o por qué no. */
function MomentoArranque({
  r,
  ultimo,
  cerrar,
}: {
  r: RenglonArranqueVista
  ultimo: boolean
  cerrar: () => void
}) {
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  if (!r.proyecto) return <span className="que sola">{cuandoYPorQue(r)}</span>
  const p = r.proyecto
  return (
    <>
      <span className="que">
        {ultimo ? 'Último arranque: ' : ''}
        {p.nombre}, {cuandoFue(r.cuando)} ·{' '}
        <span className={p.frenan > 0 ? 'cuenta frena' : undefined}>{queDejo(p)}</span>
      </span>
      <button
        type="button"
        className="boton sin-fondo chico"
        onClick={() => {
          cerrar()
          abrirProyecto(p.ruta)
        }}
      >
        Abrir
      </button>
    </>
  )
}

/**
 * Debajo de la ventana de 5 horas, con el arranque prendido (AR-2, AR-3): lo último que pasó o, sin nada todavía, el
 * próximo. Tocándola se despliegan los de la semana, el más nuevo arriba.
 */
function ArranqueEnElUso({ cerrar }: { cerrar: () => void }) {
  const a = usarEstado((s) => s.arranque)
  const [semana, setSemana] = useState(false)
  if (!a?.prendido) return null
  const [ultimo, ...antes] = a.semana
  if (!ultimo)
    return (
      <div className="arranque-uso">
        <span className="que sola">
          Arranque prendido: el próximo, {a.proximo !== null ? cuandoSera(a.proximo) : 'sin fecha todavía'}.
        </span>
      </div>
    )
  return (
    <div className="arranque-uso">
      <MomentoArranque r={ultimo} ultimo cerrar={cerrar} />
      {antes.length > 0 && (
        <button
          type="button"
          className="boton sin-fondo chico semana-arranque"
          aria-expanded={semana}
          onClick={() => setSemana(!semana)}
        >
          {semana ? 'Ocultar los anteriores' : `Los ${antes.length} anteriores de la semana`}
        </button>
      )}
      {semana && (
        <ul>
          {antes.map((r) => (
            <li key={r.cuando}>
              <MomentoArranque r={r} ultimo={false} cerrar={cerrar} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Detalle({ uso, cerrar }: { uso: UsoSuscripcion; cerrar: () => void }) {
  return (
    <div className="detalle-uso">
      <h3>Uso de la suscripción</h3>
      <Ventana titulo="Ventana de 5 horas" v={uso.cincoHoras} />
      <ArranqueEnElUso cerrar={cerrar} />
      <Ventana titulo="Semana" v={uso.semana} />
      {uso.ritmo && uso.semana && (
        <>
          <h3>Ritmo de la semana</h3>
          <Ritmo r={uso.ritmo} semana={uso.semana} />
        </>
      )}
      <p className="nota">Lo usan todas las sesiones juntas. Leído {fechaRelativa(uso.leido, Date.now())}.</p>
    </div>
  )
}

/** En la barra de estado: los dos medidores; tocándolos, el detalle. */
export function UsoEnLaBarra() {
  const uso = usarEstado((s) => s.uso)
  const motor = usarEstado((s) => s.motor)
  if (!uso) {
    if (motor.tipo !== 'listo') return null
    return <span className="it nota-uso">Leyendo el uso…</span>
  }
  const agotada = [uso.cincoHoras, uso.semana].find((v) => v?.agotada)
  return (
    <Menu
      clase="uso"
      titulo={
        agotada
          ? 'Se agotó el uso de la suscripción: tocá para ver cuándo se libera'
          : 'Uso de la suscripción: tocá para ver cuándo se libera y si el ritmo alcanza'
      }
      boton={
        <>
          {uso.cincoHoras && <Medidor etiqueta="5 h" v={uso.cincoHoras} />}
          {uso.semana && <Medidor etiqueta="Semana" v={uso.semana} />}
          {!uso.cincoHoras && !uso.semana && 'Uso sin datos'}
        </>
      }
    >
      {(cerrar) => <Detalle uso={uso} cerrar={cerrar} />}
    </Menu>
  )
}

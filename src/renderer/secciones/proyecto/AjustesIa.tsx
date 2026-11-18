// En la barra del cuadro de la conversación (D-045, C-58): el modelo y el esfuerzo del proyecto, que valen desde el
// próximo mensaje, con el nombre de los que usa Claude Code si no se eligen (Q-77); y cuánto contexto lleva la
// conversación (H-12): un círculo que se llena con los tokens y cuándo vence la caché; tocándolo, el detalle (D-060).
import { type CSSProperties, useEffect, useState } from 'react'
import {
  type AjusteIa,
  type CategoriaContexto,
  CONTEXTO_ALTO,
  type ContextoConversacion,
  type Esfuerzo,
  type ModeloIa,
} from '../../../compartido/puente'
import { usarEstado } from '../../estado'
import { Icono } from '../../ui/Icono'
import { Menu } from '../../ui/Menu'
import { hora, pc } from '../../ui/tiempo'

const SIN_AJUSTE: AjusteIa = { modelo: null, esfuerzo: null }

export const NOMBRE_ESFUERZO: Record<Esfuerzo, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  xhigh: 'Muy alto',
  max: 'Máximo',
}

const DETALLE_ESFUERZO: Record<Esfuerzo, string> = {
  low: 'Rápido y gasta menos; para cosas simples',
  medium: 'Un equilibrio entre rapidez y cuidado',
  high: 'Piensa más antes de responder',
  xhigh: 'Para trabajo difícil; gasta más',
  max: 'Lo más profundo; gasta mucho',
}

/**
 * El nombre del modelo que usa Claude Code si no se elige otro: el de la fila con el mismo modelo de verdad («Opus
 * 5.5»), o el comienzo de su descripción («Opus 5.5 · …»). null si no se sabe.
 */
function cualEsElPredeterminado(m: ModeloIa, modelos: readonly ModeloIa[]): string | null {
  const igual = modelos.find(
    (x) => x.id !== 'default' && m.modeloReal !== null && x.modeloReal === m.modeloReal,
  )
  if (igual) return igual.nombre
  const cual = m.descripcion.split(' · ')[0]
  return cual && cual !== m.descripcion ? cual : null
}

/** El de Claude Code se llama «Default (recommended)»: en la lista, «Predeterminado (Opus 5.5)». */
function nombreModelo(m: ModeloIa, modelos: readonly ModeloIa[]): string {
  if (m.id !== 'default') return m.nombre
  const cual = cualEsElPredeterminado(m, modelos)
  return cual ? `Predeterminado (${cual})` : 'Predeterminado'
}

function descripcionModelo(m: ModeloIa): string {
  if (m.id !== 'default') return m.descripcion
  return 'El que usa Claude Code si no elegís otro'
}

function useAjuste(ruta: string) {
  const ajuste = usarEstado((s) => s.preferencias.ajustesIa[ruta]) ?? SIN_AJUSTE
  const guardar = usarEstado((s) => s.guardarPreferencias)
  const cambiar = (nuevo: AjusteIa) => {
    const todos = usarEstado.getState().preferencias.ajustesIa
    guardar({ ajustesIa: { ...todos, [ruta]: nuevo } })
  }
  return [ajuste, cambiar] as const
}

export function ModeloYEsfuerzo({ ruta }: { ruta: string }) {
  const motor = usarEstado((s) => s.motor)
  const [ajuste, cambiar] = useAjuste(ruta)
  const modelos = motor.tipo === 'listo' ? motor.modelos : []
  if (modelos.length === 0) return null
  // Sin elegir, es el de Claude Code: la fila «default».
  const elegido = modelos.find((m) => m.id === (ajuste.modelo ?? 'default')) ?? modelos[0]
  if (!elegido) return null
  const esfuerzos = elegido.esfuerzos
  const esfuerzo = ajuste.esfuerzo && esfuerzos.includes(ajuste.esfuerzo) ? ajuste.esfuerzo : null
  // Sin elegir, se ve el que se usa de verdad (Q-77): «Opus 5.5» y «Medio», no «Predeterminado».
  const nombreBoton =
    elegido.id === 'default' ? (cualEsElPredeterminado(elegido, modelos) ?? 'Predeterminado') : elegido.nombre
  const esfuerzoQueSeUsa = esfuerzo ?? elegido.esfuerzoPredeterminado

  return (
    <div className="ajustes-ia">
      <Menu
        clase="elegir-ia"
        claseBoton="boton sin-fondo chico"
        titulo={`Modelo: ${nombreModelo(elegido, modelos)}. Vale desde el próximo mensaje.`}
        boton={
          <>
            <Icono nombre="atomo" />
            <span className="nom">{nombreBoton}</span>
          </>
        }
      >
        {(cerrar) => (
          <>
            <h3>Modelo de este proyecto</h3>
            {modelos.map((m) => (
              <button
                key={m.id}
                type="button"
                role="menuitemradio"
                aria-checked={m.id === elegido.id}
                className="opcion-ia"
                onClick={() => {
                  cerrar()
                  const modelo = m.id === 'default' ? null : m.id
                  // Un esfuerzo que el modelo nuevo no tiene vuelve al de Claude Code.
                  cambiar({ modelo, esfuerzo: esfuerzo && m.esfuerzos.includes(esfuerzo) ? esfuerzo : null })
                }}
              >
                <b>{nombreModelo(m, modelos)}</b>
                <small>{descripcionModelo(m)}</small>
              </button>
            ))}
          </>
        )}
      </Menu>
      <Menu
        clase="elegir-ia"
        claseBoton="boton sin-fondo chico"
        deshabilitado={esfuerzos.length === 0}
        titulo={
          esfuerzos.length === 0
            ? 'Este modelo no tiene niveles de esfuerzo'
            : `Esfuerzo: ${esfuerzoQueSeUsa ? NOMBRE_ESFUERZO[esfuerzoQueSeUsa] : 'el de Claude Code'}${esfuerzo || !esfuerzoQueSeUsa ? '' : ' (el de Claude Code)'}. Vale desde el próximo mensaje.`
        }
        boton={
          <span className="nom">{esfuerzoQueSeUsa ? NOMBRE_ESFUERZO[esfuerzoQueSeUsa] : 'Esfuerzo'}</span>
        }
      >
        {(cerrar) => (
          <>
            <h3>Esfuerzo de este proyecto</h3>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={esfuerzo === null}
              className="opcion-ia"
              onClick={() => {
                cerrar()
                cambiar({ modelo: ajuste.modelo, esfuerzo: null })
              }}
            >
              <b>
                Predeterminado
                {elegido.esfuerzoPredeterminado && ` (${NOMBRE_ESFUERZO[elegido.esfuerzoPredeterminado]})`}
              </b>
              <small>El que usa Claude Code para este modelo</small>
            </button>
            {esfuerzos.map((e) => (
              <button
                key={e}
                type="button"
                role="menuitemradio"
                aria-checked={e === esfuerzo}
                className="opcion-ia"
                onClick={() => {
                  cerrar()
                  cambiar({ modelo: ajuste.modelo, esfuerzo: e })
                }}
              >
                <b>{NOMBRE_ESFUERZO[e]}</b>
                <small>{DETALLE_ESFUERZO[e]}</small>
              </button>
            ))}
          </>
        )}
      </Menu>
    </div>
  )
}

const miles = (n: number) => n.toLocaleString('es-AR')

/** «76k», «1M», «1,2M»: corto, como en Claude Code. */
export function tokensCortos(n: number): string {
  if (n >= 1_000_000) return `${String(Math.round(n / 100_000) / 10).replace('.', ',')}M`
  if (n >= 1000) return `${Math.round(n / 1000)}k`
  return String(n)
}

/** Desde acá el círculo se pone naranja; desde CONTEXTO_ALTO, rojo (y se sugiere Nueva). */
const CONTEXTO_MEDIO = 60

export function nivelContexto(porcentaje: number): 'alta' | 'critica' | undefined {
  if (porcentaje >= CONTEXTO_ALTO) return 'critica'
  return porcentaje >= CONTEXTO_MEDIO ? 'alta' : undefined
}

/** Los nombres del desglose, por el id que da Claude Code; uno nuevo queda con el suyo. */
const NOMBRES_CATEGORIA: Record<string, string> = {
  system_prompt: 'Instrucciones del sistema',
  system_tools: 'Herramientas',
  mcp_tools: 'Herramientas de conectores',
  mcp_instructions: 'Instrucciones de conectores',
  custom_agents: 'Agentes',
  memory_files: 'CLAUDE.md y memoria',
  skills: 'Skills',
  messages: 'La conversación',
  autocompact_buffer: 'Reserva para resumir',
  compact_buffer: 'Reserva para resumir',
  free_space: 'Libre',
}

/** Cuándo vence la caché de la conversación (ms); null si no se sabe. */
export function venceCache(c: ContextoConversacion): number | null {
  return c.cacheMs !== null && c.ultimoPedido !== null ? c.ultimoPedido + c.cacheMs : null
}

/** Lo que le queda a la caché, corto: «42 min», «1 h», «vencida». */
export function cacheCorta(vence: number, ahora: number): string {
  const falta = vence - ahora
  if (falta <= 0) return 'vencida'
  const min = Math.ceil(falta / 60_000)
  return min >= 60 ? '1 h' : `${min} min`
}

/** La hora de ahora cada medio minuto: para que la caché diga cuánto le queda sin que nadie toque nada. */
function useAhora(): number {
  const [ahora, setAhora] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])
  return ahora
}

/** Un círculo que se llena en el sentido del reloj con el porcentaje. */
function Anillo({ porcentaje }: { porcentaje: number }) {
  const r = 6
  const largo = 2 * Math.PI * r
  const lleno = (Math.min(100, Math.max(0, porcentaje)) / 100) * largo
  return (
    <svg className="anillo" viewBox="0 0 16 16" aria-hidden="true">
      <circle className="fondo" cx="8" cy="8" r={r} />
      <circle
        className="lleno"
        cx="8"
        cy="8"
        r={r}
        strokeDasharray={`${lleno} ${largo}`}
        transform="rotate(-90 8 8)"
      />
    </svg>
  )
}

function Desglose({ categorias, maximo }: { categorias: CategoriaContexto[]; maximo: number }) {
  return (
    <ul className="desglose">
      {categorias.map((c) => (
        <li key={c.id} data-clase={c.clase}>
          <span className="n">{NOMBRES_CATEGORIA[c.id] ?? c.nombre}</span>
          <span className="t">{tokensCortos(c.tokens)}</span>
          <span className="p">{pc((c.tokens / maximo) * 100)}</span>
        </li>
      ))}
    </ul>
  )
}

function Cache({ c, ahora }: { c: ContextoConversacion; ahora: number }) {
  const vence = venceCache(c)
  if (vence === null)
    return <p className="nota">Todavía no se sabe cuánto dura la caché de esta conversación.</p>
  const dura = c.cacheMs !== null && c.cacheMs >= 3_600_000 ? '1 hora' : '5 minutos'
  if (vence > ahora)
    return (
      <p className="cache" data-vencida="no">
        <Icono nombre="reloj" />
        <span>
          Vence en <b>{cacheCorta(vence, ahora)}</b> (a las {hora(vence)}; dura {dura} desde el último
          mensaje). Mientras dure, el próximo mensaje relee la conversación de la caché y gasta mucho menos.
        </span>
      </p>
    )
  return (
    <p className="cache" data-vencida="si">
      <Icono nombre="espera" />
      <span>
        Venció a las {hora(vence)}. El próximo mensaje vuelve a cargar los{' '}
        <b>{tokensCortos(c.usados)} tokens</b> de la conversación: gasta más uso que uno común. Si cambió el
        tema, conviene una <b>Nueva</b>.
      </span>
    </p>
  )
}

/** El contexto de la conversación (H-12, Q-77): el círculo, los tokens y la caché; tocándolo, el detalle. */
export function MedidorContexto({ contexto }: { contexto: ContextoConversacion }) {
  const ahora = useAhora()
  const nivel = nivelContexto(contexto.porcentaje)
  const vence = venceCache(contexto)
  const vigente = vence !== null && vence > ahora
  const cache =
    vence === null ? '' : vigente ? `; la caché vence en ${cacheCorta(vence, ahora)}` : '; la caché venció'
  return (
    <Menu
      clase="elegir-ia ctx"
      claseBoton="boton sin-fondo chico"
      titulo={`Contexto: ${miles(contexto.usados)} de ${miles(contexto.maximo)} tokens (${pc(contexto.porcentaje)})${cache}. Toca para ver el detalle.`}
      boton={
        <span className="medidor-ctx" data-nivel={nivel}>
          <Anillo porcentaje={contexto.porcentaje} />
          <span className="tok">
            {tokensCortos(contexto.usados)}/{tokensCortos(contexto.maximo)}
          </span>
          {vence !== null && (
            <span className="vence" data-vencida={vigente ? undefined : 'si'}>
              · {vigente ? cacheCorta(vence, ahora) : 'caché vencida'}
            </span>
          )}
        </span>
      }
    >
      {() => (
        <div className="detalle-ctx">
          <h3>Contexto de esta conversación</h3>
          <div className="ventana-uso" data-nivel={nivel}>
            <b>
              {miles(contexto.usados)} de {miles(contexto.maximo)} tokens
            </b>
            <span className="pc">{pc(contexto.porcentaje)}</span>
            <span
              className="barra"
              style={{ '--v': `${Math.min(100, contexto.porcentaje)}%` } as CSSProperties}
            >
              <b />
            </span>
          </div>
          {contexto.categorias ? (
            <Desglose categorias={contexto.categorias} maximo={contexto.maximo} />
          ) : (
            <p className="nota">
              El desglose lo da la IA al terminar un turno en Iridium: esta conversación siguió afuera (VS
              Code) o es anterior. Llega con el próximo turno.
            </p>
          )}
          <h3>Caché</h3>
          <Cache c={contexto} ahora={ahora} />
        </div>
      )}
    </Menu>
  )
}

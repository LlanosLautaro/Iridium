// Ajustes › IA (AJ-2, AJ-3, CO-I1): la cuenta de Claude, el nombre de la IA en la conversación y el tono, uno de los estilos de respuesta de
// Claude Code. El tono vale para las sesiones de Iridium; VS Code y la terminal siguen con el suyo.
import { useEffect, useState } from 'react'
import { type EstilosRespuesta, LARGO_AJUSTES } from '../../../compartido/puente'
import { usarEstado } from '../../estado'
import { Icono } from '../../ui/Icono'
import type { PropsSeccion } from '../Ajustes'
import { CampoTexto } from './CampoTexto'

/** Los estilos que trae Claude Code, en castellano. Los propios se muestran con su nombre y su descripción. */
const CONOCIDOS: Record<string, { nombre: string; descripcion: string }> = {
  Concise: { nombre: 'Conciso', descripcion: 'Respuestas cortas, solo lo necesario.' },
  Proactive: { nombre: 'Proactivo', descripcion: 'Toma la iniciativa y propone lo que sigue.' },
  Explanatory: { nombre: 'Explicativo', descripcion: 'Suma el porqué de lo que hace mientras trabaja.' },
  Learning: { nombre: 'Aprendizaje', descripcion: 'Explica y te deja partes chicas para hacer vos.' },
}

/** El de Claude Code: vacío, no se le pasa nada a la sesión. */
const NORMAL = { id: '', nombre: 'Normal', descripcion: 'Responde directo, sin explicaciones de más.' }

/** La sesión de Claude Code y el botón para entrar (Q-93): lo mismo que el chip de la barra, con más palabras. */
function CuentaClaude() {
  const motor = usarEstado((s) => s.motor)
  const iniciando = usarEstado((s) => s.iniciandoSesion)
  const iniciarSesion = usarEstado((s) => s.iniciarSesion)
  const plan =
    motor.tipo === 'listo' && motor.suscripcion ? ` · ${motor.suscripcion.replace(/^Claude\s+/i, '')}` : ''
  const texto = {
    verificando: 'Comprobando la sesión de Claude Code…',
    listo: `Sesión iniciada${plan}. Es la misma de VS Code y la terminal.`,
    'sin-sesion':
      'Sin sesión: la IA no puede responder. Se abre el navegador para entrar, como desde VS Code.',
    'clave-api': 'Claude Code usa una clave de API en vez de tu suscripción: gastaría por uso.',
    falla: `Claude Code no arranca${motor.tipo === 'falla' ? `: ${motor.motivo}` : ''}.`,
  }[motor.tipo]
  const conSesion = motor.tipo === 'listo'
  return (
    <div className="campo-ajuste cuenta-claude" data-motor={motor.tipo}>
      <div>
        <div className="r">Cuenta de Claude</div>
        <div className="d">
          {iniciando ? 'Terminá de entrar en el navegador; Iridium lo nota solo.' : texto}
        </div>
      </div>
      <button
        type="button"
        className={`boton ${conSesion ? 'sin-fondo' : 'principal'} chico`}
        disabled={iniciando || motor.tipo === 'verificando'}
        onClick={iniciarSesion}
      >
        <Icono nombre={iniciando ? 'sync' : 'abrir'} gira={iniciando} />
        {iniciando ? 'Esperando el navegador…' : conSesion ? 'Cambiar de cuenta' : 'Iniciar sesión'}
      </button>
    </div>
  )
}

export function Ia({ cambiar }: PropsSeccion) {
  const tono = usarEstado((s) => s.preferencias.tono)
  // undefined = todavía no llegaron; null = no se pudieron leer.
  const [estilos, setEstilos] = useState<EstilosRespuesta | undefined>(undefined)
  useEffect(() => {
    let vigente = true
    void window.iridium
      .estilosDeRespuesta()
      .catch(() => null)
      .then((e) => {
        if (vigente) setEstilos(e)
      })
    return () => {
      vigente = false
    }
  }, [])

  const opciones = [
    NORMAL,
    ...(estilos ?? [])
      .filter((e) => e.id !== 'default')
      .map((e) => ({
        id: e.id,
        nombre: CONOCIDOS[e.id]?.nombre ?? e.id,
        descripcion: CONOCIDOS[e.id]?.descripcion ?? e.descripcion ?? '',
      })),
  ]
  // Un tono guardado que Claude Code ya no ofrece se sigue mostrando, para que se vea cuál está.
  if (tono && estilos && !opciones.some((o) => o.id === tono))
    opciones.push({ id: tono, nombre: tono, descripcion: 'Ya no está en Claude Code.' })

  return (
    <>
      <CuentaClaude />
      <CampoTexto
        clave="nombreIa"
        titulo="Nombre"
        ayuda="Opcional. Si queda vacío, la conversación dice «IA»."
        sugerencia="IA"
        largo={LARGO_AJUSTES.nombreIa}
        cambiar={cambiar}
      />
      <div className="campo-ajuste">
        <div>
          <div className="r" id="ajuste-tono">
            Tono
          </div>
          <div className="d">
            Los estilos de respuesta de Claude Code. Vale para las sesiones de Iridium desde el próximo
            mensaje; VS Code y la terminal siguen con el suyo.
          </div>
        </div>
        <div />
        <div className="tonos" role="radiogroup" aria-labelledby="ajuste-tono">
          {opciones.map((o) => (
            <label key={o.id || 'normal'} className={tono === o.id ? 'tono sel' : 'tono'}>
              <input
                type="radio"
                name="tono"
                checked={tono === o.id}
                onChange={() => void cambiar({ tono: o.id })}
              />
              <span className="n">{o.nombre}</span>
              <span className="d">{o.descripcion}</span>
            </label>
          ))}
          {estilos === undefined && <p className="d cargando">Buscando los estilos de Claude Code…</p>}
          {estilos === null && (
            <p className="d">Los demás estilos aparecen cuando Claude Code esté disponible.</p>
          )}
        </div>
      </div>
    </>
  )
}

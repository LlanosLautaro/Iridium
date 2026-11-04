// El borde entre el área grande y la conversación (D-041), en un proyecto y en Proyectos (D-060): se arrastra o se
// mueve con las flechas, y el ancho es el mismo en todas las vistas. El mismo borde, del lado izquierdo, cambia el
// ancho de la lista de Skills (R-6) y el de la de Ideas.
import { type KeyboardEvent, type PointerEvent, useRef } from 'react'
import { ANCHO_CONVERSACION, ANCHO_LISTA_IDEAS, ANCHO_LISTA_SKILLS } from '../../compartido/puente'
import { usarEstado } from '../estado'

/** La vista principal necesita al menos esto (D-041): la conversación no la aplasta. */
const MINIMO_VISTA = 360

interface Limites {
  minimo: number
  inicial: number
  maximo: number
}

/**
 * Un borde que se arrastra o se mueve con las flechas (Shift, de a más); doble clic, el ancho de entrada. `lado` dice
 * dónde está lo que cambia de ancho: la conversación, a la derecha; una columna, a la izquierda.
 */
function Borde({
  ancho,
  cambiar,
  lado,
  limites,
  clase,
  nombre,
}: {
  ancho: number
  cambiar: (px: number, guardar: boolean) => void
  lado: 'derecha' | 'izquierda'
  limites: Limites
  clase: string
  nombre: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const maximo = () => {
    const zona = ref.current?.parentElement?.getBoundingClientRect().width ?? window.innerWidth
    return Math.min(limites.maximo, Math.max(limites.minimo, zona - MINIMO_VISTA - 5))
  }
  const limitar = (px: number) => Math.round(Math.min(maximo(), Math.max(limites.minimo, px)))
  const crece = lado === 'derecha' ? 'ArrowLeft' : 'ArrowRight'
  const achica = lado === 'derecha' ? 'ArrowRight' : 'ArrowLeft'
  const alTeclado = (e: KeyboardEvent) => {
    const paso = e.shiftKey ? 60 : 20
    if (e.key === crece) cambiar(limitar(ancho + paso), true)
    else if (e.key === achica) cambiar(limitar(ancho - paso), true)
    else return
    e.preventDefault()
  }
  const alApretar = (e: PointerEvent<HTMLDivElement>) => {
    const t = e.currentTarget
    const zona = t.parentElement?.getBoundingClientRect()
    const derecha = zona?.right ?? window.innerWidth
    const izquierda = zona?.left ?? 0
    t.setPointerCapture(e.pointerId)
    t.classList.add('arrastra')
    let ultimo = ancho
    const mover = (ev: globalThis.PointerEvent) => {
      ultimo = limitar(lado === 'derecha' ? derecha - ev.clientX - 2 : ev.clientX - izquierda)
      cambiar(ultimo, false)
    }
    const soltar = () => {
      t.classList.remove('arrastra')
      t.removeEventListener('pointermove', mover)
      cambiar(ultimo, true)
    }
    t.addEventListener('pointermove', mover)
    t.addEventListener('pointerup', soltar, { once: true })
  }
  return (
    // biome-ignore lint/a11y/useSemanticElements: un separador que se arrastra no tiene elemento propio.
    <div
      ref={ref}
      className={clase}
      role="separator"
      tabIndex={0}
      title={`Arrastrá para cambiar el ancho de ${nombre} (doble clic: el de entrada)`}
      aria-orientation="vertical"
      aria-label={`Ancho de ${nombre} (flechas para cambiarlo)`}
      aria-valuemin={limites.minimo}
      aria-valuemax={limites.maximo}
      aria-valuenow={ancho}
      onKeyDown={alTeclado}
      onPointerDown={alApretar}
      onDoubleClick={() => cambiar(limitar(limites.inicial), true)}
    />
  )
}

/** El borde de la conversación. */
export function Divisor({
  ancho,
  cambiar,
}: {
  ancho: number
  cambiar: (px: number, guardar: boolean) => void
}) {
  return (
    <Borde
      ancho={ancho}
      cambiar={cambiar}
      lado="derecha"
      limites={ANCHO_CONVERSACION}
      clase="divisor"
      nombre="la conversación"
    />
  )
}

/** El borde derecho de la lista de Skills (R-6): queda sobre la línea de la columna, sin ocupar lugar. */
export function DivisorListaSkills({ ancho }: { ancho: number }) {
  return (
    <Borde
      ancho={ancho}
      cambiar={cambiarAnchoListaSkills}
      lado="izquierda"
      limites={ANCHO_LISTA_SKILLS}
      clase="divisor-columna"
      nombre="la lista de skills"
    />
  )
}

/** El borde derecho de la lista de Ideas: como el de Skills, con su propio ancho. */
export function DivisorListaIdeas({ ancho }: { ancho: number }) {
  return (
    <Borde
      ancho={ancho}
      cambiar={cambiarAnchoListaIdeas}
      lado="izquierda"
      limites={ANCHO_LISTA_IDEAS}
      clase="divisor-columna"
      nombre="la lista de ideas"
    />
  )
}

/** El ancho de la conversación: mientras se arrastra solo se ve; al soltar, se guarda (es el mismo en todas). */
export function cambiarAncho(px: number, guardar: boolean): void {
  const s = usarEstado.getState()
  if (guardar) s.guardarPreferencias({ anchoConversacion: px })
  else s.ponerPreferencias({ ...s.preferencias, anchoConversacion: px })
}

function cambiarAnchoListaSkills(px: number, guardar: boolean): void {
  const s = usarEstado.getState()
  if (guardar) s.guardarPreferencias({ anchoListaSkills: px })
  else s.ponerPreferencias({ ...s.preferencias, anchoListaSkills: px })
}

function cambiarAnchoListaIdeas(px: number, guardar: boolean): void {
  const s = usarEstado.getState()
  if (guardar) s.guardarPreferencias({ anchoListaIdeas: px })
  else s.ponerPreferencias({ ...s.preferencias, anchoListaIdeas: px })
}

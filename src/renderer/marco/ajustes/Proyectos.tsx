// Ajustes › Proyectos (CO-I4, modulos/compartir/ux.md › CO-4): la carpeta de proyectos y el cuadro para elegir otra;
// adentro, `.iridium` con Ideas y Skills (D-087). Mientras la IA trabaja no se cambia: esa sesión quedaría en una
// carpeta que Iridium dejó de mirar.
import { useState } from 'react'
import { usarEstado } from '../../estado'
import { Icono } from '../../ui/Icono'

export function Proyectos() {
  return (
    <>
      <CarpetaDeProyectos />
      <CarpetaIridium />
    </>
  )
}

/** Dónde están Ideas y Skills: `.iridium`, dentro de la carpeta de proyectos (D-087). Va con ella: no se elige aparte. */
function CarpetaIridium() {
  const lista = usarEstado((s) => s.lista)
  return (
    <div className="campo-ajuste carpeta-iridium">
      <div>
        <div className="r">Carpeta de Iridium</div>
        <div className="d">
          Ideas y Skills (el chat general, tus ideas y tus skills propias) viven en <code>.iridium</code>,
          dentro de la carpeta de proyectos, como en un vault de Obsidian. Si cambiás la carpeta de proyectos,
          Iridium ofrece traerlas.
        </div>
      </div>
      <span className="ruta">{lista?.iridium.carpeta ?? 'Leyendo…'}</span>
    </div>
  )
}

function CarpetaDeProyectos() {
  const lista = usarEstado((s) => s.lista)
  const ponerLista = usarEstado((s) => s.ponerLista)
  const trabajando = usarEstado((s) => s.fichas.some((f) => f.estado === 'trabajando'))
  const [eligiendo, setEligiendo] = useState(false)

  const cambiar = async () => {
    setEligiendo(true)
    try {
      const nueva = await window.iridium.elegirCarpeta()
      if (nueva) ponerLista(nueva)
    } finally {
      setEligiendo(false)
    }
  }

  const falta = lista?.tipo === 'error'
  let detalle = 'Iridium muestra como proyecto cada carpeta que está adentro.'
  if (falta) detalle = 'No se encuentra; elegí otra o conectá el disco.'
  if (trabajando) detalle = 'Esperá a que termine la IA: trabaja en un proyecto de esta carpeta.'

  return (
    <div className="campo-ajuste carpeta-proyectos" data-falta={falta || undefined}>
      <div>
        <div className="r">Carpeta de proyectos</div>
        <div className="d">{detalle}</div>
      </div>
      <button
        type="button"
        className={`boton ${falta ? 'principal' : 'sin-fondo'} chico`}
        disabled={eligiendo || trabajando || lista === null}
        onClick={() => void cambiar()}
      >
        <Icono nombre="carpeta" />
        Cambiar…
      </button>
      <span className="ruta">{lista?.raiz ?? 'Leyendo…'}</span>
    </div>
  )
}

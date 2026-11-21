// Ajustes › Proyectos (CO-I4, modulos/compartir/ux.md › CO-4): la carpeta de proyectos y el cuadro para elegir otra;
// adentro, `.iridium` con Ideas y Skills (D-087). Mientras la IA trabaja no se cambia: esa sesión quedaría en una
// carpeta que Iridium dejó de mirar.
import { useState } from 'react'
import { usarEstado } from '../../estado'
import { Icono } from '../../ui/Icono'
import { Ajuste } from './Ajuste'

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
    <Ajuste
      titulo="Carpeta de Iridium"
      detalle="Donde viven Ideas y Skills: va con la carpeta de proyectos"
      clase="carpeta-iridium"
    >
      <span className="fija">{lista?.iridium.carpeta ?? 'Leyendo…'}</span>
      <span className="expl">
        El chat general, tus ideas y tus skills propias viven en <code>.iridium</code>, dentro de la carpeta
        de proyectos, como en un vault de Obsidian. Si cambias la carpeta de proyectos, Iridium ofrece
        traerlas.
      </span>
    </Ajuste>
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
  let aviso = ''
  if (falta) aviso = 'No se encuentra; elige otra o conecta el disco.'
  if (trabajando) aviso = 'Espera a que termine la IA: trabaja en un proyecto de esta carpeta.'

  return (
    <Ajuste
      titulo="Carpeta de proyectos"
      detalle="Cada carpeta que está adentro es un proyecto"
      clase="carpeta-proyectos"
      atributos={{ 'data-falta': falta ? '' : undefined }}
    >
      <span className="fija">{lista?.raiz ?? 'Leyendo…'}</span>
      <button
        type="button"
        className={`boton ${falta ? 'principal' : 'sin-fondo'} chico`}
        disabled={eligiendo || trabajando || lista === null}
        onClick={() => void cambiar()}
      >
        <Icono nombre="carpeta" />
        Cambiar…
      </button>
      {aviso && <span className="expl">{aviso}</span>}
    </Ajuste>
  )
}

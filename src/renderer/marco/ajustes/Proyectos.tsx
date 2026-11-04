// Ajustes › Proyectos (CO-I4, modulos/compartir/ux.md › CO-4): la carpeta de proyectos y el cuadro para elegir otra;
// la carpeta Iridium, con Ideas y Skills (D-083). Mientras la IA trabaja no se cambian: esa sesión quedaría en una
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

/** Cambiar lleva Ideas y Skills a la carpeta elegida, con su historial y sus conversaciones (D-083). */
function CarpetaIridium() {
  const lista = usarEstado((s) => s.lista)
  const ponerLista = usarEstado((s) => s.ponerLista)
  const ponerPreferencias = usarEstado((s) => s.ponerPreferencias)
  const trabajando = usarEstado((s) => s.fichas.some((f) => f.estado === 'trabajando'))
  const [eligiendo, setEligiendo] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)

  const cambiar = async () => {
    setEligiendo(true)
    setResultado(null)
    try {
      const r = await window.iridium.cambiarCarpetaIridium()
      if (r.tipo === 'ok') {
        ponerLista(r.lista)
        ponerPreferencias(await window.iridium.leerPreferencias())
        if (r.avisos.length > 0) setResultado(r.avisos.join(' '))
      } else if (r.tipo === 'error') setResultado(r.mensaje)
    } finally {
      setEligiendo(false)
    }
  }

  let detalle =
    'Ideas y Skills: el chat general, tus ideas y tus skills propias. Cambiar las lleva a la carpeta elegida.'
  if (trabajando) detalle = 'Esperá a que termine la IA: no se mueve una carpeta mientras trabaja.'

  return (
    <div className="campo-ajuste carpeta-iridium">
      <div>
        <div className="r">Carpeta Iridium</div>
        <div className="d">{resultado ?? detalle}</div>
      </div>
      <button
        type="button"
        className="btn secundario chico"
        disabled={eligiendo || trabajando || lista === null}
        onClick={() => void cambiar()}
      >
        <Icono nombre="carpeta" />
        {eligiendo ? 'Moviendo…' : 'Cambiar…'}
      </button>
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
        className={`btn ${falta ? 'primario' : 'secundario'} chico`}
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

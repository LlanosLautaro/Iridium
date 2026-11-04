// La columna de la sección Skills (SK-W1): la entrada fija Proyectos atrasados y las skills en grupos plegables por
// origen, con la marca de las que están dos veces.
import type { ReactNode } from 'react'
import {
  type Atrasados,
  type ListaSkills,
  NOMBRE_ORIGEN,
  ORIGENES,
  type OrigenSkill,
} from '../../../compartido/skills'
import { Icono } from '../../ui/Icono'
import { primeraLinea } from './textos'

/** Los grupos de afuera empiezan plegados si pasan de esto (SK-W1 › Extremos). */
const PLEGAR_DESDE = 10

/** Los grupos plegados cuando todavía no se tocó ninguno. */
export function plegadosAlEmpezar(lista: ListaSkills): string[] {
  return (['complemento', 'cuenta'] as const).filter(
    (o) => lista.skills.filter((s) => s.origen === o).length > PLEGAR_DESDE,
  )
}

export const ATRASADOS = 'atrasados'

export function ListaDeSkills({
  lista,
  atrasados,
  elegida,
  elegir,
  plegados,
  plegar,
  reintentar,
  abrir,
}: {
  lista: ListaSkills
  atrasados: Atrasados | null
  elegida: string
  elegir: (id: string) => void
  plegados: readonly string[]
  plegar: (origen: OrigenSkill) => void
  reintentar: () => void
  /** Abrir como proyecto (IN-3); null si no está la carpeta Skills. */
  abrir: ReactNode
}) {
  const dobles = new Set(lista.skills.filter((s) => s.doble).map((s) => s.nombre.split(':').pop())).size
  const n = atrasados?.proyectos.length ?? 0
  const alDia = atrasados !== null && atrasados.vigente !== null && n === 0
  return (
    <nav className="columna sk-columna" aria-label="Skills">
      <div className="titulo">
        <h1>Skills</h1>
        <span className="n">{lista.skills.length}</span>
        {dobles > 0 && (
          <span className="sk-dobles" title="Skills que están dos veces">
            <Icono nombre="espera" />
            {dobles === 1 ? '1 doble' : `${dobles} dobles`}
          </span>
        )}
        {abrir}
      </div>
      <div className="lista">
        <button
          type="button"
          className="proy sk-atrasados"
          aria-current={elegida === ATRASADOS}
          onClick={() => elegir(ATRASADOS)}
        >
          <Icono nombre={alDia ? 'check' : 'sync'} />
          <span className="nom">{alDia ? 'Todos al día' : 'Proyectos atrasados'}</span>
          {!alDia && atrasados !== null && atrasados.vigente !== null && (
            <span className="cuenta frena">{n}</span>
          )}
        </button>
        {lista.skills.length === 0 && lista.errores.length === 0 && (
          <p className="sk-nota">
            No hay skills en esta PC. Miré en <code>{lista.carpetaClaude}</code>.
          </p>
        )}
        {ORIGENES.map((o) => {
          const del = lista.skills.filter((s) => s.origen === o)
          const error = lista.errores.find((e) => e.origenes.includes(o))
          if (del.length === 0 && !error) return null
          const plegado = plegados.includes(o)
          return (
            <div key={o} className="sk-grupo">
              <button
                type="button"
                className="sk-grupo-tit"
                aria-expanded={!plegado}
                onClick={() => plegar(o)}
                title={plegado ? 'Mostrar el grupo' : 'Plegar el grupo'}
              >
                <span className={plegado ? 'chev' : 'chev abierto'}>
                  <Icono nombre="chev" />
                </span>
                {NOMBRE_ORIGEN[o]}
                <span className="n">{del.length}</span>
              </button>
              {error && !plegado && (
                <div className="sk-error" role="alert">
                  <span>
                    No se pudo leer <code>{error.carpeta}</code>
                  </span>
                  <button type="button" className="btn secundario chico" onClick={reintentar}>
                    <Icono nombre="reintentar" />
                    Reintentar
                  </button>
                </div>
              )}
              {!plegado &&
                del.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="sk-fila"
                    aria-current={elegida === s.id}
                    onClick={() => elegir(s.id)}
                    title={s.nombre}
                  >
                    <span className="sk-nombre">
                      {(s.doble || s.problema === 'enlace-roto') && (
                        <span className="sk-marca" title={s.doble ? 'Está dos veces' : 'El enlace está roto'}>
                          <Icono nombre="espera" />
                        </span>
                      )}
                      <span className="nom">{s.nombre}</span>
                    </span>
                    <span className="sk-desc">{primeraLinea(s.descripcion)}</span>
                  </button>
                ))}
            </div>
          )
        })}
      </div>
    </nav>
  )
}

export function SiluetasLista() {
  return (
    <nav className="columna sk-columna" aria-label="Skills">
      <div className="titulo">
        <h1>Skills</h1>
      </div>
      <div className="lista carga" role="status" aria-busy="true" aria-label="Leyendo las skills">
        {[70, 55, 80, 60, 75].map((w) => (
          <div key={w} className="proy-silueta">
            <span className="linea-silueta" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </nav>
  )
}

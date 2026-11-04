// La columna de la sección Ideas (IN-W1): las ideas de `ideas.md` en grupos plegables por sección, en su orden, con el
// título y la fecha de cada una. Arriba, cuántas faltan integrar y Abrir como proyecto.
import type { ListaIdeas, SeccionIdeas } from '../../../compartido/ideas'
import { Icono } from '../../ui/Icono'
import { AbrirComoProyecto } from '../inicio/AbrirComoProyecto'
import { fechaCorta } from './textos'

/** Las secciones plegadas cuando todavía no se tocó ninguna: las Integradas. */
export function plegadosAlEmpezar(secciones: readonly SeccionIdeas[]): string[] {
  return secciones.filter((s) => s.integradas).map((s) => s.titulo)
}

/** Cuántas ideas no pasaron todavía a un proyecto. */
export function sinIntegrar(lista: ListaIdeas | null): number {
  if (lista?.tipo !== 'ideas') return 0
  return lista.secciones.reduce((n, s) => n + s.ideas.filter((i) => !i.integrada).length, 0)
}

/** El título de la columna, con Abrir como proyecto (IN-3). */
function Titulo({ lista, abrir }: { lista: ListaIdeas | null; abrir: (() => void) | null }) {
  const n = sinIntegrar(lista)
  return (
    <div className="titulo">
      <h1>Ideas</h1>
      {lista?.tipo === 'ideas' && (
        <span className="n" title="Ideas que todavía no pasaron a un proyecto">
          {n} sin integrar
        </span>
      )}
      {abrir && <AbrirComoProyecto abrir={abrir} carpeta="Ideas" />}
    </div>
  )
}

export function ListaDeIdeas({
  lista,
  elegida,
  elegir,
  plegados,
  plegar,
  abrir,
}: {
  lista: ListaIdeas
  elegida: string | null
  elegir: (titulo: string) => void
  plegados: readonly string[]
  plegar: (seccion: string) => void
  abrir: (() => void) | null
}) {
  return (
    <nav className="columna sk-columna id-columna" aria-label="Ideas">
      <Titulo lista={lista} abrir={abrir} />
      <div className="lista">
        {lista.tipo === 'sin-secciones' && <p className="sk-nota">Sin secciones</p>}
        {lista.tipo === 'ideas' && lista.secciones.every((s) => s.ideas.length === 0) && (
          <p className="sk-nota">Todavía no hay ideas anotadas.</p>
        )}
        {lista.tipo === 'ideas' &&
          lista.secciones.map((s) => {
            const plegado = plegados.includes(s.titulo)
            return (
              <div key={s.titulo} className="sk-grupo">
                <button
                  type="button"
                  className="sk-grupo-tit"
                  aria-expanded={!plegado}
                  onClick={() => plegar(s.titulo)}
                  title={s.explicacion ?? (plegado ? 'Mostrar el grupo' : 'Plegar el grupo')}
                >
                  <span className={plegado ? 'chev' : 'chev abierto'}>
                    <Icono nombre="chev" />
                  </span>
                  <span className="nom">{s.titulo}</span>
                  <span className="n">{s.ideas.length}</span>
                </button>
                {!plegado &&
                  s.ideas.map((i) => (
                    <button
                      key={i.titulo}
                      type="button"
                      className="sk-fila"
                      aria-current={elegida === i.titulo}
                      onClick={() => elegir(i.titulo)}
                      title={i.titulo}
                    >
                      <span className="sk-nombre">
                        <span className="nom">{i.titulo}</span>
                      </span>
                      <span className="sk-desc">
                        {[i.fecha && fechaCorta(i.fecha), i.toca.map((t) => t.nombre).join(' · ')]
                          .filter(Boolean)
                          .join(' · ') || ' '}
                      </span>
                    </button>
                  ))}
              </div>
            )
          })}
      </div>
    </nav>
  )
}

export function SiluetasIdeas({ abrir }: { abrir: (() => void) | null }) {
  return (
    <nav className="columna sk-columna id-columna" aria-label="Ideas">
      <Titulo lista={null} abrir={abrir} />
      <div className="lista carga" role="status" aria-busy="true" aria-label="Leyendo las ideas">
        {[70, 55, 80, 60, 75].map((w) => (
          <div key={w} className="proy-silueta">
            <span className="linea-silueta" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </nav>
  )
}

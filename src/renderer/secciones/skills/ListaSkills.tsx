// La columna de la sección Skills (SK-W1, W-13; DI-I3, tanda 9: la maqueta `docs/diseno/pantallas/skills.html`): la
// entrada fija Framework, con los proyectos fuera del framework, y las skills en Bloques por origen, cada una una Fila
// con la señal de las que están dos veces. Un grupo plegado es una fila gris con su cuenta y, si esconde una doble,
// su señal (T-18).
import type { ReactNode } from 'react'
import {
  fueraDelFramework,
  type ListaSkills,
  NOMBRE_ORIGEN,
  ORIGENES,
  type OrigenSkill,
  type ProyectoFramework,
  type Skill,
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

export const FRAMEWORK = 'framework'

/** La señal de una skill que necesita algo (Señal, PZ-7): está dos veces o su enlace está roto. */
function SenalSkill({ s }: { s: Skill }) {
  if (s.doble)
    return (
      <span className="senal ambar" title="Está dos veces">
        doble
      </span>
    )
  if (s.problema === 'enlace-roto')
    return (
      <span className="senal rojo" title="El enlace está roto">
        enlace roto
      </span>
    )
  return null
}

/** El título de la columna: el de la sección, para el foco y el lector, con Abrir como proyecto a la derecha. */
function Titulo({ abrir }: { abrir?: ReactNode }) {
  return (
    <div className="sk-titulo">
      <h1>Skills</h1>
      {abrir}
    </div>
  )
}

export function ListaDeSkills({
  lista,
  framework,
  elegida,
  elegir,
  plegados,
  plegar,
  reintentar,
  abrir,
}: {
  lista: ListaSkills
  /** Cómo está cada proyecto con el framework; null mientras se lee. */
  framework: ProyectoFramework[] | null
  elegida: string
  elegir: (id: string) => void
  plegados: readonly string[]
  plegar: (origen: OrigenSkill) => void
  reintentar: () => void
  /** Abrir como proyecto (IN-3); null si no está la carpeta Skills. */
  abrir: ReactNode
}) {
  const fuera = framework?.filter((p) => fueraDelFramework(p.estado)).length ?? 0
  return (
    <nav className="sk-columna" aria-label="Skills">
      <Titulo abrir={abrir} />
      <div className="filas">
        <button
          type="button"
          className={elegida === FRAMEWORK ? 'fila elegida sk-framework' : 'fila sk-framework'}
          aria-current={elegida === FRAMEWORK}
          title={
            fuera === 0
              ? 'Todos los proyectos siguen el framework'
              : `${fuera === 1 ? 'Un proyecto' : `${fuera} proyectos`} fuera del framework`
          }
          onClick={() => elegir(FRAMEWORK)}
        >
          <span className="principal-fila">
            <span className="titulo-fila">Framework</span>
          </span>
          {fuera > 0 && <span className="cuenta">{fuera} fuera</span>}
        </button>
      </div>
      {lista.skills.length === 0 && lista.errores.length === 0 && (
        <div className="recuadro vacio">
          <span>
            No hay skills en esta PC. Se buscó en <code>{lista.carpetaClaude}</code>.
          </span>
        </div>
      )}
      {ORIGENES.map((o) => {
        const del = lista.skills.filter((s) => s.origen === o)
        const error = lista.errores.find((e) => e.origenes.includes(o))
        if (del.length === 0 && !error) return null
        const plegado = plegados.includes(o)
        // Plegado, el grupo lleva la señal de sus dobles para que no queden escondidas (T-18).
        const dobles = del.filter((s) => s.doble).length
        const nombre = (
          <>
            <span className="principal-fila">
              <span className="titulo-fila">{NOMBRE_ORIGEN[o]}</span>
            </span>
            <span className="cuenta">{del.length}</span>
            {dobles > 0 && (
              <span
                className="senal ambar"
                title={dobles === 1 ? 'Una está dos veces' : `${dobles} están dos veces`}
              >
                doble
              </span>
            )}
          </>
        )
        if (plegado)
          return (
            <button
              key={o}
              type="button"
              className="fila sk-plegado"
              aria-expanded={false}
              title="Mostrar el grupo"
              onClick={() => plegar(o)}
            >
              {nombre}
            </button>
          )
        return (
          <section key={o} className="bloque sk-origen" aria-label={NOMBRE_ORIGEN[o]}>
            <h2 className="bloque-titulo sk-titulo-origen">
              <button
                type="button"
                className="sk-plegar"
                aria-expanded={true}
                title="Plegar el grupo"
                onClick={() => plegar(o)}
              >
                {NOMBRE_ORIGEN[o]} <span className="cuenta">{del.length}</span>
              </button>
            </h2>
            {error && (
              <div className="recuadro error" role="alert">
                <Icono nombre="error" />
                <div className="cuerpo-recuadro">
                  <span>
                    No se pudo leer <code>{error.carpeta}</code>
                  </span>
                  <div className="acciones-recuadro">
                    <button type="button" className="boton secundario chico" onClick={reintentar}>
                      <Icono nombre="reintentar" />
                      Reintentar
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="filas">
              {del.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={
                    elegida === s.id ? 'fila con-detalle elegida sk-skill' : 'fila con-detalle sk-skill'
                  }
                  aria-current={elegida === s.id}
                  onClick={() => elegir(s.id)}
                  title={s.nombre}
                >
                  <span className="principal-fila">
                    <span className="titulo-fila">{s.nombre}</span>
                    <span className="detalle">{primeraLinea(s.descripcion)}</span>
                  </span>
                  <SenalSkill s={s} />
                </button>
              ))}
            </div>
          </section>
        )
      })}
    </nav>
  )
}

export function SiluetasLista() {
  return (
    <nav className="sk-columna" aria-label="Skills">
      <Titulo />
      <div className="filas" role="status" aria-busy="true" aria-label="Leyendo las skills">
        {[70, 55, 80, 60, 75].map((w) => (
          <div key={w} className="sk-silueta">
            <span className="linea-silueta" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </nav>
  )
}

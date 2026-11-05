// Las skills del proyecto (R-8, D-089): las de su `.claude/skills/`, que Claude Code carga solo en este proyecto. El
// ícono sale en la barra solo si tiene alguna. Ver abre su `SKILL.md` en Archivos.
import { useEffect, useState } from 'react'
import type { SkillProyecto } from '../../../compartido/skills'
import { tarjetaDe, usarEstado } from '../../estado'
import { Icono } from '../../ui/Icono'

export function SkillsProyecto({ ruta }: { ruta: string }) {
  const [skills, setSkills] = useState<SkillProyecto[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abrirArchivo = usarEstado((s) => s.abrirArchivo)
  // La tarjeta cambia cuando cambia una skill del proyecto (la vigilancia relee la lista): se relee con ella.
  const tarjeta = usarEstado((s) => tarjetaDe(s.lista, ruta))
  // biome-ignore lint/correctness/useExhaustiveDependencies: se relee cuando cambia la tarjeta.
  useEffect(() => {
    void window.iridium.skillsProyecto(ruta).then(
      (l) => {
        setSkills(l)
        setError(null)
      },
      (e: unknown) => setError(e instanceof Error ? e.message : String(e)),
    )
  }, [ruta, tarjeta])

  return (
    <div className="scripts skills-proyecto">
      <div className="scripts-col">
        <div className="cab-scripts">
          <h2>Skills del proyecto</h2>
        </div>
        <p className="nota">
          Las de <code>.claude/skills/</code>: Claude Code las carga solo cuando trabaja en este proyecto,
          además de las de la PC (las ves en Skills, en el inicio).
        </p>
        {error && (
          <p className="script-msg error" role="alert">
            <Icono nombre="error" />
            No se pudieron leer: {error}
          </p>
        )}
        {!skills && !error && <p className="nota">Leyendo…</p>}
        {skills?.length === 0 && <p className="nota">Este proyecto no tiene skills propias.</p>}
        {skills?.map((s) => (
          <div key={s.archivo} className="script skill-proyecto">
            <div className="script-cab">
              <h4>{s.nombre}</h4>
              <button
                type="button"
                className="btn secundario chico"
                title={`Ver ${s.archivo} en Archivos`}
                onClick={() => abrirArchivo(ruta, s.archivo)}
              >
                <Icono nombre="archivos" />
                Ver
              </button>
            </div>
            <p className="script-desc">{s.descripcion ?? 'Su SKILL.md no tiene descripción.'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Lo que la sección Skills (modulos/skills/) recibe del proceso principal: las skills de la PC por origen, las copias
// dobles y los proyectos con un formato viejo de la guía (D-068).

/** De dónde llega una skill (modulos/skills/diseno-tecnico.md › Dónde se leen las skills). */
export const ORIGENES = ['propia', 'tercero', 'complemento', 'cuenta'] as const
export type OrigenSkill = (typeof ORIGENES)[number]

/** El título de cada grupo de la lista, en su orden (SK-1). */
export const NOMBRE_ORIGEN: Record<OrigenSkill, string> = {
  propia: 'Propias',
  tercero: 'Copias de terceros',
  complemento: 'De complementos',
  cuenta: 'Desde la cuenta',
}

/** La otra copia de una skill que está dos veces (SK-2, D-014). */
export interface CopiaDoble {
  /** La carpeta de la otra copia (su `id`). */
  otra: string
  otraNombre: string
  otraOrigen: OrigenSkill
  otraComplemento: string | null
  /** Cuál sobra: esta, la otra o no se sabe (dos que se actualizan solas). */
  sobra: 'esta' | 'otra' | null
  /** Una línea con el motivo, o dónde está cada una si no se elige. */
  motivo: string
}

export interface Skill {
  /** La carpeta de la skill, como se ve en la carpeta de Claude (para las propias, el enlace). Es única. */
  id: string
  /** Como la nombra Claude Code: `hitos-desarrollo-app`, o `engineering:debug` si es de un complemento. */
  nombre: string
  descripcion: string | null
  origen: OrigenSkill
  /** El complemento del que llega (`engineering`, `design`…); null si no es de uno. */
  complemento: string | null
  /** Adónde lleva el enlace (solo las propias y los enlaces que llevan afuera). */
  destino: string | null
  /** Algo que no está bien: el `SKILL.md` sin descripción o un enlace que no lleva a ningún lado. */
  problema: 'sin-descripcion' | 'enlace-roto' | null
  doble: CopiaDoble | null
}

export interface ListaSkills {
  /** La carpeta de Claude que se miró (`%USERPROFILE%\.claude`). */
  carpetaClaude: string
  skills: Skill[]
  /** Los grupos que no se pudieron leer, con la carpeta que falló; los demás se muestran igual. */
  errores: { origenes: OrigenSkill[]; carpeta: string }[]
}

/** El formato de un proyecto atrasado (SK-4). */
export type FormatoProyecto = { tipo: 'fecha'; fecha: string } | { tipo: 'sin-formato' } | { tipo: 'marcado' }

export interface ProyectoAtrasado {
  ruta: string
  nombre: string
  inicial: string
  icono: string | null
  formato: FormatoProyecto
}

export interface Atrasados {
  /** La fecha del formato vigente de la guía (AAAA-MM-DD); null si la guía no lo dice. */
  vigente: string | null
  proyectos: ProyectoAtrasado[]
}

/** El pedido de Poner al día (diseno-tecnico.md › Proyectos atrasados, 4). */
export const MENSAJE_PONER_AL_DIA =
  'Poné al día el formato de la documentación de este proyecto: seguí `references/actualizar-formato.md` de la ' +
  'guía `hitos-desarrollo-app`.'

/** Una skill del proyecto (R-8): de su `.claude/skills/`, que Claude Code carga solo en ese proyecto. */
export interface SkillProyecto {
  /** Como la nombra el `SKILL.md` (o su carpeta, si no lo dice). */
  nombre: string
  descripcion: string | null
  /** El `SKILL.md`, relativo al proyecto con `/`: se abre en Archivos. */
  archivo: string
}

// Lo que la sección Skills (modulos/skills/) recibe del proceso principal: las skills de la PC por origen, las copias
// dobles y cómo está cada proyecto con el framework (Skills › Framework, frente Orden, W-13).
import type { Cita } from './citas'

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

/**
 * Cómo está un proyecto con el framework (W-13, H-20): al día (con la fecha de su `**Framework:**`), con avisos del
 * control, de framework viejo (con la fecha del formato de la guía, si la dice) o carpeta simple (sin `estado.md`).
 */
export type EstadoFramework =
  | { tipo: 'al-dia'; fecha: string | null; novedades?: NovedadFramework[] }
  | { tipo: 'avisos'; fecha: string | null; avisos: string[]; novedades?: NovedadFramework[] }
  | { tipo: 'viejo'; fecha: string | null }
  | { tipo: 'carpeta' }

export interface ProyectoFramework {
  ruta: string
  nombre: string
  inicial: string
  icono: string | null
  estado: EstadoFramework
}

/**
 * Una novedad del framework (T-64, D-118): un cambio que le pide algo a los proyectos, con su fecha. Sale de
 * `novedades.md` del framework; un proyecto la tiene si es más nueva que su `**Framework:**` y le toca.
 */
export interface NovedadFramework {
  fecha: string
  /** Qué cambió, en una línea. */
  titulo: string
  /** Qué le pide al proyecto (markdown corto). */
  texto: string
  /**
   * Solo les toca a los proyectos que tienen alguno de estos archivos o carpetas (relativos, con `/`; D-209: la
   * configuración de Playwright tiene tres nombres); null, a todos.
   */
  soloSi: string[] | null
}

/** Las novedades que tiene un proyecto (al día o con avisos); vacío si no tiene. */
export function novedadesDe(e: EstadoFramework): NovedadFramework[] {
  return e.tipo === 'al-dia' || e.tipo === 'avisos' ? (e.novedades ?? []) : []
}

/** «1 novedad», «2 novedades». */
export function cuentaNovedades(n: number): string {
  return n === 1 ? '1 novedad' : `${n} novedades`
}

/** El texto de una novedad para mirar, sin las comillas del código. */
export function textoParaMirar(t: string): string {
  return t.replace(/`([^`]*)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1')
}

/**
 * El pedido de Ponerse al día (T-64, D-118, D-196): lo que pide cada novedad, y al terminar la fecha del framework a la
 * de la última. Se cita en la conversación del proyecto y lo manda el usuario.
 */
export function mensajePonerseAlDia(novedades: readonly NovedadFramework[]): string {
  // La última, en el orden del archivo (del más viejo al más nuevo): su fecha y su título (T-145), para que una novedad
  // posterior del mismo día no cuente como vista.
  const u = novedades.reduce<NovedadFramework | null>(
    (m, n) => (m === null || n.fecha >= m.fecha ? n : m),
    null,
  )
  const ultima = u ? `${u.fecha} · ${u.titulo}` : ''
  const lista = novedades.map((n) => `- **${n.fecha} — ${n.titulo}.** ${n.texto.replace(/\s*\n\s*/g, ' ')}`)
  return [
    `Ponete al día con el framework de Iridium (la skill \`iridium\`): ${novedades.length === 1 ? 'cambió una cosa que le pide algo' : `cambiaron ${novedades.length} cosas que le piden algo`} a este proyecto desde la fecha de \`**Framework:**\` de \`docs/README.md\`.`,
    '',
    ...lista,
    '',
    `Hacé lo que pide cada una (si alguna no aplica, decí por qué), y al terminar poné \`**Framework:** ${ultima}\` en \`docs/README.md\`. Si algo necesita una decisión mía, dejalo como pregunta.`,
  ].join('\n')
}

/** Ponerse al día como cita (D-196): queda arriba del campo de la conversación del proyecto. */
export function citaPonerseAlDia(novedades: readonly NovedadFramework[]): Cita {
  return {
    clave: 'framework:ponerse-al-dia',
    tipo: 'Framework',
    nombre: `Ponerse al día · ${cuentaNovedades(novedades.length)}`,
    texto: mensajePonerseAlDia(novedades),
  }
}

/** Fuera del framework: de framework viejo o con avisos. Las carpetas simples no cuentan (W-13). */
export function fueraDelFramework(e: EstadoFramework): boolean {
  return e.tipo === 'viejo' || e.tipo === 'avisos'
}

/**
 * El pedido de Pasar al framework (F-9, T-49): cita la referencia del framework, que lo lleva hasta que el control dé
 * cero. El motor falso lo reconoce por `pasar-al-framework.md`.
 */
export const MENSAJE_PASAR_AL_FRAMEWORK =
  'Pasá este proyecto al framework de Iridium: seguí `referencias/pasar-al-framework.md` del framework ' +
  '(la skill `iridium`) hasta que el control dé cero.'

/**
 * Pasar al framework como cita (D-196, T-139): queda arriba del campo de la conversación del proyecto y lo manda el
 * usuario. Se cita en una conversación nueva (retomar la anterior relee todo su historial), con Volver a la anterior.
 */
export const CITA_PASAR_AL_FRAMEWORK: Cita = {
  clave: 'framework:pasar',
  tipo: 'Framework',
  nombre: 'Pasar al framework',
  texto: MENSAJE_PASAR_AL_FRAMEWORK,
}

/** Una skill del proyecto (R-8): de su `.claude/skills/`, que Claude Code carga solo en ese proyecto. */
export interface SkillProyecto {
  /** Como la nombra el `SKILL.md` (o su carpeta, si no lo dice). */
  nombre: string
  descripcion: string | null
  /** El `SKILL.md`, relativo al proyecto con `/`: se abre en Archivos. */
  archivo: string
}

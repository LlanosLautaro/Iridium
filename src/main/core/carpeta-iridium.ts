// La carpeta Iridium (D-083): `Ideas` y `Skills`, aparte de la carpeta de proyectos. Acá, lo que no toca el disco:
// los nombres, lo que llevan al crearse y cómo cambia una ruta al mudarse.
import { join, relative, resolve } from 'node:path'
import { CARPETA_GENERAL, CARPETA_SKILLS } from '../../compartido/puente'

/**
 * Los nombres que tenían dentro de la carpeta de proyectos antes de D-083 (D-060, D-068): si están ahí, se ofrece
 * mudarlas.
 */
export const ANTES = { ideas: 'Ideas', skills: 'Skills y Claude' } as const

export type Cual = keyof typeof ANTES

export function rutasIridium(carpeta: string): Record<Cual, string> {
  return { ideas: join(carpeta, CARPETA_GENERAL), skills: join(carpeta, CARPETA_SKILLS) }
}

/** Lo que lleva cada carpeta al crearse: archivo relativo → texto. `skills/` se crea vacía aparte. */
export const INICIALES: Record<Cual, Record<string, string>> = {
  ideas: {
    'CLAUDE.md': `# Ideas

Esta carpeta no es una app: es el lugar para hablar de los proyectos en general y para anotar ideas que todavía no tienen proyecto. No sigue la guía \`hitos-desarrollo-app\`: acá no hay nada que construir.

## Dónde están los proyectos
- La carpeta de proyectos te la dice Iridium al empezar cada sesión. Cada carpeta hija es un proyecto; las que empiezan con \`.\` no.
- Cuando el usuario nombre un proyecto (aunque sea con un nombre aproximado), buscalo entre esas carpetas y leé solo lo necesario: \`.proyecto.json\` (qué es y en qué estado está), \`docs/estado.md\` (en qué hito está) y, si la idea depende de eso, \`CLAUDE.md\` y \`docs/02-definicion.md\`.
- Si el nombre es ambiguo, preguntá a cuál se refiere antes de leer de más.
- Desde acá no se modifica ningún proyecto sin que el usuario lo pida.

## Cómo se anotan las ideas
- Todas van en \`ideas.md\`, la más nueva arriba dentro de su sección.
- Cada idea: \`### Título — AAAA-MM-DD\`, dos o tres líneas de qué es y, si toca a otros proyectos, una línea \`Toca a:\` con el nombre exacto de sus carpetas entre comillas invertidas.
- Anotá la idea como la dice el usuario; si falta algo para entenderla después, preguntá una cosa, no un cuestionario.

## Cuando una idea madura
Proponé dónde integrarla y decidilo con el usuario:
- **Es parte de un proyecto que sigue la guía de hitos:** va a "Ideas nuevas" de \`docs/07-construccion.md\` de ese proyecto (o a la sección que indique su \`docs/estado.md\`).
- **Es parte de un proyecto que no sigue la guía:** se anota en su \`README.md\` y se propone ponerlo al día con la guía.
- **Es un proyecto nuevo:** se crea la carpeta en la carpeta de proyectos y, si va a ser una app o herramienta, se sigue con \`hitos-desarrollo-app\` desde el hito 0 con lo que ya está anotado.
- Después, la idea pasa a la sección "Integradas" de \`ideas.md\` con una línea \`→ AAAA-MM-DD: …\` de a dónde fue. No se borra.
`,
    'ideas.md': `# Ideas

> Cómo se usa este archivo: ver \`CLAUDE.md\`.

## Sueltas
Ideas que todavía no tienen proyecto.

## Para proyectos existentes
Ideas que tocan a uno o varios proyectos, pendientes de pasarles.

## Integradas
Ideas que ya pasaron a un proyecto: una línea con a dónde fueron.
`,
  },
  skills: {
    'CLAUDE.md': `# Skills

Esta carpeta guarda cómo trabaja Claude con el usuario: sus skills propias y el resto de la configuración de Claude. No es una app: no sigue la guía \`hitos-desarrollo-app\`.

## Estructura
- \`skills/<nombre>/\` — una carpeta por skill (\`SKILL.md\` y lo que use).

## Reglas
- Las skills propias se instalan como enlaces: \`%USERPROFILE%\\.claude\\skills\\<nombre>\` apunta a \`skills/<nombre>/\`. Editar acá ya es instalar.
- Una skill nueva se crea en \`skills/<nombre>/\` y se instala con \`New-Item -ItemType Junction -Path "$env:USERPROFILE\\.claude\\skills\\<nombre>" -Target "<ruta completa de skills\\<nombre>>"\`.
- Nunca editar las skills que no son enlaces a esta carpeta: vienen de otro lado y se pisan solas.
`,
  },
}

/** La carpeta de Claude Code con las conversaciones de un proyecto: la ruta con todo lo que no es letra o número en `-`. */
export function carpetaDeConversaciones(ruta: string): string {
  return ruta.replace(/[^a-zA-Z0-9]/g, '-')
}

/** La ruta después de mudar `antes` a `despues`, si estaba dentro (o era esa); si no, null. Sin distinguir mayúsculas. */
export function rutaMudada(ruta: string, antes: string, despues: string): string | null {
  const r = relative(resolve(antes).toLowerCase(), resolve(ruta).toLowerCase())
  if (r.startsWith('..') || /^[a-z]:/i.test(r)) return null
  // `relative` se calculó en minúsculas solo para comparar: el resto sale de la ruta original.
  const resto = resolve(ruta).slice(resolve(antes).length)
  return resto === '' ? despues : join(despues, resto)
}

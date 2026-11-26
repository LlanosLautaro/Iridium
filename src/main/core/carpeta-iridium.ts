// La carpeta Iridium (D-083): `Ideas` y `Skills`, aparte de la carpeta de proyectos. Acá, lo que no toca el disco:
// los nombres, lo que llevan al crearse y cómo cambia una ruta al mudarse.
import { join, relative, resolve } from 'node:path'
import { CARPETA_GENERAL, CARPETA_SKILLS } from '../../compartido/puente'

export type Cual = 'ideas' | 'skills'

export function rutasIridium(carpeta: string): Record<Cual, string> {
  return { ideas: join(carpeta, CARPETA_GENERAL), skills: join(carpeta, CARPETA_SKILLS) }
}

/** Lo que lleva cada carpeta al crearse: archivo relativo → texto. `skills/` se crea vacía aparte. */
export const INICIALES: Record<Cual, Record<string, string>> = {
  ideas: {
    'CLAUDE.md': `# Ideas

Esta carpeta no es una app: es el lugar para hablar de los proyectos en general y para anotar ideas que todavía no tienen proyecto. No sigue el framework de Iridium: acá no hay nada que construir.

## Dónde están los proyectos
- La carpeta de proyectos te la dice Iridium al empezar cada sesión. Cada carpeta hija es un proyecto; las que empiezan con \`.\` no.
- Cuando el usuario nombre un proyecto (aunque sea con un nombre aproximado), buscalo entre esas carpetas y leé solo lo necesario: \`.proyecto.json\` (qué es y en qué estado está), \`docs/estado.md\` (en qué hito está) y, si la idea depende de eso, \`CLAUDE.md\` y \`docs/02-definicion.md\`.
- Si el nombre es ambiguo, preguntá a cuál se refiere antes de leer de más.
- Desde acá no se modifica ningún proyecto sin que el usuario lo pida.

## Las ideas sueltas
- Van en \`sueltas.md\`, con el formato del \`trabajo.md\` de un proyecto: cada una un \`## T-n — Título\` con la línea \`Estado: nueva · Idea: usuario · Fecha: AAAA-MM-DD\` (\`Idea: IA\` si la anotás vos; \`Idea: enlace\` y \`Enlace: <dirección>\` para un enlace a revisar). El usuario las ve y las anota en Iridium › Ideas.
- La nota de una idea del usuario está en \`sueltas/T-n.md\` y sus imágenes en \`sueltas/T-n/\`: leela antes de hablar de ella.
- Anotá la idea como la dice el usuario; si falta algo para entenderla después, preguntá una cosa, no un cuestionario.
- \`ideas.md\` y \`notas.md\` son de antes: se leen, pero ya no se escriben.

## Cuando una idea madura
Proponé dónde integrarla y decidilo con el usuario:
- **Es parte de un proyecto con framework:** va a su \`docs/trabajo.md\` como un \`T-n\` \`nueva\` con \`Origen: Ideas\`.
- **Es parte de un proyecto con framework viejo o de una carpeta simple:** se anota en su \`README.md\` y se propone pasarlo al framework.
- **Es un proyecto nuevo:** el usuario lo crea con **Nuevo proyecto** de Iridium (la carpeta con la plantilla básica) y le cuenta la idea a su IA en la primera conversación; podés darle el texto para pegar.
- Para pasar una idea suelta a un proyecto con framework, el usuario usa **Mover a un proyecto** en Iridium › Ideas, que la lleva con su nota y sus imágenes.
`,
    'sueltas.md': `# Ideas sueltas

> Las ideas que todavía no tienen proyecto, con el formato de \`trabajo.md\`: ver \`CLAUDE.md\`.
`,
  },
  skills: {
    'CLAUDE.md': `# Skills

Esta carpeta guarda cómo trabaja Claude con el usuario: sus skills propias y el resto de la configuración de Claude. No es una app: no sigue el framework de Iridium.

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

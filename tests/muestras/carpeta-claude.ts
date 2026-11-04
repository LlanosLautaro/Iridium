// Una carpeta de Claude de muestra para las pruebas de Skills (Vitest y Playwright): los cuatro orígenes, con enlaces
// reales (junction), uno roto, uno que lleva afuera, una copia doble y lo que se salta (`.trash`, generación vieja).
import { mkdir, rm, symlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

async function archivo(ruta: string, texto: string) {
  await mkdir(join(ruta, '..'), { recursive: true })
  await writeFile(ruta, texto)
}

const skill = (name: string, description: string | null) =>
  `---\nname: ${name}\n${description === null ? '' : `description: ${description}\n`}---\n\n# ${name}\n`

export const VIGENTE = '2026-10-29'

/** La guía, con su formato vigente en la línea fija. */
export const GUIA = `---
name: "hitos-desarrollo-app"
description: >
  Guía de hitos para llevar una app desde la idea vaga
  hasta el lanzamiento.
---

**Formato vigente:** ${VIGENTE}

# Guía
`

/**
 * Arma `claude` (la carpeta de Claude) y `carpetaSkills` (la carpeta Skills de la carpeta Iridium, D-083) con las
 * propias. `afuera` es una carpeta fuera de las dos, para el enlace que lleva a otro lado.
 */
export async function armarCarpetaClaude(
  claude: string,
  carpetaSkills: string,
  afuera: string,
): Promise<void> {
  const propias = join(carpetaSkills, 'skills')
  await archivo(join(propias, 'hitos-desarrollo-app', 'SKILL.md'), GUIA)
  await archivo(
    join(propias, 'hitos-desarrollo-app', 'references', 'actualizar-formato.md'),
    '# Actualizar el formato\n\nPasos para poner al día un proyecto.\n',
  )
  await archivo(
    join(propias, 'gestor-proyectos', 'SKILL.md'),
    skill('gestor-proyectos', '"Reglas para mantener la ficha de cada proyecto."'),
  )
  await archivo(join(propias, 'vieja', 'SKILL.md'), skill('vieja', 'Una que se borró.'))
  await archivo(join(afuera, 'ajena', 'SKILL.md'), skill('ajena', 'Una skill de otra carpeta.'))

  const skills = join(claude, 'skills')
  await mkdir(skills, { recursive: true })
  for (const n of ['hitos-desarrollo-app', 'gestor-proyectos', 'vieja'])
    await symlink(join(propias, n), join(skills, n), 'junction')
  await symlink(join(afuera, 'ajena'), join(skills, 'ajena'), 'junction')
  // El enlace roto: la carpeta a la que llevaba ya no está.
  await rm(join(propias, 'vieja'), { recursive: true })

  await archivo(
    join(skills, 'impeccable', 'SKILL.md'),
    skill('impeccable', 'Use when the user wants to design.'),
  )
  await archivo(join(skills, 'sin-descripcion', 'SKILL.md'), skill('sin-descripcion', null))
  await archivo(join(skills, 'sin-skill-md', 'notas.txt'), 'no es una skill')
  await archivo(join(skills, '.trash', '123-abc', 'SKILL.md'), skill('borrada', 'Borrada.'))

  const cuenta = join(skills, 'synced', 'cuenta-1')
  await archivo(join(cuenta, 'manifest.json'), '{}')
  await archivo(join(cuenta, 'pdf', 'SKILL.md'), skill('pdf', 'Use this skill whenever the user wants PDFs.'))
  await archivo(join(cuenta, 'docx', 'SKILL.md'), skill('docx', 'Word documents.'))

  const complementos = join(claude, 'plugins', 'synced', 'cuenta-1')
  const complemento = async (dir: string, nombre: string, skillsDe: Record<string, string>) => {
    await archivo(join(complementos, dir, '.claude-plugin', 'plugin.json'), JSON.stringify({ name: nombre }))
    await archivo(join(complementos, dir, '.in_use'), '')
    for (const [n, d] of Object.entries(skillsDe))
      await archivo(join(complementos, dir, 'skills', n, 'SKILL.md'), skill(n, d))
  }
  await complemento('impeccable', 'impeccable', { impeccable: 'Versión vieja.' })
  await complemento('impeccable~g3', 'impeccable', { impeccable: 'Design fluency for frontend development.' })
  await complemento('2da0c8d9', 'engineering', {
    debug: 'Structured debugging session.',
    standup: 'Generate a standup update.',
  })
}

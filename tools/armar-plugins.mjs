// Arma los complementos que Iridium carga en sus conversaciones (D-086) en `out/plugins/`:
// - `iridium`: la skill de Iridium, de `recursos/plugins/iridium`.
// - `guia`: la guía de hitos (`hitos-desarrollo-app`), copiada de la carpeta de skills de quien arma. Iridium la carga
//   solo si la PC donde corre no la tiene instalada. Si quien arma no la tiene, la versión sale sin ella (avisa).
// Lo corre `pnpm build` (y `pnpm dist`, `pnpm e2e`); electron-builder lleva `out/plugins` a los recursos de la app.
import { cp, mkdir, rm, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

const salida = join('out', 'plugins')
await rm(salida, { recursive: true, force: true })
await mkdir(salida, { recursive: true })
await cp(join('recursos', 'plugins', 'iridium'), join(salida, 'iridium'), { recursive: true })

const guia = join(process.env.IRIDIUM_CLAUDE ?? join(homedir(), '.claude'), 'skills', 'hitos-desarrollo-app')
try {
  await stat(join(guia, 'SKILL.md'))
  const destino = join(salida, 'guia')
  // `dereference`: en la PC del autor la skill es un enlace a su carpeta de skills.
  await cp(guia, join(destino, 'skills', 'hitos-desarrollo-app'), { recursive: true, dereference: true })
  await mkdir(join(destino, '.claude-plugin'), { recursive: true })
  await writeFile(
    join(destino, '.claude-plugin', 'plugin.json'),
    `${JSON.stringify(
      {
        name: 'iridium-guia',
        version: '1.0.0',
        description: 'La guía de hitos, para quien no la tiene instalada. La carga Iridium (D-086).',
      },
      null,
      2,
    )}\n`,
  )
  console.log('Complementos: iridium y la guía de hitos.')
} catch {
  console.warn(
    'Complementos: no está la guía de hitos en esta PC; la versión sale solo con la skill de Iridium.',
  )
}

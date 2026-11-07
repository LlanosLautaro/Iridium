// Arma en `out/plugins/` el complemento que Iridium carga en sus conversaciones (D-086): `iridium`, el framework
// (`recursos/plugins/iridium`: `SKILL.md`, `referencias/` y `plantillas/`; D-092). La guía de hitos ya no viaja: el
// framework la reemplaza (frente Orden, OR-1).
// Lo corre `pnpm build` (y `pnpm dist`, `pnpm e2e`); electron-builder lleva `out/plugins` a los recursos de la app.
import { cp, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

const salida = join('out', 'plugins')
await rm(salida, { recursive: true, force: true })
await mkdir(salida, { recursive: true })
await cp(join('recursos', 'plugins', 'iridium'), join(salida, 'iridium'), { recursive: true })
console.log('Complementos: el framework de Iridium.')

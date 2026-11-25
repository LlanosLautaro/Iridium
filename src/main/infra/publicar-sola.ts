// Publicar sola (T-132): la app de uso diario sube a GitHub la versión que está usando, así la otra PC (las copias
// instaladas, D-171) recibe siempre lo mismo que usa el usuario, sin `pnpm publicar` a mano. Corre
// `tools/publicar.ts` suelto y escondido desde la carpeta del código; lo que escribe queda en `release/publicar.log`.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { debePublicar, type IntentoPublicar } from '../../compartido/actualizar'
import { lanzarSuelto } from './ventana-actualizando'

/** El comando que publica `commit`; las pruebas ponen otro (IRIDIUM_PUBLICAR) para no subir nada. */
export function comandoPublicar(commit: string): string {
  return [
    'powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command',
    `"& node --experimental-strip-types tools/publicar.ts --commit ${commit} 2>&1 | Out-File -Encoding utf8 release/publicar.log"`,
  ].join(' ')
}

async function leerIntento(archivo: string): Promise<IntentoPublicar | null> {
  try {
    const d = JSON.parse(await readFile(archivo, 'utf8'))
    return typeof d?.version === 'string' && typeof d?.fecha === 'number'
      ? { version: d.version, fecha: d.fecha }
      : null
  } catch {
    return null
  }
}

/**
 * Si corresponde (`debePublicar`), anota el intento en `archivo` y lanza la publicación. Devuelve si la lanzó.
 * @param codigo la carpeta del código de Iridium (la que tiene `tools` y `release`).
 */
export async function publicarSola(o: {
  codigo: string
  archivo: string
  version: string
  commit: string
  sinGuardar: boolean
  comando?: (commit: string) => string
  lanzar?: (comando: string, carpeta: string) => Promise<void>
  ahora?: number
}): Promise<boolean> {
  const ahora = o.ahora ?? Date.now()
  const ultimo = await leerIntento(o.archivo)
  if (!debePublicar({ version: o.version, commit: o.commit, sinGuardar: o.sinGuardar, ultimo, ahora }))
    return false
  await mkdir(dirname(o.archivo), { recursive: true })
  await writeFile(o.archivo, JSON.stringify({ version: o.version, fecha: ahora }))
  await (o.lanzar ?? lanzarSuelto)((o.comando ?? comandoPublicar)(o.commit), o.codigo)
  return true
}

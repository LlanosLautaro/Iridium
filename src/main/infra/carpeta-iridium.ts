// La carpeta Iridium en el disco (D-083): crear Ideas y Skills si faltan, y mudarlas con lo que depende de su ruta
// (los enlaces de las skills propias y las conversaciones de Claude Code).
import { cp, lstat, mkdir, readdir, readlink, rename, rm, symlink, unlink, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import {
  ANTES,
  type Cual,
  carpetaDeConversaciones,
  INICIALES,
  rutaMudada,
  rutasIridium,
} from '../core/carpeta-iridium'
import { existeCarpeta } from './raiz'

export interface CarpetasEnDisco {
  /** La carpeta que se usa para cada una; null si no está ni se pudo crear. */
  rutas: Record<Cual, string | null>
  /** Las de antes que faltan mudar. */
  mudanza: Record<Cual, string | null> | null
}

/** Crea una de las dos con lo que lleva al empezar. Si ya existe, no toca nada. */
async function crear(ruta: string, cual: Cual): Promise<void> {
  await mkdir(ruta, { recursive: true })
  for (const [archivo, texto] of Object.entries(INICIALES[cual]))
    await writeFile(join(ruta, archivo), texto, { flag: 'wx' }).catch((e: NodeJS.ErrnoException) => {
      if (e.code !== 'EEXIST') throw e
    })
  if (cual === 'skills') await mkdir(join(ruta, 'skills'), { recursive: true })
}

/**
 * Qué carpeta se usa para Ideas y para Skills: la de `carpeta`; si falta y hay una de antes (suelta en la carpeta de
 * proyectos, D-060 y D-068, o en otra carpeta de Iridium, `anteriores`), esa, y se ofrece mudarla; si no hay ninguna,
 * se crea la nueva.
 */
export async function prepararCarpetaIridium(
  carpeta: string,
  raiz: string,
  crearSiFalta = true,
  anteriores: string[] = [],
): Promise<CarpetasEnDisco> {
  const nuevas = rutasIridium(carpeta)
  const rutas: Record<Cual, string | null> = { ideas: null, skills: null }
  const mudanza: Record<Cual, string | null> = { ideas: null, skills: null }
  for (const cual of ['ideas', 'skills'] as const) {
    let vieja: string | null = null
    for (const posible of [join(raiz, ANTES[cual]), ...anteriores.map((a) => rutasIridium(a)[cual])])
      if (!vieja && (await existeCarpeta(posible))) vieja = posible
    if (await existeCarpeta(nuevas[cual])) rutas[cual] = nuevas[cual]
    else if (vieja) rutas[cual] = mudanza[cual] = vieja
    else if (crearSiFalta)
      rutas[cual] = await crear(nuevas[cual], cual).then(
        () => nuevas[cual],
        () => null,
      )
  }
  return { rutas, mudanza: mudanza.ideas || mudanza.skills ? mudanza : null }
}

/** Mueve una carpeta entera; entre discos distintos, copia y después borra la de origen. */
export async function moverCarpeta(origen: string, destino: string): Promise<void> {
  if (await existeCarpeta(destino)) throw new Error(`Ya existe ${destino}`)
  await mkdir(dirname(destino), { recursive: true })
  try {
    await rename(origen, destino)
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'EXDEV') throw e
    await cp(origen, destino, { recursive: true, errorOnExist: true, force: false, preserveTimestamps: true })
    await rm(origen, { recursive: true, force: true, maxRetries: 3 })
  }
}

/**
 * Los enlaces de `.claude\skills` que apuntaban adentro de `antes` pasan a apuntar adentro de `despues`. Devuelve
 * los que no se pudieron rehacer.
 */
export async function reenlazarSkills(
  carpetaClaude: string,
  antes: string,
  despues: string,
): Promise<string[]> {
  const carpeta = join(carpetaClaude, 'skills')
  const fallas: string[] = []
  let nombres: string[]
  try {
    nombres = await readdir(carpeta)
  } catch {
    return fallas
  }
  for (const nombre of nombres) {
    const enlace = join(carpeta, nombre)
    try {
      if (!(await lstat(enlace)).isSymbolicLink()) continue
      const nuevo = rutaMudada(await readlink(enlace), antes, despues)
      if (!nuevo) continue
      await unlink(enlace)
      await symlink(nuevo, enlace, 'junction')
    } catch {
      fallas.push(nombre)
    }
  }
  return fallas
}

/**
 * Las conversaciones de Claude Code de `antes` (`.claude\projects\<ruta con guiones>`) pasan a las de `despues`, así
 * se pueden seguir desde Iridium. Si ya había conversaciones en `despues`, se suman archivo por archivo.
 */
export async function moverConversaciones(
  carpetaClaude: string,
  antes: string,
  despues: string,
): Promise<void> {
  const proyectos = join(carpetaClaude, 'projects')
  let nombres: string[]
  try {
    nombres = await readdir(proyectos)
  } catch {
    return
  }
  const buscada = carpetaDeConversaciones(antes).toLowerCase()
  const vieja = nombres.find((n) => n.toLowerCase() === buscada)
  if (!vieja) return
  const nueva = join(proyectos, carpetaDeConversaciones(despues))
  if (!(await existeCarpeta(nueva))) return rename(join(proyectos, vieja), nueva)
  for (const archivo of await readdir(join(proyectos, vieja)))
    await rename(join(proyectos, vieja, archivo), join(nueva, archivo)).catch(() => {})
}

// Recorre las carpetas de Claude y devuelve las skills en crudo (modulos/skills/diseno-tecnico.md › Dónde se leen las
// skills). Nunca falla entera: una carpeta que no se puede leer vuelve como error de su grupo.
import type { Dirent } from 'node:fs'
import { lstat, readdir, readFile, readlink, stat } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import type { OrigenSkill } from '../../compartido/skills'
import type { CarpetaSkill } from '../core/skills'

/** Lo que no es una skill: la papelera de Claude Code, su marca de «en uso» y lo que empieza con punto. */
function seSalta(nombre: string): boolean {
  return nombre.startsWith('.') || nombre === 'synced'
}

async function texto(ruta: string): Promise<string | null> {
  try {
    return await readFile(ruta, 'utf8')
  } catch {
    return null
  }
}

async function carpetas(ruta: string): Promise<Dirent[]> {
  try {
    return (await readdir(ruta, { withFileTypes: true })).filter(
      (e) => e.isDirectory() && !e.name.startsWith('.'),
    )
  } catch {
    return []
  }
}

/** Una carpeta con `SKILL.md`; null si no tiene. */
async function skillEn(
  carpeta: string,
  nombre: string,
  lugar: CarpetaSkill['lugar'],
  complemento: string | null,
): Promise<CarpetaSkill | null> {
  const t = await texto(join(carpeta, 'SKILL.md'))
  return t === null ? null : { lugar, carpeta, nombreCarpeta: nombre, texto: t, enlace: null, complemento }
}

/** `.claude\skills\<nombre>`: los enlaces (propios o no) y las carpetas sueltas. */
async function sueltas(raiz: string): Promise<CarpetaSkill[]> {
  const encontradas: CarpetaSkill[] = []
  for (const nombre of await readdir(raiz)) {
    if (seSalta(nombre)) continue
    const carpeta = join(raiz, nombre)
    let info: Awaited<ReturnType<typeof lstat>>
    try {
      info = await lstat(carpeta)
    } catch {
      continue
    }
    if (info.isSymbolicLink()) {
      let destino: string
      try {
        destino = (await readlink(carpeta)).replace(/^\\\\\?\\/, '')
        if (!isAbsolute(destino)) destino = resolve(raiz, destino)
      } catch {
        continue
      }
      const existe = await stat(carpeta).then(
        (s) => s.isDirectory(),
        () => false,
      )
      const t = existe ? await texto(join(carpeta, 'SKILL.md')) : null
      if (existe && t === null) continue
      encontradas.push({
        lugar: 'skills',
        carpeta,
        nombreCarpeta: nombre,
        texto: t,
        enlace: { destino, existe },
        complemento: null,
      })
    } else if (info.isDirectory()) {
      const s = await skillEn(carpeta, nombre, 'skills', null)
      if (s) encontradas.push(s)
    }
  }
  return encontradas
}

/** `.claude\skills\synced\<cuenta>\<nombre>`: las que llegan de la cuenta. Sin suponer cuántas cuentas hay. */
async function deLaCuenta(raiz: string): Promise<CarpetaSkill[]> {
  const encontradas: CarpetaSkill[] = []
  for (const cuenta of await carpetas(join(raiz, 'synced')))
    for (const e of await carpetas(join(raiz, 'synced', cuenta.name))) {
      const s = await skillEn(join(raiz, 'synced', cuenta.name, e.name), e.name, 'cuenta', null)
      if (s) encontradas.push(s)
    }
  return encontradas
}

/**
 * De cada complemento, la generación más nueva: Claude Code deja la anterior al lado (`impeccable` e
 * `impeccable~g3`) hasta que la limpia.
 */
export function generacionesNuevas(nombres: readonly string[]): string[] {
  const mejor = new Map<string, { nombre: string; generacion: number }>()
  for (const nombre of nombres) {
    const m = /^(.*)~g(\d+)$/.exec(nombre)
    const base = m?.[1] ?? nombre
    const generacion = m ? Number(m[2]) : 0
    const actual = mejor.get(base)
    if (!actual || generacion > actual.generacion) mejor.set(base, { nombre, generacion })
  }
  return [...mejor.values()].map((m) => m.nombre)
}

async function nombreDelComplemento(carpeta: string, porDefecto: string): Promise<string> {
  const t = await texto(join(carpeta, '.claude-plugin', 'plugin.json'))
  if (t === null) return porDefecto
  try {
    const n = (JSON.parse(t) as { name?: unknown }).name
    return typeof n === 'string' && n.trim() !== '' ? n.trim() : porDefecto
  } catch {
    return porDefecto
  }
}

/** `.claude\plugins\synced\<cuenta>\<complemento>\skills\<nombre>`. */
async function deComplementos(raiz: string): Promise<CarpetaSkill[]> {
  const encontradas: CarpetaSkill[] = []
  for (const cuenta of await carpetas(join(raiz, 'synced'))) {
    const base = join(raiz, 'synced', cuenta.name)
    const nombres = generacionesNuevas((await carpetas(base)).map((e) => e.name))
    for (const dir of nombres) {
      const carpeta = join(base, dir)
      const complemento = await nombreDelComplemento(carpeta, dir.replace(/~g\d+$/, ''))
      for (const e of await carpetas(join(carpeta, 'skills'))) {
        const s = await skillEn(join(carpeta, 'skills', e.name), e.name, 'complemento', complemento)
        if (s) encontradas.push(s)
      }
    }
  }
  return encontradas
}

export interface SkillsCrudas {
  carpetas: CarpetaSkill[]
  errores: { origenes: OrigenSkill[]; carpeta: string }[]
}

/** Todas las skills de la carpeta de Claude (`%USERPROFILE%\.claude`, o `IRIDIUM_CLAUDE` en las pruebas). */
export async function leerSkills(carpetaClaude: string): Promise<SkillsCrudas> {
  const skills = join(carpetaClaude, 'skills')
  const errores: SkillsCrudas['errores'] = []
  const sueltasLeidas = await sueltas(skills).catch(() => {
    errores.push({ origenes: ['propia', 'tercero'], carpeta: skills })
    return []
  })
  const [cuenta, complementos] = await Promise.all([
    deLaCuenta(skills),
    deComplementos(join(carpetaClaude, 'plugins')),
  ])
  return { carpetas: [...sueltasLeidas, ...cuenta, ...complementos], errores }
}

/** La carpeta de las skills de un proyecto, que Claude Code carga solo en él (R-8). */
export const SKILLS_DEL_PROYECTO = ['.claude', 'skills'] as const

/** Las carpetas de `.claude/skills/` del proyecto que tienen `SKILL.md`, por nombre. Sin carpeta, ninguna. */
export async function skillsEnProyecto(proyecto: string): Promise<string[]> {
  const raiz = join(proyecto, ...SKILLS_DEL_PROYECTO)
  let entradas: Dirent[]
  try {
    entradas = await readdir(raiz, { withFileTypes: true })
  } catch {
    return []
  }
  const con = await Promise.all(
    entradas
      .filter((e) => !seSalta(e.name) && (e.isDirectory() || e.isSymbolicLink()))
      .map(async (e) =>
        (await stat(join(raiz, e.name, 'SKILL.md')).catch(() => null))?.isFile() ? e.name : null,
      ),
  )
  return con.filter((n) => n !== null).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
}

/** El `SKILL.md` de una skill del proyecto; null si no se puede leer. */
export function textoSkillDelProyecto(proyecto: string, nombre: string): Promise<string | null> {
  return texto(join(proyecto, ...SKILLS_DEL_PROYECTO, nombre, 'SKILL.md'))
}

// Reglas de la sección Skills (modulos/skills/diseno-tecnico.md): entender un SKILL.md, decidir de dónde llega cada
// skill, encontrar las copias dobles y saber cómo está cada proyecto con el framework (W-13). Sin disco.
import type { CopiaDoble, EstadoFramework, OrigenSkill, Skill } from '../../compartido/skills'
import type { Estado } from '../../compartido/tipos'
import { tieneFramework } from './control'
import { campo } from './guia'

/** Lo que entra entre los `---` del principio de un `SKILL.md`. */
export interface Encabezado {
  name: string | null
  description: string | null
}

function sinComillas(v: string): string {
  const t = v.trim()
  if (t.length >= 2 && t.startsWith('"') && t.endsWith('"'))
    return t.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  if (t.length >= 2 && t.startsWith("'") && t.endsWith("'")) return t.slice(1, -1).replace(/''/g, "'")
  return t
}

/**
 * El `name` y la `description` del encabezado de un `SKILL.md`: con o sin comillas, en una línea o en varias (las de
 * abajo con sangría, o en bloque con `>` o `|`). Nunca falla: lo que no está vuelve null.
 */
export function leerEncabezado(texto: string): Encabezado {
  const lineas = texto.replace(/^﻿/, '').split(/\r?\n/)
  const vacio: Encabezado = { name: null, description: null }
  if (lineas[0]?.trim() !== '---') return vacio
  const fin = lineas.findIndex((l, i) => i > 0 && l.trim() === '---')
  if (fin === -1) return vacio
  const valores = new Map<string, string>()
  let i = 1
  while (i < fin) {
    const m = /^([A-Za-z][\w-]*):(?:\s+(.*))?$/.exec(lineas[i] ?? '')
    i++
    if (!m?.[1]) continue
    const primera = (m[2] ?? '').trim()
    const siguen: string[] = []
    while (i < fin && (/^\s/.test(lineas[i] ?? '') || (lineas[i] ?? '').trim() === '')) {
      siguen.push((lineas[i] ?? '').trim())
      i++
    }
    while (siguen.length > 0 && siguen.at(-1) === '') siguen.pop()
    let valor: string
    if (/^[>|][-+]?$/.test(primera)) {
      valor = primera.startsWith('|') ? siguen.join('\n') : siguen.join(' ').replace(/\s+/g, ' ')
    } else {
      valor = sinComillas([primera, ...siguen].filter((l) => l !== '').join(' '))
    }
    valores.set(m[1], valor.trim())
  }
  const de = (k: string) => {
    const v = valores.get(k)
    return v === undefined || v === '' ? null : v
  }
  return { name: de('name'), description: de('description') }
}

/** Una carpeta de skill tal como la encontró el recorrido del disco (`infra/skills.ts`). */
export interface CarpetaSkill {
  /** `skills`: `.claude\skills\<nombre>`; `cuenta`: `skills\synced\…`; `complemento`: `plugins\synced\…`. */
  lugar: 'skills' | 'cuenta' | 'complemento'
  carpeta: string
  nombreCarpeta: string
  /** El texto del `SKILL.md`; null si no se pudo leer (un enlace roto). */
  texto: string | null
  /** Si la carpeta es un enlace: adónde lleva y si eso existe. */
  enlace: { destino: string; existe: boolean } | null
  complemento: string | null
}

function normal(ruta: string): string {
  return ruta
    .replace(/[\\/]+/g, '\\')
    .replace(/\\$/, '')
    .toLowerCase()
}

/** ¿`ruta` está dentro de `carpeta`? Sin distinguir mayúsculas ni barras, como Windows. */
export function estaDentro(ruta: string, carpeta: string): boolean {
  return normal(ruta).startsWith(`${normal(carpeta)}\\`)
}

/** De dónde llega: un enlace a `Skills\skills` de la carpeta Iridium es propia; uno roto también (era de ahí); el resto, de afuera. */
function origenDe(c: CarpetaSkill, propias: string | null): OrigenSkill {
  if (c.lugar === 'cuenta') return 'cuenta'
  if (c.lugar === 'complemento') return 'complemento'
  if (!c.enlace) return 'tercero'
  if (!c.enlace.existe) return 'propia'
  return propias !== null && estaDentro(c.enlace.destino, propias) ? 'propia' : 'tercero'
}

/** La skill que muestra la lista; null si la carpeta no tiene nada que mostrar. */
export function skillDe(c: CarpetaSkill, propias: string | null): Skill | null {
  const roto = c.enlace !== null && !c.enlace.existe
  if (c.texto === null && !roto) return null
  const e = c.texto === null ? { name: null, description: null } : leerEncabezado(c.texto)
  const base = e.name ?? c.nombreCarpeta
  return {
    id: c.carpeta,
    nombre: c.complemento ? `${c.complemento}:${base}` : base,
    descripcion: e.description,
    origen: origenDe(c, propias),
    complemento: c.complemento,
    destino: c.enlace?.destino ?? null,
    problema: roto ? 'enlace-roto' : e.description === null ? 'sin-descripcion' : null,
    doble: null,
  }
}

/** El nombre sin el complemento: `impeccable:impeccable` y `impeccable` son la misma skill. */
export function nombreBase(nombre: string): string {
  return nombre.slice(nombre.lastIndexOf(':') + 1).toLowerCase()
}

const SE_ACTUALIZA: Partial<Record<OrigenSkill, string>> = {
  complemento: 'la del complemento se actualiza sola',
  cuenta: 'la de la cuenta se actualiza sola',
}

/** Cuál sobra entre dos copias y por qué, dicho desde `a` (diseno-tecnico.md › Copias dobles). */
function cualSobra(a: Skill, b: Skill): { sobra: 'esta' | 'otra' | null; motivo: string } {
  /** Por qué sobra la suelta frente a la otra; null si no sobra. */
  const porque = (suelta: Skill, otra: Skill): string | null => {
    if (suelta.origen !== 'tercero') return null
    return (
      SE_ACTUALIZA[otra.origen] ??
      (otra.origen === 'propia' ? 'la propia es la que se mantiene en la carpeta Skills' : null)
    )
  }
  const sobraA = porque(a, b)
  if (sobraA) return { sobra: 'esta', motivo: `Sobra esta carpeta: ${sobraA} (D-014).` }
  const sobraB = porque(b, a)
  if (sobraB) return { sobra: 'otra', motivo: `Sobra la carpeta suelta: ${sobraB} (D-014).` }
  return { sobra: null, motivo: 'No sé cuál sobra: las dos llegan de lugares que no se tocan desde la PC.' }
}

/** Marca las skills que están dos veces con la otra copia y cuál sobra (SK-2). Devuelve cuántas están dobles. */
export function marcarDobles(skills: Skill[]): number {
  const porNombre = new Map<string, Skill[]>()
  for (const s of skills) {
    const k = nombreBase(s.nombre)
    porNombre.set(k, [...(porNombre.get(k) ?? []), s])
  }
  let dobles = 0
  for (const grupo of porNombre.values()) {
    if (grupo.length < 2) continue
    dobles++
    for (const s of grupo) {
      // La otra: la que decide (si alguna sobra), si no, la primera que no es esta.
      const otras = grupo.filter((o) => o !== s)
      const otra = otras.find((o) => cualSobra(s, o).sobra !== null) ?? otras[0]
      if (!otra) continue
      const { sobra, motivo } = cualSobra(s, otra)
      const doble: CopiaDoble = {
        otra: otra.id,
        otraNombre: otra.nombre,
        otraOrigen: otra.origen,
        otraComplemento: otra.complemento,
        sobra,
        motivo,
      }
      s.doble = doble
    }
  }
  return dobles
}

/** Por origen y, dentro, por nombre (SK-W1 › Estados). */
export function ordenarSkills(skills: Skill[]): Skill[] {
  const orden: OrigenSkill[] = ['propia', 'tercero', 'complemento', 'cuenta']
  return [...skills].sort(
    (a, b) =>
      orden.indexOf(a.origen) - orden.indexOf(b.origen) ||
      a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }),
  )
}

/** La fecha de `**Formato de la guía:** AAAA-MM-DD` del `docs/README.md` de un proyecto; null si no la tiene. */
export function formatoDelProyecto(readme: string): string | null {
  const lineas = readme.replace(/^﻿/, '').split(/\r?\n/)
  return campo(lineas, 'Formato de la guía')?.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null
}

/** Lo que hace falta de un proyecto para saber cómo está con el framework. */
export interface DatosFramework {
  tieneEstado: boolean
  archivado: boolean
  estado: Estado | null
  reemplazadoPor: string | null
  readme: string | null
  /** Lo que el control encuentra mal escrito (ya calculado para la tarjeta); null sin framework. */
  avisos: readonly string[] | null
}

/** La fecha de `**Framework:** AAAA-MM-DD` del `docs/README.md` de un proyecto; null si no la tiene. */
export function fechaDelFramework(readme: string): string | null {
  const lineas = readme.replace(/^\uFEFF/, '').split(/\r?\n/)
  return campo(lineas, 'Framework')?.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null
}

/**
 * Cómo está un proyecto con el framework (W-13); null si no cuenta (archivado, descontinuado o reemplazado por otro).
 * Con `**Framework:**` está al día o con avisos; con `estado.md` y sin esa línea, de framework viejo; sin `estado.md`,
 * es una carpeta simple.
 */
export function estadoConFramework(d: DatosFramework): EstadoFramework | null {
  if (d.archivado || d.estado === 'descontinuado' || d.reemplazadoPor !== null) return null
  if (!d.tieneEstado) return { tipo: 'carpeta' }
  const fecha = d.readme === null ? null : fechaDelFramework(d.readme)
  if (d.readme !== null && tieneFramework(d.readme))
    return d.avisos && d.avisos.length > 0
      ? { tipo: 'avisos', fecha, avisos: [...d.avisos] }
      : { tipo: 'al-dia', fecha }
  return { tipo: 'viejo', fecha: d.readme === null ? null : formatoDelProyecto(d.readme) }
}

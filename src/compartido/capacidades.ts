// Capacidades (frente Paridad, segunda parte, T-28; D-188, D-189): los complementos y los conectores que tiene la IA en
// las sesiones de Iridium, su estado en palabras, el orden y qué botón lleva cada fila. Las reglas son de Iridium; la
// lista con su estado la da la frontera (`main/motor/`), sin gastar.

/** El estado de un conector en palabras de Iridium (`ux.md` › Ajustes › Capacidades). */
export type EstadoConector =
  /** Anda: la IA lo puede usar. */
  | 'conectado'
  /** Pide iniciar sesión: Conectar. No frena nada. */
  | 'falta-sesion'
  /** Falló al conectar: Reintentar. */
  | 'falla'
  /** El complemento lo trae sin dirección (lo completa quien lo usa): no hay nada que conectar. */
  | 'sin-configurar'
  /** Apagado en la configuración de Claude Code (no en Iridium): se prende desde ahí. */
  | 'apagado-afuera'

/** Un complemento cargado en las sesiones: de la cuenta de Claude o de Iridium (el framework). */
export interface ComplementoSesion {
  nombre: string
  /** Quién lo hace (`plugin.json`); null si no lo dice. */
  autor: string | null
  origen: 'cuenta' | 'iridium'
  skills: number
  conectores: number
}

/** Un conector (un servidor MCP) de una sesión. */
export interface ConectorSesion {
  /** El nombre con que lo nombra Claude Code (`plugin:design:figma`, `claude.ai Gmail`): con él se apaga y se conecta. */
  nombre: string
  estado: EstadoConector
}

/** Lo que tiene la IA en una sesión nueva, sin los apagados de Iridium (D-189 › 1 y 2). */
export interface CapacidadesSesion {
  complementos: ComplementoSesion[]
  conectores: ConectorSesion[]
}

/** Lo que ve Ajustes › Capacidades: lo de la sesión con lo apagado en Iridium; `error` si no se pudo saber. */
export type VistaCapacidades =
  | { tipo: 'ok'; complementos: ComplementoSesion[]; conectores: (ConectorSesion & { apagado: boolean })[] }
  | { tipo: 'error' }

/** Cuánto se espera a que los conectores terminen de conectar antes de mostrar lo que hay (D-189 › 1). */
export const ESPERA_CONECTORES_MS = 15_000

/** Lo que puede traer el nombre de un conector: se manda a la consola entre comillas (Conectar, D-189 › 3). */
export const NOMBRE_CONECTOR = /^[\p{L}\p{N} ._:()/-]{1,120}$/u

const CLAUDE_AI = 'claude.ai '

/** Si el conector es de claude.ai (Gmail, Drive…) y no de un complemento. */
export function esDeClaudeAi(nombre: string): boolean {
  return nombre.startsWith(CLAUDE_AI)
}

/** El complemento del que sale un conector (`plugin:design:figma` → `design`); null si no es de uno. */
export function complementoDe(nombre: string): string | null {
  const m = /^plugin:([^:]+):/.exec(nombre)
  return m?.[1] ?? null
}

/** El nombre que se muestra: sin de dónde sale y con mayúscula en cada palabra (`google calendar` → `Google Calendar`). */
export function nombreVisible(nombre: string): string {
  const corto = esDeClaudeAi(nombre)
    ? nombre.slice(CLAUDE_AI.length)
    : nombre.startsWith('plugin:')
      ? nombre.split(':').slice(2).join(':')
      : nombre
  return corto.replace(
    /(^|\s)(\p{Ll})/gu,
    (_, espacio: string, letra: string) => espacio + letra.toUpperCase(),
  )
}

/** De dónde sale, en palabras: «de claude.ai», «de design» o «tuyo» (uno agregado a mano en Claude Code). */
export function deDonde(nombre: string): string {
  if (esDeClaudeAi(nombre)) return 'de claude.ai'
  const complemento = complementoDe(nombre)
  return complemento ? `de ${complemento}` : 'agregado en Claude Code'
}

/** El estado en palabras y su tono (`ux.md`): verde lo que anda, rojo lo que falla, gris lo demás. */
export function estadoEnPalabras(
  estado: EstadoConector,
  apagado: boolean,
): { texto: string; tono: 'verde' | 'rojo' | null } {
  if (apagado) return { texto: 'apagado', tono: null }
  switch (estado) {
    case 'conectado':
      return { texto: 'conectado', tono: 'verde' }
    case 'falta-sesion':
      return { texto: 'falta iniciar sesión', tono: null }
    case 'falla':
      return { texto: 'no anda', tono: 'rojo' }
    case 'sin-configurar':
      return { texto: 'sin configurar', tono: null }
    case 'apagado-afuera':
      return { texto: 'apagado en Claude Code', tono: null }
  }
}

/** El botón de la fila: Conectar si pide sesión, Reintentar si falla; uno apagado en Iridium, ninguno. */
export function accionDe(estado: EstadoConector, apagado: boolean): 'conectar' | 'reintentar' | null {
  if (apagado) return null
  if (estado === 'falta-sesion') return 'conectar'
  if (estado === 'falla') return 'reintentar'
  return null
}

const ORDEN: Record<EstadoConector, number> = {
  falla: 0,
  'falta-sesion': 1,
  conectado: 2,
  'sin-configurar': 3,
  'apagado-afuera': 4,
}

/** Los que fallan primero, después los que piden sesión, los que andan y lo demás; los apagados al final. */
export function ordenarConectores<T extends ConectorSesion & { apagado: boolean }>(lista: readonly T[]): T[] {
  return [...lista].sort(
    (a, b) =>
      Number(a.apagado) - Number(b.apagado) ||
      ORDEN[a.estado] - ORDEN[b.estado] ||
      nombreVisible(a.nombre).localeCompare(nombreVisible(b.nombre), 'es'),
  )
}

/** Los de la cuenta primero y los de Iridium después, cada grupo por nombre. */
export function ordenarComplementos(lista: readonly ComplementoSesion[]): ComplementoSesion[] {
  return [...lista].sort(
    (a, b) =>
      Number(a.origen === 'iridium') - Number(b.origen === 'iridium') ||
      a.nombre.localeCompare(b.nombre, 'es'),
  )
}

/** «Anthropic · 10 skills · 7 conectores» (la fila de un complemento). */
export function detalleComplemento(c: ComplementoSesion): string {
  const partes = [c.autor ?? (c.origen === 'iridium' ? 'Iridium' : null)]
  if (c.skills > 0) partes.push(`${c.skills} ${c.skills === 1 ? 'skill' : 'skills'}`)
  if (c.conectores > 0) partes.push(`${c.conectores} ${c.conectores === 1 ? 'conector' : 'conectores'}`)
  return partes.filter((p): p is string => p !== null).join(' · ')
}

/** La extensión «Claude» de Anthropic, la que usa Claude in Chrome (D-189 › 4): por su id se la busca en los perfiles. */
export const ID_EXTENSION_CLAUDE = 'fcoeoabgfenejglbffodgkkbkcdhcgfn'

/** La página de la extensión, para «Cómo instalarla» (`ux.md` › Navegador sin la extensión). */
export const PAGINA_EXTENSION_CLAUDE = `https://chromewebstore.google.com/detail/${ID_EXTENSION_CLAUDE}`

/** Los navegadores donde se busca la extensión, en el orden en que se nombran. */
export const NAVEGADORES = ['Chrome', 'Brave', 'Edge'] as const
export type Navegador = (typeof NAVEGADORES)[number]

/**
 * Con qué navegador va la IA, en palabras: «Brave, con la extensión «Claude»»; con dos, «Brave y Edge, …». null si
 * ninguno la tiene (la fila muestra el aviso).
 */
export function textoNavegador(encontrados: readonly Navegador[]): string | null {
  if (encontrados.length === 0) return null
  const nombres = NAVEGADORES.filter((n) => encontrados.includes(n))
  const lista =
    nombres.length === 1 ? nombres[0] : `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`
  return `${lista}, con la extensión «Claude»`
}

/** La lista de apagados con uno prendido (sale) o apagado (entra, una sola vez). */
export function cambiarApagado(apagados: readonly string[], nombre: string, prendido: boolean): string[] {
  const sin = apagados.filter((n) => n !== nombre)
  return prendido ? sin : [...sin, nombre]
}

/** El nombre con que la PC (Windows-MCP) entra en las sesiones de Iridium: sus herramientas son `mcp__pc__…` (D-189 › 5). */
export const CONECTOR_PC = 'pc'

/**
 * Lo que se le saca a Windows-MCP (D-189 › 5): Claude Code ya corre comandos y lee archivos, y son lo que más daño hace
 * por error.
 */
export const HERRAMIENTAS_SACADAS_PC = ['PowerShell', 'FileSystem', 'Registry'] as const

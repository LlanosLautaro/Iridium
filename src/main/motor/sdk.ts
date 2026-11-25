// El motor real: el Agent SDK de Claude Code. Es el único archivo que importa el SDK (D-007, D-025).
// Funciones exclusivas de Claude que usa (D-007): el modo *bypass*, la instrucción agregada al sistema y
// desactivar la herramienta de preguntas con opciones.
import { execFile, spawn } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { isAbsolute, join, relative } from 'node:path'
import {
  type AccountInfo,
  getSessionMessages,
  listSessions,
  type McpServerStatus,
  type ModelInfo,
  type Options,
  type Query,
  query,
  type SDKControlGetContextUsageResponse,
  type SDKControlGetUsageResponse,
  type SDKMessage,
  type SDKUserMessage,
  type SessionMessage,
  type SlashCommand,
} from '@anthropic-ai/claude-agent-sdk'
import {
  type CapacidadesSesion,
  type ConectorSesion,
  complementoDe,
  ESPERA_CONECTORES_MS,
  NOMBRE_CONECTOR,
} from '../../compartido/capacidades'
import type { CapacidadesMotor, ComandoMotor, Pisa } from '../../compartido/comandos'
// Solo tipos de la app: así las herramientas de `tools/` cargan este archivo sin compilar.
import type {
  AjusteIa,
  CategoriaContexto,
  ContextoConversacion,
  Esfuerzo,
  EstadoMotor,
  ModeloIa,
  ReintentoSesion,
  VentanaUso,
} from '../../compartido/puente'
import { carpetaDeConversaciones } from '../core/carpeta-iridium'
import { moverConversaciones } from '../infra/carpeta-iridium'
import { type ComplementoEnDisco, leerComplementos } from '../infra/skills'
import type { FallaMotor, FotoMotor, MensajeMotor, Motor, SesionMotor, UsoMotor } from './motor'

const ESPERA_VERIFICAR_MS = 30_000
/** Lo que se espera a que Claude Code termine solo después de una consulta sin mensajes. */
const ESPERA_SALIR_MS = 5000
/** Lo que se espera al uso o al contexto al terminar un turno, antes de cerrar la sesión. */
const ESPERA_DATOS_MS = 10_000
/** Cuánto se espera a que la IA retome después de que terminó lo que dejó de fondo, antes de cerrar la sesión (T-65). */
const ESPERA_RETOMA_MS = 60_000
/** Mientras una sesión trabaja, cada cuánto informa el uso: un turno largo no deja el medidor atrás (Defecto 16). */
export const RELEER_USO_TURNO_MS = 2 * 60_000
/** Lo que se espera a que el usuario termine de iniciar sesión en el navegador antes de dejar de esperar. */
const ESPERA_LOGIN_MS = 10 * 60_000

export interface OpcionesSdk {
  /** Claude Code que trae el SDK. En la app instalada está fuera del archivo comprimido (`app.asar.unpacked`). */
  rutaClaude?: string
  /** Solo para las pruebas a mano (`tools/probar-conversacion.ts`): un modelo barato. La app usa el del usuario. */
  modelo?: string
  /** Cada cuánto informa el uso una sesión mientras trabaja (ms); las pruebas a mano lo acortan. */
  releerUsoMs?: number
  /** Las carpetas de los complementos que se cargan en cada conversación (D-086): la skill de Iridium y la guía. */
  plugins?: string[]
  /**
   * Las consolas adentro de Iridium (T-116, D-184): corre una línea de comandos en una pestaña del panel y espera a
   * que termine. Sin ella, el inicio de sesión abre una ventana de consola aparte, como antes.
   */
  consola?: (nombre: string, comando: string) => Promise<void>
}

/**
 * Traduce lo que informa Claude Code de la cuenta a un estado de la app. `conSesion` es lo que dice
 * `claude auth status` (null si no se pudo leer): sin sesión, la cuenta puede seguir trayendo el email de antes
 * (R-5), así que manda eso.
 */
export function estadoDeCuenta(cuenta: AccountInfo, conSesion: boolean | null = null): EstadoMotor {
  const origen = cuenta.apiKeySource
  if (origen && origen !== 'none' && origen !== 'oauth' && origen !== '/login managed key') {
    return { tipo: 'clave-api', origen }
  }
  if (cuenta.apiProvider && cuenta.apiProvider !== 'firstParty') {
    return { tipo: 'clave-api', origen: cuenta.apiProvider }
  }
  if (conSesion === false) return { tipo: 'sin-sesion' }
  if (!cuenta.subscriptionType && !cuenta.email && !cuenta.tokenSource) return { tipo: 'sin-sesion' }
  return { tipo: 'listo', suscripcion: cuenta.subscriptionType ?? null, modelos: [] }
}

const ESFUERZOS: readonly string[] = ['low', 'medium', 'high', 'xhigh', 'max'] satisfies Esfuerzo[]

const esEsfuerzo = (e: unknown): e is Esfuerzo => typeof e === 'string' && ESFUERZOS.includes(e)

/** Los esfuerzos que guardó `/effort` de Claude Code: para todos los modelos y por modelo. */
export interface EsfuerzosGuardados {
  todos: Esfuerzo | null
  porModelo: Record<string, Esfuerzo>
}

/**
 * El esfuerzo que usa Claude Code con cada modelo si no se elige otro (Q-77): el que guardó `/effort` en
 * `~/.claude/settings.json` (`modelSettings.<modelo>.effortLevel`, o `effortLevel` para todos). Sin eso, no se sabe.
 */
export function esfuerzosGuardados(texto: string): EsfuerzosGuardados {
  try {
    const datos = JSON.parse(texto) as { effortLevel?: unknown; modelSettings?: Record<string, unknown> }
    const porModelo: Record<string, Esfuerzo> = {}
    for (const [modelo, ajustes] of Object.entries(datos.modelSettings ?? {})) {
      const e = (ajustes as { effortLevel?: unknown } | null)?.effortLevel
      if (esEsfuerzo(e)) porModelo[modelo] = e
    }
    return { todos: esEsfuerzo(datos.effortLevel) ? datos.effortLevel : null, porModelo }
  } catch {
    return { todos: null, porModelo: {} }
  }
}

/** Los modelos que ofrece Claude Code, con los esfuerzos que acepta cada uno y el que usa si no se elige. */
export function modelosDe(
  lista: readonly ModelInfo[],
  guardados: EsfuerzosGuardados = { todos: null, porModelo: {} },
): ModeloIa[] {
  return lista.map((m) => {
    const esfuerzos = m.supportsEffort ? (m.supportedEffortLevels ?? []).filter(esEsfuerzo) : []
    const real = m.resolvedModel ?? null
    const guardado = (real && guardados.porModelo[real]) || guardados.porModelo[m.value] || guardados.todos
    return {
      id: m.value,
      nombre: m.displayName,
      descripcion: m.description,
      esfuerzos,
      modeloReal: real,
      esfuerzoPredeterminado: guardado && esfuerzos.includes(guardado) ? guardado : null,
    }
  })
}

async function leerEsfuerzosGuardados(): Promise<EsfuerzosGuardados> {
  try {
    return esfuerzosGuardados(await readFile(join(homedir(), '.claude', 'settings.json'), 'utf8'))
  } catch {
    return { todos: null, porModelo: {} }
  }
}

function ventanaDe(v: { utilization: number | null; resets_at: string | null } | null | undefined) {
  if (!v || v.utilization === null) return null
  const libera = v.resets_at ? Date.parse(v.resets_at) : Number.NaN
  const usado = Math.max(0, Math.min(100, v.utilization))
  return { usado, libera: Number.isNaN(libera) ? null : libera, agotada: usado >= 100 } satisfies VentanaUso
}

/** El uso de la ventana de 5 horas y de la semana; null si la cuenta no tiene límites de plan (clave de API). */
export function usoDe(
  r: Pick<SDKControlGetUsageResponse, 'rate_limits_available' | 'rate_limits'>,
): UsoMotor | null {
  if (!r.rate_limits_available || !r.rate_limits) return null
  return { cincoHoras: ventanaDe(r.rate_limits.five_hour), semana: ventanaDe(r.rate_limits.seven_day) }
}

const CLASES: Record<string, CategoriaContexto['clase'] | undefined> = {
  used: 'usado',
  free: 'libre',
  buffer: 'reserva',
}

/** La caché del modelo dura 5 minutos o 1 hora desde el último pedido (Q-77). */
export const CACHE_5_MIN = 5 * 60_000
export const CACHE_1_H = 60 * 60_000

/** Cuánto dura la caché según lo que dijo el modelo al escribir en ella; null si no escribió nada. */
export function cacheDe(uso: unknown): number | null {
  const c = (uso as { cache_creation?: Record<string, unknown> } | null)?.cache_creation
  if (!c) return null
  const n = (k: string) => (typeof c[k] === 'number' ? (c[k] as number) : 0)
  if (n('ephemeral_1h_input_tokens') > 0) return CACHE_1_H
  if (n('ephemeral_5m_input_tokens') > 0) return CACHE_5_MIN
  return null
}

/** La caché de una sesión abierta: cuánto dura y desde cuándo corre. */
export interface CacheSesion {
  cacheMs: number | null
  ultimoPedido: number | null
}

export function contextoDe(
  r: Pick<SDKControlGetContextUsageResponse, 'totalTokens' | 'maxTokens' | 'percentage'> &
    Partial<Pick<SDKControlGetContextUsageResponse, 'categories'>>,
  cache: CacheSesion = { cacheMs: null, ultimoPedido: null },
): ContextoConversacion {
  // Las herramientas que se cargan solo si hacen falta no ocupan la ventana: no van al desglose.
  const categorias = (r.categories ?? [])
    .map((c) => {
      const clase = CLASES[c.kind]
      return clase && c.tokens > 0 ? { id: c.id ?? c.name, nombre: c.name, tokens: c.tokens, clase } : null
    })
    .filter((c): c is CategoriaContexto => c !== null)
  return {
    usados: r.totalTokens,
    maximo: r.maxTokens,
    porcentaje: Math.round(r.percentage),
    categorias: categorias.length > 0 ? categorias : null,
    cacheMs: cache.cacheMs,
    ultimoPedido: cache.ultimoPedido,
  }
}

/** Una promesa que se corta a los `ms` (con null), para no dejar una sesión colgada esperando un dato. */
function aTiempo<T>(p: Promise<T>, ms: number): Promise<T | null> {
  let t: NodeJS.Timeout | undefined
  return Promise.race([
    p.catch(() => null),
    new Promise<null>((r) => {
      t = setTimeout(() => r(null), ms)
    }),
  ]).finally(() => clearTimeout(t))
}

/**
 * Una sesión que no manda mensajes (no gasta uso; probado en S-2): para preguntarle a Claude Code por la cuenta, los
 * modelos, el uso o el contexto de una conversación guardada.
 */
async function sinMensajes<T>(options: Options, pedir: (s: Query) => Promise<T>): Promise<T> {
  let soltar = () => {}
  const espera = new Promise<void>((r) => {
    soltar = r
  })
  // biome-ignore lint/correctness/useYield: la entrada no manda nada a propósito; solo espera a que se cierre.
  async function* entrada(): AsyncGenerator<never> {
    await espera
  }
  const sesion = query({ prompt: entrada(), options })
  // Se lee lo que diga (nada que importe) para saber cuándo terminó Claude Code: al salir todavía escribe.
  const termino = (async () => {
    for await (const _ of sesion) {
      // Sin mensajes que mostrar: la sesión no manda nada.
    }
  })().catch(() => {})
  let temporizador: NodeJS.Timeout | undefined
  try {
    return await Promise.race([
      pedir(sesion),
      new Promise<never>((_, rechazar) => {
        temporizador = setTimeout(
          () => rechazar(new Error('Claude Code no respondió a tiempo')),
          ESPERA_VERIFICAR_MS,
        )
      }),
    ])
  } finally {
    clearTimeout(temporizador)
    // Cerrar la entrada lo deja terminar solo; si tarda, se lo cierra.
    soltar()
    await aTiempo(termino, ESPERA_SALIR_MS)
    sesion.close()
  }
}

/**
 * Cuánto ocupa una conversación guardada según su última respuesta: lo que entró al modelo, con lo que estaba en
 * caché (lo mismo que calcula Claude Code, sin la respuesta). Lo de los agentes no cuenta. null si no hay respuestas.
 */
export function tokensDeHistorial(
  historial: readonly SessionMessage[],
): { usados: number; modelo: string | null; cacheMs: number | null } | null {
  let encontrado: { usados: number; modelo: string | null } | null = null
  for (let i = historial.length - 1; i >= 0; i--) {
    const m = historial[i]
    if (m?.type !== 'assistant' || m.parent_tool_use_id !== null) continue
    const mensaje = m.message as { model?: unknown; usage?: Record<string, unknown> } | null
    const uso = mensaje?.usage
    if (!uso) continue
    if (encontrado) {
      // Lo que dura la caché lo dice la última respuesta que escribió en ella.
      const cache = cacheDe(uso)
      if (cache) return { ...encontrado, cacheMs: cache }
      continue
    }
    const n = (k: string) => (typeof uso[k] === 'number' ? (uso[k] as number) : 0)
    const usados = n('input_tokens') + n('cache_creation_input_tokens') + n('cache_read_input_tokens')
    // Las respuestas que arma Claude Code sin el modelo (al detener, por ejemplo) no traen tokens.
    if (usados === 0) continue
    encontrado = { usados, modelo: typeof mensaje.model === 'string' ? mensaje.model : null }
    const cache = cacheDe(uso)
    if (cache) return { ...encontrado, cacheMs: cache }
  }
  return encontrado && { ...encontrado, cacheMs: null }
}

/**
 * Los comandos de Claude Code que la lista de «/» esconde (D-167), con qué pisa cada uno; también por sus otros
 * nombres. Se revisa al subir el SDK (`research/comandos-y-adjuntos-del-motor.md` › 2): los que cambian el modelo, el
 * esfuerzo, el tono o la conversación por fuera de Iridium, los que Iridium ya muestra y los que solo sirven en la
 * terminal.
 */
export const ESCONDIDOS: Readonly<Record<string, Pisa>> = {
  model: 'modelo',
  fast: 'modelo',
  effort: 'esfuerzo',
  'output-style': 'tono',
  clear: 'conversacion',
  reset: 'conversacion',
  new: 'conversacion',
  context: 'contexto',
  usage: 'uso',
  cost: 'uso',
  stats: 'uso',
  color: 'terminal',
  focus: 'terminal',
  heapdump: 'terminal',
  '__remote-workflow': 'terminal',
  'workflow-launch-exec': 'terminal',
}

/** Las fotos que recibe Claude dentro del mensaje (S-5; los límites, a confirmar con una captura real). */
const FOTOS: NonNullable<CapacidadesMotor['fotos']> = {
  medios: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  maxBytes: 5 * 2 ** 20,
  maxLado: 8000,
}

/**
 * La lista de comandos de Claude Code en palabras de Iridium: de dónde sale cada uno y si se esconde. Solo se esconden
 * los suyos (`builtin`), no una skill o un complemento con el mismo nombre. La descripción de un complemento llega con
 * su nombre adelante («(engineering) …»): ese nombre va aparte.
 */
export function comandosDe(lista: readonly SlashCommand[]): ComandoMotor[] {
  return lista.map((c) => {
    const complemento = !c.builtin && c.name.includes(':') ? c.name.slice(0, c.name.indexOf(':')) : null
    const marca = complemento ? `(${complemento})` : null
    const descripcion =
      marca && c.description.startsWith(marca) ? c.description.slice(marca.length) : c.description
    return {
      nombre: c.name,
      otrosNombres: c.aliases ?? [],
      argumentos: c.argumentHint.trim() || null,
      descripcion: descripcion.trim(),
      origen: c.builtin ? 'motor' : complemento ? 'complemento' : 'skill',
      complemento,
      escondido: c.builtin ? (ESCONDIDOS[c.name.toLowerCase()] ?? null) : null,
    }
  })
}

/**
 * Lo que el usuario no escribió: avisos del sistema, archivos abiertos en el editor, comandos. Las marcas de Iridium
 * (`iridium-*`: el texto pegado y los archivos, D-169 › 6) quedan: las lee la app.
 */
const BLOQUE_INTERNO = /<((?!iridium-)[a-z][\w-]*)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi
const DETENIDA = /^\[Request interrupted by user[^\]]*\]$/

interface Bloque {
  type: string
  text?: string
  name?: string
  input?: unknown
  source?: { type?: unknown; media_type?: unknown; data?: unknown }
}

function bloques(contenido: unknown): Bloque[] {
  if (typeof contenido === 'string') return [{ type: 'text', text: contenido }]
  return Array.isArray(contenido) ? (contenido as Bloque[]) : []
}

/** Las fotos de un mensaje del usuario (bloques `image` en base64), como las guarda Claude Code (PA-5). */
export function fotosDe(contenido: unknown): FotoMotor[] {
  return bloques(contenido).flatMap((b) => {
    const s = b.source
    return b.type === 'image' &&
      s?.type === 'base64' &&
      typeof s.media_type === 'string' &&
      FOTOS.medios.includes(s.media_type) &&
      typeof s.data === 'string'
      ? [{ medio: s.media_type as FotoMotor['medio'], datos: s.data }]
      : []
  })
}

/** Lo que sale en un mensaje: sin fotos, el texto, como siempre; con fotos, ellas primero y el texto después (D-169 › 5). */
export function contenidoDe(
  texto: string,
  fotos: readonly FotoMotor[],
): SDKUserMessage['message']['content'] {
  if (fotos.length === 0) return texto
  return [
    ...fotos.map((f) => ({
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: f.medio, data: f.datos },
    })),
    ...(texto.trim() ? [{ type: 'text' as const, text: texto }] : []),
  ]
}

function corto(t: string, max = 120): string {
  const una = t.replace(/\s+/g, ' ').trim()
  return una.length > max ? `${una.slice(0, max - 1)}…` : una
}

function rutaCorta(ruta: string, carpeta: string): string {
  const barras = (r: string) => r.replace(/\\/g, '/')
  if (!isAbsolute(ruta)) return barras(ruta)
  const r = relative(carpeta, ruta)
  return r && !r.startsWith('..') && !isAbsolute(r) ? barras(r) : barras(ruta)
}

/** Una herramienta de Claude Code en palabras de la app: «Leyó» `docs/estado.md`. */
export function describirHerramienta(
  nombre: string,
  entrada: unknown,
  carpeta: string,
): { accion: string; objeto: string | null } {
  const e = (entrada ?? {}) as Record<string, unknown>
  const texto = (k: string) => {
    const v = e[k]
    return typeof v === 'string' && v !== '' ? v : null
  }
  const ruta = (k: string) => {
    const r = texto(k)
    return r === null ? null : rutaCorta(r, carpeta)
  }
  switch (nombre) {
    case 'Read':
      return { accion: 'Leyó', objeto: ruta('file_path') }
    case 'Write':
      return { accion: 'Escribió', objeto: ruta('file_path') }
    case 'Edit':
    case 'MultiEdit':
      return { accion: 'Editó', objeto: ruta('file_path') }
    case 'NotebookEdit':
      return { accion: 'Editó', objeto: ruta('notebook_path') }
    case 'Bash':
    case 'PowerShell': {
      const que = texto('description') ?? texto('command')
      return { accion: 'Ejecutó', objeto: que === null ? null : corto(que) }
    }
    case 'Grep':
      return { accion: 'Buscó', objeto: texto('pattern') }
    case 'Glob':
      return { accion: 'Buscó archivos', objeto: texto('pattern') }
    case 'WebFetch':
      return { accion: 'Leyó la página', objeto: texto('url') }
    case 'WebSearch':
      return { accion: 'Buscó en la web', objeto: texto('query') }
    case 'Task':
    case 'Agent':
      return { accion: 'Le pidió a un agente', objeto: texto('description') }
    case 'TodoWrite':
      return { accion: 'Ordenó sus tareas', objeto: null }
    case 'Skill':
      return { accion: 'Usó la skill', objeto: texto('skill') ?? texto('command') }
    default: {
      const navegador = /^mcp__claude-in-chrome__(.+)$/.exec(nombre)?.[1]
      if (navegador) return enElNavegador(navegador, e)
      return { accion: 'Usó', objeto: nombre.replace(/^mcp__/, '').replace(/__/g, ' · ') }
    }
  }
}

/** Lo que hizo la IA con cada herramienta de Claude in Chrome, en palabras (`ux.md` › PA-10: «En el navegador: abrió …»). */
const PASOS_NAVEGADOR: Record<string, string> = {
  navigate: 'abrió',
  tabs_create_mcp: 'abrió una pestaña',
  tabs_close_mcp: 'cerró una pestaña',
  tabs_context_mcp: 'miró las pestañas',
  read_page: 'leyó la página',
  get_page_text: 'leyó la página',
  find: 'buscó en la página',
  form_input: 'completó un campo',
  javascript_tool: 'corrió código en la página',
  read_console_messages: 'leyó la consola',
  read_network_requests: 'miró lo que pidió la página',
  gif_creator: 'grabó la pantalla',
  upload_image: 'subió una imagen',
  file_upload: 'subió un archivo',
  resize_window: 'cambió el tamaño de la ventana',
  browser_batch: 'hizo varios pasos',
  shortcuts_list: 'miró los atajos',
  shortcuts_execute: 'usó un atajo',
  switch_browser: 'eligió el navegador',
  select_browser: 'eligió el navegador',
  list_connected_browsers: 'miró los navegadores',
}

/** Lo que hizo el mouse o el teclado (`computer`); lo escrito no se muestra: puede ser una clave. */
const PASOS_COMPUTER: Record<string, string> = {
  screenshot: 'sacó una captura',
  zoom: 'sacó una captura',
  left_click: 'hizo clic',
  right_click: 'hizo clic',
  double_click: 'hizo clic',
  triple_click: 'hizo clic',
  left_click_drag: 'arrastró',
  type: 'escribió',
  key: 'apretó una tecla',
  scroll: 'se desplazó',
  scroll_to: 'se desplazó',
  hover: 'pasó el mouse',
  wait: 'esperó',
}

function enElNavegador(
  herramienta: string,
  e: Record<string, unknown>,
): { accion: string; objeto: string | null } {
  const texto = (k: string) => (typeof e[k] === 'string' && e[k] !== '' ? (e[k] as string) : null)
  const que =
    herramienta === 'computer'
      ? (PASOS_COMPUTER[texto('action') ?? ''] ?? 'usó el mouse y el teclado')
      : (PASOS_NAVEGADOR[herramienta] ?? `usó ${herramienta}`)
  const objeto = herramienta === 'navigate' ? texto('url') : herramienta === 'find' ? texto('query') : null
  return { accion: `En el navegador: ${que}`, objeto: objeto === null ? null : corto(objeto) }
}

/** Un comando mandado, como lo guarda Claude Code: `<command-name>/compact</command-name>` y `<command-args>`. */
const COMANDO_GUARDADO = /<command-name>\s*\/?([^<\s]+)\s*<\/command-name>/
const ARGUMENTOS_GUARDADOS = /<command-args>([\s\S]*?)<\/command-args>/
/** Lo que respondió un comando de Claude Code sin el modelo (`/context`, `/usage`). */
const SALIDA_COMANDO = /<local-command-stdout>([\s\S]*?)<\/local-command-stdout>/

/** Un comando mandado vuelve a ser lo que se escribió, «/nombre lo que sigue» (PA-5); null si no es un comando. */
export function comandoGuardado(texto: string): string | null {
  const nombre = COMANDO_GUARDADO.exec(texto)?.[1]
  if (!nombre) return null
  const argumentos = ARGUMENTOS_GUARDADOS.exec(texto)?.[1]?.trim()
  return argumentos ? `/${nombre} ${argumentos}` : `/${nombre}`
}

/** Lo que respondió un comando, en Markdown; null si no hay o vino vacío. */
export function salidaDeComando(texto: string): string | null {
  const salida = SALIDA_COMANDO.exec(texto)?.[1]?.trim()
  return salida ? salida : null
}

/** Lo que escribió el usuario, sin lo que agrega Claude Code; null si no queda nada (resultados de herramientas). */
export function textoDeUsuario(contenido: unknown): MensajeMotor | null {
  const partes = bloques(contenido)
  if (partes.some((b) => b.type === 'tool_result')) return null
  const crudo = partes
    .flatMap((b) => (b.type === 'text' && typeof b.text === 'string' ? [b.text] : []))
    .join('\n')
  // Un comando que se mandó y lo que respondió sin el modelo, antes de sacar lo que agrega Claude Code (PA-5).
  const fotos = fotosDe(contenido)
  const conFotos = fotos.length ? { fotos } : {}
  const comando = comandoGuardado(crudo)
  if (comando) return { tipo: 'usuario', texto: comando, cuando: null, ...conFotos }
  const salida = salidaDeComando(crudo)
  if (salida) return { tipo: 'ia', texto: salida, cuando: null, final: true }
  const texto = crudo.replace(BLOQUE_INTERNO, '').trim()
  if (texto === '' && fotos.length === 0) return null
  if (DETENIDA.test(texto)) return { tipo: 'detenida' }
  return { tipo: 'usuario', texto, cuando: null, ...conFotos }
}

/** Los textos y las herramientas de un mensaje de la IA. */
export function mensajesDeIa(
  contenido: unknown,
  carpeta: string,
  cuando: number | null,
  final = false,
): MensajeMotor[] {
  const salida: MensajeMotor[] = []
  for (const b of bloques(contenido)) {
    if (b.type === 'text' && typeof b.text === 'string' && b.text.trim() !== '')
      salida.push({ tipo: 'ia', texto: b.text, cuando, ...(final ? { final } : {}) })
    else if (b.type === 'tool_use' && typeof b.name === 'string')
      salida.push({ tipo: 'herramienta', ...describirHerramienta(b.name, b.input, carpeta) })
  }
  return salida
}

/** Si con este mensaje la IA terminó de responder (R-72): Claude Code guarda `end_turn` en el último texto. */
function terminoDeResponder(mensaje: unknown): boolean {
  return (mensaje as { stop_reason?: unknown } | null)?.stop_reason === 'end_turn'
}

/**
 * Lo que respondieron los comandos de una conversación guardada, por el mensaje del comando: Claude Code lo guarda en
 * una línea de sistema (`local_command`) que el SDK no devuelve con los mensajes. Se lee del `.jsonl`.
 */
export function salidasDeComandos(jsonl: string): Map<string, string> {
  const salidas = new Map<string, string>()
  for (const linea of jsonl.split('\n')) {
    if (!linea.includes('local-command-stdout')) continue
    try {
      const l = JSON.parse(linea) as { type?: unknown; parentUuid?: unknown; content?: unknown }
      if (l.type !== 'system' || typeof l.parentUuid !== 'string' || typeof l.content !== 'string') continue
      const salida = salidaDeComando(l.content)
      if (salida) salidas.set(l.parentUuid, salida)
    } catch {
      // Una línea a medio escribir: se saltea.
    }
  }
  return salidas
}

/**
 * Una conversación guardada, en mensajes de la app. Lo de los agentes (subconversaciones) no se muestra. `salidas`: lo
 * que respondió cada comando sin el modelo, por el id del mensaje del comando.
 */
export function mensajesDeHistorial(
  historial: readonly SessionMessage[],
  carpeta: string,
  salidas: ReadonlyMap<string, string> = new Map(),
): MensajeMotor[] {
  const salida: MensajeMotor[] = []
  for (const m of historial) {
    if (m.parent_tool_use_id !== null) continue
    const contenido = (m.message as { content?: unknown } | null)?.content
    if (m.type === 'user') {
      const u = textoDeUsuario(contenido)
      if (u) salida.push(u)
      const respuesta = salidas.get(m.uuid)
      if (respuesta) salida.push({ tipo: 'ia', texto: respuesta, cuando: null, final: true })
    } else if (m.type === 'assistant')
      salida.push(...mensajesDeIa(contenido, carpeta, null, terminoDeResponder(m.message)))
  }
  return salida
}

/** El `.jsonl` de una conversación guardada; vacío si no se encuentra (D-083: `projects\<ruta con guiones>`). */
async function leerJsonl(carpeta: string, id: string): Promise<string> {
  const proyectos = join(process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude'), 'projects')
  try {
    const buscada = carpetaDeConversaciones(carpeta).toLowerCase()
    const nombre = (await readdir(proyectos)).find((n) => n.toLowerCase() === buscada)
    return nombre ? await readFile(join(proyectos, nombre, `${id}.jsonl`), 'utf8') : ''
  } catch {
    return ''
  }
}

/** Un aviso de reintento de Claude Code (`api_retry`) en palabras de la app (Defecto 10). */
export function reintentoDe(m: {
  attempt: number
  max_retries: number
  retry_delay_ms: number
  error_status: number | null
}): ReintentoSesion {
  return {
    intento: m.attempt,
    maximo: m.max_retries,
    esperaMs: m.retry_delay_ms,
    // Sin respuesta HTTP es la conexión (sin red, el proxy, el DNS); con un código, el servidor de Claude.
    causa: m.error_status === null ? 'conexion' : 'servidor',
  }
}

/** Si el error con que terminó un turno es de conexión: Claude Code lo dice en inglés y con el nombre técnico. */
export function esSinConexion(motivo: string): boolean {
  return /connection (refused|error|reset)|unable to connect|econnrefused|econnreset|enotfound|eai_again|etimedout|fetch failed|network|socket hang up/i.test(
    motivo,
  )
}

/** Por qué terminó mal un turno, en una línea. */
function motivoDe(m: Extract<SDKMessage, { type: 'result' }>): string {
  if (m.subtype === 'success') return corto(m.result || 'Claude Code devolvió un error', 300)
  return corto(m.errors.join(' · ') || m.subtype, 300)
}

/** El modelo y el esfuerzo del proyecto como opciones de la sesión; sin elegir, los de Claude Code. */
function modeloYEsfuerzo(a: AjusteIa): Pick<Options, 'model' | 'effort'> {
  return { ...(a.modelo ? { model: a.modelo } : {}), ...(a.esfuerzo ? { effort: a.esfuerzo } : {}) }
}

/**
 * El tono como ajuste propio de la sesión (D-065): no se escribe en los ajustes de Claude Code de la PC, así VS Code
 * y la terminal siguen con su estilo. Sin tono, nada: rige el del usuario.
 */
export function tonoDeSesion(tono: string | null): Pick<Options, 'settings'> {
  return tono ? { settings: { outputStyle: tono } } : {}
}

/**
 * Los conectores apagados en Iridium como ajuste de la sesión (D-189 › 2): `managedSettings` vale solo para esa sesión
 * y no escribe nada en la configuración de Claude Code (S-8). Sin apagados, nada.
 */
export function apagadosDeSesion(apagados: readonly string[] = []): Pick<Options, 'managedSettings'> {
  return apagados.length
    ? { managedSettings: { deniedMcpServers: apagados.map((serverName) => ({ serverName })) } }
    : {}
}

/**
 * El navegador del usuario como opción de la sesión (D-189 › 4): `--chrome` suma Claude in Chrome, y Claude Code busca
 * solo el navegador con la extensión «Claude» (S-8). Apagado, nada.
 */
export function navegadorDeSesion(prendido = false): Pick<Options, 'extraArgs'> {
  return prendido ? { extraArgs: { chrome: null } } : {}
}

/** El estado de un conector como lo dice Claude Code, en palabras de Iridium. Uno que sigue conectando, como falla. */
export function conectorDe(s: Pick<McpServerStatus, 'name' | 'status' | 'error'>): ConectorSesion {
  const estado: ConectorSesion['estado'] =
    s.status === 'connected'
      ? 'conectado'
      : s.status === 'needs-auth'
        ? 'falta-sesion'
        : s.status === 'disabled'
          ? 'apagado-afuera'
          : // Los complementos traen algunos sin dirección, para que la ponga quien los usa (S-8).
            s.status === 'failed' && /no url configured/i.test(s.error ?? '')
            ? 'sin-configurar'
            : 'falla'
  return { nombre: s.name, estado }
}

/** Lo que tiene la IA: los complementos en disco con cuántos conectores suma cada uno, y los conectores. */
export function capacidadesDe(
  estados: readonly Pick<McpServerStatus, 'name' | 'status' | 'error'>[],
  complementos: readonly ComplementoEnDisco[],
): CapacidadesSesion {
  const conectores = estados.map(conectorDe)
  return {
    complementos: complementos.map((c) => ({
      ...c,
      conectores: conectores.filter((x) => complementoDe(x.nombre) === c.nombre).length,
    })),
    conectores,
  }
}

/** El `name` y la `description` del encabezado de un estilo propio (`~/.claude/output-styles/*.md`). */
export function encabezadoDeEstilo(texto: string): { nombre: string | null; descripcion: string | null } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(texto)
  const campo = (k: string) => {
    const v = m?.[1] && new RegExp(`^${k}:\\s*(.+)$`, 'm').exec(m[1])?.[1]?.trim()
    return v ? v.replace(/^(["'])(.*)\1$/, '$2') : null
  }
  return { nombre: campo('name'), descripcion: campo('description') }
}

/** Las descripciones de los estilos propios del usuario, por su nombre. */
async function descripcionesDeEstilos(): Promise<Map<string, string>> {
  const carpeta = join(homedir(), '.claude', 'output-styles')
  const descripciones = new Map<string, string>()
  const archivos = await readdir(carpeta).catch(() => [])
  for (const a of archivos.filter((x) => x.endsWith('.md'))) {
    const e = encabezadoDeEstilo(await readFile(join(carpeta, a), 'utf8').catch(() => ''))
    if (e.descripcion) descripciones.set(e.nombre ?? a.slice(0, -3), e.descripcion)
  }
  return descripciones
}

/** El Claude Code que trae el SDK, si no se indicó otro (en desarrollo y en las herramientas). */
function claudeDelSdk(): string {
  const requerir = createRequire(import.meta.url)
  const sdk = requerir.resolve('@anthropic-ai/claude-agent-sdk')
  return createRequire(sdk).resolve(
    `@anthropic-ai/claude-agent-sdk-${process.platform}-${process.arch}/claude.exe`,
  )
}

/** Si Claude Code tiene sesión iniciada, según `claude auth status --json`; null si no se pudo saber. */
function sesionIniciada(claude: string): Promise<boolean | null> {
  const env = { ...process.env }
  delete env.ELECTRON_RUN_AS_NODE
  return new Promise((listo) => {
    execFile(
      claude,
      ['auth', 'status', '--json'],
      { env, timeout: 15_000, windowsHide: true },
      (_e, salida) => {
        try {
          const r = JSON.parse(String(salida)) as { loggedIn?: unknown }
          listo(typeof r.loggedIn === 'boolean' ? r.loggedIn : null)
        } catch {
          listo(null)
        }
      },
    )
  })
}

/**
 * `claude auth login` en una consola a la vista (CO-I1): abre el navegador para entrar con la cuenta de Claude y,
 * si Claude Code pide algo (pegar un código), el usuario lo ve. La consola se cierra sola al terminar bien; si
 * falla, queda abierta para leer el error. Termina cuando se cierra la consola o a los diez minutos.
 */
function loginEnConsola(claude: string): Promise<void> {
  const env = { ...process.env }
  delete env.ELECTRON_RUN_AS_NODE
  return new Promise((listo) => {
    const consola = spawn('cmd.exe', ['/d', '/s', '/c', `""${claude}" auth login --claudeai || pause"`], {
      env,
      detached: true,
      stdio: 'ignore',
      windowsVerbatimArguments: true,
    })
    const espera = setTimeout(listo, ESPERA_LOGIN_MS)
    const fin = () => {
      clearTimeout(espera)
      listo()
    }
    consola.once('error', fin)
    consola.once('exit', fin)
  })
}

export function crearMotorSdk(opciones: OpcionesSdk = {}): Motor {
  const ejecutable = opciones.rutaClaude ? { pathToClaudeCodeExecutable: opciones.rutaClaude } : {}
  let iniciando: Promise<void> | null = null
  /** El tamaño de la ventana de contexto de cada modelo (por su id): lo dicen las sesiones o se pregunta una vez. */
  const ventanas = new Map<string, Promise<number | null>>()
  const ventanaDe = (modelo: string | null): Promise<number | null> => {
    const clave = modelo ?? ''
    let v = ventanas.get(clave)
    if (!v) {
      // Una sesión nueva sin mensajes con ese modelo: no escribe ninguna conversación ni gasta uso.
      v = sinMensajes(
        { cwd: homedir(), settingSources: [], ...(modelo ? { model: modelo } : {}), ...ejecutable },
        async (s) => (await s.getContextUsage({ detail: 'summary' })).maxTokens,
      ).catch(() => null)
      ventanas.set(clave, v)
      void v.then((n) => {
        if (n === null) ventanas.delete(clave)
      })
    }
    return v
  }
  return {
    capacidades: () => ({ comandos: true, fotos: FOTOS, escondidos: { ...ESCONDIDOS }, conectores: true }),

    async comandos(carpeta) {
      // Como una conversación de esa carpeta (sus ajustes y los complementos de Iridium), sin mandar nada.
      const lista = await sinMensajes(
        {
          cwd: carpeta,
          settingSources: ['user', 'project', 'local'],
          ...(opciones.plugins?.length
            ? { plugins: opciones.plugins.map((path) => ({ type: 'local' as const, path })) }
            : {}),
          ...ejecutable,
        },
        (s) => s.supportedCommands(),
      )
      return comandosDe(lista)
    },

    async capacidadesSesion() {
      // Como una conversación nueva (los ajustes del usuario y los complementos de Iridium), sin los apagados: así se
      // ven también ellos. Se espera a que ninguno siga conectando, con un tope.
      const [estados, complementos] = await Promise.all([
        sinMensajes(
          {
            cwd: homedir(),
            settingSources: ['user', 'project', 'local'],
            ...(opciones.plugins?.length
              ? { plugins: opciones.plugins.map((path) => ({ type: 'local' as const, path })) }
              : {}),
            ...ejecutable,
          },
          async (s) => {
            const desde = Date.now()
            let lista = await s.mcpServerStatus()
            while (lista.some((x) => x.status === 'pending') && Date.now() - desde < ESPERA_CONECTORES_MS) {
              await new Promise((r) => setTimeout(r, 500))
              lista = await s.mcpServerStatus()
            }
            return lista
          },
        ),
        leerComplementos(join(homedir(), '.claude'), opciones.plugins ?? []),
      ])
      return capacidadesDe(estados, complementos)
    },

    async conectar(nombre) {
      // `claude mcp login` abre el navegador y espera la vuelta, para un conector de un complemento y para uno de
      // claude.ai (PA-I4; con `/mcp`, la consola mostraba antes la bienvenida y si confiar en la carpeta).
      if (!NOMBRE_CONECTOR.test(nombre)) throw new Error(`Nombre de conector inválido: ${nombre}`)
      const claude = opciones.rutaClaude ?? claudeDelSdk()
      const comando = `"${claude}" mcp login "${nombre}"`
      if (opciones.consola) return opciones.consola(`Conectar ${nombre}`, comando)
      throw new Error('Conectar necesita la consola de Iridium')
    },

    async verificar() {
      // R-5: lo de la cuenta solo no alcanza para saber si hay sesión; `auth status` corre a la par.
      const conSesion = (async () => {
        try {
          return await sesionIniciada(opciones.rutaClaude ?? claudeDelSdk())
        } catch {
          return null
        }
      })()
      try {
        return await sinMensajes({ cwd: homedir(), settingSources: [], ...ejecutable }, async (s) => {
          const estado = estadoDeCuenta(await s.accountInfo(), await conSesion)
          if (estado.tipo !== 'listo') return { estado, uso: null }
          const [modelos, guardados, uso] = await Promise.all([
            s.supportedModels().catch(() => []),
            leerEsfuerzosGuardados(),
            aTiempo(
              s.usage_EXPERIMENTAL_MAY_CHANGE_DO_NOT_RELY_ON_THIS_API_YET({ skipBehaviors: true }),
              ESPERA_DATOS_MS,
            ),
          ])
          return {
            estado: { ...estado, modelos: modelosDe(modelos, guardados) },
            uso: uso ? usoDe(uso) : null,
          }
        })
      } catch (e) {
        if ((await conSesion) === false) return { estado: { tipo: 'sin-sesion' }, uso: null }
        return { estado: { tipo: 'falla', motivo: e instanceof Error ? e.message : String(e) }, uso: null }
      }
    },

    iniciarSesion() {
      const claude = opciones.rutaClaude ?? claudeDelSdk()
      // En la consola de abajo, si Claude pide pegar un código, se pega ahí (T-116).
      const login = opciones.consola
        ? opciones.consola('Iniciar sesión en Claude', `"${claude}" auth login --claudeai`)
        : loginEnConsola(claude)
      iniciando ??= login.finally(() => {
        iniciando = null
      })
      return iniciando
    },

    async uso() {
      try {
        return await sinMensajes({ cwd: homedir(), settingSources: [], ...ejecutable }, async (s) =>
          usoDe(await s.usage_EXPERIMENTAL_MAY_CHANGE_DO_NOT_RELY_ON_THIS_API_YET({ skipBehaviors: true })),
        )
      } catch {
        return null
      }
    },

    async estilos() {
      // Con los ajustes del usuario, para que aparezcan los suyos de `~/.claude/output-styles/`.
      try {
        const [nombres, descripciones] = await Promise.all([
          sinMensajes(
            { cwd: homedir(), settingSources: ['user'], ...ejecutable },
            async (s) => (await s.initializationResult()).available_output_styles,
          ),
          descripcionesDeEstilos(),
        ])
        return nombres.map((id) => ({ id, descripcion: descripciones.get(id) ?? null }))
      } catch {
        return null
      }
    },

    async contexto(carpeta, id) {
      // Del historial, sin retomar la conversación: retomarla, aun sin mandar nada, le agrega líneas y le cambia la
      // fecha (parecería usada en VS Code, D-027). Lo usado es lo que entró al modelo en la última respuesta, como
      // calcula Claude Code; el tamaño de la ventana se le pregunta una vez por modelo.
      try {
        const t = tokensDeHistorial(await getSessionMessages(id, { dir: carpeta }))
        if (!t) return null
        const maximo = await ventanaDe(t.modelo)
        if (!maximo) return null
        // Cuándo fue el último pedido no está en los mensajes: lo pone la app con la fecha de la conversación.
        return {
          usados: t.usados,
          maximo,
          porcentaje: Math.round((t.usados / maximo) * 100),
          categorias: null,
          cacheMs: t.cacheMs,
          ultimoPedido: null,
        }
      } catch {
        return null
      }
    },

    abrir({ carpeta, conversacion, instruccion, ajuste, tono, apagados, navegador }, alEvento): SesionMotor {
      const cola: { texto: string; fotos: FotoMotor[] }[] = []
      let despertar: (() => void) | null = null
      let terminada = false
      let deteniendo = false
      let turnoAbierto = false
      /** Lo último que dijo Claude Code de por qué falló un mensaje, y si el plan rechazó el pedido (F-5). */
      let errorDeMensaje: string | null = null
      let rechazo: { libera: number | null } | null = null
      /** El último reintento de Claude Code en este turno; se borra cuando vuelve a llegar algo de Claude. */
      let reintento: ReintentoSesion | null = null
      /** El modelo que responde: su ventana de contexto se recuerda para las conversaciones guardadas. */
      let modelo: string | null = null
      /** La caché de la conversación: cuánto dura y desde cuándo corre (el último pedido al modelo). */
      const cache: CacheSesion = { cacheMs: null, ultimoPedido: null }
      /** Lo que la IA dejó corriendo de fondo, sin lo que no es trabajo (los que solo miran), por id (T-65). */
      let fondo = new Map<string, string>()
      /** Terminó un turno con algo de fondo: la sesión queda abierta hasta que la IA retome y termine. */
      let esperandoFondo = false

      const terminarEntrada = () => {
        terminada = true
        despertar?.()
      }
      async function* entrada(): AsyncGenerator<SDKUserMessage> {
        while (true) {
          const m = cola.shift()
          if (m !== undefined) {
            turnoAbierto = true
            esperandoFondo = false
            yield {
              type: 'user',
              message: { role: 'user', content: contenidoDe(m.texto, m.fotos) },
              parent_tool_use_id: null,
            }
            continue
          }
          if (terminada) return
          await new Promise<void>((r) => {
            despertar = r
          })
          despertar = null
        }
      }

      const config: Options = {
        cwd: carpeta,
        // Las del usuario y las del proyecto: así cargan las skills, `CLAUDE.md` y la guía (05-arquitectura.md › Seguí).
        settingSources: ['user', 'project', 'local'],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        disallowedTools: ['AskUserQuestion'],
        systemPrompt: { type: 'preset', preset: 'claude_code', append: instruccion },
        // Solo en las conversaciones de Iridium: el Claude de VS Code o de la terminal no los ve (D-086).
        ...(opciones.plugins?.length
          ? { plugins: opciones.plugins.map((path) => ({ type: 'local' as const, path })) }
          : {}),
        // Sin `canUseTool`: en *bypass* el SDK no consulta permisos nunca (lo avisa él mismo; S-2, D-021).
        ...(conversacion ? { resume: conversacion } : {}),
        ...modeloYEsfuerzo(ajuste),
        ...tonoDeSesion(tono),
        ...apagadosDeSesion(apagados),
        ...navegadorDeSesion(navegador),
        ...(opciones.modelo ? { model: opciones.modelo } : {}),
        ...ejecutable,
      }
      const sesion = query({ prompt: entrada(), options: config })

      /** Por qué falló el turno, en los motivos de la app. */
      const fallaDelTurno = (motivo: string | null): FallaMotor => {
        if (errorDeMensaje === 'authentication_failed' || errorDeMensaje === 'oauth_org_not_allowed')
          return { tipo: 'sin-sesion' }
        if (rechazo || errorDeMensaje === 'rate_limit')
          return { tipo: 'uso-agotado', libera: rechazo?.libera ?? null }
        if (reintento?.causa === 'conexion' || (motivo && esSinConexion(motivo)))
          return { tipo: 'sin-conexion' }
        return { tipo: 'falla' }
      }
      /** Al terminar un turno: el contexto de la conversación y el uso, antes de cerrar la sesión. */
      const datosDelTurno = async () => {
        const [contexto, uso] = await Promise.all([
          aTiempo(sesion.getContextUsage({ detail: 'summary' }), ESPERA_DATOS_MS),
          aTiempo(
            sesion.usage_EXPERIMENTAL_MAY_CHANGE_DO_NOT_RELY_ON_THIS_API_YET({ skipBehaviors: true }),
            ESPERA_DATOS_MS,
          ),
        ])
        if (contexto) {
          if (modelo) ventanas.set(modelo, Promise.resolve(contexto.maxTokens))
          alEvento({ tipo: 'contexto', contexto: contextoDe(contexto, cache) })
        }
        const u = uso ? usoDe(uso) : null
        if (u) alEvento({ tipo: 'uso', uso: u })
      }

      // Mientras trabaja, el uso cada tanto: con un turno largo el medidor no queda en lo de antes (Defecto 16).
      let leyendoUso = false
      const usoEnMarcha = setInterval(() => {
        if (terminada || !turnoAbierto || leyendoUso) return
        leyendoUso = true
        void aTiempo(
          sesion.usage_EXPERIMENTAL_MAY_CHANGE_DO_NOT_RELY_ON_THIS_API_YET({ skipBehaviors: true }),
          ESPERA_DATOS_MS,
        )
          .then((r) => {
            const u = r && !terminada ? usoDe(r) : null
            if (u) alEvento({ tipo: 'uso', uso: u })
          })
          .catch(() => {})
          .finally(() => {
            leyendoUso = false
          })
      }, opciones.releerUsoMs ?? RELEER_USO_TURNO_MS)
      usoEnMarcha.unref?.()

      void (async () => {
        let anunciada = false
        try {
          for await (const m of sesion) {
            if (!anunciada && 'session_id' in m && typeof m.session_id === 'string' && m.session_id) {
              anunciada = true
              alEvento({ tipo: 'conversacion', id: m.session_id })
            }
            if (m.type === 'system' && m.subtype === 'background_tasks_changed') {
              // La lista entera cada vez (se reemplaza, no se suma): así un aviso perdido no deja nada colgado.
              fondo = new Map(m.tasks.filter((t) => !t.ambient).map((t) => [t.task_id, t.description]))
              alEvento({ tipo: 'fondo', tareas: [...fondo.values()] })
              // Terminó lo de fondo: si la IA no retoma en un rato, la sesión se cierra igual (no queda abierta sin trabajar).
              if (fondo.size === 0 && esperandoFondo)
                setTimeout(() => {
                  if (esperandoFondo && !turnoAbierto) terminarEntrada()
                }, ESPERA_RETOMA_MS).unref?.()
            } else if (m.type === 'system' && m.subtype === 'commands_changed') {
              // Descubrió skills mientras trabajaba: la lista entera, que reemplaza a la de antes (PA-1).
              alEvento({ tipo: 'comandos', comandos: comandosDe(m.commands) })
            } else if (m.type === 'system' && m.subtype === 'api_retry') {
              // Claude Code no llega a Claude y reintenta solo: sin esto, la sesión parece colgada (Defecto 10).
              reintento = reintentoDe(m)
              alEvento({ tipo: 'reintento', reintento })
            } else if (m.type === 'assistant' && m.parent_tool_use_id === null) {
              // Terminó lo de fondo y Claude Code se lo avisó a la IA: retoma sola, sin un mensaje del usuario.
              if (!turnoAbierto && esperandoFondo) {
                turnoAbierto = true
                esperandoFondo = false
                alEvento({ tipo: 'retoma' })
              }
              if (m.error) errorDeMensaje = m.error
              else reintento = null
              if (typeof m.message.model === 'string' && m.message.model !== '<synthetic>') {
                modelo = m.message.model
                cache.ultimoPedido = Date.now()
                cache.cacheMs = cacheDe(m.message.usage) ?? cache.cacheMs
              }
              for (const mensaje of mensajesDeIa(
                m.message.content,
                carpeta,
                Date.now(),
                terminoDeResponder(m.message),
              ))
                alEvento({ tipo: 'mensaje', mensaje })
            } else if (m.type === 'rate_limit_event') {
              const r = m.rate_limit_info
              if (r.status === 'rejected')
                rechazo = { libera: r.resetsAt ? (r.resetsAt < 1e12 ? r.resetsAt * 1000 : r.resetsAt) : null }
            } else if (m.type === 'result') {
              const sigue = (m.queued_turn_count ?? 0) > 0 || cola.length > 0
              const resultado = deteniendo
                ? 'detenida'
                : m.is_error || m.subtype !== 'success'
                  ? 'error'
                  : 'ok'
              const motivo = resultado === 'error' ? motivoDe(m) : null
              alEvento({
                tipo: 'turno',
                resultado,
                motivo,
                sigue,
                ...(resultado === 'error' ? { falla: fallaDelTurno(motivo) } : {}),
              })
              turnoAbierto = sigue
              deteniendo = false
              errorDeMensaje = null
              rechazo = null
              reintento = null
              if (sigue) continue
              await datosDelTurno()
              // Con algo de fondo, la sesión queda abierta: cuando termine, Claude Code se lo avisa a la IA y ella
              // retoma (T-65); cerrarla lo cortaría a la mitad.
              if (!turnoAbierto && fondo.size > 0) esperandoFondo = true
              // Sin nada en cola ni de fondo, la sesión se cierra: un Claude Code abierto sin trabajar ocupa memoria.
              // Si mientras se leían los datos llegó otro mensaje, ya arrancó otro turno y sigue abierta.
              else if (!turnoAbierto && cola.length === 0) terminarEntrada()
            }
          }
        } catch (e) {
          // Después de Detener, el SDK termina con un error (S-2): el turno ya se informó como detenida.
          if (turnoAbierto) {
            const motivo = deteniendo ? null : corto(e instanceof Error ? e.message : String(e), 300)
            alEvento({
              tipo: 'turno',
              resultado: deteniendo ? 'detenida' : 'error',
              motivo,
              sigue: false,
              ...(deteniendo ? {} : { falla: fallaDelTurno(motivo) }),
            })
          }
        } finally {
          clearInterval(usoEnMarcha)
          terminarEntrada()
          sesion.close()
          alEvento({ tipo: 'cerrada' })
        }
      })()

      return {
        enviar(texto, fotos = []) {
          if (terminada) return false
          cola.push({ texto, fotos })
          despertar?.()
          return true
        },
        ajustar(a) {
          if (terminada) return
          // Valen desde el próximo mensaje; null vuelve a lo de Claude Code.
          void sesion.setModel(a.modelo ?? undefined).catch(() => {})
          void sesion.applyFlagSettings({ effortLevel: a.esfuerzo }).catch(() => {})
        },
        ponerTono(t) {
          if (terminada) return
          void sesion.applyFlagSettings({ outputStyle: t }).catch(() => {})
        },
        async detener() {
          if (terminada) return
          // Solo espera algo de fondo: se corta y la sesión se cierra (ya no hay turno que detener).
          if (!turnoAbierto) {
            if (esperandoFondo) {
              terminarEntrada()
              sesion.close()
            }
            return
          }
          deteniendo = true
          cola.length = 0
          await sesion.interrupt().catch(() => {})
          terminarEntrada()
        },
        cerrar() {
          terminarEntrada()
          sesion.close()
        },
      }
    },

    async conversaciones(carpeta) {
      const lista = await listSessions({ dir: carpeta, includeWorktrees: false, limit: 50 })
      return lista
        .map((s) => ({
          id: s.sessionId,
          modificada: s.lastModified,
          titulo: (s.customTitle || s.summary || s.firstPrompt || '').trim() || null,
        }))
        .sort((a, b) => b.modificada - a.modificada)
    },

    async mensajes(carpeta, id) {
      const [historial, jsonl] = await Promise.all([
        getSessionMessages(id, { dir: carpeta }),
        leerJsonl(carpeta, id),
      ])
      return mensajesDeHistorial(historial, carpeta, salidasDeComandos(jsonl))
    },

    // Claude Code las guarda en `.claude\projects\<ruta con guiones>` (D-083).
    mudarConversaciones: (antes, despues) =>
      moverConversaciones(process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude'), antes, despues),
  }
}

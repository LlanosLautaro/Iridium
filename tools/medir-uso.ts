// Cuánto uso gasta la IA en este repo, antes y después de un cambio en la forma de trabajar (T-68, D-123).
// Lee los registros de Claude Code de este repo (%USERPROFILE%\.claude\projects\<carpeta>\*.jsonl) y guarda un
// resumen por conversación en docs/research/uso/sesiones.json: Claude Code borra los registros de más de 30 días y
// el resumen guardado no se pierde. Después compara dos períodos del mismo largo, con el avance del repo (git).
// Uso: node --experimental-strip-types tools/medir-uso.ts [--desde <fecha>] [--dias <n>] [--registros <carpeta>]
//   --desde: el corte (por omisión, el commit de D-123); --dias: el largo de cada período (por omisión, lo que
//   va desde el corte, hasta 14); --registros: otra carpeta de registros de Claude Code.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const raiz = resolve(import.meta.dirname, '..')
const CORTE_D123 = '2026-11-15T13:22:45-03:00'
// Pesos de la API, en tokens de entrada equivalentes: que el límite de la suscripción pese igual es una suposición.
const PESO = { entrada: 1, escribir5m: 1.25, escribir1h: 2, leer: 0.1, salida: 5 }
const PASOS_ARRANQUE = 10

const argumento = (nombre: string): string | undefined => {
  const i = process.argv.indexOf(nombre)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const registros =
  argumento('--registros') ?? join(homedir(), '.claude', 'projects', raiz.replace(/[^a-zA-Z0-9]/g, '-'))
const corte = new Date(argumento('--desde') ?? CORTE_D123)
const archivoResumen = join(raiz, 'docs', 'research', 'uso', 'sesiones.json')

type Uso = {
  input_tokens?: number
  output_tokens?: number
  cache_read_input_tokens?: number
  cache_creation_input_tokens?: number
  cache_creation?: { ephemeral_5m_input_tokens?: number; ephemeral_1h_input_tokens?: number }
}
type Paso = { hora: string; uso: Uso }
type Sesion = {
  inicio: string
  fin: string
  pasos: number
  entrada: number
  escribir5m: number
  escribir1h: number
  leer: number
  salida: number
  costo: number
  costoSubagentes: number
  contextoFinal: number
  contextoMax: number
  costoArranque: number
}

const costoDe = (u: Uso): number => {
  const e1h = u.cache_creation?.ephemeral_1h_input_tokens ?? 0
  const e5m = u.cache_creation?.ephemeral_5m_input_tokens ?? (u.cache_creation_input_tokens ?? 0) - e1h
  return (
    PESO.entrada * (u.input_tokens ?? 0) +
    PESO.escribir5m * e5m +
    PESO.escribir1h * e1h +
    PESO.leer * (u.cache_read_input_tokens ?? 0) +
    PESO.salida * (u.output_tokens ?? 0)
  )
}
const contextoDe = (u: Uso): number =>
  (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0)

// Cada respuesta del modelo una vez: el mismo message.id se repite mientras se escribe.
function leerPasos(archivo: string): Paso[] {
  const porId = new Map<string, Paso>()
  for (const linea of readFileSync(archivo, 'utf8').split('\n')) {
    if (!linea) continue
    let j: {
      type?: string
      timestamp?: string
      message?: { id?: string; model?: string; usage?: Uso }
    }
    try {
      j = JSON.parse(linea)
    } catch {
      continue
    }
    const m = j.message
    if (j.type !== 'assistant' || !m?.usage || !m.id || m.model === '<synthetic>' || !j.timestamp) continue
    porId.set(m.id, { hora: j.timestamp, uso: m.usage })
  }
  return [...porId.values()].sort((a, b) => (a.hora < b.hora ? -1 : 1))
}

function resumir(archivo: string, subagentes: string[]): Sesion | null {
  const pasos = leerPasos(archivo)
  const primero = pasos[0]
  const ultimo = pasos[pasos.length - 1]
  if (!primero || !ultimo) return null
  const s: Sesion = {
    inicio: primero.hora,
    fin: ultimo.hora,
    pasos: pasos.length,
    entrada: 0,
    escribir5m: 0,
    escribir1h: 0,
    leer: 0,
    salida: 0,
    costo: 0,
    costoSubagentes: 0,
    contextoFinal: contextoDe(ultimo.uso),
    contextoMax: 0,
    costoArranque: 0,
  }
  pasos.forEach((p, i) => {
    const u = p.uso
    const e1h = u.cache_creation?.ephemeral_1h_input_tokens ?? 0
    s.entrada += u.input_tokens ?? 0
    s.escribir1h += e1h
    s.escribir5m += u.cache_creation?.ephemeral_5m_input_tokens ?? (u.cache_creation_input_tokens ?? 0) - e1h
    s.leer += u.cache_read_input_tokens ?? 0
    s.salida += u.output_tokens ?? 0
    s.costo += costoDe(u)
    s.contextoMax = Math.max(s.contextoMax, contextoDe(u))
    if (i < PASOS_ARRANQUE) s.costoArranque += costoDe(u)
  })
  for (const sub of subagentes) for (const p of leerPasos(sub)) s.costoSubagentes += costoDe(p.uso)
  s.costo = Math.round(s.costo)
  s.costoSubagentes = Math.round(s.costoSubagentes)
  s.costoArranque = Math.round(s.costoArranque)
  return s
}

// El resumen guardado, puesto al día con los registros que quedan.
const guardado: Record<string, Sesion> = existsSync(archivoResumen)
  ? JSON.parse(readFileSync(archivoResumen, 'utf8'))
  : {}
let nuevas = 0
if (existsSync(registros)) {
  for (const nombre of readdirSync(registros)) {
    if (!nombre.endsWith('.jsonl')) continue
    const id = nombre.slice(0, -'.jsonl'.length)
    const carpetaSub = join(registros, id, 'subagents')
    const subs = existsSync(carpetaSub)
      ? readdirSync(carpetaSub)
          .filter((f) => f.endsWith('.jsonl'))
          .map((f) => join(carpetaSub, f))
      : []
    const s = resumir(join(registros, nombre), subs)
    if (!s) continue
    if (!guardado[id]) nuevas++
    guardado[id] = s
  }
} else {
  console.log(`No están los registros de Claude Code (${registros}): se usa solo el resumen guardado.`)
}
mkdirSync(join(raiz, 'docs', 'research', 'uso'), { recursive: true })
const ordenado = Object.fromEntries(
  Object.entries(guardado).sort((a, b) => (a[1].inicio < b[1].inicio ? -1 : 1)),
)
writeFileSync(archivoResumen, `${JSON.stringify(ordenado, null, 1)}\n`)

// Los dos períodos: el mismo largo antes y después del corte.
const DIA = 86_400_000
const ahora = new Date()
const diasDespues = Math.max(1, Math.round((ahora.getTime() - corte.getTime()) / DIA))
const dias = Number(argumento('--dias') ?? Math.min(14, diasDespues))
const periodos = [
  { nombre: 'Antes', desde: new Date(corte.getTime() - dias * DIA), hasta: corte },
  {
    nombre: 'Después',
    desde: corte,
    hasta: new Date(Math.min(ahora.getTime(), corte.getTime() + dias * DIA)),
  },
]

// El avance del repo en el período: commits y líneas cambiadas, el código aparte de la documentación.
function avance(desde: Date, hasta: Date): { commits: number; codigo: number; docs: number } {
  const salida = execFileSync(
    'git',
    [
      'log',
      `--since=${desde.toISOString()}`,
      `--until=${hasta.toISOString()}`,
      '--numstat',
      '--format=tformat:@',
    ],
    { cwd: raiz, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  )
  let commits = 0
  let codigo = 0
  let docs = 0
  for (const linea of salida.split('\n')) {
    if (linea === '@') {
      commits++
      continue
    }
    const [mas, menos, ruta] = linea.split('\t')
    if (!ruta || mas === '-') continue
    const n = Number(mas) + Number(menos)
    if (/^(src|tests|tools|extension|recursos)\//.test(ruta)) codigo += n
    else if (ruta.startsWith('docs/') && !ruta.startsWith('docs/research/uso/')) docs += n
  }
  return { commits, codigo, docs }
}

const mediana = (v: number[]): number => {
  if (v.length === 0) return 0
  const o = [...v].sort((a, b) => a - b)
  return o[Math.floor(o.length / 2)] ?? 0
}
const mil = (n: number): string => `${Math.round(n / 1000).toLocaleString('es-AR')} mil`
const millones = (n: number): string => `${(n / 1e6).toLocaleString('es-AR', { maximumFractionDigits: 1 })} M`

const filas: [string, ...string[]][] = [
  ['Período'],
  ['Días con uso'],
  ['Conversaciones'],
  ['Pasos del modelo'],
  ['Uso total (equivalentes)'],
  ['Uso por día con uso'],
  ['Uso por paso'],
  ['Uso por conversación'],
  ['Releer, del total'],
  ['Arranque (10 primeros pasos), mediana'],
  ['Contexto al terminar, mediana'],
  ['Conversaciones que pasaron 200 mil'],
  ['Subagentes, del total'],
  ['Commits'],
  ['Líneas de código cambiadas'],
  ['Líneas de docs cambiadas'],
  ['Uso por commit'],
  ['Uso por 100 líneas de código'],
]
for (const p of periodos) {
  const ss = Object.values(guardado).filter(
    (s) => new Date(s.inicio) >= p.desde && new Date(s.inicio) < p.hasta,
  )
  const total = ss.reduce((a, s) => a + s.costo + s.costoSubagentes, 0)
  const pasos = ss.reduce((a, s) => a + s.pasos, 0)
  const dias = new Set(ss.map((s) => s.inicio.slice(0, 10))).size
  const leer = ss.reduce((a, s) => a + PESO.leer * s.leer, 0)
  const sub = ss.reduce((a, s) => a + s.costoSubagentes, 0)
  const g = avance(p.desde, p.hasta)
  const div = (a: number, b: number, f: (n: number) => string): string => (b > 0 ? f(a / b) : '—')
  const pct = (a: number): string => (total > 0 ? `${Math.round((100 * a) / total)} %` : '—')
  const valores = [
    `${p.nombre} (${p.desde.toISOString().slice(0, 10)} a ${p.hasta.toISOString().slice(0, 10)})`,
    String(dias),
    String(ss.length),
    String(pasos),
    millones(total),
    div(total, dias, millones),
    div(total, pasos, mil),
    div(total, ss.length, millones),
    pct(leer),
    mil(mediana(ss.map((s) => s.costoArranque))),
    mil(mediana(ss.map((s) => s.contextoFinal))),
    String(ss.filter((s) => s.contextoMax > 200_000).length),
    pct(sub),
    String(g.commits),
    String(g.codigo),
    String(g.docs),
    div(total, g.commits, millones),
    div(total * 100, g.codigo, mil),
  ]
  valores.forEach((v, i) => {
    filas[i]?.push(v)
  })
}

console.log(
  `Resumen guardado: ${Object.keys(guardado).length} conversaciones (${nuevas} nuevas) en docs/research/uso/sesiones.json.`,
)
console.log(`Corte: ${corte.toISOString()} · ${dias} días de cada lado.\n`)
const ancho = Math.max(...filas.map((f) => f[0].length))
const anchoCol = Math.max(...filas.map((f) => f[1]?.length ?? 0))
for (const f of filas) console.log(`${f[0].padEnd(ancho)}  ${(f[1] ?? '').padEnd(anchoCol)}  ${f[2] ?? ''}`)
if (diasDespues < 7)
  console.log('\nTodavía es poco: conviene comparar con al menos una semana después del corte.')

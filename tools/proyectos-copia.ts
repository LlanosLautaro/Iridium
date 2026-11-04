// Elige, en una copia de la carpeta de proyectos, los que usan `recorrido.ts` y `medir.ts` por lo que tienen y no por
// su nombre (D-082): las herramientas no saben qué proyectos tiene quien las corre.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

interface Candidato {
  nombre: string
  /** Las Q-n abiertas de su `docs/estado.md`, con cuántas casillas trae cada una. */
  preguntas: { q: string; casillas: number }[]
  conSeccion: boolean
}

function leer(raiz: string, nombre: string): Candidato | null {
  const ruta = join(raiz, nombre, 'docs', 'estado.md')
  if (!existsSync(ruta)) return null
  const texto = readFileSync(ruta, 'utf8')
  const seccion = /## Preguntas abiertas\r?\n([\s\S]*?)(?=\r?\n## |$)/.exec(texto)?.[1] ?? ''
  const preguntas = seccion
    .split(/^- \*\*(?=Q-\d+ —)/m)
    .slice(1)
    .map((bloque) => ({
      q: /^Q-\d+/.exec(bloque)?.[0] ?? '',
      casillas: (bloque.match(/^\s+- \[ \]/gm) ?? []).length,
    }))
  return { nombre, preguntas, conSeccion: /## Preguntas abiertas/.test(texto) }
}

export interface ProyectosDeLaCopia {
  /** El código de Iridium, si está en la copia (su `package.json` se llama `iridium`); si no, el primero con docs. */
  iridium: string
  /** Uno sin preguntas abiertas: se le agrega una de muestra. */
  sinPreguntas: string
  /** Otro para trabajar con la IA (el motor falso), distinto de los demás si alcanza. */
  trabajo: string
  /** Uno con una prueba abierta de al menos tres casillas, y esa prueba. */
  conPrueba: { nombre: string; q: string }
  /** Todos los que tienen `docs/estado.md`. */
  todos: string[]
}

export function elegirProyectos(raiz: string): ProyectosDeLaCopia {
  const carpetas = readdirSync(raiz, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort()
  const con = carpetas.map((n) => leer(raiz, n)).filter((c): c is Candidato => c !== null)
  if (con.length < 3) throw new Error('La copia necesita al menos tres proyectos con docs/estado.md.')
  const esIridium = (n: string) => {
    try {
      return JSON.parse(readFileSync(join(raiz, n, 'package.json'), 'utf8')).name === 'iridium'
    } catch {
      return false
    }
  }
  const iridium = con.find((c) => esIridium(c.nombre))?.nombre ?? con[0]?.nombre ?? ''
  const prueba = con
    .filter((c) => c.nombre !== iridium)
    .flatMap((c) => c.preguntas.filter((p) => p.casillas >= 3).map((p) => ({ nombre: c.nombre, q: p.q })))[0]
  if (!prueba) throw new Error('La copia necesita un proyecto con una prueba abierta de tres casillas o más.')
  const usados = new Set([iridium, prueba.nombre])
  const libre = (f: (c: Candidato) => boolean) =>
    con.find((c) => !usados.has(c.nombre) && c.conSeccion && f(c))?.nombre ??
    con.find((c) => !usados.has(c.nombre))?.nombre
  const sinPreguntas = libre((c) => c.preguntas.length === 0) ?? prueba.nombre
  usados.add(sinPreguntas)
  const trabajo = libre(() => true) ?? sinPreguntas
  return { iridium, sinPreguntas, trabajo, conPrueba: prueba, todos: con.map((c) => c.nombre) }
}

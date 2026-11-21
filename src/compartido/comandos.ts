// Los comandos con «/» del chat (frente Paridad, PA-1 y PA-6; D-167 a D-169): qué sabe hacer el motor, la lista que
// da, el filtro de la lista, los escondidos y su línea, y cómo sale un mensaje que empieza con un comando. Las reglas
// son de Iridium, iguales con cualquier motor; la lista y qué esconder los dice la frontera (`main/motor/`).

/** Qué control de Iridium pisa un comando escondido (D-167): por eso no se ofrece ni se manda. */
export type Pisa = 'modelo' | 'esfuerzo' | 'tono' | 'conversacion' | 'contexto' | 'uso' | 'terminal'

/** Un comando del motor, en palabras de Iridium (`diseno-tecnico.md` › Datos). */
export interface ComandoMotor {
  /** Sin la barra: `compact`, `engineering:code-review`. */
  nombre: string
  /** Los otros nombres que llevan al mismo (`cost` y `stats` son `usage`). */
  otrosNombres: string[]
  /** Lo que se le escribe después (`<archivo>`, `[low|medium|high]`); null si nada. */
  argumentos: string | null
  /** Para qué sirve, en el idioma en que lo da el motor. */
  descripcion: string
  /** Del motor mismo, de una skill propia o de un complemento. */
  origen: 'motor' | 'skill' | 'complemento'
  /** El complemento del que sale (`engineering`); null si no es de uno. */
  complemento: string | null
  /** Qué pisa, si se esconde; null = se ofrece. */
  escondido: Pisa | null
}

/** Lo que sabe hacer el motor, sin gastar (D-169 › 1): Iridium ofrece solo eso (PA-6). */
export interface CapacidadesMotor {
  /** Si tiene comandos con «/». */
  comandos: boolean
  /** Las fotos que recibe dentro del mensaje (PA-I2); null si ninguna. */
  fotos: { medios: string[]; maxBytes: number; maxLado: number } | null
  /** Los comandos escondidos, por nombre y por otro nombre: frenan lo escrito a mano aunque no haya lista. */
  escondidos: Record<string, Pisa>
}

/** La lista de «/» de una carpeta, con los usados hace poco; `comandos` null si no se pudo leer. */
export interface ListaComandos {
  comandos: ComandoMotor[] | null
  recientes: string[]
}

/** Cuántos usados hace poco se guardan y se ofrecen primero. */
export const RECIENTES = 5

/** El comando con que empieza un mensaje y lo que le sigue; null si no empieza con «/nombre». */
export function comandoDe(texto: string): { nombre: string; resto: string } | null {
  // Una ruta escrita al principio (`/carpeta/archivo`) no es un comando.
  const m = /^\/([^\s/]+)(?:\s+([\s\S]*))?$/.exec(texto.trimStart())
  return m?.[1] ? { nombre: m[1], resto: (m[2] ?? '').trim() } : null
}

/** Dónde termina la primera palabra del texto (el comando, si empieza con «/»). */
function finDelComando(texto: string): number {
  const fin = texto.search(/\s/)
  return fin === -1 ? texto.length : fin
}

/**
 * Lo que se busca mientras se escribe el comando: lo que va después de la «/» del principio hasta el primer espacio,
 * mientras el cursor está ahí. La lista se cierra con un espacio (el cursor sale del comando) o al borrar la «/» (PA-1);
 * null = la lista no va.
 */
export function consultaDe(texto: string, cursor = texto.length): string | null {
  if (!texto.startsWith('/')) return null
  const fin = finDelComando(texto)
  if (cursor < 1 || cursor > fin) return null
  const consulta = texto.slice(1, fin)
  return consulta.includes('/') ? null : consulta
}

/** El texto con el comando elegido al principio y un espacio, para escribirle lo que pide; el cursor va ahí (PA-1). */
export function conComando(texto: string, nombre: string): { texto: string; cursor: number } {
  const resto = texto.startsWith('/') ? texto.slice(finDelComando(texto)).trimStart() : texto.trimStart()
  const comando = `/${nombre} `
  return { texto: comando + resto, cursor: comando.length }
}

/** Si el mensaje empieza con un comando escondido (por su nombre u otro nombre): cuál y qué pisa. */
export function escondidoDe(
  texto: string,
  escondidos: Readonly<Record<string, Pisa>>,
): { nombre: string; pisa: Pisa } | null {
  const c = comandoDe(texto)
  if (!c) return null
  const pisa = escondidos[c.nombre.toLowerCase()]
  return pisa ? { nombre: c.nombre, pisa } : null
}

/** Los grupos de la lista de «/»: sin nada escrito, los usados hace poco primero. */
export interface GrupoComandos {
  titulo: string | null
  comandos: ComandoMotor[]
}

/**
 * Filtra la lista de «/» (PA-1): sin los escondidos; primero los que empiezan con lo escrito (por el nombre o por otro
 * nombre, también después de los dos puntos de un complemento: `/review` encuentra `/code-review` por su otro nombre o
 * `/engineering:code-review`), después los que lo tienen en el medio. Sin nada escrito, todos por orden alfabético,
 * con los usados hace poco arriba.
 */
export function filtrarComandos(
  lista: readonly ComandoMotor[],
  consulta: string,
  recientes: readonly string[] = [],
): GrupoComandos[] {
  const ofrecidos = lista
    .filter((c) => c.escondido === null)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  const q = consulta.toLowerCase()
  if (q === '') {
    const usados = recientes
      .map((n) => ofrecidos.find((c) => c.nombre === n))
      .filter((c): c is ComandoMotor => c !== undefined)
    if (usados.length === 0) return [{ titulo: null, comandos: ofrecidos }]
    return [
      { titulo: 'Usados hace poco', comandos: usados },
      { titulo: 'Todos', comandos: ofrecidos.filter((c) => !usados.includes(c)) },
    ]
  }
  const nombres = (c: ComandoMotor) =>
    [c.nombre, ...c.otrosNombres].flatMap((n) => {
      const sinComplemento = n.includes(':') ? n.slice(n.indexOf(':') + 1) : null
      return sinComplemento ? [n.toLowerCase(), sinComplemento.toLowerCase()] : [n.toLowerCase()]
    })
  const empiezan = ofrecidos.filter((c) => nombres(c).some((n) => n.startsWith(q)))
  const contienen = ofrecidos.filter((c) => !empiezan.includes(c) && nombres(c).some((n) => n.includes(q)))
  return [{ titulo: null, comandos: [...empiezan, ...contienen] }]
}

/** La línea de un comando escondido escrito a mano (Q-246, D-168): dónde está eso en Iridium y su botón, si hay. */
export function lineaDeEscondido(pisa: Pisa): { texto: string; boton: 'nueva' | null } {
  switch (pisa) {
    case 'conversacion':
      return { texto: 'en Iridium, otra conversación se empieza con', boton: 'nueva' }
    case 'modelo':
      return { texto: 'en Iridium, el modelo se elige abajo', boton: null }
    case 'esfuerzo':
      return { texto: 'en Iridium, el esfuerzo se elige abajo, al lado del modelo', boton: null }
    case 'tono':
      return { texto: 'en Iridium, el tono de la IA está en Ajustes', boton: null }
    case 'contexto':
      return { texto: 'el contexto está abajo, al lado del modelo', boton: null }
    case 'uso':
      return { texto: 'el uso está en la barra de abajo', boton: null }
    case 'terminal':
      return { texto: 'solo sirve en la terminal', boton: null }
  }
}

/**
 * El mensaje que sale (D-169 › 7): con un comando, el comando va primero y lo citado y «Sobre la skill…» después,
 * como lo que se le escribe; sin comando, `armar` (las citas al principio, como siempre).
 */
export function comandoPrimero(texto: string, despues: string, armar: () => string): string {
  if (!comandoDe(texto)) return armar()
  return despues.trim() ? `${texto.trim()}\n\n${despues.trim()}` : texto.trim()
}

/** Los usados hace poco con uno más: va primero y no se repite. */
export function sumarReciente(recientes: readonly string[], nombre: string): string[] {
  return [nombre, ...recientes.filter((n) => n !== nombre)].slice(0, RECIENTES)
}

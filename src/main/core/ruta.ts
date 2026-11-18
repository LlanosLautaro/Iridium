// La ruta de un frente (Mapa, D-139, D-145; `modulos/mapa/diseno-tecnico.md`): la sección `## Ruta` del `estado.md`
// de un frente, una lista de casillas en orden con sus ramas. Los códigos de cada línea no se muestran: dicen qué
// pregunta espera, qué trabajo es y a qué iteración lleva. Sin disco.
import { lineasFueraDeCodigo, partirLineas, textoPlano } from './visor/lineas'

export type MarcaRuta = 'hecho' | 'viene' | 'descartado' | 'otro'

export interface PasoRuta {
  /** Lo que se muestra: sin los códigos. */
  texto: string
  marca: MarcaRuta
  /** Las `Q-n`, los `T-n` y la iteración (`MA-I1`) que nombra la línea. */
  preguntas: string[]
  trabajo: string[]
  iteracion: string | null
  /** Desde 1, en el `estado.md`. */
  linea: number
  ramas: PasoRuta[]
}

export interface ProblemaRuta {
  linea: number
  texto: string
}

export interface RutaLeida {
  pasos: PasoRuta[]
  problemas: ProblemaRuta[]
}

const CODIGO = /\b(?:Q-\d+|T-\d+|D-\d+|R-\d+|[A-Z]{1,3}-I\d+|I-\d+)\b/g

/** El texto que se muestra de un paso: sin los códigos y, si quedan solos en un paréntesis final, sin el paréntesis. */
export function textoSinCodigos(texto: string): string {
  const plano = textoPlano(texto)
  const sinParentesis = plano.replace(/\s*\(([^()]*)\)\s*$/, (todo, dentro: string) =>
    dentro.replace(CODIGO, '').replace(/[\s,;·y]+/g, '') === '' ? '' : todo,
  )
  return sinParentesis
    .replace(CODIGO, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\(\s*[,;·]\s*/g, '(')
    .replace(/\s*[,;·]\s*\)/g, ')')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:)])(?!\w)/g, '$1')
    .trim()
}

function paso(linea: number, marca: MarcaRuta, crudo: string): PasoRuta {
  const codigos = textoPlano(crudo).match(CODIGO) ?? []
  return {
    texto: textoSinCodigos(crudo) || textoPlano(crudo).trim(),
    marca,
    preguntas: codigos.filter((c) => c.startsWith('Q-')),
    trabajo: codigos.filter((c) => c.startsWith('T-')),
    iteracion: codigos.find((c) => /^(?:[A-Z]{1,3}-I\d+|I-\d+)$/.test(c)) ?? null,
    linea,
    ramas: [],
  }
}

/** La sección `## Ruta` de un `estado.md`, o null si no la tiene. Lo que no se entiende va como paso `otro`. */
export function leerRuta(estado: string): RutaLeida | null {
  const lineas = partirLineas(estado)
  const fuera = lineasFueraDeCodigo(lineas)
  const inicio = fuera.find((l) => /^ {0,3}##\s+Ruta\s*$/i.test(l.texto))
  if (!inicio) return null
  const fin = fuera.find((l) => l.n > inicio.n && /^ {0,3}#{1,2}\s/.test(l.texto))?.n ?? lineas.length
  const pasos: PasoRuta[] = []
  const problemas: ProblemaRuta[] = []
  const deTexto = new Set(fuera.map((l) => l.n))
  let comentario = false
  for (let n = inicio.n + 1; n < fin; n++) {
    const l = lineas[n] ?? ''
    // Un bloque de código no es parte del camino: se salta entero, con un aviso al abrirlo.
    if (!deTexto.has(n)) {
      if (deTexto.has(n - 1))
        problemas.push({ linea: n + 1, texto: 'la ruta no lleva bloques de código: un paso por línea' })
      continue
    }
    if (comentario || /^\s*<!--/.test(l)) {
      comentario = !/-->/.test(l)
      continue
    }
    if (l.trim() === '') continue
    const m = /^(\s*)[-*]\s+\[(.?)\]\s+(.+)$/.exec(l)
    // Dos espacios o una tabulación: la IA a veces escribe la sangría con tabulación.
    const sangria = m?.[1] ?? /^\s*/.exec(l)?.[0] ?? ''
    const rama = sangria.length >= 2 || sangria.includes('\t')
    let marca: MarcaRuta = 'otro'
    if (!m) problemas.push({ linea: n + 1, texto: 'cada línea de «Ruta» es una casilla: `- [ ] Paso`' })
    else if (m[2] === 'x' || m[2] === 'X') marca = 'hecho'
    else if (m[2] === ' ') marca = 'viene'
    else if (m[2] === '-') marca = 'descartado'
    else
      problemas.push({
        linea: n + 1,
        texto: `«[${m[2]}]» no es una marca de la ruta: \`[x]\`, \`[ ]\` o \`[-]\``,
      })
    const p = paso(n + 1, marca, m?.[3] ?? l.replace(/^\s*[-*]?\s*/, ''))
    const padre = pasos.at(-1)
    if (rama && padre) padre.ramas.push(p)
    else {
      if (rama)
        problemas.push({ linea: n + 1, texto: 'una rama va con sangría debajo del paso del que sale' })
      pasos.push(p)
    }
  }
  return { pasos, problemas }
}

/** Todos los códigos de trabajo (`T-n`) que nombra una ruta, con sus ramas. */
export function trabajoDeRuta(ruta: RutaLeida | null): Set<string> {
  const r = new Set<string>()
  const juntar = (ps: PasoRuta[]) => {
    for (const p of ps) {
      for (const t of p.trabajo) r.add(t)
      juntar(p.ramas)
    }
  }
  if (ruta) juntar(ruta.pasos)
  return r
}

// Las listas del Mapa que salen de `trabajo.md` al leer (D-143, D-145): «Aprobado, sin lugar en la ruta» de cada
// frente y «Por empezar». Cuenta el trabajo abierto (`pendiente` o `en curso`); lo `nueva` sigue solo en Ideas.

export interface TrabajoDelMapa {
  codigo: string
  titulo: string
}

/** Un frente con carpeta: los nombres con que lo nombra `Frente:`, su ruta y el trabajo que lo originó. */
export interface FrenteConRuta {
  nombres: string[]
  ruta: RutaLeida | null
  origen: string[]
}

/** Una fila de la tabla «Módulos» que espera sin carpeta, con el trabajo que es el frente mismo (`Capacidades (T-28)`). */
export interface FrenteQueEspera {
  nombre: string
  trabajo: string[]
}

export interface ListasDelMapa {
  /** Una por frente con carpeta, en el mismo orden. */
  sinLugar: TrabajoDelMapa[][]
  porEmpezar: {
    frentes: { nombre: string; pasos: TrabajoDelMapa[] }[]
    sinFrente: (TrabajoDelMapa & { enCurso: boolean })[]
  }
}

const mismo = (a: string, b: string) => a.localeCompare(b, 'es', { sensitivity: 'base' }) === 0

export function listasDelMapa(
  conCarpeta: readonly FrenteConRuta[],
  esperan: readonly FrenteQueEspera[],
  trabajo: readonly ItemDelMapa[],
): ListasDelMapa {
  const abiertos = trabajo.filter((i) => i.estado === 'pendiente' || i.estado === 'en curso')
  const enRutas = new Set(conCarpeta.flatMap((f) => [...trabajoDeRuta(f.ruta)]))
  const sonFrentes = new Set([...conCarpeta.flatMap((f) => f.origen), ...esperan.flatMap((f) => f.trabajo)])
  const corto = (i: ItemDelMapa) => ({ codigo: i.codigo, titulo: i.titulo })
  const de = (i: ItemDelMapa, nombres: readonly string[]) =>
    i.frente !== null && nombres.some((n) => mismo(n, i.frente ?? ''))
  const sinLugar = conCarpeta.map((f) => {
    const nombrados = trabajoDeRuta(f.ruta)
    return abiertos
      .filter((i) => de(i, f.nombres) && !nombrados.has(i.codigo) && !f.origen.includes(i.codigo))
      .map(corto)
  })
  const frentes = esperan.map((f) => ({
    nombre: f.nombre,
    pasos: abiertos.filter((i) => de(i, [f.nombre]) && !f.trabajo.includes(i.codigo)).map(corto),
  }))
  const conocido = (i: ItemDelMapa) =>
    conCarpeta.some((f) => de(i, f.nombres)) || esperan.some((f) => de(i, [f.nombre]))
  const sinFrente = abiertos
    .filter((i) => !conocido(i) && !enRutas.has(i.codigo) && !sonFrentes.has(i.codigo))
    .map((i) => ({ ...corto(i), enCurso: i.estado === 'en curso' }))
    .sort((a, b) => Number(b.enCurso) - Number(a.enCurso))
  return { sinLugar, porEmpezar: { frentes, sinFrente } }
}

/** Lo que las listas usan de un ítem de `trabajo.md`. */
export interface ItemDelMapa {
  codigo: string
  titulo: string
  estado: string | null
  frente: string | null
}

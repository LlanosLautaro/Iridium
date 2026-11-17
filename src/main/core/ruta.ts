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
    .replace(/\s+([,.;:)])/g, '$1')
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
  let comentario = false
  for (let n = inicio.n + 1; n < fin; n++) {
    const l = lineas[n] ?? ''
    if (comentario || /^\s*<!--/.test(l)) {
      comentario = !/-->/.test(l)
      continue
    }
    if (l.trim() === '') continue
    const m = /^(\s*)[-*]\s+\[(.?)\]\s+(.+)$/.exec(l)
    const rama = (m?.[1] ?? /^\s*/.exec(l)?.[0] ?? '').length >= 2
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

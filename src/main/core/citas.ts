// Lo que cita una `Q-n` (D-022, 05-arquitectura.md › Pendientes con su contexto): los códigos que nacen en el
// proyecto y las citas `archivo.md` › Sección, para mostrar su texto dentro del pendiente. Reglas puras: usan el
// índice de códigos del visor y las mismas reglas que convierten las citas en enlaces.
import { CITA, type Encabezado, type Indice, normalizarCodigo, resolverCodigo } from './visor/codigos'
import { documentoCitado, seccionCitada } from './visor/markdown'

export type Cita =
  /** Una sección (de un título, de una fila de tabla o de otra pregunta) que se puede mostrar. */
  | { tipo: 'seccion'; etiqueta: string; ruta: string; ancla: string }
  /** Un documento entero, citado sin sección. */
  | { tipo: 'documento'; etiqueta: string; ruta: string }
  /** Una cita a un documento o a una sección que no existe. */
  | { tipo: 'falta'; etiqueta: string }

export interface EntornoCitas {
  indice: Indice
  existe: (ruta: string) => boolean
  /** Documento donde está la pregunta (las rutas citadas se resuelven desde ahí). */
  desde: string
  /** El código de la propia pregunta: no se cita a sí misma. */
  propio: string
}

const CITA_DOCUMENTO = /`([^`\s]+\.md)`(\s*›\s*)?/gi

/** Sin la ruta `docs/` delante, como se citan en los documentos. */
function sinDocs(ruta: string): string {
  return ruta.startsWith('docs/') ? ruta.slice('docs/'.length) : ruta
}

/** Lo que queda de una cita que no se encontró, hasta el primer signo que la corta. */
function textoCitado(resto: string): string {
  return (/^[^.,;:()\n]+/.exec(resto)?.[0] ?? '').trim()
}

/** Un subtítulo dentro de la sección de `padre` cuyo texto empieza `resto` (`› I-2 — … › Prueba del usuario`). */
function subseccion(
  resto: string,
  padre: Encabezado,
  encabezados: readonly Encabezado[],
): { encabezado: Encabezado; texto: string } | null {
  const fin = encabezados.find((e) => e.n > padre.n && e.nivel <= padre.nivel)?.n ?? Number.POSITIVE_INFINITY
  const dentro = encabezados.filter((e) => e.n > padre.n && e.n < fin)
  const elegida = seccionCitada(resto, dentro)
  const encabezado = elegida ? dentro.find((e) => e.ancla === elegida.ancla) : undefined
  return elegida && encabezado ? { encabezado, texto: elegida.texto } : null
}

/** Las citas del contexto de una pregunta, en el orden en que aparecen y sin repetir. */
export function citasDe(contexto: string, env: EntornoCitas): Cita[] {
  const citas: { pos: number; cita: Cita }[] = []
  const vistas = new Set<string>()
  const anotar = (pos: number, cita: Cita, clave: string) => {
    if (vistas.has(clave)) return
    vistas.add(clave)
    citas.push({ pos, cita })
  }
  // Lo que ya es parte de una cita a un documento no se vuelve a leer como código (`› I-2 — …`).
  let sinDocumentos = contexto

  for (const m of contexto.matchAll(CITA_DOCUMENTO)) {
    const citado = m[1] ?? ''
    const pos = m.index ?? 0
    let largo = m[0].length
    const ruta = documentoCitado(citado, { ruta: env.desde, existe: env.existe })
    const resto = contexto.slice(pos + m[0].length)
    if (!m[2]) {
      if (ruta) anotar(pos, { tipo: 'documento', etiqueta: sinDocs(ruta), ruta }, ruta)
      else anotar(pos, { tipo: 'falta', etiqueta: citado }, citado)
    } else if (!ruta) {
      const etiqueta = `${citado} › ${textoCitado(resto)}`
      anotar(pos, { tipo: 'falta', etiqueta }, etiqueta)
    } else {
      const encabezados = env.indice.encabezados.get(ruta) ?? []
      const primera = seccionCitada(resto, encabezados)
      let encabezado = primera ? encabezados.find((e) => e.ancla === primera.ancla) : undefined
      if (!primera || !encabezado) {
        const etiqueta = `${sinDocs(ruta)} › ${textoCitado(resto)}`
        anotar(pos, { tipo: 'falta', etiqueta }, etiqueta)
      } else {
        const partes = [primera.texto]
        let consumido = primera.texto.length
        for (;;) {
          const flecha = /^\s*›\s*/.exec(resto.slice(consumido))
          if (!flecha) break
          const sub = subseccion(resto.slice(consumido + flecha[0].length), encabezado, encabezados)
          if (!sub) break
          encabezado = sub.encabezado
          partes.push(sub.texto)
          consumido += flecha[0].length + sub.texto.length
        }
        largo += consumido
        anotar(
          pos,
          {
            tipo: 'seccion',
            etiqueta: [sinDocs(ruta), ...partes].join(' › '),
            ruta,
            ancla: encabezado.ancla,
          },
          `${ruta}#${encabezado.ancla}`,
        )
      }
    }
    sinDocumentos = sinDocumentos.slice(0, pos) + ' '.repeat(largo) + sinDocumentos.slice(pos + largo)
  }

  for (const m of sinDocumentos.matchAll(CITA)) {
    if (!m[1] || !m[2] || m.index === undefined) continue
    const codigo = normalizarCodigo(m[1], m[2])
    if (codigo === env.propio) continue
    const e = resolverCodigo(env.indice, codigo, env.desde)
    if (!e) continue
    anotar(m.index, { tipo: 'seccion', etiqueta: m[0], ruta: e.ruta, ancla: e.ancla }, `${e.ruta}#${e.ancla}`)
  }

  return citas.sort((a, b) => a.pos - b.pos).map((c) => c.cita)
}

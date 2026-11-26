// Las citas del campo de la conversación (Q-182): lo que otra sección deja arriba del cuadro de escribir, como una
// etiqueta con ✕, sin enviarlo. Al enviar, cada cita va al principio del mensaje, como cita, y después lo escrito.

export interface Cita {
  /** Una cita por cosa: citar lo mismo otra vez la reemplaza. */
  clave: string
  /** Lo que dice la etiqueta, corto: «Revisar», «Idea». */
  tipo: string
  /** Lo que sigue en la etiqueta: el nombre, sin el código (Q-183). */
  nombre: string
  /** Lo que le llega a la IA. */
  texto: string
}

/** Suma una cita a las de una conversación; si ya estaba (misma clave), la reemplaza en su lugar. */
export function sumarCita(citas: readonly Cita[], cita: Cita): Cita[] {
  return citas.some((c) => c.clave === cita.clave)
    ? citas.map((c) => (c.clave === cita.clave ? cita : c))
    : [...citas, cita]
}

/**
 * La marca de una cita en el mensaje (Q-309): su primera línea dice qué es (`<!-- cita: Diseño · Una dirección nueva -->`),
 * para que el hilo la muestre como una ficha corta, como la llamada a una skill, y no el pedido entero. La IA la lee
 * como un rótulo y sigue recibiendo el texto completo.
 */
const MARCA = /^<!-- cita: (.+?) · (.+) -->$/

/** Lo que va en la marca: en una línea y sin cerrar el comentario antes de tiempo. */
const enMarca = (s: string) => s.replace(/\s+/g, ' ').replace(/-->/g, '→').trim()

/** El mensaje que sale: las citas al principio, cada una como cita de Markdown con su marca, y después lo escrito. */
export function mensajeConCitas(citas: readonly Cita[], texto: string): string {
  const partes = citas.map((c) =>
    [`<!-- cita: ${enMarca(c.tipo)} · ${enMarca(c.nombre)} -->`, ...c.texto.trim().split(/\r?\n/)]
      .map((l) => (l.trim() ? `> ${l}` : '>'))
      .join('\n'),
  )
  if (texto.trim()) partes.push(texto)
  return partes.join('\n\n')
}

/** Lo que dice la ficha de una cita enviada: su tipo y su nombre. Las de antes de Q-309 no la tienen. */
export interface EtiquetaCita {
  tipo: string
  nombre: string
}

/**
 * Lo contrario, para mostrar un mensaje propio en el hilo: las citas del principio (los párrafos que son todo cita de
 * Markdown) sin los `>` ni la marca, con su etiqueta si la tienen (`null` si no), y lo escrito después. Un mensaje sin
 * citas devuelve `citas` vacío y el texto tal cual.
 */
export function leerCitas(mensaje: string): {
  citas: string[]
  etiquetas: (EtiquetaCita | null)[]
  texto: string
} {
  const parrafos = mensaje.replace(/\r\n/g, '\n').split(/\n{2,}/)
  const citas: string[] = []
  const etiquetas: (EtiquetaCita | null)[] = []
  let i = 0
  for (; i < parrafos.length; i++) {
    const lineas = (parrafos[i] ?? '').split('\n')
    if (!lineas.every((l) => /^>( |$)/.test(l))) break
    const sin = lineas.map((l) => l.replace(/^> ?/, ''))
    const marca = MARCA.exec(sin[0]?.trim() ?? '')
    etiquetas.push(marca ? { tipo: marca[1] ?? '', nombre: marca[2] ?? '' } : null)
    citas.push((marca ? sin.slice(1) : sin).join('\n').trim())
  }
  return citas.length
    ? { citas, etiquetas, texto: parrafos.slice(i).join('\n\n') }
    : { citas, etiquetas, texto: mensaje }
}

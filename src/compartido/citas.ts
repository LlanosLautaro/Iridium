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

/** El mensaje que sale: las citas al principio, cada una como cita de Markdown, y después lo escrito. */
export function mensajeConCitas(citas: readonly Cita[], texto: string): string {
  const partes = citas.map((c) =>
    c.texto
      .trim()
      .split(/\r?\n/)
      .map((l) => (l.trim() ? `> ${l}` : '>'))
      .join('\n'),
  )
  if (texto.trim()) partes.push(texto)
  return partes.join('\n\n')
}

/**
 * Lo contrario, para mostrar un mensaje propio en el hilo: las citas del principio (los párrafos que son todo cita de
 * Markdown) sin los `>`, y lo escrito después. Un mensaje sin citas devuelve `citas` vacío y el texto tal cual.
 */
export function leerCitas(mensaje: string): { citas: string[]; texto: string } {
  const parrafos = mensaje.replace(/\r\n/g, '\n').split(/\n{2,}/)
  const citas: string[] = []
  let i = 0
  for (; i < parrafos.length; i++) {
    const lineas = (parrafos[i] ?? '').split('\n')
    if (!lineas.every((l) => /^>( |$)/.test(l))) break
    citas.push(
      lineas
        .map((l) => l.replace(/^> ?/, ''))
        .join('\n')
        .trim(),
    )
  }
  return citas.length ? { citas, texto: parrafos.slice(i).join('\n\n') } : { citas, texto: mensaje }
}

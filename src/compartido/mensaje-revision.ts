// El mensaje que recibe la IA con Enviar ahora (modulos/revision/diseno-tecnico.md › Enviar ahora). Lo arma el
// proceso principal y lo reconoce la ventana para mostrarlo como tarjeta (W-R4): como es el texto del mensaje, se ve
// igual al releer la conversación guardada, también la que se abrió en VS Code. Sin dependencias: lo usan los dos lados.

export interface MensajeComentario {
  codigo: string
  texto: string
  /** `src/Tarjeta.jsx` y la línea; null si el comentario no los tiene. */
  archivo: { ruta: string; linea: number } | null
}

const CABECERA = /^\[Comentario (R-\d+) de la Revisión · [^\]]*\]\s*$/
const PISTAS = /^(Dónde|Página|Captura):/
const CIERRE = /^Al resolverlo, cerralo/

export function armarMensaje(c: {
  codigo: string
  texto: string
  archivo: { ruta: string; linea: number } | null
  pagina: string | null
  captura: string | null
}): string {
  const pistas: string[] = []
  if (c.archivo) pistas.push(`Dónde: ${c.archivo.ruta}, línea ${c.archivo.linea}`)
  else if (c.pagina) pistas.push(`Página: ${c.pagina}`)
  if (c.captura) pistas.push(`Captura: docs/revision/${c.captura}`)
  return [
    `[Comentario ${c.codigo} de la Revisión · docs/revision/${c.codigo}.md]`,
    c.texto.trim(),
    ...(pistas.length ? [pistas.join(' · ')] : []),
    'Al resolverlo, cerralo en su archivo: Estado `cerrado` y una línea en Historia con lo que hiciste ' +
      '(si no lo hacés ahora, Estado `anotado` y dónde quedó).',
  ].join('\n')
}

/** El comentario de un mensaje del usuario, o null si el mensaje no es uno. */
export function leerMensaje(mensaje: string): MensajeComentario | null {
  const lineas = mensaje.trim().split(/\r?\n/)
  const codigo = CABECERA.exec(lineas[0] ?? '')?.[1]
  if (!codigo) return null
  let resto = lineas.slice(1)
  if (CIERRE.test(resto.at(-1) ?? '')) resto = resto.slice(0, -1)
  let archivo: MensajeComentario['archivo'] = null
  const ultima = resto.at(-1) ?? ''
  if (resto.length > 1 && PISTAS.test(ultima)) {
    const m = /Dónde:\s*(.+?),\s*línea\s+(\d+)/.exec(ultima)
    if (m) archivo = { ruta: m[1] ?? '', linea: Number(m[2]) }
    resto = resto.slice(0, -1)
  }
  return { codigo, texto: resto.join('\n').trim(), archivo }
}

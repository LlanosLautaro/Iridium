// El mensaje que recibe la IA con Enviar ahora (modulos/revision/diseno-tecnico.md › Enviar ahora). Lo arma el
// proceso principal y lo reconoce la ventana para mostrarlo como tarjeta (W-R4): como es el texto del mensaje, se ve
// igual al releer la conversación guardada, también la que se abrió en VS Code. Sin dependencias: lo usan los dos lados.
// Mandar a la IA desde la sección Revisión no lo envía: lo deja citado en el campo de la conversación, como una idea
// (R-101); sale con lo que escriba el usuario, y en el hilo la cita se ve igual como tarjeta.
import type { Cita } from './citas'

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
  /** Hecho sobre una maqueta de Diseño: se corrige ahí, no en el código. */
  maqueta?: string | null
}): string {
  const pistas: string[] = []
  if (c.maqueta) pistas.push(`Dónde: la maqueta ${c.maqueta} (corregila ahí, no en el código)`)
  else if (c.archivo) pistas.push(`Dónde: ${c.archivo.ruta}, línea ${c.archivo.linea}`)
  else if (c.pagina) pistas.push(`Página: ${c.pagina}`)
  if (c.captura) pistas.push(`Captura: docs/revision/${c.captura}`)
  return [
    `[Comentario ${c.codigo} de la Revisión · docs/revision/${c.codigo}.md]`,
    c.texto.trim(),
    ...(pistas.length ? [pistas.join(' · ')] : []),
    'Al resolverlo, cerralo en su archivo: Estado `cerrado` y una línea en Historia con lo que hiciste ' +
      '(si no lo hacés ahora, Estado `anotado` con su T-n, y se cierra cuando ese T-n quede hecho).',
  ].join('\n')
}

/** Mandar a la IA (R-101): el comentario como cita del campo de la conversación, con el mismo texto que Enviar ahora. */
export function citaComentario(c: {
  codigo: string
  texto: string
  archivo: { ruta: string; linea: number } | null
  pagina: string | null
  conCaptura: boolean
  maqueta: { ruta: string } | null
}): Cita {
  const linea = c.texto.trim().split(/\r?\n/)[0] ?? ''
  return {
    clave: `comentario:${c.codigo}`,
    tipo: 'Comentario',
    nombre: `${c.codigo} · ${linea.length > 60 ? `${linea.slice(0, 59)}…` : linea}`,
    texto: armarMensaje({
      codigo: c.codigo,
      texto: c.texto,
      archivo: c.archivo && { ruta: c.archivo.ruta, linea: c.archivo.linea },
      pagina: c.pagina,
      captura: c.conCaptura ? `${c.codigo}.png` : null,
      maqueta: c.maqueta?.ruta ?? null,
    }),
  }
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

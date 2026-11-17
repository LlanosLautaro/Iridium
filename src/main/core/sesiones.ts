// Reglas de las sesiones con la IA (05-arquitectura.md › Seguí, › Detener; D-021, D-027). Sin disco ni motor.
import MarkdownIt from 'markdown-it'
import type { PreguntaNueva } from '../../compartido/puente'

/** Lo que se agrega a la instrucción del sistema de cada sesión del Centro (05-arquitectura.md › Seguí). */
export const INSTRUCCION_CENTRO =
  'Trabajás desde Iridium, la app del usuario para dirigir sus proyectos. Nadie mira esta sesión en vivo. ' +
  'No esperes al usuario ni le preguntes en el chat: lo que necesites de él (una decisión, una prueba, un dato), ' +
  'anotalo como Q-n en "Preguntas abiertas" de docs/estado.md con el formato de la guía y cerrá la iteración ' +
  '(estado al día y Próximo paso concreto).'

/**
 * La instrucción del chat de la vista de Proyectos (D-060), que trabaja en la carpeta Ideas: ahí el usuario conversa
 * (ideas sueltas, proyectos nuevos, lo que toca a varios), así que la IA le responde y le pregunta en el chat.
 */
export const INSTRUCCION_GENERAL =
  'Trabajás desde Iridium, la app del usuario para dirigir sus proyectos, en el chat de la vista general: el usuario ' +
  'te escribe para ordenar ideas sueltas, crear proyectos o hablar de varios a la vez; las reglas están en el ' +
  'CLAUDE.md de esta carpeta. Nadie mira la sesión en vivo: el usuario lee tu respuesta cuando vuelve. Respondé en ' +
  'el chat y, si necesitás algo de él, preguntalo ahí, al final y en pocas palabras. Las ideas sueltas están en ' +
  'sueltas.md, con el formato de trabajo.md (cada una un T-n con Idea:), y la nota de cada una en sueltas/T-n.md; ' +
  'ideas.md y notas.md son de antes y ya no se escriben.'

/** La del chat general con la carpeta de proyectos, que ya no es la de arriba de esta (D-083). */
export function instruccionGeneral(raiz: string): string {
  return `${INSTRUCCION_GENERAL} La carpeta de proyectos es ${raiz}: cada carpeta hija es un proyecto.`
}

/**
 * La instrucción del chat de la sección Skills (D-068), que trabaja en la carpeta Skills: el usuario mira sus
 * skills y conversa sobre ellas al lado, así que la IA le responde y le pregunta en el chat, como en el de Ideas.
 */
export const INSTRUCCION_SKILLS =
  'Trabajás desde Iridium, la app del usuario para dirigir sus proyectos, en el chat de la sección Skills: el usuario ' +
  'mira la lista de sus skills y te escribe para pensarlas o cambiarlas, y también sobre el resto de la configuración ' +
  'de Claude; las reglas están en el CLAUDE.md de esta carpeta. Un mensaje que empieza con «Sobre la skill <nombre>:» ' +
  'habla de esa skill. Respondé en el chat y, si necesitás algo de él, preguntalo ahí, al final y en pocas palabras; ' +
  'no dejes preguntas en un estado.md.'

/**
 * Lo que se suma a la instrucción cuando el proyecto tiene comentarios de la Revisión abiertos (H-R6, D-048): así la IA
 * los encuentra sin que Iridium toque el `CLAUDE.md` del proyecto. null si no hay.
 */
export function instruccionRevision(abiertos: number): string | null {
  if (abiertos <= 0) return null
  const cuantos = abiertos === 1 ? 'Hay 1 comentario' : `Hay ${abiertos} comentarios`
  return (
    `${cuantos} de la Revisión ${abiertos === 1 ? 'abierto' : 'abiertos'} en docs/revision/ (R-n.md, con su captura): ` +
    'son comentarios del usuario sobre la app. Leelos, resolvelos y cerralos: Estado `cerrado` y una línea en ' +
    'Historia («- AAAA-MM-DD HH:MM — cerrado por la IA: qué hiciste»). Cerrado es solo lo que quedó hecho de ' +
    'verdad: si lo dejás para después, creá su T-n, Estado `anotado` y «- AAAA-MM-DD HH:MM — anotado por la IA: T-n (por qué ' +
    'después)»; cuando ese T-n quede hecho, cerralo.'
  )
}

/** El mensaje de Seguí: el `CLAUDE.md` del proyecto le dice que lea `estado.md` (F-1). */
export const MENSAJE_SEGUI = 'Continúa con el proyecto.'

/** Lo que se le avisa a la IA al retomar después de Detener: sin esto, cree que le rechazaron un comando (S-2). */
export const AVISO_DETENIDA =
  'Te detuve a mitad del turno anterior con el botón Detener de Iridium; no rechacé ningún comando. ' +
  'Revisá qué quedó hecho antes de seguir.'

export function mensajeParaLaIa(texto: string, detenida: boolean): string {
  return detenida ? `${AVISO_DETENIDA}\n\n${texto}` : texto
}

/** D-027: una conversación que se tocó fuera del Centro hace menos de esto puede estar abierta en VS Code. */
export const RECIENTE_AFUERA_MS = 10 * 60_000
/** Margen entre que el Centro termina un turno y Claude Code termina de escribir el historial. */
const MARGEN_MS = 15_000

/** ¿Alguien escribió en la conversación después de la última vez que la usó el Centro (null si nunca)? */
export function tocadaDespues(modificada: number, usoCentro: number | null): boolean {
  return usoCentro === null || modificada > usoCentro + MARGEN_MS
}

/** Cuándo se usó afuera la conversación, si fue hace poco (D-027); null si no. */
export function usadaAfuera(modificada: number, usoCentro: number | null, ahora: number): number | null {
  if (!tocadaDespues(modificada, usoCentro)) return null
  return ahora - modificada < RECIENTE_AFUERA_MS ? modificada : null
}

/** Las preguntas sin responder de ahora que no estaban antes del turno (H-5). */
export function preguntasNuevas(
  antes: ReadonlySet<string>,
  ahora: readonly PreguntaNueva[],
): PreguntaNueva[] {
  return ahora.filter((q) => !antes.has(q.codigo))
}

const md = new MarkdownIt({ html: false, linkify: true, typographer: false, breaks: false })
// Los enlaces se abren afuera (la ventana nunca navega): solo http y https.
md.validateLink = (url) => /^https?:\/\//i.test(url)

/** El texto de la IA en HTML seguro: sin HTML crudo y sin enlaces que no sean de la web. */
export function htmlDeMensaje(texto: string): string {
  return md.render(texto)
}

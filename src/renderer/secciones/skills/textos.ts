// Los textos de la sección Skills que se arman con datos (modulos/skills/ux.md): el origen en palabras y los pedidos
// que se escriben en el chat. Sin React.
import type { OrigenSkill, Skill } from '../../../compartido/skills'

/** De dónde llega, en palabras (SK-1). */
export function origenEnPalabras(s: Pick<Skill, 'origen' | 'complemento' | 'problema'>): string {
  if (s.origen === 'propia')
    return s.problema === 'enlace-roto' ? 'Propia · enlace roto' : 'Propia · enlace a la carpeta Skills'
  if (s.origen === 'tercero') return 'Copia de un tercero · carpeta suelta'
  if (s.origen === 'complemento') return `Del complemento ${s.complemento ?? ''}`.trim()
  return 'Desde la cuenta de Claude'
}

/** Dónde está la otra copia, para «También llega …» (SK-2). */
export function dondeEsta(origen: OrigenSkill, complemento: string | null): string {
  if (origen === 'propia') return 'como propia, desde la carpeta Skills'
  if (origen === 'tercero') return 'como carpeta suelta'
  if (origen === 'complemento') return `del complemento ${complemento ?? ''}`.trim()
  return 'desde la cuenta de Claude'
}

/** Por qué no se edita desde la PC (SK-3); null si es propia. */
export function porQueNoSeEdita(origen: OrigenSkill): string | null {
  if (origen === 'tercero') return 'No se edita desde Iridium: es de un tercero.'
  if (origen === 'complemento') return 'Llega de un complemento: no se puede cambiar desde la PC.'
  if (origen === 'cuenta') return 'Llega de la cuenta: no se puede cambiar desde la PC.'
  return null
}

/** «Pedir que la saquen»: el pedido que queda escrito en el chat (sin enviar). */
export function pedidoSacar(s: Skill): string {
  const d = s.doble
  if (!d) return ''
  const cual = d.sobra === 'esta' ? s.id : d.otra
  return (
    `Está dos veces: también llega ${dondeEsta(d.otraOrigen, d.otraComplemento)} (${d.otraNombre}). ` +
    `Saca la copia que sobra, \`${cual}\` (D-014); antes fíjate que no tenga nada que no esté en la otra.`
  )
}

/** «Pedir que lo arreglen», para un enlace roto. */
export function pedidoArreglar(s: Skill): string {
  return (
    `El enlace \`${s.id}\` lleva a \`${s.destino ?? '?'}\`, que ya no existe. Arréglalo: vuelve a instalar la ` +
    'skill desde la carpeta Skills o, si ya no va, saca el enlace.'
  )
}

/** La primera línea de la descripción, para la lista. */
export function primeraLinea(descripcion: string | null): string {
  if (!descripcion) return 'Sin descripción'
  const linea = descripcion.split(/\n/)[0] ?? ''
  return linea.split(/(?<=[.:;])\s/)[0] ?? linea
}

// El control (frente Orden, OR-2; `modulos/orden/diseno-tecnico.md` › El control): revisa que lo que escribió la IA
// esté como Iridium lo lee y arma el mensaje con el que se le devuelve. Una regla por archivo, todas puras.
import { reglaDibujos } from './dibujos'
import { reglaEstados } from './estado'
import { reglaPreguntas } from './preguntas'
import { reglaRespuestas } from './respuestas'
import { reglaRevision } from './revision'
import type { ArchivosControl, Aviso, Regla } from './tipos'
import { reglaTrabajo } from './trabajo'

export type { ArchivosControl, Aviso } from './tipos'

export const REGLAS: readonly Regla[] = [
  reglaPreguntas,
  reglaRespuestas,
  reglaTrabajo,
  reglaRevision,
  reglaEstados,
  reglaDibujos,
]

export function correrControl(archivos: ArchivosControl): Aviso[] {
  return REGLAS.flatMap((r) => r(archivos))
}

/** Un proyecto con framework: `docs/README.md` con `**Framework:** AAAA-MM-DD` (D-099). Solo ahí corre el control. */
export function tieneFramework(readme: string | null): boolean {
  return readme !== null && /^\s*\*\*Framework:\*\*\s*\d{4}-\d{2}-\d{2}/m.test(readme)
}

export const ENCABEZADO_CONTROL =
  'El control de Iridium encontró esto mal escrito; corregilo y no hagas nada más:'

/** El mensaje que se le devuelve a la IA al terminar su turno. */
export function mensajeDelControl(avisos: readonly Aviso[]): string {
  const lineas = avisos.map((a) => `- \`${dondeDe(a)}\` — ${a.texto}`)
  return [ENCABEZADO_CONTROL, '', ...lineas].join('\n')
}

/** Las cosas de un mensaje del control (al leer una conversación guardada), o null si no es uno. */
export function leerMensajeDelControl(texto: string): { donde: string; texto: string }[] | null {
  if (!texto.startsWith(ENCABEZADO_CONTROL)) return null
  return texto
    .slice(ENCABEZADO_CONTROL.length)
    .split('\n')
    .flatMap((l) => {
      const m = /^- `([^`]+)` — (.+)$/.exec(l.trim())
      return m?.[1] && m[2] ? [{ donde: m[1], texto: m[2] }] : []
    })
}

/** Dónde está un aviso, como lo ve la IA: `docs/estado.md:12`. */
export function dondeDe(a: Aviso): string {
  return `${a.archivo}${a.linea ? `:${a.linea}` : ''}`
}

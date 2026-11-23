// El sonido al terminar (T-52, D-183): la ventana lo arma con Web Audio, sin archivos, y lo toca cuando el proceso
// principal avisa que la IA terminó su trabajo (`alTerminarTrabajo`). Ajustes › Notificaciones lo elige y lo prueba.
import type { SonidoFin } from '../../compartido/puente'

export const NOMBRES_SONIDO: Record<SonidoFin, string> = {
  campana: 'Campana',
  'dos-notas': 'Dos notas',
  gota: 'Gota',
  acorde: 'Acorde',
}

/** Una nota: frecuencia en Hz, cuándo empieza y cuánto dura (s), y su forma. */
interface Nota {
  hz: number
  desde: number
  dura: number
  forma?: OscillatorType
  /** Hasta qué frecuencia baja en la duración (la gota). */
  hastaHz?: number
}

const NOTAS: Record<SonidoFin, Nota[]> = {
  // Una campana: la fundamental y un armónico que se apagan lento.
  campana: [
    { hz: 880, desde: 0, dura: 1.4 },
    { hz: 2200, desde: 0, dura: 0.6 },
  ],
  // Dos notas que suben, como «listo».
  'dos-notas': [
    { hz: 660, desde: 0, dura: 0.35, forma: 'triangle' },
    { hz: 990, desde: 0.16, dura: 0.6, forma: 'triangle' },
  ],
  // Una gota: una nota corta que cae.
  gota: [{ hz: 1400, hastaHz: 500, desde: 0, dura: 0.3 }],
  // Un acorde mayor arpegiado, suave.
  acorde: [
    { hz: 523.25, desde: 0, dura: 1.1, forma: 'triangle' },
    { hz: 659.25, desde: 0.09, dura: 1.0, forma: 'triangle' },
    { hz: 783.99, desde: 0.18, dura: 0.9, forma: 'triangle' },
  ],
}

const VOLUMEN = 0.18

let contexto: AudioContext | null = null

/** Toca el sonido. Si la ventana no puede (sin salida de audio), no pasa nada. */
export function tocarSonido(cual: SonidoFin): void {
  // Las pruebas con la app abierta ponen esta lista para ver qué sonó.
  ;(globalThis as { sonidosTocados?: SonidoFin[] }).sonidosTocados?.push(cual)
  try {
    contexto ??= new AudioContext()
    const c = contexto
    if (c.state === 'suspended') void c.resume()
    const ahora = c.currentTime + 0.02
    for (const n of NOTAS[cual]) {
      const osc = c.createOscillator()
      const vol = c.createGain()
      osc.type = n.forma ?? 'sine'
      osc.frequency.setValueAtTime(n.hz, ahora + n.desde)
      if (n.hastaHz) osc.frequency.exponentialRampToValueAtTime(n.hastaHz, ahora + n.desde + n.dura)
      vol.gain.setValueAtTime(0.0001, ahora + n.desde)
      vol.gain.exponentialRampToValueAtTime(VOLUMEN, ahora + n.desde + 0.01)
      vol.gain.exponentialRampToValueAtTime(0.0001, ahora + n.desde + n.dura)
      osc.connect(vol).connect(c.destination)
      osc.start(ahora + n.desde)
      osc.stop(ahora + n.desde + n.dura + 0.05)
    }
  } catch {
    // Sin audio: el sonido es un extra.
  }
}

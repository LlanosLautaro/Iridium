// Iridium sin usar (T-67, D-122 ajustada por Q-167): Actualizar solo reinicia cuando nadie usa Iridium, no la PC. Cuenta
// el teclado y el mouse dentro de su ventana (también la maqueta de Diseño) y el volver a ella; minimizada o detrás de
// otra ventana no recibe nada, así que el rato corre aunque se siga usando la PC para otra cosa.

export class UsoDeIridium {
  private ultimo: number

  constructor(ahora = Date.now()) {
    this.ultimo = ahora
  }

  /** Se tocó el teclado o el mouse en su ventana, o se volvió a ella. */
  marcar(ahora = Date.now()): void {
    this.ultimo = ahora
  }

  segundosSinUsar(ahora = Date.now()): number {
    return Math.max(0, Math.floor((ahora - this.ultimo) / 1000))
  }
}

/** Cuánto vale la marca de «abrir de fondo»: lo que tarda en cerrarse, poner la versión y volver a abrir, con margen. */
const DE_FONDO_MS = 5 * 60_000

/**
 * Si reiniciar con la versión nueva debe abrir minimizada y sin quitarle el foco a nada: se reinició sin estar Iridium
 * al frente (`marca`, cuándo) y hace poco. Una marca vieja (el reinicio no llegó a pasar) no cuenta.
 */
export function abrirDeFondo(marca: number | null, ahora = Date.now()): boolean {
  return marca !== null && ahora - marca >= 0 && ahora - marca < DE_FONDO_MS
}

// La cuenta de la bandeja (04-ux.md › Un número que manda, D-100): neutra, o amarilla con «!» solo si algo frena.
// La usan el botón de inicio, la tarjeta, la pestaña y la columna de la Bandeja de entrada.

export type ColorCuenta = 'nada' | 'neutra' | 'frena'

/** Sin nada, no se muestra; con algo, gris; con algo que frena, amarilla. Las en pausa ya no están en `cuenta`. */
export function colorDeCuenta(cuenta: number, frenan: number): ColorCuenta {
  if (cuenta <= 0) return 'nada'
  return frenan > 0 ? 'frena' : 'neutra'
}

/** «3», «99+». */
export function numeroDeCuenta(n: number): string {
  return n > 99 ? '99+' : String(n)
}

/** Lo que se lee de la cuenta: «3 en la bandeja» y, si algo frena, «una frena el proyecto». */
export function textoDeCuenta(cuenta: number, frenan: number): string {
  if (cuenta <= 0) return 'Nada en la bandeja'
  const base = `${numeroDeCuenta(cuenta)} en la bandeja`
  if (frenan <= 0) return base
  return `${base}; ${frenan === 1 ? 'una frena' : `${frenan} frenan`} el proyecto`
}

/**
 * Lo que dice la esquina de la tarjeta cuando no hay nada sin responder (R-81): todo respondido (la IA puede seguir),
 * la bandeja vacía o el proyecto sin empezar (sin `docs/estado.md`), que se ven igual. Con algo sin responder, la cuenta.
 */
export type MarcaDeBandeja = 'cuenta' | 'respondida' | 'vacia' | 'sin-empezar'

export function marcaDeBandeja(
  p: { sinResponder: number; respondidas: number },
  empezado: boolean,
): MarcaDeBandeja {
  if (p.sinResponder > 0) return 'cuenta'
  if (p.respondidas > 0) return 'respondida'
  return empezado ? 'vacia' : 'sin-empezar'
}

export const TEXTO_MARCA: Record<Exclude<MarcaDeBandeja, 'cuenta'>, string> = {
  respondida: 'Todo respondido: la IA puede seguir',
  vacia: 'Bandeja vacía',
  'sin-empezar': 'Sin empezar',
}

// Agrandar la letra (04-ux.md › Accesibilidad, Defecto 17): Ctrl+= y Ctrl+- pasan por estos niveles, Ctrl+0 vuelve
// al normal. Son los de Chromium, de 80 % a 200 %.
export const ZOOMS = [0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2] as const

/** El nivel siguiente (1), el anterior (-1) o el normal (0). Uno que no está en la lista va al más cercano. */
export function zoomSiguiente(actual: number, paso: 1 | -1 | 0): number {
  if (paso === 0) return 1
  if (paso === 1) return ZOOMS.find((z) => z > actual + 0.001) ?? 2
  return [...ZOOMS].reverse().find((z) => z < actual - 0.001) ?? 0.8
}

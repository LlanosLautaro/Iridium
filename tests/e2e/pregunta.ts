// Las preguntas de la Bandeja se pliegan desde su título (R-39): la primera va abierta y las demás, plegadas.
import type { Locator } from '@playwright/test'

/** Abre una pregunta de la Bandeja si está plegada. */
export async function abrirPregunta(q: Locator): Promise<void> {
  const titulo = q.locator('.titulo-q')
  if ((await titulo.getAttribute('aria-expanded')) === 'false') await titulo.click()
}

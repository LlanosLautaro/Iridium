// Guardar lo que se escribe sin hacerlo con cada tecla (D-060): espera a que se deje de escribir un momento. Lo que
// quedó esperando se guarda igual al salir de la sección (no depende de que el campo siga en pantalla) y al cerrar.

const ESPERA_MS = 400

const esperando = new Map<string, { t: ReturnType<typeof setTimeout>; guardar: () => void }>()

/** Guarda en un momento; si vuelve a llegar algo con la misma clave antes, solo cuenta lo último. */
export function guardarLuego(clave: string, guardar: () => void): void {
  const antes = esperando.get(clave)
  if (antes) clearTimeout(antes.t)
  const t = setTimeout(() => {
    esperando.delete(clave)
    guardar()
  }, ESPERA_MS)
  esperando.set(clave, { t, guardar })
}

/** Guarda ya todo lo que estaba esperando (al cerrar la ventana). */
export function guardarTodoYa(): void {
  for (const [clave, e] of esperando) {
    clearTimeout(e.t)
    esperando.delete(clave)
    e.guardar()
  }
}

/** Lo que esperaba ya no hace falta (se envió o se guardó de otra forma). */
export function noGuardar(clave: string): void {
  const e = esperando.get(clave)
  if (!e) return
  clearTimeout(e.t)
  esperando.delete(clave)
}

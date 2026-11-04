// Copiado de la app anterior de proyectos (D-026).
// Recorrido de árboles de carpetas en paralelo: lo usan Eliminar (D-006) y la última actividad (D-013).

/** Cuántas carpetas se leen a la vez: con decenas de miles de archivos, leer de a una tarda demasiado. */
const EN_PARALELO = 32

/** Recorre un árbol leyendo varias carpetas a la vez. `procesar` devuelve las subcarpetas a recorrer. */
export async function recorrer<T>(inicio: T, procesar: (item: T) => Promise<T[]>): Promise<void> {
  const pendientes: T[] = [inicio]
  let activos = 0
  await new Promise<void>((terminar, fallar) => {
    const seguir = () => {
      if (pendientes.length === 0 && activos === 0) {
        terminar()
        return
      }
      while (activos < EN_PARALELO && pendientes.length > 0) {
        const item = pendientes.pop() as T
        activos++
        procesar(item).then((hijos) => {
          activos--
          pendientes.push(...hijos)
          seguir()
        }, fallar)
      }
    }
    seguir()
  })
}

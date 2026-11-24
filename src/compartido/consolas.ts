// Las consolas adentro (T-116, D-184, D-185; `cambios/consolas.md`): lo que ven los dos lados del puente y las reglas
// del panel, puras: cómo va cada pestaña, qué consolas se ven dónde, qué cuenta la barra de abajo y el recorte de la
// salida guardada.

/** Cómo va una consola: corriendo, terminó bien, falló (salió con otro código) o la detuvo el usuario. */
export type EstadoConsola = 'corriendo' | 'ok' | 'fallo' | 'detenida'

export interface ConsolaVista {
  id: string
  /** El nombre del script, o «Iniciar sesión en Claude». */
  nombre: string
  /** La carpeta del proyecto; null, las de Iridium (el inicio de sesión), que se ven en todos lados. */
  proyecto: string | null
  estado: EstadoConsola
  /** El código con el que terminó; null mientras corre. */
  codigo: number | null
  /** Cuándo se abrió (ms). */
  desde: number
}

/** Al cerrar o reiniciar Iridium con algo andando (F-6, I-10): los proyectos con la IA trabajando y las consolas corriendo. */
export interface PedidoCierre {
  trabajando: string[]
  consolas: number
}

/**
 * Lo que dice la confirmación de cierre (F-6, I-10): el título nombra lo que frena (los proyectos que trabajan o, sin
 * ellos, las consolas) y el texto, qué pasa con cada cosa. `nombres`, los de los proyectos que trabajan.
 */
export function textoDeCierre(
  nombres: readonly string[],
  consolas: number,
  reiniciando: boolean,
): { titulo: string; texto: string } {
  const verbo = reiniciando ? 'Reiniciar' : 'Cerrar'
  const deConsolas = consolas === 1 ? '1 consola corriendo' : `${consolas} consolas corriendo`
  const detiene = consolas === 1 ? 'la detiene' : 'las detiene'
  if (nombres.length === 0)
    return {
      titulo: deConsolas.charAt(0).toUpperCase() + deConsolas.slice(1),
      texto: `${verbo} ${detiene}: lo que estaba haciendo se corta.`,
    }
  const lista =
    nombres.length === 1 ? nombres[0] : `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`
  const sesiones = `${verbo} ${nombres.length === 1 ? 'la frena' : 'las frena'}. Las conversaciones quedan guardadas: con Continuar se retoman y la IA sabe que la detuviste.`
  return {
    titulo: `${lista} ${nombres.length === 1 ? 'está trabajando' : 'están trabajando'}`,
    texto:
      consolas > 0
        ? `${sesiones} También ${consolas === 1 ? 'se detiene' : 'se detienen'} ${deConsolas}.`
        : sesiones,
  }
}

/** Lo que imprimió una consola desde `desde` (la cuenta de caracteres desde que se abrió): llega en tandas. */
export interface SalidaConsola {
  id: string
  desde: number
  datos: string
}

/** Lo guardado de una consola: su final (las últimas líneas) y hasta qué caracter llega. */
export interface GuardadoConsola {
  texto: string
  hasta: number
}

/** Cuántas líneas guarda cada consola: una pestaña que se vuelve a mirar o la ventana recargada la muestran entera. */
export const LINEAS_GUARDADAS = 5000

/** El final de `texto` con a lo sumo `max` líneas. */
export function recortarSalida(texto: string, max = LINEAS_GUARDADAS): string {
  let fin = texto.length
  for (let n = 0; n < max; n++) {
    const i = texto.lastIndexOf('\n', fin - 1)
    if (i < 0) return texto
    fin = i
  }
  return texto.slice(fin + 1)
}

/** Cómo quedó al terminar: si la detuvo el usuario lo dice aunque el código sea otro. */
export function estadoAlTerminar(codigo: number, detenida: boolean): EstadoConsola {
  if (detenida) return 'detenida'
  return codigo === 0 ? 'ok' : 'fallo'
}

/** Las consolas que se ven en un proyecto (las suyas y las de Iridium); en el inicio (`null`), todas. */
export function consolasDe(lista: readonly ConsolaVista[], proyecto: string | null): ConsolaVista[] {
  if (proyecto === null) return [...lista]
  const igual = (a: string) => a.toLowerCase() === proyecto.toLowerCase()
  return lista.filter((c) => c.proyecto === null || igual(c.proyecto))
}

/** Lo que dice la barra de abajo: «▶ 2 corriendo» o, sin ninguna corriendo, cuántas quedaron para leer; nada si no hay. */
export function textoDeLaBarra(lista: readonly ConsolaVista[]): { texto: string; corriendo: boolean } | null {
  if (lista.length === 0) return null
  const n = lista.filter((c) => c.estado === 'corriendo').length
  if (n > 0) return { texto: `${n} corriendo`, corriendo: true }
  return { texto: lista.length === 1 ? '1 consola' : `${lista.length} consolas`, corriendo: false }
}

/** Lo que dice una pestaña al pasar el mouse. */
export function detalleDePestana(c: ConsolaVista): string {
  switch (c.estado) {
    case 'corriendo':
      return `${c.nombre} · corriendo`
    case 'ok':
      return `${c.nombre} · terminó bien`
    case 'fallo':
      return `${c.nombre} · falló (código ${c.codigo})`
    case 'detenida':
      return `${c.nombre} · detenida`
  }
}

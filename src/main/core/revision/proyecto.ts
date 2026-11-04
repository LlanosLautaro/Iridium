// A qué proyecto va un comentario (C-39, H-R3; diseno-tecnico.md › Qué proyecto es). Reglas puras.

export interface ProyectoConocido {
  nombre: string
  ruta: string
}

const normal = (r: string) => r.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()

/**
 * El proyecto cuya carpeta aparece en la línea de comandos del proceso que atiende el puerto (Vite corre como
 * `node "D:\…\Alfa\node_modules\vite\bin\vite.js"`). Si aparecen dos o ninguno, null: no se adivina.
 */
export function proyectoPorLineaDeComandos(
  lineas: string[],
  proyectos: ProyectoConocido[],
): ProyectoConocido | null {
  const texto = normal(lineas.join('\n'))
  const hallados = proyectos.filter((p) => {
    const ruta = normal(p.ruta)
    let i = texto.indexOf(ruta)
    while (i >= 0) {
      // Que sea la carpeta entera: `…/Alfa/` o `…/Alfa"`, no `…/Alfabeto`.
      const siguiente = texto[i + ruta.length]
      if (siguiente === undefined || /["'/\s]/.test(siguiente)) return true
      i = texto.indexOf(ruta, i + 1)
    }
    return false
  })
  return hallados.length === 1 ? (hallados[0] ?? null) : null
}

/** El proyecto que contiene la carpeta de una app (Electron la pasa); null si ninguno. */
export function proyectoQueContiene(carpeta: string, proyectos: ProyectoConocido[]): ProyectoConocido | null {
  const c = `${normal(carpeta)}/`
  return proyectos.find((p) => c.startsWith(`${normal(p.ruta)}/`)) ?? null
}

/** El único proyecto donde está el archivo; null si está en varios o en ninguno. */
export function unicoCon<T>(hallados: T[]): T | null {
  return hallados.length === 1 ? (hallados[0] ?? null) : null
}

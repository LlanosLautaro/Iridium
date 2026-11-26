// `novedades.md` del framework (frente Orden, T-64, D-118): en el repo que trae el framework, cada novedad con su fecha,
// en orden, con lo que pide y un `Solo si:` que se pueda buscar.
import { leerNovedades, RUTA_NOVEDADES_EN_REPO } from '../novedades-framework'
import type { Regla } from './tipos'

export const reglaNovedades: Regla = (a) => {
  if (!a.novedades) return []
  return leerNovedades(a.novedades).problemas.map((p) => ({
    regla: 'novedades',
    archivo: RUTA_NOVEDADES_EN_REPO,
    linea: p.linea,
    texto: p.texto,
  }))
}

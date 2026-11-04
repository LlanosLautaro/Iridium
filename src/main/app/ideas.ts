// El caso de uso de la sección Ideas (modulos/inicio/diseno-tecnico.md): lee `Ideas/ideas.md`, pinta el cuerpo de
// cada idea con el markdown de Docs y marca qué proyectos que toca existen. Solo lee.
import { basename } from 'node:path'
import type { Idea, ListaIdeas } from '../../compartido/ideas'
import type { TarjetaProyecto } from '../../compartido/puente'
import { type IdeaLeida, leerIdeas } from '../core/ideas'
import { leerArchivoIdeas } from '../infra/ideas'
import { existeCarpeta } from '../infra/raiz'
import { LIMITE_DOCUMENTO_BYTES, motivo } from './visor'

export interface FuenteIdeas {
  /** La carpeta Ideas dentro de la carpeta de proyectos. */
  carpeta: string
  proyectos: readonly TarjetaProyecto[]
  /** El markdown de Docs para un texto de `ideas.md`. */
  html: (texto: string) => Promise<string>
}

export async function leerSeccionIdeas(f: FuenteIdeas): Promise<ListaIdeas> {
  if (!(await existeCarpeta(f.carpeta))) return { tipo: 'sin-carpeta' }
  try {
    const leido = await leerArchivoIdeas(f.carpeta, LIMITE_DOCUMENTO_BYTES)
    if (leido.tipo !== 'texto') return leido
    const ideas = leerIdeas(leido.texto)
    if (ideas.tipo === 'sin-secciones') return { tipo: 'sin-secciones', html: await f.html(leido.texto) }
    const porNombre = new Map(f.proyectos.map((p) => [basename(p.ruta).toLowerCase(), p.ruta]))
    const idea = async (i: IdeaLeida, enIntegradas: boolean): Promise<Idea> => ({
      titulo: i.titulo,
      fecha: i.fecha,
      html: await f.html(i.cuerpo),
      toca: i.toca.map((nombre) => ({ nombre, ruta: porNombre.get(nombre.toLowerCase()) ?? null })),
      destinoHtml: i.destino === null ? null : await f.html(i.destino),
      integrada: enIntegradas || i.destino !== null,
    })
    return {
      tipo: 'ideas',
      secciones: await Promise.all(
        ideas.secciones.map(async (s) => ({
          titulo: s.titulo,
          explicacion: s.explicacion,
          integradas: s.integradas,
          ideas: await Promise.all(s.ideas.map((i) => idea(i, s.integradas))),
        })),
      ),
    }
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

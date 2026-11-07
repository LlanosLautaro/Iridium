// El trabajo de un proyecto (frente Orden, W-11, H-19) y anotar una idea sin la IA (W-10, H-18). Leer usa los
// documentos ya cargados; anotar escribe sin pisar a una sesión (`infra/trabajo.ts`).
import { join } from 'node:path'
import type { TarjetaProyecto } from '../../compartido/puente'
import type {
  IdeasDelInicio,
  IdeasNuevasProyecto,
  ItemTrabajoVista,
  ResultadoAnotar,
  TrabajoProyecto,
} from '../../compartido/trabajo'
import { tieneFramework } from '../core/control'
import { fechaDelDia } from '../core/creacion'
import { conIdeaSuelta } from '../core/ideas'
import { conIdeaNueva, leerTrabajo } from '../core/trabajo'
import { ARCHIVO_IDEAS } from '../infra/ideas'
import { cambiarSinPisar } from '../infra/trabajo'
import { ideasDelProyecto } from './ideas'
import { type DocumentosProyecto, motivo } from './visor'

export const TRABAJO = 'docs/trabajo.md'

export function trabajoDelProyecto(d: DocumentosProyecto): TrabajoProyecto {
  if (d.texto('docs/estado.md') === null) return { tipo: 'sin-docs' }
  if (!tieneFramework(d.texto('docs/README.md'))) return { tipo: 'viejo', ideas: ideasDelProyecto(d) }
  const texto = d.texto(TRABAJO)
  if (texto === null) return { tipo: 'trabajo', items: [], existe: false }
  return {
    tipo: 'trabajo',
    existe: true,
    items: leerTrabajo(texto).items.map((i) => ({
      codigo: i.codigo,
      titulo: i.titulo,
      estado: i.estado,
      estadoTexto: i.estadoTexto,
      frente: i.frente,
      fecha: i.fecha,
      origenHtml: i.origen ? d.enLinea(i.origen, TRABAJO) : null,
      html: i.texto ? d.html(i.texto, TRABAJO) : '',
    })),
  }
}

/** Lo más nuevo arriba; sin fecha, por código (el mismo orden de Trabajo). */
function masNueva(a: ItemTrabajoVista, b: ItemTrabajoVista): number {
  return (b.fecha ?? '').localeCompare(a.fecha ?? '') || Number(b.codigo.slice(2)) - Number(a.codigo.slice(2))
}

/**
 * Ideas del inicio (W-10): las ideas `nueva` de los proyectos con framework que no están archivados, agrupadas por
 * proyecto (el de la idea más reciente primero), y los nombres de los que todavía no pasaron al framework.
 */
export async function ideasDelInicio(
  proyectos: readonly TarjetaProyecto[],
  trabajoDe: (ruta: string) => Promise<TrabajoProyecto>,
): Promise<IdeasDelInicio> {
  const activos = proyectos.filter((p) => !p.archivado)
  const conFramework = activos.filter((p) => p.framework !== null && p.framework !== 'viejo')
  const leidos = await Promise.all(
    conFramework.map(async (p): Promise<IdeasNuevasProyecto> => {
      const t = await trabajoDe(p.ruta).catch(() => null)
      const ideas = t?.tipo === 'trabajo' ? t.items.filter((i) => i.estado === 'nueva').sort(masNueva) : []
      return { ruta: p.ruta, nombre: p.nombre, ideas }
    }),
  )
  const grupos = leidos
    .filter((g) => g.ideas.length > 0)
    .sort(
      (a, b) =>
        (b.ideas[0]?.fecha ?? '').localeCompare(a.ideas[0]?.fecha ?? '') ||
        a.nombre.localeCompare(b.nombre, 'es'),
    )
  const viejos = activos.filter((p) => p.framework === 'viejo').map((p) => p.nombre)
  return { grupos, viejos }
}

/** El texto del campo: una línea, sin espacios de más; vacío no se anota. */
function limpio(titulo: string): string {
  return titulo.replace(/\s+/g, ' ').trim()
}

/** Anota la idea como `T-n` `nueva` al final de `docs/trabajo.md` (lo crea si no está). */
export async function anotarEnProyecto(
  ruta: string,
  titulo: string,
  hoy = new Date(),
  antesDeEscribir?: () => Promise<void>,
): Promise<ResultadoAnotar> {
  const t = limpio(titulo)
  if (t === '') return { tipo: 'error', mensaje: 'la idea está vacía' }
  try {
    const codigo = await cambiarSinPisar(
      join(ruta, ...TRABAJO.split('/')),
      (texto) => {
        const r = conIdeaNueva(texto, t, fechaDelDia(hoy))
        return { texto: r.texto, valor: r.codigo }
      },
      antesDeEscribir,
    )
    return { tipo: 'ok', codigo }
  } catch (e) {
    return { tipo: 'error', mensaje: `no se pudo escribir en ${TRABAJO}: ${motivo(e)}` }
  }
}

/** Anota una idea suelta arriba de la sección Sueltas de `ideas.md` (crea la carpeta y el archivo si no están). */
export async function anotarSuelta(
  carpetaIdeas: string,
  titulo: string,
  hoy = new Date(),
): Promise<ResultadoAnotar> {
  const t = limpio(titulo)
  if (t === '') return { tipo: 'error', mensaje: 'la idea está vacía' }
  try {
    await cambiarSinPisar(join(carpetaIdeas, ARCHIVO_IDEAS), (texto) => ({
      texto: conIdeaSuelta(texto, t, fechaDelDia(hoy)),
      valor: null,
    }))
    return { tipo: 'ok', codigo: '' }
  } catch (e) {
    return { tipo: 'error', mensaje: `no se pudo escribir en ${ARCHIVO_IDEAS}: ${motivo(e)}` }
  }
}

// Los documentos de cada proyecto en memoria (lectores de la app anterior, D-026), compartidos por Pendientes, Docs, el Mapa
// y la conversación: en cada pedido solo se releen los que cambiaron en el disco.
import { DocumentosProyecto } from './visor'

/** Los documentos en el orden del menú de Docs (W-8): el estado, el perfil, los de los hitos, las decisiones, los
 * scripts y lo demás de `docs/`; después los módulos, la investigación y los de la raíz. Las respuestas no van: se
 * llega a ellas desde Pendientes. */
export function ordenDeDocumentos(rutas: readonly string[]): string[] {
  const peso = (r: string): number => {
    if (r === 'docs/estado.md') return 0
    if (r === 'docs/perfil-proyecto.md') return 1
    if (/^docs\/\d{2}-[^/]+\.md$/.test(r)) return 2
    if (r === 'docs/decisiones.md') return 3
    if (r === 'docs/scripts.md') return 4
    if (/^docs\/[^/]+\.md$/.test(r)) return 5
    if (r.startsWith('docs/modulos/')) return 6
    if (r.startsWith('docs/')) return 7
    return 8
  }
  return rutas
    .filter((r) => !r.startsWith('docs/respuestas/'))
    .sort((a, b) => peso(a) - peso(b) || a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' }))
}

export class Documentos {
  private readonly proyectos = new Map<string, DocumentosProyecto>()

  /** Los documentos del proyecto, releídos si algo cambió. */
  async de(ruta: string): Promise<DocumentosProyecto> {
    let d = this.proyectos.get(ruta)
    if (!d) {
      // Las imágenes de los documentos no se muestran: la ventana no lee el disco.
      d = new DocumentosProyecto(ruta, () => null)
      this.proyectos.set(ruta, d)
    }
    await d.cargar()
    return d
  }
}

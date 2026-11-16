// El trabajo de un proyecto (frente Orden, W-11, H-19): los `T-n` de `docs/trabajo.md` de los documentos ya cargados.
import type { TrabajoProyecto } from '../../compartido/trabajo'
import { tieneFramework } from '../core/control'
import { leerTrabajo } from '../core/trabajo'
import { ideasDelProyecto } from './ideas'
import type { DocumentosProyecto } from './visor'

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

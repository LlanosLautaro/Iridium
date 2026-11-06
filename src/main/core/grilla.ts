// La grilla de Proyectos (H-1, 04-ux.md › W-2): qué muestra cada tarjeta y en qué orden. Reglas puras.
import type { TarjetaProyecto } from '../../compartido/puente'
import type { Estado, Guia } from '../../compartido/tipos'
import type { LecturaMetadatos } from './metadatos'
import { inicialDe } from './proyectos'

/** Orden de los estados en la grilla (H-1, D-022); dentro de cada uno, por nombre. */
export const ORDEN_ESTADOS: readonly Estado[] = [
  'en-desarrollo',
  'en-uso',
  'idea',
  'pausado',
  'en-rescate',
  'descontinuado',
  'para-eliminar',
]

export interface DatosProyecto {
  nombre: string
  ruta: string
  /** null = no tiene `.proyecto.json`. */
  metadatos: LecturaMetadatos | null
  /** null = no tiene `docs/estado.md` o no se reconoce nada. */
  guia: Guia | null
  icono: string | null
  preguntas: { sinResponder: number; frenan: number; respondidas: number }
  /** Comentarios de la Revisión abiertos; 0 si no se dice. */
  revision?: number
  /** Las skills de `.claude/skills/`; 0 si no se dice. */
  skills?: number
  /** El framework y sus avisos (W-2); null si no se dice. */
  framework?: TarjetaProyecto['framework']
}

export function armarTarjeta(d: DatosProyecto): TarjetaProyecto {
  const base: TarjetaProyecto = {
    nombre: d.nombre,
    ruta: d.ruta,
    inicial: inicialDe(d.nombre),
    estado: null,
    descripcion: '',
    archivado: false,
    reemplazadoPor: null,
    icono: d.icono,
    problema: null,
    hito: d.guia ? { numero: d.guia.hito, nombre: d.guia.nombreHito, proximoPaso: d.guia.proximoPaso } : null,
    preguntas: d.preguntas,
    revision: d.revision ?? 0,
    skills: d.skills ?? 0,
    framework: d.framework ?? null,
  }
  if (d.metadatos === null) return base
  if (d.metadatos.tipo === 'danado') return { ...base, problema: d.metadatos.motivo }
  const m = d.metadatos.metadatos
  return {
    ...base,
    estado: m.estado,
    descripcion: m.descripcion,
    archivado: m.archivado,
    reemplazadoPor: m.estado === 'en-rescate' ? m.reemplazadoPor : null,
  }
}

const porNombre = new Intl.Collator('es', { sensitivity: 'base', numeric: true })

/** Grupo de orden: los clasificados por estado, después los sin ficha, los archivados y al final las fichas dañadas. */
function grupo(t: TarjetaProyecto): number {
  if (t.problema !== null) return ORDEN_ESTADOS.length + 2
  if (t.archivado) return ORDEN_ESTADOS.length + 1
  if (t.estado === null) return ORDEN_ESTADOS.length
  return ORDEN_ESTADOS.indexOf(t.estado)
}

export function ordenarTarjetas(tarjetas: readonly TarjetaProyecto[]): TarjetaProyecto[] {
  return [...tarjetas].sort((a, b) => grupo(a) - grupo(b) || porNombre.compare(a.nombre, b.nombre))
}

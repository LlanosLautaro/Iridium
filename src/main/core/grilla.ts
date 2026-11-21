// La grilla de Proyectos (H-1, 04-ux.md › W-2): qué muestra cada tarjeta y en qué orden (por el último cambio, D-136).
// Reglas puras.
import type { TarjetaProyecto } from '../../compartido/puente'
import type { Guia } from '../../compartido/tipos'
import type { LecturaMetadatos } from './metadatos'
import { inicialDe } from './proyectos'

export { ordenarTarjetas } from '../../compartido/grilla'

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
  /** El último cambio (ms); null o sin decir, ninguno. */
  ultimoCambio?: number | null
  /** Lo que abre el proyecto (frente Abrir); null o sin decir, nada. */
  ejecutar?: TarjetaProyecto['ejecutar']
}

export function armarTarjeta(d: DatosProyecto): TarjetaProyecto {
  const base: TarjetaProyecto = {
    nombre: d.nombre,
    ruta: d.ruta,
    inicial: inicialDe(d.nombre),
    estado: null,
    descripcion: '',
    archivado: false,
    archivadoEl: null,
    reemplazadoPor: null,
    icono: d.icono,
    problema: null,
    hito: d.guia
      ? {
          numero: d.guia.hito,
          nombre: d.guia.nombreHito,
          proximoPaso: d.guia.proximoPaso,
          ...(d.guia.frente ? { frente: d.guia.frente } : {}),
        }
      : null,
    preguntas: d.preguntas,
    revision: d.revision ?? 0,
    skills: d.skills ?? 0,
    framework: d.framework ?? null,
    ultimoCambio: d.ultimoCambio ?? null,
    ejecutar: d.ejecutar ?? null,
  }
  if (d.metadatos === null) return base
  if (d.metadatos.tipo === 'danado') return { ...base, problema: d.metadatos.motivo }
  const m = d.metadatos.metadatos
  // `nombre` es opcional (OR-10, A-12): el nombre visible si no es el de la carpeta. Queda en `otros`, así que se
  // conserva al guardar la ficha sin que la edición lo conozca.
  const nombre = typeof m.otros.nombre === 'string' ? m.otros.nombre.trim() : ''
  return {
    ...base,
    ...(nombre ? { nombre, inicial: inicialDe(nombre) } : {}),
    estado: m.estado,
    descripcion: m.descripcion,
    archivado: m.archivado,
    archivadoEl: m.archivadoEl ?? null,
    reemplazadoPor: m.estado === 'en-rescate' ? m.reemplazadoPor : null,
  }
}

// Copiado de la app anterior de proyectos (D-026).
// Reglas puras sobre la lista de proyectos: sin disco ni VS Code.

import type { Guia } from '../../compartido/tipos'
import {
  type Estado,
  type IdSeccion,
  NOMBRE_ESTADO,
  type ProyectoVista,
  type Seccion,
  type Vista,
} from '../../compartido/tipos'
import { type LecturaMetadatos, rutaIconoSegura } from './metadatos'

/** Una carpeta encontrada en la raíz, con lo que se leyó de su `.proyecto.json` (null = no tiene). */
export interface CarpetaProyecto {
  nombre: string
  ruta: string
  metadatos: LecturaMetadatos | null
  /** Lo leído de `docs/estado.md`; null si no existe. */
  guia: Guia | null
  /** Fecha (ms) de la última actividad, si ya se calculó. */
  ultimaActividad: number | null
}

/** Las carpetas que empiezan con "." no son proyectos (historia 2). */
export function esCarpetaDeProyecto(nombre: string): boolean {
  return nombre.length > 0 && !nombre.startsWith('.')
}

/** Ruta comparable en Windows: sin distinguir mayúsculas, barras unificadas y sin barra final. */
export function normalizarRuta(ruta: string): string {
  return ruta.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()
}

export function esMismaRuta(a: string, b: string | undefined): boolean {
  return b !== undefined && normalizarRuta(a) === normalizarRuta(b)
}

export function inicialDe(nombre: string): string {
  const letra = nombre.trim().match(/\p{L}|\p{N}/u)?.[0]
  return letra ? letra.toLocaleUpperCase('es') : '?'
}

/**
 * Secciones en el orden de 04-ux.md (con Idea después de Pausado, D-017).
 * Las abiertas vacías no se muestran; las plegadas se muestran siempre con su cantidad.
 */
const ORDEN_SECCIONES: { id: IdSeccion; plegada: boolean }[] = [
  { id: 'sin-clasificar', plegada: false },
  { id: 'en-desarrollo', plegada: false },
  { id: 'en-uso', plegada: false },
  { id: 'pausado', plegada: false },
  { id: 'idea', plegada: false },
  { id: 'descontinuado', plegada: true },
  { id: 'en-rescate', plegada: true },
  { id: 'para-eliminar', plegada: true },
  { id: 'archivados', plegada: true },
]

function tituloDe(id: IdSeccion): string {
  if (id === 'sin-clasificar') return 'Sin clasificar'
  if (id === 'archivados') return 'Archivados'
  return NOMBRE_ESTADO[id as Estado]
}

const ordenPorNombre = new Intl.Collator('es', { sensitivity: 'base', numeric: true })

export function proyectoVista(c: CarpetaProyecto, rutaAbierta: string | undefined): ProyectoVista {
  const base: ProyectoVista = {
    nombre: c.nombre,
    ruta: c.ruta,
    inicial: inicialDe(c.nombre),
    activo: esMismaRuta(c.ruta, rutaAbierta),
    estado: null,
    descripcion: '',
    etiquetas: [],
    archivado: false,
    iconoConfigurado: null,
    icono: null,
    iconoUri: null,
    problema: null,
    guia: c.guia,
    ultimaActividad: c.ultimaActividad,
    reemplazadoPor: null,
    heredaDe: [],
  }
  if (c.metadatos === null) return base
  if (c.metadatos.tipo === 'danado') return { ...base, problema: c.metadatos.motivo }
  const m = c.metadatos.metadatos
  const icono = m.icono === null ? null : rutaIconoSegura(m.icono)
  const nombre = nombreVisible(m.otros.nombre) ?? c.nombre
  return {
    ...base,
    nombre,
    inicial: inicialDe(nombre),
    estado: m.estado,
    descripcion: m.descripcion,
    etiquetas: m.etiquetas,
    archivado: m.archivado,
    reemplazadoPor: m.estado === 'en-rescate' ? m.reemplazadoPor : null,
    iconoConfigurado: m.icono,
    icono: icono === null ? null : `${c.ruta.replace(/[\\/]+$/, '')}/${icono}`,
  }
}

/**
 * El nombre de la tarjeta, si la ficha trae uno (`"nombre"` en `.proyecto.json`): el proyecto cambia de nombre sin
 * renombrar la carpeta (Iridium sigue en «Centro de Desarrollo», D-033). Se guarda entre los campos que el formato
 * anterior no conocía, así editar la ficha no lo pierde.
 */
function nombreVisible(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null
}

/** El nombre de la carpeta: el que usa `reemplazadoPor`, aunque la tarjeta muestre otro. */
function carpetaDe(p: ProyectoVista): string {
  return (
    p.ruta
      .replace(/[\\/]+$/, '')
      .split(/[\\/]/)
      .pop() ?? p.nombre
  )
}

/** Sección a la que va un proyecto. Los datos dañados quedan con los sin clasificar: también hay que (re)clasificarlos. */
export function seccionDe(p: ProyectoVista): IdSeccion {
  if (p.estado === null) return 'sin-clasificar'
  if (p.archivado) return 'archivados'
  return p.estado
}

/** Dentro de cada sección: la actividad más reciente primero; sin fecha todavía, al final y por nombre. */
export function compararProyectos(a: ProyectoVista, b: ProyectoVista): number {
  if (a.ultimaActividad !== b.ultimaActividad) {
    if (a.ultimaActividad === null) return 1
    if (b.ultimaActividad === null) return -1
    return b.ultimaActividad - a.ultimaActividad
  }
  return ordenPorNombre.compare(a.nombre, b.nombre)
}

/** "Hereda de": cada proyecto recibe los nombres de los proyectos En rescate que apuntan a él. */
export function completarHerencia(proyectos: ProyectoVista[]): void {
  for (const p of proyectos) {
    p.heredaDe = proyectos
      .filter(
        (o) =>
          o !== p &&
          o.reemplazadoPor !== null &&
          ordenPorNombre.compare(o.reemplazadoPor, carpetaDe(p)) === 0,
      )
      .map((o) => o.nombre)
  }
}

/** Arma la vista que se manda a la pestaña. */
export function armarVista(
  raiz: string,
  carpetas: CarpetaProyecto[],
  rutaAbierta: string | undefined,
): Vista {
  const proyectos = carpetas
    .filter((c) => esCarpetaDeProyecto(c.nombre))
    .map((c) => proyectoVista(c, rutaAbierta))
    .sort(compararProyectos)
  completarHerencia(proyectos)

  const secciones: Seccion[] = []
  for (const { id, plegada } of ORDEN_SECCIONES) {
    const deLaSeccion = proyectos.filter((p) => seccionDe(p) === id)
    if (!plegada && deLaSeccion.length === 0) continue
    secciones.push({ id, titulo: tituloDe(id), plegadaPorDefecto: plegada, proyectos: deLaSeccion })
  }
  return {
    tipo: 'lista',
    raiz,
    raizAbierta: esMismaRuta(raiz, rutaAbierta),
    total: proyectos.length,
    secciones,
  }
}

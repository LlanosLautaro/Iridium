// Las secciones de la barra de íconos (05-arquitectura.md › Puntos de extensión, B-11). Sumar una sección es
// agregar su carpeta y una línea acá; las demás no se tocan. La barra cambia según dónde se esté (D-041): en el
// inicio, Proyectos, la Bandeja de entrada, Skills e Ideas; dentro de un proyecto, las suyas.
import type { ComponentType } from 'react'
import type { TarjetaProyecto } from '../../compartido/puente'
import type { SeccionProyecto } from '../estado'
import type { NombreIcono } from '../ui/Icono'
import { Ideas } from './ideas/Ideas'
import { Pendientes } from './pendientes/Pendientes'
import { Proyectos } from './proyectos/Proyectos'
import { Skills } from './skills/Skills'

export interface Seccion {
  id: 'proyectos' | 'pendientes' | 'skills' | 'ideas'
  nombre: string
  icono: NombreIcono
  /** Tecla con Ctrl (04-ux.md › Principios de interacción). */
  atajo: string
  Vista: ComponentType
}

export const SECCIONES: readonly Seccion[] = [
  {
    id: 'proyectos',
    nombre: 'Proyectos',
    icono: 'proyectos',
    atajo: '1',
    Vista: Proyectos,
  },
  {
    id: 'pendientes',
    nombre: 'Bandeja de entrada',
    icono: 'pendientes',
    atajo: '2',
    Vista: Pendientes,
  },
  // Las skills de la PC y el chat de Skills (modulos/skills/, D-068).
  {
    id: 'skills',
    nombre: 'Skills',
    icono: 'skills',
    atajo: '3',
    Vista: Skills,
  },
  // Las ideas de la carpeta Ideas con el chat general al lado (modulos/inicio/, Q-113).
  {
    id: 'ideas',
    nombre: 'Ideas',
    icono: 'ideas',
    atajo: '4',
    Vista: Ideas,
  },
]

export interface SeccionDeProyecto {
  id: SeccionProyecto
  nombre: string
  icono: NombreIcono
  /** Si está solo en algunos proyectos: cuándo sale en la barra. */
  soloSi?: (p: TarjetaProyecto) => boolean
}

/**
 * Dentro de un proyecto (D-041, D-043, Q-62; Revisión, D-046; Ideas y Skills, R-8); después se suman Diseño y Assets.
 * Skills, solo si el proyecto tiene alguna propia.
 */
export const SECCIONES_PROYECTO: readonly SeccionDeProyecto[] = [
  { id: 'pendientes', nombre: 'Bandeja de entrada', icono: 'pendientes' },
  { id: 'mapa', nombre: 'Mapa', icono: 'mapa' },
  { id: 'docs', nombre: 'Docs', icono: 'docs' },
  { id: 'ideas', nombre: 'Ideas del proyecto', icono: 'ideas' },
  { id: 'archivos', nombre: 'Archivos', icono: 'archivos' },
  { id: 'revision', nombre: 'Revisión', icono: 'revision' },
  { id: 'git', nombre: 'Git', icono: 'git' },
  { id: 'scripts', nombre: 'Scripts', icono: 'scripts' },
  { id: 'skills', nombre: 'Skills del proyecto', icono: 'skills', soloSi: (p) => p.skills > 0 },
]

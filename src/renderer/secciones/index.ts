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
  /** W-3: arriba, lo que se sigue; abajo, separado por una línea, el proyecto por dentro. */
  grupo: 'sigue' | 'dentro'
  /** Si está solo en algunos proyectos: cuándo sale en la barra. */
  soloSi?: (p: TarjetaProyecto) => boolean
}

/** Una carpeta simple (D-095, W-3) no tiene `docs/estado.md`: no hay nada que seguir, ni Mapa, ni Trabajo, ni preguntas. */
const sigue = (p: TarjetaProyecto) => p.framework !== null

/**
 * Dentro de un proyecto (W-3, D-041; Revisión, D-046; Trabajo, W-11; Skills, R-8; Diseño, DS-8), en dos grupos. Lo que se sigue y
 * Docs, solo si no es una carpeta simple; Skills, solo si el proyecto tiene alguna propia.
 */
export const SECCIONES_PROYECTO: readonly SeccionDeProyecto[] = [
  { id: 'pendientes', nombre: 'Bandeja de entrada', icono: 'pendientes', grupo: 'sigue', soloSi: sigue },
  { id: 'mapa', nombre: 'Mapa', icono: 'mapa', grupo: 'sigue', soloSi: sigue },
  { id: 'trabajo', nombre: 'Trabajo', icono: 'trabajo', grupo: 'sigue', soloSi: sigue },
  { id: 'revision', nombre: 'Revisión', icono: 'revision', grupo: 'sigue', soloSi: sigue },
  // Las maquetas de `docs/diseno/` (frente Diseño, DS-8): de mirar y decidir, como el Mapa y la Revisión.
  { id: 'diseno', nombre: 'Diseño', icono: 'diseno', grupo: 'sigue', soloSi: sigue },
  { id: 'docs', nombre: 'Docs', icono: 'docs', grupo: 'dentro', soloSi: sigue },
  { id: 'archivos', nombre: 'Archivos', icono: 'archivos', grupo: 'dentro' },
  { id: 'git', nombre: 'Git', icono: 'git', grupo: 'dentro' },
  { id: 'scripts', nombre: 'Scripts', icono: 'scripts', grupo: 'dentro' },
  {
    id: 'skills',
    nombre: 'Skills del proyecto',
    icono: 'skills',
    grupo: 'dentro',
    soloSi: (p) => p.skills > 0,
  },
]

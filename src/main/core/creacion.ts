// Copiado de la app anterior de proyectos (D-026).
// Reglas del nombre de un proyecto nuevo (D-020): sin disco ni VS Code.

/** Largo máximo del nombre: deja margen al límite de rutas de Windows dentro del proyecto. */
export const LIMITE_NOMBRE_PROYECTO = 80

const CARACTERES_PROHIBIDOS = /[<>:"/\\|?*\p{Cc}]/u
/** Nombres que Windows reserva, con o sin extensión (CON, CON.txt…). */
const RESERVADOS = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i

/**
 * Por qué el nombre no sirve para la carpeta de un proyecto nuevo; null si sirve.
 * `existentes`: nombres de lo que ya hay en la raíz (carpetas y archivos). Se compara sin mayúsculas, como Windows.
 */
export function problemaNombreProyecto(nombre: string, existentes: readonly string[]): string | null {
  const n = nombre.trim()
  if (n.length === 0) return 'Escribe un nombre.'
  if (n.length > LIMITE_NOMBRE_PROYECTO) return `Hasta ${LIMITE_NOMBRE_PROYECTO} caracteres.`
  if (CARACTERES_PROHIBIDOS.test(n)) return 'No puede tener ninguno de estos caracteres: < > : " / \\ | ? *'
  if (n.startsWith('.')) return 'No puede empezar con punto: el gestor ignora esas carpetas.'
  if (n.endsWith('.')) return 'No puede terminar en punto.'
  if (RESERVADOS.test(n)) return 'Windows reserva ese nombre.'
  const comparable = n.toLocaleLowerCase('es')
  if (existentes.some((e) => e.toLocaleLowerCase('es') === comparable))
    return 'Ya hay una carpeta con ese nombre.'
  return null
}

/** Las plantillas del framework (`plantillas/` de la skill `iridium`) que usa un proyecto nuevo. */
export const PLANTILLAS_PROYECTO_NUEVO = [
  'instrucciones-ia.md',
  'README-docs.md',
  'estado.md',
  'trabajo.md',
  'decisiones.md',
  'perfil-proyecto.md',
  'scripts.md',
] as const

export type PlantillasProyectoNuevo = Record<(typeof PLANTILLAS_PROYECTO_NUEVO)[number], string>

/** Un archivo del proyecto nuevo: la ruta relativa a su carpeta (con `/`) y el texto. */
export interface ArchivoNuevo {
  ruta: string
  texto: string
}

/** La fecha local como AAAA-MM-DD. */
export function fechaDelDia(d: Date): string {
  const dos = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`
}

/** Corta el texto en la primera línea que empieza con `inicio` (sin ella); si no está, lo deja entero. */
function hasta(texto: string, inicio: string): string {
  const lineas = texto.split('\n')
  const i = lineas.findIndex((l) => l.startsWith(inicio))
  return i < 0 ? texto : `${lineas.slice(0, i).join('\n').trimEnd()}\n`
}

/**
 * La plantilla básica de un proyecto nuevo (R-14, D-101): lo que Iridium escribe al crearlo, sin la IA. Las plantillas
 * del framework con el nombre, la fecha y el hito 0 en curso, y la ficha en `idea`. La idea, la descripción y el ícono
 * se hacen después, conversando.
 */
export function plantillaProyectoNuevo(
  nombre: string,
  fecha: string,
  p: PlantillasProyectoNuevo,
): ArchivoNuevo[] {
  const de = (archivo: keyof PlantillasProyectoNuevo) => p[archivo].replace(/\r\n/g, '\n')
  const claude = de('instrucciones-ia.md')
    .replace(/^> Guardar en la raíz.*\n\n/m, '')
    .replace('[una frase de `00-idea.md`]', '(todavía sin escribir: sale de `docs/00-idea.md`)')
  const estado = de('estado.md')
    .replace('[nombre]', nombre)
    .replaceAll('AAAA-MM-DD', fecha)
    .replace('[N] — [Nombre] — en curso', '0 — Idea cruda — en curso')
    .replace('| 0 | Idea cruda | pendiente |', '| 0 | Idea cruda | en curso |')
    .replace(
      /^\[Hasta cinco líneas.*$/m,
      'Proyecto recién creado con la plantilla básica: todavía no tiene la idea escrita.',
    )
    .replace(/^\[Una acción concreta.*$/m, 'Hito 0: escribir la idea cruda con lo que cuente el usuario.')
    .replace(/^\*\*Leer antes:\*\* \[.*$/m, '**Leer antes:** nada todavía.')
  const ficha = {
    version: 1,
    descripcion: '',
    estado: 'idea',
    etiquetas: [],
    icono: null,
    archivado: false,
    reemplazadoPor: null,
  }
  return [
    { ruta: 'CLAUDE.md', texto: claude },
    { ruta: 'docs/README.md', texto: de('README-docs.md').replaceAll('AAAA-MM-DD', fecha) },
    { ruta: 'docs/estado.md', texto: estado },
    { ruta: 'docs/trabajo.md', texto: `${hasta(de('trabajo.md'), '## T-1')}\n(nada todavía)\n` },
    { ruta: 'docs/decisiones.md', texto: hasta(de('decisiones.md'), '| D-001') },
    { ruta: 'docs/perfil-proyecto.md', texto: de('perfil-proyecto.md').replaceAll('AAAA-MM-DD', fecha) },
    {
      ruta: 'docs/scripts.md',
      texto: `${hasta(de('scripts.md'), '## ')}\n(Todavía no hay scripts: el proyecto no tiene código.)\n`,
    },
    { ruta: '.proyecto.json', texto: `${JSON.stringify(ficha, null, 2)}\n` },
  ]
}

// Las ideas de un proyecto: con framework viejo (R-8), las secciones de la guía; con framework, la sección Ideas
// (frente Ideas, D-130): cada idea es un `T-n` de `docs/trabajo.md` y la nota del usuario va en `docs/ideas/T-n.md`.
// Las sueltas del inicio (ID-I4) van igual en `sueltas.md` de la carpeta Ideas, con sus notas en `sueltas/`.
import { cp, mkdir, readdir, readFile, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type {
  EstadoDesdeIdeas,
  IdeasDeProyecto,
  IdeasProyecto,
  IdeaVista,
  NotaIdea,
  ResultadoIdea,
} from '../../compartido/ideas'
import { diaDe, escribirNotas, type ImagenPegada } from '../../compartido/notas'
import { TIPOS_IMAGEN } from '../../compartido/visor'
import { tieneFramework } from '../core/control'
import {
  agregarIdea,
  cambiarEstado,
  cambiarTitulo,
  type IdeaNueva,
  ideasDe,
  leerAnotado,
  limpiarTitulo,
  nombreDeEnlace,
  notaConOtroCodigo,
  quitarIdea,
} from '../core/ideas'
import { SECCIONES_IDEAS, seccionDeIdeas } from '../core/ideas-proyecto'
import { leerTrabajo } from '../core/trabajo'
import { partirLineas } from '../core/visor/lineas'
import { leerSiExiste } from '../infra/documentos'
import { escribirAtomico } from '../infra/escritura'
import { cambiarConCuidado } from '../infra/trabajo'
import { esImagenEn, guardarImagenPegada, imagenesDe } from './notas'
import { type DocumentosProyecto, motivo } from './visor'

/** Las ideas sueltas de un proyecto (R-8): las secciones de la guía, pintadas como en Docs. Solo lee. */
export function ideasDelProyecto(d: DocumentosProyecto): IdeasProyecto {
  const secciones = SECCIONES_IDEAS.flatMap(({ documento, prefijo }) => {
    const texto = d.texto(documento)
    const s = texto === null ? null : seccionDeIdeas(texto, prefijo)
    if (!s) return []
    return [
      {
        documento,
        titulo: s.titulo,
        ancla: d.anclaDeTitulo(documento, s.titulo),
        html: d.html(s.cuerpo, documento),
        cantidad: s.cantidad,
      },
    ]
  })
  return { secciones }
}

// La sección Ideas: lee del disco cada vez (no del caché de Docs, que se pone al día con la vigilancia: después de
// anotar, la lista se relee enseguida). Las ideas de un proyecto están en su `docs/trabajo.md` y sus notas en
// `docs/ideas/`; las sueltas del inicio, en `sueltas.md` de la carpeta Ideas y sus notas en `sueltas/`, con el mismo
// formato (`modulos/ideas/diseno-tecnico.md` › Ideas sueltas).

/** Dónde viven unas ideas: la carpeta, el archivo con los `T-n` y la carpeta de las notas, relativos a ella. */
export interface LugarIdeas {
  carpeta: string
  archivo: string
  notas: string
  /** El título de un archivo nuevo. */
  encabezado: string
  /** Si hay que mirar que siga el framework (las sueltas no: son de Iridium). */
  framework: boolean
}

/** Como `TRABAJO` de `./trabajo` (que importa este archivo). */
const ARCHIVO_TRABAJO = 'docs/trabajo.md'
const README = 'docs/README.md'
export const CARPETA_NOTAS_IDEAS = 'docs/ideas'
export const ARCHIVO_SUELTAS = 'sueltas.md'
export const CARPETA_NOTAS_SUELTAS = 'sueltas'

export function lugarDeProyecto(carpeta: string): LugarIdeas {
  return {
    carpeta,
    archivo: ARCHIVO_TRABAJO,
    notas: CARPETA_NOTAS_IDEAS,
    encabezado: '# Trabajo',
    framework: true,
  }
}

export function lugarDeSueltas(carpeta: string): LugarIdeas {
  return {
    carpeta,
    archivo: ARCHIVO_SUELTAS,
    notas: CARPETA_NOTAS_SUELTAS,
    encabezado: '# Ideas sueltas',
    framework: false,
  }
}

/** Una carpeta sola es un proyecto. */
const lugarDe = (l: string | LugarIdeas): LugarIdeas => (typeof l === 'string' ? lugarDeProyecto(l) : l)

/** La carpeta de las notas, en el disco. */
const notasEn = (l: LugarIdeas) => join(l.carpeta, ...l.notas.split('/'))

const rutaNota = (l: LugarIdeas, codigo: string) => join(notasEn(l), `${codigo}.md`)

/** El nombre del archivo de las ideas, para los mensajes. */
const nombreArchivo = (l: LugarIdeas) => l.archivo.split('/').pop() ?? l.archivo

/** null si se puede escribir; si no, por qué no (un proyecto sin el framework no tiene `trabajo.md`). */
async function sinFramework(l: LugarIdeas): Promise<string | null> {
  if (!l.framework) return null
  return tieneFramework((await leerSiExiste(l.carpeta, README))?.texto ?? null)
    ? null
    : 'este proyecto no sigue el framework: no tiene trabajo.md'
}

export async function ideasDeProyecto(lugar: string | LugarIdeas): Promise<IdeasDeProyecto> {
  const l = lugarDe(lugar)
  try {
    if (await sinFramework(l)) return { tipo: 'sin-framework' }
    const texto = (await leerSiExiste(l.carpeta, l.archivo))?.texto ?? ''
    const nombres = await readdir(notasEn(l)).catch(() => [] as string[])
    const conNota = new Set(nombres.flatMap((n) => /^(T-\d+)\.md$/.exec(n)?.[1] ?? []))
    return { tipo: 'ok', ideas: ideasDe(leerTrabajo(texto).items, conNota) }
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

/** La idea de ese código en el texto, o por qué no está. */
function buscarIdea(l: LugarIdeas, texto: string, codigo: string): IdeaVista | string {
  return (
    ideasDe(leerTrabajo(texto).items).find((x) => x.codigo === codigo) ??
    `${codigo} ya no está entre las ideas de ${nombreArchivo(l)}`
  )
}

/** Escribe la nota (solo el cuerpo); vacía, la borra: sin nota no hay archivo. */
async function escribirNota(l: LugarIdeas, codigo: string, cuerpo: string): Promise<void> {
  const destino = rutaNota(l, codigo)
  if (!cuerpo.trim()) {
    await rm(destino, { force: true })
    return
  }
  await mkdir(dirname(destino), { recursive: true })
  await escribirAtomico(destino, `${cuerpo.trim()}\n`)
}

/** Una imagen pegada en el campo de arriba, antes de anotar (R-87). */
export interface ImagenAlAnotar {
  mime: string
  base64: string
}

/** El título de una idea que es solo imágenes, sin nada escrito (R-87). */
export const TITULO_SOLO_IMAGEN = 'Imagen pegada'

/**
 * Anotar (ID-1, ID-4) lo escrito en el campo de arriba. Una idea va al archivo con `Idea: usuario` y, si tiene más
 * líneas, su nota; un enlace solo, con `Idea: enlace`, su dirección y lo demás como descripción. Las imágenes pegadas
 * en el campo (R-87) van al final de la nota; sin nada escrito, la idea se llama «Imagen pegada». Un enlace no lleva
 * imágenes: se dice antes de anotar nada.
 */
export async function anotarIdea(
  lugar: string | LugarIdeas,
  escrito: string,
  hoy = new Date(),
  imagenes: readonly ImagenAlAnotar[] = [],
): Promise<ResultadoIdea> {
  const l = lugarDe(lugar)
  const a = leerAnotado(escrito) ?? (imagenes.length ? leerAnotado(TITULO_SOLO_IMAGEN) : null)
  if (!a) return { tipo: 'error', mensaje: 'no hay nada escrito' }
  if (a.tipo === 'idea' && !a.titulo) return { tipo: 'error', mensaje: 'la idea necesita un título' }
  if (a.tipo === 'enlace' && imagenes.length)
    return {
      tipo: 'error',
      mensaje: 'un enlace no lleva imágenes: anota el enlace solo y la imagen en una idea',
    }
  const mala = imagenes.find((i) => !TIPOS_IMAGEN[i.mime])
  if (mala)
    return {
      tipo: 'error',
      mensaje: `por ahora solo se pueden pegar imágenes (llegó ${mala.mime || 'algo sin tipo'})`,
    }
  const fecha = diaDe(hoy)
  const nueva: IdeaNueva =
    a.tipo === 'enlace'
      ? { titulo: nombreDeEnlace(a.url).nombre, de: 'enlace', fecha, enlace: a.url, texto: a.descripcion }
      : { titulo: a.titulo, de: 'usuario', fecha }
  try {
    const sin = await sinFramework(l)
    if (sin) return { tipo: 'error', mensaje: sin }
    const r = await cambiarConCuidado(l.carpeta, l.archivo, (texto) => {
      const { texto: nuevo, codigo } = agregarIdea(texto, nueva, l.encabezado)
      return { texto: nuevo, dato: codigo }
    })
    if (r.tipo === 'error') return r
    if (a.tipo !== 'idea') return { tipo: 'ok', codigo: r.dato }
    // Las imágenes, en su carpeta; las que no se pudieron guardar se dicen, con la idea ya anotada.
    const rutas: string[] = []
    const fallas: string[] = []
    for (const i of imagenes) {
      const g = await guardarImagenPegada(notasEn(l), r.dato, i.mime, i.base64, hoy)
      if (g.tipo === 'ok') rutas.push(g.ruta)
      else fallas.push(g.mensaje)
    }
    const nota = [a.nota, ...rutas.map((ruta) => escribirNotas([{ tipo: 'imagen', ruta }]).trim())]
      .filter(Boolean)
      .join('\n\n')
    if (nota) await escribirNota(l, r.dato, nota)
    if (fallas.length)
      return { tipo: 'error', mensaje: `se anotó «${a.titulo}», pero sin una imagen: ${fallas.join('; ')}` }
    return { tipo: 'ok', codigo: r.dato }
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

/** Aprobar, rechazar o volver a sin evaluar (ID-3), y marcar revisado un enlace. */
export async function cambiarEstadoIdea(
  lugar: string | LugarIdeas,
  codigo: string,
  estado: EstadoDesdeIdeas,
): Promise<ResultadoIdea> {
  const l = lugarDe(lugar)
  try {
    const sin = await sinFramework(l)
    if (sin) return { tipo: 'error', mensaje: sin }
    const r = await cambiarConCuidado(l.carpeta, l.archivo, (texto) => {
      const i = buscarIdea(l, texto, codigo)
      if (typeof i === 'string') return { error: i }
      if (estado === 'hecho' && i.de !== 'enlace')
        return { error: 'desde Ideas solo se marca revisado un enlace' }
      const nuevo = cambiarEstado(texto, codigo, estado)
      return nuevo === null
        ? { error: `${codigo} ya no está en ${nombreArchivo(l)}` }
        : { texto: nuevo, dato: codigo }
    })
    return r.tipo === 'ok' ? { tipo: 'ok', codigo } : r
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

/** La nota de una idea, sin el título (ID-2); '' si no tiene. Con sus imágenes, las de `<notas>/T-n/`. */
export async function leerNotaIdea(lugar: string | LugarIdeas, codigo: string): Promise<NotaIdea> {
  const l = lugarDe(lugar)
  try {
    const texto = ((await leerSiExiste(l.carpeta, `${l.notas}/${codigo}.md`))?.texto ?? '').trimEnd()
    const imagenes = await imagenesDe(notasEn(l), texto, (r) => esImagenEn(codigo, r))
    return { tipo: 'ok', texto, imagenes }
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

/** Una imagen pegada en una idea abierta (ID-2): `<notas>/T-n/AAAA-MM-DD-n.<ext>`, sin pisar ninguna. */
export async function pegarImagenIdea(
  lugar: string | LugarIdeas,
  codigo: string,
  mime: string,
  base64: string,
  hoy = new Date(),
): Promise<ImagenPegada> {
  const l = lugarDe(lugar)
  try {
    const sin = await sinFramework(l)
    if (sin) return { tipo: 'error', mensaje: sin }
    const i = buscarIdea(l, (await leerSiExiste(l.carpeta, l.archivo))?.texto ?? '', codigo)
    if (typeof i === 'string') return { tipo: 'error', mensaje: i }
    if (i.de !== 'usuario')
      return { tipo: 'error', mensaje: 'solo las ideas del usuario se escriben desde Ideas' }
    return await guardarImagenPegada(notasEn(l), codigo, mime, base64, hoy)
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

/**
 * Borrar (ID-8) una idea del usuario o un enlace: primero sale del archivo, después su nota y sus imágenes. Las de la
 * IA no se borran desde Ideas (se rechazan).
 */
export async function borrarIdea(lugar: string | LugarIdeas, codigo: string): Promise<ResultadoIdea> {
  const l = lugarDe(lugar)
  try {
    const sin = await sinFramework(l)
    if (sin) return { tipo: 'error', mensaje: sin }
    const r = await cambiarConCuidado(l.carpeta, l.archivo, (texto) => {
      const i = buscarIdea(l, texto, codigo)
      if (typeof i === 'string') return { error: i }
      if (i.de === 'IA') return { error: 'las ideas de la IA no se borran: se rechazan' }
      const nuevo = quitarIdea(texto, codigo)
      return nuevo === null
        ? { error: `${codigo} ya no está en ${nombreArchivo(l)}` }
        : { texto: nuevo, dato: codigo }
    })
    if (r.tipo === 'error') return r
    await rm(rutaNota(l, codigo), { force: true })
    await rm(join(notasEn(l), codigo), { recursive: true, force: true })
    return { tipo: 'ok', codigo }
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

/**
 * Guarda lo escrito en una idea abierta (ID-2): la primera línea es el título (si cambió, se cambia en el archivo) y
 * el resto, la nota. Solo las ideas del usuario se escriben desde Ideas; las de la IA, hablando con ella (ID-5).
 */
export async function guardarIdea(
  lugar: string | LugarIdeas,
  codigo: string,
  escrito: string,
): Promise<ResultadoIdea> {
  const l = lugarDe(lugar)
  const [primera = '', ...resto] = partirLineas(escrito)
  const titulo = limpiarTitulo(primera)
  if (!titulo) return { tipo: 'error', mensaje: 'la idea necesita un título en la primera línea' }
  try {
    const sin = await sinFramework(l)
    if (sin) return { tipo: 'error', mensaje: sin }
    const r = await cambiarConCuidado(l.carpeta, l.archivo, (texto) => {
      const i = buscarIdea(l, texto, codigo)
      if (typeof i === 'string') return { error: i }
      if (i.de !== 'usuario') return { error: 'solo las ideas del usuario se escriben desde Ideas' }
      if (i.titulo === titulo) return { texto, dato: codigo }
      const nuevo = cambiarTitulo(texto, codigo, titulo)
      return nuevo === null
        ? { error: `${codigo} ya no está en ${nombreArchivo(l)}` }
        : { texto: nuevo, dato: codigo }
    })
    if (r.tipo === 'error') return r
    await escribirNota(l, codigo, resto.join('\n'))
    return { tipo: 'ok', codigo }
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

/**
 * Mover a un proyecto (ID-7, `diseno-tecnico.md` › Ideas sueltas): (1) agrega la idea en el proyecto, sin evaluar y
 * con el número que le toque allá; (2) copia la nota y las imágenes a su carpeta de notas, con el número nuevo en las
 * rutas; (3) recién entonces la saca de donde estaba, con su nota y sus imágenes. Si algo falla después de (1), la idea
 * queda en los dos lados, nunca en ninguno. Devuelve el código nuevo, el del proyecto.
 */
export async function moverIdea(
  desde: string | LugarIdeas,
  codigo: string,
  hacia: string | LugarIdeas,
): Promise<ResultadoIdea> {
  const de = lugarDe(desde)
  const a = lugarDe(hacia)
  try {
    const sin = await sinFramework(a)
    if (sin) return { tipo: 'error', mensaje: sin }
    const i = buscarIdea(de, (await leerSiExiste(de.carpeta, de.archivo))?.texto ?? '', codigo)
    if (typeof i === 'string') return { tipo: 'error', mensaje: i }
    if (i.de === 'IA') return { tipo: 'error', mensaje: 'las ideas de la IA no se mueven desde Ideas' }
    const nueva: IdeaNueva = {
      titulo: i.titulo,
      de: i.de,
      fecha: i.fecha ?? diaDe(new Date()),
      ...(i.enlace ? { enlace: i.enlace } : {}),
      texto: i.texto,
    }
    const r = await cambiarConCuidado(a.carpeta, a.archivo, (texto) => {
      const { texto: nuevo, codigo: nuevoCodigo } = agregarIdea(texto, nueva, a.encabezado)
      return { texto: nuevo, dato: nuevoCodigo }
    })
    if (r.tipo === 'error') return r
    const enDosLados = (e: unknown): ResultadoIdea => ({
      tipo: 'error',
      mensaje: `quedó en los dos lados (allá es ${r.dato}): ${motivo(e)}`,
    })
    const imagenes = join(notasEn(de), codigo)
    try {
      const nota = await readFile(rutaNota(de, codigo), 'utf8').catch(() => null)
      if (nota !== null) await escribirNota(a, r.dato, notaConOtroCodigo(nota, codigo, r.dato))
      if (
        await readdir(imagenes).then(
          () => true,
          () => false,
        )
      )
        await cp(imagenes, join(notasEn(a), r.dato), { recursive: true, force: false, errorOnExist: true })
    } catch (e) {
      return enDosLados(e)
    }
    const quitada = await cambiarConCuidado(de.carpeta, de.archivo, (texto) => {
      const nuevo = quitarIdea(texto, codigo)
      return { texto: nuevo ?? texto, dato: null }
    })
    if (quitada.tipo === 'error') return enDosLados(quitada.mensaje)
    await rm(rutaNota(de, codigo), { force: true })
    await rm(imagenes, { recursive: true, force: true })
    return { tipo: 'ok', codigo: r.dato }
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

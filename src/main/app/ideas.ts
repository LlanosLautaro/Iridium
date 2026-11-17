// Las ideas de un proyecto: con framework viejo (R-8), las secciones de la guía; con framework, la sección Ideas
// (frente Ideas, D-130): cada idea es un `T-n` de `docs/trabajo.md` y la nota del usuario va en `docs/ideas/T-n.md`.
import { mkdir, readdir, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type {
  EstadoDesdeIdeas,
  IdeasDeProyecto,
  IdeasProyecto,
  IdeaVista,
  NotaIdea,
  ResultadoIdea,
} from '../../compartido/ideas'
import { diaDe, type ImagenPegada } from '../../compartido/notas'
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
// anotar, la lista se relee enseguida).

/** Como `TRABAJO` de `./trabajo` (que importa este archivo). */
const ARCHIVO_TRABAJO = 'docs/trabajo.md'
const README = 'docs/README.md'
export const CARPETA_NOTAS_IDEAS = 'docs/ideas'

/** La carpeta de las notas, en el disco. */
const notasEn = (carpeta: string) => join(carpeta, ...CARPETA_NOTAS_IDEAS.split('/'))

function rutaNota(codigo: string): string {
  return `${CARPETA_NOTAS_IDEAS}/${codigo}.md`
}

/** null si sigue el framework; si no, por qué no se puede escribir. */
async function sinFramework(carpeta: string): Promise<string | null> {
  return tieneFramework((await leerSiExiste(carpeta, README))?.texto ?? null)
    ? null
    : 'este proyecto no sigue el framework: no tiene trabajo.md'
}

export async function ideasDeProyecto(carpeta: string): Promise<IdeasDeProyecto> {
  try {
    if (await sinFramework(carpeta)) return { tipo: 'sin-framework' }
    const texto = (await leerSiExiste(carpeta, ARCHIVO_TRABAJO))?.texto ?? ''
    const nombres = await readdir(notasEn(carpeta)).catch(() => [] as string[])
    const conNota = new Set(nombres.flatMap((n) => /^(T-\d+)\.md$/.exec(n)?.[1] ?? []))
    return { tipo: 'ok', ideas: ideasDe(leerTrabajo(texto).items, conNota) }
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

/** La idea de ese código en el texto, o por qué no está. */
function buscarIdea(texto: string, codigo: string): IdeaVista | string {
  return (
    ideasDe(leerTrabajo(texto).items).find((x) => x.codigo === codigo) ??
    `${codigo} ya no está entre las ideas de trabajo.md`
  )
}

/** Escribe la nota (solo el cuerpo); vacía, la borra: sin nota no hay archivo. */
async function escribirNota(carpeta: string, codigo: string, cuerpo: string): Promise<void> {
  const destino = join(carpeta, ...rutaNota(codigo).split('/'))
  if (!cuerpo.trim()) {
    await rm(destino, { force: true })
    return
  }
  await mkdir(dirname(destino), { recursive: true })
  await escribirAtomico(destino, `${cuerpo.trim()}\n`)
}

/**
 * Anotar (ID-1, ID-4) lo escrito en el campo de arriba. Una idea va a `trabajo.md` con `Idea: usuario` y, si tiene
 * más líneas, su nota; un enlace solo, con `Idea: enlace`, su dirección y lo demás como descripción.
 */
export async function anotarIdea(carpeta: string, escrito: string, hoy = new Date()): Promise<ResultadoIdea> {
  const a = leerAnotado(escrito)
  if (!a) return { tipo: 'error', mensaje: 'no hay nada escrito' }
  if (a.tipo === 'idea' && !a.titulo) return { tipo: 'error', mensaje: 'la idea necesita un título' }
  const fecha = diaDe(hoy)
  const nueva: IdeaNueva =
    a.tipo === 'enlace'
      ? { titulo: nombreDeEnlace(a.url).nombre, de: 'enlace', fecha, enlace: a.url, texto: a.descripcion }
      : { titulo: a.titulo, de: 'usuario', fecha }
  try {
    const sin = await sinFramework(carpeta)
    if (sin) return { tipo: 'error', mensaje: sin }
    const r = await cambiarConCuidado(carpeta, ARCHIVO_TRABAJO, (texto) => {
      const { texto: nuevo, codigo } = agregarIdea(texto, nueva)
      return { texto: nuevo, dato: codigo }
    })
    if (r.tipo === 'error') return r
    if (a.tipo === 'idea' && a.nota) await escribirNota(carpeta, r.dato, a.nota)
    return { tipo: 'ok', codigo: r.dato }
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

/** Aprobar, rechazar o volver a sin evaluar (ID-3), y marcar revisado un enlace. */
export async function cambiarEstadoIdea(
  carpeta: string,
  codigo: string,
  estado: EstadoDesdeIdeas,
): Promise<ResultadoIdea> {
  try {
    const sin = await sinFramework(carpeta)
    if (sin) return { tipo: 'error', mensaje: sin }
    const r = await cambiarConCuidado(carpeta, ARCHIVO_TRABAJO, (texto) => {
      const i = buscarIdea(texto, codigo)
      if (typeof i === 'string') return { error: i }
      if (estado === 'hecho' && i.de !== 'enlace')
        return { error: 'desde Ideas solo se marca revisado un enlace' }
      const nuevo = cambiarEstado(texto, codigo, estado)
      return nuevo === null ? { error: `${codigo} ya no está en trabajo.md` } : { texto: nuevo, dato: codigo }
    })
    return r.tipo === 'ok' ? { tipo: 'ok', codigo } : r
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

/** La nota de una idea, sin el título (ID-2); '' si no tiene. Con sus imágenes, las de `docs/ideas/T-n/`. */
export async function leerNotaIdea(carpeta: string, codigo: string): Promise<NotaIdea> {
  try {
    const texto = ((await leerSiExiste(carpeta, rutaNota(codigo)))?.texto ?? '').trimEnd()
    const imagenes = await imagenesDe(notasEn(carpeta), texto, (r) => esImagenEn(codigo, r))
    return { tipo: 'ok', texto, imagenes }
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

/** Una imagen pegada en una idea abierta (ID-2): `docs/ideas/T-n/AAAA-MM-DD-n.<ext>`, sin pisar ninguna. */
export async function pegarImagenIdea(
  carpeta: string,
  codigo: string,
  mime: string,
  base64: string,
  hoy = new Date(),
): Promise<ImagenPegada> {
  try {
    const sin = await sinFramework(carpeta)
    if (sin) return { tipo: 'error', mensaje: sin }
    const i = buscarIdea((await leerSiExiste(carpeta, ARCHIVO_TRABAJO))?.texto ?? '', codigo)
    if (typeof i === 'string') return { tipo: 'error', mensaje: i }
    if (i.de !== 'usuario')
      return { tipo: 'error', mensaje: 'solo las ideas del usuario se escriben desde Ideas' }
    return await guardarImagenPegada(notasEn(carpeta), codigo, mime, base64, hoy)
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

/**
 * Borrar (ID-8) una idea del usuario o un enlace: primero sale de `trabajo.md`, después su nota y sus imágenes. Las de
 * la IA no se borran desde Ideas (se rechazan).
 */
export async function borrarIdea(carpeta: string, codigo: string): Promise<ResultadoIdea> {
  try {
    const sin = await sinFramework(carpeta)
    if (sin) return { tipo: 'error', mensaje: sin }
    const r = await cambiarConCuidado(carpeta, ARCHIVO_TRABAJO, (texto) => {
      const i = buscarIdea(texto, codigo)
      if (typeof i === 'string') return { error: i }
      if (i.de === 'IA') return { error: 'las ideas de la IA no se borran: se rechazan' }
      const nuevo = quitarIdea(texto, codigo)
      return nuevo === null ? { error: `${codigo} ya no está en trabajo.md` } : { texto: nuevo, dato: codigo }
    })
    if (r.tipo === 'error') return r
    await rm(join(carpeta, ...rutaNota(codigo).split('/')), { force: true })
    await rm(join(notasEn(carpeta), codigo), { recursive: true, force: true })
    return { tipo: 'ok', codigo }
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

/**
 * Guarda lo escrito en una idea abierta (ID-2): la primera línea es el título (si cambió, se cambia en `trabajo.md`)
 * y el resto, la nota. Solo las ideas del usuario se escriben desde Ideas; las de la IA, hablando con ella (ID-5).
 */
export async function guardarIdea(carpeta: string, codigo: string, escrito: string): Promise<ResultadoIdea> {
  const [primera = '', ...resto] = partirLineas(escrito)
  const titulo = limpiarTitulo(primera)
  if (!titulo) return { tipo: 'error', mensaje: 'la idea necesita un título en la primera línea' }
  try {
    const sin = await sinFramework(carpeta)
    if (sin) return { tipo: 'error', mensaje: sin }
    const r = await cambiarConCuidado(carpeta, ARCHIVO_TRABAJO, (texto) => {
      const i = buscarIdea(texto, codigo)
      if (typeof i === 'string') return { error: i }
      if (i.de !== 'usuario') return { error: 'solo las ideas del usuario se escriben desde Ideas' }
      if (i.titulo === titulo) return { texto, dato: codigo }
      const nuevo = cambiarTitulo(texto, codigo, titulo)
      return nuevo === null ? { error: `${codigo} ya no está en trabajo.md` } : { texto: nuevo, dato: codigo }
    })
    if (r.tipo === 'error') return r
    await escribirNota(carpeta, codigo, resto.join('\n'))
    return { tipo: 'ok', codigo }
  } catch (e) {
    return { tipo: 'error', mensaje: motivo(e) }
  }
}

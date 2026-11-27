// Caso de uso de la sección Proyectos (H-1): leer la carpeta de proyectos y armar las tarjetas de la grilla.
// Nunca escribe nada: el Centro solo lee las fichas y los `estado.md` (05-arquitectura.md › Modelo de datos).
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import type { CarpetasIridium, ListaProyectos, PreguntaNueva, TarjetaProyecto } from '../../compartido/puente'
import { queEjecuta } from '../core/abrir'
import { dondeDe } from '../core/control'
import { armarTarjeta, ordenarTarjetas } from '../core/grilla'
import { rutaIconoSegura } from '../core/metadatos'
import { novedadesDelProyecto } from '../core/novedades-framework'
import { contarPendientes, preguntasSinResponder } from '../core/pendientes'
import type { CarpetaProyecto } from '../core/proyectos'
import { CARPETA_REVISION, leerComentario } from '../core/revision/comentario'
import { fechaDelFramework, ultimaDelFramework } from '../core/skills'
import { leerScripts, RUTA_SCRIPTS } from '../core/visor/scripts'
import type { CarpetasEnDisco } from '../infra/carpeta-iridium'
import { novedadesDelFramework } from '../infra/novedades-framework'
import { leerArchivoGuia, leerArchivoMetadatos, leerCarpetas, RaizNoEncontrada } from '../infra/raiz'
import { skillsEnProyecto } from '../infra/skills'
import { leerUltimoCambio } from '../infra/ultimo-cambio'
import { controlarProyecto } from './control'

/** Un ícono más grande que esto no se manda a la ventana: se muestra la inicial. */
const LIMITE_ICONO_BYTES = 512 * 1024

const TIPOS_ICONO: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
}

async function textoSiExiste(ruta: string): Promise<string | null> {
  try {
    return await readFile(ruta, 'utf8')
  } catch {
    return null
  }
}

/** El ícono de la ficha como dirección `data:`; null si no tiene, no existe o es demasiado grande. */
async function leerIcono(c: CarpetaProyecto): Promise<string | null> {
  if (c.metadatos?.tipo !== 'ok' || c.metadatos.metadatos.icono === null) return null
  const relativa = rutaIconoSegura(c.metadatos.metadatos.icono)
  const tipo = relativa ? TIPOS_ICONO[extname(relativa).toLowerCase()] : undefined
  if (!relativa || !tipo) return null
  try {
    const datos = await readFile(join(c.ruta, relativa))
    if (datos.length > LIMITE_ICONO_BYTES) return null
    return `data:${tipo};base64,${datos.toString('base64')}`
  } catch {
    return null
  }
}

/** Los `estado.md` del proyecto (el general y los de sus módulos) y sus respuestas. */
async function leerEstadosYRespuestas(
  ruta: string,
): Promise<{ estados: string[]; respuestas: Map<string, string> }> {
  const docs = join(ruta, 'docs')
  const rutasEstado = [join(docs, 'estado.md')]
  try {
    for (const m of await readdir(join(docs, 'modulos'), { withFileTypes: true }))
      if (m.isDirectory()) rutasEstado.push(join(docs, 'modulos', m.name, 'estado.md'))
  } catch {
    // Sin módulos.
  }
  const estados = (await Promise.all(rutasEstado.map(textoSiExiste))).filter((t) => t !== null)
  const respuestas = new Map<string, string>()
  if (estados.length === 0) return { estados, respuestas }
  try {
    for (const e of await readdir(join(docs, 'respuestas'), { withFileTypes: true })) {
      const codigo = /^(Q-\d+)\.md$/i.exec(e.name)?.[1]
      if (!e.isFile() || !codigo) continue
      const texto = await textoSiExiste(join(docs, 'respuestas', e.name))
      if (texto !== null) respuestas.set(codigo.toUpperCase(), texto)
    }
  } catch {
    // Sin respuestas.
  }
  return { estados, respuestas }
}

async function leerPendientes(ruta: string): Promise<TarjetaProyecto['preguntas']> {
  const { estados, respuestas } = await leerEstadosYRespuestas(ruta)
  return contarPendientes(estados, (codigo) => respuestas.get(codigo) ?? null)
}

/** Las `Q-n` sin responder del proyecto, con su tipo y si frenan. */
export async function leerPreguntasAbiertas(ruta: string): Promise<PreguntaNueva[]> {
  const { estados, respuestas } = await leerEstadosYRespuestas(ruta)
  return preguntasSinResponder(estados, (codigo) => respuestas.get(codigo) ?? null)
}

/** Los comentarios de la Revisión abiertos (`docs/revision/R-n.md` cuyo estado no es «cerrado»). */
export async function contarRevisionAbiertos(ruta: string): Promise<number> {
  const carpeta = join(ruta, ...CARPETA_REVISION)
  let nombres: string[]
  try {
    nombres = await readdir(carpeta)
  } catch {
    return 0
  }
  let n = 0
  for (const nombre of nombres) {
    if (!/^R-\d+\.md$/i.test(nombre)) continue
    const texto = await textoSiExiste(join(carpeta, nombre))
    if (texto !== null && leerComentario(nombre, texto)?.estado === 'abierto') n++
  }
  return n
}

/**
 * Los avisos del control, que se calculan al leer la tarjeta y no se guardan (W-2), y las novedades del framework que
 * le tocan (T-64); `'viejo'` sin framework.
 */
async function leerFramework(c: CarpetaProyecto): Promise<TarjetaProyecto['framework']> {
  if (c.guia === null) return null
  const [avisos, readme, todas] = await Promise.all([
    controlarProyecto(c.ruta),
    textoSiExiste(join(c.ruta, 'docs', 'README.md')),
    novedadesDelFramework(),
  ])
  if (avisos === null) return 'viejo'
  const fecha = readme === null ? null : fechaDelFramework(readme)
  const ultima = readme === null ? null : ultimaDelFramework(readme)
  const novedades = novedadesDelProyecto(
    todas,
    fecha,
    (r) => existsSync(join(c.ruta, ...r.split('/'))),
    ultima,
  )
  return { avisos: avisos.map((a) => `${dondeDe(a)} — ${a.texto}`), novedades }
}

/** Lo que abre el proyecto (frente Abrir, AB-1): el script marcado `ejecutar` de `docs/scripts.md`, o null. */
async function leerEjecutar(ruta: string): Promise<TarjetaProyecto['ejecutar']> {
  const texto = await textoSiExiste(join(ruta, ...RUTA_SCRIPTS.split('/')))
  return texto === null ? null : queEjecuta(leerScripts(texto))
}

async function tarjetaDe(c: CarpetaProyecto): Promise<TarjetaProyecto> {
  const [icono, preguntas, revision, skills, framework, ultimoCambio, ejecutar] = await Promise.all([
    leerIcono(c),
    leerPendientes(c.ruta),
    contarRevisionAbiertos(c.ruta),
    skillsEnProyecto(c.ruta),
    leerFramework(c),
    leerUltimoCambio(c.ruta),
    leerEjecutar(c.ruta),
  ])
  return armarTarjeta({
    nombre: c.nombre,
    ruta: c.ruta,
    metadatos: c.metadatos,
    guia: c.guia,
    icono,
    preguntas,
    revision,
    skills: skills.length,
    framework,
    ultimoCambio,
    ejecutar,
  })
}

const SIN_CARPETAS: CarpetasEnDisco = { rutas: { ideas: null, skills: null }, mudanza: null }

/** La tarjeta de Ideas o de Skills (D-083), que no sale de la carpeta de proyectos. */
async function tarjetaDeCarpeta(ruta: string | null): Promise<TarjetaProyecto | null> {
  if (ruta === null) return null
  const [metadatos, guia] = await Promise.all([leerArchivoMetadatos(ruta), leerArchivoGuia(ruta)])
  return tarjetaDe({ nombre: basename(ruta), ruta, metadatos, guia, ultimaActividad: null })
}

/**
 * La grilla y las carpetas de la carpeta Iridium. Si todavía se usan las de antes (falta mudarlas), no salen en la
 * grilla: tienen su sección.
 */
export async function listarProyectos(
  raiz: string,
  carpetaIridium = '',
  enDisco: CarpetasEnDisco = SIN_CARPETAS,
): Promise<ListaProyectos> {
  const [ideas, skills] = await Promise.all([
    tarjetaDeCarpeta(enDisco.rutas.ideas),
    tarjetaDeCarpeta(enDisco.rutas.skills),
  ])
  const iridium: CarpetasIridium = { carpeta: carpetaIridium, ideas, skills, mudanza: enDisco.mudanza }
  let carpetas: CarpetaProyecto[]
  try {
    carpetas = await leerCarpetas(raiz)
  } catch (e) {
    if (e instanceof RaizNoEncontrada) return { tipo: 'error', raiz, mensaje: e.message, iridium }
    throw e
  }
  const deSeccion = new Set([enDisco.rutas.ideas, enDisco.rutas.skills])
  const tarjetas = await Promise.all(carpetas.filter((c) => !deSeccion.has(c.ruta)).map(tarjetaDe))
  return { tipo: 'lista', raiz, proyectos: ordenarTarjetas(tarjetas), iridium }
}

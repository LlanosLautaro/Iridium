// El Mapa de un proyecto (D-141, D-144, D-145; `modulos/mapa/`): en operación, el camino de pasos de cada frente (su
// ruta o, sin ella, los pasos del método), con lo aprobado sin lugar en la ruta y «Por empezar», que salen de
// `trabajo.md` al leer. Antes del hito 10 o sin frentes, los hitos como camino, con los pasos del actual (D-142).
import type {
  EstadoHito,
  EstadoPaso,
  FrenteMapa,
  MapaProyecto,
  PasoCamino,
  PreguntaMapa,
  PreguntaNueva,
} from '../../compartido/puente'
import type { PasoSolo, RevisionSola } from '../core/avance'
import { tieneFramework } from '../core/control'
import { leerGuia } from '../core/guia'
import {
  type FrenteLeido,
  frenteDeEstado,
  type HitoLeido,
  leerFrentes,
  leerHitos,
  leerIteraciones,
  leerPasosDeModulo,
  leerPorton,
  nombreDeModulo,
  type PasoLeido,
} from '../core/mapa'
import { leerRuta, listasDelMapa, origenDeFrente, type PasoRuta, textoSinCodigos } from '../core/ruta'
import { leerTrabajo } from '../core/trabajo'
import { textoPlano } from '../core/visor/lineas'
import { ordenDeDocumentos } from './documentos'
import { TRABAJO } from './trabajo'
import type { DocumentosProyecto } from './visor'

const ESTADO = 'docs/estado.md'
/** Desde este hito el Mapa son los frentes (D-142). */
const OPERACION = 10

const igual = (a: string, b: string) => a.localeCompare(b, 'es', { sensitivity: 'base' }) === 0

/** La primera pregunta sin responder que nombra un texto: el paso «Te espera» (MA-2). */
function esperaDe(texto: string, abiertas: ReadonlySet<string>): string | null {
  return [...texto.matchAll(/\bQ-\d+\b/g)].map((m) => m[0]).find((q) => abiertas.has(q)) ?? null
}

/** El documento de un hito tal como lo nombra la tabla, si existe: `04-ux.md` → `docs/04-ux.md`. */
function documentoDe(d: DocumentosProyecto, nombre: string | null): string | null {
  if (!nombre) return null
  for (const r of [`docs/${nombre}`, nombre]) if (d.existe(r)) return r
  return null
}

const MARCA_HITO: Partial<Record<EstadoHito, PasoCamino['marca']>> = {
  completo: 'hecho',
  saltado: 'descartado',
  otro: 'otro',
}
const MARCA_PASO: Partial<Record<EstadoPaso, PasoCamino['marca']>> = {
  hecho: 'hecho',
  saltado: 'descartado',
  otro: 'otro',
}

export function mapaDe(d: DocumentosProyecto, preguntas: PreguntaNueva[]): MapaProyecto {
  const estado = d.texto(ESTADO)
  if (estado === null) {
    return { tipo: 'sin-guia', documentos: ordenDeDocumentos(d.rutas()) }
  }
  // Con framework, solo el vocabulario único; con el viejo, las palabras de antes se traducen (core/estados.ts).
  const framework = tieneFramework(d.texto('docs/README.md'))
  const abiertas = new Set(preguntas.map((q) => q.codigo))
  const guia = leerGuia(estado)
  const leidos: HitoLeido[] = leerHitos(estado, framework)
  const actual = guia?.hito ?? null
  const delActual = leidos.find((h) => h.numero === actual)
  const documento = documentoDe(d, delActual?.documento ?? null)
  const { frentes, porEmpezar, nucleo } = frentesDe(d, estado, preguntas, framework)
  const conHitos = actual === null || actual < OPERACION || frentes.length === 0
  return {
    tipo: 'mapa',
    hito: actual === null ? null : { numero: actual, nombre: guia?.nombreHito ?? delActual?.nombre ?? '' },
    documento,
    hitos: conHitos ? caminoDeHitos(d, leidos, guia, abiertas, framework) : null,
    frentes,
    porEmpezar,
    nucleo,
  }
}

/** Los hitos como camino (D-142, MA-5): el actual con sus pasos (el portón o sus iteraciones) como ramas. */
function caminoDeHitos(
  d: DocumentosProyecto,
  leidos: HitoLeido[],
  guia: ReturnType<typeof leerGuia>,
  abiertas: ReadonlySet<string>,
  framework: boolean,
): PasoCamino[] {
  const actual = guia?.hito ?? null
  const detalle = [guia?.nombreHito, guia?.estadoHito].filter(Boolean).join(' — ') || null
  const hitos = [...leidos]
  // Sin la tabla (o sin el hito actual en ella), el hito actual igual está en el camino.
  if (actual !== null && !hitos.some((h) => h.numero === actual))
    hitos.push({
      numero: actual,
      nombre: guia?.nombreHito ?? `Hito ${actual}`,
      estadoTexto: 'en curso',
      estado: 'en-curso',
      documento: null,
    })
  return hitos.map((h) => {
    const documento = documentoDe(d, h.documento)
    return {
      texto: h.nombre,
      marca: MARCA_HITO[h.estado] ?? 'viene',
      espera: null,
      destino: documento ? { documento, ancla: '' } : null,
      ramas: h.numero === actual ? pasosDelHito(d, documento, detalle, abiertas, framework) : [],
    }
  })
}

function pasosDelHito(
  d: DocumentosProyecto,
  documento: string | null,
  detalle: string | null,
  abiertas: ReadonlySet<string>,
  framework: boolean,
): PasoCamino[] {
  const texto = documento ? d.texto(documento) : null
  if (!documento || !texto) return []
  const iteraciones = leerIteraciones(texto, detalle, framework)
  const leidos: PasoLeido[] = iteraciones.length > 0 ? iteraciones : leerPorton(texto)
  const porton = d.anclaDeTitulo(documento, 'Portón')
  return leidos.map((p) => {
    const nace = p.codigo ? d.dondeNace(p.codigo, documento) : null
    const ancla = nace?.ancla ?? (p.codigo ? null : porton)
    const objetivo = p.codigo ? p.texto.slice(p.codigo.length).replace(/^\s*—\s*/, '') : p.texto
    return {
      texto: textoSinCodigos(objetivo) || objetivo,
      marca: MARCA_PASO[p.estado] ?? 'viene',
      espera: esperaDe(`${p.texto} ${p.estadoTexto}`, abiertas),
      destino: nace ? { documento: nace.ruta, ancla: nace.ancla } : ancla ? { documento, ancla } : null,
      ramas: [],
    }
  })
}

/** El estado de un frente en palabras (MA-1): el de su fila de la tabla o, si la tabla no lo nombra, el de sus pasos. */
function estadoDe(fila: FrenteLeido | null, pasos: PasoCamino[]): Pick<FrenteMapa, 'estado' | 'estadoTexto'> {
  if (!fila) {
    const hechos = pasos.length > 0 && pasos.every((p) => p.marca !== 'viene')
    return { estado: hechos ? 'en uso' : 'en curso', estadoTexto: '' }
  }
  const e = fila.estado
  return {
    estado:
      e === 'en curso'
        ? 'en curso'
        : e === 'hecho'
          ? 'en uso'
          : e === 'en pausa'
            ? 'en pausa'
            : e === 'pendiente' || e === 'nueva'
              ? 'sin empezar'
              : 'otro',
    estadoTexto: fila.estadoTexto,
  }
}

/**
 * Los frentes con carpeta: las filas de la tabla «Módulos» que la tienen (la cita la fila o un módulo se llama igual)
 * y después los módulos que la tabla no nombra; el activo (el primero en curso) va primero. Las filas sin carpeta
 * que esperan van a «Por empezar».
 */
function frentesDe(
  d: DocumentosProyecto,
  estado: string,
  preguntas: PreguntaNueva[],
  framework: boolean,
): Pick<Extract<MapaProyecto, { tipo: 'mapa' }>, 'frentes' | 'porEmpezar' | 'nucleo'> {
  const abiertas = new Set(preguntas.map((q) => q.codigo))
  const modulos = d
    .rutas()
    .filter((r) => frenteDeEstado(r) !== null)
    .sort()
    .map((r) => {
      const carpeta = frenteDeEstado(r) ?? r
      const texto = d.texto(r) ?? ''
      return { ruta: r, carpeta, texto, nombre: nombreDeModulo(texto, carpeta) }
    })
  const usados = new Set<string>()
  const filas = leerFrentes(estado, framework).map((f) => {
    const m = modulos.find(
      (x) =>
        !usados.has(x.carpeta) &&
        (x.carpeta === f.carpeta || igual(x.nombre, f.nombre) || igual(x.carpeta, f.nombre)),
    )
    if (m) usados.add(m.carpeta)
    return { fila: f, modulo: m ?? null }
  })
  const conCarpeta = [
    ...filas.flatMap((x) => (x.modulo ? [{ fila: x.fila as FrenteLeido | null, modulo: x.modulo }] : [])),
    ...modulos.filter((m) => !usados.has(m.carpeta)).map((m) => ({ fila: null, modulo: m })),
  ]
  const esperan = filas
    .filter((x) => !x.modulo && (x.fila.estado === 'pendiente' || x.fila.estado === 'nueva'))
    .map((x) => ({ nombre: x.fila.nombre, trabajo: x.fila.trabajo }))
  const rutas = conCarpeta.map((x) => leerRuta(x.modulo.texto))
  const listas = listasDelMapa(
    conCarpeta.map((x, i) => ({
      nombres: [x.modulo.nombre, x.modulo.carpeta, ...(x.fila ? [x.fila.nombre] : [])],
      ruta: rutas[i] ?? null,
      origen: [...(x.fila?.trabajo ?? []), ...origenDeFrente(x.modulo.texto)],
    })),
    esperan,
    leerTrabajo(d.texto(TRABAJO) ?? '').items,
  )
  const frentes: FrenteMapa[] = conCarpeta.map((x, i) => {
    const ruta = rutas[i] ?? null
    const pasos = ruta
      ? ruta.pasos.map((p) => pasoDeRuta(d, p, x.modulo.ruta, abiertas))
      : pasosDelMetodo(d, x.modulo.texto, x.modulo.carpeta, framework)
    const sinCamino = pasos.length === 0
    const fecha = leerGuia(x.modulo.texto)?.actualizado ?? null
    return {
      clave: x.modulo.carpeta,
      nombre: x.fila?.nombre ?? x.modulo.nombre,
      ...estadoDe(x.fila, pasos),
      documento: x.modulo.ruta,
      sinRuta: ruta === null && !sinCamino,
      pasos,
      sinLugar: listas.sinLugar[i] ?? [],
      error: !sinCamino
        ? null
        : x.modulo.texto === ''
          ? `No se puede leer ${x.modulo.ruta}: está vacío o no se pudo abrir.`
          : `${x.modulo.ruta} no tiene camino: le faltan la sección «Ruta» y la tabla «Progreso».`,
      preguntas: [],
      actualizado: fecha,
    }
  })
  // Una fila que cita su carpeta y ya empezó, pero su `estado.md` no está (lo borraron o lo movieron, MA-12).
  for (const x of filas) {
    const carpeta = x.fila.carpeta
    if (x.modulo || !carpeta || x.fila.estado === 'pendiente' || x.fila.estado === 'nueva') continue
    const documento = `docs/modulos/${carpeta}/estado.md`
    frentes.push({
      clave: carpeta,
      nombre: x.fila.nombre,
      ...estadoDe(x.fila, []),
      documento,
      sinRuta: false,
      pasos: [],
      sinLugar: [],
      error: `No se encuentra ${documento}, que nombra la tabla «Módulos» de docs/estado.md.`,
      preguntas: [],
      actualizado: null,
    })
  }
  const activo = frentes.findIndex((f) => f.estado === 'en curso')
  if (activo > 0) frentes.unshift(...frentes.splice(activo, 1))
  // Cada pregunta abierta va a su frente (por el nombre de la tabla o la carpeta), o al que espera; si no, al Núcleo.
  const porEmpezar = {
    ...listas.porEmpezar,
    frentes: listas.porEmpezar.frentes.map((f) => ({ ...f, preguntas: [] as PreguntaMapa[] })),
  }
  const nucleo: PreguntaMapa[] = []
  for (const q of preguntas) {
    const p = { codigo: q.codigo, titulo: q.pregunta, tipo: q.tipo, frena: q.frena }
    const nombre = q.frente
    const destino = nombre
      ? (frentes.find((f) => igual(f.nombre, nombre) || igual(f.clave, nombre)) ??
        porEmpezar.frentes.find((f) => igual(f.nombre, nombre)))
      : undefined
    ;(destino?.preguntas ?? nucleo).push(p)
  }
  return { frentes, porEmpezar, nucleo }
}

function pasoDeRuta(
  d: DocumentosProyecto,
  p: PasoRuta,
  documento: string,
  abiertas: ReadonlySet<string>,
): PasoCamino {
  // Los códigos de iteración de un frente (`MA-I1`) no están en el índice: su sección es el título que empieza con él.
  const nace = p.iteracion ? d.dondeNace(p.iteracion, documento) : null
  const ancla = p.iteracion && !nace ? d.anclaDeCodigo(documento, p.iteracion) : null
  return {
    texto: p.texto,
    marca: p.marca,
    espera: p.preguntas.find((q) => abiertas.has(q)) ?? null,
    destino: nace ? { documento: nace.ruta, ancla: nace.ancla } : ancla ? { documento, ancla } : null,
    ...(p.tamano || p.sola ? { marcas: { tamano: p.tamano, sola: p.sola } } : {}),
    ...(p.iteracion || p.trabajo[0] ? { codigo: p.iteracion ?? p.trabajo[0] } : {}),
    ramas: p.ramas.map((r) => pasoDeRuta(d, r, documento, abiertas)),
  }
}

/** Un frente sin ruta (MA-9): los pasos del método de su tabla «Progreso», cada uno a su documento. */
function pasosDelMetodo(
  d: DocumentosProyecto,
  texto: string,
  carpeta: string,
  framework: boolean,
): PasoCamino[] {
  const base = `docs/modulos/${carpeta}`
  return leerPasosDeModulo(texto, framework).map((p) => {
    const propio = p.documento
      ? [`${base}/${p.documento}`, `docs/${p.documento}`].find((x) => d.existe(x))
      : null
    return {
      texto: textoPlano(p.texto),
      marca: MARCA_PASO[p.estado] ?? 'viene',
      espera: null,
      destino: propio ? { documento: propio, ancla: '' } : null,
      ramas: [],
    }
  })
}

/**
 * Los pasos que el avance solo puede tomar de un proyecto (Frentes, D-178 › 4, D-193): los `[ ]` marcados `sola` con
 * su tamaño (camino o rama), que no nombran una pregunta sin responder, de los frentes que no están en pausa
 * (también los hechos con algo por hacer), en el orden del Mapa (el frente en curso primero) y de la ruta; después, los `T-n` del Núcleo pendientes con
 * `Tamaño: …, sola`.
 */
export function pasosSolos(
  d: DocumentosProyecto,
  preguntas: PreguntaNueva[],
  proyecto: { ruta: string; nombre: string },
): PasoSolo[] {
  const mapa = mapaDe(d, preguntas)
  if (mapa.tipo !== 'mapa') return []
  const abiertas = new Set(preguntas.map((q) => q.codigo))
  const r: PasoSolo[] = []
  for (const f of mapa.frentes) {
    if (f.estado === 'en pausa' || f.error) continue
    const texto = d.texto(f.documento)
    const ruta = texto ? leerRuta(texto) : null
    if (!texto || !ruta) continue
    const fecha = leerGuia(texto)?.actualizado
    const actualizado = fecha ? new Date(`${fecha}T00:00:00`).getTime() : null
    const juntar = (pasos: PasoRuta[]) => {
      for (const p of pasos) {
        if (p.marca === 'viene' && p.sola && p.tamano && !p.preguntas.some((q) => abiertas.has(q)))
          r.push({
            ruta: proyecto.ruta,
            proyecto: proyecto.nombre,
            frente: f.nombre,
            carpeta: f.clave,
            texto: p.texto,
            tamano: p.tamano,
            linea: p.linea,
            enCurso: f.estado === 'en curso',
            actualizado,
          })
        juntar(p.ramas)
      }
    }
    juntar(ruta.pasos)
  }
  for (const i of nucleoAbierto(d))
    if (
      i.sola &&
      i.tamano &&
      ![...`${i.titulo} ${i.texto}`.matchAll(/\bQ-\d+\b/g)].some((m) => abiertas.has(m[0]))
    )
      r.push({
        ruta: proyecto.ruta,
        proyecto: proyecto.nombre,
        frente: 'Núcleo',
        carpeta: '',
        texto: i.titulo,
        tamano: i.tamano,
        linea: i.linea + 1,
        enCurso: false,
        actualizado: i.fecha ? new Date(`${i.fecha}T00:00:00`).getTime() : null,
        codigo: i.codigo,
      })
  return r
}

/** Los `T-n` del Núcleo (sin frente) que esperan: pendientes o en curso. */
function nucleoAbierto(d: DocumentosProyecto) {
  const texto = d.texto(TRABAJO)
  if (!texto) return []
  return leerTrabajo(texto).items.filter(
    (i) => !i.frente && (i.estado === 'pendiente' || i.estado === 'en curso'),
  )
}

/** Cuántas ideas y cuántos `T-n` del Núcleo entran en una revisión: el resto, en la del día siguiente (sigue siendo chica). */
export const POR_REVISION = 10

/** La línea con que la IA deja evaluada una idea en la revisión (D-193). */
const EVALUADA = /^\s*Evaluada el \d{4}-\d{2}-\d{2}/m

/**
 * Lo que un proyecto tiene para revisar (D-193): las ideas `nueva` sin «Evaluada el …» y los `T-n` del Núcleo que
 * esperan sin `Tamaño:` (hasta `POR_REVISION` de cada uno, los más viejos), los pasos `[ ]` sin tamaño de los frentes
 * que no están en pausa y los frentes sin terminar que no tienen nada por hacer. Lo revisado queda escrito en los
 * documentos: no se vuelve a pedir.
 */
export function revisionDe(d: DocumentosProyecto, proyecto: { ruta: string; nombre: string }): RevisionSola {
  const r: RevisionSola = {
    ruta: proyecto.ruta,
    nombre: proyecto.nombre,
    ideas: [],
    pasos: [],
    nucleo: [],
    sinPasos: [],
  }
  const trabajo = d.texto(TRABAJO)
  if (trabajo)
    r.ideas = leerTrabajo(trabajo)
      .items.filter((i) => i.estado === 'nueva' && !EVALUADA.test(i.texto))
      .map((i) => i.codigo)
      .slice(0, POR_REVISION)
  r.nucleo = nucleoAbierto(d)
    .filter((i) => !i.tamanoTexto)
    .map((i) => i.codigo)
    .slice(0, POR_REVISION)
  const mapa = mapaDe(d, [])
  if (mapa.tipo !== 'mapa') return r
  for (const f of mapa.frentes) {
    if (f.estado === 'en pausa' || f.error) continue
    const texto = d.texto(f.documento)
    const ruta = texto ? leerRuta(texto) : null
    if (!ruta) continue
    let vienen = 0
    let sinTamano = 0
    const contar = (pasos: PasoRuta[]) => {
      for (const p of pasos) {
        if (p.marca === 'viene') {
          vienen++
          if (!p.tamano) sinTamano++
        }
        contar(p.ramas)
      }
    }
    contar(ruta.pasos)
    if (sinTamano) r.pasos.push({ frente: f.nombre, cuantos: sinTamano })
    if (!vienen && f.estado !== 'en uso') r.sinPasos.push(f.nombre)
  }
  return r
}

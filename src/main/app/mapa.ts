// El Mapa de un proyecto (H-7, D-035, 04-ux.md › W-7): la línea de hitos de `estado.md` y, para cada hito, sus
// pasos con su sección; para el actual, además, el Próximo paso y lo que espera del usuario.
import type { FrenteMapa, HitoMapa, MapaProyecto, PasoMapa, PreguntaNueva } from '../../compartido/puente'
import { tieneFramework } from '../core/control'
import { leerGuia } from '../core/guia'
import {
  frenteDeEstado,
  type HitoLeido,
  leerFrentes,
  leerHitos,
  leerIteraciones,
  leerPasosDeModulo,
  leerPorton,
  nombreDeModulo,
  type PasoLeido,
  proximoPaso,
  seccionDeTitulo,
} from '../core/mapa'
import { leerTrabajo } from '../core/trabajo'
import { ordenDeDocumentos } from './documentos'
import { TRABAJO } from './trabajo'
import type { DocumentosProyecto } from './visor'

const ESTADO = 'docs/estado.md'

/** El documento de un hito tal como lo nombra la tabla, si existe: `04-ux.md` → `docs/04-ux.md`. */
function documentoDe(d: DocumentosProyecto, nombre: string | null): string | null {
  if (!nombre) return null
  for (const r of [`docs/${nombre}`, nombre]) if (d.existe(r)) return r
  return null
}

function pasosDe(
  d: DocumentosProyecto,
  documento: string | null,
  detalleActual: string | null,
  framework: boolean,
): PasoMapa[] {
  const texto = documento ? d.texto(documento) : null
  if (!documento || !texto) return []
  const iteraciones = leerIteraciones(texto, detalleActual, framework)
  const leidos: PasoLeido[] = iteraciones.length > 0 ? iteraciones : leerPorton(texto)
  const porton = d.anclaDeTitulo(documento, 'Portón')
  return leidos.map((p) => {
    const nace = p.codigo ? d.dondeNace(p.codigo, documento) : null
    const ancla = nace?.ancla ?? (p.codigo ? null : porton)
    return {
      texto: p.texto,
      estado: p.estado,
      estadoTexto: p.estadoTexto,
      destino: nace ? { documento: nace.ruta, ancla: nace.ancla } : ancla ? { documento, ancla } : null,
    }
  })
}

export function mapaDe(d: DocumentosProyecto, preguntas: PreguntaNueva[]): MapaProyecto {
  const estado = d.texto(ESTADO)
  if (estado === null) {
    return { tipo: 'sin-guia', documentos: ordenDeDocumentos(d.rutas()) }
  }
  // Con framework, solo el vocabulario único; con el viejo, las palabras de antes se traducen (core/estados.ts).
  const framework = tieneFramework(d.texto('docs/README.md'))
  const guia = leerGuia(estado)
  const actual = guia?.hito ?? null
  const detalleActual = [guia?.nombreHito, guia?.estadoHito].filter(Boolean).join(' — ') || null
  const leidos: HitoLeido[] = leerHitos(estado, framework)
  // Sin la tabla (o sin el hito actual en ella), el hito actual igual tiene su tarjeta.
  if (actual !== null && !leidos.some((h) => h.numero === actual))
    leidos.push({
      numero: actual,
      nombre: guia?.nombreHito ?? `Hito ${actual}`,
      estadoTexto: 'en curso',
      estado: 'en-curso',
      documento: null,
    })
  const hitos: HitoMapa[] = leidos.map((h) => {
    const documento = documentoDe(d, h.documento)
    return {
      numero: h.numero,
      nombre: h.nombre,
      estado: h.estado,
      estadoTexto: h.estadoTexto,
      documento,
      pasos: pasosDe(d, documento, h.numero === actual ? detalleActual : null, framework),
    }
  })
  const frentes = frentesDe(d, estado, preguntas, framework)
  const deFrente = new Set(frentes.flatMap((f) => f.preguntas.map((q) => q.codigo)))
  return {
    tipo: 'mapa',
    hitos,
    actual,
    detalleActual,
    proximoHtml: d.html(proximoPaso(estado), ESTADO),
    preguntas: preguntas.filter((q) => !deFrente.has(q.codigo)),
    frentes,
  }
}

const igual = (a: string, b: string) => a.localeCompare(b, 'es', { sensitivity: 'base' }) === 0

/**
 * Los frentes (A-5): las filas de la tabla «Módulos», cada una con su carpeta si la cita o si un módulo se llama igual,
 * y después los módulos con carpeta que la tabla no nombra, con el estado que dicen sus pasos. Cada pregunta va al
 * frente de su línea `Frente:` (OR-3) o, sin ella, al de su `estado.md` (D-063); las que no son de ninguno quedan en el
 * núcleo.
 */
function frentesDe(
  d: DocumentosProyecto,
  estado: string,
  preguntas: PreguntaNueva[],
  framework: boolean,
): FrenteMapa[] {
  const modulos = d
    .rutas()
    .filter((r) => frenteDeEstado(r) !== null)
    .sort()
    .map((r) => {
      const carpeta = frenteDeEstado(r) ?? r
      return { ruta: r, carpeta, nombre: nombreDeModulo(d.texto(r) ?? '', carpeta) }
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
  const sueltos = modulos.filter((m) => !usados.has(m.carpeta)).map((m) => ({ fila: null, modulo: m }))
  const trabajo = leerTrabajo(d.texto(TRABAJO) ?? '').items.filter((i) => i.estado === 'en curso')
  const deCarpeta = new Map(d.preguntasLeidas().map((x) => [x.pregunta.codigo, frenteDeEstado(x.documento)]))
  const todos = [...filas, ...sueltos]
  const es = (nombre: string, t: (typeof todos)[number]) =>
    igual(nombre, t.fila?.nombre ?? t.modulo?.nombre ?? '') ||
    (t.modulo !== null && (igual(nombre, t.modulo.nombre) || igual(nombre, t.modulo.carpeta)))
  const deQuien = (q: PreguntaNueva) =>
    q.frente !== null
      ? todos.find((t) => es(q.frente ?? '', t))
      : todos.find((t) => t.modulo !== null && t.modulo.carpeta === deCarpeta.get(q.codigo))
  return todos.map((t) => {
    const propias = preguntas.filter((q) => deQuien(q) === t)
    const enCurso = trabajo
      .filter((i) => i.frente !== null && es(i.frente, t))
      .map((i) => ({ codigo: i.codigo, titulo: i.titulo }))
    const base = t.modulo
      ? frenteDe(d, t.modulo.ruta, framework)
      : {
          clave: t.fila?.nombre ?? '',
          carpeta: null,
          nombre: t.fila?.nombre ?? '',
          documento: null,
          paso: null,
          pasos: [],
          iteraciones: [],
          enQueHtml: '',
          proximoHtml: '',
        }
    const f = t.fila
    return {
      ...base,
      nombre: f?.nombre ?? base.nombre,
      paso: base.paso ?? f?.paso ?? null,
      estado: f ? f.estado : estadoDePasos(base.pasos),
      estadoTexto: f?.estadoTexto ?? '',
      trabajo: enCurso,
      preguntas: propias,
    }
  })
}

/** El estado de un módulo que la tabla no nombra, por sus pasos: todos hechos, alguno en curso o sin empezar. */
function estadoDePasos(pasos: PasoMapa[]): FrenteMapa['estado'] {
  if (pasos.length === 0) return null
  if (pasos.every((p) => p.estado === 'hecho' || p.estado === 'saltado')) return 'hecho'
  if (pasos.some((p) => p.estado !== 'pendiente')) return 'en curso'
  return 'pendiente'
}

/** Un módulo con carpeta: los pasos de su tabla Progreso (cada uno a su documento), sus iteraciones y en qué está. */
function frenteDe(
  d: DocumentosProyecto,
  documento: string,
  framework: boolean,
): Omit<FrenteMapa, 'estado' | 'estadoTexto' | 'trabajo' | 'preguntas'> {
  const carpeta = frenteDeEstado(documento) ?? documento
  const texto = d.texto(documento) ?? ''
  const base = `docs/modulos/${carpeta}`
  const pasos: PasoMapa[] = leerPasosDeModulo(texto, framework).map((p) => {
    const propio = p.documento
      ? [`${base}/${p.documento}`, `docs/${p.documento}`].find((x) => d.existe(x))
      : null
    return {
      texto: p.texto,
      estado: p.estado,
      estadoTexto: p.estadoTexto,
      destino: propio ? { documento: propio, ancla: '' } : null,
    }
  })
  const iteraciones: PasoMapa[] = leerIteraciones(texto, null, framework).map((p) => {
    const nace = p.codigo ? d.dondeNace(p.codigo, documento) : null
    return {
      texto: p.texto,
      estado: p.estado,
      estadoTexto: p.estadoTexto,
      destino: nace ? { documento: nace.ruta, ancla: nace.ancla } : null,
    }
  })
  // El que está en curso; si ninguno lo dice, el primero sin hacer (A-5).
  const actual =
    pasos.find((p) => p.estado === 'en-curso') ??
    pasos.find((p) => p.estado !== 'hecho' && p.estado !== 'saltado')
  return {
    clave: carpeta,
    carpeta,
    nombre: nombreDeModulo(texto, carpeta),
    documento,
    paso: actual?.texto ?? null,
    pasos,
    iteraciones,
    enQueHtml: d.html(seccionDeTitulo(texto, 'En qué estamos ahora').join('\n').trim(), documento),
    proximoHtml: d.html(proximoPaso(texto), documento),
  }
}

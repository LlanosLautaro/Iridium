// El Mapa de un proyecto (H-7, D-035, 04-ux.md › W-7): la línea de hitos de `estado.md` y, para cada hito, sus
// pasos con su sección; para el actual, además, el Próximo paso y lo que espera del usuario.
import type { FrenteMapa, HitoMapa, MapaProyecto, PasoMapa, PreguntaNueva } from '../../compartido/puente'
import { leerGuia } from '../core/guia'
import {
  frenteDeEstado,
  type HitoLeido,
  leerHitos,
  leerIteraciones,
  leerPasosDeModulo,
  leerPorton,
  nombreDeModulo,
  type PasoLeido,
  proximoPaso,
  seccionDeTitulo,
} from '../core/mapa'
import { ordenDeDocumentos } from './documentos'
import type { DocumentosProyecto } from './visor'

const ESTADO = 'docs/estado.md'

/** El documento de un hito tal como lo nombra la tabla, si existe: `04-ux.md` → `docs/04-ux.md`. */
function documentoDe(d: DocumentosProyecto, nombre: string | null): string | null {
  if (!nombre) return null
  for (const r of [`docs/${nombre}`, nombre]) if (d.existe(r)) return r
  return null
}

function pasosDe(d: DocumentosProyecto, documento: string | null, detalleActual: string | null): PasoMapa[] {
  const texto = documento ? d.texto(documento) : null
  if (!documento || !texto) return []
  const iteraciones = leerIteraciones(texto, detalleActual)
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
  const guia = leerGuia(estado)
  const actual = guia?.hito ?? null
  const detalleActual = [guia?.nombreHito, guia?.estadoHito].filter(Boolean).join(' — ') || null
  const leidos: HitoLeido[] = leerHitos(estado)
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
      pasos: pasosDe(d, documento, h.numero === actual ? detalleActual : null),
    }
  })
  // Cada pregunta, en el frente de su `estado.md` (D-063): el núcleo muestra solo las suyas.
  const deFrente = new Map(d.preguntasLeidas().map((x) => [x.pregunta.codigo, frenteDeEstado(x.documento)]))
  const frentes = d
    .rutas()
    .filter((r) => frenteDeEstado(r) !== null)
    .sort()
    .map((r) =>
      frenteDe(
        d,
        r,
        preguntas.filter((q) => deFrente.get(q.codigo) === frenteDeEstado(r)),
      ),
    )
  return {
    tipo: 'mapa',
    hitos,
    actual,
    detalleActual,
    proximoHtml: d.html(proximoPaso(estado), ESTADO),
    preguntas: preguntas.filter((q) => (deFrente.get(q.codigo) ?? null) === null),
    frentes,
  }
}

/** Un módulo como frente: los pasos de su tabla Progreso (cada uno a su documento), sus iteraciones y su estado. */
function frenteDe(d: DocumentosProyecto, documento: string, preguntas: PreguntaNueva[]): FrenteMapa {
  const carpeta = frenteDeEstado(documento) ?? documento
  const texto = d.texto(documento) ?? ''
  const base = `docs/modulos/${carpeta}`
  const pasos: PasoMapa[] = leerPasosDeModulo(texto).map((p) => {
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
  const iteraciones: PasoMapa[] = leerIteraciones(texto, null).map((p) => {
    const nace = p.codigo ? d.dondeNace(p.codigo, documento) : null
    return {
      texto: p.texto,
      estado: p.estado,
      estadoTexto: p.estadoTexto,
      destino: nace ? { documento: nace.ruta, ancla: nace.ancla } : null,
    }
  })
  const actual = pasos.find((p) => p.estado !== 'hecho' && p.estado !== 'saltado')
  return {
    carpeta,
    nombre: nombreDeModulo(texto, carpeta),
    documento,
    paso: actual?.texto ?? null,
    pasos,
    iteraciones,
    enQueHtml: d.html(seccionDeTitulo(texto, 'En qué estamos ahora').join('\n').trim(), documento),
    proximoHtml: d.html(proximoPaso(texto), documento),
    preguntas,
  }
}

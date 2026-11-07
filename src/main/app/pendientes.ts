// Casos de uso de Pendientes (I-3, H-9, H-10, H-11, F-3): los pendientes de un proyecto con lo que citan, responder
// en `docs/respuestas/Q-n.md` y guardar a medias. Los documentos de cada proyecto quedan en memoria (lectores del
// Gestor, D-026): en cada pedido solo se releen los que cambiaron en el disco.
import type {
  CitaVista,
  PedidoResponder,
  PendientesProyecto,
  PendienteVista,
  ResultadoResponder,
} from '../../compartido/puente'
import { type Borrador, borradorVacio, POSTERGADA, tieneAlgo } from '../../compartido/respuestas'
import type { ContenidoDocumento } from '../../compartido/visor'
import { frenteDeEstado, nombreDeModulo } from '../core/mapa'
import { leerTipo } from '../core/pendientes'
import { armarRespuestaDe, borradorDeRespuesta, partesDelContexto } from '../core/responder'
import { esRutaDeDocumento } from '../core/visor/documentos'
import type { PreguntaLeida } from '../core/visor/preguntas'
import { estadoDe, huellaDe, leerRespuestaDe, rutaRespuesta } from '../core/visor/respuestas'
import type { ArchivoBorradores } from '../infra/borradores'
import { escribirRespuesta, leerSiExiste } from '../infra/documentos'
import { Documentos } from './documentos'
import { type DocumentosProyecto, motivo } from './visor'

const numero = (codigo: string) => Number(codigo.slice(2))

/** Grupos de W-5, en orden: frenan, sin responder, a medias, respondidas sin procesar y en pausa. */
function grupo(p: PendienteVista): number {
  if (p.enPausa && p.estado !== 'respondida') return 4
  if (p.estado === 'respondida') return 3
  if (p.estado === 'a-medias') return 2
  return p.frena ? 0 : 1
}

export function ordenarPendientes(ps: PendienteVista[]): PendienteVista[] {
  return [...ps].sort((a, b) => grupo(a) - grupo(b) || numero(a.codigo) - numero(b.codigo))
}

export class Pendientes {
  constructor(
    private readonly borradores: ArchivoBorradores,
    private readonly ahora: () => number = Date.now,
    private readonly docs: Documentos = new Documentos(),
  ) {}

  private documentos(ruta: string): Promise<DocumentosProyecto> {
    return this.docs.de(ruta)
  }

  /** Los pendientes de un proyecto, en el orden de W-5. Las respuestas ya procesadas no están. */
  async proyecto(ruta: string): Promise<PendientesProyecto> {
    try {
      const d = await this.documentos(ruta)
      const vistas: PendienteVista[] = []
      for (const leida of d.preguntasLeidas()) {
        const v = await this.vista(ruta, d, leida)
        if (v) vistas.push(v)
      }
      return { tipo: 'ok', ruta, pendientes: ordenarPendientes(vistas) }
    } catch (e) {
      return { tipo: 'error', ruta, mensaje: `No se pudieron leer los documentos: ${motivo(e)}` }
    }
  }

  private async vista(
    ruta: string,
    d: DocumentosProyecto,
    {
      documento,
      pregunta: q,
      respuesta,
    }: { documento: string; pregunta: PreguntaLeida; respuesta: string | null },
  ): Promise<PendienteVista | null> {
    const leida = leerRespuestaDe(respuesta, q.codigo, q.pregunta)
    const estadoDisco = estadoDe(leida)
    if (estadoDisco === 'procesada') return null
    const { texto, puntos } = partesDelContexto(q.contexto)
    const datos = { codigo: q.codigo, pregunta: q.pregunta, opciones: q.opciones, puntos }
    let estado: PendienteVista['estado'] = estadoDisco === 'respondida' ? 'respondida' : 'sin-responder'
    let borrador: Borrador = borradorVacio(puntos.length)
    if (estado === 'respondida' && respuesta !== null) borrador = borradorDeRespuesta(respuesta, datos)
    else {
      const medias = await this.borradores.de(ruta, q.codigo)
      if (medias && medias.pregunta === q.pregunta) {
        estado = 'a-medias'
        borrador = ajustar(medias.borrador, puntos.length)
      }
    }
    const tipo = leerTipo(q.contexto)
    return {
      codigo: q.codigo,
      pregunta: q.pregunta,
      ...tipo,
      estado,
      contextoHtml: d.enLinea(texto, documento),
      citas: d.citas(texto, documento, q.codigo).map((c) => citaVista(d, c)),
      opciones: q.opciones,
      puntos,
      puntosHtml: puntos.map((punto) => d.enLinea(punto, documento)),
      borrador,
      huella: huellaDe(respuesta, q.pregunta),
      // El de su línea `Frente:` (OR-3); sin ella, el del `estado.md` donde está escrita (D-063).
      frente: tipo.frente ?? frenteDe(d, documento),
      postergada: estado === 'respondida' && leida?.opcion === POSTERGADA,
    }
  }

  private async pendiente(ruta: string, codigo: string): Promise<PendienteVista | null> {
    const d = await this.documentos(ruta)
    const leida = d.preguntasLeidas().find((x) => x.pregunta.codigo === codigo)
    return leida ? this.vista(ruta, d, leida) : null
  }

  /** Escribe la respuesta de forma atómica; si cambió afuera desde que se leyó, no la pisa sin `forzar`. */
  async responder(ruta: string, p: PedidoResponder): Promise<ResultadoResponder> {
    try {
      const d = await this.documentos(ruta)
      const leida = d.preguntasLeidas().find((x) => x.pregunta.codigo === p.codigo)
      if (!leida) return { tipo: 'no-esta' }
      const q = leida.pregunta
      // Se mira el disco ahora, no lo que había en memoria: alguien pudo escribirla recién.
      const disco = (await leerSiExiste(ruta, rutaRespuesta(q.codigo)))?.texto ?? null
      if (estadoDe(leerRespuestaDe(disco, q.codigo, q.pregunta)) === 'procesada') return { tipo: 'procesada' }
      if (!p.forzar && huellaDe(disco, q.pregunta) !== p.huella) {
        const actual = await this.pendiente(ruta, q.codigo)
        return actual ? { tipo: 'cambio', pendiente: actual } : { tipo: 'no-esta' }
      }
      const { puntos } = partesDelContexto(q.contexto)
      const texto = armarRespuestaDe(
        { codigo: q.codigo, pregunta: q.pregunta, opciones: q.opciones, puntos },
        ajustar(p.borrador, puntos.length),
        p.postergar === true,
      )
      await escribirRespuesta(ruta, q.codigo, texto)
      await this.borradores.quitar(ruta, q.codigo)
      const guardado = await this.pendiente(ruta, q.codigo)
      return guardado ? { tipo: 'guardado', pendiente: guardado } : { tipo: 'no-esta' }
    } catch (e) {
      return { tipo: 'error', mensaje: `No se pudo guardar respuestas/${p.codigo}.md: ${motivo(e)}` }
    }
  }

  /** Guarda el borrador fuera del proyecto (D-039). Vacío, lo borra. */
  async aMedias(ruta: string, codigo: string, borrador: Borrador): Promise<PendienteVista | null> {
    const d = await this.documentos(ruta)
    const leida = d.preguntasLeidas().find((x) => x.pregunta.codigo === codigo)
    if (!leida) return null
    if (tieneAlgo(borrador))
      await this.borradores.guardar(ruta, codigo, {
        pregunta: leida.pregunta.pregunta,
        borrador,
        guardado: this.ahora(),
      })
    else await this.borradores.quitar(ruta, codigo)
    return this.vista(ruta, d, leida)
  }

  /** Un documento entero del proyecto, para «Ver entero». */
  async documento(ruta: string, documento: string): Promise<ContenidoDocumento> {
    if (!esRutaDeDocumento(documento)) return { tipo: 'noExiste' }
    try {
      return (await this.documentos(ruta)).documento(documento, false)
    } catch (e) {
      return { tipo: 'error', mensaje: motivo(e) }
    }
  }
}

/** El nombre del módulo de un `estado.md`; null si es el del núcleo. */
function frenteDe(d: DocumentosProyecto, documento: string): string | null {
  const carpeta = frenteDeEstado(documento)
  return carpeta === null ? null : nombreDeModulo(d.texto(documento) ?? '', carpeta)
}

/** Un borrador con tantas marcas y notas como puntos tiene hoy la pregunta. */
function ajustar(b: Borrador, puntos: number): Borrador {
  return {
    ...b,
    marcas: Array.from({ length: puntos }, (_, i) => b.marcas[i] ?? false),
    notas: Array.from({ length: puntos }, (_, i) => b.notas[i] ?? ''),
  }
}

function citaVista(d: DocumentosProyecto, c: ReturnType<DocumentosProyecto['citas']>[number]): CitaVista {
  if (c.tipo !== 'seccion') return c
  const previa = d.vistaPrevia(c.ruta, c.ancla)
  if (!previa) return { tipo: 'falta', etiqueta: c.etiqueta }
  return {
    tipo: 'seccion',
    etiqueta: c.etiqueta,
    titulo: previa.titulo,
    ruta: c.ruta,
    ancla: c.ancla,
    html: previa.html,
    cortada: previa.cortada,
  }
}

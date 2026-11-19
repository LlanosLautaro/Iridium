// Copiado de la app anterior de proyectos (D-026).
// Casos de uso del Visor de documentación (diseno-tecnico.md del módulo): cargar los documentos de la carpeta
// abierta, mostrar uno, la vista previa de un código, contar las preguntas sin responder y guardar las respuestas.
// Los documentos se guardan en memoria; al cambiar algo en el disco solo se releen los archivos que cambiaron.
// Iridium suma lo que necesita Pendientes (I-3): las preguntas con su respuesta, sus citas y el contexto en línea.
import { readdir } from 'node:fs/promises'
import { join, normalize } from 'node:path'
import { tamanoLegible } from '../../compartido/tamanos'
import {
  type ContenidoDocumento,
  type ImagenRespuesta,
  LIMITE_IMAGEN_BYTES,
  type PreguntaVista,
  type RespuestaVista,
  type ResultadoGuardar,
  type ScriptVista,
  TIPOS_IMAGEN,
  type VistaPrevia,
  type VistaVisor,
} from '../../compartido/visor'
import { scriptQueArma, scriptQueEjecuta } from '../core/abrir'
import { type Cita, citasDe } from '../core/citas'
import { construirIndice, entradaPorAncla, type Indice, resolverCodigo } from '../core/visor/codigos'
import {
  armarArbol,
  documentoInicial,
  esRutaDeDocumento,
  seccionDe,
  seccionDeAncla,
} from '../core/visor/documentos'
import { type EntornoRender, renderizar, renderizarEnLinea, unir } from '../core/visor/markdown'
import { esDocumentoDeEstado, leerPreguntas, type PreguntaLeida } from '../core/visor/preguntas'
import {
  armarRespuesta,
  CARPETA_RESPUESTAS,
  esCodigoDePregunta,
  esImagenDe,
  estadoDe,
  huellaDe,
  leerRespuesta,
  leerRespuestaDe,
  OTRO,
  preguntaRespondida,
  type RespuestaLeida,
  rutaRespuesta,
  siguienteCaptura,
  tieneContenido,
} from '../core/visor/respuestas'
import {
  esDireccionWeb,
  leerScripts,
  modoDeEjecutar,
  RUTA_SCRIPTS,
  rutaConVariable,
  type ScriptLeido,
} from '../core/visor/scripts'
import {
  escribirImagenNueva,
  escribirRespuesta,
  leerDocumento,
  leerSiExiste,
  listarDocumentos,
  listarImagenes,
  tieneDocs,
  tipoDeRutaCompleta,
} from '../infra/documentos'

/**
 * Un documento más pesado que esto no se lee (hito 8, Defecto 8): pintarlo traba el proceso principal unos segundos por
 * cada 4 MB y la ventana recibe el doble en HTML. El más grande de los proyectos reales pesa 145 KB.
 */
export const LIMITE_DOCUMENTO_BYTES = 2 * 1024 * 1024

/** Convierte una ruta relativa a la carpeta en una dirección que la pestaña puede mostrar (null si no se puede). */
export type DireccionDe = (ruta: string) => string | null

/** Qué hacer con el botón de un script (D-039); lo ejecuta la extensión. */
export type PlanScript =
  | { tipo: 'terminal'; nombre: string; cwd: string; comando: string }
  | { tipo: 'sistema'; nombre: string; ruta: string; modo: 'lanzar' | 'abrir' }
  | { tipo: 'web'; nombre: string; direccion: string }
  | { tipo: 'error'; mensaje: string }

/** Qué hacer con Ejecutar Alfa (frente Abrir, AB-1, AB-2): un plan, o el programa todavía no está armado. */
export type PlanEjecutar = PlanScript | { tipo: 'sin-armar'; armar: boolean }

interface Documento {
  texto: string | null
  /** Motivo, si no se pudo leer. */
  error: string | null
  modificado: number
}

export class DocumentosProyecto {
  private docs = new Map<string, Documento>()
  private indice: Indice | null = null
  private conDocs = false
  private listaScripts: ScriptVista[] = []

  constructor(
    readonly carpeta: string,
    private readonly direccion: DireccionDe,
  ) {}

  /**
   * Lista los documentos y relee solo los nuevos o modificados. Devuelve las rutas que cambiaron
   * (nuevas, modificadas o borradas).
   */
  async cargar(): Promise<string[]> {
    const [listados, conDocs] = await Promise.all([listarDocumentos(this.carpeta), tieneDocs(this.carpeta)])
    this.conDocs = conDocs
    const cambiadas: string[] = []
    const vistas = new Set<string>()
    await Promise.all(
      listados.map(async ({ ruta, modificado, bytes }) => {
        vistas.add(ruta)
        const actual = this.docs.get(ruta)
        const grande = bytes > LIMITE_DOCUMENTO_BYTES
        if (actual && actual.modificado === modificado && (actual.error === null || grande)) return
        cambiadas.push(ruta)
        if (grande) {
          const error = `pesa ${tamanoLegible(bytes)}, es muy grande para mostrarlo en Docs. Abrilo con su programa si lo necesitás.`
          this.docs.set(ruta, { texto: null, error, modificado })
          return
        }
        try {
          this.docs.set(ruta, { texto: await leerDocumento(this.carpeta, ruta), error: null, modificado })
        } catch (e) {
          this.docs.set(ruta, { texto: null, error: motivo(e), modificado })
        }
      }),
    )
    for (const ruta of [...this.docs.keys()]) {
      if (vistas.has(ruta)) continue
      this.docs.delete(ruta)
      cambiadas.push(ruta)
    }
    if (cambiadas.length > 0 || this.indice === null) this.indice = null
    if (await this.revisarScripts()) cambiadas.push(RUTA_SCRIPTS)
    return cambiadas
  }

  // ---------- Scripts (D-039) ----------

  /** Relee los scripts y revisa si sus archivos y carpetas existen. Devuelve si algo cambió. */
  async revisarScripts(): Promise<boolean> {
    const leidos = this.scriptsLeidos()
    const nuevos = await Promise.all(leidos.map(async ({ leido, id }) => this.scriptVista(leido, id)))
    const cambio = JSON.stringify(nuevos) !== JSON.stringify(this.listaScripts)
    this.listaScripts = nuevos
    return cambio
  }

  private scriptsLeidos(): { leido: ScriptLeido; id: string }[] {
    const texto = this.docs.get(RUTA_SCRIPTS)?.texto
    if (!texto) return []
    const encabezados = this.indiceActual.encabezados.get(RUTA_SCRIPTS) ?? []
    return leerScripts(texto).map((leido) => ({
      leido,
      id: encabezados.find((e) => e.n === leido.linea)?.ancla ?? `script-${leido.linea}`,
    }))
  }

  private async scriptVista(s: ScriptLeido, id: string): Promise<ScriptVista> {
    const r = await this.resolverScript(s)
    return {
      id,
      nombre: s.nombre,
      descripcionHtml: s.descripcion ? renderizar(s.descripcion, this.entorno(RUTA_SCRIPTS, false)) : '',
      modo: r.modo,
      valor: s.valor,
      carpeta: s.carpeta,
      falta: r.falta,
    }
  }

  /** Qué hace el script y si le falta algo, mirando el disco ahora. */
  private async resolverScript(
    s: ScriptLeido,
  ): Promise<{ modo: ScriptVista['modo']; ruta: string | null; cwd: string; falta: string | null }> {
    const ruta = rutaDeScript(this.carpeta, s.valor)
    const tipo = ruta === null ? null : await tipoDeRutaCompleta(ruta)
    if (s.accion === 'abrir') {
      if (esDireccionWeb(s.valor)) return { modo: 'abrir', ruta: null, cwd: this.carpeta, falta: null }
      return { modo: 'abrir', ruta, cwd: this.carpeta, falta: tipo ? null : `No se encuentra ${s.valor}.` }
    }
    const modo = modoDeEjecutar(s.valor, tipo === 'archivo')
    if (modo === 'lanzar') return { modo, ruta, cwd: this.carpeta, falta: null }
    if (modo === 'falta')
      return { modo: 'lanzar', ruta, cwd: this.carpeta, falta: `No se encuentra ${s.valor}.` }
    if (s.carpeta === null) return { modo, ruta: null, cwd: this.carpeta, falta: null }
    const carpeta = rutaDelProyecto(s.carpeta)
    const existe =
      carpeta !== null && (await tipoDeRutaCompleta(join(this.carpeta, ...carpeta.split('/')))) === 'carpeta'
    return {
      modo,
      ruta: null,
      cwd: carpeta === null ? this.carpeta : join(this.carpeta, ...carpeta.split('/')),
      falta: existe ? null : `No se encuentra la carpeta ${s.carpeta}.`,
    }
  }

  scripts(): ScriptVista[] {
    return this.listaScripts
  }

  /** Lo que hay que hacer al tocar el botón del script `id`, revisando el disco otra vez. */
  async prepararScript(id: string): Promise<PlanScript> {
    const s = this.scriptsLeidos().find((x) => x.id === id)?.leido
    if (!s) return { tipo: 'error', mensaje: 'Ese script ya no está en docs/scripts.md.' }
    return this.planDe(s)
  }

  /** Ejecutar Alfa (AB-1): el script marcado `ejecutar`; si es un programa que todavía no existe, `sin-armar` (AB-2). */
  async prepararEjecutar(): Promise<PlanEjecutar> {
    const leidos = this.scriptsLeidos().map((x) => x.leido)
    const e = scriptQueEjecuta(leidos)
    if (!e) return { tipo: 'error', mensaje: 'El proyecto ya no marca qué ejecuta en docs/scripts.md.' }
    if (e.como === 'escritorio' && e.script.accion === 'ejecutar') {
      const r = await this.resolverScript(e.script)
      if (r.modo === 'lanzar' && r.falta) return { tipo: 'sin-armar', armar: scriptQueArma(leidos) !== null }
    }
    return this.planDe(e.script)
  }

  /** Armar ahora (AB-2): el script marcado `armar`, a la vista como un botón de Scripts. */
  async prepararArmar(): Promise<PlanScript> {
    const s = scriptQueArma(this.scriptsLeidos().map((x) => x.leido))
    if (!s) return { tipo: 'error', mensaje: 'El proyecto no marca cómo se arma en docs/scripts.md.' }
    return this.planDe(s)
  }

  private async planDe(s: ScriptLeido): Promise<PlanScript> {
    if (s.accion === 'abrir' && esDireccionWeb(s.valor))
      return { tipo: 'web', nombre: s.nombre, direccion: s.valor.trim() }
    const r = await this.resolverScript(s)
    if (r.falta) return { tipo: 'error', mensaje: r.falta }
    if (r.modo === 'comando') return { tipo: 'terminal', nombre: s.nombre, cwd: r.cwd, comando: s.valor }
    if (r.ruta === null) return { tipo: 'error', mensaje: `No se encuentra ${s.valor}.` }
    return { tipo: 'sistema', nombre: s.nombre, ruta: r.ruta, modo: r.modo }
  }

  private get indiceActual(): Indice {
    if (!this.indice) {
      const fuentes = [...this.docs.entries()]
        .filter(([, d]) => d.texto !== null)
        .map(([ruta, d]) => ({ ruta, texto: d.texto ?? '' }))
        .sort((a, b) => a.ruta.localeCompare(b.ruta, 'es', { numeric: true }))
      this.indice = construirIndice(fuentes)
    }
    return this.indice
  }

  existe(ruta: string): boolean {
    return this.docs.has(ruta)
  }

  // ---------- Docs y Mapa de Iridium (I-4) ----------

  /** Las rutas de los documentos leídos. */
  rutas(): string[] {
    return [...this.docs.keys()]
  }

  /** El texto de un documento; null si no existe o no se pudo leer. */
  texto(ruta: string): string | null {
    return this.docs.get(ruta)?.texto ?? null
  }

  /** El ancla del título de ese documento que dice `titulo` (sin distinguir mayúsculas); null si no está. */
  anclaDeTitulo(ruta: string, titulo: string): string | null {
    const t = titulo.toLowerCase()
    return this.indiceActual.encabezados.get(ruta)?.find((e) => e.texto.toLowerCase() === t)?.ancla ?? null
  }

  /** El ancla del título que empieza con un código que el índice no lleva (`### MA-I1 — La ruta`), o null. */
  anclaDeCodigo(ruta: string, codigo: string): string | null {
    const empieza = (texto: string) => texto === codigo || /^[\s—–:-]/.test(texto.slice(codigo.length))
    return (
      this.indiceActual.encabezados.get(ruta)?.find((e) => e.texto.startsWith(codigo) && empieza(e.texto))
        ?.ancla ?? null
    )
  }

  /** Un tramo de Markdown (el Próximo paso, un mensaje de la IA) con los códigos y las citas como enlaces. */
  html(texto: string, documento: string): string {
    return texto.trim() === '' ? '' : renderizar(texto, this.entorno(documento, false))
  }

  private entorno(ruta: string, preguntas: boolean): EntornoRender {
    return {
      ruta,
      indice: this.indiceActual,
      existe: (r) => this.docs.has(r),
      imagen: this.direccion,
      preguntas,
    }
  }

  vista(): VistaVisor {
    const rutas = [...this.docs.keys()]
    const inicial = documentoInicial(rutas)
    if (inicial === null) return { tipo: 'sinDocumentos', carpeta: this.carpeta }
    const { docs, raiz } = armarArbol(rutas)
    const preguntas = this.preguntas()
    return {
      tipo: 'documentos',
      nombre:
        this.carpeta
          .replace(/[\\/]+$/, '')
          .split(/[\\/]/)
          .at(-1) ?? this.carpeta,
      tieneDocs: this.conDocs,
      docs,
      raiz,
      inicial,
      preguntas,
      sinResponder: preguntas.filter((p) => p.estado === 'sin-responder').length,
      scripts: this.listaScripts,
    }
  }

  /** Las preguntas abiertas del `estado.md` general y de los módulos, con su respuesta. */
  preguntas(): PreguntaVista[] {
    const indice = this.indiceActual
    const vistas = new Set<string>()
    const r: PreguntaVista[] = []
    const estados = [...indice.preguntas.keys()].sort((a, b) =>
      a === 'docs/estado.md' ? -1 : b === 'docs/estado.md' ? 1 : a.localeCompare(b, 'es', { numeric: true }),
    )
    for (const documento of estados) {
      for (const q of indice.preguntas.get(documento) ?? []) {
        if (vistas.has(q.codigo)) continue
        vistas.add(q.codigo)
        const archivo = this.docs.get(rutaRespuesta(q.codigo))
        const leida = leerRespuestaDe(archivo?.texto ?? null, q.codigo, q.pregunta)
        r.push({
          codigo: q.codigo,
          pregunta: q.pregunta,
          contextoHtml: q.contexto ? renderizarEnLinea(q.contexto, this.entorno(documento, false)) : '',
          opciones: q.opciones,
          documento,
          modulo: /^docs\/modulos\/([^/]+)\//.exec(documento)?.[1] ?? null,
          estado: estadoDe(leida),
          respuesta: this.respuestaVista(
            archivo?.texto ?? null,
            leida,
            archivo?.modificado ?? null,
            q.pregunta,
          ),
        })
      }
    }
    return r
  }

  // ---------- Pendientes de Iridium (I-3) ----------

  /** Las preguntas abiertas, sin repetir códigos, con el `estado.md` donde nacen y su archivo de respuesta. */
  preguntasLeidas(): { documento: string; pregunta: PreguntaLeida; respuesta: string | null }[] {
    const indice = this.indiceActual
    const vistas = new Set<string>()
    const r: { documento: string; pregunta: PreguntaLeida; respuesta: string | null }[] = []
    const estados = [...indice.preguntas.keys()].sort((a, b) =>
      a === 'docs/estado.md' ? -1 : b === 'docs/estado.md' ? 1 : a.localeCompare(b, 'es', { numeric: true }),
    )
    for (const documento of estados) {
      for (const pregunta of indice.preguntas.get(documento) ?? []) {
        if (vistas.has(pregunta.codigo)) continue
        vistas.add(pregunta.codigo)
        r.push({
          documento,
          pregunta,
          respuesta: this.docs.get(rutaRespuesta(pregunta.codigo))?.texto ?? null,
        })
      }
    }
    return r
  }

  /** Lo que cita el contexto de una pregunta (D-022). */
  citas(contexto: string, documento: string, propio: string): Cita[] {
    return citasDe(contexto, {
      indice: this.indiceActual,
      existe: (r) => this.docs.has(r),
      desde: documento,
      propio,
    })
  }

  /** Un tramo en línea (el contexto de una pregunta) con los códigos y las citas como enlaces. */
  enLinea(texto: string, documento: string): string {
    return texto === '' ? '' : renderizarEnLinea(texto, this.entorno(documento, false))
  }

  private respuestaVista(
    texto: string | null,
    leida: RespuestaLeida | null,
    modificada: number | null,
    pregunta: string,
  ): RespuestaVista {
    return {
      opcion: leida?.opcion ?? null,
      texto: leida?.texto ?? '',
      imagenes: (leida?.imagenes ?? []).map((ruta) => this.imagen(ruta)),
      procesada: leida?.procesada ?? null,
      huella: huellaDe(texto, pregunta),
      modificada: leida === null ? null : modificada,
    }
  }

  private imagen(ruta: string): ImagenRespuesta {
    return { ruta, uri: this.direccion(`${CARPETA_RESPUESTAS}/${ruta}`) }
  }

  /** `tarjetas`: dejar el lugar de las tarjetas de preguntas y de scripts (Iridium muestra el texto tal cual). */
  documento(ruta: string, tarjetas = true): ContenidoDocumento {
    const d = this.docs.get(ruta)
    if (!d) return { tipo: 'noExiste' }
    if (d.texto === null) return { tipo: 'error', mensaje: d.error ?? 'Error desconocido.' }
    const entorno = this.entorno(ruta, tarjetas && esDocumentoDeEstado(ruta))
    if (tarjetas && ruta === RUTA_SCRIPTS)
      entorno.scripts = this.scriptsLeidos().map(({ leido, id }) => ({
        linea: leido.linea,
        hasta: leido.hasta,
        id,
      }))
    return { tipo: 'ok', html: renderizar(d.texto, entorno) }
  }

  /** ¿Dónde nace hoy este código, citado desde ese documento? */
  dondeNace(codigo: string, desde: string): { ruta: string; ancla: string } | null {
    const e = resolverCodigo(this.indiceActual, codigo, desde)
    return e ? { ruta: e.ruta, ancla: e.ancla } : null
  }

  /** Vista previa de una sección (la de un código o la de una cita `archivo.md › Sección`). */
  vistaPrevia(ruta: string, ancla: string): VistaPrevia | null {
    const d = this.docs.get(ruta)
    if (!d?.texto) return null
    const indice = this.indiceActual
    const entrada = entradaPorAncla(indice, ruta, ancla)
    const seccion = entrada
      ? seccionDe(d.texto, entrada, indice)
      : seccionDeAncla(d.texto, ancla, indice, ruta)
    if (!seccion) return null
    return {
      titulo: seccion.titulo,
      documento: ruta.startsWith('docs/') ? ruta.slice('docs/'.length) : ruta,
      ruta,
      ancla,
      html: seccion.markdown.trim() === '' ? '' : renderizar(seccion.markdown, this.entorno(ruta, false)),
      cortada: seccion.cortada,
    }
  }

  // ---------- Respuestas (D-030, D-033, D-035) ----------

  async guardarRespuesta(p: {
    codigo: string
    opcion: string | null
    texto: string
    imagenes: string[]
    huella: string
    forzar: boolean
  }): Promise<ResultadoGuardar> {
    if (!esCodigoDePregunta(p.codigo)) return { tipo: 'error', mensaje: `${p.codigo} no es una pregunta.` }
    if (p.opcion !== null && p.opcion !== OTRO && !/^[A-Z]$/.test(p.opcion))
      return { tipo: 'error', mensaje: 'La opción elegida no es válida.' }
    if (!p.imagenes.every((i) => esImagenDe(p.codigo, i)))
      return { tipo: 'error', mensaje: 'Una de las imágenes no es de esta respuesta.' }
    const ruta = rutaRespuesta(p.codigo)
    try {
      const disco = await leerSiExiste(this.carpeta, ruta)
      const q = this.preguntas().find((x) => x.codigo === p.codigo)
      const pregunta = q?.pregunta ?? preguntaRespondida(disco?.texto ?? '', p.codigo) ?? ''
      const opciones = q?.opciones ?? []
      // Si el archivo es de una pregunta anterior con el mismo código, la respuesta nueva lo reemplaza.
      const leida = leerRespuestaDe(disco?.texto ?? null, p.codigo, pregunta)
      const enDisco = this.respuestaVista(disco?.texto ?? null, leida, disco?.modificado ?? null, pregunta)
      if (leida?.procesada) return { tipo: 'procesada', respuesta: enDisco }
      if (!p.forzar && huellaDe(disco?.texto ?? null, pregunta) !== p.huella)
        return { tipo: 'cambio', respuesta: enDisco }

      const opcion = opciones.length > 0 ? p.opcion : null
      const nuevo = armarRespuesta({
        codigo: p.codigo,
        pregunta,
        opciones,
        opcion,
        texto: p.texto,
        imagenes: p.imagenes,
      })
      // Vacía y sin archivo (o con el de otra pregunta): no se escribe (H-5).
      if (!leida && !tieneContenido({ opcion, texto: p.texto, imagenes: p.imagenes })) {
        return { tipo: 'guardado', respuesta: enDisco }
      }
      if (disco?.texto === nuevo) return { tipo: 'guardado', respuesta: enDisco }
      const modificado = await escribirRespuesta(this.carpeta, p.codigo, nuevo)
      this.docs.set(ruta, { texto: nuevo, error: null, modificado })
      this.indice = null
      return {
        tipo: 'guardado',
        respuesta: this.respuestaVista(nuevo, leerRespuesta(nuevo, p.codigo), modificado, pregunta),
      }
    } catch (e) {
      return { tipo: 'error', mensaje: `No se pudo guardar: ${motivo(e)}` }
    }
  }

  /** Guarda una imagen pegada como `captura-<n>` en `docs/respuestas/Q-n/`, sin pisar ningún archivo. */
  async pegarImagen(
    codigo: string,
    mime: string,
    base64: string,
  ): Promise<{ ok: true; imagen: ImagenRespuesta } | { ok: false; mensaje: string }> {
    if (!esCodigoDePregunta(codigo)) return { ok: false, mensaje: `${codigo} no es una pregunta.` }
    const extension = TIPOS_IMAGEN[mime]
    if (!extension) return { ok: false, mensaje: 'Por ahora solo se pueden pegar imágenes.' }
    const datos = Buffer.from(base64, 'base64')
    if (datos.length > LIMITE_IMAGEN_BYTES)
      return { ok: false, mensaje: 'La imagen pesa más de 20 MB: no se pegó.' }
    if (datos.length === 0) return { ok: false, mensaje: 'La imagen está vacía: no se pegó.' }
    try {
      const disco = await leerSiExiste(this.carpeta, rutaRespuesta(codigo))
      const pregunta = this.preguntas().find((x) => x.codigo === codigo)?.pregunta
      const leida = disco
        ? pregunta === undefined
          ? leerRespuesta(disco.texto, codigo)
          : leerRespuestaDe(disco.texto, codigo, pregunta)
        : null
      if (leida?.procesada)
        return { ok: false, mensaje: 'La respuesta ya fue procesada: no se puede cambiar.' }
      const probados: string[] = []
      for (let intento = 0; intento < 50; intento++) {
        const nombre = siguienteCaptura(
          [...(await listarImagenes(this.carpeta, codigo)), ...probados],
          extension,
        )
        try {
          await escribirImagenNueva(this.carpeta, codigo, nombre, datos)
          return { ok: true, imagen: this.imagen(`${codigo}/${nombre}`) }
        } catch (e) {
          if ((e as NodeJS.ErrnoException).code !== 'EEXIST') throw e
          probados.push(nombre)
        }
      }
      return { ok: false, mensaje: 'No se encontró un nombre libre para la imagen.' }
    } catch (e) {
      return { ok: false, mensaje: `No se pudo guardar la imagen: ${motivo(e)}` }
    }
  }

  /** Manda una imagen de la respuesta a la papelera (se puede recuperar). */
  async quitarImagen(
    codigo: string,
    imagen: string,
    papelera: (ruta: string) => Promise<void>,
  ): Promise<void> {
    if (!esCodigoDePregunta(codigo) || !esImagenDe(codigo, imagen)) throw new Error('Imagen no válida.')
    await papelera(join(this.carpeta, ...CARPETA_RESPUESTAS.split('/'), ...imagen.split('/')))
  }
}

/**
 * La ruta completa de lo que nombra un script: del proyecto o, si empieza con una variable de Windows, fuera de él
 * (un programa instalado, D-158). null si es una ruta fija, sale de la carpeta o la variable no existe.
 */
export function rutaDeScript(
  carpeta: string,
  valor: string,
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  const conVariable = rutaConVariable(valor)
  if (conVariable) {
    const nombre = conVariable.variable.toLowerCase()
    const base = Object.entries(env).find(([k, v]) => k.toLowerCase() === nombre && v)?.[1]
    if (!base) return null
    return normalize(join(base, ...conVariable.resto.split(/[\\/]/).filter((p) => p !== '')))
  }
  const rel = rutaDelProyecto(valor)
  return rel === null ? null : join(carpeta, ...rel.split('/'))
}

/** Ruta de un script, relativa a la raíz del proyecto (acepta `\`); null si es absoluta o sale de la carpeta. */
export function rutaDelProyecto(valor: string): string | null {
  const v = valor.trim()
  if (v === '' || /^([a-z]:|[\\/])/i.test(v)) return null
  return unir('', v)
}

/** Ruta de un documento que pide la pestaña: tiene que ser un `.md` de la carpeta. */
export function rutaDeDocumentoValida(ruta: string): boolean {
  return esRutaDeDocumento(ruta)
}

/** Ruta de un archivo del proyecto (para abrirlo en el editor): relativa y sin salir de la carpeta. */
export function rutaDeArchivoValida(ruta: string): boolean {
  if (ruta.startsWith('/') || /^[a-z]:/i.test(ruta) || ruta.includes('\\')) return false
  return ruta.split('/').every((p) => p !== '' && p !== '.' && p !== '..')
}

/**
 * Cuenta las preguntas sin responder leyendo solo los `estado.md` y sus respuestas: es lo que hace la extensión
 * al arrancar, sin el visor abierto (número del botón, D-029).
 */
export async function contarSinResponder(carpeta: string): Promise<number> {
  const estados = ['docs/estado.md']
  try {
    for (const m of await readdir(join(carpeta, 'docs', 'modulos'), { withFileTypes: true }))
      if (m.isDirectory()) estados.push(`docs/modulos/${m.name}/estado.md`)
  } catch {
    // Sin módulos.
  }
  const vistas = new Set<string>()
  let sin = 0
  for (const ruta of estados) {
    const estado = await leerSiExiste(carpeta, ruta).catch(() => null)
    if (!estado) continue
    for (const q of leerPreguntas(estado.texto)) {
      if (vistas.has(q.codigo)) continue
      vistas.add(q.codigo)
      const r = await leerSiExiste(carpeta, rutaRespuesta(q.codigo)).catch(() => null)
      if (estadoDe(leerRespuestaDe(r?.texto ?? null, q.codigo, q.pregunta)) === 'sin-responder') sin++
    }
  }
  return sin
}

/** Motivo legible de un error de disco. */
export function motivo(e: unknown): string {
  const codigo = (e as NodeJS.ErrnoException)?.code
  switch (codigo) {
    case 'EBUSY':
      return 'el archivo está bloqueado por otro programa (EBUSY). Probá de nuevo en un momento.'
    case 'EACCES':
    case 'EPERM':
      return `no hay permiso para usar el archivo (${codigo}).`
    case 'EROFS':
      return 'la carpeta es de solo lectura.'
    case 'ENOSPC':
      return 'no queda espacio en el disco.'
    default:
      return e instanceof Error ? e.message : String(e)
  }
}

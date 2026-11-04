// Copiado de la app anterior de proyectos (D-026).
// Tipos del Visor de documentación, compartidos por la extensión y la pestaña (diseno-tecnico.md del módulo).

export type EstadoPregunta = 'sin-responder' | 'respondida' | 'procesada'

export interface OpcionPregunta {
  /** A, B, C… */
  letra: string
  texto: string
  recomendada: boolean
}

export interface ImagenRespuesta {
  /** Relativa a `docs/respuestas/`: `Q-7/captura-1.png`. */
  ruta: string
  /** Dirección que la pestaña puede mostrar; null si no se puede (fuera de la carpeta). */
  uri: string | null
}

export interface RespuestaVista {
  /** Letra de la opción elegida, `Otro` o null. */
  opcion: string | null
  texto: string
  imagenes: ImagenRespuesta[]
  /** Línea `> Procesada el …` que agrega la IA. */
  procesada: { fecha: string; destino: string | null } | null
  /** Huella del archivo en disco; vacía si no existe (D-033). */
  huella: string
  /** Fecha (ms) de la última modificación del archivo; null si no existe. */
  modificada: number | null
}

export interface PreguntaVista {
  /** `Q-7` */
  codigo: string
  pregunta: string
  /** Contexto convertido a HTML (con los códigos enlazados), sin el tramo `Opciones:`. */
  contextoHtml: string
  opciones: OpcionPregunta[]
  /** `estado.md` donde nace. */
  documento: string
  /** Módulo del `estado.md` (null = el general). */
  modulo: string | null
  estado: EstadoPregunta
  respuesta: RespuestaVista
}

/**
 * Un script de `docs/scripts.md` (D-039). `comando`: se corre en una terminal; `lanzar`: un archivo del proyecto que
 * se ejecuta con Windows (un instalador); `abrir`: un archivo o una carpeta que se abre con su programa.
 */
export interface ScriptVista {
  /** Ancla de su título en `docs/scripts.md`. */
  id: string
  nombre: string
  /** Descripción convertida a HTML (con los códigos enlazados). */
  descripcionHtml: string
  modo: 'comando' | 'lanzar' | 'abrir'
  /** Comando o ruta, tal cual está en el documento. */
  valor: string
  /** Carpeta donde corre el comando (relativa a la raíz); null = la raíz. */
  carpeta: string | null
  /** Si falta algo (el archivo, la carpeta), qué; se revisa otra vez al tocar el botón. */
  falta: string | null
}

export interface NodoArbol {
  tipo: 'carpeta' | 'archivo'
  nombre: string
  /** Ruta relativa a la carpeta abierta, con `/`. */
  ruta: string
  hijos: NodoArbol[]
}

export type VistaVisor =
  | { tipo: 'sinCarpeta' }
  | { tipo: 'sinDocumentos'; carpeta: string }
  | {
      tipo: 'documentos'
      /** Nombre de la carpeta abierta. */
      nombre: string
      tieneDocs: boolean
      /** Contenido de `docs/`. */
      docs: NodoArbol[]
      /** `.md` de la raíz. */
      raiz: NodoArbol[]
      /** Documento que se muestra al abrir: `docs/estado.md` → `README.md` → el primero. */
      inicial: string
      preguntas: PreguntaVista[]
      sinResponder: number
      /** Scripts de `docs/scripts.md` (D-039). */
      scripts: ScriptVista[]
    }

export type ContenidoDocumento =
  | { tipo: 'ok'; html: string }
  | { tipo: 'noExiste' }
  | { tipo: 'error'; mensaje: string }

export interface VistaPrevia {
  titulo: string
  /** Documento donde nace, para mostrar debajo del título. */
  documento: string
  ruta: string
  ancla: string
  html: string
  /** La sección sigue más allá de lo que se muestra. */
  cortada: boolean
}

export type ResultadoGuardar =
  | { tipo: 'guardado'; respuesta: RespuestaVista }
  | { tipo: 'error'; mensaje: string }
  /** La respuesta cambió fuera del visor: no se pisó. Trae la del disco. */
  | { tipo: 'cambio'; respuesta: RespuestaVista }
  | { tipo: 'procesada'; respuesta: RespuestaVista }

/** Lo que manda la extensión a la pestaña del visor. */
export type MensajeAVisor =
  | { tipo: 'vista'; vista: VistaVisor }
  | {
      tipo: 'documento'
      ruta: string
      contenido: ContenidoDocumento
      /** Sección a la que hay que bajar (al abrir). */
      ancla: string | null
      /** `abrir`: viene de un pedido de la pestaña; `actualizar`: cambió en el disco (se conserva la posición). */
      motivo: 'abrir' | 'actualizar'
    }
  | { tipo: 'vistaPrevia'; clave: string; previa: VistaPrevia | null }
  | { tipo: 'guardado'; id: number; codigo: string; resultado: ResultadoGuardar }
  | { tipo: 'imagenPegada'; id: number; codigo: string; imagen: ImagenRespuesta }
  | { tipo: 'imagenRechazada'; id: number; codigo: string; mensaje: string }
  | { tipo: 'aviso'; mensaje: string; icono?: 'info' | 'check' | 'warning' }

/** Lo que manda la pestaña del visor a la extensión: solo intenciones. */
export type MensajeDeVisor =
  | { tipo: 'listo' }
  | { tipo: 'abrirDocumento'; ruta: string; ancla: string | null; codigo: string | null }
  | { tipo: 'vistaPrevia'; clave: string; ruta: string; ancla: string }
  | { tipo: 'abrirArchivo'; ruta: string }
  | { tipo: 'abrirExterno'; url: string }
  | { tipo: 'abrirCarpeta' }
  /** Botón de un script: la extensión lo busca por su id en `docs/scripts.md` (no confía en el comando de la pestaña). */
  | { tipo: 'correrScript'; id: string }
  | {
      tipo: 'guardarRespuesta'
      id: number
      codigo: string
      opcion: string | null
      texto: string
      /** Relativas a `docs/respuestas/`. */
      imagenes: string[]
      /** Huella sobre la que se escribió (D-033). */
      huella: string
      /** Reemplazar aunque haya cambiado afuera ("Reemplazar con la mía"). */
      forzar: boolean
    }
  | { tipo: 'pegarImagen'; id: number; codigo: string; mime: string; datos: string }
  | { tipo: 'quitarImagen'; codigo: string; imagen: string }

/** Tipos de imagen que se pueden pegar y su extensión. */
export const TIPOS_IMAGEN: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
}
export const LIMITE_IMAGEN_BYTES = 20 * 1024 * 1024

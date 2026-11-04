// El puente entre la ventana y el proceso principal (05-arquitectura.md › Componentes): una lista cerrada de
// pedidos y eventos. Los tipos los ven los dos lados; lo que llega desde la ventana se valida en `main/ipc/`.

import type { ListaIdeas } from './ideas'
import type { Borrador } from './respuestas'
import type { Atrasados, ListaSkills } from './skills'
import type { Estado } from './tipos'
import type { ContenidoDocumento, OpcionPregunta, ScriptVista } from './visor'

/** Lo que la tarjeta de un proyecto necesita para dibujarse (04-ux.md › W-2). La ventana no decide nada. */
export interface TarjetaProyecto {
  nombre: string
  ruta: string
  /** Letra que se muestra cuando el proyecto no tiene ícono. */
  inicial: string
  /** null = el proyecto no tiene `.proyecto.json` (o está dañado: ver `problema`). */
  estado: Estado | null
  descripcion: string
  archivado: boolean
  /** Proyecto que lo reemplaza (solo En rescate). */
  reemplazadoPor: string | null
  /** El ícono como dirección `data:` (la ventana no lee el disco); null = sin ícono. */
  icono: string | null
  /** Si el `.proyecto.json` existe pero no se puede usar: por qué. */
  problema: string | null
  /** null = el proyecto no tiene `docs/estado.md` (o no se reconoce nada). */
  hito: { numero: number | null; nombre: string | null; proximoPaso: string | null } | null
  /** Las `Q-n` sin responder del proyecto, cuántas de ellas frenan (D-010, D-019) y las respondidas sin procesar. */
  preguntas: { sinResponder: number; frenan: number; respondidas: number }
  /** Los comentarios de la Revisión abiertos (`docs/revision/`): esperan a la IA, no al usuario. */
  revision: number
}

/** La carpeta Iridium (D-083): Ideas y Skills, aparte de la carpeta de proyectos. */
export interface CarpetasIridium {
  carpeta: string
  /** La carpeta del chat general (D-060); null si no está. */
  ideas: TarjetaProyecto | null
  /** La carpeta del chat de Skills (D-068); null si no está. */
  skills: TarjetaProyecto | null
  /**
   * Las de antes de D-083 que siguen en la carpeta de proyectos y faltan en la carpeta Iridium: se ofrece mudarlas y,
   * mientras tanto, se usan ellas. null si no hay nada para mudar.
   */
  mudanza: { ideas: string | null; skills: string | null } | null
}

export type ListaProyectos =
  | { tipo: 'lista'; raiz: string; proyectos: TarjetaProyecto[]; iridium: CarpetasIridium }
  | { tipo: 'error'; raiz: string; mensaje: string; iridium: CarpetasIridium }

/** Cómo terminó Mover (la mudanza) o Cambiar la carpeta Iridium. */
export type ResultadoMudanza =
  | { tipo: 'ok'; lista: ListaProyectos; avisos: string[] }
  | { tipo: 'cancelada' }
  | { tipo: 'error'; mensaje: string }

/** Lo que la app recuerda entre una vez y otra (05-arquitectura.md › Modelo de datos, `config.json`). */
export interface Preferencias {
  verArchivados: boolean
  /** Ancho de la conversación, a la derecha de la vista del proyecto (D-041), en píxeles. */
  anchoConversacion: number
  /** Ancho de la lista de la sección Skills (R-6), en píxeles. */
  anchoListaSkills: number
  /** Ancho de la lista de la sección Ideas (modulos/inicio/), aparte del de Skills. */
  anchoListaIdeas: number
  /** Ancho del texto en el lector de Docs (D-035, Q-51). */
  anchoHoja: AnchoHoja
  /** Los proyectos abiertos como pestañas, en orden (D-043): quedan aunque no trabajen. */
  pestanas: string[]
  /** El modelo y el esfuerzo que eligió cada proyecto (C-58), por ruta. */
  ajustesIa: Record<string, AjusteIa>
  /** El proyecto que estaba abierto al cerrar: al abrir Iridium se vuelve a él (D-060); null = el inicio. */
  abierto: string | null
  /** Los ajustes de la ventana de Ajustes (D-065, modulos/apariencia/): el tema, los nombres y el tono. */
  tema: Tema
  /** Vacío = «Vos». */
  nombreUsuario: string
  /** Vacío = «IA». */
  nombreIa: string
  /** El estilo de respuesta de Claude Code para las sesiones de Iridium (su nombre); vacío = el de Claude Code. */
  tono: string
}

/** Los temas de Iridium (D-066): el de siempre y Carbón. */
export const TEMAS = ['iridium', 'carbon'] as const
export type Tema = (typeof TEMAS)[number]

/** Lo más largo que puede ser cada texto de Ajustes. */
export const LARGO_AJUSTES = { nombreUsuario: 60, nombreIa: 40, tono: 100 } as const

/** Un estilo de respuesta de Claude Code (AJ-3): su nombre para Claude Code y una línea de qué cambia. */
export interface EstiloRespuesta {
  id: string
  /** null = uno propio sin descripción. */
  descripcion: string | null
}

/** Los estilos que ofrece Claude Code; null si no se pudieron leer (sin sesión, motor caído). */
export type EstilosRespuesta = EstiloRespuesta[] | null

/** La carpeta del chat general (D-060), dentro de la carpeta Iridium (D-083): ideas sueltas y lo que toca a varios. */
export const CARPETA_GENERAL = 'Ideas'

/**
 * La carpeta del chat de Skills (D-068), dentro de la carpeta Iridium (D-083): sus skills (`skills\<nombre>`) son las
 * propias, instaladas como enlaces en `%USERPROFILE%\.claude\skills`.
 */
export const CARPETA_SKILLS = 'Skills'

export type AnchoHoja = 'angosto' | 'normal' | 'ancho'

export const ANCHO_CONVERSACION = { minimo: 320, inicial: 440, maximo: 1400 } as const

/** La lista de Skills se arrastra de su borde derecho (R-6). */
export const ANCHO_LISTA_SKILLS = { minimo: 200, inicial: 264, maximo: 640 } as const

/** La lista de Ideas, igual que la de Skills. */
export const ANCHO_LISTA_IDEAS = ANCHO_LISTA_SKILLS

/** Los niveles de esfuerzo de Claude Code (C-58, D-045), de menos a más. */
export const ESFUERZOS = ['low', 'medium', 'high', 'xhigh', 'max'] as const
export type Esfuerzo = (typeof ESFUERZOS)[number]

/** Un modelo que ofrece la suscripción, con los esfuerzos que acepta (vacío = no se elige). */
export interface ModeloIa {
  /** El que se le pasa a Claude Code (`opus`, `sonnet`, `default`…). */
  id: string
  nombre: string
  descripcion: string
  esfuerzos: Esfuerzo[]
  /** El modelo de verdad (`claude-opus-5-5`): con él se nombra «Predeterminado» (Q-77). */
  modeloReal: string | null
  /** El esfuerzo que usa Claude Code con este modelo si no se elige otro; null si no se sabe. */
  esfuerzoPredeterminado: Esfuerzo | null
}

/** El modelo y el esfuerzo de un proyecto; null = lo que use Claude Code por defecto. */
export interface AjusteIa {
  modelo: string | null
  esfuerzo: Esfuerzo | null
}

/** Una ventana de uso de la suscripción: cuánto se usó (0 a 100) y cuándo se libera (ms). */
export interface VentanaUso {
  usado: number
  libera: number | null
  /** Se llegó al tope: no se puede usar hasta `libera`. */
  agotada: boolean
}

/** Si el ritmo de la semana alcanza hasta que se libera (R-1). Porcentajes de la semana. */
export interface RitmoSemana {
  /** Días (con decimales) hasta que se libera. */
  diasQuedan: number
  /** Lo que se usó por día hasta ahora, en promedio. */
  porDia: number
  /** Lo que se puede usar por día de acá al reinicio sin agotarla. */
  alcanzaPorDia: number
  /** El ritmo parejo: 100 / 7. */
  parejo: number
  /** Al ritmo de hasta ahora, cuándo se agotaría (ms); null si llega al reinicio. */
  agotaria: number | null
}

/** El uso de la suscripción (H-12, D-045), en la barra de estado. */
export interface UsoSuscripcion {
  cincoHoras: VentanaUso | null
  semana: VentanaUso | null
  ritmo: RitmoSemana | null
  /** Cuándo se leyó (ms). */
  leido: number
}

/** Una fila del desglose del contexto (Q-77): qué ocupa la ventana. */
export interface CategoriaContexto {
  /** El id de Claude Code (`messages`, `system_prompt`…): con él la ventana le pone nombre. */
  id: string
  /** El nombre que da Claude Code, por si el id es nuevo. */
  nombre: string
  tokens: number
  /** `usado` ocupa la ventana; `libre`, lo que queda; `reserva`, lo que Claude Code guarda para resumir. */
  clase: 'usado' | 'libre' | 'reserva'
}

/** Cuánto contexto lleva una conversación (H-12). */
export interface ContextoConversacion {
  porcentaje: number
  usados: number
  maximo: number
  /** El desglose; null si se calculó del historial (llega al terminar el próximo turno). */
  categorias: CategoriaContexto[] | null
  /** Cuánto dura la caché de la conversación (5 min o 1 h); null si no se sabe. */
  cacheMs: number | null
  /** El último pedido al modelo (ms): desde ahí corre la caché; null si no se sabe. */
  ultimoPedido: number | null
}

/** Pasado este porcentaje de contexto se marca y se sugiere Nueva (H-12). */
export const CONTEXTO_ALTO = 80

/** Una versión de Iridium armada que espera al cierre para entrar (CO-I2): `release/nueva/lista.json`. */
export interface VersionNueva {
  /** Cuándo se armó (hora local, `2026-11-01T14:05:00`). */
  fecha: string
  /** El commit armado (corto) y su primera línea. */
  commit: string
  mensaje: string
  /** Se armó con cambios sin commitear. */
  sinGuardar: boolean
  /**
   * El ayudante ya intentó ponerla y no pudo (Defecto 3, `nueva/no-entro.json`): cuándo y por qué. Sigue lista y se
   * reintenta en el próximo cierre. null = todavía no se intentó.
   */
  noEntro: { fecha: string; motivo: string } | null
}

/** Commits de Iridium que la app de uso diario todavía no tiene (CO-I6): se ofrece Armar. */
export interface SinArmar {
  /** La carpeta del código de Iridium (un proyecto más de la grilla: con su IA trabajando no se ofrece). */
  carpeta: string
  /** El último commit (corto) y su primera línea; null si ya está armado (en `main` o en la versión lista). */
  pendiente: { commit: string; mensaje: string } | null
  /** Se está armando, con Armar o con el script. */
  armando: boolean
}

/** Si Claude Code tiene sesión iniciada y usa la suscripción (05-arquitectura.md › La interfaz `Motor`, `verificar`). */
export type EstadoMotor =
  | { tipo: 'verificando' }
  | { tipo: 'listo'; suscripcion: string | null; modelos: ModeloIa[] }
  | { tipo: 'sin-sesion' }
  /** Hay una clave de API pisando la suscripción: se gastaría por uso, no con el plan. */
  | { tipo: 'clave-api'; origen: string }
  | { tipo: 'falla'; motivo: string }

/** Una `Q-n` que la IA dejó en su último turno (H-5). */
export interface PreguntaNueva {
  codigo: string
  pregunta: string
  tipo: string
  frena: boolean
}

/** El estado de la sesión de un proyecto, para su ficha (H-2). Detenida cuenta como terminada (H-14). */
export type EstadoSesion = 'trabajando' | 'terminada' | 'error'

export interface FichaSesion {
  ruta: string
  estado: EstadoSesion
  /** Las preguntas que dejó al terminar (vacío mientras trabaja). */
  preguntas: PreguntaNueva[]
  /** Por qué falló (solo en error). */
  motivo: string | null
  /** Mientras trabaja: Claude Code no llega a Claude y está reintentando (Defecto 10); se va con lo próximo que llega. */
  reintento?: ReintentoSesion | null
}

/** Un reintento de Claude Code: `intento` de `maximo`; `causa`, sin conexión o el servidor de Claude con un error. */
export interface ReintentoSesion {
  intento: number
  maximo: number
  /** Cuánto espera hasta el próximo intento. */
  esperaMs: number
  causa: 'conexion' | 'servidor'
}

/** Una línea de la conversación, ya lista para mostrar (04-ux.md › W-3). */
export type Entrada =
  | { tipo: 'usuario'; id: string; texto: string; cuando: number | null }
  /** El texto de la IA convertido de Markdown a HTML seguro (sin HTML crudo). */
  | { tipo: 'ia'; id: string; html: string; cuando: number | null }
  | { tipo: 'herramienta'; id: string; accion: string; objeto: string | null }
  | { tipo: 'aviso'; id: string; clase: 'detenida' | 'error'; texto: string }
  /**
   * Errores del motor con qué hacer (F-5): sin sesión iniciada (con Reintentar: `reintentar` es el texto que no se
   * envió, null = Seguí) o el uso agotado (`libera`: cuándo, ms).
   */
  | { tipo: 'sin-sesion'; id: string; reintentar: string | null; enviado: boolean }
  | { tipo: 'uso-agotado'; id: string; libera: number | null }
  | { tipo: 'preguntas'; id: string; preguntas: PreguntaNueva[] }

/** La conversación de un proyecto al abrirlo: la de la sesión en marcha o la última guardada (H-4). */
export interface ConversacionProyecto {
  ruta: string
  /** null = el proyecto todavía no tiene conversaciones. */
  id: string | null
  /** Dónde empezó: en Iridium o afuera (VS Code). */
  origen: 'iridium' | 'vscode' | null
  /** El título que le da Claude Code (el resumen o el primer mensaje); null si todavía no tiene. */
  titulo: string | null
  /** Última vez que se escribió, en milisegundos. */
  modificada: number | null
  /** D-027: se usó fuera de Iridium hace menos de 10 minutos (cuándo); null si no. */
  usadaAfuera: number | null
  /** Las últimas entradas; las anteriores se piden aparte. */
  entradas: Entrada[]
  /** Cuántas entradas más viejas quedan por pedir. */
  anteriores: number
  ficha: FichaSesion | null
  /** Cuánto contexto lleva; null si todavía no se sabe (se lee aparte y llega como cambio). */
  contexto: ContextoConversacion | null
}

/** Lo que cambió en la conversación de un proyecto. */
export interface CambioConversacion {
  ruta: string
  id: string | null
  /** true = la conversación empezó de cero (Nueva): `entradas` reemplaza a las que había. */
  reiniciar: boolean
  entradas: Entrada[]
  ficha: FichaSesion | null
  contexto: ContextoConversacion | null
}

/** Una conversación guardada del proyecto, para la lista de anteriores (H-17). */
export interface ConversacionAnterior {
  id: string
  titulo: string
  modificada: number
  origen: 'iridium' | 'vscode'
}

export interface PedidoSeguir {
  /** Un mensaje propio; sin texto, «Seguí con el proyecto». */
  texto?: string
  /** Empezar una conversación nueva en vez de retomar la última. */
  nueva?: boolean
}

/** Lo que cita un pendiente, con su texto ya convertido (D-022, W-5 › Contexto dentro). */
export type CitaVista =
  | {
      tipo: 'seccion'
      /** Como está citada: `D-032`, `04-ux.md › W-14`. */
      etiqueta: string
      /** El título de la sección donde nace. */
      titulo: string
      ruta: string
      ancla: string
      /** El comienzo de la sección, en HTML seguro. */
      html: string
      /** La sección sigue más allá de lo que se muestra. */
      cortada: boolean
    }
  | { tipo: 'documento'; etiqueta: string; ruta: string }
  | { tipo: 'falta'; etiqueta: string }

/** En qué está un pendiente. «A medias»: guardado sin enviar, la IA no lo ve (D-039). */
export type EstadoPendiente = 'sin-responder' | 'a-medias' | 'respondida'

/** Una `Q-n` lista para responder en Pendientes (H-9, H-10, H-11). */
export interface PendienteVista {
  codigo: string
  pregunta: string
  tipo: string
  frena: boolean
  estado: EstadoPendiente
  /** El contexto sin la línea `Tipo:`, las opciones ni los puntos, en HTML seguro con los códigos como enlaces. */
  contextoHtml: string
  citas: CitaVista[]
  opciones: OpcionPregunta[]
  /** Los puntos de una prueba o una tarea (D-019). */
  puntos: string[]
  /** Los mismos puntos en HTML seguro, con los códigos y las citas como enlaces (Q-59). */
  puntosHtml: string[]
  /** Lo que muestra el formulario: la respuesta guardada, lo guardado a medias o vacío. */
  borrador: Borrador
  /** Huella de la respuesta en el disco cuando se leyó: si cambia afuera, no se pisa sin preguntar. */
  huella: string
  /** El módulo del que es la pregunta (D-063); null si es del núcleo (`docs/estado.md`). */
  frente: string | null
  /** La respuesta guardada es «Postergada» (D-063). */
  postergada: boolean
}

export type PendientesProyecto =
  | { tipo: 'ok'; ruta: string; pendientes: PendienteVista[] }
  | { tipo: 'error'; ruta: string; mensaje: string }

export type ResultadoResponder =
  | { tipo: 'guardado'; pendiente: PendienteVista }
  /** La respuesta cambió fuera de Iridium: no se pisó. Trae la del disco. */
  | { tipo: 'cambio'; pendiente: PendienteVista }
  /** La IA ya la procesó: no se cambia. */
  | { tipo: 'procesada' }
  /** La pregunta ya no está en `estado.md`. */
  | { tipo: 'no-esta' }
  | { tipo: 'error'; mensaje: string }

export interface PedidoResponder {
  codigo: string
  borrador: Borrador
  /** La huella sobre la que se escribió. */
  huella: string
  /** Reemplazar aunque haya cambiado afuera («Reemplazar con la mía»). */
  forzar: boolean
  /** Postergar la prueba (D-063): queda aprobada provisional con lo marcado. */
  postergar?: boolean | undefined
}

/** Un lugar de un documento del proyecto: `docs/04-ux.md` en la sección `h-3` (vacío = el principio). */
export interface Destino {
  documento: string
  ancla: string
}

/** El estado de un hito con las palabras fijas de la guía (D-019); `otro` se muestra tal cual. */
export type EstadoHito =
  | 'completo'
  | 'en-curso'
  | 'pendiente'
  | 'reabierto'
  | 'saltado'
  | 'bloqueado'
  | 'otro'

/** El estado de un paso: un ítem del portón o una iteración. `espera`: espera la prueba del usuario. */
export type EstadoPaso = 'hecho' | 'en-curso' | 'espera' | 'pendiente' | 'saltado' | 'reabierto' | 'otro'

export interface PasoMapa {
  texto: string
  estado: EstadoPaso
  /** Como está escrito en el documento (vacío en el portón). */
  estadoTexto: string
  /** Su sección; null si no se encuentra. */
  destino: Destino | null
}

export interface HitoMapa {
  numero: number
  nombre: string
  estado: EstadoHito
  estadoTexto: string
  /** Su documento si existe (`docs/04-ux.md`); null si no. */
  documento: string | null
  pasos: PasoMapa[]
}

/** Un módulo del proyecto como frente (D-063, C-63): su ciclo reducido, en qué está y lo que espera del usuario. */
export interface FrenteMapa {
  /** La carpeta del módulo (`revision`): lo identifica. */
  carpeta: string
  nombre: string
  /** Su `estado.md`. */
  documento: string
  /** El paso en que está (el primero sin hacer); null si no tiene la tabla Progreso o los hizo todos. */
  paso: string | null
  pasos: PasoMapa[]
  /** Su plan de iteraciones (`R-I1`…), si tiene. */
  iteraciones: PasoMapa[]
  /** «En qué estamos ahora» y el Próximo paso, en HTML seguro. */
  enQueHtml: string
  proximoHtml: string
  /** Sus `Q-n` sin responder. */
  preguntas: PreguntaNueva[]
}

/** El Mapa de un proyecto (H-7, D-035): la línea de hitos y lo del hito actual. */
export type MapaProyecto =
  | {
      tipo: 'mapa'
      hitos: HitoMapa[]
      /** El número del hito actual; null si `estado.md` no lo dice. */
      actual: number | null
      /** La línea de «Hito actual» tal cual (lo que sigue al nombre del hito). */
      detalleActual: string | null
      /** El Próximo paso en HTML seguro, con los códigos y las citas como enlaces. */
      proximoHtml: string
      /** Lo que espera del usuario: las `Q-n` sin responder. */
      preguntas: PreguntaNueva[]
      /** Los módulos del proyecto como frentes (D-063); el núcleo es el resto del mapa. */
      frentes: FrenteMapa[]
    }
  /** Sin `docs/estado.md` (W-7: «no sigue la guía todavía»): sus documentos, si tiene. */
  | { tipo: 'sin-guia'; documentos: string[] }
  | { tipo: 'error'; mensaje: string }

/** Un archivo o una carpeta del árbol de Archivos (H-15). */
export interface NodoArchivo {
  nombre: string
  /** Relativa a la carpeta del proyecto, con `/`. */
  ruta: string
  tipo: 'carpeta' | 'archivo'
}

export type CarpetaArchivos = { tipo: 'ok'; hijos: NodoArchivo[] } | { tipo: 'error'; mensaje: string }

/** Lo que muestra el visor de Archivos: solo lectura (H-15). */
export type ContenidoArchivo =
  /** Cada línea en HTML seguro con sus colores. `documento`: un `.md` que también se abre en Docs. */
  | { tipo: 'texto'; lineas: string[]; lenguaje: string; bytes: number; documento: boolean }
  | { tipo: 'imagen'; url: string; bytes: number }
  | { tipo: 'grande'; bytes: number }
  | { tipo: 'binario'; bytes: number }
  | { tipo: 'no-existe' }
  | { tipo: 'error'; mensaje: string }

/** Qué le pasó a un archivo en un commit o en los cambios sin guardar (H-16). */
export type CambioArchivoGit = 'nuevo' | 'modificado' | 'borrado' | 'otro'

export interface ArchivoGit {
  /** Relativa a la carpeta del proyecto, con `/`. */
  ruta: string
  cambio: CambioArchivoGit
  /** Líneas agregadas y quitadas; null si es binario (o no se pudo contar). */
  mas: number | null
  menos: number | null
  /** Solo en los cambios sin guardar: ya está preparado para el commit (`git add`). */
  preparado?: boolean
}

/** Si el repositorio está solo en la PC o también en un remoto (GitHub u otro), según la última sincronización. */
export type RemotoGit =
  | { tipo: 'local' }
  | {
      tipo: 'remoto'
      github: boolean
      /** `owner/repo` en GitHub; en otro servidor, el servidor y la ruta. Nunca usuario ni clave. */
      nombre: string
      /** La página del repositorio (solo GitHub). */
      web: string | null
      /** La rama remota que sigue la local (`origin/main`); null si la rama no está en el remoto. */
      sigue: string | null
      /** Commits de la rama que no están en el remoto, y del remoto que no se bajaron. */
      sinSubir: number
      sinBajar: number
    }

export interface CommitGit {
  hash: string
  corto: string
  /** La primera línea del mensaje. */
  mensaje: string
  autor: string
  /** Los `Co-Authored-By` (p. ej. Claude), sin el correo. */
  coautores: string[]
  /** En milisegundos. */
  fecha: number
  archivos: number
  /** ¿Está en el remoto? null si el repositorio es solo local. */
  subido: boolean | null
}

/** La sección Git de un proyecto (H-16): para mirar; solo crea el repositorio y lo publica (D-081). */
export type GitProyecto =
  | {
      tipo: 'ok'
      /** La rama; si no hay ninguna (HEAD suelto), `sinRama` con el commit. */
      rama: string
      sinRama: boolean
      remoto: RemotoGit
      cambios: ArchivoGit[]
      /** Del más nuevo al más viejo. */
      historial: CommitGit[]
      /** Hay más commits que los que se muestran. */
      hayMas: boolean
    }
  /** La carpeta no tiene su propio repositorio. */
  | { tipo: 'sin-git' }
  /** No se encontró el programa `git` en la PC. */
  | { tipo: 'sin-programa' }
  | { tipo: 'error'; mensaje: string }

/** La cuenta de GitHub de la PC (la que usa git, D-081): con la que se publica. */
export type CuentaGithub = { tipo: 'ok'; usuario: string } | { tipo: 'error'; mensaje: string }

/** Publicar un proyecto en GitHub (D-081). */
export interface PedidoPublicar {
  nombre: string
  privado: boolean
}

/** Cómo salió crear el repositorio o publicarlo. `aviso`: algo que conviene saber aunque haya salido bien. */
export type ResultadoGit =
  | { tipo: 'ok'; aviso: string | null; web: string | null }
  | { tipo: 'error'; mensaje: string }

/** Lo de un commit elegido: el mensaje entero y sus archivos (el antes y después se pide por archivo, Q-61). */
export type DetalleCommit =
  | { tipo: 'ok'; mensajeCompleto: string; archivos: ArchivoGit[] }
  | { tipo: 'no-esta' }
  | { tipo: 'error'; mensaje: string }

/** Una línea del antes y después: el número de línea antes (quitada o igual) y después (agregada o igual). */
export interface LineaDif {
  tipo: 'tramo' | 'igual' | 'agregada' | 'quitada'
  texto: string
  viejo: number | null
  nuevo: number | null
}

export type DiferenciaGit =
  | { tipo: 'texto'; lineas: LineaDif[]; cortada: boolean }
  | { tipo: 'binario' }
  /** Sin líneas cambiadas (p. ej. solo cambió el permiso, o el archivo está vacío). */
  | { tipo: 'vacia' }
  | { tipo: 'error'; mensaje: string }

/** Los scripts de `docs/scripts.md` como botones (C-11, D-043). */
export interface ScriptsProyecto {
  /** ¿Tiene `docs/scripts.md`? */
  existe: boolean
  scripts: ScriptVista[]
}

export type ResultadoScript = { tipo: 'ok' | 'error'; mensaje: string }

/** Un comentario de la Revisión para la sección Revisión (modulos/revision/ux.md › W-R3). */
export interface VistaComentario {
  codigo: string
  numero: number
  estado: 'abierto' | 'cerrado'
  texto: string
  /** El archivo y la línea; `existe` es false si el archivo ya no está en el proyecto. */
  archivo: { ruta: string; linea: number; existe: boolean } | null
  componentes: string[]
  pagina: string | null
  elemento: string | null
  /** ¿Tiene captura en el disco? Se pide aparte (`capturaComentario`). */
  conCaptura: boolean
  historia: { fecha: string; texto: string }[]
  /** Cuándo se dejó («2026-10-28 14:32»), de la historia. */
  dejado: string | null
  cierre: { fecha: string; que: string } | null
  reabierto: boolean
}

export type ListaComentarios =
  | {
      tipo: 'ok'
      /** Del más nuevo al más viejo. */
      comentarios: VistaComentario[]
      /** Los `R-n.md` que no se pudieron leer. */
      ilegibles: string[]
      /** Última conexión de la extensión (ISO), de cualquier proyecto; null si nunca. */
      extension: string | null
      /** Si el proyecto es Electron y si ya carga la línea de la Revisión (H-R7). */
      electron: { esElectron: boolean; cargaLinea: boolean }
    }
  | { tipo: 'error'; mensaje: string }

/** Qué pasó con Enviar ahora (H-R2). `sin-sesion`: el proyecto no está abierto en Iridium. */
export type ResultadoEnvio = 'enviado' | 'sin-sesion' | 'no-existe'

export const CANALES = {
  listarProyectos: 'proyectos:listar',
  proyectosCambiaron: 'proyectos:cambiaron',
  elegirCarpeta: 'proyectos:elegir-carpeta',
  mudar: 'iridium:mudar',
  cambiarCarpetaIridium: 'iridium:cambiar-carpeta',
  leerPreferencias: 'preferencias:leer',
  guardarPreferencias: 'preferencias:guardar',
  estadoMotor: 'motor:estado',
  motorCambio: 'motor:cambio',
  iniciarSesion: 'motor:iniciar-sesion',
  abrirConversacion: 'conversacion:abrir',
  anteriores: 'conversacion:anteriores',
  seguir: 'conversacion:seguir',
  detener: 'conversacion:detener',
  cerrarFicha: 'conversacion:cerrar-ficha',
  conversacionCambio: 'conversacion:cambio',
  pendientes: 'pendientes:proyecto',
  responder: 'pendientes:responder',
  aMedias: 'pendientes:a-medias',
  documento: 'pendientes:documento',
  documentos: 'docs:lista',
  docsCambiaron: 'docs:cambiaron',
  mapa: 'proyecto:mapa',
  carpeta: 'archivos:carpeta',
  archivo: 'archivos:archivo',
  conversacionesAnteriores: 'conversacion:lista',
  elegirConversacion: 'conversacion:elegir',
  scripts: 'scripts:lista',
  correrScript: 'scripts:correr',
  comentarios: 'revision:comentarios',
  capturaComentario: 'revision:captura',
  enviarComentario: 'revision:enviar',
  reabrirComentario: 'revision:reabrir',
  git: 'git:proyecto',
  commit: 'git:commit',
  diferencia: 'git:diferencia',
  inicializarGit: 'git:inicializar',
  cuentaGithub: 'git:cuenta-github',
  publicarGithub: 'git:publicar-github',
  uso: 'uso:leer',
  usoCambio: 'uso:cambio',
  pedirCierre: 'app:pedir-cierre',
  cerrarIgual: 'app:cerrar-igual',
  cancelarCierre: 'app:cancelar-cierre',
  versionNueva: 'app:version-nueva',
  versionNuevaCambio: 'app:version-nueva-cambio',
  reiniciarAhora: 'app:reiniciar-ahora',
  zoom: 'ventana:zoom',
  sinArmar: 'app:sin-armar',
  sinArmarCambio: 'app:sin-armar-cambio',
  armar: 'app:armar',
  leerEscritos: 'escritos:leer',
  guardarEscrito: 'escritos:guardar',
  estilos: 'ajustes:estilos',
  skills: 'skills:lista',
  atrasados: 'skills:atrasados',
  ponerAlDia: 'skills:poner-al-dia',
  abrirCarpetaSkill: 'skills:abrir-carpeta',
  carpetaSkill: 'skills:carpeta',
  archivoSkill: 'skills:archivo',
  skillsCambiaron: 'skills:cambiaron',
  ideas: 'ideas:lista',
} as const

/** Lo que la ventana encuentra en `window.iridium`. */
export interface ApiIridium {
  version: string
  listarProyectos(): Promise<ListaProyectos>
  /** Avisa cuando cambia un `.proyecto.json`, un `estado.md` o una respuesta, con la lista ya releída. */
  alCambiarProyectos(escuchar: (lista: ListaProyectos) => void): () => void
  /** Abre el cuadro para elegir la carpeta de proyectos; null si se cancela. */
  elegirCarpeta(): Promise<ListaProyectos | null>
  /** Mueve las carpetas de antes a la carpeta Iridium, después de confirmarlo (D-083). */
  mudar(): Promise<ResultadoMudanza>
  /** Elige otra carpeta Iridium y lleva ahí Ideas y Skills (D-083). */
  cambiarCarpetaIridium(): Promise<ResultadoMudanza>
  leerPreferencias(): Promise<Preferencias>
  guardarPreferencias(cambio: Partial<Preferencias>): Promise<Preferencias>
  /** Los estilos de respuesta de Claude Code para el tono (AJ-3), sin gastar uso. */
  estilosDeRespuesta(): Promise<EstilosRespuesta>
  estadoMotor(): Promise<EstadoMotor>
  alCambiarMotor(escuchar: (estado: EstadoMotor) => void): () => void
  /**
   * Inicia sesión en Claude Code (CO-I1, D-069): abre el navegador como la extensión de VS Code y espera a que
   * termine; después vuelve a verificar y devuelve el estado nuevo.
   */
  iniciarSesion(): Promise<EstadoMotor>
  /** El uso de la suscripción (H-12); null hasta que se lee. */
  uso(): Promise<UsoSuscripcion | null>
  alCambiarUso(escuchar: (uso: UsoSuscripcion) => void): () => void
  /** Se quiso cerrar la ventana con sesiones trabajando (F-6): las rutas de esos proyectos. */
  alPedirCierre(escuchar: (trabajando: string[]) => void): () => void
  /** «Cerrar igual» (F-6): frena las sesiones y cierra; las conversaciones quedan para Seguí. */
  cerrarIgual(): Promise<void>
  /** Cancelar en la confirmación de F-6: si era para Reiniciar ahora, cerrar después ya no reinicia. */
  cancelarCierre(): Promise<void>
  /** La versión nueva lista para entrar al cerrar (CO-I2); null si no hay. */
  versionNueva(): Promise<VersionNueva | null>
  alCambiarVersionNueva(escuchar: (v: VersionNueva | null) => void): () => void
  /** Reiniciar ahora (CO-I2): cierra como siempre (con F-6 si hay sesiones trabajando) y abre la versión nueva. */
  reiniciarAhora(): Promise<void>
  /** Ctrl+= / Ctrl+- / Ctrl+0 (Defecto 17): agranda (1), achica (-1) o vuelve al tamaño normal (0); se recuerda. */
  zoom(paso: 1 | -1 | 0): Promise<void>
  /** Los cambios sin armar (CO-I6); null en desarrollo, donde no hay app de uso diario. */
  sinArmar(): Promise<SinArmar | null>
  alCambiarSinArmar(escuchar: (s: SinArmar) => void): () => void
  /** Armar (CO-I6): «Armar la última versión» en una consola a la vista; Iridium sigue abierto. */
  armar(): Promise<{ tipo: 'ok'; mensaje: string } | { tipo: 'error'; mensaje: string }>
  /** La conversación del proyecto; no manda nada al modelo (D-020). */
  abrirConversacion(ruta: string): Promise<ConversacionProyecto>
  /** Las entradas anteriores a las `tengo` últimas. */
  anteriores(ruta: string, tengo: number): Promise<Entrada[]>
  /** Seguí, Nueva o un mensaje propio (H-4). */
  seguir(ruta: string, pedido: PedidoSeguir): Promise<void>
  /** Frena a la IA en el acto (H-14). */
  detener(ruta: string): Promise<void>
  /** Cierra la ficha de una sesión terminada o con error; la conversación queda. */
  cerrarFicha(ruta: string): Promise<void>
  alCambiarConversacion(escuchar: (cambio: CambioConversacion) => void): () => void
  /** Los pendientes de un proyecto con su contexto (H-9). */
  pendientes(ruta: string): Promise<PendientesProyecto>
  /** Escribe `docs/respuestas/Q-n.md` (H-10, H-11). */
  responder(ruta: string, pedido: PedidoResponder): Promise<ResultadoResponder>
  /** Lo escrito en el cuadro de cada conversación y no enviado, por ruta (D-060): sobrevive a cerrar Iridium. */
  leerEscritos(): Promise<Record<string, string>>
  /** Guarda lo escrito en el cuadro de la conversación; vacío, lo borra. */
  guardarEscrito(ruta: string, texto: string): Promise<void>
  /** Guarda el borrador sin enviarlo: la IA no lo ve (D-039). */
  aMedias(ruta: string, codigo: string, borrador: Borrador): Promise<PendienteVista | null>
  /** Un documento del proyecto entero: «Ver entero» (W-5 › Panel derecho) y Docs (W-8). */
  documento(ruta: string, documento: string): Promise<ContenidoDocumento>
  /** Los documentos del proyecto en el orden del menú de Docs. */
  documentos(ruta: string): Promise<string[]>
  /** Avisa cuando cambia un `.md` de un proyecto (para releer Docs y el Mapa sin perder la posición). */
  alCambiarDocs(escuchar: (ruta: string) => void): () => void
  mapa(ruta: string): Promise<MapaProyecto>
  /** Lo que hay en una carpeta del proyecto (`''` = la raíz), sin `node_modules` ni `.git`. */
  carpeta(ruta: string, carpeta: string): Promise<CarpetaArchivos>
  archivo(ruta: string, archivo: string): Promise<ContenidoArchivo>
  /** Las conversaciones guardadas del proyecto, la más nueva primero (H-17). */
  conversacionesAnteriores(ruta: string): Promise<ConversacionAnterior[]>
  /** Muestra esa conversación: lo que se escriba la continúa (H-17). */
  elegirConversacion(ruta: string, id: string): Promise<ConversacionProyecto>
  scripts(ruta: string): Promise<ScriptsProyecto>
  /** Ejecuta el script `id` (lo busca de nuevo en `docs/scripts.md`: no confía en lo que mande la ventana). */
  correrScript(ruta: string, id: string): Promise<ResultadoScript>
  /** Los comentarios de la Revisión del proyecto (H-R5); se releen con `alCambiarDocs`. */
  comentarios(ruta: string): Promise<ListaComentarios>
  /** La captura de un comentario como dirección `data:`; null si no tiene. */
  capturaComentario(ruta: string, codigo: string): Promise<string | null>
  /** Enviar ahora desde Revisión (H-R2): el comentario entra a la sesión del proyecto. */
  enviarComentario(ruta: string, codigo: string): Promise<ResultadoEnvio>
  /** Reabrir un cerrado, con una nota opcional de qué falta (H-R5). */
  reabrirComentario(ruta: string, codigo: string, nota: string): Promise<void>
  /** La rama, los cambios sin guardar y el historial (H-16). */
  git(ruta: string): Promise<GitProyecto>
  /** El mensaje entero y los archivos de un commit. */
  commit(ruta: string, hash: string): Promise<DetalleCommit>
  /** El antes y después de un archivo de un commit, o de los cambios sin guardar (`commit` = `sin-guardar`). */
  diferencia(ruta: string, commit: string, archivo: string): Promise<DiferenciaGit>
  /** Crea el repositorio del proyecto con un primer commit; deja afuera dependencias y claves (D-081). */
  inicializarGit(ruta: string): Promise<ResultadoGit>
  /** La cuenta de GitHub con la que se publica; si no hay sesión, git abre la ventana para iniciarla. */
  cuentaGithub(): Promise<CuentaGithub>
  /** Crea el repositorio en GitHub (privado o público), lo pone como `origin` y sube la rama (D-081). */
  publicarGithub(ruta: string, pedido: PedidoPublicar): Promise<ResultadoGit>
  /** Las skills de la PC por origen, con las copias dobles (SK-1, SK-2). */
  skills(): Promise<ListaSkills>
  /** El formato vigente de la guía y los proyectos con uno viejo (SK-4, D-068). */
  atrasados(): Promise<Atrasados>
  /** Manda a la conversación del proyecto el pedido de poner al día su formato (SK-4). */
  ponerAlDia(ruta: string): Promise<void>
  /** Abre en el explorador la carpeta de una skill de la lista (su `id`). */
  abrirCarpetaSkill(id: string): Promise<void>
  /** Lo que hay en una carpeta de una skill de la lista (`''` = la de la skill), como Archivos. */
  carpetaSkill(id: string, carpeta: string): Promise<CarpetaArchivos>
  /** Un archivo de una skill de la lista, solo lectura. */
  archivoSkill(id: string, archivo: string): Promise<ContenidoArchivo>
  /** Avisa cuando cambia una skill propia o el formato de un proyecto (`docs/README.md`, `CLAUDE.md`). */
  alCambiarSkills(escuchar: () => void): () => void
  /** Las ideas de `Ideas/ideas.md` por sección (IN-1); se releen con `alCambiarDocs` de la carpeta Ideas. */
  ideas(): Promise<ListaIdeas>
}

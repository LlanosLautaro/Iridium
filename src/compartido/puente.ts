// El puente entre la ventana y el proceso principal (05-arquitectura.md › Componentes): una lista cerrada de
// pedidos y eventos. Los tipos los ven los dos lados; lo que llega desde la ventana se valida en `main/ipc/`.

import type { AdjuntoPedido, AdjuntoVista } from './adjuntos'
import type { AnchosConversacion } from './ancho-conversacion'
import type { CapacidadesMotor, ComandoMotor, ListaComandos } from './comandos'
import type { CambioDiseno, PedidoDiseno, VistaDiseno } from './diseno'
import type { EstadoDesdeIdeas, IdeasDeProyecto, NotaIdea, ResultadoIdea } from './ideas'
import type { ImagenDelPortapapeles, ImagenPegada } from './notas'
import type { Borrador } from './respuestas'
import type { ListaSkills, ProyectoFramework, SkillProyecto } from './skills'
import type { Estado, PlanEliminacion } from './tipos'
import type { TrabajoProyecto } from './trabajo'
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
  /** El día en que se archivó desde Iridium (AAAA-MM-DD); null si no se sabe. */
  archivadoEl?: string | null
  /** Proyecto que lo reemplaza (solo En rescate). */
  reemplazadoPor: string | null
  /** El ícono como dirección `data:` (la ventana no lee el disco); null = sin ícono. */
  icono: string | null
  /** Si el `.proyecto.json` existe pero no se puede usar: por qué. */
  problema: string | null
  /** null = el proyecto no tiene `docs/estado.md` (o no se reconoce nada). */
  hito: {
    numero: number | null
    nombre: string | null
    proximoPaso: string | null
    /** El frente en curso y su paso (W-2: «Orden · 4. UX»); sin él, la tarjeta muestra el Próximo paso. */
    frente?: { nombre: string; paso: string | null }
  } | null
  /** Las `Q-n` sin responder del proyecto, cuántas de ellas frenan (D-010, D-019) y las respondidas sin procesar. */
  preguntas: { sinResponder: number; frenan: number; respondidas: number }
  /** Los comentarios de la Revisión abiertos (`docs/revision/`): esperan a la IA, no al usuario. */
  revision: number
  /** Las skills del proyecto (`.claude/skills/`): con alguna, su barra muestra Skills (R-8). */
  skills: number
  /**
   * El framework (frente Orden, W-2): con él, lo que el control encuentra mal escrito ahora, como lo ve la IA
   * (`docs/estado.md:12 — …`); `'viejo'`, todavía no pasó; null, sin `docs/estado.md`.
   */
  framework: { avisos: string[] } | 'viejo' | null
  /**
   * El último cambio del proyecto (ms), que ordena la grilla (D-136): el último commit o lo último escrito en `docs/`,
   * lo más reciente de los dos; null si no tiene ninguno.
   */
  ultimoCambio: number | null
  /**
   * Lo que abre el proyecto (frente Abrir, AB-1, D-156): el script marcado `ejecutar` en `docs/scripts.md`, su tipo y
   * el detalle del botón «Ejecutar Alfa» (D-155); null sin marca. Opcional: sin decir, no tiene.
   */
  ejecutar?: { como: 'escritorio' | 'pagina' | 'consola'; detalle: string } | null
}

/**
 * La carpeta de Iridium dentro de la carpeta de proyectos (D-087, como el `.obsidian` de un vault): Ideas y Skills.
 * La grilla no la muestra (empieza con punto).
 */
export const CARPETA_IRIDIUM = '.iridium'

/** La carpeta de Iridium (D-083, D-087): Ideas y Skills, aparte de los proyectos. */
export interface CarpetasIridium {
  carpeta: string
  /** La carpeta del chat general (D-060); null si no está. */
  ideas: TarjetaProyecto | null
  /** La carpeta del chat de Skills (D-068); null si no está. */
  skills: TarjetaProyecto | null
  /**
   * Las de antes que faltan en `.iridium` (sueltas en la carpeta de proyectos, o en otra carpeta de Iridium): se ofrece
   * mudarlas y, mientras tanto, se usan ellas. null si no hay nada para mudar.
   */
  mudanza: { ideas: string | null; skills: string | null } | null
}

export type ListaProyectos =
  | { tipo: 'lista'; raiz: string; proyectos: TarjetaProyecto[]; iridium: CarpetasIridium }
  | { tipo: 'error'; raiz: string; mensaje: string; iridium: CarpetasIridium }

/** Cómo terminó Mover (la mudanza). */
export type ResultadoMudanza =
  | { tipo: 'ok'; lista: ListaProyectos; avisos: string[] }
  | { tipo: 'cancelada' }
  | { tipo: 'error'; mensaje: string }

/** Lo que la app recuerda entre una vez y otra (05-arquitectura.md › Modelo de datos, `config.json`). */
export interface Preferencias {
  verArchivados: boolean
  /** Ancho de la conversación de cada vista (D-098), en píxeles. */
  anchoConversacion: AnchosConversacion
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
  /** El frente elegido en la Bandeja de entrada de cada proyecto (R-55), por ruta; sin él, Todos. */
  filtrosBandeja: Record<string, string>
  /** El proyecto que estaba abierto al cerrar: al abrir Iridium se vuelve a él (D-060); null = el inicio. */
  abierto: string | null
  /** Los ajustes de la ventana de Ajustes (D-065, modulos/apariencia/): los nombres y el tono. */
  /** Vacío = «Vos». */
  nombreUsuario: string
  /** Vacío = «IA». */
  nombreIa: string
  /** El estilo de respuesta de Claude Code para las sesiones de Iridium (su nombre); vacío = el de Claude Code. */
  tono: string
  /** Abrir el período de Claude mientras no está (frente Arranque, AR-1): apagado al principio. */
  arranque: AjusteArranque
  /** Los proyectos con la actualización automática apagada (frente Abrir, D-154): las demás, prendidas. */
  actualizacionApagada: string[]
}

/** El arranque del período de 5 horas (D-146): si está prendido y la hora del primero, `HH:MM` local. */
export interface AjusteArranque {
  prendido: boolean
  hora: string
}

/** Lo que pasó en un momento del arranque (D-149 › 6). */
export type ResultadoArranque =
  | 'arranco'
  | 'periodo-abierto'
  | 'nada-listo'
  | 'semana'
  | 'sin-uso'
  | 'sin-sesion'

/** Un momento del arranque para mostrar (AR-2 a AR-4). */
export interface RenglonArranqueVista {
  cuando: number
  resultado: ResultadoArranque
  /** El proyecto que arrancó, con cómo va la conversación que le abrió; null si no arrancó. */
  proyecto: {
    ruta: string
    nombre: string
    estado: 'trabajando' | 'terminada' | 'detenida' | 'error'
    /** Las preguntas que dejó y cuántas frenan. */
    preguntas: number
    frenan: number
  } | null
}

/** El arranque para la ventana: el detalle del uso y el aviso al volver. */
export interface EstadoArranque {
  prendido: boolean
  /** El próximo momento; null apagado. */
  proximo: number | null
  /** Lo que pasó en los últimos 7 días, el más nuevo primero. */
  semana: RenglonArranqueVista[]
  /** Lo que muestra el aviso al volver (AR-4), del más viejo al más nuevo; vacío, sin aviso. */
  aviso: RenglonArranqueVista[]
}

/** Lo más largo que puede ser cada texto de Ajustes. */
export const LARGO_AJUSTES = { nombreUsuario: 60, nombreIa: 40, tono: 100 } as const

/** Los proyectos con el filtro de la Bandeja recordado (R-55): los últimos que se cambiaron. */
export const PROYECTOS_CON_FILTRO = 200

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

/**
 * Si una copia compartida puede ver las versiones publicadas (D-085, Q-123): `sin-sesion`, falta iniciar sesión en
 * GitHub; `sin-permiso`, la cuenta no está invitada al repositorio.
 */
export type AccesoVersiones = 'ok' | 'sin-sesion' | 'sin-permiso'

/** Commits de Iridium que la app de uso diario todavía no tiene (CO-I6): se ofrece Armar. */
export interface SinArmar {
  /** La carpeta del código de Iridium (un proyecto más de la grilla: con su IA trabajando no se ofrece). */
  carpeta: string
  /** El último commit (corto) y su primera línea; null si ya está armado (en `main` o en la versión lista). */
  pendiente: { commit: string; mensaje: string } | null
  /** Se está armando, con Actualizar o con el script. */
  armando: boolean
  /** Desde cuándo arma (ms); null si no arma o no se sabe. */
  desde: number | null
  /**
   * El último armado terminó sin versión nueva (`release/armado-fallo.json`, o la marca de `armando.json` quedó con su
   * proceso muerto: se cerró la consola). Se borra al volver a armar.
   */
  fallo: { fecha: string; motivo: string } | null
  /**
   * Sin cambios a medio hacer: ningún archivo seguido por git está modificado sin commitear (los nuevos sin seguir, como
   * las respuestas, no cuentan). Actualizar solo (T-67) arma únicamente así.
   */
  limpio: boolean
  /**
   * El commit que `pnpm volver` dejó afuera porque fallaba (`release/retenido.json`): Actualizar solo (T-67) no lo arma
   * hasta que haya otro commit. null si no hay.
   */
  retenido: string | null
}

/**
 * Actualizar solo (T-67): cuánto espera con los cambios quietos y la IA libre antes de armar, y cuántos segundos sin
 * usar Iridium hacen falta para reiniciar. null: apagado (`IRIDIUM_ACTUALIZAR_SOLO=no`, las pruebas).
 */
export interface ActualizarSolo {
  esperaMs: number
  quietoSeg: number
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
  enPausa: boolean
  /** El de su línea `Frente:`; null es del núcleo. */
  frente: string | null
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
  /**
   * Lo que la IA dejó corriendo de fondo (T-65), con su descripción. Con el turno terminado, la IA espera eso para
   * seguir sola: la sesión no terminó del todo.
   */
  fondo?: string[]
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
  /** Lo que mandó el usuario, con sus adjuntos si llevó (PA-5). */
  | { tipo: 'usuario'; id: string; texto: string; cuando: number | null; adjuntos?: AdjuntoVista[] }
  /**
   * El texto de la IA convertido de Markdown a HTML seguro (sin HTML crudo). `final`: con él terminó de responder,
   * aunque después siguiera por un hook (R-72).
   */
  | { tipo: 'ia'; id: string; html: string; cuando: number | null; final?: boolean }
  | { tipo: 'herramienta'; id: string; accion: string; objeto: string | null }
  | { tipo: 'aviso'; id: string; clase: 'detenida' | 'error'; texto: string }
  /**
   * Errores del motor con qué hacer (F-5): sin sesión iniciada (con Reintentar: `reintentar` es el texto que no se
   * envió, null = Seguí; `adjuntos`, los que iban con él) o el uso agotado (`libera`: cuándo, ms).
   */
  | {
      tipo: 'sin-sesion'
      id: string
      reintentar: string | null
      adjuntos?: AdjuntoPedido[]
      enviado: boolean
    }
  | { tipo: 'uso-agotado'; id: string; libera: number | null }
  | { tipo: 'preguntas'; id: string; preguntas: PreguntaNueva[] }
  /**
   * El control de Iridium le devolvió a la IA lo mal escrito (W-12, OR-2). `quedo`: null mientras corrige o si no se
   * sabe (una conversación vieja); si no, lo que siguió mal al terminar la corrección.
   */
  | { tipo: 'control'; id: string; avisos: AvisoControl[]; corrigiendo: boolean }

/** Una cosa mal escrita que encontró el control: dónde (`docs/estado.md:12`) y qué arreglar. */
export interface AvisoControl {
  donde: string
  texto: string
  /** true = siguió mal después de la corrección; false = quedó corregida; null = no se sabe todavía. */
  quedo: boolean | null
}

/** La conversación de un proyecto al abrirlo: la de la sesión en marcha o la última guardada (H-4). */
export interface ConversacionProyecto {
  ruta: string
  /** null = el proyecto todavía no tiene conversaciones. */
  id: string | null
  /** Dónde empezó: en Iridium o afuera (VS Code). */
  origen: 'iridium' | 'vscode' | null
  /** La empezó el arranque del período (frente Arranque, AR-2): cuándo; null si no. */
  arrancada: number | null
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
  /** Con `reiniciar`: si la empezó el arranque del período, cuándo (AR-2). */
  arrancada?: number | null
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
  /** Las fotos, los archivos y los textos pegados que van con el mensaje (PA-I2). */
  adjuntos?: AdjuntoPedido[]
}

/** Lo escrito sin mandar en el cuadro de una conversación, con sus adjuntos (D-060, `escritos.json` 2). */
export interface EscritoGuardado {
  texto: string
  adjuntos: AdjuntoPedido[]
}

/** La foto entera para el visor (PA-2): su `data:`, cuánto mide y cuánto pesa. */
export interface FotoGrande {
  src: string
  ancho: number
  alto: number
  bytes: number
}

/**
 * Abrir el archivo de una ficha (PA-5): uno del proyecto se abre en Archivos (`archivo`, relativo); uno de afuera, con
 * Windows (o su carpeta, si es un programa); `no-esta`, si ya no existe.
 */
export type ResultadoAdjunto =
  | { tipo: 'en-proyecto'; archivo: string }
  | { tipo: 'ok' }
  | { tipo: 'no-esta' }
  | { tipo: 'error'; mensaje: string }

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
  /** `en pausa` en su línea `Tipo:` (OR-6): va al final, plegada, y no cuenta. */
  enPausa: boolean
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
  | 'en-pausa'
  | 'otro'

/** El estado de un paso: un ítem del portón o una iteración. `espera`: espera la prueba del usuario. */
export type EstadoPaso =
  | 'hecho'
  | 'en-curso'
  | 'espera'
  | 'pendiente'
  | 'saltado'
  | 'reabierto'
  | 'en-pausa'
  | 'otro'

/**
 * Un paso del camino del Mapa (D-144, D-145): un paso de la ruta de un frente, un paso del método (un frente sin ruta)
 * o un hito con los pasos del actual. El que sigue no viene marcado: es el primero que `viene` del camino principal.
 */
export interface PasoCamino {
  /** Sin los códigos (D-145). */
  texto: string
  /** `otro`: una línea que Iridium no entiende, que se muestra tal cual, en gris. */
  marca: 'hecho' | 'viene' | 'descartado' | 'otro'
  /** La primera pregunta sin responder que nombra (`Q-202`): el paso lleva «Te espera»; null si ninguna. */
  espera: string | null
  /** Su sección (la de su iteración, su documento); null si no tiene. */
  destino: Destino | null
  ramas: PasoCamino[]
}

/** Un ítem de `trabajo.md` en las listas del Mapa. */
export interface TrabajoMapa {
  codigo: string
  titulo: string
}

/** Un frente con carpeta (`docs/modulos/<carpeta>/`), con su camino (MA-1 a MA-4, MA-8, MA-9). */
export interface FrenteMapa {
  /** Su carpeta. */
  clave: string
  nombre: string
  /** En palabras (MA-1); `otro`: la palabra de la tabla no es del vocabulario y se muestra tal cual. */
  estado: 'en curso' | 'en uso' | 'en pausa' | 'sin empezar' | 'otro'
  /** La palabra de la tabla «Módulos», tal cual. */
  estadoTexto: string
  /** Su `estado.md`. */
  documento: string
  /** Sin `## Ruta`: el camino son los pasos del método (MA-9). */
  sinRuta: boolean
  pasos: PasoCamino[]
  /** Su trabajo aprobado que la ruta todavía no nombra (MA-8). */
  sinLugar: TrabajoMapa[]
  /** Su `estado.md` falta o no tiene camino: un Recuadro de error en lugar del camino (MA-12); null si se lee. */
  error: string | null
}

export type MapaProyecto =
  | {
      tipo: 'mapa'
      /** El hito actual, para la cabecera («Hito 10 · Operación»); null si `estado.md` no lo dice. */
      hito: { numero: number; nombre: string } | null
      /** El documento del hito actual (`docs/10-operacion.md`), si existe. */
      documento: string | null
      /** Antes del hito 10 o sin frentes (D-142): los hitos como camino, con los pasos del actual como ramas. */
      hitos: PasoCamino[] | null
      /** Los frentes con carpeta: el activo primero, después en el orden de la tabla «Módulos». */
      frentes: FrenteMapa[]
      /** Lo aprobado que todavía no empezó (MA-6, D-143). */
      porEmpezar: {
        frentes: { nombre: string; pasos: TrabajoMapa[] }[]
        sinFrente: (TrabajoMapa & { enCurso: boolean })[]
      }
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

/** Todos los archivos del proyecto, para buscarlos por nombre (T-90); `cortada` si eran demasiados. */
export type ListaArchivos =
  | { tipo: 'ok'; rutas: string[]; cortada: boolean }
  | { tipo: 'error'; mensaje: string }

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
      /** La última vez que Iridium se puso al día con el remoto (D-159); null si todavía no lo hizo. */
      sincronia: SincroniaGit | null
    }

/**
 * Cómo salió la última vez que Iridium trajo lo del remoto (D-159): `al-dia` (no había nada), `bajado` (trajo
 * `bajados` commits), `separada` (esta PC y el remoto tienen commits distintos: lo junta Sincronizar), `choca` (hay
 * cambios sin guardar en los mismos archivos), `sin-conexion` o `error`.
 */
export interface SincroniaGit {
  cuando: number
  resultado: 'al-dia' | 'bajado' | 'separada' | 'choca' | 'sin-conexion' | 'error'
  bajados: number
  motivo: string | null
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

/**
 * Ejecutar Alfa (AB-1, AB-2): lo de Scripts; `sin-armar` si el programa no existe todavía (con `armar` si sabe
 * armarse); `esperando` si se está armando: se abre solo al terminar.
 */
export type ResultadoEjecutar =
  | ResultadoScript
  | { tipo: 'sin-armar'; armar: boolean }
  | { tipo: 'esperando' }

/**
 * La actualización automática de un proyecto que marca `ejecutar · escritorio` y `armar` (frente Abrir, AB-3, AB-4).
 * Los proyectos que no se arman solos no están en la lista.
 */
export interface ActualizacionProyecto {
  /** El interruptor de Ajustes › Este proyecto (D-154: prendida si no se apagó). */
  prendida: boolean
  /** Desde cuándo se está armando (ms), o null. */
  armando: number | null
  /** Cómo terminó el último armado; null si nunca se armó desde Iridium. */
  ultimo: { cuando: number; resultado: 'ok' | 'falla' | 'ocupada'; motivo: string | null } | null
  /** La Señal «No se pudo actualizar» (AB-4): el último falló con el commit de ahora. */
  fallo: boolean
}

/** Un comentario de la Revisión para la sección Revisión (modulos/revision/ux.md › W-R3). */
export interface VistaComentario {
  codigo: string
  numero: number
  /** `anotado` (R-9): quedó en un plan, todavía no está hecho. */
  estado: 'abierto' | 'anotado' | 'cerrado'
  texto: string
  /** El archivo y la línea; `existe` es false si el archivo ya no está en el proyecto. */
  archivo: { ruta: string; linea: number; existe: boolean } | null
  componentes: string[]
  pagina: string | null
  /** Hecho sobre una maqueta de Diseño (relativa al proyecto); `existe` es false si ya no está. */
  maqueta: { ruta: string; existe: boolean } | null
  elemento: string | null
  /** ¿Tiene captura en el disco? Se pide aparte (`capturaComentario`). */
  conCaptura: boolean
  historia: { fecha: string; texto: string }[]
  /** Cuándo se dejó («2026-10-28 14:32»), de la historia. */
  dejado: string | null
  cierre: { fecha: string; que: string } | null
  /** Dónde quedó anotado, de la historia (R-9). */
  anotacion: { fecha: string; que: string } | null
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
  comandos: 'conversacion:comandos',
  comandosCambio: 'conversacion:comandos-cambio',
  capacidades: 'motor:capacidades',
  pendientes: 'pendientes:proyecto',
  responder: 'pendientes:responder',
  aMedias: 'pendientes:a-medias',
  documento: 'pendientes:documento',
  documentos: 'docs:lista',
  docsCambiaron: 'docs:cambiaron',
  mapa: 'proyecto:mapa',
  carpeta: 'archivos:carpeta',
  listaArchivos: 'archivos:lista',
  archivo: 'archivos:archivo',
  conversacionesAnteriores: 'conversacion:lista',
  elegirConversacion: 'conversacion:elegir',
  scripts: 'scripts:lista',
  correrScript: 'scripts:correr',
  ejecutarProyecto: 'proyecto:ejecutar',
  armarProyecto: 'proyecto:armar-ahora',
  actualizaciones: 'actualizacion:leer',
  actualizacionCambio: 'actualizacion:cambio',
  actualizarAhora: 'actualizacion:ahora',
  consolaArmado: 'actualizacion:consola',
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
  guardarGit: 'git:guardar',
  sincronizarGit: 'git:sincronizar',
  revisarRemoto: 'git:revisar-remoto',
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
  actualizarSolo: 'app:actualizar-solo',
  segundosSinUso: 'app:segundos-sin-uso',
  arranque: 'arranque:leer',
  arranqueCambio: 'arranque:cambio',
  arranqueVisto: 'arranque:visto',
  cancelarArmado: 'app:cancelar-armado',
  verConsolaArmado: 'app:ver-consola-armado',
  accesoVersiones: 'app:acceso-versiones',
  accesoVersionesCambio: 'app:acceso-versiones-cambio',
  entrarGithub: 'app:entrar-github',
  leerEscritos: 'escritos:leer',
  guardarEscrito: 'escritos:guardar',
  elegirAdjuntos: 'adjuntos:elegir',
  guardarPegada: 'adjuntos:guardar-pegada',
  miniatura: 'adjuntos:miniatura',
  fotoGrande: 'adjuntos:foto-grande',
  abrirAdjunto: 'adjuntos:abrir',
  estilos: 'ajustes:estilos',
  skills: 'skills:lista',
  framework: 'skills:framework',
  pasarAlFramework: 'skills:pasar-al-framework',
  abrirCarpetaSkill: 'skills:abrir-carpeta',
  carpetaSkill: 'skills:carpeta',
  archivoSkill: 'skills:archivo',
  skillsCambiaron: 'skills:cambiaron',
  estadoProyecto: 'proyectos:estado',
  archivarProyecto: 'proyectos:archivar',
  iconoProyecto: 'proyectos:icono',
  abrirEnVsCode: 'proyectos:vscode',
  abrirCarpetaProyecto: 'proyectos:explorador',
  nuevoProyecto: 'proyectos:nuevo',
  planEliminarProyecto: 'proyectos:plan-eliminar',
  eliminarProyecto: 'proyectos:eliminar',
  trabajoProyecto: 'proyecto:trabajo',
  ideasProyecto: 'proyecto:ideas',
  anotarIdea: 'proyecto:anotar-idea',
  estadoIdea: 'proyecto:estado-idea',
  notaIdea: 'proyecto:nota-idea',
  guardarIdea: 'proyecto:guardar-idea',
  pegarImagenIdea: 'proyecto:pegar-imagen-idea',
  imagenDelPortapapeles: 'portapapeles:imagen',
  borrarIdea: 'proyecto:borrar-idea',
  moverIdea: 'proyecto:mover-idea',
  skillsProyecto: 'proyecto:skills',
  abrirDiseno: 'diseno:abrir',
  marcarVista: 'diseno:marcar-vista',
  pedirDiseno: 'diseno:pedir',
  disenoCambio: 'diseno:cambio',
  disenoEscape: 'diseno:escape',
  disenoFlecha: 'diseno:flecha',
  disenoComentando: 'diseno:comentando',
} as const

/** Lo que vuelve de una acción del menú de la tarjeta (R-7): la lista ya releída, para verla al instante. */
export type ResultadoFicha =
  | { tipo: 'ok'; lista: ListaProyectos }
  | { tipo: 'cancelada' }
  | { tipo: 'error'; mensaje: string }

/** Abrir el proyecto en VS Code o en el explorador (C-12). */
export type ResultadoAbrir = { tipo: 'ok' } | { tipo: 'error'; mensaje: string }

/** Crear un proyecto (C-10, R-14): su ruta, con la lista ya releída. */
export type ResultadoNuevo =
  | { tipo: 'ok'; ruta: string; lista: ListaProyectos }
  | { tipo: 'error'; mensaje: string }

/** Lo que muestra la confirmación de Eliminar (R-10, D-090): qué se borra y qué va a la papelera, ya medido. */
export type ResultadoPlanEliminar = { tipo: 'ok'; plan: PlanEliminacion } | { tipo: 'error'; mensaje: string }

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
  /** El arranque del período (frente Arranque): lo último que pasó, la semana y el aviso al volver. */
  arranque(): Promise<EstadoArranque>
  alCambiarArranque(escuchar: (estado: EstadoArranque) => void): () => void
  /** Listo en el aviso al volver (AR-4): lo mostrado hasta `hasta` no vuelve a aparecer. */
  arranqueVisto(hasta: number): Promise<void>
  /** Se quiso cerrar la ventana con sesiones trabajando (F-6): las rutas de esos proyectos. */
  alPedirCierre(escuchar: (trabajando: string[]) => void): () => void
  /** «Cerrar igual» (F-6): frena las sesiones y cierra; las conversaciones quedan para Seguí. */
  cerrarIgual(): Promise<void>
  /** Cancelar en la confirmación de F-6: si era para reiniciar con Actualizar, cerrar después ya no reinicia. */
  cancelarCierre(): Promise<void>
  /** La versión nueva lista para entrar al cerrar (CO-I2); null si no hay. */
  versionNueva(): Promise<VersionNueva | null>
  alCambiarVersionNueva(escuchar: (v: VersionNueva | null) => void): () => void
  /** Actualizar con una versión lista (CO-I2, R-12): cierra como siempre (con F-6 si hay sesiones trabajando) y abre la versión nueva. */
  reiniciarAhora(): Promise<void>
  /** Ctrl+= / Ctrl+- / Ctrl+0 (Defecto 17): agranda (1), achica (-1) o vuelve al tamaño normal (0); se recuerda. */
  zoom(paso: 1 | -1 | 0): Promise<void>
  /** Los cambios sin armar (CO-I6); null en desarrollo, donde no hay app de uso diario. */
  sinArmar(): Promise<SinArmar | null>
  alCambiarSinArmar(escuchar: (s: SinArmar) => void): () => void
  /** Actualizar sin versión lista (R-12): arma la última versión sin consola a la vista; Iridium sigue abierto. */
  armar(): Promise<{ tipo: 'ok'; mensaje: string } | { tipo: 'error'; mensaje: string }>
  /** Cancelar el armado (W-1): lo corta; la app que se usa sigue igual. */
  cancelarArmado(): Promise<void>
  /** Si Actualizar arma y reinicia solo (T-67), y con qué esperas; null, apagado. */
  actualizarSolo(): Promise<ActualizarSolo | null>
  /**
   * Cuántos segundos lleva Iridium sin usarse: sin teclado ni mouse en su ventana (minimizada o detrás de otra, no
   * recibe nada). Usar la PC para otra cosa no cuenta (T-67, Q-167).
   */
  segundosSinUso(): Promise<number>
  /** Ver la consola (W-1): abre lo que escribió el último armado. */
  verConsolaArmado(): Promise<{ tipo: 'ok' } | { tipo: 'error'; mensaje: string }>
  /** Si la copia compartida ve las versiones (Q-123); null si no es una copia compartida. */
  accesoVersiones(): Promise<AccesoVersiones | null>
  alCambiarAccesoVersiones(escuchar: (a: AccesoVersiones) => void): () => void
  /** Inicia sesión en GitHub con la ventana de git y vuelve a mirar las versiones. */
  entrarGithub(): Promise<{ tipo: 'ok' } | { tipo: 'error'; mensaje: string }>
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
  /** Qué sabe hacer el motor (los comandos, las fotos y los comandos escondidos), sin gastar (PA-6). */
  capacidadesMotor(): Promise<CapacidadesMotor>
  /** La lista de «/» de un proyecto, con los usados hace poco (PA-1), sin gastar. */
  comandos(ruta: string): Promise<ListaComandos>
  /** La lista de un proyecto cambió mientras la IA trabajaba (una skill nueva). */
  alCambiarComandos(escuchar: (cambio: { ruta: string; comandos: ComandoMotor[] }) => void): () => void
  /** Los pendientes de un proyecto con su contexto (H-9). */
  pendientes(ruta: string): Promise<PendientesProyecto>
  /** Escribe `docs/respuestas/Q-n.md` (H-10, H-11). */
  responder(ruta: string, pedido: PedidoResponder): Promise<ResultadoResponder>
  /** Lo escrito en el cuadro de cada conversación y no enviado, por ruta (D-060): sobrevive a cerrar Iridium. */
  leerEscritos(): Promise<Record<string, EscritoGuardado>>
  /** Guarda lo escrito en el cuadro de la conversación, con sus adjuntos; vacío, lo borra. */
  guardarEscrito(ruta: string, escrito: EscritoGuardado): Promise<void>
  /** El selector de Windows para sumar archivos y fotos (PA-2): las rutas elegidas, vacío si se canceló. */
  elegirAdjuntos(): Promise<string[]>
  /** La ruta de un archivo arrastrado sobre la conversación (PA-2); vacía si no tiene (no es del disco). */
  rutaDeArchivo(archivo: File): string
  /** Guarda una foto pegada en los datos de Iridium y da su ruta (PA-3); null si no es una imagen. */
  guardarPegada(bytes: Uint8Array): Promise<string | null>
  /** La miniatura de una foto, como `data:`; null si no es una imagen o ya no está. */
  miniatura(ruta: string): Promise<string | null>
  /** La foto entera para el visor; null si no es una imagen o ya no está. */
  fotoGrande(ruta: string): Promise<FotoGrande | null>
  /** Abre el archivo de una ficha (PA-5): del proyecto, en Archivos; de afuera, con Windows. */
  abrirAdjunto(ruta: string, archivo: string): Promise<ResultadoAdjunto>
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
  /** Todos los archivos del proyecto, sin `node_modules` ni `.git`, para buscar uno por su nombre (T-90). */
  listaArchivos(ruta: string): Promise<ListaArchivos>
  archivo(ruta: string, archivo: string): Promise<ContenidoArchivo>
  /** Las conversaciones guardadas del proyecto, la más nueva primero (H-17). */
  conversacionesAnteriores(ruta: string): Promise<ConversacionAnterior[]>
  /** Muestra esa conversación: lo que se escriba la continúa (H-17). */
  elegirConversacion(ruta: string, id: string): Promise<ConversacionProyecto>
  scripts(ruta: string): Promise<ScriptsProyecto>
  /** Ejecuta el script `id` (lo busca de nuevo en `docs/scripts.md`: no confía en lo que mande la ventana). */
  correrScript(ruta: string, id: string): Promise<ResultadoScript>
  /** Ejecutar Alfa (frente Abrir, AB-1): el script marcado `ejecutar`, buscado de nuevo en `docs/scripts.md`. */
  ejecutarProyecto(ruta: string): Promise<ResultadoEjecutar>
  /** Armar ahora (AB-2): arma escondido, como la actualización automática, y la abre al terminar. */
  armarProyecto(ruta: string): Promise<ResultadoScript>
  /** La actualización automática de los proyectos que se arman solos (AB-3, AB-4), por ruta. */
  actualizaciones(): Promise<Record<string, ActualizacionProyecto>>
  alCambiarActualizaciones(escuchar: (a: Record<string, ActualizacionProyecto>) => void): () => void
  /** Actualizar ahora (AB-4): arma aunque esté apagada o al día; termina cuando terminó de armar. */
  actualizarAhora(ruta: string): Promise<'ok' | 'falla' | 'ocupada'>
  /** Ver la consola (AB-4): abre el log del último armado del proyecto. */
  consolaArmado(ruta: string): Promise<void>
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
  /** Commit y subir (D-159): guarda los cambios en un commit (los preparados, o todos) y, si hay remoto, lo sube. */
  guardarGit(ruta: string, mensaje: string, subir: boolean): Promise<ResultadoGit>
  /** Sincronizar (D-159): trae lo del remoto, lo junta con lo de esta PC y sube lo que falta. */
  sincronizarGit(ruta: string): Promise<ResultadoGit>
  /** Al entrar a un proyecto: si hace más de un minuto que no se miró su remoto, lo trae ya (D-159). */
  revisarRemoto(ruta: string): Promise<void>
  /** Las skills de la PC por origen, con las copias dobles (SK-1, SK-2). */
  skills(): Promise<ListaSkills>
  /** Cómo está cada proyecto con el framework (Skills › Framework, W-13): los de afuera primero. */
  framework(): Promise<ProyectoFramework[]>
  /** Manda a la conversación del proyecto el pedido de pasarlo al framework (F-9, OR-8). */
  pasarAlFramework(ruta: string): Promise<void>
  /** Abre en el explorador la carpeta de una skill de la lista (su `id`). */
  abrirCarpetaSkill(id: string): Promise<void>
  /** Lo que hay en una carpeta de una skill de la lista (`''` = la de la skill), como Archivos. */
  carpetaSkill(id: string, carpeta: string): Promise<CarpetaArchivos>
  /** Un archivo de una skill de la lista, solo lectura. */
  archivoSkill(id: string, archivo: string): Promise<ContenidoArchivo>
  /** Avisa cuando cambia una skill propia o el formato de un proyecto (`docs/README.md`, `CLAUDE.md`). */
  alCambiarSkills(escuchar: () => void): () => void
  /** El menú de la tarjeta (R-7, D-089): cambia el estado de la ficha (sin ficha, la crea). */
  estadoProyecto(ruta: string, estado: Estado): Promise<ResultadoFicha>
  /** Archivar (true) o desarchivar (false): la carpeta no se mueve. */
  archivarProyecto(ruta: string, archivado: boolean): Promise<ResultadoFicha>
  /** Abre el cuadro para elegir una imagen del proyecto como ícono. */
  iconoProyecto(ruta: string): Promise<ResultadoFicha>
  /** El proyecto; con `archivo` (relativo, con `/`), ese archivo en su línea (Archivos). */
  abrirEnVsCode(ruta: string, archivo?: string, linea?: number | null): Promise<ResultadoAbrir>
  abrirCarpetaProyecto(ruta: string): Promise<ResultadoAbrir>
  /** Crea la carpeta con la plantilla básica del framework (C-10, R-14); la IA no interviene. */
  nuevoProyecto(nombre: string): Promise<ResultadoNuevo>
  /** Mira la carpeta antes de eliminarla (R-10): qué se borra definitivamente y qué va a la papelera. No toca nada. */
  planEliminarProyecto(ruta: string): Promise<ResultadoPlanEliminar>
  /**
   * Ya confirmado: borra lo regenerable y manda el resto a la papelera de Windows (D-006, D-090). Usa el plan que
   * armó `planEliminarProyecto` del lado principal: la ventana no dice qué borrar.
   */
  eliminarProyecto(ruta: string): Promise<ResultadoFicha>
  /** El trabajo del proyecto (W-11): los `T-n` de `docs/trabajo.md` o, con framework viejo, sus ideas (R-8). */
  trabajoProyecto(ruta: string): Promise<TrabajoProyecto>
  /**
   * La sección Ideas del proyecto (D-130): los `T-n` con `Idea:` y los `nueva` sin él; se relee con `alCambiarDocs`.
   * Con la carpeta Ideas (`rutaGeneral`), las ideas sueltas del inicio: `sueltas.md` y sus notas en `sueltas/` (ID-I4).
   * Lo mismo vale para los canales de Ideas que siguen.
   */
  ideasProyecto(ruta: string): Promise<IdeasDeProyecto>
  /** Anota lo escrito en el campo de arriba (ID-1, ID-4): una idea con su nota, o un enlace para revisar. */
  /** Con las imágenes pegadas en el campo (R-87), que van al final de la nota. */
  anotarIdea(
    ruta: string,
    escrito: string,
    imagenes?: { mime: string; base64: string }[],
  ): Promise<ResultadoIdea>
  /** Aprobar (`pendiente`), rechazar (`descartado`), volver a sin evaluar (`nueva`) o marcar revisado (`hecho`). */
  estadoIdea(ruta: string, codigo: string, estado: EstadoDesdeIdeas): Promise<ResultadoIdea>
  /** La nota de una idea del usuario, sin el título (`docs/ideas/T-n.md`). */
  notaIdea(ruta: string, codigo: string): Promise<NotaIdea>
  /** Guarda una idea abierta: la primera línea es el título y el resto, la nota (ID-2). */
  guardarIdea(ruta: string, codigo: string, escrito: string): Promise<ResultadoIdea>
  /** Una imagen pegada en una idea abierta: `docs/ideas/T-n/AAAA-MM-DD-n.<ext>` (ID-2). */
  pegarImagenIdea(ruta: string, codigo: string, mime: string, base64: string): Promise<ImagenPegada>
  /** La imagen del portapapeles de Windows, para cuando el pegado no la trae a la ventana (Q-189). Solo lee. */
  imagenDelPortapapeles(): Promise<ImagenDelPortapapeles>
  /** Borra una idea del usuario o un enlace, con su nota y sus imágenes (ID-8). */
  borrarIdea(ruta: string, codigo: string): Promise<ResultadoIdea>
  /**
   * Mover a un proyecto (ID-7): la idea pasa de `desde` (las sueltas) a `hacia`, un proyecto con framework, sin
   * evaluar, con su nota y sus imágenes; devuelve su código allá.
   */
  moverIdea(desde: string, codigo: string, hacia: string): Promise<ResultadoIdea>
  /** Las skills de `.claude/skills/` del proyecto (R-8). */
  skillsProyecto(ruta: string): Promise<SkillProyecto[]>
  /** La sección Diseño (DS-11 a DS-13): los grupos de maquetas, el sistema y la base `maqueta://` de las miniaturas. */
  abrirDiseno(ruta: string): Promise<VistaDiseno>
  /** Agrandar una maqueta la marca vista (DS-3: se va el punto). */
  marcarVista(ruta: string, archivo: string): Promise<void>
  /** Manda a la conversación del proyecto un pedido de Diseño (gasta uso; la ventana lo dice antes). */
  pedirDiseno(ruta: string, pedido: PedidoDiseno): Promise<void>
  /** Avisa qué archivos de `docs/diseno/` cambiaron en un proyecto. */
  alCambiarDiseno(escuchar: (cambio: CambioDiseno) => void): () => void
  /** Esc dentro de la maqueta grande, fuera del modo comentar: la sección vuelve al lienzo (DS-4). */
  alEscapeDiseno(escuchar: () => void): () => void
  /** ← o → dentro de la maqueta grande, sin estar escribiendo: la anterior (-1) o la siguiente (1) (R-24). */
  alFlechaDiseno(escuchar: (paso: 1 | -1) => void): () => void
  /** El modo comentar de la maqueta grande se prendió o se apagó (F8, Esc o el botón Comentar). */
  alComentarDiseno(escuchar: (comentando: boolean) => void): () => void
}

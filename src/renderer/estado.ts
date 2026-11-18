// Estado de la ventana (Zustand). Cada proyecto abierto guarda su vista en memoria: cambiar de sección o de
// proyecto no recarga nada (D-020, H-6).
import { create } from 'zustand'
import { SIN_ANCHOS } from '../compartido/ancho-conversacion'
import { type Cita, sumarCita } from '../compartido/citas'
import {
  type AccesoVersiones,
  ANCHO_LISTA_IDEAS,
  ANCHO_LISTA_SKILLS,
  type CambioConversacion,
  type ConversacionProyecto,
  type Destino,
  type Entrada,
  type EstadoArranque,
  type EstadoMotor,
  type FichaSesion,
  type ListaProyectos,
  type PendientesProyecto,
  type PendienteVista,
  type Preferencias,
  type SinArmar,
  type TarjetaProyecto,
  type UsoSuscripcion,
  type VersionNueva,
} from '../compartido/puente'
import type { Borrador } from '../compartido/respuestas'
import { seccionDeEntrada } from './secciones/proyecto/entrada'
import { guardarLuego } from './ui/guardarLuego'

export type Seccion = 'proyectos' | 'skills' | 'ideas' | 'proyecto'

/** Las secciones de la ventana de Ajustes (AJ-W1); el frente Compartir suma las suyas. */
export type SeccionAjustes = 'perfil' | 'ia' | 'apariencia' | 'proyectos' | 'acerca'

/** Las secciones de la barra de íconos dentro de un proyecto (D-041). */
/** La primera, «pendientes», es la de entrada: lo que espera del usuario y, al pie, los scripts (D-043, Q-62). */
export type SeccionProyecto =
  | 'pendientes'
  | 'mapa'
  | 'ideas'
  | 'docs'
  | 'archivos'
  | 'revision'
  | 'git'
  | 'scripts'
  | 'skills'
  | 'diseno'

/** Un lugar de Docs: el documento, su sección y, al volver con Atrás, la posición en la que se lo dejó. */
export interface LugarDoc extends Destino {
  arriba?: number
}

/** Un paso atrás (F-4): la sección y, si era Docs o Archivos, lo que se miraba. */
export interface PasoAtras {
  seccion: SeccionProyecto
  doc?: LugarDoc
  archivo?: string | null
  linea?: number | null
  comentario?: string | null
}

/** Lo que cada proyecto recuerda mientras la app está abierta. */
export interface VistaProyecto {
  seccion: SeccionProyecto
  /** El documento abierto en Docs (null = el primero: `estado.md`). */
  doc: LugarDoc | null
  /** Para volver en un paso (Atrás, Alt+←). */
  atras: PasoAtras[]
  /** El archivo abierto en Archivos y las carpetas abiertas del árbol. */
  archivo: string | null
  /** La línea marcada del archivo (al abrirlo desde un comentario de la Revisión); null = ninguna. */
  linea: number | null
  carpetas: string[]
  /** El comentario de la Revisión que se ve entero (`R-14`); null = la lista. */
  comentario: string | null
  /** Lo elegido en Git: un commit, `sin-guardar` o null (lo primero que haya). */
  commit: string | null
  /** El archivo sin guardar que se mira solo en Git; null = la lista de todos. */
  archivoGit: string | null
  /** Las secciones plegadas del panel de Git (`cambios`, `preparados`, `historial`). */
  gitPlegadas: string[]
  /** Tocó Nueva: se ve una conversación en blanco que empieza con el primer mensaje o con Seguí. */
  enBlanco: boolean
  /** La maqueta que Diseño abre grande al entrar (desde un comentario de la Revisión); null = el lienzo. */
  maqueta: string | null
  /** La pestaña elegida del Mapa (la clave de un frente, `hitos` o `por-empezar`); null = el frente activo (D-145). */
  pestanaMapa: string | null
  /** El Mapa muestra también los frentes archivados: en uso y sin nada por hacer (R-91, D-152). */
  mapaArchivados: boolean
}

const VISTA_INICIAL: VistaProyecto = {
  seccion: 'pendientes',
  doc: null,
  atras: [],
  archivo: null,
  linea: null,
  carpetas: [],
  comentario: null,
  commit: null,
  archivoGit: null,
  gitPlegadas: [],
  enBlanco: false,
  maqueta: null,
  pestanaMapa: null,
  mapaArchivados: false,
}

/** Hasta dónde se recuerda para volver. */
const PASOS_ATRAS = 50

/** La conversación de un proyecto como la ve la ventana: se guarda mientras la app está abierta (H-6). */
export type ConversacionVista = Omit<ConversacionProyecto, 'ficha'>

/**
 * Un aviso de H-13: la IA de un proyecto que no está a la vista terminó (con las preguntas que dejó) o falló. No hay
 * lista de avisos: lo que queda después es la pestaña.
 */
export interface AvisoSesion {
  id: number
  ruta: string
  estado: 'terminada' | 'error'
  preguntas: number
  frenan: number
  motivo: string | null
}

/** Lo que recuerda la sección Skills mientras Iridium está abierto (H-6). */
export interface VistaSkills {
  /** La skill elegida (su `id`), `framework` o null (la primera vez: Framework si hay alguno fuera, si no la primera propia). */
  elegida: string | null
  /** En Framework, el proyecto con su lista de avisos abierta (T-48); null = ninguno. */
  avisosDe: string | null
  /** Los grupos plegados por origen; null = como empiezan (los de afuera, plegados si pasan de 10). */
  plegados: string[] | null
  /** La skill a la que se le sacó «Sobre la skill …» con la ✕; al elegir otra, vuelve. */
  sinSobre: string | null
  /** Los proyectos a los que se les mandó Pasar al framework desde acá: su «Pasando al framework…» es por eso. */
  enviados: string[]
  /** Por skill (su `id`): el archivo que se mira (null = el Resumen) y las carpetas abiertas del árbol (Q-95). */
  archivos: Record<string, { archivo: string | null; carpetas: string[] }>
}

interface EstadoApp {
  seccion: Seccion
  /** Ruta del proyecto que se ve en la vista del proyecto. */
  proyectoAbierto: string | null
  vistas: Record<string, VistaProyecto>
  lista: ListaProyectos | null
  preferencias: Preferencias
  motor: EstadoMotor
  /** Se está iniciando sesión en Claude (CO-I1): el navegador está abierto. */
  iniciandoSesion: boolean
  conversaciones: Record<string, ConversacionVista>
  /** Las sesiones abiertas desde que se abrió la app, en el orden en que se abrieron (H-2). */
  fichas: FichaSesion[]
  /** Los pendientes de cada proyecto que se miró, tal como llegaron. */
  pendientes: Record<string, PendientesProyecto>
  /** Lo escrito en cada pendiente y todavía no enviado, por `ruta|Q-n`: no se pierde al cambiar (W-5). */
  borradores: Record<string, Borrador>
  /** Texto que otra sección dejó para el campo de la conversación de un proyecto, sin enviarlo (Pedírselo a la IA). */
  paraElCampo: Record<string, string>
  /** Lo citado arriba del campo de la conversación de cada proyecto, sin enviar (Q-182): sale con el próximo mensaje. */
  citas: Record<string, Cita[]>
  /** Cita algo en la conversación del proyecto; lo mismo otra vez la reemplaza. */
  citar(ruta: string, cita: Cita): void
  /** Saca una cita (la ✕); sin clave, todas (al enviar). */
  quitarCita(ruta: string, clave?: string): void
  /** Lo escrito en el cuadro de cada conversación y no enviado, por ruta (D-060): se guarda en disco. */
  escritos: Record<string, string>
  ponerEscritos(escritos: Record<string, string>): void
  /** Cambia lo escrito en el cuadro de una conversación y lo guarda en un momento. */
  escribir(ruta: string, texto: string): void
  /** Al abrir Iridium, vuelve al proyecto que estaba abierto (D-060), si sigue en la carpeta. Una sola vez. */
  volverAlAbierto(): void
  /** El uso de la suscripción (H-12); null hasta que se lee. */
  uso: UsoSuscripcion | null
  ponerUso(uso: UsoSuscripcion): void
  /** El arranque del período (frente Arranque): el detalle del uso y el aviso al volver; null hasta que se lee. */
  arranque: EstadoArranque | null
  ponerArranque(arranque: EstadoArranque): void
  /** Los avisos de H-13 a la vista, del más viejo al más nuevo. */
  avisos: AvisoSesion[]
  quitarAviso(id: number): void
  skills: VistaSkills
  cambiarSkills(cambio: Partial<VistaSkills>): void
  /** Lleva a Skills › Framework; con un proyecto, con su lista de avisos abierta (W-13, T-48, T-51). */
  verFramework(ruta?: string): void
  /** La ventana de Ajustes (AJ-W1): si está abierta y en qué sección (la última, mientras Iridium está abierto). */
  ajustes: { abierta: boolean; seccion: SeccionAjustes }
  abrirAjustes(seccion?: SeccionAjustes): void
  cerrarAjustes(): void
  /**
   * Cambia un ajuste en el acto (el ancho de lectura se ve ya) y lo guarda; si no se pudo guardar, vuelve atrás en pantalla y
   * devuelve false (modulos/apariencia/ux.md › Flujos).
   */
  cambiarAjustes(cambio: Partial<Preferencias>): Promise<boolean>
  /** Se quiso cerrar con sesiones trabajando (F-6): sus rutas; null = no se está preguntando. */
  cierre: string[] | null
  /** null cierra la confirmación: es Cancelar, y si era para reiniciar con Actualizar, cerrar después ya no reinicia. */
  ponerCierre(trabajando: string[] | null): void
  /** La versión nueva lista para entrar al cerrar (CO-I2). */
  versionNueva: VersionNueva | null
  ponerVersionNueva(v: VersionNueva | null): void
  /** Los cambios sin armar (CO-I6); null en desarrollo. */
  sinArmar: SinArmar | null
  ponerSinArmar(s: SinArmar | null): void
  /** Si la copia compartida ve las versiones de GitHub (Q-123); null si no es una copia compartida. */
  accesoVersiones: AccesoVersiones | null
  ponerAccesoVersiones(a: AccesoVersiones | null): void
  /** Se tocó Actualizar con una versión lista: la confirmación de F-6, si aparece, habla de reiniciar. */
  reiniciando: boolean
  reiniciarAhora(): void
  /**
   * Se tocó Actualizar sin versión lista (R-12): arma y, cuando aparece una versión lista distinta de la que había
   * (`antes`, su fecha), reinicia sola. null = no se pidió.
   */
  actualizarPedido: { antes: string | null } | null
  ponerActualizarPedido(p: { antes: string | null } | null): void
  /** «Esperar» en la confirmación de F-6 al reiniciar: reinicia sola cuando ninguna sesión trabaja. */
  reiniciarAlTerminar: boolean
  esperarParaReiniciar(): void
  /** Escribe en el campo de la conversación del proyecto; no lo envía. */
  escribirEnCampo(ruta: string, texto: string): void
  soltarCampo(ruta: string): void
  irA(seccion: Exclude<Seccion, 'proyecto'>): void
  /** Los pendientes dentro del proyecto (su primera sección): desde un aviso o desde el proyecto mismo. */
  responderEn(ruta: string): void
  ponerPendientes(p: PendientesProyecto): void
  /** Cambia un pendiente después de guardarlo, sin esperar a que se relea el proyecto. */
  ponerPendiente(ruta: string, p: PendienteVista): void
  escribirBorrador(ruta: string, codigo: string, b: Borrador): void
  soltarBorrador(ruta: string, codigo: string): void
  /** `entrada`: la sección por la que se entra si es la primera vez (si no, la de W-3). */
  abrirProyecto(ruta: string, entrada?: SeccionProyecto): void
  /** El botón de arriba a la izquierda: siempre a Proyectos, aunque se viniera de Skills o Ideas (R-62). */
  irAlInicio(): void
  /** × en una pestaña (D-043): deja de estar en la barra; si era el abierto, se vuelve al inicio. */
  cerrarPestana(ruta: string): void
  cambiarVista(ruta: string, cambio: Partial<VistaProyecto>): void
  /** Cambia la sección del proyecto (desde la barra de íconos: no se guarda para Atrás). */
  irASeccion(ruta: string, seccion: SeccionProyecto): void
  /** Cambia la sección desde un enlace: lo de antes queda para Atrás. */
  abrirSeccion(ruta: string, seccion: SeccionProyecto): void
  /** Abre un documento en Docs; lo de antes queda para Atrás (F-4). */
  abrirDoc(ruta: string, doc: LugarDoc, arriba?: number): void
  /** Abre un archivo en Archivos con sus carpetas abiertas (y la línea marcada); lo de antes queda para Atrás. */
  abrirArchivo(ruta: string, archivo: string, linea?: number): void
  /** Abre un comentario en Revisión (null = la lista); lo de antes queda para Atrás. */
  abrirComentario(ruta: string, codigo: string | null): void
  /** Abre Diseño con una maqueta grande (relativa a `docs/diseno/`), desde un comentario; lo de antes queda para Atrás. */
  abrirMaqueta(ruta: string, maqueta: string): void
  /** Abre `docs/trabajo.md` en Docs, en ese `T-n` (F-4; sin la sección Trabajo, D-112); lo de antes queda para Atrás. */
  abrirTrabajo(ruta: string, codigo: string): void
  /** Vuelve un paso: a la sección, al documento o al archivo de antes. */
  volver(ruta: string): void
  ponerLista(lista: ListaProyectos): void
  ponerMotor(motor: EstadoMotor): void
  /** Abre el inicio de sesión de Claude en el navegador (CO-I1); el estado nuevo llega solo al terminar. */
  iniciarSesion(): void
  ponerPreferencias(p: Preferencias): void
  ponerConversacion(c: ConversacionProyecto): void
  sumarAnteriores(ruta: string, entradas: ConversacionProyecto['entradas']): void
  aplicarCambio(c: CambioConversacion): void
  /** Cambia una preferencia en el acto y la guarda en `config.json`. */
  guardarPreferencias(cambio: Partial<Preferencias>): void
}

export const usarEstado = create<EstadoApp>((set, get) => ({
  seccion: 'proyectos',
  proyectoAbierto: null,
  vistas: {},
  lista: null,
  preferencias: {
    verArchivados: false,
    anchoConversacion: SIN_ANCHOS,
    anchoListaSkills: ANCHO_LISTA_SKILLS.inicial,
    anchoListaIdeas: ANCHO_LISTA_IDEAS.inicial,
    anchoHoja: 'normal',
    pestanas: [],
    ajustesIa: {},
    filtrosBandeja: {},
    abierto: null,
    nombreUsuario: '',
    nombreIa: '',
    tono: '',
    arranque: { prendido: false, hora: '03:00' },
  },
  skills: { elegida: null, avisosDe: null, plegados: null, sinSobre: null, enviados: [], archivos: {} },
  cambiarSkills: (cambio) => set((s) => ({ skills: { ...s.skills, ...cambio } })),
  verFramework: (ruta) => {
    get().cambiarSkills({ elegida: 'framework', avisosDe: ruta ?? null })
    get().irA('skills')
  },
  ajustes: { abierta: false, seccion: 'perfil' },
  abrirAjustes: (seccion) =>
    set((s) => ({ ajustes: { abierta: true, seccion: seccion ?? s.ajustes.seccion } })),
  cerrarAjustes: () => set((s) => ({ ajustes: { ...s.ajustes, abierta: false } })),
  cambiarAjustes: async (cambio) => {
    const antes = Object.fromEntries(
      Object.keys(cambio).map((k) => [k, get().preferencias[k as keyof Preferencias]]),
    ) as Partial<Preferencias>
    set({ preferencias: { ...get().preferencias, ...cambio } })
    try {
      await window.iridium.guardarPreferencias(cambio)
      return true
    } catch {
      set({ preferencias: { ...get().preferencias, ...antes } })
      return false
    }
  },
  motor: { tipo: 'verificando' },
  iniciandoSesion: false,
  conversaciones: {},
  fichas: [],
  pendientes: {},
  borradores: {},
  paraElCampo: {},
  citas: {},
  citar: (ruta, cita) =>
    set((s) => ({ citas: { ...s.citas, [ruta]: sumarCita(s.citas[ruta] ?? [], cita) } })),
  quitarCita: (ruta, clave) =>
    set((s) => {
      const quedan = clave === undefined ? [] : (s.citas[ruta] ?? []).filter((c) => c.clave !== clave)
      const { [ruta]: _, ...resto } = s.citas
      return { citas: quedan.length ? { ...resto, [ruta]: quedan } : resto }
    }),
  escritos: {},
  ponerEscritos: (escritos) => set((s) => ({ escritos: { ...escritos, ...s.escritos } })),
  escribir: (ruta, texto) => {
    set((s) => ({ escritos: { ...s.escritos, [ruta]: texto } }))
    guardarLuego(`escrito|${ruta}`, () => void window.iridium.guardarEscrito(ruta, texto).catch(() => {}))
  },
  volverAlAbierto: () => {
    const s = get()
    const ruta = s.preferencias.abierto
    if (yaSeVolvio || !ruta || s.lista?.tipo !== 'lista') return
    yaSeVolvio = true
    // Solo si se sigue en el inicio: si el usuario ya fue a otro lado mientras cargaba, no se lo saca de ahí.
    if (s.seccion !== 'proyectos' || s.proyectoAbierto) return
    if (tarjetaDe(s.lista, ruta)) s.abrirProyecto(ruta)
    else s.guardarPreferencias({ abierto: null })
  },
  uso: null,
  ponerUso: (uso) => set({ uso }),
  arranque: null,
  ponerArranque: (arranque) => set({ arranque }),
  avisos: [],
  quitarAviso: (id) => set((s) => ({ avisos: s.avisos.filter((a) => a.id !== id) })),
  cierre: null,
  ponerCierre: (cierre) => {
    if (cierre === null && get().cierre) {
      void window.iridium.cancelarCierre()
      set({ reiniciando: false })
    }
    set({ cierre })
  },
  versionNueva: null,
  ponerVersionNueva: (versionNueva) => set({ versionNueva }),
  sinArmar: null,
  ponerSinArmar: (sinArmar) => set({ sinArmar }),
  accesoVersiones: null,
  ponerAccesoVersiones: (accesoVersiones) => set({ accesoVersiones }),
  reiniciando: false,
  reiniciarAhora: () => {
    set({ reiniciando: true, reiniciarAlTerminar: false })
    void window.iridium.reiniciarAhora()
  },
  actualizarPedido: null,
  ponerActualizarPedido: (actualizarPedido) => set({ actualizarPedido }),
  reiniciarAlTerminar: false,
  esperarParaReiniciar: () => {
    get().ponerCierre(null)
    set({ reiniciarAlTerminar: true })
  },
  escribirEnCampo: (ruta, texto) => set((s) => ({ paraElCampo: { ...s.paraElCampo, [ruta]: texto } })),
  soltarCampo: (ruta) =>
    set((s) => {
      const { [ruta]: _, ...resto } = s.paraElCampo
      return { paraElCampo: resto }
    }),
  irA: (seccion) => {
    soltarVista(get())
    set({ seccion })
    noAbierto(get())
  },
  responderEn: (ruta) => {
    get().abrirProyecto(ruta, 'pendientes')
    get().abrirSeccion(ruta, 'pendientes')
  },
  irAlInicio: () => get().irA('proyectos'),
  cerrarPestana: (ruta) => {
    const s = get()
    const ficha = s.fichas.find((f) => f.ruta === ruta)
    if (ficha?.estado === 'trabajando') return
    if (ficha) void window.iridium.cerrarFicha(ruta)
    s.guardarPreferencias({ pestanas: s.preferencias.pestanas.filter((r) => r !== ruta) })
    if (s.proyectoAbierto === ruta) {
      if (s.seccion === 'proyecto') s.irAlInicio()
      set({ proyectoAbierto: null })
    }
  },
  ponerPendientes: (p) => set((s) => ({ pendientes: { ...s.pendientes, [p.ruta]: p } })),
  ponerPendiente: (ruta, p) =>
    set((s) => {
      const actual = s.pendientes[ruta]
      if (actual?.tipo !== 'ok') return {}
      const pendientes = actual.pendientes.map((x) => (x.codigo === p.codigo ? p : x))
      return { pendientes: { ...s.pendientes, [ruta]: { ...actual, pendientes } } }
    }),
  escribirBorrador: (ruta, codigo, b) =>
    set((s) => ({ borradores: { ...s.borradores, [claveBorrador(ruta, codigo)]: b } })),
  soltarBorrador: (ruta, codigo) =>
    set((s) => {
      const { [claveBorrador(ruta, codigo)]: _, ...resto } = s.borradores
      return { borradores: resto }
    }),
  abrirProyecto: (ruta, entrada) => {
    if (get().seccion !== 'proyecto' || get().proyectoAbierto !== ruta) soltarVista(get())
    // Lo que avisaba de este proyecto ya se ve en su conversación. La primera vez se entra por donde dice W-3; después,
    // como se lo dejó.
    set((s) => ({
      seccion: 'proyecto',
      proyectoAbierto: ruta,
      avisos: s.avisos.filter((a) => a.ruta !== ruta),
      ...(s.vistas[ruta]
        ? {}
        : {
            vistas: {
              ...s.vistas,
              [ruta]: { ...VISTA_INICIAL, seccion: entrada ?? seccionDeEntrada(tarjetaDe(s.lista, ruta)) },
            },
          }),
    }))
    // Queda como pestaña aunque no trabaje (D-043), y es al que se vuelve al abrir Iridium (D-060).
    const { pestanas, abierto } = get().preferencias
    if (!pestanas.includes(ruta)) get().guardarPreferencias({ pestanas: [...pestanas, ruta], abierto: ruta })
    else if (abierto !== ruta) get().guardarPreferencias({ abierto: ruta })
  },
  cambiarVista: (ruta, cambio) =>
    set((s) => ({ vistas: { ...s.vistas, [ruta]: { ...vistaDe(s.vistas, ruta), ...cambio } } })),
  irASeccion: (ruta, seccion) => get().cambiarVista(ruta, { seccion }),
  abrirSeccion: (ruta, seccion) => {
    const v = vistaDe(get().vistas, ruta)
    if (v.seccion !== seccion) get().cambiarVista(ruta, { seccion, atras: conPaso(v) })
  },
  abrirDoc: (ruta, doc, arriba) => {
    const v = vistaDe(get().vistas, ruta)
    get().cambiarVista(ruta, { seccion: 'docs', doc: { ...doc }, atras: conPaso(v, arriba) })
  },
  abrirArchivo: (ruta, archivo, linea) => {
    const v = vistaDe(get().vistas, ruta)
    const partes = archivo.split('/').slice(0, -1)
    const carpetas = partes.map((_, i) => partes.slice(0, i + 1).join('/'))
    get().cambiarVista(ruta, {
      seccion: 'archivos',
      archivo,
      linea: linea ?? null,
      carpetas: [...new Set([...v.carpetas, ...carpetas])],
      atras: conPaso(v),
    })
  },
  abrirComentario: (ruta, codigo) => {
    const v = vistaDe(get().vistas, ruta)
    if (v.seccion === 'revision' && v.comentario === codigo) return
    get().cambiarVista(ruta, { seccion: 'revision', comentario: codigo, atras: conPaso(v) })
  },
  abrirMaqueta: (ruta, maqueta) => {
    const v = vistaDe(get().vistas, ruta)
    get().cambiarVista(ruta, { seccion: 'diseno', maqueta, atras: conPaso(v) })
  },
  abrirTrabajo: (ruta, codigo) =>
    get().abrirDoc(ruta, { documento: 'docs/trabajo.md', ancla: codigo.toLowerCase() }),
  volver: (ruta) => {
    const v = vistaDe(get().vistas, ruta)
    const paso = v.atras.at(-1)
    if (!paso) return
    get().cambiarVista(ruta, {
      seccion: paso.seccion,
      atras: v.atras.slice(0, -1),
      // En Docs sin documento elegido se veía el primero (`estado.md`): se vuelve a él.
      ...(paso.seccion === 'docs' ? { doc: paso.doc ? { ...paso.doc } : null } : {}),
      ...(paso.archivo !== undefined ? { archivo: paso.archivo, linea: paso.linea ?? null } : {}),
      ...(paso.comentario !== undefined ? { comentario: paso.comentario } : {}),
    })
  },
  ponerLista: (lista) => set({ lista }),
  ponerMotor: (motor) => set({ motor }),
  iniciarSesion: () => {
    if (get().iniciandoSesion) return
    set({ iniciandoSesion: true })
    void window.iridium
      .iniciarSesion()
      .then((motor) => set({ motor }))
      .catch(() => {})
      .finally(() => set({ iniciandoSesion: false }))
  },
  ponerPreferencias: (preferencias) => set({ preferencias }),
  ponerConversacion: ({ ficha, ...c }) =>
    set((s) => ({
      conversaciones: { ...s.conversaciones, [c.ruta]: c },
      fichas: conFicha(s.fichas, c.ruta, ficha),
    })),
  sumarAnteriores: (ruta, entradas) =>
    set((s) => {
      const c = s.conversaciones[ruta]
      if (!c) return {}
      const anteriores = Math.max(0, c.anteriores - entradas.length)
      return {
        conversaciones: {
          ...s.conversaciones,
          [ruta]: { ...c, anteriores, entradas: [...entradas, ...c.entradas] },
        },
      }
    }),
  aplicarCambio: (cambio) =>
    set((s) => {
      const c = s.conversaciones[cambio.ruta]
      const base: ConversacionVista = c ?? {
        ruta: cambio.ruta,
        id: null,
        origen: 'iridium',
        arrancada: null,
        titulo: null,
        modificada: null,
        usadaAfuera: null,
        entradas: [],
        anteriores: 0,
        contexto: null,
      }
      const nueva: ConversacionVista = cambio.reiniciar
        ? {
            ...base,
            id: cambio.id,
            origen: 'iridium',
            arrancada: cambio.arrancada ?? null,
            titulo: null,
            modificada: null,
            usadaAfuera: null,
            entradas: cambio.entradas,
            anteriores: 0,
            contexto: cambio.contexto,
          }
        : {
            ...base,
            id: cambio.id,
            usadaAfuera: null,
            entradas: juntarEntradas(base.entradas, cambio.entradas),
            contexto: cambio.contexto,
          }
      return {
        conversaciones: { ...s.conversaciones, [cambio.ruta]: nueva },
        fichas: conFicha(s.fichas, cambio.ruta, cambio.ficha),
        avisos: conAviso(s, cambio.ruta, cambio.ficha),
      }
    }),
  guardarPreferencias: (cambio) => {
    set({ preferencias: { ...get().preferencias, ...cambio } })
    void window.iridium.guardarPreferencias(cambio)
  },
}))

/** Lo que se veía, para volver con Atrás. `arriba`: dónde estaba el documento abierto. */
function conPaso(v: VistaProyecto, arriba?: number): PasoAtras[] {
  const paso: PasoAtras = { seccion: v.seccion }
  if (v.seccion === 'docs' && v.doc) paso.doc = arriba === undefined ? v.doc : { ...v.doc, arriba }
  if (v.seccion === 'archivos') {
    paso.archivo = v.archivo
    paso.linea = v.linea
  }
  if (v.seccion === 'revision') paso.comentario = v.comentario
  return [...v.atras, paso].slice(-PASOS_ATRAS)
}

let siguienteAviso = 1
let yaSeVolvio = false

/** En el inicio no hay proyecto al que volver al abrir Iridium. */
function noAbierto(s: EstadoApp): void {
  if (s.preferencias.abierto !== null) s.guardarPreferencias({ abierto: null })
}

/** ¿Es la carpeta del chat de la vista de Proyectos (D-060), en la carpeta Iridium (D-083)? */
export function esGeneral(lista: ListaProyectos | null, ruta: string | null): boolean {
  return ruta !== null && ruta === rutaGeneral(lista)
}

/** ¿Es la carpeta del chat de la sección Skills (D-068), en la carpeta Iridium (D-083)? */
export function esDeSkills(lista: ListaProyectos | null, ruta: string | null): boolean {
  return ruta !== null && ruta === rutaSkills(lista)
}

/**
 * ¿Esa conversación se ve ahora? La de un proyecto, en su vista; la general, en Proyectos y en Ideas; la de Skills, en
 * Skills.
 */
function aLaVista(s: Pick<EstadoApp, 'seccion' | 'proyectoAbierto' | 'lista'>, ruta: string): boolean {
  if (s.seccion === 'proyecto') return s.proyectoAbierto === ruta
  if (s.seccion === 'skills') return esDeSkills(s.lista, ruta)
  return (s.seccion === 'proyectos' || s.seccion === 'ideas') && esGeneral(s.lista, ruta)
}

/**
 * H-13: cuando la IA de un proyecto que no está a la vista termina o falla, aparece su aviso; las preguntas que dejó
 * llegan un momento después y lo completan. Si el proyecto está a la vista, no hay aviso: se ve en la conversación.
 * Si dejó algo de fondo, todavía no terminó: el aviso llega cuando retome y termine (T-65).
 */
function conAviso(s: EstadoApp, ruta: string, ficha: FichaSesion | null): AvisoSesion[] {
  const antes = s.fichas.find((f) => f.ruta === ruta)
  if (!ficha || ficha.estado === 'trabajando' || ficha.fondo?.length || aLaVista(s, ruta)) return s.avisos
  const preguntas = ficha.preguntas.length
  const frenan = ficha.preguntas.filter((q) => q.frena).length
  const aviso = s.avisos.find((a) => a.ruta === ruta)
  if (antes?.estado === 'trabajando')
    return [
      ...s.avisos.filter((a) => a.ruta !== ruta),
      { id: siguienteAviso++, ruta, estado: ficha.estado, preguntas, frenan, motivo: ficha.motivo },
    ]
  if (aviso && aviso.estado === ficha.estado && aviso.preguntas !== preguntas)
    return s.avisos.map((a) => (a === aviso ? { ...a, preguntas, frenan } : a))
  return s.avisos
}

/** Pone, cambia o quita la ficha de un proyecto sin cambiar el orden de las demás. */
function conFicha(fichas: FichaSesion[], ruta: string, ficha: FichaSesion | null): FichaSesion[] {
  const i = fichas.findIndex((f) => f.ruta === ruta)
  if (!ficha) return i < 0 ? fichas : fichas.filter((f) => f.ruta !== ruta)
  if (i < 0) return [...fichas, ficha]
  return fichas.map((f) => (f.ruta === ruta ? ficha : f))
}

/**
 * Al salir de un proyecto que terminó sin error, su ficha se cierra: ya se vio (W-4: la terminada queda hasta que
 * se abre el proyecto). Una con error queda hasta Seguí o ×.
 */
function soltarVista(s: EstadoApp): void {
  const ruta =
    s.seccion === 'proyecto'
      ? s.proyectoAbierto
      : s.seccion === 'proyectos' || s.seccion === 'ideas'
        ? rutaGeneral(s.lista)
        : s.seccion === 'skills'
          ? rutaSkills(s.lista)
          : null
  if (!ruta) return
  const ficha = s.fichas.find((f) => f.ruta === ruta)
  if (ficha?.estado === 'terminada') void window.iridium.cerrarFicha(ficha.ruta)
}

/** La carpeta del chat de la vista de Proyectos (D-060), si está (D-083). */
export function rutaGeneral(lista: ListaProyectos | null): string | null {
  return lista?.iridium.ideas?.ruta ?? null
}

/** La carpeta del chat de la sección Skills (D-068), si está (D-083). */
export function rutaSkills(lista: ListaProyectos | null): string | null {
  return lista?.iridium.skills?.ruta ?? null
}

export function claveBorrador(ruta: string, codigo: string): string {
  return `${ruta}|${codigo}`
}

export function fichaDe(fichas: FichaSesion[], ruta: string | null): FichaSesion | null {
  return fichas.find((f) => f.ruta === ruta) ?? null
}

export function vistaDe(vistas: Record<string, VistaProyecto>, ruta: string): VistaProyecto {
  return vistas[ruta] ?? VISTA_INICIAL
}

/** La tarjeta de un proyecto de la grilla o de una carpeta de la carpeta Iridium (D-083). */
export function tarjetaDe(lista: ListaProyectos | null, ruta: string | null): TarjetaProyecto | null {
  if (lista === null || ruta === null) return null
  const { ideas, skills } = lista.iridium
  if (ideas?.ruta === ruta) return ideas
  if (skills?.ruta === ruta) return skills
  if (lista.tipo !== 'lista') return null
  return lista.proyectos.find((p) => p.ruta === ruta) ?? null
}

/** Las preguntas sin responder de los proyectos no archivados: el número del ícono de Pendientes. */
/** El único total de la app (04-ux.md › Un número que manda): lo de los proyectos no archivados y cuánto frena. */
export function totalBandeja(lista: ListaProyectos | null): { n: number; frenan: number } {
  if (lista?.tipo !== 'lista') return { n: 0, frenan: 0 }
  let n = 0
  let frenan = 0
  for (const p of lista.proyectos) {
    if (p.archivado) continue
    n += p.preguntas.sinResponder
    frenan += p.preguntas.frenan
  }
  return { n, frenan }
}

/** Suma las entradas nuevas; una que ya estaba (la del control al terminar de corregir, W-12) se cambia en su lugar. */
function juntarEntradas(antes: readonly Entrada[], nuevas: readonly Entrada[]): Entrada[] {
  const porId = new Map(nuevas.map((e) => [e.id, e]))
  const r = antes.map((e) => porId.get(e.id) ?? e)
  const vistas = new Set(antes.map((e) => e.id))
  return [...r, ...nuevas.filter((e) => !vistas.has(e.id))]
}

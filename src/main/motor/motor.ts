// La interfaz `Motor` (D-025, 05-arquitectura.md › La interfaz `Motor`): lo que la app le pide al motor, en
// palabras de la app. Nada fuera de `motor/` conoce los tipos del SDK.
import type {
  AjusteIa,
  ContextoConversacion,
  EstadoMotor,
  EstiloRespuesta,
  ModeloIa,
  ReintentoSesion,
  VentanaUso,
} from '../../compartido/puente'

/** Un mensaje de una conversación, sin nada del SDK. */
export type MensajeMotor =
  | { tipo: 'usuario'; texto: string; cuando: number | null }
  /** Markdown, tal como lo escribió la IA. */
  | { tipo: 'ia'; texto: string; cuando: number | null }
  /** Una herramienta que usó la IA, en palabras: «Leyó» `docs/estado.md`. */
  | { tipo: 'herramienta'; accion: string; objeto: string | null }
  /** El usuario la detuvo (así queda en el historial). */
  | { tipo: 'detenida' }

/**
 * Por qué falló un turno, en los motivos propios de la app (05-arquitectura.md › Errores y registros, F-5):
 * sin sesión iniciada, uso agotado (con cuándo se libera, ms), sin conexión con Claude (Defecto 10) o cualquier
 * otra falla.
 */
export type FallaMotor =
  | { tipo: 'sin-sesion' }
  | { tipo: 'uso-agotado'; libera: number | null }
  | { tipo: 'sin-conexion' }
  | { tipo: 'falla' }

/** El uso de la suscripción tal como lo informa Claude Code: cada ventana, si la conoce. */
export interface UsoMotor {
  cincoHoras: VentanaUso | null
  semana: VentanaUso | null
}

export type EventoMotor =
  /** La sesión ya tiene conversación: la nueva o la que retomó. */
  | { tipo: 'conversacion'; id: string }
  | { tipo: 'mensaje'; mensaje: MensajeMotor }
  /**
   * Terminó un turno. `sigue`: hay más mensajes en cola, el siguiente turno arranca solo. `falla`: solo en error.
   */
  | {
      tipo: 'turno'
      resultado: 'ok' | 'detenida' | 'error'
      motivo: string | null
      sigue: boolean
      falla?: FallaMotor
    }
  /**
   * Claude Code no pudo hablar con Claude y va a reintentar (Defecto 10): `intento` de `maximo`, en `esperaMs`.
   * `causa`: sin conexión (no hubo respuesta) o el servidor de Claude que respondió con un error.
   */
  | { tipo: 'reintento'; reintento: ReintentoSesion }
  /** Cuánto contexto lleva la conversación, al terminar cada turno. */
  | { tipo: 'contexto'; contexto: ContextoConversacion }
  /** El uso de la suscripción cambió (llega con las respuestas). */
  | { tipo: 'uso'; uso: UsoMotor }
  /** La sesión se cerró: al terminar el turno sin nada en cola, o porque falló. */
  | { tipo: 'cerrada' }

/** Lo que se sabe al abrir la app, sin mandar mensajes: la cuenta, los modelos y el uso. */
export interface VerificacionMotor {
  estado: EstadoMotor
  uso: UsoMotor | null
}

export type { ModeloIa }

export interface ConversacionGuardada {
  id: string
  modificada: number
  /** El que le da Claude Code: el puesto a mano, su resumen o el primer mensaje. */
  titulo: string | null
}

export interface OpcionesSesion {
  /** La carpeta del proyecto. */
  carpeta: string
  /** La conversación a retomar; null = una nueva. */
  conversacion: string | null
  /** Lo que se agrega a la instrucción del sistema (05-arquitectura.md › Seguí). */
  instruccion: string
  /** El modelo y el esfuerzo del proyecto (C-58); null en cada uno = el de Claude Code. */
  ajuste: AjusteIa
  /** El estilo de respuesta de Claude Code (AJ-3, D-065); null = el que tenga el usuario en Claude Code. */
  tono: string | null
}

export interface SesionMotor {
  /** Manda un mensaje. false si la sesión ya se cerró: hay que abrir otra. */
  enviar(texto: string): boolean
  /** Cambia el modelo y el esfuerzo desde el próximo mensaje. */
  ajustar(ajuste: AjusteIa): void
  /** Cambia el estilo de respuesta desde el próximo mensaje; null = el de Claude Code. */
  ponerTono(tono: string | null): void
  /** Corta el turno en el acto; el turno termina como «detenida». */
  detener(): Promise<void>
  /** Termina la sesión (al cerrar la app). */
  cerrar(): void
}

export interface Motor {
  /** Que Claude Code tenga sesión iniciada y use la suscripción, sin mandar mensajes al modelo; y el uso. */
  verificar(): Promise<VerificacionMotor>
  /**
   * Inicia sesión con la cuenta de Claude (CO-I1): abre el navegador y termina cuando el usuario terminó o cerró la
   * ventana. No dice si salió bien: eso lo dice `verificar`.
   */
  iniciarSesion(): Promise<void>
  /** El uso de la suscripción, sin mandar mensajes (método experimental del SDK; null si no se pudo leer). */
  uso(): Promise<UsoMotor | null>
  /** Cuánto contexto lleva una conversación guardada, sin mandar mensajes; null si no se pudo leer. */
  contexto(carpeta: string, id: string): Promise<ContextoConversacion | null>
  /**
   * Abre una sesión en modo *bypass*, sin preguntas con opciones y con la instrucción del Centro. No gasta uso
   * hasta el primer `enviar`. Se cierra sola cuando termina un turno y no queda nada en cola.
   */
  abrir(opciones: OpcionesSesion, alEvento: (e: EventoMotor) => void): SesionMotor
  /** Los estilos de respuesta de Claude Code (los suyos y los de `~/.claude/output-styles/`), sin mandar mensajes. */
  estilos(): Promise<EstiloRespuesta[] | null>
  /** Las conversaciones guardadas del proyecto (de Iridium y de VS Code), la más reciente primero. */
  conversaciones(carpeta: string): Promise<ConversacionGuardada[]>
  /** Los mensajes de una conversación guardada, en orden. */
  mensajes(carpeta: string, id: string): Promise<MensajeMotor[]>
  /** Las conversaciones guardadas de una carpeta que se mudó pasan a la ruta nueva (D-083). */
  mudarConversaciones(antes: string, despues: string): Promise<void>
}

export interface OpcionesFalso {
  estado?: EstadoMotor
  /** El uso con el que arranca (si no se da, 34 % y 61 %); cada turno suma 2 puntos a las dos ventanas. */
  uso?: UsoMotor | null
  /** Cuánto tarda cada paso de un turno. */
  pasoMs?: number
  /** Lo que «hace» la IA falsa en cada turno (las pruebas lo usan para dejar una `Q-n`). */
  alTurno?: (carpeta: string, texto: string) => Promise<void>
  /** El modelo y el esfuerzo con los que se abre cada sesión o se cambian (para las pruebas). */
  alAjuste?: (carpeta: string, ajuste: AjusteIa) => void
}

/** Los estilos que trae Claude Code (los nombres que usa él), como los informa el motor real. */
export const ESTILOS_FALSOS: EstiloRespuesta[] = [
  { id: 'default', descripcion: null },
  { id: 'Explanatory', descripcion: null },
  { id: 'Learning', descripcion: null },
]

const TODOS: ModeloIa['esfuerzos'] = ['low', 'medium', 'high', 'xhigh', 'max']

/** Los modelos del motor falso: dos con esfuerzo y uno sin. */
export const MODELOS_FALSOS: ModeloIa[] = [
  {
    id: 'default',
    nombre: 'Default (recommended)',
    descripcion: 'Opus · El que usa Claude Code',
    esfuerzos: TODOS,
    modeloReal: 'claude-opus-falso',
    esfuerzoPredeterminado: 'medium',
  },
  {
    id: 'opus',
    nombre: 'Opus',
    descripcion: 'El más capaz',
    esfuerzos: TODOS,
    modeloReal: 'claude-opus-falso',
    esfuerzoPredeterminado: 'medium',
  },
  {
    id: 'haiku',
    nombre: 'Haiku',
    descripcion: 'El más rápido',
    esfuerzos: [],
    modeloReal: 'claude-haiku-falso',
    esfuerzoPredeterminado: null,
  },
]

/** Cuántas veces reintenta el motor falso sin red antes de cortar (el real, 10). */
const REINTENTOS_FALSOS = 3

/** El contexto del motor falso, en tokens: con cuánto empieza una conversación y cuánto suma cada turno. */
const CONTEXTO_FALSO = { inicial: 20_000, porTurno: 30_000, maximo: 200_000 }

/**
 * El motor de las pruebas: no abre Claude Code ni gasta uso. Imita los eventos del real: lee el estado, escribe,
 * termina; un mensaje con «lento» tarda diez veces más (para probar Detener). Un mensaje con «falla», «agotado» o
 * «sin sesión» termina con ese error (F-5); con «sin red», reintenta tres veces sin hacer nada y termina sin conexión,
 * como el real (Defecto 10). Cada turno suma contexto y uso. Guarda las conversaciones en memoria.
 */
export function crearMotorFalso(o: OpcionesFalso = {}): Motor {
  const paso = o.pasoMs ?? 400
  const guardadas = new Map<
    string,
    { carpeta: string; modificada: number; mensajes: MensajeMotor[]; tokens: number }
  >()
  let siguiente = 1
  const hora = 3_600_000
  const inicio = Date.now()
  let uso: UsoMotor | null =
    o.uso === undefined
      ? {
          cincoHoras: { usado: 34, libera: inicio + 2 * hora, agotada: false },
          semana: { usado: 61, libera: inicio + 3 * 24 * hora, agotada: false },
        }
      : o.uso
  const sumarUso = (puntos: number): UsoMotor | null => {
    if (!uso) return null
    const subir = (v: VentanaUso | null): VentanaUso | null =>
      v && { ...v, usado: Math.min(100, v.usado + puntos), agotada: v.agotada || v.usado + puntos >= 100 }
    uso = { cincoHoras: subir(uso.cincoHoras), semana: subir(uso.semana) }
    return uso
  }
  /** Con una sesión, el desglose y la caché de una hora desde ahora; de una guardada, solo el total. */
  const contextoDe = (tokens: number, enSesion = true): ContextoConversacion => ({
    usados: tokens,
    maximo: CONTEXTO_FALSO.maximo,
    porcentaje: Math.round((tokens / CONTEXTO_FALSO.maximo) * 100),
    categorias: enSesion
      ? [
          { id: 'system_prompt', nombre: 'System prompt', tokens: 3_000, clase: 'usado' },
          { id: 'system_tools', nombre: 'System tools', tokens: 12_000, clase: 'usado' },
          { id: 'memory_files', nombre: 'Memory files', tokens: 5_000, clase: 'usado' },
          { id: 'messages', nombre: 'Messages', tokens: tokens - 20_000, clase: 'usado' },
          { id: 'free_space', nombre: 'Free space', tokens: CONTEXTO_FALSO.maximo - tokens, clase: 'libre' },
        ]
      : null,
    cacheMs: 60 * 60_000,
    ultimoPedido: enSesion ? Date.now() : null,
  })
  /** Un turno que termina con un error de F-5 después del primer paso. */
  const fallaDe = (texto: string): FallaMotor | null => {
    if (/sin red/i.test(texto)) return { tipo: 'sin-conexion' }
    if (/agotado/i.test(texto)) return { tipo: 'uso-agotado', libera: uso?.cincoHoras?.libera ?? null }
    if (/sin sesi[oó]n/i.test(texto)) return { tipo: 'sin-sesion' }
    if (/falla/i.test(texto)) return { tipo: 'falla' }
    return null
  }

  /** Sin sesión hasta que se inicia (CO-I1). */
  let estadoFijo = o.estado
  return {
    verificar: async () => {
      const estado = estadoFijo ?? { tipo: 'listo', suscripcion: 'max', modelos: MODELOS_FALSOS }
      // Sin sesión iniciada, Claude Code no dice el uso.
      return { estado, uso: estado.tipo === 'listo' ? uso : null }
    },

    async iniciarSesion() {
      await new Promise((listo) => setTimeout(listo, paso * 2))
      if (estadoFijo?.tipo === 'sin-sesion') estadoFijo = undefined
    },

    uso: async () => uso,

    async contexto(_carpeta, id) {
      const g = guardadas.get(id)
      return g ? contextoDe(g.tokens, false) : null
    },

    estilos: async () => ((estadoFijo ?? { tipo: 'listo' }).tipo === 'listo' ? ESTILOS_FALSOS : null),

    abrir({ carpeta, conversacion, ajuste, tono: tonoInicial }, alEvento) {
      let tono = tonoInicial
      const id = conversacion ?? `falsa-${siguiente++}`
      const guardada = guardadas.get(id) ?? {
        carpeta,
        modificada: Date.now(),
        mensajes: [],
        tokens: CONTEXTO_FALSO.inicial,
      }
      guardadas.set(id, guardada)
      o.alAjuste?.(carpeta, ajuste)
      let cerrada = false
      let anunciada = false
      let temporizadores: NodeJS.Timeout[] = []
      let alDetener: (() => void) | null = null
      const cola: string[] = []

      const emitir = (m: MensajeMotor) => {
        guardada.mensajes.push(m)
        guardada.modificada = Date.now()
        alEvento({ tipo: 'mensaje', mensaje: m })
      }
      const cerrar = () => {
        if (cerrada) return
        cerrada = true
        for (const t of temporizadores) clearTimeout(t)
        alEvento({ tipo: 'cerrada' })
      }
      const turno = (texto: string) => {
        const ms = /lento/i.test(texto) ? paso * 10 : paso
        const falla = fallaDe(texto)
        const pasos: (() => void | Promise<void>)[] = [
          () => emitir({ tipo: 'herramienta', accion: 'Leyó', objeto: 'docs/estado.md' }),
          () =>
            emitir({
              tipo: 'ia',
              // Con un tono elegido, la IA falsa lo dice: así las pruebas ven que llegó a la sesión (AJ-3).
              texto: `Leí \`docs/estado.md\`. Sigo con el **próximo paso**.${tono ? ` (Estilo: ${tono}.)` : ''}`,
              cuando: Date.now(),
            }),
          async () => {
            await o.alTurno?.(carpeta, texto)
            emitir({ tipo: 'herramienta', accion: 'Editó', objeto: 'docs/estado.md' })
          },
          () => emitir({ tipo: 'ia', texto: 'Listo: dejé el estado al día.', cuando: Date.now() }),
        ]
        let detenido = false
        const terminar = () => {
          alDetener = null
          if (falla) {
            cola.length = 0
            if (falla.tipo === 'uso-agotado' && uso?.cincoHoras) {
              uso = { ...uso, cincoHoras: { ...uso.cincoHoras, usado: 100, agotada: true } }
              alEvento({ tipo: 'uso', uso })
            }
            // Sin red, el motivo es el de Claude Code real, en inglés: la app no lo muestra.
            const motivo =
              falla.tipo === 'falla'
                ? 'Claude Code devolvió un error de prueba'
                : falla.tipo === 'sin-conexion'
                  ? 'API Error: Connection refused. Retrying… (prueba)'
                  : null
            alEvento({ tipo: 'turno', resultado: 'error', motivo, sigue: false, falla })
            return cerrar()
          }
          guardada.tokens = Math.min(CONTEXTO_FALSO.maximo, guardada.tokens + CONTEXTO_FALSO.porTurno)
          const sigue = cola.splice(0).join('\n\n')
          alEvento({ tipo: 'turno', resultado: 'ok', motivo: null, sigue: sigue !== '' })
          alEvento({ tipo: 'contexto', contexto: contextoDe(guardada.tokens) })
          const nuevo = sumarUso(2)
          if (nuevo) alEvento({ tipo: 'uso', uso: nuevo })
          if (sigue) turno(sigue)
          else cerrar()
        }
        // Un paso detrás del otro, como la IA de verdad: el siguiente espera a que termine el anterior. Un turno
        // con error termina después del primero; sin red, no hace ninguno: reintenta y termina.
        let intento = 0
        const dar = (i: number) => {
          temporizadores = [
            setTimeout(() => {
              void (async () => {
                if (falla?.tipo === 'sin-conexion') {
                  if (intento >= REINTENTOS_FALSOS) return terminar()
                  intento++
                  alEvento({
                    tipo: 'reintento',
                    reintento: { intento, maximo: REINTENTOS_FALSOS, esperaMs: ms, causa: 'conexion' },
                  })
                  return dar(i)
                }
                await pasos[i]?.()
                if (detenido) return
                if (falla || i >= pasos.length - 1) return terminar()
                dar(i + 1)
              })()
            }, ms),
          ]
        }
        dar(0)
        alDetener = () => {
          detenido = true
          alDetener = null
          for (const t of temporizadores) clearTimeout(t)
          cola.length = 0
          guardada.mensajes.push({ tipo: 'detenida' })
          alEvento({ tipo: 'turno', resultado: 'detenida', motivo: null, sigue: false })
          cerrar()
        }
      }

      return {
        enviar(texto) {
          if (cerrada) return false
          if (!anunciada) {
            anunciada = true
            alEvento({ tipo: 'conversacion', id })
          }
          guardada.mensajes.push({ tipo: 'usuario', texto, cuando: Date.now() })
          // Como el real: lo que llega mientras trabaja se junta para el turno siguiente.
          if (alDetener) cola.push(texto)
          else turno(texto)
          return true
        },
        ajustar(a) {
          o.alAjuste?.(carpeta, a)
        },
        ponerTono(t) {
          tono = t
        },
        async detener() {
          alDetener?.()
        },
        cerrar,
      }
    },

    async conversaciones(carpeta) {
      return [...guardadas.entries()]
        .filter(([, g]) => g.carpeta === carpeta && g.mensajes.length > 0)
        .map(([id, g]) => {
          const primero = g.mensajes.find((m) => m.tipo === 'usuario')
          return { id, modificada: g.modificada, titulo: primero?.tipo === 'usuario' ? primero.texto : null }
        })
        .sort((a, b) => b.modificada - a.modificada)
    },

    async mensajes(_carpeta, id) {
      return [...(guardadas.get(id)?.mensajes ?? [])]
    },

    async mudarConversaciones(antes, despues) {
      for (const g of guardadas.values()) if (g.carpeta === antes) g.carpeta = despues
    },
  }
}

/** Un motor que no puede arrancar (no se encuentra Claude Code): todo lo que se le pide falla con el motivo. */
export function crearMotorQueFalla(motivo: string): Motor {
  return {
    verificar: async () => ({ estado: { tipo: 'falla', motivo }, uso: null }),
    iniciarSesion: async () => {},
    uso: async () => null,
    contexto: async () => null,
    abrir(_opciones, alEvento) {
      let cerrada = false
      return {
        enviar() {
          if (cerrada) return false
          cerrada = true
          queueMicrotask(() => {
            alEvento({ tipo: 'turno', resultado: 'error', motivo, sigue: false, falla: { tipo: 'falla' } })
            alEvento({ tipo: 'cerrada' })
          })
          return true
        },
        ajustar() {},
        ponerTono() {},
        detener: async () => {},
        cerrar() {
          cerrada = true
        },
      }
    },
    estilos: async () => null,
    conversaciones: async () => [],
    mensajes: async () => [],
    mudarConversaciones: async () => {},
  }
}

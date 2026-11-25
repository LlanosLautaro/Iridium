// La interfaz `Motor` (D-025, 05-arquitectura.md › La interfaz `Motor`): lo que la app le pide al motor, en
// palabras de la app. Nada fuera de `motor/` conoce los tipos del SDK.

import type { CapacidadesSesion, ConectorSesion } from '../../compartido/capacidades'
import { type CapacidadesMotor, type ComandoMotor, comandoDe, type Pisa } from '../../compartido/comandos'
import type {
  AjusteIa,
  ContextoConversacion,
  EstadoMotor,
  EstiloRespuesta,
  ModeloIa,
  ReintentoSesion,
  VentanaUso,
} from '../../compartido/puente'

/** Una foto que va dentro de un mensaje (PA-I2), en base64. */
export interface FotoMotor {
  medio: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'
  datos: string
}

/** Un mensaje de una conversación, sin nada del SDK. Las fotos del usuario, si mandó (PA-5). */
export type MensajeMotor =
  | { tipo: 'usuario'; texto: string; cuando: number | null; fotos?: FotoMotor[] }
  /**
   * Markdown, tal como lo escribió la IA. `final`: con él terminó de responder (`end_turn`); si después sigue (un hook
   * de fin de turno le pidió algo más), esa respuesta no se pliega en el proceso de lo que siguió (R-72).
   */
  | { tipo: 'ia'; texto: string; cuando: number | null; final?: boolean }
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
  /**
   * Lo que la IA dejó corriendo de fondo (unas pruebas, un comando largo) cambió: la lista entera de lo que sigue vivo,
   * con su descripción (T-65). Si un turno termina con algo de fondo, la sesión queda abierta: cuando eso termina,
   * Claude Code se lo avisa a la IA y ella retoma sola.
   */
  | { tipo: 'fondo'; tareas: string[] }
  /** La IA retomó sola, sin un mensaje del usuario: terminó algo que había dejado de fondo (T-65). */
  | { tipo: 'retoma' }
  /** La sesión se cerró: al terminar el turno sin nada en cola ni de fondo, o porque falló. */
  | { tipo: 'cerrada' }
  /** La lista de comandos de la carpeta cambió mientras trabajaba (una skill nueva): la lista entera (PA-1). */
  | { tipo: 'comandos'; comandos: ComandoMotor[] }

/** Lo que se sabe al abrir la app, sin mandar mensajes: la cuenta, los modelos y el uso. */
export interface VerificacionMotor {
  estado: EstadoMotor
  uso: UsoMotor | null
}

export type { CapacidadesMotor, ComandoMotor, ModeloIa }

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
  /** Los conectores apagados en Iridium (D-189 › 2): esta sesión no los carga. */
  apagados?: string[]
  /** El navegador del usuario con la extensión «Claude» (Claude in Chrome, D-189 › 4): apagado si no se dice. */
  navegador?: boolean
  /** Windows-MCP para usar la PC (D-189 › 5), con su ejecutable; null o sin decir, la sesión va sin él. */
  pc?: { ejecutable: string } | null
}

export interface SesionMotor {
  /**
   * Manda un mensaje, con sus fotos antes del texto (D-169 › 5). false si la sesión ya se cerró: hay que abrir otra.
   */
  enviar(texto: string, fotos?: FotoMotor[]): boolean
  /** Cambia el modelo y el esfuerzo desde el próximo mensaje. */
  ajustar(ajuste: AjusteIa): void
  /** Cambia el estilo de respuesta desde el próximo mensaje; null = el de Claude Code. */
  ponerTono(tono: string | null): void
  /** Corta el turno en el acto; el turno termina como «detenida». Si solo espera algo de fondo, lo corta y se cierra. */
  detener(): Promise<void>
  /** Termina la sesión (al cerrar la app). */
  cerrar(): void
}

export interface Motor {
  /** Qué sabe hacer el motor (comandos, fotos y los comandos escondidos), sin gastar (D-169 › 1). */
  capacidades(): CapacidadesMotor
  /**
   * Los comandos con «/» de una carpeta (con los ajustes del usuario, del proyecto y los complementos de Iridium), sin
   * mandar mensajes; falla si no se pudieron leer.
   */
  comandos(carpeta: string): Promise<ComandoMotor[]>
  /**
   * Los complementos y los conectores de una sesión nueva con su estado, sin gastar y sin los apagados de Iridium
   * (Capacidades, D-189 › 1); falla si no se pudo saber.
   */
  capacidadesSesion(): Promise<CapacidadesSesion>
  /**
   * Inicia sesión en un conector (D-189 › 3, PA-8): abre el navegador desde una consola y termina cuando el usuario
   * terminó o la cerró. No dice si salió bien: eso lo dice `capacidadesSesion`.
   */
  conectar(nombre: string): Promise<void>
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
  /** false: un motor sin comandos con «/» (PA-6). */
  comandos?: boolean
  /** false: un motor que no recibe fotos (PA-6). */
  fotos?: boolean
  /** false: un motor sin complementos ni conectores (Capacidades no aparece). */
  capacidades?: boolean
  /** La consola de adentro: Conectar corre ahí un `echo`, como el real corre `claude mcp login`. */
  consola?: (nombre: string, comando: string) => Promise<void>
  /** Los conectores apagados con que se abre cada sesión (para las pruebas). */
  alApagados?: (carpeta: string, apagados: string[]) => void
  /** Si cada sesión se abre con el navegador (para las pruebas). */
  alNavegador?: (carpeta: string, navegador: boolean) => void
  /** Con qué Windows-MCP se abre cada sesión; null, sin la PC (para las pruebas). */
  alPc?: (carpeta: string, pc: { ejecutable: string } | null) => void
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

const motorFalso = (
  nombre: string,
  descripcion: string,
  extra: Partial<Omit<ComandoMotor, 'nombre' | 'descripcion'>> = {},
): ComandoMotor => ({
  nombre,
  otrosNombres: [],
  argumentos: null,
  descripcion,
  origen: 'motor',
  complemento: null,
  escondido: null,
  ...extra,
})

/**
 * Los comandos del motor falso: unos del motor (con escondidos y otros nombres), uno de una skill propia y dos de
 * complementos, como los da el real (`research/comandos-y-adjuntos-del-motor.md`).
 */
export const COMANDOS_FALSOS: ComandoMotor[] = [
  motorFalso('compact', 'Free up context by summarizing the conversation so far', {
    argumentos: '<optional custom summarization instructions>',
  }),
  motorFalso('context', 'Show current context usage', { escondido: 'contexto' }),
  motorFalso('model', 'Set the AI model for Claude Code', { argumentos: '<model>', escondido: 'modelo' }),
  motorFalso('clear', 'Start a new session with empty context', {
    argumentos: '[name]',
    otrosNombres: ['reset', 'new'],
    escondido: 'conversacion',
  }),
  motorFalso('usage', 'Show session cost, plan usage, and what is contributing to your limits', {
    otrosNombres: ['cost', 'stats'],
    escondido: 'uso',
  }),
  motorFalso('color', 'Set the prompt bar color for this session', {
    argumentos: '[red|blue|green]',
    escondido: 'terminal',
  }),
  motorFalso('recap', 'Generate a one-line session recap now'),
  motorFalso('rename', 'Rename the current conversation', { argumentos: '[name]', otrosNombres: ['name'] }),
  motorFalso('code-review', 'Review the current diff for correctness bugs', {
    argumentos: '[low|medium|high]',
  }),
  motorFalso('init', 'Initialize a new CLAUDE.md file with codebase documentation'),
  motorFalso('mi-skill', 'Una skill propia de prueba', { origen: 'skill' }),
  motorFalso('engineering:debug', 'Structured debugging session — reproduce, isolate, diagnose, and fix', {
    argumentos: '<error message or problem description>',
    origen: 'complemento',
    complemento: 'engineering',
  }),
  motorFalso('design:ux-copy', 'Write or review UX copy — microcopy, error messages, empty states', {
    argumentos: '<context or copy to review>',
    otrosNombres: ['ux-copy'],
    origen: 'complemento',
    complemento: 'design',
  }),
]

/** La skill que «descubre» el motor falso con un mensaje que dice «skill nueva» (el evento `comandos`, PA-1). */
export const SKILL_NUEVA_FALSA: ComandoMotor = motorFalso(
  'skill-nueva',
  'Una skill que apareció mientras trabajaba',
  {
    origen: 'skill',
  },
)

/** Los complementos del motor falso: dos de la cuenta, como los de S-8 (Capacidades, PA-7). */
export const COMPLEMENTOS_FALSOS: CapacidadesSesion['complementos'] = [
  { nombre: 'engineering', autor: 'Anthropic', origen: 'cuenta', skills: 10, conectores: 3 },
  { nombre: 'design', autor: 'Anthropic', origen: 'cuenta', skills: 7, conectores: 1 },
]

/** Los conectores del motor falso, uno en cada estado; Conectar deja conectado al que lo pide. */
export const CONECTORES_FALSOS: ConectorSesion[] = [
  { nombre: 'claude.ai Claude Docs', estado: 'conectado' },
  { nombre: 'plugin:design:figma', estado: 'falta-sesion' },
  { nombre: 'plugin:engineering:linear', estado: 'falta-sesion' },
  { nombre: 'plugin:engineering:datadog', estado: 'falla' },
  { nombre: 'plugin:engineering:gmail', estado: 'sin-configurar' },
]

/** Los escondidos de una lista, por su nombre y sus otros nombres (D-169 › 3). */
export function escondidosDe(lista: readonly ComandoMotor[]): Record<string, Pisa> {
  const salida: Record<string, Pisa> = {}
  for (const c of lista)
    if (c.escondido) for (const n of [c.nombre, ...c.otrosNombres]) salida[n.toLowerCase()] = c.escondido
  return salida
}

/** Cuántas veces reintenta el motor falso sin red antes de cortar (el real, 10). */
const REINTENTOS_FALSOS = 3

/** El contexto del motor falso, en tokens: con cuánto empieza una conversación y cuánto suma cada turno. */
const CONTEXTO_FALSO = { inicial: 20_000, porTurno: 30_000, maximo: 200_000 }

/**
 * El motor de las pruebas: no abre Claude Code ni gasta uso. Imita los eventos del real: lee el estado, escribe,
 * termina; un mensaje con «lento» tarda diez veces más (para probar Detener). Un mensaje con «falla», «agotado» o
 * «sin sesión» termina con ese error (F-5); con «de fondo», deja algo corriendo y retoma sola al rato (T-65); con «sin red», reintenta tres veces sin hacer nada y termina sin conexión,
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
  /** La lista de comandos: crece con la skill nueva de un mensaje que la nombra. */
  let comandos = [...COMANDOS_FALSOS]
  const conComandos = o.comandos ?? true
  const conFotos = o.fotos ?? true
  const conCapacidades = o.capacidades ?? true
  /** Los conectores con su estado: Conectar los deja conectados. */
  const conectores = CONECTORES_FALSOS.map((c) => ({ ...c }))
  return {
    capacidades: () => ({
      conectores: conCapacidades,
      comandos: conComandos,
      fotos: conFotos
        ? {
            medios: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
            maxBytes: 5 * 2 ** 20,
            maxLado: 8000,
          }
        : null,
      escondidos: conComandos ? escondidosDe(comandos) : {},
    }),

    async comandos() {
      if (!conComandos) return []
      await new Promise((listo) => setTimeout(listo, paso))
      return [...comandos]
    },

    async capacidadesSesion() {
      if (!conCapacidades) throw new Error('Este motor no tiene complementos ni conectores')
      await new Promise((listo) => setTimeout(listo, paso))
      return {
        complementos: COMPLEMENTOS_FALSOS.map((c) => ({ ...c })),
        conectores: conectores.map((c) => ({ ...c })),
      }
    },

    async conectar(nombre) {
      if (o.consola) await o.consola(`Conectar ${nombre}`, `echo Conectando ${nombre}`)
      else await new Promise((listo) => setTimeout(listo, paso * 2))
      const c = conectores.find((x) => x.nombre === nombre)
      if (c) c.estado = 'conectado'
    },

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

    abrir({ carpeta, conversacion, ajuste, tono: tonoInicial, apagados, navegador, pc }, alEvento) {
      let tono = tonoInicial
      o.alApagados?.(carpeta, apagados ?? [])
      o.alNavegador?.(carpeta, navegador ?? false)
      o.alPc?.(carpeta, pc ?? null)
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
      let esperandoFondo = false
      const cola: { texto: string; fotos: number }[] = []

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
      /** Lo que la IA falsa dice que vio (PA-I2): las fotos, los archivos y los textos pegados, para las pruebas. */
      const vio = (texto: string, fotos: number): string => {
        const archivos =
          /<iridium-archivos>\n([\s\S]*?)\n<\/iridium-archivos>/.exec(texto)?.[1]?.split('\n').length ?? 0
        const pegados = texto.match(/<iridium-pegado /g)?.length ?? 0
        const partes = [
          fotos > 0 && `${fotos} ${fotos === 1 ? 'foto' : 'fotos'}`,
          archivos > 0 && `${archivos} ${archivos === 1 ? 'archivo' : 'archivos'}`,
          pegados > 0 && `${pegados} ${pegados === 1 ? 'texto pegado' : 'textos pegados'}`,
        ].filter(Boolean)
        return partes.length ? ` Vi ${partes.join(', ')}.` : ''
      }
      const turno = (texto: string, fotos = 0) => {
        const ms = /lento/i.test(texto) ? paso * 10 : paso
        const falla = fallaDe(texto)
        // «skill nueva»: mientras trabaja descubre una skill y avisa la lista entera, como el real (`commands_changed`).
        if (/skill nueva/i.test(texto) && !comandos.includes(SKILL_NUEVA_FALSA)) {
          comandos = [...comandos, SKILL_NUEVA_FALSA]
          alEvento({ tipo: 'comandos', comandos: [...comandos] })
        }
        // Un comando lo responde el motor de una (la IA falsa dice cuál recibió y con qué va); sin herramientas.
        const comando = conComandos ? comandoDe(texto) : null
        const pasos: (() => void | Promise<void>)[] = comando
          ? [
              () =>
                emitir({
                  tipo: 'ia',
                  texto: `Recibí el comando \`/${comando.nombre}\`${comando.resto ? ` con: ${comando.resto.split('\n')[0]}` : ''}.${vio(texto, fotos)}`,
                  cuando: Date.now(),
                  final: true,
                }),
            ]
          : [
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
              () =>
                emitir({
                  tipo: 'ia',
                  texto: `Listo: dejé el estado al día.${vio(texto, fotos)}`,
                  cuando: Date.now(),
                  final: true,
                }),
            ]
        // R-72: un hook de fin de turno que le pide algo más a la IA: responde, sigue con una herramienta y responde de nuevo.
        if (!comando && /hook/i.test(texto))
          pasos.splice(
            pasos.length - 1,
            0,
            () =>
              emitir({
                tipo: 'ia',
                texto: 'Primera respuesta, antes del hook.',
                cuando: Date.now(),
                final: true,
              }),
            () => emitir({ tipo: 'herramienta', accion: 'Ejecutó', objeto: 'el control de diseño' }),
          )
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
          const juntos = cola.splice(0)
          const sigue = juntos.map((m) => m.texto).join('\n\n')
          const fotosQueSiguen = juntos.reduce((n, m) => n + m.fotos, 0)
          // «de fondo» (T-65): deja unas pruebas corriendo, termina el turno y retoma sola cuando terminan.
          const deFondo = !sigue && /de fondo/i.test(texto)
          if (deFondo) alEvento({ tipo: 'fondo', tareas: ['Pruebas con la app abierta (de prueba)'] })
          alEvento({ tipo: 'turno', resultado: 'ok', motivo: null, sigue: sigue !== '' })
          alEvento({ tipo: 'contexto', contexto: contextoDe(guardada.tokens) })
          const nuevo = sumarUso(2)
          if (nuevo) alEvento({ tipo: 'uso', uso: nuevo })
          if (sigue) turno(sigue, fotosQueSiguen)
          else if (deFondo) esperarFondo(ms)
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
      /** Lo de fondo tarda tres pasos; al terminar, la IA retoma sola un turno corto y la sesión se cierra. */
      const esperarFondo = (ms: number) => {
        esperandoFondo = true
        temporizadores = [
          setTimeout(() => {
            alDetener = null
            esperandoFondo = false
            alEvento({ tipo: 'fondo', tareas: [] })
            alEvento({ tipo: 'retoma' })
            emitir({ tipo: 'ia', texto: 'Terminaron las pruebas de fondo: pasan todas.', cuando: Date.now() })
            alEvento({ tipo: 'turno', resultado: 'ok', motivo: null, sigue: false })
            cerrar()
          }, ms * 3),
        ]
        // Detener mientras espera corta lo de fondo y cierra la sesión, como el real.
        alDetener = () => {
          alDetener = null
          esperandoFondo = false
          alEvento({ tipo: 'fondo', tareas: [] })
          cerrar()
        }
      }

      return {
        enviar(texto, fotos = []) {
          if (cerrada) return false
          if (!anunciada) {
            anunciada = true
            alEvento({ tipo: 'conversacion', id })
          }
          guardada.mensajes.push({
            tipo: 'usuario',
            texto,
            cuando: Date.now(),
            ...(fotos.length ? { fotos } : {}),
          })
          // Esperando lo de fondo, un mensaje abre un turno (la prueba no espera a que termine).
          if (esperandoFondo) {
            esperandoFondo = false
            alDetener = null
            for (const t of temporizadores) clearTimeout(t)
            alEvento({ tipo: 'fondo', tareas: [] })
            turno(texto, fotos.length)
          }
          // Como el real: lo que llega mientras trabaja se junta para el turno siguiente.
          else if (alDetener) cola.push({ texto, fotos: fotos.length })
          else turno(texto, fotos.length)
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
    capacidades: () => ({ comandos: false, fotos: null, escondidos: {}, conectores: false }),
    comandos: async () => {
      throw new Error(motivo)
    },
    capacidadesSesion: async () => {
      throw new Error(motivo)
    },
    conectar: async () => {},
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

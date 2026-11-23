// Casos de uso de la conversación con la IA (I-2): Seguí y Nueva (H-4), sin esperar al usuario (H-5), Detener
// (H-14) y una sesión por proyecto que sigue aunque no esté a la vista (H-2, H-6, D-015). Recibe el motor y el
// registro de sesiones de afuera: así se prueba con el motor falso.
import { basename } from 'node:path'
import {
  type AdjuntoPedido,
  type AdjuntoVista,
  conAdjuntosDespuesDelComando,
  leerAdjuntos,
  leerAdjuntosDeComando,
  lineasDe,
} from '../../compartido/adjuntos'
import { type CapacidadesMotor, type ComandoMotor, comandoDe, escondidoDe } from '../../compartido/comandos'
import type {
  AjusteIa,
  CambioConversacion,
  ContextoConversacion,
  ConversacionAnterior,
  ConversacionProyecto,
  Entrada,
  EstadoMotor,
  FichaSesion,
  PedidoSeguir,
  PreguntaNueva,
} from '../../compartido/puente'
import { type Aviso, dondeDe, leerMensajeDelControl, mensajeDelControl } from '../core/control'
import {
  AVISO_DETENIDA,
  htmlDeMensaje,
  INSTRUCCION_CENTRO,
  MENSAJE_SEGUI,
  mensajeParaLaIa,
  preguntasNuevas,
  tocadaDespues,
  usadaAfuera,
} from '../core/sesiones'
import type { FinDeTrabajo } from '../core/sonido'
import type { FotoLeida } from '../infra/fotos'
import type { ArchivoSesiones, ResumenSesion } from '../infra/sesiones'
import type {
  EventoMotor,
  FallaMotor,
  FotoMotor,
  MensajeMotor,
  Motor,
  SesionMotor,
  UsoMotor,
} from '../motor/motor'

const SIN_AJUSTE: AjusteIa = { modelo: null, esfuerzo: null }
/** Cuánto se espera, al cerrar la app, a que las sesiones frenadas terminen de guardar su estado (F-6). */
const ESPERA_DETENER_MS = 3000

/** Cuántas entradas se mandan de una vez: lo último al abrir y de a tanto al subir (W-3 › Extremos). */
export const ENTRADAS_POR_VEZ = 150

export interface DependenciasConversacion {
  motor: Motor
  registro: ArchivoSesiones
  /** Las `Q-n` sin responder del proyecto. */
  preguntas: (ruta: string) => Promise<PreguntaNueva[]>
  alCambio: (cambio: CambioConversacion) => void
  /**
   * Cómo se convierte el texto de la IA en HTML para ese proyecto: con sus códigos y citas como enlaces (F-4).
   * Sin esto, Markdown seguro sin enlaces al proyecto.
   */
  html?: (ruta: string) => Promise<(texto: string) => string>
  /** La instrucción de ese proyecto; sin esto, la del Centro. El chat de la vista de Proyectos tiene otra (D-060). */
  instruccionBase?: (ruta: string) => string
  /** Lo que se suma a la instrucción del Centro al abrir la sesión de ese proyecto (los comentarios abiertos, H-R6). */
  instruccion?: (ruta: string) => Promise<string | null>
  /** El modelo y el esfuerzo que eligió el proyecto (C-58). Sin esto, los de Claude Code. */
  ajuste?: (ruta: string) => Promise<AjusteIa>
  /** El tono de la IA en Iridium (AJ-3, D-065), igual para todos los proyectos. Sin esto, el de Claude Code. */
  tono?: () => Promise<string | null>
  /**
   * El estado del motor antes de abrir una sesión: si no estaba listo, lo vuelve a verificar (el usuario pudo
   * iniciar sesión después de abrir la app). Sin esto, se abre siempre.
   */
  motorListo?: () => Promise<EstadoMotor>
  /** Un turno terminó por falta de sesión: el marco tiene que dejar de decir que hay (R-5). */
  alPerderSesion?: () => void
  /** El uso que informa una sesión al terminar cada turno. */
  alUso?: (uso: UsoMotor) => void
  /**
   * El control del proyecto (OR-2): lo mal escrito al terminar un turno, o null si no corre ahí (sin framework, el
   * chat general, el de Skills). Sin esto, no hay control.
   */
  control?: (ruta: string) => Promise<Aviso[] | null>
  /** Una sesión avisó que cambió la lista de comandos de su carpeta (PA-1). */
  alComandos?: (ruta: string, comandos: ComandoMotor[]) => void
  /** Se mandó un comando: va a los usados hace poco (PA-1). */
  alComando?: (nombre: string) => void
  /** Lee una foto para mandarla, achicada si pasa los límites del motor (PA-I2). Sin esto, la foto va como archivo. */
  leerFoto?: (ruta: string, limites: NonNullable<CapacidadesMotor['fotos']>) => Promise<FotoLeida>
  /** Si una ruta es de una foto pegada: su nombre en el mensaje es «Imagen pegada». */
  esPegada?: (ruta: string) => boolean
  /**
   * Terminó un turno, después del control (T-52): cómo, cuánto sigue de fondo y si lo tomó el avance solo. El sonido
   * al terminar decide con esto si suena.
   */
  alTerminar?: (ruta: string, fin: FinDeTrabajo) => void
  /** Una línea para el registro del día (errores del motor; nunca el texto de la conversación). */
  registrar?: (texto: string) => void
  ahora?: () => number
}

interface Proyecto {
  ruta: string
  cargado: boolean
  id: string | null
  origen: ConversacionProyecto['origen']
  titulo: string | null
  /** La conversación que el usuario eligió de las anteriores (H-17); null = la última. */
  elegida: string | null
  /** El texto de la IA en HTML, con los enlaces del proyecto. */
  html: (texto: string) => string
  modificada: number | null
  /** Última vez que el Centro terminó un turno en esta conversación. */
  usoCentro: number | null
  entradas: Entrada[]
  /** El último turno lo cortó el usuario: el próximo mensaje se lo avisa a la IA. */
  detenida: boolean
  /** El turno en marcha es solo de comandos: al terminar, el aviso de «te detuve» sigue pendiente (D-169 › 7). */
  soloComandos: boolean
  sesion: SesionMotor | null
  ficha: FichaSesion | null
  /** Las preguntas sin responder cuando empezó a trabajar: al terminar, las nuevas son las que dejó. */
  antes: ReadonlySet<string>
  /** Los pedidos de un proyecto se atienden de a uno: dos Seguí seguidos no abren dos sesiones. */
  turno: Promise<unknown>
  /** Cuánto contexto lleva la conversación; null si no se sabe todavía. */
  contexto: ContextoConversacion | null
  /** La entrada del control mientras la IA corrige lo que le devolvió (una vez por turno, sin ciclos). */
  controlando: Extract<Entrada, { tipo: 'control' }> | null
  /** El turno terminó y corre el control: la sesión que se cierra mientras tanto no es un error. */
  revisando: boolean
  /** Cuántos mensajes mandó el usuario: si cambia mientras corre el control, ese turno sigue y se revisa después. */
  envios: number
  /** Lo que la IA dejó corriendo de fondo (T-65); va en la ficha mientras haya algo. */
  fondo: string[]
  /** La conversación nueva la abrió el arranque (D-149 › 7): la marca va a su resumen cuando Claude Code le da un id. */
  arranque: number | null
  /** La conversación que se muestra la empezó el arranque: cuándo (la línea de debajo del título, AR-2). */
  arrancada: number | null
  /** La empezó el avance solo (frente Frentes, D-178 › 8): la marca `arranque` va con el motivo. */
  avance: boolean
}

export class Conversaciones {
  private readonly proyectos = new Map<string, Proyecto>()
  /** El contexto de cada conversación que se leyó o que informó una sesión, por id. */
  private readonly contextos = new Map<string, ContextoConversacion>()
  private readonly pidiendoContexto = new Set<string>()
  /** Lo que se guarda al terminar cada turno: al cerrar la app se espera (F-6). */
  private readonly guardando = new Set<Promise<unknown>>()
  private siguiente = 1
  private readonly ahora: () => number

  constructor(private readonly d: DependenciasConversacion) {
    this.ahora = d.ahora ?? Date.now
  }

  private proyecto(ruta: string): Proyecto {
    let p = this.proyectos.get(ruta)
    if (!p) {
      p = {
        ruta,
        cargado: false,
        id: null,
        origen: null,
        titulo: null,
        elegida: null,
        html: htmlDeMensaje,
        modificada: null,
        usoCentro: null,
        entradas: [],
        detenida: false,
        soloComandos: false,
        sesion: null,
        ficha: null,
        antes: new Set(),
        turno: Promise.resolve(),
        contexto: null,
        controlando: null,
        revisando: false,
        envios: 0,
        fondo: [],
        arranque: null,
        arrancada: null,
        avance: false,
      }
      this.proyectos.set(ruta, p)
    }
    return p
  }

  /** De a un pedido por proyecto. */
  private enFila<T>(p: Proyecto, f: () => Promise<T>): Promise<T> {
    const r = p.turno.then(f, f)
    p.turno = r.catch(() => {})
    return r
  }

  private id(): string {
    return `e${this.siguiente++}`
  }

  private entradaDe(p: Proyecto, m: MensajeMotor): Entrada {
    switch (m.tipo) {
      case 'usuario': {
        const control = leerMensajeDelControl(m.texto)
        if (control)
          return {
            tipo: 'control',
            id: this.id(),
            avisos: control.map((a) => ({ ...a, quedo: null })),
            corrigiendo: false,
          }
        const crudo = m.texto.startsWith(AVISO_DETENIDA)
          ? m.texto.slice(AVISO_DETENIDA.length).trim()
          : m.texto
        // Los adjuntos (PA-5): los bloques de Iridium del principio (después del comando, si empieza con uno) y las fotos.
        const comando = comandoDe(crudo) !== null
        const leidos = comando ? leerAdjuntosDeComando(crudo) : { comando: '', ...leerAdjuntos(crudo) }
        const texto = comando
          ? [leidos.comando, leidos.texto.trim()].filter(Boolean).join('\n\n')
          : leidos.texto
        const adjuntos: AdjuntoVista[] = [
          ...(m.fotos ?? []).map((f) => ({
            tipo: 'foto' as const,
            src: `data:${f.medio};base64,${f.datos}`,
            nombre: null,
          })),
          ...leidos.archivos.map((ruta) => ({ tipo: 'archivo' as const, ruta })),
          ...leidos.pegados.map((p) => ({ tipo: 'pegado' as const, ...p })),
        ]
        return {
          tipo: 'usuario',
          id: this.id(),
          texto,
          cuando: m.cuando,
          ...(adjuntos.length ? { adjuntos } : {}),
        }
      }
      case 'ia':
        return {
          tipo: 'ia',
          id: this.id(),
          html: p.html(m.texto),
          cuando: m.cuando,
          ...(m.final ? { final: true } : {}),
        }
      case 'herramienta':
        return { tipo: 'herramienta', id: this.id(), accion: m.accion, objeto: m.objeto }
      case 'detenida':
        return { tipo: 'aviso', id: this.id(), clase: 'detenida', texto: 'Detuviste a la IA.' }
    }
  }

  private emitir(p: Proyecto, entradas: Entrada[], reiniciar = false): void {
    p.entradas.push(...entradas)
    this.d.alCambio({
      ruta: p.ruta,
      id: p.id,
      reiniciar,
      ...(reiniciar ? { arrancada: p.arrancada, avance: p.avance } : {}),
      entradas,
      ficha: this.ficha(p),
      contexto: p.contexto,
    })
  }

  /** La ficha con lo que sigue de fondo, si hay algo (T-65). */
  private ficha(p: Proyecto): FichaSesion | null {
    if (!p.ficha) return null
    return p.fondo.length > 0 ? { ...p.ficha, fondo: p.fondo } : p.ficha
  }

  /** Lee el contexto de la conversación sin mandar nada (una vez por conversación) y lo avisa cuando llega. */
  private leerContexto(p: Proyecto): void {
    const id = p.id
    if (!id || p.contexto || this.pidiendoContexto.has(id)) return
    this.pidiendoContexto.add(id)
    void this.d.motor
      .contexto(p.ruta, id)
      .catch(() => null)
      .then((c) => {
        this.pidiendoContexto.delete(id)
        if (!c) return
        // Del historial no se sabe cuándo fue el último pedido: es cuando se escribió la conversación por última vez.
        if (c.ultimoPedido === null && p.id === id) c.ultimoPedido = p.modificada
        if (!this.contextos.has(id)) this.contextos.set(id, c)
        if (p.id !== id || p.contexto) return
        p.contexto = this.contextos.get(id) ?? c
        this.emitir(p, [])
      })
  }

  private trabajando(p: Proyecto): boolean {
    return p.ficha?.estado === 'trabajando'
  }

  /** Los enlaces del proyecto para el texto de la IA, al día con sus documentos. */
  private async prepararHtml(p: Proyecto): Promise<void> {
    if (!this.d.html) return
    try {
      p.html = await this.d.html(p.ruta)
    } catch {
      p.html = htmlDeMensaje
    }
  }

  /**
   * Lee la última conversación del proyecto (o la que eligió el usuario), salvo que sea la que ya tiene en memoria y
   * nadie la tocó afuera.
   */
  private async cargar(p: Proyecto): Promise<void> {
    if (p.sesion || this.trabajando(p)) return
    let ultima: { id: string; modificada: number; titulo: string | null } | undefined
    try {
      const lista = await this.d.motor.conversaciones(p.ruta)
      ultima = (p.elegida ? lista.find((c) => c.id === p.elegida) : undefined) ?? lista[0]
    } catch {
      if (p.cargado) return
    }
    if (ultima) p.titulo = ultima.titulo
    if (p.cargado && ultima?.id === p.id) {
      if (ultima.modificada === p.modificada || !tocadaDespues(ultima.modificada, p.usoCentro)) return
    }
    p.cargado = true
    if (!ultima) {
      Object.assign(p, {
        id: null,
        origen: null,
        arrancada: null,
        avance: false,
        titulo: null,
        elegida: null,
        modificada: null,
        usoCentro: null,
        entradas: [],
        detenida: false,
        contexto: null,
        controlando: null,
        revisando: false,
        envios: 0,
      })
      return
    }
    await this.prepararHtml(p)
    let mensajes: MensajeMotor[] = []
    try {
      mensajes = await this.d.motor.mensajes(p.ruta, ultima.id)
    } catch {
      // Un historial que no se puede leer: se muestra vacío y Seguí lo retoma igual.
    }
    const resumen = await this.d.registro.de(ultima.id)
    p.id = ultima.id
    p.modificada = ultima.modificada
    p.origen = resumen?.empezadaEn === 'iridium' ? 'iridium' : 'vscode'
    p.arrancada = resumen?.arranque ?? null
    p.avance = p.arrancada !== null && resumen?.motivo === 'avance'
    p.usoCentro = resumen?.ultimoUso ?? null
    p.detenida = resumen?.detenida ?? false
    p.entradas = mensajes.map((m) => this.entradaDe(p, m))
    // El guardado al terminar el último turno, con su desglose, si nadie siguió la conversación después (R-89).
    const guardado =
      resumen?.contexto && !tocadaDespues(ultima.modificada, p.usoCentro) ? resumen.contexto : null
    if (guardado && !this.contextos.has(ultima.id)) this.contextos.set(ultima.id, guardado)
    p.contexto = this.contextos.get(ultima.id) ?? null
  }

  /** La conversación del proyecto para mostrarla. No manda nada al modelo (D-020). */
  abrir(ruta: string): Promise<ConversacionProyecto> {
    const p = this.proyecto(ruta)
    return this.enFila(p, () => this.vista(p))
  }

  private async vista(p: Proyecto): Promise<ConversacionProyecto> {
    await this.cargar(p)
    const enMarcha = p.sesion !== null || this.trabajando(p)
    const afuera =
      enMarcha || p.modificada === null ? null : usadaAfuera(p.modificada, p.usoCentro, this.ahora())
    const desde = Math.max(0, p.entradas.length - ENTRADAS_POR_VEZ)
    if (!enMarcha) this.leerContexto(p)
    return {
      ruta: p.ruta,
      id: p.id,
      origen: p.origen,
      arrancada: p.arrancada,
      avance: p.avance,
      titulo: p.titulo,
      modificada: p.modificada,
      usadaAfuera: afuera,
      entradas: p.entradas.slice(desde),
      anteriores: desde,
      ficha: this.ficha(p),
      contexto: p.contexto,
    }
  }

  /** Las conversaciones guardadas del proyecto, la más nueva primero, con su título y de dónde vienen (H-17). */
  async lista(ruta: string): Promise<ConversacionAnterior[]> {
    const guardadas = await this.d.motor.conversaciones(ruta)
    return Promise.all(
      guardadas.map(async (c) => ({
        id: c.id,
        titulo: c.titulo ?? 'Conversación sin título',
        modificada: c.modificada,
        origen: (await this.d.registro.de(c.id))?.empezadaEn === 'iridium' ? 'iridium' : 'vscode',
      })),
    )
  }

  /** Muestra otra conversación guardada; el próximo mensaje la continúa. Mientras trabaja, no se cambia. */
  elegir(ruta: string, id: string): Promise<ConversacionProyecto> {
    const p = this.proyecto(ruta)
    return this.enFila(p, async () => {
      if (!this.trabajando(p) && p.id !== id) {
        p.sesion?.cerrar()
        Object.assign(p, { sesion: null, elegida: id, cargado: false, detenida: false })
      }
      return this.vista(p)
    })
  }

  /** Las entradas anteriores a las `tengo` últimas. */
  anteriores(ruta: string, tengo: number): Entrada[] {
    const p = this.proyectos.get(ruta)
    if (!p) return []
    const hasta = Math.max(0, p.entradas.length - tengo)
    return p.entradas.slice(Math.max(0, hasta - ENTRADAS_POR_VEZ), hasta)
  }

  /** Seguí, Nueva o un mensaje propio. Si ya trabaja, el mensaje se suma a lo que está haciendo. */
  seguir(
    ruta: string,
    pedido: PedidoSeguir,
    opciones: { arranque?: number; motivo?: 'avance' } = {},
  ): Promise<void> {
    const p = this.proyecto(ruta)
    return this.enFila(p, async () => {
      const capacidades = this.d.motor.capacidades()
      // Un comando escondido no se manda (D-168): la ventana ya lo frenó y dijo dónde está eso en Iridium.
      if (pedido.texto && escondidoDe(pedido.texto, capacidades.escondidos)) return
      let reiniciar = false
      if (pedido.nueva) {
        if (this.trabajando(p)) return
        p.arranque = opciones.arranque ?? null
        p.arrancada = p.arranque
        p.avance = p.arranque !== null && opciones.motivo === 'avance'
        p.sesion?.cerrar()
        Object.assign(p, {
          cargado: true,
          sesion: null,
          id: null,
          origen: 'iridium',
          titulo: null,
          elegida: null,
          modificada: null,
          usoCentro: null,
          entradas: [],
          detenida: false,
          contexto: null,
          controlando: null,
        })
        reiniciar = true
      } else if (!p.cargado) await this.cargar(p)
      if (!p.sesion) await this.prepararHtml(p)

      const pedidos = pedido.adjuntos ?? []
      // Solo con adjuntos, el mensaje sale sin texto (PA-2); sin nada, es Seguí.
      const texto = pedido.texto?.trim() || (pedidos.length ? '' : MENSAJE_SEGUI)
      // Sin sesión iniciada en Claude Code no se abre nada (F-5): el aviso dice cómo y Reintentar lo vuelve a mandar.
      if (!p.sesion && this.d.motorListo) {
        const estado = await this.d.motorListo()
        if (estado.tipo === 'sin-sesion' || estado.tipo === 'falla') {
          const reintentar = pedido.texto?.trim() || null
          this.emitir(
            p,
            [
              estado.tipo === 'sin-sesion'
                ? {
                    tipo: 'sin-sesion',
                    id: this.id(),
                    reintentar,
                    ...(pedidos.length ? { adjuntos: pedidos } : {}),
                    enviado: false,
                  }
                : {
                    tipo: 'aviso',
                    id: this.id(),
                    clase: 'error',
                    texto: `Claude Code no arranca: ${estado.motivo}. No se envió nada.`,
                  },
            ],
            reiniciar,
          )
          return
        }
      }
      // Un comando va primero, sin el aviso de «te detuve»: ese queda para el próximo mensaje que no lo sea (D-169 › 7).
      const comando = capacidades.comandos ? comandoDe(texto) : null
      // Los adjuntos (D-169 › 5): las fotos aparte; los archivos y los textos pegados, en sus bloques antes de lo escrito
      // (después del comando, si empieza con uno).
      const { fotos, vistas, archivos, pegados } = await this.leerAdjuntos(pedidos, capacidades)
      const conAdjuntos = conAdjuntosDespuesDelComando(texto, { pegados, archivos }, comando !== null)
      const mensaje = comando ? conAdjuntos : mensajeParaLaIa(conAdjuntos, p.detenida)
      if (!comando) {
        if (p.id && p.detenida)
          await this.d.registro.guardar(p.id, this.resumenInicial(p, 'afuera'), { detenida: false })
        p.detenida = false
      }
      p.soloComandos = comando !== null && (!this.trabajando(p) || p.soloComandos)
      if (!this.trabajando(p)) {
        p.antes = new Set((await this.d.preguntas(ruta)).map((q) => q.codigo))
        p.ficha = { ruta, estado: 'trabajando', preguntas: [], motivo: null }
      }
      p.envios++
      this.emitir(
        p,
        [
          {
            tipo: 'usuario',
            id: this.id(),
            texto,
            cuando: this.ahora(),
            ...(vistas.length ? { adjuntos: vistas } : {}),
          },
        ],
        reiniciar,
      )
      if (comando) this.d.alComando?.(comando.nombre)

      await this.mandar(p, mensaje, fotos)
    })
  }

  /**
   * Los adjuntos de un pedido, listos para mandar (D-169 › 5 y 9): cada foto leída (y achicada si pasa los límites del
   * motor); sin fotos en el motor, o una que no se pudo leer, va como archivo, con su ruta. En el orden del mensaje: las
   * fotos, los archivos y los textos pegados.
   */
  private async leerAdjuntos(
    pedidos: readonly AdjuntoPedido[],
    capacidades: CapacidadesMotor,
  ): Promise<{ fotos: FotoMotor[]; vistas: AdjuntoVista[]; archivos: string[]; pegados: string[] }> {
    const fotos: FotoMotor[] = []
    const vistasFotos: AdjuntoVista[] = []
    const archivos: string[] = []
    const pegados: string[] = []
    for (const a of pedidos) {
      if (a.tipo === 'pegado') {
        pegados.push(a.texto)
        continue
      }
      if (a.tipo === 'foto' && capacidades.fotos && this.d.leerFoto) {
        const leida = await this.d.leerFoto(a.ruta, capacidades.fotos).catch(() => null)
        if (leida?.tipo === 'ok') {
          fotos.push(leida.foto)
          vistasFotos.push({
            tipo: 'foto',
            src: `data:${leida.foto.medio};base64,${leida.foto.datos}`,
            nombre: this.d.esPegada?.(a.ruta) ? 'Imagen pegada' : basename(a.ruta),
          })
          continue
        }
      }
      archivos.push(a.ruta)
    }
    const vistas: AdjuntoVista[] = [
      ...vistasFotos,
      ...archivos.map((ruta) => ({ tipo: 'archivo' as const, ruta })),
      ...pegados.map((t) => ({ tipo: 'pegado' as const, lineas: lineasDe(t), texto: t })),
    ]
    return { fotos, vistas, archivos, pegados }
  }

  /** Manda un mensaje a la sesión abierta o abre una con la misma conversación (D-037). */
  private async mandar(p: Proyecto, mensaje: string, fotos: FotoMotor[] = []): Promise<void> {
    const ruta = p.ruta
    if (p.sesion?.enviar(mensaje, fotos)) return
    {
      const base = this.d.instruccionBase?.(ruta) ?? INSTRUCCION_CENTRO
      const extra = await this.d.instruccion?.(ruta).catch(() => null)
      const ajuste = (await this.d.ajuste?.(ruta).catch(() => null)) ?? SIN_AJUSTE
      const tono = (await this.d.tono?.().catch(() => null)) ?? null
      const sesion = this.d.motor.abrir(
        {
          carpeta: ruta,
          conversacion: p.id,
          instruccion: extra ? `${base} ${extra}` : base,
          ajuste,
          tono,
        },
        (e) => this.alEvento(p, sesion, e),
      )
      p.sesion = sesion
      sesion.enviar(mensaje, fotos)
    }
  }

  /** Frena a la IA en el acto, sin confirmación (H-14). */
  async detener(ruta: string): Promise<void> {
    await this.proyectos.get(ruta)?.sesion?.detener()
  }

  /** El proyecto cambió su modelo o su esfuerzo: si tiene una sesión abierta, vale desde su próximo mensaje. */
  ajustar(ruta: string, ajuste: AjusteIa): void {
    this.proyectos.get(ruta)?.sesion?.ajustar(ajuste)
  }

  /** Cambió el tono (AJ-3): las sesiones abiertas lo toman desde su próximo mensaje; las nuevas lo leen al abrir. */
  ponerTono(tono: string | null): void {
    for (const p of this.proyectos.values()) p.sesion?.ponerTono(tono)
  }

  /**
   * «Cerrar igual» (F-6): frena las sesiones que trabajan y espera a que guarden que se las detuvo, así el próximo
   * Seguí se lo avisa a la IA.
   */
  async detenerTodo(): Promise<void> {
    const trabajando = [...this.proyectos.values()].filter((p) => this.trabajando(p))
    await Promise.all(trabajando.map((p) => p.sesion?.detener().catch(() => {})))
    const hasta = this.ahora() + ESPERA_DETENER_MS
    while (trabajando.some((p) => this.trabajando(p)) && this.ahora() < hasta)
      await new Promise((r) => setTimeout(r, 50))
    await Promise.all([...this.guardando])
  }

  /** Cierra la ficha de una sesión que no trabaja; la conversación queda para Seguí. */
  cerrarFicha(ruta: string): void {
    const p = this.proyectos.get(ruta)
    if (!p?.ficha || this.trabajando(p)) return
    p.ficha = null
    this.emitir(p, [])
  }

  /**
   * Si la última conversación del proyecto se usó afuera hace poco (D-027): puede estar abierta en VS Code. No la
   * carga ni manda nada.
   */
  async usadaAfuera(ruta: string): Promise<boolean> {
    const p = this.proyectos.get(ruta)
    if (p && (p.sesion || this.trabajando(p))) return false
    const ultima = (await this.d.motor.conversaciones(ruta).catch(() => []))[0]
    if (!ultima) return false
    const usoCentro = (await this.d.registro.de(ultima.id))?.ultimoUso ?? null
    return usadaAfuera(ultima.modificada, usoCentro, this.ahora()) !== null
  }

  /** Los proyectos con la IA trabajando (para cerrar la app, F-6). */
  enMarcha(): string[] {
    return [...this.proyectos.values()].filter((p) => this.trabajando(p)).map((p) => p.ruta)
  }

  /**
   * Se olvida de una carpeta que se mudó (D-083): cierra su sesión, si no trabaja, y la próxima vez se carga de la
   * ruta nueva. false si la IA está trabajando ahí.
   */
  olvidar(ruta: string): boolean {
    const p = this.proyectos.get(ruta)
    if (!p) return true
    if (this.trabajando(p)) return false
    p.sesion?.cerrar()
    if (p.ficha) {
      p.ficha = null
      this.emitir(p, [])
    }
    this.proyectos.delete(ruta)
    return true
  }

  /** Termina todas las sesiones (al cerrar la app). */
  cerrarTodo(): void {
    for (const p of this.proyectos.values()) p.sesion?.cerrar()
  }

  private resumenInicial(p: Proyecto, empezadaEn: ResumenSesion['empezadaEn']): ResumenSesion {
    return { ruta: p.ruta, empezadaEn, ultimoUso: null, detenida: false, ultimoEstado: null, preguntas: [] }
  }

  private alEvento(p: Proyecto, sesion: SesionMotor, e: EventoMotor): void {
    // Lo que llega de una sesión vieja (antes de Nueva) ya no es de esta conversación.
    if (p.sesion !== sesion) return
    switch (e.tipo) {
      case 'conversacion': {
        if (p.id === e.id) return
        const empezadaEn = p.id === null ? 'iridium' : 'afuera'
        const arranque = p.id === null ? p.arranque : null
        const motivo = arranque !== null && p.avance ? { motivo: 'avance' as const } : {}
        p.id = e.id
        p.arranque = null
        p.origen ??= 'iridium'
        void this.d.registro
          .guardar(e.id, this.resumenInicial(p, empezadaEn), arranque !== null ? { arranque, ...motivo } : {})
          .catch(() => {})
        this.emitir(p, [])
        return
      }
      case 'mensaje':
        // Llegó algo de Claude: si estaba reintentando, ya pudo.
        if (p.ficha?.reintento) p.ficha = { ...p.ficha, reintento: null }
        this.emitir(p, [this.entradaDe(p, e.mensaje)])
        return
      case 'reintento':
        if (!this.trabajando(p) || !p.ficha) return
        p.ficha = { ...p.ficha, reintento: e.reintento }
        this.emitir(p, [])
        return
      case 'turno':
        if (!e.sigue) this.terminarTurno(p, e.resultado, e.motivo, e.falla)
        return
      case 'contexto':
        if (p.id) {
          this.contextos.set(p.id, e.contexto)
          void this.d.registro
            .guardar(p.id, this.resumenInicial(p, 'iridium'), { contexto: e.contexto })
            .catch(() => {})
        }
        p.contexto = e.contexto
        this.emitir(p, [])
        return
      case 'uso':
        this.d.alUso?.(e.uso)
        return
      case 'comandos':
        this.d.alComandos?.(p.ruta, e.comandos)
        return
      case 'fondo':
        p.fondo = e.tareas
        this.emitir(p, [])
        return
      case 'retoma':
        // Terminó lo que había dejado de fondo y la IA sigue sola: vuelve a trabajar, como con un mensaje (T-65).
        if (this.trabajando(p) || p.revisando) return
        p.antes = new Set([...p.antes, ...(p.ficha?.preguntas.map((q) => q.codigo) ?? [])])
        p.ficha = { ruta: p.ruta, estado: 'trabajando', preguntas: [], motivo: null }
        this.emitir(p, [])
        return
      case 'cerrada': {
        p.sesion = null
        const habiaFondo = p.fondo.length > 0
        p.fondo = []
        if (this.trabajando(p) && !p.revisando)
          this.terminarTurno(p, 'error', 'Claude Code se cerró sin terminar el turno.')
        else {
          // Claude Code escribe sus últimas líneas al cerrar, a veces mucho después del turno (con algo de fondo): no
          // es que la conversación se usó afuera (R-54).
          this.usadaAhora(p)
          if (habiaFondo) this.emitir(p, [])
        }
        return
      }
    }
  }

  /** La conversación la usó Iridium hasta ahora (R-54): después de lo que se guardó al terminar el turno. */
  private usadaAhora(p: Proyecto): void {
    const id = p.id
    if (!id || p.usoCentro === null) return
    const fin = this.ahora()
    p.usoCentro = fin
    const antes = [...this.guardando]
    const guardar = Promise.all(antes)
      .then(() => this.d.registro.guardar(id, this.resumenInicial(p, 'iridium'), { ultimoUso: fin }))
      .catch(() => {})
    this.guardando.add(guardar)
    void guardar.then(() => this.guardando.delete(guardar))
  }

  private terminarTurno(
    p: Proyecto,
    resultado: 'ok' | 'detenida' | 'error',
    motivo: string | null,
    falla?: FallaMotor,
  ): void {
    const control = this.d.control
    if (control && p.controlando) {
      p.revisando = true
      void this.enFila(p, () => this.terminarCorreccion(p, control, resultado, motivo, falla))
      return
    }
    if (control && resultado === 'ok') {
      p.revisando = true
      void this.enFila(p, () => this.revisar(p, control, motivo)).finally(() => {
        p.revisando = false
      })
      return
    }
    this.cerrarTurno(p, resultado, motivo, falla)
  }

  /**
   * Al terminar un turno bien, el control revisa lo que escribió la IA; si encontró algo, se lo devuelve a la misma
   * conversación y la pestaña sigue trabajando (`diseno-tecnico.md` › Cómo se le devuelve a la IA).
   */
  private async revisar(
    p: Proyecto,
    control: (ruta: string) => Promise<Aviso[] | null>,
    motivo: string | null,
  ): Promise<void> {
    const envios = p.envios
    const avisos = await control(p.ruta).catch(() => null)
    // Mientras corría el control, el usuario pudo mandar otro mensaje: ese turno sigue y se revisa al terminar.
    if (!this.trabajando(p) || p.envios !== envios) return
    if (!avisos?.length) {
      this.cerrarTurno(p, 'ok', motivo)
      return
    }
    const entrada: Entrada & { tipo: 'control' } = {
      tipo: 'control',
      id: this.id(),
      avisos: avisos.map((a) => ({ donde: dondeDe(a), texto: a.texto, quedo: null })),
      corrigiendo: true,
    }
    p.controlando = entrada
    this.emitir(p, [entrada])
    await this.mandar(p, mensajeDelControl(avisos))
  }

  /** Terminó la corrección: lo que sigue mal queda marcado (y en la tarjeta) y el turno se cierra como siempre. */
  private async terminarCorreccion(
    p: Proyecto,
    control: (ruta: string) => Promise<Aviso[] | null>,
    resultado: 'ok' | 'detenida' | 'error',
    motivo: string | null,
    falla?: FallaMotor,
  ): Promise<void> {
    const entrada = p.controlando
    p.controlando = null
    if (entrada) {
      const quedan = resultado === 'ok' ? await control(p.ruta).catch(() => null) : null
      const siguen = new Set(quedan?.map((a) => a.texto))
      this.reemplazar(p, {
        ...entrada,
        corrigiendo: false,
        avisos: entrada.avisos.map((a) => ({ ...a, quedo: quedan ? siguen.has(a.texto) : null })),
      })
    }
    p.revisando = false
    this.cerrarTurno(p, resultado, motivo, falla)
  }

  /** Cambia una entrada que ya estaba (la del control, al terminar de corregir). */
  private reemplazar(p: Proyecto, entrada: Entrada): void {
    const i = p.entradas.findIndex((e) => e.id === entrada.id)
    if (i >= 0) p.entradas[i] = entrada
    this.d.alCambio({
      ruta: p.ruta,
      id: p.id,
      reiniciar: false,
      entradas: [entrada],
      ficha: p.ficha,
      contexto: p.contexto,
    })
  }

  private cerrarTurno(
    p: Proyecto,
    resultado: 'ok' | 'detenida' | 'error',
    motivo: string | null,
    falla?: FallaMotor,
  ): void {
    const ruta = p.ruta
    p.ficha = {
      ruta,
      estado: resultado === 'error' ? 'error' : 'terminada',
      preguntas: [],
      motivo: resultado === 'error' ? motivoDeFicha(falla, motivo) : null,
    }
    const avisos: Entrada[] = []
    if (resultado === 'detenida')
      avisos.push({ tipo: 'aviso', id: this.id(), clase: 'detenida', texto: 'Detuviste a la IA.' })
    if (resultado === 'error') {
      this.d.registrar?.(
        `Error del motor en ${basename(ruta)}: ${falla?.tipo ?? 'falla'}${motivo ? ` — ${motivo}` : ''}`,
      )
      if (falla?.tipo === 'sin-sesion') {
        this.d.alPerderSesion?.()
        avisos.push({ tipo: 'sin-sesion', id: this.id(), reintentar: null, enviado: true })
      } else if (falla?.tipo === 'uso-agotado')
        avisos.push({ tipo: 'uso-agotado', id: this.id(), libera: falla.libera })
      else if (falla?.tipo === 'sin-conexion')
        // El motivo de Claude Code («API Error: Connection refused…») queda en el registro, no en la conversación.
        avisos.push({
          tipo: 'aviso',
          id: this.id(),
          clase: 'error',
          texto:
            'No hay conexión con Claude: revisa internet. Con Continuar se retoma la misma conversación.',
        })
      else
        avisos.push({
          tipo: 'aviso',
          id: this.id(),
          clase: 'error',
          // El motivo viene de Claude Code, a veces sin punto final.
          texto: `La sesión falló${motivo ? `: ${motivo.replace(/[^.!?…]$/, '$&.')}` : '.'} Con Continuar se retoma la misma conversación.`,
        })
    }
    this.emitir(p, avisos)
    this.d.alTerminar?.(ruta, { resultado, fondo: p.fondo.length, avance: p.avance })

    const fin = this.ahora()
    p.usoCentro = fin
    // Ya es la última del proyecto: no hace falta seguir eligiéndola.
    p.elegida = null
    // Un turno de comandos no le avisó a la IA que se la detuvo: el aviso queda para el próximo mensaje.
    p.detenida = resultado === 'detenida' || (p.detenida && p.soloComandos)
    p.soloComandos = false
    const detenida = p.detenida
    const ficha = p.ficha
    const id = p.id
    const guardar = (async () => {
      const nuevas = preguntasNuevas(p.antes, await this.d.preguntas(ruta).catch(() => []))
      if (nuevas.length > 0 && p.ficha === ficha) {
        p.ficha = { ...ficha, preguntas: nuevas }
        this.emitir(p, [{ tipo: 'preguntas', id: this.id(), preguntas: nuevas }])
      }
      if (id)
        await this.d.registro.guardar(id, this.resumenInicial(p, 'iridium'), {
          ultimoUso: fin,
          detenida,
          ultimoEstado: resultado === 'ok' ? 'terminada' : resultado,
          preguntas: nuevas.map((q) => q.codigo),
        })
    })().catch(() => {})
    this.guardando.add(guardar)
    void guardar.then(() => this.guardando.delete(guardar))
  }
}

/** Lo que dice la ficha (y el aviso de H-13) cuando un turno falla. */
function motivoDeFicha(falla: FallaMotor | undefined, motivo: string | null): string | null {
  if (falla?.tipo === 'sin-sesion') return 'Claude Code no tiene sesión iniciada'
  if (falla?.tipo === 'uso-agotado') return 'Se agotó el uso de la suscripción'
  if (falla?.tipo === 'sin-conexion') return 'Sin conexión con Claude'
  return motivo
}

// El lado principal del puente: atiende los pedidos de la ventana y le manda los eventos. Valida todo lo que llega.
import { mkdir, readdir, readFile, rename, stat } from 'node:fs/promises'
import { basename, dirname, isAbsolute, join, normalize, relative } from 'node:path'
import { type BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { z } from 'zod'
import { actualizarSolo } from '../../compartido/actualizar'
import { MAX_ADJUNTOS } from '../../compartido/adjuntos'
import { sumarReciente } from '../../compartido/comandos'
import {
  CANALES,
  CARPETA_IRIDIUM,
  type EstadoMotor,
  type EstilosRespuesta,
  type ListaProyectos,
  type Preferencias,
  type ResultadoAbrir,
  type ResultadoAdjunto,
  type ResultadoEjecutar,
  type ResultadoFicha,
  type ResultadoGit,
  type ResultadoMudanza,
  type ResultadoNuevo,
  type ResultadoPlanEliminar,
  type ResultadoScript,
  type SinArmar,
  type VersionNueva,
} from '../../compartido/puente'
import { fueraDelFramework, MENSAJE_PASAR_AL_FRAMEWORK } from '../../compartido/skills'
import type { PlanEliminacion } from '../../compartido/tipos'
import { planDeArmado, VigiaArmados } from '../app/abrir'
import { Arranque, candidatosDe } from '../app/arranque'
import { Comandos } from '../app/comandos'
import { controlarProyecto } from '../app/control'
import { Conversaciones } from '../app/conversacion'
import { crearProyecto } from '../app/creacion'
import { marcarVista, vistaDiseno } from '../app/diseno'
import { Documentos, ordenDeDocumentos } from '../app/documentos'
import { archivarProyecto, cambiarEstadoProyecto, cambiarIconoProyecto } from '../app/edicion'
import { ejecutarEliminacion, medirRegenerables, prepararEliminacion } from '../app/eliminacion'
import {
  anotarIdea,
  borrarIdea,
  cambiarEstadoIdea,
  guardarIdea,
  ideasDeProyecto,
  type LugarIdeas,
  leerNotaIdea,
  lugarDeSueltas,
  moverIdea,
  pegarImagenIdea,
} from '../app/ideas'
import { mapaDe } from '../app/mapa'
import { Pendientes } from '../app/pendientes'
import { leerPreguntasAbiertas, listarProyectos } from '../app/proyectos'
import { Comentarios } from '../app/revision/comentarios'
import { VigiaSincronia } from '../app/sincronia'
import { leerSeccionSkills, proyectosConFramework, skillsDelProyecto } from '../app/skills'
import { trabajoDelProyecto } from '../app/trabajo'
import { UsoDeLaSuscripcion } from '../app/uso'
import { motivo } from '../app/visor'
import { type Cual, rutasIridium } from '../core/carpeta-iridium'
import { pedidoEmpezar, tieneCodigo } from '../core/diseno/pedidos'
import {
  INSTRUCCION_CENTRO,
  INSTRUCCION_SKILLS,
  instruccionGeneral,
  instruccionRevision,
} from '../core/sesiones'
import { leerScripts, RUTA_SCRIPTS } from '../core/visor/scripts'
import { enElProyecto, leerArchivo, leerCarpeta, listarArchivos } from '../infra/archivos'
import {
  type ArchivoArmados,
  abiertaAhora,
  carpetaDeArmado,
  cortarArmado,
  fechaDe,
  finDeArmado,
  gitDeArmado,
  LOG_ARMADO,
  lanzarArmado,
  procesoVivo,
} from '../infra/armados'
import type { ArchivoArranques } from '../infra/arranques'
import type { ArchivoBorradores } from '../infra/borradores'
import {
  type CarpetasEnDisco,
  moverCarpeta,
  prepararCarpetaIridium,
  reenlazarSkills,
} from '../infra/carpeta-iridium'
import { type ArchivoConfig, preferenciasDe } from '../infra/config'
import { ESQUEMA_MAQUETA, type MaquetasAbiertas } from '../infra/diseno/protocolo'
import type { ArchivoVistos } from '../infra/diseno/vistos'
import { ejecutarPlan } from '../infra/ejecutar'
import type { ArchivoEscritos } from '../infra/escritos'
import { type Fotos, leerFoto } from '../infra/fotos'
import { leerCommit, leerDiferencia, leerGit } from '../infra/git'
import { githubFalso, githubReal, inicializarRepo, publicarRepo } from '../infra/github'
import { abrirEnNavegador } from '../infra/navegador'
import { leerImagenDelPortapapeles } from '../infra/portapapeles'
import { existeCarpeta } from '../infra/raiz'
import type { Registro } from '../infra/registro'
import type { ArchivoSesiones } from '../infra/sesiones'
import { guardarYSubir, sincronizar, traerDelRemoto } from '../infra/sincronia'
import { type Vigilancia, vigilar } from '../infra/vigilancia'
import { abrirEnVsCode } from '../infra/vscode'
import type { Motor } from '../motor/motor'
import {
  ArchivoMaqueta,
  CambioPreferencias,
  Codigo,
  CodigoComentario,
  CodigoIdea,
  CommitPedido,
  Documento,
  Escrito,
  EscritoConAdjuntos,
  EsquemaBorrador,
  EstadoFicha,
  EstadoIdeaEsquema,
  HashCommit,
  IdConversacion,
  IdScript,
  ImagenBase64,
  ImagenesAlAnotar,
  MensajeCommit,
  Mime,
  NombreProyecto,
  NotaReabrir,
  Pedido,
  PedidoDisenoEsquema,
  PedidoPublicar,
  PedidoResponder,
  Ruta,
  RutaAbsoluta,
  RutaArchivo,
  Tengo,
  TextoNotas,
} from './esquemas'

/** Lo que se ejecuta al abrirlo: un clic en una ficha lo muestra en su carpeta, nunca lo ejecuta. */
const SE_EJECUTA = /\.(exe|bat|cmd|ps1|msi|lnk|vbs|js|com|scr)$/i
/** Lo más que pesa una foto pegada (`diseno-tecnico.md` › Seguridad). */
const MAX_PEGADA = 20 * 2 ** 20

async function existe(ruta: string): Promise<boolean> {
  return stat(ruta).then(
    () => true,
    () => false,
  )
}

export interface Servicios {
  config: ArchivoConfig
  sesiones: ArchivoSesiones
  borradores: ArchivoBorradores
  escritos: ArchivoEscritos
  /** Las fotos del chat: leerlas, achicarlas, sus miniaturas y las pegadas (frente Paridad, PA-I2). */
  fotos: Fotos
  motor: Motor
  /** La carpeta de proyectos si `config.json` todavía no tiene una. */
  raizInicial: () => Promise<string>
  /** La carpeta Iridium si `config.json` todavía no tiene una (D-083). */
  carpetaIridiumInicial: () => string
  ventana: () => BrowserWindow | null
  /** Última conexión de la extensión de la Revisión (ISO); null si nunca. */
  ultimaConexionExtension: () => Promise<string | null>
  registro: Registro
  /** Cierra la ventana sin volver a preguntar (después de «Cerrar igual», F-6). */
  cerrarVentana: () => void
  /** La carpeta de Claude, donde están las skills (`%USERPROFILE%\.claude`; en las pruebas, `IRIDIUM_CLAUDE`). */
  carpetaClaude: string
  /** Las plantillas del framework (`plantillas/` de la skill `iridium`), para Nuevo proyecto (R-14). */
  plantillas: string
  /** La versión nueva lista (CO-I2); null en desarrollo, donde no hay app de uso diario. */
  versionNueva: {
    ultima(): VersionNueva | null
    vigilar(alCambiar: (v: VersionNueva | null) => void): void
  } | null
  /** Los cambios sin armar (CO-I6); null en desarrollo. */
  sinArmar: {
    ultimo(): SinArmar
    vigilar(alCambiar: (s: SinArmar) => void): void
    armar(): Promise<{ tipo: 'ok'; mensaje: string } | { tipo: 'error'; mensaje: string }>
    cancelar(): Promise<void>
    consola(): string
  } | null
  /** Actualizar con una versión lista: cierra la ventana como siempre (F-6 pregunta si hay sesiones) y al salir abre la versión nueva. */
  reiniciarAhora: () => void
  /** Cuántos segundos lleva Iridium sin que se toque el teclado ni el mouse en su ventana (T-67). */
  segundosSinUso: () => number
  /** Se canceló la confirmación de F-6: si era para reiniciar, ya no. */
  cancelarCierre: () => void
  /** Ctrl+= / Ctrl+- / Ctrl+0 (Defecto 17): la ventana agranda, achica o vuelve al tamaño normal. */
  zoom?: (paso: 1 | -1 | 0) => void
  /** Los proyectos abiertos en Diseño, que sirve el protocolo `maqueta:` (frente Diseño). */
  maquetas: MaquetasAbiertas
  /** Lo que ya se miró de cada maqueta (`diseno.json`). */
  vistos: ArchivoVistos
  /** Lo que pasó en cada momento del arranque (`arranques.json`, frente Arranque). */
  arranques: ArchivoArranques
  /** Solo pruebas (`IRIDIUM_ARRANQUE_EN`): el primer momento del arranque, a tantos segundos de abrir. */
  arranqueEnSegundos?: number
  /**
   * La actualización automática (frente Abrir, AB-I2): `armados.json` y la carpeta de datos (los logs van en
   * `armados/`); `excluida`, la carpeta del código de Iridium, que se arma con D-122.
   */
  armados?: { archivo: ArchivoArmados; carpetaDatos: string; excluida: string | null }
}

export interface Puente {
  cerrar(): void
  /** Espera a que terminen de guardarse lo escrito y los borradores que mandó la ventana al cerrarse (D-060). */
  terminarDeGuardar(): Promise<void>
  /** Los proyectos con la IA trabajando: al cerrar la ventana se pregunta (F-6). */
  enMarcha(): string[]
  /** Pide a la ventana la confirmación de F-6. */
  pedirCierre(trabajando: string[]): void
  /** La ventana volvió a tener el foco: si el uso quedó viejo, se relee (Defecto 16). */
  alVolver(): void
  /** Los comentarios de la Revisión: el receptor los usa para Enviar ahora desde la extensión. */
  comentarios: Comentarios
  /** Windows avisó que la PC se suspende o que volvió (`powerMonitor`): el arranque no ve el tiempo dormido. */
  alSuspender(): void
  alDespertar(): void
}

export function registrarPuente(s: Servicios): Puente {
  let vigilancia: Vigilancia | null = null
  let raizVigilada: string | null = null
  let vigilanciaIridium: Vigilancia | null = null
  let iridiumVigilada: string | null = null
  /** Las carpetas de Ideas y de Skills de la última lectura (D-083). */
  let enDisco: CarpetasEnDisco = { rutas: { ideas: null, skills: null }, mudanza: null }
  let raizActual = ''
  /** Mientras se muda, listar no crea carpetas: la mudanza las encontraría ocupadas. */
  let mudando = false
  let estadoMotor: EstadoMotor = { tipo: 'verificando' }

  const enviar = (canal: string, dato: unknown) => {
    const v = s.ventana()
    if (v && !v.isDestroyed()) v.webContents.send(canal, dato)
  }

  const raiz = async (): Promise<string> => normalize((await s.config.leer()).raiz ?? (await s.raizInicial()))
  /** La carpeta de Iridium: `.iridium` dentro de la carpeta de proyectos (D-087). */
  const carpetaIridium = async (): Promise<string> => join(await raiz(), CARPETA_IRIDIUM)
  /**
   * Donde pudieron quedar Ideas y Skills antes: la carpeta Iridium aparte de D-083 (la elegida o la de Documentos) o
   * el `.iridium` de la carpeta de proyectos anterior. Si están ahí y no en `.iridium`, se ofrece Mover.
   */
  const anteriores = async (): Promise<string[]> => {
    const c = await s.config.leer()
    return [...(c.carpetaIridium ? [normalize(c.carpetaIridium)] : []), s.carpetaIridiumInicial()]
  }

  // El uso de la suscripción (H-12): al verificar, con cada turno de cualquier sesión, al volver a la ventana y cada tanto.
  const uso = new UsoDeLaSuscripcion({
    motor: s.motor,
    alCambio: (u) => {
      enviar(CANALES.usoCambio, u)
      // Cambia cuándo vence el período: cambia el próximo momento del arranque.
      void arranque.recalcular()
    },
  })

  /** Verifica Claude Code sin mandar mensajes; de paso trae los modelos y el uso. */
  let verificando: Promise<EstadoMotor> | null = null
  const verificarMotor = (): Promise<EstadoMotor> => {
    verificando ??= (async () => {
      const v = await s.motor.verificar()
      if (v.estado.tipo !== estadoMotor.tipo || v.estado.tipo !== 'listo')
        s.registro.escribir(
          `Claude Code: ${v.estado.tipo}${v.estado.tipo === 'falla' ? ` — ${v.estado.motivo}` : ''}`,
        )
      estadoMotor = v.estado
      enviar(CANALES.motorCambio, v.estado)
      if (v.uso) uso.poner(v.uso)
      else if (v.estado.tipo === 'listo') void uso.leer()
      return v.estado
    })().finally(() => {
      verificando = null
    })
    return verificando
  }
  /** Antes de abrir una sesión: si Claude Code no estaba listo, se vuelve a verificar (F-5). */
  const motorListo = async (): Promise<EstadoMotor> => {
    if (estadoMotor.tipo === 'listo' || estadoMotor.tipo === 'clave-api') return estadoMotor
    return verificando ?? verificarMotor()
  }

  /** Lista los proyectos y deja vigilando esa carpeta (si cambió, se vigila la nueva). */
  let ultimaLista: ListaProyectos | null = null
  const listar = async (): Promise<ListaProyectos> => {
    const [actual, iridium, antes] = await Promise.all([raiz(), carpetaIridium(), anteriores()])
    // Sin la carpeta de proyectos no se crea `.iridium`: crearla de rebote escondería que falta (CO-4).
    enDisco = await prepararCarpetaIridium(iridium, actual, !mudando && (await existeCarpeta(actual)), antes)
    raizActual = actual
    const lista = await listarProyectos(actual, iridium, enDisco)
    // Cambiaron los proyectos (o es la primera lista): la actualización automática los mira ya, no al minuto.
    const rutas = (l: ListaProyectos | null) =>
      l?.tipo === 'lista' ? l.proyectos.map((p) => p.ruta).join('|') : ''
    const otros = rutas(lista) !== rutas(ultimaLista)
    ultimaLista = lista
    if (otros) void armados?.mirar()
    if (lista.tipo === 'error')
      s.registro.escribir(`No se pudo leer la carpeta de proyectos: ${lista.mensaje}`)
    if (raizVigilada !== actual) {
      vigilancia?.cerrar()
      raizVigilada = actual
      vigilancia = vigilar(
        actual,
        () => {
          void listar().then((l) => enviar(CANALES.proyectosCambiaron, l))
        },
        250,
        (proyectos) => {
          for (const nombre of proyectos) enviar(CANALES.docsCambiaron, join(actual, nombre))
        },
        () => enviar(CANALES.skillsCambiaron, null),
        (cambios) => {
          for (const [nombre, archivos] of cambios)
            enviar(CANALES.disenoCambio, { ruta: join(actual, nombre), archivos: [...archivos] })
        },
      )
    }
    if (iridiumVigilada !== iridium) {
      vigilanciaIridium?.cerrar()
      iridiumVigilada = iridium
      vigilanciaIridium = vigilar(
        iridium,
        () => {
          void listar().then((l) => enviar(CANALES.proyectosCambiaron, l))
        },
        250,
        (carpetas) => {
          for (const nombre of carpetas) enviar(CANALES.docsCambiaron, join(iridium, nombre))
        },
        () => enviar(CANALES.skillsCambiaron, null),
      )
    }
    return lista
  }

  /**
   * La ventana solo puede nombrar un proyecto de la carpeta de proyectos (una carpeta hija que exista) o una de las
   * carpetas de Ideas y Skills de la última lectura (D-083).
   */
  const proyecto = async (dato: unknown): Promise<string> => {
    const ruta = normalize(Ruta.parse(dato))
    const deIridium = ruta === enDisco.rutas.ideas || ruta === enDisco.rutas.skills
    if ((!deIridium && dirname(ruta) !== (await raiz())) || !(await existeCarpeta(ruta)))
      throw new Error('Ese proyecto no está en la carpeta de proyectos')
    return ruta
  }

  const docs = new Documentos()

  /** Los scripts de un proyecto, leídos del disco (sin cargar sus documentos). */
  const scriptsDe = async (ruta: string) => {
    const texto = await readFile(join(ruta, ...RUTA_SCRIPTS.split('/')), 'utf8').catch(() => null)
    return texto === null ? null : leerScripts(texto)
  }
  const planDe = async (ruta: string) => {
    const scripts = await scriptsDe(ruta)
    return scripts ? planDeArmado(ruta, scripts) : null
  }
  // La actualización automática (frente Abrir, AB-I2): arma solas, sin IA, las apps de escritorio de los proyectos.
  const datosArmados = s.armados
  const armados = datosArmados
    ? new VigiaArmados({
        proyectos: async () =>
          ultimaLista?.tipo === 'lista'
            ? ultimaLista.proyectos.filter((p) => !p.archivado).map((p) => p.ruta)
            : [],
        scripts: scriptsDe,
        git: gitDeArmado,
        iaTrabajando: async (ruta) =>
          conversaciones.enMarcha().includes(ruta) || (await conversaciones.usadaAfuera(ruta)),
        apagados: async () => (await s.config.leer()).actualizacionApagada,
        archivo: datosArmados.archivo,
        carpeta: (ruta) => carpetaDeArmado(datosArmados.carpetaDatos, ruta),
        lanzar: lanzarArmado,
        fin: finDeArmado,
        vivo: procesoVivo,
        cortar: cortarArmado,
        abierta: abiertaAhora,
        fechaExe: fechaDe,
        ahora: Date.now,
        excluida: datosArmados.excluida,
        alCambio: (e) => enviar(CANALES.actualizacionCambio, e),
        registrar: (t) => s.registro.escribir(t),
      })
    : null

  // La sincronización con GitHub (D-159): trae sola lo que se hizo en otra PC, sin tocar donde trabaja la IA. Lo que
  // cambia archivos (mandarle algo a la IA, Arranque, Commit) espera a que su proyecto esté al día (D-172).
  const iaEnMarcha = (ruta: string) => conversaciones.enMarcha().includes(ruta)
  const sincronia = new VigiaSincronia({
    proyectos: async () => {
      const lista = ultimaLista ?? (await listar())
      return lista.tipo === 'lista' ? lista.proyectos.filter((p) => !p.archivado).map((p) => p.ruta) : []
    },
    traer: async (ruta) => {
      // Para probar la espera (D-172): cada traer tarda esto de más.
      const demora = Number(process.env.IRIDIUM_TRAER_MS) || 0
      if (demora > 0) await new Promise((c) => setTimeout(c, demora))
      return traerDelRemoto(ruta)
    },
    ocupado: async (ruta) =>
      iaEnMarcha(ruta) || !!armados?.armando(ruta) || (await conversaciones.usadaAfuera(ruta)),
    ahora: Date.now,
    registrar: (t) => s.registro.escribir(t),
    alTraer: (ruta) => armados?.alTerminarTurno(ruta),
  })

  /** Lo que la ventana mandó a guardar y todavía se está escribiendo: al cerrar se espera (D-060). */
  const enCurso = new Set<Promise<unknown>>()
  const guardando = <T>(f: () => Promise<T>): Promise<T> => {
    const p = f()
    const seguir = p.catch(() => {})
    enCurso.add(seguir)
    void seguir.finally(() => enCurso.delete(seguir))
    return p
  }

  // Revisión (H-R5, H-R2): Enviar ahora va a la sesión del proyecto solo si tiene su pestaña en Iridium.
  const comentarios: Comentarios = new Comentarios({
    sesionAbierta: async (ruta) => (await s.config.leer()).pestanas.includes(ruta),
    enviarALaSesion: async (ruta, texto) => {
      await sincronia.alDia(ruta)
      return conversaciones.seguir(ruta, { texto })
    },
    ultimaConexion: s.ultimaConexionExtension,
  })

  // La lista de «/» de cada carpeta (PA-1): se recuerda 10 minutos y una sesión la pone al día.
  const comandos = new Comandos({
    motor: s.motor,
    recientes: async () => (await s.config.leer()).comandosRecientes,
    alCambio: (ruta, lista) => enviar(CANALES.comandosCambio, { ruta, comandos: lista }),
  })

  const conversaciones = new Conversaciones({
    motor: s.motor,
    registro: s.sesiones,
    alComandos: (ruta, lista) => comandos.poner(ruta, lista),
    alComando: (nombre) =>
      void guardando(async () =>
        s.config.guardar({
          comandosRecientes: sumarReciente((await s.config.leer()).comandosRecientes, nombre),
        }),
      ).catch(() => {}),
    leerFoto: (ruta, limites) => leerFoto(ruta, limites, s.fotos.imagenes),
    esPegada: (ruta) => s.fotos.esPegada(ruta),
    preguntas: leerPreguntasAbiertas,
    alCambio: (c) => {
      enviar(CANALES.conversacionCambio, c)
      // La conversación de un arranque terminó o dejó preguntas: cambia lo que dicen el detalle del uso y el aviso.
      if (c.ficha && c.ficha.estado !== 'trabajando') {
        void arranque.arrancoEn(c.ruta).then((si) => si && avisarArranque())
        armados?.alTerminarTurno(c.ruta)
      }
    },
    instruccionBase: (ruta) =>
      ruta === enDisco.rutas.ideas
        ? instruccionGeneral(raizActual)
        : ruta === enDisco.rutas.skills
          ? INSTRUCCION_SKILLS
          : INSTRUCCION_CENTRO,
    instruccion: async (ruta) => instruccionRevision(await comentarios.abiertos(ruta)),
    ajuste: async (ruta) => (await s.config.leer()).ajustesIa[ruta] ?? { modelo: null, esfuerzo: null },
    tono: async () => (await s.config.leer()).tono || null,
    motorListo,
    alPerderSesion: () => {
      if (estadoMotor.tipo === 'sin-sesion') return
      s.registro.escribir('Claude Code: sin-sesion (lo dijo un turno)')
      estadoMotor = { tipo: 'sin-sesion' }
      enviar(CANALES.motorCambio, estadoMotor)
    },
    alUso: (u) => uso.poner(u),
    // El control corre en las sesiones de proyecto con framework (OR-2), no en el chat general ni en el de Skills.
    control: (ruta) =>
      ruta === enDisco.rutas.ideas || ruta === enDisco.rutas.skills
        ? Promise.resolve(null)
        : controlarProyecto(ruta),
    registrar: (texto) => s.registro.escribir(texto),
    // Los mensajes de la IA con los códigos y las citas del proyecto como enlaces (F-4).
    html: async (ruta) => {
      const d = await docs.de(ruta)
      return (texto) => d.html(texto, '')
    },
  })

  const pendientes = new Pendientes(s.borradores, Date.now, docs)

  // El arranque del período de 5 horas (frente Arranque, D-149): espera el próximo momento y arranca como Nueva.
  const arranque = new Arranque({
    ajuste: async () => (await s.config.leer()).arranque,
    usoActual: () => uso.get(),
    leerUso: async () => {
      const leido = await s.motor.uso().catch(() => null)
      if (!leido) return null
      uso.poner(leido)
      return uso.get()
    },
    candidatos: async () => {
      const lista = await listar()
      if (lista.tipo !== 'lista') return []
      return candidatosDe(lista.proyectos, {
        enMarcha: () => conversaciones.enMarcha(),
        usadaAfuera: (ruta) => conversaciones.usadaAfuera(ruta),
        pendientes: async (ruta) => {
          const p = await pendientes.proyecto(ruta)
          return p.tipo === 'ok' ? p.pendientes : null
        },
        fechaRespuesta: (ruta, codigo) =>
          stat(join(ruta, 'docs', 'respuestas', `${codigo}.md`)).then(
            (e) => e.mtimeMs,
            () => null,
          ),
      })
    },
    sesionLista: async () => {
      const e = await motorListo()
      return e.tipo === 'listo' || e.tipo === 'clave-api'
    },
    arrancar: async (ruta, marca) => {
      await sincronia.alDia(ruta)
      return conversaciones.seguir(ruta, { nueva: true }, { arranque: marca })
    },
    archivo: s.arranques,
    segundosSinUsar: () => s.segundosSinUso(),
    registrar: (t) => s.registro.escribir(t),
    ...(s.arranqueEnSegundos !== undefined ? { primeroEnSegundos: s.arranqueEnSegundos } : {}),
    alCambio: () => avisarArranque(),
    conversacion: async (ruta, cuando) => {
      const r = await s.sesiones.deArranque(ruta, cuando)
      const preguntas = r?.preguntas ?? []
      let frenan = 0
      if (preguntas.length > 0) {
        const p = await pendientes.proyecto(ruta)
        if (p.tipo === 'ok')
          frenan = p.pendientes.filter((q) => q.frena && preguntas.includes(q.codigo)).length
      }
      return {
        estado: r?.ultimoEstado ?? null,
        preguntas,
        frenan,
        trabajando: conversaciones.enMarcha().includes(ruta),
        guardada: r !== null,
      }
    },
  })
  /** Lo que muestra el arranque cambió: se manda a la ventana (una vez aunque lo pidan varios juntos). */
  let avisandoArranque = false
  const avisarArranque = (): void => {
    if (avisandoArranque) return
    avisandoArranque = true
    setTimeout(() => {
      avisandoArranque = false
      void arranque.estado().then(
        (e) => enviar(CANALES.arranqueCambio, e),
        () => {},
      )
    }, 50)
  }
  ipcMain.handle(CANALES.arranque, () => arranque.estado())
  ipcMain.handle(CANALES.arranqueVisto, (_, hasta: unknown) => {
    if (typeof hasta !== 'number' || !Number.isFinite(hasta))
      throw new Error('arranqueVisto: hasta no es un número')
    return arranque.visto(hasta)
  })

  ipcMain.handle(CANALES.listarProyectos, () => listar())

  ipcMain.handle(CANALES.elegirCarpeta, async () => {
    const v = s.ventana()
    const opciones = { title: 'Elegir la carpeta de proyectos', defaultPath: await raiz() }
    const r = await (v ? dialog.showOpenDialog(v, { ...opciones, properties: ['openDirectory'] }) : null)
    const elegida = r && !r.canceled ? r.filePaths[0] : undefined
    if (!elegida) return null
    // El `.iridium` de la carpeta anterior queda como «de antes»: en la nueva, Mover lo trae (D-087).
    const vieja = await carpetaIridium()
    if (normalize(elegida) !== (await raiz()) && (await existeCarpeta(vieja)))
      await s.config.guardar({ raiz: elegida, carpetaIridium: vieja })
    else await s.config.guardar({ raiz: elegida })
    return listar()
  })

  ipcMain.handle(
    CANALES.leerPreferencias,
    async (): Promise<Preferencias> => preferenciasDe(await s.config.leer()),
  )

  /** Los estilos de respuesta de Claude Code (AJ-3): se piden una vez y quedan hasta cerrar; si fallan, se reintenta. */
  let estilos: Promise<EstilosRespuesta> | null = null
  const estilosDeRespuesta = (): Promise<EstilosRespuesta> => {
    if (!estilos) {
      const pedido = s.motor.estilos().catch(() => null)
      estilos = pedido
      void pedido.then((e) => {
        if (e === null && estilos === pedido) estilos = null
      })
    }
    return estilos
  }
  ipcMain.handle(CANALES.estilos, () => estilosDeRespuesta())

  ipcMain.handle(CANALES.guardarPreferencias, async (_, cambio: unknown): Promise<Preferencias> => {
    const valido = CambioPreferencias.parse(cambio)
    // El tono solo puede ser uno de los estilos que dio Claude Code (modulos/apariencia/diseno-tecnico.md › Seguridad).
    if (valido.tono && !(await estilosDeRespuesta())?.some((e) => e.id === valido.tono))
      throw new Error('Ese estilo no está en Claude Code')
    const limpio = Object.fromEntries(Object.entries(valido).filter(([, v]) => v !== undefined))
    const previa = await s.config.leer()
    const antes = previa.ajustesIa
    const tonoAntes = previa.tono
    const despues = preferenciasDe(await s.config.guardar(limpio))
    if (despues.tono !== tonoAntes) conversaciones.ponerTono(despues.tono || null)
    if (valido.arranque) void arranque.recalcular().then(avisarArranque)
    if (valido.actualizacionApagada) void armados?.mirar()
    // El modelo o el esfuerzo de un proyecto con la sesión abierta valen desde su próximo mensaje (C-58).
    if (valido.ajustesIa)
      for (const [ruta, a] of Object.entries(valido.ajustesIa))
        if (antes[ruta]?.modelo !== a.modelo || antes[ruta]?.esfuerzo !== a.esfuerzo)
          conversaciones.ajustar(ruta, a)
    return despues
  })

  ipcMain.handle(CANALES.leerEscritos, async () => Object.fromEntries(await s.escritos.todos()))
  ipcMain.handle(CANALES.guardarEscrito, (_, ruta: unknown, escrito: unknown) =>
    guardando(async () => s.escritos.guardar(await proyecto(ruta), EscritoConAdjuntos.parse(escrito))),
  )

  // Los adjuntos del chat (frente Paridad, PA-I2): el selector de Windows, la foto pegada, la miniatura y la foto
  // grande (la ventana no lee el disco) y abrir el archivo de una ficha.
  ipcMain.handle(CANALES.elegirAdjuntos, async (): Promise<string[]> => {
    const v = s.ventana()
    const opciones = { title: 'Agregar archivos o fotos' }
    const r = await (v
      ? dialog.showOpenDialog(v, { ...opciones, properties: ['openFile', 'multiSelections'] })
      : null)
    return r && !r.canceled ? r.filePaths.slice(0, MAX_ADJUNTOS) : []
  })
  ipcMain.handle(CANALES.guardarPegada, async (_, bytes: unknown) => {
    if (!(bytes instanceof Uint8Array) || bytes.byteLength > MAX_PEGADA)
      throw new Error('guardarPegada: no es una imagen o pesa más de 20 MB')
    return s.fotos.guardarPegada(bytes)
  })
  ipcMain.handle(CANALES.miniatura, (_, ruta: unknown) => s.fotos.miniatura(RutaAbsoluta.parse(ruta)))
  ipcMain.handle(CANALES.fotoGrande, (_, ruta: unknown) => s.fotos.grande(RutaAbsoluta.parse(ruta)))
  ipcMain.handle(
    CANALES.abrirAdjunto,
    async (_, ruta: unknown, archivo: unknown): Promise<ResultadoAdjunto> => {
      const r = await proyecto(ruta)
      const a = RutaAbsoluta.parse(archivo)
      if (!(await existe(a))) return { tipo: 'no-esta' }
      const dentro = relative(r, a)
      if (dentro && !dentro.startsWith('..') && !isAbsolute(dentro))
        return { tipo: 'en-proyecto', archivo: dentro.replace(/\\/g, '/') }
      if (process.env.IRIDIUM_VSCODE === 'falso') return { tipo: 'ok' }
      // Un clic en una ficha nunca ejecuta un programa: se muestra en su carpeta (`diseno-tecnico.md` › Seguridad).
      if (SE_EJECUTA.test(a)) {
        shell.showItemInFolder(a)
        return { tipo: 'ok' }
      }
      const error = await shell.openPath(a)
      return error ? { tipo: 'error', mensaje: `Windows no lo pudo abrir: ${error}` } : { tipo: 'ok' }
    },
  )

  ipcMain.handle(CANALES.estadoMotor, () => estadoMotor)
  // CO-I1: el login abre el navegador; al terminar se vuelve a verificar y el marco y los avisos se enteran solos.
  ipcMain.handle(CANALES.iniciarSesion, async () => {
    s.registro.escribir('Claude Code: iniciar sesión')
    await s.motor.iniciarSesion()
    return verificarMotor()
  })
  ipcMain.handle(CANALES.uso, () => uso.get())
  ipcMain.handle(CANALES.cerrarIgual, async () => {
    s.registro.escribir(`Cerrar igual: se frenan ${conversaciones.enMarcha().length} sesiones`)
    await conversaciones.detenerTodo()
    s.cerrarVentana()
  })

  ipcMain.handle(CANALES.cancelarCierre, () => s.cancelarCierre())
  ipcMain.handle(CANALES.zoom, (_, paso: unknown) => {
    if (paso === 1 || paso === -1 || paso === 0) s.zoom?.(paso)
  })
  ipcMain.handle(CANALES.versionNueva, () => s.versionNueva?.ultima() ?? null)
  ipcMain.handle(CANALES.reiniciarAhora, () => {
    s.registro.escribir('Actualizar: reinicia con la versión lista')
    s.reiniciarAhora()
  })
  s.versionNueva?.vigilar((v) => {
    if (v) s.registro.escribir(`Versión nueva lista: ${v.commit} del ${v.fecha}`)
    enviar(CANALES.versionNuevaCambio, v)
  })
  ipcMain.handle(CANALES.sinArmar, () => s.sinArmar?.ultimo() ?? null)
  ipcMain.handle(CANALES.armar, async () => {
    if (!s.sinArmar) return { tipo: 'error', mensaje: 'En desarrollo no hay app de uso diario para armar.' }
    s.registro.escribir('Actualizar: arma')
    return s.sinArmar.armar()
  })
  ipcMain.handle(CANALES.actualizarSolo, () => actualizarSolo(process.env.IRIDIUM_ACTUALIZAR_SOLO))
  ipcMain.handle(CANALES.segundosSinUso, () => s.segundosSinUso())
  ipcMain.handle(CANALES.cancelarArmado, async () => {
    s.registro.escribir('Actualizar: Cancelar')
    await s.sinArmar?.cancelar()
  })
  ipcMain.handle(CANALES.verConsolaArmado, async () => {
    if (!s.sinArmar) return { tipo: 'error', mensaje: 'No hay armado.' }
    const error = await shell.openPath(s.sinArmar.consola())
    return error ? { tipo: 'error', mensaje: `Windows no lo pudo abrir: ${error}` } : { tipo: 'ok' }
  })
  s.sinArmar?.vigilar((a) => {
    if (a.pendiente)
      s.registro.escribir(
        `Sin armar: ${a.pendiente.commit}${a.armando ? ' (armando)' : ''}${a.fallo ? ` (falló: ${a.fallo.motivo})` : ''}`,
      )
    enviar(CANALES.sinArmarCambio, a)
  })

  ipcMain.handle(CANALES.abrirConversacion, async (_, ruta: unknown) =>
    conversaciones.abrir(await proyecto(ruta)),
  )
  ipcMain.handle(CANALES.anteriores, async (_, ruta: unknown, tengo: unknown) =>
    conversaciones.anteriores(await proyecto(ruta), Tengo.parse(tengo)),
  )
  ipcMain.handle(CANALES.seguir, async (_, ruta: unknown, pedido: unknown) => {
    const valido = Pedido.parse(pedido)
    const carpeta = await proyecto(ruta)
    // La ventana ya esperó con `ponerseAlDia`; esto cubre lo que llegue sin pasar por ahí (enseguida si ya se miró).
    await sincronia.alDia(carpeta)
    await conversaciones.seguir(carpeta, {
      ...(valido.texto !== undefined ? { texto: valido.texto } : {}),
      ...(valido.nueva !== undefined ? { nueva: valido.nueva } : {}),
      ...(valido.adjuntos?.length ? { adjuntos: valido.adjuntos } : {}),
    })
  })
  ipcMain.handle(CANALES.detener, async (_, ruta: unknown) => conversaciones.detener(await proyecto(ruta)))
  ipcMain.handle(CANALES.capacidades, () => s.motor.capacidades())
  ipcMain.handle(CANALES.comandos, async (_, ruta: unknown) => comandos.de(await proyecto(ruta)))
  ipcMain.handle(CANALES.cerrarFicha, async (_, ruta: unknown) =>
    conversaciones.cerrarFicha(await proyecto(ruta)),
  )
  ipcMain.handle(CANALES.pendientes, async (_, ruta: unknown) => pendientes.proyecto(await proyecto(ruta)))
  ipcMain.handle(CANALES.responder, async (_, ruta: unknown, pedido: unknown) =>
    pendientes.responder(await proyecto(ruta), PedidoResponder.parse(pedido)),
  )
  ipcMain.handle(CANALES.aMedias, async (_, ruta: unknown, codigo: unknown, borrador: unknown) =>
    guardando(async () =>
      pendientes.aMedias(await proyecto(ruta), Codigo.parse(codigo), EsquemaBorrador.parse(borrador)),
    ),
  )
  ipcMain.handle(CANALES.documento, async (_, ruta: unknown, documento: unknown) =>
    pendientes.documento(await proyecto(ruta), Documento.parse(documento)),
  )
  ipcMain.handle(CANALES.documentos, async (_, ruta: unknown) =>
    ordenDeDocumentos((await docs.de(await proyecto(ruta))).rutas()),
  )
  ipcMain.handle(CANALES.mapa, async (_, ruta: unknown) => {
    const r = await proyecto(ruta)
    try {
      const [d, preguntas] = await Promise.all([docs.de(r), leerPreguntasAbiertas(r)])
      return mapaDe(d, preguntas)
    } catch (e) {
      return { tipo: 'error', mensaje: `No se pudieron leer los documentos: ${motivo(e)}` }
    }
  })
  ipcMain.handle(CANALES.carpeta, async (_, ruta: unknown, carpeta: unknown) =>
    leerCarpeta(await proyecto(ruta), RutaArchivo.parse(carpeta)),
  )
  ipcMain.handle(CANALES.listaArchivos, async (_, ruta: unknown) => listarArchivos(await proyecto(ruta)))
  ipcMain.handle(CANALES.archivo, async (_, ruta: unknown, archivo: unknown) =>
    leerArchivo(await proyecto(ruta), RutaArchivo.parse(archivo)),
  )
  ipcMain.handle(CANALES.conversacionesAnteriores, async (_, ruta: unknown) =>
    conversaciones.lista(await proyecto(ruta)),
  )
  ipcMain.handle(CANALES.scripts, async (_, ruta: unknown) => {
    const d = await docs.de(await proyecto(ruta))
    return { existe: d.existe('docs/scripts.md'), scripts: d.scripts() }
  })
  ipcMain.handle(CANALES.correrScript, async (_, ruta: unknown, id: unknown) => {
    const d = await docs.de(await proyecto(ruta))
    return ejecutarPlan(
      await d.prepararScript(IdScript.parse(id)),
      (r) => shell.openPath(r),
      abrirEnNavegador,
    )
  })
  // Ejecutar Alfa y Armar ahora (frente Abrir, AB-1, AB-2): lo marcado en `docs/scripts.md`, buscado de nuevo.
  /** Ejecutar Alfa (AB-1): lo que abre el proyecto; si es un programa que no existe, `sin-armar` (AB-2). */
  const ejecutar = async (carpeta: string): Promise<ResultadoEjecutar> => {
    const plan = await (await docs.de(carpeta)).prepararEjecutar()
    if (plan.tipo === 'sin-armar') return plan
    return ejecutarPlan(plan, (r) => shell.openPath(r), abrirEnNavegador)
  }
  /** Al terminar de armarse, la abre (AB-2): con la versión nueva o, si falló, con la anterior que haya. */
  const abrirAlTerminar = (carpeta: string, fin: Promise<unknown>): void => {
    void fin.then(() => ejecutar(carpeta)).catch(() => {})
  }
  ipcMain.handle(CANALES.ejecutarProyecto, async (_, ruta: unknown): Promise<ResultadoEjecutar> => {
    const carpeta = await proyecto(ruta)
    // Se está armando (AB-2, AB-3): espera y la abre al terminar.
    if (armados?.armando(carpeta)) {
      abrirAlTerminar(carpeta, armados.esperar(carpeta))
      return { tipo: 'esperando' }
    }
    return ejecutar(carpeta)
  })
  // Armar ahora (AB-2): escondido, como la actualización automática, y la abre al terminar. Sin el vigía, o si el
  // proyecto no se arma solo, el script de armar a la vista, como Scripts.
  ipcMain.handle(CANALES.armarProyecto, async (_, ruta: unknown): Promise<ResultadoScript> => {
    const carpeta = await proyecto(ruta)
    if (armados && (await planDe(carpeta))) {
      abrirAlTerminar(carpeta, armados.armarYa(carpeta))
      return { tipo: 'ok', mensaje: 'Armando.' }
    }
    return ejecutarPlan(await (await docs.de(carpeta)).prepararArmar(), (r) => shell.openPath(r))
  })
  ipcMain.handle(CANALES.actualizaciones, () => armados?.ultimos() ?? {})
  ipcMain.handle(CANALES.actualizarAhora, async (_, ruta: unknown) => {
    const carpeta = await proyecto(ruta)
    if (!armados || !(await planDe(carpeta))) return 'falla'
    return armados.armarYa(carpeta)
  })
  ipcMain.handle(CANALES.consolaArmado, async (_, ruta: unknown) => {
    if (!s.armados) return
    await shell.openPath(join(carpetaDeArmado(s.armados.carpetaDatos, await proyecto(ruta)), LOG_ARMADO))
  })
  ipcMain.handle(CANALES.comentarios, async (_, ruta: unknown) => comentarios.listar(await proyecto(ruta)))
  ipcMain.handle(CANALES.capturaComentario, async (_, ruta: unknown, codigo: unknown) =>
    comentarios.captura(await proyecto(ruta), CodigoComentario.parse(codigo)),
  )
  ipcMain.handle(CANALES.enviarComentario, async (_, ruta: unknown, codigo: unknown) =>
    comentarios.enviar(await proyecto(ruta), CodigoComentario.parse(codigo)),
  )
  ipcMain.handle(CANALES.reabrirComentario, async (_, ruta: unknown, codigo: unknown, nota: unknown) =>
    comentarios.reabrir(await proyecto(ruta), CodigoComentario.parse(codigo), NotaReabrir.parse(nota)),
  )
  ipcMain.handle(CANALES.git, async (_, ruta: unknown) => {
    const carpeta = await proyecto(ruta)
    const g = await leerGit(carpeta)
    return g.tipo === 'ok' && g.remoto.tipo === 'remoto'
      ? { ...g, remoto: { ...g.remoto, sincronia: sincronia.de(carpeta) } }
      : g
  })
  ipcMain.handle(CANALES.commit, async (_, ruta: unknown, hash: unknown) =>
    leerCommit(await proyecto(ruta), HashCommit.parse(hash)),
  )
  ipcMain.handle(CANALES.diferencia, async (_, ruta: unknown, commit: unknown, archivo: unknown) =>
    leerDiferencia(await proyecto(ruta), CommitPedido.parse(commit), RutaArchivo.parse(archivo)),
  )
  // Lo único que cambia el repositorio desde Iridium (D-081): crearlo y publicarlo en GitHub.
  const github = process.env.IRIDIUM_GITHUB === 'falso' ? githubFalso() : githubReal()
  ipcMain.handle(CANALES.inicializarGit, async (_, ruta: unknown) => inicializarRepo(await proyecto(ruta)))
  ipcMain.handle(CANALES.cuentaGithub, () => github.cuenta())
  ipcMain.handle(CANALES.publicarGithub, async (_, ruta: unknown, pedido: unknown) =>
    publicarRepo(await proyecto(ruta), PedidoPublicar.parse(pedido), github),
  )
  // Commit y subir, y Sincronizar (D-159): no mientras la IA trabaja en el proyecto (guardaría su trabajo a medias).
  const ocupadaLaIa = {
    tipo: 'error',
    mensaje: 'La IA está trabajando en este proyecto: esperá a que termine.',
  } as const
  const anotarSincronia = (carpeta: string, r: ResultadoGit) => {
    if (r.tipo === 'ok')
      sincronia.anotar(carpeta, { cuando: Date.now(), resultado: 'al-dia', bajados: 0, motivo: null })
    armados?.alTerminarTurno(carpeta)
    return r
  }
  ipcMain.handle(CANALES.guardarGit, async (_, ruta: unknown, mensaje: unknown, subir: unknown) => {
    const carpeta = await proyecto(ruta)
    if (iaEnMarcha(carpeta)) return ocupadaLaIa
    await sincronia.alDia(carpeta)
    const r = await guardarYSubir(carpeta, MensajeCommit.parse(mensaje), z.boolean().parse(subir))
    return subir ? anotarSincronia(carpeta, r) : r
  })
  ipcMain.handle(CANALES.sincronizarGit, async (_, ruta: unknown) => {
    const carpeta = await proyecto(ruta)
    if (iaEnMarcha(carpeta)) return ocupadaLaIa
    return anotarSincronia(carpeta, await sincronizar(carpeta))
  })
  ipcMain.handle(CANALES.revisarRemoto, async (_, ruta: unknown) => sincronia.revisar(await proyecto(ruta)))
  ipcMain.handle(CANALES.ponerseAlDia, async (_, ruta: unknown) => sincronia.alDia(await proyecto(ruta)))
  ipcMain.handle(CANALES.elegirConversacion, async (_, ruta: unknown, id: unknown) =>
    conversaciones.elegir(await proyecto(ruta), IdConversacion.parse(id)),
  )

  // Skills (modulos/skills/): se lee todo cada vez (unas 35 carpetas). Abrir carpeta y Actualizar al framework solo aceptan
  // lo que salió de la última lectura (diseno-tecnico.md › Seguridad).
  let carpetasSkills = new Set<string>()
  const leerSkills = async () => {
    await listar()
    const r = await leerSeccionSkills(s.carpetaClaude, enDisco.rutas.skills)
    carpetasSkills = new Set(r.skills.map((x) => x.id))
    return r
  }
  const conFramework = async () => {
    const lista = await listar()
    return proyectosConFramework(lista.tipo === 'lista' ? lista.proyectos : [])
  }
  ipcMain.handle(CANALES.skills, () => leerSkills())
  ipcMain.handle(CANALES.framework, () => conFramework())
  const carpetaDeSkill = (id: unknown): string => {
    const carpeta = Ruta.parse(id)
    if (!carpetasSkills.has(carpeta)) throw new Error('Esa carpeta no es de una skill de la lista')
    return carpeta
  }
  ipcMain.handle(CANALES.abrirCarpetaSkill, async (_, id: unknown) => {
    const error = await shell.openPath(carpetaDeSkill(id))
    if (error) throw new Error(error)
  })
  // Los archivos de una skill, con el árbol y el visor de Archivos (Q-95): solo lectura y sin salir de su carpeta.
  ipcMain.handle(CANALES.carpetaSkill, async (_, id: unknown, carpeta: unknown) =>
    leerCarpeta(carpetaDeSkill(id), RutaArchivo.parse(carpeta)),
  )
  ipcMain.handle(CANALES.archivoSkill, async (_, id: unknown, archivo: unknown) => {
    const r = await leerArchivo(carpetaDeSkill(id), RutaArchivo.parse(archivo))
    // «Ver en Docs» es de los documentos de un proyecto: acá no va.
    return r.tipo === 'texto' ? { ...r, documento: false } : r
  })
  // Actualizar al framework (F-9, OR-8): solo un proyecto de la lista que esté fuera o sea una carpeta simple. Va siempre
  // en una conversación nueva: retomar la última relee todo su historial y gasta uso en vano.
  ipcMain.handle(CANALES.pasarAlFramework, async (_, dato: unknown) => {
    const ruta = await proyecto(dato)
    const p = (await conFramework()).find((x) => x.ruta === ruta)
    if (!p || !(fueraDelFramework(p.estado) || p.estado.tipo === 'carpeta'))
      throw new Error('Ese proyecto ya sigue el framework')
    if (conversaciones.enMarcha().includes(ruta)) throw new Error('La IA de ese proyecto está trabajando')
    await conversaciones.seguir(ruta, { texto: MENSAJE_PASAR_AL_FRAMEWORK, nueva: true })
  })

  // El trabajo de un proyecto (W-11) y las skills (R-8): solo leen.
  ipcMain.handle(CANALES.trabajoProyecto, async (_, ruta: unknown) =>
    trabajoDelProyecto(await docs.de(await proyecto(ruta))),
  )
  // La sección Ideas (D-130): la ventana manda lo escrito; este lado arma el `T-n` y escribe sin pisar a la IA. La
  // carpeta Ideas es el lugar de las ideas sueltas del inicio (ID-I4): `sueltas.md`, no `trabajo.md`.
  const lugar = async (dato: unknown): Promise<string | LugarIdeas> => {
    const ruta = await proyecto(dato)
    return ruta === enDisco.rutas.ideas ? lugarDeSueltas(ruta) : ruta
  }
  ipcMain.handle(CANALES.ideasProyecto, async (_, ruta: unknown) => ideasDeProyecto(await lugar(ruta)))
  ipcMain.handle(CANALES.anotarIdea, async (_, ruta: unknown, escrito: unknown, imagenes: unknown) =>
    anotarIdea(await lugar(ruta), Escrito.parse(escrito), undefined, ImagenesAlAnotar.parse(imagenes ?? [])),
  )
  ipcMain.handle(CANALES.estadoIdea, async (_, ruta: unknown, codigo: unknown, estado: unknown) =>
    cambiarEstadoIdea(await lugar(ruta), CodigoIdea.parse(codigo), EstadoIdeaEsquema.parse(estado)),
  )
  ipcMain.handle(CANALES.notaIdea, async (_, ruta: unknown, codigo: unknown) =>
    leerNotaIdea(await lugar(ruta), CodigoIdea.parse(codigo)),
  )
  ipcMain.handle(CANALES.guardarIdea, async (_, ruta: unknown, codigo: unknown, escrito: unknown) =>
    guardarIdea(await lugar(ruta), CodigoIdea.parse(codigo), TextoNotas.parse(escrito)),
  )
  ipcMain.handle(
    CANALES.pegarImagenIdea,
    async (_, ruta: unknown, codigo: unknown, mime: unknown, datos: unknown) =>
      pegarImagenIdea(
        await lugar(ruta),
        CodigoIdea.parse(codigo),
        Mime.parse(mime),
        ImagenBase64.parse(datos),
      ),
  )
  ipcMain.handle(CANALES.imagenDelPortapapeles, () => leerImagenDelPortapapeles())
  ipcMain.handle(CANALES.borrarIdea, async (_, ruta: unknown, codigo: unknown) =>
    borrarIdea(await lugar(ruta), CodigoIdea.parse(codigo)),
  )
  // Mover solo va a un proyecto de la carpeta de proyectos (no a Ideas ni a Skills).
  ipcMain.handle(CANALES.moverIdea, async (_, desde: unknown, codigo: unknown, hacia: unknown) => {
    const a = await proyecto(hacia)
    if (a === enDisco.rutas.ideas || a === enDisco.rutas.skills)
      throw new Error('Una idea solo se mueve a un proyecto')
    return moverIdea(await lugar(desde), CodigoIdea.parse(codigo), a)
  })
  ipcMain.handle(CANALES.skillsProyecto, async (_, ruta: unknown) => skillsDelProyecto(await proyecto(ruta)))

  // Diseño (frente Diseño, DS-11 a DS-13): abrirlo da de alta el proyecto para el protocolo `maqueta:` y la grande.
  ipcMain.handle(CANALES.abrirDiseno, async (_, ruta: unknown) => {
    const r = await proyecto(ruta)
    return vistaDiseno(r, `${ESQUEMA_MAQUETA}://${s.maquetas.abrir(r)}/`, s.vistos)
  })
  ipcMain.handle(CANALES.marcarVista, async (_, ruta: unknown, archivo: unknown) =>
    marcarVista(await proyecto(ruta), ArchivoMaqueta.parse(archivo), s.vistos),
  )
  // Los pedidos a la IA (DS-1): el texto lo arma este lado y cita el framework; la ventana solo dice cuál.
  ipcMain.handle(CANALES.pedirDiseno, async (_, ruta: unknown, pedido: unknown) => {
    const r = await proyecto(ruta)
    PedidoDisenoEsquema.parse(pedido)
    if (conversaciones.enMarcha().includes(r)) throw new Error('La IA de ese proyecto está trabajando')
    const raiz = await readdir(r).catch(() => [] as string[])
    await conversaciones.seguir(r, { texto: pedidoEmpezar(tieneCodigo(raiz)) })
  })

  // El menú de la tarjeta y Nuevo proyecto (R-7, D-089). Solo sobre carpetas de la carpeta de proyectos (no Ideas ni
  // Skills) y, en la ficha, solo estado, archivado e ícono.
  const deLaRaiz = async (dato: unknown): Promise<string> => {
    const ruta = normalize(Ruta.parse(dato))
    if (dirname(ruta) !== (await raiz()) || !(await existeCarpeta(ruta)))
      throw new Error('Ese proyecto no está en la carpeta de proyectos')
    return ruta
  }
  const ficha = async (r: { ok: true } | { ok: false; mensaje: string }): Promise<ResultadoFicha> => {
    if (!r.ok) return { tipo: 'error', mensaje: r.mensaje }
    return { tipo: 'ok', lista: await listar() }
  }
  ipcMain.handle(CANALES.estadoProyecto, async (_, ruta: unknown, estado: unknown) => {
    const r = await deLaRaiz(ruta)
    return ficha(await cambiarEstadoProyecto(await raiz(), r, EstadoFicha.parse(estado)))
  })
  ipcMain.handle(CANALES.archivarProyecto, async (_, ruta: unknown, archivado: unknown) => {
    const r = await deLaRaiz(ruta)
    return ficha(await archivarProyecto(await raiz(), r, z.boolean().parse(archivado)))
  })
  ipcMain.handle(CANALES.iconoProyecto, async (_, ruta: unknown): Promise<ResultadoFicha> => {
    const r = await deLaRaiz(ruta)
    const v = s.ventana()
    const opciones = {
      title: 'Elegir el ícono del proyecto',
      defaultPath: r,
      filters: [{ name: 'Imágenes', extensions: ['svg', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'ico'] }],
    }
    const elegido = await (v ? dialog.showOpenDialog(v, { ...opciones, properties: ['openFile'] }) : null)
    const archivo = elegido && !elegido.canceled ? elegido.filePaths[0] : undefined
    if (!archivo) return { tipo: 'cancelada' }
    return ficha(await cambiarIconoProyecto(await raiz(), r, archivo))
  })
  ipcMain.handle(
    CANALES.abrirEnVsCode,
    async (_, ruta: unknown, archivo: unknown, linea: unknown): Promise<ResultadoAbrir> => {
      const r = await deLaRaiz(ruta)
      // Un archivo del proyecto (Archivos): solo si queda adentro, también siguiendo enlaces.
      let elegido: { real: string; linea: number | null } | undefined
      if (archivo !== undefined && archivo !== null) {
        const real = await enElProyecto(r, RutaArchivo.parse(archivo)).catch(() => null)
        if (!real) return { tipo: 'error', mensaje: 'Ese archivo no es del proyecto o ya no existe.' }
        elegido = { real, linea: z.number().int().positive().nullish().parse(linea) ?? null }
      }
      s.registro.escribir(
        `Abrir en VS Code: ${basename(r)}${elegido ? ` › ${String(archivo)}:${elegido.linea ?? 1}` : ''}`,
      )
      if (process.env.IRIDIUM_VSCODE === 'falso') return { tipo: 'ok' }
      return abrirEnVsCode(r, elegido)
    },
  )
  ipcMain.handle(CANALES.abrirCarpetaProyecto, async (_, ruta: unknown): Promise<ResultadoAbrir> => {
    const r = await deLaRaiz(ruta)
    if (process.env.IRIDIUM_VSCODE === 'falso') return { tipo: 'ok' }
    const error = await shell.openPath(r)
    return error ? { tipo: 'error', mensaje: `Windows no la pudo abrir: ${error}` } : { tipo: 'ok' }
  })
  // Eliminar (R-10, D-090): primero el plan, que queda de este lado; con la confirmación, se ejecuta ese mismo plan.
  // Lo regenerable se borra; el resto va a la papelera de Windows (o, en las pruebas, a `IRIDIUM_PAPELERA`).
  const planes = new Map<string, PlanEliminacion>()
  const trabajando = (r: string) => conversaciones.enMarcha().some((c) => normalize(c) === r)
  ipcMain.handle(CANALES.planEliminarProyecto, async (_, ruta: unknown): Promise<ResultadoPlanEliminar> => {
    const r = await deLaRaiz(ruta)
    if (trabajando(r))
      return { tipo: 'error', mensaje: 'La IA de ese proyecto está trabajando: frenala primero.' }
    const p = await prepararEliminacion(await raiz(), r, undefined)
    if (!p.ok) return { tipo: 'error', mensaje: p.mensaje }
    const plan = await medirRegenerables(p.ruta, p.plan)
    planes.set(r, plan)
    return { tipo: 'ok', plan }
  })
  ipcMain.handle(CANALES.eliminarProyecto, async (_, ruta: unknown): Promise<ResultadoFicha> => {
    const r = await deLaRaiz(ruta)
    const plan = planes.get(r)
    planes.delete(r)
    if (!plan)
      return { tipo: 'error', mensaje: 'Primero hay que revisar la carpeta: vuelve a elegir Eliminar.' }
    if (trabajando(r))
      return { tipo: 'error', mensaje: 'La IA de ese proyecto está trabajando: frenala primero.' }
    const prueba = process.env.IRIDIUM_PAPELERA
    const papelera = prueba
      ? async (p: string) => {
          await mkdir(prueba, { recursive: true })
          await rename(p, join(prueba, `${Date.now()}-${basename(p)}`))
        }
      : (p: string) => shell.trashItem(p)
    s.registro.escribir(`Eliminar: ${basename(r)}`)
    return ficha(await ejecutarEliminacion(await raiz(), r, plan, undefined, papelera))
  })
  ipcMain.handle(CANALES.nuevoProyecto, async (_, nombre: unknown): Promise<ResultadoNuevo> => {
    const creado = await crearProyecto(await raiz(), NombreProyecto.parse(nombre), s.plantillas)
    if (!creado.ok) return { tipo: 'error', mensaje: creado.mensaje }
    s.registro.escribir(`Proyecto nuevo: ${creado.nombre}`)
    return { tipo: 'ok', ruta: creado.ruta, lista: await listar() }
  })

  // La carpeta Iridium (D-083): mudar las de antes y cambiarla de lugar. Lo que depende de la ruta se muda con ellas.
  const mudarCarpetas = async (
    pares: { cual: Cual; origen: string; destino: string }[],
  ): Promise<ResultadoMudanza> => {
    if (pares.some((p) => conversaciones.enMarcha().includes(p.origen)))
      return {
        tipo: 'error',
        mensaje: 'La IA está trabajando en esa carpeta: espera a que termine y prueba de nuevo.',
      }
    const avisos: string[] = []
    let movidas = 0
    for (const { origen, destino } of pares) {
      try {
        await moverCarpeta(origen, destino)
      } catch (e) {
        const mensaje = `No se pudo mover ${origen}: ${e instanceof Error ? e.message : String(e)}`
        s.registro.escribir(`Mudanza: ${mensaje}`)
        if (movidas === 0) return { tipo: 'error', mensaje: `${mensaje}. No se cambió nada.` }
        avisos.push(mensaje)
        continue
      }
      movidas++
      s.registro.escribir(`Mudanza: ${origen} → ${destino}`)
      conversaciones.olvidar(origen)
      const fallas = await reenlazarSkills(s.carpetaClaude, origen, destino)
      if (fallas.length > 0) avisos.push(`No se pudieron rehacer los enlaces de: ${fallas.join(', ')}.`)
      await s.motor.mudarConversaciones(origen, destino).catch(() => {
        avisos.push(
          `Las conversaciones anteriores de ${basename(destino)} quedaron en Claude Code sin mudar.`,
        )
      })
      await s.sesiones.mudarRuta(origen, destino)
      await s.escritos.mudarRuta(origen, destino)
      const c = await s.config.leer()
      const { [origen]: ajuste, ...otros } = c.ajustesIa
      await s.config.guardar({
        pestanas: c.pestanas.map((r) => (r === origen ? destino : r)),
        ajustesIa: ajuste ? { ...otros, [destino]: ajuste } : c.ajustesIa,
        abierto: c.abierto === origen ? destino : c.abierto,
      })
    }
    for (const a of avisos) s.registro.escribir(`Mudanza: ${a}`)
    return { tipo: 'ok', lista: await listar(), avisos }
  }

  ipcMain.handle(CANALES.mudar, async (): Promise<ResultadoMudanza> => {
    await listar()
    const { mudanza } = enDisco
    if (!mudanza) return { tipo: 'error', mensaje: 'No hay nada para mover.' }
    const iridium = await carpetaIridium()
    const destinos = rutasIridium(iridium)
    const pares = (['ideas', 'skills'] as const).flatMap((cual) => {
      const origen = mudanza[cual]
      return origen ? [{ cual, origen, destino: destinos[cual] }] : []
    })
    const v = s.ventana()
    const r = await (v
      ? dialog.showMessageBox(v, {
          type: 'question',
          title: 'Mover a la carpeta de Iridium',
          message: `¿Mover ${pares.map((p) => basename(p.origen)).join(' y ')} a ${iridium}?`,
          detail:
            'Se mueven enteras, con su historial de git, a la carpeta .iridium de tu carpeta de proyectos. Iridium ' +
            'rehace los enlaces de tus skills y se lleva las conversaciones de esas carpetas. Tus proyectos no se mueven.',
          buttons: ['Mover', 'Cancelar'],
          defaultId: 0,
          cancelId: 1,
        })
      : null)
    if (r?.response !== 0) return { tipo: 'cancelada' }
    mudando = true
    try {
      return await mudarCarpetas(pares)
    } finally {
      mudando = false
    }
  })

  // Al abrir, el motor se verifica aparte: la grilla no lo espera (05-arquitectura.md › Abrir la app).
  void verificarMotor()
  void arranque.iniciar()
  armados?.vigilar()
  sincronia.vigilar()

  return {
    comentarios,
    enMarcha: () => conversaciones.enMarcha(),
    pedirCierre: (trabajando) => enviar(CANALES.pedirCierre, trabajando),
    alVolver() {
      if (estadoMotor.tipo === 'listo') void uso.alVolver()
    },
    async terminarDeGuardar() {
      // Lo último que manda la ventana al cerrarse llega un instante después: se le da ese momento.
      await new Promise((r) => setTimeout(r, 150))
      await Promise.race([Promise.all([...enCurso]), new Promise((r) => setTimeout(r, 3000))])
    },
    alSuspender: () => arranque.alSuspender(),
    alDespertar: () => void arranque.alDespertar(),
    cerrar() {
      arranque.cerrar()
      armados?.cerrar()
      sincronia.cerrar()
      uso.cerrar()
      conversaciones.cerrarTodo()
      vigilancia?.cerrar()
      vigilanciaIridium?.cerrar()
      for (const canal of Object.values(CANALES)) ipcMain.removeHandler(canal)
    },
  }
}

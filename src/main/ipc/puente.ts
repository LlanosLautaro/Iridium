// El lado principal del puente: atiende los pedidos de la ventana y le manda los eventos. Valida todo lo que llega.
import { basename, dirname, join, normalize } from 'node:path'
import { type BrowserWindow, dialog, ipcMain, shell } from 'electron'
import {
  CANALES,
  type EstadoMotor,
  type EstilosRespuesta,
  type ListaProyectos,
  type Preferencias,
  type ResultadoMudanza,
  type SinArmar,
  type Tema,
  type VersionNueva,
} from '../../compartido/puente'
import { MENSAJE_PONER_AL_DIA } from '../../compartido/skills'
import { Conversaciones } from '../app/conversacion'
import { Documentos, ordenDeDocumentos } from '../app/documentos'
import { leerSeccionIdeas } from '../app/ideas'
import { mapaDe } from '../app/mapa'
import { Pendientes } from '../app/pendientes'
import { leerPreguntasAbiertas, listarProyectos } from '../app/proyectos'
import { Comentarios } from '../app/revision/comentarios'
import { leerSeccionSkills, proyectosAtrasados } from '../app/skills'
import { UsoDeLaSuscripcion } from '../app/uso'
import { motivo } from '../app/visor'
import { type Cual, rutasIridium } from '../core/carpeta-iridium'
import {
  INSTRUCCION_CENTRO,
  INSTRUCCION_SKILLS,
  instruccionGeneral,
  instruccionRevision,
} from '../core/sesiones'
import { leerArchivo, leerCarpeta } from '../infra/archivos'
import type { ArchivoBorradores } from '../infra/borradores'
import {
  type CarpetasEnDisco,
  moverCarpeta,
  prepararCarpetaIridium,
  reenlazarSkills,
} from '../infra/carpeta-iridium'
import { type ArchivoConfig, preferenciasDe } from '../infra/config'
import { ejecutarPlan } from '../infra/ejecutar'
import type { ArchivoEscritos } from '../infra/escritos'
import { leerCommit, leerDiferencia, leerGit } from '../infra/git'
import { githubFalso, githubReal, inicializarRepo, publicarRepo } from '../infra/github'
import { existeCarpeta } from '../infra/raiz'
import type { Registro } from '../infra/registro'
import type { ArchivoSesiones } from '../infra/sesiones'
import { type Vigilancia, vigilar } from '../infra/vigilancia'
import type { Motor } from '../motor/motor'
import {
  CambioPreferencias,
  Codigo,
  CodigoComentario,
  CommitPedido,
  Documento,
  Escrito,
  EsquemaBorrador,
  HashCommit,
  IdConversacion,
  IdScript,
  NotaReabrir,
  Pedido,
  PedidoPublicar,
  PedidoResponder,
  Ruta,
  RutaArchivo,
  Tengo,
} from './esquemas'

export interface Servicios {
  config: ArchivoConfig
  sesiones: ArchivoSesiones
  borradores: ArchivoBorradores
  escritos: ArchivoEscritos
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
  } | null
  /** Reiniciar ahora: cierra la ventana como siempre (F-6 pregunta si hay sesiones) y al salir abre la versión nueva. */
  reiniciarAhora: () => void
  /** Se canceló la confirmación de F-6: si era para reiniciar, ya no. */
  cancelarCierre: () => void
  /** Se eligió otro tema (AJ-1): la barra de título y el fondo de la ventana, que dibuja Windows, lo siguen. */
  alCambiarTema?: (tema: Tema) => void
  /** Ctrl+= / Ctrl+- / Ctrl+0 (Defecto 17): la ventana agranda, achica o vuelve al tamaño normal. */
  zoom?: (paso: 1 | -1 | 0) => void
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
  const carpetaIridium = async (): Promise<string> =>
    normalize((await s.config.leer()).carpetaIridium ?? s.carpetaIridiumInicial())

  // El uso de la suscripción (H-12): al verificar, con cada turno de cualquier sesión, al volver a la ventana y cada tanto.
  const uso = new UsoDeLaSuscripcion({ motor: s.motor, alCambio: (u) => enviar(CANALES.usoCambio, u) })

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
  const listar = async (): Promise<ListaProyectos> => {
    const [actual, iridium] = await Promise.all([raiz(), carpetaIridium()])
    enDisco = await prepararCarpetaIridium(iridium, actual, !mudando)
    raizActual = actual
    const lista = await listarProyectos(actual, iridium, enDisco)
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
    enviarALaSesion: (ruta, texto) => conversaciones.seguir(ruta, { texto }),
    ultimaConexion: s.ultimaConexionExtension,
  })

  const conversaciones = new Conversaciones({
    motor: s.motor,
    registro: s.sesiones,
    preguntas: leerPreguntasAbiertas,
    alCambio: (c) => enviar(CANALES.conversacionCambio, c),
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
    registrar: (texto) => s.registro.escribir(texto),
    // Los mensajes de la IA con los códigos y las citas del proyecto como enlaces (F-4).
    html: async (ruta) => {
      const d = await docs.de(ruta)
      return (texto) => d.html(texto, '')
    },
  })

  const pendientes = new Pendientes(s.borradores, Date.now, docs)

  ipcMain.handle(CANALES.listarProyectos, () => listar())

  ipcMain.handle(CANALES.elegirCarpeta, async () => {
    const v = s.ventana()
    const opciones = { title: 'Elegir la carpeta de proyectos', defaultPath: await raiz() }
    const r = await (v ? dialog.showOpenDialog(v, { ...opciones, properties: ['openDirectory'] }) : null)
    const elegida = r && !r.canceled ? r.filePaths[0] : undefined
    if (!elegida) return null
    await s.config.guardar({ raiz: elegida })
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
    const { tema: temaAntes, tono: tonoAntes } = previa
    const despues = preferenciasDe(await s.config.guardar(limpio))
    if (despues.tema !== temaAntes) s.alCambiarTema?.(despues.tema)
    if (despues.tono !== tonoAntes) conversaciones.ponerTono(despues.tono || null)
    // El modelo o el esfuerzo de un proyecto con la sesión abierta valen desde su próximo mensaje (C-58).
    if (valido.ajustesIa)
      for (const [ruta, a] of Object.entries(valido.ajustesIa))
        if (antes[ruta]?.modelo !== a.modelo || antes[ruta]?.esfuerzo !== a.esfuerzo)
          conversaciones.ajustar(ruta, a)
    return despues
  })

  ipcMain.handle(CANALES.leerEscritos, async () => Object.fromEntries(await s.escritos.todos()))
  ipcMain.handle(CANALES.guardarEscrito, (_, ruta: unknown, texto: unknown) =>
    guardando(async () => s.escritos.guardar(await proyecto(ruta), Escrito.parse(texto))),
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
    s.registro.escribir('Versión nueva: Reiniciar ahora')
    s.reiniciarAhora()
  })
  s.versionNueva?.vigilar((v) => {
    if (v) s.registro.escribir(`Versión nueva lista: ${v.commit} del ${v.fecha}`)
    enviar(CANALES.versionNuevaCambio, v)
  })
  ipcMain.handle(CANALES.sinArmar, () => s.sinArmar?.ultimo() ?? null)
  ipcMain.handle(CANALES.armar, async () => {
    if (!s.sinArmar) return { tipo: 'error', mensaje: 'En desarrollo no hay app de uso diario para armar.' }
    s.registro.escribir('Cambios sin armar: Armar')
    return s.sinArmar.armar()
  })
  s.sinArmar?.vigilar((a) => {
    if (a.pendiente) s.registro.escribir(`Sin armar: ${a.pendiente.commit}${a.armando ? ' (armando)' : ''}`)
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
    await conversaciones.seguir(await proyecto(ruta), {
      ...(valido.texto !== undefined ? { texto: valido.texto } : {}),
      ...(valido.nueva !== undefined ? { nueva: valido.nueva } : {}),
    })
  })
  ipcMain.handle(CANALES.detener, async (_, ruta: unknown) => conversaciones.detener(await proyecto(ruta)))
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
    return ejecutarPlan(await d.prepararScript(IdScript.parse(id)), (r) => shell.openPath(r))
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
  ipcMain.handle(CANALES.git, async (_, ruta: unknown) => leerGit(await proyecto(ruta)))
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
  ipcMain.handle(CANALES.elegirConversacion, async (_, ruta: unknown, id: unknown) =>
    conversaciones.elegir(await proyecto(ruta), IdConversacion.parse(id)),
  )

  // Skills (modulos/skills/): se lee todo cada vez (unas 35 carpetas). Abrir carpeta y Poner al día solo aceptan lo
  // que salió de la última lectura (diseno-tecnico.md › Seguridad).
  let carpetasSkills = new Set<string>()
  const leerSkills = async () => {
    await listar()
    const r = await leerSeccionSkills(s.carpetaClaude, enDisco.rutas.skills)
    carpetasSkills = new Set(r.lista.skills.map((x) => x.id))
    return r
  }
  const atrasados = async () => {
    const [{ vigente }, lista] = await Promise.all([leerSkills(), listar()])
    return proyectosAtrasados(lista.tipo === 'lista' ? lista.proyectos : [], vigente)
  }
  ipcMain.handle(CANALES.skills, async () => (await leerSkills()).lista)
  ipcMain.handle(CANALES.atrasados, () => atrasados())
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
  ipcMain.handle(CANALES.ponerAlDia, async (_, dato: unknown) => {
    const ruta = await proyecto(dato)
    if (!(await atrasados()).proyectos.some((p) => p.ruta === ruta))
      throw new Error('Ese proyecto no está atrasado')
    if (conversaciones.enMarcha().includes(ruta)) throw new Error('La IA de ese proyecto está trabajando')
    await conversaciones.seguir(ruta, { texto: MENSAJE_PONER_AL_DIA })
  })

  // Ideas (modulos/inicio/): la ruta de `ideas.md` la arma este lado; la ventana no manda nada.
  ipcMain.handle(CANALES.ideas, async () => {
    const lista = await listar()
    const carpeta = enDisco.rutas.ideas ?? join(lista.iridium.carpeta, 'Ideas')
    return leerSeccionIdeas({
      carpeta,
      proyectos: lista.tipo === 'lista' ? lista.proyectos : [],
      html: async (texto) => (await docs.de(carpeta)).html(texto, 'ideas.md'),
    })
  })

  // La carpeta Iridium (D-083): mudar las de antes y cambiarla de lugar. Lo que depende de la ruta se muda con ellas.
  const mudarCarpetas = async (
    pares: { cual: Cual; origen: string; destino: string }[],
  ): Promise<ResultadoMudanza> => {
    if (pares.some((p) => conversaciones.enMarcha().includes(p.origen)))
      return {
        tipo: 'error',
        mensaje: 'La IA está trabajando en esa carpeta: esperá a que termine y probá de nuevo.',
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
          title: 'Mover a la carpeta Iridium',
          message: `¿Mover ${pares.map((p) => basename(p.origen)).join(' y ')} a ${iridium}?`,
          detail:
            'Se mueven enteras, con su historial de git. Iridium rehace los enlaces de tus skills y se lleva las ' +
            'conversaciones de esas carpetas. La carpeta de proyectos queda solo con tus proyectos.',
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

  ipcMain.handle(CANALES.cambiarCarpetaIridium, async (): Promise<ResultadoMudanza> => {
    const v = s.ventana()
    const actual = await carpetaIridium()
    const opciones = { title: 'Elegir la carpeta Iridium', defaultPath: actual }
    const r = await (v
      ? dialog.showOpenDialog(v, { ...opciones, properties: ['openDirectory', 'createDirectory'] })
      : null)
    const elegida = r && !r.canceled ? r.filePaths[0] : undefined
    if (!elegida || normalize(elegida) === actual) return { tipo: 'cancelada' }
    await listar()
    const destinos = rutasIridium(normalize(elegida))
    // Las de antes que todavía no se mudaron se quedan donde están: Mover las lleva después a la carpeta nueva.
    const pares = (['ideas', 'skills'] as const).flatMap((cual) => {
      const origen = enDisco.rutas[cual]
      return origen && !enDisco.mudanza?.[cual] ? [{ cual, origen, destino: destinos[cual] }] : []
    })
    let avisos: string[]
    mudando = true
    try {
      const hecho = await mudarCarpetas(pares)
      if (hecho.tipo !== 'ok') return hecho
      avisos = hecho.avisos
      await s.config.guardar({ carpetaIridium: normalize(elegida) })
    } finally {
      mudando = false
    }
    return { tipo: 'ok', lista: await listar(), avisos }
  })

  // Al abrir, el motor se verifica aparte: la grilla no lo espera (05-arquitectura.md › Abrir la app).
  void verificarMotor()

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
    cerrar() {
      uso.cerrar()
      conversaciones.cerrarTodo()
      vigilancia?.cerrar()
      vigilanciaIridium?.cerrar()
      for (const canal of Object.values(CANALES)) ipcMain.removeHandler(canal)
    },
  }
}

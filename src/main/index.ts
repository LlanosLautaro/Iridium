// Ventana, menú y ciclo de vida de la app (05-arquitectura.md › Estructura del repo).
import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { homedir, tmpdir } from 'node:os'
import { basename, dirname, join, normalize } from 'node:path'
import { pathToFileURL } from 'node:url'
import { app, BrowserWindow, Menu, shell } from 'electron'
import { TEMAS, type Tema } from '../compartido/puente'
import { PUERTO_REVISION } from '../compartido/revision'
import { Revision } from './app/revision/recibir'
import { zoomSiguiente } from './core/zoom'
import { ArchivoBorradores } from './infra/borradores'
import { ArchivoConfig } from './infra/config'
import { ArchivoEscritos } from './infra/escritos'
import { leerCarpetas } from './infra/raiz'
import { Registro } from './infra/registro'
import { ArchivoRevision } from './infra/revision/datos'
import { despuesDeCopiar, instalarExtension } from './infra/revision/extension'
import { lineasDeComandosDelPuerto } from './infra/revision/puerto'
import { arrancarReceptor, type Receptor } from './infra/revision/receptor'
import { ArchivoSesiones } from './infra/sesiones'
import { VigiaSinArmar } from './infra/sin-armar'
import { leerActualizaciones, VigiaVersionGithub } from './infra/version-github'
import { VigiaVersionNueva } from './infra/version-nueva'
import { type Puente, registrarPuente } from './ipc/puente'
import { crearMotorFalso, crearMotorQueFalla, type Motor } from './motor/motor'
import { crearMotorSdk } from './motor/sdk'

/**
 * Lo que dibuja Windows, de cada tema (D-066): el fondo de la ventana antes de la primera pintura (`--fondo`) y los tres
 * botones de la barra de título, que es propia (D-041), del color de la barra (`--barra`, `--texto-2`).
 */
const COLORES: Record<Tema, { fondo: string; barra: string; simbolos: string }> = {
  iridium: { fondo: '#0a0f0e', barra: '#060908', simbolos: '#a3b8b0' },
  carbon: { fondo: '#111113', barra: '#0a0a0b', simbolos: '#a9aab1' },
}
const ALTO_BARRA = 36
/** El tamaño de la ventana (Defecto 17): la barra de Windows de arriba crece con él. */
let zoom = 1

// Las pruebas y las herramientas abren la ventana sin que se vea (D-072): fuera de la pantalla y de la barra de tareas.
// Chromium deja de dibujar las ventanas que cree tapadas; ahí se lo saca, para que las capturas salgan.
const oculta = process.env.IRIDIUM_OCULTA === '1'
if (oculta) app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')

// Datos del Centro en %APPDATA%\Centro de Desarrollo (05-arquitectura.md › Modelo de datos). Las pruebas usan
// una carpeta aparte (IRIDIUM_DATOS) y el motor falso (IRIDIUM_MOTOR=falso), que no gasta uso.
const carpetaDatos = process.env.IRIDIUM_DATOS ?? join(app.getPath('appData'), 'Centro de Desarrollo')
const config = new ArchivoConfig(join(carpetaDatos, 'config.json'))
const datosRevision = new ArchivoRevision(join(carpetaDatos, 'revision.json'))
if (process.env.IRIDIUM_DATOS) app.setPath('userData', join(carpetaDatos, 'electron'))

/**
 * Las carpetas por defecto (D-083): la de proyectos y la carpeta Iridium, en Documentos. Con IRIDIUM_DATOS, dentro de
 * esa carpeta: las pruebas nunca crean nada en Documentos.
 */
const porDefecto = (nombre: string) =>
  process.env.IRIDIUM_DATOS ? join(carpetaDatos, nombre) : join(app.getPath('documents'), nombre)
const raizInicial = async () => porDefecto('Proyectos')

// El registro del día (05-arquitectura.md › Errores y registros): arranques, errores del motor y fallas de lectura.
const registro = new Registro(join(carpetaDatos, 'registros'))
registro.escribir(`Arranca Iridium ${app.getVersion()}${app.isPackaged ? '' : ' (desarrollo)'}`)
void registro.limpiar()
process.on('uncaughtException', (e) => {
  registro.escribir(`Error sin atrapar: ${e.stack ?? e.message}`)
  console.error(e)
})
process.on('unhandledRejection', (e) => {
  registro.escribir(
    `Promesa rechazada sin atrapar: ${e instanceof Error ? (e.stack ?? e.message) : String(e)}`,
  )
})

// La extensión de la Revisión se copia a su carpeta fija (si cambió) antes de que nada la cargue. Con
// IRIDIUM_REVISION=no no se copia (pruebas que no la usan).
const extensionCopiada: Promise<unknown> =
  process.env.IRIDIUM_REVISION === 'no'
    ? Promise.resolve()
    : instalarExtension(
        app.isPackaged
          ? join(process.resourcesPath, 'extension')
          : join(app.getAppPath(), 'out', 'extension'),
        join(carpetaDatos, 'extension'),
      ).catch((e) => console.error('Revisión: no se pudo copiar la extensión', e))

// Revisión de Iridium, en modo desarrollo y en la versión armada (D-052): F8 comenta la app y el comentario llega a su
// proyecto (docs/modulos/revision/diseno-tecnico.md › Ayudante de Electron). Las pruebas (con datos aparte) no la cargan.
// Va después de copiar la extensión: con la carpeta a medias, F8 no andaba.
if (!process.env.IRIDIUM_DATOS)
  void despuesDeCopiar(extensionCopiada, () =>
    import(
      pathToFileURL(
        join(process.env.APPDATA ?? '', 'Centro de Desarrollo', 'extension', 'electron', 'ayudante.mjs'),
      ).href
    ).then((m) => m.revision()),
  )

/** En la app instalada, Claude Code está fuera del archivo comprimido: el SDK no puede ejecutarlo desde adentro. */
function rutaClaudeInstalado(): string | undefined {
  if (!app.isPackaged) return undefined
  const requerir = createRequire(import.meta.url)
  const sdk = requerir.resolve('@anthropic-ai/claude-agent-sdk')
  const exe = createRequire(sdk).resolve('@anthropic-ai/claude-agent-sdk-win32-x64/claude.exe')
  return exe.replace(/app\.asar([\\/])/, 'app.asar.unpacked$1')
}

/** Con IRIDIUM_FALSO_PREGUNTA=1, la IA falsa deja una `Q-n` en cada turno (las pruebas de H-5). */
async function dejarPreguntaFalsa(carpeta: string): Promise<void> {
  if (process.env.IRIDIUM_FALSO_PREGUNTA !== '1') return
  const ruta = join(carpeta, 'docs', 'estado.md')
  const texto = await readFile(ruta, 'utf8')
  const n = Math.max(0, ...[...texto.matchAll(/Q-(\d+)/g)].map((m) => Number(m[1]))) + 1
  const q = `- **Q-${n} — ¿La prueba del motor falso funciona?**\n  Tipo: prueba · frena\n`
  await writeFile(ruta, texto.replace(/(## Preguntas abiertas\r?\n)(\(ninguna\)\r?\n)?/, `$1${q}`))
}

/**
 * La IA falsa, con el pedido de Poner al día (SK-4), escribe en `docs/README.md` el formato de hoy: así las pruebas ven
 * que el proyecto sale de la lista de atrasados.
 */
async function ponerAlDiaFalso(carpeta: string, texto: string): Promise<void> {
  if (!texto.includes('actualizar-formato.md')) return
  const ruta = join(carpeta, 'docs', 'README.md')
  const hoy = new Date().toISOString().slice(0, 10)
  const antes = await readFile(ruta, 'utf8').catch(() => '# Docs\n\n**Formato de la guía:**\n')
  await writeFile(ruta, antes.replace(/(\*\*Formato de la gu[ií]a:\*\*).*/, `$1 ${hoy}`))
}

function crearMotor(): Motor {
  if (process.env.IRIDIUM_MOTOR === 'falso') {
    const pasoMs = Number(process.env.IRIDIUM_FALSO_PASO_MS) || 400
    // IRIDIUM_FALSO_ESTADO=sin-sesion: Claude Code sin sesión iniciada (F-5).
    const estado =
      process.env.IRIDIUM_FALSO_ESTADO === 'sin-sesion' ? { tipo: 'sin-sesion' as const } : undefined
    return crearMotorFalso({
      pasoMs,
      alTurno: async (carpeta, texto) => {
        await dejarPreguntaFalsa(carpeta)
        await ponerAlDiaFalso(carpeta, texto)
      },
      ...(estado ? { estado } : {}),
    })
  }
  try {
    const rutaClaude = rutaClaudeInstalado()
    return crearMotorSdk(rutaClaude ? { rutaClaude } : {})
  } catch (e) {
    return crearMotorQueFalla(
      `No encuentro el Claude Code que trae la app: ${e instanceof Error ? e.message : String(e)}`,
    )
  }
}

let ventana: BrowserWindow | null = null
/** Después de «Cerrar igual» (F-6) la ventana se cierra sin volver a preguntar. */
let cerrarSinPreguntar = false
/** Se cerró con Reiniciar ahora (CO-I2): la versión nueva se abre sola al ponerse. */
let reiniciar = false

/**
 * La carpeta `release` de la app de uso diario (la que tiene `win-unpacked`), donde `tools/actualizar.ps1` deja la
 * versión nueva (CO-I2). En desarrollo no hay; las pruebas usan una de muestra (IRIDIUM_RELEASE).
 */
function carpetaRelease(): string | null {
  if (process.env.IRIDIUM_RELEASE) return process.env.IRIDIUM_RELEASE
  if (!app.isPackaged) return null
  const carpetaApp = dirname(process.execPath)
  return basename(carpetaApp) === 'win-unpacked' ? dirname(carpetaApp) : null
}
const release = carpetaRelease()
const vigiaVersion = release
  ? new VigiaVersionNueva(
      release,
      app.isPackaged
        ? join(process.resourcesPath, 'cambiar-version.ps1')
        : join(app.getAppPath(), 'tools', 'cambiar-version.ps1'),
      tmpdir(),
    )
  : null
/**
 * Una copia compartida (D-085) trae `resources/actualizaciones.json`: baja sus versiones nuevas de GitHub y no tiene
 * código para armar. Las pruebas usan otro archivo (IRIDIUM_ACTUALIZACIONES) y otra API (IRIDIUM_GITHUB_API).
 */
const archivoActualizaciones =
  process.env.IRIDIUM_ACTUALIZACIONES ??
  (app.isPackaged ? join(process.resourcesPath, 'actualizaciones.json') : null)
const actualizaciones =
  release && archivoActualizaciones ? leerActualizaciones(archivoActualizaciones) : Promise.resolve(null)
/** El código de Iridium es la carpeta de `release` (CO-I6); una copia compartida no tiene. */
let vigiaSinArmar: VigiaSinArmar | null = null

/**
 * La Revisión de la app (modulos/revision/diseno-tecnico.md): copia la extensión a su carpeta fija y escucha a la
 * extensión en 127.0.0.1. Con IRIDIUM_REVISION=no no arranca (pruebas que no la usan); IRIDIUM_REVISION_PUERTO
 * cambia el puerto (pruebas, para no chocar con la app de uso diario).
 */
async function arrancarRevision(puente: Puente): Promise<Receptor | null> {
  if (process.env.IRIDIUM_REVISION === 'no') return null
  await extensionCopiada
  const raiz = async () => normalize((await config.leer()).raiz ?? (await raizInicial()))
  const revision = new Revision({
    proyectos: async () =>
      (await leerCarpetas(await raiz()).catch(() => [])).map((c) => ({ nombre: c.nombre, ruta: c.ruta })),
    datos: datosRevision,
    lineasDelPuerto: lineasDeComandosDelPuerto,
    enviar: (ruta, codigo) => puente.comentarios.enviar(ruta, codigo),
  })
  const receptor = await arrancarReceptor(
    {
      estado: (d, v, c) => revision.estado(d, v, c),
      comentario: (p) => revision.comentario(p),
      direccion: (p) => revision.direccion(p),
    },
    {
      puerto: Number(process.env.IRIDIUM_REVISION_PUERTO) || PUERTO_REVISION,
      alError: (e) => console.error('Revisión: error al atender a la extensión', e),
    },
  )
  if (receptor.error) console.error(`Revisión: ${receptor.error}`)
  return receptor
}

/** El tema guardado. Con IRIDIUM_TEMA las pruebas lo cambian antes de abrir (todas las pruebas en Carbón, AP-I1). */
async function temaAlAbrir(): Promise<Tema> {
  const pedido = TEMAS.find((t) => t === process.env.IRIDIUM_TEMA)
  if (pedido) await config.guardar({ tema: pedido }).catch(() => {})
  return (await config.leer()).tema
}

let temaActual: Tema = 'iridium'

function crearVentana(puente: Puente, tema: Tema): void {
  temaActual = tema
  const colores = COLORES[tema]
  const v = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    title: 'Iridium',
    backgroundColor: colores.fondo,
    show: false,
    // Las pruebas la abren fuera de la pantalla y de la barra de tareas (IRIDIUM_OCULTA, D-072).
    ...(oculta ? { x: -20_000, y: -20_000, skipTaskbar: true } : {}),
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: colores.barra, symbolColor: colores.simbolos, height: ALTO_BARRA },
    webPreferences: {
      preload: join(import.meta.dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // Fuera de la pantalla, Chromium la daría por tapada y dejaría de dibujarla.
      backgroundThrottling: !oculta,
    },
  })
  ventana = v
  // El tamaño guardado (Defecto 17); Ctrl+= y los demás los atiende la ventana, con sus otros atajos.
  v.webContents.on('did-finish-load', () => ponerZoom(zoom))
  // Oculta, se «muestra» sin quitarle el foco a lo que el usuario está usando: no se ve, pero se dibuja.
  v.once('ready-to-show', () => (oculta ? v.showInactive() : v.show()))
  // Cerrar con sesiones trabajando se confirma en la ventana (F-6); sin sesiones, se cierra.
  v.on('close', (e) => {
    if (cerrarSinPreguntar) return
    const trabajando = puente.enMarcha()
    if (trabajando.length === 0) return
    e.preventDefault()
    puente.pedirCierre(trabajando)
  })
  v.on('closed', () => {
    ventana = null
  })
  // Lo gastado en VS Code o claude.ai mientras tanto: el uso se relee al volver (Defecto 16).
  v.on('focus', () => puente.alVolver())

  // Los enlaces externos se abren en el navegador, solo http y https; la ventana nunca navega a otra página.
  const abrirAfuera = (url: string) => {
    if (/^https?:\/\//.test(url)) void shell.openExternal(url)
  }
  v.webContents.setWindowOpenHandler(({ url }) => {
    abrirAfuera(url)
    return { action: 'deny' }
  })
  v.webContents.on('will-navigate', (e, url) => {
    if (url === v.webContents.getURL()) return
    e.preventDefault()
    abrirAfuera(url)
  })

  // El tema va en la dirección: `tema.js` lo pone en <html> antes de la primera pintura (sin parpadeo, AJ-1).
  const urlDesarrollo = process.env.ELECTRON_RENDERER_URL
  if (urlDesarrollo) void v.loadURL(`${urlDesarrollo}?tema=${tema}`)
  else void v.loadFile(join(import.meta.dirname, '../renderer/index.html'), { query: { tema } })
}

/** Otro tema elegido en Ajustes: Windows vuelve a dibujar sus botones y el fondo con los colores del tema. */
function pintarVentana(tema: Tema): void {
  if (!ventana || ventana.isDestroyed()) return
  temaActual = tema
  const colores = COLORES[tema]
  ventana.setBackgroundColor(colores.fondo)
  ventana.setTitleBarOverlay({
    color: colores.barra,
    symbolColor: colores.simbolos,
    height: Math.round(ALTO_BARRA * zoom),
  })
}

/** Agranda o achica todo; los botones de Windows siguen el alto de la barra. El ancho mínimo lo ajusta la ventana. */
function ponerZoom(nuevo: number): void {
  zoom = nuevo
  if (!ventana || ventana.isDestroyed()) return
  ventana.webContents.setZoomFactor(zoom)
  pintarVentana(temaActual)
}

// Una sola ventana de la app instalada; en desarrollo puede convivir con ella.
if (app.isPackaged && !app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (ventana?.isMinimized()) ventana.restore()
    ventana?.focus()
  })

  app.whenReady().then(async () => {
    Menu.setApplicationMenu(null)
    // El tema se lee antes de crear la ventana (D-066): así ya abre con sus colores.
    const tema = await temaAlAbrir()
    zoom = (await config.leer()).zoom
    const compartida = await actualizaciones
    if (release && !compartida) vigiaSinArmar = new VigiaSinArmar(dirname(release), release)
    const vigiaGithub =
      release && compartida
        ? new VigiaVersionGithub({
            release,
            actualizaciones: compartida,
            anotar: (t) => registro.escribir(t),
            // Con otra API (las pruebas), nunca la clave de git: solo la de IRIDIUM_GITHUB_CLAVE, si hay.
            ...(process.env.IRIDIUM_GITHUB_API
              ? {
                  api: process.env.IRIDIUM_GITHUB_API,
                  clave: async () => process.env.IRIDIUM_GITHUB_CLAVE ?? null,
                  primeraMs: 500,
                }
              : {}),
          })
        : null
    const puente = registrarPuente({
      config,
      sesiones: new ArchivoSesiones(join(carpetaDatos, 'sesiones.json')),
      borradores: new ArchivoBorradores(join(carpetaDatos, 'borradores.json')),
      escritos: new ArchivoEscritos(join(carpetaDatos, 'escritos.json')),
      motor: crearMotor(),
      raizInicial,
      carpetaIridiumInicial: () => porDefecto('Iridium'),
      ventana: () => ventana,
      ultimaConexionExtension: async () => (await datosRevision.leer()).extension?.ultima ?? null,
      registro,
      // Las skills de la PC; las pruebas usan una carpeta de muestra (IRIDIUM_CLAUDE).
      carpetaClaude: process.env.IRIDIUM_CLAUDE ?? join(homedir(), '.claude'),
      cerrarVentana: () => {
        cerrarSinPreguntar = true
        ventana?.close()
      },
      alCambiarTema: pintarVentana,
      zoom: (paso) => {
        ponerZoom(zoomSiguiente(zoom, paso))
        void config.guardar({ zoom }).catch(() => {})
      },
      versionNueva: vigiaVersion,
      sinArmar: vigiaSinArmar,
      versionesGithub: vigiaGithub,
      reiniciarAhora: () => {
        reiniciar = true
        ventana?.close()
      },
      cancelarCierre: () => {
        reiniciar = false
      },
    })
    crearVentana(puente, tema)
    const revision = arrancarRevision(puente)
    vigiaGithub?.vigilar()
    app.on('window-all-closed', () => app.quit())
    // Antes de salir se espera lo que la ventana mandó a guardar (D-060). Va acá y no en window-all-closed porque
    // app.quit() desde afuera (las pruebas, otro programa) no pasa por ahí; y lo que la ventana manda al cerrarse puede
    // llegar recién ahora, por eso la espera corta antes.
    let saliendo = false
    app.on('will-quit', (e) => {
      if (saliendo) return
      saliendo = true
      e.preventDefault()
      void new Promise((r) => setTimeout(r, 100))
        .then(() => puente.terminarDeGuardar())
        .finally(async () => {
          puente.cerrar()
          void revision.then((r) => r?.cerrar())
          // La versión nueva entra ahora (CO-I2): el ayudante espera a que Iridium termine de cerrarse.
          vigiaVersion?.cerrar()
          vigiaSinArmar?.cerrar()
          vigiaGithub?.cerrar()
          await vigiaVersion
            ?.ponerAlCerrar(reiniciar)
            .then(
              (puesta) =>
                puesta &&
                registro.escribir(`Versión nueva: se pone al cerrar${reiniciar ? ' y se abre' : ''}`),
            )
            .catch((e) => registro.escribir(`Versión nueva: no se pudo lanzar el ayudante: ${e}`))
          app.quit()
        })
    })
  })
}

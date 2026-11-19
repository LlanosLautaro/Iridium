// Ventana, menú y ciclo de vida de la app (05-arquitectura.md › Estructura del repo).
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { homedir, tmpdir } from 'node:os'
import { basename, dirname, join, normalize } from 'node:path'
import { pathToFileURL } from 'node:url'
import { app, BrowserWindow, Menu, powerMonitor, protocol, screen, session, webContents } from 'electron'
import { CANALES } from '../compartido/puente'
import { PUERTO_REVISION } from '../compartido/revision'
import { Revision } from './app/revision/recibir'
import { elegirComplementos } from './core/complementos'
import { ENCABEZADO_CONTROL } from './core/control'
import { abrirDeFondo, UsoDeIridium } from './core/uso-iridium'
import { comoAbrir, type VentanaGuardada } from './core/ventana'
import { zoomSiguiente } from './core/zoom'
import { ArchivoArmados } from './infra/armados'
import { ArchivoArranques } from './infra/arranques'
import { ArchivoBorradores } from './infra/borradores'
import { ArchivoConfig } from './infra/config'
import { ESQUEMA_MAQUETA, MaquetasAbiertas } from './infra/diseno/protocolo'
import { ArchivoVistos } from './infra/diseno/vistos'
import { ArchivoEscritos } from './infra/escritos'
import { abrirEnNavegador } from './infra/navegador'
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
 * Lo que dibuja Windows, del único tema, el negro (D-104): el fondo de la ventana antes de la primera pintura (`--fondo`)
 * y los tres botones de la barra de título, que es propia (D-041), sobre el fondo (`--texto-2`).
 */
const COLORES = { fondo: '#000000', barra: '#000000', simbolos: '#a3a3a3' }
const ALTO_BARRA = 36
/** El tamaño de la ventana (Defecto 17): la barra de Windows de arriba crece con él. */
let zoom = 1
/** Cuánto lleva Iridium sin usarse (T-67): Actualizar solo reinicia recién ahí. */
const uso = new UsoDeIridium()

// Las pruebas y las herramientas abren la ventana sin que se vea (D-072): fuera de la pantalla y de la barra de tareas.
// Chromium deja de dibujar las ventanas que cree tapadas; ahí se lo saca, para que las capturas salgan.
const oculta = process.env.IRIDIUM_OCULTA === '1'
if (oculta) app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')

// La letra sin el suavizado de colores de Windows (ClearType): sobre negro deja bordes rosas y verdes que cambian al
// desplazar (R-51). Así se suaviza en gris, igual en reposo y al desplazar, como en las maquetas.
app.commandLine.appendSwitch('disable-lcd-text')

// Datos del Centro en %APPDATA%\Centro de Desarrollo (05-arquitectura.md › Modelo de datos). Las pruebas usan
// una carpeta aparte (IRIDIUM_DATOS) y el motor falso (IRIDIUM_MOTOR=falso), que no gasta uso.
const carpetaDatos = process.env.IRIDIUM_DATOS ?? join(app.getPath('appData'), 'Centro de Desarrollo')
const config = new ArchivoConfig(join(carpetaDatos, 'config.json'))
const datosRevision = new ArchivoRevision(join(carpetaDatos, 'revision.json'))
/** Los proyectos abiertos en Diseño: el protocolo `maqueta:` y la grande solo cargan sus `docs/diseno/` (S-4). */
const maquetas = new MaquetasAbiertas()
// Las miniaturas de Diseño piden `maqueta://<id>/…` (S-4): se registra antes de que la app esté lista.
protocol.registerSchemesAsPrivileged([
  { scheme: ESQUEMA_MAQUETA, privileges: { standard: true, supportFetchAPI: false } },
])
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
// proyecto (docs/modulos/revision/diseno-tecnico.md › Ayudante de Electron). Las pruebas (con datos aparte) no la cargan,
// salvo la de F8 sobre una maqueta: IRIDIUM_AYUDANTE=1 carga el de siempre y, con una ruta, ese ayudante (una copia de
// la extensión con otro puerto). Va después de copiar la extensión: con la carpeta a medias, F8 no andaba.
const ayudante = process.env.IRIDIUM_AYUDANTE
if (!process.env.IRIDIUM_DATOS || ayudante)
  void despuesDeCopiar(extensionCopiada, () =>
    import(
      pathToFileURL(
        ayudante && ayudante !== '1' ? ayudante : join(carpetaDatos, 'extension', 'electron', 'ayudante.mjs'),
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
 * Con IRIDIUM_FALSO_MAL=1, la IA falsa deja una `Q-n` sin la línea «Tipo:» y la corrige cuando el control se la
 * devuelve (OR-2); con IRIDIUM_FALSO_MAL=terco, no la corrige.
 */
async function escribirMalFalso(carpeta: string, texto: string): Promise<void> {
  const modo = process.env.IRIDIUM_FALSO_MAL
  if (modo !== '1' && modo !== 'terco') return
  const ruta = join(carpeta, 'docs', 'estado.md')
  const antes = await readFile(ruta, 'utf8')
  if (texto.startsWith(ENCABEZADO_CONTROL)) {
    if (modo === '1')
      await writeFile(ruta, antes.replace('  Contexto: sin tipo.', '  Tipo: consulta\n  Contexto: con tipo.'))
    return
  }
  const n = Math.max(0, ...[...antes.matchAll(/Q-(\d+)/g)].map((m) => Number(m[1]))) + 1
  const q = `- **Q-${n} — ¿La escribió mal el motor falso?**\n  Contexto: sin tipo.\n`
  await writeFile(ruta, antes.replace(/(## Preguntas abiertas\r?\n)(\(ninguna\)\r?\n)?/, `$1${q}`))
}

/**
 * La IA falsa, con el pedido de Pasar al framework (F-9, T-49), deja el proyecto con framework: `**Framework:**` con la
 * fecha de hoy en `docs/README.md`, un `docs/trabajo.md` y, si era una carpeta simple, un `docs/estado.md` mínimo. Así las pruebas ven que
 * sale de los de afuera. No arregla otra cosa: lo que el control marque, queda.
 */
async function pasarAlFrameworkFalso(carpeta: string, texto: string): Promise<void> {
  if (!texto.includes('pasar-al-framework.md')) return
  const hoy = new Date().toISOString().slice(0, 10)
  await mkdir(join(carpeta, 'docs'), { recursive: true })
  const estado = join(carpeta, 'docs', 'estado.md')
  if (!existsSync(estado))
    await writeFile(
      estado,
      `# Estado del proyecto\n\n**Última actualización:** ${hoy}\n\n## Hito actual\n0 — Idea cruda — en curso\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nContar la idea.\n`,
    )
  const trabajo = join(carpeta, 'docs', 'trabajo.md')
  if (!existsSync(trabajo)) await writeFile(trabajo, '# Trabajo\n')
  const ruta = join(carpeta, 'docs', 'README.md')
  const antes = await readFile(ruta, 'utf8').catch(() => '# Docs\n')
  const sinGuia = antes.replace(/^\*\*Formato de la gu[ií]a:\*\*.*\r?\n?/m, '')
  await writeFile(ruta, `${sinGuia.trimEnd()}\n\n**Framework:** ${hoy}\n`)
}

/** Donde están armados los complementos (`pnpm build` › `out/plugins`; en la app, en sus recursos). */
function carpetaPlugins(): string {
  return app.isPackaged ? join(process.resourcesPath, 'plugins') : join(app.getAppPath(), 'out', 'plugins')
}

function crearMotor(): Motor {
  if (process.env.IRIDIUM_MOTOR === 'falso') {
    const pasoMs = Number(process.env.IRIDIUM_FALSO_PASO_MS) || 400
    // IRIDIUM_FALSO_ESTADO=sin-sesion: Claude Code sin sesión iniciada (F-5).
    const estado =
      process.env.IRIDIUM_FALSO_ESTADO === 'sin-sesion' ? { tipo: 'sin-sesion' as const } : undefined
    // IRIDIUM_FALSO_PERIODO=cerrado: el uso sin un período de 5 horas abierto (las pruebas del arranque).
    const periodoCerrado = process.env.IRIDIUM_FALSO_PERIODO === 'cerrado'
    return crearMotorFalso({
      pasoMs,
      ...(periodoCerrado
        ? {
            uso: {
              cincoHoras: { usado: 0, libera: null, agotada: false },
              semana: { usado: 40, libera: Date.now() + 3 * 24 * 3_600_000, agotada: false },
            },
          }
        : {}),
      alTurno: async (carpeta, texto) => {
        await dejarPreguntaFalsa(carpeta)
        await escribirMalFalso(carpeta, texto)
        await pasarAlFrameworkFalso(carpeta, texto)
      },
      ...(estado ? { estado } : {}),
    })
  }
  try {
    const rutaClaude = rutaClaudeInstalado()
    const plugins = elegirComplementos(carpetaPlugins(), existsSync)
    return crearMotorSdk({ ...(rutaClaude ? { rutaClaude } : {}), plugins })
  } catch (e) {
    return crearMotorQueFalla(
      `No encuentro el Claude Code que trae la app: ${e instanceof Error ? e.message : String(e)}`,
    )
  }
}

let ventana: BrowserWindow | null = null
/** Después de «Cerrar igual» (F-6) la ventana se cierra sin volver a preguntar. */
let cerrarSinPreguntar = false
/** Se cerró con Actualizar y una versión lista (CO-I2, R-12): la versión nueva se abre sola al ponerse. */
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
    // F8 sobre una maqueta grande de Diseño: la página con el foco es ese webview. Si nada tiene el foco (la ventana
    // oculta de las pruebas), la única maqueta grande abierta: hay una sola a la vez.
    maquetaEnFoco: () => {
      const w = webContents.getFocusedWebContents()
      if (w && !w.isDestroyed()) return w.getType() === 'webview' ? w.getURL() : null
      const grandes = webContents
        .getAllWebContents()
        .filter((x) => !x.isDestroyed() && x.getType() === 'webview')
      return grandes.length === 1 ? (grandes[0]?.getURL() ?? null) : null
    },
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

const MINIMO = { width: 1024, height: 640 }

function crearVentana(puente: Puente, guardada: VentanaGuardada | null, deFondo: boolean): void {
  const colores = COLORES
  // Como quedó al cerrar (T-66); oculta (las pruebas), siempre fuera de la pantalla y sin maximizar.
  const como = oculta
    ? { rect: null, maximizada: false }
    : comoAbrir(
        guardada,
        screen.getAllDisplays().map((d) => d.workArea),
        MINIMO,
      )
  const v = new BrowserWindow({
    width: 1440,
    height: 900,
    ...(como.rect ?? {}),
    minWidth: MINIMO.width,
    minHeight: MINIMO.height,
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
      // La maqueta grande de Diseño (S-4): un `webview` con `file://`, donde entra la extensión de la Revisión.
      webviewTag: true,
    },
  })
  ventana = v
  reglasDelWebview(v)
  // El tamaño guardado (Defecto 17); Ctrl+= y los demás los atiende la ventana, con sus otros atajos.
  v.webContents.on('did-finish-load', () => ponerZoom(zoom))
  // Oculta, se «muestra» sin quitarle el foco a lo que el usuario está usando: no se ve, pero se dibuja.
  v.once('ready-to-show', () => {
    if (oculta) return v.showInactive()
    // Actualizar solo reinició con Iridium minimizada o detrás de otra ventana (T-67): vuelve minimizada, sin tapar
    // lo que se está usando ni quitarle el foco; al abrirla, se maximiza si lo estaba.
    if (deFondo) {
      if (como.maximizada) v.once('restore', () => v.maximize())
      return v.minimize()
    }
    if (como.maximizada) v.maximize()
    v.show()
  })
  // Cerrar con sesiones trabajando se confirma en la ventana (F-6); sin sesiones, se cierra.
  v.on('close', (e) => {
    guardarVentana(v)
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
  v.on('focus', () => {
    uso.marcar()
    puente.alVolver()
  })

  // Los enlaces externos se abren en el navegador (`abrirEnNavegador`); la ventana nunca navega a otra página.
  const abrirAfuera = (url: string) => void abrirEnNavegador(url)
  v.webContents.setWindowOpenHandler(({ url }) => {
    abrirAfuera(url)
    return { action: 'deny' }
  })
  v.webContents.on('will-navigate', (e, url) => {
    if (url === v.webContents.getURL()) return
    e.preventDefault()
    abrirAfuera(url)
  })

  const urlDesarrollo = process.env.ELECTRON_RENDERER_URL
  if (urlDesarrollo) void v.loadURL(urlDesarrollo)
  else void v.loadFile(join(import.meta.dirname, '../renderer/index.html'))
}

/** Guarda cómo está la ventana (T-66): el lugar sin maximizar, para volver a él al desmaximizar. Oculta, no. */
function guardarVentana(v: BrowserWindow): void {
  if (oculta || v.isDestroyed() || v.isMinimized() || v.isFullScreen()) return
  const r = v.getNormalBounds()
  void config.guardar({ ventana: { ...r, maximizada: v.isMaximized() } }).catch(() => {})
}

/** Si en la maqueta se está escribiendo: un campo, o la tarjeta del comentario (la capa de la extensión). */
const ESCRIBIENDO = `(() => { const a = document.activeElement; return !!a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT|IRIDIUM-REVISION)$/.test(a.tagName)) })()`
/** Si el modo comentar de la extensión está prendido en la página: su capa está puesta solo mientras tanto. */
const COMENTANDO = `!!document.querySelector('iridium-revision')`
/** Prende el modo comentar de la extensión si ya entró en la página (su capa aparece al prenderse). */
const PRENDER_COMENTAR = `(() => { if (document.querySelector('iridium-revision')) return true; window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F8' })); return !!document.querySelector('iridium-revision') })()`

/**
 * El `webview` de la maqueta grande (S-4, `modulos/diseno/diseno-tecnico.md` › La grande): sin preload, sin Node,
 * aislado, y solo dentro de `docs/diseno/` de un proyecto abierto en Diseño. Nunca abre ventanas.
 */
function reglasDelWebview(v: BrowserWindow): void {
  v.webContents.on('will-attach-webview', (e, prefs, params) => {
    delete prefs.preload
    prefs.nodeIntegration = false
    prefs.nodeIntegrationInSubFrames = false
    prefs.contextIsolation = true
    prefs.sandbox = true
    prefs.webSecurity = true
    if (!maquetas.proyectoDeArchivo(params.src ?? '')) e.preventDefault()
  })
  v.webContents.on('did-attach-webview', (_e, wc) => {
    const frenar = (e: { preventDefault(): void }, url: string) => {
      if (!maquetas.proyectoDeArchivo(url)) e.preventDefault()
    }
    wc.on('will-navigate', frenar)
    wc.on('will-frame-navigate', (e) => frenar(e, e.url))
    wc.on('will-redirect', frenar)
    wc.setWindowOpenHandler(() => ({ action: 'deny' }))
    // Esc vuelve al lienzo (DS-4), salvo que esté comentando: F8 prende y apaga el modo comentar de la extensión,
    // y ahí Esc es suyo (lo cancela). Las flechas de los costados pasan a la anterior y la siguiente, también
    // comentando, salvo que se esté escribiendo (R-24). La sección sabe si está comentando, para su botón (Q-152).
    let comentando = false
    const avisar = (canal: string, dato: unknown) => {
      if (!wc.hostWebContents?.isDestroyed()) wc.hostWebContents?.send(canal, dato)
    }
    const marcar = (si: boolean) => {
      if (si === comentando) return
      comentando = si
      avisar(CANALES.disenoComentando, si)
    }
    // Lo que hizo la tecla se mira en la página: Esc con la tarjeta del comentario abierta la cierra y sigue comentando.
    const verificar = () =>
      setTimeout(() => {
        if (wc.isDestroyed()) return
        wc.executeJavaScript(COMENTANDO, true).then(marcar, () => {})
      }, 60)
    wc.on('before-input-event', (_e, tecla) => {
      if (tecla.type !== 'keyDown') return
      if (tecla.key === 'F8') {
        marcar(!comentando)
        verificar()
      } else if (tecla.key === 'Escape') {
        if (comentando) verificar()
        else avisar(CANALES.disenoEscape, null)
      } else if (
        (tecla.key === 'ArrowLeft' || tecla.key === 'ArrowRight') &&
        !tecla.alt &&
        !tecla.control &&
        !tecla.shift &&
        !tecla.meta
      ) {
        const paso = tecla.key === 'ArrowRight' ? 1 : -1
        wc.executeJavaScript(ESCRIBIENDO, true).then(
          (escribiendo: boolean) => {
            if (!escribiendo) avisar(CANALES.disenoFlecha, paso)
          },
          () => {},
        )
      }
    })
    // Pasar a otra maqueta comentando sigue comentando en la nueva, cuando la extensión entre en ella.
    let seguir = false
    wc.on('did-navigate', () => {
      seguir = comentando
      marcar(false)
    })
    wc.on('did-finish-load', () => {
      if (!seguir) return
      seguir = false
      let intentos = 0
      const probar = () => {
        if (wc.isDestroyed()) return
        wc.executeJavaScript(PRENDER_COMENTAR, true).then(
          (prendido: boolean) => {
            if (prendido) marcar(true)
            else if (++intentos < 20) setTimeout(probar, 150)
          },
          () => {},
        )
      }
      probar()
    })
  })
}

/**
 * Lo que pide una maqueta grande: solo `file://` de un `docs/diseno/` abierto y la extensión de la Revisión; lo demás
 * (la red, otros archivos de la PC) se cancela. Las otras páginas de la sesión no pasan por acá.
 */
function filtrarPedidosDeMaquetas(): void {
  session.defaultSession.webRequest.onBeforeRequest((d, responder) => {
    if (d.webContents?.getType() !== 'webview') return responder({})
    const deja =
      d.url.startsWith('chrome-extension:') ||
      d.url.startsWith('devtools:') ||
      d.url.startsWith('data:') ||
      maquetas.proyectoDeArchivo(d.url) !== null
    responder({ cancel: !deja })
  })
}

/** Los botones de Windows siguen el alto de la barra, que crece con el zoom. */
function pintarVentana(): void {
  if (!ventana || ventana.isDestroyed()) return
  ventana.setTitleBarOverlay({
    color: COLORES.barra,
    symbolColor: COLORES.simbolos,
    height: Math.round(ALTO_BARRA * zoom),
  })
}

/** Agranda o achica todo; los botones de Windows siguen el alto de la barra. El ancho mínimo lo ajusta la ventana. */
function ponerZoom(nuevo: number): void {
  zoom = nuevo
  if (!ventana || ventana.isDestroyed()) return
  ventana.webContents.setZoomFactor(zoom)
  pintarVentana()
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
    protocol.handle(ESQUEMA_MAQUETA, (pedido) => maquetas.responder(pedido.url))
    filtrarPedidosDeMaquetas()
    const leida = await config.leer()
    zoom = leida.zoom
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
      plantillas: join(carpetaPlugins(), 'iridium', 'skills', 'iridium', 'plantillas'),
      cerrarVentana: () => {
        cerrarSinPreguntar = true
        ventana?.close()
      },
      zoom: (paso) => {
        ponerZoom(zoomSiguiente(zoom, paso))
        void config.guardar({ zoom }).catch(() => {})
      },
      versionNueva: vigiaVersion,
      sinArmar: vigiaSinArmar,
      versionesGithub: vigiaGithub,
      maquetas,
      vistos: new ArchivoVistos(join(carpetaDatos, 'diseno.json')),
      reiniciarAhora: () => {
        reiniciar = true
        // Sin Iridium al frente (Actualizar solo, T-67), la versión nueva abre minimizada.
        const deFondo = !!ventana && !ventana.isFocused() && !oculta
        void config
          .guardar({ abrirDeFondo: deFondo ? Date.now() : null })
          .catch(() => {})
          .finally(() => ventana?.close())
      },
      cancelarCierre: () => {
        reiniciar = false
        void config.guardar({ abrirDeFondo: null }).catch(() => {})
      },
      segundosSinUso: () => uso.segundosSinUsar(),
      arranques: new ArchivoArranques(join(carpetaDatos, 'arranques.json')),
      // Abrir (AB-I2): las apps de escritorio de los proyectos se arman solas; la de Iridium, con D-122.
      armados: {
        archivo: new ArchivoArmados(join(carpetaDatos, 'armados.json')),
        carpetaDatos,
        excluida: release ? dirname(release) : app.getAppPath(),
      },
      // Solo pruebas: el primer momento del arranque, a tantos segundos de abrir.
      ...(process.env.IRIDIUM_ARRANQUE_EN
        ? { arranqueEnSegundos: Number(process.env.IRIDIUM_ARRANQUE_EN) }
        : {}),
    })
    // La suspensión de la PC, para el arranque (D-149 › 2): un momento que cayó durmiendo se hace al despertar.
    powerMonitor.on('suspend', () => puente.alSuspender())
    powerMonitor.on('resume', () => puente.alDespertar())
    // El teclado y el mouse en la ventana o en la maqueta de Diseño (su `webview`) cuentan como usar Iridium.
    app.on('web-contents-created', (_e, wc) => wc.on('input-event', () => uso.marcar()))
    for (const wc of webContents.getAllWebContents()) wc.on('input-event', () => uso.marcar())
    const deFondo = abrirDeFondo(leida.abrirDeFondo)
    if (leida.abrirDeFondo !== null) void config.guardar({ abrirDeFondo: null }).catch(() => {})
    crearVentana(puente, leida.ventana, deFondo)
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

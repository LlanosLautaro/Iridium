// Las consolas adentro (T-116, D-184, D-185; `cambios/consolas.md` › Cómo se construye). El único lugar que importa la
// pieza nativa `node-pty` (la consola de VS Code), como `motor/` con el SDK. Cada consola es un `cmd` de verdad en la
// carpeta del proyecto, al que se le escribe; lo que imprime va a la ventana en tandas y se guardan sus últimas líneas.
// Detener y cerrar cortan el árbol de procesos (S-6: el cierre propio de la pieza lanza un ayudante que los fusibles
// de la app armada no dejan correr).
import { execFile, execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import type { IPty } from 'node-pty'
import {
  type ConsolaVista,
  estadoAlTerminar,
  type GuardadoConsola,
  recortarSalida,
  type SalidaConsola,
} from '../../compartido/consolas'

type NodePty = typeof import('node-pty')

export interface PedidoConsola {
  nombre: string
  /** La carpeta del proyecto; null, una de Iridium (el inicio de sesión). */
  proyecto: string | null
  /** Dónde corre. */
  cwd: string
  /** La línea de comandos, como se escribe en `cmd` (la de `docs/scripts.md`). */
  comando: string
}

export interface OpcionesConsolas {
  /** Cambió la lista (se abrió, terminó o se cerró una). */
  alCambiar(lista: ConsolaVista[]): void
  /** Una tanda de lo que imprimió una consola. */
  alSalir(salida: SalidaConsola): void
  /** Se abrió una consola: la ventana abre el panel en su pestaña. */
  alAbrir?(c: ConsolaVista): void
  anotar?(texto: string): void
  /** Cada cuánto se manda lo impreso (ms). */
  tandaMs?: number
  /** Solo pruebas: otra forma de cargar la pieza. */
  cargar?: () => NodePty
}

interface Abierta {
  vista: ConsolaVista
  pty: IPty | null
  /** Lo guardado: el final de lo impreso. */
  texto: string
  /** Cuántos caracteres imprimió desde que se abrió. */
  total: number
  /** Lo impreso que todavía no se mandó a la ventana, desde `total - pendiente.length`. */
  pendiente: string
  detenida: boolean
  fin: Promise<number>
}

/** Más de esto sin recortar y se recorta a las últimas líneas (recortar en cada tanda sería caro con mucha salida). */
const CARACTERES_ANTES_DE_RECORTAR = 1_000_000

export class Consolas {
  private abiertas = new Map<string, Abierta>()
  private siguiente = 1
  private pty: NodePty | null | undefined
  private reloj: ReturnType<typeof setTimeout> | null = null

  constructor(private readonly o: OpcionesConsolas) {}

  /** La pieza cargó: si no (no armó, falta su archivo), Scripts vuelve a la ventana aparte de siempre. */
  disponible(): boolean {
    return this.pieza() !== null
  }

  private pieza(): NodePty | null {
    if (this.pty !== undefined) return this.pty
    try {
      this.pty = this.o.cargar ? this.o.cargar() : (createRequire(import.meta.url)('node-pty') as NodePty)
    } catch (e) {
      this.pty = null
      this.o.anotar?.(`Consolas: no cargó la pieza nativa: ${e instanceof Error ? e.message : String(e)}`)
    }
    return this.pty
  }

  lista(): ConsolaVista[] {
    return [...this.abiertas.values()].map((a) => ({ ...a.vista }))
  }

  abrir(p: PedidoConsola): ConsolaVista {
    const pty = this.pieza()
    if (!pty) throw new Error('La consola de Iridium no cargó.')
    // El entorno de Iridium menos lo de Electron: con ELECTRON_RUN_AS_NODE, `pnpm dev` no abre la app.
    const env: Record<string, string> = {}
    for (const [k, v] of Object.entries(process.env))
      if (v !== undefined && k !== 'ELECTRON_RUN_AS_NODE') env[k] = v
    // `/s /c "…"`: cmd quita solo las comillas de afuera y deja el comando tal cual está escrito (como hasta ahora).
    const proceso = pty.spawn('cmd.exe', `/d /s /c "${p.comando}"`, {
      name: 'xterm-256color',
      cols: 100,
      rows: 24,
      cwd: p.cwd,
      env,
      useConpty: true,
    })
    const id = `c${this.siguiente++}`
    const vista: ConsolaVista = {
      id,
      nombre: p.nombre,
      proyecto: p.proyecto,
      estado: 'corriendo',
      codigo: null,
      desde: Date.now(),
    }
    let terminar: (codigo: number) => void = () => {}
    const a: Abierta = {
      vista,
      pty: proceso,
      texto: '',
      total: 0,
      pendiente: '',
      detenida: false,
      fin: new Promise((r) => {
        terminar = r
      }),
    }
    this.abiertas.set(id, a)
    proceso.onData((d) => {
      a.texto += d
      a.total += d.length
      a.pendiente += d
      if (a.texto.length > CARACTERES_ANTES_DE_RECORTAR) a.texto = recortarSalida(a.texto)
      this.programarTanda()
    })
    proceso.onExit(({ exitCode }) => {
      a.pty = null
      this.mandarTanda()
      a.vista.estado = estadoAlTerminar(exitCode, a.detenida)
      a.vista.codigo = exitCode
      terminar(exitCode)
      if (this.abiertas.has(id)) this.o.alCambiar(this.lista())
    })
    this.o.anotar?.(`Consolas: abrió «${p.nombre}»`)
    this.o.alCambiar(this.lista())
    this.o.alAbrir?.({ ...vista })
    return { ...vista }
  }

  /** Espera a que termine; devuelve su código (el del comando). */
  esperar(id: string): Promise<number> {
    return this.abiertas.get(id)?.fin ?? Promise.resolve(-1)
  }

  escribir(id: string, datos: string): void {
    this.abiertas.get(id)?.pty?.write(datos)
  }

  tamano(id: string, columnas: number, filas: number): void {
    const p = this.abiertas.get(id)?.pty
    if (!p || columnas < 2 || filas < 1) return
    try {
      p.resize(Math.floor(columnas), Math.floor(filas))
    } catch {
      // Terminó justo: no hay a quién cambiarle el tamaño.
    }
  }

  /** Lo guardado de una consola, para dibujarla de nuevo (otra pestaña, la ventana recargada). */
  guardado(id: string): GuardadoConsola | null {
    const a = this.abiertas.get(id)
    if (!a) return null
    // Lo pendiente todavía no salió como tanda: va con lo guardado y la tanda que llegue después se descarta por `desde`.
    a.texto = recortarSalida(a.texto)
    return { texto: a.texto, hasta: a.total }
  }

  limpiar(id: string): void {
    const a = this.abiertas.get(id)
    if (a) a.texto = ''
  }

  /** Detiene lo que corre (corta el árbol de procesos); la pestaña queda para leer. */
  detener(id: string): void {
    const a = this.abiertas.get(id)
    if (!a?.pty) return
    a.detenida = true
    cortarArbol(a.pty.pid)
  }

  /** La × de la pestaña: la detiene si corre y la saca. */
  cerrar(id: string): void {
    const a = this.abiertas.get(id)
    if (!a) return
    this.detener(id)
    this.abiertas.delete(id)
    this.o.alCambiar(this.lista())
  }

  /** Al cerrar Iridium (D-184 › 4): lo que corre adentro se cierra con él, sin esperar. */
  cerrarTodas(): void {
    for (const a of this.abiertas.values()) {
      if (!a.pty) continue
      a.detenida = true
      cortarArbol(a.pty.pid, true)
    }
  }

  /** Cuántas siguen corriendo. */
  corriendo(): number {
    return [...this.abiertas.values()].filter((a) => a.pty !== null).length
  }

  private programarTanda(): void {
    if (this.reloj) return
    this.reloj = setTimeout(() => this.mandarTanda(), this.o.tandaMs ?? 16)
  }

  private mandarTanda(): void {
    if (this.reloj) clearTimeout(this.reloj)
    this.reloj = null
    for (const a of this.abiertas.values()) {
      if (!a.pendiente) continue
      this.o.alSalir({ id: a.vista.id, desde: a.total - a.pendiente.length, datos: a.pendiente })
      a.pendiente = ''
    }
  }
}

/** Corta el proceso y todo lo que lanzó (`taskkill /T /F`); al cerrar Iridium, sin soltar el hilo hasta que termina. */
function cortarArbol(pid: number, ahora = false): void {
  const args = ['/T', '/F', '/PID', String(pid)]
  try {
    if (ahora) execFileSync('taskkill', args, { stdio: 'ignore', windowsHide: true, timeout: 5000 })
    else execFile('taskkill', args, { windowsHide: true }, () => {})
  } catch {
    // Ya había terminado.
  }
}

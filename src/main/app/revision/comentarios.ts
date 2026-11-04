// Casos de uso de la sección Revisión (modulos/revision/diseno-tecnico.md › Sección Revisión, › Enviar ahora): listar
// los comentarios de un proyecto, su captura, Enviar ahora, reabrir, cuántos hay abiertos y si una app Electron ya carga
// la línea (H-R7). Nadie borra un comentario desde la app.
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { armarMensaje } from '../../../compartido/mensaje-revision'
import type { ListaComentarios, ResultadoEnvio, VistaComentario } from '../../../compartido/puente'
import {
  CARPETA_REVISION,
  type Comentario,
  cierreDe,
  conHistoria,
  fueReabierto,
  leerComentario,
  reabierto,
} from '../../core/revision/comentario'
import { escribirAtomico } from '../../infra/escritura'

export interface ServiciosComentarios {
  /** ¿El proyecto está abierto en Iridium (tiene su pestaña)? Si no, Enviar ahora no tiene adónde mandar. */
  sesionAbierta(ruta: string): Promise<boolean>
  /** Manda el texto a la sesión del proyecto: si la IA trabaja, se suma al turno; si no, arranca uno. */
  enviarALaSesion(ruta: string, texto: string): Promise<void>
  /** Última conexión de la extensión (ISO); null si nunca. */
  ultimaConexion(): Promise<string | null>
  ahora?(): Date
}

/** Carpetas que no son código propio: no se buscan en ellas ni la línea de la Revisión ni archivos. */
const SIN_BUSCAR = new Set([
  'node_modules',
  '.git',
  'out',
  'dist',
  'release',
  '.vite',
  'coverage',
  'test-results',
  'docs',
])
const CODIGO = /\.(m?[jt]sx?|cjs|cts|mts)$/i
const LIMITE_RECORRIDO = 5000
const LIMITE_ARCHIVO = 512 * 1024

async function existe(ruta: string): Promise<boolean> {
  try {
    await stat(ruta)
    return true
  } catch {
    return false
  }
}

/** ¿El proyecto es Electron y algún archivo de su código ya llama al ayudante de la Revisión? (H-R7) */
export async function revisionElectron(ruta: string): Promise<{ esElectron: boolean; cargaLinea: boolean }> {
  let esElectron = false
  try {
    const pkg = JSON.parse(await readFile(join(ruta, 'package.json'), 'utf8')) as Record<string, unknown>
    esElectron = ['dependencies', 'devDependencies'].some(
      (k) => typeof pkg[k] === 'object' && pkg[k] !== null && 'electron' in (pkg[k] as object),
    )
  } catch {
    // Sin package.json: no es Electron.
  }
  if (!esElectron) return { esElectron, cargaLinea: false }
  const pendientes = ['']
  let vistos = 0
  while (pendientes.length && vistos < LIMITE_RECORRIDO) {
    const rel = pendientes.shift() ?? ''
    let entradas: { name: string; isDirectory(): boolean; isFile(): boolean }[]
    try {
      entradas = await readdir(join(ruta, rel), { withFileTypes: true })
    } catch {
      continue
    }
    for (const e of entradas) {
      vistos++
      const r = rel ? `${rel}/${e.name}` : e.name
      if (e.isDirectory()) {
        if (!SIN_BUSCAR.has(e.name) && !e.name.startsWith('.')) pendientes.push(r)
      } else if (e.isFile() && CODIGO.test(e.name)) {
        try {
          const archivo = join(ruta, r)
          if ((await stat(archivo)).size > LIMITE_ARCHIVO) continue
          if ((await readFile(archivo, 'utf8')).includes('ayudante.mjs'))
            return { esElectron, cargaLinea: true }
        } catch {
          // Un archivo que no se puede leer no cambia la respuesta.
        }
      }
    }
  }
  return { esElectron, cargaLinea: false }
}

export class Comentarios {
  /** Los cambios a un comentario se escriben de a uno por proyecto. */
  private colas = new Map<string, Promise<unknown>>()

  constructor(private readonly s: ServiciosComentarios) {}

  private ahora(): Date {
    return this.s.ahora?.() ?? new Date()
  }

  private enFila<T>(ruta: string, f: () => Promise<T>): Promise<T> {
    const r = (this.colas.get(ruta) ?? Promise.resolve()).then(f, f)
    this.colas.set(
      ruta,
      r.catch(() => {}),
    )
    return r
  }

  private carpeta(ruta: string): string {
    return join(ruta, ...CARPETA_REVISION)
  }

  /** Los comentarios del proyecto, los que no se pudieron leer y los nombres de archivo. */
  private async leerTodos(ruta: string): Promise<{ comentarios: Comentario[]; ilegibles: string[] }> {
    let nombres: string[]
    try {
      nombres = await readdir(this.carpeta(ruta))
    } catch {
      return { comentarios: [], ilegibles: [] }
    }
    const comentarios: Comentario[] = []
    const ilegibles: string[] = []
    for (const n of nombres) {
      if (!/^R-\d+\.md$/i.test(n)) continue
      try {
        const c = leerComentario(n, await readFile(join(this.carpeta(ruta), n), 'utf8'))
        if (c) comentarios.push(c)
        else ilegibles.push(n)
      } catch {
        ilegibles.push(n)
      }
    }
    comentarios.sort((a, b) => b.numero - a.numero)
    return { comentarios, ilegibles: ilegibles.sort() }
  }

  async abiertos(ruta: string): Promise<number> {
    return (await this.leerTodos(ruta)).comentarios.filter((c) => c.estado === 'abierto').length
  }

  async listar(ruta: string): Promise<ListaComentarios> {
    try {
      const [{ comentarios, ilegibles }, extension, electron] = await Promise.all([
        this.leerTodos(ruta),
        this.s.ultimaConexion(),
        revisionElectron(ruta),
      ])
      const vistas = await Promise.all(comentarios.map((c) => this.vista(ruta, c)))
      return { tipo: 'ok', comentarios: vistas, ilegibles, extension, electron }
    } catch (e) {
      return { tipo: 'error', mensaje: e instanceof Error ? e.message : String(e) }
    }
  }

  private async vista(ruta: string, c: Comentario): Promise<VistaComentario> {
    const captura = c.captura && /^R-\d+\.png$/i.test(c.captura) ? c.captura : null
    return {
      codigo: c.codigo,
      numero: c.numero,
      estado: c.estado,
      texto: c.texto,
      archivo: c.archivo
        ? {
            ...c.archivo,
            existe: !c.archivo.ruta.includes('..') && (await existe(join(ruta, c.archivo.ruta))),
          }
        : null,
      componentes: c.componentes,
      pagina: c.pagina,
      elemento: c.elemento,
      conCaptura: captura !== null && (await existe(join(this.carpeta(ruta), captura))),
      historia: c.historia,
      dejado: c.historia.find((h) => /^dejado/i.test(h.texto))?.fecha ?? c.historia[0]?.fecha ?? null,
      cierre: cierreDe(c),
      reabierto: fueReabierto(c),
    }
  }

  private async leerUno(ruta: string, codigo: string): Promise<{ archivo: string; texto: string } | null> {
    const archivo = join(this.carpeta(ruta), `${codigo}.md`)
    try {
      return { archivo, texto: await readFile(archivo, 'utf8') }
    } catch {
      return null
    }
  }

  /** La captura como `data:`; solo `docs/revision/R-n.png`, nunca otra ruta. */
  async captura(ruta: string, codigo: string): Promise<string | null> {
    const uno = await this.leerUno(ruta, codigo)
    const c = uno && leerComentario(`${codigo}.md`, uno.texto)
    if (!c?.captura || !/^R-\d+\.png$/i.test(c.captura)) return null
    try {
      return `data:image/png;base64,${(await readFile(join(this.carpeta(ruta), c.captura))).toString('base64')}`
    } catch {
      return null
    }
  }

  /** Enviar ahora (H-R2): el mensaje entra a la sesión del proyecto y la historia lo anota. */
  enviar(ruta: string, codigo: string): Promise<ResultadoEnvio> {
    return this.enFila(ruta, async () => {
      const uno = await this.leerUno(ruta, codigo)
      const c = uno && leerComentario(`${codigo}.md`, uno.texto)
      if (!uno || !c) return 'no-existe'
      if (!(await this.s.sesionAbierta(ruta))) return 'sin-sesion'
      // La historia se escribe antes de mandarlo: si la IA lo cierra enseguida, no se le pisa el cierre.
      await escribirAtomico(uno.archivo, conHistoria(uno.texto, this.ahora(), 'enviado a la sesión'))
      await this.s.enviarALaSesion(
        ruta,
        armarMensaje({ codigo, texto: c.texto, archivo: c.archivo, pagina: c.pagina, captura: c.captura }),
      )
      return 'enviado'
    })
  }

  /** Reabrir (H-R5): vuelve a Abiertos con la nota en la historia. */
  reabrir(ruta: string, codigo: string, nota: string): Promise<void> {
    return this.enFila(ruta, async () => {
      const uno = await this.leerUno(ruta, codigo)
      if (!uno || !leerComentario(`${codigo}.md`, uno.texto)) throw new Error(`${codigo} ya no está`)
      await escribirAtomico(uno.archivo, reabierto(uno.texto, this.ahora(), nota))
    })
  }
}

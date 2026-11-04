// Casos de uso de la Revisión del lado de la extensión (diseno-tecnico.md › Procesos centrales): decir de qué proyecto es
// una dirección, guardar un comentario como `docs/revision/R-n.md` con su captura, y recordar lo que elige el usuario.
import { mkdir, readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping'
import type { ResultadoEnvio } from '../../../compartido/puente'
import {
  type PedidoComentario,
  type PedidoDireccion,
  type RespuestaComentario,
  type RespuestaEstado,
  VERSION_EXTENSION,
} from '../../../compartido/revision'
import { armarComentario, CARPETA_REVISION, idDe, proximoNumero } from '../../core/revision/comentario'
import {
  candidatosDeRuta,
  direccionDe,
  esDireccionLocal,
  mapaEnLinea,
  primerMarco,
  puertoDe,
} from '../../core/revision/pila'
import {
  type ProyectoConocido,
  proyectoPorLineaDeComandos,
  proyectoQueContiene,
  unicoCon,
} from '../../core/revision/proyecto'
import { escribirAtomico } from '../../infra/escritura'
import type { ArchivoRevision } from '../../infra/revision/datos'

export interface ServiciosRevision {
  proyectos(): Promise<ProyectoConocido[]>
  datos: ArchivoRevision
  /** Las líneas de comandos de los procesos que escuchan en un puerto (`infra/revision/puerto.ts`). */
  lineasDelPuerto(puerto: number): Promise<string[]>
  /** Baja un módulo del servidor de desarrollo; solo se llama con direcciones de la PC. */
  bajar?(url: string): Promise<string>
  ahora?(): Date
  /** Cuánto espera `/estado` a que Windows diga el proceso del puerto (las pruebas lo cambian). */
  esperaEstadoMs?: number
  /** Enviar ahora (H-R2): manda el comentario guardado a la sesión del proyecto, si está abierto en Iridium. */
  enviar?(ruta: string, codigo: string): Promise<ResultadoEnvio>
}

/** Carpetas que no son código del proyecto: no se buscan archivos en ellas. */
const SIN_BUSCAR = new Set([
  'node_modules',
  '.git',
  'out',
  'dist',
  'release',
  '.vite',
  'coverage',
  'test-results',
])
const LIMITE_RECORRIDO = 20_000
/** Cuánto se recuerda que el proceso no dijo el proyecto, para no preguntarle a Windows en cada `/estado`. */
const OLVIDO_PROCESO_MS = 60_000
/**
 * Cuánto espera `/estado` a Windows. Preguntarle qué programa usa un puerto tarda alrededor de un segundo: si no llega,
 * se responde sin proyecto y la averiguación sigue sola (lo que encuentre se recuerda para la próxima).
 */
const ESPERA_ESTADO_MS = 700

async function bajarConFetch(url: string): Promise<string> {
  const r = await fetch(url, { signal: AbortSignal.timeout(3000) })
  if (!r.ok) throw new Error(`${r.status}`)
  return r.text()
}

async function existeArchivo(ruta: string): Promise<boolean> {
  try {
    return (await stat(ruta)).isFile()
  } catch {
    return false
  }
}

/** Busca dentro del proyecto un archivo cuya ruta termine en `sufijo` (proyectos con raíz en `src/renderer`). */
async function buscarPorFinal(raiz: string, sufijo: string): Promise<string | null> {
  const fin = `/${sufijo.toLowerCase()}`
  const pendientes = ['']
  let vistos = 0
  while (pendientes.length && vistos < LIMITE_RECORRIDO) {
    const rel = pendientes.shift() ?? ''
    let entradas: { name: string; isDirectory(): boolean; isFile(): boolean }[]
    try {
      entradas = await readdir(join(raiz, rel), { withFileTypes: true })
    } catch {
      continue
    }
    for (const e of entradas) {
      vistos++
      const r = rel ? `${rel}/${e.name}` : e.name
      if (e.isDirectory()) {
        if (!SIN_BUSCAR.has(e.name)) pendientes.push(r)
      } else if (e.isFile() && `/${r.toLowerCase()}`.endsWith(fin)) return r
    }
  }
  return null
}

/** Las carpetas se comparan sin mayúsculas ni barras finales (Windows). */
const claveCarpeta = (c: string) => c.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()

export class Revision {
  /** Un proyecto guarda de a un comentario: dos que llegan juntos no se pisan el número. */
  private colas = new Map<string, Promise<unknown>>()
  private sinProceso = new Map<string, number>()

  constructor(private readonly s: ServiciosRevision) {}

  private ahora(): Date {
    return this.s.ahora?.() ?? new Date()
  }

  private async porNombre(nombre: string | undefined): Promise<ProyectoConocido | null> {
    if (!nombre) return null
    return (await this.s.proyectos()).find((p) => p.nombre === nombre) ?? null
  }

  private async recordar(direccion: string, p: ProyectoConocido): Promise<void> {
    await this.s.datos.cambiar((d) => {
      d.direcciones[direccion] = { ruta: p.ruta, fecha: this.ahora().toISOString() }
    })
  }

  /**
   * Paso 1, lo dice la app: en Electron, el proyecto que contiene su carpeta o, si es una app instalada fuera de los
   * proyectos, el que se eligió para esa carpeta.
   */
  private async proyectoDeCarpeta(
    carpeta: string,
    proyectos: ProyectoConocido[],
  ): Promise<ProyectoConocido | null> {
    const contiene = proyectoQueContiene(carpeta, proyectos)
    if (contiene) return contiene
    const recordada = (await this.s.datos.leer()).carpetas[claveCarpeta(carpeta)]
    return (recordada && proyectos.find((x) => x.ruta === recordada.ruta)) || null
  }

  /** Recuerda el proyecto elegido para la carpeta de una app, si no está dentro de ninguno. */
  private async recordarCarpeta(carpeta: string, p: ProyectoConocido, proyectos: ProyectoConocido[]) {
    if (proyectoQueContiene(carpeta, proyectos)) return
    await this.s.datos.cambiar((d) => {
      d.carpetas[claveCarpeta(carpeta)] = { ruta: p.ruta, fecha: this.ahora().toISOString() }
    })
  }

  private averiguando = new Map<string, Promise<ProyectoConocido | null>>()

  /** Recordado o por el proceso que atiende el puerto (pasos 2 y 3); lo que resuelve el proceso se recuerda. */
  private proyectoDeDireccion(direccion: string): Promise<ProyectoConocido | null> {
    const ya = this.averiguando.get(direccion)
    if (ya) return ya
    const p = this.averiguar(direccion).finally(() => this.averiguando.delete(direccion))
    this.averiguando.set(direccion, p)
    return p
  }

  private async averiguar(direccion: string): Promise<ProyectoConocido | null> {
    const proyectos = await this.s.proyectos()
    const recordada = (await this.s.datos.leer()).direcciones[direccion]
    const p = recordada && proyectos.find((x) => x.ruta === recordada.ruta)
    if (p) return p
    const puerto = puertoDe(direccion)
    const ultimo = this.sinProceso.get(direccion)
    if (!puerto || (ultimo && this.ahora().getTime() - ultimo < OLVIDO_PROCESO_MS)) return null
    const porProceso = proyectoPorLineaDeComandos(await this.s.lineasDelPuerto(puerto), proyectos)
    if (porProceso) await this.recordar(direccion, porProceso)
    else this.sinProceso.set(direccion, this.ahora().getTime())
    return porProceso
  }

  async estado(direccion: string, version: string | null, carpeta?: string): Promise<RespuestaEstado> {
    await this.s.datos.cambiar((d) => {
      d.extension = { ultima: this.ahora().toISOString(), version: version ?? '?' }
    })
    const proyectos = await this.s.proyectos()
    const normal = direccionDe(`http://${direccion}`)
    // Paso 1, lo dice la app (Electron). No se recuerda la dirección: varias apps Electron usan el mismo puerto (5173)
    // en distintos momentos.
    const p = carpeta
      ? await this.proyectoDeCarpeta(carpeta, proyectos)
      : normal
        ? await Promise.race([
            this.proyectoDeDireccion(normal),
            new Promise<null>((r) => setTimeout(() => r(null), this.s.esperaEstadoMs ?? ESPERA_ESTADO_MS)),
          ])
        : null
    return {
      version: VERSION_EXTENSION,
      proyecto: p?.nombre ?? null,
      proyectos: proyectos.map((x) => x.nombre),
    }
  }

  async direccion(pedido: PedidoDireccion): Promise<void> {
    const p = await this.porNombre(pedido.proyecto)
    if (p && pedido.carpeta) return this.recordarCarpeta(pedido.carpeta, p, await this.s.proyectos())
    const normal = direccionDe(`http://${pedido.direccion}`)
    if (normal && p) await this.recordar(normal, p)
  }

  /** El archivo y la línea del JSX, con el mapa de fuentes del módulo. null si algo falta: se guarda igual. */
  private async archivoYLinea(
    pila: string | null,
    proyectos: ProyectoConocido[],
  ): Promise<{ proyecto: ProyectoConocido | null; ruta: string; linea: number } | null> {
    const marco = primerMarco(pila)
    if (!marco || !esDireccionLocal(marco.url)) return null
    let fuente: string | null = null
    let linea = marco.linea
    try {
      const mapa = mapaEnLinea(await (this.s.bajar ?? bajarConFetch)(marco.url))
      if (mapa) {
        const o = originalPositionFor(new TraceMap(mapa), { line: marco.linea, column: marco.columna - 1 })
        if (o.line) {
          fuente = o.source
          linea = o.line
        }
      }
    } catch {
      // Sin el módulo o con un mapa raro: la línea queda sin traducir y se busca el archivo por la dirección.
    }
    const candidatos = candidatosDeRuta(marco.url, fuente)
    const hallados: { proyecto: ProyectoConocido; ruta: string }[] = []
    for (const p of proyectos) {
      for (const c of candidatos) {
        for (const r of [c, `src/renderer/${c}`]) {
          if (await existeArchivo(join(p.ruta, r))) {
            hallados.push({ proyecto: p, ruta: r })
            break
          }
        }
        if (hallados.at(-1)?.proyecto === p) break
      }
    }
    const unico = unicoCon(hallados)
    if (unico) return { ...unico, linea }
    if (proyectos.length === 1 && proyectos[0]) {
      // Proyecto ya sabido: se busca por el final de la ruta (la raíz de la app puede estar más adentro).
      for (const c of candidatos) {
        const r = await buscarPorFinal(proyectos[0].ruta, c)
        if (r) return { proyecto: proyectos[0], ruta: r, linea }
      }
    }
    return null
  }

  async comentario(pedido: PedidoComentario): Promise<RespuestaComentario> {
    const todos = await this.s.proyectos()
    const direccion = direccionDe(pedido.url)
    let proyecto = (await this.porNombre(pedido.proyecto)) ?? null
    const deLaApp = pedido.carpeta ? await this.proyectoDeCarpeta(pedido.carpeta, todos) : null
    if (proyecto && direccion && !pedido.carpeta) await this.recordar(direccion, proyecto)
    if (proyecto && pedido.carpeta) await this.recordarCarpeta(pedido.carpeta, proyecto, todos)
    proyecto ??= deLaApp
    if (!proyecto && direccion && !pedido.carpeta) proyecto = await this.proyectoDeDireccion(direccion)
    // Paso 4, por el código: el archivo del mapa de fuentes está en un solo proyecto.
    const fuente = await this.archivoYLinea(pedido.pila, proyecto ? [proyecto] : todos)
    if (!proyecto && fuente?.proyecto) {
      proyecto = fuente.proyecto
      if (direccion && !pedido.carpeta) await this.recordar(direccion, proyecto)
    }
    if (!proyecto) return { tipo: 'sin-proyecto', proyectos: todos.map((p) => p.nombre) }
    const elegido = proyecto
    const anterior = this.colas.get(elegido.ruta) ?? Promise.resolve()
    const guardar = anterior.then(() => this.guardar(elegido, pedido, fuente))
    this.colas.set(
      elegido.ruta,
      guardar.catch(() => {}),
    )
    const codigo = await guardar
    let envio: 'enviado' | 'sin-sesion' | null = null
    if (pedido.enviar && this.s.enviar) {
      const r = await this.s.enviar(elegido.ruta, codigo).catch(() => 'sin-sesion' as const)
      envio = r === 'enviado' ? 'enviado' : 'sin-sesion'
    }
    return { tipo: 'guardado', codigo, proyecto: elegido.nombre, envio }
  }

  private async guardar(
    proyecto: ProyectoConocido,
    pedido: PedidoComentario,
    fuente: { ruta: string; linea: number } | null,
  ): Promise<string> {
    const carpeta = join(proyecto.ruta, ...CARPETA_REVISION)
    await mkdir(carpeta, { recursive: true })
    const nombres = await readdir(carpeta)
    // Un envío repetido (la cola reintentó después de guardar) devuelve el mismo `R-n`.
    for (const n of nombres) {
      if (!/^R-\d+\.md$/i.test(n)) continue
      const texto = await readFile(join(carpeta, n), 'utf8').catch(() => '')
      if (idDe(texto) === pedido.id) return n.replace(/\.md$/i, '').toUpperCase()
    }
    const numero = proximoNumero(nombres)
    const codigo = `R-${numero}`
    const captura = pedido.captura ? Buffer.from(pedido.captura.split(',')[1] ?? '', 'base64') : null
    if (captura?.length) await escribirAtomico(join(carpeta, `${codigo}.png`), captura)
    const fecha = new Date(pedido.creado)
    await escribirAtomico(
      join(carpeta, `${codigo}.md`),
      armarComentario({
        numero,
        id: pedido.id,
        texto: pedido.texto,
        archivo: fuente ? { ruta: fuente.ruta, linea: fuente.linea } : null,
        componentes: pedido.componentes,
        url: pedido.url,
        elemento: pedido.elemento,
        conCaptura: Boolean(captura?.length),
        fecha: Number.isNaN(fecha.getTime()) ? this.ahora() : fecha,
      }),
    )
    return codigo
  }
}

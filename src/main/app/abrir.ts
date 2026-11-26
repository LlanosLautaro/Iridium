// La actualización automática (frente Abrir, AB-I2, D-156 › 5 a 8; `modulos/abrir/diseno-tecnico.md` › Procesos
// centrales): cada minuto, y al terminar un turno de la IA, mira los proyectos que marcan `ejecutar · escritorio` y
// `armar` y arma solo, de a uno y sin IA, el que tiene commits que su app no tiene, está cerrada y nadie trabaja en él.
import { join, normalize } from 'node:path'
import type { ActualizacionProyecto } from '../../compartido/puente'
import { armadoSupuesto, porQueNoArma, puedeArmarse, scriptQueArma, scriptQueEjecuta } from '../core/abrir'
import type { ScriptLeido } from '../core/visor/scripts'
import type { ArchivoArmados, ArmadoProyecto, UltimoArmado } from '../infra/armados'
import { rutaDelProyecto, rutaDeScript } from './visor'

/** Cada cuánto se mira (D-156 › 7): tres comandos de git cortos y un intento de abrir el `.exe` por proyecto. */
const CADA_MS = 60_000
/** Mientras arma, cada cuánto se mira si terminó (solo su marca de fin). */
const ARMANDO_CADA_MS = 3_000
/** Con Iridium abierta, un armado se corta a los 10 minutos (D-156 › 6). */
export const LIMITE_ARMADO_MS = 10 * 60_000
/**
 * Entre dos miradas, lo más que cuenta para el límite: un salto más largo es la PC dormida (o Iridium cerrada), y el
 * armado no corrió en ese rato (paso 8).
 */
const SALTO_MAXIMO_MS = 60_000
/** Un proceso que arrancó más de esto después de anotado el armado es otro con el mismo número. */
const HOLGURA_INICIO_MS = 5_000
const SE_CORTO = 'El armado se cortó antes de terminar.'

export type ResultadoArmado = UltimoArmado['resultado']

/** Lo que hace falta para armar un proyecto: su `.exe`, el comando y dónde corre. */
export interface PlanArmado {
  exe: string
  comando: string
  cwd: string
}

/** El `.exe` (del proyecto o instalado fuera, D-158) y el comando de armar de un proyecto, según las marcas de su `scripts.md`; null si no se arma solo. */
export function planDeArmado(
  ruta: string,
  scripts: readonly ScriptLeido[],
  env: NodeJS.ProcessEnv = process.env,
): PlanArmado | null {
  if (!puedeArmarse(scripts)) return null
  const exe = rutaDeScript(ruta, scriptQueEjecuta(scripts)?.script.valor ?? '', env)
  const armar = scriptQueArma(scripts)
  if (exe === null || !armar) return null
  const carpeta = armar.carpeta === null ? '' : rutaDelProyecto(armar.carpeta)
  if (carpeta === null) return null
  return {
    exe,
    comando: armar.valor.trim(),
    cwd: carpeta === '' ? ruta : join(ruta, ...carpeta.split('/')),
  }
}

export interface DependenciasArmados {
  /** Las carpetas de los proyectos. */
  proyectos(): Promise<string[]>
  /** Los scripts de `docs/scripts.md`; null si no hay. */
  scripts(ruta: string): Promise<ScriptLeido[] | null>
  git(ruta: string): Promise<{ commit: string; fecha: number; limpio: boolean } | null>
  /** Una sesión de Iridium en marcha en el proyecto, o su conversación usada en VS Code hace poco. */
  iaTrabajando(ruta: string): Promise<boolean>
  /** Los proyectos con la actualización apagada (D-154). */
  apagados(): Promise<readonly string[]>
  archivo: ArchivoArmados
  /** La carpeta del log y la marca de fin del proyecto. */
  carpeta(ruta: string): string
  lanzar(carpeta: string, comando: string, cwd: string): Promise<number>
  fin(carpeta: string): Promise<'ok' | 'falla' | null>
  vivo(pid: number): boolean
  /** Cuándo arrancó ese proceso (ms), o null si no se sabe: para no confundir el armado con otro programa. */
  inicio?(pid: number): Promise<number | null>
  cortar(pid: number): Promise<void>
  abierta(exe: string): Promise<boolean>
  fechaExe(exe: string): Promise<number | null>
  ahora(): number
  /** La carpeta del código de Iridium: tiene su propio armado (D-122). */
  excluida: string | null
  alCambio(estados: Record<string, ActualizacionProyecto>): void
  /** Terminó un armado: el aviso al volver cuenta los que pasaron sin el usuario (T-86). */
  alTerminar?(ruta: string, ultimo: UltimoArmado): void
  registrar(texto: string): void
  limiteMs?: number
}

/** El commit con que falló el último armado (y no se vuelve a intentar), o null. */
function fallado(u: UltimoArmado | null): string | null {
  return u?.resultado === 'falla' && !u.reintentar ? u.commit : null
}

function igual(a: string, b: string): boolean {
  return normalize(a).toLowerCase() === normalize(b).toLowerCase()
}

export class VigiaArmados {
  private reloj: ReturnType<typeof setTimeout> | null = null
  private mirando: Promise<void> | null = null
  private otraVez = false
  private estados: Record<string, ActualizacionProyecto> = {}
  /** Actualizar ahora y Armar ahora: se arman aunque no toque, en orden. */
  private pedidos: string[] = []
  private esperando = new Map<string, ((r: ResultadoArmado) => void)[]>()
  private cerrado = false
  /** Los armados (por su proceso) que se sabe que son nuestros: lanzados o comprobados en esta sesión. */
  private propios = new Set<number>()
  /** El tiempo que corrió cada armado con Iridium mirando: la última mirada y lo acumulado. */
  private corrido = new Map<number, { ultima: number; ms: number }>()

  constructor(private readonly d: DependenciasArmados) {}

  /** Mira ya y después cada minuto (cada pocos segundos mientras arma). */
  vigilar(): void {
    this.cerrado = false
    void this.mirar()
  }

  cerrar(): void {
    this.cerrado = true
    if (this.reloj) clearTimeout(this.reloj)
    this.reloj = null
  }

  ultimos(): Record<string, ActualizacionProyecto> {
    return this.estados
  }

  /** Terminó un turno de la IA en ese proyecto: suele haber un commit nuevo (D-156 › 7). */
  alTerminarTurno(ruta: string): void {
    if (this.estados[ruta]) void this.mirar()
  }

  /** Si ese proyecto se está armando ahora. */
  armando(ruta: string): boolean {
    return this.estados[ruta]?.armando != null
  }

  /** Cómo termina el armado en curso de ese proyecto (Ejecutar mientras se arma, AB-2). */
  esperar(ruta: string): Promise<ResultadoArmado> {
    return new Promise((listo) => this.esperando.set(ruta, [...(this.esperando.get(ruta) ?? []), listo]))
  }

  /**
   * Actualizar ahora (AB-4) y Armar ahora (AB-2): lo arma aunque esté apagada, al día o haya fallado con ese commit.
   * Si otro se está armando, espera su turno. Devuelve cómo termina.
   */
  armarYa(ruta: string): Promise<ResultadoArmado> {
    const fin = this.esperar(ruta)
    if (!this.pedidos.includes(ruta) && !this.armando(ruta)) this.pedidos.push(ruta)
    void this.mirar()
    return fin
  }

  /** Una vuelta: cierra el armado que terminó y, si nadie arma, empieza el que toca. */
  mirar(): Promise<void> {
    if (this.mirando) {
      this.otraVez = true
      return this.mirando
    }
    this.mirando = this.vuelta()
      .catch((e) =>
        this.d.registrar(`Abrir: no se pudo mirar los armados — ${e instanceof Error ? e.message : e}`),
      )
      .finally(() => {
        this.mirando = null
        if (this.otraVez) {
          this.otraVez = false
          void this.mirar()
        } else this.programar()
      })
    return this.mirando
  }

  private programar(): void {
    if (this.cerrado) return
    if (this.reloj) clearTimeout(this.reloj)
    const armando = Object.values(this.estados).some((e) => e.armando !== null)
    this.reloj = setTimeout(() => void this.mirar(), armando ? ARMANDO_CADA_MS : CADA_MS)
  }

  private async vuelta(): Promise<void> {
    const apagados = await this.d.apagados()
    const planes = new Map<string, PlanArmado>()
    for (const ruta of await this.d.proyectos()) {
      if (this.d.excluida && igual(ruta, this.d.excluida)) continue
      const scripts = await this.d.scripts(ruta)
      const plan = scripts ? planDeArmado(ruta, scripts) : null
      if (plan) planes.set(ruta, plan)
    }
    this.pedidos = this.pedidos.filter((r) => planes.has(r))

    const commits = new Map<string, string | null>()
    let alguno = false
    for (const [ruta, plan] of planes) {
      let anotado = await this.d.archivo.de(ruta)
      if (anotado.enCurso) anotado = await this.revisarEnCurso(ruta, plan, anotado)
      if (anotado.enCurso) alguno = true
    }

    // De a uno (D-156 › 5): primero lo pedido a mano, después lo que toca solo.
    const situaciones = new Map<string, Parameters<typeof porQueNoArma>[0]>()
    for (const [ruta, plan] of planes) {
      const git = await this.d.git(ruta)
      commits.set(ruta, git?.commit ?? null)
      let anotado = await this.d.archivo.de(ruta)
      if (anotado.commit === null && anotado.ultimo === null && git) {
        const supuesto = armadoSupuesto(git.commit, git.fecha, await this.d.fechaExe(plan.exe))
        if (supuesto) anotado = await this.d.archivo.cambiar(ruta, { commit: supuesto })
      }
      if (alguno || anotado.enCurso) continue
      situaciones.set(ruta, {
        commit: git?.commit ?? null,
        armado: anotado.commit,
        limpio: git?.limpio ?? false,
        prendida: !apagados.some((a) => igual(a, ruta)),
        fallo: fallado(anotado.ultimo),
        // Lo más lento al final: solo si lo demás deja armar.
        iaTrabajando: false,
        abierta: false,
      })
    }
    if (!alguno) {
      const pedido = this.pedidos.find((r) => situaciones.has(r))
      const elegido = pedido ?? (await this.elegir(situaciones, planes))
      if (elegido) {
        const plan = planes.get(elegido)
        if (plan) await this.lanzar(elegido, plan, commits.get(elegido) ?? null)
        this.pedidos = this.pedidos.filter((r) => r !== elegido)
      }
    }
    await this.publicar(planes, commits, apagados)
  }

  private async elegir(
    situaciones: Map<string, Parameters<typeof porQueNoArma>[0]>,
    planes: Map<string, PlanArmado>,
  ): Promise<string | null> {
    for (const [ruta, s] of situaciones) {
      if (porQueNoArma(s) !== null) continue
      const plan = planes.get(ruta)
      if (!plan) continue
      const completa = {
        ...s,
        iaTrabajando: await this.d.iaTrabajando(ruta),
        abierta: await this.d.abierta(plan.exe),
      }
      if (porQueNoArma(completa) === null) return ruta
    }
    return null
  }

  private async lanzar(ruta: string, plan: PlanArmado, commit: string | null): Promise<void> {
    const carpeta = this.d.carpeta(ruta)
    try {
      const pid = await this.d.lanzar(carpeta, plan.comando, plan.cwd)
      const desde = this.d.ahora()
      this.propios.add(pid)
      this.corrido.set(pid, { ultima: desde, ms: 0 })
      await this.d.archivo.cambiar(ruta, { enCurso: { pid, desde, commit } })
      this.d.registrar(`Abrir: arma ${ruta} (${commit?.slice(0, 7) ?? 'sin commit'})`)
    } catch (e) {
      await this.terminar(
        ruta,
        commit,
        'falla',
        `No se pudo empezar a armar: ${e instanceof Error ? e.message : e}`,
      )
    }
  }

  private async revisarEnCurso(ruta: string, plan: PlanArmado, a: ArmadoProyecto): Promise<ArmadoProyecto> {
    const en = a.enCurso
    if (!en) return a
    const fin = await this.d.fin(this.d.carpeta(ruta))
    if (fin === 'ok') return this.terminar(ruta, en.commit, 'ok')
    if (fin === 'falla') {
      // No pudo reemplazar el `.exe` porque la abriste por fuera: se reintenta al cerrarla (D-156 › 8).
      if (await this.d.abierta(plan.exe))
        return this.terminar(ruta, en.commit, 'ocupada', 'La app estaba abierta.')
      return this.terminar(ruta, en.commit, 'falla', 'El script de armar terminó con error.')
    }
    if (!this.d.vivo(en.pid) || !(await this.esElArmado(en.pid, en.desde))) {
      // Se cortó sin culpa del script (la PC se apagó a mitad): se intenta otra vez, una sola con ese commit.
      const yaSeCorto = a.ultimo?.reintentar === true && a.ultimo.commit === en.commit
      return yaSeCorto
        ? this.terminar(ruta, en.commit, 'falla', SE_CORTO)
        : this.terminar(ruta, en.commit, 'falla', `${SE_CORTO} Se vuelve a intentar.`, true)
    }
    if (this.corrio(en.pid) > (this.d.limiteMs ?? LIMITE_ARMADO_MS)) {
      await this.d.cortar(en.pid)
      return this.terminar(ruta, en.commit, 'falla', 'Tardó más de 10 minutos y se cortó.')
    }
    return a
  }

  /**
   * Si ese proceso es el armado y no otro programa con el mismo número (después de reiniciar la PC): uno lanzado en
   * esta sesión lo es; uno anotado de antes, si arrancó antes de anotarlo. Sin saberlo, se lo da por bueno.
   */
  private async esElArmado(pid: number, desde: number): Promise<boolean> {
    if (this.propios.has(pid) || !this.d.inicio) return true
    const inicio = await this.d.inicio(pid)
    if (inicio !== null && inicio > desde + HOLGURA_INICIO_MS) return false
    this.propios.add(pid)
    return true
  }

  /** Cuánto corrió el armado con Iridium mirando: lo de la PC dormida o Iridium cerrada no cuenta. */
  private corrio(pid: number): number {
    const ahora = this.d.ahora()
    const c = this.corrido.get(pid) ?? { ultima: ahora, ms: 0 }
    c.ms += Math.min(Math.max(ahora - c.ultima, 0), SALTO_MAXIMO_MS)
    c.ultima = ahora
    this.corrido.set(pid, c)
    return c.ms
  }

  private async terminar(
    ruta: string,
    commit: string | null,
    resultado: ResultadoArmado,
    motivo?: string,
    reintentar?: true,
  ): Promise<ArmadoProyecto> {
    const ultimo: UltimoArmado = {
      cuando: this.d.ahora(),
      commit,
      resultado,
      ...(motivo ? { motivo } : {}),
      ...(reintentar ? { reintentar } : {}),
    }
    const en = (await this.d.archivo.de(ruta)).enCurso
    if (en) {
      this.corrido.delete(en.pid)
      this.propios.delete(en.pid)
    }
    const cambio: Partial<ArmadoProyecto> = { enCurso: null, ultimo }
    if (resultado === 'ok') cambio.commit = commit
    const nuevo = await this.d.archivo.cambiar(ruta, cambio)
    this.d.registrar(`Abrir: ${ruta} terminó de armar: ${resultado}${motivo ? ` — ${motivo}` : ''}`)
    this.d.alTerminar?.(ruta, ultimo)
    const esperan = this.esperando.get(ruta) ?? []
    this.esperando.delete(ruta)
    for (const listo of esperan) listo(resultado)
    // Terminó uno: el siguiente no espera al próximo minuto.
    this.otraVez = true
    return nuevo
  }

  private async publicar(
    planes: Map<string, PlanArmado>,
    commits: Map<string, string | null>,
    apagados: readonly string[],
  ): Promise<void> {
    const estados: Record<string, ActualizacionProyecto> = {}
    for (const ruta of planes.keys()) {
      const a = await this.d.archivo.de(ruta)
      const commit = commits.get(ruta) ?? null
      estados[ruta] = {
        prendida: !apagados.some((x) => igual(x, ruta)),
        armando: a.enCurso?.desde ?? null,
        ultimo: a.ultimo
          ? { cuando: a.ultimo.cuando, resultado: a.ultimo.resultado, motivo: a.ultimo.motivo ?? null }
          : null,
        fallo:
          a.enCurso === null &&
          a.ultimo?.resultado === 'falla' &&
          !a.ultimo.reintentar &&
          a.ultimo.commit === commit,
      }
    }
    // Lo pedido a un proyecto que ya no se arma solo (se borró la marca) no queda esperando.
    for (const [ruta, esperan] of this.esperando)
      if (!planes.has(ruta)) {
        this.esperando.delete(ruta)
        for (const listo of esperan) listo('falla')
      }
    if (JSON.stringify(estados) === JSON.stringify(this.estados)) return
    this.estados = estados
    this.d.alCambio(estados)
  }
}

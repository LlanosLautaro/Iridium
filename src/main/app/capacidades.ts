// Ajustes › Capacidades (frente Paridad, segunda parte, T-28; D-189): lo que tiene la IA en las sesiones de Iridium,
// con lo apagado en Iridium, y Conectar. Se le pide al motor cada vez que se abre la sección, sin gastar; mientras
// tanto, la sección muestra la última lista que se supo (Q-287: pedirla tarda unos segundos), guardada en disco. Y
// usar la PC (PA-I6, D-189 › 5 y 6): si está Windows-MCP e Instalar, en la consola de abajo, una vez.
import type { CapacidadesSesion, VistaCapacidades } from '../../compartido/capacidades'
import type { PcEnLaPc } from '../infra/capacidades'
import type { Motor } from '../motor/motor'

/** Instalar uv, si falta (D-189 › 6): con winget, que ya trae Windows. */
export const INSTALAR_UV =
  'winget install --id astral-sh.uv -e --accept-source-agreements --accept-package-agreements'

/**
 * Instalar Windows-MCP como herramienta con uv (D-189 › 6), que baja el Python que pide sin tocar el de la PC. Con
 * `uvx` el primer arranque pasaba los 30 s que espera Claude Code.
 */
export function instalarWindowsMcp(uv: string): string {
  return `"${uv}" tool install windows-mcp`
}

export interface DependenciasCapacidades {
  motor: Motor
  /** Los conectores apagados en Iridium (`config.json` › `capacidades.conectoresApagados`). */
  apagados: () => Promise<string[]>
  anotar?: (texto: string) => void
  /** La última lista que se supo (`capacidades.json`), para mostrarla al abrir mientras llega la nueva (Q-287). */
  guardada?: {
    leer(): Promise<CapacidadesSesion | null>
    guardar(lista: CapacidadesSesion): Promise<void>
  }
  /** La PC (D-189 › 5 y 6): buscar Windows-MCP y uv, y correr una instalación en la consola de abajo hasta que termine. */
  pc?: {
    buscar(): Promise<PcEnLaPc>
    consola(nombre: string, comando: string): Promise<void>
  }
}

export class Capacidades {
  /** Los conectores de la última lista: Conectar acepta solo uno de ellos (nada que llegue de la ventana va suelto). */
  private conocidos = new Set<string>()
  private pidiendo: Promise<VistaCapacidades> | null = null
  private ultima: CapacidadesSesion | null = null
  private instalando: Promise<boolean> | null = null

  constructor(private readonly d: DependenciasCapacidades) {}

  /** Si el motor dice sus complementos y conectores: sin eso, la sección no aparece (PA-6). */
  disponible(): boolean {
    return this.d.motor.capacidades().conectores
  }

  /** La última lista que se supo, con lo apagado ahora; null si nunca se supo (Q-287). No abre Claude Code. */
  async guardada(): Promise<VistaCapacidades | null> {
    if (!this.disponible()) return null
    this.ultima ??= (await this.d.guardada?.leer().catch(() => null)) ?? null
    if (!this.ultima) return null
    // Conectar se puede tocar con la guardada a la vista, antes de que llegue la nueva (paso 8 de Capacidades).
    if (this.conocidos.size === 0) this.conocidos = new Set(this.ultima.conectores.map((c) => c.nombre))
    const apagados = await this.d.apagados().catch((): string[] => [])
    return this.conApagados(this.ultima, apagados)
  }

  private conApagados(sesion: CapacidadesSesion, apagados: string[]): VistaCapacidades {
    return {
      tipo: 'ok',
      complementos: sesion.complementos,
      conectores: sesion.conectores.map((c) => ({ ...c, apagado: apagados.includes(c.nombre) })),
    }
  }

  /** Lo que tiene la IA, con lo apagado en Iridium; `error` si el motor no lo pudo decir. */
  vista(): Promise<VistaCapacidades> {
    this.pidiendo ??= this.pedir().finally(() => {
      this.pidiendo = null
    })
    return this.pidiendo
  }

  private async pedir(): Promise<VistaCapacidades> {
    if (!this.disponible()) return { tipo: 'error' }
    try {
      const [sesion, apagados] = await Promise.all([
        this.d.motor.capacidadesSesion(),
        this.d.apagados().catch((): string[] => []),
      ])
      this.conocidos = new Set(sesion.conectores.map((c) => c.nombre))
      this.ultima = sesion
      await this.d.guardada?.guardar(sesion).catch((e) => {
        this.d.anotar?.(`Capacidades: no se pudo guardar la lista (${e instanceof Error ? e.message : e})`)
      })
      return this.conApagados(sesion, apagados)
    } catch (e) {
      this.d.anotar?.(`Capacidades: no se pudo saber qué tiene la IA (${e instanceof Error ? e.message : e})`)
      return { tipo: 'error' }
    }
  }

  /** Conectar (PA-8): la consola con el inicio de sesión del conector; al terminar, la lista de nuevo. */
  async conectar(nombre: string): Promise<VistaCapacidades> {
    if (!this.conocidos.has(nombre)) throw new Error(`No es un conector de la lista: ${nombre}`)
    this.d.anotar?.(`Capacidades: conectar ${nombre}`)
    try {
      await this.d.motor.conectar(nombre)
    } catch (e) {
      this.d.anotar?.(`Capacidades: no se pudo abrir la consola (${e instanceof Error ? e.message : e})`)
    }
    // Una lista nueva, no la que se estaba pidiendo antes de conectar.
    return this.pedir()
  }

  /** Si Windows-MCP está instalado (la fila de la PC). */
  async pcInstalada(): Promise<boolean> {
    const b = await this.d.pc?.buscar().catch(() => null)
    return Boolean(b?.ejecutable)
  }

  /**
   * Instalar (D-189 › 6): uv con winget si falta y después Windows-MCP, cada uno en su consola, uno detrás del otro. Solo
   * esos dos comandos fijos; dice si al final quedó instalado.
   */
  instalarPc(): Promise<boolean> {
    this.instalando ??= this.instalar().finally(() => {
      this.instalando = null
    })
    return this.instalando
  }

  private async instalar(): Promise<boolean> {
    const pc = this.d.pc
    if (!pc) return false
    try {
      let b = await pc.buscar()
      if (b.ejecutable) return true
      if (!b.uv) {
        this.d.anotar?.('Capacidades: instalar uv')
        await pc.consola('Instalar uv', INSTALAR_UV)
        b = await pc.buscar()
        if (!b.uv) {
          this.d.anotar?.('Capacidades: uv no quedó instalado')
          return false
        }
      }
      this.d.anotar?.('Capacidades: instalar Windows-MCP')
      await pc.consola('Instalar Windows-MCP', instalarWindowsMcp(b.uv))
      const listo = Boolean((await pc.buscar()).ejecutable)
      if (!listo) this.d.anotar?.('Capacidades: Windows-MCP no quedó instalado')
      return listo
    } catch (e) {
      this.d.anotar?.(`Capacidades: no se pudo instalar Windows-MCP (${e instanceof Error ? e.message : e})`)
      return false
    }
  }
}

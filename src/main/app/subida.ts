// Subir solas las respuestas (T-89, D-202): al responder una `Q-n` desde Iridium, la respuesta va en un commit y se
// sube, para que la otra PC la vea sin tocar Commit y subir. Espera unos segundos para juntar las que se responden
// seguidas en un solo commit, no toca un proyecto donde trabaja la IA o que se está armando, y lo que no pudo subir
// (sin conexión, GitHub con commits que no se ponen encima, la IA trabajando) lo reintenta más tarde y al terminar
// el turno de la IA. Si la IA ya la guardó en su commit, no queda nada que hacer.
import type { SubidaRespuestas } from '../infra/sincronia'

/** Lo que espera después de una respuesta, por si viene otra. */
export const JUNTAR_MS = 8_000
/** Cada cuánto reintenta lo que no pudo subir. */
export const REINTENTAR_MS = 5 * 60_000

export interface DependenciasSubida {
  /** Hace el commit de esas respuestas y lo sube. */
  subir(ruta: string, codigos: readonly string[]): Promise<SubidaRespuestas>
  /** La IA trabaja en el proyecto o se está armando: no se toca. */
  ocupado(ruta: string): Promise<boolean>
  registrar(texto: string): void
  /** Se hizo un commit: lo que muestra Git cambió (y, si subió, quedó al día con GitHub). */
  alSubir?(ruta: string, subio: boolean): void
}

export class SubidaDeRespuestas {
  /** Las respuestas por subir de cada proyecto. */
  private porSubir = new Map<string, Set<string>>()
  private relojes = new Map<string, ReturnType<typeof setTimeout>>()
  private subiendo = new Set<string>()
  private cerrado = false

  constructor(
    private readonly d: DependenciasSubida,
    private readonly juntarMs = JUNTAR_MS,
    private readonly reintentarMs = REINTENTAR_MS,
  ) {}

  /** Se guardó la respuesta a `codigo`: se sube dentro de unos segundos, con las que lleguen mientras. */
  anotar(ruta: string, codigo: string): void {
    if (this.cerrado) return
    this.sumar(ruta, codigo)
    if (!this.subiendo.has(ruta)) this.programar(ruta, this.juntarMs)
  }

  /** Terminó el turno de la IA en ese proyecto: si quedó algo por subir, se prueba enseguida. */
  reintentar(ruta: string): void {
    if (this.porSubir.has(ruta)) this.programar(ruta, this.juntarMs)
  }

  /** Lo que queda por subir de un proyecto (para las pruebas y el registro). */
  pendientes(ruta: string): string[] {
    return [...(this.porSubir.get(ruta) ?? [])]
  }

  /** Sube ya lo de un proyecto (lo que hace el reloj). */
  async ahora(ruta: string): Promise<void> {
    this.quitarReloj(ruta)
    const qs = this.porSubir.get(ruta)
    if (this.cerrado || !qs || qs.size === 0) return
    if (this.subiendo.has(ruta)) return
    if (await this.d.ocupado(ruta)) return this.programar(ruta, this.reintentarMs)
    // Se toman: las que lleguen mientras sube (una nueva o una corregida) quedan para la vuelta siguiente.
    const codigos = [...qs]
    this.porSubir.delete(ruta)
    this.subiendo.add(ruta)
    let devolver = false
    try {
      const r = await this.d.subir(ruta, codigos)
      if (r.resultado === 'subida' || r.resultado === 'sin-subir') {
        const como = r.resultado === 'subida' ? 'subido' : `sin subir: ${r.motivo}`
        this.d.registrar(`Subir respuestas: ${ruta} — «${r.mensaje}» ${como}`)
        this.d.alSubir?.(ruta, r.resultado === 'subida')
      } else if (r.resultado === 'esperar') {
        this.d.registrar(`Subir respuestas: ${ruta} — se reintenta más tarde: ${r.motivo}`)
        devolver = true
      }
    } catch (e) {
      this.d.registrar(`Subir respuestas: ${ruta} — ${e instanceof Error ? e.message : e}`)
      devolver = true
    } finally {
      this.subiendo.delete(ruta)
    }
    const llegaron = this.porSubir.has(ruta)
    if (devolver) for (const q of codigos) this.sumar(ruta, q)
    if (llegaron) this.programar(ruta, this.juntarMs)
    else if (devolver) this.programar(ruta, this.reintentarMs)
  }

  /** Al cerrar Iridium: sube ya lo que estaba esperando juntarse. */
  async subirTodo(): Promise<void> {
    await Promise.all([...this.porSubir.keys()].map((r) => this.ahora(r)))
  }

  cerrar(): void {
    this.cerrado = true
    for (const r of this.relojes.values()) clearTimeout(r)
    this.relojes.clear()
  }

  private sumar(ruta: string, codigo: string): void {
    const qs = this.porSubir.get(ruta) ?? new Set<string>()
    qs.add(codigo)
    this.porSubir.set(ruta, qs)
  }

  private programar(ruta: string, ms: number): void {
    if (this.cerrado) return
    this.quitarReloj(ruta)
    this.relojes.set(
      ruta,
      setTimeout(() => void this.ahora(ruta), ms),
    )
  }

  private quitarReloj(ruta: string): void {
    const r = this.relojes.get(ruta)
    if (r) clearTimeout(r)
    this.relojes.delete(ruta)
  }
}

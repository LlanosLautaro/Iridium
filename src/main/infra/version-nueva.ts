// La versión nueva lista (CO-I2, modulos/compartir/diseno-tecnico.md › Versión nueva lista): `tools/actualizar.ps1`
// la arma en `release\nueva` y la marca con `lista.json`; Iridium la ve y, al cerrarse, lanza el ayudante que cambia
// las carpetas (`tools/cambiar-version.ps1`).
import { copyFile, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import type { VersionNueva } from '../../compartido/puente'
import {
  comandoPowershell,
  lanzarSuelto,
  lanzarVentana,
  type VentanaActualizando,
} from './ventana-actualizando'

/** Cada cuánto se mira si apareció o se fue la versión nueva: un `stat`, nada más. */
const CADA_MS = 5000

/** Lee `nueva/lista.json` de la carpeta `release`; null si no hay una versión lista (o está a medio armar). */
export async function leerVersionNueva(release: string): Promise<VersionNueva | null> {
  const nueva = join(release, 'nueva')
  try {
    await stat(join(nueva, 'win-unpacked', 'Iridium.exe'))
    const datos = JSON.parse((await readFile(join(nueva, 'lista.json'), 'utf8')).replace(/^﻿/, ''))
    if (typeof datos.fecha !== 'string' || typeof datos.commit !== 'string') return null
    return {
      fecha: datos.fecha,
      commit: datos.commit,
      mensaje: typeof datos.mensaje === 'string' ? datos.mensaje : '',
      sinGuardar: datos.sinGuardar === true,
      noEntro: await leerNoEntro(nueva),
    }
  } catch {
    return null
  }
}

/** `nueva/no-entro.json`: lo deja el ayudante cuando no pudo poner la versión (Defecto 3); null si no está o se rompió. */
async function leerNoEntro(nueva: string): Promise<VersionNueva['noEntro']> {
  try {
    const d = JSON.parse((await readFile(join(nueva, 'no-entro.json'), 'utf8')).replace(/^﻿/, ''))
    return typeof d.fecha === 'string' && typeof d.motivo === 'string'
      ? { fecha: d.fecha, motivo: d.motivo }
      : null
  } catch {
    return null
  }
}

export class VigiaVersionNueva {
  private actual: VersionNueva | null = null
  private reloj: ReturnType<typeof setInterval> | null = null

  /**
   * @param release la carpeta `release` (la de `win-unpacked`, la app de uso diario).
   * @param ayudante `cambiar-version.ps1`: en la app armada, el de sus recursos.
   */
  constructor(
    private readonly release: string,
    private readonly ayudante: string,
    private readonly temporal: string,
    /** La ventanita «Actualizando Iridium…» (T-128); sin ella, el cambio no se ve. */
    private readonly ventana?: VentanaActualizando,
  ) {}

  ultima(): VersionNueva | null {
    return this.actual
  }

  /** Mira ya y después cada pocos segundos; avisa solo cuando cambia. */
  vigilar(alCambiar: (v: VersionNueva | null) => void): void {
    const mirar = async () => {
      const v = await leerVersionNueva(this.release)
      if (JSON.stringify(v) === JSON.stringify(this.actual)) return
      this.actual = v
      alCambiar(v)
    }
    void mirar()
    this.reloj = setInterval(() => void mirar(), CADA_MS)
  }

  cerrar(): void {
    if (this.reloj) clearInterval(this.reloj)
    this.reloj = null
  }

  /**
   * Al cerrarse Iridium: si hay una versión lista, lanza el ayudante suelto (sigue vivo después de Iridium) desde una
   * copia en la carpeta temporal, porque el suyo se va con la versión vieja. Con `abrir`, la vuelve a abrir. Antes, la
   * ventanita que muestra cómo va (T-128): si no arranca, la versión se pone igual.
   */
  async ponerAlCerrar(abrir: boolean): Promise<boolean> {
    if (!(await leerVersionNueva(this.release))) return false
    const estado = join(this.temporal, `iridium-actualizando-${process.pid}.json`)
    let conVentana = false
    if (this.ventana) {
      try {
        await lanzarVentana(this.ventana, {
          temporal: this.temporal,
          carpeta: join(this.release, 'win-unpacked'),
          abrir,
          version: await numeroDeLaLista(this.release),
          estado,
        })
        conVentana = true
      } catch {
        // Sin ventanita: el cambio corre callado, como antes.
      }
    }
    const copia = join(this.temporal, 'iridium-cambiar-version.ps1')
    await copyFile(this.ayudante, copia)
    await lanzarSuelto(
      comandoPowershell(copia, [
        `-Release "${this.release}"`,
        `-Iridium ${process.pid}`,
        abrir && '-Abrir',
        conVentana && `-Estado "${estado}"`,
      ]),
      this.temporal,
    )
    return true
  }
}

/** El número de la versión lista (`version` de `lista.json`, D-182), para la ventanita; las armadas antes no lo traen. */
async function numeroDeLaLista(release: string): Promise<string | undefined> {
  try {
    const datos = JSON.parse((await readFile(join(release, 'nueva', 'lista.json'), 'utf8')).replace(/^﻿/, ''))
    return typeof datos.version === 'string' ? datos.version : undefined
  } catch {
    return undefined
  }
}

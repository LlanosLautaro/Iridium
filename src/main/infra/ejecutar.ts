// Ejecutar un script de `docs/scripts.md` (C-11, D-043): un comando corre en una consola adentro de Iridium (T-116,
// D-184), que queda para leer lo que pasó; sin ella (la pieza no cargó), en una ventana de consola propia, como antes.
// Un archivo o una carpeta se abre con Windows.
import { spawn } from 'node:child_process'
import type { PlanScript } from '../app/visor'
import type { PedidoConsola } from './consolas'

/** Abre un archivo o una carpeta con su programa; devuelve el error o '' (como `shell.openPath` de Electron). */
export type AbrirConWindows = (ruta: string) => Promise<string>

/** Abre una dirección `http(s)://` en el navegador (como `shell.openExternal`). */
export type AbrirEnNavegador = (direccion: string) => Promise<void>

/** Las consolas adentro (T-116): de qué proyecto es y cómo se abre una. */
export interface EnConsola {
  proyecto: string
  abrir(p: PedidoConsola): unknown
}

export async function ejecutarPlan(
  plan: PlanScript,
  abrir: AbrirConWindows,
  navegador?: AbrirEnNavegador,
  consola?: EnConsola,
): Promise<{ tipo: 'ok'; mensaje: string } | { tipo: 'error'; mensaje: string }> {
  if (plan.tipo === 'error') return plan
  if (plan.tipo === 'web') {
    if (!navegador) return { tipo: 'error', mensaje: 'No se puede abrir el navegador desde acá.' }
    try {
      await navegador(plan.direccion)
      return { tipo: 'ok', mensaje: 'Abierto en el navegador.' }
    } catch (e) {
      return {
        tipo: 'error',
        mensaje: `No se pudo abrir el navegador: ${e instanceof Error ? e.message : String(e)}`,
      }
    }
  }
  if (plan.tipo === 'sistema') {
    const error = await abrir(plan.ruta)
    if (error) return { tipo: 'error', mensaje: `Windows no lo pudo abrir: ${error}` }
    return { tipo: 'ok', mensaje: plan.modo === 'abrir' ? 'Abierto.' : 'Lanzado.' }
  }
  if (consola) {
    try {
      consola.abrir({ nombre: plan.nombre, proyecto: consola.proyecto, cwd: plan.cwd, comando: plan.comando })
      return { tipo: 'ok', mensaje: 'Corriendo en la consola de abajo.' }
    } catch (e) {
      return {
        tipo: 'error',
        mensaje: `No se pudo abrir la consola: ${e instanceof Error ? e.message : String(e)}`,
      }
    }
  }
  // La consola hereda el entorno de Iridium menos lo de Electron: con ELECTRON_RUN_AS_NODE, `pnpm dev` no abre la app.
  const env = { ...process.env }
  delete env.ELECTRON_RUN_AS_NODE
  // Con IRIDIUM_OCULTA (las pruebas, D-072) la consola corre escondida y se cierra al terminar.
  const oculta = process.env.IRIDIUM_OCULTA === '1'
  try {
    await new Promise<void>((listo, fallo) => {
      // `/s /k "…"`: cmd quita solo las comillas de afuera y deja el comando tal cual está escrito.
      const consola = spawn('cmd.exe', ['/d', '/s', oculta ? '/c' : '/k', `"${plan.comando}"`], {
        cwd: plan.cwd,
        env,
        detached: true,
        stdio: 'ignore',
        windowsHide: oculta,
        windowsVerbatimArguments: true,
      })
      consola.once('error', fallo)
      consola.once('spawn', () => {
        consola.unref()
        listo()
      })
    })
    return { tipo: 'ok', mensaje: 'Corriendo en una ventana de consola.' }
  } catch (e) {
    return {
      tipo: 'error',
      mensaje: `No se pudo abrir la consola: ${e instanceof Error ? e.message : String(e)}`,
    }
  }
}

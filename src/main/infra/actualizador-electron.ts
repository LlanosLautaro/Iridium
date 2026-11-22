// electron-updater para `Actualizador` (D-171): baja solo, sin instalador web, y pone la versión bajada al salir.
// Con IRIDIUM_ACTUALIZAR_DESDE, las versiones salen de esa dirección (un servidor de prueba) en vez de GitHub.
import updater from 'electron-updater'
import type { Actualizable, InfoBajada } from './actualizador'

export function actualizableElectron(anotar: (texto: string) => void): Actualizable {
  const { autoUpdater } = updater
  const decir = (t: unknown) => anotar(`Actualizaciones: ${String(t).split('\n')[0]}`)
  autoUpdater.logger = { info: decir, warn: decir, error: decir, debug: () => {} }
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.disableWebInstaller = true
  // El servidor de prueba responde de a un rango por pedido.
  if (process.env.IRIDIUM_ACTUALIZAR_DESDE)
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: process.env.IRIDIUM_ACTUALIZAR_DESDE,
      useMultipleRangeRequest: false,
    })
  // Un error de una vuelta también llega como evento: sin escucharlo, Node lo tomaría como no atendido.
  autoUpdater.on('error', () => {})
  return {
    // La bajada termina después de mirar: se espera acá, así una que falla llega a quien mira.
    buscar: async () => {
      const r = await autoUpdater.checkForUpdates()
      await r?.downloadPromise
    },
    instalarYSalir: (abrir) => autoUpdater.quitAndInstall(true, abrir),
    alBajar: (f) => {
      autoUpdater.on('update-downloaded', (info) => f(info as InfoBajada))
    },
  }
}

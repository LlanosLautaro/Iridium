// electron-updater para `Actualizador` (D-171): baja solo, sin instalador web, y pone la versión bajada al salir.
// Con `desde` (la PC donde se arma, D-198: `release/instalador` servido por Iridium) o IRIDIUM_ACTUALIZAR_DESDE (un
// servidor de prueba), las versiones salen de esa dirección en vez de GitHub.
import updater from 'electron-updater'
import type { Actualizable, InfoBajada } from './actualizador'

export function actualizableElectron(anotar: (texto: string) => void, desde?: string): Actualizable {
  const { autoUpdater } = updater
  const decir = (t: unknown) => anotar(`Actualizaciones: ${String(t).split('\n')[0]}`)
  autoUpdater.logger = { info: decir, warn: decir, error: decir, debug: () => {} }
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.disableWebInstaller = true
  // Los servidores locales responden de a un rango por pedido.
  const url = desde ?? process.env.IRIDIUM_ACTUALIZAR_DESDE
  if (url) autoUpdater.setFeedURL({ provider: 'generic', url, useMultipleRangeRequest: false })
  // En la PC donde se arma, «Volver a la versión anterior» (D-078) arma un número más bajo: también entra.
  if (desde) autoUpdater.allowDowngrade = true
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

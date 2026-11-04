// Preload del service worker de la extensión de la Revisión en Electron (ayudante.mjs): le da la captura y la carpeta
// de la app. Electron lo pone en todos los service workers de la sesión, pero el proceso principal solo le contesta al
// de la extensión: a los de la app, `invoke` les falla.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('iridiumElectron', {
  capturar: (idPestana, rect) => ipcRenderer.invoke('iridium-revision:capturar', idPestana, rect),
  carpeta: () => ipcRenderer.invoke('iridium-revision:carpeta'),
})

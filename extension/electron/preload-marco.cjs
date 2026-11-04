// Preload de las páginas de una app Electron con interfaz propia (ayudante.mjs › esquemas): deja el puente en el mundo
// aislado de la Revisión, que solo usa el selector que mete el ayudante. La página y su preload no lo ven. El mundo tiene
// su propia política de contenido, para que la de la app no bloquee los estilos de la capa.
const { contextBridge, ipcRenderer, webFrame } = require('electron')

const MUNDO = 1047

try {
  webFrame.setIsolatedWorldInfo(MUNDO, {
    name: 'Iridium · Revisión',
    securityOrigin: window.location.origin,
    csp: "default-src 'none'; style-src 'unsafe-inline'; font-src data: blob:",
  })
  contextBridge.exposeInIsolatedWorld(MUNDO, 'iridiumPuente', {
    pedir: (p) => ipcRenderer.invoke('iridium-revision:pedir', p),
    leer: (clave) => ipcRenderer.invoke('iridium-revision:leer', clave),
    guardar: (datos) => ipcRenderer.invoke('iridium-revision:guardar', datos),
    borrar: (clave) => ipcRenderer.invoke('iridium-revision:borrar', clave),
    fuente: (archivo) => ipcRenderer.invoke('iridium-revision:fuente', archivo),
  })
} catch {
  // Sin el puente, el ayudante no mete el selector: la página sigue como si nada.
}

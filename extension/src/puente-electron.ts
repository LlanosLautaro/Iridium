// En una interfaz propia de una app Electron (`mi-app://`, por ejemplo) no entra la extensión: los `matches` de un
// manifiesto no alcanzan esquemas propios. El ayudante mete el selector en un mundo aislado propio y le da este
// reemplazo de lo poco de `chrome.*` que usa, sobre el puente que deja `preload-marco.cjs`: los pedidos los atiende el
// proceso principal de la app, que habla con Iridium (modulos/revision/diseno-tecnico.md › Ayudante de Electron).
// Tiene que evaluarse antes que el selector: `inyectado.ts` lo importa primero.

interface Puente {
  pedir(p: unknown): Promise<unknown>
  leer(clave: string): Promise<unknown>
  guardar(datos: Record<string, unknown>): Promise<void>
  borrar(clave: string): Promise<void>
  fuente(archivo: string): Promise<Uint8Array<ArrayBuffer> | null>
}

const g = globalThis as unknown as {
  iridiumPuente: Puente
  iridiumOpciones?: { version?: string }
  iridiumFuente?: (archivo: string) => Promise<BufferSource>
  iridiumApagar?: () => void
  iridiumPrender?: () => void
}
const puente = g.iridiumPuente
const oyentes: ((mensaje: unknown) => unknown)[] = []
let apagada = false

const reemplazo = {
  runtime: {
    sendMessage: (mensaje: unknown) => puente.pedir(mensaje),
    getURL: (ruta: string) => ruta,
    getManifest: () => ({ version: g.iridiumOpciones?.version ?? '' }),
    onMessage: { addListener: (f: (mensaje: unknown) => unknown) => void oyentes.push(f) },
  },
  storage: {
    local: {
      get: async (clave: string) => ({ [clave]: await puente.leer(clave) }),
      set: (datos: Record<string, unknown>) => puente.guardar(datos),
      remove: (clave: string) => puente.borrar(clave),
    },
  },
}
Object.defineProperty(globalThis, 'chrome', { value: reemplazo, configurable: true, writable: true })

g.iridiumFuente = async (archivo) => {
  const datos = await puente.fuente(archivo)
  if (!datos) throw new Error('sin la letra')
  return datos
}

// Apagada desde la app: F8 deja de hacer algo (este oyente va antes que el del selector) y se sale del modo comentar.
window.addEventListener(
  'keydown',
  (e) => {
    if (apagada && e.key === 'F8') e.stopImmediatePropagation()
  },
  true,
)
g.iridiumApagar = () => {
  apagada = true
  for (const f of oyentes) f({ tipo: 'salir' })
}
g.iridiumPrender = () => {
  apagada = false
}

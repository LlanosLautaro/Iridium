// Corre con el Electron del repo como Node (ELECTRON_RUN_AS_NODE): lista una versión con `app.asar` con las funciones
// de las piezas y la borra; lista otra igual con el `fs` de Electron, que deja el `.asar` abierto y ya no se podría
// borrar (T-111). Imprime un JSON con lo que vio.
import { readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const [piezas, carpeta, otra] = process.argv.slice(2)
const { archivosDe, fsReal } = await import(pathToFileURL(piezas).href)
const conAsar = readdirSync(otra, { recursive: true, withFileTypes: true }).filter((e) => e.isFile()).length
const archivos = await archivosDe(carpeta)
await fsReal.promises.rm(carpeta, { recursive: true, force: true })
console.log(
  JSON.stringify({
    electron: Boolean(process.versions.electron),
    conAsar,
    archivos,
    borrada: !fsReal.existsSync(carpeta),
  }),
)

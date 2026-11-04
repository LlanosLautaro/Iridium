// Deja la extensión de la Revisión en su carpeta fija, la abre y copia su ruta para cargarla en Edge (scripts.md › Instalar
// la extensión de Revisión). Es lo mismo que hace Iridium al arrancar, para no depender de tener la última versión
// armada. Uso: pnpm extension
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { instalarExtension } from '../src/main/infra/revision/extension.ts'

const destino = join(process.env.APPDATA ?? '', 'Centro de Desarrollo', 'extension')
const copio = await instalarExtension(join(process.cwd(), 'out', 'extension'), destino)
console.log(copio ? `Extensión copiada a ${destino}` : `La extensión ya estaba al día en ${destino}`)

// La ruta queda copiada para pegarla en «Cargar descomprimida».
const portapapeles = spawn('clip', { stdio: ['pipe', 'ignore', 'ignore'] })
portapapeles.stdin.end(destino)
spawn('explorer', [destino], { detached: true, stdio: 'ignore' }).unref()
console.log('')
// Edge no deja abrir sus páginas internas desde un comando: la dirección se escribe a mano.
console.log('En Edge, escribí edge://extensions en la barra de direcciones, prendé «Modo de desarrollador»,')
console.log('tocá «Cargar descomprimida»')
console.log('y pegá la ruta (ya está copiada) o elegí la carpeta que se abrió.')
console.log('Si ya estaba cargada, tocá «Recargar» en la tarjeta de la extensión.')

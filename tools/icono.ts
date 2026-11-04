// Arma build/icon.png (256 px, esquinas redondeadas) desde el ícono del proyecto, dibujándolo en la ventana de la app.
// Uso: pnpm build && node --experimental-strip-types tools/icono.ts
/// <reference lib="dom" />
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { _electron as electron } from '@playwright/test'

const svg = await readFile('.proyecto-icono.svg', 'utf8')
const env = { ...process.env, IRIDIUM_MOTOR: 'falso' } as Record<string, string>
delete env.ELECTRON_RUN_AS_NODE
env.IRIDIUM_DATOS = await mkdtemp(join(tmpdir(), 'iridium-icono-'))
env.IRIDIUM_OCULTA = '1'
const app = await electron.launch({ args: ['.'], env })
const win = await app.firstWindow()
const base64 = await win.evaluate(async (texto) => {
  const img = new Image()
  img.src = `data:image/svg+xml;base64,${btoa(texto)}`
  await img.decode()
  const lienzo = document.createElement('canvas')
  lienzo.width = lienzo.height = 256
  const c = lienzo.getContext('2d')
  if (!c) throw new Error('sin canvas')
  c.beginPath()
  c.roundRect(0, 0, 256, 256, 48)
  c.clip()
  c.drawImage(img, 0, 0, 256, 256)
  return lienzo.toDataURL('image/png').split(',')[1] ?? ''
}, svg)
await writeFile('build/icon.png', Buffer.from(base64, 'base64'))
await app.close()
console.log('build/icon.png listo')

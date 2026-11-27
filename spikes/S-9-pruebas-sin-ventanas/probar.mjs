import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
const repo = process.argv[2]
const req = createRequire(repo + '/package.json')
const { _electron } = req('@playwright/test')
const exe = req('electron')
const ventanas = () => execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'ventanas.ps1']).toString().trim()
const pausa = (ms) => new Promise((r) => setTimeout(r, ms))
for (const [nombre, env] of [['sin receta', {}], ['receta a medias (solo fuera de la pantalla)', { MUESTRA_OCULTA: '1', MUESTRA_PARCIAL: '1' }], ['receta completa', { MUESTRA_OCULTA: '1' }]]) {
  const t0 = Date.now()
  const app = await _electron.launch({ executablePath: exe, args: ['main.mjs'], env: { ...process.env, ...env } })
  const p = await app.firstWindow(); await p.waitForSelector('#n'); await pausa(Number(process.env.ESPERA ?? 1500)); console.log(ventanas())
  const info = await app.evaluate(({ BrowserWindow }) => { const w = BrowserWindow.getAllWindows()[0]; return { pos: w.getBounds(), foco: w.isFocused(), visible: w.isVisible() } })
  const a = Number(await p.textContent('#n')); await pausa(1000); const b = Number(await p.textContent('#n'))
  const img = await p.screenshot(); 
  const mira = ventanas()
  console.log(`\n== ${nombre}\nposición ${info.pos.x},${info.pos.y} · foco ${info.foco} · captura ${img.length} bytes · contador en 1 s: ${b - a}\nventanas a la vista (y la de adelante):\n${mira}`)
  await p.screenshot({ path: `captura-${nombre.split(' ')[0]}-${Object.keys(env).length}.png` })
  await app.close(); await pausa(500)
}

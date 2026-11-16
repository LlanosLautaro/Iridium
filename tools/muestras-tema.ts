// Muestras de temas sobrios (módulo Apariencia): abre la app compilada con los proyectos reales (solo lectura),
// le cambia los tokens de docs/ui/tokens.css sin tocar el código y saca la misma vista con cada tema en
// docs/ui/alternativas/temas/. Uso: pnpm build && node --experimental-strip-types tools/muestras-tema.ts [prefijos]
import { mkdir, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { _electron as electron, type Page } from '@playwright/test'

const SALIDA = 'docs/ui/alternativas/temas'
await mkdir(SALIDA, { recursive: true })

// Lo común a los tres: letra del sistema, un poco más chica que Chakra Petch, esquinas algo más suaves.
const comun = `--ui: "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif; --tam-base: 13px; --tam-lectura: 14.5px; --tam-chico: 12px;
  --radio-control: 6px; --radio-fila: 6px; --radio-bloque: 8px; --radio-tarjeta: 10px;`

const temas: Record<string, string> = {
  // Como macOS y VS Code: grises neutros, un azul apagado solo para lo activo.
  'a-grafito': `--fondo: #1e1f22; --lateral: #19191c; --barra: #161618; --elevado: #26272b; --hover: #2c2d31;
  --caja: #222326; --medidor-fondo: #303135;
  --borde: #2b2c30; --borde-suave: #242528; --borde-fuerte: #3a3b40; --borde-control: #5a5c63;
  --texto: #e4e4e7; --texto-2: #a9aab1; --texto-3: #7d7e86;
  --primario: #6c9eff; --primario-texto: #8fb4ff; --trabaja: #6c9eff; --ok: #5fbf8a;
  --espera: #e0a84a; --espera-borde: #4a3d24; --espera-fondo: #2a2620;
  --error: #ef6a62; --sobre-color: #111214;
  --seleccion: #6c9eff40; --sel-fondo: #2a3550; --cod-cadena: #c9b27f;`,
  // Como Obsidian: gris un poco más frío, violeta suave para lo activo.
  'b-obsidiana': `--fondo: #1e1e1e; --lateral: #262626; --barra: #1a1a1a; --elevado: #2a2a2a; --hover: #303030;
  --caja: #242424; --medidor-fondo: #333333;
  --borde: #303030; --borde-suave: #2a2a2a; --borde-fuerte: #3f3f3f; --borde-control: #5c5c5c;
  --texto: #dadada; --texto-2: #a8a8a8; --texto-3: #7a7a7a;
  --primario: #9a8cf2; --primario-texto: #ab9ff5; --trabaja: #9a8cf2; --ok: #6cbf8b;
  --espera: #e3a857; --espera-borde: #4b3e28; --espera-fondo: #2b2620;
  --error: #ea6b66; --sobre-color: #141414;
  --seleccion: #9a8cf240; --sel-fondo: #34304d; --cod-cadena: #c7b27e;`,
  // Como Claude Desktop: grises cálidos, terracota para lo activo.
  'c-arcilla': `--fondo: #262624; --lateral: #1f1e1d; --barra: #1b1a19; --elevado: #30302e; --hover: #35342f;
  --caja: #2b2a27; --medidor-fondo: #3a3935;
  --borde: #34332f; --borde-suave: #2d2c29; --borde-fuerte: #45443f; --borde-control: #67655d;
  --texto: #ebe8df; --texto-2: #b5b1a6; --texto-3: #87837a;
  --primario: #d97757; --primario-texto: #e59577; --trabaja: #d97757; --ok: #7fb58a;
  --espera: #e3b04f; --espera-borde: #4d4128; --espera-fondo: #2f2b22;
  --error: #e8665e; --sobre-color: #1a1817;
  --seleccion: #d9775740; --sel-fondo: #45302a; --cod-cadena: #c9b27f;`,
  // Q-85: Grafito más oscuro, en tres escalones. Mismo texto y mismo azul; cambian los fondos y los bordes.
  'a1-grafito-noche': `--fondo: #161618; --lateral: #121214; --barra: #0f0f11; --elevado: #1d1e21; --hover: #232428;
  --caja: #19191c; --medidor-fondo: #2a2b2f;
  --borde: #242529; --borde-suave: #1d1e21; --borde-fuerte: #323338; --borde-control: #55575e;
  --espera: #e0a84a; --espera-borde: #43371f; --espera-fondo: #211e19;
  --seleccion: #6c9eff40; --sel-fondo: #222c42;
  --texto: #e4e4e7; --texto-2: #a9aab1; --texto-3: #7d7e86;
  --primario: #6c9eff; --primario-texto: #8fb4ff; --trabaja: #6c9eff; --ok: #5fbf8a;
  --error: #ef6a62; --sobre-color: #0b0b0c; --cod-cadena: #c9b27f;`,
  'a2-grafito-carbon': `--fondo: #111113; --lateral: #0d0d0f; --barra: #0a0a0b; --elevado: #18181b; --hover: #1e1e22;
  --caja: #141416; --medidor-fondo: #242428;
  --borde: #1f1f23; --borde-suave: #18181b; --borde-fuerte: #2d2d32; --borde-control: #50525a;
  --espera: #e0a84a; --espera-borde: #3e331d; --espera-fondo: #1b1915;
  --seleccion: #6c9eff40; --sel-fondo: #1d263a;
  --texto: #e4e4e7; --texto-2: #a9aab1; --texto-3: #7d7e86;
  --primario: #6c9eff; --primario-texto: #8fb4ff; --trabaja: #6c9eff; --ok: #5fbf8a;
  --error: #ef6a62; --sobre-color: #0b0b0c; --cod-cadena: #c9b27f;`,
  'a3-grafito-negro': `--fondo: #0b0b0c; --lateral: #080809; --barra: #060607; --elevado: #131315; --hover: #19191c;
  --caja: #0f0f11; --medidor-fondo: #1f1f22;
  --borde: #1a1a1d; --borde-suave: #131315; --borde-fuerte: #28282c; --borde-control: #4c4e55;
  --espera: #e0a84a; --espera-borde: #3a301b; --espera-fondo: #161411;
  --seleccion: #6c9eff40; --sel-fondo: #182033;
  --texto: #e4e4e7; --texto-2: #a9aab1; --texto-3: #7d7e86;
  --primario: #6c9eff; --primario-texto: #8fb4ff; --trabaja: #6c9eff; --ok: #5fbf8a;
  --error: #ef6a62; --sobre-color: #0b0b0c; --cod-cadena: #c9b27f;`,
}

const env = { ...process.env } as Record<string, string>
delete env.ELECTRON_RUN_AS_NODE
env.IRIDIUM_DATOS = await mkdtemp(join(tmpdir(), 'iridium-muestras-'))
env.IRIDIUM_OCULTA = '1'
const app = await electron.launch({ args: ['.'], env })
const win = await app.firstWindow()
await win.setViewportSize({ width: 1440, height: 900 })
await win.waitForSelector('.grilla:not(.carga) .tarjeta', { timeout: 60_000 })

const seccion = (w: Page, nombre: string) =>
  w.getByRole('navigation', { name: 'Secciones del proyecto' }).getByRole('button', { name: nombre }).click()

let estilo: Awaited<ReturnType<Page['addStyleTag']>> | null = null
const ponerTema = async (nombre: string | null) => {
  if (estilo) await estilo.evaluate((e) => (e as Element).remove())
  estilo = nombre ? await win.addStyleTag({ content: `:root { ${comun} ${temas[nombre]} }` }) : null
  await win.waitForTimeout(250)
}

// La misma tanda de vistas con cada tema, y con el actual para comparar. Con nombres como argumentos (por ejemplo
// `a1 a2`), solo los temas que empiezan así.
const pedidos = process.argv.slice(2)
const elegidos = ['actual', ...Object.keys(temas)].filter(
  (n) => pedidos.length === 0 || pedidos.some((x) => n.startsWith(x)),
)
for (const nombre of elegidos) {
  await ponerTema(nombre === 'actual' ? null : nombre)
  await win.keyboard.press('Control+1')
  await win.waitForSelector('.grilla:not(.carga) .tarjeta')
  await win.waitForTimeout(300)
  await win.screenshot({ path: `${SALIDA}/${nombre}-1-proyectos.png` })
  await win.click('.tarjeta[title^="Centro de Desarrollo"]')
  await win.waitForSelector('[data-seccion="pendientes"] .pendientes', { timeout: 30_000 })
  await win.waitForTimeout(500)
  await win.screenshot({ path: `${SALIDA}/${nombre}-2-proyecto.png` })
  await seccion(win, 'Mapa')
  await win.waitForSelector('[data-seccion="mapa"] .hito-mapa', { timeout: 30_000 })
  await win.waitForTimeout(400)
  await win.screenshot({ path: `${SALIDA}/${nombre}-3-mapa.png` })
  await seccion(win, 'Pendientes y scripts').catch(() => {})
  console.log('listo:', nombre)
}
await app.close()

// Hito 8, tanda 4 (08-calidad.md › Verificación de historias): recorre las historias y los flujos con la app abierta,
// el motor falso y una copia de la carpeta de proyectos, con una captura por paso. No gasta uso ni toca los proyectos reales.
// Lo que escribe en la copia (respuestas, las Q-n del motor falso) se deshace al final con git.
// Uso: node --experimental-strip-types tools/recorrido.ts <carpeta de proyectos copiada> [ruta del .exe; sin ella, la app de `pnpm build`]
// Deja las capturas y registro.json en tools/salida/tanda4/<app|armada>/.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type ElectronApplication, _electron as electron, type Page } from '@playwright/test'
import { elegirProyectos } from './proyectos-copia.ts'

const raiz = process.argv[2]
const exe = process.argv[3]
if (!raiz) throw new Error('Falta la carpeta de proyectos copiada.')
// Los proyectos se eligen por lo que tienen (D-082): A sin preguntas, B para trabajar, C con una prueba abierta.
const elegidos = elegirProyectos(raiz)
const IRIDIUM = elegidos.iridium
const A = elegidos.sinPreguntas
const B = elegidos.trabajo
const C = elegidos.conPrueba.nombre
const QC = elegidos.conPrueba.q
console.log('Proyectos de la copia:', JSON.stringify({ IRIDIUM, A, B, C, QC }))
const SALIDA = join('tools/salida/tanda4', exe ? 'armada' : 'app')
await rm(SALIDA, { recursive: true, force: true })
await mkdir(SALIDA, { recursive: true })

type Paso = { id: string; ok: boolean; datos?: unknown; error?: string }
const registro: Paso[] = []

// Lo que ya estaba cambiado en la copia no se toca al deshacer.
const git = (proy: string, ...args: string[]) =>
  execFileSync('git', ['-C', join(raiz, proy), ...args], { encoding: 'utf8' })
const sucios = (proy: string) =>
  existsSync(join(raiz, proy, '.git'))
    ? git(proy, 'status', '--porcelain', '-uall')
        .split('\n')
        .filter(Boolean)
        .map((l) => l.slice(3))
    : []
const TOCADOS = [...new Set([IRIDIUM, A, B, C])]
const antes = Object.fromEntries(TOCADOS.map((p) => [p, new Set(sucios(p))]))
// Los estado.md, tal cual (git checkout cambiaría los fines de línea).
const estados = new Map<string, Buffer>()
for (const p of TOCADOS) {
  const ruta = join(raiz, p, 'docs', 'estado.md')
  if (existsSync(ruta)) estados.set(ruta, await readFile(ruta))
}

const datos = await mkdtemp(join(tmpdir(), 'iridium-tanda4-'))
await writeFile(join(datos, 'config.json'), JSON.stringify({ version: 1, raiz }))

async function abrir(extra: Record<string, string> = {}) {
  const env = {
    ...process.env,
    IRIDIUM_DATOS: datos,
    IRIDIUM_MOTOR: 'falso',
    IRIDIUM_REVISION: 'no',
    IRIDIUM_OCULTA: '1',
    IRIDIUM_FALSO_PASO_MS: '150',
    IRIDIUM_FALSO_PREGUNTA: '1',
    ...extra,
  } as Record<string, string>
  delete env.ELECTRON_RUN_AS_NODE
  const app = await electron.launch(exe ? { executablePath: exe, env } : { args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1440, height: 900 })
  // Abre en la grilla o, si se cerró dentro de un proyecto, en ese proyecto (D-060).
  await win.waitForSelector('.grilla:not(.carga) .tarjeta, .zona-principal > .cab-proyecto h1', {
    timeout: 60_000,
  })
  return { app, win }
}

let win: Page
let app = undefined as unknown as ElectronApplication
const foto = (nombre: string) => win.screenshot({ path: join(SALIDA, `${nombre}.png`) })
const texto = (sel: string) => win.locator(sel).allInnerTexts()

async function paso(id: string, fn: () => Promise<unknown>) {
  try {
    const d = await fn()
    registro.push({ id, ok: true, datos: d })
    console.log('✔', id, d === undefined ? '' : JSON.stringify(d))
  } catch (e) {
    registro.push({ id, ok: false, error: String(e).slice(0, 800) })
    console.log('✘', id, String(e).slice(0, 300))
    await foto(`${id}-error`).catch(() => {})
    await win.keyboard.press('Escape').catch(() => {})
  }
}

const inicio = async () => {
  await win.keyboard.press('Control+1')
  await win.waitForSelector('.grilla:not(.carga) .tarjeta')
}
const entrar = async (nombre: string) => {
  await inicio()
  await win.locator(`.tarjeta[title^="${nombre}"]`).click()
  await win.waitForSelector('.zona-principal > .cab-proyecto h1')
}
const seccion = (nombre: string | RegExp) =>
  win
    .getByRole('navigation', { name: 'Secciones del proyecto' })
    .getByRole('button', { name: nombre })
    .click()
async function mandar(t: string, fin = /Terminada|pregunta/) {
  const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
  await campo.fill(t)
  await campo.press('Enter')
  await win.locator('.barra-proyectos .proy.elegido', { hasText: 'Trabajando' }).waitFor({ timeout: 10_000 })
  await win.locator('.barra-proyectos .proy.elegido', { hasText: fin }).waitFor({ timeout: 30_000 })
}

try {
  ;({ app, win } = await abrir())
  await win.waitForTimeout(500)
  {
    const ruta = join(raiz, A, 'docs', 'estado.md')
    const t = await readFile(ruta, 'utf8')
    await writeFile(
      ruta,
      t.replace(
        /## Preguntas abiertas\r?\n(\(ninguna\)\r?\n)?/,
        '## Preguntas abiertas\n- **Q-900 — ¿La miniatura muestra el modelo 3D o la textura plana?**\n  Tipo: decisión · no frena\n  Contexto: `05-arquitectura.md`. Opciones: A) 3D (recomendada) · B) plana.\n\n',
      ),
    )
  }

  // H-1: la grilla con los proyectos reales.
  await paso('H-1-grilla', async () => {
    await foto('H-1-grilla')
    const tarjetas = await win.locator('.grilla .tarjeta').evaluateAll((ts) =>
      ts.map((t) => ({
        nombre: t.querySelector('.nombre')?.textContent,
        texto: (t as HTMLElement).innerText.replace(/\s+/g, ' '),
        espera: t.querySelector('.senal.ambar')?.textContent ?? null,
      })),
    )
    const total = await win
      .getByRole('button', { name: /^Inicio/ })
      .getAttribute('aria-label')
      .catch(() => null)
    return { tarjetas, totalInicio: total }
  })
  await paso('H-1-archivados', async () => {
    await win.getByRole('switch', { name: /Archivados/ }).click()
    await win.waitForTimeout(300)
    await foto('H-1-archivados')
    const n = await win.locator('.grilla .tarjeta').count()
    await win.getByRole('switch', { name: /Archivados/ }).click()
    return { conArchivados: n, sin: await win.locator('.grilla .tarjeta').count() }
  })
  await paso('H-1-se-actualiza-sola', async () => {
    // Una Q-n nueva en el estado de B aparece en su tarjeta sin recargar; se deshace al final.
    const ruta = join(raiz, B, 'docs', 'estado.md')
    const original = await readFile(ruta, 'utf8')
    await writeFile(
      ruta,
      original.replace(
        /## Preguntas abiertas\r?\n/,
        '## Preguntas abiertas\n- **Q-900 — ¿Pregunta de la tanda 4?**\n  Tipo: decisión · frena\n  Opciones: A) Sí · B) No\n',
      ),
    )
    const chip = win.locator(`.tarjeta[title^="${B}"] .senal.ambar`)
    await chip.waitFor({ timeout: 10_000 })
    const conQ = await chip.textContent()
    await foto('H-1-se-actualiza-sola')
    await writeFile(ruta, original)
    await chip.waitFor({ state: 'detached', timeout: 10_000 })
    return { conQ }
  })

  // H-3, H-4: abrir un proyecto sin sesión: la última conversación (de VS Code) con Seguí y Nueva.
  await paso('H-3-H-4-abrir-iridium', async () => {
    await entrar(IRIDIUM)
    await win.waitForTimeout(800)
    await foto('H-3-H-4-abrir-iridium')
    return {
      h1: await win.locator('.zona-principal > .cab-proyecto h1').textContent(),
      chatCab: (await texto('.chat-cab'))[0]?.replace(/\s+/g, ' '),
      botones: await win.locator('.chat-cab button').allInnerTexts(),
      turnos: await win.locator('.turno').count(),
      secciones: await win
        .getByRole('navigation', { name: 'Secciones del proyecto' })
        .locator('button')
        .allInnerTexts(),
    }
  })
  await paso('H-3-ancho-conversacion', async () => {
    const borde = win.locator('.chat .tirador, .tirador, [role="separator"]').first()
    const caja = await borde.boundingBox()
    if (!caja) throw new Error('No encontré el borde de la conversación')
    const ancho0 = await win.locator('aside.chat').evaluate((e) => e.getBoundingClientRect().width)
    await win.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2)
    await win.mouse.down()
    await win.mouse.move(caja.x - 120, caja.y + caja.height / 2, { steps: 8 })
    await win.mouse.up()
    const ancho1 = await win.locator('aside.chat').evaluate((e) => e.getBoundingClientRect().width)
    await foto('H-3-ancho')
    return { ancho0, ancho1 }
  })

  // H-7, H-8, F-4: el Mapa de Iridium, una caja a su documento, un código, Atrás.
  await paso('H-7-mapa', async () => {
    await seccion('Mapa')
    await win.waitForSelector('[data-seccion="mapa"] .hito-card', { timeout: 30_000 })
    await win.waitForTimeout(400)
    await foto('H-7-mapa')
    const m = win.locator('[data-seccion="mapa"]')
    return {
      hitos: await m.locator('.h').allInnerTexts(),
      cuenta: await m
        .locator('.cuenta')
        .textContent()
        .catch(() => null),
      titulo: await m.locator('.hito-card h3').textContent(),
      filas: (await m.locator('.hito-card .fila-mapa').allInnerTexts()).map((s) => s.replace(/\s+/g, ' ')),
      frentes: await m.locator('.frente').allInnerTexts(),
    }
  })
  await paso('H-7-frente-modulo', async () => {
    const m = win.locator('[data-seccion="mapa"]')
    await m.locator('.frente', { hasText: 'Compartir' }).click()
    await win.waitForTimeout(300)
    await foto('H-7-frente-compartir')
    const r = {
      titulo: await m.locator('.hito-card h3').textContent(),
      filas: (await m.locator('.hito-card .fila-mapa').allInnerTexts()).map((s) => s.replace(/\s+/g, ' ')),
    }
    await m.locator('.frente').first().click()
    return r
  })
  await paso('H-8-caja-a-documento', async () => {
    const m = win.locator('[data-seccion="mapa"]')
    await m.locator('.h', { hasText: /^4$/ }).click()
    await win.waitForTimeout(300)
    await foto('H-7-hito-4')
    await m.locator('.hito-card .fila-mapa').first().click()
    const docs = win.locator('[data-seccion="docs"]')
    await docs.locator('.doc-texto').waitFor({ timeout: 10_000 })
    await win.waitForTimeout(400)
    await foto('H-8-caja-a-documento')
    const r: Record<string, unknown> = {
      doc: await docs.locator('.barra-doc .nom').textContent(),
      marcada: await docs
        .locator('.marcada')
        .textContent()
        .catch(() => null),
      aviso: await docs
        .locator('.aviso-doc, .no-encontrada')
        .textContent()
        .catch(() => null),
    }
    const enlace = docs.locator('.doc-texto a', { hasText: /^D-\d+/ }).first()
    if (await enlace.count()) {
      r.enlace = await enlace.textContent()
      await enlace.click()
      await win.waitForTimeout(400)
      r.saltoA = await docs.locator('.barra-doc .nom').textContent()
      r.marcadaTrasSalto = await docs
        .locator('.marcada')
        .textContent()
        .catch(() => null)
      await foto('H-8-codigo')
      await win.keyboard.press('Alt+ArrowLeft')
      await win.waitForTimeout(300)
      r.trasAtras = await docs.locator('.barra-doc .nom').textContent()
    }
    await seccion('Mapa')
    r.vuelveAlMapa = await win.locator('[data-seccion="mapa"] .hito-card').isVisible()
    await win
      .getByRole('button', { name: 'Ver el hito actual' })
      .click()
      .catch(() => {})
    return r
  })
  await paso('F-4-seccion-inexistente', async () => {
    await win.locator('[data-seccion="mapa"] .proximo a').first().click()
    const docs = win.locator('[data-seccion="docs"]')
    await docs.locator('.doc-texto').waitFor({ timeout: 10_000 })
    await foto('F-4-proximo-paso')
    return {
      doc: await docs.locator('.barra-doc .nom').textContent(),
      marcada: await docs
        .locator('.marcada')
        .textContent()
        .catch(() => null),
    }
  })

  // H-15: Archivos.
  await paso('H-15-archivos', async () => {
    await seccion('Archivos')
    const a = win.locator('[data-seccion="archivos"]')
    const raizArbol = await a.locator('.arbol-nodo').allInnerTexts()
    await a
      .locator('.arbol-nodo', { hasText: /^docs$/ })
      .first()
      .click()
    await a.locator('.arbol-nodo', { hasText: /^ui$/ }).first().click()
    await a.locator('.arbol-nodo', { hasText: 'ajustes-fondo.png' }).first().click()
    await win.waitForTimeout(500)
    await foto('H-15-imagen')
    const imagen = await a.locator('img').count()
    await a
      .locator('.arbol-nodo', { hasText: /^package\.json$/ })
      .first()
      .click()
    await a.locator('.codigo').waitFor({ timeout: 10_000 })
    await foto('H-15-codigo')
    const editable = await a.locator('.codigo [contenteditable="true"], .codigo textarea').count()
    await a
      .locator('.arbol-nodo', { hasText: 'README.md' })
      .first()
      .click()
      .catch(() => {})
    await win.waitForTimeout(300)
    return {
      sinNodeModulesNiGit: !raizArbol.some((n) => /^(node_modules|\.git)$/.test(n.trim())),
      raiz: raizArbol.slice(0, 25),
      imagen,
      editable,
    }
  })

  // H-16: Git.
  await paso('H-16-git', async () => {
    await seccion('Git')
    const g = win.locator('[data-seccion="git"]:not([hidden])')
    await g.locator('.arbol-lista .commit').first().waitFor({ timeout: 15_000 })
    const r = {
      rama: await g.locator('.rama').textContent(),
      remoto: await g
        .locator('.remoto')
        .textContent()
        .catch(() => null),
      plegables: await g.locator('.plegable h3').allInnerTexts(),
      commits: (await g.locator('.arbol-lista .commit').allInnerTexts())
        .slice(0, 4)
        .map((s) => s.replace(/\s+/g, ' ')),
      botonesDeAccion: await g
        .getByRole('button', { name: /^(commit|push|pull|subir|deshacer|descartar|guardar|sincronizar)/i })
        .count(),
    }
    await g.locator('.arbol-lista .commit:not(:has-text("Cambios sin guardar"))').first().click()
    await g.locator('.arch button').first().waitFor({ timeout: 15_000 })
    const archivos = await g.locator('.arch button').count()
    const difAntes = await g.locator('.dif').count()
    await g.locator('.arch button', { hasText: '.md' }).first().click()
    await g.locator('.dif .signo').first().waitFor({ timeout: 15_000 })
    await win.waitForTimeout(300)
    await foto('H-16-git')
    return {
      ...r,
      archivos,
      difAntesDeElegir: difAntes,
      signos: [...new Set(await g.locator('.dif .signo').allInnerTexts())],
    }
  })

  // H-17: conversaciones anteriores.
  await paso('H-17-anteriores', async () => {
    await win.getByRole('button', { name: 'Conversaciones anteriores', exact: true }).click()
    await win.waitForSelector('.anteriores .conv', { timeout: 15_000 })
    await foto('H-17-anteriores')
    const lista = (await win.locator('.anteriores .conv').allInnerTexts())
      .slice(0, 6)
      .map((s) => s.replace(/\s+/g, ' '))
    const marcada = await win
      .locator('.anteriores .conv[aria-current], .anteriores .conv.actual, .anteriores .conv.abierta')
      .count()
    await win.keyboard.press('Escape')
    return { lista, marcada }
  })

  // H-4, H-5, H-2, H-12: Seguí en B (sin conversación propia), termina y deja la pregunta del motor falso.
  await paso('H-4-H-5-segui', async () => {
    await entrar(B)
    await win.waitForTimeout(400)
    await foto('H-4-B-antes')
    const antesDeSegui = (await texto('.chat-cab'))[0]?.replace(/\s+/g, ' ')
    await win.locator('.chat-cab').getByRole('button', { name: 'Seguí' }).click()
    await win
      .locator('.barra-proyectos .proy.elegido', { hasText: 'Trabajando' })
      .waitFor({ timeout: 10_000 })
    await foto('H-2-trabajando')
    const ficha = await win.locator('.barra-proyectos .proy.elegido').innerText()
    const detener = await win.getByRole('button', { name: 'Detener' }).isVisible()
    await win.locator('.pedido').waitFor({ timeout: 30_000 })
    await win.waitForTimeout(300)
    await foto('H-5-pedido')
    return {
      antesDeSegui,
      fichaTrabajando: ficha.replace(/\s+/g, ' '),
      detenerVisible: detener,
      pedido: (await win.locator('.pedido').innerText()).replace(/\s+/g, ' '),
      fichaAlTerminar: (await win.locator('.barra-proyectos .proy.elegido').innerText()).replace(/\s+/g, ' '),
      chipCabecera: await win
        .locator('.zona-principal > .cab-proyecto .senal.ambar')
        .textContent()
        .catch(() => null),
    }
  })
  await paso('H-12-uso-y-contexto', async () => {
    const barra = await win.locator('.estado-barra').innerText()
    await win.locator('.estado-barra .uso').getByRole('button').click()
    await win.waitForTimeout(300)
    await foto('H-12-uso')
    const detalle = await win
      .locator('.detalle-uso')
      .innerText()
      .catch(() => null)
    await win.keyboard.press('Escape')
    const ctx = await win
      .locator('.compositor .medidor-ctx')
      .innerText()
      .catch(() => null)
    const ia = await win
      .locator('.compositor .ajustes-ia')
      .innerText()
      .catch(() => null)
    await win
      .locator('.compositor')
      .getByRole('button', { name: /Opus|Sonnet|Haiku|Predeterminado/ })
      .first()
      .click()
    await win.waitForTimeout(200)
    await foto('H-12-modelos')
    const modelos = await win.getByRole('menuitemradio').allInnerTexts()
    await win.keyboard.press('Escape')
    return {
      barra: barra.replace(/\s+/g, ' '),
      detalle: detalle?.replace(/\s+/g, ' '),
      contexto: ctx?.replace(/\s+/g, ' '),
      ia: ia?.replace(/\s+/g, ' '),
      modelos: modelos.map((s) => s.replace(/\s+/g, ' ')),
    }
  })
  await paso('H-2-tarjeta-y-ficha', async () => {
    await inicio()
    await win.waitForTimeout(300)
    await foto('H-2-tarjeta')
    return {
      tarjeta: (await win.locator(`.tarjeta[title^="${B}"]`).innerText()).replace(/\s+/g, ' '),
      fichas: (await win.locator('.barra-proyectos .proy').allInnerTexts()).map((s) =>
        s.replace(/\s+/g, ' '),
      ),
    }
  })
  await paso('H-2-tocar-ficha', async () => {
    await win.locator('.barra-proyectos .proy', { hasText: B }).getByRole('tab').click()
    return {
      h1: await win.locator('.zona-principal > .cab-proyecto h1').textContent(),
      turnos: await win.locator('.turno').count(),
    }
  })

  // H-14: Detener y retomar.
  await paso('H-14-detener', async () => {
    const campo = win.getByRole('textbox', { name: 'Mensaje para la IA' })
    await campo.fill('Hacé algo lento para detener')
    await campo.press('Enter')
    await win.getByRole('button', { name: 'Detener' }).waitFor({ timeout: 10_000 })
    await win.waitForTimeout(400)
    await win.getByRole('button', { name: 'Detener' }).click()
    await win.locator('.linea-aviso.detenida').waitFor({ timeout: 10_000 })
    await foto('H-14-detenida')
    const r = {
      aviso: await win.locator('.linea-aviso.detenida').last().textContent(),
      ficha: (await win.locator('.barra-proyectos .proy.elegido').innerText()).replace(/\s+/g, ' '),
      detener: await win.getByRole('button', { name: 'Detener' }).count(),
    }
    await mandar('Seguí después de detener')
    return { ...r, retomaConMensaje: (await win.locator('.hilo .md').last().innerText()).slice(0, 120) }
  })

  // H-6 y H-13: B trabaja lento; paso a A y luego a la grilla: B sigue, avisa al terminar.
  await paso('H-6-H-13-cambiar-y-aviso', async () => {
    await win.getByRole('textbox', { name: 'Mensaje para la IA' }).fill('Algo lento en B')
    await win.getByRole('textbox', { name: 'Mensaje para la IA' }).press('Enter')
    await win.locator('.barra-proyectos .proy', { hasText: B }).filter({ hasText: 'Trabajando' }).waitFor()
    await entrar(A)
    await seccion('Docs')
    await win.waitForTimeout(300)
    const sigue = await win.locator('.barra-proyectos .proy', { hasText: B }).innerText()
    const aviso = win.locator('.aviso')
    await aviso.waitFor({ timeout: 30_000 })
    await foto('H-13-aviso')
    const textoAviso = (await aviso.innerText()).replace(/\s+/g, ' ')
    const botones = await aviso.getByRole('button').allInnerTexts()
    await aviso.getByRole('button', { name: /Abrir/ }).click()
    const h1 = await win.locator('.zona-principal > .cab-proyecto h1').textContent()
    // Volver a A: sigue en Docs.
    await win
      .locator('.barra-proyectos .proy', { hasText: A })
      .getByRole('tab')
      .click()
      .catch(async () => entrar(A))
    await win.waitForTimeout(300)
    const seccionActiva = await win
      .locator('.act.elegida')
      .getAttribute('aria-label')
      .catch(() => null)
    await foto('H-6-vuelve-a-A')
    return { bMientras: sigue.replace(/\s+/g, ' '), textoAviso, botones, abrirLleva: h1, seccionActiva }
  })

  // H-9, H-10, H-11, F-3: la Bandeja de cada proyecto con las Q-n reales (sin la Bandeja de todos, D-111); responder
  // la Q-900 de A y la prueba de C.
  const bandeja = async (nombre: string) => {
    await entrar(nombre)
    await seccion(/^Bandeja de entrada/)
    await win.waitForSelector('[data-seccion="pendientes"] .pend:not(.silueta-pend)', { timeout: 30_000 })
  }
  await paso('H-9-pendientes', async () => {
    await bandeja(A)
    await win.waitForTimeout(400)
    await foto('H-9-pendientes')
    return {
      totalInicio: await win
        .getByRole('button', { name: /^Inicio/ })
        .getAttribute('aria-label')
        .catch(() => null),
      grupos: await win.locator('[data-seccion="pendientes"] .grupo').allInnerTexts(),
    }
  })
  await paso('H-10-decision', async () => {
    const q = win.locator('.pend[data-q="Q-900"]')
    await q.waitFor()
    const det = q.getByRole('button', { name: /Mostrar detalles/ })
    if (await det.count()) await det.click()
    await win.waitForTimeout(300)
    await foto('H-10-decision')
    const opciones = await q.locator('.opcion-radio').allInnerTexts()
    await q.locator('.opcion-radio').first().click()
    await q.getByRole('textbox', { name: 'Nota' }).fill('Respuesta de la tanda 4 (copia).')
    await q.getByRole('button', { name: 'Enviar' }).click()
    await q.locator('.meta', { hasText: 'Respondida' }).waitFor({ timeout: 10_000 })
    await foto('H-10-respondida')
    return {
      opciones: opciones.map((s) => s.replace(/\s+/g, ' ')),
      archivo: await readFile(join(raiz, A, 'docs', 'respuestas', 'Q-900.md'), 'utf8'),
    }
  })
  await paso('H-11-prueba-a-medias', async () => {
    await bandeja(C)
    const q = win.locator(`.pend[data-q="${QC}"]`)
    await q.waitFor()
    const casillas = q.getByRole('checkbox')
    const n = await casillas.count()
    await casillas.nth(0).check()
    await casillas.nth(1).check()
    const notas = q.getByRole('textbox', { name: /^Nota de:/ })
    await notas.nth(2).fill('No apareció «Comentando» (prueba de la tanda 4, copia).')
    const guardar = q.getByRole('button', { name: /Guardar a medias/ })
    const hayGuardar = await guardar.count()
    if (hayGuardar) await guardar.click()
    await win.waitForTimeout(500)
    await foto('H-11-a-medias')
    const meta = await q.locator('.meta').innerText()
    // Sigue a medias al salir y volver.
    await entrar(B)
    await bandeja(C)
    const sigueMarcada = await q.getByRole('checkbox').nth(1).isChecked()
    await q.getByRole('button', { name: 'Enviar' }).click()
    await q.locator('.meta', { hasText: /Respondida/ }).waitFor({ timeout: 10_000 })
    await foto('H-11-respondida')
    return {
      puntos: n,
      hayGuardarAMedias: hayGuardar,
      metaAMedias: meta.replace(/\s+/g, ' '),
      sigueMarcada,
      archivo: await readFile(join(raiz, C, 'docs', 'respuestas', `${QC}.md`), 'utf8'),
    }
  })
  await paso('H-9-ver-entero', async () => {
    const ver = win.locator('.cita .enlace, .cita button', { hasText: 'Ver entero' }).first()
    if (!(await ver.count())) {
      const det = win
        .locator('.pend')
        .getByRole('button', { name: /Mostrar detalles/ })
        .first()
      if (await det.count()) await det.click()
    }
    await win
      .locator('.cita', { hasText: 'Ver entero' })
      .first()
      .getByRole('button', { name: 'Ver entero' })
      .click()
    // Sin la Bandeja de todos, «Ver entero» abre el documento en Docs (D-111).
    await win.locator('[data-seccion="docs"]:not([hidden]) .doc-texto').waitFor({ timeout: 10_000 })
    await win.waitForTimeout(300)
    await foto('H-9-ver-entero')
    return { seccion: await win.locator('.act.elegida').getAttribute('aria-label') }
  })

  // Frentes y Postergar (D-063), en la entrada de C: solo se mira.
  await paso('D-063-frentes-en-pendientes', async () => {
    await entrar(C)
    await win.waitForTimeout(400)
    await foto('D-063-entrada-C')
    return {
      pendientes: (await win.locator('[data-seccion="pendientes"] .pend').allInnerTexts()).map((s) =>
        s.replace(/\s+/g, ' ').slice(0, 160),
      ),
      postergar: await win
        .locator('[data-seccion="pendientes"]')
        .getByRole('button', { name: 'Postergar' })
        .count(),
    }
  })

  // Chat general y borradores (D-060).
  await paso('D-060-chat-general', async () => {
    await inicio()
    const chat = win.locator('aside.chat')
    const falta = await win
      .locator('.chat-falta')
      .innerText()
      .catch(() => null)
    if (falta)
      await win
        .locator('.chat-falta')
        .getByRole('button')
        .first()
        .click()
        .catch(() => {})
    await chat
      .getByRole('textbox', { name: 'Mensaje para la IA' })
      .fill('Borrador sin enviar en el chat general')
    await entrar(B)
    await win.getByRole('textbox', { name: 'Mensaje para la IA' }).fill('Borrador en B')
    await inicio()
    const vuelveGeneral = await chat.getByRole('textbox', { name: 'Mensaje para la IA' }).inputValue()
    await foto('D-060-chat-general')
    await entrar(B)
    const vuelveB = await win.getByRole('textbox', { name: 'Mensaje para la IA' }).inputValue()
    await win.getByRole('textbox', { name: 'Mensaje para la IA' }).fill('')
    await inicio()
    await chat.getByRole('textbox', { name: 'Mensaje para la IA' }).fill('')
    return {
      chatFalta: falta,
      cab: (await chat.locator('.chat-cab').innerText()).replace(/\s+/g, ' '),
      vuelveGeneral,
      vuelveB,
    }
  })

  // Skills (SK-1 a SK-4), solo mirar.
  await paso('SK-skills', async () => {
    await win.keyboard.press('Control+3')
    await win.waitForSelector('.sk-columna .sk-fila', { timeout: 30_000 })
    await win.waitForTimeout(600)
    await foto('SK-skills')
    return {
      titulo: await win.locator('.sk-columna .titulo').innerText(),
      filas: await win.locator('.sk-columna .sk-fila').count(),
      framework: await win.locator('.sk-proy .datos b').allTextContents(),
    }
  })

  // Ajustes (AJ-1 a AJ-3), solo mirar.
  await paso('AJ-ajustes', async () => {
    await win.getByRole('button', { name: /^Ajustes/ }).click()
    const d = win.getByRole('dialog')
    await d.waitFor()
    const r: Record<string, string> = {}
    for (const s of ['Perfil', 'IA', 'Apariencia', 'Proyectos', 'Acerca de']) {
      await d.getByRole('button', { name: s, exact: true }).first().click()
      await win.waitForTimeout(300)
      await foto(`AJ-${s.replace(/ /g, '-')}`)
      r[s] = (await d.innerText()).replace(/\s+/g, ' ').slice(0, 500)
    }
    await win.keyboard.press('Escape')
    await d.waitFor({ state: 'detached', timeout: 5000 })
    return r
  })

  // F-5: errores del motor.
  await paso('F-5-errores', async () => {
    await entrar(B)
    const r: Record<string, unknown> = {}
    for (const [clave, msg] of [
      ['agotado', 'Algo que deja el uso agotado'],
      ['falla', 'Ahora una falla'],
    ] as const) {
      await mandar(msg, /Error|Terminada/)
      r[clave] = {
        aviso: (await win.locator('.falla-motor').last().innerText()).replace(/\s+/g, ' '),
        ficha: (await win.locator('.barra-proyectos .proy.elegido').innerText()).replace(/\s+/g, ' '),
      }
      await foto(`F-5-${clave}`)
    }
    r.barra = (await win.locator('.estado-barra').innerText()).replace(/\s+/g, ' ')
    return r
  })

  // F-6: cerrar con una sesión trabajando.
  await paso('F-6-cerrar', async () => {
    await win.getByRole('textbox', { name: 'Mensaje para la IA' }).fill('Algo lento para cerrar')
    await win.getByRole('textbox', { name: 'Mensaje para la IA' }).press('Enter')
    await win.locator('.barra-proyectos .proy.elegido', { hasText: 'Trabajando' }).waitFor()
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.close())
    const d = win.getByRole('alertdialog')
    await d.waitFor({ timeout: 5000 })
    await foto('F-6-cerrar')
    const r = {
      dialogo: (await d.innerText()).replace(/\s+/g, ' '),
      foco: await win.evaluate(() => document.activeElement?.textContent),
    }
    await d.getByRole('button', { name: 'Cancelar' }).click()
    const sigue = (await win.locator('.barra-proyectos .proy.elegido').innerText()).replace(/\s+/g, ' ')
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.close())
    const cerrada = app.waitForEvent('close')
    await win.getByRole('alertdialog').getByRole('button', { name: 'Cerrar igual' }).click()
    await cerrada
    return { ...r, trasCancelar: sigue }
  })

  // F-5 sin sesión (y lo escrito que vuelve al abrir), en otra apertura.
  await paso('F-5-sin-sesion', async () => {
    ;({ app, win } = await abrir({ IRIDIUM_FALSO_ESTADO: 'sin-sesion' }))
    const barra = (await win.locator('.estado-barra').innerText()).replace(/\s+/g, ' ')
    const proyectoAlAbrir = await win
      .locator('.zona-principal > .cab-proyecto h1')
      .textContent()
      .catch(() => null)
    await entrar(B)
    await win.getByRole('textbox', { name: 'Mensaje para la IA' }).fill('Hacé la grilla')
    await win.getByRole('textbox', { name: 'Mensaje para la IA' }).press('Enter')
    await win.locator('.falla-motor').last().waitFor({ timeout: 10_000 })
    await win.waitForTimeout(300)
    await foto('F-5-sin-sesion')
    const r = {
      barra,
      proyectoAlAbrir,
      aviso: (await win.locator('.falla-motor').last().innerText()).replace(/\s+/g, ' '),
    }
    await app.close()
    return r
  })

  // H-4 y H-17 con las conversaciones reales (las de la copia no existen: Claude Code las guarda por carpeta).
  // Los proyectos reales y el motor real, como tools/capturas.ts: solo se mira, no se manda nada ni se gasta.
  await paso('H-4-H-17-reales', async () => {
    const reales = await mkdtemp(join(tmpdir(), 'iridium-tanda4-reales-'))
    const env = {
      ...process.env,
      IRIDIUM_DATOS: reales,
      IRIDIUM_REVISION: 'no',
      IRIDIUM_OCULTA: '1',
    } as Record<string, string>
    delete env.ELECTRON_RUN_AS_NODE
    app = await electron.launch(exe ? { executablePath: exe, env } : { args: ['.'], env })
    win = await app.firstWindow()
    await win.setViewportSize({ width: 1440, height: 900 })
    await win.waitForSelector('.grilla:not(.carga) .tarjeta', { timeout: 60_000 })
    await win.locator(`.tarjeta[title^="${IRIDIUM}"]`).click()
    await win.locator('.turno').first().waitFor({ timeout: 30_000 })
    await win.waitForTimeout(800)
    await foto('H-4-ultima-conversacion-real')
    const cab = (await win.locator('.chat-cab').innerText()).replace(/\s+/g, ' ')
    await win.getByRole('button', { name: 'Conversaciones anteriores', exact: true }).click()
    await win.waitForSelector('.anteriores .conv', { timeout: 15_000 })
    await foto('H-17-anteriores-reales')
    const lista = (await win.locator('.anteriores .conv').allInnerTexts())
      .slice(0, 8)
      .map((s) => s.replace(/\s+/g, ' '))
    const marcadas = await win
      .locator('.anteriores .conv')
      .evaluateAll((cs) =>
        cs.map((c) => c.getAttribute('aria-current') ?? c.getAttribute('aria-checked') ?? c.className),
      )
    await win.locator('.anteriores .conv').nth(2).click()
    await win.waitForTimeout(800)
    await foto('H-17-otra-conversacion')
    const cabOtra = (await win.locator('.chat-cab').innerText()).replace(/\s+/g, ' ')
    await app.close()
    await rm(reales, { recursive: true, force: true, maxRetries: 5 }).catch(() => {})
    return { cab, lista, marcadas: marcadas.slice(0, 4), cabOtra }
  })
} finally {
  await (app as ElectronApplication | undefined)?.close().catch(() => {})
  // Deshacer lo que el recorrido escribió en la copia.
  const deshecho: Record<string, string[]> = {}
  for (const [ruta, bytes] of estados) await writeFile(ruta, bytes)
  for (const p of TOCADOS) {
    const nuevos = sucios(p).filter((f) => !antes[p]?.has(f))
    for (const f of nuevos) {
      const enGit = git(p, 'ls-files', '--', f).trim()
      if (enGit) git(p, 'checkout', '--', f)
      else await rm(join(raiz, p, f), { force: true })
    }
    if (nuevos.length) deshecho[p] = nuevos
  }
  console.log('deshecho en la copia:', JSON.stringify(deshecho))
  await writeFile(
    join(SALIDA, 'registro.json'),
    JSON.stringify(
      { app: exe ?? 'pnpm build', fecha: new Date().toISOString(), registro, deshecho },
      null,
      2,
    ),
  )
  await rm(datos, { recursive: true, force: true, maxRetries: 5 }).catch(() => {})
}

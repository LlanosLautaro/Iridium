// Prueba real del navegador (frente Paridad, PA-I5; D-189 › 4) contra el Claude Code de la PC. Sin argumentos, no gasta:
// abre una sesión con las opciones que pone Iridium con el navegador prendido y dice el estado de `claude-in-chrome` y
// cuántas herramientas trae. Con `--gastar <carpeta vacía fuera de este repo>`, abre una conversación con Haiku que le
// pide a la IA abrir https://example.com en el navegador y decir el título; gasta un poco de uso y abre una pestaña.
// Uso: npx jiti tools/probar-navegador.ts [--gastar <carpeta>]
import { mkdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { query } from '@anthropic-ai/claude-agent-sdk'
import { INSTRUCCION_CENTRO } from '../src/main/core/sesiones.ts'
import type { EventoMotor } from '../src/main/motor/motor.ts'
import { crearMotorSdk, navegadorDeSesion } from '../src/main/motor/sdk.ts'

const t0 = Date.now()
const log = (...a: unknown[]) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a)

if (process.argv[2] !== '--gastar') {
  let soltar = () => {}
  const espera = new Promise<void>((r) => {
    soltar = r
  })
  // biome-ignore lint/correctness/useYield: no manda nada; solo espera a que se cierre.
  async function* entrada(): AsyncGenerator<never> {
    await espera
  }
  const q = query({
    prompt: entrada(),
    options: { cwd: homedir(), settingSources: ['user', 'project', 'local'], ...navegadorDeSesion(true) },
  })
  const termino = (async () => {
    for await (const _ of q) {
      // nada
    }
  })().catch(() => {})
  try {
    let lista = await q.mcpServerStatus()
    while (lista.some((s) => s.status === 'pending') && Date.now() - t0 < 15_000) {
      await new Promise((r) => setTimeout(r, 500))
      lista = await q.mcpServerStatus()
    }
    const chrome = lista.find((s) => s.name === 'claude-in-chrome')
    log(
      chrome
        ? JSON.stringify({ estado: chrome.status, error: chrome.error, herramientas: chrome.tools?.length })
        : 'sin claude-in-chrome',
    )
  } finally {
    soltar()
    await termino
  }
} else {
  const carpeta = process.argv[3] ?? ''
  if (!carpeta) throw new Error('Falta la carpeta de prueba')
  await mkdir(carpeta, { recursive: true })
  const motor = crearMotorSdk({ modelo: 'haiku' })
  await new Promise<void>((listo) => {
    const s = motor.abrir(
      {
        carpeta,
        conversacion: null,
        instruccion: INSTRUCCION_CENTRO,
        ajuste: { modelo: null, esfuerzo: null },
        tono: null,
        navegador: true,
      },
      (e: EventoMotor) => {
        if (e.tipo === 'mensaje') log(JSON.stringify(e.mensaje).slice(0, 300))
        else if (e.tipo === 'turno') log(JSON.stringify(e))
        if (e.tipo === 'cerrada') listo()
      },
    )
    s.enviar(
      'Usá el navegador (las herramientas de Claude in Chrome) para abrir https://example.com en una pestaña nueva y ' +
        'decime en una línea el título de la página. Si no podés usar el navegador, decí por qué en una línea.',
    )
  })
}

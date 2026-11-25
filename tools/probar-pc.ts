// Prueba real de la PC (frente Paridad, PA-I6; D-189 › 5) contra el Claude Code de la PC, con un Windows-MCP ya
// instalado (el de `%USERPROFILE%\.local\bin` o el que se pase con `--exe`). Sin `--gastar`, no gasta: abre una sesión
// con las opciones que pone Iridium con la PC prendida y dice el estado de `pc` y qué herramientas trae (sin PowerShell,
// archivos ni registro). Con `--gastar <carpeta vacía fuera de este repo>`, abre una conversación con Haiku que le pide
// a la IA sacar una captura de la pantalla y decir en una línea qué programa está adelante; gasta un poco de uso.
// Uso: npx jiti tools/probar-pc.ts [--exe <windows-mcp.exe>] [--gastar <carpeta>]
import { mkdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { query } from '@anthropic-ai/claude-agent-sdk'
import { INSTRUCCION_CENTRO } from '../src/main/core/sesiones.ts'
import type { EventoMotor } from '../src/main/motor/motor.ts'
import { crearMotorSdk, pcDeSesion } from '../src/main/motor/sdk.ts'

const t0 = Date.now()
const log = (...a: unknown[]) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a)
const arg = (n: string) => {
  const i = process.argv.indexOf(n)
  return i >= 0 ? (process.argv[i + 1] ?? '') : null
}
const ejecutable = arg('--exe') ?? join(homedir(), '.local', 'bin', 'windows-mcp.exe')
const carpeta = arg('--gastar')

if (carpeta === null) {
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
    options: { cwd: homedir(), settingSources: ['user', 'project', 'local'], ...pcDeSesion({ ejecutable }) },
  })
  const termino = (async () => {
    for await (const _ of q) {
      // nada
    }
  })().catch(() => {})
  try {
    let lista = await q.mcpServerStatus()
    while (lista.some((s) => s.status === 'pending') && Date.now() - t0 < 30_000) {
      await new Promise((r) => setTimeout(r, 500))
      lista = await q.mcpServerStatus()
    }
    const pc = lista.find((s) => s.name === 'pc')
    log(
      pc
        ? JSON.stringify({ estado: pc.status, error: pc.error, herramientas: pc.tools?.map((t) => t.name) })
        : 'sin pc',
    )
  } finally {
    soltar()
    await termino
  }
} else {
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
        pc: { ejecutable },
      },
      (e: EventoMotor) => {
        if (e.tipo === 'mensaje') log(JSON.stringify(e.mensaje).slice(0, 300))
        else if (e.tipo === 'turno') log(JSON.stringify(e))
        if (e.tipo === 'cerrada') listo()
      },
    )
    s.enviar(
      'Usá las herramientas de la PC (las de `pc`, Windows-MCP) para sacar una captura de la pantalla y decime en una ' +
        'línea qué programa está adelante. Si no podés usar la PC, decí por qué en una línea.',
    )
  })
}

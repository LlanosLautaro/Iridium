// Hito 8 (08-calidad.md › Casos límite, «Sin internet»): el Claude Code real sin red, sin cortar la de la PC.
// Le da un proxy que no existe (127.0.0.1:9): no llega a Anthropic, así que no gasta uso. Muestra qué eventos
// recibe Iridium y cuánto tarda en avisar.
// Uso: node --experimental-strip-types tools/probar-sin-red.ts <carpeta vacía fuera de este repo>
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { INSTRUCCION_CENTRO } from '../src/main/core/sesiones.ts'
import type { EventoMotor } from '../src/main/motor/motor.ts'
import { crearMotorSdk } from '../src/main/motor/sdk.ts'

const carpeta = process.argv[2] ?? ''
if (!carpeta) throw new Error('Falta la carpeta del proyecto de prueba')
for (const v of ['HTTPS_PROXY', 'HTTP_PROXY', 'https_proxy', 'http_proxy'])
  process.env[v] = 'http://127.0.0.1:9'
delete process.env.NO_PROXY
await mkdir(join(carpeta, 'docs'), { recursive: true })
await writeFile(join(carpeta, 'docs', 'estado.md'), '# Estado\n\n## Próximo paso\nNada.\n')
const motor = crearMotorSdk({ modelo: 'haiku' })
const t0 = Date.now()
const log = (...a: unknown[]) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a)
log('verificar:', JSON.stringify(await motor.verificar()).slice(0, 300))
await new Promise<void>((listo) => {
  const s = motor.abrir(
    {
      carpeta,
      conversacion: null,
      instruccion: INSTRUCCION_CENTRO,
      ajuste: { modelo: null, esfuerzo: null },
      tono: null,
    },
    (e: EventoMotor) => {
      log(JSON.stringify(e).slice(0, 300))
      if (e.tipo === 'cerrada') listo()
    },
  )
  s.enviar('Decí hola.')
  setTimeout(() => {
    log('>>> 5 minutos sin terminar: Detener')
    void s.detener()
  }, 300_000)
})
log('fin')
process.exit(0)

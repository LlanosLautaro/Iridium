// Prueba real de la conversación contra el Claude Code de la PC, con un modelo barato y un proyecto descartable:
// sesión nueva (con el contexto y el uso al terminar), leerla guardada, el contexto sin mandar nada (sin tocar el
// historial), Detener a mitad, retomar avisando, cambiar el esfuerzo y el tono (AJ-3). Gasta un poco de uso.
// Uso: node --experimental-strip-types tools/probar-conversacion.ts <carpeta vacía fuera de este repo>
import { mkdir, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { AjusteIa } from '../src/compartido/puente.ts'
import { INSTRUCCION_CENTRO, mensajeParaLaIa } from '../src/main/core/sesiones.ts'
import type { EventoMotor } from '../src/main/motor/motor.ts'
import { crearMotorSdk } from '../src/main/motor/sdk.ts'

const carpeta = process.argv[2] ?? ''
if (!carpeta) throw new Error('Falta la carpeta del proyecto de prueba')
await mkdir(join(carpeta, 'docs'), { recursive: true })
await writeFile(
  join(carpeta, 'docs', 'estado.md'),
  '# Estado\n\n## Preguntas abiertas\n(ninguna)\n\n## Próximo paso\nElegir el color del logo (lo decide el usuario).\n',
)
const motor = crearMotorSdk({ modelo: 'haiku' })
const t0 = Date.now()
const log = (...a: unknown[]) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a)

function turno(
  conversacion: string | null,
  texto: string,
  detenerEn?: string,
  ajuste: AjusteIa = { modelo: null, esfuerzo: null },
  tono: string | null = null,
): Promise<string | null> {
  return new Promise((listo) => {
    let id: string | null = null
    const s = motor.abrir(
      { carpeta, conversacion, instruccion: INSTRUCCION_CENTRO, ajuste, tono },
      (e: EventoMotor) => {
        if (e.tipo === 'conversacion') id = e.id
        if (e.tipo === 'mensaje') log(JSON.stringify(e.mensaje).slice(0, 200))
        else log(JSON.stringify(e))
        if (e.tipo === 'mensaje' && e.mensaje.tipo === 'herramienta' && e.mensaje.accion === detenerEn) {
          log('>>> DETENER')
          void s.detener()
        }
        if (e.tipo === 'cerrada') listo(id)
      },
    )
    s.enviar(texto)
  })
}

log('== 1) Seguí en una conversación nueva ==')
const id = await turno(null, 'Seguí con el proyecto.')
log('== 2) La conversación guardada ==')
log('conversaciones:', JSON.stringify((await motor.conversaciones(carpeta)).slice(0, 3)))
if (id) log('mensajes:', (await motor.mensajes(carpeta, id)).length)
if (id) {
  log('== 2b) El contexto sin mandar nada, sin tocar el historial ==')
  const proyecto = carpeta.replace(/[^a-zA-Z0-9]/g, '-')
  const historial = join(homedir(), '.claude', 'projects', proyecto, `${id}.jsonl`)
  const antes = await stat(historial).then(
    (s) => `${s.mtimeMs} ${s.size}`,
    () => 'no se encontró',
  )
  const t = Date.now()
  log('contexto:', JSON.stringify(await motor.contexto(carpeta, id)), `${Date.now() - t} ms`)
  const despues = await stat(historial).then(
    (s) => `${s.mtimeMs} ${s.size}`,
    () => 'no se encontró',
  )
  log('historial', antes === despues ? 'sin cambios' : `CAMBIÓ: ${antes} → ${despues}`, historial)
  const tu = Date.now()
  log('uso:', JSON.stringify(await motor.uso()), `${Date.now() - tu} ms`)
}
log('== 3) Detener a mitad ==')
await turno(
  id,
  'Corré con Bash: powershell -Command "Start-Sleep 20; \'fin\'" y después creá lento.txt',
  'Ejecutó',
)
log('== 4) Retomar avisando ==')
await turno(
  id,
  mensajeParaLaIa('¿Qué te pedí en el mensaje anterior y llegaste a terminarlo? Una línea.', true),
)
log('== 5) Con esfuerzo bajo ==')
await turno(id, 'Decí solo «hola».', undefined, { modelo: null, esfuerzo: 'low' })
log('== 6) Con el tono «Explanatory» (AJ-3) ==')
await turno(
  id,
  'Creá chau.txt con la palabra chau y contame en dos líneas qué hiciste.',
  undefined,
  { modelo: null, esfuerzo: null },
  'Explanatory',
)

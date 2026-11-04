// Prueba real de `verificar`, del uso y de los estilos de respuesta (AJ-3) contra el Claude Code de la PC (no manda
// mensajes, no gasta uso). Uso: node --experimental-strip-types tools/probar-motor.ts
import { homedir } from 'node:os'
import { query } from '@anthropic-ai/claude-agent-sdk'
import { crearMotorSdk, tonoDeSesion } from '../src/main/motor/sdk.ts'

const motor = crearMotorSdk()
const t = Date.now()
console.log(JSON.stringify(await motor.verificar(), null, 2), `${Date.now() - t} ms`)
const tu = Date.now()
console.log(JSON.stringify(await motor.uso()), `${Date.now() - tu} ms`)
const te = Date.now()
console.log('estilos:', JSON.stringify(await motor.estilos()), `${Date.now() - te} ms`)
// Una sesión sin mensajes con el tono como ajuste propio: Claude Code tiene que informar ese estilo.
async function* nada(): AsyncGenerator<never> {}
const s = query({
  prompt: nada(),
  options: { cwd: homedir(), settingSources: ['user'], ...tonoDeSesion('Explanatory') },
})
console.log('estilo de una sesión con tono Explanatory:', (await s.initializationResult()).output_style)
s.close()

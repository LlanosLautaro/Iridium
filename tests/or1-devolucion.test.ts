// OR-I1: el control al terminar un turno le devuelve a la IA lo mal escrito, una vez por turno (OR-2, W-12).
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { CambioConversacion, Entrada } from '../src/compartido/puente'
import { controlarProyecto } from '../src/main/app/control'
import { Conversaciones } from '../src/main/app/conversacion'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { ENCABEZADO_CONTROL } from '../src/main/core/control'
import { ArchivoSesiones } from '../src/main/infra/sesiones'
import { crearMotorFalso } from '../src/main/motor/motor'

let raiz: string
let alfa: string
let cambios: CambioConversacion[]
let enviados: string[]

const ESTADO = `# Estado del proyecto

**Última actualización:** 2026-11-06

## Hito actual
1 — Exploración — en curso

## Preguntas abiertas
(ninguna)

## Próximo paso
Seguir explorando.
`

beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-control-'))
  alfa = join(raiz, 'Alfa')
  await mkdir(join(alfa, 'docs'), { recursive: true })
  await writeFile(join(alfa, 'docs', 'estado.md'), ESTADO)
  await writeFile(join(alfa, 'docs', 'README.md'), '# Docs\n\n**Framework:** 2026-11-06\n')
  await writeFile(join(alfa, 'docs', 'trabajo.md'), '# Trabajo\n')
  cambios = []
  enviados = []
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

async function hasta(condicion: () => boolean, ms = 10_000): Promise<void> {
  const fin = Date.now() + ms
  while (!condicion()) {
    if (Date.now() > fin) throw new Error('No pasó a tiempo')
    await new Promise((r) => setTimeout(r, 5))
  }
}

/** La IA falsa deja una pregunta sin «Tipo:» y, si no es terca, la corrige cuando el control se la devuelve. */
function armar(terca = false) {
  const motor = crearMotorFalso({
    pasoMs: 5,
    alTurno: async (carpeta, texto) => {
      enviados.push(texto)
      const ruta = join(carpeta, 'docs', 'estado.md')
      const antes = await readFile(ruta, 'utf8')
      if (texto.startsWith(ENCABEZADO_CONTROL)) {
        if (!terca)
          await writeFile(ruta, antes.replace('  Contexto: sin tipo.', '  Tipo: consulta\n  Contexto: ok.'))
        return
      }
      await writeFile(ruta, antes.replace('(ninguna)', '- **Q-1 — ¿Mal escrita?**\n  Contexto: sin tipo.'))
    },
  })
  return new Conversaciones({
    motor,
    registro: new ArchivoSesiones(join(raiz, 'datos', 'sesiones.json')),
    preguntas: leerPreguntasAbiertas,
    alCambio: (x) => cambios.push(x),
    control: controlarProyecto,
  })
}

const ficha = () => cambios.at(-1)?.ficha ?? null
/** La entrada del control como quedó (la última versión que llegó con su id). */
function control(): Extract<Entrada, { tipo: 'control' }> | undefined {
  return cambios
    .flatMap((c) => c.entradas)
    .filter((e) => e.tipo === 'control')
    .at(-1) as Extract<Entrada, { tipo: 'control' }> | undefined
}

describe('la devolución del control (OR-2)', () => {
  it('lo mal escrito vuelve a la IA, que lo corrige en el mismo turno', async () => {
    const c = armar()
    await c.seguir(alfa, { texto: 'Dejá una pregunta' })
    await hasta(() => (ficha()?.preguntas.length ?? 0) > 0)

    expect(enviados).toHaveLength(2)
    expect(enviados[1]).toContain('Q-1: falta la línea «Tipo:»')
    expect(control()).toMatchObject({
      corrigiendo: false,
      avisos: [{ donde: 'docs/estado.md:9', quedo: false }],
    })
    // Mientras corregía, la pestaña siguió trabajando: «terminada» llegó una sola vez, al final.
    const corregido = cambios.findIndex((x) => x.entradas.some((e) => e.tipo === 'control' && !e.corrigiendo))
    expect(cambios.findIndex((x) => x.ficha?.estado === 'terminada')).toBeGreaterThan(corregido)
    expect(cambios.some((x) => x.ficha?.estado === 'error')).toBe(false)
    // Las preguntas nuevas se avisan ya corregidas.
    expect(ficha()?.preguntas).toEqual([expect.objectContaining({ codigo: 'Q-1', tipo: 'consulta' })])
    // Al volver a abrir, el mensaje del control se ve como su entrada, no como un mensaje del usuario.
    const v = await c.abrir(alfa)
    expect(v.entradas.filter((e) => e.tipo === 'usuario')).toHaveLength(1)
  })

  it('si la IA no corrige, queda el aviso y no hay un segundo envío', async () => {
    const c = armar(true)
    await c.seguir(alfa, { texto: 'Dejá una pregunta' })
    await hasta(() => ficha()?.estado === 'terminada')
    await new Promise((r) => setTimeout(r, 100))

    expect(enviados).toHaveLength(2)
    expect(control()?.avisos).toEqual([expect.objectContaining({ quedo: true })])
  })

  it('sin framework, el control no corre', async () => {
    await writeFile(join(alfa, 'docs', 'README.md'), '# Docs\n\n**Formato de la guía:** 2026-11-01\n')
    const c = armar()
    await c.seguir(alfa, { texto: 'Dejá una pregunta' })
    await hasta(() => ficha()?.estado === 'terminada')

    expect(enviados).toHaveLength(1)
    expect(control()).toBeUndefined()
  })
})

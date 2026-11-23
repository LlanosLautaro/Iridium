// FS-I3: lo que lee el tablero Frentes (D-180, D-181): las preguntas de cada frente (por el nombre de la tabla o la
// carpeta), las del Núcleo (sin frente o con uno que no está), las de un frente por empezar, la fecha de cada frente y el
// código al pie de cada paso. Y lo que sigue en la tarjeta: el primero que la IA puede hacer, si no el que te espera.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Documentos } from '../src/main/app/documentos'
import { mapaDe } from '../src/main/app/mapa'
import { leerPreguntasAbiertas } from '../src/main/app/proyectos'
import { queSigue, tieneParaSola } from '../src/renderer/secciones/proyecto/frentes'

let raiz: string

async function escribir(ruta: string, texto: string) {
  await mkdir(join(raiz, ruta, '..'), { recursive: true })
  await writeFile(join(raiz, ruta), texto)
}

const ESTADO = `# Estado del proyecto

## Hito actual
10 — Operación — en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 10 | Operación | en curso | \`10-operacion.md\` |

## Módulos
| Frente | Tipo | Paso | Estado |
|---|---|---|---|
| Galería (\`modulos/galeria/estado.md\`) | sección | 7. Construcción | en curso |
| Avisos (\`modulos/avisos/estado.md\`) | sección | 8. Calidad | en pausa |
| Exportar (T-20) | sección | 1. Propuesta | pendiente |

## Preguntas abiertas
- **Q-5 — Elegí cómo se ve la galería**
  Tipo: decisión · Frente: Galería
  Opciones: A) Grilla · B) Lista
- **Q-6 — Probá el sonido**
  Tipo: prueba · Frente: avisos
- **Q-7 — ¿PDF o HTML?**
  Tipo: decisión · Frente: Exportar
  Opciones: A) PDF · B) HTML
- **Q-8 — Probá el arranque**
  Tipo: prueba
- **Q-9 — Una de un frente que ya no está**
  Tipo: prueba · Frente: Viejo

## Próximo paso
Seguir.
`

const GALERIA = `# Estado del módulo: Galería

**Última actualización:** 2026-11-20

## Ruta
- [x] Mostrar las fotos (GA-I1)
- [ ] Elegir la forma (Q-5)
- [ ] Ordenar por fecha (T-11, chico, sola)
  - [ ] Agrupar por mes (mediano)
`

const AVISOS = `# Estado del módulo: Avisos

**Última actualización:** 2026-11-21

## Ruta
- [x] Avisar cuando termina
- [ ] Sonar al terminar (Q-6)
`

beforeEach(async () => {
  raiz = await mkdtemp(join(tmpdir(), 'iridium-fs3-'))
  await escribir('docs/estado.md', ESTADO)
  await escribir('docs/README.md', '# Docs\n\n**Framework:** 2026-11-17\n')
  await escribir(
    'docs/trabajo.md',
    '# Trabajo\n\n## T-11 — Ordenar por fecha\nEstado: pendiente · Frente: Galería · Fecha: 2026-11-17\n',
  )
  await escribir('docs/modulos/galeria/estado.md', GALERIA)
  await escribir('docs/modulos/avisos/estado.md', AVISOS)
})
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 })
})

async function mapa() {
  const m = mapaDe(await new Documentos().de(raiz), await leerPreguntasAbiertas(raiz))
  if (m.tipo !== 'mapa') throw new Error(m.tipo)
  return m
}

describe('El tablero Frentes (FS-I3)', () => {
  it('cada pregunta va a su frente, por el nombre o la carpeta; sin frente o con uno que no está, al Núcleo', async () => {
    const m = await mapa()
    const de = (clave: string) => m.frentes.find((f) => f.clave === clave)?.preguntas.map((q) => q.codigo)
    expect(de('galeria')).toEqual(['Q-5'])
    expect(de('avisos')).toEqual(['Q-6'])
    expect(m.porEmpezar.frentes.map((f) => [f.nombre, f.preguntas.map((q) => q.codigo)])).toEqual([
      ['Exportar', ['Q-7']],
    ])
    expect(m.nucleo.map((q) => q.codigo)).toEqual(['Q-8', 'Q-9'])
    expect(m.frentes[0]?.preguntas[0]).toEqual({
      codigo: 'Q-5',
      titulo: 'Elegí cómo se ve la galería',
      tipo: 'decisión',
    })
  })

  it('la fecha de cada frente, para ordenar las tarjetas', async () => {
    const m = await mapa()
    expect(m.frentes.map((f) => [f.clave, f.actualizado])).toEqual([
      ['galeria', '2026-11-20'],
      ['avisos', '2026-11-21'],
    ])
  })

  it('el código al pie de cada paso: su iteración o su primer T-n', async () => {
    const pasos = (await mapa()).frentes[0]?.pasos ?? []
    expect(pasos.map((p) => p.codigo ?? null)).toEqual(['GA-I1', null, 'T-11'])
    expect(pasos[2]?.marcas).toEqual({ tamano: 'chico', sola: true })
  })

  it('lo que sigue en la tarjeta: el primero que la IA puede hacer; si todos esperan, el que te espera', async () => {
    const m = await mapa()
    expect(queSigue(m.frentes[0]?.pasos ?? [])?.texto).toBe('Ordenar por fecha')
    expect(queSigue(m.frentes[1]?.pasos ?? [])?.texto).toBe('Sonar al terminar')
    expect(queSigue([])).toBeNull()
  })

  it('el robot solo si el motor lo tomaría: con tamaño, uno que Ajustes deja y sin pregunta (paso 8)', async () => {
    const m = await mapa()
    const galeria = m.frentes[0]?.pasos ?? []
    expect(tieneParaSola(galeria, ['chico', 'mediano', 'grande'])).toBe(true)
    // Ajustes deja solo lo mediano: el único `sola` de Galería es chico, el motor no lo toma.
    expect(tieneParaSola(galeria, ['mediano'])).toBe(false)
    expect(tieneParaSola(galeria, [])).toBe(false)
    // `sola` sin tamaño: el control lo marca y el motor no lo toma; tampoco lleva robot.
    const sinTamano = galeria.map((p) => (p.marcas ? { ...p, marcas: { tamano: null, sola: true } } : p))
    expect(tieneParaSola(sinTamano, ['chico', 'mediano', 'grande'])).toBe(false)
    // Uno que espera una pregunta no cuenta.
    const espera = galeria.map((p) => (p.marcas?.sola ? { ...p, espera: 'Q-5' } : p))
    expect(tieneParaSola(espera, ['chico', 'mediano', 'grande'])).toBe(false)
  })
})

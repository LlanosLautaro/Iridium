// OR-I2: un número que manda y el amarillo solo para lo que frena (04-ux.md › Un número que manda, D-100) y la Bandeja
// de entrada con filtros por frente y las preguntas en pausa al final (W-5, H-9, OR-6).
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { colorDeCuenta, numeroDeCuenta, textoDeCuenta } from '../src/compartido/cuentas'
import type { PendienteVista } from '../src/compartido/puente'
import { Pendientes } from '../src/main/app/pendientes'
import { cambiarEstado, serializarMetadatos } from '../src/main/core/edicion'
import { armarTarjeta } from '../src/main/core/grilla'
import { leerMetadatos } from '../src/main/core/metadatos'
import { ArchivoBorradores } from '../src/main/infra/borradores'
import { enPausa, filtrosPorFrente, NUCLEO, TODOS } from '../src/renderer/secciones/pendientes/filtros'

describe('la cuenta de la bandeja', () => {
  it('sin nada no se ve; con algo es gris; con algo que frena, amarilla', () => {
    expect(colorDeCuenta(0, 0)).toBe('nada')
    expect(colorDeCuenta(3, 0)).toBe('neutra')
    expect(colorDeCuenta(3, 1)).toBe('frena')
  })

  it('se dice de una forma: «3 en la bandeja», y si frena, cuántas', () => {
    expect(textoDeCuenta(3, 0)).toBe('3 en la bandeja')
    expect(textoDeCuenta(3, 1)).toBe('3 en la bandeja; una frena el proyecto')
    expect(textoDeCuenta(4, 2)).toBe('4 en la bandeja; 2 frenan el proyecto')
    expect(numeroDeCuenta(120)).toBe('99+')
  })
})

let carpeta: string
let datos: string

const ESTADO = `# Estado

## Preguntas abiertas
- **Q-1 — ¿Lista o grilla?**
  Tipo: decisión
  Opciones: A) Lista (recomendada: entra más) · B) Grilla
- **Q-2 — Invitá a la otra persona**
  Tipo: tarea · frena · Frente: Compartir
  - [ ] La invité
- **Q-3 — ¿Más adelante?**
  Tipo: consulta · en pausa
- **Q-4 — Probá la tarjeta**
  Tipo: prueba · Frente: Orden
  - [ ] Se ve la cuenta

## Próximo paso
Seguir.
`

async function escribir(ruta: string, texto: string) {
  await mkdir(join(carpeta, ruta, '..'), { recursive: true })
  await writeFile(join(carpeta, ruta), texto)
}

async function leer(): Promise<PendienteVista[]> {
  const pendientes = new Pendientes(new ArchivoBorradores(join(datos, 'borradores.json')), () => 1000)
  const r = await pendientes.proyecto(carpeta)
  if (r.tipo !== 'ok') throw new Error(r.mensaje)
  return r.pendientes
}

beforeEach(async () => {
  carpeta = await mkdtemp(join(tmpdir(), 'iridium-or2-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-or2-datos-'))
  await escribir('docs/estado.md', ESTADO)
})

afterEach(async () => {
  await rm(carpeta, { recursive: true, force: true })
  await rm(datos, { recursive: true, force: true })
})

describe('la Bandeja de entrada', () => {
  it('primero lo que frena y la en pausa al final, marcada', async () => {
    const ps = await leer()
    expect(ps.map((p) => p.codigo)).toEqual(['Q-2', 'Q-1', 'Q-4', 'Q-3'])
    expect(ps.filter(enPausa).map((p) => p.codigo)).toEqual(['Q-3'])
  })

  it('filtra por frente con lo que queda de cada uno; la en pausa no cuenta', async () => {
    const ps = await leer()
    expect(filtrosPorFrente(ps)).toEqual([
      { clave: TODOS, nombre: 'Todos', n: 3 },
      { clave: NUCLEO, nombre: 'Núcleo', n: 1 },
      { clave: 'Compartir', nombre: 'Compartir', n: 1 },
      { clave: 'Orden', nombre: 'Orden', n: 1 },
    ])
  })

  it('con preguntas de un solo frente no hay filtros', async () => {
    await escribir(
      'docs/estado.md',
      ESTADO.replace(' · Frente: Compartir', '').replace(' · Frente: Orden', ''),
    )
    expect(filtrosPorFrente(await leer())).toEqual([])
  })

  it('una respondida sin procesar sigue en su frente pero no suma', async () => {
    await escribir('docs/respuestas/Q-2.md', '# Q-2 — Invitá a la otra persona\n\n- [x] La invité\n')
    const filtros = filtrosPorFrente(await leer())
    expect(filtros.find((f) => f.clave === 'Compartir')?.n).toBe(0)
    expect(filtros[0]?.n).toBe(2)
  })
})

describe('el nombre de la ficha (OR-10)', () => {
  const armar = (json: object) =>
    armarTarjeta({
      nombre: 'carpeta-alfa',
      ruta: 'C:/p/carpeta-alfa',
      metadatos: leerMetadatos(JSON.stringify(json)),
      guia: null,
      icono: null,
      preguntas: { sinResponder: 0, frenan: 0, respondidas: 0 },
    })

  it('la tarjeta usa `nombre` si lo tiene, y si no, la carpeta', () => {
    expect(armar({ version: 1, estado: 'en-uso', nombre: 'Alfa' })).toMatchObject({
      nombre: 'Alfa',
      inicial: 'A',
    })
    expect(armar({ version: 1, estado: 'en-uso' }).nombre).toBe('carpeta-alfa')
    expect(armar({ version: 1, estado: 'en-uso', nombre: '  ' }).nombre).toBe('carpeta-alfa')
  })

  it('se conserva al cambiar la ficha desde Iridium', () => {
    const m = cambiarEstado(leerMetadatos('{"version":1,"estado":"en-uso","nombre":"Alfa"}'), 'pausado')
    expect(typeof m === 'string' ? m : JSON.parse(serializarMetadatos(m)).nombre).toBe('Alfa')
  })
})

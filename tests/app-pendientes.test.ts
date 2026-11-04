// Casos de uso de Pendientes (I-3) con un proyecto de verdad en una carpeta temporal: leer los pendientes con lo que
// citan, responder (sin pisar lo que cambió afuera), guardar a medias fuera del proyecto y ver un documento.
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { PendienteVista } from '../src/compartido/puente'
import { borradorVacio } from '../src/compartido/respuestas'
import { Pendientes } from '../src/main/app/pendientes'
import { ArchivoBorradores } from '../src/main/infra/borradores'

let carpeta: string
let datos: string
let pendientes: Pendientes

const ESTADO = `# Estado

## Preguntas abiertas
- **Q-7 — ¿La miniatura es 3D o plana?**
  Tipo: decisión
  Contexto: D-032 (miniaturas), \`04-ux.md\` › W-14. Opciones: A) 3D (recomendada) · B) plana.
- **Q-8 — ¿I-4 funciona?**
  Tipo: prueba · frena
  Contexto: seguí \`07-construccion.md\` › I-4.
  - [ ] Abre la app
  - [ ] Clasifica
- **Q-9 — ¿Qué nombre le ponemos?**
- **Q-5 — ¿Vieja?**

## Próximo paso
Seguir.
`

async function escribir(ruta: string, texto: string) {
  await mkdir(join(carpeta, ruta, '..'), { recursive: true })
  await writeFile(join(carpeta, ruta), texto)
}

async function leer(): Promise<PendienteVista[]> {
  const r = await pendientes.proyecto(carpeta)
  if (r.tipo !== 'ok') throw new Error(r.mensaje)
  return r.pendientes
}

beforeEach(async () => {
  carpeta = await mkdtemp(join(tmpdir(), 'iridium-pend-'))
  datos = await mkdtemp(join(tmpdir(), 'iridium-pend-datos-'))
  pendientes = new Pendientes(new ArchivoBorradores(join(datos, 'borradores.json')), () => 1000)
  await escribir('docs/estado.md', ESTADO)
  await escribir('docs/decisiones.md', '# Decisiones\n\n## D-032 — Miniaturas\nSe generan al importar.\n')
  await escribir('docs/04-ux.md', '# UX\n\n### W-14 — Galería\nGrilla de cuatro columnas.\n')
  await escribir('docs/07-construccion.md', '# Construcción\n\n### I-4 — Clasificar\nLa prueba.\n')
  await escribir('docs/respuestas/Q-5.md', '# Q-5 — ¿Vieja?\n\nSí.\n\n> Procesada el 2026-10-20 → D-1\n')
})

afterEach(async () => {
  await rm(carpeta, { recursive: true, force: true })
  await rm(datos, { recursive: true, force: true })
})

describe('Pendientes', () => {
  it('lee los pendientes en el orden de W-5, con tipo, opciones, puntos y lo que citan (H-9)', async () => {
    const ps = await leer()
    // Primero la que frena; las procesadas no están.
    expect(ps.map((p) => p.codigo)).toEqual(['Q-8', 'Q-7', 'Q-9'])
    const [q8, q7, q9] = ps
    expect(q8).toMatchObject({ tipo: 'prueba', frena: true, puntos: ['Abre la app', 'Clasifica'] })
    expect(q8?.borrador.marcas).toEqual([false, false])
    expect(q7?.opciones.map((o) => o.letra)).toEqual(['A', 'B'])
    expect(q7?.contextoHtml).toContain('data-codigo="D-32"')
    expect(q7?.contextoHtml).not.toContain('Tipo:')
    expect(q7?.citas).toMatchObject([
      { tipo: 'seccion', etiqueta: 'D-032', titulo: 'D-032 — Miniaturas', cortada: false },
      { tipo: 'seccion', etiqueta: '04-ux.md › W-14', ruta: 'docs/04-ux.md', ancla: 'w-14' },
    ])
    expect(q7?.citas[0]?.tipo === 'seccion' && q7.citas[0].html).toContain('Se generan al importar.')
    expect(q9).toMatchObject({ tipo: 'consulta', frena: false, estado: 'sin-responder', huella: '' })
  })

  it('responder escribe respuestas/Q-n.md con el formato de la guía y pasa a «respondida» (H-10)', async () => {
    const q7 = (await leer()).find((p) => p.codigo === 'Q-7')
    const r = await pendientes.responder(carpeta, {
      codigo: 'Q-7',
      borrador: { ...borradorVacio(0), opcion: 'A', nota: 'Con sombra.' },
      huella: q7?.huella ?? '',
      forzar: false,
    })
    expect(r).toMatchObject({ tipo: 'guardado', pendiente: { estado: 'respondida' } })
    expect(await readFile(join(carpeta, 'docs/respuestas/Q-7.md'), 'utf8')).toBe(
      '# Q-7 — ¿La miniatura es 3D o plana?\n\n**Opción:** A) 3D\n\nCon sombra.\n',
    )
    // Sin temporales a medio escribir.
    expect((await readdir(join(carpeta, 'docs/respuestas'))).sort()).toEqual(['Q-5.md', 'Q-7.md'])
    const otra = (await leer()).find((p) => p.codigo === 'Q-7')
    expect(otra?.borrador).toMatchObject({ opcion: 'A', nota: 'Con sombra.' })
    // Las respondidas van al final.
    expect((await leer()).at(-1)?.codigo).toBe('Q-7')
  })

  it('una prueba se responde punto por punto (H-11)', async () => {
    await pendientes.responder(carpeta, {
      codigo: 'Q-8',
      borrador: { ...borradorVacio(2), marcas: [true, false], notas: ['', 'no clasifica'] },
      huella: '',
      forzar: false,
    })
    expect(await readFile(join(carpeta, 'docs/respuestas/Q-8.md'), 'utf8')).toBe(
      '# Q-8 — ¿I-4 funciona?\n\n- [x] Abre la app\n- [ ] Clasifica — no clasifica\n',
    )
  })

  it('Postergar escribe «Postergada» con lo marcado, que le dice a la IA qué hacer (D-063)', async () => {
    const r = await pendientes.responder(carpeta, {
      codigo: 'Q-8',
      borrador: { ...borradorVacio(2), marcas: [true, false] },
      huella: '',
      forzar: false,
      postergar: true,
    })
    expect(r).toMatchObject({ tipo: 'guardado', pendiente: { estado: 'respondida', postergada: true } })
    const texto = await readFile(join(carpeta, 'docs/respuestas/Q-8.md'), 'utf8')
    expect(texto).toMatch(
      /^# Q-8 — ¿I-4 funciona\?\n\n\*\*Opción:\*\* Postergada: tomala como aprobada provisional;/,
    )
    expect(texto).toContain('dónde mirar si falla')
    expect(texto).toContain('- [x] Abre la app\n- [ ] Clasifica\n')
    // Respondida normalmente, no es postergada.
    const q7 = await pendientes.responder(carpeta, {
      codigo: 'Q-7',
      borrador: { ...borradorVacio(0), opcion: 'A' },
      huella: '',
      forzar: false,
    })
    expect(q7).toMatchObject({ tipo: 'guardado', pendiente: { postergada: false } })
  })

  it('cada pregunta dice de qué frente es: el núcleo (null) o el nombre de su módulo (D-063)', async () => {
    await escribir(
      'docs/modulos/skills/estado.md',
      '# Estado del módulo: Skills\n\n## Preguntas abiertas\n- **Q-11 — ¿Qué skills se ven?**\n  Tipo: decisión\n',
    )
    const ps = await leer()
    expect(ps.find((p) => p.codigo === 'Q-11')?.frente).toBe('Skills')
    expect(ps.find((p) => p.codigo === 'Q-8')?.frente).toBeNull()
  })

  it('si la respuesta cambió afuera desde que se leyó, no la pisa: pregunta y trae la de afuera', async () => {
    const q9 = (await leer()).find((p) => p.codigo === 'Q-9')
    await escribir('docs/respuestas/Q-9.md', '# Q-9 — ¿Qué nombre le ponemos?\n\nOsmio (desde el Gestor).\n')
    const pedido = {
      codigo: 'Q-9',
      borrador: { ...borradorVacio(0), nota: 'Iridium.' },
      huella: q9?.huella ?? '',
      forzar: false,
    }
    const r = await pendientes.responder(carpeta, pedido)
    expect(r).toMatchObject({ tipo: 'cambio', pendiente: { borrador: { nota: 'Osmio (desde el Gestor).' } } })
    expect(await readFile(join(carpeta, 'docs/respuestas/Q-9.md'), 'utf8')).toContain('Osmio')
    // «Reemplazar con la mía».
    expect(await pendientes.responder(carpeta, { ...pedido, forzar: true })).toMatchObject({
      tipo: 'guardado',
    })
    expect(await readFile(join(carpeta, 'docs/respuestas/Q-9.md'), 'utf8')).toContain('Iridium.')
  })

  it('una respuesta ya procesada no se cambia; una pregunta que ya no está, tampoco', async () => {
    await escribir(
      'docs/respuestas/Q-9.md',
      '# Q-9 — ¿Qué nombre le ponemos?\n\nX.\n\n> Procesada el 2026-10-25\n',
    )
    const base = { borrador: { ...borradorVacio(0), nota: 'Y' }, huella: '', forzar: true }
    expect(await pendientes.responder(carpeta, { codigo: 'Q-9', ...base })).toEqual({ tipo: 'procesada' })
    expect(await pendientes.responder(carpeta, { codigo: 'Q-99', ...base })).toEqual({ tipo: 'no-esta' })
  })

  it('a medias se guarda fuera del proyecto, la IA no lo ve, y Enviar lo borra (W-6, D-039)', async () => {
    const borrador = { ...borradorVacio(2), marcas: [true, false] }
    const v = await pendientes.aMedias(carpeta, 'Q-8', borrador)
    expect(v).toMatchObject({ estado: 'a-medias', borrador: { marcas: [true, false] } })
    await expect(readdir(join(carpeta, 'docs/respuestas'))).resolves.toEqual(['Q-5.md'])
    expect(JSON.parse(await readFile(join(datos, 'borradores.json'), 'utf8')).borradores).toHaveProperty(
      `${carpeta}|Q-8`,
    )
    // Otra instancia (la app reabierta) lo sigue viendo.
    const reabierta = new Pendientes(new ArchivoBorradores(join(datos, 'borradores.json')))
    const r = await reabierta.proyecto(carpeta)
    expect(r.tipo === 'ok' && r.pendientes.find((p) => p.codigo === 'Q-8')?.estado).toBe('a-medias')

    await pendientes.responder(carpeta, { codigo: 'Q-8', borrador, huella: '', forzar: false })
    expect(JSON.parse(await readFile(join(datos, 'borradores.json'), 'utf8')).borradores).toEqual({})
  })

  it('si la IA cambia la pregunta, lo guardado a medias ya no es de ella', async () => {
    await pendientes.aMedias(carpeta, 'Q-9', { ...borradorVacio(0), nota: 'algo' })
    await escribir('docs/estado.md', ESTADO.replace('¿Qué nombre le ponemos?', '¿Qué ícono le ponemos?'))
    expect((await leer()).find((p) => p.codigo === 'Q-9')?.estado).toBe('sin-responder')
  })

  it('«Ver entero» da el documento entero; una ruta fuera de la carpeta, no', async () => {
    const ok = await pendientes.documento(carpeta, 'docs/04-ux.md')
    expect(ok.tipo === 'ok' && ok.html).toContain('id="w-14"')
    expect(await pendientes.documento(carpeta, '../otro/secreto.md')).toEqual({ tipo: 'noExiste' })
    // El estado se ve con sus preguntas como texto, no con lugares vacíos para tarjetas.
    const estado = await pendientes.documento(carpeta, 'docs/estado.md')
    expect(estado.tipo === 'ok' && estado.html).toContain('¿Qué nombre le ponemos?')
  })

  it('un proyecto sin docs/ no tiene pendientes', async () => {
    const vacia = await mkdtemp(join(tmpdir(), 'iridium-pend-vacia-'))
    try {
      expect(await pendientes.proyecto(vacia)).toEqual({ tipo: 'ok', ruta: vacia, pendientes: [] })
    } finally {
      await rm(vacia, { recursive: true, force: true })
    }
  })
})

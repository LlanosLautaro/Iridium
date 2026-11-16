// ID-I1: de los `T-n` de `trabajo.md` a la lista de Ideas, y los cambios que hace Iridium en el texto (D-128 a D-130).
import { describe, expect, it } from 'vitest'
import {
  agregarIdea,
  cambiarEstado,
  cambiarTitulo,
  contarPorFiltro,
  entraEnFiltro,
  ideasDe,
  leerAnotado,
  MOTIVO_RECHAZO,
  nombreDeEnlace,
  quitarIdea,
  siguienteCodigo,
} from '../src/main/core/ideas'
import { leerTrabajo } from '../src/main/core/trabajo'

const TRABAJO = `# Trabajo

Las ideas y los pendientes.

## T-1 — Un pendiente de la IA
Estado: pendiente · Fecha: 2026-11-01
No es una idea: no aparece.

## T-2 — Una idea vieja de la IA
Estado: nueva · Fecha: 2026-11-02

## T-3 — Una mía aprobada
Estado: en curso · Idea: usuario · Fecha: 2026-11-10

## T-4 — anthropics/claude-code
Estado: nueva · Idea: enlace · Fecha: 2026-11-10 · Enlace: https://github.com/anthropics/claude-code
Mirar los hooks.

## T-5 — Rechazada
Estado: descartado · Idea: IA · Fecha: 2026-11-03
No va.

## T-6 — Un enlace revisado
Estado: hecho · Idea: enlace · Fecha: 2026-11-04 · Enlace: https://ejemplo.com/a

## T-7 — Hecha
Estado: hecho · Idea: usuario · Fecha: 2026-11-05
`

const ideas = () => ideasDe(leerTrabajo(TRABAJO).items)

describe('la lista de Ideas', () => {
  it('toma los T-n con Idea: y los nueva sin él, lo más nuevo primero', () => {
    expect(ideas().map((i) => [i.codigo, i.de, i.estado])).toEqual([
      ['T-4', 'enlace', 'sin-evaluar'],
      ['T-3', 'usuario', 'aprobada'],
      ['T-7', 'usuario', 'hecha'],
      ['T-6', 'enlace', 'hecha'],
      ['T-5', 'IA', 'rechazada'],
      ['T-2', 'IA', 'sin-evaluar'],
    ])
    expect(ideas()[0]).toMatchObject({
      enlace: 'https://github.com/anthropics/claude-code',
      texto: 'Mirar los hooks.',
    })
  })

  it('los filtros: Todo sin las hechas; un enlace revisado está en Hechas', () => {
    expect(contarPorFiltro(ideas())).toEqual({
      todo: 4,
      'para-revisar': 1,
      'sin-evaluar': 1,
      aprobadas: 1,
      rechazadas: 1,
      hechas: 2,
    })
    const hechas = ideas().filter((i) => entraEnFiltro(i, 'hechas'))
    expect(hechas.map((i) => i.codigo)).toEqual(['T-7', 'T-6'])
  })
})

describe('lo que se escribe en el campo de arriba', () => {
  it('una línea es una idea; varias, título y nota', () => {
    expect(leerAnotado('  Pegar capturas  ')).toEqual({ tipo: 'idea', titulo: 'Pegar capturas', nota: '' })
    expect(leerAnotado('## Título\ncon más\n\ndetalle')).toEqual({
      tipo: 'idea',
      titulo: 'Título',
      nota: 'con más\n\ndetalle',
    })
    expect(leerAnotado('  \n ')).toBeNull()
  })

  it('una dirección sola es un enlace; lo demás, su descripción', () => {
    expect(leerAnotado('https://github.com/a/b')).toEqual({
      tipo: 'enlace',
      url: 'https://github.com/a/b',
      descripcion: '',
    })
    expect(leerAnotado('mirar los hooks\n<https://github.com/a/b>')).toEqual({
      tipo: 'enlace',
      url: 'https://github.com/a/b',
      descripcion: 'mirar los hooks',
    })
  })

  it('una dirección dentro de una frase, o dos direcciones, es una idea', () => {
    expect(leerAnotado('ver https://a.com para el menú')).toMatchObject({ tipo: 'idea' })
    expect(leerAnotado('https://a.com\nhttps://b.com')).toMatchObject({
      tipo: 'idea',
      titulo: 'https://a.com',
    })
  })
})

describe('el nombre de un enlace (D-130)', () => {
  it('GitHub: dueño/repo; otro sitio: el último tramo; sin tramo: el sitio', () => {
    expect(nombreDeEnlace('https://github.com/anthropics/claude-code/tree/main/docs')).toEqual({
      nombre: 'anthropics/claude-code',
      sitio: 'github.com',
    })
    expect(nombreDeEnlace('https://www.ejemplo.com/blog/como-pensar%20ideas.html')).toEqual({
      nombre: 'como-pensar ideas',
      sitio: 'ejemplo.com',
    })
    expect(nombreDeEnlace('https://ejemplo.com/')).toEqual({ nombre: 'ejemplo.com', sitio: null })
    expect(nombreDeEnlace('no es una dirección')).toEqual({ nombre: 'no es una dirección', sitio: null })
  })
})

describe('los cambios en trabajo.md', () => {
  it('agrega al final con el código que sigue, sin tocar lo demás', () => {
    const { texto, codigo } = agregarIdea(TRABAJO, { titulo: 'Otra', de: 'usuario', fecha: '2026-11-16' })
    expect(codigo).toBe('T-8')
    expect(texto.startsWith(TRABAJO.trimEnd())).toBe(true)
    expect(texto.endsWith('\n\n## T-8 — Otra\nEstado: nueva · Idea: usuario · Fecha: 2026-11-16\n')).toBe(
      true,
    )
    expect(leerTrabajo(texto).items.at(-1)).toMatchObject({ codigo: 'T-8', idea: 'usuario', estado: 'nueva' })
  })

  it('un enlace con su dirección y su descripción; sin archivo, crea el título; respeta CRLF', () => {
    const { texto } = agregarIdea('', {
      titulo: 'a/b',
      de: 'enlace',
      fecha: '2026-11-16',
      enlace: 'https://github.com/a/b',
      texto: 'mirar',
    })
    expect(texto).toBe(
      '# Trabajo\n\n## T-1 — a/b\nEstado: nueva · Idea: enlace · Fecha: 2026-11-16 · Enlace: https://github.com/a/b\nmirar\n',
    )
    const crlf = agregarIdea('# Trabajo\r\n', { titulo: 'x', de: 'usuario', fecha: '2026-11-16' }).texto
    expect(crlf).toBe('# Trabajo\r\n\r\n## T-1 — x\r\nEstado: nueva · Idea: usuario · Fecha: 2026-11-16\r\n')
  })

  it('el código que sigue cuenta también los títulos mal escritos', () => {
    expect(siguienteCodigo('## T-009 — a\n## T-12: b\n')).toBe('T-13')
  })

  it('aprobar, rechazar sin motivo y volver a sin evaluar', () => {
    const aprobada = cambiarEstado(TRABAJO, 'T-2', 'pendiente') ?? ''
    expect(aprobada).toContain('## T-2 — Una idea vieja de la IA\nEstado: pendiente · Fecha: 2026-11-02\n')
    const rechazada = cambiarEstado(TRABAJO, 'T-2', 'descartado') ?? ''
    expect(rechazada).toContain(`Estado: descartado · Fecha: 2026-11-02\n${MOTIVO_RECHAZO}\n`)
    expect(leerTrabajo(rechazada).items.find((i) => i.codigo === 'T-2')?.texto).toBe(MOTIVO_RECHAZO)
    expect(cambiarEstado(rechazada, 'T-2', 'nueva')).toBe(TRABAJO)
  })

  it('rechazar con un motivo escrito lo deja; un código que no está da null', () => {
    const r = cambiarEstado(TRABAJO, 'T-4', 'descartado') ?? ''
    expect(r).toContain('Enlace: https://github.com/anthropics/claude-code\nMirar los hooks.\n')
    expect(r).not.toContain(MOTIVO_RECHAZO)
    expect(cambiarEstado(TRABAJO, 'T-99', 'pendiente')).toBeNull()
  })

  it('un ítem sin línea de datos la recibe', () => {
    expect(cambiarEstado('# Trabajo\n\n## T-1 — a\ntexto\n', 'T-1', 'pendiente')).toBe(
      '# Trabajo\n\n## T-1 — a\nEstado: pendiente\ntexto\n',
    )
  })

  it('cambia el título y saca un ítem entero', () => {
    expect(cambiarTitulo(TRABAJO, 'T-3', '  Mía,\n con otro título ')).toContain(
      '## T-3 — Mía, con otro título\n',
    )
    expect(cambiarTitulo(TRABAJO, 'T-3', '   ')).toBeNull()
    const sin = quitarIdea(TRABAJO, 'T-4') ?? ''
    expect(sin).not.toContain('T-4')
    expect(sin).not.toContain('Mirar los hooks.')
    expect(sin).toContain('Fecha: 2026-11-10\n\n## T-5 — Rechazada')
    const sinUltima = quitarIdea(TRABAJO, 'T-7') ?? ''
    expect(sinUltima.endsWith('Enlace: https://ejemplo.com/a\n')).toBe(true)
  })
})

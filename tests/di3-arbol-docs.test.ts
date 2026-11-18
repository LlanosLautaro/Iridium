// DI-I3, tanda 11: el árbol de Docs (docs/diseno/pantallas/docs.html).
import { describe, expect, it } from 'vitest'
import { arbolDeDocs, contiene, type NodoDoc } from '../src/renderer/secciones/proyecto/arbolDocs'

/** El árbol como texto: una línea por nodo, con dos espacios por nivel y «/» al final de las carpetas. */
function dibujar(nodos: NodoDoc[], nivel = 0): string[] {
  return nodos.flatMap((n) =>
    n.tipo === 'doc'
      ? [`${'  '.repeat(nivel)}${n.nombre}`]
      : [`${'  '.repeat(nivel)}${n.nombre}/`, ...dibujar(n.hijos, nivel + 1)],
  )
}

describe('el árbol de Docs', () => {
  const lista = [
    'docs/estado.md',
    'docs/perfil-proyecto.md',
    'docs/00-idea.md',
    'docs/10-operacion.md',
    'docs/decisiones.md',
    'docs/trabajo.md',
    'docs/modulos/diseno/estado.md',
    'docs/modulos/diseno/ux.md',
    'docs/modulos/orden/estado.md',
    'docs/research/costo.md',
    'docs/research/viejo/notas.md',
    'README.md',
  ]

  it('los sueltos arriba; después Hitos, Frentes (una carpeta por frente) y las demás carpetas', () => {
    expect(dibujar(arbolDeDocs(lista))).toEqual([
      'estado.md',
      'perfil-proyecto.md',
      'decisiones.md',
      'trabajo.md',
      'README.md',
      'Hitos/',
      '  00-idea.md',
      '  10-operacion.md',
      'Frentes/',
      '  diseno/',
      '    estado.md',
      '    ux.md',
      '  orden/',
      '    estado.md',
      'research/',
      '  costo.md',
      '  viejo/',
      '    notas.md',
    ])
  })

  it('sin hitos ni frentes, no hay carpetas vacías', () => {
    expect(dibujar(arbolDeDocs(['docs/notas.md', 'README.md']))).toEqual(['notas.md', 'README.md'])
  })

  it('sabe qué carpeta tiene el documento que se lee (para abrirla)', () => {
    const [, , , , , hitos, frentes] = arbolDeDocs(lista)
    expect(hitos && contiene(hitos, 'docs/00-idea.md')).toBe(true)
    expect(frentes && contiene(frentes, 'docs/00-idea.md')).toBe(false)
    expect(frentes && contiene(frentes, 'docs/modulos/orden/estado.md')).toBe(true)
  })
})

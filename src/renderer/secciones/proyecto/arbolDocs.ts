// El árbol de Docs (DI-I3, tanda 11; docs/diseno/pantallas/docs.html): los documentos sueltos arriba, los de los hitos
// en «Hitos», los de los frentes en «Frentes» (una carpeta por frente) y cada otra carpeta de docs/ con su nombre.
// Llega la lista ya ordenada (ordenDeDocumentos): el árbol respeta ese orden.

export type NodoDoc =
  | { tipo: 'doc'; ruta: string; nombre: string }
  | { tipo: 'carpeta'; clave: string; nombre: string; hijos: NodoDoc[] }

type Carpeta = Extract<NodoDoc, { tipo: 'carpeta' }>

const HITO = /^docs\/\d{2}-[^/]+\.md$/

/** Arma el árbol de los documentos. */
export function arbolDeDocs(lista: readonly string[]): NodoDoc[] {
  const sueltos: NodoDoc[] = []
  const carpetas: Carpeta[] = []
  const carpeta = (en: Carpeta[], clave: string, nombre: string): Carpeta => {
    let c = en.find((x) => x.clave === clave)
    if (!c) {
      c = { tipo: 'carpeta', clave, nombre, hijos: [] }
      en.push(c)
    }
    return c
  }
  const hitos: Carpeta = { tipo: 'carpeta', clave: 'hitos', nombre: 'Hitos', hijos: [] }
  const frentes: Carpeta = { tipo: 'carpeta', clave: 'docs/modulos', nombre: 'Frentes', hijos: [] }

  for (const ruta of lista) {
    const nombre = ruta.split('/').at(-1) ?? ruta
    if (HITO.test(ruta)) {
      hitos.hijos.push({ tipo: 'doc', ruta, nombre })
      continue
    }
    const partes = ruta.startsWith('docs/') ? ruta.slice(5).split('/') : [ruta]
    if (partes.length === 1) {
      sueltos.push({ tipo: 'doc', ruta, nombre })
      continue
    }
    // Las carpetas de en medio; la de los frentes se llama «Frentes».
    let actual: Carpeta =
      partes[0] === 'modulos' ? frentes : carpeta(carpetas, `docs/${partes[0]}`, partes[0] ?? '')
    for (let i = 1; i < partes.length - 1; i++) {
      const sub = actual.hijos.filter((h): h is Carpeta => h.tipo === 'carpeta')
      const clave = `docs/${partes.slice(0, i + 1).join('/')}`
      const nueva = carpeta(sub, clave, partes[i] ?? '')
      if (!actual.hijos.includes(nueva)) actual.hijos.push(nueva)
      actual = nueva
    }
    actual.hijos.push({ tipo: 'doc', ruta, nombre })
  }

  // En cada carpeta, los documentos antes que las subcarpetas.
  const ordenar = (c: Carpeta) => {
    c.hijos.sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === 'doc' ? -1 : 1))
    for (const h of c.hijos) if (h.tipo === 'carpeta') ordenar(h)
  }
  const raices = [hitos, frentes, ...carpetas].filter((c) => c.hijos.length > 0)
  for (const c of raices) ordenar(c)
  return [...sueltos, ...raices]
}

/** ¿Está el documento dentro de la carpeta (a cualquier profundidad)? */
export function contiene(c: NodoDoc, ruta: string): boolean {
  return c.tipo === 'doc' ? c.ruta === ruta : c.hijos.some((h) => contiene(h, ruta))
}

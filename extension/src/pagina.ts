// Mundo de la página (MAIN): el único que ve lo que React cuelga de cada elemento (research/revision-extension.md › 1).
// Solo lee: de un elemento marcado por el selector devuelve los componentes que lo contienen y la pila del JSX.
import { ATRIBUTO_MARCA, CANAL_PAGINA, type PistaReact } from './comun'

interface Fibra {
  type: unknown
  return: Fibra | null
  _debugStack?: { stack?: string }
}

function nombreDe(tipo: unknown): string | null {
  if (typeof tipo === 'function') {
    const f = tipo as { displayName?: string; name?: string }
    return f.displayName || f.name || null
  }
  if (tipo && typeof tipo === 'object') {
    // memo y forwardRef envuelven al componente.
    const o = tipo as { displayName?: string; render?: unknown; type?: unknown }
    return o.displayName || nombreDe(o.render) || nombreDe(o.type)
  }
  return null
}

function pistaDe(el: Element): PistaReact {
  const clave = Object.keys(el).find((k) => k.startsWith('__reactFiber$'))
  const fibra = clave ? ((el as unknown as Record<string, Fibra>)[clave] ?? null) : null
  const componentes: string[] = []
  for (let f = fibra; f && componentes.length < 8; f = f.return) {
    const n = nombreDe(f.type)
    // Solo componentes propios: los de React y las bibliotecas suelen ir con guion bajo o en minúscula.
    if (n && /^[A-Z]/.test(n) && componentes.at(-1) !== n) componentes.push(n)
  }
  return { componentes, pila: fibra?._debugStack?.stack ?? null }
}
// La marca de que la extensión está en la página: el ayudante de Electron la mira antes de recargar una ventana.
;(window as unknown as Record<symbol, boolean>)[Symbol.for('iridium-revision')] = true

window.addEventListener('message', (e) => {
  if (e.source !== window || e.data?.canal !== CANAL_PAGINA || e.data?.tipo !== 'pedir') return
  const marca = String(e.data.marca)
  const el = document.querySelector(`[${ATRIBUTO_MARCA}="${CSS.escape(marca)}"]`)
  const pista = el ? pistaDe(el) : { componentes: [], pila: null }
  window.postMessage({ canal: CANAL_PAGINA, tipo: 'pista', marca, ...pista }, '*')
})

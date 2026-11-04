// Mundo de la página: ve las propiedades que React cuelga de los nodos.
window.addEventListener('message', (e) => {
  if (e.source !== window || e.data?.tipo !== 's3-pedir-pista') return
  const el = document.querySelector(e.data.selector)
  const clave = el && Object.keys(el).find((k) => k.startsWith('__reactFiber$'))
  const fibra = clave ? el[clave] : null
  const pila = fibra?._debugStack?.stack ?? null
  const componentes = []
  for (let f = fibra; f; f = f.return) if (typeof f.type === 'function') componentes.push(f.type.name)
  window.postMessage({ tipo: 's3-pista', hayFibra: !!fibra, pila, componentes }, '*')
})

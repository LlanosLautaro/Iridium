// Mundo aislado: lo que corre la extensión. Pide la pista al mundo de la página y manda todo al service worker.
const esperar = (ms) => new Promise((r) => setTimeout(r, ms))
async function correr() {
  await esperar(800)
  const el = document.querySelector('#objetivo')
  const r = el.getBoundingClientRect()
  const pista = await new Promise((res) => {
    const oir = (e) => { if (e.source === window && e.data?.tipo === 's3-pista') { removeEventListener('message', oir); res(e.data) } }
    addEventListener('message', oir)
    window.postMessage({ tipo: 's3-pedir-pista', selector: '#objetivo' }, '*')
    setTimeout(() => res({ error: 'sin respuesta del mundo principal' }), 2000)
  })
  const reactVisibleDesdeAislado = Object.keys(el).some((k) => k.startsWith('__reactFiber$'))
  const respuesta = await chrome.runtime.sendMessage({
    tipo: 'comentario',
    url: location.href,
    texto: el.textContent.trim(),
    rect: { x: r.x, y: r.y, w: r.width, h: r.height, dpr: devicePixelRatio },
    pista,
    reactVisibleDesdeAislado
  })
  console.log('S3-RESULTADO', JSON.stringify(respuesta))
}
correr()

// Pulido (D-197): lo que anda en su maqueta. Elegir el acento y el color de lo que espera, arrastrar una pestaña
// (las demás se corren para dejarle lugar), el aviso de la esquina y el panel que se pliega.

// Arriba: cada filtro pone su token en lugar del que nombra el grupo.
for (const grupo of document.querySelectorAll('.eleccion')) {
  grupo.addEventListener('click', (e) => {
    const f = e.target.closest('.filtro')
    if (f) document.documentElement.style.setProperty(grupo.dataset.token, `var(${f.dataset.valor})`)
  })
}

// Las pestañas: la que arrastrás sigue al mouse y las que pasa se corren a su lugar; al soltar, queda ahí.
const fila = document.querySelector('.pestanas.arrastrables')
fila.addEventListener('pointerdown', (e) => {
  const p = e.target.closest('.pestana')
  if (!p) return
  const pestanas = [...fila.children]
  const inicio = pestanas.indexOf(p)
  const cajas = pestanas.map((x) => x.getBoundingClientRect())
  const paso = cajas[inicio].width + 2
  const x0 = e.clientX
  let destino = inicio
  p.classList.add('arrastrada')
  p.setPointerCapture(e.pointerId)

  const mover = (ev) => {
    const dx = ev.clientX - x0
    p.style.transform = `translateX(${dx}px)`
    const centro = cajas[inicio].left + cajas[inicio].width / 2 + dx
    destino = cajas.findIndex((c) => centro < c.right)
    if (destino < 0) destino = pestanas.length - 1
    pestanas.forEach((x, i) => {
      if (x === p) return
      const corre = inicio < destino ? i > inicio && i <= destino : i >= destino && i < inicio
      x.style.transform = corre ? `translateX(${inicio < destino ? -paso : paso}px)` : ''
    })
  }
  const soltar = () => {
    p.removeEventListener('pointermove', mover)
    p.classList.remove('arrastrada')
    for (const x of pestanas) {
      x.style.transition = 'none'
      x.style.transform = ''
    }
    const ref = destino > inicio ? pestanas[destino].nextSibling : pestanas[destino]
    if (destino !== inicio) fila.insertBefore(p, ref)
    for (const x of pestanas) x.style.transition = ''
    for (const x of fila.children) x.classList.toggle('elegida', x === p)
  }
  p.addEventListener('pointermove', mover)
  p.addEventListener('pointerup', soltar, { once: true })
})

// El aviso de la esquina entra, se queda un rato y se va.
const aviso = document.getElementById('aviso-muestra')
let tiempo
document.getElementById('mostrar-aviso').addEventListener('click', () => {
  aviso.hidden = true
  void aviso.offsetWidth
  aviso.hidden = false
  clearTimeout(tiempo)
  tiempo = setTimeout(() => (aviso.hidden = true), 4000)
})

// El panel se pliega y se despliega en vez de desaparecer.
document.getElementById('plegar').addEventListener('click', (e) => {
  const panel = document.getElementById('panel-plegable')
  panel.classList.toggle('cerrado')
  e.currentTarget.textContent = panel.classList.contains('cerrado') ? 'Desplegar el panel' : 'Plegar el panel'
})

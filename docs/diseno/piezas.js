// Lo que comparten las maquetas de Iridium: los íconos, el marco (la barra de proyectos, la de secciones, la
// conversación y la de estado) y los clics de las piezas (menús, filtros, pestañas, cuadros). No guarda nada ni habla
// con la app. Cada pantalla dice qué marco lleva en <body>: data-marco="inicio|proyecto|sin-marco" y data-seccion
// (y data-claude="sin-sesion" para ver el aviso de Claude abajo).

const ICONOS = {
  grilla: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  bandeja: '<path d="M4 13l2.5-7.5A1.5 1.5 0 0 1 7.9 4.5h8.2a1.5 1.5 0 0 1 1.4 1L20 13v5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z"/><path d="M4 13h4.5l1 2h5l1-2H20"/>',
  skills: '<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 16v4M16.5 18h4"/>',
  ideas: '<path d="M9 17.5h6M10 20.5h4"/><path d="M12 3.5a5.5 5.5 0 0 0-3.2 10c.5.4.7.9.7 1.5v.5h5v-.5c0-.6.2-1.1.7-1.5A5.5 5.5 0 0 0 12 3.5z"/>',
  ajustes: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
  mapa: '<path d="M9 4.5L3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
  trabajo: '<path d="M10 6.5h10M10 12h10M10 17.5h10"/><path d="M4 6.5l1.2 1.2L7.5 5.5M4 12l1.2 1.2L7.5 11"/><circle cx="5.5" cy="17.5" r="1"/>',
  revision: '<path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.6A7.5 7.5 0 1 1 20 11.5z"/><path d="M12 8v4M12 15h.01"/>',
  diseno: '<path d="M12 20.5a8.5 8.5 0 1 1 8.5-8.5c0 2-1.6 3-3.3 3H15a1.8 1.8 0 0 0-1.3 3.1c.6.6.3 2.4-1.7 2.4z"/><circle cx="8" cy="10.5" r="1"/><circle cx="11.5" cy="7.5" r="1"/><circle cx="15.5" cy="9" r="1"/>',
  docs: '<path d="M14 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3.5V8h4.5M9 12.5h6M9 16h6"/>',
  archivos: '<path d="M3.5 7A1.5 1.5 0 0 1 5 5.5h4.2l2 2.5H19A1.5 1.5 0 0 1 20.5 9.5V17a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17z"/>',
  git: '<circle cx="6.5" cy="5.5" r="2"/><circle cx="6.5" cy="18.5" r="2"/><circle cx="17.5" cy="8.5" r="2"/><path d="M6.5 7.5v9M17.5 10.5c0 4-11 3-11 6"/>',
  scripts: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M7.5 10l2.5 2-2.5 2M12.5 14.5h4"/>',
  menu: '<path d="M4 7h16M4 12h10M4 17h16"/>',
  inicio: '<path d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15V15h-6v5.5H5.5A1.5 1.5 0 0 1 4 19z"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  reloj: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 2"/>',
  seguir: '<path d="M8 5.5l10 6.5-10 6.5z"/>',
  cerrar: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  derecha: '<path d="M10 7l5 5-5 5"/>',
  abajo: '<path d="M7 10l5 5 5-5"/>',
  izquierda: '<path d="M14 7l-5 5 5 5"/>',
  puntos: '<circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/>',
  aviso: '<path d="M12 4l9 15.5H3z"/><path d="M12 10v4M12 17h.01"/>',
  error: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v4.5M12 15.5h.01"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  carpeta: '<path d="M3.5 7A1.5 1.5 0 0 1 5 5.5h4.2l2 2.5H19A1.5 1.5 0 0 1 20.5 9.5V17a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17z"/>',
  archivo: '<path d="M14 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3.5V8h4.5"/>',
  abrir: '<path d="M14 4.5h5.5V10M19.5 4.5L11 13"/><path d="M17 14v4.5A1.5 1.5 0 0 1 15.5 20h-10A1.5 1.5 0 0 1 4 18.5v-10A1.5 1.5 0 0 1 5.5 7H10"/>',
  buscar: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  enviar: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  claude: '<path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6L6 18"/>',
  editar: '<path d="M4.5 19.5l1-4L15.5 5.5l3 3-10 10z"/><path d="M13.5 7.5l3 3"/>',
  papelera: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 12.5h8L17 7"/>',
  descargar: '<path d="M12 4.5v10M7.5 10.5l4.5 4.5 4.5-4.5M5 19.5h14"/>',
  subir: '<path d="M12 15V5M7.5 9.5L12 5l4.5 4.5M5 19.5h14"/>',
  comentar: '<path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.6A7.5 7.5 0 1 1 20 11.5z"/>',
  ojo: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.5"/>',
}

function icono(nombre, clase = 'ic') {
  return `<svg class="${clase}" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[nombre] ?? ''}</svg>`
}

// Pone los íconos escritos como <i data-ic="nombre"></i>.
function ponerIconos(raiz = document) {
  for (const i of raiz.querySelectorAll('i[data-ic]')) i.outerHTML = icono(i.dataset.ic)
}

const SECCIONES_INICIO = [
  ['grilla', 'Proyectos', 'grilla.html', 'Ctrl+1'],
  ['skills', 'Skills', 'skills.html', 'Ctrl+2'],
  ['ideas', 'Ideas', 'ideas.html', 'Ctrl+3'],
]
const SECCIONES_PROYECTO = [
  ['bandeja', 'Bandeja de entrada', 'bandeja.html'],
  ['mapa', 'Mapa', 'mapa.html'],
  ['trabajo', 'Trabajo', 'trabajo.html'],
  ['revision', 'Revisión', 'revision.html'],
  ['diseno', 'Diseño', 'diseno.html'],
  null,
  ['docs', 'Docs', 'docs.html'],
  ['archivos', 'Archivos', 'archivos.html'],
  ['git', 'Git', 'git.html'],
  ['scripts', 'Scripts', 'scripts.html'],
]

const CONVERSACION = {
  inicio: {
    titulo: 'Ideas y proyectos',
    detalle: '',
    mensajes: '',
    seguir: false,
  },
  proyecto: {
    titulo: 'Diseño, DI-I2',
    detalle: 'Hoy, 18:40 · 3 mensajes',
    mensajes: `<div class="mensaje-yo">Seguí con Diseño</div>
      <div class="mensaje-ia"><div class="quien">IA</div>
        <div class="paso">${icono('ok')} Leí estado.md y modulos/diseno/estado.md</div>
        <div class="paso">${icono('ok')} Escribí tokens.css, piezas.css y piezas.html</div>
        <div class="texto-doc conversacion" style="margin-top:8px"><p>Las piezas ya están en <b>Diseño › Sistema</b>. Sigo con las pantallas de un proyecto: la Bandeja, el Mapa y Trabajo.</p></div>
      </div>`,
    seguir: true,
  },
}

function armarMarco() {
  const cuerpo = document.body
  const tipo = cuerpo.dataset.marco
  if (!tipo || tipo === 'sin-marco') return
  const seccion = cuerpo.dataset.seccion
  const principal = document.querySelector('main.seccion')
  const conv = CONVERSACION[tipo]
  const sinConv = cuerpo.dataset.conversacion === 'no'
  const propio = document.getElementById('conversacion')

  const marco = document.createElement('div')
  marco.className = 'marco' + (sinConv ? ' sin-conversacion' : '')

  const secciones = tipo === 'proyecto' ? SECCIONES_PROYECTO : SECCIONES_INICIO
  const botones = secciones
    .map((s) => {
      if (!s) return '<div class="sep"></div>'
      const [ic, nombre, href, atajo] = s
      const elegida = ic === seccion || (tipo === 'inicio' && seccion === ic)
      const punto = ic === 'bandeja' && tipo === 'proyecto' ? '<span class="punto ambar"></span>' : ''
      return `<a class="act${elegida ? ' elegida' : ''}" href="${href}" title="${nombre}${atajo ? ' · ' + atajo : ''}" aria-label="${nombre}">${icono(ic)}${punto}</a>`
    })
    .join('')

  const enProyecto = tipo === 'proyecto'
  // Claude solo aparece abajo cuando falla (R-21): data-claude="sin-sesion" en <body> muestra el aviso.
  const sinClaude = cuerpo.dataset.claude === 'sin-sesion'
  marco.innerHTML = `
    <a class="boton-menu" href="grilla.html" title="Inicio" aria-label="Inicio">${icono('inicio')}<span class="punto ambar"></span></a>
    <nav class="barra-proyectos" aria-label="Proyectos abiertos">
      <a class="proy${enProyecto ? ' elegido' : ''}" href="bandeja.html"><span class="punto blanco"></span>Iridium <span class="cuenta frena">2</span><span class="cerrar">${icono('cerrar')}</span></a>
      <a class="proy" href="bandeja.html"><span class="punto"></span>Alfa<span class="cerrar">${icono('cerrar')}</span></a>
    </nav>
    <nav class="actividad" aria-label="Secciones">${botones}
      <a class="act abajo${seccion === 'ajustes' ? ' elegida' : ''}" href="ajustes.html" title="Ajustes · Ctrl+," aria-label="Ajustes">${icono('ajustes')}</a>
    </nav>
    <footer class="estado-barra">
      ${sinClaude ? `<a class="senal rojo" href="ajustes.html">${icono('error')}Claude sin sesión · Iniciar sesión</a>` : ''}
      ${enProyecto ? '<span>Hito 10 · Operación</span>' : ''}
      <span class="derecha">
        <span>5 h <span class="num">34 %</span></span>
        <span>Semana <span class="num">61 %</span></span>
      </span>
    </footer>`

  marco.insertBefore(principal, marco.querySelector('.estado-barra'))

  if (!sinConv) {
    const c = propio ? { ...conv, mensajes: propio.innerHTML, titulo: propio.dataset.titulo ?? conv.titulo, detalle: propio.dataset.detalle ?? conv.detalle } : conv
    const aside = document.createElement('aside')
    aside.className = 'panel-conversacion'
    aside.setAttribute('aria-label', 'Conversación')
    aside.innerHTML = `
      <div class="cab-conv">
        <div class="nombre-conv"><b>${c.titulo}</b>${c.detalle ? `<span>${c.detalle}</span>` : ''}</div>
        <button class="boton solo-icono" title="Conversaciones anteriores">${icono('reloj')}</button>
        <button class="boton sin-fondo">${icono('mas')}Nueva</button>
        ${c.seguir ? `<button class="boton principal chico">${icono('seguir')}Continuar</button>` : ''}
      </div>
      <div class="mensajes">${c.mensajes}</div>
      <div class="compositor">
        <textarea placeholder="Escribe a la IA…" aria-label="Mensaje para la IA"></textarea>
        <div class="pie-comp">
          <button class="boton sin-fondo chico">Opus</button>
          <button class="boton sin-fondo chico">Medio</button>
          <button class="boton solo-icono chico enviar" aria-label="Enviar">${icono('enviar')}</button>
        </div>
      </div>`
    marco.insertBefore(aside, marco.querySelector('.estado-barra'))
  }
  propio?.remove()
  cuerpo.prepend(marco)
}

// Menús: un botón con data-abre="id" abre el menú con ese id debajo de él; data-contextual="id", con clic derecho.
function cerrarMenus(salvo) {
  for (const m of document.querySelectorAll('.menu.abierto')) if (m !== salvo) m.classList.remove('abierto')
}
function abrirMenu(menu, x, y) {
  cerrarMenus(menu)
  menu.classList.toggle('abierto')
  const cont = menu.offsetParent ?? document.body
  const r = cont.getBoundingClientRect()
  menu.style.left = `${Math.min(x - r.left, cont.clientWidth - menu.offsetWidth - 8)}px`
  menu.style.top = `${y - r.top}px`
}

function clics() {
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-abre]')
    if (t) {
      e.preventDefault()
      e.stopPropagation()
      const menu = document.getElementById(t.dataset.abre)
      const b = t.getBoundingClientRect()
      abrirMenu(menu, b.left, b.bottom + 4)
      return
    }
    if (!e.target.closest('.menu')) cerrarMenus()
    else if (e.target.closest('.menu button, .menu a')) cerrarMenus()

    const f = e.target.closest('.filtro')
    if (f) {
      for (const x of f.parentElement.querySelectorAll('.filtro')) x.classList.toggle('elegido', x === f)
    }
    const p = e.target.closest('.pestanas[data-vista] .pestana')
    if (p) {
      e.preventDefault()
      const grupo = p.closest('.pestanas')
      for (const x of grupo.querySelectorAll('.pestana')) x.classList.toggle('elegida', x === p)
      for (const panel of document.querySelectorAll(`[data-panel-de="${grupo.dataset.vista}"]`))
        panel.hidden = panel.dataset.panel !== p.dataset.para
    }
    const v = e.target.closest('[data-velo]')
    if (v) {
      e.preventDefault()
      const velo = document.getElementById(v.dataset.velo)
      velo.hidden = !velo.hidden
    }
    const pl = e.target.closest('[data-pliega]')
    if (pl) {
      const destino = document.getElementById(pl.dataset.pliega)
      destino.hidden = !destino.hidden
      pl.setAttribute('aria-expanded', String(!destino.hidden))
    }
  })
  document.addEventListener('contextmenu', (e) => {
    const t = e.target.closest('[data-contextual]')
    if (!t) return
    e.preventDefault()
    abrirMenu(document.getElementById(t.dataset.contextual), e.clientX, e.clientY)
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cerrarMenus()
      for (const v of document.querySelectorAll('.velo[data-se-cierra]')) v.hidden = true
    }
  })
}

ponerIconos()
armarMarco()
clics()

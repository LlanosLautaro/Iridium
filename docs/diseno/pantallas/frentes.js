// Lo que comparten las dos maquetas del tablero Frentes (frentes-a.html y frentes-b.html; modulos/frentes/ux.md › Parte 2):
// los datos de muestra, las tarjetas de la izquierda, la cabecera del frente elegido y sus preguntas. Cada maqueta dibuja
// el recorrido de tareas a su manera con window.recorrido(frente, contenedor).
//
// Un paso: t (el texto), e (hecho, tuya, pausa, descartado; sin e, lo que viene), cod (el T-n o la iteración), tam (chico,
// mediano, grande), sola, q (la pregunta que espera) y rama (sale del paso de arriba). El frente: sola (su interruptor),
// preguntas ([código, título, tipo]); núcleo, lo que no es de ningún frente; empezar, uno que espera sin carpeta.
const h = (t, cod) => ({ t, e: 'hecho', cod })
const FRENTES = [
  { nombre: 'Frentes', estado: 'En curso', sola: true,
    preguntas: [['Q-264', 'Probá que la IA avanza sola una noche', 'prueba'], ['Q-265', 'Elegí cómo se ve el tablero Frentes', 'decisión']],
    pasos: [
      h('Pensar cómo la IA trabaja sola y cómo se ve qué sigue'), h('Aprobar qué hace el avance solo y qué muestra el tablero'),
      h('Marcar en la ruta de cada frente el tamaño y si la IA sigue sola', 'FS-I1'), h('Apagar el avance solo por proyecto y por frente', 'FS-I1'),
      h('Elegir en Ajustes cuándo avanza sola', 'FS-I1'), h('Que el Arranque tome pasos solo mientras haya cuota, según su tamaño', 'FS-I2'),
      h('Contar al volver lo que hizo sola y lo que te espera', 'FS-I2'),
      { t: 'Probar el avance solo una noche', e: 'tuya', cod: 'T-113', q: 'Q-264' },
      { t: 'Dibujar el tablero Frentes: las tarjetas a la izquierda y el mapa de tareas al centro', e: 'tuya', q: 'Q-265' },
      { t: 'Medir la calidad del motor', tam: 'mediano', sola: true },
      { t: 'Construir el tablero, con las preguntas de cada frente en su lugar', cod: 'T-112', tam: 'grande' },
      { t: 'Avisar si los tamaños estimados no coinciden con lo gastado', tam: 'mediano', rama: true },
      { t: 'Medir la calidad del tablero', tam: 'mediano', sola: true } ] },
  { nombre: 'Núcleo', nucleo: true, sola: true,
    preguntas: [['Q-260', 'Probá que mandar algo espera a GitHub', 'prueba']],
    pasos: [
      h('Cerrar las ideas terminadas que seguían aprobadas', 'T-117'), h('El Arranque abre el período a las 3:00', 'T-70'),
      { t: 'Esperar a GitHub antes de mandarle algo a la IA', e: 'tuya', cod: 'T-114', q: 'Q-260' },
      { t: 'Paquetes con avisos de seguridad (hono, picomatch, minimatch)', cod: 'T-79', tam: 'chico', sola: true },
      { t: 'Una consola dentro del proyecto, para correr comandos sin salir', cod: 'T-116', tam: 'mediano' },
      { t: 'Medir si conviene un chat nuevo o seguir en el mismo', cod: 'T-68', tam: 'chico', sola: true } ] },
  { nombre: 'Compartir', estado: 'En uso', sola: true,
    preguntas: [['Q-256', 'Instalá Iridium en la otra PC con el instalador', 'tarea']],
    pasos: [
      h('Armar una copia de Iridium para otra persona'), h('Hacer público el repo para que se actualice sola'), h('Publicar una versión al día'),
      h('Arreglar el actualizador trabado en la otra PC', 'CO-I9'), h('Achicar el .zip de cada versión'),
      { t: 'Instalar Iridium como una app que se actualiza sola', e: 'tuya', cod: 'T-111', q: 'Q-256' },
      { t: 'Numerar las versiones con su lista de cambios', cod: 'T-38', tam: 'mediano', sola: true } ] },
  { nombre: 'Paridad', estado: 'En pausa', sola: true,
    pasos: [
      h('Pensar qué le falta a la conversación frente a Claude Code'), h('Aprobar qué entra en la primera parte'), h('Dibujar los comandos, los adjuntos y el pegado'),
      h('Elegir un comando con «/» arriba del cuadro', 'PA-I1'), h('Adjuntar archivos y fotos con el +', 'PA-I2'),
      h('Pegar un texto largo como ficha', 'PA-I3'), h('Medir la calidad de la primera parte'),
      { t: 'Usar los plugins de Claude Code desde las sesiones', cod: 'T-28', tam: 'grande' },
      { t: 'Usar la PC y el navegador desde las sesiones', cod: 'T-28', tam: 'grande' } ] },
  { nombre: 'Abrir', estado: 'En pausa', sola: true,
    pasos: [
      h('Abrir la app de un proyecto desde Iridium'), h('Armarla de noche si cambió', 'AB-I1'), h('Actualizarla sola al abrir', 'AB-I2'), h('Ver por qué falló un armado', 'AB-I3'),
      { t: 'Revisar que Ejecutar y la actualización sean confiables', tam: 'mediano' },
      { t: 'Avisar en «Mientras no estabas» las apps que se armaron de noche', cod: 'T-86', tam: 'chico', sola: true, rama: true },
      { t: 'Ponerla al día también en la otra PC, desde sus versiones publicadas', cod: 'T-87', tam: 'mediano', rama: true } ] },
  { nombre: 'Diseño', estado: 'En pausa', sola: true,
    pasos: [
      h('Ver y comentar las maquetas dentro de Iridium'), h('Rediseñar Iridium en negro, en maquetas', 'DI-I2'), h('Pasar al código las piezas y el marco', 'DI-I3'),
      { t: 'Pasar el bloc de Ideas', e: 'descartado' },
      { t: 'Comparar dos versiones de una pantalla lado a lado', cod: 'DI-I4', tam: 'mediano' } ] },
  { nombre: 'Skills', estado: 'En uso', sola: true,
    pasos: [h('Ver y poner al día las skills'), h('Que el framework reemplace a la guía vieja'),
      { t: 'Traer las skills que la licencia permite', cod: 'T-44', tam: 'mediano', sola: true }] },
  { nombre: 'Orden', estado: 'En pausa', sola: true,
    pasos: [h('Controlar el formato que escribe la IA'), h('Armar la Bandeja de entrada'), h('Anotar trabajo e ideas sin la IA'), h('Pasar un proyecto viejo al framework'),
      { t: 'Medir Orden con el diseño nuevo', e: 'pausa', tam: 'mediano' },
      { t: 'Que un proyecto sepa cuándo el framework le pide algo', cod: 'T-64', tam: 'grande' }] },
  { nombre: 'Apariencia y ajustes', estado: 'En uso', sola: false,
    pasos: [h('Elegir el tamaño de la letra y el zoom'), h('Poner tu nombre y el de la IA'), h('Pasar Iridium al negro, como único tema'),
      { t: 'Hacer tu propio tema con tokens, desde Ajustes', cod: 'T-75', tam: 'mediano', sola: true }] },
]
const POR_EMPEZAR = [
  { nombre: 'Plantillas', empezar: true, pasos: [
    { t: 'Plantillas de proyecto para empezar más rápido', cod: 'T-81' },
    { t: 'Probar las apps sin abrir ventanas', cod: 'T-81' } ] },
]
const ARCHIVADOS = ['Ideas', 'Arranque', 'Mapa', 'Revisión de la app', 'Inicio'].map((nombre) =>
  ({ nombre, estado: 'En uso', archivado: true, pasos: [h('Todo lo de su ruta')] }))

// El que sigue: el primero sin hacer. «Ahora» son los que te esperan antes de ese y ese mismo.
const pendiente = (p) => p.e !== 'hecho' && p.e !== 'descartado'
const sigue = (f) => f.pasos.find((p) => pendiente(p) && p.e !== 'tuya' && p.e !== 'pausa') ?? f.pasos.find(pendiente)
const tomaSola = (f) => f.sola && f.pasos.some((p) => pendiente(p) && !p.e && p.sola)
const marcas = (p) => [p.tam, p.sola ? 'sola' : ''].filter(Boolean).join(' · ')

function tarjeta(f) {
  const b = document.createElement('button')
  b.className = 'fila con-detalle fs-tarjeta' + (f.archivado ? ' archivado' : '')
  const s = sigue(f)
  const linea = f.empezar ? `${f.pasos.length} aprobados` : s ? s.t : 'Todo hecho'
  const n = f.preguntas?.length
  const sola = f.empezar || f.archivado ? '' : f.sola
    ? (tomaSola(f) ? `<span class="senal" title="Avanza sola">${icono('robot')}</span>` : '')
    : '<span class="senal">apagada</span>'
  b.innerHTML = `<span class="principal-fila"><span class="titulo-fila">${f.nombre}</span><span class="detalle">${linea}</span></span>` +
    `<span class="fs-marcas">${sola}${n ? `<span class="cuenta frena" title="${n} preguntas te esperan">${n}</span>` : ''}</span>`
  b.addEventListener('click', () => elegir(f, b))
  return b
}

function elegir(f, b) {
  for (const o of document.querySelectorAll('.fs-tarjeta')) o.classList.remove('elegida')
  b.classList.add('elegida')
  const zona = document.getElementById('frente')
  const estado = f.nucleo ? 'Lo que no es de ningún frente' : f.empezar ? 'Por empezar' : f.archivado ? 'Archivado' : f.estado
  const derecha = f.empezar
    ? '<button class="boton sin-fondo chico"><i data-ic="claude"></i>Empezar este frente</button>'
    : f.archivado ? '' : `<label class="interruptor"><input type="checkbox"${f.sola ? ' checked' : ''}><span>${f.sola ? 'Avanza sola' : 'No avanza sola'}</span></label>`
  const preguntas = f.preguntas?.length
    ? `<section class="bloque fs-preguntas"><h3 class="bloque-titulo">Te esperan <span class="cuenta frena">${f.preguntas.length}</span></h3>` +
      `<div class="filas">${f.preguntas.map(([q, t, tipo]) => `<a class="fila" href="bandeja.html"><span class="codigo">${q}</span>` +
        `<span class="principal-fila"><span class="titulo-fila">${t}</span></span><span class="meta">${tipo}</span></a>`).join('')}</div></section>`
    : ''
  zona.innerHTML = `<div class="fs-cab"><h2>${f.nombre}</h2><span class="gris-3">${estado}</span><span class="derecha">${derecha}</span></div>` +
    preguntas + '<div class="fs-recorrido"></div>'
  const inter = zona.querySelector('.interruptor input')
  inter?.addEventListener('change', () => {
    f.sola = inter.checked
    inter.nextElementSibling.textContent = f.sola ? 'Avanza sola' : 'No avanza sola'
    const nueva = tarjeta(f)
    b.replaceWith(nueva)
    nueva.classList.add('elegida')
    b = nueva
  })
  // Uno por empezar no tiene ruta todavía: lo aprobado para él, en filas; la ruta la escribe la IA al empezarlo.
  if (f.empezar) zona.querySelector('.fs-recorrido').innerHTML = `<section class="bloque"><h3 class="bloque-titulo">Aprobado</h3><div class="filas">` +
    f.pasos.map((p) => `<div class="fila"><span class="codigo">${p.cod}</span><span class="principal-fila"><span class="titulo-fila">${p.t}</span></span></div>`).join('') + '</div></section>'
  else window.recorrido(f, zona.querySelector('.fs-recorrido'))
  ponerIconos(zona)
}

function armarTablero() {
  const col = document.getElementById('tarjetas')
  const ver = document.getElementById('ver-archivados')
  const pintar = () => {
    col.innerHTML = ''
    const activos = document.createElement('div')
    activos.className = 'filas'
    FRENTES.forEach((f) => activos.append(tarjeta(f)))
    col.append(activos)
    const grupo = (titulo, lista) => {
      const s = document.createElement('section')
      s.className = 'bloque'
      s.innerHTML = `<h3 class="bloque-titulo">${titulo} <span class="cuenta">${lista.length}</span></h3>`
      const fl = document.createElement('div')
      fl.className = 'filas'
      lista.forEach((f) => fl.append(tarjeta(f)))
      s.append(fl)
      col.append(s)
    }
    grupo('Por empezar', POR_EMPEZAR)
    if (ver.checked) grupo('Archivados', ARCHIVADOS)
    activos.firstChild.click()
  }
  ver.addEventListener('change', pintar)
  pintar()
}

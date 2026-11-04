// Reglas puras de la Revisión: el `R-n.md`, la pila de React y el proyecto (modulos/revision/diseno-tecnico.md › Pruebas).
import { describe, expect, test } from 'vitest'
import {
  armarComentario,
  leerComentario,
  proximoNumero,
  tituloDe,
} from '../src/main/core/revision/comentario'
import {
  candidatosDeRuta,
  direccionDe,
  esDireccionLocal,
  mapaEnLinea,
  primerMarco,
} from '../src/main/core/revision/pila'
import { proyectoPorLineaDeComandos, proyectoQueContiene } from '../src/main/core/revision/proyecto'

// La pila real que dejó React 19.3 en S-3 (spikes/S-3-revision/salida.txt), con los renglones de React adelante.
const PILA_S3 = `Error: react-stack-top-frame
    at exports.jsxDEV (http://localhost:5199/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=1a2b:250:33)
    at Tarjeta (http://localhost:5199/src/Tarjeta.jsx:9:21)
    at react-stack-bottom-frame (http://localhost:5199/node_modules/.vite/deps/react-dom_client.js?v=1a2b:17424:20)`

const BASE = {
  numero: 14,
  id: 'a1b2c3d4e5',
  texto: 'el botón queda muy pegado al título; separalo',
  archivo: { ruta: 'src/Tarjeta.jsx', linea: 6 },
  componentes: ['Tarjeta', 'App'],
  url: 'http://localhost:5173/ajustes',
  elemento: { etiqueta: 'button', texto: 'Guardar', selector: 'main > div.tarjeta > button' },
  conCaptura: true,
  fecha: new Date(2026, 9, 28, 14, 32),
}

describe('el archivo R-n.md', () => {
  test('se escribe con el formato del diseño técnico y se vuelve a leer igual', () => {
    const texto = armarComentario(BASE)
    expect(texto).toContain('# R-14 — el botón queda muy pegado al título; separalo')
    expect(texto).toContain('<!-- id: a1b2c3d4e5 -->')
    expect(texto).toContain('**Estado:** abierto')
    expect(texto).toContain('**Dónde:** `src/Tarjeta.jsx`, línea 6')
    expect(texto).toContain('**Componentes:** Tarjeta › App')
    expect(texto).toContain(
      '**Elemento:** `button` · texto «Guardar» · selector `main > div.tarjeta > button`',
    )
    expect(texto).toContain('**Captura:** ![R-14](R-14.png)')
    expect(texto).toContain('- 2026-10-28 14:32 — dejado')
    const c = leerComentario('R-14.md', texto)
    expect(c).toMatchObject({
      codigo: 'R-14',
      id: 'a1b2c3d4e5',
      estado: 'abierto',
      texto: BASE.texto,
      archivo: { ruta: 'src/Tarjeta.jsx', linea: 6 },
      componentes: ['Tarjeta', 'App'],
      pagina: 'http://localhost:5173/ajustes',
      captura: 'R-14.png',
      historia: [{ fecha: '2026-10-28 14:32', texto: 'dejado' }],
    })
  })

  test('lo que falta no se escribe ni se inventa', () => {
    const texto = armarComentario({ ...BASE, archivo: null, componentes: [], conCaptura: false })
    expect(texto).not.toContain('**Dónde:**')
    expect(texto).not.toContain('**Componentes:**')
    expect(texto).not.toContain('**Captura:**')
    expect(leerComentario('R-14.md', texto)).toMatchObject({ archivo: null, captura: null, componentes: [] })
  })

  test('cerrado por la IA y reabierto: se lee el estado y la historia', () => {
    const cerrado = armarComentario(BASE)
      .replace('**Estado:** abierto', '**Estado:** cerrado')
      .replace('— dejado', '— dejado\n- 2026-10-28 14:50 — cerrado por la IA: separó el título con 12 px')
    const c = leerComentario('R-14.md', cerrado)
    expect(c?.estado).toBe('cerrado')
    expect(c?.historia.at(-1)?.texto).toBe('cerrado por la IA: separó el título con 12 px')
    expect(leerComentario('R-14.md', cerrado.replace('cerrado\n', 'en revisión\n'))?.estado).toBe('abierto')
  })

  test('un archivo que no es un comentario no se lee', () => {
    expect(leerComentario('R-3.md', '# Notas sueltas\n\nsin estado')).toBeNull()
    expect(leerComentario('notas.md', armarComentario(BASE))).toBeNull()
  })

  test('el texto con comillas invertidas o varias líneas no rompe el archivo', () => {
    const texto = armarComentario({
      ...BASE,
      texto: 'primera línea\nsegunda con `código`',
      elemento: { etiqueta: 'div', texto: 'a\nb', selector: 'div[data-x="`"]' },
    })
    expect(texto).toContain('texto «a b»')
    expect(texto).toContain('selector `` div[data-x="`"] ``')
    expect(leerComentario('R-14.md', texto)?.texto).toBe('primera línea\nsegunda con `código`')
  })

  test('el título corta en una palabra, hasta 60 caracteres', () => {
    expect(tituloDe('corto')).toBe('corto')
    const largo = tituloDe(
      'cuando la lista de fases tiene más de doce entradas el último elemento queda tapado por el pie',
    )
    expect(largo.length).toBeLessThanOrEqual(61)
    expect(largo.endsWith('…')).toBe(true)
    expect(largo).toBe('cuando la lista de fases tiene más de doce entradas el…')
  })

  test('el próximo número es el mayor más uno, sin reusar huecos', () => {
    expect(proximoNumero([])).toBe(1)
    expect(proximoNumero(['R-1.md', 'R-1.png', 'R-7.md', 'r-3.md', 'notas.md'])).toBe(8)
  })
})

describe('la pila de React', () => {
  test('el primer renglón del proyecto, salteando React y los módulos de Vite', () => {
    expect(primerMarco(PILA_S3)).toEqual({
      url: 'http://localhost:5199/src/Tarjeta.jsx',
      linea: 9,
      columna: 21,
    })
    expect(primerMarco(null)).toBeNull()
    expect(primerMarco('at x (https://ejemplo.com/app.js:1:1)')).toBeNull()
  })

  test('solo direcciones de la PC, y la misma app por cualquiera de sus nombres', () => {
    expect(esDireccionLocal('http://127.0.0.1:5173/x')).toBe(true)
    expect(esDireccionLocal('http://[::1]:5173/x')).toBe(true)
    expect(esDireccionLocal('http://localhost.ejemplo.com/x')).toBe(false)
    expect(esDireccionLocal('file:///C:/x')).toBe(false)
    expect(direccionDe('http://127.0.0.1:5173/ajustes')).toBe('localhost:5173')
    expect(direccionDe('http://[::1]:5173/')).toBe('localhost:5173')
    expect(direccionDe('https://github.com/')).toBeNull()
  })

  test('el mapa pegado al módulo', () => {
    const mapa = JSON.stringify({ version: 3, sources: ['Tarjeta.jsx'], mappings: '' })
    const codigo = `export {}\n//# sourceMappingURL=data:application/json;base64,${Buffer.from(mapa).toString('base64')}\n`
    expect(mapaEnLinea(codigo)).toBe(mapa)
    expect(mapaEnLinea('export {}')).toBeNull()
  })

  test('las rutas posibles del archivo, sin salir del proyecto', () => {
    expect(candidatosDeRuta('http://localhost:5199/src/Tarjeta.jsx?t=1', 'Tarjeta.jsx')).toEqual([
      'src/Tarjeta.jsx',
    ])
    expect(candidatosDeRuta('http://localhost:5173/secciones/X.tsx', '/secciones/X.tsx')).toEqual([
      'secciones/X.tsx',
    ])
    expect(candidatosDeRuta('http://localhost:5173/a/b.tsx', '../../../../etc/x')).toEqual([
      'etc/x',
      'a/b.tsx',
    ])
  })
})

describe('el proyecto de una dirección', () => {
  const proyectos = [
    { nombre: 'Alfa', ruta: 'D:\\PROYECTOS\\Alfa' },
    { nombre: 'Alfabeto', ruta: 'D:\\PROYECTOS\\Alfabeto' },
    { nombre: 'Beta', ruta: 'D:\\PROYECTOS\\Beta' },
  ]

  test('por la línea de comandos del proceso, sin confundir Alfa con Alfabeto', () => {
    const vite =
      '"C:\\Program Files\\nodejs\\node.exe" "D:\\PROYECTOS\\Alfa\\node_modules\\vite\\bin\\vite.js"'
    expect(proyectoPorLineaDeComandos([vite], proyectos)?.nombre).toBe('Alfa')
    expect(
      proyectoPorLineaDeComandos(['node d:/proyectos/alfabeto/node_modules/vite/bin/vite.js'], proyectos)
        ?.nombre,
    ).toBe('Alfabeto')
  })

  test('si aparecen dos proyectos o ninguno, no adivina', () => {
    expect(
      proyectoPorLineaDeComandos(['node D:\\PROYECTOS\\Alfa\\a.js D:\\PROYECTOS\\Beta\\b.js'], proyectos),
    ).toBeNull()
    expect(proyectoPorLineaDeComandos(['node C:\\otra\\vite.js'], proyectos)).toBeNull()
    expect(proyectoPorLineaDeComandos([], proyectos)).toBeNull()
  })

  test('la carpeta de una app Electron', () => {
    expect(proyectoQueContiene('D:/PROYECTOS/Beta/out', proyectos)?.nombre).toBe('Beta')
    expect(proyectoQueContiene('D:/PROYECTOS/Betabel', proyectos)).toBeNull()
  })
})

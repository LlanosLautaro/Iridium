// La sección Diseño (frente Diseño, DS-11 a DS-13; `modulos/diseno/diseno-tecnico.md`): arma lo que se ve desde
// `docs/diseno/` del proyecto — los grupos de maquetas con su estado y sus versiones, el sistema — y marca lo que ya
// se miró. Quedarse con una versión y elegir o descartar una dirección (DI-I4) es lo único que Iridium escribe ahí.
import { createHash } from 'node:crypto'
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type {
  DireccionVista,
  GrupoMaquetas,
  MaquetaVista,
  SistemaDiseno,
  VersionVista,
  VistaDiseno,
} from '../../compartido/diseno'
import {
  archivoAnterior,
  comoAnterior,
  comoTokens,
  descripcionDireccion,
  direccionesDe,
  esDireccion,
  nombreDireccion,
  paraEncima,
  problemaDireccion,
} from '../core/diseno/direcciones'
import { leerIndice } from '../core/diseno/indice'
import {
  descripcionDe,
  esDeLaRed,
  noEsArchivo,
  referenciasDe,
  resolverReferencia,
  tituloDe,
} from '../core/diseno/maquetas'
import { tieneCodigo } from '../core/diseno/pedidos'
import { leerFichas, variablesPropias } from '../core/diseno/piezas'
import { leerTokens } from '../core/diseno/tokens'
import { carpetaVersiones, letraDe, reubicar, sinDescripcion, versionesDe } from '../core/diseno/versiones'
import { carpetaDiseno, listarDiseno } from '../infra/diseno/archivos'
import type { ArchivoVistos } from '../infra/diseno/vistos'
import { escribirAtomico } from '../infra/escritura'

interface Marca {
  ms: number
  tam: number
}

/** Lo que hace falta para armar la vista: los archivos, sus fechas y una forma de leerlos. */
interface Carpeta {
  base: string
  existentes: Set<string>
  marcas: Map<string, Marca>
  leer(archivo: string): Promise<string | null>
}

async function abrirCarpeta(proyecto: string, lista: string[]): Promise<Carpeta> {
  const base = carpetaDiseno(proyecto)
  const marcas = new Map<string, Marca>()
  await Promise.all(
    lista.map(async (f) => {
      try {
        const s = await stat(join(base, f))
        marcas.set(f, { ms: s.mtimeMs, tam: s.size })
      } catch {
        // Se borró mientras se leía.
      }
    }),
  )
  const textos = new Map<string, Promise<string | null>>()
  return {
    base,
    existentes: new Set(marcas.keys()),
    marcas,
    leer: (archivo) => {
      let t = textos.get(archivo)
      if (!t) {
        t = readFile(join(base, archivo), 'utf8').catch(() => null)
        textos.set(archivo, t)
      }
      return t
    },
  }
}

/** `AAAA-MM-DD HH:MM` (hora de la PC) en milisegundos, o null. */
function msDeFecha(fecha: string | null): number | null {
  const m = fecha ? /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(fecha) : null
  if (!m) return null
  const [, a, me, d, h, mi] = m.map(Number) as number[]
  return new Date(a ?? 0, (me ?? 1) - 1, d ?? 1, h ?? 0, mi ?? 0, 59, 999).getTime()
}

/** Una maqueta: su huella (con lo que usa), si está rota y si está pendiente de pasar al código. */
async function maqueta(
  c: Carpeta,
  archivo: string,
  nombre: string,
  enLaApp: string | null,
  vistos: ReadonlyMap<string, string> | null,
): Promise<MaquetaVista> {
  const html = c.existentes.has(archivo) ? await c.leer(archivo) : null
  let rota: string | null = html === null ? `Falta ${archivo}` : null
  const usados = new Set<string>([archivo])
  for (const r of html === null ? [] : referenciasDe(html, 'html')) {
    if (noEsArchivo(r.valor) || esDeLaRed(r.valor)) continue
    const destino = resolverReferencia(archivo, r.valor)
    // Un enlace a otra maqueta no es algo que use: solo lo que carga (hojas, scripts, imágenes).
    if (destino === null || /\.html?$/i.test(destino)) continue
    if (!c.existentes.has(destino)) rota ??= `Falta ${r.valor}`
    else usados.add(destino)
  }
  // Lo que usan las hojas (`@import`, `url()`): un nivel alcanza para tokens y piezas.
  for (const hoja of [...usados].filter((u) => /\.css$/i.test(u))) {
    const css = await c.leer(hoja)
    for (const r of css === null ? [] : referenciasDe(css, 'css')) {
      if (noEsArchivo(r.valor) || esDeLaRed(r.valor)) continue
      const destino = resolverReferencia(hoja, r.valor)
      if (destino && c.existentes.has(destino)) usados.add(destino)
    }
  }
  const huella = createHash('sha1')
    .update(
      [...usados]
        .sort()
        .map((u) => `${u}:${c.marcas.get(u)?.ms ?? 0}:${c.marcas.get(u)?.tam ?? 0}`)
        .join('|'),
    )
    .digest('hex')
    .slice(0, 12)
  const pasada = msDeFecha(enLaApp)
  const ultimo = Math.max(...[archivo, 'tokens.css', 'piezas.css'].map((u) => c.marcas.get(u)?.ms ?? 0))
  const visto = vistos?.get(archivo)
  return {
    archivo,
    nombre: nombre || (html ? tituloDe(html) : null) || archivo,
    huella,
    cambiada: vistos !== null && visto !== huella,
    rota,
    enLaApp,
    pendiente: pasada === null || ultimo > pasada,
    versiones: [],
  }
}

/** Las versiones de una maqueta del índice, cada una con su letra y la frase con que se pidió. */
async function versiones(
  c: Carpeta,
  archivo: string,
  nombre: string,
  vistos: ReadonlyMap<string, string> | null,
): Promise<VersionVista[]> {
  return Promise.all(
    versionesDe(archivo, c.existentes).map(async (v) => {
      const letra = letraDe(v)
      const html = await c.leer(v)
      const m = await maqueta(c, v, `${nombre} · versión ${letra}`, null, vistos)
      return { ...m, pendiente: false, letra, descripcion: html ? descripcionDe(html) : null }
    }),
  )
}

async function sistema(c: Carpeta, vistos: ReadonlyMap<string, string> | null): Promise<SistemaDiseno> {
  const css = c.existentes.has('tokens.css') ? await c.leer('tokens.css') : null
  const t = css === null ? null : leerTokens(css)
  const errores: SistemaDiseno['errores'] =
    t === null
      ? [{ linea: null, texto: 'Falta tokens.css' }]
      : !t.tieneRaiz
        ? [{ linea: null, texto: 'tokens.css no tiene un bloque :root con variables' }]
        : t.errores
  const piezasCss = c.existentes.has('piezas.css') ? await c.leer('piezas.css') : null
  const conocidos = new Set([
    ...(t?.tokens ?? []).map((x) => x.nombre),
    ...(piezasCss ? variablesPropias(piezasCss) : []),
  ])
  return {
    tokens: (t?.tokens ?? []).map(({ nombre, valor, grupo, uso, muestra }) =>
      muestra === undefined ? { nombre, valor, grupo, uso } : { nombre, valor, grupo, uso, muestra },
    ),
    fichas: (piezasCss ? leerFichas(piezasCss) : []).map(
      ({ codigo, nombre, grupo, paraQue, estados, tokens }) => ({
        codigo,
        nombre,
        grupo,
        paraQue,
        estados,
        tokens: tokens.map((n) => ({ nombre: n, existe: conocidos.has(n) })),
      }),
    ),
    errores,
    piezas: c.existentes.has('piezas.html') ? await maqueta(c, 'piezas.html', 'Piezas', null, vistos) : null,
  }
}

/** Las direcciones guardadas, cada una con su frase, su huella y si sus variables son las de `tokens.css`. */
async function direcciones(c: Carpeta): Promise<DireccionVista[]> {
  const tokens = c.existentes.has('tokens.css') ? await c.leer('tokens.css') : null
  const nombres = tokens === null ? null : new Set(leerTokens(tokens).tokens.map((t) => t.nombre))
  const r: DireccionVista[] = []
  for (const archivo of direccionesDe(c.existentes)) {
    const css = await c.leer(archivo)
    if (css === null) continue
    const marca = c.marcas.get(archivo)
    r.push({
      archivo,
      nombre: nombreDireccion(archivo),
      descripcion: descripcionDireccion(css),
      huella: `${Math.round(marca?.ms ?? 0)}-${marca?.tam ?? 0}`,
      css: paraEncima(css),
      problema: nombres === null ? 'Falta tokens.css' : problemaDireccion(nombres, css),
    })
  }
  return r
}

/** Lo que se ve en Diseño de un proyecto. `base` es la de las miniaturas (`maqueta://<id>/`). */
export async function vistaDiseno(
  proyecto: string,
  base: string,
  vistos: ArchivoVistos,
): Promise<VistaDiseno> {
  const lista = await listarDiseno(proyecto)
  if (!lista) {
    const raiz = await readdir(proyecto).catch(() => [] as string[])
    return { tipo: 'sin-diseno', conCodigo: tieneCodigo(raiz) }
  }
  const c = await abrirCarpeta(proyecto, lista)
  const anteriores = await vistos.de(proyecto)
  const readme = c.existentes.has('README.md') ? await c.leer('README.md') : null
  const indice = readme === null ? null : leerIndice(readme)
  const problemaIndice =
    indice === null
      ? 'Falta el índice: docs/diseno/README.md con la tabla de Pantallas'
      : !indice.tieneTabla
        ? 'El índice no tiene la tabla de Pantallas'
        : indice.faltan.length
          ? `A la tabla de Pantallas le falta ${indice.faltan.join(', ')}`
          : null
  const grupos: GrupoMaquetas[] = []
  for (const p of indice?.pantallas ?? []) {
    if (!p.archivo) continue
    const m = await maqueta(c, p.archivo, p.nombre, p.enLaApp, anteriores)
    m.versiones = await versiones(c, p.archivo, m.nombre, anteriores)
    const seccion = p.seccion || 'Pantallas'
    let g = grupos.find((x) => x.seccion === seccion)
    if (!g) {
      g = { seccion, maquetas: [] }
      grupos.push(g)
    }
    g.maquetas.push(m)
  }
  const sis = await sistema(c, anteriores)
  // La primera vez (sin nada guardado) todo cuenta como visto (`diseno-tecnico.md` › Redibujar).
  if (anteriores === null) {
    const todas = [
      ...grupos.flatMap((g) => g.maquetas.flatMap((m) => [m, ...m.versiones])),
      ...(sis.piezas ? [sis.piezas] : []),
    ]
    await vistos.marcar(proyecto, Object.fromEntries(todas.map((m) => [m.archivo, m.huella])))
  }
  return {
    tipo: 'diseno',
    base,
    carpeta: `${pathToFileURL(c.base).href}/`,
    grupos,
    sistema: sis,
    problemaIndice,
    direcciones: await direcciones(c),
  }
}

/** Agrandar una maqueta la marca vista con la huella que tiene ahora. */
export async function marcarVista(proyecto: string, archivo: string, vistos: ArchivoVistos): Promise<void> {
  const lista = await listarDiseno(proyecto)
  if (!lista?.includes(archivo)) return
  const c = await abrirCarpeta(proyecto, lista)
  const m = await maqueta(c, archivo, '', null, null)
  await vistos.marcar(proyecto, { [archivo]: m.huella })
}

/**
 * Quedarme con esta (DS-5, `diseno-tecnico.md` › Lo que Iridium escribe): con una versión, esa pasa a ser la maqueta
 * (con sus enlaces reescritos para su carpeta y sin la frase del pedido) y la de antes va a la papelera; con null, la de
 * hoy queda como está. En los dos casos la carpeta de las versiones va a la papelera: nada se pierde sin Git.
 */
export async function quedarmeConVersion(
  proyecto: string,
  archivo: string,
  version: string | null,
  papelera: (ruta: string) => Promise<void>,
): Promise<void> {
  const carpeta = carpetaVersiones(archivo)
  const lista = await listarDiseno(proyecto)
  if (!carpeta || !lista?.includes(archivo)) throw new Error('Esa maqueta ya no está')
  const todas = versionesDe(archivo, lista)
  const base = carpetaDiseno(proyecto)
  if (version !== null) {
    if (!todas.includes(version)) throw new Error('Esa versión ya no está')
    const html = await readFile(join(base, version), 'utf8')
    await papelera(join(base, ...archivo.split('/')))
    await escribirAtomico(join(base, archivo), sinDescripcion(reubicar(html, version, archivo)))
  }
  if (todas.length > 0) await papelera(join(base, ...carpeta.split('/').filter(Boolean)))
}

/** La dirección (`direcciones/<nombre>.css`), si existe en la carpeta; si no, un error que se puede mostrar. */
async function direccionQueEsta(proyecto: string, archivo: string): Promise<string[]> {
  const lista = await listarDiseno(proyecto)
  if (!esDireccion(archivo) || !lista?.includes(archivo)) throw new Error('Esa dirección ya no está')
  return lista
}

/**
 * Elegir una dirección (DS-5, `diseno-tecnico.md` › Lo que Iridium escribe): los tokens de hoy pasan a
 * `direcciones/anterior-AAAA-MM-DD.css` (con una frase que dice de dónde salieron) y la dirección pasa a ser
 * `tokens.css`; su archivo va a la papelera. Se vuelve eligiendo la anterior. Devuelve dónde quedó la de antes.
 */
export async function elegirDireccion(
  proyecto: string,
  archivo: string,
  papelera: (ruta: string) => Promise<void>,
  ahora: Date = new Date(),
): Promise<string> {
  const lista = await direccionQueEsta(proyecto, archivo)
  const base = carpetaDiseno(proyecto)
  const elegida = await readFile(join(base, ...archivo.split('/')), 'utf8')
  const hoy = await readFile(join(base, 'tokens.css'), 'utf8').catch(() => null)
  const anterior = hoy === null ? null : archivoAnterior(ahora, lista)
  if (hoy !== null && anterior !== null)
    await escribirAtomico(
      join(base, ...anterior.split('/')),
      comoAnterior(hoy, nombreDireccion(archivo), ahora),
    )
  await escribirAtomico(join(base, 'tokens.css'), comoTokens(elegida))
  await papelera(join(base, ...archivo.split('/')))
  return anterior ?? ''
}

/** Descartar una dirección: su archivo va a la papelera; las maquetas no cambian. */
export async function descartarDireccion(
  proyecto: string,
  archivo: string,
  papelera: (ruta: string) => Promise<void>,
): Promise<void> {
  await direccionQueEsta(proyecto, archivo)
  await papelera(join(carpetaDiseno(proyecto), ...archivo.split('/')))
}

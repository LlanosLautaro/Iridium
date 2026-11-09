// La sección Diseño (frente Diseño, DS-11 a DS-13; `modulos/diseno/diseno-tecnico.md`): arma lo que se ve desde
// `docs/diseno/` del proyecto — los grupos de maquetas con su estado, el sistema — y marca lo que ya se miró.
import { createHash } from 'node:crypto'
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { GrupoMaquetas, MaquetaVista, SistemaDiseno, VistaDiseno } from '../../compartido/diseno'
import { leerIndice } from '../core/diseno/indice'
import { esDeLaRed, noEsArchivo, referenciasDe, resolverReferencia, tituloDe } from '../core/diseno/maquetas'
import { tieneCodigo } from '../core/diseno/pedidos'
import { leerTokens } from '../core/diseno/tokens'
import { carpetaDiseno, listarDiseno } from '../infra/diseno/archivos'
import type { ArchivoVistos } from '../infra/diseno/vistos'

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
  }
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
  return {
    tokens: (t?.tokens ?? []).map(({ nombre, valor, grupo, uso }) => ({ nombre, valor, grupo, uso })),
    errores,
    piezas: c.existentes.has('piezas.html') ? await maqueta(c, 'piezas.html', 'Piezas', null, vistos) : null,
  }
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
    const todas = [...grupos.flatMap((g) => g.maquetas), ...(sis.piezas ? [sis.piezas] : [])]
    await vistos.marcar(proyecto, Object.fromEntries(todas.map((m) => [m.archivo, m.huella])))
  }
  return {
    tipo: 'diseno',
    base,
    carpeta: `${pathToFileURL(c.base).href}/`,
    grupos,
    sistema: sis,
    problemaIndice,
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

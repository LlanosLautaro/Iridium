// El control de un proyecto (frente Orden, OR-2): junta lo que lee y lo corre. Solo en proyectos con framework
// (`docs/README.md` con `**Framework:**`); en los demás devuelve null. Nunca escribe nada.
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { type ArchivosControl, type Aviso, correrControl, tieneFramework } from '../core/control'
import type { ArchivoLeido } from '../core/control/tipos'
import { leerFrentes, nombreDeModulo } from '../core/mapa'

async function textoSiExiste(ruta: string): Promise<string | null> {
  try {
    return await readFile(ruta, 'utf8')
  } catch {
    return null
  }
}

async function entradas(carpeta: string) {
  try {
    return await readdir(carpeta, { withFileTypes: true })
  } catch {
    return []
  }
}

/** Los `.md` de `docs/`, con la ruta relativa al proyecto. */
async function documentos(ruta: string, carpeta: string): Promise<ArchivoLeido[]> {
  const r: ArchivoLeido[] = []
  for (const e of await entradas(carpeta)) {
    const completa = join(carpeta, e.name)
    if (e.isDirectory()) r.push(...(await documentos(ruta, completa)))
    else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
      const texto = await textoSiExiste(completa)
      if (texto !== null) r.push({ ruta: relative(ruta, completa).replaceAll('\\', '/'), texto })
    }
  }
  return r
}

/** Lo que lee el control de un proyecto. */
export async function leerArchivosControl(ruta: string): Promise<ArchivosControl> {
  const docs = join(ruta, 'docs')
  const todos = await documentos(ruta, docs)
  const porRuta = new Map(todos.map((d) => [d.ruta, d.texto]))
  const estados: ArchivoLeido[] = []
  const general = porRuta.get('docs/estado.md')
  if (general !== undefined) estados.push({ ruta: 'docs/estado.md', texto: general })
  const frentes: ArchivosControl['frentes'][number][] = []
  for (const m of await entradas(join(docs, 'modulos'))) {
    if (!m.isDirectory()) continue
    const r = `docs/modulos/${m.name}/estado.md`
    const texto = porRuta.get(r)
    frentes.push({ carpeta: m.name, nombre: texto ? nombreDeModulo(texto, m.name) : m.name })
    if (texto !== undefined) estados.push({ ruta: r, texto })
  }
  // Los frentes de la tabla «Módulos» que todavía no tienen carpeta (los que esperan) también existen (A-5).
  for (const f of leerFrentes(general ?? '', true))
    if (!frentes.some((x) => x.carpeta === f.carpeta || x.nombre === f.nombre))
      frentes.push({ carpeta: f.carpeta ?? f.nombre, nombre: f.nombre })
  const respuestas = new Map<string, string>()
  for (const d of todos) {
    const codigo = /^docs\/respuestas\/(Q-\d+)\.md$/i.exec(d.ruta)?.[1]
    if (codigo) respuestas.set(codigo.toUpperCase(), d.texto)
  }
  return {
    estados,
    trabajo: porRuta.get('docs/trabajo.md') ?? null,
    respuestas,
    documentos: todos,
    frentes,
  }
}

/** Los avisos del control, o null si el proyecto no pasó al framework (ahí no corre). */
export async function controlarProyecto(ruta: string): Promise<Aviso[] | null> {
  if (!tieneFramework(await textoSiExiste(join(ruta, 'docs', 'README.md')))) return null
  return correrControl(await leerArchivosControl(ruta))
}

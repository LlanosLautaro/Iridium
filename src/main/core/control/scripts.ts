// `docs/scripts.md` (frente Abrir, D-156): la marca `**Marca:**` de lo que abre el proyecto y de cómo se arma. Un solo
// script de cada una, un tipo conocido, que vaya con su acción y `armar` solo con un `ejecutar · escritorio`.
import { esDireccionWeb, leerScriptsYMarcas, RUTA_SCRIPTS } from '../visor/scripts'
import type { Aviso, Regla } from './tipos'

const TIPOS = '`ejecutar · escritorio`, `ejecutar · página`, `ejecutar · consola` o `armar`'

export const reglaScripts: Regla = (a) => {
  const texto = a.documentos.find((d) => d.ruta === RUTA_SCRIPTS)?.texto
  if (!texto) return []
  const { scripts, sueltas } = leerScriptsYMarcas(texto)
  const avisos: Aviso[] = []
  const av = (linea: number, t: string) =>
    avisos.push({ regla: 'scripts', archivo: RUTA_SCRIPTS, linea: linea + 1, texto: t })
  for (const s of sueltas)
    av(s.linea, `«${s.seccion}» tiene **Marca:** pero no una línea **Ejecutar:** o **Abrir:**`)
  let ejecutar: string | null = null
  let armar: string | null = null
  let escritorio = false
  for (const s of scripts) {
    const e = s.marcaEscrita
    if (!e) continue
    const m = s.marca
    if (!m) {
      av(e.linea, `«${s.nombre}»: la marca «${e.texto}» no se entiende (${TIPOS})`)
      continue
    }
    if (m.tipo === 'armar') {
      if (armar) av(e.linea, `«${s.nombre}»: ya marca \`armar\` «${armar}»; va en un solo script`)
      armar ??= s.nombre
      if (s.accion !== 'ejecutar') av(e.linea, `«${s.nombre}»: \`armar\` va con **Ejecutar:** y un comando`)
      continue
    }
    if (ejecutar) av(e.linea, `«${s.nombre}»: ya marca \`ejecutar\` «${ejecutar}»; va en un solo script`)
    ejecutar ??= s.nombre
    if (m.como === 'escritorio') escritorio = true
    if (m.como === 'pagina' && s.accion !== 'abrir')
      av(
        e.linea,
        `«${s.nombre}»: \`ejecutar · página\` va con **Abrir:** y un archivo o una dirección https://`,
      )
    if (m.como !== 'pagina' && s.accion !== 'ejecutar')
      av(e.linea, `«${s.nombre}»: \`ejecutar · ${m.como}\` va con **Ejecutar:**`)
  }
  for (const s of scripts)
    if (s.accion === 'ejecutar' && esDireccionWeb(s.valor))
      av(s.linea, `«${s.nombre}»: una dirección web va con **Abrir:**, no con **Ejecutar:**`)
  if (armar && !escritorio) {
    const s = scripts.find((x) => x.marca?.tipo === 'armar')
    av(
      s?.marcaEscrita?.linea ?? 0,
      `«${armar}»: \`armar\` pide otro script marcado \`ejecutar · escritorio\``,
    )
  }
  return avisos
}

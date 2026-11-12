// Las maquetas (frente Diseño, D-105; `modulos/diseno/diseno-tecnico.md` › El control): el índice, los tokens, que
// todo sea local y exista, sin colores escritos, y que las direcciones y las versiones correspondan.
import { COLUMNAS_INDICE, esSinPasar, FECHA_EN_LA_APP, leerIndice } from '../diseno/indice'
import {
  coloresEscritos,
  esDeLaRed,
  estilosDe,
  noEsArchivo,
  referenciasDe,
  resolverReferencia,
} from '../diseno/maquetas'
import { leerTokens } from '../diseno/tokens'
import type { Aviso, Regla } from './tipos'

const BASE = 'docs/diseno/'

/** Las maquetas y hojas que se revisan: las pantallas, las versiones, las piezas y las direcciones. */
function esRevisado(ruta: string): boolean {
  return (
    /^(pantallas|versiones)\/.+\.html$/i.test(ruta) ||
    /^piezas\.(html|css)$/i.test(ruta) ||
    /^direcciones\/[^/]+\.css$/i.test(ruta)
  )
}

export const reglaDiseno: Regla = (a) => {
  const d = a.diseno
  if (!d) return []
  const avisos: Aviso[] = []
  const av = (archivo: string, linea: number | null, texto: string) =>
    avisos.push({ regla: 'diseno', archivo: BASE + archivo, linea, texto })
  const texto = new Map(d.textos.map((t) => [t.ruta, t.texto]))

  // 1–3: el índice.
  const readme = texto.get('README.md')
  if (readme === undefined)
    av(
      'README.md',
      null,
      'falta el índice: `## Pantallas` con la tabla Pantalla | Sección | Archivo | En la app',
    )
  else {
    const indice = leerIndice(readme)
    if (!indice.tieneTabla)
      av('README.md', null, 'falta `## Pantallas` con la tabla Pantalla | Sección | Archivo | En la app')
    else if (indice.faltan.length)
      av(
        'README.md',
        null,
        `a la tabla de Pantallas le falta la columna ${indice.faltan.join(', ')} (${COLUMNAS_INDICE.join(' | ')})`,
      )
    else {
      const enTabla = new Set<string>()
      for (const p of indice.pantallas) {
        enTabla.add(p.archivo)
        if (!/^pantallas\/[^/]+\.html$/i.test(p.archivo))
          av('README.md', p.linea, `«${p.archivo}» va dentro de \`pantallas/\` (relativo a \`docs/diseno/\`)`)
        else if (!d.existentes.has(p.archivo)) av('README.md', p.linea, `«${p.archivo}» no existe`)
        if (!esSinPasar(p.enLaAppTexto) && !FECHA_EN_LA_APP.test(p.enLaAppTexto))
          av('README.md', p.linea, `«En la app» es \`—\` o \`AAAA-MM-DD HH:MM\`, no «${p.enLaAppTexto}»`)
      }
      for (const f of d.existentes)
        if (/^pantallas\/[^/]+\.html$/i.test(f) && !enTabla.has(f))
          av('README.md', null, `\`${f}\` no está en la tabla de Pantallas`)
    }
  }

  // 4: los tokens.
  const tokensCss = texto.get('tokens.css')
  const tokens = tokensCss === undefined ? null : leerTokens(tokensCss)
  if (!tokens) av('tokens.css', null, 'falta `tokens.css` con los tokens como variables en `:root`')
  else if (!tokens.tieneRaiz || tokens.tokens.length === 0)
    av('tokens.css', null, 'los tokens van como variables (`--nombre: valor;`) en un bloque `:root`')
  else {
    // Cada token con su uso (D-114): la IA elige el color por lo que dice, no por cómo se ve.
    const sinUso = tokens.tokens.filter((x) => !x.uso)
    const primero = sinUso[0]
    if (primero)
      av(
        'tokens.css',
        primero.linea,
        `${sinUso.length === 1 ? 'un token sin' : `${sinUso.length} tokens sin`} su uso (${sinUso
          .slice(0, 5)
          .map((x) => x.nombre)
          .join(
            ', ',
          )}${sinUso.length > 5 ? '…' : ''}): uno por línea, con \`/* para qué se usa */\` después del \`;\``,
      )
    // Los estilos de texto (T-61, D-116): el atajo `font`, con tokens que existen.
    for (const e of tokens.tokens.filter((x) => x.grupo === 'estilos' && !x.muestra))
      av(
        'tokens.css',
        e.linea,
        `\`${e.nombre}\` no se entiende como estilo de texto: va como \`peso tamaño/interlineado letra\` (\`600 var(--tam-titulo)/1.3 var(--ui)\`), con tokens que existan`,
      )
  }

  // 5–6: todo local y existente, sin colores escritos.
  for (const t of d.textos) {
    if (!esRevisado(t.ruta)) continue
    const html = t.ruta.toLowerCase().endsWith('.html')
    for (const r of referenciasDe(t.texto, html ? 'html' : 'css')) {
      if (noEsArchivo(r.valor)) continue
      if (esDeLaRed(r.valor)) {
        av(
          t.ruta,
          r.linea,
          `«${r.valor.slice(0, 60)}» es de la red: las maquetas son todo local (letras del sistema o archivos de \`docs/diseno/\`)`,
        )
        continue
      }
      const destino = resolverReferencia(t.ruta, r.valor)
      if (destino === null)
        av(
          t.ruta,
          r.linea,
          `«${r.valor.slice(0, 60)}» sale de \`docs/diseno/\`: usá una ruta relativa dentro de la carpeta`,
        )
      else if (!d.existentes.has(destino)) av(t.ruta, r.linea, `«${r.valor.slice(0, 60)}» no existe`)
    }
    const hojas = t.ruta === 'piezas.css' ? [{ css: t.texto, linea: 1 }] : html ? estilosDe(t.texto) : []
    for (const h of hojas)
      for (const c of coloresEscritos(h.css, h.linea))
        av(
          t.ruta,
          c.linea,
          `color escrito (${c.valor}): usá un token, \`var(--…)\`, para que cambiar \`tokens.css\` cambie todas`,
        )
  }

  // 7: las direcciones y las versiones.
  if (tokens?.tieneRaiz) {
    const nombres = new Set(tokens.tokens.map((x) => x.nombre))
    for (const t of d.textos) {
      if (!/^direcciones\/[^/]+\.css$/i.test(t.ruta)) continue
      const otra = new Set(leerTokens(t.texto).tokens.map((x) => x.nombre))
      const faltan = [...nombres].filter((n) => !otra.has(n))
      const sobran = [...otra].filter((n) => !nombres.has(n))
      if (faltan.length || sobran.length)
        av(
          t.ruta,
          null,
          `una dirección tiene las mismas variables que \`tokens.css\`${faltan.length ? `; le faltan ${faltan.slice(0, 5).join(', ')}` : ''}${sobran.length ? `; sobran ${sobran.slice(0, 5).join(', ')}` : ''}`,
        )
    }
  }
  const carpetas = new Set([...d.existentes].flatMap((f) => /^versiones\/([^/]+)\//i.exec(f)?.[1] ?? []))
  for (const c of carpetas)
    if (!d.existentes.has(`pantallas/${c}.html`))
      av(`versiones/${c}/`, null, `son versiones de \`pantallas/${c}.html\`, que no existe`)
  return avisos
}

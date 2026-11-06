// Reglas de las preguntas (OR-2, A-13 a A-15): lo que está en «Preguntas abiertas» es una `Q-n` bien escrita, y las
// pruebas no viven en otra sección. Se lee con los mismos lectores que la pantalla.
import { TIPOS_PREGUNTA } from '../pendientes'
import { lineasFueraDeCodigo, partirLineas, titulos } from '../visor/lineas'
import { leerOpciones } from '../visor/preguntas'
import { type ArchivoLeido, type Aviso, type Regla, sinAcentos } from './tipos'

const SECCION = /^preguntas abiertas\b/i
const ITEM = /^ ?[-*+][ \t]+(.*)$/
const CABEZA = /^\*\*Q-\d{1,4} — .+\*\*\s*$/
const Q_SUELTA = /^(?:\*\*|__)?\s*Q-?\d/

/** Las palabras que puede llevar `Tipo:` después del tipo. */
function palabraValida(p: string, frentes: Set<string>): string | null {
  const t = sinAcentos(p.replace(/[*_`]/g, ''))
  if (/^frena(\s*\(.*\))?$/.test(t) || t === 'en pausa') return null
  const f = /^frente:\s*(.+)$/.exec(t)
  const original = /:\s*(.+?)\s*$/.exec(p)?.[1] ?? ''
  if (f?.[1]) return frentes.has(f[1].replace(/\.$/, '').trim()) ? null : `el frente «${original}» no existe`
  return `«${p.trim()}» no es una palabra de «Tipo:» (frena, en pausa, Frente: …)`
}

function avisosDeEstado(a: ArchivoLeido, frentes: Set<string>): Aviso[] {
  const avisos: Aviso[] = []
  const av = (linea: number, texto: string) =>
    avisos.push({ regla: 'preguntas', archivo: a.ruta, linea: linea + 1, texto })
  const lineas = partirLineas(a.texto)
  const ts = titulos(lineas)
  for (const [i, t] of ts.entries()) {
    if (
      /(verificaci[oó]n|pruebas?) manual|pruebas? (manuales )?pendientes|para que (lo )?pruebes/i.test(
        t.texto,
      )
    )
      av(t.n, `la sección «${t.texto}» pide algo al usuario fuera de «Preguntas abiertas»: va como una Q-n`)
    if (!SECCION.test(t.texto)) continue
    const fin = ts.slice(i + 1).find((x) => x.nivel <= t.nivel)?.n ?? lineas.length
    const dentro = lineasFueraDeCodigo(lineas).filter((l) => l.n > t.n && l.n < fin)
    for (const [j, l] of dentro.entries()) {
      if (ts.some((x) => x.n === l.n)) {
        if (Q_SUELTA.test(ts.find((x) => x.n === l.n)?.texto ?? ''))
          av(l.n, 'la pregunta es un título: va como ítem de lista, `- **Q-n — título**`')
        continue
      }
      if (l.texto.trim() === '' || /^\s/.test(l.texto)) continue
      const item = ITEM.exec(l.texto)
      if (!item) {
        if (Q_SUELTA.test(l.texto.trim()) || /^\s*Tipo:/i.test(l.texto))
          av(l.n, 'texto suelto en «Preguntas abiertas»: cada pregunta es un ítem `- **Q-n — título**`')
        continue
      }
      const cabeza = (item[1] ?? '').trim()
      if (!CABEZA.test(cabeza)) {
        if (!/^\(?ninguna\)?\.?$/i.test(cabeza))
          av(l.n, 'el ítem no empieza con `**Q-n — título**` (en negrita, con raya larga)')
        continue
      }
      // Las líneas del ítem: las sangradas que siguen, hasta el próximo ítem o un texto sin sangría.
      const cuerpo: { n: number; texto: string }[] = []
      for (const s of dentro.slice(j + 1)) {
        if (s.texto.trim() !== '' && !/^\s/.test(s.texto)) break
        if (s.texto.trim() !== '') cuerpo.push(s)
      }
      avisos.push(...avisosDePregunta(a.ruta, l.n, cabeza, cuerpo, frentes))
    }
  }
  return avisos
}

function avisosDePregunta(
  archivo: string,
  n: number,
  cabeza: string,
  cuerpo: { n: number; texto: string }[],
  frentes: Set<string>,
): Aviso[] {
  const avisos: Aviso[] = []
  const codigo = /Q-\d+/.exec(cabeza)?.[0] ?? 'La pregunta'
  const av = (linea: number, texto: string) =>
    avisos.push({ regla: 'preguntas', archivo, linea: linea + 1, texto: `${codigo}: ${texto}` })
  const primera = cuerpo[0]
  const tipo = primera ? /^\s*Tipo:\s*(.+)$/i.exec(primera.texto) : null
  if (!tipo?.[1]) {
    av(n, 'falta la línea «Tipo:» debajo del título')
    return avisos
  }
  const [nombre = '', ...resto] = tipo[1].split(/\s*·\s*/)
  const t = TIPOS_PREGUNTA.find((x) => sinAcentos(x) === sinAcentos(nombre.replace(/[*_]/g, '')))
  if (!t) av(primera?.n ?? n, `«${nombre}» no es un tipo (${TIPOS_PREGUNTA.join(', ')})`)
  for (const p of resto) {
    const mal = palabraValida(p, frentes)
    if (mal) av(primera?.n ?? n, mal)
  }
  const frentePropio = cuerpo[1] ? /^\s*Frente:\s*(.+?)\s*$/i.exec(cuerpo[1].texto) : null
  if (frentePropio?.[1] && !frentes.has(sinAcentos(frentePropio[1].replace(/[*_`.]/g, ''))))
    av(cuerpo[1]?.n ?? n, `el frente «${frentePropio[1]}» no existe`)
  const opciones = cuerpo.find((s) => /(^|[\s.;,])Opciones:/.test(s.texto))
  const casillas = cuerpo.some((s) => /^\s*[-*+]\s+\[[ xX]\]/.test(s.texto))
  if (t === 'prueba' || t === 'tarea') {
    if (opciones) av(opciones.n, `una ${t} va solo con casillas, sin «Opciones:»`)
    if (!casillas) av(n, `una ${t} lleva un \`- [ ]\` corto por cosa a mirar`)
  }
  if (t === 'decisión') {
    if (!opciones) av(n, 'una decisión lleva la línea «Opciones: A) … · B) …»')
    else if (!/^\s*Opciones:/.test(opciones.texto)) av(opciones.n, '«Opciones:» va en una línea propia')
    else {
      const leidas = leerOpciones(opciones.texto.replace(/^\s*Opciones:\s*/, ''))
      if (leidas.length < 2) av(opciones.n, 'las opciones no se entienden: `A) … · B) …`')
      else if (!leidas.some((o) => o.recomendada)) av(opciones.n, 'falta marcar la opción (recomendada)')
    }
  }
  return avisos
}

/** Las preguntas de cada `estado.md`. */
export const reglaPreguntas: Regla = (a) => {
  const frentes = new Set([
    'nucleo',
    ...a.frentes.flatMap((f) => [sinAcentos(f.carpeta), sinAcentos(f.nombre)]),
  ])
  return a.estados.flatMap((e) => avisosDeEstado(e, frentes))
}

// La ruta de cada frente (Mapa, MA-I1, D-145): que `## Ruta` sea una lista de casillas que el Mapa entiende, que nombre
// códigos que existen y que el frente en curso la tenga. Los frentes en operación o en pausa sin ruta no se avisan:
// la reciben la próxima vez que se trabaje en ellos (D-139). Además (D-174), que el trabajo cumplido no siga abierto:
// un `T-n` que la ruta solo nombra en pasos hechos, o el que originó un frente que ya está hecho. Y (D-200) que lo
// aprobado de un frente tenga lugar en su ruta: si no, la tarjeta del frente no lo cuenta y el avance solo no lo toma.
import type { Estado } from '../estados'
import { frenteDeEstado, leerFrentes, nombreDeModulo } from '../mapa'
import { leerRuta, marcasDe, marcasDudosas, origenDeFrente, type PasoRuta, trabajoDeRuta } from '../ruta'
import { leerTrabajo } from '../trabajo'
import { type Aviso, type Regla, sinAcentos } from './tipos'

function codigosQueExisten(estado: string, trabajo: string | null, respuestas: ReadonlyMap<string, string>) {
  const q = new Set([...estado.matchAll(/\*\*(Q-\d+)\s+—/g)].map((m) => m[1] ?? ''))
  for (const c of respuestas.keys()) q.add(c)
  const t = new Set([...(trabajo ?? '').matchAll(/^##\s+(T-\d+)\s+—/gm)].map((m) => m[1] ?? ''))
  return { q, t }
}

/**
 * Las marcas del paso que viene (Frentes, D-178): una palabra parecida que no es la marca, dos tamaños, o `sola` sin
 * tamaño (el avance solo no sabría si cabe). Lo hecho o descartado no se avisa.
 */
function avisosDeMarcas(linea: string, p: PasoRuta): string[] {
  if (p.marca !== 'viene') return []
  const r = marcasDudosas(linea).map(
    (x) => `«${x}» no es una marca de la ruta: \`chico\`, \`mediano\`, \`grande\` o \`sola\`, en minúscula`,
  )
  const { tamanos } = marcasDe(linea)
  if (tamanos.length > 1)
    r.push(`el paso tiene ${tamanos.length} tamaños: uno solo (\`chico\`, \`mediano\` o \`grande\`)`)
  if (p.sola && tamanos.length === 0)
    r.push(
      'un paso `sola` lleva su tamaño (`chico`, `mediano` o `grande`): sin él, el avance solo no lo toma',
    )
  return r
}

const ABIERTO: ReadonlySet<Estado> = new Set<Estado>(['nueva', 'pendiente', 'en curso', 'en pausa'])

export const reglaRuta: Regla = (a) => {
  const avisos: Aviso[] = []
  const general = a.estados.find((e) => e.ruta === 'docs/estado.md')
  const existen = codigosQueExisten(general?.texto ?? '', a.trabajo, a.respuestas)
  const estadoDe = new Map(leerTrabajo(a.trabajo ?? '').items.map((i) => [i.codigo, i]))
  const filas = leerFrentes(general?.texto ?? '', true).map((f) => ({
    ...f,
    carpeta:
      f.carpeta ?? a.frentes.find((x) => sinAcentos(x.nombre) === sinAcentos(f.nombre))?.carpeta ?? null,
  }))
  const enCurso = new Set(filas.filter((f) => f.estado === 'en curso').map((f) => f.carpeta))
  // Por `T-n` abierto, los pasos de todas las rutas que lo nombran: si todos están hechos, el trabajo también.
  const pasosDe = new Map<string, { archivo: string; linea: number; hecho: boolean }[]>()
  for (const e of a.estados) {
    const carpeta = frenteDeEstado(e.ruta)
    if (!carpeta) continue
    const fila = filas.find((f) => f.carpeta === carpeta)
    if (fila?.estado === 'hecho')
      for (const c of new Set([...fila.trabajo, ...origenDeFrente(e.texto)])) {
        const item = estadoDe.get(c)
        if (item?.estado && ABIERTO.has(item.estado))
          avisos.push({
            regla: 'ruta',
            archivo: 'docs/trabajo.md',
            linea: item.linea + 1,
            texto: `${c} originó el frente ${fila.nombre}, que está \`hecho\`, y sigue \`${item.estado}\`: pasalo a \`hecho\` (o a \`descartado\` con el motivo)`,
          })
      }
    const ruta = leerRuta(e.texto)
    if (!ruta) {
      if (enCurso.has(carpeta))
        avisos.push({
          regla: 'ruta',
          archivo: e.ruta,
          linea: null,
          texto:
            'el frente en curso no tiene `## Ruta`: sus pasos concretos en orden, uno por línea (`- [ ] Paso`)',
        })
      continue
    }
    for (const p of ruta.problemas)
      avisos.push({ regla: 'ruta', archivo: e.ruta, linea: p.linea, texto: p.texto })
    // Lo aprobado (o empezado) de este frente que la ruta no nombra ni es el trabajo que lo originó.
    const nombres = [nombreDeModulo(e.texto, carpeta), carpeta, ...(fila ? [fila.nombre] : [])].map(
      sinAcentos,
    )
    const nombrados = trabajoDeRuta(ruta)
    const origen = new Set([...(fila?.trabajo ?? []), ...origenDeFrente(e.texto)])
    for (const item of estadoDe.values())
      if (
        (item.estado === 'pendiente' || item.estado === 'en curso') &&
        item.frente &&
        nombres.includes(sinAcentos(item.frente)) &&
        !nombrados.has(item.codigo) &&
        !origen.has(item.codigo)
      )
        avisos.push({
          regla: 'ruta',
          archivo: 'docs/trabajo.md',
          linea: item.linea + 1,
          texto: `${item.codigo} está \`${item.estado}\` en el frente ${fila?.nombre ?? nombreDeModulo(e.texto, carpeta)} y su ruta no lo nombra: sumalo a \`${e.ruta}\` › Ruta como un paso \`[ ]\` donde le toca, con su tamaño (y \`sola\` si va sin el usuario)`,
        })
    const lineas = e.texto.split(/\r?\n/)
    const revisar = (ps: PasoRuta[]) => {
      for (const p of ps) {
        for (const texto of avisosDeMarcas(lineas[p.linea - 1] ?? '', p))
          avisos.push({ regla: 'ruta', archivo: e.ruta, linea: p.linea, texto })
        for (const c of p.preguntas.filter((x) => !existen.q.has(x)))
          avisos.push({
            regla: 'ruta',
            archivo: e.ruta,
            linea: p.linea,
            texto: `${c} no está en «Preguntas abiertas» ni en \`respuestas/\``,
          })
        for (const c of p.trabajo.filter((x) => !existen.t.has(x)))
          avisos.push({
            regla: 'ruta',
            archivo: e.ruta,
            linea: p.linea,
            texto: `${c} no está en \`trabajo.md\``,
          })
        for (const c of p.trabajo)
          pasosDe.set(c, [
            ...(pasosDe.get(c) ?? []),
            { archivo: e.ruta, linea: p.linea, hecho: p.marca === 'hecho' },
          ])
        revisar(p.ramas)
      }
    }
    revisar(ruta.pasos)
  }
  for (const [c, pasos] of pasosDe) {
    const item = estadoDe.get(c)
    if (!item?.estado || !ABIERTO.has(item.estado) || pasos.some((p) => !p.hecho)) continue
    const ultimo = pasos.at(-1)
    if (ultimo)
      avisos.push({
        regla: 'ruta',
        archivo: ultimo.archivo,
        linea: ultimo.linea,
        texto: `${c} está hecho en la ruta y sigue \`${item.estado}\` en \`trabajo.md\`: pasalo a \`hecho\`, o nombrá lo que le falta en un paso sin marcar`,
      })
  }
  return avisos
}

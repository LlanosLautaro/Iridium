// La ruta de cada frente (Mapa, MA-I1, D-145): que `## Ruta` sea una lista de casillas que el Mapa entiende, que nombre
// códigos que existen y que el frente en curso la tenga. Los frentes en operación o en pausa sin ruta no se avisan:
// la reciben la próxima vez que se trabaje en ellos (D-139).
import { frenteDeEstado, leerFrentes } from '../mapa'
import { leerRuta, type PasoRuta } from '../ruta'
import { type Aviso, type Regla, sinAcentos } from './tipos'

function codigosQueExisten(estado: string, trabajo: string | null, respuestas: ReadonlyMap<string, string>) {
  const q = new Set([...estado.matchAll(/\*\*(Q-\d+)\s+—/g)].map((m) => m[1] ?? ''))
  for (const c of respuestas.keys()) q.add(c)
  const t = new Set([...(trabajo ?? '').matchAll(/^##\s+(T-\d+)\s+—/gm)].map((m) => m[1] ?? ''))
  return { q, t }
}

export const reglaRuta: Regla = (a) => {
  const avisos: Aviso[] = []
  const general = a.estados.find((e) => e.ruta === 'docs/estado.md')
  const existen = codigosQueExisten(general?.texto ?? '', a.trabajo, a.respuestas)
  const enCurso = new Set(
    leerFrentes(general?.texto ?? '', true)
      .filter((f) => f.estado === 'en curso')
      .map((f) => {
        const delNombre = a.frentes.find((x) => sinAcentos(x.nombre) === sinAcentos(f.nombre))?.carpeta
        return f.carpeta ?? delNombre ?? null
      })
      .filter((c): c is string => c !== null),
  )
  for (const e of a.estados) {
    const carpeta = frenteDeEstado(e.ruta)
    if (!carpeta) continue
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
    const revisar = (ps: PasoRuta[]) => {
      for (const p of ps) {
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
        revisar(p.ramas)
      }
    }
    revisar(ruta.pasos)
  }
  return avisos
}

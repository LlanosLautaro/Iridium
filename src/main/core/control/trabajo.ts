// `docs/trabajo.md` (D-094): cada ítem con código, `Estado:` del vocabulario y `Frente:` válido; ningún código
// repetido.
import { ESTADOS } from '../estados'
import { leerTrabajo } from '../trabajo'
import { type Aviso, type Regla, sinAcentos } from './tipos'

const ARCHIVO = 'docs/trabajo.md'

export const reglaTrabajo: Regla = (a) => {
  if (a.trabajo === null)
    return [
      {
        regla: 'trabajo',
        archivo: ARCHIVO,
        linea: null,
        texto: 'falta `docs/trabajo.md` (las ideas y los pendientes)',
      },
    ]
  const frentes = new Set([
    'nucleo',
    ...a.frentes.flatMap((f) => [sinAcentos(f.carpeta), sinAcentos(f.nombre)]),
  ])
  const { items, problemas } = leerTrabajo(a.trabajo)
  const avisos: Aviso[] = problemas.map((p) => ({
    regla: 'trabajo',
    archivo: ARCHIVO,
    linea: p.linea + 1,
    texto: p.texto,
  }))
  const vistos = new Set<string>()
  for (const i of items) {
    const av = (texto: string) =>
      avisos.push({ regla: 'trabajo', archivo: ARCHIVO, linea: i.linea + 1, texto: `${i.codigo}: ${texto}` })
    if (vistos.has(i.codigo)) av('el código está repetido: renumerá el más nuevo')
    vistos.add(i.codigo)
    if (i.estadoTexto && i.estado === null) av(`«${i.estadoTexto}» no es un estado (${ESTADOS.join(', ')})`)
    if (i.frente && !frentes.has(sinAcentos(i.frente))) av(`el frente «${i.frente}» no existe`)
  }
  return avisos
}

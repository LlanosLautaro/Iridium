// Los `estado.md` (OR-5, A-21): las tablas con columna Estado usan solo el vocabulario, y el general tiene los campos
// que lee la tarjeta (fecha, hito actual, Próximo paso).
import { ESTADOS, leerEstado } from '../estados'
import { celdas, proximoPaso, seccionDeTitulo } from '../mapa'
import { lineasFueraDeCodigo, partirLineas, textoPlano } from '../visor/lineas'
import { type ArchivoLeido, type Aviso, type Regla, sinAcentos } from './tipos'

function avisosDeTablas(a: ArchivoLeido): Aviso[] {
  const avisos: Aviso[] = []
  const fuera = lineasFueraDeCodigo(partirLineas(a.texto))
  for (let i = 0; i < fuera.length; i++) {
    const cab = fuera[i]
    const sep = fuera[i + 1]
    if (!cab || !sep || !cab.texto.trim().startsWith('|') || !/^\s*\|?\s*:?-{2,}/.test(sep.texto)) continue
    const iEstado = celdas(cab.texto).findIndex((c) => sinAcentos(textoPlano(c)) === 'estado')
    let j = i + 2
    for (; j < fuera.length && (fuera[j]?.texto ?? '').trim().startsWith('|'); j++) {
      const fila = fuera[j]
      const celda = textoPlano(celdas(fila?.texto ?? '')[iEstado] ?? '').trim()
      if (iEstado < 0 || !fila || celda === '' || leerEstado(celda)) continue
      avisos.push({
        regla: 'estados',
        archivo: a.ruta,
        linea: fila.n + 1,
        texto: `«${celda.slice(0, 40)}» no es un estado (${ESTADOS.slice(0, 5).join(', ')})`,
      })
    }
    i = j - 1
  }
  return avisos
}

function avisosDeCampos(a: ArchivoLeido): Aviso[] {
  const avisos: Aviso[] = []
  const av = (texto: string) => avisos.push({ regla: 'campos', archivo: a.ruta, linea: null, texto })
  if (!/^\s*\*\*Última actualización:\*\*\s*\d{4}-\d{2}-\d{2}\s*$/m.test(a.texto))
    av('falta `**Última actualización:** AAAA-MM-DD`')
  const hito = seccionDeTitulo(a.texto, 'Hito actual').find((l) => l.trim() !== '')
  if (!hito) av('falta `## Hito actual` con la línea «N — Nombre — estado»')
  else {
    const partes = hito.split(/\s+—\s+/)
    if (partes.length < 3 || !leerEstado(partes[2] ?? ''))
      av('«Hito actual» va en una línea «N — Nombre — estado», con un estado del vocabulario')
  }
  if (!proximoPaso(a.texto)) av('falta `## Próximo paso` con una acción concreta en su primera línea')
  return avisos
}

export const reglaEstados: Regla = (a) => [
  ...a.estados.flatMap(avisosDeTablas),
  ...a.estados.filter((e) => e.ruta === 'docs/estado.md').flatMap(avisosDeCampos),
]

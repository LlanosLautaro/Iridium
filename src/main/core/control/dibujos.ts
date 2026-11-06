// Los dibujos en texto (R-13): un bloque de código con líneas de cuadro usa solo caracteres que tiene la letra de ancho
// fijo de Iridium (`docs/ui/fuentes/LEEME.txt`); uno de afuera sale de otra letra con otro ancho y desarma el cuadro.
import { partirLineas } from '../visor/lineas'
import type { Aviso, Regla } from './tipos'

const CUADRO = /[─-╿]/
/**
 * Los caracteres de JetBrains Mono que trae Iridium, sacados de la letra (`docs/ui/fuentes/`): ASCII, latín 1, la
 * puntuación, las líneas de cuadro y los bloques, y las figuras, flechas y símbolos que tiene.
 */
const FIGURAS =
  '■□▪▫▲△▴▵▶▷▸▹►▻▼▽▾▿◀◁◂◃◄◅◆◇◈◉◊○◌◎●◔◕◦◧◨◩◪◫◯◶' +
  '←↑→↓↔↕↖↗↘↙↝↞↠↢↣↥↦↧↩↪↭↾⇉⇐⇑⇒⇓⇔⇛⇞⇟⇥⇧⇨⇪' +
  '✓✕✗✶❮❯❰❱➔➜➝➞–—‘’‚“”„•…′″‹›⁄€™−∕'
const PERMITIDO = new RegExp(`^[\u0020-\u007e\u00a0-\u00ff\u2500-\u259f${FIGURAS}]$`, 'u')

export const reglaDibujos: Regla = (a) => {
  const avisos: Aviso[] = []
  for (const d of a.documentos) {
    const lineas = partirLineas(d.texto)
    let inicio = -1
    for (const [n, l] of lineas.entries()) {
      if (!/^ {0,3}(`{3,}|~{3,})/.test(l)) continue
      if (inicio < 0) {
        inicio = n
        continue
      }
      const bloque = lineas.slice(inicio + 1, n)
      if (bloque.some((x) => CUADRO.test(x))) {
        const malos = new Set([...bloque.join('')].filter((c) => !PERMITIDO.test(c)))
        if (malos.size)
          avisos.push({
            regla: 'dibujos',
            archivo: d.ruta,
            linea: inicio + 1,
            texto: `el dibujo usa ${[...malos].join(' ')}, que no está en la letra de ancho fijo: usá una figura (■ ● ▶ ✓…) o una palabra entre corchetes`,
          })
      }
      inicio = -1
    }
  }
  return avisos
}

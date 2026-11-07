// La cuenta de la bandeja (04-ux.md › Un número que manda, D-100): gris, o amarilla con «!» si algo frena (no solo
// color). Sin nada, no se dibuja.
import { colorDeCuenta, numeroDeCuenta, textoDeCuenta } from '../../compartido/cuentas'

export function Cuenta({ n, frenan, clase }: { n: number; frenan: number; clase?: string }) {
  const color = colorDeCuenta(n, frenan)
  if (color === 'nada') return null
  const texto = textoDeCuenta(n, frenan)
  return (
    <span
      className={`cuenta-bandeja${color === 'frena' ? ' frena' : ''}${clase ? ` ${clase}` : ''}`}
      title={texto}
      role="img"
      aria-label={texto}
    >
      {numeroDeCuenta(n)}
    </span>
  )
}

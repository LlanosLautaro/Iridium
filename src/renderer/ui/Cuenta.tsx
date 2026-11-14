// La cuenta de la bandeja (04-ux.md › Un número que manda, D-100), con la Cuenta de las piezas (PZ-7): gris, o ámbar si
// algo frena (no solo color: el nombre lo dice). Sin nada, no se dibuja.
import { colorDeCuenta, numeroDeCuenta, textoDeCuenta } from '../../compartido/cuentas'

export function Cuenta({ n, frenan, clase }: { n: number; frenan: number; clase?: string }) {
  const color = colorDeCuenta(n, frenan)
  if (color === 'nada') return null
  const texto = textoDeCuenta(n, frenan)
  return (
    <span
      className={`cuenta${color === 'frena' ? ' frena' : ''}${clase ? ` ${clase}` : ''}`}
      title={texto}
      role="img"
      aria-label={texto}
    >
      {numeroDeCuenta(n)}
    </span>
  )
}

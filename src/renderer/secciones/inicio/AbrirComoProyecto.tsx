// El botón de la cabecera de Ideas y de Skills (IN-3): esas carpetas no salen en la grilla, y así sus vistas de
// proyecto (Docs, Git, Scripts…) siguen a un clic.
import { Icono } from '../../ui/Icono'

export function AbrirComoProyecto({ abrir, carpeta }: { abrir: () => void; carpeta: string }) {
  return (
    <button
      type="button"
      className="btn-ic abrir-como-proyecto"
      title={`Abrir como proyecto: la carpeta ${carpeta}, con Docs, Git y lo demás`}
      aria-label="Abrir como proyecto"
      onClick={abrir}
    >
      <Icono nombre="abrir" />
    </button>
  )
}

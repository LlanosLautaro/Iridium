// Ajustes › Perfil (AJ-2): el nombre del usuario en la conversación.
import { LARGO_AJUSTES } from '../../../compartido/puente'
import type { PropsSeccion } from '../Ajustes'
import { CampoTexto } from './CampoTexto'

export function Perfil({ cambiar }: PropsSeccion) {
  return (
    <CampoTexto
      clave="nombreUsuario"
      titulo="Tu nombre"
      ayuda="Cómo te llama la IA: se ve en la conversación en lugar de «Tú»."
      sugerencia="Cómo quieres que te llame"
      largo={LARGO_AJUSTES.nombreUsuario}
      cambiar={cambiar}
    />
  )
}

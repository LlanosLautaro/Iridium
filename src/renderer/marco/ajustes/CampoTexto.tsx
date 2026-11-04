// Un texto de Ajustes que se guarda solo mientras se escribe (AJ-2): sin botón Guardar. Si no se pudo guardar,
// vuelve a lo guardado.
import { useEffect, useState } from 'react'
import type { Preferencias } from '../../../compartido/puente'
import { usarEstado } from '../../estado'
import { guardarLuego } from '../../ui/guardarLuego'
import type { PropsSeccion } from '../Ajustes'

type Clave = 'nombreUsuario' | 'nombreIa'

export function CampoTexto({
  clave,
  titulo,
  ayuda,
  sugerencia,
  largo,
  cambiar,
}: PropsSeccion & { clave: Clave; titulo: string; ayuda: string; sugerencia: string; largo: number }) {
  const guardado = usarEstado((s) => s.preferencias[clave])
  const [texto, setTexto] = useState(guardado)
  // Si cambió afuera (se leyó `config.json` o volvió atrás por un error), se muestra lo guardado.
  useEffect(() => setTexto(guardado), [guardado])
  const id = `ajuste-${clave}`
  return (
    <div className="campo-ajuste">
      <div>
        <label className="r" htmlFor={id}>
          {titulo}
        </label>
        <div className="d" id={`${id}-d`}>
          {ayuda}
        </div>
      </div>
      <input
        id={id}
        type="text"
        value={texto}
        maxLength={largo}
        placeholder={sugerencia}
        aria-describedby={`${id}-d`}
        spellCheck={false}
        onChange={(e) => {
          const valor = e.target.value
          setTexto(valor)
          guardarLuego(`ajustes|${clave}`, () => {
            void cambiar({ [clave]: valor.trim() } as Partial<Preferencias>).then((ok) => {
              if (!ok) setTexto(usarEstado.getState().preferencias[clave])
            })
          })
        }}
      />
    </div>
  )
}

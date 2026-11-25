// Ajustes › Notificaciones (T-52, D-183): el sonido cuando la IA termina su trabajo. Sin avisos de Windows: solo un
// sonido. Elegir uno lo hace sonar, para escucharlo. Y el botón para apagar la PC al terminar (T-134, D-195). Se
// guarda solo.
import type { AjusteSonido, SonidoFin } from '../../../compartido/puente'
import { usarEstado } from '../../estado'
import type { PropsSeccion } from '../Ajustes'
import { NOMBRES_SONIDO, tocarSonido } from '../sonido'
import { Ajuste } from './Ajuste'

const SONIDOS = Object.keys(NOMBRES_SONIDO) as SonidoFin[]

export function Notificaciones({ cambiar }: PropsSeccion) {
  const s = usarEstado((e) => e.preferencias.sonido)
  const botonApagar = usarEstado((e) => e.preferencias.botonApagar)
  const poner = (cambio: Partial<AjusteSonido>) => cambiar({ sonido: { ...s, ...cambio } })
  const apagado = !s.prendido
  return (
    <>
      <Ajuste
        titulo="Sonido al terminar"
        detalle="Cuando la IA termina de verdad: después de las pruebas que dejó corriendo y del control"
        id="ajuste-sonido"
      >
        <label className="interruptor">
          <input
            type="checkbox"
            role="switch"
            aria-checked={s.prendido}
            aria-labelledby="ajuste-sonido"
            checked={s.prendido}
            onChange={(e) => void poner({ prendido: e.target.checked })}
          />
          {s.prendido ? 'Prendido' : 'Apagado'}
        </label>
      </Ajuste>
      <Ajuste titulo="Cuál" detalle="Elegir uno lo hace sonar" id="ajuste-sonido-cual">
        <fieldset
          className="filtros"
          disabled={apagado}
          aria-labelledby="ajuste-sonido-cual"
          aria-describedby="ajuste-sonido-cual-d"
        >
          {SONIDOS.map((id) => (
            <button
              key={id}
              type="button"
              className={s.cual === id ? 'filtro elegido' : 'filtro'}
              aria-pressed={s.cual === id}
              onClick={() => {
                tocarSonido(id)
                if (s.cual !== id) void poner({ cual: id })
              }}
            >
              {NOMBRES_SONIDO[id]}
            </button>
          ))}
        </fieldset>
      </Ajuste>
      <Ajuste
        titulo="Con el avance solo"
        detalle="También cuando termina un paso que la IA tomó sola, mientras no estás (suele ser de noche)"
        id="ajuste-sonido-avance"
      >
        <label className="interruptor">
          <input
            type="checkbox"
            role="switch"
            aria-checked={s.conAvance}
            aria-labelledby="ajuste-sonido-avance"
            checked={s.conAvance}
            disabled={apagado}
            onChange={(e) => void poner({ conAvance: e.target.checked })}
          />
          {s.conAvance ? 'Prendido' : 'Apagado'}
        </label>
      </Ajuste>
      <Ajuste
        titulo="Apagar la PC al terminar"
        detalle="Un botón al lado de Enviar: tocalo y, cuando la IA termine, Iridium apaga la PC sin gastar uso"
        id="ajuste-apagar"
      >
        <label className="interruptor">
          <input
            type="checkbox"
            role="switch"
            aria-checked={botonApagar}
            aria-labelledby="ajuste-apagar"
            checked={botonApagar}
            onChange={(e) => void cambiar({ botonApagar: e.target.checked })}
          />
          {botonApagar ? 'Se ve' : 'Escondido'}
        </label>
      </Ajuste>
    </>
  )
}

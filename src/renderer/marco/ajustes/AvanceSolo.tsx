// Ajustes › IA › Avance solo (frente Frentes, FS-2, D-177): el interruptor y sus condiciones. Apagado, las condiciones
// se ven en gris y no se tocan. Se guarda solo; un número fuera de rango vuelve al anterior.
import { useEffect, useState } from 'react'
import type { AjusteAvance, TamanoPaso } from '../../../compartido/puente'
import { usarEstado } from '../../estado'
import type { PropsSeccion } from '../Ajustes'
import { Ajuste } from './Ajuste'

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/

/** Los límites de `core/avance.ts` (LIMITES_AVANCE): la ventana no importa del proceso principal. */
const LIMITES = {
  minutosSinUsar: { minimo: 1, maximo: 240 },
  libre: { minimo: 0, maximo: 90 },
  semana: { minimo: 10, maximo: 100 },
} as const

const TAMANOS: { id: TamanoPaso; nombre: string }[] = [
  { id: 'chico', nombre: 'Chicos' },
  { id: 'mediano', nombre: 'Medianos' },
  { id: 'grande', nombre: 'Grandes' },
]

/** Un número del ajuste: se escribe libre y se guarda al salir si está en rango; si no, vuelve al guardado. */
function Numero({
  valor,
  limites,
  etiqueta,
  apagado,
  guardar,
}: {
  valor: number
  limites: { minimo: number; maximo: number }
  etiqueta: string
  apagado: boolean
  guardar: (n: number) => Promise<boolean>
}) {
  const [texto, setTexto] = useState(String(valor))
  useEffect(() => setTexto(String(valor)), [valor])
  const fijar = () => {
    const n = Number(texto)
    if (!Number.isInteger(n) || n < limites.minimo || n > limites.maximo || n === valor) {
      setTexto(String(valor))
      return
    }
    void guardar(n).then((ok) => !ok && setTexto(String(valor)))
  }
  return (
    <input
      type="number"
      className="campo chico numero"
      min={limites.minimo}
      max={limites.maximo}
      value={texto}
      disabled={apagado}
      aria-label={etiqueta}
      onChange={(e) => setTexto(e.target.value)}
      onBlur={fijar}
      onKeyDown={(e) => e.key === 'Enter' && fijar()}
    />
  )
}

export function AvanceSolo({ cambiar }: PropsSeccion) {
  const a = usarEstado((s) => s.preferencias.avanceSolo)
  const poner = (cambio: Partial<AjusteAvance>) => cambiar({ avanceSolo: { ...a, ...cambio } })
  const apagado = !a.prendido
  const horario = a.horario ?? { desde: '23:00', hasta: '07:00' }
  const [desde, setDesde] = useState(horario.desde)
  const [hasta, setHasta] = useState(horario.hasta)
  useEffect(() => {
    setDesde(horario.desde)
    setHasta(horario.hasta)
  }, [horario.desde, horario.hasta])
  const ponerHora = (cual: 'desde' | 'hasta', valor: string) => {
    ;(cual === 'desde' ? setDesde : setHasta)(valor)
    if (HORA.test(valor)) void poner({ horario: { ...horario, [cual]: valor } })
  }
  return (
    <Ajuste
      titulo="Avance solo"
      detalle="La IA sigue sola los pasos que marcó, mientras no estás"
      id="ajuste-avance"
      clase={apagado ? 'avance-solo apagado' : 'avance-solo'}
    >
      <label className="interruptor">
        <input
          type="checkbox"
          role="switch"
          aria-checked={a.prendido}
          aria-labelledby="ajuste-avance"
          checked={a.prendido}
          onChange={(e) => void poner({ prendido: e.target.checked })}
        />
        {a.prendido ? 'Prendido' : 'Apagado'}
      </label>
      <fieldset className="condiciones" disabled={apagado}>
        <legend className="solo-lector">Cuándo avanza sola</legend>
        <div className="fila-cond" role="radiogroup" aria-label="Cuándo">
          <label className="opcion">
            <input
              type="radio"
              name="horario"
              checked={a.horario === null}
              onChange={() => void poner({ horario: null })}
            />
            Siempre
          </label>
          <label className="opcion">
            <input
              type="radio"
              name="horario"
              checked={a.horario !== null}
              aria-label="De una hora a otra"
              onChange={() => void poner({ horario: { desde, hasta } })}
            />
            De
          </label>
          <span className="horas">
            <input
              type="time"
              className="campo chico"
              value={desde}
              disabled={apagado || a.horario === null}
              aria-label="Desde qué hora"
              onChange={(e) => ponerHora('desde', e.target.value)}
            />
            a
            <input
              type="time"
              className="campo chico"
              value={hasta}
              disabled={apagado || a.horario === null}
              aria-label="Hasta qué hora"
              onChange={(e) => ponerHora('hasta', e.target.value)}
            />
          </span>
        </div>
        <div className="fila-cond">
          Después de
          <Numero
            valor={a.minutosSinUsar}
            limites={LIMITES.minutosSinUsar}
            etiqueta="Minutos sin usar Iridium"
            apagado={apagado}
            guardar={(n) => poner({ minutosSinUsar: n })}
          />
          minutos sin usar Iridium
        </div>
        <div className="fila-cond">
          Deja libre
          <Numero
            valor={a.libre}
            limites={LIMITES.libre}
            etiqueta="Porcentaje del período que deja libre"
            apagado={apagado}
            guardar={(n) => poner({ libre: n })}
          />
          % del período
        </div>
        <div className="fila-cond">
          Hasta el
          <Numero
            valor={a.semana}
            limites={LIMITES.semana}
            etiqueta="Porcentaje de la semana"
            apagado={apagado}
            guardar={(n) => poner({ semana: n })}
          />
          % de la semana
        </div>
        <fieldset className="fila-cond tamanos">
          <legend className="solo-lector">Tamaños</legend>
          {TAMANOS.map((t) => (
            <label key={t.id} className="casilla">
              <input
                type="checkbox"
                checked={a.tamanos.includes(t.id)}
                onChange={(e) =>
                  void poner({
                    tamanos: e.target.checked
                      ? TAMANOS.map((x) => x.id).filter((x) => x === t.id || a.tamanos.includes(x))
                      : a.tamanos.filter((x) => x !== t.id),
                  })
                }
              />
              {t.nombre}
            </label>
          ))}
        </fieldset>
      </fieldset>
      <span className="expl">
        Toma los pasos que la IA marcó para seguir sola, de a uno: primero tus respuestas, después lo chico
        más viejo, después el frente en curso. Un paso grande solo con el período recién abierto. Necesita
        Iridium abierta.
      </span>
    </Ajuste>
  )
}

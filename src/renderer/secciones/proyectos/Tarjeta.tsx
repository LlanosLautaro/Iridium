// La tarjeta de un proyecto (04-ux.md › W-2, D-034): estado con ícono y palabra; el ámbar, para lo que espera.
import type { FichaSesion, TarjetaProyecto } from '../../../compartido/puente'
import type { Estado } from '../../../compartido/tipos'
import { ChipSesion } from '../../marco/Marco'
import { Icono, type NombreIcono } from '../../ui/Icono'

const ESTADOS: Record<Estado, { nombre: string; icono: NombreIcono; clase: string }> = {
  'en-desarrollo': { nombre: 'en desarrollo', icono: 'punto', clase: 'desarrollo' },
  'en-uso': { nombre: 'en uso', icono: 'check', clase: '' },
  idea: { nombre: 'idea', icono: 'idea', clase: 'tenue' },
  pausado: { nombre: 'pausado', icono: 'pausa', clase: 'tenue' },
  'en-rescate': { nombre: 'en rescate', icono: 'rescate', clase: '' },
  descontinuado: { nombre: 'descontinuado', icono: 'descontinuado', clase: 'tenue' },
  'para-eliminar': { nombre: 'para eliminar', icono: 'eliminar', clase: 'tenue' },
}
const SIN_FICHA = { nombre: 'sin clasificar', icono: 'ficha', clase: 'tenue' } as const

export function textoPreguntas(p: TarjetaProyecto['preguntas']): string | null {
  if (p.sinResponder === 0) return null
  const n = p.sinResponder > 99 ? '99+' : String(p.sinResponder)
  return `${n} ${p.sinResponder === 1 ? 'pregunta' : 'preguntas'}${p.frenan > 0 ? ' · frena' : ''}`
}

export function textoHito(h: NonNullable<TarjetaProyecto['hito']>): string {
  if (h.numero === null) return h.nombre ?? 'Sin hito'
  return `Hito ${h.numero}${h.nombre ? ` · ${h.nombre}` : ''}`
}

interface Props {
  p: TarjetaProyecto
  /** La sesión del proyecto, si tiene una abierta: la tarjeta muestra el mismo estado que su ficha (H-2). */
  ficha: FichaSesion | null
  abrir: () => void
}

const PALABRA_SESION = {
  trabajando: 'IA trabajando',
  terminada: 'IA terminada',
  error: 'IA con error',
} as const

export function Tarjeta({ p, ficha, abrir }: Props) {
  if (p.problema !== null) {
    return (
      <button type="button" className="tarjeta danada" title={`${p.nombre} · ${p.problema}`} onClick={abrir}>
        <div className="cab">
          <span className="icono vacio">
            <Icono nombre="ficha" />
          </span>
          <span className="nombre">{p.nombre}</span>
          <span className="linea2">
            <span className="chip error">
              <Icono nombre="error" />
              Ficha dañada
            </span>
          </span>
        </div>
        <p className="desc">
          El .proyecto.json no se puede usar: {p.problema}. Se muestra al final hasta que se arregle.
        </p>
        <div className="pie">
          <span className="hito sin">Pedile a la IA que la arregle</span>
        </div>
      </button>
    )
  }

  const est = p.estado ? ESTADOS[p.estado] : SIN_FICHA
  const preguntas = textoPreguntas(p.preguntas)
  const etiqueta = [
    p.nombre,
    est.nombre,
    p.reemplazadoPor && `pasa a ${p.reemplazadoPor}`,
    p.hito ? textoHito(p.hito) : 'sin estado',
    preguntas,
    ficha && PALABRA_SESION[ficha.estado],
    p.archivado && 'archivado',
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <button
      type="button"
      className={p.archivado ? 'tarjeta archivado' : 'tarjeta'}
      title={etiqueta}
      aria-label={etiqueta}
      onClick={abrir}
    >
      <div className="cab">
        <span className="icono">
          {p.icono ? <img src={p.icono} alt="" /> : <span className="inicial">{p.inicial}</span>}
        </span>
        <span className="nombre">{p.nombre}</span>
        <span className="linea2">
          <span className={`estado ${est.clase}`}>
            <Icono nombre={est.icono} />
            {est.nombre}
            {p.reemplazadoPor && <span className="hacia"> → {p.reemplazadoPor}</span>}
          </span>
          {preguntas && (
            <span
              className="chip espera"
              title={p.preguntas.frenan > 0 ? 'Al menos una frena el proyecto' : 'Sin responder'}
            >
              <Icono nombre="espera" />
              {preguntas}
            </span>
          )}
        </span>
      </div>
      <p className="desc">{p.descripcion}</p>
      <div className="pie">
        {p.hito ? (
          <span className="hito">
            {p.hito.numero !== null ? (
              <>
                Hito <b>{p.hito.numero}</b>
                {p.hito.nombre && ` · ${p.hito.nombre}`}
              </>
            ) : (
              (p.hito.nombre ?? 'Sin hito')
            )}
          </span>
        ) : (
          <span className="hito sin">Sin estado</span>
        )}
        {ficha && (
          <span className="sesion">
            <ChipSesion ficha={ficha} />
          </span>
        )}
        {p.archivado && (
          <span className="archivada">
            <Icono nombre="archivo" />
            Archivado
          </span>
        )}
      </div>
    </button>
  )
}

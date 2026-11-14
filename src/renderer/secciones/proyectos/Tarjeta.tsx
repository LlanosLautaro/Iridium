// La tarjeta de un proyecto (04-ux.md › W-2, D-034): estado con ícono y palabra; la cuenta de la bandeja arriba a la
// derecha, amarilla solo si algo frena (D-100). Con el
// clic derecho (o la tecla de menú), sus acciones (R-7).
import type { MouseEvent } from 'react'
import { textoDeCuenta } from '../../../compartido/cuentas'
import { textoFrente } from '../../../compartido/en-que'
import type { FichaSesion, TarjetaProyecto } from '../../../compartido/puente'
import type { Estado } from '../../../compartido/tipos'
import { SenalSesion } from '../../marco/Marco'
import { Cuenta } from '../../ui/Cuenta'
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
  return textoDeCuenta(p.sinResponder, p.frenan)
}

/** «! 2 avisos del framework» (W-2): lo que el control encontró mal escrito; null sin avisos. */
export function textoAvisos(f: TarjetaProyecto['framework']): string | null {
  if (f === null || f === 'viejo' || f.avisos.length === 0) return null
  const n = f.avisos.length
  return `${n > 99 ? '99+' : n} ${n === 1 ? 'aviso' : 'avisos'} del framework`
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
  /** Tocar «! N avisos del framework»: la lista en Skills › Framework (T-48). */
  verAvisos?: () => void
  /** El clic derecho: abre el menú de la tarjeta (R-7). */
  menu?: (e: MouseEvent<HTMLButtonElement>) => void
}

const PALABRA_SESION = {
  trabajando: 'IA trabajando',
  terminada: 'IA terminada',
  error: 'IA con error',
} as const

export function Tarjeta({ p, ficha, abrir, verAvisos, menu }: Props) {
  if (p.problema !== null) {
    return (
      <button
        type="button"
        className="tarjeta danada"
        title={`${p.nombre} · ${p.problema}`}
        onClick={abrir}
        onContextMenu={menu}
      >
        <div className="cab">
          <span className="icono vacio">
            <Icono nombre="ficha" />
          </span>
          <span className="nombre">{p.nombre}</span>
          <span className="linea2">
            <span className="senal rojo">
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
  const avisos = textoAvisos(p.framework)
  const enQue = textoFrente(p.hito)
  const etiqueta = [
    p.nombre,
    est.nombre,
    p.reemplazadoPor && `pasa a ${p.reemplazadoPor}`,
    p.hito ? textoHito(p.hito) : 'sin estado',
    p.framework === 'viejo' && 'framework viejo',
    enQue,
    preguntas,
    avisos,
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
      aria-haspopup="menu"
      // Los avisos del pie llevan a su lista (T-48); el resto de la tarjeta abre el proyecto. Con el teclado, la
      // lista está en el menú de la tarjeta.
      onClick={(e) => ((e.target as Element).closest('.aviso-fw') && verAvisos ? verAvisos() : abrir())}
      onContextMenu={menu}
    >
      <div className="cab">
        <span className="icono">
          {p.icono ? <img src={p.icono} alt="" /> : <span className="inicial">{p.inicial}</span>}
        </span>
        <span className="nombre">{p.nombre}</span>
        <Cuenta n={p.preguntas.sinResponder} frenan={p.preguntas.frenan} clase="en-tarjeta" />
        <span className="linea2">
          <span className={`estado ${est.clase}`}>
            <Icono nombre={est.icono} />
            {est.nombre}
            {p.reemplazadoPor && <span className="hacia"> → {p.reemplazadoPor}</span>}
          </span>
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
        {p.framework === 'viejo' && <span className="viejo">framework viejo</span>}
        {ficha && (
          <span className="sesion">
            <SenalSesion ficha={ficha} />
          </span>
        )}
        {p.archivado && (
          <span className="archivada">
            <Icono nombre="archivo" />
            Archivado
          </span>
        )}
      </div>
      {enQue && (
        <p className={p.hito?.frente ? 'en-que' : 'en-que sin-frente'} title={enQue}>
          {p.hito?.frente ? (
            <>
              <span className="fr">{p.hito.frente.nombre}</span>
              {p.hito.frente.paso && ` · ${p.hito.frente.paso}`}
            </>
          ) : (
            enQue
          )}
        </p>
      )}
      {avisos && p.framework !== null && p.framework !== 'viejo' && (
        <div
          className="aviso-fw"
          title={`${p.framework.avisos.join('\n')}\n\nTocá para ver la lista en Skills › Framework`}
        >
          <span className="signo" aria-hidden="true">
            !
          </span>
          <span className="texto">{avisos}</span>
        </div>
      )}
    </button>
  )
}

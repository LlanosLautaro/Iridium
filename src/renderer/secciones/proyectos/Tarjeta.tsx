// La tarjeta de un proyecto (04-ux.md › W-2, D-034): estado con ícono y palabra; la cuenta de la bandeja arriba a la
// derecha, amarilla solo si algo frena (D-100); sin nada que responder, una marca: el tilde si todo está respondido y
// la IA puede seguir, el círculo vacío si la bandeja está vacía o el proyecto no empezó (R-81). Con el
// clic derecho (o la tecla de menú), sus acciones (R-7).
import type { MouseEvent } from 'react'
import { marcaDeBandeja, TEXTO_MARCA, textoDeCuenta } from '../../../compartido/cuentas'
import { textoFrente } from '../../../compartido/en-que'
import type { ActualizacionProyecto, FichaSesion, TarjetaProyecto } from '../../../compartido/puente'
import type { Estado } from '../../../compartido/tipos'
import { usarEstado } from '../../estado'
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

/**
 * La actualización automática en la tarjeta (frente Abrir, AB-3, AB-4): «Actualizando…» mientras se arma y
 * «No se pudo actualizar» si falló con el commit de ahora; al día no se dice.
 */
export function SenalActualizacion({ a }: { a: ActualizacionProyecto | undefined }) {
  if (a?.armando != null)
    return (
      <span className="senal actualizacion">
        <Icono nombre="sync" gira />
        Actualizando…
      </span>
    )
  if (a?.fallo)
    return (
      <span className="senal rojo actualizacion" title={a.ultimo?.motivo ?? undefined}>
        <Icono nombre="error" />
        No se pudo actualizar
      </span>
    )
  return null
}

export function Tarjeta({ p, ficha, abrir, verAvisos, menu }: Props) {
  const actualizacion = usarEstado((s) => s.actualizaciones[p.ruta])
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
  // Al pie, solo el frente en curso: el hito y el Próximo paso no van en la tarjeta (R-83, R-84); se leen en el
  // proyecto y en el nombre de la tarjeta.
  const frente = p.hito?.frente ? enQue : null
  const actualiza = actualizacion?.armando != null || actualizacion?.fallo === true
  const conPie = frente !== null || p.framework === 'viejo' || ficha !== null || p.archivado || actualiza
  // Un archivado no espera nada: sin marca.
  const marca = p.archivado ? 'cuenta' : marcaDeBandeja(p.preguntas, p.hito !== null)
  const etiqueta = [
    p.nombre,
    est.nombre,
    p.reemplazadoPor && `pasa a ${p.reemplazadoPor}`,
    p.hito ? textoHito(p.hito) : 'sin estado',
    p.framework === 'viejo' && 'framework viejo',
    enQue,
    preguntas ?? (marca !== 'cuenta' && TEXTO_MARCA[marca]),
    avisos,
    ficha && PALABRA_SESION[ficha.estado],
    actualizacion?.armando != null && 'actualizando',
    actualizacion?.fallo && 'no se pudo actualizar',
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
        {marca === 'cuenta' ? (
          <Cuenta n={p.preguntas.sinResponder} frenan={p.preguntas.frenan} clase="en-tarjeta" />
        ) : (
          <span
            className={`senal en-tarjeta${marca === 'respondida' ? ' blanco' : ''}`}
            title={TEXTO_MARCA[marca]}
            role="img"
            aria-label={TEXTO_MARCA[marca]}
          >
            <Icono nombre={marca === 'respondida' ? 'tilde' : 'circulo'} />
          </span>
        )}
        <span className="linea2">
          <span className={`estado ${est.clase}`}>
            <Icono nombre={est.icono} />
            {est.nombre}
            {p.reemplazadoPor && <span className="hacia"> → {p.reemplazadoPor}</span>}
          </span>
        </span>
      </div>
      <p className="desc">{p.descripcion}</p>
      {conPie && (
        <div className="pie">
          {frente && (
            <span className="en-que" title={frente}>
              <span className="fr">{p.hito?.frente?.nombre}</span>
              {p.hito?.frente?.paso && ` · ${p.hito.frente.paso}`}
            </span>
          )}
          {p.framework === 'viejo' && <span className="viejo">framework viejo</span>}
          {ficha && (
            <span className="sesion">
              <SenalSesion ficha={ficha} sinResponder={p.preguntas.sinResponder} />
            </span>
          )}
          {actualiza && <SenalActualizacion a={actualizacion} />}
          {p.archivado && (
            <span className="archivada">
              <Icono nombre="archivo" />
              Archivado
            </span>
          )}
        </div>
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

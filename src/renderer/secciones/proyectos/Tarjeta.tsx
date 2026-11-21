// La tarjeta de un proyecto (04-ux.md › W-2, D-034), como la maqueta (docs/diseno/pantallas/grilla.html, DI-I3 tanda 17):
// sin relleno, una línea que se aclara al pasar el mouse; el ícono redondo sin caja y el estado con su punto debajo del
// nombre; la cuenta de la bandeja arriba a la derecha, amarilla solo si algo frena (D-100); sin nada que responder, una marca: el tilde si todo está respondido y
// la IA puede seguir, el círculo vacío si la bandeja está vacía o el proyecto no empezó (R-81). Con el
// clic derecho (o la tecla de menú), o con el ⋯ que aparece al pasar el mouse, sus acciones (R-7, T-58). Una archivada dice
// desde cuándo en lugar del estado: «archivado el 12 oct».
import type { MouseEvent } from 'react'
import { marcaDeBandeja, TEXTO_MARCA, textoDeCuenta } from '../../../compartido/cuentas'
import { textoFrente } from '../../../compartido/en-que'
import { diaCorto } from '../../../compartido/fechas'
import type { ActualizacionProyecto, FichaSesion, TarjetaProyecto } from '../../../compartido/puente'
import type { Estado } from '../../../compartido/tipos'
import { usarEstado } from '../../estado'
import { SenalSesion } from '../../marco/Marco'
import { Cuenta } from '../../ui/Cuenta'
import { Icono } from '../../ui/Icono'

/** El estado, con su punto (PZ-7): blanco lo que está en uso; en rescate, sin punto (dice a qué proyecto pasa). */
const ESTADOS: Record<Estado, { nombre: string; punto: 'blanco' | 'gris' | null }> = {
  'en-desarrollo': { nombre: 'en desarrollo', punto: 'gris' },
  'en-uso': { nombre: 'en uso', punto: 'blanco' },
  idea: { nombre: 'idea', punto: 'gris' },
  pausado: { nombre: 'pausado', punto: 'gris' },
  'en-rescate': { nombre: 'en rescate', punto: null },
  descontinuado: { nombre: 'descontinuado', punto: 'gris' },
  'para-eliminar': { nombre: 'para eliminar', punto: 'gris' },
}
const SIN_FICHA = { nombre: 'sin clasificar', punto: null } as const

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
  /** El clic derecho o el ⋯: abre el menú de la tarjeta (R-7). */
  menu?: (e: MouseEvent<HTMLElement>) => void
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

/** «archivado el 12 oct» (como la maqueta archivados.html); «archivado» si se archivó a mano o antes de guardar el día. */
export function archivadoDesde(dia: string | null | undefined, hoy = new Date()): string {
  if (!dia) return 'archivado'
  const corto = diaCorto(dia, hoy)
  return corto === 'hoy' || corto === 'ayer' ? `archivado ${corto}` : `archivado el ${corto}`
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
        <div className="cab-t">
          <span className="logo">
            <Icono nombre="ficha" />
          </span>
          <span className="nombre-t">
            <span className="nombre">{p.nombre}</span>
            <span className="senal rojo">
              <Icono nombre="error" />
              Ficha dañada
            </span>
          </span>
        </div>
        <p className="desc">
          El .proyecto.json no se puede usar: {p.problema}. Se muestra al final hasta que se arregle.
        </p>
        <div className="pie-t">
          <span className="linea">Pide a la IA que la arregle</span>
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
  const conSenales = p.framework === 'viejo' || ficha !== null || actualiza
  const conAvisos = avisos !== null && p.framework !== null && p.framework !== 'viejo'
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
    p.archivado && archivadoDesde(p.archivadoEl),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <button
      type="button"
      className={p.archivado ? 'tarjeta archivada' : 'tarjeta'}
      title={etiqueta}
      aria-label={etiqueta}
      aria-haspopup="menu"
      // Los avisos del pie llevan a su lista (T-48); el resto de la tarjeta abre el proyecto. Con el teclado, la
      // lista está en el menú de la tarjeta.
      onClick={(e) => ((e.target as Element).closest('.avisos-t') && verAvisos ? verAvisos() : abrir())}
      onContextMenu={menu}
    >
      <div className="cab-t">
        <span className="logo">{p.icono ? <img src={p.icono} alt="" /> : p.inicial}</span>
        <span className="nombre-t">
          <span className="nombre">{p.nombre}</span>
          <span className="estado-t">
            {p.archivado ? (
              archivadoDesde(p.archivadoEl)
            ) : (
              <>
                {est.punto && <span className={est.punto === 'blanco' ? 'punto blanco' : 'punto'} />}
                {est.nombre}
                {p.reemplazadoPor && <span className="hacia"> → {p.reemplazadoPor}</span>}
              </>
            )}
          </span>
        </span>
        <span className="derecha-t">
          {marca === 'cuenta' ? (
            <Cuenta n={p.preguntas.sinResponder} frenan={p.preguntas.frenan} />
          ) : (
            <span
              className={marca === 'respondida' ? 'senal blanco' : 'senal'}
              title={TEXTO_MARCA[marca]}
              role="img"
              aria-label={TEXTO_MARCA[marca]}
            >
              <Icono nombre={marca === 'respondida' ? 'tilde' : 'circulo'} />
            </span>
          )}
          {menu && (
            // Dentro del botón de la tarjeta no puede ir otro botón: es un atajo del mouse; con el teclado, la tecla de
            // menú abre lo mismo.
            <span
              className="boton solo-icono chico mas-t"
              aria-hidden="true"
              title="Más"
              onClick={(e) => {
                e.stopPropagation()
                menu(e)
              }}
            >
              <Icono nombre="puntos" />
            </span>
          )}
        </span>
      </div>
      <p className="desc">{p.descripcion}</p>
      {(frente || conSenales || conAvisos) && (
        <div className="pie-t">
          {frente && (
            <span className="linea en-que" title={frente}>
              <span className="fr">{p.hito?.frente?.nombre}</span>
              {p.hito?.frente?.paso && ` · ${p.hito.frente.paso}`}
            </span>
          )}
          {conAvisos && p.framework !== null && p.framework !== 'viejo' && (
            <span
              className="linea senal rojo avisos-t"
              title={`${p.framework.avisos.join('\n')}\n\nToca para ver la lista en Skills › Framework`}
            >
              ! {avisos}
            </span>
          )}
          {conSenales && (
            <span className="linea senales-t">
              {p.framework === 'viejo' && <span className="senal viejo">framework viejo</span>}
              {ficha && <SenalSesion ficha={ficha} sinResponder={p.preguntas.sinResponder} />}
              {actualiza && <SenalActualizacion a={actualizacion} />}
            </span>
          )}
        </div>
      )}
    </button>
  )
}

// Archivos (H-15, D-041): el árbol del proyecto sin `node_modules` ni `.git` (las carpetas se abren y se cierran) y
// el visor de solo lectura: texto con colores y números de línea, imágenes, y lo que no se puede mostrar lo dice.
// Un `.md` de los documentos también se abre en Docs. Cada proyecto recuerda el archivo y las carpetas abiertas.
// El árbol y el visor reciben de dónde leer: la sección Skills los usa con la carpeta de una skill.
import { type CSSProperties, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CarpetaArchivos, ContenidoArchivo } from '../../../compartido/puente'
import { fichaDe, rutaGeneral, rutaSkills, tarjetaDe, usarEstado, vistaDe } from '../../estado'
import { Cabecera } from '../../ui/Cabecera'
import { Icono } from '../../ui/Icono'
import { useDocsCambian } from './enlaces'
import { BotonAtras } from './Lector'

/** De dónde leen el árbol y el visor: un proyecto o la carpeta de una skill. */
export interface FuenteArchivos {
  /** Distingue lo ya leído de cada fuente. */
  clave: string
  carpeta(carpeta: string): Promise<CarpetaArchivos>
  archivo(archivo: string): Promise<ContenidoArchivo>
}

/** Las carpetas abiertas y el archivo elegido en el árbol, con cómo cambiarlos. */
export interface EleccionArbol {
  abiertas: string[]
  alternar(carpeta: string): void
  elegido: string | null
  elegir(archivo: string): void
}

/** Abre una carpeta o la cierra con las de adentro. */
export function alternarCarpeta(abiertas: string[], carpeta: string): string[] {
  return abiertas.includes(carpeta)
    ? abiertas.filter((x) => x !== carpeta && !x.startsWith(`${carpeta}/`))
    : [...abiertas, carpeta]
}

/** Lo ya leído de cada carpeta: se muestra en el acto y se relee al abrirla. */
const leidas = new Map<string, CarpetaArchivos>()

function useCarpeta(fuente: FuenteArchivos, carpeta: string): CarpetaArchivos | null {
  const clave = `${fuente.clave}|${carpeta}`
  const [c, setC] = useState<{ clave: string; c: CarpetaArchivos } | null>(() => {
    const ya = leidas.get(clave)
    return ya ? { clave, c: ya } : null
  })
  // biome-ignore lint/correctness/useExhaustiveDependencies: la fuente se identifica por su clave.
  useEffect(() => {
    let vigente = true
    void fuente.carpeta(carpeta).then((r) => {
      leidas.set(clave, r)
      if (vigente) setC({ clave, c: r })
    })
    return () => {
      vigente = false
    }
  }, [carpeta, clave])
  if (c?.clave === clave) return c.c
  return leidas.get(clave) ?? null
}

export function ArbolArchivos({
  fuente,
  eleccion,
  carpeta = '',
  nivel = 0,
}: {
  fuente: FuenteArchivos
  eleccion: EleccionArbol
  carpeta?: string
  nivel?: number
}) {
  const c = useCarpeta(fuente, carpeta)
  const sangria = { '--n': nivel } as CSSProperties
  if (!c)
    return (
      <div className="arbol-nodo cargando" style={sangria}>
        Leyendo…
      </div>
    )
  if (c.tipo === 'error')
    return (
      <div className="arbol-nodo error" style={sangria} title={c.mensaje}>
        {c.mensaje}
      </div>
    )
  if (c.hijos.length === 0 && nivel > 0)
    return (
      <div className="arbol-nodo vacio" style={sangria}>
        (vacía)
      </div>
    )
  return (
    <>
      {c.hijos.map((n) => {
        if (n.tipo === 'carpeta') {
          const abierta = eleccion.abiertas.includes(n.ruta)
          return (
            <div key={n.ruta}>
              <button
                type="button"
                className="arbol-nodo"
                style={sangria}
                aria-expanded={abierta}
                title={n.ruta}
                onClick={() => eleccion.alternar(n.ruta)}
              >
                <span className="chev">
                  <Icono nombre="chev" />
                </span>
                <Icono nombre="archivos" />
                <span className="nombre">{n.nombre}</span>
              </button>
              {abierta && (
                <ArbolArchivos fuente={fuente} eleccion={eleccion} carpeta={n.ruta} nivel={nivel + 1} />
              )}
            </div>
          )
        }
        return (
          <button
            key={n.ruta}
            type="button"
            className={eleccion.elegido === n.ruta ? 'arbol-nodo sel' : 'arbol-nodo'}
            style={sangria}
            aria-current={eleccion.elegido === n.ruta}
            title={n.ruta}
            onClick={() => eleccion.elegir(n.ruta)}
          >
            <span className="chev" />
            <Icono
              nombre={/\.(png|jpe?g|gif|webp|avif|bmp|ico|svg)$/i.test(n.nombre) ? 'imagen' : 'archivo'}
            />
            <span className="nombre">{n.nombre}</span>
          </button>
        )
      })}
    </>
  )
}

function tamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toLocaleString('es-AR', { maximumFractionDigits: 1 })} MB`
}

/** «Ver en Docs» en un `.md` de los documentos del proyecto. */
function VerEnDocs({ ruta, archivo }: { ruta: string; archivo: string }) {
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  return (
    <button
      type="button"
      className="boton secundario chico"
      title="Leerlo en Docs, con los códigos como enlaces"
      onClick={() => abrirDoc(ruta, { documento: archivo, ancla: '' })}
    >
      <Icono nombre="docs" />
      Ver en Docs
    </button>
  )
}

/** Un `.md` del proyecto que cambia mientras se mira se relee (los demás, al volver a elegirlos). */
function ReleerDocs({ ruta, archivo, leer }: { ruta: string; archivo: string; leer: () => void }) {
  useDocsCambian(
    ruta,
    useCallback(() => {
      if (/\.md$/i.test(archivo)) leer()
    }, [archivo, leer]),
  )
  return null
}

export function VisorArchivo({
  fuente,
  archivo,
  linea = null,
  proyecto,
}: {
  fuente: FuenteArchivos
  archivo: string
  linea?: number | null
  /** El proyecto del archivo: suma «Ver en Docs» y relee los `.md` que cambian. */
  proyecto?: string
}) {
  const [c, setC] = useState<{ clave: string; c: ContenidoArchivo } | null>(null)
  const codigo = useRef<HTMLDivElement>(null)
  const clave = `${fuente.clave}|${archivo}`
  // biome-ignore lint/correctness/useExhaustiveDependencies: la fuente se identifica por su clave.
  const leer = useCallback(() => {
    void fuente.archivo(archivo).then((r) => setC({ clave, c: r }))
  }, [clave])
  useEffect(leer, [leer])
  const actual = c?.clave === clave ? c.c : null
  // Desde un comentario de la Revisión: la línea queda marcada y a la vista (en el medio).
  useEffect(() => {
    if (actual?.tipo !== 'texto' || !linea) return
    const el = codigo.current?.children[linea - 1]
    if (el instanceof HTMLElement) el.scrollIntoView({ block: 'center' })
  }, [actual, linea])
  let detalle = ''
  if (actual?.tipo === 'texto')
    detalle = `${actual.lineas.length} ${actual.lineas.length === 1 ? 'línea' : 'líneas'} · ${actual.lenguaje}`
  else if (actual?.tipo === 'imagen') detalle = `imagen · ${tamano(actual.bytes)}`
  let extra: ReactNode = null
  if (proyecto && actual?.tipo === 'texto' && actual.documento)
    extra = <VerEnDocs ruta={proyecto} archivo={archivo} />
  return (
    <div className="visor">
      {proyecto && <ReleerDocs ruta={proyecto} archivo={archivo} leer={leer} />}
      <div className="visor-cab">
        <span className="ruta">{archivo}</span>
        <span className="der">
          {detalle && <span>{detalle} · solo lectura</span>}
          {extra}
        </span>
      </div>
      {!actual && <div className="visor-msg" aria-busy="true" />}
      {actual?.tipo === 'texto' && (
        <div
          ref={codigo}
          className="visor-codigo"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: cada línea la escapa y colorea el proceso principal (core/archivos.ts).
          dangerouslySetInnerHTML={{
            __html: actual.lineas
              .map((l, i) => (i + 1 === linea ? `<div class="marcada">${l}</div>` : `<div>${l}</div>`))
              .join(''),
          }}
        />
      )}
      {actual?.tipo === 'imagen' && (
        <div className="imagen">
          <img src={actual.url} alt={archivo} />
        </div>
      )}
      {actual?.tipo === 'grande' && (
        <p className="visor-msg">
          Pesa {tamano(actual.bytes)}: es muy grande para mostrarlo acá. Abrilo con su programa si lo
          necesitás.
        </p>
      )}
      {actual?.tipo === 'binario' && (
        <p className="visor-msg">
          No es un archivo de texto ({tamano(actual.bytes)}): no se puede mostrar acá.
        </p>
      )}
      {actual?.tipo === 'no-existe' && <p className="visor-msg">Este archivo ya no existe.</p>}
      {actual?.tipo === 'error' && (
        <p className="visor-msg" role="alert">
          No se pudo leer: {actual.mensaje}
        </p>
      )}
    </div>
  )
}

/**
 * El recuadro de la carpeta simple (W-3, D-095), arriba de Archivos: no sigue el framework y se puede pasar (OR-8), con
 * el pedido a su conversación. Mientras la IA lo pasa, lo dice.
 */
function CarpetaSimple({ ruta }: { ruta: string }) {
  const trabajando = usarEstado((s) => fichaDe(s.fichas, ruta)?.estado === 'trabajando')
  const enviados = usarEstado((s) => s.skills.enviados)
  const cambiarSkills = usarEstado((s) => s.cambiarSkills)
  const [error, setError] = useState<string | null>(null)
  const pasando = trabajando && enviados.includes(ruta)
  const pasar = () => {
    setError(null)
    window.iridium.pasarAlFramework(ruta).then(
      () => cambiarSkills({ enviados: [...enviados.filter((r) => r !== ruta), ruta] }),
      () => setError('No se pudo mandar el pedido.'),
    )
  }
  return (
    <div className="recuadro-simple" role="note">
      <b>Esta carpeta no sigue el framework</b>
      <p>{pasando ? 'La IA la está pasando al framework…' : 'Se ve y se conversa, sin Mapa ni preguntas.'}</p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        className="boton secundario chico"
        disabled={trabajando}
        title={trabajando ? 'Su IA está trabajando' : 'Le manda el pedido a la IA de esta carpeta: gasta uso'}
        onClick={pasar}
      >
        Pasar al framework
      </button>
    </div>
  )
}

export function Archivos({ ruta }: { ruta: string }) {
  // Las carpetas de Iridium (Ideas, Skills) tampoco tienen `estado.md`, pero no son proyectos para pasar.
  const simple = usarEstado(
    (s) =>
      tarjetaDe(s.lista, ruta)?.framework === null &&
      ruta !== rutaGeneral(s.lista) &&
      ruta !== rutaSkills(s.lista),
  )
  const archivo = usarEstado((s) => vistaDe(s.vistas, ruta).archivo)
  const linea = usarEstado((s) => vistaDe(s.vistas, ruta).linea)
  const carpetas = usarEstado((s) => vistaDe(s.vistas, ruta).carpetas)
  const atras = usarEstado((s) => vistaDe(s.vistas, ruta).atras.length)
  const nombre = usarEstado((s) => tarjetaDe(s.lista, ruta)?.nombre ?? '')
  const cambiarVista = usarEstado((s) => s.cambiarVista)
  const fuente = useMemo<FuenteArchivos>(
    () => ({
      clave: ruta,
      carpeta: (c) => window.iridium.carpeta(ruta, c),
      archivo: (a) => window.iridium.archivo(ruta, a),
    }),
    [ruta],
  )
  const eleccion: EleccionArbol = {
    abiertas: carpetas,
    alternar: (c) => cambiarVista(ruta, { carpetas: alternarCarpeta(carpetas, c) }),
    elegido: archivo,
    elegir: (a) => cambiarVista(ruta, { archivo: a, linea: null }),
  }
  return (
    <>
      <Cabecera titulo="Archivos" acciones={atras > 0 && <BotonAtras ruta={ruta} />} />
      {simple && <CarpetaSimple ruta={ruta} />}
      <div className="partida">
        <nav className="arbol-lista" aria-label={`Archivos de ${nombre}`}>
          <h3>{nombre}</h3>
          <ArbolArchivos fuente={fuente} eleccion={eleccion} />
        </nav>
        {archivo ? (
          <VisorArchivo fuente={fuente} archivo={archivo} linea={linea} proyecto={ruta} />
        ) : (
          <div className="vacia">
            <div>
              <b>Elegí un archivo del árbol</b>
              Se ve tal cual, sin poder editarlo: el texto con colores, las imágenes como imagen.
            </div>
          </div>
        )}
      </div>
    </>
  )
}

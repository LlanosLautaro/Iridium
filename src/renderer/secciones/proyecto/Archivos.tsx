// Archivos (H-15, D-041; como la maqueta desde DI-I3, tanda 12: docs/diseno/pantallas/archivos.html): el Árbol
// (PZ-11) del proyecto sin `node_modules` ni `.git`, con la letra de Git de lo cambiado sin guardar, y el visor de solo
// lectura: texto con colores y números de línea, imágenes, y lo que no se puede mostrar lo dice. La ruta del archivo va
// en la Cabecera, con Abrir en VS Code; un `.md` de los documentos también se abre en Docs. Cada proyecto recuerda el
// archivo y las carpetas abiertas. El árbol y el visor reciben de dónde leer: Skills los usa con la carpeta de una skill.
import { type CSSProperties, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CarpetaArchivos, ContenidoArchivo } from '../../../compartido/puente'
import { fichaDe, rutaGeneral, rutaSkills, tarjetaDe, usarEstado, vistaDe } from '../../estado'
import { Cabecera } from '../../ui/Cabecera'
import { Icono } from '../../ui/Icono'
import { useDocsCambian } from './enlaces'
import { LETRA, useGit } from './Git'
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

/** La marca de Git de un archivo del árbol (la letra de VS Code), con lo que dice al pasar el mouse. */
export interface MarcaArbol {
  letra: string
  titulo: string
  /** La clase del color: `nuevo`, `modificado` u `otro`. */
  clase: string
}

/** El Árbol (PZ-11) de una carpeta: las carpetas se abren y se cierran; un archivo se elige. */
export function ArbolArchivos({
  fuente,
  eleccion,
  marcas,
  carpeta = '',
  nivel = 0,
}: {
  fuente: FuenteArchivos
  eleccion: EleccionArbol
  /** Lo cambiado sin guardar en Git, por ruta (solo en un proyecto). */
  marcas?: ReadonlyMap<string, MarcaArbol> | undefined
  carpeta?: string
  nivel?: number
}) {
  const c = useCarpeta(fuente, carpeta)
  const sangria = { '--nivel': nivel } as CSSProperties
  if (!c)
    return (
      <div className="archivos-nota" style={sangria}>
        Leyendo…
      </div>
    )
  if (c.tipo === 'error')
    return (
      <div className="archivos-nota error" style={sangria} title={c.mensaje}>
        {c.mensaje}
      </div>
    )
  if (c.hijos.length === 0 && nivel > 0)
    return (
      <div className="archivos-nota" style={sangria}>
        (vacía)
      </div>
    )
  return (
    <>
      {c.hijos.map((n) => {
        if (n.tipo === 'carpeta') {
          const abierta = eleccion.abiertas.includes(n.ruta)
          return (
            <div key={n.ruta} className="archivos-carpeta">
              <button
                type="button"
                className="nodo carpeta"
                style={sangria}
                aria-expanded={abierta}
                title={n.ruta}
                onClick={() => eleccion.alternar(n.ruta)}
              >
                <Icono nombre="chev" />
                <span className="archivos-nombre">{n.nombre}</span>
              </button>
              {abierta && (
                <ArbolArchivos
                  fuente={fuente}
                  eleccion={eleccion}
                  marcas={marcas}
                  carpeta={n.ruta}
                  nivel={nivel + 1}
                />
              )}
            </div>
          )
        }
        const elegido = eleccion.elegido === n.ruta
        const marca = marcas?.get(n.ruta)
        return (
          <button
            key={n.ruta}
            type="button"
            className={elegido ? 'nodo elegido' : 'nodo'}
            style={sangria}
            aria-current={elegido}
            title={marca ? `${n.ruta} · ${marca.titulo}` : n.ruta}
            onClick={() => eleccion.elegir(n.ruta)}
          >
            <Icono
              nombre={/\.(png|jpe?g|gif|webp|avif|bmp|ico|svg)$/i.test(n.nombre) ? 'imagen' : 'archivo'}
            />
            <span className="archivos-nombre">{n.nombre}</span>
            {marca && <span className={`marca archivos-git-${marca.clase}`}>{marca.letra}</span>}
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

/** Lo leído de un archivo (null mientras se lee) y cómo releerlo. */
export function useArchivo(fuente: FuenteArchivos, archivo: string): [ContenidoArchivo | null, () => void] {
  const [c, setC] = useState<{ clave: string; c: ContenidoArchivo } | null>(null)
  const clave = `${fuente.clave}|${archivo}`
  // biome-ignore lint/correctness/useExhaustiveDependencies: la fuente se identifica por su clave.
  const leer = useCallback(() => {
    void fuente.archivo(archivo).then((r) => setC({ clave, c: r }))
  }, [clave])
  useEffect(leer, [leer])
  return [c?.clave === clave ? c.c : null, leer]
}

/** Sin ruido (D-108): cuántas líneas y de qué lenguaje, al pasar el mouse por la ruta. */
export function detalleArchivo(c: ContenidoArchivo | null): string {
  if (c?.tipo === 'texto')
    return `${c.lineas.length} ${c.lineas.length === 1 ? 'línea' : 'líneas'} · ${c.lenguaje} · solo lectura`
  if (c?.tipo === 'imagen') return `imagen · ${tamano(c.bytes)}`
  return ''
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

/** El visor de solo lectura: el texto con colores y números de línea, la imagen, o por qué no se muestra. */
export function VisorArchivo({
  contenido,
  archivo,
  linea = null,
}: {
  contenido: ContenidoArchivo | null
  archivo: string
  linea?: number | null
}) {
  const codigo = useRef<HTMLDivElement>(null)
  // Desde un comentario de la Revisión: la línea queda marcada y a la vista (en el medio).
  useEffect(() => {
    if (contenido?.tipo !== 'texto' || !linea) return
    const el = codigo.current?.children[linea - 1]
    if (el instanceof HTMLElement) el.scrollIntoView({ block: 'center' })
  }, [contenido, linea])
  let aviso: ReactNode = null
  if (contenido?.tipo === 'error')
    aviso = (
      <div className="recuadro error" role="alert">
        <Icono nombre="error" />
        <span>No se pudo leer: {contenido.mensaje}</span>
      </div>
    )
  else if (contenido?.tipo === 'no-existe')
    aviso = (
      <div className="recuadro vacio">
        <strong>Este archivo ya no existe</strong>
        <span>Elige otro en el árbol.</span>
      </div>
    )
  else if (contenido?.tipo === 'grande')
    aviso = (
      <div className="recuadro vacio">
        <strong>Es muy grande para mostrarlo aquí</strong>
        <span>Pesa {tamano(contenido.bytes)}: ábrelo en VS Code o con su programa.</span>
      </div>
    )
  else if (contenido?.tipo === 'binario')
    aviso = (
      <div className="recuadro vacio">
        <strong>No es un archivo de texto</strong>
        <span>Pesa {tamano(contenido.bytes)} y no se puede mostrar aquí: ábrelo con su programa.</span>
      </div>
    )
  return (
    <div className="archivos-visor">
      {!contenido && <div className="archivos-carga" aria-busy="true" />}
      {contenido?.tipo === 'texto' && (
        <div
          ref={codigo}
          className="visor-codigo"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: cada línea la escapa y colorea el proceso principal (core/archivos.ts).
          dangerouslySetInnerHTML={{
            __html: contenido.lineas
              .map((l, i) => (i + 1 === linea ? `<div class="marcada">${l}</div>` : `<div>${l}</div>`))
              .join(''),
          }}
        />
      )}
      {contenido?.tipo === 'imagen' && (
        <div className="imagen">
          <img src={contenido.url} alt={archivo} />
        </div>
      )}
      {aviso && <div className="archivos-aviso">{aviso}</div>}
    </div>
  )
}

/** Las letras de Git (las de VS Code) de lo cambiado sin guardar, para el árbol de un proyecto. */
function useMarcasGit(ruta: string): ReadonlyMap<string, MarcaArbol> {
  const [g] = useGit(ruta, true)
  return useMemo(() => {
    const m = new Map<string, MarcaArbol>()
    if (g?.tipo === 'ok')
      for (const a of g.cambios)
        if (a.cambio !== 'borrado')
          m.set(a.ruta, { letra: LETRA[a.cambio].letra, titulo: LETRA[a.cambio].titulo, clase: a.cambio })
    return m
  }, [g])
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
      () => setError('No se pudo enviar el pedido.'),
    )
  }
  return (
    <div className="archivos-simple">
      <div className={error ? 'recuadro error' : 'recuadro'} role="note">
        <div className="cuerpo-recuadro">
          <strong>Esta carpeta no sigue el framework</strong>
          <span>
            {pasando
              ? 'La IA la está actualizando al framework…'
              : 'Se ve y se conversa, sin Mapa ni preguntas.'}
          </span>
          {error && <span role="alert">{error}</span>}
        </div>
        <button
          type="button"
          className="boton secundario"
          disabled={trabajando}
          title={
            trabajando
              ? 'Su IA está trabajando'
              : 'Le envía el pedido a la IA de esta carpeta, en una conversación nueva: gasta uso'
          }
          onClick={pasar}
        >
          Actualizar
        </button>
      </div>
    </div>
  )
}

/** Debajo de la cabecera: el recuadro de la carpeta simple, el árbol con el nombre del proyecto y lo de la derecha. */
function Cuerpo({ ruta, arbol, children }: { ruta: string; arbol: ReactNode; children: ReactNode }) {
  // Las carpetas de Iridium (Ideas, Skills) tampoco tienen `estado.md`, pero no son proyectos para pasar.
  const simple = usarEstado(
    (s) =>
      tarjetaDe(s.lista, ruta)?.framework === null &&
      ruta !== rutaGeneral(s.lista) &&
      ruta !== rutaSkills(s.lista),
  )
  const nombre = usarEstado((s) => tarjetaDe(s.lista, ruta)?.nombre ?? '')
  return (
    <>
      {simple && <CarpetaSimple ruta={ruta} />}
      <div className="archivos-cols">
        <nav aria-label={`Archivos de ${nombre}`}>
          <h3 className="bloque-titulo archivos-titulo">{nombre}</h3>
          <div className="arbol">{arbol}</div>
        </nav>
        {children}
      </div>
    </>
  )
}

/**
 * Con un archivo elegido: la Cabecera con su ruta en gris (al pasar el mouse, cuántas líneas y de qué lenguaje), Ver
 * en Docs si es un documento, Abrir en VS Code (en la línea, si vino de un comentario) y Atrás; debajo, el visor.
 */
function ConArchivo({
  ruta,
  fuente,
  archivo,
  arbol,
}: {
  ruta: string
  fuente: FuenteArchivos
  archivo: string
  arbol: ReactNode
}) {
  const linea = usarEstado((s) => vistaDe(s.vistas, ruta).linea)
  const atras = usarEstado((s) => vistaDe(s.vistas, ruta).atras.length)
  const abrirDoc = usarEstado((s) => s.abrirDoc)
  const [contenido, leer] = useArchivo(fuente, archivo)
  const [error, setError] = useState<string | null>(null)
  // biome-ignore lint/correctness/useExhaustiveDependencies: el aviso es del archivo en que se tocó.
  useEffect(() => setError(null), [archivo])
  const vsCode = async () => {
    setError(null)
    const r = await window.iridium.abrirEnVsCode(ruta, archivo, linea)
    if (r.tipo === 'error') setError(r.mensaje)
  }
  return (
    <>
      <ReleerDocs ruta={ruta} archivo={archivo} leer={leer} />
      <Cabecera
        titulo="Archivos"
        sub={
          <span className="archivos-ruta" title={detalleArchivo(contenido) || undefined}>
            {archivo}
          </span>
        }
        acciones={
          <>
            {contenido?.tipo === 'texto' && contenido.documento && (
              <button
                type="button"
                className="boton sin-fondo"
                title="Leerlo en Docs, con los códigos como enlaces"
                onClick={() => abrirDoc(ruta, { documento: archivo, ancla: '' })}
              >
                <Icono nombre="docs" />
                Ver en Docs
              </button>
            )}
            <button
              type="button"
              className="boton sin-fondo"
              title={
                linea
                  ? `Lo abre en VS Code, en la línea ${linea}`
                  : 'Lo abre en VS Code, con la carpeta del proyecto'
              }
              onClick={() => void vsCode()}
            >
              <Icono nombre="abrir" />
              Abrir en VS Code
            </button>
            {atras > 0 && <BotonAtras ruta={ruta} />}
          </>
        }
      />
      {error && (
        <div className="archivos-simple">
          <div className="recuadro error" role="alert">
            <Icono nombre="error" />
            <span>{error}</span>
          </div>
        </div>
      )}
      <Cuerpo ruta={ruta} arbol={arbol}>
        <VisorArchivo contenido={contenido} archivo={archivo} linea={linea} />
      </Cuerpo>
    </>
  )
}

export function Archivos({ ruta }: { ruta: string }) {
  const archivo = usarEstado((s) => vistaDe(s.vistas, ruta).archivo)
  const carpetas = usarEstado((s) => vistaDe(s.vistas, ruta).carpetas)
  const atras = usarEstado((s) => vistaDe(s.vistas, ruta).atras.length)
  const cambiarVista = usarEstado((s) => s.cambiarVista)
  const fuente = useMemo<FuenteArchivos>(
    () => ({
      clave: ruta,
      carpeta: (c) => window.iridium.carpeta(ruta, c),
      archivo: (a) => window.iridium.archivo(ruta, a),
    }),
    [ruta],
  )
  const marcas = useMarcasGit(ruta)
  const eleccion: EleccionArbol = {
    abiertas: carpetas,
    alternar: (c) => cambiarVista(ruta, { carpetas: alternarCarpeta(carpetas, c) }),
    elegido: archivo,
    elegir: (a) => cambiarVista(ruta, { archivo: a, linea: null }),
  }
  const arbol = <ArbolArchivos fuente={fuente} eleccion={eleccion} marcas={marcas} />
  if (archivo) return <ConArchivo ruta={ruta} fuente={fuente} archivo={archivo} arbol={arbol} />
  return (
    <>
      <Cabecera titulo="Archivos" acciones={atras > 0 && <BotonAtras ruta={ruta} />} />
      <Cuerpo ruta={ruta} arbol={arbol}>
        <div className="archivos-visor">
          <div className="archivos-aviso">
            <div className="recuadro vacio">
              <strong>Elige un archivo del árbol</strong>
              <span>Se ve tal cual, sin poder editarlo: el texto con colores, las imágenes como imagen.</span>
            </div>
          </div>
        </div>
      </Cuerpo>
    </>
  )
}

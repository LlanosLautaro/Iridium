// Diseño de un proyecto (frente Diseño, DS-8 a DS-13; D-105): las maquetas HTML de `docs/diseno/` vivas en un lienzo,
// agrupadas por sección (Pantallas), los tokens y las piezas (Sistema) y una maqueta grande para usarla y comentarla
// con F8. Se redibuja sola cuando la IA cambia algo; lo que cambió y no se miró lleva un punto. Sin `docs/diseno/`,
// ofrece pedírselo a la IA. Una maqueta puede tener otras versiones (DI-I4): se piden desde la grande, se miran lado a
// lado y se elige con cuál quedarse. Probar una dirección (DI-I4) pone otros tokens sobre todo el lienzo, para elegirla
// o descartarla. Los pedidos quedan citados en la conversación, sin mandar (D-196): el usuario agrega lo suyo y elige
// si van en esa conversación o en una nueva.
import { type FocusEvent, type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react'
import type { MaquetaVista, VistaDiseno } from '../../../../compartido/diseno'
import { fichaDe, tarjetaDe, usarEstado, vistaDe } from '../../../estado'
import { Cabecera, Filtros } from '../../../ui/Cabecera'
import { Icono } from '../../../ui/Icono'
import { mismaRuta } from '../enlaces'
import { ConfirmarQuedarme } from './CuadrosVersion'
import { ConfirmarElegir, MenuDirecciones, type ModoDireccion, nombreDe, Probando } from './Direccion'
import { useEsperaPedido } from './esperaPedido'
import { Grande } from './Grande'
import { MaquetasVivas, Miniatura } from './Miniatura'
import { Sistema } from './Sistema'
import { Versiones } from './Versiones'

const ANCHOS = { chico: 240, grande: 400 } as const
type Tamano = keyof typeof ANCHOS

/** La vista sin el punto en esos archivos (maquetas, versiones o piezas). */
function sinPunto(v: VistaDiseno | null, archivos: ReadonlySet<string>): VistaDiseno | null {
  if (v?.tipo !== 'diseno') return v
  const quitar = <T extends MaquetaVista>(m: T): T =>
    archivos.has(m.archivo) ? { ...m, cambiada: false } : m
  return {
    ...v,
    grupos: v.grupos.map((g) => ({
      ...g,
      maquetas: g.maquetas.map((m) => ({ ...quitar(m), versiones: m.versiones.map(quitar) })),
    })),
    sistema: { ...v.sistema, piezas: v.sistema.piezas ? quitar(v.sistema.piezas) : null },
  }
}

/** La clave de la cita de otra versión: una por maqueta; pedir otra vez la reemplaza. */
const claveVersion = (maqueta: string) => `diseno:version:${maqueta}`
/** La clave de la cita de una dirección nueva: una sola; pedir otra vez la reemplaza. */
const CLAVE_DIRECCION = 'diseno:direccion'

/** El nombre de una dirección guardada por su archivo: `direcciones/anterior-2026-11-26.css` → `anterior-2026-11-26`. */
function nombreArchivo(archivo: string): string {
  return (archivo.split('/').pop() ?? archivo).replace(/\.css$/i, '')
}

/** La letra de una versión por su archivo: `versiones/bandeja/b.html` → `B`. */
function letraDe(version: string): string {
  return (version.split('/').pop() ?? '').replace(/\.html?$/i, '').toUpperCase()
}

/** La clave de la miniatura con la dirección, lado a lado con la de hoy. */
const DE_DIRECCION = '#direccion'

/** Cuánto siguen cargadas las maquetas después de salir de Diseño: ir y volver enseguida no las recarga. */
export const VIVAS_DESPUES_MS = 30_000

/** Si las maquetas siguen cargadas: a la vista, sí; al salir, hasta `VIVAS_DESPUES_MS` después. */
function useVivas(aLaVista: boolean): boolean {
  const [vivas, setVivas] = useState(aLaVista)
  useEffect(() => {
    if (aLaVista) {
      setVivas(true)
      return
    }
    const t = setTimeout(() => setVivas(false), VIVAS_DESPUES_MS)
    return () => clearTimeout(t)
  }, [aLaVista])
  return vivas
}

export function Diseno({ ruta }: { ruta: string }) {
  const [vista, setVista] = useState<VistaDiseno | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pestana, setPestana] = useState<'pantallas' | 'sistema'>('pantallas')
  const [tamano, setTamano] = useState<Tamano>('chico')
  const [grande, setGrande] = useState<string | null>(null)
  const [pedido, setPedido] = useState<string | null>(null)
  const citar = usarEstado((s) => s.citar)
  const citas = usarEstado((s) => s.citas[ruta])
  const trabajando = usarEstado((s) => fichaDe(s.fichas, ruta)?.estado === 'trabajando')
  const comentarios = usarEstado((s) => tarjetaDe(s.lista, ruta)?.revision ?? 0)
  const abrirSeccion = usarEstado((s) => s.abrirSeccion)
  const abrirArchivo = usarEstado((s) => s.abrirArchivo)
  const pedida = usarEstado((s) => vistaDe(s.vistas, ruta).maqueta)
  const vivas = useVivas(usarEstado((s) => vistaDe(s.vistas, ruta).seccion === 'diseno'))
  const cambiarVista = usarEstado((s) => s.cambiarVista)
  const [noEsta, setNoEsta] = useState<string | null>(null)
  const botones = useRef(new Map<string, HTMLButtonElement>())
  const volverA = useRef<string | null>(null)
  /** La miniatura que recibe el Tab: el lienzo es una sola parada y las flechas recorren (paso 8). */
  const [activa, setActiva] = useState<string | null>(null)
  // Las versiones (DI-I4): la maqueta que se mira lado a lado, la versión que está escribiendo la IA y los cuadros.
  const [comparar, setComparar] = useState<string | null>(null)
  const [pidiendo, setPidiendo] = useState<{ archivo: string; maqueta: string } | null>(null)
  const [noLlego, setNoLlego] = useState<string | null>(null)
  const [errorVersion, setErrorVersion] = useState<string | null>(null)
  const [quedarme, setQuedarme] = useState<{ maqueta: string; version: string | null } | null>(null)
  // Probar una dirección (DI-I4): la puesta, cómo se ve, la grande sin ella, la pedida a la IA y su cuadro.
  const [probando, setProbando] = useState<string | null>(null)
  const [modo, setModo] = useState<ModoDireccion>('direccion')
  const [grandeHoy, setGrandeHoy] = useState(false)
  const [pidiendoDir, setPidiendoDir] = useState<ReadonlySet<string> | null>(null)
  const [avisoDir, setAvisoDir] = useState<{ texto: string; error: boolean } | null>(null)
  const [eligiendo, setEligiendo] = useState(false)

  const leer = useCallback(() => {
    void window.iridium.abrirDiseno(ruta).then(
      (v) => {
        setVista(v)
        setError(null)
      },
      (e: unknown) => setError(e instanceof Error ? e.message : String(e)),
    )
  }, [ruta])
  useEffect(leer, [leer])
  useEffect(() => window.iridium.alCambiarDiseno((c) => mismaRuta(c.ruta, ruta) && leer()), [ruta, leer])

  const maquetas: MaquetaVista[] =
    vista?.tipo === 'diseno'
      ? [...vista.grupos.flatMap((g) => g.maquetas), ...(vista.sistema.piezas ? [vista.sistema.piezas] : [])]
      : []
  const enLienzo = vista?.tipo === 'diseno' ? vista.grupos.flatMap((g) => g.maquetas) : []
  const direcciones = vista?.tipo === 'diseno' ? vista.direcciones : []
  const dir = direcciones.find((d) => d.archivo === probando) ?? null
  /** La base de las miniaturas con la dirección puesta: `maqueta://<id>/~<nombre>/` (el protocolo cambia los tokens). */
  const baseDir = vista?.tipo === 'diseno' && dir ? `${vista.base}~${encodeURIComponent(dir.nombre)}/` : null
  /** Con la dirección, la huella también cambia cuando cambia ella: las que la usan se recargan. */
  const conDir = <T extends MaquetaVista>(m: T): T =>
    dir ? { ...m, huella: `${m.huella}.${dir.huella}` } : m

  /** La maqueta del índice de un archivo: ella misma o, si es una versión, la suya. */
  const deLienzo = (archivo: string | null) =>
    archivo === null
      ? undefined
      : enLienzo.find((m) => m.archivo === archivo || m.versiones.some((v) => v.archivo === archivo))

  /** Mirar unas maquetas las marca vistas (se va el punto). */
  const marcar = useCallback(
    (archivos: readonly string[]) => {
      if (archivos.length === 0) return
      setVista((v) => sinPunto(v, new Set(archivos)))
      for (const a of archivos) void window.iridium.marcarVista(ruta, a).catch(() => {})
    },
    [ruta],
  )
  /** Agrandar marca vista la maqueta. Con una dirección puesta, `hoy` la muestra sin ella (lado a lado, la de hoy). */
  const agrandar = useCallback(
    (archivo: string, hoy = false) => {
      setGrandeHoy(hoy)
      setGrande(archivo)
      marcar([archivo])
    },
    [marcar],
  )
  // Desde un comentario de la Revisión: esa maqueta grande o, si ya no está, el aviso.
  useEffect(() => {
    if (!pedida || vista?.tipo !== 'diseno') return
    cambiarVista(ruta, { maqueta: null })
    const existe = [
      ...vista.grupos.flatMap((g) => g.maquetas.flatMap((m) => [m, ...m.versiones])),
      ...(vista.sistema.piezas ? [vista.sistema.piezas] : []),
    ].some((m) => m.archivo === pedida)
    if (existe) {
      setNoEsta(null)
      agrandar(pedida)
    } else setNoEsta(pedida)
  }, [pedida, vista, ruta, cambiarVista, agrandar])

  // Volver desde la grande lleva al lienzo o, si se agrandó desde las versiones, a ellas.
  const volver = useCallback(() => {
    setGrande((g) => {
      volverA.current = g
      return null
    })
  }, [])

  // Lado a lado, las versiones que se ven quedan vistas; también las que llegan mientras se mira.
  const hoy = deLienzo(comparar)
  const sinMirar = hoy?.versiones.filter((v) => v.cambiada).map((v) => v.archivo) ?? []
  const claveSinMirar = sinMirar.join('|')
  useEffect(() => {
    if (comparar && !grande && claveSinMirar) marcar(claveSinMirar.split('|'))
  }, [comparar, grande, claveSinMirar, marcar])

  // La versión pedida: citada, espera a que el usuario la mande; mandada, llegó (se deja de esperar) o la IA terminó su
  // turno sin escribirla (se dice). Si la cita se sacó sin mandarla, se deja de esperar.
  const llego =
    pidiendo !== null && enLienzo.some((m) => m.versiones.some((v) => v.archivo === pidiendo.archivo))
  const citada = pidiendo !== null && (citas ?? []).some((c) => c.clave === claveVersion(pidiendo.maqueta))
  useEsperaPedido({
    esperando: pidiendo !== null,
    llego,
    citada,
    trabajando,
    terminar: (fin) => {
      if (fin === 'no-llego' && pidiendo) setNoLlego(pidiendo.archivo)
      setPidiendo(null)
    },
  })

  // La dirección pedida: igual, y al llegar se pone sobre el lienzo.
  const nueva = pidiendoDir ? direcciones.find((d) => !pidiendoDir.has(d.archivo)) : undefined
  const citadaDir = (citas ?? []).some((c) => c.clave === CLAVE_DIRECCION)
  useEsperaPedido({
    esperando: pidiendoDir !== null,
    llego: nueva !== undefined,
    citada: citadaDir,
    trabajando,
    terminar: (fin) => {
      if (fin === 'llego' && nueva) {
        setProbando(nueva.archivo)
        setModo('direccion')
        setAvisoDir(null)
      } else if (fin === 'no-llego')
        setAvisoDir({ texto: 'La IA terminó sin escribir la dirección: mirá la conversación.', error: false })
      setPidiendoDir(null)
    },
  })
  // Si la dirección puesta se va (la borró alguien), se deja de probar.
  useEffect(() => {
    if (probando && vista?.tipo === 'diseno' && !vista.direcciones.some((d) => d.archivo === probando))
      setProbando(null)
  }, [probando, vista])

  const verVersiones = useCallback((archivo: string) => {
    setErrorVersion(null)
    setGrande(null)
    setComparar(archivo)
  }, [])
  /** Guardar para después: las versiones quedan y se vuelve a la grande de hoy. */
  const dejarVersiones = useCallback(() => {
    const a = comparar
    setComparar(null)
    setNoLlego(null)
    setErrorVersion(null)
    if (a) agrandar(a)
  }, [comparar, agrandar])
  /** Otra versión (D-196): el pedido queda citado en la conversación y se pasa a las versiones, con su lugar. */
  const pedirOtra = (maqueta: string) => {
    setErrorVersion(null)
    window.iridium.citaDiseno(ruta, { tipo: 'version', maqueta }).then(
      ({ texto, archivo }) => {
        citar(ruta, {
          clave: claveVersion(maqueta),
          tipo: 'Otra versión',
          nombre: deLienzo(maqueta)?.nombre ?? maqueta,
          texto,
        })
        setNoLlego(null)
        if (archivo) setPidiendo({ archivo, maqueta })
        verVersiones(maqueta)
      },
      (e: unknown) => setErrorVersion(`No se pudo: ${e instanceof Error ? e.message : String(e)}`),
    )
  }
  const confirmarQuedarme = (maqueta: string, version: string | null) => {
    setErrorVersion(null)
    window.iridium.quedarmeConVersion(ruta, maqueta, version).then(
      () => {
        setComparar(null)
        setNoLlego(null)
        agrandar(maqueta)
        leer()
      },
      (e: unknown) => setErrorVersion(`No se pudo: ${e instanceof Error ? e.message : String(e)}`),
    )
  }
  // Al volver, el foco queda en la miniatura que se agrandó.
  useEffect(() => {
    if (grande || !volverA.current) return
    botones.current.get(volverA.current)?.focus()
    volverA.current = null
  }, [grande])

  /** Una dirección nueva (D-196): queda citada en la conversación; cuando la IA la escribe, se pone sobre el lienzo. */
  const pedirDireccion = () => {
    setAvisoDir(null)
    window.iridium.citaDiseno(ruta, { tipo: 'direccion' }).then(
      ({ texto }) => {
        citar(ruta, {
          clave: CLAVE_DIRECCION,
          tipo: 'Dirección nueva',
          nombre: 'Probar una dirección',
          texto,
        })
        setPidiendoDir(new Set(direcciones.map((d) => d.archivo)))
      },
      (e: unknown) =>
        setAvisoDir({ texto: `No se pudo: ${e instanceof Error ? e.message : String(e)}`, error: true }),
    )
  }
  const probar = (archivo: string) => {
    setAvisoDir(null)
    setProbando(archivo)
    setModo('direccion')
  }
  /** Elegir (con su cuadro): la dirección pasa a ser los tokens de todas las maquetas; la de hoy queda guardada. */
  const elegirDir = () => {
    if (!dir) return
    window.iridium.elegirDireccion(ruta, dir.archivo).then(
      (anterior) => {
        setProbando(null)
        setAvisoDir({
          texto: `Elegida «${nombreDe(dir)}»: ya es la de todas las maquetas.${anterior ? ` La de antes quedó guardada como «${nombreArchivo(anterior)}».` : ''}`,
          error: false,
        })
        leer()
      },
      (e: unknown) =>
        setAvisoDir({ texto: `No se pudo: ${e instanceof Error ? e.message : String(e)}`, error: true }),
    )
  }
  const descartarDir = () => {
    if (!dir) return
    window.iridium.descartarDireccion(ruta, dir.archivo).then(
      () => {
        setProbando(null)
        setAvisoDir({ texto: `Descartada «${nombreDe(dir)}»: su archivo fue a la papelera.`, error: false })
        leer()
      },
      (e: unknown) =>
        setAvisoDir({ texto: `No se pudo: ${e instanceof Error ? e.message : String(e)}`, error: true }),
    )
  }

  /** Pedírselo a la IA (D-196): queda citado en la conversación; las maquetas aparecen cuando lo mande. */
  const pedir = () => {
    setPedido(null)
    window.iridium.citaDiseno(ruta, 'empezar').then(
      ({ texto }) => {
        citar(ruta, { clave: 'diseno:empezar', tipo: 'Diseño', nombre: 'Armar el diseño', texto })
        setPedido(
          'El pedido quedó citado en la conversación: mandalo cuando quieras. Las maquetas aparecen acá a medida que la IA las guarda.',
        )
      },
      (e: unknown) => setPedido(`No se pudo armar el pedido: ${e instanceof Error ? e.message : String(e)}`),
    )
  }

  // En el lienzo, las flechas pasan de una miniatura a otra (Enter agranda: es un botón); Inicio y Fin, a la primera y
  // la última. Tab entra a la última que tuvo el foco y sale del lienzo: no recorre las cuarenta (paso 8).
  const lado = Boolean(dir && baseDir && modo === 'lado')
  const claves = enLienzo.flatMap((m) => (lado ? [m.archivo, `${m.archivo}${DE_DIRECCION}`] : [m.archivo]))
  const conTab = activa && claves.includes(activa) ? activa : (claves[0] ?? null)
  const alTeclado = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
    const lista = claves.map((c) => botones.current.get(c)).filter((b) => b !== undefined)
    const i = lista.indexOf(document.activeElement as HTMLButtonElement)
    if (i < 0) return
    e.preventDefault()
    const destino =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? lista.length - 1
          : i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1)
    lista[Math.min(lista.length - 1, Math.max(0, destino))]?.focus()
  }
  const alFoco = (e: FocusEvent<HTMLDivElement>) => {
    const clave = (e.target as HTMLElement).dataset.clave
    if (clave) setActiva(clave)
  }

  const paraQuedarme = deLienzo(quedarme?.maqueta ?? null)
  const cuadrosVersion = (
    <>
      {quedarme && (
        <ConfirmarQuedarme
          nombre={paraQuedarme?.nombre ?? quedarme.maqueta}
          letra={quedarme.version === null ? null : letraDe(quedarme.version)}
          cuantas={paraQuedarme?.versiones.length ?? 0}
          quedarme={() => confirmarQuedarme(quedarme.maqueta, quedarme.version)}
          cerrar={() => setQuedarme(null)}
        />
      )}
    </>
  )
  /** Con un cuadro abierto, Esc es del cuadro. */
  const quieto = quedarme !== null || eligiendo
  /** La dirección se ve en el lienzo (Dirección o Lado a lado) y en la grande, salvo la de hoy agrandada. */
  const conDireccion = dir !== null && modo !== 'hoy'

  if (vista?.tipo === 'diseno' && grande) {
    // Una versión, o la de hoy agrandada desde las versiones: las flechas recorren la de hoy y sus versiones.
    const suya = deLienzo(grande)
    const conVersiones = suya !== undefined && (comparar === suya.archivo || suya.archivo !== grande)
    return (
      <>
        <Grande
          carpeta={vista.carpeta}
          maquetas={
            grande === 'piezas.html'
              ? maquetas.filter((m) => m.archivo === grande)
              : conVersiones
                ? [suya, ...suya.versiones]
                : enLienzo
          }
          archivo={grande}
          elegir={agrandar}
          volver={volver}
          quieto={quieto}
          versiones={suya?.versiones.length ?? 0}
          verVersiones={suya ? () => verVersiones(suya.archivo) : null}
          otraVersion={suya?.archivo.startsWith('pantallas/') ? () => pedirOtra(suya.archivo) : null}
          trabajando={trabajando}
          direccion={conDireccion && dir && !grandeHoy ? { nombre: nombreDe(dir), css: dir.css } : null}
        />
        {cuadrosVersion}
      </>
    )
  }
  if (vista?.tipo === 'diseno' && hoy)
    return (
      <>
        <Versiones
          base={conDireccion && baseDir ? baseDir : vista.base}
          hoy={conDireccion ? { ...conDir(hoy), versiones: hoy.versiones.map(conDir) } : hoy}
          pidiendo={pidiendo && { archivo: pidiendo.archivo, citada }}
          noLlego={noLlego && !hoy.versiones.some((v) => v.archivo === noLlego) ? letraDe(noLlego) : null}
          error={errorVersion}
          trabajando={trabajando}
          quieto={quieto}
          agrandar={agrandar}
          quedarme={(version) => setQuedarme({ maqueta: hoy.archivo, version })}
          otraVersion={() => pedirOtra(hoy.archivo)}
          volver={dejarVersiones}
        />
        {cuadrosVersion}
      </>
    )

  const sinDiseno = vista?.tipo === 'sin-diseno'
  const cuenta = enLienzo.length
  return (
    <MaquetasVivas.Provider value={vivas}>
      <Cabecera
        titulo="Diseño"
        cuenta={cuenta > 0 ? cuenta : undefined}
        acciones={
          <>
            {vista?.tipo === 'diseno' && pestana === 'pantallas' && enLienzo.length > 0 && (
              <MenuDirecciones
                direcciones={direcciones}
                probando={probando}
                trabajando={trabajando}
                probar={probar}
                pedirNueva={pedirDireccion}
              />
            )}
            {comentarios > 0 && (
              <button
                type="button"
                className="boton sin-fondo chico"
                title="Los comentarios abiertos de la Revisión"
                onClick={() => abrirSeccion(ruta, 'revision')}
              >
                <Icono nombre="revision" />
                {comentarios === 1 ? '1 comentario' : `${comentarios} comentarios`}
              </button>
            )}
          </>
        }
        filtros={
          vista?.tipo === 'diseno' && (
            <>
              <Filtros
                filtros={[
                  { clave: 'pantallas', nombre: 'Pantallas' },
                  { clave: 'sistema', nombre: 'Sistema' },
                ]}
                elegido={pestana}
                elegir={(c) => setPestana(c as typeof pestana)}
                etiqueta="Pantallas o sistema"
              />
              {pestana === 'pantallas' && (
                <div className="derecha">
                  <Filtros
                    filtros={[
                      { clave: 'chico', nombre: 'Chicas' },
                      { clave: 'grande', nombre: 'Grandes' },
                    ]}
                    elegido={tamano}
                    elegir={(c) => setTamano(c as Tamano)}
                    etiqueta="Tamaño de las miniaturas"
                  />
                </div>
              )}
            </>
          )
        }
      />
      {error && (
        <p className="script-msg error" role="alert">
          <Icono nombre="error" />
          No se pudo leer: {error}
        </p>
      )}
      {!vista && !error && <p className="nota">Leyendo…</p>}
      {noEsta && (
        <p className="di-aviso" role="note">
          <Icono nombre="espera" />
          La maqueta {noEsta} ya no está.
        </p>
      )}
      {pedido && (
        <p className="di-pedido" role="status">
          {pedido}
        </p>
      )}
      {sinDiseno && (
        <div className="recuadro punteado di-falta" role="note">
          <div className="cuerpo-recuadro">
            <strong>Este proyecto todavía no tiene su diseño</strong>
            <span>
              Las pantallas se diseñan como maquetas que la IA escribe en <code>docs/diseno/</code>: se ven
              vivas acá, se usan y se comentan con F8.
            </span>
            <div className="acciones-recuadro">
              <button
                type="button"
                className="boton secundario chico"
                disabled={trabajando}
                title={
                  trabajando
                    ? 'Su IA está trabajando'
                    : 'Deja el pedido citado en la conversación: lo mandás cuando quieras'
                }
                onClick={pedir}
              >
                Pedírselo a la IA
              </button>
            </div>
          </div>
        </div>
      )}
      {vista?.tipo === 'diseno' && vista.problemaIndice && (
        <p className="di-aviso" role="note">
          <Icono nombre="espera" />
          {vista.problemaIndice}. La IA lo corrige al terminar su próximo turno.
        </p>
      )}
      {vista?.tipo === 'diseno' && pestana === 'pantallas' && pidiendoDir && (
        <p className="di-pedido" role="status">
          {citadaDir
            ? 'Citada en la conversación: escribí qué dirección probar y mandala. Se pone sobre todas las maquetas cuando la IA la guarde.'
            : 'La IA está escribiendo la dirección…'}
        </p>
      )}
      {vista?.tipo === 'diseno' && pestana === 'pantallas' && avisoDir && (
        <p
          className={avisoDir.error ? 'script-msg error' : 'di-pedido'}
          role={avisoDir.error ? 'alert' : 'status'}
        >
          {avisoDir.error && <Icono nombre="error" />}
          {avisoDir.texto}
        </p>
      )}
      {vista?.tipo === 'diseno' && pestana === 'pantallas' && dir && (
        <Probando
          direccion={dir}
          modo={modo}
          cambiarModo={setModo}
          trabajando={trabajando}
          elegir={() => setEligiendo(true)}
          descartar={descartarDir}
          dejar={() => setProbando(null)}
        />
      )}
      {eligiendo && dir && (
        <ConfirmarElegir direccion={dir} elegir={elegirDir} cerrar={() => setEligiendo(false)} />
      )}
      {vista?.tipo === 'diseno' && pestana === 'pantallas' && (
        // biome-ignore lint/a11y/noStaticElementInteractions: las flechas mueven el foco entre los botones de adentro.
        <div className="di-lienzo" onKeyDown={alTeclado} onFocus={alFoco}>
          {vista.grupos.length === 0 && !vista.problemaIndice && (
            <p className="cab-vacia">
              Todavía no hay pantallas en el índice. Aparecen acá cuando la IA las guarda.
            </p>
          )}
          {vista.grupos.map((g) => (
            <section key={g.seccion} className="di-grupo" aria-label={`${g.seccion}: ${g.maquetas.length}`}>
              <h3 className="di-grupo-t">
                {g.seccion} <span className="n">{g.maquetas.length}</span>
              </h3>
              <div className="di-fila">
                {g.maquetas.map((m) => {
                  const boton = (clave: string) => (b: HTMLButtonElement | null) => {
                    if (b) botones.current.set(clave, b)
                    else botones.current.delete(clave)
                  }
                  if (dir && baseDir && lado)
                    return (
                      <div key={m.archivo} className="di-par">
                        <Miniatura
                          base={vista.base}
                          maqueta={{ ...m, nombre: `${m.nombre} · hoy` }}
                          ancho={ANCHOS[tamano]}
                          agrandar={() => agrandar(m.archivo, true)}
                          boton={boton(m.archivo)}
                          clave={m.archivo}
                          enTab={conTab === m.archivo}
                        />
                        <Miniatura
                          base={baseDir}
                          maqueta={{ ...conDir(m), nombre: `${m.nombre} · ${nombreDe(dir)}` }}
                          ancho={ANCHOS[tamano]}
                          agrandar={() => agrandar(m.archivo)}
                          boton={boton(`${m.archivo}${DE_DIRECCION}`)}
                          clave={`${m.archivo}${DE_DIRECCION}`}
                          enTab={conTab === `${m.archivo}${DE_DIRECCION}`}
                        />
                      </div>
                    )
                  return (
                    <Miniatura
                      key={m.archivo}
                      base={conDireccion && baseDir ? baseDir : vista.base}
                      maqueta={conDireccion ? conDir(m) : m}
                      ancho={ANCHOS[tamano]}
                      agrandar={() => agrandar(m.archivo)}
                      boton={boton(m.archivo)}
                      clave={m.archivo}
                      enTab={conTab === m.archivo}
                    />
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
      {vista?.tipo === 'diseno' && pestana === 'sistema' && (
        <Sistema
          sistema={vista.sistema}
          base={vista.base}
          ancho={ANCHOS.grande}
          agrandar={agrandar}
          abrirTokens={() => abrirArchivo(ruta, 'docs/diseno/tokens.css')}
          pedir={trabajando ? null : pedir}
        />
      )}
    </MaquetasVivas.Provider>
  )
}

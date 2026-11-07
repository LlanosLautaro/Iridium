// Ideas (modulos/inicio/ux.md › IN-W1): la lista de `Ideas/ideas.md` por sección, la idea elegida al medio y, a la
// derecha, el chat general (el mismo de la grilla, Q-113) con «Sobre la idea …». Las ideas las escribe y las mueve la
// IA; acá solo se leen. Se arma igual que Skills.
import { type CSSProperties, type MouseEvent, useCallback, useEffect, useState } from 'react'
import type { ListaIdeas } from '../../../compartido/ideas'
import { CARPETA_GENERAL } from '../../../compartido/puente'
import { tamanoLegible } from '../../../compartido/tamanos'
import { rutaGeneral, usarEstado } from '../../estado'
import { Divisor, DivisorListaIdeas, useAnchoConversacion } from '../../ui/Divisor'
import { ChatGeneral } from '../inicio/ChatGeneral'
import { tocarEnlace } from '../proyecto/enlaces'
import { DetalleIdea, MensajeIdeas } from './DetalleIdea'
import { ListaDeIdeas, plegadosAlEmpezar, SiluetasIdeas } from './ListaIdeas'

export function Ideas() {
  const lista = usarEstado((s) => s.lista)
  const vista = usarEstado((s) => s.ideas)
  const cambiarIdeas = usarEstado((s) => s.cambiarIdeas)
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  const ancho = useAnchoConversacion('general')
  const anchoLista = usarEstado((s) => s.preferencias.anchoListaIdeas)
  const [ideas, setIdeas] = useState<ListaIdeas | null>(null)
  const rutaIdeas = rutaGeneral(lista)

  const leer = useCallback(() => {
    void window.iridium
      .ideas()
      .then(setIdeas, (e: unknown) =>
        setIdeas({ tipo: 'error', mensaje: e instanceof Error ? e.message : String(e) }),
      )
  }, [])

  // Al entrar se lee; cuando la IA cambia `ideas.md` (desde el chat, VS Code o el celular), la vigilancia avisa.
  useEffect(() => {
    leer()
    return window.iridium.alCambiarDocs((r) => r.split(/[\\/]/).pop() === CARPETA_GENERAL && leer())
  }, [leer])
  // Si la carpeta Ideas aparece o se va, la lista de proyectos cambia.
  const hayCarpeta = rutaIdeas !== null
  // biome-ignore lint/correctness/useExhaustiveDependencies: se relee solo cuando aparece o se va la carpeta.
  useEffect(() => {
    if (lista) leer()
  }, [hayCarpeta, leer])

  const secciones = ideas?.tipo === 'ideas' ? ideas.secciones : []
  const todas = secciones.flatMap((s) => s.ideas.map((i) => ({ i, seccion: s.titulo })))
  // La primera vez: la primera suelta (la primera sin integrar); si no hay, la primera que haya.
  const porDefecto = (todas.find((x) => !x.i.integrada) ?? todas[0])?.i.titulo ?? null
  const elegida =
    todas.find((x) => x.i.titulo === vista.elegida) ?? todas.find((x) => x.i.titulo === porDefecto)
  const plegados = vista.plegados ?? plegadosAlEmpezar(secciones)

  // La primera elección queda fija: si la IA agrega una idea arriba, el detalle no salta a otra.
  useEffect(() => {
    if (vista.elegida === null && porDefecto !== null) cambiarIdeas({ elegida: porDefecto })
  }, [vista.elegida, porDefecto, cambiarIdeas])

  const elegir = (titulo: string) => cambiarIdeas({ elegida: titulo, sinSobre: null })
  const plegar = (s: string) =>
    cambiarIdeas({ plegados: plegados.includes(s) ? plegados.filter((x) => x !== s) : [...plegados, s] })
  const abrir = rutaIdeas ? () => abrirProyecto(rutaIdeas) : null
  const sobre =
    elegida && vista.sinSobre !== elegida.i.titulo
      ? {
          nombre: elegida.i.titulo,
          que: 'idea' as const,
          quitar: () => cambiarIdeas({ sinSobre: elegida.i.titulo }),
        }
      : null

  let detalle = null
  if (ideas?.tipo === 'ideas' && elegida)
    detalle = (
      <DetalleIdea key={elegida.i.titulo} idea={elegida.i} seccion={elegida.seccion} rutaIdeas={rutaIdeas} />
    )
  else if (ideas?.tipo === 'ideas' || ideas?.tipo === 'sin-archivo')
    detalle = (
      <MensajeIdeas titulo="Todavía no hay ideas anotadas">
        Contáselas al chat de la derecha: las anota en <code>{CARPETA_GENERAL}/ideas.md</code> y aparecen acá.
      </MensajeIdeas>
    )
  else if (ideas?.tipo === 'sin-carpeta')
    detalle = (
      <MensajeIdeas titulo="No está la carpeta Ideas">
        Iridium guarda las ideas en la carpeta <code>{CARPETA_GENERAL}</code> de <code>.iridium</code>, en tu
        carpeta de proyectos, y no pudo crearla. Revisá esa carpeta en Ajustes › Proyectos y volvé a abrir
        Iridium.
      </MensajeIdeas>
    )
  else if (ideas?.tipo === 'grande')
    detalle = (
      <MensajeIdeas titulo="ideas.md es muy grande">
        Pesa {tamanoLegible(ideas.bytes)}, es muy grande para mostrarlo acá. Abrilo con su programa si lo
        necesitás.
      </MensajeIdeas>
    )
  else if (ideas?.tipo === 'error')
    detalle = (
      <MensajeIdeas titulo="No se pudo leer ideas.md">
        {ideas.mensaje}{' '}
        <button type="button" className="btn secundario chico" onClick={leer}>
          Reintentar
        </button>
      </MensajeIdeas>
    )
  else if (ideas?.tipo === 'sin-secciones')
    detalle = (
      <section className="sk-detalle id-detalle" aria-label="ideas.md">
        <div className="cuerpo">
          {/* biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: los enlaces ya se usan con el teclado. */}
          <div
            className="md"
            onClick={(e: MouseEvent) => {
              if (rutaIdeas) tocarEnlace(e, rutaIdeas)
            }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML armado por el proceso principal con markdown-it sin HTML crudo (D-027).
            dangerouslySetInnerHTML={{ __html: ideas.html }}
          />
        </div>
      </section>
    )

  return (
    <main className="trabajo proyecto" style={{ '--ancho-chat': `${ancho}px` } as CSSProperties}>
      <div className="principal sk-vista" style={{ '--ancho-lista': `${anchoLista}px` } as CSSProperties}>
        {ideas ? (
          <ListaDeIdeas
            lista={ideas}
            elegida={elegida?.i.titulo ?? null}
            elegir={elegir}
            plegados={plegados}
            plegar={plegar}
            abrir={abrir}
          />
        ) : (
          <SiluetasIdeas abrir={abrir} />
        )}
        <DivisorListaIdeas ancho={anchoLista} />
        {detalle}
      </div>
      <Divisor vista="general" ancho={ancho} />
      <aside className="chat" aria-label="Chat general">
        <ChatGeneral sobre={sobre} />
      </aside>
    </main>
  )
}

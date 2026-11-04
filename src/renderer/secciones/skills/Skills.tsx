// Skills (modulos/skills/ux.md › SK-W1): la lista por origen, el detalle de lo elegido y, a la derecha, la conversación
// de Skills (D-068, D-083). Armada sin depender del marco, para poder ir como panel del módulo Inicio.
import { type CSSProperties, useCallback, useEffect, useState } from 'react'
import { CARPETA_SKILLS } from '../../../compartido/puente'
import type { Atrasados as DatosAtrasados, ListaSkills, OrigenSkill } from '../../../compartido/skills'
import { rutaSkills, tarjetaDe, usarEstado } from '../../estado'
import { cambiarAncho, Divisor, DivisorListaSkills } from '../../ui/Divisor'
import { AbrirComoProyecto } from '../inicio/AbrirComoProyecto'
import { Conversacion } from '../proyecto/Conversacion'
import { Atrasados } from './Atrasados'
import { DetalleSkill } from './DetalleSkill'
import { ATRASADOS, ListaDeSkills, plegadosAlEmpezar, SiluetasLista } from './ListaSkills'

/** El chat de la derecha; si falta la carpeta, lo dice, como el chat de Ideas. */
function ChatSkills({ sobre }: { sobre: { nombre: string; quitar: () => void } | null }) {
  const lista = usarEstado((s) => s.lista)
  const p = tarjetaDe(lista, rutaSkills(lista))
  if (!p)
    return (
      <div className="chat-falta" role="note">
        <b>Chat de Skills</b>
        <p>
          Iridium usa la carpeta <code>{CARPETA_SKILLS}</code> de la carpeta Iridium para tus skills propias y
          no pudo crearla. Revisá esa carpeta en Ajustes › Proyectos.
        </p>
      </div>
    )
  return <Conversacion key={p.ruta} p={p} chat="skills" sobre={sobre} />
}

export function Skills() {
  const lista = usarEstado((s) => s.lista)
  const vista = usarEstado((s) => s.skills)
  const cambiarSkills = usarEstado((s) => s.cambiarSkills)
  const escribirEnCampo = usarEstado((s) => s.escribirEnCampo)
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  const ancho = usarEstado((s) => s.preferencias.anchoConversacion)
  const anchoLista = usarEstado((s) => s.preferencias.anchoListaSkills)
  const [skills, setSkills] = useState<ListaSkills | null>(null)
  const [atrasados, setAtrasados] = useState<DatosAtrasados | null>(null)

  const leerSkills = useCallback(() => {
    void window.iridium.skills().then(setSkills)
  }, [])
  const leerAtrasados = useCallback(() => {
    void window.iridium.atrasados().then(setAtrasados)
  }, [])

  // Al entrar se lee todo; con la sección abierta, la vigilancia avisa cuando cambia una skill propia o el formato de
  // un proyecto. La carpeta de Claude no se vigila: lo de la cuenta y los complementos se ve al volver a entrar.
  useEffect(() => {
    leerSkills()
    return window.iridium.alCambiarSkills(() => {
      leerSkills()
      leerAtrasados()
    })
  }, [leerSkills, leerAtrasados])
  // La lista de proyectos cambia cuando cambia un `estado.md` o una ficha (archivado, reemplazado).
  useEffect(() => {
    if (lista) leerAtrasados()
  }, [lista, leerAtrasados])

  const nAtrasados = atrasados?.proyectos.length ?? 0
  // La primera vez: Proyectos atrasados, o la primera propia si están todos al día.
  const porDefecto =
    atrasados && atrasados.vigente !== null && nAtrasados === 0
      ? (skills?.skills.find((s) => s.origen === 'propia')?.id ?? ATRASADOS)
      : ATRASADOS
  const elegidaSkill = skills?.skills.find((s) => s.id === vista.elegida) ?? null
  const elegida = vista.elegida === ATRASADOS ? ATRASADOS : (elegidaSkill?.id ?? porDefecto)
  const skill = skills?.skills.find((s) => s.id === elegida) ?? null
  const plegados = vista.plegados ?? (skills ? plegadosAlEmpezar(skills) : [])

  // La primera elección queda fija: si después se ponen todos al día, el detalle no salta a otra skill.
  useEffect(() => {
    if (vista.elegida === null && skills && atrasados) cambiarSkills({ elegida: porDefecto })
  }, [vista.elegida, skills, atrasados, porDefecto, cambiarSkills])

  const elegir = (id: string) => cambiarSkills({ elegida: id, sinSobre: null })
  const plegar = (o: OrigenSkill) =>
    cambiarSkills({ plegados: plegados.includes(o) ? plegados.filter((x) => x !== o) : [...plegados, o] })
  const rutaChat = rutaSkills(lista)
  const pedir = (texto: string) => {
    if (rutaChat) escribirEnCampo(rutaChat, texto)
  }
  const sobre =
    skill && vista.sinSobre !== skill.id
      ? { nombre: skill.nombre, quitar: () => cambiarSkills({ sinSobre: skill.id }) }
      : null

  return (
    <main className="trabajo proyecto" style={{ '--ancho-chat': `${ancho}px` } as CSSProperties}>
      <div className="principal sk-vista" style={{ '--ancho-lista': `${anchoLista}px` } as CSSProperties}>
        {skills ? (
          <ListaDeSkills
            lista={skills}
            atrasados={atrasados}
            elegida={elegida}
            elegir={elegir}
            plegados={plegados}
            plegar={plegar}
            reintentar={leerSkills}
            abrir={
              rutaChat ? (
                <AbrirComoProyecto abrir={() => abrirProyecto(rutaChat)} carpeta={CARPETA_SKILLS} />
              ) : null
            }
          />
        ) : (
          <SiluetasLista />
        )}
        <DivisorListaSkills ancho={anchoLista} />
        {skills &&
          (skill ? (
            <DetalleSkill
              key={skill.id}
              s={skill}
              atrasados={skill.nombre === 'hitos-desarrollo-app' ? nAtrasados : null}
              verAtrasados={() => elegir(ATRASADOS)}
              pedir={pedir}
              hayChat={rutaChat !== null}
            />
          ) : (
            <Atrasados datos={atrasados} />
          ))}
      </div>
      <Divisor ancho={ancho} cambiar={cambiarAncho} />
      <aside className="chat" aria-label="Chat de Skills">
        <ChatSkills sobre={sobre} />
      </aside>
    </main>
  )
}

// Skills (modulos/skills/ux.md › SK-W1, 04-ux.md › W-13): Framework y la lista por origen, el detalle de lo elegido y,
// a la derecha, la conversación de Skills (D-068, D-083). Armada sin depender del marco, para poder ir como panel del
// módulo Inicio.
import { type CSSProperties, useCallback, useEffect, useState } from 'react'
import { CARPETA_SKILLS } from '../../../compartido/puente'
import {
  fueraDelFramework,
  type ListaSkills,
  type OrigenSkill,
  type ProyectoFramework,
} from '../../../compartido/skills'
import { rutaSkills, tarjetaDe, usarEstado } from '../../estado'
import { Divisor, DivisorListaSkills, useAnchoConversacion } from '../../ui/Divisor'
import { AbrirComoProyecto } from '../inicio/AbrirComoProyecto'
import { Conversacion } from '../proyecto/Conversacion'
import { DetalleSkill } from './DetalleSkill'
import { Framework } from './Framework'
import { FRAMEWORK, ListaDeSkills, plegadosAlEmpezar, SiluetasLista } from './ListaSkills'

/** El chat de la derecha; si falta la carpeta, lo dice, como el chat de Ideas. */
function ChatSkills({ sobre }: { sobre: { nombre: string; quitar: () => void } | null }) {
  const lista = usarEstado((s) => s.lista)
  const p = tarjetaDe(lista, rutaSkills(lista))
  if (!p)
    return (
      <div className="chat-falta" role="note">
        <b>Chat de Skills</b>
        <p>
          Iridium usa la carpeta <code>{CARPETA_SKILLS}</code> de <code>.iridium</code>, en tu carpeta de
          proyectos, para tus skills propias y no pudo crearla. Revisa esa carpeta en Ajustes › Proyectos.
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
  const ancho = useAnchoConversacion('skills')
  const anchoLista = usarEstado((s) => s.preferencias.anchoListaSkills)
  const [skills, setSkills] = useState<ListaSkills | null>(null)
  const [framework, setFramework] = useState<ProyectoFramework[] | null>(null)

  const leerSkills = useCallback(() => {
    void window.iridium.skills().then(setSkills)
  }, [])
  const leerFramework = useCallback(() => {
    void window.iridium.framework().then(setFramework)
  }, [])

  // Al entrar se lee todo; con la sección abierta, la vigilancia avisa cuando cambia una skill propia o el
  // `docs/README.md` de un proyecto. La carpeta de Claude no se vigila: lo de la cuenta y los complementos se ve al
  // volver a entrar.
  useEffect(() => {
    leerSkills()
    return window.iridium.alCambiarSkills(() => {
      leerSkills()
      leerFramework()
    })
  }, [leerSkills, leerFramework])
  // La lista de proyectos cambia cuando cambia un documento o una ficha: los avisos del control vienen con ella.
  useEffect(() => {
    if (lista) leerFramework()
  }, [lista, leerFramework])

  const fuera = framework?.filter((p) => fueraDelFramework(p.estado)).length ?? 0
  // La primera vez: Framework si hay alguno fuera; si no, la primera propia.
  const porDefecto =
    framework && fuera === 0
      ? (skills?.skills.find((s) => s.origen === 'propia')?.id ?? FRAMEWORK)
      : FRAMEWORK
  const elegidaSkill = skills?.skills.find((s) => s.id === vista.elegida) ?? null
  const elegida = vista.elegida === FRAMEWORK ? FRAMEWORK : (elegidaSkill?.id ?? porDefecto)
  const skill = skills?.skills.find((s) => s.id === elegida) ?? null
  const plegados = vista.plegados ?? (skills ? plegadosAlEmpezar(skills) : [])

  // La primera elección queda fija: si después se ponen todos al día, el detalle no salta a otra skill.
  useEffect(() => {
    if (vista.elegida === null && skills && framework) cambiarSkills({ elegida: porDefecto })
  }, [vista.elegida, skills, framework, porDefecto, cambiarSkills])

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
      <div
        className="zona-principal sk-vista"
        style={{ '--ancho-lista': `${anchoLista}px` } as CSSProperties}
      >
        {skills ? (
          <ListaDeSkills
            lista={skills}
            framework={framework}
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
            <DetalleSkill key={skill.id} s={skill} pedir={pedir} hayChat={rutaChat !== null} />
          ) : (
            <Framework proyectos={framework} />
          ))}
      </div>
      <Divisor vista="skills" ancho={ancho} />
      <aside className="chat" aria-label="Chat de Skills">
        <ChatSkills sobre={sobre} />
      </aside>
    </main>
  )
}

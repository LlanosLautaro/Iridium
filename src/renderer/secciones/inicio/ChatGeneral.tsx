// El chat general (D-060): la conversación de la carpeta Ideas. Es el mismo al lado de la grilla y en la sección Ideas
// (modulos/inicio/, Q-113).
import { CARPETA_GENERAL } from '../../../compartido/puente'
import { rutaGeneral, tarjetaDe, usarEstado } from '../../estado'
import { Conversacion } from '../proyecto/Conversacion'

/** Si no está la carpeta Ideas, dice cómo tenerlo; mientras se lee la carpeta de proyectos, nada (ronda de UX 1). */
export function ChatGeneral() {
  const lista = usarEstado((s) => s.lista)
  const p = tarjetaDe(lista, rutaGeneral(lista))
  if (!lista) return null
  if (!p)
    return (
      <div className="chat-falta" role="note">
        <b>Chat general</b>
        <p>
          Para conversar aquí de varios proyectos y de ideas sueltas, Iridium usa la carpeta{' '}
          <code>{CARPETA_GENERAL}</code> de <code>.iridium</code>, en tu carpeta de proyectos, y no pudo
          crearla. Revisa esa carpeta en Ajustes › Proyectos.
        </p>
      </div>
    )
  return <Conversacion key={p.ruta} p={p} chat="ideas" />
}

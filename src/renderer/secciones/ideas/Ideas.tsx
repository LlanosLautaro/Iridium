// Ideas del inicio (frente Ideas, ID-I4; D-128; la maqueta `docs/diseno/pantallas/ideas-inicio-c.html`): la misma lista
// que en un proyecto, con las ideas sueltas de la carpeta Ideas (`sueltas.md`). Al lado del campo se elige en qué
// proyecto anotar, y cada idea suelta se puede Mover a un proyecto (ID-7). Reemplaza al bloc de notas (D-112, D-126).
// Revisar con la IA y Hablar de esta idea citan en el chat general, al lado.
import type { CSSProperties } from 'react'
import { CARPETA_GENERAL } from '../../../compartido/puente'
import { rutaGeneral, usarEstado } from '../../estado'
import { Cabecera } from '../../ui/Cabecera'
import { Divisor, useAnchoConversacion } from '../../ui/Divisor'
import { Icono } from '../../ui/Icono'
import { AbrirComoProyecto } from '../inicio/AbrirComoProyecto'
import { ChatGeneral } from '../inicio/ChatGeneral'
import { IdeasProyecto } from '../proyecto/IdeasProyecto'

export function Ideas() {
  const lista = usarEstado((s) => s.lista)
  const abrirProyecto = usarEstado((s) => s.abrirProyecto)
  const ancho = useAnchoConversacion('general')
  const rutaIdeas = rutaGeneral(lista)

  return (
    <main className="trabajo proyecto" style={{ '--ancho-chat': `${ancho}px` } as CSSProperties}>
      <section className="zona-principal ideas-inicio" aria-label="Ideas">
        {rutaIdeas ? (
          <IdeasProyecto
            key={rutaIdeas}
            ruta={rutaIdeas}
            inicio
            acciones={<AbrirComoProyecto abrir={() => abrirProyecto(rutaIdeas)} carpeta="Ideas" />}
          />
        ) : (
          <>
            <Cabecera nivel={1} titulo="Ideas" />
            <div className="idp-cuerpo">
              <div className="idp-col">
                <div className="recuadro error" role="alert">
                  <Icono nombre="error" />
                  <div className="cuerpo-recuadro">
                    <strong>No está la carpeta Ideas</strong>
                    <span>
                      Iridium guarda las ideas sueltas en la carpeta <code>{CARPETA_GENERAL}</code> de{' '}
                      <code>.iridium</code>, en tu carpeta de proyectos, y no pudo crearla. Revisa esa carpeta
                      en Ajustes › Proyectos.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
      <Divisor vista="general" ancho={ancho} />
      <aside className="chat" aria-label="Chat general">
        <ChatGeneral />
      </aside>
    </main>
  )
}

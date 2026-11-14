import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../docs/diseno/tokens.css'
import './estilos/tokens-viejos.css'
import './estilos/base.css'
import './estilos/piezas.css'
import './estilos/marco.css'
import './estilos/proyectos.css'
import './estilos/proyecto.css'
import './estilos/conversacion.css'
import './estilos/pendientes.css'
import './estilos/revision.css'
import './estilos/git.css'
import './estilos/uso.css'
import './estilos/ajustes.css'
import './estilos/skills.css'
import './estilos/ideas.css'
import './estilos/trabajo.css'
import './estilos/diseno.css'
import { App } from './App'

const raiz = document.getElementById('raiz')
if (raiz)
  createRoot(raiz).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )

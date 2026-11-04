import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../docs/ui/tokens.css'
import './estilos/base.css'
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
import { App } from './App'

const raiz = document.getElementById('raiz')
if (raiz)
  createRoot(raiz).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )

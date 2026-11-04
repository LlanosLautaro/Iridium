// App de prueba de la Revisión (tests/e2e/r1-revision.spec.ts): React 19 con Vite, como las apps del usuario.
import { createRoot } from 'react-dom/client'
import { Tarjeta } from './Tarjeta.jsx'

function App() {
  return (
    <main style={{ padding: 32, fontFamily: 'Georgia, serif', background: '#f4f2ee', minHeight: '100vh' }}>
      <h1>Ajustes</h1>
      <Tarjeta titulo="Primera" />
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)

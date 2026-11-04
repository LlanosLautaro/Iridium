import { createRoot } from 'react-dom/client'
import { Tarjeta } from './Tarjeta.jsx'

function App() {
  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>App de prueba</h1>
      <Tarjeta titulo="Primera" />
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)

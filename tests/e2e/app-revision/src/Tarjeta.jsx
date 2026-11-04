import { useState } from 'react'

// El botón cuenta sus clics: en modo comentar, un clic elige el elemento y no le llega a la app.
export function Tarjeta({ titulo }) {
  const [clics, setClics] = useState(0)
  return (
    <section
      style={{ background: 'white', border: '1px solid #e3ddd3', borderRadius: 12, padding: 20, width: 320 }}
    >
      <h2>{titulo}</h2>
      <button
        type="button"
        id="objetivo"
        onClick={() => setClics(clics + 1)}
        style={{ background: '#2f5d50', color: 'white', padding: '10px 16px', border: 0, borderRadius: 8 }}
      >
        Guardar
      </button>
      <p id="clics">Clics: {clics}</p>
    </section>
  )
}

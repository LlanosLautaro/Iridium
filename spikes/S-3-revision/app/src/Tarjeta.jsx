// Archivo aparte para comprobar que la pista apunta al componente que dibuja el elemento.
export function Tarjeta({ titulo }) {
  return (
    <section style={{ border: '1px solid #888', padding: 12, width: 240 }}>
      <h2>{titulo}</h2>
      <button id="objetivo" style={{ background: '#3a6', color: 'white', padding: 8 }}>
        Guardar
      </button>
    </section>
  )
}

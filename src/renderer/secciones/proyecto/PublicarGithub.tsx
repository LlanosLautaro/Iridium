// Crear el repositorio y publicarlo en GitHub (D-081), como el control de código de VS Code: un botón cuando el
// proyecto no tiene git y otro cuando el repositorio está solo en la PC, con el cuadro para elegir el nombre y si es
// privado o público. La sesión de GitHub es la de git: si no hay, git abre su ventana para iniciarla.
import { useEffect, useRef, useState } from 'react'
import { esNombreRepo, nombreRepoDe } from '../../../compartido/github'
import type { CuentaGithub, ResultadoGit } from '../../../compartido/puente'

/** Cuando el proyecto no tiene git: lo explica y ofrece crear el repositorio. */
export function SinRepositorio({ ruta, listo }: { ruta: string; listo: (r: ResultadoGit) => void }) {
  const [trabajando, setTrabajando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const crear = async () => {
    setTrabajando(true)
    setError(null)
    const r = await window.iridium.inicializarGit(ruta)
    setTrabajando(false)
    if (r.tipo === 'error') setError(r.mensaje)
    listo(r)
  }
  return (
    <div className="vacia">
      <div className="sin-repo">
        <b>Este proyecto no usa git</b>
        No tiene su propio repositorio, así que no hay historial ni cambios para mostrar. Si lo creás, todo lo
        que hay se guarda en un primer commit; las dependencias y los archivos con claves (como .env) quedan
        afuera.
        <div className="acc">
          <button
            type="button"
            className="btn primario chico"
            disabled={trabajando}
            onClick={() => void crear()}
          >
            {trabajando ? 'Creando…' : 'Inicializar repositorio'}
          </button>
        </div>
        {error && (
          <p className="error-git" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

const carpetaDe = (ruta: string) => ruta.split(/[\\/]/).filter(Boolean).at(-1) ?? ruta

/** El cuadro de Publicar en GitHub: con qué cuenta, el nombre y si es privado o público. */
export function PublicarGithub({
  ruta,
  cerrar,
  listo,
}: {
  ruta: string
  cerrar: () => void
  listo: (r: ResultadoGit) => void
}) {
  const [cuenta, setCuenta] = useState<CuentaGithub | null>(null)
  const [nombre, setNombre] = useState(() => nombreRepoDe(carpetaDe(ruta)))
  const [privado, setPrivado] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const campo = useRef<HTMLInputElement>(null)

  const conectar = () => {
    setCuenta(null)
    void window.iridium.cuentaGithub().then(setCuenta)
  }
  // biome-ignore lint/correctness/useExhaustiveDependencies: se conecta una vez, al abrir el cuadro.
  useEffect(() => {
    conectar()
    campo.current?.focus()
  }, [])
  useEffect(() => {
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !enviando) {
        e.preventDefault()
        cerrar()
      }
    }
    window.addEventListener('keydown', alTeclado)
    return () => window.removeEventListener('keydown', alTeclado)
  }, [cerrar, enviando])

  const valido = esNombreRepo(nombre)
  const publicar = async () => {
    setEnviando(true)
    setError(null)
    const r = await window.iridium.publicarGithub(ruta, { nombre, privado })
    setEnviando(false)
    if (r.tipo === 'error') setError(r.mensaje)
    else cerrar()
    listo(r)
  }

  return (
    <div className="velo">
      <form
        className="dialogo publicar-github"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publicar-t"
        onSubmit={(e) => {
          e.preventDefault()
          if (cuenta?.tipo === 'ok' && valido && !enviando) void publicar()
        }}
      >
        <h2 id="publicar-t">Publicar en GitHub</h2>
        {!cuenta && (
          <p aria-live="polite">
            Conectando con GitHub… Si es la primera vez, se abre una ventana para iniciar sesión.
          </p>
        )}
        {cuenta?.tipo === 'ok' && (
          <p>
            Con la cuenta <b>{cuenta.usuario}</b>. Después, la IA sube los commits con la misma sesión.
          </p>
        )}
        {cuenta?.tipo === 'error' && (
          <div className="error-git" role="alert">
            {cuenta.mensaje}{' '}
            <button type="button" className="enlace" onClick={conectar}>
              Probar de nuevo
            </button>
          </div>
        )}
        <label className="campo-publicar">
          <span>Nombre</span>
          <input
            ref={campo}
            className="campo"
            value={nombre}
            maxLength={100}
            spellCheck={false}
            aria-invalid={!valido}
            onChange={(e) => setNombre(e.target.value)}
          />
          {!valido && <small>Solo letras sin acento, números, puntos, guiones y guiones bajos.</small>}
        </label>
        <div className="opciones" role="radiogroup" aria-label="Quién lo ve">
          <label className="opcion">
            <input type="radio" name="visibilidad" checked={privado} onChange={() => setPrivado(true)} />
            <span className="t">
              Privado <small>Solo vos y a quien invites.</small>
            </span>
          </label>
          <label className="opcion">
            <input type="radio" name="visibilidad" checked={!privado} onChange={() => setPrivado(false)} />
            <span className="t">
              Público <small>Cualquiera puede verlo; solo vos lo cambiás.</small>
            </span>
          </label>
        </div>
        {error && (
          <p className="error-git" role="alert">
            {error}
          </p>
        )}
        <div className="acc">
          <button type="button" className="btn secundario" disabled={enviando} onClick={cerrar}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn primario"
            disabled={cuenta?.tipo !== 'ok' || !valido || enviando}
          >
            {enviando ? 'Publicando…' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  )
}

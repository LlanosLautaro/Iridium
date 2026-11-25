// Capacidades en el disco (Paridad, T-28): `capacidades.json` (Q-287), la última lista de Ajustes › Capacidades, para
// mostrarla al abrir la sección mientras Claude Code dice la nueva, que tarda unos segundos (es un recuerdo: si no está
// o está roto, se pide como siempre); en qué navegadores está la extensión «Claude» (D-189 › 4); y si están Windows-MCP
// y uv (D-189 › 5 y 6).
import { mkdir, readdir, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { z } from 'zod'
import {
  type CapacidadesSesion,
  ID_EXTENSION_CLAUDE,
  NAVEGADORES,
  type Navegador,
} from '../../compartido/capacidades'
import { escribirAtomico, leerDatos } from './escritura'

/** La carpeta de perfiles de cada navegador, dentro de `%LOCALAPPDATA%`. */
const PERFILES: Record<Navegador, string[]> = {
  Chrome: ['Google', 'Chrome', 'User Data'],
  Brave: ['BraveSoftware', 'Brave-Browser', 'User Data'],
  Edge: ['Microsoft', 'Edge', 'User Data'],
}

/**
 * Los navegadores con la extensión «Claude» en algún perfil (`User Data\<perfil>\Extensions\<id>`), mirando solo
 * carpetas: no abre ni lee nada de los perfiles. `local` es `%LOCALAPPDATA%`.
 */
export async function navegadoresConClaude(local: string): Promise<Navegador[]> {
  const tiene = async (n: Navegador): Promise<boolean> => {
    const carpeta = join(local, ...PERFILES[n])
    const perfiles = await readdir(carpeta, { withFileTypes: true }).catch(() => [])
    for (const p of perfiles) {
      if (!p.isDirectory()) continue
      const ext = await stat(join(carpeta, p.name, 'Extensions', ID_EXTENSION_CLAUDE)).catch(() => null)
      if (ext?.isDirectory()) return true
    }
    return false
  }
  const con = await Promise.all(NAVEGADORES.map(tiene))
  return NAVEGADORES.filter((_, i) => con[i])
}

/** Lo que hay en la PC para usarla (D-189 › 5 y 6): Windows-MCP instalado y uv, con que se instala. */
export interface PcEnLaPc {
  /** `windows-mcp.exe`; null si falta instalarlo. */
  ejecutable: string | null
  /** `uv.exe`; null si falta (Instalar lo baja antes con winget). */
  uv: string | null
}

/**
 * Busca Windows-MCP donde lo deja `uv tool install` (`%USERPROFILE%\.local\bin`) y uv en el PATH y donde lo dejan winget
 * y sus instaladores. Recién instalado con winget, uv no está en el PATH de Iridium (es de antes): por eso se mira
 * también en sus carpetas. `inicio` es `%USERPROFILE%` y `local`, `%LOCALAPPDATA%`.
 */
export async function buscarPc(inicio: string, local: string, path = ''): Promise<PcEnLaPc> {
  const esArchivo = async (r: string) => (await stat(r).catch(() => null))?.isFile() ?? false
  const primero = async (rutas: string[]) => {
    for (const r of rutas) if (await esArchivo(r)) return r
    return null
  }
  const winget = join(local, 'Microsoft', 'WinGet', 'Packages')
  const paquetes = await readdir(winget, { withFileTypes: true }).catch(() => [])
  const uv = await primero([
    ...path
      .split(';')
      .filter((d) => d.trim() !== '')
      .map((d) => join(d.trim(), 'uv.exe')),
    join(local, 'Microsoft', 'WinGet', 'Links', 'uv.exe'),
    ...paquetes
      .filter((p) => p.isDirectory() && p.name.startsWith('astral-sh.uv_'))
      .map((p) => join(winget, p.name, 'uv.exe')),
    join(inicio, '.local', 'bin', 'uv.exe'),
    join(inicio, '.cargo', 'bin', 'uv.exe'),
  ])
  return { ejecutable: await primero([join(inicio, '.local', 'bin', 'windows-mcp.exe')]), uv }
}

const Lista = z.object({
  version: z.literal(1),
  complementos: z.array(
    z.object({
      nombre: z.string(),
      autor: z.string().nullable(),
      origen: z.enum(['cuenta', 'iridium']),
      skills: z.number(),
      conectores: z.number(),
    }),
  ),
  conectores: z.array(
    z.object({
      nombre: z.string(),
      estado: z.enum(['conectado', 'falta-sesion', 'falla', 'sin-configurar', 'apagado-afuera']),
    }),
  ),
})

export function archivoCapacidades(archivo: string) {
  let escribiendo: Promise<void> = Promise.resolve()
  return {
    async leer(): Promise<CapacidadesSesion | null> {
      const d = await leerDatos(archivo, (t) => Lista.parse(JSON.parse(t)))
      return d && { complementos: d.complementos, conectores: d.conectores }
    },
    async guardar(lista: CapacidadesSesion): Promise<void> {
      const texto = `${JSON.stringify({ version: 1, ...lista }, null, 2)}\n`
      // Una escritura detrás de la otra: dos listas seguidas (abrir y Conectar) no se pisan.
      escribiendo = escribiendo
        .catch(() => {})
        .then(async () => {
          await mkdir(dirname(archivo), { recursive: true })
          await escribirAtomico(archivo, texto)
        })
      await escribiendo
    },
  }
}

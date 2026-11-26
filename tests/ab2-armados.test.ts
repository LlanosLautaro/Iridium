// AB-I2 (frente Abrir, D-156 › 3 a 8): la actualización automática. Las reglas (cuándo toca armar), el vigía con un
// disco y un Windows de mentira (de a uno, al día, falla, ocupada, el corte a los 10 minutos, Actualizar ahora) y lo
// que toca Windows de verdad: el `.exe` trabado, `armados.json` roto y un armado escondido que termina bien o mal.
import { spawn } from 'node:child_process'
import { copyFile, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { ActualizacionProyecto } from '../src/compartido/puente'
import { type DependenciasArmados, planDeArmado, VigiaArmados } from '../src/main/app/abrir'
import { armadoSupuesto, porQueNoArma, type SituacionArmado } from '../src/main/core/abrir'
import { leerScripts } from '../src/main/core/visor/scripts'
import {
  ArchivoArmados,
  abiertaAhora,
  finDeArmado,
  LOG_ARMADO,
  lanzarArmado,
  procesoVivo,
} from '../src/main/infra/armados'

const SCRIPTS = `# Scripts

## Abrir la app
**Ejecutar:** \`dist/Alfa.exe\`
**Marca:** ejecutar · escritorio

## Armar la app
**Ejecutar:** \`npm run armar\`
**Carpeta:** \`app\`
**Marca:** armar
`

const TOCA: SituacionArmado = {
  commit: 'b',
  armado: 'a',
  limpio: true,
  iaTrabajando: false,
  abierta: false,
  prendida: true,
  fallo: null,
}

describe('cuándo toca armar (D-156 › 5)', () => {
  it('con commits sin armar, limpio, sin IA, cerrada y prendida, toca', () => {
    expect(porQueNoArma(TOCA)).toBeNull()
  })
  it('cada condición en contra lo frena, con su motivo', () => {
    expect(porQueNoArma({ ...TOCA, commit: null })).toBe('sin-git')
    expect(porQueNoArma({ ...TOCA, armado: 'b' })).toBe('al-dia')
    expect(porQueNoArma({ ...TOCA, prendida: false })).toBe('apagada')
    expect(porQueNoArma({ ...TOCA, fallo: 'b' })).toBe('ya-fallo')
    expect(porQueNoArma({ ...TOCA, limpio: false })).toBe('a-medias')
    expect(porQueNoArma({ ...TOCA, iaTrabajando: true })).toBe('ia')
    expect(porQueNoArma({ ...TOCA, abierta: true })).toBe('abierta')
  })
  it('un fallo con otro commit no frena: el commit nuevo se intenta', () => {
    expect(porQueNoArma({ ...TOCA, fallo: 'a' })).toBeNull()
  })
  it('la primera vez, el .exe más nuevo que el último commit cuenta como armado (D-156 › 4)', () => {
    expect(armadoSupuesto('b', 1000, 2000)).toBe('b')
    expect(armadoSupuesto('b', 2000, 1000)).toBeNull()
    expect(armadoSupuesto('b', 2000, null)).toBeNull()
  })
  it('el plan: el .exe, el comando y su carpeta; sin el par de marcas, nada', () => {
    const plan = planDeArmado('C:/P/Alfa', leerScripts(SCRIPTS))
    expect(plan).toEqual({
      exe: join('C:/P/Alfa', 'dist', 'Alfa.exe'),
      comando: 'npm run armar',
      cwd: join('C:/P/Alfa', 'app'),
    })
    expect(planDeArmado('C:/P/Alfa', leerScripts(SCRIPTS.replace('**Marca:** armar', '')))).toBeNull()
    expect(
      planDeArmado('C:/P/Alfa', leerScripts(SCRIPTS.replace('`dist/Alfa.exe`', '`../Otro.exe`'))),
    ).toBeNull()
  })
})

/** Un mundo de mentira para el vigía: proyectos, git, la app abierta y armados que terminan cuando se dice. */
async function mundo(rutas: string[]) {
  const datos = await mkdtemp(join(tmpdir(), 'iridium-ab2-'))
  const archivo = new ArchivoArmados(join(datos, 'armados.json'))
  const git = new Map(rutas.map((r) => [r, { commit: 'c1', fecha: 1000, limpio: true }]))
  const abiertas = new Set<string>()
  const trabajando = new Set<string>()
  const apagados: string[] = []
  const fines = new Map<string, 'ok' | 'falla'>()
  const vivos = new Set<number>()
  const lanzados: { ruta: string; comando: string; cwd: string }[] = []
  const cortados: number[] = []
  let estados: Record<string, ActualizacionProyecto> = {}
  let reloj = 10_000
  let pid = 100
  const d: DependenciasArmados = {
    proyectos: async () => rutas,
    scripts: async () => leerScripts(SCRIPTS),
    git: async (r) => git.get(r) ?? null,
    iaTrabajando: async (r) => trabajando.has(r),
    apagados: async () => apagados,
    archivo,
    carpeta: (r) => join(datos, 'armados', r.replace(/\W/g, '-')),
    lanzar: async (carpeta, comando, cwd) => {
      const ruta = rutas.find((r) => carpeta.endsWith(r.replace(/\W/g, '-'))) ?? '?'
      lanzados.push({ ruta, comando, cwd })
      fines.delete(ruta)
      pid += 1
      vivos.add(pid)
      return pid
    },
    fin: async (carpeta) => {
      const ruta = rutas.find((r) => carpeta.endsWith(r.replace(/\W/g, '-'))) ?? '?'
      return fines.get(ruta) ?? null
    },
    vivo: (p) => vivos.has(p),
    cortar: async (p) => {
      cortados.push(p)
      vivos.delete(p)
    },
    abierta: async (exe) => [...abiertas].some((r) => exe.startsWith(r)),
    // Más viejo que el commit: la primera vez no cuenta como armado.
    fechaExe: async () => 500,
    ahora: () => reloj,
    excluida: null,
    alCambio: (e) => {
      estados = e
    },
    registrar: () => {},
  }
  const vigia = new VigiaArmados(d)
  /** Una vuelta y lo que haya pedido otra (cerrar un armado lanza el siguiente). */
  const mirar = async () => {
    await vigia.mirar()
    await vigia.mirar()
  }
  return {
    vigia,
    archivo,
    git,
    abiertas,
    trabajando,
    apagados,
    fines,
    vivos,
    lanzados,
    cortados,
    mirar,
    estados: () => estados,
    pasar: (ms: number) => {
      reloj += ms
    },
    d,
  }
}

describe('el vigía de los armados (AB-3, AB-4)', () => {
  it('arma el que tiene commits sin armar, de a uno; al terminar bien queda al día', async () => {
    const m = await mundo(['A', 'B'])
    await m.mirar()
    expect(m.lanzados.map((l) => l.ruta)).toEqual(['A'])
    expect(m.lanzados[0]?.cwd).toBe(join('A', 'app'))
    expect(m.estados().A?.armando).not.toBeNull()
    expect(m.vigia.armando('A')).toBe(true)
    // B espera su turno.
    await m.mirar()
    expect(m.lanzados).toHaveLength(1)
    m.fines.set('A', 'ok')
    await m.mirar()
    expect((await m.archivo.de('A')).commit).toBe('c1')
    expect(m.lanzados.map((l) => l.ruta)).toEqual(['A', 'B'])
    m.fines.set('B', 'ok')
    await m.mirar()
    expect(m.estados().A).toMatchObject({ armando: null, fallo: false, ultimo: { resultado: 'ok' } })
    // Al día: no vuelve a armar hasta el próximo commit.
    await m.mirar()
    expect(m.lanzados).toHaveLength(2)
    m.git.set('A', { commit: 'c2', fecha: 2000, limpio: true })
    await m.mirar()
    expect(m.lanzados.map((l) => l.ruta)).toEqual(['A', 'B', 'A'])
  })

  it('la primera vez, con el .exe más nuevo que el commit, no arma', async () => {
    const m = await mundo(['A'])
    m.d.fechaExe = async () => 5000
    await m.mirar()
    expect(m.lanzados).toHaveLength(0)
    expect((await m.archivo.de('A')).commit).toBe('c1')
  })

  it('no arma con la app abierta, una IA trabajando, cambios a medias o apagada', async () => {
    const m = await mundo(['A'])
    m.abiertas.add('A')
    await m.mirar()
    m.abiertas.clear()
    m.trabajando.add('A')
    await m.mirar()
    m.trabajando.clear()
    m.git.set('A', { commit: 'c1', fecha: 1000, limpio: false })
    await m.mirar()
    m.git.set('A', { commit: 'c1', fecha: 1000, limpio: true })
    m.apagados.push('A')
    await m.mirar()
    expect(m.lanzados).toHaveLength(0)
    expect(m.estados().A?.prendida).toBe(false)
    m.apagados.length = 0
    await m.mirar()
    expect(m.lanzados).toHaveLength(1)
  })

  it('si falla, la Señal lo dice y no se reintenta con ese commit; con uno nuevo, sí', async () => {
    const m = await mundo(['A'])
    await m.mirar()
    m.fines.set('A', 'falla')
    await m.mirar()
    expect(m.estados().A).toMatchObject({ fallo: true, ultimo: { resultado: 'falla' } })
    await m.mirar()
    expect(m.lanzados).toHaveLength(1)
    m.git.set('A', { commit: 'c2', fecha: 2000, limpio: true })
    await m.mirar()
    expect(m.lanzados).toHaveLength(2)
    expect(m.estados().A?.fallo).toBe(false)
  })

  it('al terminar cada armado avisa cómo quedó, para el aviso al volver (T-86)', async () => {
    const m = await mundo(['A'])
    const terminados: { ruta: string; resultado: string }[] = []
    m.d.alTerminar = (ruta, u) => terminados.push({ ruta, resultado: u.resultado })
    await m.mirar()
    expect(terminados).toEqual([])
    m.fines.set('A', 'falla')
    await m.mirar()
    m.git.set('A', { commit: 'c2', fecha: 2000, limpio: true })
    await m.mirar()
    m.fines.set('A', 'ok')
    await m.mirar()
    expect(terminados).toEqual([
      { ruta: 'A', resultado: 'falla' },
      { ruta: 'A', resultado: 'ok' },
    ])
  })

  it('si falla porque la abriste por fuera, cuenta como ocupada y se reintenta al cerrarla (D-156 › 8)', async () => {
    const m = await mundo(['A'])
    await m.mirar()
    m.abiertas.add('A')
    m.fines.set('A', 'falla')
    await m.mirar()
    expect(m.estados().A).toMatchObject({ fallo: false, ultimo: { resultado: 'ocupada' } })
    m.abiertas.clear()
    await m.mirar()
    expect(m.lanzados).toHaveLength(2)
  })

  it('a los 10 minutos lo corta y es una falla; si el proceso desaparece sin marca, también', async () => {
    const m = await mundo(['A', 'B'])
    await m.mirar()
    m.pasar(11 * 60_000)
    await m.mirar()
    expect(m.cortados).toHaveLength(1)
    expect((await m.archivo.de('A')).ultimo).toMatchObject({ resultado: 'falla', motivo: /10 minutos/ })
    // B arrancó: se cierra la consola de B sin marca de fin.
    m.vivos.clear()
    await m.mirar()
    expect((await m.archivo.de('B')).ultimo).toMatchObject({ resultado: 'falla', motivo: /se cortó/ })
  })

  it('Actualizar ahora arma aunque esté apagada o al día, y Ejecutar espera el fin (AB-2)', async () => {
    const m = await mundo(['A'])
    m.apagados.push('A')
    await m.mirar()
    expect(m.lanzados).toHaveLength(0)
    const fin = m.vigia.armarYa('A')
    await m.vigia.mirar()
    expect(m.lanzados).toHaveLength(1)
    const espera = m.vigia.esperar('A')
    m.fines.set('A', 'ok')
    await m.mirar()
    await expect(fin).resolves.toBe('ok')
    await expect(espera).resolves.toBe('ok')
  })

  it('la carpeta del código de Iridium queda afuera (D-122)', async () => {
    const m = await mundo(['A'])
    m.d.excluida = 'A'
    await m.mirar()
    expect(m.lanzados).toHaveLength(0)
    expect(m.estados()).toEqual({})
  })

  it('armados.json roto: vacío, y el roto queda aparte', async () => {
    const datos = await mkdtemp(join(tmpdir(), 'iridium-ab2-'))
    await writeFile(join(datos, 'armados.json'), '{ esto no es json')
    const a = new ArchivoArmados(join(datos, 'armados.json'))
    expect(await a.de('A')).toEqual({ commit: null, ultimo: null, enCurso: null })
    await a.cambiar('A', { commit: 'x' })
    expect(await new ArchivoArmados(join(datos, 'armados.json')).de('A')).toMatchObject({ commit: 'x' })
  })
})

describe('Windows de verdad (D-156 › 3 y 6)', () => {
  it('un .exe que corre está trabado: la app está abierta; al cerrarse, no', async () => {
    const carpeta = await mkdtemp(join(tmpdir(), 'iridium-ab2-exe-'))
    const exe = join(carpeta, 'Alfa.exe')
    await copyFile(join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'PING.EXE'), exe)
    expect(await abiertaAhora(exe)).toBe(false)
    const p = spawn(exe, ['-n', '30', '127.0.0.1'], { stdio: 'ignore', windowsHide: true })
    await new Promise((r) => p.once('spawn', r))
    expect(await abiertaAhora(exe)).toBe(true)
    p.kill()
    await new Promise((r) => p.once('exit', r))
    expect(await abiertaAhora(exe)).toBe(false)
    expect(await abiertaAhora(join(carpeta, 'no-esta.exe'))).toBe(false)
  })

  it('el armado escondido deja su log y su marca de fin: ok o falla', async () => {
    const carpeta = await mkdtemp(join(tmpdir(), 'iridium-ab2-armado-'))
    const esperarFin = async () => {
      for (let i = 0; i < 100; i++) {
        const f = await finDeArmado(carpeta)
        if (f) return f
        await new Promise((r) => setTimeout(r, 100))
      }
      return null
    }
    const pid = await lanzarArmado(carpeta, 'echo armando Alfa', carpeta)
    expect(pid).toBeGreaterThan(0)
    expect(await esperarFin()).toBe('ok')
    expect(await readFile(join(carpeta, LOG_ARMADO), 'utf8')).toContain('armando Alfa')
    await lanzarArmado(carpeta, 'echo primero && echo segundo', carpeta)
    expect(await esperarFin()).toBe('ok')
    const encadenado = await readFile(join(carpeta, LOG_ARMADO), 'utf8')
    expect(encadenado).toMatch(/^primero/m)
    expect(encadenado).toMatch(/^segundo/m)
    await lanzarArmado(carpeta, 'cmd /c exit 3', carpeta)
    expect(await esperarFin()).toBe('falla')
    await lanzarArmado(carpeta, 'cmd /c exit 4 && echo no llega', carpeta)
    expect(await esperarFin()).toBe('falla')
    expect(await readFile(join(carpeta, LOG_ARMADO), 'utf8')).not.toMatch(/^no llega/m)
    expect(procesoVivo(999_999_999)).toBe(false)
  }, 30_000)
})

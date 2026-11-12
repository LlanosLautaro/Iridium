// DI-I1: el formato `docs/diseno/` (frente Diseño, D-105): el índice, los tokens, las referencias de las maquetas,
// el control y el pedido para empezar.
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { correrControl } from '../src/main/core/control'
import type { ArchivosControl, ArchivosDiseno } from '../src/main/core/control/tipos'
import { leerIndice } from '../src/main/core/diseno/indice'
import {
  coloresEscritos,
  descripcionDe,
  esDeLaRed,
  referenciasDe,
  resolverReferencia,
  tituloDe,
} from '../src/main/core/diseno/maquetas'
import { pedidoEmpezar, tieneCodigo } from '../src/main/core/diseno/pedidos'
import { leerFichas } from '../src/main/core/diseno/piezas'
import { leerEstilo, leerTokens, resolver } from '../src/main/core/diseno/tokens'
import { leerArchivosDiseno } from '../src/main/infra/diseno/archivos'

const MUESTRA = join(__dirname, 'muestras', 'diseno')

const INDICE = `# Diseño

Notas libres.

## Pantallas
| Pantalla | Sección | Archivo | En la app |
|---|---|---|---|
| Grilla | Proyectos | pantallas/grilla.html | 2026-11-12 18:40 |
| Bandeja de entrada | Un proyecto | \`pantallas/bandeja_nueva.html\` | — |

## Notas
Otra cosa.
`

describe('el índice', () => {
  it('lee la tabla de Pantallas, con el grupo, el archivo y la fecha', () => {
    const i = leerIndice(INDICE)
    expect(i.tieneTabla).toBe(true)
    expect(i.faltan).toEqual([])
    expect(i.pantallas).toMatchObject([
      {
        nombre: 'Grilla',
        seccion: 'Proyectos',
        archivo: 'pantallas/grilla.html',
        enLaApp: '2026-11-12 18:40',
        linea: 8,
      },
      {
        nombre: 'Bandeja de entrada',
        seccion: 'Un proyecto',
        archivo: 'pantallas/bandeja_nueva.html',
        enLaApp: null,
      },
    ])
  })
  it('sin la sección o sin columnas, lo dice', () => {
    expect(leerIndice('# Diseño\n').tieneTabla).toBe(false)
    expect(
      leerIndice('## Pantallas\n| Pantalla | Archivo |\n|---|---|\n| A | pantallas/a.html |\n').faltan,
    ).toEqual(['Sección', 'En la app'])
  })
})

describe('los tokens', () => {
  it('lee las variables de :root y las agrupa', () => {
    const t = leerTokens(
      '/* x */\n:root {\n  --fondo: #000;\n  --ui: system-ui, sans-serif;\n  --tam-2: 16px;\n  --esp-4: 16px;\n  --radio-1: 6px;\n  --sombra-1: 0 4px 12px rgba(0,0,0,.5);\n  --ancho: 1440px;\n  --sale: cubic-bezier(.16, 1, .3, 1);\n}\n',
    )
    expect(t.errores).toEqual([])
    expect(t.tokens.map((x) => [x.nombre, x.grupo, x.linea])).toEqual([
      ['--fondo', 'colores', 3],
      ['--ui', 'letra', 4],
      ['--tam-2', 'tamanos', 5],
      ['--esp-4', 'espacios', 6],
      ['--radio-1', 'espacios', 7],
      ['--sombra-1', 'sombras', 8],
      ['--ancho', 'otras', 9],
      ['--sale', 'otras', 10],
    ])
  })
  it('una línea que no se entiende va a errores con su número; las demás se leen', () => {
    const t = leerTokens(':root {\n  --a: #fff;\n  esto no es nada;\n  --b: 2px;\n}')
    expect(t.tokens.map((x) => x.nombre)).toEqual(['--a', '--b'])
    expect(t.errores).toEqual([{ linea: 3, texto: 'esto no es nada' }])
  })
  it('el uso de cada token es el comentario que lo sigue en la misma línea (D-114)', () => {
    const t = leerTokens(
      '/* Superficies */\n:root {\n  --fondo: #000; /* el fondo\n de la app */\n  /* Texto */\n  --texto: #fff;\n  --a: 1px; --b: 2px; /* solo la b */\n  --c: 3px;/*pegado*/\n}',
    )
    expect(t.tokens.map((x) => [x.nombre, x.uso])).toEqual([
      ['--fondo', 'el fondo de la app'],
      ['--texto', null],
      ['--a', null],
      ['--b', 'solo la b'],
      ['--c', 'pegado'],
    ])
    expect(t.tokens.map((x) => x.linea)).toEqual([3, 6, 7, 7, 8])
  })
  it('un estilo de texto es un `--estilo-*` con el atajo font, resuelto con los otros tokens (T-61)', () => {
    const t = leerTokens(
      ':root {\n  --ui: system-ui, sans-serif; /* la letra */\n  --tam-t: 17px; /* títulos */\n  --estilo-titulo: 600 var(--tam-t)/1.3 var(--ui); /* el título */\n  --estilo-mal: grande; /* no */\n  --estilo-falta: 600 var(--tam-x)/1 var(--ui); /* no está */\n}',
    )
    expect(t.tokens.filter((x) => x.grupo === 'estilos').map((x) => [x.nombre, x.muestra])).toEqual([
      ['--estilo-titulo', '600 17px/1.3 system-ui, sans-serif'],
      ['--estilo-mal', null],
      ['--estilo-falta', null],
    ])
    expect(t.tokens.find((x) => x.nombre === '--ui')?.muestra).toBeUndefined()
  })
  it('lee el atajo font: peso, tamaño, interlineado y letra', () => {
    expect(leerEstilo('600 17px/1.3 system-ui, sans-serif')).toEqual({
      peso: '600',
      tamano: '17px',
      interlineado: '1.3',
      letra: 'system-ui, sans-serif',
    })
    expect(leerEstilo('12.5px "Cascadia Mono", monospace')).toEqual({
      peso: '400',
      tamano: '12.5px',
      interlineado: null,
      letra: '"Cascadia Mono", monospace',
    })
    expect(leerEstilo('italic bold 1rem / 20px serif')?.tamano).toBe('1rem')
    expect(leerEstilo('600 grande serif')).toBeNull()
    expect(leerEstilo('16px')).toBeNull()
    expect(
      resolver(
        'var(--a, 3px) var(--b)',
        new Map([
          ['--b', 'var(--c)'],
          ['--c', 'x'],
        ]),
      ),
    ).toBe('3px x')
  })
  it('lee los tokens reales de Iridium y el negro', async () => {
    for (const f of ['docs/ui/tokens.css', 'docs/modulos/diseno/negro.css', 'docs/diseno/tokens.css']) {
      const t = leerTokens(await readFile(join(__dirname, '..', f), 'utf8'))
      expect(t.tieneRaiz).toBe(true)
      expect(t.tokens.some((x) => x.grupo === 'colores')).toBe(true)
    }
    const propios = leerTokens(await readFile(join(__dirname, '..', 'docs/diseno/tokens.css'), 'utf8'))
    expect(propios.tokens.filter((x) => !x.uso).map((x) => x.nombre)).toEqual([])
    const estilos = propios.tokens.filter((x) => x.grupo === 'estilos')
    expect(estilos.length).toBeGreaterThan(5)
    expect(estilos.filter((x) => !x.muestra).map((x) => x.nombre)).toEqual([])
  })
})

describe('las maquetas', () => {
  it('saca las referencias con su línea, y sabe cuáles son de la red o salen de la carpeta', () => {
    const html =
      '<link rel="stylesheet" href="../tokens.css">\n<img src="https://x.invalid/a.png">\n<div style="background:url(\'../fondo.png\')"></div>\n<a href="#arriba">'
    expect(referenciasDe(html, 'html').map((r) => [r.valor, r.linea])).toEqual([
      ['../tokens.css', 1],
      ['https://x.invalid/a.png', 2],
      ['#arriba', 4],
      ['../fondo.png', 3],
    ])
    expect(esDeLaRed('//cdn.invalid/x.css')).toBe(true)
    expect(esDeLaRed('../x.css')).toBe(false)
    expect(resolverReferencia('pantallas/a.html', '../tokens.css?v=2')).toBe('tokens.css')
    expect(resolverReferencia('pantallas/a.html', 'b.html#x')).toBe('pantallas/b.html')
    expect(resolverReferencia('pantallas/a.html', '../../estado.md')).toBeNull()
    expect(resolverReferencia('pantallas/a.html', 'file:///C:/x.css')).toBeNull()
  })
  it('encuentra los colores escritos en los valores, no en los selectores', () => {
    const css = '#cafe { color: var(--texto); }\n.b { background: #fff; }\n.c{border:1px solid rgb(1,2,3)}'
    expect(coloresEscritos(css).map((c) => [c.valor, c.linea])).toEqual([
      ['#fff', 2],
      ['rgb()', 3],
    ])
  })
  it('lee el título y la frase de una versión', () => {
    expect(tituloDe('<title> Bandeja </title>')).toBe('Bandeja')
    expect(descripcionDe('<meta name="descripcion" content="la bandeja como una sola lista">')).toBe(
      'la bandeja como una sola lista',
    )
  })
})

describe('las fichas de las piezas (T-62)', () => {
  it('lee el título, el grupo, para qué, los estados y los tokens de sus reglas', () => {
    const css = [
      'body { color: var(--texto); }',
      '/* ───── PZ-1 · Botón ─────',
      '   Grupo: Acciones',
      '   Para qué: lo que se hace;',
      '   uno principal como mucho.',
      '   Estados: principal, sin fondo · chico. */',
      '.boton { color: var(--texto); background: var(--fondo); /* adentro no corta */ }',
      '.boton:hover { color: var(--texto); padding-left: calc(var(--esp) + var(--nivel, 0) * 4px); }',
      '/* Un comentario suelto corta las reglas */',
      '.otra { color: var(--borde); }',
      '/* Árbol',
      '   Para qué: carpetas y archivos. */',
      '.nodo { color: var(--texto-2); }',
    ].join('\n')
    expect(leerFichas(css)).toEqual([
      {
        codigo: 'PZ-1',
        nombre: 'Botón',
        grupo: 'Acciones',
        paraQue: 'lo que se hace; uno principal como mucho.',
        estados: ['principal', 'sin fondo', 'chico'],
        tokens: ['--texto', '--fondo', '--esp'],
        linea: 2,
      },
      {
        codigo: null,
        nombre: 'Árbol',
        grupo: null,
        paraQue: 'carpetas y archivos.',
        estados: [],
        tokens: ['--texto-2'],
        linea: 11,
      },
    ])
  })
  it('las piezas de Iridium tienen su ficha, con grupo y para qué', async () => {
    const f = leerFichas(await readFile(join(__dirname, '..', 'docs/diseno/piezas.css'), 'utf8'))
    expect(f.filter((x) => x.codigo).map((x) => x.codigo)).toEqual(
      Array.from({ length: 12 }, (_, i) => `PZ-${i + 1}`),
    )
    expect(f.filter((x) => !x.grupo || !x.paraQue || x.tokens.length === 0)).toEqual([])
  })
})

const control = (diseno: ArchivosDiseno | null): string[] => {
  const a: ArchivosControl = {
    estados: [],
    trabajo: null,
    respuestas: new Map(),
    documentos: [],
    frentes: [],
    diseno,
  }
  return correrControl(a)
    .filter((x) => x.regla === 'diseno')
    .map((x) => `${x.archivo}${x.linea ? `:${x.linea}` : ''} ${x.texto}`)
}

const diseno = (textos: Record<string, string>, otros: string[] = []): ArchivosDiseno => ({
  textos: Object.entries(textos).map(([ruta, texto]) => ({ ruta, texto })),
  existentes: new Set([...Object.keys(textos), ...otros]),
})

const MAQUETA =
  '<!doctype html><title>A</title><link rel="stylesheet" href="../tokens.css"><link rel="stylesheet" href="../piezas.css">'
const BIEN: Record<string, string> = {
  'README.md':
    '## Pantallas\n| Pantalla | Sección | Archivo | En la app |\n|---|---|---|---|\n| A | Uno | pantallas/a.html | — |\n',
  'tokens.css': ':root {\n  --fondo: #000; /* el fondo */\n  --texto: #fff; /* el texto */\n}',
  'piezas.css':
    '/* Fondo\n   Grupo: Contenido\n   Para qué: el fondo. */\nbody { background: var(--fondo); }',
  'pantallas/a.html': MAQUETA,
}

describe('el control de docs/diseno/', () => {
  it('sin docs/diseno/ no dice nada, y un diseño bien escrito tampoco', () => {
    expect(control(null)).toEqual([])
    expect(control(diseno(BIEN))).toEqual([])
  })
  it('1 y 4: falta el índice o los tokens no son variables', () => {
    const { 'README.md': _r, ...resto } = BIEN
    expect(control(diseno({ ...resto, 'tokens.css': 'body{}' }))).toEqual([
      'docs/diseno/README.md falta el índice: `## Pantallas` con la tabla Pantalla | Sección | Archivo | En la app',
      'docs/diseno/tokens.css los tokens van como variables (`--nombre: valor;`) en un bloque `:root`',
    ])
  })
  it('4: los tokens sin su uso, en un solo aviso con la línea del primero', () => {
    const tokens = ':root {\n  --fondo: #000; /* el fondo */\n  --texto: #fff;\n  --borde: #222;\n}'
    expect(control(diseno({ ...BIEN, 'tokens.css': tokens }))).toEqual([
      'docs/diseno/tokens.css:3 2 tokens sin su uso (--texto, --borde): uno por línea, con `/* para qué se usa */` después del `;`',
    ])
  })
  it('4: un estilo de texto que no se entiende o nombra un token que no está (T-61)', () => {
    const tokens =
      ':root {\n  --fondo: #000; /* el fondo */\n  --estilo-a: 600 var(--tam)/1 var(--ui); /* falta */\n  --estilo-b: 500 13px/1.4 system-ui; /* bien */\n}'
    expect(control(diseno({ ...BIEN, 'tokens.css': tokens }))).toEqual([
      'docs/diseno/tokens.css:3 `--estilo-a` no se entiende como estilo de texto: va como `peso tamaño/interlineado letra` (`600 var(--tam-titulo)/1.3 var(--ui)`), con tokens que existan',
    ])
  })
  it('8: piezas sin ficha, una ficha sin grupo y un token que no está (T-62)', () => {
    expect(control(diseno({ ...BIEN, 'piezas.css': 'body { background: var(--fondo); }' }))).toEqual([
      'docs/diseno/piezas.css las piezas no tienen su ficha: el comentario que encabeza cada una suma `Grupo:`, `Para qué:` y `Estados:` (una por línea)',
    ])
    const piezas =
      '/* Fondo\n   Para qué: el fondo. */\nbody { background: var(--fondo); color: var(--tinta); --nivel: 1; padding: var(--nivel); margin: var(--otro, 0); }'
    expect(control(diseno({ ...BIEN, 'piezas.css': piezas }))).toEqual([
      'docs/diseno/piezas.css:1 la ficha de «Fondo» no tiene `Grupo:` (acciones, navegación, avisos…)',
      'docs/diseno/piezas.css:3 `var(--tinta)` no está en `tokens.css`: sumalo con su uso o usá uno que exista',
    ])
  })
  it('2 y 3: un archivo que no está, uno fuera de pantallas/, uno sin listar y una fecha mal escrita', () => {
    const readme =
      '## Pantallas\n| Pantalla | Sección | Archivo | En la app |\n|---|---|---|---|\n| A | Uno | pantallas/a.html | ayer |\n| B | Uno | pantallas/b.html | — |\n| C | Uno | c.html | — |\n'
    expect(
      control(diseno({ ...BIEN, 'README.md': readme, 'pantallas/d.html': MAQUETA }, ['c.html'])),
    ).toEqual([
      'docs/diseno/README.md:4 «En la app» es `—` o `AAAA-MM-DD HH:MM`, no «ayer»',
      'docs/diseno/README.md:5 «pantallas/b.html» no existe',
      'docs/diseno/README.md:6 «c.html» va dentro de `pantallas/` (relativo a `docs/diseno/`)',
      'docs/diseno/README.md `pantallas/d.html` no está en la tabla de Pantallas',
    ])
  })
  it('5 y 6: la red, fuera de la carpeta, lo que falta y los colores escritos', () => {
    const mala = `${MAQUETA}\n<img src="https://x.invalid/a.png">\n<link href="../../estado.md">\n<img src="../logo.png">\n<style>\n.x { color: #f00; }\n</style>`
    expect(
      control(
        diseno({
          ...BIEN,
          'pantallas/a.html': mala,
          'piezas.css': '/* B\n   Grupo: Uno\n   Para qué: algo. */ .b { color: hsl(0 0% 50%); }',
        }),
      ),
    ).toEqual([
      'docs/diseno/piezas.css:3 color escrito (hsl()): usá un token, `var(--…)`, para que cambiar `tokens.css` cambie todas',
      'docs/diseno/pantallas/a.html:2 «https://x.invalid/a.png» es de la red: las maquetas son todo local (letras del sistema o archivos de `docs/diseno/`)',
      'docs/diseno/pantallas/a.html:3 «../../estado.md» sale de `docs/diseno/`: usá una ruta relativa dentro de la carpeta',
      'docs/diseno/pantallas/a.html:4 «../logo.png» no existe',
      'docs/diseno/pantallas/a.html:6 color escrito (#f00): usá un token, `var(--…)`, para que cambiar `tokens.css` cambie todas',
    ])
  })
  it('7: una dirección con otras variables y versiones de una maqueta que no existe', () => {
    const version = MAQUETA.replaceAll('../', '../../')
    expect(
      control(
        diseno({
          ...BIEN,
          'direcciones/azul.css': ':root { --fondo: #001; --acento: #00f; }',
          'versiones/z/a.html': version,
        }),
      ),
    ).toEqual([
      'docs/diseno/direcciones/azul.css una dirección tiene las mismas variables que `tokens.css`; le faltan --texto; sobran --acento',
      'docs/diseno/versiones/z/ son versiones de `pantallas/z.html`, que no existe',
    ])
  })
  it('la muestra de pruebas: la rota y la que pide algo a internet', async () => {
    const d = await leerArchivosDiseno(MUESTRA)
    expect(d?.existentes.has('pantallas/lista.html')).toBe(true)
    expect(control(d)).toEqual([
      'docs/diseno/pantallas/ajustes.html:3 «../piezas-que-falta.css» no existe',
      'docs/diseno/pantallas/nota.html:7 «https://ejemplo.invalid/imagen.png» es de la red: las maquetas son todo local (letras del sistema o archivos de `docs/diseno/`)',
    ])
    expect(await leerArchivosDiseno(join(MUESTRA, 'docs'))).toBeNull()
  })
})

describe('el pedido para empezar', () => {
  it('cita el framework y dice de dónde salen las pantallas', () => {
    expect(pedidoEmpezar(true)).toContain('`referencias/06-ui.md` › Maquetas')
    expect(pedidoEmpezar(true)).toContain('como están hoy')
    expect(pedidoEmpezar(false)).toContain('`docs/04-ux.md`')
  })
  it('la ficha, el CLAUDE.md, Git y docs/ no son código', () => {
    expect(tieneCodigo(['.proyecto.json', '.proyecto-icono.svg', 'CLAUDE.md', '.git', 'docs'])).toBe(false)
    expect(tieneCodigo(['docs', 'package.json'])).toBe(true)
  })
})

describe('el framework', () => {
  it('la plantilla del índice tiene la tabla que lee Iridium', async () => {
    const plantilla = await readFile(
      join(__dirname, '..', 'recursos/plugins/iridium/skills/iridium/plantillas/diseno/README.md'),
      'utf8',
    )
    const i = leerIndice(plantilla)
    expect(i.tieneTabla).toBe(true)
    expect(i.faltan).toEqual([])
    expect(i.pantallas[0]?.enLaApp).toBeNull()
  })
  it('SKILL.md describe el formato y 06-ui.md cómo se arman las maquetas', async () => {
    const base = join(__dirname, '..', 'recursos/plugins/iridium/skills/iridium')
    expect(await readFile(join(base, 'SKILL.md'), 'utf8')).toContain('### Las maquetas: `docs/diseno/`')
    expect(await readFile(join(base, 'referencias/06-ui.md'), 'utf8')).toContain('## Maquetas')
  })
})

describe('la vigilancia de docs/diseno/', () => {
  it('reconoce un archivo de docs/diseno/ con barras de Windows o de las otras', async () => {
    const { disenoAfectado } = await import('../src/main/core/vigilancia')
    expect(disenoAfectado('Alfa\\docs\\diseno\\pantallas\\lista.html')).toEqual({
      proyecto: 'Alfa',
      archivo: 'pantallas/lista.html',
    })
    expect(disenoAfectado('Alfa/docs/diseno/tokens.css')).toEqual({ proyecto: 'Alfa', archivo: 'tokens.css' })
    expect(disenoAfectado('Alfa\\docs\\estado.md')).toBeNull()
    expect(disenoAfectado('.iridium\\docs\\diseno\\x.html')).toBeNull()
  })
})

// Lo que cita una `Q-n` (D-022): códigos que nacen en el proyecto y citas `archivo.md` › Sección, sin repetir.
import { describe, expect, it } from 'vitest'
import { citasDe } from '../src/main/core/citas'
import { construirIndice } from '../src/main/core/visor/codigos'

const DOCS = [
  {
    ruta: 'docs/decisiones.md',
    texto: '# Decisiones\n\n## D-032 — Miniaturas en la galería\nSe generan al importar.\n',
  },
  {
    ruta: 'docs/04-ux.md',
    texto: '# UX\n\n## Pantallas\n\n### W-14 — Galería\nGrilla de cuatro columnas.\n',
  },
  {
    ruta: 'docs/07-construccion.md',
    texto: [
      '# Construcción',
      '',
      '## Log',
      '',
      '### I-2 — Conversar con la IA (2026-10-24)',
      'Qué se hizo.',
      '',
      '**Prueba del usuario**',
      '',
      '#### Prueba del usuario',
      '- [ ] Seguí',
      '',
      '### I-3 — Pendientes',
      '',
      '#### Prueba del usuario',
      '- [ ] Responder',
    ].join('\n'),
  },
  { ruta: 'docs/scripts.md', texto: '# Scripts\n\n## Abrir Iridium\nEjecutar: x\n' },
  {
    ruta: 'docs/estado.md',
    texto: '## Preguntas abiertas\n- **Q-7 — ¿3D o plana?**\n  Contexto: D-032.\n- **Q-8 — ¿Otra?**\n',
  },
]
const indice = construirIndice(DOCS)
const env = {
  indice,
  existe: (r: string) => DOCS.some((d) => d.ruta === r),
  desde: 'docs/estado.md',
  propio: 'Q-7',
}

describe('citasDe', () => {
  it('encuentra los códigos y las secciones citadas, en orden y sin repetir', () => {
    const citas = citasDe('D-032 (miniaturas), `04-ux.md` › W-14 y otra vez D-32.', env)
    expect(citas).toEqual([
      { tipo: 'seccion', etiqueta: 'D-032', ruta: 'docs/decisiones.md', ancla: 'd-32' },
      { tipo: 'seccion', etiqueta: '04-ux.md › W-14', ruta: 'docs/04-ux.md', ancla: 'w-14' },
    ])
  })

  it('sigue las citas anidadas hasta el subtítulo de esa sección, no el de otra', () => {
    const citas = citasDe(
      'seguí `07-construccion.md` › I-2 — Conversar con la IA (2026-10-24) › Prueba del usuario. Gasta uso.',
      env,
    )
    expect(citas).toHaveLength(1)
    const c = citas[0]
    expect(c).toMatchObject({
      tipo: 'seccion',
      etiqueta: '07-construccion.md › I-2 — Conversar con la IA (2026-10-24) › Prueba del usuario',
      ruta: 'docs/07-construccion.md',
    })
    // El «Prueba del usuario» de I-2, no el de I-3: el ancla repetida lleva número.
    expect(c?.tipo === 'seccion' && c.ancla).toBe('prueba-del-usuario')
  })

  it('una cita a un documento sin sección, y otra que no se encuentra', () => {
    expect(citasDe('Ver `scripts.md` y `05-arquitectura.md` › Caché de miniaturas.', env)).toEqual([
      { tipo: 'documento', etiqueta: 'scripts.md', ruta: 'docs/scripts.md' },
      { tipo: 'falta', etiqueta: '05-arquitectura.md › Caché de miniaturas' },
    ])
    expect(citasDe('`scripts.md` › Instalar la última versión.', env)).toEqual([
      { tipo: 'falta', etiqueta: 'scripts.md › Instalar la última versión' },
    ])
  })

  it('no se cita a sí misma; los códigos que no nacen en el proyecto no cuentan; otra pregunta sí', () => {
    expect(citasDe('Como Q-7, B-11 y Q-8.', env)).toEqual([
      { tipo: 'seccion', etiqueta: 'Q-8', ruta: 'docs/estado.md', ancla: 'q-8' },
    ])
  })

  it('el código de la sección citada no se repite como código suelto', () => {
    expect(citasDe('`04-ux.md` › W-14 (Galería).', env)).toHaveLength(1)
  })
})

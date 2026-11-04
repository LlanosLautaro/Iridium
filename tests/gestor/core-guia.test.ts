// Copiado de la app anterior de proyectos (D-026).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { leerGuia } from '../../src/main/core/guia'

const muestra = (nombre: string) => readFileSync(join(__dirname, '..', 'muestras', nombre), 'utf8')

describe('leerGuia con archivos de muestra', () => {
  it('Gamma', () => {
    const g = leerGuia(muestra('estado-gamma.md'))
    expect(g).toMatchObject({
      hito: 7,
      nombreHito: 'Construcción',
      estadoHito: 'en curso',
      actualizado: '2026-10-02',
    })
    expect(g?.proximoPaso).toMatch(/^Que el usuario vea los ajustes/)
  })

  it('Iota', () => {
    const g = leerGuia(muestra('estado-iota.md'))
    expect(g).toMatchObject({ hito: 7, nombreHito: 'Construcción', estadoHito: 'en curso' })
    expect(g?.proximoPaso).toBeTruthy()
    expect(g?.proximoPaso).not.toContain('`')
  })
})

describe('leerGuia tolera variaciones', () => {
  it('guion medio o normal, CRLF y encabezados sin tilde', () => {
    const g = leerGuia(
      '## Hito actual\r\n4 - UX - en revisión\r\n\r\n## Proximo paso\r\n- Mostrar los **bocetos**.\r\n',
    )
    expect(g).toEqual({
      hito: 4,
      nombreHito: 'UX',
      estadoHito: 'en revisión',
      proximoPaso: 'Mostrar los bocetos.',
      actualizado: null,
    })
  })

  it('un hito sin número se muestra como texto', () => {
    expect(leerGuia('## Hito actual\nAuditoría inicial\n')?.nombreHito).toBe('Auditoría inicial')
  })

  it('un archivo sin nada reconocible devuelve null', () => {
    expect(leerGuia('# Notas\nalgo suelto')).toBeNull()
  })
})

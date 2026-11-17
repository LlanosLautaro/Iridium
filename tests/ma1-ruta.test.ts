// MA-I1: la ruta de un frente (D-145) y su regla del control.
import { describe, expect, it } from 'vitest'
import { type ArchivosControl, correrControl } from '../src/main/core/control'
import { leerRuta, textoSinCodigos, trabajoDeRuta } from '../src/main/core/ruta'

const FRENTE = `# Estado del módulo: Alfa

## En qué estamos ahora
Algo.

## Ruta
- [x] Pensar para qué sirve (D-1)
- [X] Definir qué muestra
- [ ] Dibujar cómo se usa (Q-3)
- [ ] Enseñarle a la IA a escribir la ruta (MA-I1)
  - [ ] Avisar de un frente sin ruta
    - [x] Una rama de una rama
- [-] Un gráfico con Mermaid
<!-- un comentario
     de dos líneas -->

- [ ] Sonar cuando termina una tarea (T-52, T-53)

## Próximo paso
Seguir.
`

describe('leerRuta', () => {
  const r = leerRuta(FRENTE)

  it('lee cada marca y deja las ramas debajo de su paso', () => {
    expect(r?.problemas).toEqual([])
    expect(r?.pasos.map((p) => [p.texto, p.marca])).toEqual([
      ['Pensar para qué sirve', 'hecho'],
      ['Definir qué muestra', 'hecho'],
      ['Dibujar cómo se usa', 'viene'],
      ['Enseñarle a la IA a escribir la ruta', 'viene'],
      ['Un gráfico con Mermaid', 'descartado'],
      ['Sonar cuando termina una tarea', 'viene'],
    ])
    expect(r?.pasos[3]?.ramas.map((p) => p.texto)).toEqual([
      'Avisar de un frente sin ruta',
      'Una rama de una rama',
    ])
  })

  it('separa los códigos de la línea', () => {
    expect(r?.pasos[2]?.preguntas).toEqual(['Q-3'])
    expect(r?.pasos[3]?.iteracion).toBe('MA-I1')
    expect(r?.pasos[5]?.trabajo).toEqual(['T-52', 'T-53'])
    expect(r?.pasos[2]?.linea).toBe(9)
    expect([...trabajoDeRuta(r)]).toEqual(['T-52', 'T-53'])
  })

  it('sin la sección, null; vacía, sin pasos', () => {
    expect(leerRuta('# Estado\n\n## Progreso\n')).toBeNull()
    expect(leerRuta('## Ruta\n\n## Próximo paso\nAlgo')).toEqual({ pasos: [], problemas: [] })
  })

  it('lo que no entiende va como «otro», con su problema', () => {
    const mal = leerRuta('## Ruta\n  - [ ] Rama sin paso\n- [?] Marca rara\nUna línea suelta\n')
    expect(mal?.pasos.map((p) => [p.texto, p.marca])).toEqual([
      ['Rama sin paso', 'viene'],
      ['Marca rara', 'otro'],
      ['Una línea suelta', 'otro'],
    ])
    expect(mal?.problemas.map((p) => p.linea)).toEqual([2, 3, 4])
  })
})

describe('textoSinCodigos', () => {
  it('saca los códigos y el paréntesis que queda vacío', () => {
    expect(textoSinCodigos('Publicar una versión (Q-185)')).toBe('Publicar una versión')
    expect(textoSinCodigos('Medir Orden (OR-I4 y Q-146)')).toBe('Medir Orden')
    expect(textoSinCodigos('Definir (D-141; antes del hito 10)')).toBe('Definir (antes del hito 10)')
    expect(textoSinCodigos('Copiar `T-5` de **Beta**')).toBe('Copiar de Beta')
    // Un punto que empieza una palabra no es puntuación: «el .zip» queda como está.
    expect(textoSinCodigos('Achicar el .zip de cada versión (T-9)')).toBe('Achicar el .zip de cada versión')
  })
})

const GENERAL = `# Estado del proyecto

**Última actualización:** 2026-11-17

## Hito actual
10 — Operación — en curso

## Módulos
| Frente | Tipo | Paso | Estado |
|---|---|---|---|
| Alfa (\`modulos/alfa/estado.md\`) | sección | 7. Construcción | en curso |
| Beta (\`modulos/beta/estado.md\`) | sección | en operación | hecho |

## Preguntas abiertas
- **Q-3 — ¿Lista o grilla?**
  Tipo: decisión · frena
  Opciones: A) Lista (recomendada: entra más) · B) Grilla

## Próximo paso
Seguir.
`

function archivos(alfa: string, beta = '# Estado del módulo: Beta\n'): ArchivosControl {
  return {
    estados: [
      { ruta: 'docs/estado.md', texto: GENERAL },
      { ruta: 'docs/modulos/alfa/estado.md', texto: alfa },
      { ruta: 'docs/modulos/beta/estado.md', texto: beta },
    ],
    trabajo: '# Trabajo\n\n## T-52 — Sonar\nEstado: pendiente · Fecha: 2026-11-07\n',
    respuestas: new Map(),
    documentos: [],
    frentes: [
      { carpeta: 'alfa', nombre: 'Alfa' },
      { carpeta: 'beta', nombre: 'Beta' },
    ],
  }
}

const deRuta = (a: ArchivosControl) => correrControl(a).filter((x) => x.regla === 'ruta')

describe('el control de la ruta', () => {
  it('una ruta bien escrita no da avisos', () => {
    expect(deRuta(archivos('## Ruta\n- [x] Uno\n- [ ] Dos (Q-3)\n  - [ ] Rama (T-52)\n'))).toEqual([])
  })

  it('avisa del frente en curso sin ruta, no del que está en operación', () => {
    const avisos = deRuta(archivos('# Estado del módulo: Alfa\n'))
    expect(avisos).toHaveLength(1)
    expect(avisos[0]?.archivo).toBe('docs/modulos/alfa/estado.md')
    expect(avisos[0]?.texto).toContain('no tiene `## Ruta`')
  })

  it('avisa de una marca rara, una rama sin paso y códigos que no existen', () => {
    const avisos = deRuta(archivos('## Ruta\n  - [ ] Rama\n- [?] Raro\n- [ ] Algo (Q-99, T-77)\n'))
    expect(avisos.map((a) => [a.linea, a.texto.slice(0, 12)])).toEqual([
      [2, 'una rama va '],
      [3, '«[?]» no es '],
      [4, 'Q-99 no está'],
      [4, 'T-77 no está'],
    ])
  })
})

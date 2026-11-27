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

  // Calidad del frente (paso 8): los casos límite de cómo la escribe la IA.
  it('una rama con sangría de tabulación es una rama; los fines de línea de Windows no cambian nada', () => {
    const tab = leerRuta('## Ruta\n- [x] Uno\n\t- [ ] Rama con tabulación\n')
    expect(tab?.pasos[0]?.ramas.map((p) => p.texto)).toEqual(['Rama con tabulación'])
    expect(tab?.problemas).toEqual([])
    const crlf = leerRuta('## Ruta\r\n- [x] Uno\r\n  - [ ] Rama\r\n- [ ] Dos (Q-3)\r\n')
    expect(crlf?.pasos.map((p) => [p.texto, p.marca, p.preguntas, p.ramas.length])).toEqual([
      ['Uno', 'hecho', [], 1],
      ['Dos', 'viene', ['Q-3'], 0],
    ])
  })

  it('un bloque de código no suma pasos: se salta y avisa una vez', () => {
    const r = leerRuta('## Ruta\n- [x] Uno\n```\n- [ ] no es un paso\n```\n- [ ] Dos\n')
    expect(r?.pasos.map((p) => p.texto)).toEqual(['Uno', 'Dos'])
    expect(r?.problemas).toEqual([
      { linea: 3, texto: 'la ruta no lleva bloques de código: un paso por línea' },
    ])
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

const SONAR = '# Trabajo\n\n## T-52 — Sonar\nEstado: pendiente · Fecha: 2026-11-07\n'

function archivos(alfa: string, beta = '# Estado del módulo: Beta\n', trabajo = SONAR): ArchivosControl {
  return {
    estados: [
      { ruta: 'docs/estado.md', texto: GENERAL },
      { ruta: 'docs/modulos/alfa/estado.md', texto: alfa },
      { ruta: 'docs/modulos/beta/estado.md', texto: beta },
    ],
    trabajo,
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

  // D-174 (T-117): el trabajo cumplido no queda abierto, o la idea sigue «Aprobada» en Ideas.
  it('avisa del T-n que la ruta solo nombra en pasos hechos y sigue abierto', () => {
    const avisos = deRuta(archivos('## Ruta\n- [x] Sonar cuando termina (T-52)\n'))
    expect(avisos.map((a) => [a.archivo, a.linea])).toEqual([['docs/modulos/alfa/estado.md', 2]])
    expect(avisos[0]?.texto).toContain('T-52 está hecho en la ruta y sigue `pendiente`')
  })

  it('no avisa si le queda un paso sin marcar o si ya está hecho', () => {
    expect(deRuta(archivos('## Ruta\n- [x] Sonar (T-52)\n- [ ] Elegir el sonido (T-52)\n'))).toEqual([])
    const hecho = SONAR.replace('Estado: pendiente', 'Estado: hecho')
    expect(deRuta(archivos('## Ruta\n- [x] Sonar (T-52)\n', undefined, hecho))).toEqual([])
  })

  it('avisa del T-n que originó un frente hecho y sigue abierto; no si el frente sigue en curso', () => {
    const tipo = '# Estado del módulo: X\n\n**Tipo:** sección (T-52)\n'
    const avisos = deRuta(archivos('## Ruta\n- [ ] Uno\n', tipo))
    expect(avisos.map((a) => [a.archivo, a.linea])).toEqual([['docs/trabajo.md', 3]])
    expect(avisos[0]?.texto).toContain('originó el frente Beta')
    expect(deRuta(archivos(`${tipo}\n## Ruta\n- [ ] Uno\n`))).toEqual([])
  })

  // D-200: un frente con la ruta toda hecha y trabajo aprobado afuera decía «Todo hecho» y no se archivaba.
  it('avisa del T-n aprobado de un frente que su ruta no nombra, también si el frente está hecho', () => {
    const trabajo =
      '# Trabajo\n\n## T-60 — Enter guarda\nEstado: pendiente · Frente: Beta · Fecha: 2026-11-18\n\n' +
      '## T-61 — Una idea\nEstado: nueva · Frente: Beta · Fecha: 2026-11-18\n\n' +
      '## T-62 — Ya ubicado\nEstado: en curso · Frente: Alfa · Fecha: 2026-11-18\n'
    const avisos = deRuta(
      archivos(
        '## Ruta\n- [ ] Lo de ahora (T-62)\n',
        '# Estado del módulo: Beta\n\n## Ruta\n- [x] Todo\n',
        trabajo,
      ),
    )
    expect(avisos.map((a) => [a.archivo, a.linea])).toEqual([['docs/trabajo.md', 3]])
    expect(avisos[0]?.texto).toContain('T-60 está `pendiente` en el frente Beta y su ruta no lo nombra')
    // Ubicado en la ruta, ya no avisa.
    expect(
      deRuta(
        archivos(
          '## Ruta\n- [ ] Lo de ahora (T-62)\n',
          '# Estado del módulo: Beta\n\n## Ruta\n- [x] Todo\n- [ ] Enter guarda (T-60, chico, sola)\n',
          trabajo,
        ),
      ),
    ).toEqual([])
  })
})

// FS-I1 (D-178): el tamaño y `sola` van en el paréntesis final, con los códigos, y no se muestran.
describe('las marcas del avance solo', () => {
  it('lee el tamaño y sola del paréntesis final, y solo de ahí', () => {
    const r = leerRuta(
      '## Ruta\n- [ ] Cargar el tema propio (T-52, mediano, sola)\n- [ ] Hacer la versión grande (chico)\n- [ ] Sin marcas (T-52)\n',
    )
    expect(r?.pasos.map((p) => [p.texto, p.tamano, p.sola, p.trabajo])).toEqual([
      ['Cargar el tema propio', 'mediano', true, ['T-52']],
      ['Hacer la versión grande', 'chico', false, []],
      ['Sin marcas', null, false, ['T-52']],
    ])
  })

  it('deja lo que no es marca ni código dentro del paréntesis', () => {
    expect(textoSinCodigos('Medir (antes del martes, chico, sola)')).toBe('Medir (antes del martes)')
    expect(textoSinCodigos('Medir (T-5, antes del martes, grande)')).toBe('Medir (antes del martes)')
    expect(textoSinCodigos('Medir (sola)')).toBe('Medir')
  })

  it('avisa una marca mal escrita, dos tamaños y sola sin tamaño; no en lo hecho', () => {
    const avisos = deRuta(
      archivos(
        '## Ruta\n- [ ] Uno (chica, sola)\n- [ ] Dos (chico, grande)\n- [ ] Tres (sola)\n- [x] Cuatro (solo)\n- [ ] Cinco (T-52, chico, sola)\n',
      ),
    )
    expect(avisos.map((a) => [a.linea, a.texto.slice(0, 22)])).toEqual([
      [2, '«chica» no es una marc'],
      [2, 'un paso `sola` lleva s'],
      [3, 'el paso tiene 2 tamaño'],
      [4, 'un paso `sola` lleva s'],
    ])
  })
})

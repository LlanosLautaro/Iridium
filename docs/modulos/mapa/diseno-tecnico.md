# Diseño técnico del módulo: Mapa

**Fecha:** 2026-11-17
**Estado:** cerrado (las decisiones, en D-145)
**Base:** `definicion.md` (D-141 a D-143), `ux.md` (D-144), D-139 (la ruta en el `estado.md` de cada frente); el Mapa de hoy (`src/main/core/mapa.ts`, `src/main/app/mapa.ts`, `src/renderer/secciones/proyecto/Mapa.tsx`); el control (`modulos/orden/diseno-tecnico.md` › El control).

## Las decisiones de este paso
1. **La ruta es una lista de casillas** en la sección `## Ruta` del `estado.md` de un frente, con tres marcas: `[x]` hecho, `[ ]` lo que viene, `[-]` descartado. No hay marca de pausa: «En pausa» sale del estado del frente en la tabla `## Módulos`. El que sigue lo calcula Iridium: el primer `[ ]` del camino principal.
2. **Los códigos van en la línea y no se muestran.** Una `Q-n` sin responder vuelve el paso «Te espera»; un `T-n` dice qué trabajo es ese paso (así no aparece en «Aprobado, sin lugar en la ruta» ni en «Sin frente»); un código de iteración (`MA-I1`) da el destino en Docs. Iridium los saca del texto que muestra, y si quedan en un paréntesis final solo con códigos, saca el paréntesis entero.
3. **Una rama es un nivel de sangría** (dos espacios o más) bajo el paso del que sale. Una rama de una rama se muestra como rama del mismo paso: más niveles serían una maraña (D-138).
4. **«Por empezar», «Sin frente» y «Aprobado, sin lugar en la ruta» salen de `trabajo.md` al leer** (D-143): no se guarda nada y nunca quedan viejos.
5. **La pestaña elegida se recuerda en la vista del proyecto, en memoria,** como el documento abierto en Docs (H-6): al cerrar Iridium vuelve al frente activo. No vale un dato más en `config.json`.
6. **El Mapa de hoy se reemplaza entero** en operación; antes del hito 10 se reusan los lectores de hitos, portón e iteraciones que ya existen (D-142).

Descartado: un archivo `ruta.md` aparte (un archivo más por frente que la IA tiene que abrir; el `estado.md` ya se toca en cada iteración, D-139), una marca de pausa (dos lugares para decir lo mismo) y que la IA mueva una marca de «el que sigue» (se olvida; se calcula).

## El formato
```markdown
## Ruta
- [x] Pensar para qué sirve el Mapa
- [x] Definir qué muestra el Mapa y qué deja de mostrar (D-141)
- [ ] Dibujar cómo se usa (Q-202)
- [ ] Enseñarle a la IA a escribir la ruta, con su control (MA-I1)
  - [ ] Avisar de un frente en curso sin ruta
- [-] Un gráfico con Mermaid
- [ ] Sonar cuando Iridium termina una tarea (T-52)
```

- La sección va entre «En qué estamos ahora» y «Cambios requeridos en documentos generales».
- Un paso por línea, de una acción y en palabras del usuario («Pegar imágenes en una idea»), no un paso del método.
- Lo que el lector no entiende (una línea que no es casilla, una marca `[?]`) se muestra tal cual, en gris, como «lo que viene», y el control lo avisa.
- Una línea vacía o un comentario (`<!-- -->`) se ignoran.

## Lo que lee Iridium
**Reglas puras (`src/main/core/ruta.ts`, nuevo):**
- `leerRuta(estadoDelFrente)` → `{ pasos: PasoRuta[]; problemas: ProblemaRuta[] } | null` (null sin la sección). `PasoRuta`: `texto` (sin códigos), `marca` (`hecho`, `viene`, `descartado`, `otro`), `preguntas`, `trabajo` e `iteracion` (los códigos de la línea), `linea` (para el control) y `ramas: PasoRuta[]`.
- `textoSinCodigos(linea)`: saca los códigos del texto mostrado.
- `porEmpezar(estado, trabajo, rutas)` y `sinLugar(frente, trabajo, ruta)`: lo que va en cada lista, con las reglas de abajo.

**Qué va en cada lista** (`T-n` abiertos: `pendiente` o `en curso`; los `nueva` siguen solo en Ideas):
- **Por empezar › un frente:** cada fila `pendiente` de la tabla `## Módulos` sin carpeta, con sus `T-n` abiertos de `Frente: <ese nombre>` como pasos. El `T-n` que nombra la fila (`Capacidades (T-28)`) es el frente mismo: no es un paso ni va a «Sin frente».
- **Por empezar › Sin frente:** los `T-n` abiertos sin `Frente:` (o con un frente que no está en la tabla ni tiene carpeta), que no nombra ninguna ruta ni ninguna fila de la tabla; los `en curso` primero.
- **Aprobado, sin lugar en la ruta (de un frente):** sus `T-n` abiertos (`Frente: <su nombre>`) que su ruta no nombra, salvo el que lo originó (el que nombra la línea `**Tipo:**` de su `estado.md` o su fila de la tabla).
- **Te espera:** una `Q-n` de la línea que está sin responder (la misma lista de la Bandeja).

**Caso de uso (`src/main/app/mapa.ts`):** `mapaDe` arma un `MapaProyecto` nuevo:

| Campo | Qué lleva |
|---|---|
| `hito` | número y nombre del actual, para la cabecera |
| `frentes` | los que tienen carpeta: el activo primero, después en el orden de la tabla; cada uno con `nombre`, `estado` (en palabras: En curso, En uso, En pausa, Sin empezar), `ruta` (o, sin ruta, `pasosDelMetodo` y `sinRuta: true`), `sinLugar` y `documento` |
| `porEmpezar` | `{ frentes: [{ nombre, pasos }], sinFrente: [{ codigo, titulo, enCurso }] }` |
| `hitos` | antes del hito 10 (o sin frentes): el camino de los hitos con los pasos del actual, como hoy |

Se va del tipo lo que dejó de mostrarse (D-141): el Próximo paso, «En qué estamos», el trabajo `en curso` y las preguntas de cada frente, y «Lo último de la IA».

**La pantalla (`Mapa.tsx`):** la barra con la pieza Pestañas; el camino es una pieza nueva, **Camino** (PZ-15 en `piezas.css`, sacada de la maqueta: el carril, los puntos con sus estados, las ramas con su codo y la línea de plegados), y las listas de «Por empezar», la pieza Fila con el título que baja de renglón. «Te espera» usa el salto a la Bandeja que ya existe; «Empezar este frente», la cita sin enviar de Hablar de esta idea (D-131).

## El framework y el control (D-086, D-092)
En el mismo cambio que el lector:
- **Plantilla** `plantillas/modulo/estado.md`: la sección `## Ruta` con un ejemplo de dos líneas.
- **`SKILL.md`:** el formato de la ruta (› Los formatos, junto al `estado.md` de un frente) y «El Mapa» al día (de dónde sale cada cosa). **`referencias/modulos.md`:** la IA escribe la ruta al abrir un frente, la pone al día al cerrar cada iteración (marca lo hecho, suma lo nuevo en su lugar, nombra la `Q-n` que espera) y, cuando se aprueba una idea de un frente, la ubica con una línea con su `T-n`. **`referencias/10-operacion.md`:** lo mismo al aprobar una idea en operación.
- **El control** (`src/main/core/control/ruta.ts`, nuevo, en `REGLAS`), sobre cada `docs/modulos/*/estado.md`:
  - una marca que no es `[x]`, `[ ]` ni `[-]`, o una línea de la sección que no es casilla;
  - una rama sin paso del que salga (la primera línea con sangría);
  - un frente `en curso` (en la tabla `## Módulos`) sin `## Ruta`;
  - un paso con un código que no existe en el proyecto (una `Q-n` o un `T-n` que no está en ningún lado).

  Los frentes en operación o en pausa sin ruta no se avisan: la reciben la próxima vez que se trabaje en ellos (D-139).

## Las iteraciones
| ID | Qué se construye | Cómo se prueba |
|---|---|---|
| MA-I1 | El formato en el framework (plantilla, `SKILL.md`, referencias), el lector `core/ruta.ts`, la regla del control y la ruta escrita en cada frente de Iridium | Vitest: el lector con cada marca, ramas, códigos y líneas raras; el control con cada aviso; el control sobre este repo sin avisos |
| MA-I2 | El Mapa nuevo en operación: la barra, el camino con sus marcas, ramas y plegados, «Aprobado, sin lugar», «Por empezar» con Empezar este frente, las flechas, la pieza Camino; se saca lo de antes | Vitest del caso de uso con carpetas temporales; Playwright con el motor falso; capturas; la prueba del usuario como `Q-n` |
| MA-I3 | Antes del hito 10 y los bordes: los hitos como camino, el hito 10 sin frentes, un frente sin ruta, el error de lectura, el ancho chico | Vitest y Playwright con proyectos de muestra (Alfa en el hito 7, Beta sin rutas); la prueba del usuario como `Q-n` |

## Riesgos
- **La IA se olvida de poner la ruta al día:** el control avisa del frente en curso sin ruta, pero no de una ruta vieja. Lo mitiga que el cierre de iteración ya la nombra (referencias) y que lo aprobado sin ubicar se ve igual («Aprobado, sin lugar en la ruta»).
- **Títulos de `trabajo.md` largos o en borrador** (los que escribe el usuario al anotar): se muestran tal cual en «Sin frente» (D-143); bajan de renglón.

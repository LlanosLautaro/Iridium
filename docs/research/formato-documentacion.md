# Formato de la documentación que lee el Centro

**Fecha:** 2026-10-22 · **Fuentes:** la skill `hitos-desarrollo-app` (formato del 2026-10-16), los `docs/` reales de otras apps y el gestor anterior, y el lector del visor del Gestor (`el gestor anterior/src/core/visor/preguntas.ts`, `respuestas.ts`, `guia.ts`).

Responde la cuarta pregunta del MVP (`02-definicion.md` › Preguntas abiertas para el hito 3): qué tiene que escribir la guía para que el Centro dibuje el mapa (D-008) y arme la bandeja (D-010). Los cambios de la guía se hacen en `Skills` (D-009); acá queda la propuesta.

## Lo que ya se puede leer hoy

| Dato | Dónde está | Qué tan parejo es entre proyectos |
|---|---|---|
| Hitos y su estado | `estado.md` › Progreso de hitos (`# · Hito · Estado · Documento`) | Igual en todos los que siguen la guía |
| Hito actual, próximo paso, nivel | `estado.md`, por título y por `**Etiqueta:**` | Igual; el Gestor ya lo lee |
| Iteraciones | `07-construccion.md` › Plan de iteraciones (`ID · Objetivo · … · Estado`) | **Varía:** otra app suma columnas (Etapa, Riesgos); otra app tiene tandas con prefijo propio (A-n) |
| Estados de una iteración | columna Estado | **Varía:** "completa", "validada (2026-10-18, Q-60)", "aprobada provisional (…)" |
| Pasos de un módulo | `modulos/<m>/estado.md` (`Paso · Estado · Documento`) | Igual |
| Preguntas `Q-n` | `estado.md` › Preguntas abiertas | Igual; el Gestor ya las lee con sus opciones |
| Respuestas | `respuestas/Q-n.md` (`**Opción:**`, texto, imágenes, `> Procesada el …`) | Igual |
| Pasos de los hitos 0 a 6, 8 y 9 | **No existen.** El portón de cada hito está en la referencia de la skill, no en el documento del proyecto | — |

Conclusión: el mapa y la bandeja se pueden armar casi con lo que hay. Faltan tres cosas: los pasos de los hitos que no son de construcción, el tipo y el "frena" de las `Q-n`, y una forma de escribir las listas.

## Propuesta

### 1. Pasos de cada hito (para el mapa, D-008)
- **Hitos 7 y 10:** las iteraciones de "Plan de iteraciones", como hoy. El Centro busca la tabla por las columnas `ID` y `Estado`, y acepta columnas de más y varias tablas (tandas).
- **Módulos:** su tabla de pasos, como hoy; cada módulo es otra caja dentro del mapa.
- **Hitos 0 a 6, 8 y 9:** el portón (D-019). Cada documento de hito termina con `## Portón` y la checklist de salida de la skill como casillas (`- [ ]` / `- [x]`), marcadas a medida que se cumplen. El Centro muestra cada punto como un paso de la caja.

### 2. Estados con palabras fijas
El estado empieza siempre por una de estas palabras; lo que sigue (fecha, `Q-n`, nota) es libre:

| Palabra | El Centro la muestra como |
|---|---|
| pendiente | pendiente |
| en curso · reabierto · aprobada provisional · bloqueado | en curso (reabierto y bloqueado con marca propia, C-17) |
| completo/a · validado/a · saltado | hecho |

Ya es lo que se escribe en la práctica; la guía solo lo deja escrito.

### 3. Tipo y "frena" de cada `Q-n` (para la bandeja, D-010)
Una línea `Tipo:` como primera línea del contexto:

```markdown
- **Q-12 — ¿I-4 (clasificar en Pendientes) funciona como esperabas?**
  Tipo: prueba · frena
  Contexto: instalá la última versión (`scripts.md` › Instalar la última versión).
  - [ ] Arrastrar un archivo y verlo en Pendientes
  - [ ] Ponerle dos tags y que el hijo herede los del padre
  Opciones: A) Funciona, se aprueba (recomendada) · B) Encontré algo
```

- Tipos: decisión · consulta · prueba · tarea · formulario.
- `frena` solo cuando no deja seguir el **Próximo paso**. Sin la palabra, no frena.
- Una `Q-n` vieja sin `Tipo:` se lee como consulta que no frena: nada se rompe.
- No va dentro del título en negrita porque el visor del Gestor lo tomaría como parte de la pregunta.

### 4. Pruebas y tareas como listas
- Los puntos van como lista de casillas (`- [ ]`) dentro del contexto, con sangría.
- La respuesta repite cada punto, marcado o no, con una nota después de ` — `:

```markdown
# Q-12 — ¿I-4 (clasificar en Pendientes) funciona como esperabas?

**Opción:** B

- [x] Arrastrar un archivo y verlo en Pendientes
- [ ] Ponerle dos tags y que el hijo herede los del padre — el hijo no hereda el tag "paisaje"
```

### 5. Formulario de arranque (fuera del MVP, C-25)
Se fija cuando se construya. Idea: `Tipo: formulario` y un punto por campo con sus opciones, siempre con "no sé todavía". La forma sale de la elicitación de MCP (D-010).

## Compatibilidad con el visor del Gestor (D-017)
Probado con el lector del Gestor (`src/core/visor/preguntas.ts`) sobre una muestra con el formato nuevo:
- Lee las tres preguntas (con `Tipo:` y lista, solo con `Tipo:` y vieja) con su título y sus opciones bien, incluida la recomendada.
- Muestra la línea `Tipo:` y la lista como parte del contexto: se entiende, aunque no la use.
- La lista de la respuesta queda como texto de la respuesta.

El Gestor no necesita cambios para convivir. Que muestre el tipo o marque las casillas es una mejora opcional de ese proyecto.

## Regla para el Centro
Leer con tolerancia, como el Gestor: buscar por títulos y nombres de columna, sin distinguir mayúsculas ni acentos; ante algo que no entiende, mostrarlo como texto y nunca fallar. Lo que el Centro escribe (respuestas, casillas) sigue este formato para que la IA y el Gestor lo lean igual.

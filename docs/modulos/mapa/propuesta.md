# Propuesta del módulo: Mapa

**Fecha:** 2026-11-17
**Tipo:** sección
**Estado:** cerrada en el chat (Q-193 a Q-195 → D-137, D-138, D-139)

## Qué problema resuelve
El Mapa de hoy (W-7) dice dónde está el proyecto (el hito, el frente activo, su paso del método), pero no **qué viene después**. En Iridium hay 45 cosas abiertas en `trabajo.md` sin orden entre ellas: el usuario pierde el foco y no sabe si una idea suya ya está en el plan ni cuándo llega (T-71).

## Por qué ahora
D-140: después de Ideas, el Mapa. Ideas ya junta lo que el usuario quiere; falta ver en qué orden se hace.

## Cómo encaja en el producto
Es la sección Mapa de cada proyecto, rehecha. Lee lo que ya escribe la IA (el `estado.md` general y el de cada frente) y lo dibuja: no gasta uso al mirarlo. Lo nuevo es una lista corta «Ruta» en el `estado.md` de cada frente (D-139), que entra al framework y vale para todos los proyectos.

## Formas pensadas
| | Cómo es | Resultado |
|---|---|---|
| A · Ahora / Después / Más adelante | Una hoja de ruta en tres columnas, una fila por frente | Descartada en Q-194: junta cosas sin mostrar la secuencia |
| B · El camino de pasos por frente | Un camino vertical de pasos concretos, uno después del otro, con ramas | **Elegida** (D-138), un frente a la vez desde una barra arriba |
| C · Kanban por estado | Columnas nueva, pendiente, en curso, hecho | Descartada en Q-193: muestra estados, no el orden, y pide mover tarjetas |

La maqueta aprobada es `docs/diseno/pantallas/mapa-b.html`.

## Alternativas más simples
- **Mermaid o un motor de grafos:** un gráfico con muchos frentes se vuelve una maraña y corta los nombres largos; un camino vertical con ramas se dibuja con las piezas de siempre.
- **Que la IA arme el Mapa a pedido:** lo más caro y no queda escrito (D-139).

# Propuesta del módulo: Arranque

**Fecha:** 2026-11-18
**Tipo:** sección (una función de Iridium que vive en Ajustes y avisa en la Bandeja; T-70)
**Estado:** cerrada antes de abrir el frente (Q-184, Q-188 → D-135; elegido en Q-205)

## Qué problema resuelve
El período de 5 horas de Claude empieza con el primer mensaje y se renueva 5 horas después. Si el primero lo manda el usuario al sentarse, el período se renueva cuando está en lo mejor y el resto del día rinde menos. Arrancarlo antes, cuando no está, mueve la renovación a un momento útil (T-70).

## Por qué ahora
Q-205: después del Mapa, lo elegido es esto, porque rinde todos los días y es chico (una o dos iteraciones).

## Cómo encaja en el producto
Iridium ya corre las sesiones de cada proyecto, ya sabe cuándo vence la ventana de 5 horas (la barra de uso la lee del motor sin gastar, H-12) y ya sabe qué proyectos tienen respuestas sin procesar (la Bandeja, W-5). El arranque junta las tres cosas: a la hora elegida, si hay trabajo listo, toca «Continúa con el proyecto» por el usuario. Se prende en Ajustes (frente Apariencia y ajustes) y lo que hizo se ve en la Bandeja (frente Inicio).

## Por qué es un módulo y no una funcionalidad
- [ ] Dominio propio que requiere investigación (se revisó en T-70: cómo anda el límite y qué permite Anthropic)
- [x] Flujos de UX propios (algo que pasa sin el usuario y se lo cuenta después)
- [x] Ritmo de avance propio
- [x] Se activa y desactiva por separado

## Alternativas
| | Cómo es | Resultado |
|---|---|---|
| Un mensaje vacío desde una tarea de Windows | `claude -p` a la hora elegida, con Iridium cerrada | Descartada (D-135): parece hecho para abrir el período y abre cosas solas de noche |
| Trabajo real desde la misma Iridium abierta | «Continúa con el proyecto» en el proyecto que espera hace más | **Elegida** (D-135) |
| Una herramienta de terceros («session warmer») | Programas que imitan a Claude Code | Descartada: Anthropic cortó las que imitan a Claude Code |

## Decisión
Seguir (D-135, Q-205).

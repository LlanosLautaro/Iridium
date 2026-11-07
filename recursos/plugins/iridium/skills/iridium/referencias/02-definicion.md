# Hito 2 — Definición y alcance

**Objetivo:** convertir la idea en una definición concreta: qué hace la app, qué no hace, qué entra en la primera versión y con qué restricciones. Es el contrato al que vuelven todos los hitos siguientes.

**Duración típica:** una a tres sesiones.

## Preguntas

Primero, el cuestionario de perfil completo de `referencias/perfil-proyecto.md`. Después:

**Objetivo y éxito**
1. ¿Qué tiene que lograr la app para que la consideres un éxito? (concreto y comprobable)
2. ¿Cómo sabrías que no está funcionando?

**Funcionalidades**
3. Lista todo lo que te gustaría que haga (vale recuperar los `T-n` `nueva` de `trabajo.md`; los que entran pasan a `pendiente` o se vuelven funcionalidades, y los que no, a `descartado` con el motivo).
4. De esa lista, ¿sin qué cosas la app no tiene sentido?
5. ¿Qué cosas querés explícitamente que NO haga?

**Usuarios y contexto**
6. ¿Hay distintos tipos de usuario con necesidades distintas?
7. ¿En qué contexto se usa? (escritorio con tiempo, celular en movimiento, junto a otro programa abierto…)

**Restricciones**
8. ¿Hay plazos, presupuesto o tecnologías obligatorias o prohibidas?

**Crecimiento**
9. ¿Se prevé que la app tenga secciones grandes con desarrollo propio, plugins o extensiones, o productos hermanos (otra versión, otra plataforma)? Si hay plugins, ¿los escribirías solo vos o también terceros?

## Actividades
- **Perfil del proyecto.** Completa `docs/perfil-proyecto.md` y asigna el nivel de protección (P1–P5) con su justificación.
- **Inventario de funcionalidades.** Lista todas y clasifícalas con MoSCoW:
  - *Must* (imprescindible para la primera versión)
  - *Should* (importante, pero puede esperar a la siguiente)
  - *Could* (deseable si sobra tiempo)
  - *Won't* (descartado por ahora, con motivo)
- **Definición del MVP.** El MVP es el conjunto mínimo de *Must* que ya entrega valor real. Debería poder describirse en un párrafo. Si el MVP tiene más de 5–7 funcionalidades grandes, probablemente es demasiado grande: propone recortes.
- **Fuera de alcance.** Escribe explícitamente lo que no se va a hacer. Es la herramienta principal contra el crecimiento descontrolado.
- **Glosario.** Define los términos propios del dominio (por ejemplo, qué es un "pack", un "recurso", un "proyecto" dentro de la app). Evita que el mismo concepto tenga tres nombres en el código y la documentación.
- **Qué investigar.** Lista las preguntas técnicas o de dominio abiertas: son la entrada del hito 3. Si no hay ninguna relevante, justifica por qué se salta el hito 3.
- **Módulos previstos.** Si la respuesta a la pregunta 9 es sí, lista los módulos candidatos con su tipo (sección, plugin, producto hermano) según `referencias/modulos.md`. No se definen ahora: solo se identifican, para que la arquitectura los tenga en cuenta. Si hay plugins de terceros, refléjalo en el perfil (contenido de terceros, mínimo P2).

## Checklist de salida
- [ ] `perfil-proyecto.md` completo, con nivel de protección asignado y justificado.
- [ ] Objetivo y criterios de éxito comprobables.
- [ ] Funcionalidades clasificadas en MoSCoW.
- [ ] MVP descrito en un párrafo.
- [ ] Lista de "fuera de alcance".
- [ ] Glosario inicial.
- [ ] Preguntas abiertas para el hito 3 (o justificación para saltarlo).
- [ ] Módulos previstos identificados (o "ninguno").

## Cómo escala según el perfil
La definición es igual de completa en cualquier perfil. Lo que cambia es el contenido: en P4–P5 se suman objetivos de negocio, modelo de ingresos y requisitos legales; en P1–P2 el foco está en el uso propio y el crecimiento a largo plazo.

## Errores comunes
- Un MVP que en realidad es la versión 3.
- "Debería ser fácil de usar" como requisito: no es comprobable. Mejor "añadir un recurso no debería llevar más de 3 pasos".
- Dejar el "fuera de alcance" vacío.

## Plantilla — `docs/02-definicion.md`

```markdown
# Definición y alcance

**Fecha:** AAAA-MM-DD
**Nivel de protección:** P_ (ver perfil-proyecto.md)

## Objetivo
[Qué tiene que lograr la app]

## Criterios de éxito
- …

## Usuarios
| Tipo | Necesidad principal | Contexto de uso |
|---|---|---|

## Funcionalidades
### Must (MVP)
- …
### Should
- …
### Could
- …
### Won't (por ahora)
- … — motivo

## MVP en un párrafo
[…]

## Fuera de alcance
- …

## Restricciones
- …

## Glosario
| Término | Significado en esta app |
|---|---|

## Preguntas abiertas para el hito 3
- …
```

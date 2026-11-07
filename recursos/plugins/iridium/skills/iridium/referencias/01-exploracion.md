# Hito 1 — Exploración

**Objetivo:** contrastar la idea con lo que ya existe y decidir si vale la pena construirla, y con qué enfoque. Es una mirada de producto, no técnica: la investigación técnica profunda va en el hito 3.

**Duración típica:** una o dos sesiones.

## Preguntas

1. ¿Conocés apps o herramientas que hagan algo parecido? ¿Las probaste?
2. ¿Qué te falta o te molesta de ellas?
3. ¿Qué tendría que tener la tuya para que la prefieras?
4. ¿Hay alguna forma de resolver el problema sin construir nada (una herramienta existente, una planilla, una configuración)?
5. ¿Qué te motiva más: resolver el problema, aprender a construirlo, o ambas? (Cambia la decisión de construir o reutilizar.)

## Actividades
- **Búsqueda de alternativas.** Busca en la web, tiendas de apps y repositorios open source productos similares. Para cada uno anota: qué hace, plataforma, precio o licencia, puntos fuertes, puntos débiles, estado (activo, abandonado).
- **Mapa de diferenciación.** Identifica qué hace distinta la idea frente a las alternativas. Si no hay diferencia, dilo con claridad.
- **Brainstorming guiado.** Con lo aprendido, amplía la idea: variantes, funcionalidades que inspiran las alternativas, enfoques distintos. Todo va a `trabajo.md` como `T-n` `nueva`; nada es compromiso todavía.
- **Riesgos iniciales.** Lista lo que podría hacer fracasar el proyecto: técnica difícil, dependencia de un tercero, falta de tiempo, tamaño excesivo.
- **Decisión.** Propone una de tres salidas: construir, construir enfocado en un diferencial concreto, o no construir (usar o extender algo existente).

Si la búsqueda revela que el valor está en recursos técnicos (formatos, librerías, documentación) más que en competidores, anótalos para el hito 3 sin profundizar ahora.

## Checklist de salida
- [ ] Hay al menos 3 alternativas analizadas (o una explicación de por qué no existen).
- [ ] El diferencial está escrito en una o dos frases.
- [ ] Los riesgos principales están listados.
- [ ] Hay una decisión explícita de seguir, con el enfoque elegido.

## Cómo escala según el perfil
La exploración no se reduce en apps personales, pero cambia la pregunta: en una app personal se busca sobre todo "¿hay algo que ya me sirva o que pueda adaptar?"; en una pública, también "¿hay mercado y cómo me diferencio?".

## Errores comunes
- Abandonar porque existe algo parecido: muchas veces lo existente no cubre tu caso exacto.
- Copiar todas las funcionalidades de la competencia: se anotan como ideas, no como requisitos.

## Plantilla — `docs/01-exploracion.md`

```markdown
# Exploración

**Fecha:** AAAA-MM-DD

## Alternativas existentes
| Nombre | Qué hace | Plataforma | Licencia/precio | Fortalezas | Debilidades | Estado |
|---|---|---|---|---|---|---|

## Soluciones sin construir nada
[Qué se podría usar en lugar de hacer la app y por qué no alcanza]

## Diferencial
[En una o dos frases]

## Riesgos iniciales
| Riesgo | Impacto | Cómo mitigarlo |
|---|---|---|

## Pistas para la investigación técnica (hito 3)
- …

## Decisión
[Construir / construir con foco en X / no construir] — motivo.
```

# Hito 3 — Investigación de dominio y recursos

**Objetivo:** entender a fondo el "mundo" con el que trabaja la app (formatos, especificaciones, APIs, reglas, ecosistema) y encontrar recursos reutilizables (documentación oficial, librerías, herramientas open source, ejemplos), para que la UX y la arquitectura se apoyen en conocimiento real y no en suposiciones.

**Es condicional:** se salta solo si el dominio es trivial. Es obligatorio cuando la app lee o escribe formatos de terceros, se integra con APIs o servicios, depende de reglas de un ecosistema (un juego, una plataforma, una normativa) o necesita algoritmos o técnicas que el usuario no domina. Si se salta, la justificación queda en `02-definicion.md`.

**Duración típica:** variable; de una sesión a varias semanas en dominios complejos. Puede reabrirse en cualquier hito posterior cuando aparezca una pregunta nueva.

## Preguntas

1. ¿Con qué datos, archivos o sistemas externos trabaja la app?
2. ¿Existe documentación oficial? ¿Comunitaria? ¿Está actualizada?
3. ¿Hay herramientas existentes (editores, visores, conversores) que ya resuelvan partes del problema?
4. ¿Hay librerías para leer o escribir esos formatos en los lenguajes que te interesan?
5. ¿Qué versiones del ecosistema tenés que soportar? (los formatos cambian entre versiones)
6. ¿Tenés ejemplos reales para usar como casos de prueba? (archivos, cuentas de prueba, datos de muestra)

## Actividades

**1. Partir de las preguntas abiertas del hito 2.** Cada una se convierte en una línea de investigación.

**2. Investigar el dominio.** Para cada área (formato, API, regla):
- Fuente oficial primero, comunitaria después.
- Qué estructura tiene, qué variantes y versiones existen, casos límite, qué está documentado y qué solo se sabe por ingeniería inversa.

**3. Inventario de recursos reutilizables.** Para cada librería, herramienta o repo:
- Qué resuelve, lenguaje, licencia, actividad (último commit, issues), calidad de la documentación.
- Cómo se usaría: como dependencia, como referencia de lectura, o no se usa.

**4. Revisar licencias.** Es parte central del hito, no un detalle:
- Permisivas (MIT, Apache 2.0, BSD): se pueden usar como dependencia con atribución.
- Copyleft (GPL, AGPL): usar su código obliga a que tu app adopte la misma licencia si se distribuye. Para uso personal no es un problema; para un producto distribuido, sí. Siempre se pueden usar como referencia para entender un formato sin copiar código.
- Documentación con licencia de contenido (CC BY, etc.): se puede copiar con atribución, según los términos.
- Sin licencia: no se puede reutilizar el código; solo leerlo como referencia.
- Contenido con derechos de autor de una marca o juego (assets, música, texturas): no se incluye en el repo; se usa el que el usuario tenga localmente.

**5. Guardar el conocimiento en el repo.** En `docs/research/`:
- Un archivo de notas por tema o fuente (`research/formato-x.md`, `research/api-y.md`), con resumen propio, lo importante para esta app y el enlace a la fuente.
- Si la fuente oficial es un repositorio público con licencia que lo permite, agrégalo como submódulo de git o snapshot fechado en `research/vendor/` con su licencia y atribución. No copies documentación sin licencia clara.
- Archivos de ejemplo para pruebas en `research/samples/`, solo si su licencia lo permite; si no, documenta dónde conseguirlos.
- Mantén las notas propias como fuente principal: son más útiles para la IA que una copia completa de la documentación, y no quedan desactualizadas en silencio si se anota la fecha y la versión.

**6. Spikes (opcional).** Si una duda solo se resuelve probando ("¿puedo leer este formato en el navegador?"), haz un prototipo descartable en una carpeta separada (`spikes/`), anota la conclusión y no lo reutilices como código de producto sin revisarlo.

**7. Ajustar la definición.** Si la investigación muestra que algo del MVP es inviable o mucho más caro de lo pensado, o que algo era mucho más fácil, propone cambios en `02-definicion.md` y regístralos en `decisiones.md`.

## Checklist de salida
- [ ] Cada pregunta abierta del hito 2 tiene respuesta o está marcada como riesgo aceptado.
- [ ] Inventario de recursos con licencia y decisión de uso.
- [ ] Notas en `docs/research/` con fuentes, fecha y versión.
- [ ] Muestras de prueba disponibles o documentado cómo obtenerlas.
- [ ] Ajustes a la definición aplicados y registrados (si los hubo).

## Cómo escala según el perfil
La profundidad depende del dominio, no del perfil. El perfil solo cambia la importancia de las licencias: en P1–P2 el copyleft rara vez importa; desde P3, y sobre todo si se distribuye, condiciona decisiones.

## Errores comunes
- Copiar toda la documentación externa al repo "por si acaso": se desactualiza y puede tener problemas de licencia.
- Descubrir en el hito 7 que el formato tenía una variante no soportada.
- Adoptar una librería abandonada sin plan B.

## Plantilla — `docs/03-investigacion.md`

```markdown
# Investigación de dominio y recursos

**Fecha:** AAAA-MM-DD

## Preguntas y respuestas
| Pregunta (del hito 2) | Respuesta | Fuente | Estado |
|---|---|---|---|

## Conocimiento del dominio
### [Área 1]
Resumen. Detalle en `research/…`.

## Recursos reutilizables
| Recurso | Qué resuelve | Licencia | Actividad | Uso decidido |
|---|---|---|---|---|

## Versiones soportadas
- …

## Muestras para pruebas
- …

## Spikes realizados
| ID | Pregunta | Resultado | Ubicación |
|---|---|---|---|

## Impacto en la definición
- …

## Riesgos aceptados
- …
```

# Propuesta del módulo: Revisión de la app

**Fecha:** 2026-10-28
**Tipo:** producto hermano (una extensión del navegador que se instala aparte; la recibe Iridium)

## Qué problema resuelve
Hoy el usuario prueba la app y cuenta en el chat lo que ve («el botón de arriba está muy apretado»), a veces con una captura. La IA tiene que adivinar de qué elemento habla, y lo que no se dijo en esa sesión se pierde. Con el módulo, el usuario selecciona el elemento en su app en modo desarrollo, como en el selector de Claude Design, y deja un comentario pegado a él: queda como archivo en el proyecto, con las pistas para encontrarlo en el código, o va en el momento a la sesión abierta (`01-exploracion.md` › Área: Revisión de la app).

## Por qué ahora
El usuario la quiere antes de terminar el MVP, para usarla en todos sus proyectos desde el primer día (D-046).

## Cómo encaja en el producto
Es la parte «revisar lo construido» de dirigir (`02-definicion.md` › C-36 a C-39). Iridium recibe los comentarios, los guarda en el proyecto que corresponde y los muestra; la IA los lee en la sesión siguiente o al instante con «enviar ahora». El selector es el mismo que usará el lienzo de Diseño (D-011).

## Por qué es un módulo y no una funcionalidad
- [x] Dominio propio que requiere investigación: extensiones de Chromium, cómo marca cada framework el archivo y la línea en modo desarrollo, cómo llega «enviar ahora» a la sesión.
- [x] Flujos de UX propios: seleccionar y comentar dentro de otra app, y el ciclo del comentario (abierto, resuelto, reabierto).
- [ ] Ritmo de avance propio
- [x] Se instala por separado (la extensión, en el navegador).

## Alternativas
Repasadas en `01-exploracion.md` › Área: Revisión de la app: el panel de Claude Code Desktop, `impeccable live`, Agentation, React Grab y stagewise señalan un elemento y se lo pasan a la IA, pero ninguno guarda el comentario en el proyecto para la sesión siguiente, y los que viven dentro de la app obligan a tocar cada proyecto o a usar React.

## Decisión
Seguir (D-012, D-046): extensión del navegador, comentarios en archivos planos del proyecto, sin variantes; Iridium hace de programa local.

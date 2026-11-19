# Hito 7 — Construcción

**Objetivo:** construir el MVP en iteraciones cortas, cada una con algo que funciona de punta a punta, manteniendo la documentación sincronizada con el código.

**Duración típica:** la mayor parte del proyecto. Se trabaja en iteraciones de días o pocas semanas.

## Antes de empezar
- Confirma que los hitos 2, 4, 5 y 6 están cerrados (o que el usuario decidió explícitamente avanzar con huecos, registrado en `decisiones.md`).
- Configura el repo según `05-arquitectura.md`: estructura, dependencias, linter/formateador, tests vacíos que corran, archivo de instrucciones para la IA en la raíz.
- **Revisión de Iridium** (el usuario comenta la app con `F8` y el comentario llega al proyecto como `docs/revision/R-n.md`): es la norma desde la primera iteración.
  - **App Electron:** en el proceso principal va esta línea; corre en modo desarrollo y en la versión armada (en la armada, el comentario llega sin archivo ni línea). Necesita `join` de `node:path` y `pathToFileURL` de `node:url`. Si Iridium no está instalado, no pasa nada; con `IRIDIUM_REVISION=no` (pruebas que lo necesiten), tampoco.
    ```ts
    // Revisión de Iridium: F8 comenta la app y el comentario llega a este proyecto.
    void import(pathToFileURL(join(process.env.APPDATA ?? '', 'Centro de Desarrollo', 'extension', 'electron', 'ayudante.mjs')).href)
      .then((m) => m.revision())
      .catch(() => {})
    ```
    Si la app filtra los pedidos de su sesión (`webRequest`), deja pasar `chrome-extension://lnjpddimnapkmhoggokbjkoleaanbfhd/` y `http://127.0.0.1:47321/`. Si su interfaz se sirve con un protocolo propio (no `file://` ni `localhost`) o muestra datos privados, la versión armada queda sin la línea hasta que el usuario lo decida.
  - **App web con servidor de desarrollo local** (Vite, React): no lleva nada; la extensión de Iridium la comenta en Edge o Chrome.
  - El detalle está en la documentación de Iridium (el módulo Revisión, su diseño técnico › Ayudante de Electron).

## Plan de iteraciones
Ordena las historias de usuario del MVP en iteraciones siguiendo estos criterios:
1. **Primero el esqueleto de punta a punta:** la versión más simple que atraviesa todas las capas (interfaz → lógica → datos). Valida la arquitectura temprano.
2. **Después lo más riesgoso:** lo que más incertidumbre técnica tiene.
3. **Después lo más valioso** para el usuario.
4. **Al final los detalles** y lo *Should*.

Cada iteración tiene un objetivo en una frase, una lista de historias y su **contexto**: en su detalle, **Leer antes** con las secciones que hay que leer para construirla (`04-ux.md` › H-7, `05-arquitectura.md` › Procesos centrales, decisiones que la afectan) y las restricciones que aplican (seguridad, rendimiento, lo que no hay que romper). Así una sesión nueva arranca la iteración sin leer toda la carpeta `docs/`.

## Ciclo de cada iteración
1. **Planificar:** leer el contexto de la iteración (su **Leer antes**), elegir las historias, revisar sus criterios de aceptación y el diseño correspondiente.
2. **Construir:** en pasos pequeños; cada paso compila, pasa los tests y se puede commitear.
3. **Probar:** tests automáticos de la lógica nueva + prueba manual de los criterios de aceptación. Como el usuario no revisa código, los tests son la red de seguridad principal: toda lógica de dominio nueva lleva tests.
4. **Verificar antes de mostrar:** recorrer uno por uno los criterios de aceptación de las historias de la iteración contra lo construido (con la app abierta, no de memoria) y anotar en el log cuáles se cumplen y cuáles no. Lo que falta se termina o se dice; una iteración no se da por hecha con un criterio sin cumplir.
5. **Revisar con el usuario:** mostrar lo construido funcionando (capturas, demo, criterios de aceptación cumplidos), nunca el código, con su prueba como `Q-n` de tipo prueba (un punto por cosa que tiene que comprobar); ajustar.
6. **Documentar:** actualizar el log de iteraciones, `estado.md` y los documentos afectados. Si algo cambió respecto del diseño o la arquitectura, actualizar ese documento y registrar la decisión.
7. **Cerrar la sesión:** hacer el cierre de sesión y, si la conversación ya es pesada, proponer un chat nuevo para la siguiente iteración (`SKILL.md` › Al cerrar cada sesión de un proyecto, que dice cuándo conviene). Si la iteración es larga, se corta también entre historias.

> **Con impeccable:** si la skill `impeccable` está instalada, activa su hook en el proyecto al empezar este hito (`/impeccable hooks on`) y pasa `polish` antes de mostrar al usuario cada iteración que cambió la interfaz. Ver `referencias/integraciones.md`.

## Reglas durante la construcción
- **Commits pequeños y descriptivos**, siguiendo la convención del hito 5.
- **Nada de funcionalidades fuera del plan** sin pasar por `02-definicion.md`: las ideas nuevas van a `trabajo.md` como `T-n` `nueva`, no al código.
- **Errores y ajustes que reporta el usuario:** la IA decide si se resuelven ahora o se anotan, con el criterio de `SKILL.md` › Reglas para la IA. Los que se anotan son un `T-n` `pendiente` con la iteración a la que corresponden.
- **La lógica de dominio va separada de la interfaz**, como define la arquitectura.
- **Los estilos salen del design system**; si falta algo, se agrega al sistema.
- **Deuda técnica consciente:** si se toma un atajo, se anota en `07-construccion.md` con su motivo.
- **Los requisitos de seguridad del nivel asignado se implementan desde el principio**, no al final.
- **Lo que abre el proyecto:** en cuanto haya algo para usar (un programa, una página, un bot), el script que lo abre lleva su `**Marca:**` en `docs/scripts.md` y, si es una app de escritorio, también el que la arma (`SKILL.md` › Los scripts). Se escribe una vez; así el usuario lo abre con **Ejecutar** desde la tarjeta.
- **Comentarios de la Revisión:** si hay `docs/revision/`, los `R-n` abiertos son comentarios del usuario sobre la app (con el archivo, la línea y una captura). Leelos al empezar y resolvelos o anotalos como dice `SKILL.md` › Los comentarios de la Revisión.

## Errores y cambios chicos
Un error o un ajuste que se resuelve en el momento (ver `SKILL.md` › Reglas para la IA) sigue una pista corta, sin pasar por los hitos:
1. **Qué pasa y qué tendría que pasar**, en una línea cada uno, y **qué no tiene que cambiar** (lo que funciona alrededor).
2. **Causa:** por qué pasa, encontrada antes de tocar nada.
3. **Arreglo**, lo más acotado posible.
4. **Prueba:** una prueba automática que falla sin el arreglo y pasa con él, además de las que ya había.

Queda en una línea en el log de la iteración (o como `T-n` `hecho`) con su resultado. Si el arreglo no es chico (toca la arquitectura, cambia una decisión o una pantalla), deja de ser pista corta: se anota y va a su iteración.

## Checklist de salida (del MVP)
- [ ] Todas las historias *Must* cumplen sus criterios de aceptación (verificados al cerrar cada iteración).
- [ ] Tests de la lógica central pasando.
- [ ] Documentación sincronizada con el código.
- [ ] Deuda técnica registrada.
- [ ] El usuario usó el MVP y lo considera funcional.

## Errores comunes
- Construir todas las pantallas primero y la lógica después (o al revés).
- Iteraciones largas sin mostrar nada.
- Documentación que queda en el hito 6 mientras el código evoluciona.
- Sumar funcionalidades "rápidas" que no estaban en el MVP.

## Plantilla — `docs/07-construccion.md`

~~~markdown
# Construcción

## Plan de iteraciones
| ID | Objetivo | Historias | Estado |
|---|---|---|---|
| I-1 | Esqueleto de punta a punta | H-1, … | pendiente |

## Log de iteraciones
### I-1 — [Objetivo corto] — AAAA-MM-DD a AAAA-MM-DD
- Objetivo:
- Leer antes: [`archivo.md` › Sección, …]
- Hecho:
- Criterios verificados: [H-n: cumple / falta …]
- Cambios respecto del diseño/arquitectura:
- Aprendizajes:

## Deuda técnica
| Qué | Por qué se aceptó | Cuándo resolverla |
|---|---|---|
~~~

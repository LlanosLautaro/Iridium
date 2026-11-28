# Documentación del proyecto

Esta carpeta documenta el desarrollo de la app hito por hito. Es documentación viva: se actualiza cuando cambia algo.

**Framework:** 2026-11-27 · Las pruebas sin ventanas no tocan lo que la app recuerda

## Por dónde empezar
1. `estado.md` — en qué hito está el proyecto y qué sigue.
2. `perfil-proyecto.md` — qué tipo de app es y qué nivel de protección necesita.
3. `02-definicion.md` — qué hace la app y qué no.
4. `05-arquitectura.md` — cómo está construida.

## Índice
| Documento | Contenido |
|---|---|
| `estado.md` | Hito actual, frentes, preguntas abiertas, próximo paso |
| `trabajo.md` | Las ideas y los pendientes de la IA (`T-n`) |
| `scripts.md` | Lo que el usuario ejecuta a mano: instalar, modo desarrollo, instaladores |
| `perfil-proyecto.md` | Alcance, plataforma, datos, nivel de protección |
| `decisiones.md` | Registro de decisiones con su porqué |
| `plan-desarrollo.md` | Adaptación del método de hitos para este proyecto: exploración y definición a fondo (D-004) |
| `00-idea.md` | La idea original |
| `01-exploracion.md` | Alternativas existentes y diferencial |
| `02-definicion.md` | Objetivo, funcionalidades, MVP, fuera de alcance, glosario |
| `03-investigacion.md` + `research/` | Conocimiento del dominio y recursos reutilizables |
| `04-ux.md` + `ux/` | Historias, flujos, wireframes, estados |
| `05-arquitectura.md` | Stack, componentes, datos, seguridad, pruebas |
| `06-ui.md` | Design system y pantallas |
| `07-construccion.md` | Iteraciones, deuda técnica |
| `08-calidad.md` | Verificación y defectos |
| `09-lanzamiento.md` | Build, distribución, versiones |
| `10-operacion.md` | Señales, mantenimiento, próxima versión |
| `cambios/` | Las propuestas grandes de la operación, una por archivo (`10-operacion.md` › Próxima versión) |
| `respuestas/` | Respuestas del usuario a las preguntas `Q-n`, con sus adjuntos |
| `revision/` | Comentarios del usuario sobre la interfaz (`R-n`) |
| `modulos/` | Frentes: secciones, plugins y productos hermanos con desarrollo propio (índice en `modulos/README.md`) |

## Códigos
Los estándar (`D`, `Q`, `T`, `R`, `H`, `F`, `W`, `S`, `I`; `P1`–`P5` es el nivel de protección) están en el framework. Los propios de este proyecto se declaran acá antes de usarlos.

| Prefijo | Qué es | Dónde se define |
|---|---|---|
| `C-n` | caso de uso del catálogo | `02-definicion.md` › Catálogo de casos de uso |
| `B-n` | capacidad que la base tiene que dar | `02-definicion.md` › Lo que la base tiene que dar |
| `A-n` | hallazgo de la auditoría del frente Orden | `modulos/orden/auditoria.md` |
| `OR-n` | pieza de la definición del frente Orden | `modulos/orden/definicion.md` |
| `PO-n` | pantalla del frente Orden antes de pasar a `W-n` (historia) | `modulos/orden/ux.md` |
| `PZ-n` | pieza compartida de la interfaz (frente Diseño) | `modulos/diseno/ux.md` › Las piezas |
| `DS-n` | historia, flujo o pantalla de la sección Diseño | `modulos/diseno/ux.md` › Parte 2 |
| `CO-n`, `AJ-n`, `IN-n`, `FR-n`, `ID-n`, `MA-n`, `AR-n`, `AB-n`, `PA-n`, `FS-n`, `PU-n` | historia o flujo de un frente: Compartir, Apariencia y ajustes, Inicio, Revisión de la app, Ideas, Mapa, Arranque, Abrir, Paridad, Frentes, Pulido | el `ux.md` de su frente |
| `OR-In`, `DI-In`, `CO-In`, `SK-In`, `AP-In`, `IN-In`, `R-In`, `ID-In`, `MA-In`, `AR-In`, `AB-In`, `PA-In`, `FS-In`, `PU-In`, `PL-In`, `TI-In` | iteración de un frente: Orden, Diseño, Compartir, Skills, Apariencia y ajustes, Inicio, Revisión de la app, Ideas, Mapa, Arranque, Abrir, Paridad, Frentes, Pulido, Plantillas, Tipos de proyecto | el `estado.md` de su frente |
| `Defecto n` | defecto encontrado en el hito 8 | `08-calidad.md` › Defectos |

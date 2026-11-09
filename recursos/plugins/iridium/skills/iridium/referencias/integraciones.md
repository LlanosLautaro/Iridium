# Integraciones con otras skills

Algunas skills externas hacen mejor una parte del trabajo de un hito. Esta guía dice cuándo usarlas y cómo encajan sin romper el flujo de hitos. **Todas son opcionales:** si la skill no está instalada, el hito se hace como describe su referencia.

**Regla de precedencia para todas:** esta guía manda en el proceso (portones, orden de hitos, `docs/`, `decisiones.md`, el usuario decide). La skill externa manda en su oficio. Si una skill externa pide algo que contradice un documento de `docs/` o una decisión vigente, se señala y se resuelve como cualquier contradicción (principio 2), no se aplica en silencio.

**Regla de una sola fuente:** cada dato vive en un solo documento. Si la skill externa necesita su propio archivo, ese archivo es la fuente de su tema y el documento de `docs/` lo enlaza (o al revés), pero nunca se copia el contenido en los dos.

---

## impeccable (diseño de interfaz)

Skill de oficio visual: criterio de diseño, detección de anti-patrones y 24 comandos (`/impeccable <comando>`). Solo aplica a proyectos con interfaz (web, webview, móvil, escritorio). Para CLIs o proyectos sin UI, no se usa. Sus guías principales ya están, en nuestras palabras, en `referencias/06-ui.md` › Repaso antes de mostrar una maqueta, que se hace aunque la skill no esté instalada.

**Sus archivos** (en la raíz del proyecto):
- `PRODUCT.md` — la verdad del producto que impeccable necesita: usuarios, tareas, propósito, restricciones, plataforma, tono. **Se arma a partir de `docs/`**, no con una entrevista nueva: resume `00-idea.md`, `02-definicion.md`, `perfil-proyecto.md` y `04-ux.md`, y enlaza a ellos. Si `02-definicion.md` cambia, se actualiza `PRODUCT.md`.
- `DESIGN.md` — el design system en el formato estándar (tokens en el encabezado YAML + secciones). **Es la fuente de los tokens y las reglas visuales.** `docs/06-ui.md` no los repite: guarda la dirección visual, las decisiones con su porqué, las pantallas y un enlace a `DESIGN.md`.
- `.impeccable/` — archivos de trabajo de la skill. No se editan a mano.

**Ajustes al aplicarla en este flujo:**
- Su paso `init` pregunta por el stack si no hay código: en este flujo el stack ya se decidió en el hito 5 (`05-arquitectura.md`); se le da esa respuesta en vez de reabrirlo.
- Las decisiones visuales importantes que salgan de impeccable (dirección, tipografías, paleta, modo) se registran en `decisiones.md` como cualquier otra.
- Para apps de herramienta, el modo que corresponde casi siempre es **Operate** (claridad y consistencia antes que expresión). Las landing pages del hito 9 son **Persuade**.
- Su hook de detección (revisa la UI después de cada edición) se activa por proyecto con `/impeccable hooks on`, al empezar el hito 7. No antes: en los hitos de definición no hay UI que revisar.
- El usuario no revisa código: los resultados de `critique` y `audit` se le presentan como hallazgos con capturas y consecuencias, no como diffs.

**Uso por hito:**

| Hito | Comando | Para qué | Dónde queda |
|---|---|---|---|
| 4 UX | `shape` (opcional) | Bajar una historia o flujo complejo a una propuesta de pantalla concreta, sin estilo visual. No reemplaza los flujos ni las historias del hito. | `04-ux.md` / `ux/` |
| 6 UI | `init` | Crear `PRODUCT.md` a partir de `docs/` (ver arriba). | `PRODUCT.md` |
| 6 UI | trabajo nuevo (pedir el diseño sin comando) | Dirección visual y design system: impeccable propone el "mundo visual"; el usuario elige. | `DESIGN.md` + dirección y decisiones en `06-ui.md` |
| 6 UI | `critique` | Revisión de las pantallas principales antes del portón del hito. | Hallazgos resueltos en las pantallas; lo pendiente, en `06-ui.md` |
| 7 Construcción | `hooks on` | Activar la detección automática de anti-patrones mientras se construye la UI. | — |
| 7 Construcción | `polish` (y según el caso `clarify`, `harden`, `onboard`, `adapt`) | Al cerrar cada iteración que sumó o cambió interfaz, antes de mostrársela al usuario. | Log de la iteración en `07-construccion.md` |
| 8 Calidad | `audit` | Accesibilidad, rendimiento, adaptación a pantallas. | Resultados y defectos en `08-calidad.md` |
| 10 Operación | `document` | Cuando la UI real se alejó de `DESIGN.md` (revisión periódica de la documentación). | `DESIGN.md` actualizado |

Los comandos de ajuste (`bolder`, `quieter`, `distill`, `layout`, `typeset`, `colorize`, `animate`, `delight`) se usan a pedido cuando el usuario dice que algo se ve mal, apagado o recargado, en cualquier hito desde el 6.

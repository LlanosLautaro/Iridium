# Módulos, plugins y productos hermanos

Cuando una parte del proyecto tiene vida propia (su dominio, sus flujos, su ritmo), se trata como un **módulo**: recorre un ciclo reducido de hitos, hereda todo lo que ya está decidido en el proyecto general y documenta solo lo que le es propio. Esto evita dos problemas opuestos: tratar algo grande como "una funcionalidad más" (y que crezca sin definición ni diseño), o rehacer todo el proceso desde cero (y que termine con su propia identidad, desconectada del resto).

## Tres tipos de módulo

| Tipo | Qué es | Ejemplos | Particularidad |
|---|---|---|---|
| **Sección** | Parte grande de la app, mismo código e interfaz | Un visor especializado, un editor, un panel de estadísticas | Comparte todo; su contrato con el núcleo es interno |
| **Plugin** | Extensión que se carga a través de un sistema de plugins | Un importador para un formato nuevo, una integración opcional | Se construye contra un contrato público y versionado (ver abajo) |
| **Producto hermano** | Otra app que comparte identidad y piezas | Versión CLI, web o móvil complementaria | Ciclo casi completo; puede vivir en otro repo |

## Cuándo algo es un módulo

Es un módulo si cumple al menos una de estas condiciones:
- Tiene un dominio propio que requiere investigación (formatos, APIs o reglas que el resto de la app no usa).
- Tiene flujos de UX propios, no solo una pantalla más dentro de un flujo existente.
- Avanza a otro ritmo que el resto del proyecto, o en paralelo con otro trabajo.
- Se puede activar, desactivar, instalar o distribuir por separado.

Si no cumple ninguna, es una funcionalidad: se gestiona con la tabla de rutas del hito 10 (actualizar definición y UX, construir, probar).

Ante la duda, pregunta al usuario. Convertir algo en módulo después no es grave: se crea su carpeta y se mueven ahí las partes de los documentos generales que le pertenecen.

## Qué se hereda y qué es propio

| Se hereda del proyecto general | Es propio del módulo |
|---|---|
| Perfil y nivel de protección: el módulo puede **subirlo**, nunca bajarlo | Propuesta: qué problema resuelve y cómo encaja |
| Glosario (el módulo puede agregar términos) | Alcance, MVP del módulo y fuera de alcance |
| Design system completo y principios de interacción | Investigación específica de su dominio |
| Arquitectura base, stack y convenciones | Flujos y pantallas propias |
| Decisiones vigentes | Diseño técnico interno y contrato con el núcleo |
| | Estado y plan de iteraciones propios |

**La regla central:** un módulo no contradice los documentos generales. Si necesita algo que no existe (un componente o token nuevo, una función del núcleo, un cambio en el modelo de datos, un nivel de protección más alto), el cambio se hace en el documento general correspondiente y se registra en `decisiones.md` con ámbito "general". Así se evita que cada módulo termine con sus propios botones, su propia forma de mostrar errores o su propia copia de una lógica que ya existe.

Los **componentes de dominio** nuevos que necesite un módulo (por ejemplo, un visor especializado) se agregan al design system general, no quedan locales: otro módulo podría necesitarlos y así mantienen coherencia visual.

## Ciclo reducido

Cada paso usa la referencia del hito equivalente como guía, con las preguntas ya respondidas en el proyecto general omitidas.

| Paso | Equivale a | Documento en `docs/modulos/<nombre>/` | Notas |
|---|---|---|---|
| 1. Propuesta | Hitos 0 y 1 | `propuesta.md` | Problema, por qué ahora, cómo encaja en el producto, alternativas (¿alcanza con una funcionalidad simple? ¿existe un plugin o librería?) |
| 2. Definición | Hito 2 | `definicion.md` | Alcance, MoSCoW, MVP del módulo, fuera de alcance, términos nuevos para el glosario. ¿Cambia el perfil? |
| 3. Investigación | Hito 3 | `investigacion.md` + `research/` del general | Condicional, mismo criterio que el hito 3. Las notas van a `docs/research/` general, porque el conocimiento de dominio puede servir a otros módulos |
| 4. UX | Hito 4 | `ux.md` | Flujos y wireframes del módulo; cómo se entra y se sale de él desde el resto de la app |
| 5. Diseño técnico | Hito 5 | `diseno-tecnico.md` | Estructura interna y contrato con el núcleo: qué usa, qué expone, qué datos comparte |
| 6. UI | Hito 6 | en `ux.md` o `diseno-tecnico.md` | Solo si hace falta algo nuevo; los componentes nuevos se agregan a `06-ui.md` general |
| 7–9. Construcción, calidad, lanzamiento | Hitos 7, 8, 9 | `estado.md` del módulo | Mismas reglas. Las pruebas incluyen que el módulo no rompa el resto de la app |

El portón de salida de cada paso es el mismo que el del hito equivalente, más un control: **¿este paso requirió cambios en los documentos generales? ¿Se aplicaron y registraron?**

**En Iridium, un módulo es un frente.** Su `estado.md` (`plantillas/modulo/estado.md`) lleva el Progreso de sus pasos, sus iteraciones (`OR-I1`, con el prefijo del frente declarado en `docs/README.md`) y su Próximo paso; el paso `en curso` es el que muestra el Mapa. No lleva pendientes ni preguntas: sus `T-n` y sus `Q-n` llevan `Frente: <nombre>` en `trabajo.md` y en el `estado.md` general. La tabla `## Módulos` del `estado.md` general dice cuál es el frente activo (`en curso`), cuáles esperan (`pendiente`) y cuáles están en operación (`hecho`). Al pasar un frente a `hecho`, toca una ronda de UX (`referencias/ronda-ux.md`).

## Plugins: el sistema y cada plugin

Son dos cosas distintas y se diseñan en momentos distintos.

**El sistema de plugins** es parte de la arquitectura del núcleo y se diseña en el hito 5 del proyecto general (sección "Puntos de extensión"). Define:
- **Qué puede hacer un plugin:** qué datos lee, qué puede modificar, qué partes de la interfaz puede extender.
- **Ciclo de vida:** descubrimiento, carga, activación, desactivación, desinstalación, y qué pasa si un plugin falla (no debe tumbar la app).
- **Permisos:** qué pide un plugin y cómo se lo concede el usuario.
- **Acceso al design system:** cómo usan los plugins los tokens y componentes para verse integrados.
- **Versionado del contrato:** cada cambio en la API de plugins puede romper plugins existentes. Usa versiones (por ejemplo, SemVer) y define una política de compatibilidad y de deprecación desde el principio.
- **Documentación para autores** de plugins, si no los vas a escribir solo vos.

**Cada plugin** es un módulo de tipo plugin: recorre el ciclo reducido y su diseño técnico se limita a lo que el contrato permite. Si un plugin necesita algo que el contrato no ofrece, el cambio es en el sistema de plugins (general), no un atajo dentro del plugin.

**Plugins de terceros cambian el perfil.** Si la app carga código que no escribió el usuario, entra en "ejecuta o abre contenido de terceros": exige como mínimo P2 y obliga a pensar en aislamiento (que un plugin no pueda leer o romper lo que no le corresponde), permisos explícitos y procedencia de los plugins. Si los plugins son solo propios, el riesgo es mucho menor, pero el contrato igual conviene versionarlo.

## Productos hermanos

- Recorren el ciclo casi completo; los hitos 0–1 se reducen a la propuesta porque el contexto ya existe.
- Heredan perfil (pudiendo subirlo), glosario, design system y decisiones relevantes.
- Si viven en otro repo, la forma más robusta de compartir es publicar las piezas comunes (tokens, componentes, lógica de dominio) como paquetes, y referenciar en sus docs los documentos generales del proyecto original con enlace.
- Necesitan su propio `perfil-proyecto.md` si su plataforma o exposición difiere (por ejemplo, una versión web pública de una app desktop personal).

## Estructura en el repo

```
docs/
├── estado.md            # incluye la tabla de módulos
├── decisiones.md        # único; cada decisión con su ámbito
├── …
└── modulos/
    ├── README.md        # índice de módulos (plantillas/modulo/README-modulos.md)
    └── <nombre>/
        ├── estado.md
        ├── propuesta.md
        ├── definicion.md
        ├── investigacion.md   # si aplica
        ├── ux.md
        └── diseno-tecnico.md
```

Las plantillas están en `plantillas/modulo/`. El registro de decisiones es único para todo el proyecto, con un campo de ámbito, para que una decisión de un módulo que afecta al núcleo no quede escondida en su carpeta.

## Errores comunes
- Construir un módulo como "una funcionalidad más" y descubrir tarde que necesitaba su propia definición.
- Componentes visuales locales al módulo que duplican o contradicen el design system.
- Un plugin que accede a internos del núcleo saltándose el contrato.
- Cambiar la API de plugins sin versión ni aviso.
- Subir el nivel de protección en un módulo y no reflejarlo en el perfil general.

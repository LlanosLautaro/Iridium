# Diseño técnico del módulo: Apariencia y ajustes

**Fecha:** 2026-10-30
> Respeta la arquitectura, el stack y las convenciones de `05-arquitectura.md`. Alcance: `definicion.md` (D-065); pantalla: `ux.md` › AJ-W1; maqueta: `docs/ui/vista-ajustes.html`; tema: D-066.

## Contrato con el núcleo
### Qué usa del núcleo
| Función / dato / servicio | Para qué |
|---|---|
| `config.json` (`infra/config.ts`) | Guardar los ajustes junto con lo demás de Iridium, con el mismo arreglo de «roto o faltante = valores de siempre» |
| La interfaz `Motor` (`motor/sdk.ts`) | Pasarle el tono a cada sesión y leer los estilos disponibles |
| `sinMensajes` del motor | Preguntarle a Claude Code los estilos sin gastar uso, como ya se hace con los modelos |
| `docs/ui/tokens.css` | Los dos temas: el de siempre en `:root` y Carbón en `:root[data-tema="carbon"]` (ya está) |

### Qué expone
| Función / evento / dato | Quién lo usa |
|---|---|
| Los ajustes como preferencias (`leerPreferencias` / `guardarPreferencias`, D-067) | La ventana de Ajustes |
| `estilosDeRespuesta()` por IPC | La sección IA |
| Los nombres en el estado del renderer (`nombreUsuario`, `nombreIa`) | La conversación (`Conversacion.tsx`: «Vos» e «IA») |
| La ventana de Ajustes como pieza del marco | El frente Compartir, que le suma secciones (carpeta de proyectos, actualizaciones) |

### Para plugins
- No aplica (Iridium no tiene plugins).

## Estructura interna
- **`renderer/marco/Ajustes.tsx`:** la ventana flotante (fondo oscurecido, foco atrapado adentro, `Esc` y clic afuera cierran) con la navegación a la izquierda y una sección por archivo (`ajustes/Perfil.tsx`, `ajustes/Ia.tsx`, `ajustes/Apariencia.tsx`). La lista de secciones es un arreglo: Compartir suma las suyas sin tocar las demás.
- **El ⚙ y `Ctrl+,`:** en la barra de íconos del marco, abajo; abren la ventana desde cualquier pantalla.
- **`main/app/ajustes.ts`:** lee y escribe los ajustes (valida con zod) y avisa al motor del tono nuevo.
- **Las miniaturas de los temas:** dos imágenes chicas armadas con `tools/muestras-tema.ts` y guardadas con la app (no se generan en vivo).

## Datos
`config.json` suma (todo opcional, con `.catch` como el resto):
| Campo | Tipo | De siempre |
|---|---|---|
| `tema` | `'iridium' \| 'carbon'` | `'iridium'` |
| `nombreUsuario` | texto, hasta 60 | vacío («Vos») |
| `nombreIa` | texto, hasta 40 | vacío («IA») |
| `tono` | texto, hasta 100 (el nombre del estilo de Claude Code) | vacío (el de Claude Code) |

Ya está en `05-arquitectura.md` › Modelo de datos (AP-I1).

## Procesos centrales
### Aplicar el tema sin parpadeo
1. Al abrir, el proceso principal lee `config.json` antes de crear la ventana (ya lo hace para la carpeta y el proyecto abierto).
2. Le pasa el tema a la página en la URL (`index.html?tema=carbon`); un script chico en `index.html`, antes de React, pone `data-tema` en `<html>`. Así la primera pintura ya sale con el tema.
3. El color de fondo de la ventana de Electron (`backgroundColor`) también sale del tema, para que no se vea un destello verde-negro al abrir.
4. Al elegir otro tema en Ajustes: se cambia `data-tema` en el momento y se guarda.

### El tono en las sesiones
1. Al abrir la sección IA, el motor pide la lista con `sinMensajes` e `initializationResult().available_output_styles`, con `settingSources: ['user']` para que aparezcan los de `~/.claude/output-styles/`. Se guarda en memoria hasta cerrar Iridium.
2. Cada sesión nueva o retomada recibe `settings: { outputStyle: tono }` en sus opciones (ajustes propios de esa sesión): no escribe en los ajustes de Claude Code de la PC, así VS Code y la terminal no cambian.
3. Al cambiar el tono con sesiones abiertas: se les aplica con `applyFlagSettings({ outputStyle })` para el mensaje siguiente. Si Claude Code no lo toma en una sesión ya empezada, la sección dice «Se nota desde la próxima conversación» (se confirma con `tools/probar-conversacion.ts`).
4. Vacío = no se pasa nada: rige el estilo que el usuario tenga en Claude Code.

### Los nombres
Se leen del estado del renderer; la conversación muestra `nombreUsuario || 'Vos'` y `nombreIa || 'IA'`, cortados con «…» si son largos. No se le dicen a la IA (Q-84: sin uso real por ahora).

## Seguridad
P2 sin cambios: nada sale de la PC. Los textos se validan con zod en el puente (largo máximo) y se muestran como texto, nunca como HTML. El tono solo acepta un nombre de la lista que dio Claude Code.

## Pruebas
- **Lógica:** Vitest de `config.ts` (valores rotos o faltantes vuelven a los de siempre) y de cómo se arman las opciones de la sesión con y sin tono.
- **Con la app abierta (Playwright, motor falso):** abrir con ⚙ y con `Ctrl+,`, cerrar con `Esc`; elegir Carbón cambia `data-tema` en el momento y sigue al reabrir; los nombres aparecen en la conversación; la ventana no pierde lo escrito en el chat de atrás.
- **Real, con poco uso:** `tools/probar-conversacion.ts` suma un paso que manda un mensaje con el tono «Explicativo» y confirma que la sesión lo informa.
- **Que no rompa:** las 43 pruebas con la app abierta corren también con `data-tema="carbon"` una vez, para ver que nada quedó ilegible (capturas).

## Cambios requeridos en el núcleo
| Cambio | Motivo | Decisión |
|---|---|---|
| `config.json` suma `tema`, `nombreUsuario`, `nombreIa` y `tono` | Guardar los ajustes | D-065 |
| El motor pasa `settings.outputStyle` a cada sesión | El tono | D-065 |
| `index.html` pone `data-tema` antes de React; la ventana toma su fondo del tema | Tema sin parpadeo | D-066 |

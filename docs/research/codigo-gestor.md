# Qué del código del gestor anterior sirve al Centro

**Fecha:** 2026-10-22 · **Versión revisada:** el gestor anterior 1.2.0 (commit `8c3ca06`) · Solo lectura: desde acá no se modifica el Gestor.

Responde la quinta pregunta del MVP (`02-definicion.md` › Preguntas abiertas para el hito 3; D-017).

## Cómo está hecho el Gestor
- Extensión de VS Code en **TypeScript**, con la interfaz en **React**, pruebas con **Vitest** (217 pruebas en 18 archivos, todas pasan hoy), Biome, pnpm y Node 24. Única dependencia de producción: `markdown-it` (MIT).
- Separado en capas, como pide la guía: reglas puras (`core/`), disco (`infra/`), casos de uso (`app/`), interfaz (`webview/`) y la parte que habla con VS Code (`extension/`).
- **Solo 4 archivos** (`src/extension/`) dependen de VS Code. Todo lo demás es TypeScript común que corre en Node o en una ventana web.
- Es código propio del usuario (sin licencia publicada, `UNLICENSED`): se puede copiar sin restricciones.

## Qué se lleva
| Pieza del Gestor | Qué hace | Para qué le sirve al Centro | Cómo |
|---|---|---|---|
| `core/guia.ts` | Lee `estado.md` con tolerancia: hito actual, próximo paso, nivel | Vista general (C-1) y mapa (C-13) | Tal cual, ampliado para la tabla de hitos, el portón y las iteraciones (D-019) |
| `core/visor/preguntas.ts`, `respuestas.ts` | Lee las `Q-n` con sus opciones; lee y arma las respuestas | Bandeja (C-21 a C-23) | Tal cual, sumando `Tipo:`, `frena` y las casillas (D-019) |
| `core/visor/codigos.ts`, `documentos.ts`, `lineas.ts` | Índice de códigos (D-n, Q-n…) y dónde nace cada uno; árbol de documentos; secciones | Abrir el documento o la sección de cada caja y los códigos como enlaces (C-14) | Tal cual |
| `core/visor/markdown.ts` | Markdown a HTML seguro, con casillas y códigos enlazados | Mostrar los documentos | Tal cual |
| `core/visor/scripts.ts` | Lee `scripts.md` | Fuera del MVP (lo sigue haciendo el Gestor, D-017); sirve después | Tal cual, cuando toque |
| `core/metadatos.ts`, `proyectos.ts`, `regenerables.ts` | Valida `.proyecto.json`; reglas de la lista de proyectos; carpetas que no cuentan | Lista de proyectos de la vista general (C-1) | Tal cual |
| `infra/` (raíz, documentos, escritura atómica, actividad, recorrido) | Lee la carpeta de proyectos, los `.md`, escribe respuestas sin dejar archivos a medias, última actividad | Lo mismo en el Centro | Tal cual |
| `app/` (casos de uso) | Orquesta lo anterior; recibe sus dependencias, así se prueba con carpetas temporales | Base de los casos del Centro | Adaptado: el Centro tiene otros casos |
| Las pruebas de todo lo anterior | Casos límite reales de los `docs/` | Que lo copiado siga andando | Se copian con el código |

## Qué no se lleva
- `extension/` (4 archivos): paneles de VS Code, vigilancia de archivos con la API de VS Code, abrir carpetas. El Centro hace eso a su manera.
- El aspecto de la interfaz: está hecho con los colores y los íconos de VS Code. El Centro tiene su propio design system (hito 6). De `webview/` se pueden tomar la lógica de los componentes (por ejemplo, cómo guarda lo que se está respondiendo) pero no su estilo.

## Qué condiciona en la tecnología (para el hito 5)
- **TypeScript + Node + React** permite llevarse unas 2.000 líneas probadas sin reescribirlas. El Agent SDK también existe para TypeScript, y todo lo probado en S-1 fue con esa versión.
- otras apps, del mismo usuario, ya son apps de escritorio en **TypeScript + Electron + React + Vite**, con instalador para Windows. La IA tiene esos patrones probados.
- Elegir otra tecnología (Python, Tauri con Rust, .NET) obligaría a reescribir los lectores del Gestor y a mantener dos versiones del mismo formato. Se decide en el hito 5, pero esto pesa a favor de TypeScript.
- **Riesgo:** dos copias del mismo lector (Gestor y Centro) pueden separarse si cambia el formato de la guía. Mientras convivan (D-017), un cambio de formato se aplica en los dos. Alternativa a evaluar en el hito 5: un paquete compartido, aunque suma trabajo para un Gestor que solo recibe mantenimiento (D-013).

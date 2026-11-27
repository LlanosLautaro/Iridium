# Definición del módulo: Plantillas

**Fecha:** 2026-11-27

## Objetivo del módulo
Que la IA de cualquier proyecto del usuario aplique, sin que él tenga que nombrarlo, lo que ya anduvo en Iridium para su tipo de app: primero, que las pruebas no le ocupen la pantalla; después, que una app instalada se ponga al día sola en todas sus PC. Cada solución es una **receta** del framework (las «piezas» de D-150; se llaman recetas porque «pieza» ya es del design system).

## Criterios de éxito
- En una app de Electron con pruebas de Playwright, mientras corren no aparece ninguna ventana ni consola, no se pierde el foco y las capturas salen igual que antes; con una variable se pueden mirar.
- En una página que se prueba con Playwright, las pruebas corren sin abrir el navegador a la vista.
- La IA encuentra la receta sola: al armar las pruebas de un proyecto nuevo y al retomar uno que ya las tiene.
- Los proyectos que ya tienen pruebas de Playwright ven «1 novedad del framework» y **Ponerse al día** la aplica (Q-325, D-209); los demás no ven nada.
- Una receta nueva se suma sin tocar las otras ni las referencias de los hitos.

## Funcionalidades
### Must (MVP del módulo)
- **La carpeta `recetas/` del framework**, con un formato fijo por receta: para qué tipos de app vale (el tipo sale de la marca del script que abre el proyecto en `scripts.md`, D-148), cuándo se aplica, la receta por tipo con los fragmentos de código de Iridium y cómo se prueba (con una `Q-n` de prueba para el usuario).
- **Receta «Pruebas sin ventanas»** (T-81):
  - *Escritorio, Electron:* una variable propia de la app que prenden solo las pruebas (como `IRIDIUM_OCULTA`, D-072): la ventana fuera de la pantalla, sin botón en la barra de tareas y sin foco; sin el cálculo de ventanas tapadas ni la pausa en segundo plano, para que se siga dibujando; las consolas que abre la app, escondidas; sin sonidos (T-124); la configuración de Playwright la prende y con `=0` se miran.
  - *Página:* Playwright sin ventana (lo que ya hace si no se le pide otra cosa); no se agrega `headed`.
  - *Consola:* no abre ventanas; no le toca.
- **Receta «La actualización sola»:** la guía de D-207 pasa a `recetas/` con el mismo formato, sin cambiar lo que dice.
- **`SKILL.md`** cita las recetas en una sección corta y suma la regla «las pruebas no ocupan la pantalla del usuario»; `referencias/07-construccion.md` y `08-calidad.md` la nombran donde se arman las pruebas.
- **La novedad** de las pruebas sin ventanas, solo para los proyectos con Playwright. Como su configuración puede ser `playwright.config.ts`, `.js` o `.mjs`, en la raíz o en `app/` o `tests/`, `Solo si:` acepta varias rutas separadas por ` · ` (le toca si tiene alguna): cambia el lector de novedades, el control y sus pruebas en el mismo cambio (D-086).
- **Probarla fuera de Iridium** antes de escribirla: una app de Electron de muestra en una carpeta descartable, con pruebas que comprueban solas que la ventana no se ve, no tiene foco y la captura no sale en blanco.

### Should
- Una prueba del framework que revise que cada receta tiene sus secciones.
- La receta cuenta qué hacer si la app tiene pruebas que no son de Playwright (lo mismo, con la variable puesta por su herramienta).

### Could
- Archivos de código listos para copiar al lado de la receta, si un fragmento crece más que unas líneas.
- Otros motores de escritorio (Tauri, .NET) cuando aparezca un proyecto que los use.

### Won't (por ahora)
- Mostrar las recetas en Iridium (Skills › Framework) — las lee la IA; si después hace falta verlas, va con su lector.
- Plantillas de proyecto enteras por tipo de app — es T-93, que todavía no aprobaste.
- Aplicar la receta en tus otras apps desde acá — los otros proyectos no se tocan sin tu pedido; llega como novedad y la aplicás con **Ponerse al día**.

## Fuera de alcance
- Que Iridium esconda solo las ventanas de las pruebas de otra app, desde afuera: Electron no lo permite (D-150).
- Cambiar cómo se prueba Iridium.

## Impacto en el perfil
Ninguno: son instrucciones y fragmentos de código para la IA, sin datos nuevos ni nada expuesto. Sigue P2.

## Términos nuevos (se agregan al glosario general)
| Término | Significado |
|---|---|
| Receta | Una solución probada en Iridium, en el framework (`recetas/`), que la IA aplica en cualquier proyecto de ese tipo de app |

## Preguntas abiertas para investigar
- ¿La ventana fuera de la pantalla se sigue dibujando igual con la versión de Electron que traiga una app nueva? (la prueba de muestra lo responde)

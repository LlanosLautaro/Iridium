# S-9 — Pruebas sin ventanas en una app de Electron que no es Iridium

Una app de muestra (`main.mjs`) con la receta de D-072 prendida por su propia variable (`MUESTRA_OCULTA=1`; `MUESTRA_PARCIAL=1`, solo fuera de la pantalla) y una consola que abre la app. `probar.mjs` la abre con Playwright tres veces (sin receta, a medias, completa) con el Electron y el Playwright de este repo y mira, con `ventanas.ps1`, qué ventanas se ven y cuál está adelante.

Se corre copiando la carpeta a una temporal: `node probar.mjs "<carpeta de este repo>"` (con `ESPERA=10000`, espera 10 s antes de mirar). Resultado en `docs/modulos/plantillas/investigacion.md`.

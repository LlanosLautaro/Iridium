# S-3 — Revisión de la app: extensión en Edge y en Electron (descartable)

Responde la investigación del módulo Revisión (`docs/modulos/revision/investigacion.md`). Conclusiones ahí y en `docs/research/revision-extension.md`.

- `app/`: app de prueba con React 19 y Vite (un botón dentro de `Tarjeta.jsx`).
- `extension/`: extensión MV3 de prueba: un script en el mundo de la página (lee la fibra de React), otro en el mundo aislado (arma el comentario) y el service worker (captura y envío a `127.0.0.1`).
- `receptor.mjs`: programa local de prueba en `127.0.0.1:47321`; resuelve la pila de React a archivo y línea con el mapa de fuentes que sirve Vite.
- `electron-main.cjs`: Electron 44 carga la extensión con `session.extensions.loadExtension` y prueba `capturePage` recortado.
- `correr.mjs`: corre todo, primero en Electron y después en Edge (Playwright, canal `msedge`). `node spikes/S-3-revision/correr.mjs` desde la raíz del repo.
- `salida.txt`: la corrida.

Electron 44.9.1, Vite 7.3.7, React 19.3.0, Edge 156, 2026-10-28.

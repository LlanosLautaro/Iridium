# S-2 — Frontera con el motor (descartable)

Responde lo que el hito 4 dejó para el hito 5 (`docs/04-ux.md` › Para el hito 5). Conclusiones en `docs/05-arquitectura.md` › Spikes.

- `spike.mjs`: modo *bypass*, instrucción propia, sin `AskUserQuestion`, Detener y retomar, contexto y uso sin mandar mensajes, la misma conversación abierta dos veces. Correr con `SANDBOX=<carpeta fuera del repo> node spike.mjs`.
- `electron-main.mjs`: el SDK dentro del proceso principal de Electron 44.
- `salida-1.txt` (primera corrida, con la carpeta de prueba dentro del repo), `salida-2.txt`, `salida-electron.txt`.

Agent SDK 0.3.309, modelo haiku, 2026-10-23.

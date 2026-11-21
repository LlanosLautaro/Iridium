# S-5 — Paridad: comandos, fotos y archivos en el motor (descartable)

Responde qué deja hacer el motor para el frente Paridad. Conclusiones en `docs/research/comandos-y-adjuntos-del-motor.md` y `docs/modulos/paridad/investigacion.md`.

- `spike.mjs comandos`: la lista de comandos sin mandar mensajes (`salida-comandos.txt`).
- `spike.mjs foto`: una imagen dentro del mensaje y cómo queda en el historial (`salida-foto.txt`).
- `spike.mjs barra "/model,/usage"`: comandos mandados como texto (`salida-barra.txt`, `salida-context.txt`).

Correr con `SANDBOX=<carpeta fuera del repo> PLUGIN=<recursos/plugins/iridium> node spike.mjs <qué>`; desde Git Bash, con `MSYS_NO_PATHCONV=1`. Usa el SDK del repo (0.3.309), modelo haiku, 2026-11-21.

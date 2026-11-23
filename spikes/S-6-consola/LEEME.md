# S-6 — La consola nativa dentro de Iridium (descartable)

T-116, D-184 (5): ¿`node-pty` 1.1.0 (la consola de VS Code) carga y corre en Electron 44, suelta, armada con los fusibles de Iridium, instalada con NSIS por usuario y actualizada encima? Conclusiones en `docs/05-arquitectura.md` › Spikes y `docs/cambios/consolas.md`.

- `main.cjs`: abre PowerShell en una consola de verdad, le escribe, lee la respuesta con colores, cambia el tamaño, deja un `ping -t` corriendo, cierra y mira que no quede nada. `S6_DLL=1`: la consola que trae node-pty (conpty.dll); `S6_ARBOL=1`: cierra con `taskkill /T` en vez de `kill()`.
- `electron-builder.yml`: lo del de Iridium que importa (asar, fusibles, NSIS por usuario, `store-asar`) más `asarUnpack` de node-pty y `npmRebuild: false`.
- Correr: `npm install`; suelta, `S6_SALIDA=… ../../node_modules/electron/dist/electron.exe .`; armada, `../../node_modules/.bin/electron-builder --win --config electron-builder.yml`, `release/S6-Setup-1.0.0.exe /S` y el `.exe` de `%LOCALAPPDATA%\Programs\s-6-consola`.
- `salida-*.json`: suelta (las dos consolas), instalada (las dos y con `taskkill`) y actualizada a 1.0.1.

Resultado (2026-11-23): todo anda. Sin `npmRebuild: false` el armador intenta compilarla y falla. En la app armada, `kill()` de la consola de Windows lanza un `fork` que el fusible `runAsNode` no deja (error en el registro, aunque el ping se cierra igual); con `taskkill /T` el cierre es limpio. La conpty.dll tarda 4,6 s en la primera respuesta contra 1,3 s de la de Windows.

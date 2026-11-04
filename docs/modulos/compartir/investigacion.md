# Investigación del módulo: Compartir

**Fecha:** 2026-10-31

## Iniciar sesión
- El Claude Code que trae Iridium (2.1.309, del Agent SDK 0.3.309) tiene `claude auth login` (con `--claudeai`, la suscripción, que es lo predeterminado), `claude auth logout` y `claude auth status --json`. Probado hoy: `status` devuelve `loggedIn`, `authMethod: claude.ai` y `subscriptionType`.
- `login` abre el navegador en la página de Claude y espera la vuelta: es lo mismo que hace la extensión de VS Code, y la sesión queda en `~/.claude`, compartida con VS Code y con cualquier Claude Code de la PC.
- Sin probar: si `login` lanzado sin consola (desde el proceso principal de Iridium) abre el navegador y termina solo. Probarlo exige cerrar la sesión, así que va como prueba del usuario en la iteración; si necesita una consola, Iridium la abre visible (como hace Scripts).
- Iridium ya sabe cuándo no hay sesión (`estadoDeCuenta`, F-5); después del login vuelve a verificar con `auth status`.

## Actualización
- **Hoy:** `pnpm actualizar` arma con Iridium abierto, pero después lo **cierra** (con aviso si hay sesiones trabajando) para poner la versión nueva y lo reabre (D-036). Lo que falta es esperar a que el usuario cierre.
- **Actualización automática de Electron (`electron-updater`):** solo funciona con el instalador NSIS, no con la carpeta que usa Iridium (D-036). Armar el instalador comprime ~670 MB: varios minutos más por versión (por eso D-036 lo descartó).
- **Desde un GitHub privado:** `electron-updater` lo permite con una clave de GitHub en la PC (`GH_TOKEN`); la documentación lo marca como «solo para casos muy especiales». La clave no puede ir en el instalador. Cada versión sube ~250 MB comprimidos a GitHub Releases.
- **Local:** armar en una carpeta aparte (`release/nueva`) mientras Iridium sigue abierto y, al cerrar, que un ayudante pequeño espere a que Iridium suelte sus archivos, cambie las carpetas y (con Reiniciar ahora) lo vuelva a abrir. Reusa lo que ya hace `tools/actualizar.ps1` y no depende de internet.
- Elegida la local (Q-91: A, D-070).

## GitHub
- No hay `gh` instalado, pero git ya tiene guardada la cuenta del usuario: la IA sube con `git push` sin pedir nada. El repo lo creó el usuario (Q-92).
- Ramas: hoy se trabaja en `master`. Pasa a llamarse `dev`, y `main` se mueve a cada versión armada.

## Fuentes
- [electron-builder › Auto Update](https://www.electron.build/docs/features/auto-update) — NSIS como destino actualizable, proveedor privado de GitHub con `GH_TOKEN`.
- [electron-builder #1393](https://github.com/electron-userland/electron-builder/issues/1393) — la clave en la PC de quien usa la app.

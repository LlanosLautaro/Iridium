# Instrucciones para la IA

Este proyecto se trabaja desde Iridium con su framework (la skill `iridium`): el método, los formatos y el cierre de cada sesión están ahí. Toda la documentación está en `docs/`. Desde OR-I1 el framework vive en este repo (`recursos/plugins/iridium/skills/iridium/`) y es parte del producto.

## Al empezar cada sesión
1. Lee `docs/estado.md` y solo lo que indique su **Próximo paso**.
2. Antes de tocar código, lee `docs/05-arquitectura.md` y las decisiones vigentes en `docs/decisiones.md`.
3. Si vas a trabajar en un frente, lee también `docs/modulos/<nombre>/estado.md` y su diseño técnico.
4. Si vas a trabajar en un área con conocimiento de dominio, revisa `docs/research/`.

## Reglas propias de este proyecto
- Los estilos salen del design system: los tokens de `docs/diseno/tokens.css` (el negro, único tema, D-104) y las piezas de `docs/diseno/piezas.css`, que la app tiene en `src/renderer/estilos/piezas.css`; la base, en `src/renderer/estilos/base.css`. El control de estilos (`tests/estilos.test.ts`) marca un color escrito o una pieza rehecha en una sección.
- La lógica de dominio va separada de la interfaz, como define la arquitectura.
- El framework (`recursos/plugins/iridium`) se cambia junto con lo que Iridium lee y su control (D-086, D-092): un formato nuevo o distinto va en el mismo cambio que el lector, el control y sus pruebas.
- Un error de formato que se repite se arregla en el framework y en el control, nunca con un parche en un proyecto.
- Al cerrar un frente, subí el número del medio del `version` del `package.json` (1.0.0 → 1.1.0) en el mismo commit; el primero, solo con el ok del usuario (D-182).
- Los otros proyectos del usuario no se modifican desde acá sin que lo pida.
- El repo no nombra los otros proyectos del usuario ni su carpeta de proyectos (D-082): los proyectos que Iridium muestra son datos de quien lo usa, no parte del producto. Las pruebas y muestras usan nombres neutros (Alfa, Beta, Gamma…).

## Proyecto
- **Nombre:** Iridium (D-033); la carpeta se sigue llamando «Centro de Desarrollo».
- **Qué es:** una plataforma de desarrollo personal donde el usuario dirige con sus ideas y la IA desarrolla y lo orienta: proyectos, plan, diseño, preguntas pendientes y el puente PC–celular en un solo lugar.
- **Stack:** Electron + TypeScript + React (D-028; detalle en `docs/05-arquitectura.md`).
- **Scripts del usuario:** `docs/scripts.md`.
- **GitHub:** `LlanosLautaro/Iridium`, privado (D-070); empezó de nuevo con un solo commit el 2026-11-04 (D-084; el historial viejo está en `Respaldo de Iridium`, fuera de la carpeta de proyectos). Se trabaja en `dev` y se sube (`git push`) después de cada commit; `main` es lo que está en la app de uso diario. Las versiones para compartir se publican ahí con `pnpm publicar` (D-085).
- **Cómo correr los tests:** `pnpm test` (Vitest: reglas, casos de uso y disco; `pnpm cobertura`, lo mismo midiendo la cobertura); `pnpm e2e` (arma y abre la app con el motor falso, Playwright); `pnpm typecheck` y `pnpm lint`.
- **Herramientas de la IA y variables para probar:** en `docs/herramientas-ia.md`; leelo antes de usar algo de `tools/` o de probar con variables (`IRIDIUM_…`).

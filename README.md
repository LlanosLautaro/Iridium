# Iridium

**Creado:** 2026-10-21

Plataforma personal de desarrollo humano + IA, pensada a largo plazo: yo dirijo con la idea y la IA es quien desarrolla y me orienta. Junta en un solo lugar los proyectos de la carpeta de proyectos, el plan de cada uno (la guía de hitos llevada a algo visual), las preguntas pendientes con formato único, la conversación con Claude Code, los comentarios sobre la app en desarrollo (Revisión) y las skills. Se llama Iridium (D-033); la carpeta conserva el nombre «Centro de Desarrollo».

## Estado
En uso diario. Construcción (hito 7) y pruebas y calidad (hito 8) completas; ahora, el lanzamiento (hito 9). El detalle, siempre en `docs/estado.md`.

## Cómo usarlo
Todo lo que se ejecuta a mano está en `docs/scripts.md`. Lo principal:
- **Abrir Iridium:** `release/win-unpacked/Iridium.exe` (o el acceso directo del escritorio, `pnpm acceso-directo`).
- **Armar la última versión:** `pnpm actualizar`, o **Armar** abajo en Iridium cuando hay cambios sin armar. Con Iridium abierto, la versión nueva entra al cerrarlo o con **Reiniciar ahora**.
- **Modo desarrollo:** `pnpm dev`.

Necesita Windows 11, Node y pnpm (`pnpm install` la primera vez) y una sesión de Claude Code con la suscripción: si no la hay, Iridium la pide en Ajustes.

## Cómo está hecho
Electron + TypeScript + React (D-028). La IA es Claude Code, a través de su Agent SDK y con la suscripción (D-007). La arquitectura está en `docs/05-arquitectura.md`; el design system, en `DESIGN.md` y `docs/06-ui.md`; las decisiones con su porqué, en `docs/decisiones.md`.

## Desarrollo
- Se trabaja en `dev` y se sube después de cada commit; `main` es lo que está armado en la app de uso diario (D-070).
- Pruebas: `pnpm test` (Vitest), `pnpm e2e` (Playwright con la app abierta y un motor de IA falso), `pnpm typecheck` y `pnpm lint`.
- La documentación sigue la guía `hitos-desarrollo-app`; el índice está en `docs/README.md`.

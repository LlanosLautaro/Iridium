# Propuesta del módulo: Apariencia y ajustes

**Fecha:** 2026-10-30
**Tipo:** sección

## Qué problema resuelve
Iridium tiene una sola apariencia (oscura, verde, con la letra Chakra Petch; D-029, D-032) y ninguna pantalla de configuración: lo poco que se puede elegir está repartido (el modelo y el esfuerzo de cada proyecto en el chat, el ancho del texto en Docs) y lo demás está fijo en el código, como la carpeta de proyectos. El usuario pidió (2026-10-30, `07-construccion.md` › Ideas nuevas):
- **Temas:** probar uno mucho más sobrio, como macOS, Claude Code Desktop u Obsidian.
- **Ajustes y perfil:** una pantalla de configuración y opciones de perfil.

## Por qué ahora
Es uno de los dos frentes activos (D-063) y casi no toca el núcleo. Los temas ya están preparados: todos los colores, letras, esquinas y espacios salen de un solo archivo de tokens (`docs/ui/tokens.css`), así que un tema nuevo es otro juego de esos valores, no rehacer pantallas. Y la pantalla de Ajustes la necesita después el frente Compartir (elegir la carpeta de proyectos, las actualizaciones).

## Cómo encaja en el producto
- **Temas:** cambian `06-ui.md` y `DESIGN.md` (de «un solo tema» a varios), con una decisión que reemplaza esa parte de D-029. El tema actual queda como está y es el de siempre.
- **Ajustes:** el ícono ⚙ que el wireframe del inicio ya tenía (`04-ux.md` › W-1) y nunca se construyó. Reúne lo que hoy está suelto y lo nuevo.
- **Perfil:** todavía no está claro qué es (ver Q-84); Iridium no tiene cuentas: usa la sesión de Claude Code de la PC.

## Por qué es un módulo y no una funcionalidad
- [ ] Dominio propio que requiere investigación (solo un poco: cómo se ven las apps de referencia).
- [x] Flujos de UX propios: una pantalla nueva y elegir y ver un tema.
- [x] Ritmo de avance propio: frente activo (D-063).
- [ ] Se activa, instala o distribuye por separado.

## Alternativas
- **Solo un segundo tema, sin pantalla de ajustes:** un botón para cambiarlo. Más chico, pero la configuración sigue repartida y Compartir la va a necesitar igual.
- **Temas que el usuario edita a mano** (elegir cada color): mucho más trabajo y más fácil que algo quede ilegible; para una sola persona alcanza con temas armados y probados.
- **Seguir a Windows (claro u oscuro):** D-029 lo descartó; con un tema claro se podría sumar después.

## Propuesta de alcance (para la definición)
1. **Ajustes:** la pantalla ⚙ con lo que hoy está suelto (modelo y esfuerzo por defecto, ancho del texto en Docs) y el tema.
2. **Un tema sobrio**, oscuro: grises neutros, sin el verde brillante como color principal, letra del sistema (Segoe UI) en lugar de Chakra Petch, menos bordes. Antes de construirlo, dos o tres muestras sobre la vista del proyecto para elegir con capturas.
3. **Perfil**, según lo que diga el usuario en Q-84.

Después: un tema claro, si hace falta; la carpeta de proyectos y las actualizaciones las suma Compartir a esta misma pantalla.

## Decisión
Seguir, si el usuario la aprueba (`estado.md` del módulo › Q-84).

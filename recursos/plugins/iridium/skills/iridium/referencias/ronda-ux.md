# Ronda de UX

En operación, una app crece a parches: cada pedido chico suma un botón, un aviso o una pantalla, y la interfaz pierde su forma sin que nadie lo decida. La ronda de UX es una revisión de toda la interfaz para que eso no pase.

## Cuándo toca
- Cuando un frente pasa a `hecho`.
- Cuando se juntan cinco comentarios de la Revisión (`R-n`) anotados para la ronda.
- Cuando el usuario la pide.

Cuando toca, anotala como `T-n` `pendiente` y hacela antes de la próxima función nueva.

## Cómo se hace
1. **Capturas de todas las pantallas** con datos reales o de muestra (si el proyecto tiene una herramienta de capturas, con ella), en los temas que tenga la app.
2. **Contra `04-ux.md`:** cada pantalla, ¿es como dice el documento? Lo que la app hace y el documento no dice, o al revés, es un hallazgo.
3. **Contra los principios de la app** (`04-ux.md` y `06-ui.md`): un solo lugar para cada cosa, una jerarquía clara, el color solo para lo que significa, los mismos nombres para lo mismo. Con `impeccable`, `critique` y `audit` (`referencias/integraciones.md`).
4. **Los `R-n` juntados**, leídos juntos: ¿hay un patrón detrás de varios comentarios chicos?
5. **Hallazgos:** cada uno es un `T-n` (`pendiente` si es claro; `nueva` si hay que decidir), con `Origen:` la ronda. Si cambian la arquitectura de información, son un frente o una propuesta (`referencias/10-operacion.md`), no parches.
6. **Registro:** `10-operacion.md` › Rondas de UX, una fila por ronda (fecha, qué la disparó, sus `T-n`). Si la ronda corrige `04-ux.md`, se corrige el documento y se registra.
7. Lo que cambia la experiencia del usuario se le muestra con capturas en una `Q-n`.

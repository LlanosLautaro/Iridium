# UX del módulo: Arranque

**Fecha:** 2026-11-18
**Estado:** aprobada en Q-207 con el aviso al volver (AR-4, D-147)
> Usa los principios de interacción y el design system generales (`04-ux.md`, `06-ui.md`). Alcance: `definicion.md` (D-146).

## Puntos de entrada y salida
- **Prenderlo:** Ajustes › IA › «Abrir el período de Claude» (AJ-W1). Es un ajuste más de la IA, junto a «Al abrir un proyecto».
- **Ver lo que hizo:** un aviso al volver a la PC (AR-4), la pestaña del proyecto que arrancó, arriba (W-4), y el detalle del uso, abajo (tocar «5 h · Semana»). No hay una pantalla propia.
- **La Bandeja** de la definición: desde D-111 no hay una Bandeja de todos, solo la de cada proyecto. Lo que la definición ponía en «la Bandeja» va donde ya se mira lo que hizo una sesión (su pestaña) y lo que pasa con el período (el detalle del uso).

## Historias de usuario
### AR-1 — Prender el arranque
Como usuario quiero que Iridium abra el período de Claude mientras no estoy, para que se renueve en un momento útil del día.
- [ ] En Ajustes › IA está «Abrir el período de Claude», apagado al principio; lo prendo y queda prendido al cerrar y abrir Iridium.
- [ ] Elijo la hora del primer arranque (por defecto, las 3:00); apagado, la hora se ve en gris y no se puede tocar.
- [ ] La explicación de abajo dice qué hace y qué no, sin abrir nada más.

### AR-2 — Encontrar a la mañana lo que hizo
Como usuario quiero ver, al sentarme, qué proyecto se trabajó de noche y qué dejó.
- [ ] El proyecto arrancado tiene su pestaña arriba, con ✓ (terminó sin ver) o con su cuenta de la Bandeja si dejó preguntas, como cualquier sesión.
- [ ] Al abrirla, debajo del título de la conversación (donde dice cuándo fue y si se empezó en VS Code, D-108): «Hoy · la empezó Iridium a las 3:02 para abrir el período». El primer mensaje es «Continúa con el proyecto.», como si lo hubiera tocado yo.
- [ ] En el detalle del uso, debajo de la ventana de 5 horas: «Último arranque: Alfa, hoy a las 3:02 · Abrir».

### AR-3 — Saber por qué no arrancó
Como usuario quiero saber si no hizo nada y por qué, sin buscar.
- [ ] En el detalle del uso, la misma línea dice lo último que pasó: «A las 3:00 no había respuestas tuyas esperando», «A las 3:00 el período ya estaba abierto», «A las 8:05 no arrancó: la semana pasó el 90 %».
- [ ] Si arrancó y la sesión falló (sin red, sesión de Claude vencida), la pestaña queda con ✕ y su error, como cualquier sesión; no lo vuelve a intentar hasta el próximo momento.

### AR-4 — El aviso al volver
Como usuario quiero que, al sentarme a la mañana, Iridium me diga lo que hizo mientras no estaba, sin tener que ir a buscarlo.
- [ ] Iridium está abierta toda la noche (si no, no arranca nada), así que «al abrir Iridium» es **al volver a la PC**: la primera vez que la ventana de Iridium toma el foco o se mueve el mouse sobre ella después de uno o más arranques, aparece el aviso.
- [ ] Dice qué arrancó y cuándo, uno por renglón: «Mientras no estabas: Alfa a las 3:02 (dejó 2 preguntas) · Beta a las 8:07 (terminó)», y lo que no pudo («A las 13:10 no arrancó: la semana pasó el 90 %»).
- [ ] Cada proyecto se abre desde su renglón; **Listo** lo cierra. A diferencia de los otros avisos (W-4), no se va solo: es lo primero que se ve al volver.
- [ ] Sale una sola vez por tanda: los arranques que ya mostró no vuelven a aparecer. Sin arranques desde la última vez, no hay aviso.

## Flujos
```
Ajustes › IA › prender  →  Iridium espera el próximo momento
                            (la hora elegida, o 5 min después de que venza el período)
  momento ─┬─ período abierto        → no hace nada · lo anota en el detalle del uso
           ├─ semana > 90 %          → no hace nada · lo anota
           ├─ nada listo             → no hace nada · lo anota
           └─ hay trabajo listo      → conversación nueva en ese proyecto
                                        → «Continúa con el proyecto.»
                                        → la pestaña arriba (● trabajando → ✓ o ✕)
                                        → el detalle del uso: «Último arranque: …»
PC suspendida a esa hora  →  al despertar, el mismo momento con las mismas reglas
El usuario vuelve a la PC   →  el aviso con lo que hizo desde la última vez (AR-4) → Abrir un proyecto · Listo
```

## Pantallas
### Ajustes › IA, el ajuste nuevo
- Maqueta: `diseno/pantallas/ajustes.html` (la sección IA, al final).

```
 Abrir el período de Claude      (●) Prendido
 Mientras no estás, con          A las [03:00] y al vencer cada período
 trabajo listo                   Sigue el proyecto que espera hace más con tus
                                 respuestas. No arranca si la semana pasó el
                                 90 %. Necesita Iridium abierta.
```
- Se guarda solo, como los demás ajustes. Error al guardar: el aviso de siempre de la ventana (`apariencia/ux.md` › Flujos).

### El detalle del uso, con el arranque
```
┌ Uso de la suscripción ─────────────────────┐
│ 5 h   34 %   Se libera hoy a las 8:02.     │
│ Último arranque: Alfa, hoy a las 3:02 Abrir│
│                                            │
│ Semana 61 %  Se libera el lunes a las 9:00.│
│ Vas usando unos 9 % por día…               │
└────────────────────────────────────────────┘
```
- La línea está solo con el arranque prendido. **Abrir** lleva a esa conversación.
- Sin arranques todavía: «Arranque prendido: el próximo, hoy a las 3:00».
- Los arranques de la semana (Should de la definición): tocar la línea los despliega, uno por renglón, el más nuevo arriba.

### El aviso al volver (AR-4)
```
                                  ┌ Mientras no estabas ────────────────────┐
                                  │ Alfa   3:02   dejó 2 preguntas   Abrir  │
                                  │ Beta   8:07   terminó            Abrir  │
                                  │ 13:10 no arrancó: la semana pasó el 90 %│
                                  │                                  [Listo]│
                                  └─────────────────────────────────────────┘
```
- Es el aviso de siempre (W-4, abajo a la derecha), con un renglón por arranque y sin irse solo. Con más de cuatro, los cuatro últimos y «y 2 más», que abre el detalle del uso.
- Si el proyecto dejó una pregunta que frena, su renglón lleva la cuenta en ámbar, como la pestaña.

### La conversación arrancada
```
 Continúa con el proyecto
 Hoy · la empezó Iridium a las 3:02 para abrir el período
 ─────────────────────────────────────────────────────────
 Vos   Continúa con el proyecto.
 IA    …
```
- Va en la línea de debajo del título, la misma que dice «empezada en VS Code» (D-108, sin ruido): no se manda al motor.

## Estados y extremos
- **Iridium se abre después de la hora:** el momento ya pasó; no lo hace tarde (solo la suspensión cuenta como «estaba prendida»). El próximo es el de 5 minutos después de que venza el período.
- **El usuario está trabajando en el proyecto elegido:** se salta ese y va el siguiente que espera hace más.
- **Varios proyectos listos:** uno solo por momento; los demás, en los momentos siguientes.
- **El período lo abre el usuario antes del momento:** no hace nada (el período ya está abierto).
- **Uso sin leer** («Uso —», sin sesión de Claude): no arranca; la línea dice «No arrancó: no se pudo leer el uso».

## Piezas de UI nuevas
Ninguna: el interruptor, el campo, el aviso (W-4) y la línea de debajo del título de la conversación ya existen. El aviso suma solo que no se vaya solo y sus renglones (filas). La hora usa el campo de siempre con `type="time"`.

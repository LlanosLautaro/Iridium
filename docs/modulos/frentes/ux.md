# UX del módulo: Frentes (parte 1, el motor)

**Fecha:** 2026-11-22
**Estado:** escrita por la IA con lo aprobado en la definición (D-176); las decisiones chicas, en D-177. Se ve funcionando en la prueba de FS-I1 y se ajusta ahí.
> Usa los principios de interacción y el design system generales (`04-ux.md`, `06-ui.md`). Alcance: `definicion.md` › Must, parte 1. El tablero (parte 2) tiene su propia UX con maquetas, más adelante.

## Puntos de entrada y salida
- **Prenderlo:** Ajustes › IA › «Avance solo», debajo de «Abrir el período de Claude». Es el mismo motor, más activo.
- **Apagarlo para un proyecto:** Ajustes › Este proyecto › «Avance solo» (junto a la actualización automática).
- **Apagarlo para un frente:** en el Mapa, en la cabecera del frente, al lado de su estado. Cuando el Mapa pase a ser Frentes, el interruptor va a la tarjeta del frente.
- **Ver qué puede hacer sola:** en el Mapa, cada paso que viene lleva su tamaño y si sigue sola, en gris y chico, al final de la línea.
- **Ver lo que hizo:** como el Arranque: la pestaña del proyecto arriba, la conversación y el aviso al volver. No hay pantalla propia.

## Historias de usuario
### FS-1 — Ver el tamaño y si sigue sola
Como usuario quiero ver en el Mapa qué pasos puede hacer la IA sola y cuánto cuestan.
- [ ] Un paso que viene con tamaño muestra al final «chico», «mediano» o «grande»; si además va solo, «chico · sola».
- [ ] Los hechos y los descartados no lo muestran.
- [ ] Los códigos y las marcas no se ven en el texto del paso (como hoy los `T-n`).

### FS-2 — Prender el avance solo y elegir cuándo
Como usuario quiero que la IA siga sola mientras no estoy, con las condiciones que elijo.
- [ ] En Ajustes › IA está «Avance solo», apagado al principio; prendido, queda así al cerrar y abrir Iridium.
- [ ] Debajo, sus condiciones, en gris y sin tocar mientras está apagado:
  - **Cuándo:** «Siempre» (de entrada) o «De [hora] a [hora]» (puede cruzar la medianoche: de 23:00 a 7:00).
  - **Después de [10] minutos sin usar Iridium.**
  - **Deja libre [0] % del período** (lo que no toca de cada período de 5 horas).
  - **Hasta el [100] % de la semana.**
  - **Tamaños:** casillas Chicos, Medianos y Grandes, las tres marcadas.
- [ ] La explicación dice qué hace: «Toma los pasos que la IA marcó para seguir sola, de a uno: primero tus respuestas, después lo chico más viejo, después el frente en curso. Un paso grande solo con el período recién abierto. Necesita Iridium abierta.»
- [ ] Un número fuera de rango no se guarda: vuelve al anterior.

### FS-3 — Apagarlo para un proyecto o un frente
Como usuario quiero que la IA no toque un proyecto o un frente aunque tenga pasos marcados.
- [ ] Ajustes › Este proyecto › «Avance solo»: «Prendido» de entrada; apagado, el motor no toma nada de ese proyecto (tampoco sus respuestas de la Bandeja; el arranque de las 3:00 sigue como siempre).
- [ ] En el Mapa, la cabecera de cada frente que no está hecho tiene «Avanza sola» con un interruptor; apagado dice «No avanza sola».
- [ ] Si el avance solo está apagado en Ajustes, el interruptor del frente se ve igual (se puede preparar antes de prenderlo).

### FS-4 — Lo que hace mientras no estoy
Como usuario quiero que la IA trabaje en un paso a la vez, sin que se pise conmigo.
- [ ] Con todo prendido y Iridium sin usar los minutos elegidos, abre una conversación nueva en el proyecto elegido; su primer mensaje nombra el paso: «Avance solo: seguí con «Cargar el tema propio» del frente Apariencia.». Las respuestas de la Bandeja van con «Continúa con el proyecto.», como el Arranque.
- [ ] Debajo del título de la conversación: «la empezó Iridium a las 3:02 para avanzar sola».
- [ ] Nunca hay dos a la vez: espera a que termine la que está trabajando (la suya o una mía).
- [ ] Si vuelvo mientras trabaja, la dejo terminar; no toma otra hasta que vuelvan a pasar los minutos sin usar.
- [ ] No repite un paso que tomó en las últimas 12 horas y sigue sin hacer (algo lo frenó): pasa a otro.

### FS-5 — El aviso al volver
Como usuario quiero saber, al volver, qué avanzó sola y qué me espera.
- [ ] El aviso «Mientras no estabas» (AR-4) suma un renglón por paso: «Alfa · avanzó «Cargar el tema propio»», con cómo terminó (terminó, dejó N preguntas, falló) y Abrir.
- [ ] Los de las respuestas de la Bandeja se ven como los del Arranque.

## Estados
- **Apagado** (Ajustes): las condiciones en gris.
- **Prendido sin nada para hacer:** no muestra nada; el aviso solo cuenta lo que hizo.
- **Sin sesión de Claude o sin poder leer el uso:** no toma nada y vuelve a probar al minuto siguiente; no se avisa cada vez (sería ruido).

## Lo que no entra
- Ver la fila de lo que tomaría después (Could, va con el tablero).
- Avisar si los tamaños no coinciden con lo gastado (Should; se guarda lo gastado desde ya para poder hacerlo).

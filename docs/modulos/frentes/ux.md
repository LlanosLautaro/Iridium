# UX del módulo: Frentes

**Fecha:** 2026-11-22
**Estado:** escrita por la IA con lo aprobado en la definición (D-176); las decisiones chicas, en D-177. Se ve funcionando en la prueba de FS-I1 y se ajusta ahí.
> Usa los principios de interacción y el design system generales (`04-ux.md`, `06-ui.md`). Alcance: `definicion.md` › Must, parte 1. El tablero (parte 2), al final, con sus maquetas.

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

# Parte 2 — El tablero

**Fecha:** 2026-11-22
**Estado:** escrita por la IA con lo aprobado en la definición (D-176); las decisiones chicas, en D-180. Las maquetas, `diseno/pantallas/frentes-a.html` a `frentes-e.html`; vistas las cinco, el usuario eligió la **B** (Q-266, D-181), construida en FS-I3.
> Alcance: `definicion.md` › Must, parte 2. Reemplaza a `modulos/mapa/ux.md` › W-7 cuando se construya.

## Puntos de entrada y salida
- **Entrar:** el ícono del Mapa en la barra de secciones, que pasa a llamarse Frentes (con el mismo atajo). Entra con el último frente que se miró en ese proyecto; la primera vez, el de arriba.
- **Salir a la Bandeja:** una pregunta del frente lleva a esa pregunta en la Bandeja; «Te espera · Q-n» en una tarea, lo mismo.
- **Salir a la iteración:** una tarea hecha con su iteración (`FS-I1`) lleva a su entrada en el `estado.md` del frente, como hoy un paso hecho del Mapa.

## Historias de usuario
### FS-6 — Ver todos los frentes de un vistazo
Como usuario quiero ver en una columna todos los frentes del proyecto y cuál tiene algo pendiente, sin desplazar.
- [ ] A la izquierda, una tarjeta por frente: el nombre y, debajo, el paso que sigue (el primero sin hacer que la IA puede hacer; si no hay, el que te espera; si no queda nada, «Todo hecho»).
- [ ] A la derecha del nombre, en ámbar, cuántas preguntas te esperan de ese frente; si no hay, nada.
- [ ] Si el frente va a avanzar solo (prendido y con un paso `sola` por hacer), el ícono del robot; si está apagado, «apagada»; si no tiene nada para hacer sola, nada.
- [ ] Orden: el que cambió último, arriba. Entran los en curso, los en uso con algo por hacer, los en pausa y el **Núcleo**.
- [ ] Debajo, «Por empezar» con su cuenta: los frentes que esperan sin carpeta, con «N aprobados» en lugar del paso.
- [ ] Los archivados (sin nada por hacer, R-91) no se ven; el interruptor «Archivados» de la cabecera los suma al final, en gris.
- [ ] Con diez frentes y uno por empezar, todo entra a 1440×900 sin desplazar la columna.

### FS-7 — Ver las tareas de un frente, de lo hecho a lo que viene
Como usuario quiero tocar un frente y ver sus tareas en orden, con qué hace la IA sola y qué me espera.
- [ ] Al centro, el nombre del frente, su estado y, a la derecha, el interruptor «Avanza sola» (o «No avanza sola»), el mismo de FS-3; cambiarlo cambia la tarjeta.
- [ ] Debajo, «Te esperan N» con las preguntas abiertas del frente, con sus opciones o casillas para responderlas ahí mismo, como en la Bandeja (R-105), sin repetir el nombre del frente; si no hay, no aparece.
- [ ] Debajo, el recorrido: las tareas reales (los pasos de su ruta con sus `T-n` o su iteración), de lo hecho a lo que viene, cada una con su tamaño y «sola». No se mueven a mano (D-137).
- [ ] Lo hecho, plegado salvo lo último, con «N hechos antes» para verlo entero.
- [ ] El paso que sigue, resaltado; uno que te espera, en ámbar con «Te espera · Q-n»; uno en pausa, «En pausa»; uno descartado, tachado. Una rama, debajo de su paso y corrida a la derecha.
- [ ] La forma es la B (Q-266, D-181): el camino de hoy con, al pie de cada paso, su código, su tamaño y «sola» con el robot.

### FS-8 — El Núcleo y lo que está por empezar
Como usuario quiero ver también lo que no es de ningún frente y lo que todavía no empezó.
- [ ] **Núcleo** es una tarjeta más: sus tareas son los `T-n` aprobados, pendientes o en curso sin `Frente:` (los muy chicos, como la consola, T-116), y sus preguntas, las abiertas sin frente. No tiene interruptor: el avance solo no toma nada de él (D-181 › 3).
- [ ] Un frente por empezar muestra lo aprobado para él en filas y «Empezar este frente» (como hoy en el Mapa); la ruta la escribe la IA al empezarlo.

## Las formas
Las historias FS-6 a FS-8 describen la forma de la definición (tarjetas a la izquierda, el frente al centro), la de A y B. Ganó la **B** (Q-266, D-181); C, D y E quedan como maquetas descartadas.
| Forma | Qué es | A favor | En contra |
|---|---|---|---|
| A · Columnas (Q-265, no) | Tarjetas a la izquierda; al centro, Hecho, Ahora y Después del frente elegido | Ordena un frente | Un frente a la vez |
| **B · Camino (elegida en Q-266)** | Tarjetas a la izquierda; al centro, el camino de hoy | Lo conocido | Un frente a la vez; el camino costaba leerlo |
| C · Una fila por frente (no) | Todos los frentes a la vez, uno por fila, con columnas Te espera, Lo que sigue y Después («N más» despliega) | Todo de un vistazo, frente por frente | Larga: con muchos frentes hay que desplazar |
| D · Por quién lo hace (no) | Todo el proyecto en tres columnas: Te espera, La IA sigue sola (en el orden en que la toma) y Cuando estés; cada tarea dice su frente; los frentes son un filtro arriba con su interruptor | Responde directo «qué me espera y qué hace sola»; muestra lo que la IA va a tomar (la Could) | No muestra lo hecho ni el avance de cada frente |
| E · Grilla de frentes (no) | Una tarjeta por frente, como la grilla de proyectos, con su avance en puntos y el paso que sigue; la que se toca se abre arriba con Te espera y Lo que viene | Se ve el avance de cada frente y el detalle sin cambiar de pantalla | Abrir uno empuja la grilla hacia abajo |

## Estados
- **Un frente sin ruta:** en el centro, la línea gris de hoy («Todavía sin ruta: la IA la escribe la próxima vez que trabaje en este frente.») y los pasos del método.
- **Un frente que no se puede leer:** el Recuadro de error de hoy (MA-12), en el centro.
- **Todo hecho:** «Todo hecho por ahora.» donde iría lo que sigue.
- **Antes del hito 10:** la primera tarjeta es **Hitos**, con el camino de los hitos de hoy (MA-5); los frentes que ya haya, debajo.
- **Ancho chico** (la sección de menos de 900 px): la columna de tarjetas pasa a ser la barra de pestañas de hoy, arriba.

## Lo que no entra
- Ver lo que la IA va a tomar después (Could): se piensa con el tablero andando.
- Avisar si los tamaños no coinciden con lo gastado (Should): va en la rama de la construcción, con varias noches anotadas.

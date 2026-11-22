# Definición del módulo: Frentes

**Fecha:** 2026-11-22
**Estado:** espera Q-263
**Base:** `propuesta.md`, D-175 (Q-262), lo pensado en `trabajo.md` › T-113, el Arranque (D-146, D-149) y la ruta de cada frente (D-139).

## Objetivo del módulo
Que la IA avance sola en lo que no necesita al usuario, gastando la cuota que él elija (toda, si quiere drenarla), sin empezar algo grande que no alcanza a terminar; y que el usuario vea de un vistazo, frente por frente, qué sigue, qué hace la IA sola y qué lo espera.

## Criterios de éxito
- Con el avance solo prendido y la PC encendida, el período no queda sin usar mientras haya pasos marcados «sola» y se cumplan las condiciones.
- Nunca empieza un paso más grande de lo que queda del período.
- Nunca trabajan dos sesiones en el mismo proyecto, y cada una empieza al día con GitHub (D-172).
- Un frente o un proyecto apagado no se toca.
- A la vuelta, el usuario sabe qué hizo y qué lo espera sin abrir documentos.
- En el tablero se ve, sin desplazar, cada frente con si tiene algo pendiente, y al tocarlo, sus tareas en orden.

## Funcionalidades
### Must — parte 1: el motor (va primero)
- **Las marcas en la ruta** (framework, lector, control y pruebas en el mismo cambio, D-086): cada paso `[ ]` puede llevar entre sus códigos el tamaño (`chico`, `mediano`, `grande`: lo que cuesta ese paso, una iteración, no el frente entero) y `sola` (la IA lo puede hacer sin preguntar nada antes). La IA los escribe al abrir un frente y al cerrar cada iteración, como el resto de la ruta; el control avisa de una palabra mal escrita. Ejemplo: `- [ ] Cargar el tema propio desde Ajustes (T-75, mediano, sola)`.
- **La fila, interna:** Iridium la arma sola de las rutas de todos los proyectos (no la escribe la IA) y guarda en su JSON lo que tomó, cuándo y cuánto del período gastó.
- **Apagar el avance solo** por proyecto y por frente; queda en Iridium y se respeta en la próxima vuelta.
- **Ajustes › IA › Avance solo**, con sus condiciones: horario (de entrada, siempre), minutos sin usar Iridium antes de empezar (10), cuánto del período deja libre (0 %), tope de la semana (100 %) y qué tamaños acepta (los tres).
- **El motor:** el Arranque de hoy, que además, cumplidas las condiciones, toma de a un paso: la conversación nueva arranca con el paso nombrado. El tamaño se compara con lo que queda del período: grande solo con el período recién abierto (más del 70 % libre), mediano con más del 40 %, chico con lo que quede. El orden: lo que espera en la Bandeja (como hoy); después el paso chico más viejo, para ir cerrando lo chico; después el frente en curso.
- **Cuándo para un paso:** al terminar la iteración, o cuando necesita algo del usuario (deja la `Q-n`, cierra la iteración y el motor sigue con otro proyecto).
- **Si el usuario vuelve:** la sesión que está trabajando termina su iteración (cortarla es lo más caro); no se toma otra hasta que vuelvan a pasar los minutos sin usar.
- **El aviso al volver** (AR-4) cuenta también los pasos hechos solos: qué hizo y qué dejó esperando.

### Must — parte 2: el tablero (después, con maquetas)
- **El Mapa pasa a llamarse Frentes.**
- **A la izquierda, una tarjeta por frente:** el nombre y si tiene algo pendiente (preguntas que esperan, pasos por hacer); lo más reciente arriba. Entran los en curso, los por empezar y el núcleo (lo que no es de ningún frente; ahí van los muy chicos, como la consola integrada, T-116). Los archivados, aparte, como hoy. En cada tarjeta, si avanza sola o está apagada.
- **Al centro, el mapa del frente elegido, rediseñado:** las tareas reales (los pasos de su ruta y sus `T-n`) como tarjetas en un recorrido, de lo hecho a lo que viene, cada una con su tamaño y si va sola. Se ve como un kanban de tareas pero no se mueve a mano (D-137). La forma exacta sale de las maquetas.
- **Las preguntas del frente, en su propio lugar** dentro del frente, sin repetir su nombre.
- **El interruptor del frente** (avance solo) a mano en el tablero.

### Should
- Iridium compara lo que gastó cada paso con su tamaño y avisa si las estimaciones andan mal, para que la IA las corrija.
- Juntar en una sola sesión los pasos chicos del mismo proyecto (cada sesión nueva paga su arranque).
- No empezar un frente nuevo si ya dejó muchas preguntas esperando (el número se elige en la UX).

### Could
- Ver en el tablero lo que la IA tiene previsto tomar después.

### Won't (por ahora)
- Dos sesiones a la vez, en el mismo o en distintos proyectos.
- Mover tarjetas a mano (D-137).
- Que la IA reescriba las rutas sin trabajar en el frente, solo para marcarlas (gasta uso, D-139): las marca al pasar.

## Fuera de alcance
- Cambiar Pendientes o Ideas.
- Usar la cuota de otra cuenta o la API.

## Impacto en el perfil
Sigue en P2. Lee lo que Iridium ya lee y corre Claude Code como ya lo hace el Arranque; no hay datos nuevos de afuera ni conexiones nuevas. Riesgo con Anthropic: el uso es trabajo real con Claude Code sin ventana, previsto por ellos; dejarlo andando toda la noche es lo que llevó al límite semanal, así que se mantiene dentro de los límites.

## Términos nuevos (se agregan al glosario general)
| Término | Significado |
|---|---|
| Avance solo | La IA tomando sola pasos marcados `sola` mientras se cumplen las condiciones |
| Tamaño (de un paso) | Chico, mediano o grande: cuánto del período cuesta la iteración de ese paso |
| Frentes | La sección que reemplaza al Mapa: un tablero de todos los frentes y el mapa de cada uno |

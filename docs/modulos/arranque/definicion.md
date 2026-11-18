# Definición del módulo: Arranque

**Fecha:** 2026-11-18
**Estado:** espera Q-206
**Base:** `propuesta.md`, D-135 (trabajo real, desde la misma Iridium, a eso de las 3 y al vencer cada ventana) y lo revisado en `trabajo.md` › T-70.

## Objetivo del módulo
Que el período de 5 horas empiece mientras el usuario no está, **haciendo trabajo que ya estaba listo**, para que se renueve en un momento útil del día; y que el usuario sepa a la mañana qué se hizo.

## Criterios de éxito
- Con el arranque prendido e Iridium abierta toda la noche, a la mañana la Bandeja dice qué proyecto arrancó y cuándo, y ese proyecto tiene sus respuestas procesadas.
- Sin nada listo, no arranca nada ni gasta.
- Nunca arranca dos sesiones en el mismo momento ni en un proyecto que ya tiene una trabajando.
- Si no pudo (sin red, sesión de Claude vencida, el límite de la semana), la Bandeja lo dice y no reintenta en bucle.
- Apagado, Iridium se comporta como hoy.

## Funcionalidades
### Must (MVP del módulo)
- **Los dos momentos (D-135):**
  1. **A la hora elegida** (por defecto, las 3:00), si en ese momento no hay un período abierto.
  2. **Unos 5 minutos después de que venza el período**, cada vez, si nadie abrió otro en esos minutos (Iridium sabe cuándo vence: lo lee del motor para la barra de uso).
- **Qué arranca:** un solo proyecto, el que tiene la respuesta sin procesar más vieja. Tiene que seguir el framework, no estar archivado y no tener una sesión trabajando. Abre una **conversación nueva** (a esa hora la caché venció: retomar una larga es lo más caro) y manda «Continúa con el proyecto.», con el modelo y el esfuerzo de siempre de ese proyecto.
- **El cuidado de la semana:** no arranca si el uso de la semana pasó el **90 %**: el período de 5 horas no se pierde, pero lo que gasta sale de la semana.
- **Si la PC estaba suspendida** a la hora del momento, lo hace al despertar, con las mismas reglas (solo si sigue sin haber un período abierto y hay algo listo).
- **En la Bandeja:** una línea arriba con lo último que hizo: «Iridium arrancó Alfa a las 3:02 (Q-12, Q-13)», o por qué no pudo. Un clic lleva a esa conversación.
- **En Ajustes:** un interruptor «Arrancar el período de Claude con trabajo listo» (**apagado** hasta que el usuario lo prenda) y la hora del primer arranque.

### Should
- La línea de la Bandeja guarda los últimos arranques de la semana, no solo el último.

### Won't (fuera de alcance)
- Arrancar con Iridium cerrada o abrirla con una tarea de Windows (D-135).
- Mandar un mensaje vacío o cualquier cosa que no sea «Continúa con el proyecto.».
- Varios proyectos en el mismo momento, o elegir a mano cuáles entran.
- Arrancar proyectos con preguntas sin responder: solo cuenta lo que el usuario ya respondió.

## Términos nuevos
- **Arranque:** la sesión que Iridium empieza sola para abrir el período de 5 horas.
- **Trabajo listo:** un proyecto con al menos una respuesta sin procesar y sin una sesión trabajando.

## ¿Cambia el perfil?
No: sigue P2. Usa la cuenta y el motor de siempre; no sale nada nuevo de la PC.

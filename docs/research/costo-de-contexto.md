# Cuánto cuesta el contexto: chat nuevo o seguir en el mismo

> Medido el 2026-11-15 a pedido del usuario (T-68, Q-168). Para volver a medir en una o dos semanas y comparar ajustes con datos.

## De dónde salen los datos
Claude Code guarda cada conversación en `%USERPROFILE%\.claude\projects\<carpeta del proyecto>\<id>.jsonl`. Cada respuesta del modelo trae su `usage`: lo que leyó de la caché (`cache_read_input_tokens`), lo que escribió en la caché (`cache_creation_input_tokens`, separado en 5 minutos y 1 hora), la entrada sin caché y la salida. Se cuenta cada mensaje una vez (el mismo `message.id` aparece repetido mientras se escribe la respuesta) y se dejan afuera los subagentes (`isSidechain`).

Para comparar, todo se pasa a «tokens de entrada equivalentes» con los pesos de la API: leer de la caché 0,1; escribir en la caché de 1 hora 2; entrada sin caché 1; salida 5. Que el límite de la suscripción pese igual es una suposición razonable, no un dato publicado.

## Lo que se vio (115 conversaciones, 2026-10 a 2026-11-15, todas con Opus)
- **La caché es de 1 hora** (todo lo escrito es `ephemeral_1h`). Casi ninguna conversación tuvo pausas de más de una hora.
- **Reparto del gasto:** leer la caché 62 %, escribirla 21 %, respuestas 17 %. Lo que más pesa es releer la conversación entera en cada paso.
- **Arranque de un chat nuevo:** el primer paso ya lee ~16 mil tokens compartidos con los otros chats (instrucciones y herramientas) y escribe ~17 mil. Tras leer `estado.md` y lo que pide el Próximo paso, a los 10 pasos lleva ~72 mil de contexto. Esos 10 pasos cuestan ~180 mil equivalentes (incluye trabajo útil, no todo es arranque).
- **Cada paso cuesta más cuanto más largo el chat:**

| Contexto | Pasos | Costo medio por paso | De eso, releer |
|---|---|---|---|
| 0–50 mil | 439 | ~20 mil | ~3 mil |
| 50–100 mil | 1942 | ~17 mil | ~7 mil |
| 100–150 mil | 1998 | ~21 mil | ~12 mil |
| 150–200 mil | 1462 | ~26 mil | ~17 mil |
| 200–250 mil | 911 | ~31 mil | ~22 mil |
| 250–300 mil | 603 | ~36 mil | ~27 mil |
| 300–350 mil | 385 | ~41 mil | ~32 mil |
| más de 350 mil | 279 | ~49 mil | ~41 mil |

- Una conversación típica termina con ~160 mil de contexto; las largas llegan a 300–400 mil y 100–180 pasos.

## Qué quiere decir
- **Empezar un chat nuevo sí conviene cuando el viejo ya está pesado.** Pasar de 250 mil a ~72 mil ahorra ~18 mil por paso; el arranque se paga en unos 6 a 10 pasos. Una iteración normal tiene 50 a 150.
- **No conviene para algo chico.** Un chat nuevo para 10–15 pasos paga el arranque entero y casi no lo aprovecha; si el chat anterior está en menos de ~120 mil y la caché está viva (menos de una hora), es más barato seguir ahí.
- **Lo más caro es retomar un chat largo después de más de una hora:** la caché venció y hay que reescribir todo el contexto al doble (300 mil → ~600 mil equivalentes de golpe). Ahí siempre conviene chat nuevo.
- **La palanca más grande es el arranque liviano:** cada mil tokens que se leen al empezar se pagan una vez al escribir y otra vez en cada paso de la conversación. `estado.md` largo («En qué estamos ahora» es un párrafo enorme), `CLAUDE.md` con la lista de herramientas y leer documentos que el paso no necesita suman en todos los chats.

## Ajustes para probar
1. **Regla por tamaño y tiempo** en lugar de «chat nuevo al terminar cada iteración»: seguir en el mismo chat si está por debajo de ~150 mil y pasó menos de una hora; chat nuevo si pasó de ~200 mil, si pasó más de una hora o si cambia el tema.
2. **Arranque más liviano:** «En qué estamos ahora» en pocas líneas (lo demás al documento del frente) y `CLAUDE.md` más corto.
3. **Que Iridium lo mida y lo muestre** (el medidor de contexto ya existe): avisar «conviene un chat nuevo» cuando el contexto pasa el umbral o la caché venció.

## Cómo volver a medir
Mismo cálculo sobre los `.jsonl` con fecha posterior al ajuste, y comparar: costo medio por paso, contexto al terminar, costo del arranque (10 primeros pasos) y costo total por commit o por iteración cerrada (lo que de verdad importa: cuánto cuesta avanzar, no cuánto cuesta un paso).

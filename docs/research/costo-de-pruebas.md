# Cuánto cuestan las pruebas que corre la IA

> 2026-11-20. Pedido del usuario: evaluar si las pruebas deberían correr solas después de cada turno de la IA, sin pasarle el resultado si sale en verde (T-91, Q-230). Medido en los registros de Claude Code de este repo (`%USERPROFILE%\.claude\projects\<carpeta del repo>\*.jsonl`, los últimos 30 días: del 2026-10-21 al 2026-11-20), con el mismo criterio de «paso» que `costo-de-contexto.md`.

## Cómo se midió
- Un **paso** es una respuesta del modelo (un `message.id` distinto, sin los subagentes). Cada paso relee la conversación entera desde la caché.
- Una **corrida de pruebas** es una llamada a Bash o PowerShell que ejecuta `pnpm test`, `pnpm e2e`, `pnpm cobertura`, `pnpm typecheck`, `pnpm lint` o `vitest`, `playwright`, `tsc`, `biome` directo. **Completa** si no apunta a un archivo o a una prueba; **dirigida** si sí.
- **Roja** si su salida dice que algo falló (`N failed`, `error TS`, `Found N error`, `ELIFECYCLE`) o terminó con error. Una llamada puede encadenar varias (typecheck, lint y test): cuenta una vez.
- El **bloque final** de una conversación son sus corridas completas de los últimos 20 minutos con pruebas: la verificación de cierre, con sus arreglos.
- Fue un script de una vez, fuera del repo; para repetirlo, sumarlo a `tools/medir-uso.ts`.

## Lo que salió
| | Cantidad |
|---|---|
| Conversaciones / pasos | 340 / 22 958 |
| Corridas de pruebas | 3 290 (**14 % de los pasos**) |
| Contexto medio del paso que lee el resultado | 169 mil tokens |
| En segundo plano (con aviso o sondeo después) | 102 (3 %) |
| Tiempo de reloj corriendo pruebas | 24 h |

| Tipo | Corridas | Rojas | Mediana | 9 de cada 10, menos de |
|---|---|---|---|---|
| Vitest completa | 1 212 | 38 % | 6 s | 43 s |
| Vitest dirigida | 462 | 35 % | 5 s | 17 s |
| Playwright completa | 170 | 21 % | 22 s | 4 min 50 s |
| Playwright dirigida | 572 | 34 % | 17 s | 1 min 40 s |
| Typecheck | 170 | 55 % | 19 s | 1 min 35 s |
| Lint | 704 | 33 % | 3 s | 17 s |

**El cierre de cada conversación:** en 122 conversaciones con verificación final, el bloque llevó una mediana de **12 pasos y 4 minutos** (9 de cada 10, menos de 16 minutos). **La primera corrida de ese bloque salió roja en 55 de 122 (45 %).**

## Qué quiere decir
1. **Las pruebas no sobran:** casi la mitad de las veces la verificación final encuentra algo. Sin ella, el commit, la subida a GitHub y la `Q-n` de prueba saldrían con algo roto.
2. **Esperar no gasta; los pasos sí.** Mientras una corrida trabaja en primer plano la IA no lee nada: los 15 minutos de Playwright cuestan un paso, no quince. Lo caro es cada paso que lee un resultado (unos 169 mil tokens de caché) y, sobre todo, la cantidad: 14 % de todos los pasos son pruebas.
3. **Lo que ahorraría correrlas después del turno** son los pasos de las corridas completas que salen en verde: unos 2 a 4 por conversación con código (2–5 % de los pasos). Las dirigidas, mientras se escribe, no se pueden sacar: son el «escribo, pruebo, corrijo».
4. **Lo que se ve como «esperando»** es sobre todo el tiempo de reloj de Playwright (una sola ventana a la vez, `workers: 1`) y, en menos casos, las corridas en segundo plano con sondeo, que suman pasos sin aportar.

## Opciones (Q-230)
- **A) Ordenar cómo corre las pruebas la IA:** un solo comando de cierre que corre todo y muestra solo lo que falla; Playwright en primer plano con tiempo largo, nunca en segundo plano con sondeos; mientras trabaja, solo las pruebas de lo tocado; y probar si Playwright puede correr de a varias ventanas. Sin riesgo; ahorra pasos y minutos.
- **B) La idea del usuario, como red:** además de A, Iridium corre ese comando al terminar cada turno que cambió código; en verde no dice nada (lo marca en la tarjeta), en rojo le manda a la IA el resumen, como el control. Ahorra la verificación final, pero el commit, la subida y la `Q-n` salen antes de saber si está en verde (casi la mitad de las veces no lo está), el proyecto queda ocupado minutos después de cada turno y es un formato nuevo del framework (el comando de cada proyecto, con su lector y su control, D-086).
- **C) Dejarlo como está.**

# Diseño técnico del módulo: Frentes (parte 1, el motor)

**Fecha:** 2026-11-22
**Estado:** cerrado (las decisiones, en D-178)
**Base:** `definicion.md` (D-176), `ux.md` (D-177), el Arranque (`modulos/arranque/diseno-tecnico.md`, D-149) y la ruta (`src/main/core/ruta.ts`, D-139, D-145).

## Las decisiones de este paso
1. **Las marcas van en el paréntesis final del paso**, junto a los códigos: `(T-75, mediano, sola)`. Solo ahí se leen (una palabra «grande» en el texto del paso es texto). El lector suma a cada paso `tamano` (`chico` | `mediano` | `grande` | null) y `sola`. El control avisa: una palabra parecida que no es la marca (`chica`, `medio`, `solo`, `sóla`…), dos tamaños en un paso y un `sola` sin tamaño (el motor no sabría si cabe). Un hecho o descartado con marcas no se avisa.
2. **Un motor aparte del temporizador del Arranque, en la misma casa.** La clase `AvanceSolo` (`src/main/app/avance.ts`) mira cada minuto, solo con el avance prendido, si se cumplen las condiciones baratas (horario, minutos sin usar Iridium, ninguna IA trabajando, el uso que ya se conoce). Recién entonces lee el uso de nuevo, arma la fila y arranca. Mirar cada minuto acá sí conviene (D-149 lo descartó para el Arranque porque ahí hay un momento fijo): las condiciones cambian con el uso de la PC y con las sesiones, no con el reloj, y la mirada no toca el disco.
3. **Cuánto queda del período:** con el período abierto, `100 − cincoHoras.usado`; cerrado, 100 (arrancar lo abre). Lo disponible es eso menos «Deja libre». Grande, con más de 70; mediano, con más de 40; chico, con más de 0. La semana: `semana.usado` menor que «Hasta el … %»; con alguna ventana `agotada`, nada.
4. **La fila, en orden** (D-176): (a) las respuestas de la Bandeja, con la misma lectura del Arranque (`candidatosDe`), como un paso chico; (b) el paso `sola` chico del frente que hace más que no se toca, por la fecha de `**Última actualización:**` de su `estado.md`; (c) del frente en curso, el primer paso `sola` que cabe. Un paso cuenta si es `[ ]` (camino o rama), no nombra una `Q-n` sin responder, su frente no está hecho ni apagado, su proyecto sigue el framework, no está archivado ni apagado, no se usó en VS Code en los últimos 10 minutos (D-027), y no se tomó en las últimas 12 horas (si sigue sin hacer, algo lo frenó: no se insiste).
5. **Arranca como el Arranque:** `sincronia.alDia` y `Conversaciones.seguir(ruta, { nueva: true, texto }, { arranque: marca, motivo: 'avance' })`. El texto nombra el paso, su frente y la línea del `estado.md`; la Bandeja va con «Continúa con el proyecto.». La regla de qué hacer con ese mensaje está en el framework (`SKILL.md` › El avance solo): solo ese paso, hasta cerrar la iteración; si necesita algo, deja la `Q-n` y cierra; al cerrar, pone al día las marcas.
6. **Lo que pasó va a `arranques.json`**, con el momento nuevo `avance`: el proyecto, el paso (frente, texto, tamaño, línea) y el uso al empezar (período y semana). Al terminar la sesión (cuando el proyecto deja de estar trabajando), lee el uso y anota el de después: es lo gastado, para comparar con el tamaño más adelante (Should). El aviso al volver (AR-4) los muestra como a los del Arranque, con el paso.
7. **Los ajustes, en `config.json`**, apagados si faltan o están rotos. Los interruptores por proyecto y por frente se guardan como apagados (lo que no está, prendido), como la actualización automática (D-154).
8. **La conversación** guarda en `sesiones.json` el motivo (`motivo: 'avance'`) junto a la marca `arranque`; la línea de debajo del título dice «para avanzar sola» en vez de «para abrir el período».

Descartado: sumar el avance al temporizador del Arranque (mezcla un momento fijo con condiciones que cambian solas), y escribir la fila en un archivo que lea la IA (D-175: dos lugares que se desfasan).

## Los datos
**La ruta** (`docs/modulos/<frente>/estado.md`): `- [ ] Paso (T-75, mediano, sola)`.

**`config.json`:**
```
avanceSolo: { prendido: false, horario: null | { desde: "23:00", hasta: "07:00" },
              minutosSinUsar: 10, libre: 0, semana: 100, tamanos: ["chico", "mediano", "grande"] }
avanceApagado: { proyectos: [ruta], frentes: [{ ruta, carpeta }] }
```

**`arranques.json`** (sigue en `version: 1`; los renglones de antes valen igual):
```
momento: "hora" | "vencimiento" | "avance"
paso?: { frente, carpeta, texto, tamano, linea }     // falta en los de la Bandeja
uso?: { antes: { periodo, semana }, despues: { periodo, semana } | null }
```

**`sesiones.json`:** el resumen suma `motivo: "avance"` (falta en las demás).

## Las piezas
- **`src/main/core/ruta.ts`:** `tamano` y `sola` en `PasoRuta`; `textoSinCodigos` saca también las marcas del paréntesis final; `marcasDudosas(linea)` para el control.
- **`src/main/core/control/ruta.ts`:** los avisos del punto 1.
- **`src/main/core/avance.ts`** (nuevo, sin disco): `disponible(uso, ajuste, ahora)`, `cabe(tamano, disponible, ajuste)`, `enHorario(ajuste, ahora)`, `puedeMirar(...)` y `elegirPaso(bandeja, pasos, disponible, ajuste, tomados, ahora)`.
- **`src/main/app/avance.ts`** (nuevo): `AvanceSolo` con sus dependencias (el ajuste, los apagados, el uso, los candidatos de la Bandeja, los pasos de todas las rutas, las sesiones en marcha, arrancar, `arranques.json`, los segundos sin usar y el reloj), como el Arranque, para probarlo con un reloj falso y carpetas temporales.
- **`src/main/app/mapa.ts`** (el que ya arma el Mapa): de donde salen los pasos de cada frente con su estado y su fecha.
- **La ventana:** Ajustes › IA (`marco/ajustes/Ia.tsx`, «Avance solo»), Ajustes › Este proyecto (`EsteProyecto.tsx`), la cabecera del frente y la marca del paso en el Mapa (`secciones/proyecto/Mapa.tsx`), la línea de la conversación y el renglón del aviso (`marco/Avisos.tsx`). Usa piezas que ya existen (Ajuste, interruptor, campo chico, casillas); el paso 6 (UI) no hace falta para el motor.

## Probar sin esperar
- **Vitest:** el lector y el control con rutas de muestra; las reglas con usos y horas fijas (el horario que cruza la medianoche, lo grande con el período a medias, la semana al tope); `AvanceSolo` con un reloj falso y carpetas temporales (Alfa con una respuesta, Beta con un paso chico `sola`, Gamma con un frente en curso y un paso grande, Delta apagado) y el motor falso.
- **Playwright** con el motor falso y `IRIDIUM_AVANCE_SIN_USAR=<segundos>` (solo pruebas; reemplaza los minutos sin usar, se anota en `docs/herramientas-ia.md`).
- **El usuario**, una tarde o una noche con Iridium abierta, como `Q-n` de prueba al terminar FS-I2.

## Las iteraciones
| ID | Qué se construye | Cómo se prueba |
|---|---|---|
| FS-I1 | Las marcas en la ruta (framework, lector, control y pruebas, D-086), cómo se ven en el Mapa (FS-1), los ajustes y los interruptores por proyecto y por frente (FS-2, FS-3) | Vitest del lector y del control; Playwright de Ajustes y del Mapa |
| FS-I2 | El motor (FS-4) y el aviso al volver (FS-5) | Vitest de las reglas y del caso de uso; Playwright con el motor falso; la prueba del usuario como `Q-n` |

## Riesgos
- **Las rutas sin marcas:** al principio pocos pasos tienen `sola`; el motor no encuentra nada hasta que la IA los marque al pasar (D-175). En este proyecto se marcan en FS-I1, como ejemplo y para la prueba.
- **Una sesión que se cuelga** deja el proyecto «trabajando» y el motor esperando: es lo mismo que hoy con cualquier sesión; el control del Arranque (sin turno terminado) lo muestra en el aviso.
- **El uso que no se puede leer** (sin red): no toma nada; vuelve a mirar al minuto siguiente.

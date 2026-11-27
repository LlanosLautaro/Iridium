# Investigación del módulo: Plantillas

**Fecha:** 2026-11-27
**Spike:** S-9 (`spikes/S-9-pruebas-sin-ventanas/`)

## La pregunta
¿La receta con la que Iridium esconde las ventanas de sus pruebas (D-072) anda igual en otra app de Electron, que no sabe nada de Iridium? Es lo que dice la receta «Pruebas sin ventanas» (`definicion.md`); antes de escribirla, se prueba.

## Cómo se probó
Una app de muestra en una carpeta descartable, fuera de Iridium (Electron 44, Playwright 1.65 de este repo), con una ventana que cuenta cada 10 ms y una consola que se abre sola, como la de un script. Se abrió con Playwright tres veces y se miró con Windows qué ventanas se ven y cuál queda adelante, a los 1,5 s y a los 10 s.

| Variante | Dónde queda la ventana | ¿Te quita el foco? | La consola | ¿Se sigue dibujando? |
|---|---|---|---|---|
| Sin receta | en el medio de la pantalla | sí | se ve y queda adelante | sí |
| Solo fuera de la pantalla | fuera de la pantalla | no | se ve | sí (100 por segundo) |
| Receta completa | fuera de la pantalla | no | no se ve | sí (101 por segundo), captura correcta |

## Conclusiones
- **La receta anda tal cual en otra app.** Con ella no aparece nada y lo que tenías adelante sigue adelante; la captura de la prueba sale bien (el fondo y el número, no en blanco).
- **Cada parte hace falta:** abrir la ventana sin mostrarla y después «mostrarla sin activar» es lo que no roba el foco; la consola se esconde solo si la app la abre escondida cuando está la variable.
- **Lo que mantiene la ventana dibujándose** (apagar el cálculo de ventanas tapadas y la pausa en segundo plano) no cambió nada en 10 s en esta PC. Iridium lo necesitó en tandas largas (D-072); la receta lo deja, porque no cuesta nada y evita capturas en blanco que fallan a veces.
- **Lo propio de cada app:** el nombre de la variable (`<APP>_OCULTA`), dónde crea su ventana y qué consolas abre. Lo demás se copia.

## Portón
- [x] La duda técnica, respondida con un spike fuera del código principal (S-9)
- [x] La conclusión, acá y en `05-arquitectura.md` › Spikes
- [x] ¿Requirió cambios en los documentos generales? Sí: S-9 en `05-arquitectura.md` (aplicado)

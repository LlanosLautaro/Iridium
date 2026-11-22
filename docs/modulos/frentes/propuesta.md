# Propuesta del módulo: Frentes

**Fecha:** 2026-11-22
**Tipo:** sección (el Mapa pasa a ser Frentes y el Arranque suma el avance solo; T-112, T-113)

## Qué problema resuelve
Dos cosas que el usuario ve juntas:
- **La cuota se pierde.** El Arranque (T-70) solo abre el período con lo que espera en la Bandeja; si el usuario no usa la cuota antes del reinicio semanal, se pierde, aunque haya frentes listos para que la IA siga sola (temas T-75, el instalador, esto mismo).
- **«Qué sigue» cuesta.** El Mapa muestra un frente a la vez desde una barra arriba (D-138) y sigue sin responder de un vistazo qué viene en todos.

## Por qué ahora
Le queda el 83 % de la semana y se reinicia el martes 2026-11-24 a la noche (Q-262). Cuanto antes ande el avance solo, menos cuota se pierde; el motor va primero y el tablero después, con maquetas.

## Cómo encaja en el producto
- **Arranque** (`modulos/arranque/`): el motor es el suyo, más activo. Sigue abriendo el período con la Bandeja; además, mientras se cumplan las condiciones que elige el usuario, toma pasos que la IA puede hacer sola.
- **Mapa** (`modulos/mapa/`): pasa a llamarse Frentes y se rediseña; la ruta de cada frente (D-139) sigue siendo el dato, con dos marcas más.
- **Ideas y Pendientes:** quedan como están; Pendientes sigue como atajo a todo lo abierto.

## Por qué es un módulo y no una funcionalidad
- [ ] Dominio propio que requiere investigación
- [x] Flujos de UX propios
- [x] Ritmo de avance propio
- [ ] Se activa, instala o distribuye por separado

## Alternativas
- **Solo el Arranque más activo, pasando «Continúa con el proyecto» por cada proyecto** (B de Q-261): no deja elegir en qué trabaja ni evita empezar algo grande con poca cuota.
- **Un tablero de frentes en paralelo que se mueve a mano** (Kanban): descartado en D-137.
- **La fila en un JSON que escribe la IA:** dos lugares que poner al día (la ruta y el JSON) se desfasan, como pasó con las ideas en T-117. Mejor: la IA marca el paso en la ruta y Iridium arma la fila en su propio JSON (lo que pidió el usuario, «internamente»).

## Decisión
Seguir (Q-262, D-175): primero el motor con la fila interna; después las maquetas y el tablero.

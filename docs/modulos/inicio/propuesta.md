# Propuesta del módulo: Inicio

**Fecha:** 2026-11-02
**Tipo:** sección

## Qué problema resuelve
La idea (2026-10-30, `07-construccion.md` › Ideas nuevas › Ideas y Skills como paneles del inicio): que `Ideas` y `Skills` dejen de verse como proyectos y sean íconos de la barra de la izquierda del inicio, junto a Proyectos y Pendientes.

La mitad ya está: **Skills** es el tercer ícono del inicio (`Ctrl+3`) con el chat de `Skills` a la derecha (D-068). Lo que falta:
- **Las dos carpetas siguen como tarjetas en la grilla de Proyectos**, con «Sin estado», al lado de las apps. No son proyectos: `Ideas` no sigue la guía y `Skills` ya tiene su sección. Abrirlas como proyecto da un Mapa y Pendientes vacíos.
- **Las ideas sueltas no se ven.** Viven en `Ideas/ideas.md` (hoy 3 sueltas, 4 para proyectos existentes y 5 integradas); para leerlas hay que abrir Ideas como proyecto e ir a Docs, o preguntarle al chat.
- **El chat de Ideas está pegado a la grilla** (D-060): sirve, pero le quita a la grilla un tercio del ancho aunque no lo uses, y no se ve que es «el lugar de las ideas».

## Por qué ahora
Es el frente que sigue (Q-112: primero Inicio, después Diseño y Capacidades; D-079). Es chico, casi todo se arma con piezas que ya existen (la barra del inicio, la columna con lista y detalle de Skills, el chat de una carpeta) y mejora la pantalla que abrís todos los días.

## Cómo encaja en el producto
- **La barra del inicio** pasa a tener cuatro íconos: Proyectos, Pendientes, Skills e Ideas (`04-ux.md` › Arquitectura de información). Ideas va con `Ctrl+4`; los demás atajos no cambian.
- **Ideas** se arma como Skills: a la izquierda la lista de ideas por sección (Sueltas, Para proyectos existentes, Integradas), al medio la idea elegida y a la derecha el chat de la carpeta `Ideas`, con su misma instrucción (D-060). Las ideas las sigue escribiendo la IA en `ideas.md`, con las reglas de `Ideas/CLAUDE.md`; Iridium solo las lee.
- **La grilla** deja afuera las carpetas que tienen su propia sección (`Ideas` y `Skills`), y siguen contando para lo demás (Pendientes, Skills).
- No cambia el núcleo: el lector de `ideas.md` va en la lógica de dominio, aparte de la interfaz, como el resto.

## Por qué es un módulo y no una funcionalidad
- [ ] Dominio propio que requiere investigación (solo leer `ideas.md`, que ya tiene formato fijo).
- [x] Flujos de UX propios: una sección nueva y cambiar lo que muestra el inicio.
- [x] Ritmo de avance propio: frente de D-063, el que sigue (D-079).
- [ ] Se activa, instala o distribuye por separado.

Es el más chico de los frentes: la definición, la UX y el diseño técnico pueden ir juntos en un solo paso.

## Alternativas
- **Solo esconder las dos tarjetas de la grilla:** lo mínimo, pero las ideas siguen sin verse.
- **Un panel Ideas con solo el chat, sin la lista:** casi no cambia nada respecto de hoy.
- **Editar las ideas a mano en Iridium** (escribir, mover de sección): `ideas.md` lo ordena la IA con sus reglas; dos formas de escribir lo mismo se pisan. Si hace falta, después.

## Propuesta de alcance (para la definición)
1. **Ícono Ideas** en la barra del inicio, con su atajo.
2. **La lista de ideas** de `ideas.md` por sección, con su fecha y a qué proyectos toca; la elegida, entera al medio, con los nombres de proyectos como enlaces a su tarjeta. Se actualiza sola cuando la IA cambia el archivo.
3. **El chat de Ideas** a la derecha del panel, el mismo de hoy (no se pierde la conversación).
4. **La grilla de Proyectos** sin `Ideas` ni `Skills`.
5. **Qué pasa con el chat de la grilla:** se va al panel Ideas y la grilla usa todo el ancho, o se queda también ahí (Q-113).

Para después, si lo pedís: las «Ideas nuevas» de cada proyecto (su `07-construccion.md`) juntas en el mismo panel, que es la otra idea de Q-74 (el atajo a las ideas).

## Decisión
Seguir, si la aprobás (Q-113).

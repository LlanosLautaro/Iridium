# UX del módulo: Mapa

**Fecha:** 2026-11-17
**Estado:** aprobada en Q-202 (D-144)
**Base:** `definicion.md` (D-141), D-142 (antes del hito 10, los hitos), D-143 («Por empezar» sale de `trabajo.md`). Las maquetas: `docs/diseno/pantallas/mapa-b.html` (en operación) y `mapa-hitos.html` (antes del hito 10).
> Usa los principios de interacción y las piezas generales (`04-ux.md`, `modulos/diseno/ux.md` › Las piezas). Reemplaza H-7 y W-7 de `04-ux.md` al aprobarse.

## Puntos de entrada y salida
- **En un proyecto:** Mapa en la barra lateral (Ctrl+2), como hoy. Es la sección con la que abre un proyecto con el framework.
- **Desde la tarjeta del proyecto:** abrirlo lleva a la sección en la que se dejó (H-6); la primera vez, al Mapa.
- **Hacia afuera:** «Te espera» lleva a su pregunta en la Bandeja; un paso que nombra una iteración, a su sección en Docs; «Empezar este frente», a la conversación de al lado (cita sin enviar). Se vuelve en un paso (Atrás o el botón lateral del mouse, H-8).
- Un proyecto sin el framework no tiene Mapa (es una carpeta simple, W-3).

## Historias de usuario
- **MA-1 —** Como usuario quiero ver, al abrir el Mapa, qué sigue en el frente en el que estamos, para retomar sin leer documentos (D-138).
  - [ ] Arriba, «Mapa» y el hito («Hito 10 · Operación»); debajo, la barra de frentes con el activo elegido.
  - [ ] Del frente: su nombre y su estado en palabras (En curso, En uso, En pausa, Sin empezar).
  - [ ] Sin desplazar se ven el último hecho, el que sigue (resaltado) y los dos o tres de después.
  - [ ] Cada paso con su nombre completo: los largos bajan de renglón, no se cortan; sin códigos a la vista.
- **MA-2 —** Como usuario quiero ver de un vistazo qué me espera y qué está frenado.
  - [ ] Un paso cuya línea nombra una pregunta abierta lleva «Te espera» en ámbar; un clic abre esa pregunta en la Bandeja. Con la pregunta respondida, la marca se va sola.
  - [ ] En un frente en pausa, el que sigue lleva «En pausa» en ámbar en lugar del resalte.
  - [ ] Un paso descartado se ve apagado y tachado; lo que viene, con el punto vacío.
- **MA-3 —** Como usuario quiero pasar de un frente a otro sin perder el lugar.
  - [ ] La barra: el activo primero; después, en el orden de la tabla de frentes de `estado.md`; al final, «Por empezar» con su cuenta (si no hay nada por empezar, no se muestra).
  - [ ] Un clic en una pestaña muestra ese frente; con el foco en la barra, las flechas pasan de una a otra.
  - [ ] Con muchos frentes la barra se desplaza de costado y la elegida queda a la vista.
  - [ ] Al volver al proyecto, el Mapa muestra la pestaña que se dejó; si ese frente ya no está, el activo.
  - [ ] Un frente en uso sin nada por hacer (nada que venga en su ruta ni trabajo aprobado sin lugar) está archivado: no está en la barra. «Archivados», arriba a la derecha con su cuenta, los muestra después de los activos y en gris; se recuerda por proyecto (D-152, R-91).
- **MA-4 —** Como usuario quiero ver lo de antes solo si lo pido, para que el foco quede en lo que sigue.
  - [ ] Los hechos anteriores al último van en una línea «N hechos antes»; un clic los despliega y otro los pliega.
  - [ ] Un paso hecho que nombra una iteración (`ID-I3`) abre su sección del `estado.md` del frente en Docs (sin mostrar el código).
- **MA-5 —** Como usuario quiero ver en qué está un proyecto que todavía no llegó a operación (D-142).
  - [ ] Sin pestañas: el camino son los hitos 0 a 10 con su nombre; los hechos de antes, plegados como en MA-4.
  - [ ] El hito en curso es el que sigue y debajo, como rama, sus pasos (la lista del portón: hechos con el punto lleno, lo que falta vacío) o, en la construcción, sus iteraciones con su objetivo.
  - [ ] Un ítem del portón o una iteración que nombra una pregunta abierta lleva «Te espera».
  - [ ] Si el proyecto ya tiene un frente abierto, aparece la barra con «Hitos» primero y el frente después.
  - [ ] En el hito 10 sin ningún frente: los hitos, con «Operación» como el que sigue y una línea gris «Todavía no hay frentes: la IA abre uno cuando haya algo grande para hacer».
- **MA-6 —** Como usuario quiero ver qué está aprobado y todavía no empezó, para saber cuándo llega lo que pedí (D-143).
  - [ ] «Por empezar» muestra cada frente que espera sin carpeta (en Iridium, Capacidades) con sus pasos: el título de su trabajo aprobado, tal cual. Sin trabajo aprobado, el título del frente y la línea gris «Los pasos se escriben al empezarlo».
  - [ ] Debajo, «Sin frente» con su cuenta: lo aprobado sin frente, con su título; los largos bajan de renglón. Lo que la IA está haciendo va primero, con «En curso».
  - [ ] Las ideas sin evaluar no están: siguen en Ideas.
- **MA-7 —** Como usuario quiero empezar un frente que espera.
  - [ ] «Empezar este frente» lo cita arriba del campo de la conversación, sin enviar (D-131): al enviar, va «Empezá el frente <nombre>» y lo que escriba el usuario; la ✕ lo saca.
  - [ ] Cuando la IA abre su carpeta, el frente deja «Por empezar» y aparece en la barra con su ruta.
- **MA-8 —** Como usuario quiero encontrar en el Mapa una idea que aprobé (criterio de éxito de `definicion.md`).
  - [ ] Si la IA ya la ubicó, es un paso de la ruta de su frente.
  - [ ] Si tiene frente pero todavía no está en su ruta, aparece debajo del camino de ese frente, en «Aprobado, sin lugar en la ruta», hasta que la IA la ubique al cerrar su próxima iteración en el frente (D-139).
  - [ ] Si no tiene frente, está en «Por empezar» › Sin frente.
- **MA-9 —** Como usuario quiero que el Mapa sirva en un proyecto cuyos frentes todavía no tienen ruta (definición › Must).
  - [ ] Un frente sin «Ruta» muestra como camino los pasos del método de su `estado.md` (Propuesta, Definición…) con su estado, y arriba la línea gris «Todavía sin ruta: la IA la escribe la próxima vez que trabaje en este frente».
  - [ ] Una línea de la ruta que Iridium no entiende se muestra tal cual, en gris, y el control del framework la avisa.

## Flujos
**MA-10 — De idea aprobada a paso hecho**
1. El usuario aprueba una idea en Ideas → en `trabajo.md` queda `pendiente`.
2. En el Mapa: con frente, en «Aprobado, sin lugar en la ruta» de ese frente; sin frente, en «Por empezar» › Sin frente.
3. La IA trabaja en ese frente y, al cerrar la iteración, la ubica con una línea en la ruta → pasa a ser un paso del camino, en su lugar.
4. La IA la hace → el paso queda hecho; cuando ya no es el último hecho, se pliega con los de antes.

**MA-11 — Empezar un frente**
1. Por empezar › Empezar este frente → la cita en la conversación (MA-7); el usuario envía.
2. La IA abre la carpeta del frente con su propuesta y su ruta → el frente pasa a la barra; lo suyo deja «Por empezar».

**MA-12 — Errores**
- No se puede leer `estado.md` o el de un frente (archivo borrado, mal escrito): un Recuadro de error en lugar del camino, con qué archivo falta; las otras pestañas siguen andando.
- Una tabla o una ruta con un estado fuera del vocabulario: se muestra la palabra tal cual, en gris, con el aviso del framework (como hoy, H-7).
- La IA cambia la ruta mientras se mira: el camino se redibuja solo, sin mover la pestaña ni lo desplegado.

## Pantallas
### W-7 — Mapa de un proyecto
- Propósito: ver qué se va a hacer y en qué orden, frente por frente (MA-1 a MA-9).
- Wireframe: las maquetas `mapa-b.html` (en operación; la pestaña Revisión de la app muestra un frente sin ruta, Diseño uno con «Aprobado, sin lugar en la ruta») y `mapa-hitos.html` (Alfa, en el hito 7).

En operación:
```
Mapa  Hito 10 · Operación
 Mapa · Ideas · Apariencia · Compartir · Diseño · Orden · …        Por empezar 19
 ──────────────────────────────────────────────────────────────────────────────
 Mapa  En curso
  [+] 3 hechos antes
   ●  Decidir qué muestra el Mapa y qué deja de mostrar
   ◉  Dibujar cómo se usa, también antes del hito 10          Te espera
   ○  Enseñarle a la IA a escribir la ruta, con su control
   │
   ├─○ Mostrar la ruta en el celular
   ○  Dibujar el camino de un frente, con sus ramas
```

Antes del hito 10:
```
Mapa  Hito 7 · Construcción
  [+] 6 hechos antes
   ●  UI
   ◉  Construcción
   ├─● Crear una nota y verla en la lista
   ├─○ Buscar entre las notas                                 Te espera
   └─○ Exportar las notas a un archivo
   ○  Pruebas y calidad
   ○  Lanzamiento
   ○  Operación
```
- Estados:
  - **Sin `estado.md`:** es una carpeta simple (W-3).
  - **Un frente sin ruta:** los pasos del método con la línea gris de MA-9.
  - **Un frente con todo hecho:** el último hecho a la vista, los demás plegados, y la línea gris «Todo hecho por ahora. Lo que venga, la IA lo suma a la ruta».
  - **Por empezar sin nada:** la pestaña no se muestra.
  - **Error:** el Recuadro de error de MA-12.
  - **Extremos:** muchos frentes → la barra se desplaza de costado; una ruta larga → la lista se desplaza y la barra queda arriba; un nombre larguísimo baja de renglón; muchas ramas de un paso → todas, con sangría, sin plegar.
- En ancho chico (con la conversación ancha): el camino ocupa todo el ancho y «Te espera» baja debajo del nombre del paso.

## Lo que cambia en el Mapa de hoy
- Se va: la fila de hitos en operación, el bloque del frente activo (paso del método, Próximo paso, «En curso», «En tu bandeja»), las líneas «En espera» y «En operación» y «Lo último de la IA» (D-141).
- Queda: el aviso de un estado fuera del vocabulario y el salto a Docs (H-8).
- Sin color por frente (R-59): con un frente a la vez, el nombre de arriba ya dice cuál es; sumaría tokens y ruido (se pregunta en Q-202).

## Piezas de UI nuevas
| Pieza | Por qué hace falta | Agregada al sistema |
|---|---|---|
| Camino de pasos (el carril con sus puntos: hecho, el que sigue, te espera, en pausa, descartado, lo que viene; las ramas con su codo; la línea de plegados) | ninguna pieza dibuja una secuencia con ramas | no (está en la maqueta; pasa a `piezas.css` al construir) |

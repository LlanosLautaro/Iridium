# Definición del módulo: Mapa

**Fecha:** 2026-11-17
**Estado:** aprobada en Q-199 (D-141); Q-200 → D-142, Q-201 → D-143
**Base:** `propuesta.md`, D-138 (un frente a la vez, pasos concretos, sin ruido), D-139 (la ruta en el `estado.md` de cada frente) y la maqueta `docs/diseno/pantallas/mapa-b.html`.

## Objetivo del módulo
Ver, en cada proyecto, **qué se va a hacer y en qué orden**, frente por frente, sin leer documentos: un camino de pasos con nombre concreto, el foco en el que sigue, y dónde cae cada idea aprobada.

## Criterios de éxito
- Al abrir el Mapa se ve, sin desplazar, el paso que sigue del frente activo y los dos o tres de después.
- Cada paso se entiende sin abrir nada: dice qué se va a hacer («Sonar cuando Iridium termina una tarea»), no un paso del método («Construcción»).
- Se ve de un vistazo qué espera al usuario («Te espera») y qué está en pausa.
- Una idea aprobada se encuentra en el Mapa: en la ruta de su frente o en «Por empezar».
- Mirar el Mapa no gasta uso: Iridium dibuja lo que la IA ya dejó escrito.
- Sirve en cualquier proyecto que siga el framework, aunque sus frentes todavía no tengan ruta.

## Funcionalidades
### Must (MVP del módulo)
- **La barra de frentes arriba:** una pestaña por frente con carpeta (el activo primero; los demás, en el orden de la tabla `## Módulos`) y, al final, **«Por empezar»** con su cuenta. Al entrar, el activo; al volver al proyecto, la pestaña que se dejó.
- **La cabecera:** «Mapa» y el hito («Hito 10 · Operación»); debajo, el nombre del frente y su estado en palabras: En curso, En uso, En pausa, Sin empezar.
- **El camino de un frente:** vertical, un paso por línea con su nombre completo (los largos bajan de renglón, no se cortan). Cada paso con su marca:
  - **hecho:** el punto lleno;
  - **el que sigue:** el primero sin hacer del camino, resaltado (el foco);
  - **te espera:** el paso que nombra una `Q-n` abierta lleva «Te espera» en ámbar; un clic lleva a esa pregunta en la Bandeja;
  - **en pausa:** si el frente está en pausa, el que sigue dice «En pausa» (o el motivo corto que escriba la IA);
  - **descartado:** apagado y tachado;
  - **lo que viene:** el punto vacío.
- **Las ramas:** salen del paso del que nacen, con sangría y su codo; se marcan igual.
- **Los hechos de antes, plegados:** quedan a la vista el último hecho y lo que sigue; los anteriores, en una línea «N hechos antes» que se despliega con un clic.
- **«Por empezar»:** los frentes que esperan y no empezaron, cada uno con sus pasos y **Empezar este frente**, que lo cita arriba del campo de la conversación, sin enviar (como Hablar de esta idea, D-131); y **«Sin frente»**, lo aprobado que todavía no tiene frente. Sale solo de `trabajo.md` (D-143): cada frente `pendiente` sin carpeta con sus `T-n` abiertos, y los `T-n` `pendiente` o `en curso` sin frente, con su título.
- **Un frente sin ruta todavía** (los proyectos de antes de este cambio): su camino son los pasos del método de su `estado.md` (Propuesta, Definición…), con una línea gris «Todavía sin ruta: la IA la escribe la próxima vez que trabaje en este frente». El Mapa nunca queda vacío.
- **Antes del hito 10** (D-142): sin pestañas, el camino son los hitos; el actual es el que sigue y debajo, como rama, sus pasos (la lista del portón) o, en la construcción, sus iteraciones con su objetivo.
- **La ruta en el framework** (D-139, D-086, D-092), en el mismo cambio que su lector, el control y sus pruebas: la sección `## Ruta` en la plantilla del `estado.md` de un frente; el framework le enseña a la IA a escribirla al abrir un frente, a ponerla al día al cerrar cada iteración y a ubicar ahí cada idea que se aprueba; el control marca una ruta mal escrita (una marca que no existe, una rama sin paso del que salga) y un frente en curso sin ruta.
- **Las rutas de los frentes de Iridium**, escritas por la IA desde la maqueta y lo que hay hoy en cada frente.
- **Lo que deja de mostrar el Mapa** en operación (el ruido de D-138): la fila de hitos, el bloque del frente activo (su paso del método, el Próximo paso, «En curso» y «En tu bandeja»), las líneas «En espera» y «En operación» y «Lo último de la IA». Lo que espera al usuario sigue en la Bandeja y en el «Te espera» de su paso; el Próximo paso, en `estado.md` (Docs).

**Cómo se escribiría la ruta** (borrador; se cierra en el diseño técnico): una lista de casillas, un paso por línea, con dos espacios de sangría para una rama:

```markdown
## Ruta
- [x] Pensar para qué sirve el Mapa
- [ ] Definir qué muestra el Mapa (Q-199)
- [ ] Dibujar el camino de un frente, con sus ramas
  - [ ] Mostrar la ruta en el celular
- [-] Un gráfico con Mermaid
```

`[x]` es hecho, `[ ]` lo que viene, `[-]` descartado; una `Q-n` al final de la línea, si está abierta, lo vuelve «Te espera». El que sigue lo calcula Iridium (el primero sin hacer): la IA no tiene que moverlo.

### Should
- Un clic en un paso hecho lleva a su iteración en el `estado.md` del frente (Docs), si la línea nombra una (`ID-I3`), sin mostrar el código.
- El color por frente (R-59): pide tokens nuevos; se ve en la UX si suma o es ruido.
- Con el teclado: las flechas pasan de una pestaña a otra; se define en la UX.

### Could
- Una vista «Todos los frentes» con el que sigue de cada uno, en una línea por frente.
- Mover un paso de lugar arrastrándolo (hoy se le pide a la IA).

### Won't (por ahora)
- Kanban o tarjetas que se mueven a mano — descartado en Q-193.
- Un gráfico de red (Mermaid o propio) — se vuelve una maraña y corta los nombres (D-138).
- Fechas o plazos en los pasos — el usuario no trabaja con fechas, sino con el orden.
- Que la IA reescriba las rutas por su cuenta sin trabajar en el frente — gasta uso (D-139).

## Fuera de alcance
- Las preguntas, los comentarios de la Revisión y las ideas sin evaluar: siguen en la Bandeja, la Revisión e Ideas.
- Ordenar las 45 cosas abiertas de `trabajo.md`: el Mapa muestra el orden que la IA escribe; repasarlas es otra tarea (la IA las ubica a medida que toca cada frente).

## Impacto en el perfil
Sigue en P2. Lee archivos del proyecto que Iridium ya lee; no hay datos nuevos ni conexiones.

## Términos nuevos (se agregan al glosario general)
| Término | Significado |
|---|---|
| Ruta | La lista de pasos concretos de un frente, en orden, en su `estado.md` |
| Paso (de una ruta) | Una acción con nombre propio («Pegar imágenes en una idea»), no un paso del método |
| Por empezar | Los frentes que esperan y lo aprobado que todavía no tiene frente |

## Preguntas abiertas para investigar
(ninguna: Q-199 a Q-201 respondidas)

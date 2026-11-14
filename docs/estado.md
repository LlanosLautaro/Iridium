# Estado del proyecto

> Este archivo es lo primero que lee la IA en cada sesión. Cabe en una pantalla: el historial va al documento del hito.

**Proyecto:** Iridium (carpeta «Centro de Desarrollo», D-033)
**Última actualización:** 2026-11-14
**Nivel de protección:** P2 — personal conectado (ver `perfil-proyecto.md`)

## Hito actual
10 — Operación — en curso

## Progreso de hitos
| # | Hito | Estado | Documento |
|---|---|---|---|
| 0 | Idea cruda | hecho | `00-idea.md` |
| 1 | Exploración | hecho | `01-exploracion.md` |
| 2 | Definición y alcance | hecho | `02-definicion.md` |
| 3 | Investigación de dominio | hecho | `03-investigacion.md` |
| 4 | UX | hecho | `04-ux.md` |
| 5 | Arquitectura técnica | hecho | `05-arquitectura.md` |
| 6 | UI | hecho | `06-ui.md` |
| 7 | Construcción | hecho | `07-construccion.md` |
| 8 | Pruebas y calidad | hecho (portón aprobado en Q-108, 2026-11-02) | `08-calidad.md` |
| 9 | Lanzamiento | hecho (portón aprobado en Q-111, 2026-11-02) | `09-lanzamiento.md` |
| 10 | Operación | en curso | `10-operacion.md` |

## Módulos
| Frente | Tipo | Paso | Estado |
|---|---|---|---|
| Revisión de la app (`modulos/revision/estado.md`) | producto hermano | en operación (con el hito 10) | hecho |
| Skills (`modulos/skills/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Compartir (`modulos/compartir/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Apariencia y ajustes (`modulos/apariencia/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Inicio (`modulos/inicio/estado.md`) | sección | en operación (con el hito 10) | hecho |
| Diseño (`modulos/diseno/estado.md`) | sección | 7. Construcción (DI-I3 en curso: tanda 1 probada; tanda 2, los botones, espera la prueba Q-163) | en curso |
| Orden (`modulos/orden/estado.md`) | sección | 7. Construcción (OR-I4, espera la prueba; el paso 8 espera el rediseño, D-102) | en curso |
| Capacidades (T-28) | sección | 1. Propuesta (detrás de Diseño, D-102) | pendiente |

## En qué estamos ahora
**Desde el 2026-11-07 el frente activo es Diseño** (D-102): un «Claude Design» local dentro de Iridium, en negro como único tema (D-103, D-104), con verde solo en el botón principal (D-109). Las pantallas son **maquetas HTML** que escribe la IA, se miran vivas, se comentan con `F8` y lo aprobado se pasa al código (D-105). Con Q-151 (D-106) va primero la sección (DI-I1), después el rediseño de Iridium en maquetas (DI-I2), su pase al código (DI-I3) y al final Otra versión y Probar una dirección (DI-I4). **DI-I1 (la sección) está hecha** (Q-152). **DI-I2: la tanda 1 está aprobada** (Q-154); antes, la dirección de las primeras 16 maquetas quedó aprobada y tus comentarios están corregidos, con la regla «sin ruido» (D-108); la maqueta grande suma **Comentar** y las flechas del teclado. Tu segunda ronda (R-25 a R-45) también está aplicada: sin texto de relleno, el botón principal verde (D-109), español neutro (D-110), sin la Bandeja de todos (D-111) y Git como en VS Code. Con Q-155 (D-112) Trabajo sale de la vista e Ideas es un bloc de notas. La tanda 2 está aprobada (Q-157) y **DI-I2 queda hecha**. Con Q-159 (D-114) cada token del sistema lleva una línea de para qué se usa, que Diseño › Sistema muestra, los estilos de texto tienen nombre (T-61, D-116) cada pieza tiene su ficha con para qué sirve, sus estados y los tokens que usa (T-62, D-117) y las medidas fijas (la barra, los controles, las filas, los paneles) también son tokens (T-63, D-119). **El sistema está completo y DI-I3 (pasarlo al código) empezó:** con la tanda 1 la app ya es negra, con un solo tema y un solo `tokens.css` para la app y las maquetas (D-121); las formas pasan a las piezas en las tandas que siguen. La tanda 1 está probada (Q-162) y tus comentarios R-50 a R-52 están resueltos (la cuenta sin píldora, la letra sin el rosa al desplazar, el cursor en el campo con Nueva). Con la tanda 2 las piezas ya están en la app y todos los botones son la pieza Botón (espera tu prueba, Q-163). Con Q-158 (D-115) el framework sabe pasar un design system guardado en otro lado; ese proyecto ya lo pasó (Q-160), y con Q-161 (D-118) los proyectos se van a enterar solos de lo que el framework les pide (T-64, frente Orden, después de Diseño). Antes de mostrarte una maqueta, la IA la repasa con las guías de impeccable pasadas al framework (Q-156, D-113). Las ideas de los repos de referencia quedaron como T-55 a T-57 en Capacidades (Q-153).
Antes, el frente **Orden** (D-091): OR-I1 a OR-I3 hechas y probadas; OR-I4 (el Mapa con frentes y Skills › Framework) construida, espera tu prueba (Q-146). **Nuevo proyecto** arma solo la plantilla básica, sin la IA (D-101).
Compartir está publicado; falta la invitación (Q-126).

## Preguntas abiertas
- **Q-163 — Probá DI-I3, tanda 2: los botones nuevos en toda la app**
  Tipo: prueba · Frente: Diseño
  Contexto: tocá **Actualizar** abajo para tener esta versión. Cambian solo los botones: el resto se ve como antes hasta que su sección pase a las piezas. Detalle en `modulos/diseno/estado.md` › DI-I3, tanda 2.
  - [ ] En la grilla, **Nuevo proyecto** es el único verde (delineado, sin relleno); al pasar el mouse se aclara y toma un fondo verde muy oscuro
  - [ ] En **Nuevo proyecto** y en **Eliminar** (clic derecho en una tarjeta), Cancelar va sin borde; Crear es verde y Eliminar rojo, los dos delineados
  - [ ] En un proyecto, la conversación: **Seguí** en verde, **Nueva** sin borde y el botón de enviar como un ícono chico
  - [ ] En la **Bandeja**, el botón del proyecto pasa a verde cuando no queda nada sin responder
  - [ ] En **Ajustes**, «Cambiar de cuenta» y «Cambiar…» van sin borde
  - [ ] Recorriendo Mapa, Archivos, Git, Scripts, Revisión, Diseño, Skills e Ideas, ningún botón quedó sin borde donde había uno, cortado, desalineado o de otro alto que sus vecinos

- **Q-146 — Probá OR-I4: el Mapa con frentes y Skills › Framework**
  Tipo: prueba · Frente: Orden
  Contexto: tocá **Actualizar** abajo para tener esta versión. Detalle en `modulos/orden/estado.md` › OR-I4. No toques **Pasar al framework** en un proyecto tuyo salvo que quieras pasarlo de verdad: manda el pedido a su IA y gasta uso.
  - [ ] El **Mapa** de Iridium muestra arriba la fila de hitos y, debajo, Orden como frente activo con su paso, su Próximo paso, lo que está en curso y lo de tu bandeja; abajo, «En espera: Diseño · Capacidades» y «En operación» con los demás
  - [ ] Tocar un hito muestra su detalle y **Volver** trae el bloque; un frente de las líneas de abajo abre su `estado.md`
  - [ ] En **Skills** (Ctrl+3), **Framework** es la primera entrada, con la cuenta en gris; ahí están tus proyectos con cómo está cada uno y los filtros
  - [ ] En la grilla, tocar «! N avisos del framework» de una tarjeta (si alguna tiene) abre esa lista en Framework; con clic derecho, el menú ofrece **Pasar al framework** en los de framework viejo
  - [ ] Una carpeta sin `docs/estado.md` entra a Archivos con el recuadro punteado «Esta carpeta no sigue el framework» y sin Mapa ni Trabajo en su barra
  - [ ] En Docs, una tabla ancha (por ejemplo la de Módulos de `estado.md` con el ancho de lectura más angosto) ocupa el ancho de la sección y se desplaza de costado dentro de su recuadro

- **Q-126 — Invitá a la otra persona al repo de Iridium**
  Tipo: tarea · frena
  Contexto: D-085 y Q-123 (A). Sin la invitación, su Iridium no ve las versiones nuevas (le aparece «Sin acceso a las versiones nuevas»). Si preferís, pasame su usuario de GitHub en la respuesta y la invito yo.
  - [ ] Le pasé la carpeta `Iridium para compartir` del escritorio (o el `.zip` de la última versión en GitHub)
  - [ ] En `github.com/LlanosLautaro/Iridium` › Settings › Collaborators › Add people, la invité con su usuario
  - [ ] Aceptó la invitación y en su Iridium tocó **Iniciar sesión** abajo; el aviso desapareció

Respuesta: en el chat o en `respuestas/Q-n.md` (adjuntos en `respuestas/Q-n/`).

## Próximo paso
Diseño: DI-I3, tanda 3 — el marco con lo de T-58 (la barra de abajo sin ruido, el `chip` de estado como Señal, PZ-7). Si llegan Q-163 o Q-146, procesarlas antes.
**Leer antes:** `modulos/diseno/estado.md` › Próximo paso.

## Hitos con huecos aceptados
- Hito 9: sin versión etiquetada ni `CHANGELOG.md`, por ahora (D-077).

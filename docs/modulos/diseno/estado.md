# Estado del módulo: Diseño

**Tipo:** sección (un «Claude Design» local dentro de Iridium; D-102)
**Última actualización:** 2026-11-07
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (2026-11-07; Q-147 y Q-148, D-103) | `propuesta.md` |
| 2. Definición | hecho (2026-11-07) | `definicion.md` |
| 3. Investigación | descartado (lo de Claude Design y las skills de Anthropic ya está en la propuesta) | — |
| 4. UX | en curso (parte 2 rehecha con D-105; espera el visto bueno y el orden, Q-151) | `ux.md` |
| 5. Diseño técnico | pendiente | `diseno-tecnico.md` |
| 6. UI | pendiente | `06-ui.md` general y `DESIGN.md` |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Frente activado el 2026-11-07 a pedido del usuario (D-102), adelante de Capacidades y del paso 8 de Orden. Con Q-147 y Q-148 (D-103): primero las piezas compartidas y el negro aplicado (DI-I1), después la sección con Sistema y Pantallas (DI-I2) y Probar una dirección (DI-I3). La dirección es **negro sin acento**, y es el único tema (D-104, Q-149). El paso 4 está escrito (`ux.md`): el inventario de las 12 piezas (`PZ-1` a `PZ-12`) con lo que reemplaza cada una y cómo queda cada pantalla, y la sección Diseño. Con Q-150 el usuario cambió el modelo (D-105): **las pantallas son maquetas HTML** que escribe la IA en `docs/diseno/`, se miran vivas en Iridium, se comentan con `F8` y se prueban en otras versiones; lo aprobado se pasa al código. La parte 2 de `ux.md` quedó rehecha (`DS-1` a `DS-13`) y la definición, al día. Espera el visto bueno y el orden de las iteraciones (Q-151).

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `estado.md` › Módulos | Diseño en curso; Orden termina con Q-146 y su paso 8 espera el rediseño | D-102 | sí |
| `02-definicion.md` › Módulos previstos | El orden nuevo de los frentes | D-102 | sí |
| `DESIGN.md`, `06-ui.md`, `ui/tokens.css` | La dirección negra sin acento como único tema y las piezas compartidas (con DI-I1) | D-102, D-103, D-104 | no |
| Ajustes › Apariencia (frente Apariencia y ajustes) | Sin el selector de tema; fuera `IRIDIUM_TEMA`, las miniaturas y la corrida en Carbón (con DI-I1) | D-104 | no |
| `docs/README.md` › Códigos | `PZ-n` (piezas) y `DS-n` (la sección Diseño) | — | sí |
| `02-definicion.md` › Glosario | Pieza, Dirección, Pantallas | D-103 | sí |
| El framework | El formato `docs/diseno/` (maquetas), con su lector y su control; `referencias/06-ui.md` dice cómo se arman las maquetas | D-086, D-102, D-105 | no |
| `02-definicion.md` › Glosario | «Pantallas» son maquetas; suma «Maqueta» | D-105 | sí |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| DI-I1 | El formato `docs/diseno/` (con su lector y su control) y la sección Diseño: Pantallas con las maquetas vivas, Sistema y `F8` sobre una maqueta | pendiente |
| DI-I2 | El rediseño de Iridium en maquetas: tokens en negro, las 12 piezas y sus pantallas, revisadas en la sección | pendiente |
| DI-I3 | Pasar al código: las piezas en `src/renderer/ui/`, las secciones pasadas a ellas, el negro como único tema y la app de antes y de ahora lado a lado | pendiente |
| DI-I4 | Otra versión de una pantalla y Probar una dirección, lado a lado, y quedarse con una | pendiente |

El orden es el recomendado en Q-151; si el usuario elige otro, se reordena.

## Log de iteraciones

## Próximo paso
Con Q-151: cerrar el paso 4 (si pide cambios, corregir `ux.md` primero), ordenar las iteraciones según lo elegido y escribir `diseno-tecnico.md` (paso 5): el formato `docs/diseno/` (tokens, piezas, maquetas por sección, versiones, direcciones y qué pasó al código) con su lector y su control; cómo se muestran las maquetas vivas en Iridium sin riesgo (son HTML del proyecto) y cómo se redibujan al cambiar; el ayudante de la Revisión (`F8`) dentro de una maqueta; las piezas en `src/renderer/ui/` y el control de estilos por sección para el pase al código. Después, la primera iteración.
**Leer antes:** `ux.md` (parte 2), D-105 y `respuestas/Q-151.md`; para `F8`, `modulos/revision/diseno-tecnico.md` › R-I3.

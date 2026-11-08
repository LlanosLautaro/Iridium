# Estado del módulo: Diseño

**Tipo:** sección (un «Claude Design» local dentro de Iridium; D-102)
**Última actualización:** 2026-11-08
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (2026-11-07; Q-147 y Q-148, D-103) | `propuesta.md` |
| 2. Definición | hecho (2026-11-07) | `definicion.md` |
| 3. Investigación | descartado (lo de Claude Design y las skills de Anthropic ya está en la propuesta) | — |
| 4. UX | hecho (2026-11-08; Q-151 → D-106) | `ux.md` |
| 5. Diseño técnico | hecho (2026-11-08; S-4, D-106) | `diseno-tecnico.md` |
| 6. UI | descartado como paso aparte: la sección se arma con las piezas de hoy en DI-I1 y su UI nueva va en las maquetas de DI-I2 (D-105, D-106) | `docs/diseno/` (DI-I2) |
| 7. Construcción | en curso (DI-I1 por empezar) | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Frente activado el 2026-11-07 (D-102), adelante de Capacidades y del paso 8 de Orden. La dirección es **negro sin acento**, único tema (D-103, D-104). Las pantallas son **maquetas HTML** que escribe la IA en `docs/diseno/`, se miran vivas en Iridium, se comentan con `F8` y lo aprobado se pasa al código (D-105). Pasos 1 a 5 hechos: el orden es la sección (DI-I1), el rediseño de Iridium en maquetas (DI-I2), pasarlo al código (DI-I3) y Otra versión y Probar una dirección (DI-I4) (D-106); el diseño técnico, con S-4, muestra las miniaturas en un `iframe` aislado y la grande en un `webview` donde anda `F8`. Sigue la construcción de DI-I1.

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `estado.md` › Módulos | Diseño en curso; Orden termina con Q-146 y su paso 8 espera el rediseño | D-102 | sí |
| `02-definicion.md` › Módulos previstos | El orden nuevo de los frentes | D-102 | sí |
| `DESIGN.md`, `06-ui.md`, `ui/tokens.css` | La dirección negra sin acento como único tema y las piezas compartidas (con DI-I1) | D-102, D-103, D-104 | no |
| Ajustes › Apariencia (frente Apariencia y ajustes) | Sin el selector de tema; fuera `IRIDIUM_TEMA`, las miniaturas y la corrida en Carbón (con DI-I1) | D-104 | no |
| `docs/README.md` › Códigos | `PZ-n` (piezas) y `DS-n` (la sección Diseño) | — | sí |
| `02-definicion.md` › Glosario | Pieza, Dirección, Pantallas | D-103 | sí |
| El framework | El formato `docs/diseno/` (maquetas), con su lector y su control; `referencias/06-ui.md` dice cómo se arman las maquetas; el campo **Maqueta** del `R-n.md` (con DI-I1) | D-086, D-102, D-105 | no |
| `05-arquitectura.md` › Spikes y › Puntos de extensión | S-4 y las páginas web dentro de la app (B-5) resueltas | D-106 | sí |
| `05-arquitectura.md` › Seguridad y › Modelo de datos | Iridium escribe en `docs/diseno/` (DI-I4); `diseno.json` en los datos del Centro (DI-I1) | D-105, D-106 | no |
| `CLAUDE.md` | La variable `IRIDIUM_AYUDANTE` (con DI-I1) | D-106 | no |
| `02-definicion.md` › Glosario | «Pantallas» son maquetas; suma «Maqueta» | D-105 | sí |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| DI-I1 | El formato `docs/diseno/` (con su lector y su control) y la sección Diseño: Pantallas con las maquetas vivas, Sistema y `F8` sobre una maqueta | pendiente |
| DI-I2 | El rediseño de Iridium en maquetas: tokens en negro, las 12 piezas y sus pantallas, revisadas en la sección | pendiente |
| DI-I3 | Pasar al código: las piezas en `src/renderer/ui/`, las secciones pasadas a ellas, el negro como único tema y la app de antes y de ahora lado a lado | pendiente |
| DI-I4 | Otra versión de una pantalla y Probar una dirección, lado a lado, y quedarse con una | pendiente |

El orden es el de Q-151 (D-106). El detalle de cada una, en `diseno-tecnico.md` › Iteraciones.

## Log de iteraciones

## Próximo paso
DI-I1, primer paso: confirmar con un `webview` que un enlace entre maquetas cambia de pantalla (lo que S-4 no midió); después, el formato `docs/diseno/` en el framework con su lector y su control, la muestra de pruebas y la sección (Pantallas, la grande, Sistema, `F8` y Pedírselo a la IA).
**Leer antes:** `diseno-tecnico.md` (entero: es la guía de la iteración), `ux.md` › DS-11 a DS-13, `spikes/S-4-maquetas/README.md` y, para el control, `modulos/orden/diseno-tecnico.md` › El control.

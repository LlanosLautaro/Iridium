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
| 4. UX | en curso | `ux.md` |
| 5. Diseño técnico | pendiente | `diseno-tecnico.md` |
| 6. UI | pendiente | `06-ui.md` general y `DESIGN.md` |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Frente activado el 2026-11-07 a pedido del usuario (D-102), adelante de Capacidades y del paso 8 de Orden. Con Q-147 y Q-148 (D-103): primero las piezas compartidas y el negro aplicado (DI-I1), después la sección con Sistema y Pantallas (DI-I2) y Probar una dirección (DI-I3). La dirección es **negro sin acento**: lo activo en blanco, solo el ámbar y el rojo como señales. `negro.css` ya está en esa versión; sus pantallas, en `tools/salida/auditoria/1440x900-negro/` (29 de 30: la del detalle de Ideas no salió por tiempo). La definición está escrita; sigue el paso 4: el inventario de piezas sobre las 30 pantallas.

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `estado.md` › Módulos | Diseño en curso; Orden termina con Q-146 y su paso 8 espera el rediseño | D-102 | sí |
| `02-definicion.md` › Módulos previstos | El orden nuevo de los frentes | D-102 | sí |
| `DESIGN.md`, `06-ui.md`, `ui/tokens.css` | La dirección negra sin acento y las piezas compartidas (con DI-I1; los temas, Q-149) | D-102, D-103 | no |
| `02-definicion.md` › Glosario | Pieza, Dirección, Pantallas | D-103 | sí |
| El framework | El formato `docs/diseno/`, con su lector y su control | D-086, D-102 | no |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| DI-I1 | Las piezas compartidas, las secciones pasadas a ellas, `tokens.css` en negro sin acento y la página con las 30 pantallas lado a lado | pendiente |
| DI-I2 | El formato `docs/diseno/` (con su lector y su control) y la sección Diseño con Sistema y Pantallas | pendiente |
| DI-I3 | Probar una dirección: otro juego de tokens sobre todas las pantallas, lado a lado, y aplicarlo | pendiente |

## Log de iteraciones

## Próximo paso
Paso 4 (UX): escribir `ux.md` con el inventario de piezas mirando las 30 pantallas (`tools/salida/auditoria/1440x900/` y `-negro/`, con las skills `design-critique` y `design-system`): qué arma cada sección a mano, qué pieza la reemplaza y dónde sobran cajas y bordes; y los flujos de la sección Diseño (Sistema, Pantallas, Probar una dirección). Después, el paso 5 y DI-I1.
**Leer antes:** `definicion.md` y Q-149 si llegó.

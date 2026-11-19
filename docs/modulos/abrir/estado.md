# Estado del módulo: Abrir

**Tipo:** sección (T-80)
**Última actualización:** 2026-11-19
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (aprobada en Q-208, D-148; pasada adelante en D-153) | `propuesta.md` |
| 2. Definición | hecho (aprobada en Q-216, D-154) | `definicion.md` |
| 3. Investigación | descartado (no hay dominio de terceros: lo que falta saber va al diseño técnico) | — |
| 4. UX | en curso (espera Q-217) | `ux.md` |
| 5. Diseño técnico | pendiente | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | pendiente | — |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Abierto el 2026-11-19, adelante de Diseño (D-153). Definición aprobada (D-154): dos partes, primero **Abrir** (AB-I1) y después la **actualización automática** de las apps de escritorio, sin IA, prendida de entrada y apagable por proyecto (AB-I2). UX escrita: espera Q-217.

## Ruta
- [x] Pensar qué resuelve y por qué va primero
- [x] Definir qué abre cada proyecto y cuándo se pone al día
- [ ] Dibujar dónde está Abrir y cómo se ve una app al día (Q-217)
- [ ] Decidir cómo se marca en `scripts.md` y cómo lo lee Iridium
- [ ] Enseñarle a la IA a marcar lo que abre el proyecto, con su control (AB-I1)
- [ ] Abrir desde la tarjeta y desde el proyecto (AB-I1)
- [ ] Armar solas las apps de escritorio con cambios, cuando están cerradas (AB-I2)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| El framework (`recursos/plugins/iridium`) | La marca de lo que abre el proyecto y de cómo se arma, en `SKILL.md` › Los scripts y en la plantilla, con su lector y su control | D-148 | no (AB-I1, AB-I2) |
| `02-definicion.md` › Glosario | «Lo que abre el proyecto» y «Actualización automática» | D-154 | sí (2026-11-19) |
| `04-ux.md` › W-2 y W-3 | El botón en el menú de la tarjeta y en la barra del proyecto; Ajustes del proyecto suma la actualización automática | — | no (al aprobarse la UX) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| AB-I1 | Abrir: la marca en `scripts.md` (framework, lector y control) y el botón en la tarjeta y en el proyecto | pendiente |
| AB-I2 | Actualización automática: armar solas, sin IA, las apps de escritorio con cambios, cerradas y sin IA trabajando | pendiente |

## Log de iteraciones
(Todavía ninguna.)

## Próximo paso
Con Q-217 respondida: cerrar la UX (y pasar a `04-ux.md` lo que toca a W-2 y W-3) y escribir el diseño técnico (`diseno-tecnico.md`): cómo se marca en `scripts.md`, cómo sabe Iridium que una app está abierta y con qué commit se armó, y qué reusa del armado de Iridium.
**Leer antes:** `ux.md`, `respuestas/Q-217.md`, `05-arquitectura.md` (las capas), `src/main/core/visor/scripts.ts`, `src/main/infra/sin-armar.ts` y `modulos/compartir/diseno-tecnico.md` › Cambios sin armar.

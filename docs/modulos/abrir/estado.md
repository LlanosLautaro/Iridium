# Estado del módulo: Abrir

**Tipo:** sección (T-80)
**Última actualización:** 2026-11-19
**Nivel de protección:** hereda P2.

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (aprobada en Q-208, D-148; pasada adelante en D-153) | `propuesta.md` |
| 2. Definición | en curso (espera Q-216) | `definicion.md` |
| 3. Investigación | descartado (no hay dominio de terceros: lo que falta saber va al diseño técnico) | — |
| 4. UX | pendiente | `ux.md` |
| 5. Diseño técnico | pendiente | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | pendiente | — |
| 7. Construcción | pendiente | este archivo |
| 8. Calidad | pendiente | este archivo |
| 9. Lanzamiento | pendiente | este archivo |

## En qué estamos ahora
Abierto el 2026-11-19, adelante de Diseño (D-153). Propuesta hecha y definición escrita: dos partes, primero **Abrir** (AB-I1) y después **mantener al día** las apps de escritorio (AB-I2). Espera tu visto bueno (Q-216).

## Ruta
- [x] Pensar qué resuelve y por qué va primero
- [ ] Definir qué abre cada proyecto y cuándo se pone al día (Q-216)
- [ ] Dibujar dónde está Abrir y cómo se ve una app al día
- [ ] Decidir cómo se marca en `scripts.md` y cómo lo lee Iridium
- [ ] Enseñarle a la IA a marcar lo que abre el proyecto, con su control (AB-I1)
- [ ] Abrir desde la tarjeta y desde el proyecto (AB-I1)
- [ ] Armar solas las apps de escritorio con cambios, cuando están cerradas (AB-I2)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| El framework (`recursos/plugins/iridium`) | La marca de lo que abre el proyecto y de cómo se arma, en `SKILL.md` › Los scripts y en la plantilla, con su lector y su control | D-148 | no (AB-I1, AB-I2) |
| `02-definicion.md` › Glosario | «Lo que abre el proyecto» y «Mantener al día» | — | no (al aprobarse la definición) |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| AB-I1 | Abrir: la marca en `scripts.md` (framework, lector y control) y el botón en la tarjeta y en el proyecto | pendiente |
| AB-I2 | Mantener al día: armar solas las apps de escritorio con cambios, cerradas y sin IA trabajando | pendiente |

## Log de iteraciones
(Todavía ninguna.)

## Próximo paso
Con Q-216 respondida: cerrar la definición y escribir la UX (`ux.md`): dónde está Abrir en la tarjeta y en el proyecto, y cómo se ve una app al día, armándose o con un armado que falló.
**Leer antes:** `definicion.md`, `respuestas/Q-216.md`, `04-ux.md` › Principios de interacción y `modulos/arranque/ux.md` (el aviso «Mientras no estabas»).

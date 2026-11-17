# Estado del módulo: Apariencia y ajustes

**Tipo:** sección
**Última actualización:** 2026-11-02
**Nivel de protección:** hereda P2 (no suma nada que salga de la PC).

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (Q-84) | `propuesta.md` |
| 2. Definición | hecho (D-065) | `definicion.md` |
| 3. Investigación | descartado (alcanza con mirar las apps de referencia en la UX) | — |
| 4. UX | hecho (maqueta `docs/ui/vista-ajustes.html`) | `ux.md` |
| 5. Diseño técnico | hecho | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | hecho: tema Carbón (D-066) y la ventana flotante | `06-ui.md`, `DESIGN.md`, `docs/ui/tokens.css` |
| 7. Construcción | hecho (AP-I1 aprobada, Q-88) | `07-construccion.md` › AP-I1 |
| 8. Calidad | hecho (con el hito 8, `08-calidad.md`; portón aprobado en Q-108) | este archivo |
| 9. Lanzamiento | hecho (con el hito 9, `09-lanzamiento.md`; portón aprobado en Q-111) | este archivo |

## En qué estamos ahora
AP-I1 está aprobada (Q-88): la ventana de Ajustes, los dos temas, los nombres y el tono funcionan, y las descripciones de Conciso y Proactivo quedaron bien. La construcción terminó y la calidad pasó con el hito 8 (los dos temas revisados, Q-108). Lanzado con el hito 9 (Q-111, 2026-11-02): el módulo está en uso y sigue con la operación del proyecto (hito 10).

## Ruta
- [x] Elegir el tamaño de la letra y el zoom
- [x] Poner tu nombre y el de la IA
- [x] Pasar Iridium al negro, como único tema
- [ ] Hacer tu propio tema con tokens, desde Ajustes (T-75)

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|
| `06-ui.md`, `DESIGN.md`, `docs/ui/tokens.css` | De un solo tema a dos: Iridium y Carbón (reemplaza esa parte de D-029) | D-066 | sí |
| `05-arquitectura.md` › Modelo de datos, La interfaz `Motor` y Abrir la app | `config.json` suma `tema`, `nombreUsuario`, `nombreIa` y `tono`; los estilos y el tono en el motor; el tema antes de la primera pintura | D-065, D-067 | sí |

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| AP-I1 | La ventana de Ajustes (⚙ y `Ctrl+,`) con Perfil, IA (nombre y tono) y Apariencia (Iridium o Carbón), guardada en `config.json`, el tema sin parpadeo al abrir y el tono en las sesiones (AJ-1 a AJ-3) | hecho, aprobada por el usuario (Q-88) |

## Próximo paso
Nada propio: el módulo está en operación con el proyecto. Sus errores y mejoras van a `trabajo.md`. Una idea nueva de apariencia (un tema claro, la foto del perfil) va a `trabajo.md`.
**Leer antes:** nada.

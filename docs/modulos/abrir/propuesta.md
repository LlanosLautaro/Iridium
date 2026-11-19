# Propuesta del módulo: Abrir

**Fecha:** 2026-11-19
**Tipo:** sección

## Qué problema resuelve
Dos problemas que se apoyan en el mismo dato (T-80):
1. **Saber cómo se abre lo que hace cada proyecto.** Hoy hay que buscarlo en Scripts, y otras personas que usan Iridium no saben cuál de todos es. No todos los proyectos son lo mismo: una app de escritorio se abre con su `.exe`, una página con su dirección, una herramienta de consola con un comando, y un proyecto sin nada que usar no tiene qué abrir.
2. **Mantener al día las apps de escritorio que se arman en la PC.** Iridium ya lo hace consigo misma (D-122): cuando hay cambios, arma sola y entra la versión nueva sin cortar a nadie. Las otras apps del usuario quedan atrasadas hasta que alguien corre su script de armar a mano.

## Por qué ahora
El usuario lo pasó adelante el 2026-11-19 (D-153): lo usa todos los días con sus otras apps de escritorio, y el frente Plantillas (D-150) necesita el mismo dato, el tipo de app, que este frente define.

## Cómo encaja en el producto
Iridium es donde el usuario dirige sus proyectos (`02-definicion.md`); abrir lo que hace un proyecto y tenerlo al día es el final natural de ese camino. Se apoya en Scripts (D-039), en la tarjeta de Inicio y en el armado solo de Iridium (D-122, `src/main/infra/sin-armar.ts`). El tipo de app que declara es el que usará Plantillas (D-150).

## Por qué es un módulo y no una funcionalidad
- [ ] Dominio propio que requiere investigación
- [x] Flujos de UX propios (el botón en la tarjeta y en el proyecto, el aviso de una versión nueva)
- [x] Ritmo de avance propio (dos partes, una detrás de la otra)
- [ ] Se activa, instala o distribuye por separado

Además cambia un formato del framework (`scripts.md`): va con el lector, el control y sus pruebas (D-086).

## Alternativas
- **Que el usuario siga usando Scripts:** ya existe, pero no dice cuál abre el proyecto y no mantiene nada al día.
- **Adivinar el script por su nombre** («Abrir…»): frágil; cada IA los nombra distinto.
- **Un instalador con actualización automática en cada app** (`electron-updater`): solo sirve para apps de Electron con instalador y obliga a publicar cada versión (`modulos/compartir/investigacion.md`); lo que se arma en la PC no lo necesita.

## Decisión
Seguir — aprobado en Q-208 (D-148) y pasado adelante en D-153.

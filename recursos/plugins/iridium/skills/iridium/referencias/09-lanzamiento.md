# Hito 9 — Lanzamiento

**Objetivo:** que la app llegue a sus usuarios de forma confiable y repetible, con lo necesario para instalarla, usarla y actualizarla. En una app personal, "lanzar" significa dejarla instalada y lista para el uso diario, con un proceso claro para actualizarla.

**Duración típica:** de una sesión (P1) a varias semanas (P4–P5 con tiendas y revisiones).

## Preguntas
1. ¿Cómo se instala o accede? (ejecutable, instalador, web, tienda, desde el código)
2. ¿Cómo se actualiza? ¿Automático o manual?
3. ¿Qué pasa con los datos del usuario al actualizar?
4. ¿Quién necesita saber que existe y cómo usarla?

## Actividades

**1. Proceso de build y versión.** Script o comando que genera la versión distribuible desde cero. Esquema de versiones (por ejemplo, SemVer: mayor.menor.parche) y `CHANGELOG.md`.

**2. Distribución.** Según la plataforma: ejecutable firmado o no, hosting web, publicación en tiendas (con sus requisitos: cuentas de desarrollador, capturas, descripciones, políticas).

**3. Migración de datos.** Si la versión cambia el formato de los datos guardados, la app tiene que migrarlos sin pérdida. Siempre con respaldo previo.

**4. Documentación de uso.** README del repo (qué es, cómo instalar, cómo desarrollar) y, si hay usuarios distintos del desarrollador, una guía de uso breve.

**5. Requisitos del nivel.** Aplica lo que corresponda del nivel de protección: políticas publicadas, monitoreo de errores, gestión de secretos en producción, copias de seguridad.

**6. Plan de vuelta atrás.** Cómo volver a la versión anterior si algo sale mal.

**7. Checklist previo.** Hito 8 aprobado, build limpio, versión y changelog actualizados, documentación al día.

## Checklist de salida
- [ ] Build reproducible con un comando o script documentado.
- [ ] Versión etiquetada y `CHANGELOG.md` actualizado.
- [ ] La app está instalada o accesible para sus usuarios.
- [ ] Proceso de actualización probado, incluida la migración de datos si aplica.
- [ ] README y guía de uso al día.
- [ ] Requisitos del nivel de protección para producción cumplidos.
- [ ] Plan de vuelta atrás documentado.

## Cómo escala según el perfil
- **P1–P2:** build reproducible, instalación local documentada, backups, changelog.
- **P3:** distribución controlada al grupo, comunicación de cambios.
- **P4:** tiendas o web pública, políticas legales, monitoreo, CI/CD, entorno de pruebas separado.
- **P5:** se suman revisiones legales y de cumplimiento previas.

## Plantilla — `docs/09-lanzamiento.md`

~~~markdown
# Lanzamiento

## Versión actual
v… — AAAA-MM-DD

## Build
- Comando:
- Requisitos del entorno:

## Distribución
- Dónde:
- Cómo se instala:
- Cómo se actualiza:

## Migraciones de datos
| Versión | Cambio | Cómo se migra |
|---|---|---|

## Requisitos de producción (nivel P_)
| Requisito | Estado |
|---|---|

## Vuelta atrás
- …

## Historial de lanzamientos
| Versión | Fecha | Notas |
|---|---|---|
~~~

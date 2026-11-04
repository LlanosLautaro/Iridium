# Lanzamiento

> Iridium es personal (P2, `perfil-proyecto.md`): «lanzar» es dejarlo instalado para el uso diario con un proceso claro para actualizarlo y para volver atrás. La mayor parte ya existe desde el módulo Compartir (CO-I2, CO-I5, CO-I6) y D-070; este hito lo junta, lo prueba como proceso y completa lo que falta.

## Versión actual
Sin número, por ahora (D-077): Ajustes › Acerca de muestra cuándo se armó y su commit (CO-I5). Más adelante, 1.0.0 y un número que sube con cada armado, con `CHANGELOG.md` (Q-109, opción A).

## Build
- **Comando:** `pnpm actualizar` (`scripts.md` › Armar la última versión), o **Armar** abajo en Iridium cuando hay cambios sin armar (CO-I6, D-071). Arma `dev` desde cero en `release\nueva` y mueve `main` al commit armado (D-070).
- **Requisitos del entorno:** Windows 11, Node y pnpm, las dependencias instaladas (`scripts.md` › Instalar dependencias). Electron 44.10.1 y `electron-builder` 26.18.0, los de `package.json`; el armado usa el Electron ya instalado, no descarga nada.
- **Lo que sale:** `release\win-unpacked\Iridium.exe` (unos 670 MB con Claude Code adentro), con los fusibles de D-076.

## Distribución
- **Dónde:** en esta PC, `release\win-unpacked` (`scripts.md` › Abrir Iridium), con el acceso directo del escritorio (`scripts.md` › Crear el acceso directo).
- **Cómo se instala:** no hay instalador: es la carpeta. Compartir con otras personas quedó fuera (D-069; la copia a mano de D-074 es aparte).
- **Cómo se actualiza:** armando. Con Iridium abierto, la versión nueva queda lista y entra al cerrar o con **Reiniciar ahora** (CO-I2); si no puede entrar, Iridium lo dice al abrir (Defecto 3).

## Migraciones de datos
Lo de Iridium vive en `%APPDATA%\Centro de Desarrollo`; los proyectos no se tocan al actualizar.

| Versión | Cambio | Cómo se migra |
|---|---|---|
| todas hasta hoy | Campos nuevos en `config.json` (por ejemplo, el tamaño, Defecto 17) | Cada campo que falta o no se entiende toma su valor de siempre al leer (`infra/config.ts`); un archivo que no se puede leer se guarda como `.roto` antes de seguir (Defecto 5) |

## Requisitos de producción (nivel P2)
| Requisito | Estado |
|---|---|
| Lo de seguridad de P2 | cumplido en el hito 8 (`08-calidad.md` › Seguridad) |
| Backups | los proyectos, con git (11 en GitHub); lo de Iridium se rehace en minutos (`08-calidad.md` › Seguridad) |
| Sin secretos en el código | cumplido (`08-calidad.md` › Seguridad) |

## Vuelta atrás
La versión anterior se borra apenas entra la nueva (`tools/cambiar-version.ps1`); volver es armarla de nuevo (D-078, Q-110):
- **Cómo:** `pnpm volver` (`scripts.md` › Volver a la versión anterior). Sin decirle cuál, pone la que estaba antes de la de ahora (según `release\actualizacion.log`); con `-Commit`, la que se le diga.
- **Qué hace:** arma ese commit en una copia aparte del código y lo pone como una versión nueva (entra al cerrar Iridium, o en el acto si está cerrado). `main` vuelve a ese commit, así Iridium ofrece Armar lo que quedó afuera.
- **Cuándo no sirve:** si ese commit no arma (por ejemplo, una dependencia que ya no se consigue). Ahí se elige otro con `-Commit`.
- **Datos:** no hace falta migrar nada hacia atrás: cada campo de `config.json` que una versión no entiende se ignora, y el que le falta toma su valor de siempre (Migraciones de datos).

## Historial de lanzamientos
| Versión | Fecha | Notas |
|---|---|---|
| a7c60ff | 2026-11-02 | La que cerró el hito 8 (Q-108): armada con Iridium abierto, entró al cerrarlo (`release\actualizacion.log`). Su commit quedó en el respaldo del historial viejo (D-084). |
| c012989 | 2026-11-04 | La segunda para compartir: avisa si falta iniciar sesión en GitHub (Q-123), trae la skill de Iridium y la guía (D-086) y guarda Ideas y Skills en `.iridium` (D-087). Probada de punta a punta con GitHub. Es la de `Iridium para compartir`. |
| aca3668 | 2026-11-04 | La primera publicada para compartir (D-085), en el repo nuevo: `iridium-2026-11-04-1759-aca3668` en GitHub. La copia de `Iridium para compartir` es esta. |

## Pendientes del hito
- [x] Q-109: sin número por ahora (D-077).
- [x] Q-110: la vuelta atrás, `pnpm volver` (D-078).
- [x] `README.md` del repo al día: qué es, cómo se arma y se usa, cómo está hecho y dónde está la documentación (2026-11-02).
- [x] Probar el proceso entero (2026-11-02). Armar con Iridium abierto y entrar al cerrar: es como se pusieron las últimas versiones (a7c60ff, la de hoy, y las siete anteriores en `release\actualizacion.log`), con Acerca de mostrando el commit. Volver atrás: `pnpm volver` en una carpeta de prueba eligió sola 4b248bd (la puesta antes que a7c60ff), la armó en una copia aparte, la puso, abrió y lleva ese commit; `dev` y `main` no se tocaron y la copia se borró. Lo único sin probar es mover `main` hacia atrás en GitHub, que solo pasa con la app de verdad. La primera vuelta encontró dos problemas, arreglados: la copia en la carpeta temporal no reusaba las dependencias ni traía Electron (pasó a `release\volver`, en el mismo disco) y las rutas largas no la dejaban borrar.

## Portón
- [x] Build reproducible con un comando o script documentado: `pnpm actualizar` o **Armar** (Build).
- [ ] Versión etiquetada y `CHANGELOG.md` actualizado: hueco aceptado, sin número por ahora (D-077).
- [x] La app está instalada o accesible para sus usuarios: `release\win-unpacked` y el acceso directo (Distribución).
- [x] Proceso de actualización probado, incluida la migración de datos si aplica (Pendientes del hito; Migraciones de datos).
- [x] README y guía de uso al día: `README.md` y `scripts.md`.
- [x] Requisitos del nivel de protección para producción cumplidos (Requisitos de producción).
- [x] Plan de vuelta atrás documentado y probado: `pnpm volver` (Vuelta atrás, D-078).
- [x] Aprobación del usuario: Q-111 (2026-11-02, opción A).

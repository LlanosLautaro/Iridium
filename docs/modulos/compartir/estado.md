# Estado del módulo: Compartir

**Tipo:** sección
**Última actualización:** 2026-11-16
**Nivel de protección:** hereda P2; sigue «solo el usuario» mientras no se reparta (D-069).

## Progreso
| Paso | Estado | Documento |
|---|---|---|
| 1. Propuesta | hecho (Q-90: A, D-069) | `propuesta.md` |
| 2. Definición | hecho | `definicion.md` |
| 3. Investigación | hecho (Q-91: A, D-070) | `investigacion.md` |
| 4. UX | hecho (CO-1, CO-2 y CO-4) | `ux.md` |
| 5. Diseño técnico | hecho (CO-I1, CO-I2, CO-I4, CO-I5 y CO-I6) | `diseno-tecnico.md` |
| 6. UI (solo si hay piezas nuevas) | descartado (CO-I1, CO-I2, CO-I4, CO-I5 y CO-I6 usan el chip, el aviso, la fila de Ajustes y los botones que ya existen) | — |
| 7. Construcción | hecho (CO-I1, CO-I2, CO-I4, CO-I5 y CO-I6 aprobadas; CO-I3 hecha) | este archivo |
| 8. Calidad | hecho (con el hito 8, `08-calidad.md`; portón aprobado en Q-108) | este archivo |
| 9. Lanzamiento | hecho (con el hito 9, `09-lanzamiento.md`; portón aprobado en Q-111) | este archivo |

## En qué estamos ahora
La construcción y la calidad (hito 8) están completas. Lanzado con el hito 9 (Q-111, 2026-11-02): el módulo está en uso y sigue con la operación del proyecto (hito 10). Con Q-103, la versión de Iridium pasó a su propia sección, Ajustes › Acerca de, al final.

2026-11-04, a pedido del usuario: las copias compartidas se actualizan solas desde GitHub (D-085, CO-I7). Publicada la primera versión (`aca3668`) y probada de punta a punta con `tools/probar-compartida.ts`. Con Q-123 (A): repo privado y la otra persona como colaboradora; la copia avisa si falta iniciar sesión en GitHub. Publicada `c012989` y probada de nuevo.

2026-11-16, a pedido del usuario: lo que falta para compartir Iridium por GitHub (invitar a la otra persona, Q-126) queda en pausa hasta que lo retome. El módulo sigue en uso.

## Cambios requeridos en documentos generales
| Documento general | Cambio | Decisión | Aplicado |
|---|---|---|---|

## Iteraciones
| ID | Objetivo | Estado |
|---|---|---|
| CO-I1 | Iniciar sesión en Claude desde Iridium (el aviso de la conversación, el del marco y Ajustes › IA) | hecho, aprobada (Q-94, 2026-10-31) |
| CO-I2 | Versión nueva lista: se arma con Iridium abierto y entra al cerrar o con Reiniciar ahora; mueve `main` | hecho, aprobada (Q-97, 2026-11-01) |
| CO-I3 | GitHub privado con `dev` y `main` | hecho (2026-10-31, D-070) |
| CO-I4 | Elegir la carpeta de proyectos en Ajustes | hecho, aprobada (Q-98, 2026-11-01) |
| CO-I5 | La versión de Iridium y cuándo se armó, en Ajustes › Acerca de (Q-103) | hecho, aprobada (Q-102, 2026-11-01) |
| CO-I7 | Versiones para compartir: `pnpm publicar` y la copia compartida que las baja y las pone al cerrar (D-085); con el repo privado, el aviso para iniciar sesión en GitHub (Q-123) | hecho, probada con GitHub (2026-11-04); falta invitar a la otra persona (Q-126) |
| CO-I6 | Hay cambios sin armar: Iridium ofrece Armar (Q-99 B, D-071) | hecho, aprobada (Q-102, 2026-11-01) |

## Log de iteraciones
### CO-I1 — Iniciar sesión desde Iridium (2026-10-31)
- El motor suma `iniciarSesion`: abre `claude auth login --claudeai` del Claude Code que trae Iridium en una consola a la vista (si pide un código, se ve; si falla, queda abierta con el error) y, al cerrarse, Iridium vuelve a verificar. El motor falso «inicia sesión» en dos pasos.
- El chip de la barra es un botón, «Sin sesión de Claude · Iniciar sesión»; el aviso de la conversación tiene **Iniciar sesión** y Reintentar. Mientras tanto los dos dicen «Esperando el navegador…»; con sesión, el aviso pasa a verde («Ya tenés sesión en Claude») y Reintentar queda como principal.
- `pnpm claude …` corre ese Claude Code (para cerrar la sesión y probar).
- Verificado: la consola arranca el Claude Code de Iridium con la cuenta real (`auth status`); el login real queda para Q-93. Una prueba e2e nueva en `i6-uso.spec.ts` (chip, aviso, espera, sesión iniciada y Reintentar, con capturas `co1-*.png`); pasan las 433 de Vitest y las 49 de Playwright.

- **Q-93 (prueba):** con la sesión cerrada, Iridium seguía diciendo «Claude», los mensajes fallaban y el aviso no ofrecía Iniciar sesión (lo mismo que R-5); `/login` en el chat no anda (el SDK no tiene comandos) y el usuario prefiere el botón en la configuración. **Causa:** sin sesión, Claude Code seguía dando el email de la cuenta, y eso alcanzaba para «listo»; un turno fallido no cambiaba el estado del marco. **Arreglo:** la verificación pregunta también `claude auth status` (manda lo que dice), un turno sin sesión pone el chip y el aviso en «sin sesión» en el acto, y Ajustes › IA suma «Cuenta de Claude» con Iniciar sesión (o Cambiar de cuenta). Pruebas nuevas en Vitest y en `i6-uso.spec.ts`; verificado con el Claude Code real y una carpeta de cuenta vacía (da «sin sesión»). Pasan 434 de Vitest y 50 de Playwright.
- **Q-94 (prueba):** el usuario cerró la sesión, volvió a entrar desde Iridium y respondió desde la app: funcionó. CO-I1 aprobada.

### CO-I2 — Versión nueva lista (2026-11-01)
- `pnpm actualizar` arma en `release/nueva` sin tocar la app y la marca con `lista.json` al final; mueve `main` al commit armado y lo sube. Con Iridium cerrado la pone en el acto; abierto, la deja lista; con un Iridium anterior a CO-I2, lo cierra y reabre como antes.
- `tools/cambiar-version.ps1` (también dentro de la app armada) cambia las carpetas cuando nada corre desde la app y, con Reiniciar ahora, la abre. Anota en `release/actualizacion.log`.
- Iridium mira `lista.json` cada 5 s y muestra «Versión nueva lista · entra al cerrar» con **Reiniciar ahora** en la barra de estado; al salir lanza el ayudante. Reiniciar ahora pasa por F-6 («Reiniciar la frena», **Reiniciar igual**); Cancelar no reinicia.
- **Hallazgo:** lanzado directo, PowerShell muere con Iridium (Node ata los procesos hijos al suyo), y suelto, sin consola, no arranca: el ayudante se lanza con `cmd /c start` y la consola escondida.
- Verificado: con la app armada de verdad en una carpeta de prueba (otros datos, motor falso), armar con Iridium cerrado la puso en 31 s; con Iridium abierto, el aviso apareció solo y Reiniciar ahora la puso y la reabrió en un segundo (`actualizacion.log`). Pruebas nuevas: `co2-version-nueva.test.ts` (lectura de `lista.json`, el ayudante de verdad y el lanzamiento suelto) y `co2-version-nueva.spec.ts` (el aviso, Reiniciar ahora y F-6 con Cancelar; capturas `co2-*.png`). Pasan 455 de Vitest y 57 de Playwright (`r3-electron` falló una vez en la tanda completa; pasó sola y en la tanda siguiente).

### CO-I4 — Elegir la carpeta de proyectos (2026-11-01)
- Ajustes suma la sección **Proyectos** (después de Apariencia): «Carpeta de proyectos» con la ruta de ahora y **Cambiar…**. Usa el cuadro y el canal que ya tenía la grilla cuando la carpeta falta; no hizo falta nada nuevo del lado del proceso principal.
- Si la carpeta no está, la fila lo dice en rojo y Cambiar… pasa a principal; con la IA trabajando en algún proyecto, el botón se desactiva (una sesión de la carpeta anterior ya no podría recibir mensajes).
- Las pestañas de proyectos de la carpeta anterior quedan con el aviso de siempre («ya no está en la carpeta de proyectos»).
- Verificado con `co4-carpeta.spec.ts` (el cuadro de Windows reemplazado desde la prueba): ver la carpeta, Cancelar, cambiarla y que quede al volver a abrir; la carpeta que falta; el botón desactivado mientras la IA trabaja. Capturas `co4-*.png`. Pasan 455 de Vitest y 60 de Playwright.

- **Q-97 (reporte, 2026-11-01):** «no apareció nada». **Qué pasó:** el primer «Armar…» (09:46) funcionó (cerró, puso CO-I2, reabrió y movió `main`, `release/actualizacion.log`), pero CO-I2 no muestra nada hasta que hay una versión más nueva, y después de CO-I4 nadie volvió a armar: Iridium no se entera de los commits por sí solo. La prueba no lo dejaba claro. **Hecho:** armé con tu Iridium abierto (10:06): no lo cerró, movió `main` a a01b1b6 y tu Iridium registró «Versión nueva lista» a los dos segundos. Q-97 reescrita desde ahí; que Iridium arme solo queda para Q-99.

- **Q-97 (prueba, 2026-11-01):** el aviso, el commit con el mouse encima, Reiniciar ahora y armar desde Scripts con Iridium abierto: todo bien, sin cambios pedidos. CO-I2 aprobada.
- **Q-98 (prueba, 2026-11-01):** ver la carpeta, Cancelar y cambiarla de ida y vuelta: todo bien, sin cambios pedidos. CO-I4 aprobada.

### CO-I6 — Hay cambios sin armar (2026-11-01)
- **Q-99:** B, que Iridium lo ofrezca con un botón (D-071).
- `infra/sin-armar.ts` compara cada 10 s el último commit del código con `main` y con la versión lista; `actualizar.ps1` deja `release/armando.json` mientras arma (cuenta mientras su proceso vive). Armar corre `pnpm actualizar` en la consola de Scripts.
- La barra de estado muestra «Hay cambios sin armar» con **Armar**, «Armando la versión nueva…» mientras arma, y nada mientras la IA de ese proyecto trabaja.
- Verificado: contra el repo real detecta el commit que falta (2ddf210 contra `main` en a01b1b6). Pruebas nuevas: `co6-sin-armar.test.ts` (un repo de muestra de verdad: `main`, la versión lista, sin repo, y la marca con un proceso vivo y uno muerto) y `co6-sin-armar.spec.ts` (aparece al commitear, Armar, Armando, el paso a Versión nueva lista y que se esconde con la IA trabajando; capturas `co6-*.png`). Pasan 460 de Vitest y 62 de Playwright (una tanda de Vitest falló una vez sin poder reproducirlo: pasó en las cuatro siguientes).
- Armada a las 11:02 (a9d0601, `main` movida): tu Iridium la avisa abajo. Después commiteé el cierre de la sesión, que es lo que la versión nueva ofrece armar (Q-100).

- **Q-100 (prueba, 2026-11-01):** el aviso al reiniciar, Armar, Armando, el paso a Versión nueva lista y que se esconde con la IA trabajando: todo bien, sin cambios pedidos. CO-I6 aprobada.

### CO-I5 — La versión a la vista (2026-11-01)
- Al armar la ventana (`electron.vite.config.ts`) queda escrito con qué se armó: la hora, el commit, su primera línea y si había cambios sin commitear. Ajustes › Proyectos lo muestra en «Versión de Iridium», debajo de la carpeta; en modo desarrollo dice «los cambios en vivo, sin armar».
- Verificado con una prueba nueva en `co4-carpeta.spec.ts` (el número, el commit y la fecha de hoy en la app que arma `pnpm e2e`; captura `co5-version.png`). Pasan 460 de Vitest y 63 de Playwright.
- **El fallo intermitente de Vitest** (anotado en CO-I6) era la prueba del ayudante de CO-I2: borraba su carpeta temporal mientras el ayudante, que corre desde ahí, seguía unos segundos más (EBUSY). La prueba ahora espera a poder borrarla; la app no cambia (pasó tres tandas seguidas).
- **Acentos rotos en el aviso (encontrado al armar, de CO-I2):** el mensaje del commit que guarda `lista.json` (el que se ve al pasar el mouse por «Versión nueva lista») salía «versi├│n». **Causa:** PowerShell leía la salida de git con la página de códigos de la consola. **Arreglo:** `actualizar.ps1` la lee en UTF-8; la versión ya armada (18fdadb) quedó corregida a mano. **Prueba:** Q-101.
- Armada a las 11:21 (18fdadb, `main` movida).
- **Q-101 (reporte, 2026-11-01):** «no puedo actualizar ni desde el botón ni desde el script, ni reiniciándolo; solo cierra Iridium». **Qué pasaba:** armar andaba (la versión de las 11:33 estaba lista), pero el ayudante que la pone se cortaba al empezar, sin anotar ni volver a abrir Iridium; desde las 10:43 no entró ninguna versión (la app seguía en a01b1b6, CO-I4; Q-100 se marcó sin poder verse). **Causa:** al cerrarse el Iridium de las 09:46 quedó vivo un proceso interno suyo (el servicio de red de Electron), sin ruta legible para Windows, así que el ayudante no lo veía; cuando a las 10:43 esa versión pasó a `release/anterior`, ese proceso siguió trabando su `Iridium.exe`, y cada cambio posterior fallaba al borrar `anterior` (con «Stop», sin anotar). **Arreglo:** cerré ese proceso (de una versión cerrada hacía dos horas) y borré `anterior`; el ayudante ahora reconoce los procesos también por la línea de comando, cierra los internos que quedaron sin su Iridium, lleva la versión vieja a una carpeta `anterior-<fecha>` nueva cada vez (una trabada no frena), borra las viejas cuando puede y anota cualquier falla (y abre Iridium igual si correspondía). **Prueba:** dos nuevas en `co2-version-nueva.test.ts` (un proceso suelto corriendo desde la versión anterior; un archivo trabado por otro programa) y Q-102. Pasan 462 de Vitest y 63 de Playwright (`d060` falló una vez en la tanda completa y pasó tres veces sola: anotado para el hito 8). Armada a las 11:46 (5c2ab65).
- **Q-102 (prueba, 2026-11-01):** el commit y los acentos en el aviso, Reiniciar ahora (cerró y volvió a abrir sola), la versión en Ajustes › Proyectos, y «Hay cambios sin armar» con Armar hasta «Versión nueva lista»: todo bien. CO-I5 y CO-I6 aprobadas (CO-I6 se vio recién acá). La pregunta sobre dónde va la versión quedó sin responder: pasa a Q-103.
- **Q-103 (consulta, 2026-11-01):** «"Acerca de" estaría bien»; sobre el nombre «Proyectos» no dijo nada, así que queda. **Hecho:** Ajustes suma al final la sección **Acerca de** (con un ícono de información) y «Versión de Iridium» se mudó ahí; en Proyectos queda solo la carpeta. La prueba de CO-I5 en `co4-carpeta.spec.ts` la busca en Acerca de (captura `co5-version.png`). Se ve en tu Iridium cuando armes la versión que lo trae; lo mirás en el recorrido de la tanda 7.

### CO-I3 — GitHub privado (2026-10-31)
- `master` pasó a `dev` y `main` nació en el mismo commit; las dos están en `LlanosLautaro/Iridium`, que sigue privado (desde afuera da 404). Git ya tenía guardada la cuenta: no hizo falta el paso a mano.

## Próximo paso
Nada propio: el módulo está en operación con el proyecto. Sus errores y mejoras van a `trabajo.md`. Lo que D-069 dejó para después (instalador, actualizaciones desde GitHub) sigue fuera.
**Leer antes:** nada.

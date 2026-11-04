# UX del módulo: Compartir

**Fecha:** 2026-10-31

## CO-1 — Iniciar sesión (CO-I1)
- **Dónde:** el chip de la barra de abajo («Sin sesión de Claude · Iniciar sesión», es un botón) y el aviso de la conversación cuando un mensaje no salió por falta de sesión (F-5).
- **Flujo:** Iniciar sesión → se abre el navegador en la página de Claude y una ventana de consola de Claude Code → el usuario entra con su cuenta → la consola se cierra sola → Iridium verifica y el chip vuelve a «Claude · plan». El aviso pasa a «Ya tenés sesión en Claude» y Reintentar manda lo que no salió.
- **Mientras espera:** chip y botón dicen «Esperando el navegador…» y no se pueden tocar. Si el usuario cierra la consola sin entrar, vuelven a ofrecer Iniciar sesión. A los diez minutos Iridium deja de esperar.
- **Si falla:** la consola queda abierta con el error de Claude Code hasta que se toca una tecla.
- Lo pendiente no sale solo al volver: lo decide el usuario con Reintentar.
- **En Ajustes › IA** (Q-93): primera fila, «Cuenta de Claude», con el estado en palabras (plan, sin sesión, clave de API, no arranca) y **Iniciar sesión**; con sesión, **Cambiar de cuenta** (el mismo login).
- Si un mensaje falla por falta de sesión, el chip y Ajustes pasan a «sin sesión» en el acto (R-5).

## CO-2 — Versión nueva lista (CO-I2)
- **Dónde:** abajo, en la barra de estado, al lado del chip de Claude: «Versión nueva lista · entra al cerrar» (verde) y el botón **Reiniciar ahora**. Con el mouse encima dice cuándo se armó y con qué commit (y si tenía cambios sin commitear). No hay aviso emergente: no interrumpe.
- **Flujo:** «Armar la última versión» (desde Scripts o a mano) arma con Iridium abierto, sin tocarlo, en un minuto → el aviso aparece solo en unos segundos → el usuario sigue trabajando → al cerrar Iridium, la versión nueva entra; la próxima vez abre con ella.
- **Reiniciar ahora:** cierra Iridium como siempre y lo vuelve a abrir con la versión nueva en un segundo. Si hay sesiones trabajando, pregunta antes (F-6) con «Reiniciar la frena» y **Reiniciar igual**; Cancelar no reinicia y deja todo como estaba.
- **Con Iridium cerrado**, «Armar la última versión» la pone en el acto (no lo abre).
- **Si algo falla** (Windows no suelta la carpeta), sigue la versión de antes y la nueva espera al próximo cierre; lo que pasó queda en `release/actualizacion.log`.
- **Transición:** el Iridium armado antes de CO-I2 no sabe esperar: a ese, «Armar la última versión» lo cierra y lo reabre como antes (una sola vez).

## CO-5 — La versión a la vista (CO-I5)
- **Dónde:** Ajustes › Acerca de, la última sección (Q-103; antes, debajo de la carpeta en Proyectos): una fila «Versión de Iridium», con el número y el commit a la derecha («0.1.0 · a9d0601», en la letra de las rutas) y debajo del título «Armada el 1 nov 2026, 11:02, con «…»» (y «y cambios sin commitear», si los había).
- **En modo desarrollo** (sin armar): «En modo desarrollo: los cambios en vivo, sin armar», con el número solo.

## CO-6 — Hay cambios sin armar (CO-I6, D-071)
- **Dónde:** abajo, en la barra de estado, en el mismo lugar que CO-2: «Hay cambios sin armar» (gris) y el botón **Armar**. Con el mouse encima dice el último commit que la app no tiene.
- **Cuándo:** el último commit del código de Iridium no está en la app de uso diario (no es el de `main`) ni en la versión lista. Se mira cada diez segundos: aparece solo cuando la IA commitea. Los cambios sin commitear no cuentan.
- **Flujo:** Armar → se abre la consola de «Armar la última versión» (la misma que desde Scripts) y el aviso pasa a «Armando la versión nueva…» → al minuto aparece «Versión nueva lista · entra al cerrar» (CO-2) y el de cambios sin armar se va. Si se arma desde Scripts, también dice «Armando…».
- **Mientras la IA de ese proyecto trabaja** no aparece: armaría a mitad de camino. Vuelve cuando termina.
- **Si falla:** la consola queda abierta con el error y el aviso vuelve a ofrecer Armar; si ni la consola se pudo abrir, el chip dice «No se pudo armar» (rojo) con el motivo encima.

## CO-4 — Elegir la carpeta de proyectos (CO-I4)
- **Dónde:** Ajustes › **Proyectos**, una sección nueva después de Apariencia. Una fila, «Carpeta de proyectos», con la ruta de ahora (en la letra de las rutas) y **Cambiar…**. Debajo: «Iridium muestra como proyecto cada carpeta que está adentro».
- **Flujo:** Cambiar… → el cuadro de Windows para elegir una carpeta, abierto en la de ahora → al elegir, la ruta nueva queda en la fila y la grilla de Proyectos ya es la de esa carpeta (se guarda: vale también al volver a abrir). Cancelar no cambia nada.
- **Si la carpeta de ahora no está** (disco desconectado): la fila lo dice en rojo, «No se encuentra; elegí otra o conectá el disco», y Cambiar… pasa a principal.
- **Mientras la IA trabaja en algún proyecto**, Cambiar… no se puede tocar y la fila dice «Esperá a que termine la IA: trabaja en un proyecto de esta carpeta». Así ninguna sesión queda a medias en una carpeta que Iridium dejó de mirar.
- **Las pestañas de proyectos de la carpeta anterior** quedan, con el aviso que ya existe («Este proyecto ya no está en la carpeta de proyectos» y Volver a Proyectos); si se vuelve a la carpeta anterior, siguen como estaban.
- Los avisos de Proyectos cuando la carpeta falta o está vacía siguen ofreciendo elegirla, con el mismo cuadro.

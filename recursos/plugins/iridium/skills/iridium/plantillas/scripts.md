# Scripts

> Lo que el usuario ejecuta a mano. Lo mantiene la IA (ver el framework › `docs/scripts.md`). Cada script: título `##`, una línea de para qué sirve y una línea **Ejecutar:** (un comando, en la raíz del proyecto salvo que una línea **Carpeta:** diga otra, o un instalador o programa del proyecto, que se ejecuta con Windows) o **Abrir:** (una carpeta o un archivo para ver, relativa a la raíz, o una dirección `https://`). Lo que abre el proyecto lleva **Marca:** (`ejecutar · escritorio`, `ejecutar · página` o `ejecutar · consola`) y el script que arma una app de escritorio, **Marca:** `armar`. Lo más usado primero.

## Abrir la app
La versión armada, con los últimos cambios.
**Ejecutar:** `[dist/win-unpacked/Alfa.exe]`
**Marca:** ejecutar · escritorio

## Armar la app
Arma la versión de uso con el código de ahora. Cerrala antes.
**Ejecutar:** `[npm run armar]`
**Marca:** armar

## Instalar la última versión
Instala o actualiza la app de uso diario. Cerrala antes.
**Ejecutar:** `[ruta/al/instalador.exe]`

## Abrir en modo desarrollo
Abre la versión en desarrollo, con datos aparte de la instalada.
**Ejecutar:** `[npm run dev]`

## Instalar dependencias
Una vez al clonar el proyecto, o cuando la IA lo pida después de sumar una dependencia.
**Ejecutar:** `[npm install]`

[Si el proyecto todavía no tiene nada que ejecutar, los scripts se reemplazan por: "(Todavía no hay scripts: el proyecto no tiene código.)"]

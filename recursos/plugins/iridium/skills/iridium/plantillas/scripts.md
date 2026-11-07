# Scripts

> Lo que el usuario ejecuta a mano. Lo mantiene la IA (ver el framework › `docs/scripts.md`). Cada script: título `##`, una línea de para qué sirve y una línea **Ejecutar:** (un comando, en la raíz del proyecto salvo que una línea **Carpeta:** diga otra, o un instalador o programa del proyecto, que se ejecuta con Windows) o **Abrir:** (una carpeta o un archivo para ver, relativa a la raíz). Lo más usado primero.

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

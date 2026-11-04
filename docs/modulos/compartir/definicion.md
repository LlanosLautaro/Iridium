# Definición del módulo: Compartir

**Fecha:** 2026-10-31 (Q-90, D-069)

## Objetivo del módulo
Que Iridium se cuide y se mantenga solo en la PC del usuario: el código con copia en GitHub, las versiones nuevas que entran al cerrar sin cortar el trabajo, la sesión de Claude que se recupera desde Iridium y la carpeta de proyectos que se elige. Repartirlo a otros queda para después (D-069).

## Criterios de éxito
- Si se cae la sesión de Claude, el usuario la recupera desde Iridium, sin abrir VS Code ni una terminal.
- Una versión nueva se arma mientras el usuario trabaja y entra sola la próxima vez que cierra Iridium; nunca le cierra la app en medio de algo.
- Si la PC se rompe, el código y `docs/` están en GitHub con la historia completa.

## Funcionalidades
### Must (MVP del módulo)
- **Iniciar sesión desde Iridium:** el aviso «Sin sesión de Claude» (el de la conversación y el del marco) tiene **Iniciar sesión**, que abre el navegador para entrar con la cuenta de Claude, como la extensión de VS Code; al volver, Iridium lo nota solo y Reintentar manda lo pendiente.
- **Actualización al cerrar (C-59):** «Armar la última versión» arma sin cerrar Iridium; cuando termina, Iridium avisa «Versión nueva lista: entra al cerrar» con **Reiniciar ahora**. Al cerrar, se pone la versión nueva. Cómo se arma y desde dónde llega lo decide Q-91.
- **GitHub privado:** el repo en GitHub con `dev` (el trabajo de cada día) y `main` (lo que está en la app de uso diario). El panel de Git ya muestra «En GitHub» y lo que falta subir (D-058).

### Should
- **Elegir la carpeta de proyectos** en Ajustes, en vez de la fija (D-065 la dejó prevista). Para el usuario no cambia nada hasta que la mueva; es lo primero que necesitaría otro.

- **Armar desde Iridium** (Q-99 B, D-071): con commits que la app no tiene, abajo aparece «Hay cambios sin armar» con **Armar**.

### Could
- La versión (0.1.0) a la vista en Ajustes, con la fecha en que se armó.

### Won't (por ahora)
- **Repartir a conocidos:** instalador público, repo público con `docs/` limpio (D-057), la guía y la carpeta `Ideas` en la PC de otro, una pantalla para la clave de API. Espera a que el usuario decida repartir, con la condición de Anthropic a la vista (D-069).

## Fuera de alcance
- Firmar el instalador (sin repartir, SmartScreen no aplica).
- Copias de seguridad de los datos de Iridium (`IRIDIUM_DATOS`): son preferencias y se rehacen.

## Impacto en el perfil
Sigue en P2, «solo el usuario». Suma una cuenta de GitHub con el código: conviene con doble factor. Si la actualización baja de GitHub (Q-91 B), Iridium guarda una clave de solo lectura en la PC; nunca dentro del instalador.

## Términos nuevos (se agregan al glosario general)
| Término | Significado |
|---|---|
| Versión nueva lista | Una versión armada que espera a que se cierre Iridium para entrar |

## Preguntas abiertas para investigar
- Cómo llega la versión nueva: armada en la PC o bajada de GitHub (`investigacion.md` › Actualización; Q-91).
- Si `claude auth login` funciona lanzado desde Iridium, sin una consola (`investigacion.md` › Iniciar sesión).

# Definición del módulo: Abrir

**Fecha:** 2026-11-19

## Objetivo del módulo
Que cada proyecto con algo para usar se abra desde Iridium con un clic, sin buscar entre los scripts, y que las apps de escritorio que se arman en la PC estén siempre al día sin correr nada a mano, como Iridium consigo misma (D-122).

## Criterios de éxito
- En un proyecto con algo para usar, **Abrir** está en el menú del clic derecho de su tarjeta y dentro del proyecto, y abre lo correcto según su tipo.
- Un proyecto sin nada que usar no muestra **Abrir**.
- Después de un commit en una app de escritorio, la próxima vez que el usuario la abre ya tiene el cambio, sin haber corrido nada y sin que se haya armado con la app abierta o con una IA trabajando en ese proyecto.
- Si armar falla, el usuario lo ve en la tarjeta y la app sigue con la versión anterior.
- La IA de cualquier proyecto sabe declarar lo que abre y cómo se arma (el framework), y el control marca una declaración mal escrita.

## Funcionalidades
### Must (MVP del módulo)
**Parte 1 — Abrir (AB-I1):**
- En `scripts.md`, la IA marca **un** script como el que abre lo que hace el proyecto, con su tipo: **escritorio** (un programa, como un `.exe`), **página** (una dirección o un archivo que se ve en el navegador) o **consola** (un comando en una terminal). El formato exacto, en el diseño técnico.
- Iridium muestra **Abrir** en el menú de la tarjeta y dentro del proyecto (el lugar exacto, en la UX). Sin script marcado, no aparece.
- Si lo que abre todavía no existe (una app sin armar), Abrir lo dice en vez de fallar callado.
- El framework enseña a marcarlo al escribir los scripts y al retomar un proyecto; el control marca dos scripts marcados, un tipo que no existe o una marca sin línea de acción. Los proyectos que ya existen lo suman cuando su IA los retoma: desde acá no se tocan.

**Parte 2 — Mantener al día (AB-I2):**
- En una app de tipo escritorio, la IA marca también el script que la arma.
- Iridium la arma sola cuando hay commits que la versión armada no tiene, ningún archivo a medio cambiar, ninguna IA trabajando en ese proyecto y la app cerrada. Si el usuario la abre mientras se arma, espera a que termine.
- La tarjeta dice si está al día, armándose o si falló (con lo que pasó, como **Ver la consola** de Iridium); un armado que falló no se reintenta solo hasta el próximo commit (como D-122).
- Se puede apagar en cada proyecto (ver Q-216).

### Should
- El aviso «Mientras no estabas» (Arranque, D-147) cuenta las apps que se pusieron al día.
- **Abrir** también con un atajo de teclado dentro del proyecto.

### Could
- Ver en la tarjeta, de un vistazo, que la app tiene cambios sin armar.

### Won't (por ahora)
- Actualizar apps instaladas con un instalador o desde GitHub — es otro camino (el de Compartir, D-085) y el usuario arma en su PC.
- Publicar páginas en internet o apps de celular — no se arman en la PC.
- Que Iridium adivine el script por su nombre — frágil; lo declara la IA.

## Fuera de alcance
- Las pruebas sin ventanas y el resto de las piezas por tipo de app: son del frente Plantillas (D-150), que usa el tipo que declara este frente.
- Cambiar los proyectos del usuario desde Iridium: cada uno suma la marca con su propia IA.

## Impacto en el perfil
No sube: Iridium ya ejecuta los scripts de `scripts.md` (D-039) y ya arma su propio código (D-122). Lo nuevo es que ejecuta el script de armar de otro proyecto sin que el usuario toque nada: solo el que la IA de ese proyecto marcó, solo con commits del usuario y apagable por proyecto.

## Términos nuevos (se agregan al glosario general)
| Término | Significado |
|---|---|
| Lo que abre el proyecto | El script de `scripts.md` que la IA marca para el botón **Abrir**, con su tipo (escritorio, página o consola) |
| Mantener al día | Que Iridium arme sola una app de escritorio de un proyecto cuando tiene cambios y está cerrada |

## Preguntas abiertas para investigar
- Cómo sabe Iridium que una app está abierta (por el programa que corre desde esa carpeta) y qué versión está armada (el commit con que se armó la última vez). Van al diseño técnico; no hace falta el paso 3: no hay dominio de terceros.

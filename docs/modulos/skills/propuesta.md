# Propuesta del módulo: Skills

**Fecha:** 2026-10-30
**Tipo:** sección

## Qué problema resuelve
Las skills deciden cómo trabaja la IA en todos los proyectos, pero hoy no se ven en ningún lado: viven en `C:\Users\usuario\.claude\skills\` mezcladas de tres orígenes, y saber cuál es cuál pide abrir carpetas. En esta PC hay:
- **Propias**, como enlaces a `Skills/skills/` (`hitos-desarrollo-app`, `gestor-proyectos`): se editan ahí y quedan instaladas.
- **Copias de terceros** como carpeta real (`impeccable`), que además llega por segunda vez como complemento de la cuenta (D-014).
- **Desde la cuenta** (`synced/`, los complementos `design` y `engineering`, las de Anthropic de documentos): bajan solas y no se pueden copiar.

Para cambiar una skill o la guía hay que abrir una sesión aparte en `Skills`, y cuando la guía cambia de formato nadie avisa qué proyectos quedaron atrás (C-53).

## Por qué ahora
El núcleo está cerrado (D-063) y este frente casi no lo toca: lee carpetas y abre sesiones como cualquier proyecto. Además hay trabajo esperando que es justamente de este módulo: poner al día `gestor-proyectos` y la guía (D-062, D-063) y sacar las copias dobles (D-014).

## Cómo encaja en el producto
Es el área Skills de `02-definicion.md` (C-44 a C-48, C-52, C-53) y absorbe el trabajo de `Skills` (D-018): ese proyecto sigue existiendo como carpeta donde viven los archivos, pero se trabaja desde la sección. Se apoya en lo que ya existe: la sesión por proyecto (editar una skill es una sesión en `Skills`), git (cada cambio se puede deshacer, D-018) y el Mapa y Pendientes. Toca al módulo en espera **Inicio** (Skills como panel del inicio): la sección se arma de forma que después pueda ir ahí sin rehacerla.

Idea del 2026-10-30 que suma: **elegir qué skills usa cada proyecto**. No está en el catálogo; si el usuario la quiere, entra en la definición del módulo (paso 2) como caso nuevo, y hay que averiguar si Claude Code permite apagar una skill para un proyecto (paso 3).

## Por qué es un módulo y no una funcionalidad
- [x] Dominio propio que requiere investigación: orígenes y licencias de las skills, cómo las carga Claude Code, si se pueden activar por proyecto, cómo detectar el formato viejo de la guía en un proyecto.
- [x] Flujos de UX propios: lista, detalle, editar con la IA, poner al día proyectos.
- [x] Ritmo de avance propio: frente activo junto con Apariencia y ajustes (D-063).
- [ ] Se activa, instala o distribuye por separado.

## Alternativas
- **Seguir como hoy** (sesiones de `Skills` desde VS Code o desde su pestaña en Iridium): ya funciona para editar, pero no muestra el origen de cada skill, no avisa de las copias dobles ni de los proyectos atrasados.
- **Solo una lista** (C-44 y C-45, sin editar ni poner al día): chica y útil, pero D-018 ya decidió que ver sin poder editar obliga a salir de Iridium para lo que más cambia.
- **Herramientas existentes:** `claude plugin` y el directorio de complementos de Claude Code muestran los complementos, no las skills sueltas ni su origen; el gestor anterior está descontinuado. No hay nada que lo resuelva entero.

## Propuesta de alcance (para la definición)
Primera tanda, en este orden:
1. **Ver** (C-44, C-45, C-46): todas las skills con su origen (propia, copia de un tercero, desde la cuenta), qué hace cada una y un aviso cuando hay dos copias.
2. **Editar con la IA** (C-52): desde una skill propia, «Pedir un cambio» abre la sesión de `Skills` con la skill ya nombrada; el cambio queda en git y se instala solo (son enlaces).
3. **Poner al día** (C-53): qué proyectos tienen el formato viejo de la guía y un botón que abre su sesión con el pedido.

Después: versión y fecha de cada skill (C-48), adaptar una pública (C-47) y, si se confirma que se puede, elegir skills por proyecto.

## Decisión
Seguir, si el usuario la aprueba (`estado.md` del módulo › Q-83).

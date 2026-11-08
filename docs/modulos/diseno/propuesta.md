# Propuesta: Diseño

> Paso 1 del frente (equivale a los hitos 0 y 1). Abierto a pedido del usuario el 2026-11-07 (D-102).

## El problema
Después de cuatro iteraciones de Orden, la app sigue sintiéndose desordenada y ruidosa, y el usuario no tiene cómo dirigir eso: no hay una vista de toda la interfaz junta, y un cambio grande (otra paleta, menos cajas, otra jerarquía) se pide pantalla por pantalla y se verifica igual. Lo que falta no es una función más, es una herramienta para **ver** la app entera y **cambiarla desde un solo lugar**.

## Lo que muestra la app hoy (medido el 2026-11-07)
- **Los colores están bien centralizados:** en el código de la interfaz hay solo 2 colores escritos a mano; todo lo demás sale de `docs/ui/tokens.css`. Poner los tokens negros encima de la app (sin tocar el código) cambió las 30 pantallas de una (`tools/salida/auditoria/1440x900-negro/`, comparar con `1440x900/`).
- **La estructura no:** hay unas 1.000 reglas de estilo repartidas en 13 archivos, uno por sección, y solo 9 piezas compartidas (`src/renderer/ui/`). Cada sección arma sus propios botones, filas, recuadros y píldoras. Por eso cambiar la paleta es fácil y cambiar la forma es caro, y por eso el negro solo no alcanza: el ruido (recuadros dentro de recuadros, bordes en todo, píldoras y medidores) sigue.

## Qué es Claude Design y qué se toma
Claude Design (Anthropic Labs, abril de 2026; la versión aparte cierra el 2026-12-14 y pasa a vivir dentro de Claude) es un lienzo con el chat al lado. Lo que lo define:
1. **Design system armado del código:** lee el repo y saca los tokens y los componentes; cada componente se ve como una tarjeta con sus variantes.
2. **Pantallas en un lienzo:** las vistas de la app, juntas, para mirar el conjunto.
3. **Comentar y ajustar sobre el lienzo:** comentarios pegados a un elemento y perillas (*tweaks*) para probar valores en vivo.
4. **Pase a Claude Code:** un paquete con el sistema, las pantallas y el contexto, para que el agente construya desde ahí.

Sus skills internas no están en la PC. Las de Anthropic que sí están (complemento `design`): `design-system` (auditar y documentar tokens y componentes), `design-critique` (jerarquía, consistencia y usabilidad sobre capturas), `design-handoff` (la especificación para construir), `ux-copy` y `accessibility-review`. Son la base del método del frente; `impeccable` queda como apoyo (D-102). Todo local: nada se sube a claude.ai (`/design-sync` existe, pero no se usa).

## Cómo encaja en Iridium
Una sección **Diseño** en cada proyecto con framework, al lado de Mapa y Docs, que lee una carpeta del proyecto con un formato del framework (D-086: el formato, el lector y el control van juntos). La propuesta de formato, para discutir en la definición:

```
docs/diseno/
  tokens.css          los tokens (lo que hoy es docs/ui/tokens.css)
  componentes/*.html  una pieza por archivo, con sus variantes, que se ve como tarjeta
  pantallas/          las capturas de cada pantalla de la app, por tema y por tamaño, con su lista
  comentarios.md      lo que el usuario marca sobre una pantalla, como T-n para la IA
```

Con eso, la sección muestra tres cosas:
- **Sistema:** los tokens dibujados (colores, letra, espacios, esquinas) y las piezas como tarjetas.
- **Pantallas:** todas las pantallas de la app en un lienzo, en el tema actual y en el que se esté probando lado a lado; tocar una la agranda.
- **Probar una dirección:** elegir otro juego de tokens y volver a sacar todas las pantallas con él (lo que hoy hace a mano `tools/auditoria-ux.ts` con `AUDITORIA_TOKENS`).

Y la IA, en la conversación de al lado, recibe los comentarios y cambia el sistema y las piezas; las pantallas se vuelven a sacar solas.

## Alternativas
- **Solo el formato y un HTML generado** (sin sección en Iridium): lo más rápido, se mira en el navegador. Sirve para Iridium, pero no para los otros proyectos y no deja comentar.
- **Seguir con `impeccable`:** ya está instalada y hace críticas y pulidos, pero trabaja sobre el código, sin la vista de conjunto que pidió el usuario.
- **Usar Claude Design en la nube:** está hecho, pero sube el repo, cierra como producto aparte en diciembre y el usuario prefiere todo local.

## El mínimo (para decidir en Q-147)
Lo que hace falta para dirigir el rediseño de Iridium ya: el formato `docs/diseno/`, la sección con **Sistema** y **Pantallas**, y **Probar una dirección**. Con eso se rehace la UI de Iridium en negro, de a una pieza compartida por vez, mirando siempre las 30 pantallas. Comentarios sobre el lienzo, rondas de versiones, perillas y la biblioteca de referencias (C-29 a C-35) vienen después.

## Riesgos
- **Hacer la herramienta antes que el rediseño demora lo visible.** Por eso la primera iteración no es la sección: es pasar las piezas sueltas a compartidas y aplicar la dirección negra, mirando las capturas que ya saca `auditoria-ux.ts`. La sección llega en la segunda.
- **Las pantallas con proyectos reales no van al repo** (D-082): se guardan en `tools/salida/` o con proyectos de muestra (Alfa, Beta…).

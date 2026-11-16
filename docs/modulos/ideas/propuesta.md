# Propuesta del módulo: Ideas

**Fecha:** 2026-11-16
**Tipo:** sección

## Qué problema resuelve
Hoy las ideas de un proyecto no tienen un lugar a mano:
- Para anotar una hay que salir del proyecto e ir a Ideas del inicio (T-69).
- Ideas del inicio es un bloc de notas de corrido (D-126): sirve para escribir, pero no se ve cada idea por separado, que era lo bueno de la Ideas de antes (la lista con cada idea en su renglón).
- No hay dónde dejar un enlace «para mirar después», sobre todo repos, con la intención de revisar qué se puede sacar de ahí. Hoy esos enlaces se pierden en el bloc o en el navegador.

## Por qué ahora
El bloc recién se hizo (DI-I3, tanda 8) y el usuario siente que se apuró. Antes de seguir puliendo, conviene decidir qué es Ideas: en el proyecto, en el inicio o en los dos, y qué guarda.

## Cómo encaja en el producto
Iridium es donde el usuario dirige con sus ideas y la IA desarrolla (`02-definicion.md`). Ideas es la entrada de todo lo demás: lo que hoy es una idea mañana es un `T-n`, una pregunta o un frente. Encaja con:
- **La conversación del proyecto:** «Hablar de esta idea» y «Revisar con la IA» le pasan la idea o el enlace al chat de al lado.
- **`trabajo.md`:** la IA ya anota ideas como `T-n` `nueva`. Falta decidir si se ven en la misma lista (Q-176).
- **Ideas del inicio:** puede quedar como bloc, pasar a ser la misma sección para lo que no tiene proyecto, o irse (Q-177).

## Las tres formas (maquetas)
En Iridium › Diseño, grupo «Ideas de un proyecto (propuesta)»:

| | Cómo es | A favor | En contra |
|---|---|---|---|
| **A · Notas** (`ideas-proyecto-a.html`) | Un mini Obsidian: a la izquierda la lista de notas con su primera línea; a la derecha la nota abierta, libre, con enlaces e imágenes | Se escribe largo y cómodo; cada nota es un archivo | Una nota con varios enlaces no dice qué falta revisar; ocupa toda la sección para una cosa a la vez |
| **B · Tarjetas** (`ideas-proyecto-b.html`) | Cada idea, una tarjeta chica con su texto, su captura y sus enlaces; un campo arriba para anotar o pegar | Se ven muchas juntas, con lo que tienen adentro | Con veinte ideas se vuelve un mosaico difícil de recorrer; los enlaces son una idea más |
| **C · Ideas y enlaces para revisar** (`ideas-proyecto-c.html`) | Cada idea en su renglón, como la Ideas de antes; un clic la abre en su lugar como una nota chica (texto, enlaces, imágenes). Un enlace pegado va a «Para revisar», con **Revisar con la IA**: la IA lo lee en el chat, propone qué sacar y anota la idea | Lo de antes (cada una separada) más lo nuevo (los enlaces con un fin); lo largo queda escondido hasta abrirlo | Más reglas: dos clases de cosas y un estado (para revisar → revisado) |

**Recomendación: C.** Es la única que trata el enlace como algo pendiente con un fin, que es la necesidad nueva, y conserva cada idea separada. De A toma la nota libre (al abrir una idea) y de B, que el campo de arriba sirve para todo.

## Por qué es un módulo y no una funcionalidad
- [ ] Dominio propio que requiere investigación
- [x] Flujos de UX propios
- [x] Ritmo de avance propio
- [ ] Se activa, instala o distribuye por separado

## Alternativas
- **Seguir con el bloc del inicio y sumarle un atajo desde el proyecto:** resuelve T-69 a medias; no da ideas separadas ni enlaces para revisar.
- **Usar Obsidian afuera:** ya existe y es bueno, pero saca las ideas de donde está la IA y el proyecto.
- **Que todo sea un `T-n` en `trabajo.md`:** no pide nada nuevo de guardar, pero `trabajo.md` es de la IA y su formato es estricto; las notas con imágenes no entran bien. Se decide en el diseño técnico (paso 5), con lo que se elija en Q-175 y Q-176.

## Decisión
Seguir (D-127): primero la forma (Q-175 a Q-177), después la definición y la UX; recién entonces construir.

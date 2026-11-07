# Íconos de proyecto

Todos los íconos comparten un estilo para que la grilla de Iridium se vea pareja. Iridium los muestra chicos, sobre un fondo oscuro o claro según el tema, y les redondea las esquinas.

## Reglas

- **Archivo:** `.proyecto-icono.svg` en la raíz del proyecto, en **una sola línea** (sin saltos ni sangría), sin comentarios. Se apunta desde `icono` de la ficha.
- **Lienzo:** `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">`, sin `width` ni `height`.
- **Fondo:** un `<rect width="72" height="72">` sin esquinas redondeadas, con un degradado lineal diagonal (`x1="0" y1="0" x2="1" y2="1"`) entre dos tonos muy oscuros del color del proyecto: el claro arriba a la izquierda (luminosidad ~15–20 %), el oscuro abajo a la derecha (~6–10 %).
- **Id del degradado:** `fondo-<carpeta-en-kebab-case>`. Tiene que ser único: todos los íconos se muestran juntos.
- **Pictograma:** una sola idea que diga qué hace el proyecto, centrada, con unos 12 px de margen. Formas planas y geométricas (rect, circle, line, path simples). Sin texto, sombras, filtros ni degradados en el pictograma. Se tiene que leer a 24 px.
- **Color:** un acento vivo para el pictograma y, como mucho, un segundo tono más claro del mismo color para un detalle. Los huecos se pintan con el color oscuro del fondo. Un tercer color solo si el tema lo pide.
- **Trazos:** `stroke-width` 2 a 4 (3 o 3.5 lo habitual), `stroke-linecap="round"` y `stroke-linejoin="round"`. Líneas de fondo o conexiones con `opacity=".5"`.
- **Un color propio por proyecto.** Antes de elegirlo, mirá los íconos de las otras carpetas de la grilla (solo leerlos) y no repitas el acento de un proyecto activo, salvo familias.

## Familias y reemplazos

- Un proyecto que reemplaza a otro (`reemplazadoPor`) **hereda su pictograma**: el reemplazado lo conserva desaturado en grises azulados (fondo `#1e2328`→`#121518`, trazos `#7a8a96`, detalles `#a9b4bc`) y el nuevo lo lleva a color.
- Si el reemplazado tiene un pictograma distinto que vale la pena conservar, se combina con un detalle del color del nuevo.

## Ejemplo

Una terminal (proyecto «Alfa»):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><defs><linearGradient id="fondo-alfa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f2a17"/><stop offset="1" stop-color="#11170d"/></linearGradient></defs><rect width="72" height="72" fill="url(#fondo-alfa)"/><rect x="12" y="16" width="48" height="40" rx="5" fill="none" stroke="#aae682" stroke-width="3"/><path d="M22 30l8 6-8 6" fill="none" stroke="#aae682" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="34" y1="44" x2="46" y2="44" stroke="#aae682" stroke-width="3.5" stroke-linecap="round"/></svg>
```

## Con el usuario
En un proyecto nuevo, hacé un ícono con la idea que mejor lo represente y dejalo puesto: el usuario lo ve en la tarjeta. Si no te convence la idea, o el usuario pide rehacerlo, proponé 2–3 pictogramas en una `Q-n` de tipo decisión (qué objeto y por qué, y el color).

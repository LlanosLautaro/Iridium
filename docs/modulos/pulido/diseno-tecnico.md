# Diseño técnico del módulo: Pulido

**Fecha:** 2026-11-25

## Contrato con el núcleo
### Qué usa del núcleo
Los tokens (`docs/diseno/tokens.css`, que la app importa tal cual), las piezas (`docs/diseno/piezas.css`, copiada en `src/renderer/estilos/piezas.css` y comparada por `tests/estilos.test.ts`) y las preferencias de la app (las de Ajustes, como el ancho de lectura).

### Qué expone
Nada nuevo: tokens (`--acento`, `--brillo-acento`, `--acento-tenue`, `--bien-apagado`, `--estado-…`, `--dur-hover`, `--dur-entrada`, `--dur-pulso`) y una preferencia, `acento`.

### Para plugins
No aplica.

## Estructura interna
- **El color y el movimiento van en CSS**, en las piezas y en las hojas de cada sección, con los tokens; sin librería de animaciones.
- **El acento** es una preferencia (`cian`, `verde`, `azul`, `violeta`; cian si no hay). Al arrancar y al cambiarla, la app pone `--acento: var(--acento-<nombre>)` en la raíz del documento: todo lo demás (el brillo, el fondo tenue) sale de ahí.
- **Las pestañas de la barra de proyectos** dejan el arrastre del sistema (el que usa hoy `Marco.tsx`, que muestra una copia fantasma y no deja mover las demás) por uno propio con el puntero, como el de la maqueta (`pulido.js`): la pestaña sigue al mouse con `transform`, las que pasa se corren el ancho de la arrastrada con una transición, y al soltar se guarda el orden como hoy. Empieza a arrastrar recién después de unos píxeles, para que un clic siga eligiendo la pestaña.
- **Sin seguir las animaciones apagadas de Windows** (D-197): se borran los cinco `@media (prefers-reduced-motion: reduce)` (`base.css`, `ajustes.css`, `conversacion.css`, `revision.css`, `uso.css`).

## Datos
Una preferencia más, `acento`, junto a `anchoHoja`.

## Procesos centrales
### Elegir el acento
Ajustes › Apariencia cambia la preferencia; la app la guarda y pone la variable en la raíz. No recarga nada.

## Seguridad
No cambia nada: no hay datos nuevos ni nada de afuera.

## Pruebas
- **Vitest:** el control de estilos sigue igual (sin colores escritos, las piezas iguales a las de la maqueta); una prueba nueva: ninguna hoja respeta `prefers-reduced-motion`, y el acento de la preferencia sale en la raíz.
- **Playwright:** elegir otro acento cambia el color del ícono de la sección elegida; arrastrar una pestaña de la barra la cambia de lugar y un clic la sigue eligiendo; con un comando corriendo y las consolas plegadas, «corriendo» tiene su animación.
- **Calidad:** los tiempos del hito 8 (`tools/medir.ts`) antes y después; las animaciones que no paran (los dos pulsos) usan solo `transform` y `opacity`, y se detienen cuando lo suyo no se ve.

## Cambios requeridos en el núcleo
- `docs/diseno/tokens.css` (hecho en este paso) y `piezas.css` (en la construcción, en la maqueta y en la app a la vez).
- `DESIGN.md` y `06-ui.md`, al terminar la construcción: el acento, los estados, el naranja y el movimiento.

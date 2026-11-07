# Hito 8 — Pruebas y calidad

**Objetivo:** verificar que la app funciona, es confiable y cumple lo prometido antes de considerarla lista. Las pruebas automáticas se escriben durante el hito 7; este hito agrega la verificación integral.

**Duración típica:** una a varias sesiones por versión. Se repite antes de cada lanzamiento.

## Preguntas
1. ¿Qué sería lo peor que podría hacer la app si falla? (perder datos, corromper archivos, mostrar algo mal)
2. ¿En qué equipos, sistemas o navegadores tiene que funcionar?
3. ¿Tenés datos o archivos reales variados para probar, incluidos casos raros o rotos?

## Actividades

**1. Revisión de cobertura.** Comprueba que la lógica central tiene tests automáticos y que pasan. Prioriza lo que puede perder o dañar datos del usuario.

**2. Pruebas funcionales.** Recorre cada historia de usuario con sus criterios de aceptación y cada flujo de `04-ux.md`, incluidos los de error.

**3. Casos límite.** Datos vacíos, enormes, malformados, nombres con caracteres especiales, sin conexión, interrupciones a mitad de una operación.

**4. Compatibilidad.** Prueba en las plataformas declaradas en el perfil.

**5. Rendimiento.** Comprueba con volúmenes realistas (y algo por encima) que la app responde aceptablemente.

**6. Seguridad.** Verifica cada requisito del nivel de protección asignado. Revisa dependencias con vulnerabilidades conocidas (por ejemplo, con el auditor del gestor de paquetes).

**7. Accesibilidad y UI.** Navegación por teclado, contraste, coherencia con el design system, estados vacíos y de error tal como se diseñaron.

**8. Registro de defectos.** Cada problema con severidad (bloqueante, grave, menor, cosmético). Los bloqueantes y graves se resuelven antes de lanzar; el resto se decide con el usuario.

> **Con impeccable:** si la skill `impeccable` está instalada, `audit` cubre accesibilidad, rendimiento y adaptación a pantallas; sus hallazgos van a este documento. Ver `referencias/integraciones.md`.

## Checklist de salida
- [ ] Tests automáticos pasando.
- [ ] Todas las historias del MVP verificadas.
- [ ] Casos límite probados.
- [ ] Plataformas declaradas probadas.
- [ ] Requisitos de seguridad del nivel verificados.
- [ ] Sin defectos bloqueantes ni graves abiertos.

## Cómo escala según el perfil
- **P1–P2:** tests de la lógica central, pruebas manuales completas, revisión de dependencias.
- **P3:** se suman pruebas de permisos (que un usuario no acceda a datos de otro).
- **P4:** se suman integración continua que corre los tests en cada cambio, pruebas de carga básicas, revisión de seguridad guiada por OWASP o la guía de la plataforma.
- **P5:** se suma auditoría externa.

## Errores comunes
- Probar solo con los datos "lindos" del desarrollo.
- Considerar que la prueba manual de quien lo construyó es suficiente para todo.

## Plantilla — `docs/08-calidad.md`

~~~markdown
# Pruebas y calidad

**Versión probada:** …
**Fecha:** AAAA-MM-DD

## Tests automáticos
- Cómo correrlos:
- Cobertura de la lógica central:

## Verificación de historias
| Historia | Resultado | Notas |
|---|---|---|

## Casos límite
| Caso | Resultado |
|---|---|

## Plataformas
| Plataforma | Resultado |
|---|---|

## Seguridad (nivel P_)
| Requisito | Verificado | Notas |
|---|---|---|

## Defectos
Los que quedan abiertos son un `T-n` `pendiente` en `trabajo.md` (con su severidad); acá queda el registro.

| # | Descripción | Severidad | Resultado |
|---|---|---|---|
~~~

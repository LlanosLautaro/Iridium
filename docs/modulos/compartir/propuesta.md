# Propuesta del módulo: Compartir

**Fecha:** 2026-10-31
**Tipo:** sección

## Qué problema resuelve
Iridium vive solo en esta PC: el repo no tiene copia en ningún lado, cada versión nueva se arma a mano (`pnpm actualizar`) y la carpeta de proyectos está fija. El usuario quiere además compartirlo con conocidos, con versiones beta que se actualicen solas (D-054), con el código público y `docs/` hablando solo de Iridium (D-057). Es lo que era I-7 (`07-construccion.md` › I-7).

## Por qué ahora
Apariencia terminó su construcción (Q-88) y deja libre un lugar de frente; Compartir es el primero en espera (`02-definicion.md` › Módulos previstos).

## Lo que cambia el plan: las condiciones del Agent SDK
La documentación del Agent SDK (el motor de Iridium) dice, consultada hoy: «salvo aprobación previa, Anthropic no permite que desarrolladores de terceros ofrezcan el inicio de sesión de claude.ai ni sus límites de uso en sus productos, incluidos los agentes hechos con el Agent SDK; usen una clave de API». También pide que un producto no se presente como Claude Code. `01-exploracion.md` › Usar la suscripción y no la API ya lo anticipaba: para uso propio alcanza la suscripción; para repartir, hace falta una clave de API.

Consecuencias para repartir Iridium a otros:
- **Cada conocido necesitaría una clave de API** de Anthropic y pagaría por uso (aparte de su suscripción); Iridium tendría que pedirla y guardarla con cuidado. El uso que muestra la barra (porcentajes de la suscripción) no aplica a una clave.
- **O pedir aprobación a Anthropic**, sin plazo ni respuesta segura.
- **Para el usuario no cambia nada:** usa su propia herramienta con su propia sesión.

## Cómo encaja en el producto
Toca el marco (avisos de versión nueva, elegir la carpeta de proyectos en Ajustes, D-065 lo dejó previsto), el instalador (`05-arquitectura.md` › Despliegue) y el perfil: repartir lo sube de «solo el usuario» a «otros usuarios», con doble factor en GitHub y el aviso de SmartScreen (D-054).

## Por qué es un módulo y no una funcionalidad
- [x] Dominio propio que requiere investigación: GitHub Releases y la actualización de Electron, condiciones de uso, limpiar un historial de git público.
- [x] Flujos propios: primer arranque, aviso de actualización.
- [x] Ritmo propio (D-063).
- [x] Se distribuye por separado (el instalador público).

## Alternativas (lo que se elige en Q-90)
- **A) Solo para vos, por ahora (recomendada):** GitHub con `dev` y `main` como copia y registro, el instalador en Releases y que Iridium se actualice solo al cerrar (resuelve armarlo con la app abierta). Repo **privado**: no hace falta limpiar `docs/` ni el historial. Repartir queda para cuando se sepa cómo (clave de API o aprobación).
- **B) Repartir con clave de API:** todo lo de D-054 y D-057 más una pantalla para que cada uno ponga su clave y un uso en dólares en vez de porcentajes. Repo público con `docs/` limpio. Lo más grande, y a tus conocidos les cuesta plata por uso.
- **C) Pausar Compartir:** entra el siguiente frente en espera (Inicio) y Compartir vuelve cuando haya una respuesta de Anthropic o ganas de usar claves.

## Decisión
A, solo para el usuario por ahora, con iniciar sesión desde Iridium (Q-90, D-069).

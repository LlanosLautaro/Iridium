# Perfil del proyecto

> Respuestas al cuestionario de `references/perfil-proyecto.md` de la skill. Lo consultan todos los hitos para decidir cuánta protección e infraestructura hace falta. Si algo cambia (por ejemplo, una app personal pasa a ser pública), actualizarlo y registrar el cambio en `decisiones.md`.

**Última actualización:** 2026-10-23 (permisos de la IA, D-021; lo demás confirmado por el usuario, Q-30)

## Alcance y usuarios
- Quién la usa: solo el usuario.
- Cantidad de usuarios (inicio / a un año): 1 / 1.
- Cuentas y roles: ninguna; la única cuenta es la de Claude, que ya usa Claude Code.
- Publicación: no se publica. Si algún día se comparte, necesitaría claves de API en vez de la suscripción (`01-exploracion.md` › Usar la suscripción y no la API).
- Horizonte (largo plazo / puntual): largo plazo; es la herramienta con la que se desarrolla todo lo demás.

## Plataforma
- Plataformas: app de escritorio en Windows. Además, una extensión del navegador (Revisión de la app, D-012). El celular solo recibe y manda archivos por LocalSend (D-005). Por ahora no hay versión para el celular ni para Linux; quizás más adelante (Q-30), así que conviene una tecnología que no lo cierre (hito 5).
- Accesos al sistema: archivos de la carpeta de proyectos y de las skills; ejecutar programas y comandos (scripts, VS Code, LocalSend); avisos del sistema; un programa local que recibe lo que manda la extensión del navegador.
- Offline: todo lo que lee archivos funciona sin internet; la conversación con la IA necesita conexión.
- Restricciones de hardware o rendimiento: ninguna especial; varias sesiones de IA a la vez (D-015) no deberían trabar la PC.

## Datos
- Qué datos maneja: los archivos de los proyectos (docs, código, respuestas, comentarios, fichas), la biblioteca de diseño (capturas y estilos), la configuración del Centro y el historial de las conversaciones con la IA.
- Datos sensibles: la sesión iniciada de la cuenta de Claude (la guarda Claude Code, no el Centro). Los proyectos pueden tener claves propias en sus archivos.
- Dónde viven: en la PC. Los proyectos, en sus carpetas (con git); lo propio del Centro, en una carpeta local. Las conversaciones pasan por los servidores de Anthropic, como hoy con Claude Code.
- Impacto si se pierden / si se filtran: perder un proyecto es grave, pero git lo cubre; perder la biblioteca de diseño, molesto. Una filtración expondría el código y las notas de los proyectos, no datos de terceros.

## Exposición e integraciones
- Exposición a internet: no tiene servidor accesible desde afuera. Consume el servicio de Anthropic por el Agent SDK. El programa que recibe los comentarios de la extensión escucha solo dentro de la PC.
- Servicios externos: Anthropic (Claude Code, con la suscripción); LocalSend en la red de la casa.
- Contenido de terceros que abre o procesa: páginas web de las que se extrae un estilo (Diseño); código y skills de terceros (Open Design, `impeccable`); y la IA ejecuta comandos en la PC sin pedir permiso (modo *bypass*, D-021).

## Dinero y legal
- Pagos / publicidad: ninguno.
- Licencias de terceros relevantes: las del código que se tome (Open Design Apache-2.0, Open CoDesign MIT, con aviso de autoría; D-011); las skills de Anthropic que no se pueden copiar (D-014); las condiciones de uso de la suscripción con el Agent SDK (a confirmar en el hito 3).
- Regulaciones: ninguna; no hay datos de terceros.

## Recursos
- Quién la construye: el usuario dirige y la IA escribe el 100 % del código.
- Experiencia técnica: nociones de desarrollo; no programa ni revisa código. Usa VS Code, Claude Code, git y la guía de hitos.
- Presupuesto mensual: la suscripción de Claude que ya paga; nada extra.
- Fecha límite: ninguna.

## Nivel de protección
**P2 — Personal conectado**

Motivo: es de uso propio y local, pero maneja la sesión de la cuenta de Claude, procesa contenido de terceros (páginas web, código y skills ajenas) y le da a una IA acceso a los archivos y a ejecutar comandos. No sube a P3: no hay otros usuarios ni datos de terceros.

## Requisitos que aplican
**P1 — Local**
- [ ] Dependencias de fuentes confiables y actualizadas.
- [ ] Backups de los datos del usuario si son difíciles de recuperar (la biblioteca de diseño y la configuración del Centro; los proyectos ya tienen git).
- [ ] No borrar ni sobrescribir archivos del usuario sin confirmación.

**P2 — Personal conectado**
- [ ] Secretos fuera del código y del repo; la sesión de Claude la maneja Claude Code, el Centro no la guarda.
- [ ] Comunicación cifrada (HTTPS) con los servicios externos.
- [ ] Validar y sanear todo contenido externo (páginas de las que se extrae un estilo, lo que llega del celular, lo que manda la extensión). Nunca ejecutar contenido de terceros.
- [ ] Plan si se pierde el acceso a la nube: todo lo que no es la IA sigue funcionando, y la app puede abrir Claude Code en lugar de manejarlo (D-006).

**Propios de este proyecto**
- [ ] La IA trabaja sin pedir permisos (D-021): cada proyecto tiene git para deshacer lo que haga, y la sesión se puede frenar o cerrar.
- [ ] Si igual llega un pedido de permiso, se rechaza solo y la IA lo anota como `Q-n` (D-021).
- [ ] El programa que recibe los comentarios de la extensión solo acepta conexiones de la misma PC.

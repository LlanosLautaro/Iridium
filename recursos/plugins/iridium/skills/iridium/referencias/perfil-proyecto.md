# Perfil del proyecto

El perfil se completa en el hito 2 y se guarda en `docs/perfil-proyecto.md`. Es la referencia que consultan todos los hitos siguientes para saber cuánta protección, infraestructura y formalidad hace falta.

**Qué regula el perfil y qué no:**

| Siempre completo, sin importar el perfil | Escala según el perfil |
|---|---|
| Idea, exploración, definición y alcance | Seguridad avanzada (auditorías, pentesting, hardening) |
| Investigación de dominio (si el dominio no es trivial) | Privacidad y cumplimiento legal |
| UX (flujos, wireframes, estados) | Términos de uso, licencias de distribución |
| Arquitectura documentada | Monitoreo, alertas, SLA |
| Design system y UI | Infraestructura de publicación (tiendas, CI/CD, entornos) |
| Registro de decisiones y estado | Soporte a usuarios, analítica |
| Pruebas de la lógica central | Cobertura de pruebas exhaustiva, pruebas de carga |

## Cuestionario

Hazlo en tandas. Si una respuesta no está clara, propone la opción más probable y pide confirmación.

### A. Alcance y usuarios
1. ¿Quién va a usar la app? (solo yo / gente cercana / un equipo u organización / público general)
2. ¿Cuántos usuarios esperás al principio y a un año? (orden de magnitud)
3. ¿Hay cuentas de usuario? ¿Distintos roles o permisos?
4. ¿Se va a publicar? ¿Dónde? (no se publica / web abierta / tiendas de apps / distribución privada)
5. ¿Es un proyecto a largo plazo o algo puntual?

### B. Plataforma
6. ¿En qué plataforma corre? (web / móvil iOS / móvil Android / desktop Windows / macOS / Linux / CLI / extensión / otra)
7. ¿Necesita acceso a recursos del sistema? (archivos locales, cámara, GPS, notificaciones, otros programas)
8. ¿Tiene que funcionar sin conexión?
9. ¿Hay restricciones de hardware o rendimiento? (equipos viejos, archivos muy grandes, gráficos 3D, audio)

### C. Datos
10. ¿Qué datos guarda o procesa?
11. ¿Alguno es sensible? (datos personales de otros, credenciales, financieros, de salud, de menores, ubicación)
12. ¿Dónde viven los datos? (solo local / nube propia / servicio de terceros)
13. ¿Qué pasa si se pierden? ¿Y si se filtran?

### D. Exposición e integraciones
14. ¿La app está expuesta a internet? (no / solo consume APIs / tiene un servidor accesible)
15. ¿Se integra con servicios externos? ¿Cuáles?
16. ¿Ejecuta o abre contenido de terceros? (archivos descargados, plugins, scripts, mods)

### E. Dinero y legal
17. ¿Hay pagos, suscripciones o publicidad?
18. ¿Usa contenido, marcas o código de terceros con licencias que importen?
19. ¿Hay regulaciones aplicables? (protección de datos de tu país, GDPR, salud, finanzas, menores)

### F. Recursos
20. ¿Quién la construye? Por defecto: el usuario con IA, y la IA escribe el 100 % del código (principio 6 del framework). Confirmarlo y anotarlo en el perfil.
21. ¿Qué conocimientos de desarrollo tenés y con qué tecnologías estás familiarizado? No es para que programes: sirve para calibrar cómo se discuten las decisiones técnicas y qué preferencias tenés.
22. ¿Presupuesto mensual para servicios? (cero / bajo / sin problema)
23. ¿Hay fecha límite?

## Niveles de protección

Se asigna el nivel más alto que dispare cualquier respuesta. No es la categoría "personal o profesional": una app personal que guarda credenciales o abre archivos de terceros puede necesitar más protección que una app pública sin datos.

| Nivel | Se dispara cuando… | Ejemplos |
|---|---|---|
| **P1 — Local** | Uso propio, datos solo locales y no sensibles, sin servidor expuesto | Gestor de archivos personal, herramienta CLI, juego offline |
| **P2 — Personal conectado** | Uso propio pero con nube, sincronización, credenciales propias, o procesa contenido descargado de terceros | App personal con backup en la nube, cliente de una API con tu token, visor de archivos descargados |
| **P3 — Compartido** | Otros usuarios con cuentas, uso en equipo u organización, o datos personales de terceros | Herramienta interna de un equipo, app para familia o amigos |
| **P4 — Público** | Cualquiera puede usarla, publicada en web abierta o tiendas | SaaS gratuito, app en tiendas |
| **P5 — Sensible o regulado** | Pagos, salud, finanzas, menores, regulación específica, o alto impacto si se filtra | Cobros, historias clínicas, datos bancarios |

## Qué exige cada nivel (acumulativo)

**P1 — Local**
- Dependencias de fuentes confiables y actualizadas.
- Backups de los datos del usuario si son difíciles de recuperar.
- No borrar ni sobrescribir archivos del usuario sin confirmación.

**P2 — Personal conectado** (suma a P1)
- Secretos (tokens, claves) fuera del código y del repo; en variables de entorno o el almacén de credenciales del sistema.
- Comunicación cifrada (HTTPS).
- Validar y sanear todo contenido externo: archivos descargados, JSON de terceros, paquetes comprimidos (rutas que escapan de la carpeta, tamaños absurdos, formatos malformados). Nunca ejecutar contenido de terceros.
- Plan de recuperación si se pierde el acceso a la nube.

**P3 — Compartido** (suma a P2)
- Autenticación robusta (preferir proveedores existentes antes que implementar login propio).
- Autorización: cada usuario solo ve y toca lo que le corresponde; verificar en el servidor, no solo en la interfaz.
- Registro de accesos y cambios relevantes.
- Política mínima de privacidad aunque sea informal: qué datos se guardan y para qué.

**P4 — Público** (suma a P3)
- Revisión de seguridad antes del lanzamiento (OWASP Top 10 como guía en web; guías de la plataforma en móvil).
- Límites de uso (rate limiting) y protección contra abuso.
- Política de privacidad y términos de uso publicados.
- Monitoreo de errores y disponibilidad.
- Proceso para actualizar dependencias con vulnerabilidades.
- Cumplir requisitos de las tiendas si aplica.

**P5 — Sensible o regulado** (suma a P4)
- Asesoramiento legal sobre la regulación aplicable.
- Delegar pagos a un proveedor certificado; nunca almacenar datos de tarjetas.
- Cifrado de datos sensibles en reposo.
- Auditoría de seguridad externa.
- Plan de respuesta a incidentes y notificación de filtraciones.

## Plantilla

La plantilla de `docs/perfil-proyecto.md` está en `plantillas/perfil-proyecto.md`.

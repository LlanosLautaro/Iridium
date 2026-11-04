# Definición del módulo: Inicio

**Fecha:** 2026-11-02 (Q-113: B)

## Objetivo del módulo
Que el inicio muestre cada cosa en su lugar: la grilla, solo los proyectos; las ideas sueltas, en su propia sección, a la vista y con su chat al lado; y las skills, donde ya están (D-068).

## Criterios de éxito
- Para leer una idea anotada no hay que abrir la carpeta `Ideas` como proyecto ni preguntarle al chat.
- La grilla de Proyectos no muestra carpetas que no son proyectos.
- El chat general sigue al lado de la grilla, para pedirle proyectos nuevos y lo que toca a varios (Q-113), y es la misma conversación que la del panel Ideas.

## Funcionalidades
### Must (MVP del módulo)
- **Ideas en el inicio:** un cuarto ícono, **Ideas**, debajo de Skills, con `Ctrl+4`.
- **Ver las ideas:** la lista de `Ideas/ideas.md` por sección (Sueltas, Para proyectos existentes, Integradas), con la fecha y a qué proyectos toca; la elegida, entera al medio; en las integradas, a dónde fue.
- **Hablar de una idea:** a la derecha, el chat de la carpeta `Ideas` (el mismo de la grilla, D-060). Con una idea elegida, arriba del cuadro dice «Sobre la idea …», como «Sobre la skill …».
- **La grilla, solo proyectos:** `Ideas` y `Skills` no salen como tarjetas. Sus vistas de proyecto (Docs, Git, Scripts…) siguen a un clic con **Abrir como proyecto**, en el panel Ideas y en Skills.
- **El chat de la grilla se queda** (Q-113: B).

### Should
- **Pedir que la integren:** en una idea suelta o para un proyecto existente, un botón que escribe en el chat el pedido de pasarla a su proyecto (las reglas de `Ideas/CLAUDE.md` › Cuando una idea madura), para mandarlo o cambiarlo.
- **Los proyectos que toca, como enlaces:** cada nombre abre ese proyecto.

### Could
- Las «Ideas nuevas» de cada proyecto (su `07-construccion.md`) juntas en el mismo panel (la otra idea de Q-74).
- Buscar entre las ideas.

### Won't (por ahora)
- **Escribir o mover ideas a mano en Iridium:** `ideas.md` lo ordena la IA con sus reglas; dos formas de escribir lo mismo se pisan.
- **Ideas como sección propia de cada proyecto:** el atajo a las ideas del proyecto queda como idea (`07-construccion.md` › Ideas nuevas).

## Fuera de alcance
- Cambiar las reglas de la carpeta `Ideas` (`Ideas/CLAUDE.md`): es otra carpeta; desde acá no se toca sin pedido.
- La ficha de `Ideas` dice `idea` y su `CLAUDE.md` pide `en-uso`: lo decide quien mantiene esa carpeta, no este módulo.

## Impacto en el perfil
Ninguno: solo lee un archivo más de la carpeta de proyectos. Sigue en P2.

## Términos nuevos (se agregan al glosario general)
| Término | Significado |
|---|---|
| Idea suelta | Una idea anotada en `Ideas/ideas.md` que todavía no pasó a un proyecto |
| Chat general | La conversación de la carpeta `Ideas`; se ve al lado de la grilla y en el panel Ideas (D-060) |

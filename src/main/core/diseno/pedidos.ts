// Los pedidos a la IA de la sección Diseño (`modulos/diseno/diseno-tecnico.md` › Los pedidos a la IA). Citan el
// framework en vez de repetir el formato: así un cambio de formato va en un solo lugar (D-086).

/** Los archivos de la raíz que no cuentan como código: la ficha, su ícono, las instrucciones y los de Git. */
const NO_ES_CODIGO =
  /^(\.proyecto\.json|\.proyecto-icono\.\w+|CLAUDE\.md|AGENTS\.md|README\.md|\.git|\.gitignore|\.gitattributes|docs)$/i

/** Si el proyecto tiene código: algo en su raíz fuera de `docs/`, la ficha, su ícono, el `CLAUDE.md` y lo de Git. */
export function tieneCodigo(entradasRaiz: readonly string[]): boolean {
  return entradasRaiz.some((e) => !NO_ES_CODIGO.test(e))
}

/** DS-1: empezar el diseño de un proyecto que todavía no tiene `docs/diseno/`. */
export function pedidoEmpezar(conCodigo: boolean): string {
  const desde = conCodigo
    ? 'Dibujá las pantallas como están hoy en la app: salen de su código y de `docs/06-ui.md` (si está).'
    : 'Dibujá las pantallas desde `docs/04-ux.md` (las pantallas, sus estados y los wireframes) y la dirección visual de `docs/06-ui.md`, si está.'
  return [
    'Armá el diseño de este proyecto en `docs/diseno/`, como dice el framework (`referencias/06-ui.md` › Maquetas): el índice, los tokens, las piezas y una maqueta por pantalla y por estado.',
    desde,
    'Guardá cada maqueta apenas esté lista: aparecen de a una en Iridium › Diseño.',
  ].join('\n\n')
}

/**
 * DS-5: otra versión de una maqueta (`pantallas/bandeja.html`) en `version` (`versiones/bandeja/b.html`). Va citado en
 * la conversación (D-196): lo que se prueba lo escribe el usuario después de la cita. La de hoy y el índice no se
 * tocan: Iridium las pone lado a lado y el usuario elige.
 */
export function pedidoOtraVersion(maqueta: string, version: string): string {
  return [
    `Escribí otra versión de la maqueta \`docs/diseno/${maqueta}\` en \`docs/diseno/${version}\`, como dice el framework (\`referencias/06-ui.md\` › Maquetas), con lo que te pido después de esta cita; si no pido nada, probá una dirección distinta de la de hoy.`,
    `Es una maqueta más, con las hojas a dos carpetas (\`../../tokens.css\`, \`../../piezas.css\`) y en \`<meta name="descripcion" content="…">\` una frase corta con lo que prueba. No cambies la maqueta de hoy ni el índice: Iridium las muestra lado a lado y el usuario elige con cuál quedarse.`,
  ].join('\n\n')
}

// Lo que ve la sección Diseño (frente Diseño, DS-11 a DS-13; `modulos/diseno/diseno-tecnico.md`). La ventana no lee
// el disco: el proceso principal arma todo esto y sirve las maquetas por `maqueta:` (miniaturas) y `file:` (la grande).

/** Una maqueta en el lienzo. */
export interface MaquetaVista {
  /** Relativo a `docs/diseno/`: `pantallas/bandeja.html`. */
  archivo: string
  nombre: string
  /** Cambia cuando cambia el archivo o lo que usa: la miniatura se recarga con ella. */
  huella: string
  /** La IA la cambió y todavía no se miró (DS-3: el punto). */
  cambiada: boolean
  /** Por qué no se puede mostrar («Falta ../piezas.css»), o null. */
  rota: string | null
  /** `AAAA-MM-DD HH:MM` cuando se pasó al código, o null. */
  enLaApp: string | null
  /** Sin pasar al código, o cambió después de pasarla. */
  pendiente: boolean
}

export interface GrupoMaquetas {
  seccion: string
  maquetas: MaquetaVista[]
}

export type GrupoToken = 'colores' | 'letra' | 'estilos' | 'tamanos' | 'espacios' | 'sombras' | 'otras'

export interface TokenVista {
  nombre: string
  valor: string
  grupo: GrupoToken
  /** Para qué se usa (el comentario del token en `tokens.css`, D-114), o null. */
  uso: string | null
  /** Solo en los estilos de texto (T-61): el atajo `font` con los `var(--…)` resueltos, o null si no se entiende. */
  muestra?: string | null
}

export interface SistemaDiseno {
  tokens: TokenVista[]
  /** Las líneas de `tokens.css` que no se entienden (DS-13: el recuadro de error), o qué falta. */
  errores: { linea: number | null; texto: string }[]
  /** La maqueta de piezas (`piezas.html`), o null si todavía no está dibujada. */
  piezas: MaquetaVista | null
}

export type VistaDiseno =
  | {
      tipo: 'sin-diseno'
      /** Si el proyecto ya tiene código: el pedido dibuja la app de hoy; si no, sale de `04-ux.md` (DS-1). */
      conCodigo: boolean
    }
  | {
      tipo: 'diseno'
      /** La base de las miniaturas: `maqueta://<id>/`. */
      base: string
      /** La carpeta como dirección `file:` (con `/` al final), para la grande. */
      carpeta: string
      grupos: GrupoMaquetas[]
      sistema: SistemaDiseno
      /** Lo que está mal en el índice (sin tabla, columnas que faltan), o null. */
      problemaIndice: string | null
    }

/** Los pedidos a la IA de la sección (gastan uso; la ventana lo dice antes). */
export type PedidoDiseno = 'empezar'

/** El evento del puente: cambió algo de `docs/diseno/` de un proyecto. */
export interface CambioDiseno {
  ruta: string
  /** Relativos a `docs/diseno/`. */
  archivos: string[]
}

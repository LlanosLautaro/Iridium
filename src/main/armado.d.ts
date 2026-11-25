declare global {
  /** Con qué se armó esta versión (`electron.vite.config.ts`): cuándo (ms), el commit y si había cambios sin commitear. */
  const __ARMADO__: {
    fecha: number
    commit: string
    mensaje: string
    sinGuardar: boolean
    /** Los últimos commits, del más nuevo al más viejo (Q-290). */
    cambios: { commit: string; fecha: number; mensaje: string }[]
  }
}

export {}

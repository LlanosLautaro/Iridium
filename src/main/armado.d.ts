declare global {
  /** Con qué se armó esta versión (`electron.vite.config.ts`): cuándo (ms), el commit y si había cambios sin commitear. */
  const __ARMADO__: { fecha: number; commit: string; mensaje: string; sinGuardar: boolean }
}

export {}

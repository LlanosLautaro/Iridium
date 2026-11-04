import type { ApiIridium } from '../compartido/puente'

declare global {
  /** Con qué se armó esta versión (CO-I5, `electron.vite.config.ts`): cuándo (ms), el commit y si había cambios sin commitear. */
  const __ARMADO__: { fecha: number; commit: string; mensaje: string; sinGuardar: boolean }
  interface Window {
    iridium: ApiIridium
  }
}

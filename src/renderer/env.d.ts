import type { ApiIridium } from '../compartido/puente'

declare global {
  /** Con qué se armó esta versión (CO-I5, `electron.vite.config.ts`): cuándo (ms), el commit y si había cambios sin commitear. */
  const __ARMADO__: { fecha: number; commit: string; mensaje: string; sinGuardar: boolean }
  interface Window {
    iridium: ApiIridium
  }
}

// El `<webview>` de Electron (la maqueta grande de Diseño, S-4): la ventana tiene `webviewTag` y el proceso principal
// rehace sus opciones al adjuntarlo. Acá solo lo que usa la sección.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { src?: string }
    }
  }
}

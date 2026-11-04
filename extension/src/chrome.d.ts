// Lo poco de la API de extensiones que usa la Revisión (sin sumar @types/chrome entero).
declare namespace chrome {
  namespace runtime {
    interface MessageSender {
      tab?: { id?: number; windowId: number }
    }
    function sendMessage<T = unknown>(mensaje: unknown): Promise<T>
    function getURL(ruta: string): string
    function getManifest(): { version: string }
    const onMessage: {
      addListener(
        f: (
          mensaje: unknown,
          remitente: MessageSender,
          responder: (r: unknown) => void,
        ) => boolean | undefined,
      ): void
    }
    const onStartup: { addListener(f: () => void): void }
    const onInstalled: { addListener(f: () => void): void }
  }
  namespace storage {
    const local: {
      get(claves: string | string[] | null): Promise<Record<string, unknown>>
      set(datos: Record<string, unknown>): Promise<void>
      remove(claves: string | string[]): Promise<void>
    }
  }
  namespace tabs {
    function captureVisibleTab(idVentana: number, opciones: { format: 'png' }): Promise<string>
    function sendMessage(idPestana: number, mensaje: unknown): Promise<unknown>
  }
  namespace action {
    function setBadgeText(d: { text: string }): Promise<void>
    function setBadgeBackgroundColor(d: { color: string }): Promise<void>
    function setBadgeTextColor(d: { color: string }): Promise<void>
    function setTitle(d: { title: string }): Promise<void>
    const onClicked: { addListener(f: (pestana: { id?: number }) => void): void }
  }
  namespace alarms {
    function create(nombre: string, d: { periodInMinutes: number }): void
    const onAlarm: { addListener(f: (a: { name: string }) => void): void }
  }
}

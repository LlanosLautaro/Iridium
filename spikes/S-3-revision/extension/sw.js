// Service worker: toma la captura (si se puede) y le habla al programa local en 127.0.0.1.
const PUERTO = 47321
chrome.runtime.onMessage.addListener((msg, sender, responder) => {
  ;(async () => {
    const informe = { swCorre: true, apis: {
      captureVisibleTab: typeof chrome.tabs?.captureVisibleTab,
      scripting: typeof chrome.scripting?.executeScript,
      storageLocal: typeof chrome.storage?.local?.set
    } }
    try {
      const datos = await chrome.tabs.captureVisibleTab(sender.tab?.windowId, { format: 'png' })
      informe.captura = { ok: true, largo: datos.length }
    } catch (e) { informe.captura = { ok: false, error: String(e?.message ?? e) } }
    try {
      const r = await fetch(`http://127.0.0.1:${PUERTO}/comentario`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...msg, informe })
      })
      informe.envio = { ok: r.ok, estado: r.status, cuerpo: await r.text() }
    } catch (e) { informe.envio = { ok: false, error: String(e?.message ?? e) } }
    responder(informe)
  })()
  return true
})

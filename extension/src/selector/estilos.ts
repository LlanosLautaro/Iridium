// Estilos de lo que dibuja la extensión sobre la app (DESIGN.md › Revisión de la app). Viven en un Shadow DOM cerrado:
// no heredan nada de la página ni le cambian nada. Los valores son los tokens de Iridium (docs/diseno/tokens.css).
export const FAMILIA_UI = 'Iridium Chakra Petch'
export const FAMILIA_MONO = 'Iridium JetBrains Mono'

export const ESTILOS = `
:host { all: initial; }
* { box-sizing: border-box; margin: 0; }
.capa {
  --fondo: #0a0f0e; --barra: #060908; --elevado: #0e1513; --hover: #121c19; --caja: #0f1714;
  --borde: #18241f; --borde-suave: #121b18; --borde-fuerte: #24362f; --borde-control: #557068;
  --texto: #d9e6e0; --texto-2: #a3b8b0; --texto-3: #74908a;
  --primario: #3ee6a8; --primario-texto: #5cecb8; --ok: #3ee6a8; --espera: #f5b13d; --error: #ff5f57;
  --sel-fondo: #0f241d; --seleccion: #3ee6a844;
  --ui: "${FAMILIA_UI}", "Segoe UI", sans-serif; --mono: "${FAMILIA_MONO}", Consolas, monospace;
  --sale: cubic-bezier(.16, 1, .3, 1);
  position: fixed; inset: 0; pointer-events: none;
  font: 400 13.5px/1.5 var(--ui); color: var(--texto); font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased; text-align: left; letter-spacing: normal; text-transform: none;
}
::selection { background: var(--seleccion); color: var(--texto); }
button, textarea { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
:focus-visible { outline: 1px solid var(--primario); outline-offset: -1px; }
svg.ic { width: 14px; height: 14px; flex: none; stroke: currentColor; fill: none; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }

.resalte { position: fixed; border: 1.5px solid var(--primario); border-radius: 4px; background: color-mix(in oklab, var(--primario) 9%, transparent);
  transition: top .09s var(--sale), left .09s var(--sale), width .09s var(--sale), height .09s var(--sale); }
.resalte.elegido { border-width: 2px; background: color-mix(in oklab, var(--primario) 5%, transparent); }
.etiqueta { position: fixed; display: inline-flex; align-items: center; gap: 6px; height: 22px; padding: 0 8px; border-radius: 5px;
  background: var(--barra); border: 1px solid color-mix(in oklab, var(--primario) 45%, transparent);
  font: 500 12px/1 var(--mono); color: var(--texto-2); white-space: nowrap; }
.etiqueta b { color: var(--primario-texto); font-weight: 600; }
.etiqueta .sep { color: var(--texto-3); }

.aviso { position: fixed; right: 16px; bottom: 16px; display: flex; align-items: center; gap: 10px; padding: 9px 12px; max-width: 420px;
  background: var(--barra); border: 1px solid var(--borde-fuerte); border-radius: 10px; box-shadow: 0 6px 14px oklch(0 0 0 / .5);
  animation: aviso 2.2s var(--sale) forwards; }
.aviso .faro { width: 8px; height: 8px; border-radius: 50%; background: var(--primario); flex: none; }
.aviso.gris .faro { background: var(--texto-3); }
.aviso b { font-weight: 600; display: block; }
.aviso small { display: block; color: var(--texto-3); font-size: 12.5px; }
@keyframes aviso { 0% { opacity: 0; translate: 0 6px; } 10%, 75% { opacity: 1; translate: 0 0; } 100% { opacity: 0; } }

.tarjeta { position: fixed; width: 380px; max-width: calc(100vw - 24px); pointer-events: auto; background: var(--caja);
  border: 1px solid var(--borde-fuerte); border-radius: 10px; box-shadow: 0 6px 14px oklch(0 0 0 / .5); animation: aparece .18s var(--sale); }
.tarjeta:focus-within { border-color: color-mix(in oklab, var(--primario) 60%, var(--borde-fuerte)); }
@keyframes aparece { from { opacity: 0; translate: 0 4px; } }
.cab { display: flex; align-items: center; gap: 6px; padding: 9px 10px 0 12px; font: 500 12px/1.3 var(--mono); color: var(--texto-3); }
.cab .que { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cab .que b { color: var(--texto-2); font-weight: 600; }
.cab .proy { display: inline-flex; align-items: center; gap: 3px; height: 20px; padding: 0 6px; margin-left: auto; border-radius: 5px;
  font: 600 12px/1 var(--ui); color: var(--texto-2); white-space: nowrap; }
.cab .proy:hover { background: var(--hover); color: var(--texto); }
.cab .proy svg { width: 11px; height: 11px; rotate: 90deg; color: var(--texto-3); }
.cab .x { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 5px; color: var(--texto-3); margin-left: auto; flex: none; }
.cab .proy + .x { margin-left: 0; }
.cab .x:hover { background: var(--hover); color: var(--texto); }
.cab .x svg { width: 12px; height: 12px; }
.elegir { padding: 10px 12px 2px; }
.elegir p { font-weight: 600; margin-bottom: 6px; }
.elegir p code { font: 500 12.5px var(--mono); color: var(--texto); }
.opciones { display: flex; flex-wrap: wrap; gap: 4px; max-height: 132px; overflow: auto; }
.opciones button { height: 26px; padding: 0 9px; border: 1px solid var(--borde-fuerte); border-radius: 5px; color: var(--texto-2); }
.opciones button:hover { color: var(--texto); border-color: var(--texto-3); }
.opciones button[aria-pressed="true"] { border-color: var(--primario); color: var(--texto); background: var(--sel-fondo); }
.cuerpo { display: flex; gap: 6px; padding: 8px 12px 4px; }
.cuerpo::before { content: ">"; font: 500 14px/1.55 var(--mono); color: var(--primario); }
textarea { flex: 1; resize: none; min-height: 44px; max-height: 50vh; font: 400 14px/1.55 var(--ui); color: var(--texto); caret-color: var(--primario); cursor: text; outline: none; overflow: auto; }
textarea::placeholder { color: var(--texto-3); }
textarea:focus-visible { outline: none; }
.linea { display: flex; gap: 8px; align-items: flex-start; margin: 0 12px 10px; padding: 8px 10px; border-radius: 6px; background: var(--elevado); color: var(--texto-2); font-size: 12.5px; }
.linea svg { margin-top: 2px; color: var(--texto-3); }
.linea.mal svg { color: var(--error); }
.pie { display: flex; align-items: center; gap: 6px; padding: 6px 10px 10px 12px; }
.pie .ayuda { color: var(--texto-3); font-size: 12px; margin-right: auto; }
.btn { display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 9px; border: 1px solid color-mix(in oklab, var(--primario) 55%, transparent);
  border-radius: 5px; font-weight: 600; white-space: nowrap; color: var(--primario-texto); }
.btn:hover { background: var(--sel-fondo); }
.btn:disabled { opacity: .45; cursor: not-allowed; background: none; }
.btn.sec { border-color: var(--borde-fuerte); color: var(--texto-2); font-weight: 500; }
.btn.sec:hover:not(:disabled) { color: var(--texto); background: var(--elevado); }
.hecho { display: flex; align-items: center; gap: 10px; padding: 14px; }
.hecho svg { width: 16px; height: 16px; color: var(--ok); }
.hecho.gris svg { color: var(--texto-3); }
.hecho b { font-weight: 600; display: block; }
.hecho small { display: block; color: var(--texto-3); font-size: 12.5px; }
.hecho code { font: 600 12.5px var(--mono); color: var(--texto-2); }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`

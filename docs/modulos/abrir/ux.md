# UX del módulo: Abrir

**Fecha:** 2026-11-19
**Estado:** escrita, espera Q-217
> Usa los principios de interacción y el design system generales (`04-ux.md`, `06-ui.md`). Alcance: `definicion.md` (D-154).

## Puntos de entrada y salida
- **Abrir lo que hace el proyecto:** el menú del clic derecho de la tarjeta (W-2) y, dentro del proyecto, la barra de íconos (W-3), abajo, encima de Ajustes del proyecto.
- **Ver si una app está al día:** la tarjeta (solo cuando se arma o falló: al día no dice nada, regla «sin ruido», D-108) y Ajustes del proyecto, con el interruptor de la actualización automática.
- **Lo que pasó mientras no estabas:** el aviso del Arranque (AR-4) suma las apps que se actualizaron (Should).
- **No hay pantalla propia.** Todo vive en lugares que ya existen.

### El nombre del botón
El menú de la tarjeta ya tiene **Abrir**, que entra al proyecto en Iridium. Para no confundirlos, el botón nuevo dice qué abre según el tipo (ver Q-217):

| Tipo | En el menú y en la barra | Qué hace |
|---|---|---|
| escritorio | **Abrir la app** | abre el programa (el `.exe`) |
| página | **Abrir en el navegador** | abre la dirección o el archivo en el navegador |
| consola | **Abrir en la consola** | corre el comando en una consola, como Scripts |

## Historias de usuario
### AB-1 — Abrir lo que hace un proyecto
Como usuario quiero abrir la app de un proyecto con un clic, sin buscar entre sus scripts.
- [ ] En la tarjeta de un proyecto con algo para usar, el menú del clic derecho tiene **Abrir la app** (o el de su tipo) debajo de Abrir, Abrir en VS Code y Abrir la carpeta.
- [ ] Dentro del proyecto, el mismo botón está en la barra de íconos, abajo, encima de Ajustes del proyecto, con su nombre al pasar el mouse.
- [ ] Un proyecto sin script marcado, o una carpeta simple, no muestra el botón en ningún lado.

### AB-2 — Abrir una app que todavía no está armada
Como usuario quiero saber por qué no abre, en vez de que no pase nada.
- [ ] Si el programa no existe todavía, un aviso dice «Alfa todavía no está armada» con **Armar ahora** (corre su script de armar, si está marcado) o, si no lo tiene, «Pedile a la IA del proyecto que la arme».
- [ ] Si se está armando, dice «Alfa se está armando: abre en cuanto termine» y la abre sola al terminar.

### AB-3 — La app se actualiza sola
Como usuario quiero que, al abrir una app de mis proyectos, ya tenga los últimos cambios, sin correr nada.
- [ ] Con commits que la versión armada no tiene, la app cerrada y ninguna IA trabajando en ese proyecto, Iridium la arma sola, sin IA y sin gastar uso de Claude.
- [ ] Mientras se arma, la tarjeta muestra la Señal «Actualizando…»; al terminar no queda nada (al día no se dice).
- [ ] Si la abro mientras se arma, espera y abre la versión nueva (AB-2).
- [ ] Si la app está abierta, espera a que la cierre.

### AB-4 — Saber que un armado falló y apagarlo
Como usuario quiero enterarme si una app no se pudo armar, y poder apagar la actualización en un proyecto.
- [ ] Si falla, la tarjeta muestra la Señal con ✕ «No se pudo actualizar»; la app sigue con la versión anterior. No se reintenta hasta el próximo commit.
- [ ] En Ajustes del proyecto › **Actualización automática**: el interruptor (prendido si el proyecto marca cómo se arma), la última vez («Actualizada hoy 14:02», «Falló hoy 14:02 · Ver la consola», «Actualizándose…») y **Actualizar ahora**.
- [ ] Apagada, no arma nunca sola; **Actualizar ahora** sigue andando. Se recuerda por proyecto.
- [ ] Un proyecto sin script de armar marcado no muestra la sección (solo una línea gris: «Este proyecto no marca cómo se arma»).

## Flujos
```
commit en Alfa ──→ ¿actualización prendida?  ── no ─→ nada
                        │ sí
                        ↓
              ¿app cerrada y ninguna IA en Alfa?  ── no ─→ espera y vuelve a mirar
                        │ sí
                        ↓
              arma (Señal «Actualizando…» en la tarjeta)
                  ├── bien  → al día, sin aviso
                  └── falla → ✕ «No se pudo actualizar» hasta el próximo commit
```

## Pantallas
### El menú de la tarjeta (W-2)
```
┌ Acciones de Alfa ────────┐
│ ◈ Abrir                  │
│ ■ Abrir la app           │
│ □ Abrir en VS Code       │
│ ▫ Abrir la carpeta       │
│ ──────────────────────── │
│ Estado                   │
└──────────────────────────┘
```

### La barra del proyecto (W-3)
```
┌────┐
│ ▼  │ Bandeja de entrada
│ ◈  │ Mapa
│ ◉  │ Revisión
│ ── │
│ □  │ Docs
│ ▫  │ Archivos
│ ↔  │ Git
│ ▶  │ Scripts
│    │
│ ■  │ Abrir la app
│ ◎  │ Ajustes del proyecto
└────┘
```

### La tarjeta mientras se arma o si falló
```
┌───────────────────────────┐   ┌───────────────────────────┐
│ Alfa                      │   │ Alfa                      │
│ 7 — Construcción          │   │ 7 — Construcción          │
│ ● Actualizando…           │   │ ✕ No se pudo actualizar   │
└───────────────────────────┘   └───────────────────────────┘
```

### Ajustes del proyecto › Actualización automática
```
Actualización automática                          [■ prendida]
Arma la app sola cuando tiene cambios y está cerrada, sin IA.
Actualizada hoy 14:02                       [Actualizar ahora]
```
Con un armado que falló: «Falló hoy 14:02 · Ver la consola».

## Estados y extremos
- **La abriste por fuera mientras se armaba** (con su acceso directo): el armado no puede reemplazar los archivos y falla; ese caso se reintenta solo cuando la cierres, porque no es un error de la app.
- **Dos apps con cambios a la vez:** se arman de a una, para no cargar la PC.
- **Iridium se cierra mientras arma:** el armado sigue hasta terminar (como el de Iridium) y la tarjeta lo dice al volver.
- **El script de armar pide algo** (una tecla, una confirmación): la IA del proyecto no tiene que marcar un script así; si pasa, se corta al minuto 10 y cuenta como falla.
- **Ancho chico:** el botón de la barra queda solo como ícono, con su nombre al pasar el mouse, como los demás.

## Piezas de UI nuevas
Ninguna: el menú es MenuContextual, el estado de la tarjeta es la Señal (PZ-7), el interruptor es el Campo y el aviso de AB-2 es el Aviso.

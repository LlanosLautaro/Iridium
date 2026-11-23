// S-6: ¿la consola nativa (node-pty, la de VS Code) carga y corre dentro de Electron 44, suelta y armada?
// Abre PowerShell en una consola de verdad, le escribe un comando, lee lo que imprime (con colores), deja un
// programa corriendo adentro (ping -t), cierra la consola y mira si ese programa quedó vivo.
// S6_DLL=1: la consola que trae node-pty (conpty.dll) en lugar de la de Windows.
// S6_ARBOL=1: cierra cortando el árbol de procesos (taskkill /T) en vez de kill(), que en Windows lanza un fork.
const { app } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execSync } = require('node:child_process');

const salida = process.env.S6_SALIDA || path.join(os.tmpdir(), 's6-salida.json');
const dll = process.env.S6_DLL === '1';
const r = { electron: process.versions.electron, empaquetada: app.isPackaged, conptyDll: dll, pasos: [] };
const fin = (ok, extra) => {
  Object.assign(r, { ok }, extra || {});
  fs.writeFileSync(salida, JSON.stringify(r, null, 2));
  app.exit(ok ? 0 : 1);
};
const pings = () =>
  execSync('tasklist /FI "IMAGENAME eq PING.EXE" /FO CSV /NH').toString().split('\n').filter((l) => l.includes('PING')).length;

if (!app.requestSingleInstanceLock()) {
  // Una segunda instancia (p. ej. un fork que no corre como Node por los fusibles): se anota y se va.
  fs.appendFileSync(salida + '.segunda.txt', `segunda instancia ${new Date().toISOString()} ${process.argv.join(' ')}\n`);
  app.exit(0);
} else app.whenReady().then(() => {
  let pty;
  try {
    pty = require('node-pty');
    r.pasos.push('cargó node-pty');
  } catch (e) {
    return fin(false, { error: String(e && e.stack) });
  }
  const pingsAntes = pings();
  let texto = '';
  let estado = 'esperando';
  const t0 = Date.now();
  const p = pty.spawn('powershell.exe', ['-NoLogo', '-NoProfile'], {
    name: 'xterm-256color', cols: 100, rows: 30, cwd: os.homedir(), env: process.env, useConpty: true, useConptyDll: dll,
  });
  r.pasos.push(`abrió powershell (pid ${p.pid})`);
  p.onData((d) => {
    texto += d;
    if (estado === 'esperando' && texto.includes('S6-LISTO-42')) {
      estado = 'ping';
      r.pasos.push(`leyó la respuesta en ${Date.now() - t0} ms`);
      r.colores = /\x1b\[[0-9;]*m/.test(texto);
      p.resize(120, 40);
      r.pasos.push('cambió de tamaño');
      p.write('ping -t 127.0.0.1\r');
    }
    if (estado === 'ping' && /Reply from|Respuesta desde/.test(texto)) {
      estado = 'cerrando';
      r.pasos.push(`ping corriendo adentro (${pings() - pingsAntes} nuevo)`);
      if (process.env.S6_ARBOL === '1') execSync(`taskkill /T /F /PID ${p.pid}`, { stdio: 'ignore' });
      else p.kill();
      r.pasos.push(process.env.S6_ARBOL === '1' ? 'cortó el árbol de procesos' : 'cerró la consola');
      setTimeout(() => {
        const vivos = pings() - pingsAntes;
        r.pasos.push(`a los 7 s quedan ${vivos} ping vivos`);
        if (vivos > 0) execSync('taskkill /F /IM PING.EXE');
        fin(vivos === 0, { muestra: texto.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').slice(-200) });
      }, 7000);
    }
  });
  p.onExit(({ exitCode }) => r.pasos.push(`la consola terminó (código ${exitCode})`));
  setTimeout(() => p.write("Write-Host -ForegroundColor Green ('S6-LISTO-' + (40+2))\r"), 800);
  setTimeout(() => fin(false, { error: 'sin terminar en 30 s', muestra: texto.slice(-300) }), 30000);
});

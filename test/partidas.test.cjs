/* ═══════════════════════════════════════════════════════════════════════════
   Juega las 25 fórmulas de principio a fin por la UI real.

   `npm run partidas`. Monta la app en Electron, entra a cada fórmula desde el
   recetario y la resuelve clickeando como lo haría una persona: asigna las
   funciones correctas, toma los frascos, pesa lo que corresponde (con el lote
   que tocó), elige cada paso, titula el pH, fija la temperatura, envasa,
   rotula y controla. Al final tiene que dar 100 puntos: si no, algo de la
   interfaz no deja llegar a la respuesta que los datos dicen que es correcta.

   También juega una partida EQUIVOCÁNDOSE a propósito, para ver que las
   penalizaciones se descuentan y quedan listadas en el resultado.
   ═══════════════════════════════════════════════════════════════════════════ */

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ROOT = path.join(__dirname, '..');
// Datos en una carpeta temporal: el test no puede ensuciar el progreso real.
process.env.GALENA_DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'galena-test-'));
// Y su propio perfil de Chromium: si Galena está abierta, compartir el userData
// deja al test esperando el candado del perfil para siempre, sin error.
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'galena-test-ud-')));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0; let fail = 0;
const ok = (n, c, x = '') => { if (c) { pass++; console.log(`  ok   ${n}`); } else { fail++; console.log(`  FALLA ${n} ${x}`); } };
const bail = (w, e) => { console.log(`ABORTADO ${w}`, e?.stack || e || ''); app.exit(3); };
process.on('unhandledRejection', (e) => bail('rechazo', e));
process.on('uncaughtException', (e) => bail('excepción', e));
setTimeout(() => bail('timeout de 300s'), 300000);

// Si la ventana se cierra, Electron saldría con código 0 en silencio.
app.on('window-all-closed', () => {});

/* El jugador perfecto vive en el renderer: lee los datos de la fórmula en
   curso y clickea las respuestas. Devuelve el puntaje final. */
const JUGADOR = String.raw`
(async (equivocarse) => {
  const { formula } = await import('./js/lab/formulas.js');
  const { FUNCIONES, ENVASES, LEYENDAS, CONTROLES } = await import('./js/lab/catalogo.js');
  const { cantidades } = await import('./js/lab/calc.js');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const titulo = $('.ox-viewhead__title').textContent;
  const f = window.__galenaPartida.f;
  const factor = window.__galenaPartida.factor;
  const log = [];
  const numES = (n) => String(Math.round(n * 1000) / 1000).replace('.', ',');

  // 1. Receta
  if (!f.teoria) {
    for (let k = 0; k < f.ing.length; k++) {
      $$('.ms-fnsel')[k].click();
      await sleep(30);
      const quiero = FUNCIONES[equivocarse && k === 0 ? Object.keys(FUNCIONES).find((x) => !f.ing[0].fn.includes(x)) : f.ing[k].fn[0]];
      const menus = [...document.querySelectorAll('.ox-menu')];
      const item = [...(menus.pop()?.querySelectorAll('.ox-menuitem') || [])].find((b) => b.textContent.trim() === quiero);
      if (!item) return { error: 'no aparece la función ' + quiero };
      item.click();
      await sleep(30);
    }
    $('#ms-check').click(); await sleep(40);
    $('#ms-next').click(); await sleep(60);

    // 2. Estantería
    if (equivocarse) { $$('.ms-jar').find((b) => !f.ing.some((i) => b.dataset.id === i.id)).click(); await sleep(30); }
    for (const i of f.ing) {
      const b = $('.ms-jar[data-id="' + i.id + '"]');
      if (!b) return { error: 'no está el frasco ' + i.id };
      b.click(); await sleep(25);
    }
    if ($('#ms-next').disabled) return { error: 'la estantería no habilita seguir' };
    $('#ms-next').click(); await sleep(60);

    // 3. Pesada
    const aMedir = cantidades(f, factor).filter((x) => x.medir);
    for (const c of aMedir) {
      const row = $('.ms-weigh[data-id="' + c.id + '"]');
      if (!row) return { error: 'no hay fila de pesada para ' + c.id };
      const inst = c.u === 'g' ? 'balanza' : 'probeta';
      row.querySelector('.ox-segmented__opt[data-value="' + inst + '"]').click();
      const input = row.querySelector('input');
      const valor = equivocarse && c === aMedir[0] ? c.esperado * 3 : c.esperado;
      input.value = numES(valor);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      row.querySelector('.ms-weigh__go').click(); await sleep(40);
      if (equivocarse && valor !== c.esperado) {
        const r2 = $('.ms-weigh[data-id="' + c.id + '"]');
        r2.querySelector('.ox-segmented__opt[data-value="' + inst + '"]').click();
        const in2 = r2.querySelector('input');
        in2.value = numES(c.esperado);
        in2.dispatchEvent(new Event('input', { bubbles: true }));
        r2.querySelector('.ms-weigh__go').click(); await sleep(40);
      }
    }
    if ($('#ms-next').disabled) return { error: 'la pesada no habilita seguir' };
    $('#ms-next').click(); await sleep(60);
  }

  // 4. Elaboración
  for (let k = 0; k < f.pasos.length; k++) {
    const p = f.pasos[k];
    if (p.tipo === 'ph') {
      let guard = 0;
      while (guard++ < 80) {
        const ph = Number($('.ms-ph .ox-stat__value').textContent.replace(',', '.'));
        if (ph >= p.rango[0] + 0.1) break;
        $('[data-g="1"]').click(); await sleep(15);
      }
      $('#ms-listo').click(); await sleep(40);
    } else if (p.tipo === 'temp') {
      const sl = $('#ms-slider');
      sl.value = Math.round((p.rango[0] + p.rango[1]) / 2);
      sl.dispatchEvent(new Event('input', { bubbles: true }));
      $('#ms-fijar').click(); await sleep(40);
    } else {
      const opts = $$('.ms-opt');
      if (equivocarse && k === 0) { opts.find((o) => o.textContent.trim().slice(1).trim() !== p.ok).click(); await sleep(40); }
      const buena = $$('.ms-opt').find((o) => o.querySelector('span:last-child').textContent === p.ok);
      if (!buena) return { error: 'no aparece la opción correcta del paso ' + (k + 1) };
      buena.click(); await sleep(40);
    }
    if (!$('#ms-next')) return { error: 'no aparece "siguiente" en el paso ' + (k + 1) + ' (' + (p.tipo || 'elección') + ')' };
    $('#ms-next').click(); await sleep(70);
  }

  if (!f.teoria) {
    // 5. Envasado
    const env = equivocarse ? Object.keys(ENVASES).find((e) => !f.envase.ok.includes(e)) : f.envase.ok[0];
    $('.ms-env[data-env="' + env + '"]').click(); await sleep(40);
    for (const l of f.leyendas.si) { $('[data-ley="' + l + '"]').click(); await sleep(10); }
    $('#ms-envasar').click(); await sleep(50);
    if (!$('.ms-label')) return { error: 'no se ve el rótulo' };
    $('#ms-next').click(); await sleep(60);

    // 6. Control
    for (const c of f.controles.si) { $('[data-c="' + c + '"]').click(); await sleep(10); }
    if (f.controles.alguno) { $('[data-c="' + f.controles.alguno[0] + '"]').click(); await sleep(10); }
    $('#ms-ctrl').click(); await sleep(50);
    $('#ms-next').click(); await sleep(80);
  }

  const pts = Number($('.ms-result__pts')?.textContent);
  return { titulo, pts, errores: $$('.ms-errs li').map((li) => li.textContent) };
})
`;

app.whenReady().then(async () => {
  require(path.join(ROOT, 'src', 'ipc.cjs')).register();
  const win = new BrowserWindow({
    x: -20000, y: -20000, width: 1440, height: 900,
    frame: false, show: false, paintWhenInitiallyHidden: true, backgroundColor: '#000',
    webPreferences: { preload: path.join(ROOT, 'preload.cjs'), contextIsolation: true },
  });
  const errores = [];
  win.webContents.on('console-message', (e) => { if (e.level >= 2) errores.push(`${e.message}`); });
  await win.loadFile(path.join(ROOT, 'renderer', 'index.html'));
  win.show();
  await sleep(1800);
  const js = (c) => win.webContents.executeJavaScript(c);

  const ids = await js(`import('./js/lab/formulas.js').then((m) => m.FORMULAS.map((f) => f.id))`);
  console.log(`\nJugando ${ids.length} fórmulas perfectas`);
  for (const id of ids) {
    await js(`document.querySelector('.ox-navitem[data-view="recetario"]').click()`);
    await sleep(250);
    const hay = await js(`(() => { const b = document.querySelector('.ms-fcard[data-f="${id}"]'); if (!b) return false; b.click(); return true; })()`);
    if (!hay) { ok(`${id}: tarjeta en el recetario`, false); continue; }
    await sleep(300);
    const r = await js(`${JUGADOR}(false)`);
    ok(`${id}: 100 puntos`, r && r.pts === 100, JSON.stringify(r).slice(0, 400));
  }

  console.log('\nUna partida con errores a propósito');
  await js(`document.querySelector('.ox-navitem[data-view="recetario"]').click()`);
  await sleep(250);
  await js(`document.querySelector('.ms-fcard[data-f="tp1-calamina"]').click()`);
  await sleep(300);
  const r = await js(`${JUGADOR}(true)`);
  ok('descuenta puntos', r && r.pts < 100 && r.pts > 0, JSON.stringify(r).slice(0, 300));
  ok('lista los errores en el resultado', r?.errores?.length >= 5, JSON.stringify(r?.errores));

  console.log('\nProgreso en disco');
  const prog = JSON.parse(fs.readFileSync(path.join(process.env.GALENA_DATA, 'progreso.json'), 'utf8'));
  ok('se guardaron las 25', Object.keys(prog).length === 25, `${Object.keys(prog).length}`);
  ok('el récord de la calamina se mantiene en 100', prog['tp1-calamina']?.mejor === 100);
  const est = await js(`document.getElementById('stat-est').textContent`);
  ok('la statusbar suma las estrellas', est.startsWith('75'), est);

  console.log('\nCalculadora');
  const calc = await js(`import('./js/lab/calculadora.js').then(({ calcular }) => [
    calcular('200-2-10'), calcular('200 - 32,3'), calcular('(1+2)*3'), calcular('10/4'), calcular('-5+2'), calcular('2*'), calcular('1/0'), calcular('')])`);
  ok('cuentas con coma, paréntesis y signos', JSON.stringify(calc.slice(0, 5)) === JSON.stringify([188, 167.7, 9, 2.5, -3]), JSON.stringify(calc));
  ok('lo que no cierra devuelve null', calc.slice(5).every((v) => v === null), JSON.stringify(calc.slice(5)));
  await js(`document.querySelector('.ox-navitem[data-view="recetario"]').click()`); await sleep(250);
  await js(`document.querySelector('.ms-fcard[data-f="tp4-manos"]').click()`); await sleep(400);
  const r2 = await js(`(async () => { const s = (m) => new Promise((r) => setTimeout(r, m));
    const k = (t) => [...document.querySelectorAll('.ms-calc__key')].find((b) => b.textContent.trim() === t || b.getAttribute('aria-label') === t).click();
    for (const t of ['2','0','0','Restar','1','0','Restar','2','Igual']) { k(t); await s(10); }
    return { v: document.getElementById('ms-calc-in').value, prev: document.getElementById('ms-calc-prev').textContent,
      foot: !!document.querySelector('.ox-inspector > .ms-calcfoot') }; })()`);
  ok('la calculadora de la mesada resuelve con los botones', r2.v === '188' && r2.prev === '200-10-2 =', JSON.stringify(r2));
  ok('vive en el pie del inspector', r2.foot);

  ok('sin errores en la consola', errores.length === 0, errores.slice(0, 5).join(' | '));
  console.log(`\n═══ ${pass} ok · ${fail} fallas ═══`);
  fs.rmSync(process.env.GALENA_DATA, { recursive: true, force: true });
  app.exit(fail ? 1 : 0);
});

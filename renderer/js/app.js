/* ═══════════════════════════════════════════════════════════════════════════
   MESADA — la app
   Simulador de laboratorio para los TPL de Tecnología Farmacéutica II.
   Tres vistas: el recetario (las 25 fórmulas y tu progreso), la mesada (una
   partida en curso) y los ajustes. El motor del juego vive en lab/juego.js;
   acá solo se monta, se navega y se guarda el progreso.
   ═══════════════════════════════════════════════════════════════════════════ */

import { Icons } from './icons.js';
import { Tooltip, Toast, Modal } from './overlays.js';
import Palette from './palette.js';
import Router from './router.js';
import { initClickFlash, initScrollFades, raf2, countTo } from './motion.js';
import { esc, paint, head, empty, attempt, colorToken } from './ui.js';
import { FORMULAS, TPS, formula } from './lab/formulas.js';
import { nuevaPartida, montar, estrellas } from './lab/juego.js';
import { montarCalculadora } from './lab/calculadora.js';

const api = window.onyx;

Icons.add({
  matraz: '<path d="M6 2.3h4M6.8 2.3v4.3L3.2 12.7a.9.9 0 0 0 .8 1.3h8a.9.9 0 0 0 .8-1.3L9.2 6.6V2.3"/><path d="M4.7 10.4h6.6"/>',
});

/* ══ Estado ══════════════════════════════════════════════════════════════════ */

const S = {
  settings: {},
  progreso: {},        // { [idFormula]: { mejor, estrellas, veces, ultima } }
  partida: null,       // la partida en curso, si hay: sobrevive a navegar
};

async function loadAll() {
  const [settings, progreso] = await Promise.all([api.settings.get(), api.doc.read('progreso', {})]);
  S.settings = settings;
  S.progreso = progreso || {};
}

async function guardarResultado(P) {
  const id = P.f.id;
  const prev = S.progreso[id] || { mejor: 0, estrellas: 0, veces: 0 };
  const mejor = Math.max(prev.mejor, P.puntos);
  S.progreso[id] = { mejor, estrellas: estrellas(mejor), veces: prev.veces + 1, ultima: Date.now() };
  await attempt(() => api.doc.write('progreso', S.progreso), { errorTitle: 'No se pudo guardar el progreso' });
  updateChrome();
  if (P.puntos > prev.mejor && prev.veces) {
    Toast.show({ title: 'Nuevo récord', text: `${P.f.nombre}: ${P.puntos} puntos`, icon: 'target' });
  }
}

const totales = () => {
  const completadas = FORMULAS.filter((f) => S.progreso[f.id]?.veces).length;
  const est = FORMULAS.reduce((n, f) => n + (S.progreso[f.id]?.estrellas || 0), 0);
  return { completadas, est, max: FORMULAS.length * 3 };
};

const starsHTML = (n) => `<div class="ms-stars">${[0, 1, 2].map((k) =>
  `<svg class="ms-star${k < n ? ' is-on' : ''}" viewBox="0 0 24 24"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17 6.6 19.9l1.1-6.1-4.5-4.2 6.1-.8z"/></svg>`).join('')}</div>`;

/* ══ Vista: Recetario ════════════════════════════════════════════════════════ */

function viewRecetario() {
  const t = totales();
  const tarjeta = (f) => {
    const pr = S.progreso[f.id];
    return `<button class="ms-fcard" data-f="${f.id}">
      <span class="ms-fcard__n">TPL ${f.tp} · N° ${f.n}</span>
      <span class="ms-fcard__name">${esc(f.nombre)}</span>
      <span class="ms-fcard__ff">${esc(f.ff)}</span>
      <span class="ms-fcard__foot">${starsHTML(pr?.estrellas || 0)}
        <span class="ox-meta">${pr?.veces ? `mejor ${pr.mejor}` : 'sin jugar'}</span></span>
    </button>`;
  };

  paint(head({
    title: 'Recetario',
    sub: 'Las fórmulas de los TPL 1 a 4. Elegí una y preparala de principio a fin.',
    actions: `${S.partida && !S.partida.terminada ? `<button class="ox-btn ox-btn--secondary ox-flashable" data-goto="mesada">Seguir con ${esc(S.partida.f.nombre)}</button>` : ''}
      <button class="ox-btn ox-btn--primary ox-flashable" id="btn-azar"><i data-icon="zap"></i> Una al azar</button>`,
  }) + `
    <div class="ox-scroll ox-grow">
      <div class="ms-kpis">
        <div class="ox-stat"><span class="ox-stat__value ox-num" id="k-comp">0</span><span class="ox-stat__label">Preparadas de ${FORMULAS.length}</span></div>
        <div class="ox-stat"><span class="ox-stat__value ox-num" id="k-est">0</span><span class="ox-stat__label">Estrellas de ${t.max}</span></div>
      </div>
      ${TPS.map((tp) => `
        <div class="ms-tp">
          <div class="ox-section__head"><span class="ox-section__title">TPL ${tp.n} · ${esc(tp.nombre)}</span></div>
          <div class="ms-cards">${FORMULAS.filter((f) => f.tp === tp.n).map(tarjeta).join('')}</div>
        </div>`).join('')}
    </div>`);

  countTo(document.getElementById('k-comp'), t.completadas);
  countTo(document.getElementById('k-est'), t.est);
  const view = document.getElementById('view');
  view.querySelectorAll('.ms-fcard').forEach((b) => b.addEventListener('click', () => empezar(b.dataset.f)));
  view.querySelector('#btn-azar').addEventListener('click', alAzar);
}

function empezar(id) {
  const f = formula(id);
  if (!f) return;
  S.partida = nuevaPartida(f, { loteVariable: S.settings.loteVariable !== false });
  Router.go('mesada', id);
}

function alAzar() {
  // Primero las que todavía no tienen tres estrellas: el azar tiene que servir para estudiar.
  const pendientes = FORMULAS.filter((f) => (S.progreso[f.id]?.estrellas || 0) < 3);
  const pool = pendientes.length ? pendientes : FORMULAS;
  empezar(pool[Math.floor(Math.random() * pool.length)].id);
}

/* ══ Vista: Mesada ═══════════════════════════════════════════════════════════ */

function viewMesada(id) {
  if (!S.partida || (id && S.partida.f.id !== id)) {
    const f = id ? formula(id) : null;
    if (!f) {
      paint(head({ title: 'Mesada' }) + empty({
        icon: 'matraz', title: 'La mesada está vacía',
        text: 'Elegí una fórmula del recetario para empezar a prepararla.',
        actions: '<button class="ox-btn ox-btn--primary ox-flashable" data-goto="recetario">Ir al recetario</button>',
      }));
      return;
    }
    S.partida = nuevaPartida(f, { loteVariable: S.settings.loteVariable !== false });
  }
  const P = S.partida;
  window.__mesadaPartida = P;   // lo lee test/partidas.test.cjs
  paint(head({
    title: P.f.nombre,
    sub: `TPL ${P.f.tp} · Formulación N° ${P.f.n} · ${P.f.ff}`,
    actions: '<button class="ox-btn ox-btn--ghost ox-flashable" id="btn-dejar"><i data-icon="close"></i> Dejar la fórmula</button>',
  }) + `
    <div class="ox-viewbody">
      <div class="ox-viewbody__main"><div class="ox-scroll ox-grow" id="ms-main"></div></div>
      <aside class="ox-inspector">
        <div class="ms-inspgame" id="ms-insp"></div>
        <div class="ox-inspector__foot ms-calcfoot" id="ms-calc"></div>
      </aside>
    </div>`);

  montar({
    main: document.getElementById('ms-main'),
    inspector: document.getElementById('ms-insp'),
    partida: P,
    alTerminar: guardarResultado,
    alSalir: (a) => {
      if (a === 'repetir') empezar(P.f.id);
      else { S.partida = null; Router.go('recetario'); }
    },
  });
  montarCalculadora(document.getElementById('ms-calc'));
  initScrollFades(document.getElementById('view'));

  document.getElementById('btn-dejar').addEventListener('click', async () => {
    if (!P.terminada && P.etapa > 0) {
      const ok = await Modal.confirm({
        title: 'Dejar la fórmula',
        sub: 'Se pierde lo que llevás de esta preparación. El progreso guardado de otras fórmulas no se toca.',
        confirmLabel: 'Dejarla',
      });
      if (!ok) return;
    }
    S.partida = null;
    Router.go('recetario');
  });
}

/* ══ Vista: Ajustes ══════════════════════════════════════════════════════════ */

function viewAjustes() {
  const lv = S.settings.loteVariable !== false;
  paint(head({ title: 'Ajustes', sub: 'Cómo se juega y tu progreso' }) + `
    <div class="ox-scroll ox-grow">
      <div class="ox-section" style="max-width:640px">
        <div class="ox-section__head"><span class="ox-section__title">Partida</span></div>
        <div class="ox-row" style="gap:12px;align-items:flex-start">
          <button class="ox-switch${lv ? ' is-on' : ''}" id="sw-lote" aria-label="Lote variable"></button>
          <span class="ox-col" style="gap:2px"><span class="ox-label">Lote variable</span>
            <span class="ox-meta">Cada partida pide preparar la mitad, igual, una vez y media o el doble de la receta. Obliga a hacer la cuenta en la pesada, como en el laboratorio.</span></span>
        </div>
      </div>
      <div class="ox-section" style="max-width:640px;margin-top:28px">
        <div class="ox-section__head"><span class="ox-section__title">Progreso</span></div>
        <p class="ox-meta" style="margin:0 0 12px">Las estrellas y los mejores puntajes se guardan en la carpeta data de la app.</p>
        <button class="ox-btn ox-btn--danger ox-flashable" id="btn-reset"><i data-icon="trash"></i> Borrar el progreso</button>
      </div>
      <div class="ox-section" style="max-width:640px;margin-top:28px">
        <div class="ox-section__head"><span class="ox-section__title">Cómo se puntúa</span></div>
        <p class="ox-meta" style="margin:0;line-height:1.6">Cada fórmula arranca en 100. Resta la función mal asignada (3), el frasco equivocado (2), el instrumento equivocado (2), la cantidad mal medida (4), el paso de elaboración equivocado (5), pasarse o quedarse corto de pH (6), la temperatura fuera de rango (4), el envase (4), cada leyenda (3) y cada control de calidad (3). Tres estrellas desde 90, dos desde 75, una desde 50.</p>
      </div>
    </div>`);

  document.getElementById('sw-lote').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const on = !(S.settings.loteVariable !== false);
    btn.classList.toggle('is-on', on);
    S.settings = await api.settings.save({ loteVariable: on });
  });
  document.getElementById('btn-reset').addEventListener('click', async () => {
    const ok = await Modal.confirm({
      title: 'Borrar el progreso',
      sub: 'Se borran todas las estrellas y los mejores puntajes. No se puede deshacer.',
      confirmLabel: 'Borrar', danger: true,
    });
    if (!ok) return;
    S.progreso = {};
    await attempt(() => api.doc.write('progreso', {}), { errorTitle: 'No se pudo borrar' });
    updateChrome();
    Toast.show({ title: 'Progreso borrado', icon: 'check' });
  });
}

/* ══ Router ══════════════════════════════════════════════════════════════════ */

Router.define({
  recetario: { view: viewRecetario },
  mesada: { view: viewMesada },
  ajustes: { view: viewAjustes },
}, document.getElementById('view'));

/* ══ Shell ═══════════════════════════════════════════════════════════════════ */

function wireShell() {
  const w = api?.win;
  document.getElementById('win-min')?.addEventListener('click', () => w?.minimize());
  document.getElementById('win-close')?.addEventListener('click', () => w?.close());
  const maxBtn = document.getElementById('win-max');
  maxBtn?.addEventListener('click', () => w?.toggleMaximize());
  w?.onMaximized((isMax) => {
    maxBtn.innerHTML = Icons.svg(isMax ? 'winRestore' : 'winMax');
    maxBtn.setAttribute('aria-label', isMax ? 'Restaurar' : 'Maximizar');
  });

  document.querySelectorAll('.ox-navitem').forEach((b) =>
    b.addEventListener('click', () => Router.go(b.dataset.view)));
  document.getElementById('btn-palette')?.addEventListener('click', () => Palette.toggle());
  document.getElementById('btn-azar-rail')?.addEventListener('click', alAzar);

  // Delegación global solo para la navegación declarativa (data-goto): el resto
  // de los handlers se engancha a nodos que mueren con cada repintado.
  document.addEventListener('click', (e) => {
    const goto = e.target.closest('[data-goto]');
    if (goto) Router.go(goto.dataset.goto, goto.dataset.param || null);
  });
}

function updateChrome() {
  const t = totales();
  document.getElementById('stat-est').textContent = `${t.est} / ${t.max}`;
  document.getElementById('stat-comp').textContent = `${t.completadas} / ${FORMULAS.length}`;
  const ctx = document.getElementById('titlebar-context');
  ctx.innerHTML = Router.name === 'mesada' && S.partida
    ? `${Icons.svg('matraz', 'ox-icon--sm')}<span>${esc(S.partida.f.nombre)}</span>` : '';
}

function registerCommands() {
  Palette.clear();
  Palette.register([
    { id: 'azar', group: 'Jugar', icon: 'zap', label: 'Una fórmula al azar', run: alAzar },
    { id: 'nav-rec', group: 'Ir a', icon: 'book', label: 'Recetario', run: () => Router.go('recetario') },
    { id: 'nav-mesa', group: 'Ir a', icon: 'matraz', label: 'Mesada', run: () => Router.go('mesada') },
    { id: 'nav-aj', group: 'Ir a', icon: 'settings', label: 'Ajustes', run: () => Router.go('ajustes') },
    ...FORMULAS.map((f) => ({
      id: `f-${f.id}`, group: `TPL ${f.tp}`, icon: 'matraz', label: f.nombre, hint: `N° ${f.n}`,
      run: () => empezar(f.id),
    })),
  ]);
}

function syncWindowColor() {
  const hex = colorToken('--ox-bg');
  if (hex) api?.win?.setBackground(hex);
}

/* ══ Arranque ════════════════════════════════════════════════════════════════ */

async function boot() {
  Icons.mount(document);
  Tooltip.init();
  Palette.init({ placeholder: 'Buscar una fórmula o un comando' });
  initClickFlash();
  initScrollFades();
  wireShell();
  syncWindowColor();

  try {
    await loadAll();
  } catch (err) {
    paint(empty({ icon: 'alert', title: 'No se pudo iniciar', text: err.message }));
    console.error(err);
    return;
  }

  registerCommands();
  updateChrome();
  Router.onChange(updateChrome);
  Router.go('recetario');

  raf2(() => {
    const splash = document.getElementById('boot-splash');
    if (!splash) return;
    splash.style.opacity = '0';
    splash.addEventListener('transitionend', () => splash.remove(), { once: true });
    setTimeout(() => splash.remove(), 600);
  });
}

boot();

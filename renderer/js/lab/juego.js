/* ═══════════════════════════════════════════════════════════════════════════
   MESADA — el motor de una partida
   Una partida es una fórmula de principio a fin, en siete etapas:

     receta → estantería → pesada → elaboración → envasado → control → resultado

   El motor no sabe nada del router ni del disco: recibe dos contenedores
   (la columna principal y el inspector) y avisa por callback cuando termina.
   Cada etapa se repinta entera en su contenedor, y los listeners se enganchan
   a nodos que mueren con ese repintado: no se acumulan.
   ═══════════════════════════════════════════════════════════════════════════ */

import { Icons } from '../icons.js';
import { esc } from '../ui.js';
import { syncSegmented, raf2 } from '../motion.js';
import { Menu } from '../overlays.js';
import { ESTANTE, CATEGORIAS, FUNCIONES, ENVASES, LEYENDAS, CONTROLES, INSTRUMENTOS } from './catalogo.js';
import { escena, balanza, phmetro, frascoEstante, envaseSVG } from './escena.js';
import { estrellas, num, leerNumero, MEDIBLES, cantidades } from './calc.js';

export { estrellas, num, cantidades };

/* ── Puntaje ─────────────────────────────────────────────────────────────── */

const PENA = {
  funcion: 3, estante: 2, instrumento: 2, pesada: 4, paso: 5,
  ph: 6, temp: 4, envase: 4, leyenda: 3, control: 3,
};

function textoCantidad(i) {
  if (i.csp) return 'c.s.p.';
  switch (i.u) {
    case 'ui': return `${num(i.q)} UI`;
    case 'gotas': return 'gotas';
    case 'cs': return i.nota || 'c.s.';
    case 'unidad': return `${i.q} unidad`;
    default: return `${num(i.q)} ${i.u}`;
  }
}

function barajar(a) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/* ══ Partida ═════════════════════════════════════════════════════════════ */

const ETAPAS = [
  { id: 'receta', n: 'Receta' },
  { id: 'estante', n: 'Estantería' },
  { id: 'pesada', n: 'Pesada' },
  { id: 'elaboracion', n: 'Elaboración' },
  { id: 'envasado', n: 'Envasado' },
  { id: 'control', n: 'Control' },
  { id: 'resultado', n: 'Resultado' },
];

export function nuevaPartida(f, { loteVariable = true } = {}) {
  const opciones = f.lote === 50 ? [1, 2] : [0.5, 1, 1.5, 2];
  const factor = f.teoria || !loteVariable ? 1 : opciones[Math.floor(Math.random() * opciones.length)];
  return {
    f,
    factor,
    lote: f.lote * factor,
    etapa: f.teoria ? 3 : 0,
    puntos: 100,
    errores: [],
    funciones: {},
    funcionesVistas: false,
    bandeja: [],
    pesadas: {},
    paso: 0,
    pasoIntentos: [],
    pasoResuelto: false,
    orden: f.pasos.map((p) => (p.tipo ? null : barajar([p.ok, ...p.no]))),
    ph: { gotas: 0 },
    temp: 50,
    envase: null,
    leyendas: new Set(),
    envasado: false,
    controles: new Set(),
    controlado: false,
    escena: { rec: f.pasos.find((p) => p.esc)?.esc.rec || 'mortero', nivel: 0, color: '#e9e6df' },
    terminada: false,
  };
}

export function montar({ main, inspector, partida, alTerminar, alSalir }) {
  const P = partida;
  const f = P.f;
  const cant = cantidades(f, P.factor);

  const penalizar = (clave, texto) => {
    P.puntos = Math.max(0, P.puntos - PENA[clave]);
    P.errores.push({ etapa: ETAPAS[P.etapa].n, texto });
    pintarInspector();
  };

  const avanzar = () => {
    P.etapa += 1;
    // Las fórmulas de pura teoría (las bases A–F) saltan de las preguntas al resultado.
    if (f.teoria && ETAPAS[P.etapa].id !== 'resultado') P.etapa = ETAPAS.findIndex((e) => e.id === 'resultado');
    if (ETAPAS[P.etapa].id === 'resultado' && !P.terminada) {
      P.terminada = true;
      alTerminar?.(P);
    }
    pintar();
    main.scrollTop = 0;
  };

  /* ── Inspector: la mesada ─────────────────────────────────────────────── */

  function pintarInspector(extraSVG) {
    const etapa = ETAPAS[P.etapa].id;
    let dibujo = extraSVG;
    if (!dibujo) {
      if (etapa === 'pesada') dibujo = balanza(P.lectura?.txt || '0,00', P.lectura?.u || 'g');
      else if (etapa === 'envasado' && P.envase) dibujo = envaseSVG(ENVASES[P.envase].forma);
      else dibujo = escena(P.escena);
    }
    const bandeja = P.bandeja.length
      ? P.bandeja.map((id) => `<div class="ms-tray__item">${frascoEstante(ESTANTE[id].t)}<span>${esc(ESTANTE[id].n)}</span></div>`).join('')
      : '<div class="ox-meta">Vacía. Los frascos que elijas en la estantería aparecen acá.</div>';
    inspector.innerHTML = `
      <div class="ox-inspector__head">
        <div class="ox-col" style="gap:2px">
          <span class="ox-eyebrow">Tu mesada</span>
          <span class="ox-meta">Lote: ${num(P.lote)} ${f.u}${P.factor !== 1 ? ` (×${num(P.factor)} de la receta)` : ''}</span>
        </div>
      </div>
      <div class="ox-inspector__body ox-scroll">
        <div class="ms-scene" id="ms-scene">${dibujo}</div>
        <div class="ms-score">
          <div class="ox-stat"><span class="ox-stat__value ox-num">${P.puntos}</span><span class="ox-stat__label">Puntos</span></div>
          <div class="ox-stat"><span class="ox-stat__value ox-num">${P.errores.length}</span><span class="ox-stat__label">Errores</span></div>
        </div>
        ${f.teoria ? '' : `<div class="ox-section__title" style="margin:18px 0 8px">Receta · para ${num(f.lote)} ${f.u}</div>
        <div class="ms-rpmini">${f.ing.map((i) => {
          const tomado = P.bandeja.includes(i.id);
          return `<div class="ms-rpmini__row${tomado ? ' is-taken' : ''}">
            <span class="ms-rpmini__mark">${tomado ? Icons.svg('check', 'ox-icon--sm') : ''}</span>
            <span class="ms-rpmini__name">${esc(ESTANTE[i.id].n)}</span>
            <span class="ms-rpmini__q ox-num">${esc(textoCantidad(i))}</span></div>`;
        }).join('')}</div>
        <div class="ox-section__title" style="margin:18px 0 8px">Bandeja</div><div class="ms-tray">${bandeja}</div>`}
      </div>`;
  }

  const setDibujo = (svg) => {
    const el = inspector.querySelector('#ms-scene');
    if (el) el.innerHTML = svg;
  };

  /* ── Encabezado de etapas ─────────────────────────────────────────────── */

  function etapasHTML() {
    const visibles = f.teoria ? ETAPAS.filter((e) => ['elaboracion', 'resultado'].includes(e.id)) : ETAPAS;
    return `<div class="ms-stages">${visibles.map((e) => {
      const i = ETAPAS.indexOf(e);
      const st = i < P.etapa ? 'is-done' : i === P.etapa ? 'is-current' : '';
      const nombre = f.teoria && e.id === 'elaboracion' ? 'Preguntas' : e.n;
      return `<div class="ms-stage ${st}"><span class="ms-stage__dot">${i < P.etapa ? Icons.svg('check', 'ox-icon--sm') : ''}</span><span>${nombre}</span></div>`;
    }).join('')}</div>`;
  }

  // La entrada animada es para cuando cambia la etapa o el paso. Repintar la
  // misma pantalla (tomar un frasco, marcar una opción) no la vuelve a animar.
  let ultimaClave = null;
  function marco(cuerpo) {
    const clave = `${P.etapa}:${P.paso}`;
    const anim = clave !== ultimaClave ? ' ox-in-rise' : '';
    ultimaClave = clave;
    main.innerHTML = `${etapasHTML()}<div class="ms-stagebody${anim}">${cuerpo}</div>`;
    Icons.mount(main);
  }

  /* ══ 1. Receta ════════════════════════════════════════════════════════ */

  function receta() {
    const filas = f.ing.map((i, k) => {
      const elegida = P.funciones[k];
      const bien = P.funcionesVistas ? i.fn.includes(elegida) : null;
      return `
        <tr class="ox-tr${bien === true ? ' ms-ok' : bien === false ? ' ms-bad' : ''}">
          <td><div class="ms-ing">${esc(ESTANTE[i.id].n)}</div>${i.nota ? `<div class="ox-meta">${esc(i.nota)}</div>` : ''}</td>
          <td class="ox-td--num ox-num">${esc(i.csp ? 'c.s.p.' : textoCantidad(i))}</td>
          <td class="ox-td--tight">
            ${P.funcionesVistas
              ? `<span class="ms-fn ${bien ? 'ms-fn--ok' : 'ms-fn--bad'}">${esc(FUNCIONES[elegida] || 'Sin elegir')}</span>
                 ${bien ? '' : `<div class="ox-meta">Era: ${esc(i.fn.map((x) => FUNCIONES[x]).join(' o '))}</div>`}`
              : `<button class="ox-select ms-fnsel" data-k="${k}"><span class="ox-truncate">${esc(FUNCIONES[elegida] || 'Elegí la función')}</span>${Icons.svg('chevronDown', 'ox-icon--sm')}</button>`}
          </td>
        </tr>`;
    }).join('');

    marco(`
      <div class="ms-rp">
        <div class="ms-rp__head">
          <div>
            <div class="ox-eyebrow">TPL ${f.tp} · Formulación N° ${f.n}</div>
            <div class="ms-rp__title">${esc(f.nombre)}</div>
            ${f.sin ? `<div class="ox-meta">${esc(f.sin)}</div>` : ''}
          </div>
          <div class="ms-rp__lote">
            <span class="ox-eyebrow">Preparar</span>
            <span class="ms-rp__lotev ox-num">${num(P.lote)} ${f.u}</span>
            ${P.factor !== 1 ? `<span class="ox-meta">La receta es para ${num(f.lote)} ${f.u}: multiplicá por ${num(P.factor)}</span>` : ''}
          </div>
        </div>
        <div class="ms-rp__sym">Rp/</div>
        <table class="ox-table ms-rptable">
          <thead><tr><th>Componente</th><th class="ox-td--num">Cantidad</th><th>Función en la fórmula</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
        <div class="ms-rp__meta">
          <span><b>Forma farmacéutica:</b> ${esc(f.ff)}</span>
          <span><b>Uso:</b> ${esc(f.uso)}</span>
        </div>
        ${f.nota ? `<div class="ms-note">${Icons.svg('info', 'ox-icon--sm')}<span>${esc(f.nota)}</span></div>` : ''}
      </div>
      <div class="ms-actions">
        ${P.funcionesVistas
          ? '<button class="ox-btn ox-btn--primary ox-flashable" id="ms-next">Ir a la estantería <i data-icon="arrowRight"></i></button>'
          : '<button class="ox-btn ox-btn--primary ox-flashable" id="ms-check">Verificar funciones</button>'}
      </div>`);

    main.querySelectorAll('.ms-fnsel').forEach((b) => b.addEventListener('click', () => {
      const k = Number(b.dataset.k);
      Menu.show(b, Object.entries(FUNCIONES).map(([id, label]) => ({
        label, selected: P.funciones[k] === id,
        onSelect: () => { P.funciones[k] = id; receta(); },
      })));
    }));
    main.querySelector('#ms-check')?.addEventListener('click', () => {
      const faltan = f.ing.filter((_, k) => !P.funciones[k]).length;
      if (faltan) {
        main.querySelector('.ms-actions').insertAdjacentHTML('afterbegin',
          `<span class="ox-meta ms-warn">Te falta asignar ${faltan === 1 ? 'una función' : `${faltan} funciones`}.</span>`);
        return;
      }
      f.ing.forEach((i, k) => {
        if (!i.fn.includes(P.funciones[k])) {
          penalizar('funcion', `${ESTANTE[i.id].n}: pusiste "${FUNCIONES[P.funciones[k]]}", era ${i.fn.map((x) => FUNCIONES[x]).join(' o ')}.`);
        }
      });
      P.funcionesVistas = true;
      receta();
    });
    main.querySelector('#ms-next')?.addEventListener('click', avanzar);
  }

  /* ══ 2. Estantería ════════════════════════════════════════════════════ */

  let filtroCat = 'todo';
  let filtroTxt = '';

  function estante() {
    const necesarios = f.ing.map((i) => i.id);
    const faltan = necesarios.filter((id) => !P.bandeja.includes(id)).length;
    marco(`
      <div class="ms-lead">Buscá en la estantería los ${necesarios.length} frascos de la fórmula. Ojo con los parecidos: un frasco equivocado resta puntos.</div>
      <div class="ms-shelfbar">
        <div class="ox-inputwrap ms-search">${Icons.svg('search', 'ox-icon--sm')}<input class="ox-input" id="ms-q" placeholder="Buscar frasco" spellcheck="false" value="${esc(filtroTxt)}"></div>
        <div class="ms-cats">${CATEGORIAS.map((c) => `<button class="ox-chip ms-cat${c.id === filtroCat ? ' is-active' : ''}" data-cat="${c.id}">${esc(c.n)}</button>`).join('')}</div>
      </div>
      <div class="ms-shelf" id="ms-shelf"></div>
      <div class="ms-msg" id="ms-msg"></div>
      <div class="ms-actions">
        <span class="ox-meta">${faltan ? `Faltan ${faltan}` : 'Están todos'}</span>
        <button class="ox-btn ox-btn--primary ox-flashable" id="ms-next" ${faltan ? 'disabled' : ''}>Ir a la pesada <i data-icon="arrowRight"></i></button>
      </div>`);

    const pintarEstante = () => {
      const q = filtroTxt.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const ids = Object.keys(ESTANTE).filter((id) => {
        const it = ESTANTE[id];
        if (filtroCat !== 'todo' && it.t !== filtroCat) return false;
        return !q || it.n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q);
      }).sort((a, b) => ESTANTE[a].n.localeCompare(ESTANTE[b].n, 'es'));
      main.querySelector('#ms-shelf').innerHTML = ids.map((id) => {
        const tomado = P.bandeja.includes(id);
        return `<button class="ms-jar${tomado ? ' is-taken' : ''}" data-id="${id}" ${tomado ? 'disabled' : ''}>
          ${frascoEstante(ESTANTE[id].t)}<span class="ms-jar__name">${esc(ESTANTE[id].n)}</span></button>`;
      }).join('') || '<div class="ox-meta">No hay frascos con ese nombre.</div>';
    };
    pintarEstante();

    main.querySelector('#ms-q').addEventListener('input', (e) => { filtroTxt = e.target.value; pintarEstante(); });
    main.querySelectorAll('.ms-cat').forEach((b) => b.addEventListener('click', () => {
      filtroCat = b.dataset.cat;
      main.querySelectorAll('.ms-cat').forEach((x) => x.classList.toggle('is-active', x === b));
      pintarEstante();
    }));
    main.querySelector('#ms-shelf').addEventListener('click', (e) => {
      const b = e.target.closest('.ms-jar');
      if (!b || b.disabled) return;
      const id = b.dataset.id;
      const msg = main.querySelector('#ms-msg');
      if (necesarios.includes(id)) {
        P.bandeja.push(id);
        pintarInspector();
        const quedan = necesarios.filter((x) => !P.bandeja.includes(x)).length;
        estante();
        main.querySelector('#ms-msg').innerHTML = `<span class="ms-good">${Icons.svg('check', 'ox-icon--sm')} ${esc(ESTANTE[id].n)} a la bandeja.</span>`;
        if (!quedan) main.querySelector('#ms-next').focus();
      } else {
        b.classList.remove('ox-shaking');
        void b.offsetWidth;
        b.classList.add('ox-shaking');
        const ojo = ESTANTE[id].ojo ? ` ${ESTANTE[id].ojo}.` : '';
        penalizar('estante', `Tomaste ${ESTANTE[id].n}, que no va en esta fórmula.`);
        msg.innerHTML = `<span class="ms-badtxt">${esc(ESTANTE[id].n)} no va en esta fórmula.${esc(ojo)}</span>`;
      }
    });
    main.querySelector('#ms-next').addEventListener('click', avanzar);
    const q = main.querySelector('#ms-q');
    if (filtroTxt) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  }

  /* ══ 3. Pesada ════════════════════════════════════════════════════════ */

  function pesada() {
    const medir = cant.filter((i) => i.medir);
    const proceso = cant.filter((i) => !i.medir);
    const listos = medir.filter((i) => P.pesadas[i.id]?.ok).length;

    const fila = (i) => {
      const st = P.pesadas[i.id] || { intentos: 0 };
      const unidad = i.u;
      if (st.ok) {
        return `<div class="ms-weigh is-ok">
          <div class="ms-weigh__name">${esc(ESTANTE[i.id].n)}${i.csp ? ' <span class="ox-chip ox-chip--outline">c.s.p.</span>' : ''}</div>
          <div class="ms-weigh__done">${Icons.svg('check', 'ox-icon--sm')} ${esc(INSTRUMENTOS[st.inst].n)} · <span class="ox-num">${num(st.valor)} ${unidad}</span></div>
        </div>`;
      }
      const inst = st.inst || null;
      const ayuda = st.intentos >= 2
        ? `<div class="ms-hint">${i.csp
            ? `c.s.p.: al lote de ${num(P.lote)} ${f.u} restale todo lo demás que se pesa.`
            : `Receta: ${num(i.q)} ${unidad} para ${num(f.lote)} ${f.u}. Vos preparás ${num(P.lote)}: ${num(i.q)} × ${num(P.factor)}.`}</div>` : '';
      return `<div class="ms-weigh" data-id="${i.id}">
        <div class="ms-weigh__name">${esc(ESTANTE[i.id].n)}${i.csp ? ' <span class="ox-chip ox-chip--outline">c.s.p.</span>' : ''}
          <div class="ox-meta">${i.csp ? 'Completa el lote' : `Receta: ${num(i.q)} ${unidad}`}</div></div>
        <div class="ox-segmented ms-inst">${Object.entries(INSTRUMENTOS).map(([k, v]) =>
          `<button class="ox-segmented__opt${inst === k ? ' is-active' : ''}" data-value="${k}">${v.n}</button>`).join('')}</div>
        <div class="ms-weigh__in">
          <input class="ox-input ox-input--mono" inputmode="decimal" placeholder="0,00" value="${esc(st.txt || '')}" spellcheck="false">
          <span class="ox-meta">${unidad}</span>
        </div>
        <button class="ox-btn ox-btn--secondary ox-flashable ms-weigh__go">${unidad === 'g' ? 'Pesar' : 'Medir'}</button>
        ${ayuda}
      </div>`;
    };

    marco(`
      <div class="ms-lead">Elegí el instrumento y escribí cuánto medís para el lote de <b>${num(P.lote)} ${f.u}</b>. Lo que se pide en gramos va a la balanza; lo que se pide en ml, a probeta o pipeta.</div>
      <div class="ms-weighs">${medir.map(fila).join('')}</div>
      ${proceso.length ? `<div class="ms-note">${Icons.svg('info', 'ox-icon--sm')}<span>No se pesan ahora: ${proceso.map((i) => `${esc(ESTANTE[i.id].n)} (${esc(i.csp ? 'c.s.p., se completa al final' : textoCantidad(i))})`).join(', ')}. Entran durante la elaboración.</span></div>` : ''}
      <div class="ms-msg" id="ms-msg"></div>
      <div class="ms-actions">
        <span class="ox-meta">${listos} de ${medir.length} medidos</span>
        <button class="ox-btn ox-btn--primary ox-flashable" id="ms-next" ${listos < medir.length ? 'disabled' : ''}>A elaborar <i data-icon="arrowRight"></i></button>
      </div>`);

    raf2(() => main.querySelectorAll('.ms-inst').forEach(syncSegmented));

    main.querySelectorAll('.ms-weigh[data-id]').forEach((row) => {
      const id = row.dataset.id;
      const i = medir.find((x) => x.id === id);
      const st = (P.pesadas[id] ||= { intentos: 0 });
      const seg = row.querySelector('.ms-inst');
      seg.addEventListener('click', (e) => {
        const opt = e.target.closest('.ox-segmented__opt');
        if (!opt) return;
        seg.querySelectorAll('.ox-segmented__opt').forEach((o) => o.classList.toggle('is-active', o === opt));
        syncSegmented(seg);
        st.inst = opt.dataset.value;
      });
      const input = row.querySelector('input');
      input.addEventListener('input', () => { st.txt = input.value; });
      const go = () => {
        const msg = main.querySelector('#ms-msg');
        if (!st.inst) { msg.innerHTML = '<span class="ms-badtxt">Primero elegí el instrumento.</span>'; return; }
        const v = leerNumero(input.value);
        if (v == null || v <= 0) { msg.innerHTML = '<span class="ms-badtxt">Escribí una cantidad válida.</span>'; return; }
        if (INSTRUMENTOS[st.inst].mide !== i.u) {
          penalizar('instrumento', `${ESTANTE[id].n}: se pide en ${i.u} y usaste ${INSTRUMENTOS[st.inst].n.toLowerCase()}.`);
          msg.innerHTML = `<span class="ms-badtxt">${esc(ESTANTE[id].n)} se pide en ${i.u}: ${i.u === 'g' ? 'va a la balanza' : 'se mide en volumen, con probeta o pipeta'}.</span>`;
          return;
        }
        const tol = Math.max(i.esperado * 0.02, 0.002);
        const lectura = num(v);
        P.lectura = { txt: lectura, u: i.u };
        setDibujo(balanza(lectura, i.u));
        if (Math.abs(v - i.esperado) <= tol) {
          st.ok = true;
          st.valor = v;
          pesada();
          setDibujo(balanza(lectura, i.u));
          main.querySelector('#ms-msg').innerHTML = `<span class="ms-good">${Icons.svg('check', 'ox-icon--sm')} ${esc(ESTANTE[id].n)}: ${lectura} ${i.u}.</span>`;
        } else {
          st.intentos += 1;
          penalizar('pesada', `${ESTANTE[id].n}: mediste ${lectura} ${i.u} y correspondían ${num(i.esperado)}.`);
          if (st.intentos >= 3) {
            st.ok = true;
            st.valor = i.esperado;
            pesada();
            main.querySelector('#ms-msg').innerHTML = `<span class="ms-badtxt">Correspondían ${num(i.esperado)} ${i.u}. Queda corregido para seguir.</span>`;
          } else {
            pesada();
            main.querySelector('#ms-msg').innerHTML = `<span class="ms-badtxt">${lectura} ${i.u} no es lo que necesitás. ${st.intentos >= 2 ? 'Mirá la ayuda debajo.' : 'Revisá la cuenta.'}</span>`;
          }
        }
      };
      row.querySelector('.ms-weigh__go').addEventListener('click', go);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    });
    main.querySelector('#ms-next').addEventListener('click', avanzar);
  }

  /* ══ 4. Elaboración ═══════════════════════════════════════════════════ */

  function elaboracion() {
    const total = f.pasos.length;
    if (P.paso >= total) return avanzar();
    const p = f.pasos[P.paso];
    const cabeza = `<div class="ms-stephead"><span class="ox-eyebrow">${f.teoria ? 'Pregunta' : 'Paso'} ${P.paso + 1} de ${total}</span></div>`;
    if (p.tipo === 'ph') return pasoPH(p, cabeza);
    if (p.tipo === 'temp') return pasoTemp(p, cabeza);

    const opts = P.orden[P.paso];
    marco(`${cabeza}
      <div class="ms-q">${esc(p.q)}</div>
      <div class="ms-opts">${opts.map((o, k) => {
        const mal = P.pasoIntentos.includes(o);
        const bien = P.pasoResuelto && o === p.ok;
        return `<button class="ms-opt${mal ? ' is-bad' : ''}${bien ? ' is-ok' : ''}${P.pasoResuelto && !bien ? ' is-dim' : ''}" data-o="${k}" ${P.pasoResuelto || mal ? 'disabled' : ''}>
          <span class="ms-opt__l">${'abcd'[k]}</span><span>${esc(o)}</span></button>`;
      }).join('')}</div>
      ${P.pasoResuelto ? `<div class="ms-why ox-in-rise"><b>Bien.</b> ${esc(p.por)}</div>`
        : P.pasoIntentos.length ? '<div class="ms-why ms-why--bad">No es ese. Pensá qué necesita el sistema en este momento y probá de nuevo.</div>' : ''}
      <div class="ms-actions">
        ${P.pasoResuelto ? `<button class="ox-btn ox-btn--primary ox-flashable" id="ms-next">${P.paso + 1 < total ? 'Siguiente paso' : f.teoria ? 'Ver resultado' : 'A envasar'} <i data-icon="arrowRight"></i></button>` : ''}
      </div>`);

    main.querySelectorAll('.ms-opt').forEach((b) => b.addEventListener('click', () => {
      const o = opts[Number(b.dataset.o)];
      if (o === p.ok) {
        P.pasoResuelto = true;
        if (p.esc) { P.escena = { ...P.escena, ...p.esc }; pintarInspector(); }
      } else {
        P.pasoIntentos.push(o);
        penalizar('paso', `${p.q} — elegiste "${o}". Era: ${p.ok}.`);
      }
      elaboracion();
    }));
    main.querySelector('#ms-next')?.addEventListener('click', siguientePaso);
  }

  function siguientePaso() {
    P.paso += 1;
    P.pasoIntentos = [];
    P.pasoResuelto = false;
    elaboracion();
  }

  /* pH: la curva de la titulación. Sube rápido al principio y se aplana; la
     ventana de gelificación (≈ 6,5–7,5) cae hacia las 17–24 gotas. */
  const phDe = (gotas) => 3 + 7.6 * (1 - Math.exp(-gotas / 27));
  const gelDe = (ph) => (ph <= 5 ? 0 : ph <= 6.8 ? (ph - 5) / 1.8 : ph <= 8.8 ? 1 : Math.max(0.15, 1 - (ph - 8.8) / 1.6));

  function pasoPH(p, cabeza) {
    const ph = phDe(P.ph.gotas);
    const gel = gelDe(ph);
    marco(`${cabeza}
      <div class="ms-q">${esc(p.q)}</div>
      <div class="ms-ph">
        <div class="ox-stat"><span class="ox-stat__value ox-num">${num(Math.round(ph * 10) / 10)}</span><span class="ox-stat__label">pH</span></div>
        <div class="ox-stat"><span class="ox-stat__value ox-num">${P.ph.gotas}</span><span class="ox-stat__label">Gotas de ${esc(p.reactivo)}</span></div>
        <div class="ms-gelmeter"><span class="ox-label">Consistencia</span>
          <div class="ox-meter"><div class="ox-meter__fill" style="--ox-pct:${Math.round(gel * 100)}%"></div></div>
          <span class="ox-meta">${gel < 0.2 ? 'Líquido, fluye como agua' : gel < 0.9 ? 'Espesando' : ph > 8.8 ? 'Perdiendo viscosidad' : 'Gel formado'}</span></div>
      </div>
      <div class="ms-row">
        <button class="ox-btn ox-btn--secondary ox-flashable" data-g="1">1 gota</button>
        <button class="ox-btn ox-btn--secondary ox-flashable" data-g="5">5 gotas</button>
        <span class="ox-spacer"></span>
        <button class="ox-btn ox-btn--primary ox-flashable" id="ms-listo">Listo, gelificó</button>
      </div>
      <div class="ms-msg" id="ms-msg"></div>`);
    setDibujo(phmetro(num(Math.round(ph * 10) / 10), gel));
    main.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', () => {
      P.ph.gotas += Number(b.dataset.g);
      pasoPH(p, cabeza);
    }));
    main.querySelector('#ms-listo').addEventListener('click', () => {
      const msg = main.querySelector('#ms-msg');
      const [a, bmax] = p.rango;
      if (ph < a) {
        penalizar('ph', `Diste por terminado el gel a pH ${num(Math.round(ph * 10) / 10)}: todavía no había gelificado.`);
        msg.innerHTML = `<span class="ms-badtxt">A pH ${num(Math.round(ph * 10) / 10)} todavía no gelificó: seguí agregando de a poco.</span>`;
        return;
      }
      if (ph > bmax) penalizar('ph', `Te pasaste de base: pH ${num(Math.round(ph * 10) / 10)}. El exceso de base hace perder viscosidad.`);
      P.escena = { rec: 'vaso', color: '#d4e3e8', nivel: 0.55 };
      P.pasoResuelto = true;
      marco(`${cabeza}<div class="ms-q">${esc(p.q)}</div>
        <div class="ms-why ox-in-rise"><b>${ph > bmax ? 'Gelificó, pero te pasaste.' : 'Bien.'}</b> Terminaste a pH ${num(Math.round(ph * 10) / 10)} con ${P.ph.gotas} gotas. ${esc(p.por)}</div>
        <div class="ms-actions"><button class="ox-btn ox-btn--primary ox-flashable" id="ms-next">Siguiente paso <i data-icon="arrowRight"></i></button></div>`);
      main.querySelector('#ms-next').addEventListener('click', siguientePaso);
    });
  }

  function pasoTemp(p, cabeza) {
    const t = P.temp;
    marco(`${cabeza}
      <div class="ms-q">${esc(p.q)}</div>
      <div class="ms-temp">
        <div class="ox-stat"><span class="ox-stat__value ox-num" id="ms-t">${t}</span><span class="ox-stat__unit">°C</span><span class="ox-stat__label">Baño María</span></div>
        <input type="range" class="ox-slider" id="ms-slider" min="20" max="100" step="1" value="${t}" style="--ox-pct:${((t - 20) / 80) * 100}%">
      </div>
      <div class="ms-msg" id="ms-msg"></div>
      <div class="ms-actions"><button class="ox-btn ox-btn--primary ox-flashable" id="ms-fijar">Fijar temperatura</button></div>`);
    setDibujo(escena({ ...P.escena, rec: 'vaso', calor: true, temp: t }));
    const sl = main.querySelector('#ms-slider');
    sl.addEventListener('input', () => {
      P.temp = Number(sl.value);
      sl.style.setProperty('--ox-pct', `${((P.temp - 20) / 80) * 100}%`);
      main.querySelector('#ms-t').textContent = P.temp;
      setDibujo(escena({ ...P.escena, rec: 'vaso', calor: true, temp: P.temp }));
    });
    main.querySelector('#ms-fijar').addEventListener('click', () => {
      const [a, b] = p.rango;
      if (P.temp < a || P.temp > b) {
        penalizar('temp', `${p.q} — pusiste ${P.temp} °C.`);
        main.querySelector('#ms-msg').innerHTML = `<span class="ms-badtxt">${P.temp} °C no es lo que indica la cátedra. ${P.temp < a ? 'Está bajo.' : 'Está alto.'}</span>`;
        return;
      }
      P.escena = { ...P.escena, rec: 'vaso', calor: true, temp: P.temp };
      pintarInspector();
      marco(`${cabeza}<div class="ms-q">${esc(p.q)}</div>
        <div class="ms-why ox-in-rise"><b>Bien.</b> ${esc(p.por)}</div>
        <div class="ms-actions"><button class="ox-btn ox-btn--primary ox-flashable" id="ms-next">Siguiente paso <i data-icon="arrowRight"></i></button></div>`);
      main.querySelector('#ms-next').addEventListener('click', siguientePaso);
    });
  }

  /* ══ 5. Envasado y rótulo ═════════════════════════════════════════════ */

  function envasado() {
    const E = f.envase;
    const L = f.leyendas;
    const hecho = P.envasado;
    const rotulo = hecho ? `
      <div class="ms-label ox-in-pop">
        <div class="ms-label__brand">Farmacia · Laboratorio de Tecnología Farmacéutica II</div>
        <div class="ms-label__name">${esc(f.nombre)}</div>
        <div class="ms-label__comp">${cant.map((i) => `${esc(ESTANTE[i.id].n)} ${i.medir ? `${num(i.esperado)} ${i.u}` : esc(i.csp ? 'c.s.p.' : textoCantidad(i))}`).join(' · ')}</div>
        <div class="ms-label__row"><span>Contenido: ${num(P.lote)} ${f.u}</span><span>Lote: TP${f.tp}-${String(f.n).padStart(2, '0')}</span><span>Elaboró: Francisco Pavez</span></div>
        <div class="ms-label__legends">${[...P.leyendas].map((k) => `<span>${esc(LEYENDAS[k])}</span>`).join('')}</div>
      </div>` : '';

    marco(`
      <div class="ms-lead">Elegí el envase y las leyendas del rótulo.</div>
      <div class="ox-section__title" style="margin-bottom:8px">Envase</div>
      <div class="ms-envs">${Object.entries(ENVASES).map(([k, v]) => {
        const cls = hecho ? (E.ok.includes(k) ? ' is-ok' : k === P.envase ? ' is-bad' : ' is-dim') : k === P.envase ? ' is-sel' : '';
        return `<button class="ms-env${cls}" data-env="${k}" ${hecho ? 'disabled' : ''}>${envaseSVG(v.forma)}<span>${esc(v.n)}</span></button>`;
      }).join('')}</div>
      <div class="ox-section__title" style="margin:20px 0 8px">Leyendas del rótulo</div>
      <div class="ms-checks">${Object.entries(LEYENDAS).map(([k, v]) => {
        const on = P.leyendas.has(k);
        let cls = '';
        if (hecho) cls = L.si.includes(k) ? (on ? ' is-ok' : ' is-miss') : L.no.includes(k) && on ? ' is-bad' : '';
        return `<label class="ms-check${cls}"><button class="ox-check${on ? ' is-on' : ''}" data-ley="${k}" ${hecho ? 'disabled' : ''}>${Icons.svg('check')}</button><span>${esc(v)}</span></label>`;
      }).join('')}</div>
      ${hecho ? `<div class="ms-why ox-in-rise">${esc(E.por)} ${esc(L.por)}</div>${rotulo}` : ''}
      <div class="ms-actions">
        ${hecho ? '<button class="ox-btn ox-btn--primary ox-flashable" id="ms-next">A control de calidad <i data-icon="arrowRight"></i></button>'
          : `<button class="ox-btn ox-btn--primary ox-flashable" id="ms-envasar" ${P.envase ? '' : 'disabled'}>Envasar y rotular</button>`}
      </div>`);

    main.querySelectorAll('.ms-env').forEach((b) => b.addEventListener('click', () => {
      P.envase = b.dataset.env;
      pintarInspector();
      envasado();
    }));
    main.querySelectorAll('[data-ley]').forEach((b) => b.addEventListener('click', (e) => {
      e.preventDefault();
      const k = b.dataset.ley;
      P.leyendas.has(k) ? P.leyendas.delete(k) : P.leyendas.add(k);
      b.classList.toggle('is-on');
    }));
    main.querySelector('#ms-envasar')?.addEventListener('click', () => {
      if (!E.ok.includes(P.envase)) penalizar('envase', `Envase: elegiste ${ENVASES[P.envase].n}.`);
      L.si.filter((k) => !P.leyendas.has(k)).forEach((k) => penalizar('leyenda', `Faltó la leyenda "${LEYENDAS[k]}".`));
      L.no.filter((k) => P.leyendas.has(k)).forEach((k) => penalizar('leyenda', `La leyenda "${LEYENDAS[k]}" no corresponde.`));
      P.envasado = true;
      envasado();
    });
    main.querySelector('#ms-next')?.addEventListener('click', avanzar);
  }

  /* ══ 6. Control de calidad ════════════════════════════════════════════ */

  function control() {
    const C = f.controles;
    const hecho = P.controlado;
    const valido = (k) => C.si.includes(k) || (C.alguno || []).includes(k);
    marco(`
      <div class="ms-lead">Marcá los controles de calidad que corresponden a este preparado.</div>
      <div class="ms-checks ms-checks--col">${Object.entries(CONTROLES).map(([k, v]) => {
        const on = P.controles.has(k);
        let cls = '';
        if (hecho) cls = C.si.includes(k) ? (on ? ' is-ok' : ' is-miss') : on && !valido(k) ? ' is-bad' : on ? ' is-ok' : '';
        return `<label class="ms-check${cls}"><button class="ox-check${on ? ' is-on' : ''}" data-c="${k}" ${hecho ? 'disabled' : ''}>${Icons.svg('check')}</button><span>${esc(v)}</span></label>`;
      }).join('')}</div>
      ${hecho ? `<div class="ms-why ox-in-rise">${esc(C.por)}</div>` : ''}
      <div class="ms-actions">
        ${hecho ? '<button class="ox-btn ox-btn--primary ox-flashable" id="ms-next">Ver resultado <i data-icon="arrowRight"></i></button>'
          : '<button class="ox-btn ox-btn--primary ox-flashable" id="ms-ctrl">Realizar controles</button>'}
      </div>`);
    main.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', (e) => {
      e.preventDefault();
      const k = b.dataset.c;
      P.controles.has(k) ? P.controles.delete(k) : P.controles.add(k);
      b.classList.toggle('is-on');
    }));
    main.querySelector('#ms-ctrl')?.addEventListener('click', () => {
      C.si.filter((k) => !P.controles.has(k)).forEach((k) => penalizar('control', `Faltó el control: ${CONTROLES[k]}.`));
      [...P.controles].filter((k) => !valido(k)).forEach((k) => penalizar('control', `No corresponde: ${CONTROLES[k]}.`));
      if (C.alguno && !C.alguno.some((k) => P.controles.has(k))) penalizar('control', 'Faltó medir el pH.');
      P.controlado = true;
      control();
    });
    main.querySelector('#ms-next')?.addEventListener('click', avanzar);
  }

  /* ══ 7. Resultado ═════════════════════════════════════════════════════ */

  function resultado() {
    const e = estrellas(P.puntos);
    const star = (on) => `<svg class="ms-star${on ? ' is-on' : ''}" viewBox="0 0 24 24"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17 6.6 19.9l1.1-6.1-4.5-4.2 6.1-.8z"/></svg>`;
    const porEtapa = {};
    P.errores.forEach((x) => { (porEtapa[x.etapa] ||= []).push(x.texto); });
    marco(`
      <div class="ms-result">
        <div class="ms-stars">${[0, 1, 2].map((k) => star(k < e)).join('')}</div>
        <div class="ms-result__pts ox-num">${P.puntos}</div>
        <div class="ox-meta">${P.puntos >= 90 ? 'Listo para el parcial.' : P.puntos >= 75 ? 'Bien. Repasá los errores de abajo.' : 'Conviene repetirla después de repasar.'}</div>
      </div>
      ${P.errores.length ? Object.entries(porEtapa).map(([et, lista]) => `
        <div class="ox-section__title" style="margin:18px 0 8px">${esc(et)}</div>
        <ul class="ms-errs">${lista.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`).join('')
        : '<div class="ms-why">Sin errores. Impecable.</div>'}
      <div class="ms-actions">
        <button class="ox-btn ox-btn--secondary ox-flashable" id="ms-salir">Volver al recetario</button>
        <button class="ox-btn ox-btn--primary ox-flashable" id="ms-repetir">Repetir con otro lote</button>
      </div>`);
    main.querySelector('#ms-salir').addEventListener('click', () => alSalir?.('recetario'));
    main.querySelector('#ms-repetir').addEventListener('click', () => alSalir?.('repetir'));
  }

  /* ── Despacho ─────────────────────────────────────────────────────────── */

  function pintar() {
    const id = ETAPAS[P.etapa].id;
    pintarInspector();
    ({ receta, estante, pesada, elaboracion, envasado, control, resultado })[id]();
  }

  pintar();
}

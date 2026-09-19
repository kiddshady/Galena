/* ═══════════════════════════════════════════════════════════════════════════
   MESADA — calculadora
   Una calculadora común y nada más: no lee ni escribe nada del juego. Vive en
   el pie del inspector de la mesada y conserva lo que tenía entre repintados y
   entre fórmulas (el estado es del módulo, no de la vista).

   Se escribe en el campo o con los botones. Acepta coma o punto decimal,
   + - * / y paréntesis. Nada de eval: la CSP no lo deja y no hace falta —
   la expresión se lee con un analizador chico de descenso recursivo.
   ═══════════════════════════════════════════════════════════════════════════ */

import { Icons } from '../icons.js';

Icons.add({
  calcPor: '<path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/>',
  calcDiv: '<path d="M3.5 8h9"/><circle cx="8" cy="4.4" r=".9" fill="currentColor" stroke="none"/><circle cx="8" cy="11.6" r=".9" fill="currentColor" stroke="none"/>',
  calcIgual: '<path d="M3.5 6h9M3.5 10h9"/>',
  calcBorrar: '<path d="M6 3.5h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6L2 8z"/><path d="M8 6.2l3.6 3.6M11.6 6.2L8 9.8"/>',
  calc: '<rect x="3" y="1.8" width="10" height="12.4" rx="1.6"/><path d="M5.2 4.4h5.6"/><path d="M5.6 8h.01M8 8h.01M10.4 8h.01M5.6 10.8h.01M8 10.8h.01M10.4 10.8h.01" stroke-width="2"/>',
});

const C = { expr: '', previa: '', error: false };

const NF = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 6 });

/** Evalúa "200 - 10,5*2" → 179. Devuelve null si la expresión no cierra. */
export function calcular(texto) {
  const s = String(texto).replace(/\s+/g, '').replace(/,/g, '.').replace(/x/gi, '*');
  let i = 0;
  const ver = () => s[i];
  const numero = () => {
    const m = /^\d*\.?\d+|^\d+\./.exec(s.slice(i));
    if (!m) throw new Error('número');
    i += m[0].length;
    return Number(m[0]);
  };
  const factor = () => {
    if (ver() === '-') { i++; return -factor(); }
    if (ver() === '+') { i++; return factor(); }
    if (ver() === '(') {
      i++;
      const v = suma();
      if (ver() !== ')') throw new Error('paréntesis');
      i++;
      return v;
    }
    return numero();
  };
  const producto = () => {
    let v = factor();
    while (ver() === '*' || ver() === '/') {
      const op = s[i++];
      const d = factor();
      v = op === '*' ? v * d : v / d;
    }
    return v;
  };
  function suma() {
    let v = producto();
    while (ver() === '+' || ver() === '-') {
      const op = s[i++];
      const d = producto();
      v = op === '+' ? v + d : v - d;
    }
    return v;
  }
  try {
    if (!s) return null;
    const v = suma();
    if (i !== s.length || !Number.isFinite(v)) return null;
    return Math.round(v * 1e9) / 1e9;
  } catch {
    return null;
  }
}

const TECLAS = [
  ['7', '8', '9', { op: '/', icon: 'calcDiv', label: 'Dividir' }],
  ['4', '5', '6', { op: '*', icon: 'calcPor', label: 'Multiplicar' }],
  ['1', '2', '3', { op: '-', icon: 'minus', label: 'Restar' }],
  ['0', ',', { borrar: true, icon: 'calcBorrar', label: 'Borrar' }, { op: '+', icon: 'plus', label: 'Sumar' }],
];

export function montarCalculadora(el) {
  el.innerHTML = `
    <div class="ms-calc">
      <div class="ms-calc__head"><span class="ox-eyebrow">Calculadora</span><span class="ms-calc__prev ox-num" id="ms-calc-prev"></span></div>
      <input class="ox-input ox-input--mono ms-calc__in" id="ms-calc-in" spellcheck="false" autocomplete="off" placeholder="0" aria-label="Cuenta">
      <div class="ms-calc__keys">
        ${TECLAS.flat().map((k) => typeof k === 'string'
          ? `<button class="ms-calc__key" data-k="${k}">${k}</button>`
          : `<button class="ms-calc__key ms-calc__key--op" ${k.op ? `data-op="${k.op}"` : 'data-borrar'} aria-label="${k.label}">${Icons.svg(k.icon, 'ox-icon--sm')}</button>`).join('')}
        <button class="ms-calc__key ms-calc__key--c" data-c>C</button>
        <button class="ms-calc__key" data-k="(">(</button>
        <button class="ms-calc__key" data-k=")">)</button>
        <button class="ms-calc__key ms-calc__key--eq" data-eq aria-label="Igual">${Icons.svg('calcIgual', 'ox-icon--sm')}</button>
      </div>
    </div>`;

  const input = el.querySelector('#ms-calc-in');
  const prev = el.querySelector('#ms-calc-prev');
  const pintar = () => {
    input.value = C.expr;
    input.classList.toggle('is-invalid', C.error);
    prev.textContent = C.previa;
  };
  const resolver = () => {
    const v = calcular(C.expr);
    if (v == null) { C.error = !!C.expr; pintar(); return; }
    C.previa = `${C.expr} =`;
    C.expr = NF.format(v).replace(/\./g, '');   // sin separador de miles: se puede seguir operando
    C.error = false;
    pintar();
  };
  const escribir = (t) => {
    C.expr += t;
    C.error = false;
    pintar();
  };

  input.addEventListener('input', () => { C.expr = input.value; C.error = false; input.classList.remove('is-invalid'); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); resolver(); }
    if (e.key === 'Escape') { C.expr = ''; C.previa = ''; C.error = false; pintar(); }
  });
  el.querySelector('.ms-calc__keys').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.k) escribir(b.dataset.k);
    else if (b.dataset.op) escribir(b.dataset.op);
    else if ('borrar' in b.dataset) { C.expr = C.expr.slice(0, -1); C.error = false; pintar(); }
    else if ('c' in b.dataset) { C.expr = ''; C.previa = ''; C.error = false; pintar(); }
    else if ('eq' in b.dataset) resolver();
    input.focus();
  });
  pintar();
}

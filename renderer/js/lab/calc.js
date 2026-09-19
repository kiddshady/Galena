/* ═══════════════════════════════════════════════════════════════════════════
   GALENA — cuentas puras del juego
   Sin DOM: se importan desde el motor y desde los tests de Node.
   ═══════════════════════════════════════════════════════════════════════════ */


export function estrellas(puntos) {
  if (puntos >= 90) return 3;
  if (puntos >= 75) return 2;
  if (puntos >= 50) return 1;
  return 0;
}

/* ── Números ─────────────────────────────────────────────────────────────── */

const NF = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 3 });
export const num = (n) => NF.format(Math.round(n * 1000) / 1000);

export function leerNumero(txt) {
  const limpio = String(txt).trim().replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

export const MEDIBLES = ['g', 'ml'];

/** Lo que hay que medir de cada ingrediente, ya escalado al lote. */
export function cantidades(f, factor) {
  const suma = f.ing.filter((i) => MEDIBLES.includes(i.u) && !i.csp).reduce((s, i) => s + i.q, 0);
  return f.ing.map((i) => {
    if (i.csp === 'calc') return { ...i, esperado: (f.lote - suma) * factor, medir: true };
    if (MEDIBLES.includes(i.u) && !i.csp) return { ...i, esperado: i.q * factor, medir: true };
    return { ...i, esperado: null, medir: false };
  });
}


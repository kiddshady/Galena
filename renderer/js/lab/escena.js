/* ═══════════════════════════════════════════════════════════════════════════
   GALENA — la escena del inspector
   Dibujos SVG del material de laboratorio. Todo el trazo sale de currentColor
   (hereda el gris del tema) y solo el contenido lleva color propio: el color
   de lo que se está preparando es información, el vidrio no.
   ═══════════════════════════════════════════════════════════════════════════ */

const W = 240;
const H = 190;

function nivelY(top, bottom, nivel) {
  return bottom - (bottom - top) * Math.max(0, Math.min(1, nivel));
}

function mortero({ color = '#e9e6df', nivel = 0.3 }) {
  const y = nivelY(96, 150, nivel);
  return `
    <defs><clipPath id="ms-clip-mort"><path d="M52 92 Q120 200 188 92 Z"/></clipPath></defs>
    <rect x="30" y="${y}" width="180" height="${160 - y}" fill="${color}" clip-path="url(#ms-clip-mort)" class="ms-fill"/>
    <path d="M44 92 H196 M52 92 Q120 200 188 92" class="ms-stroke"/>
    <path d="M96 160 h48 l6 12 h-60 z" class="ms-stroke"/>
    <path d="M150 40 L122 118" class="ms-stroke ms-stroke--thick"/>
    <circle cx="121" cy="120" r="7" class="ms-stroke"/>`;
}

function vaso({ color = '#e6ebe8', nivel = 0.5, calor = false, temp = null, varilla = true }) {
  const top = 40, bottom = calor ? 132 : 158;
  const y = nivelY(top + 10, bottom, nivel);
  const bm = calor ? `
    <rect x="46" y="112" width="148" height="46" rx="6" class="ms-bm"/>
    <path d="M58 124 q8 -5 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" class="ms-stroke ms-wave"/>
    <path d="M86 172 q4 -8 0 -14 M120 172 q4 -8 0 -14 M154 172 q4 -8 0 -14" class="ms-stroke ms-heat"/>
    ${temp != null ? `<text x="200" y="104" class="ms-tag" text-anchor="end">${temp} °C</text>` : ''}` : '';
  return `
    ${bm}
    <rect x="82" y="${y}" width="76" height="${bottom - y}" fill="${color}" class="ms-fill"/>
    <path d="M76 ${top} h4 v${bottom - top} h80 v-${bottom - top} h4" class="ms-stroke"/>
    <path d="M76 ${top} l-6 -6" class="ms-stroke"/>
    ${[0.25, 0.5, 0.75].map((k) => `<path d="M${152} ${bottom - (bottom - top) * k} h-10" class="ms-stroke ms-thin"/>`).join('')}
    ${varilla ? `<path d="M132 ${top - 12} L112 ${bottom - 6}" class="ms-stroke ms-thin"/>` : ''}`;
}

function plancha({ color = '#f1efe8', nivel = 0.4 }) {
  const h = 10 + 36 * nivel;
  return `
    <path d="M30 140 L70 112 H214 L174 140 Z" class="ms-stroke ms-glass"/>
    <ellipse cx="124" cy="${126 - h / 3}" rx="${34 + 18 * nivel}" ry="${h / 2 + 6}" fill="${color}" class="ms-fill"/>
    <path d="M150 70 L186 120" class="ms-stroke ms-stroke--thick"/>
    <path d="M180 112 l14 16 l-8 4 z" class="ms-stroke"/>`;
}

function frasco({ color = '#eeede8', nivel = 0.7 }) {
  const y = nivelY(78, 164, nivel);
  return `
    <defs><clipPath id="ms-clip-fr"><rect x="84" y="70" width="72" height="96" rx="12"/></clipPath></defs>
    <rect x="80" y="${y}" width="80" height="${170 - y}" fill="${color}" clip-path="url(#ms-clip-fr)" class="ms-fill"/>
    <rect x="84" y="70" width="72" height="96" rx="12" class="ms-stroke"/>
    <path d="M104 70 v-14 h32 v14" class="ms-stroke"/>
    <rect x="100" y="40" width="40" height="16" rx="3" class="ms-stroke"/>`;
}

function pote({ color = '#f3efe4' }) {
  return `
    <rect x="70" y="92" width="100" height="66" rx="10" fill="${color}" class="ms-fill"/>
    <rect x="70" y="92" width="100" height="66" rx="10" class="ms-stroke"/>
    <rect x="64" y="72" width="112" height="22" rx="5" class="ms-stroke"/>`;
}

function pomo({ color = '#f3efe4' }) {
  return `
    <path d="M58 96 L170 82 L170 132 L58 118 Z" fill="${color}" class="ms-fill" opacity=".35"/>
    <path d="M58 96 L170 82 L170 132 L58 118 Z" class="ms-stroke"/>
    <path d="M58 92 v30" class="ms-stroke ms-stroke--thick"/>
    <rect x="170" y="94" width="16" height="26" rx="3" class="ms-stroke"/>
    <rect x="186" y="98" width="16" height="18" rx="2" class="ms-stroke"/>`;
}

function gotero() {
  return `
    <rect x="96" y="92" width="48" height="72" rx="10" class="ms-stroke"/>
    <path d="M110 92 v-10 h20 v10" class="ms-stroke"/>
    <path d="M114 82 v-26 q6 -10 12 0 v26" class="ms-stroke"/>`;
}

function sobre() {
  return `
    <rect x="66" y="80" width="108" height="72" rx="4" class="ms-stroke"/>
    <path d="M66 80 L120 122 L174 80" class="ms-stroke"/>`;
}

/** La balanza, con la lectura en el visor. */
export function balanza(lectura = '0,00', unidad = 'g') {
  return svg(`
    <rect x="46" y="118" width="148" height="40" rx="8" class="ms-stroke"/>
    <rect x="84" y="128" width="72" height="20" rx="3" class="ms-display"/>
    <text x="150" y="143" class="ms-read" text-anchor="end">${lectura} ${unidad}</text>
    <path d="M120 118 v-18" class="ms-stroke"/>
    <ellipse cx="120" cy="96" rx="58" ry="8" class="ms-stroke"/>
    <path d="M96 88 q24 -22 48 0" class="ms-stroke ms-thin"/>`);
}

/** El pHmetro sobre el vaso: la lectura y cuánto gelificó. */
export function phmetro(ph, gel) {
  const color = `rgb(${Math.round(222 - 30 * gel)} ${Math.round(233 - 10 * gel)} ${Math.round(238 - 4 * gel)})`;
  return svg(`
    ${vaso({ color, nivel: 0.55, varilla: false })}
    <rect x="4" y="22" width="62" height="34" rx="6" class="ms-stroke"/>
    <text x="35" y="44" class="ms-read" text-anchor="middle">pH ${ph}</text>
    <path d="M66 39 H118 V140" class="ms-stroke ms-thin"/>
    <rect x="113" y="132" width="10" height="20" rx="4" class="ms-stroke"/>`);
}

const DIBUJOS = { mortero, vaso, plancha, frasco, pote, pomo, gotero, sobre };

export function svg(inner) {
  return `<svg class="ms-scene__svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">${inner}</svg>`;
}

/** Dibuja un recipiente: { rec, color, nivel, calor, temp }. */
export function escena(esc = {}) {
  const fn = DIBUJOS[esc.rec] || mortero;
  return svg(fn(esc));
}

/** Un frasco chico para la estantería, según el tipo. */
export function frascoEstante(tipo) {
  const cuerpo = {
    polvo: '<rect x="7" y="10" width="18" height="18" rx="3"/><rect x="9" y="5" width="14" height="5" rx="1.5"/>',
    liquido: '<path d="M11 5h10v4l4 5v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V14l4-5z"/>',
    grasa: '<rect x="5" y="13" width="22" height="14" rx="3"/><rect x="4" y="9" width="24" height="5" rx="2"/>',
    activo: '<rect x="9" y="9" width="14" height="19" rx="3"/><path d="M12 9V5h8v4"/>',
    otro: '<ellipse cx="16" cy="18" rx="8" ry="10"/>',
  }[tipo] || '';
  return `<svg class="ms-jar__svg" viewBox="0 0 32 32" aria-hidden="true">${cuerpo}</svg>`;
}

/** Dibujo de envase para la etapa de envasado. */
export function envaseSVG(forma) {
  return escena({ rec: forma, color: '#f1eee6', nivel: 0.7 });
}

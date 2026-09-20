/* ═══════════════════════════════════════════════════════════════════════════
   GALENA — el ícono, horneado desde el código
   El matraz de la marca (el mismo dibujo que `.ox-brand__mark` en index.html)
   sobre la baldosa de Onyx: a sangre, sin borde, esquinas al 19 %. El contorno
   va en la tinta primaria y el líquido en el acento de la app, así el ícono
   dice de qué color es Galena antes de abrirla.

   Cada tamaño se dibuja a SU tamaño con supermuestreo, no se achica el de 256.
   Hasta 20 px se usa una geometría ajustada al píxel: el matraz escalado dejaba
   el cuello en dos columnas grises y el líquido en una franja sucia. Los colores
   salen de tokens.css, así que un retint.mjs se arrastra con volver a correr esto.

   Sin dependencias; los encoders PNG/ICO son los de Moji/Mnemus.
   `npm run icons` regenera build/ y deja la hoja de control en .shots/icons.png.
   ═══════════════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodePNG } from './png.mjs';
import { encodeICO } from './ico.mjs';
import { oklchToHex } from './oklch.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'build');

/* ── Color: los tokens de la app ─────────────────────────────────────────── */

const css = fs.readFileSync(path.join(ROOT, 'renderer/css/tokens.css'), 'utf8');
const num = (re, what) => {
  const m = css.match(re);
  if (!m) throw new Error(`tokens.css: no encontré ${what}`);
  return m.slice(1).map(Number);
};
const [HUE] = num(/--ox-hue:\s*([\d.]+)/, '--ox-hue');
const [TINT] = num(/--ox-tint:\s*([\d.]+)/, '--ox-tint');
const token = (name) => {
  const [L, C] = num(new RegExp(`--ox-${name}:\\s*oklch\\(([\\d.]+)%\\s+calc\\(([\\d.]+)\\s*\\*\\s*var\\(--ox-tint\\)\\)`), `--ox-${name}`);
  const hex = oklchToHex(L / 100, C * TINT, HUE);
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
};
const TILE = token('s1');                                   // el plano del rail y la statusbar
const INK = token('text');                                  // primario, nunca blanco puro
const LIQUID = num(/--ox-accent-rgb:\s*(\d+)\s+(\d+)\s+(\d+)/, '--ox-accent-rgb');

/* ── El matraz ───────────────────────────────────────────────────────────── */

/* La marca tal cual, en la grilla 16 del SVG: boca, cuello, hombros en diagonal
   y base con esquinas redondeadas. `level` es la altura del líquido. */
const MARK = {
  mouth: [6, 2.3, 10, 2.3],
  neck: [[6.8, 2.3], [9.2, 2.3]],
  shoulder: [[6.8, 6.6], [9.2, 6.6]],
  corner: [[3.2, 12.7], [12.8, 12.7]],
  base: [[4, 14], [12, 14]],
  level: 10.4,
};

/* El mismo matraz para los tamaños chicos, en la grilla del lienzo: a 16 px cada
   unidad es un píxel, así que el cuello, la boca y la base caen enteros en su
   columna o fila. Sin esquinas redondeadas: a ese tamaño son un gris más. */
const HINTED = {
  mouth: [5, 2.5, 11, 2.5],
  neck: [[6.5, 2.5], [9.5, 2.5]],
  shoulder: [[6.5, 6], [9.5, 6]],
  corner: [[2.5, 12.5], [13.5, 12.5]],
  base: [[2.5, 12.5], [13.5, 12.5]],
  level: 9.5,
};

/* Geometría, trazo y escala (grilla del matraz → grilla 16 del lienzo) por tamaño.
   Desde 48 px, la proporción de Tessera: glifo al ~62 % del lienzo, trazo 7,2 %. */
function glyph(size) {
  if (size <= 20) return prepare(HINTED, 1.25, 1);
  const [frac, sw] = size >= 48 ? [0.62, 1.5] : [0.68, 1.8];
  return prepare(MARK, sw, (frac * 16) / (13.1 + sw));
}

/* Muestrea una cuadrática de a a b con control c. */
function quad(a, c, b, n = 24) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n; const u = 1 - t;
    pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
  return pts;
}

/* Arma el contorno cerrado (polilínea) y el polígono del líquido. */
function prepare(g, sw, scale) {
  const [nl, nr] = g.neck; const [sl, sr] = g.shoulder;
  const [cl, cr] = g.corner; const [bl, br] = g.base;
  // Control de cada esquina: donde la diagonal del hombro cruza la línea de la base.
  const ctl = (s, c, b) => {
    const dx = c[0] - s[0]; const dy = c[1] - s[1];
    return dy ? [c[0] + dx * ((b[1] - c[1]) / dy), b[1]] : c;
  };
  const rounded = cl[1] !== bl[1];
  const leftArc = rounded ? quad(cl, ctl(sl, cl, bl), bl) : [cl];
  const rightArc = rounded ? quad(br, ctl(sr, cr, br), cr) : [cr];
  const outline = [nl, sl, ...leftArc, ...rightArc, sr, nr];
  // El líquido: la sección del cuerpo por debajo de `level`.
  const xAt = (s, c, y) => s[0] + (c[0] - s[0]) * ((y - s[1]) / (c[1] - s[1]));
  const liquid = [[xAt(sl, cl, g.level), g.level], ...leftArc, ...rightArc, [xAt(sr, cr, g.level), g.level]];
  return { outline, mouth: g.mouth, liquid, half: sw / 2, scale };
}

function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax; const dy = by - ay;
  const len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function inPolygon(poly, x, y) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]; const [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** ¿El punto (en la grilla del matraz) cae en la tinta del contorno? */
function inInk(g, x, y) {
  const { outline, mouth, half } = g;
  if (segDist(x, y, ...mouth) <= half) return true;
  for (let i = 0; i < outline.length - 1; i++) {
    const [ax, ay] = outline[i]; const [bx, by] = outline[i + 1];
    if (segDist(x, y, ax, ay, bx, by) <= half) return true;
  }
  return false;
}

const TILE_R = 0.19;   // radio de la baldosa sobre el lado

/** Baldosa redondeada a sangre sobre [0,1]². */
function inTile(u, v) {
  const qx = Math.abs(u - 0.5) - (0.5 - TILE_R);
  const qy = Math.abs(v - 0.5) - (0.5 - TILE_R);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - TILE_R <= 0;
}

function render(size) {
  const g = glyph(size);
  const N = size <= 64 ? 8 : 5;               // submuestras por lado
  const out = new Uint8Array(size * size * 4);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let tile = 0; let ink = 0; let liq = 0;
      for (let sy = 0; sy < N; sy++) {
        for (let sx = 0; sx < N; sx++) {
          const u = (px + (sx + 0.5) / N) / size;
          const v = (py + (sy + 0.5) / N) / size;
          if (!inTile(u, v)) continue;
          tile++;
          const x = (u * 16 - 8) / g.scale + 8;
          const y = (v * 16 - 8) / g.scale + 8;
          if (inInk(g, x, y)) ink++;
          else if (inPolygon(g.liquid, x, y)) liq++;
        }
      }
      if (!tile) continue;
      const ki = ink / tile; const kl = liq / tile; const o = (py * size + px) * 4;
      for (let c = 0; c < 3; c++) out[o + c] = Math.round(TILE[c] * (1 - ki - kl) + INK[c] * ki + LIQUID[c] * kl);
      out[o + 3] = Math.round((tile / (N * N)) * 255);
    }
  }
  return out;
}

/* ── Hornear ─────────────────────────────────────────────────────────────── */

const ICO_SIZES = [256, 128, 64, 48, 40, 32, 24, 20, 16];
const images = new Map(ICO_SIZES.map((size) => [size, render(size)]));

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'icon.ico'), encodeICO(ICO_SIZES.map((size) => ({ size, data: images.get(size) }))));
fs.writeFileSync(path.join(OUT, 'icon.png'), encodePNG(256, 256, images.get(256)));

/* ── Hoja de control: cada tamaño a 1:1 y los chicos ampliados por vecino más
   cercano, sobre la barra de tareas oscura y la clara de Windows 11. ─────── */

function sheet() {
  const GAP = 16;
  const cells = [...ICO_SIZES.map((s) => ({ s, zoom: 1 })), { s: 16, zoom: 10 }, { s: 24, zoom: 8 }, { s: 32, zoom: 6 }];
  const W = cells.reduce((w, c) => w + c.s * c.zoom + GAP, GAP);
  const rowH = 256 + GAP * 2;
  const px = new Uint8Array(W * rowH * 2 * 4);
  [[32, 32, 32], [243, 243, 243]].forEach((bg, row) => {
    for (let y = row * rowH; y < (row + 1) * rowH; y++) {
      for (let x = 0; x < W; x++) px.set([...bg, 255], (y * W + x) * 4);
    }
    let x0 = GAP;
    for (const { s, zoom } of cells) {
      const img = images.get(s); const side = s * zoom;
      const y0 = (row * rowH + GAP + (256 - side) / 2) | 0;
      for (let y = 0; y < side; y++) {
        for (let x = 0; x < side; x++) {
          const i = (((y / zoom) | 0) * s + ((x / zoom) | 0)) * 4; const a = img[i + 3] / 255;
          const o = ((y0 + y) * W + x0 + x) * 4;
          for (let c = 0; c < 3; c++) px[o + c] = Math.round(px[o + c] * (1 - a) + img[i + c] * a);
        }
      }
      x0 += side + GAP;
    }
  });
  return encodePNG(W, rowH * 2, px);
}

fs.mkdirSync(path.join(ROOT, '.shots'), { recursive: true });
fs.writeFileSync(path.join(ROOT, '.shots/icons.png'), sheet());

const kb = (f) => (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1);
const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
console.log(`baldosa ${hex(TILE)} · tinta ${hex(INK)} · líquido ${hex(LIQUID)} (hue ${HUE}, tint ${TINT})`);
console.log(`icon.ico  ${kb('icon.ico')} kB  (${ICO_SIZES.join(', ')})`);
console.log(`icon.png  ${kb('icon.png')} kB`);
console.log('control: .shots/icons.png');

/* Que las fórmulas solo nombren cosas que existen en el catálogo, y que cada
   paso tenga una sola respuesta correcta. Un id mal escrito no rompe nada al
   cargar: rompe a mitad de una partida, que es peor. */

import { FORMULAS } from '../renderer/js/lab/formulas.js';
import { ESTANTE, FUNCIONES, ENVASES, LEYENDAS, CONTROLES } from '../renderer/js/lab/catalogo.js';
import { cantidades } from '../renderer/js/lab/calc.js';

let ok = 0, mal = 0;
const check = (cond, msg) => { cond ? ok++ : (mal++, console.log(`  FALLA ${msg}`)); };

console.log('\nDatos de las fórmulas');
const ids = new Set();
for (const f of FORMULAS) {
  check(!ids.has(f.id), `id repetido ${f.id}`);
  ids.add(f.id);
  for (const i of f.ing) {
    check(i.id in ESTANTE, `${f.id}: ingrediente ${i.id} no está en la estantería`);
    check(i.fn.length && i.fn.every((x) => x in FUNCIONES), `${f.id}: función inválida en ${i.id}`);
  }
  for (const p of f.pasos) {
    if (p.tipo) { check(Array.isArray(p.rango) && p.rango[0] < p.rango[1], `${f.id}: rango inválido`); continue; }
    check(p.ok && p.no?.length >= 2, `${f.id}: paso sin opciones suficientes: ${p.q}`);
    check(!p.no.includes(p.ok), `${f.id}: la correcta está también entre las incorrectas: ${p.q}`);
    check(new Set(p.no).size === p.no.length, `${f.id}: opciones repetidas: ${p.q}`);
    check(p.por, `${f.id}: paso sin explicación: ${p.q}`);
  }
  if (f.teoria) continue;
  check(f.envase.ok.every((e) => e in ENVASES), `${f.id}: envase inexistente`);
  check([...f.leyendas.si, ...f.leyendas.no].every((l) => l in LEYENDAS), `${f.id}: leyenda inexistente`);
  check(!f.leyendas.si.some((l) => f.leyendas.no.includes(l)), `${f.id}: una leyenda es obligatoria y prohibida a la vez`);
  check([...f.controles.si, ...(f.controles.alguno || [])].every((c) => c in CONTROLES), `${f.id}: control inexistente`);
  for (const factor of [0.5, 1, 1.5, 2]) {
    for (const c of cantidades(f, factor)) {
      if (c.medir) check(c.esperado > 0, `${f.id} ×${factor}: ${c.id} da ${c.esperado}`);
    }
  }
}
check(FORMULAS.length === 25, `se esperaban 25 fórmulas y hay ${FORMULAS.length}`);

// Los c.s.p. que se pesan tienen que cerrar el lote exacto.
const lassar = cantidades(FORMULAS.find((f) => f.id === 'tp3-diadermina'), 1);
check(Math.abs(lassar.find((c) => c.id === 'agua').esperado - 9.5) < 1e-9, 'diadermina: el agua c.s.p. tiene que dar 9,5 g (lo que dice el práctico)');

console.log(`\n═══ ${ok} ok · ${mal} fallas ═══`);
process.exit(mal ? 1 : 0);

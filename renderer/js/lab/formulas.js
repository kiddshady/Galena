/* ═══════════════════════════════════════════════════════════════════════════
   MESADA — las fórmulas de los TPL 1 a 4 (Tecnología Farmacéutica II, UMAZA)
   Cantidades, orden y usos: tal cual los prácticos de la cátedra. Lo que el
   práctico no dice no se inventa; cuando una explicación agrega algo de la
   teoría, sale de las unidades 1 a 3.

   Esquema de un ingrediente:
     { id, q, u, fn, csp }
       u    'g' | 'ml'            se mide en la pesada (balanza / probeta o pipeta)
            'ui' | 'gotas' | 'cs' | 'unidad'   no se pesa: entra durante la elaboración
       csp  'calc'       c.s.p.: se pesa lo que falta para completar el lote
            'completar'  c.s.p. que se completa en la elaboración (mezcla g y ml)
       fn   funciones aceptadas (ids de FUNCIONES)

   Esquema de un paso de elaboración:
     { q, ok, no:[…], por, esc }                   elección
     { tipo:'ph', q, reactivo, rango:[a,b], por }  titulación con gotas
     { tipo:'temp', q, rango:[a,b], por }          baño María
   ═══════════════════════════════════════════════════════════════════════════ */

const LIQ_ACUOSO = ['aspectoLiq', 'contenido', 'hermeticidad', 'phDirecto'];
const LIQ_NO_ACUOSO = ['aspectoLiq', 'contenido', 'hermeticidad', 'phDisp'];
const SEMISOLIDO = ['aspectoNegro', 'contenido', 'phDisp'];

const POR_LIQ = 'Lociones y linimentos: aspecto (partículas, color, limpidez), contenido, hermeticidad del cierre y pH. El pH va directo si el preparado es acuoso y en dispersión al 10 % si no lo es.';
const POR_SEMI = 'Geles, pomadas, cremas y pastas: aspecto sobre superficie negra con placa de vidrio, contenido y pH en dispersión al 10 %. La hermeticidad es un control de lociones y linimentos.';

const ENV_LIQ = { ok: ['frascoAmbar'], por: 'Un líquido de uso externo va en frasco con tapa a rosca: es el envase donde se prueba la hermeticidad del cierre. El gotero es para dosificar gotas.' };
const ENV_GEL = { ok: ['tuboPlastico', 'pomoAl'], por: 'Geles: tubos de plástico blanco, de baja porosidad y colapsibles, que evitan la deshidratación (U1). El pomo de aluminio recubierto también protege de la evaporación.' };
const ENV_POMADA = { ok: ['poteVidrio', 'potePlastico', 'pomoAl'], por: 'Pomadas: potes de vidrio opaco o plástico con tapa a rosca, o pomos. El ideal es el pomo de aluminio recubierto por dentro, que evita en mayor grado contaminación y evaporación (U2).' };

export const FORMULAS = [

/* ══ TPL 1 · Lociones, linimentos y geles ════════════════════════════════ */

{
  id: 'tp1-antipruriginosa', tp: 1, n: 1, nombre: 'Loción antipruriginosa', ff: 'Loción (suspensión)',
  uso: 'Antipruriginosa', lote: 100, u: 'g',
  ing: [
    { id: 'mentol', q: 0.5, u: 'g', fn: ['activo'] },
    { id: 'talco', q: 20, u: 'g', fn: ['polvo'] },
    { id: 'zno', q: 20, u: 'g', fn: ['polvo', 'activo'] },
    { id: 'agua', u: 'g', csp: 'calc', fn: ['vehiculo'] },
  ],
  pasos: [
    { q: 'Tenés todo pesado. ¿Por dónde empezás?', ok: 'Tamizar el óxido de cinc', no: ['Disolver el mentol en el agua', 'Mezclar todos los polvos con el agua de una vez', 'Calentar el agua a baño María'], por: 'El práctico empieza tamizando el ZnO: rompe los agregados antes de pulverizar.', esc: { rec: 'mortero', color: '#e9e6df', nivel: 0.25 } },
    { q: '¿Y después del tamizado?', ok: 'Pulverizar en mortero el ZnO con el mentol', no: ['Agregar el agua sobre el ZnO', 'Fundir el mentol a baño María', 'Agregar el talco solo'], por: 'El mentol se pulveriza junto con el ZnO en el mortero: el polvo lo reparte y lo dispersa.', esc: { rec: 'mortero', color: '#ecebe4', nivel: 0.3 } },
    { q: '¿Qué sigue?', ok: 'Agregar el talco y mezclar', no: ['Agregar el agua', 'Envasar', 'Agregar glicerina'], por: 'Primero se mezclan todos los polvos entre sí; el líquido va último.', esc: { rec: 'mortero', color: '#f0efe9', nivel: 0.42 } },
    { q: '¿Cómo terminás?', ok: 'Agregar el agua por último y agitar hasta dispersión homogénea', no: ['Agregar el agua y filtrar', 'Calentar hasta disolver los polvos', 'Dejar decantar y separar el sobrenadante'], por: 'El agua va última y se agita hasta una dispersión homogénea. Es una suspensión: los polvos no se disuelven.', esc: { rec: 'frasco', color: '#eeede8', nivel: 0.8 } },
    { q: '¿Qué tipo de sistema obtuviste?', ok: 'Una suspensión: sólidos insolubles dispersos en agua', no: ['Una solución verdadera', 'Una emulsión W/O', 'Un gel'], por: 'Talco y ZnO son polvos insolubles: la loción es una suspensión y por eso sedimenta.' },
  ],
  envase: ENV_LIQ,
  leyendas: { si: ['externo', 'agitese'], no: ['interno', 'esteril'], por: 'Uso externo, y como es una suspensión que sedimenta, "Agítese antes de usar".' },
  controles: { si: LIQ_ACUOSO, por: POR_LIQ },
},

{
  id: 'tp1-calamina', tp: 1, n: 2, nombre: 'Loción de calamina', sin: 'Caladryl®, USP XXIII', ff: 'Loción (suspensión)',
  uso: 'Ligeramente astringente y antiséptica, uso local', lote: 100, u: 'ml',
  ing: [
    { id: 'calamina', q: 8, u: 'g', fn: ['activo', 'polvo'] },
    { id: 'zno', q: 8, u: 'g', fn: ['activo', 'polvo'] },
    { id: 'glicerina', q: 2, u: 'ml', fn: ['interponente', 'humectante'] },
    { id: 'magma', q: 25, u: 'ml', fn: ['suspensor'] },
    { id: 'agua', u: 'ml', csp: 'completar', fn: ['vehiculo'] },
  ],
  pasos: [
    { q: '¿Qué hacés primero en el mortero?', ok: 'Mezclar la calamina y el óxido de cinc', no: ['Poner el magma de bentonita', 'Poner la glicerina y el agua', 'Tamizar el magma'], por: 'Se empieza mezclando los dos polvos en el mortero.', esc: { rec: 'mortero', color: '#e8c9bd', nivel: 0.3 } },
    { q: '¿Para qué agregás ahora la glicerina?', ok: 'Para interponer: formar una pasta con los polvos', no: ['Para conservar la loción', 'Para gelificar', 'Para disolver la calamina'], por: 'La glicerina es interponente: moja y separa los polvos para que después el líquido los disperse sin grumos.', esc: { rec: 'mortero', color: '#dfb6a7', nivel: 0.35 } },
    { q: '¿Qué hacés con el magma de bentonita?', ok: 'Mezclarlo con 15 ml de agua destilada', no: ['Agregarlo seco a la pasta', 'Calentarlo a 80 °C', 'Neutralizarlo con TEA'], por: 'El práctico indica mezclar el magma con 15 ml de agua antes de incorporarlo.', esc: { rec: 'vaso', color: '#cfc8bb', nivel: 0.3 } },
    { q: '¿Cómo lo incorporás a la pasta?', ok: 'En pequeñas porciones y con agitación', no: ['Todo de golpe', 'Sin agitar, dejando que se integre solo', 'Primero filtrarlo'], por: 'La suspensión de bentonita se incorpora de a poco y agitando hasta un preparado homogéneo.', esc: { rec: 'mortero', color: '#e3bfb2', nivel: 0.55 } },
    { q: '¿Cómo llevás al volumen final?', ok: 'Completar con agua destilada a 100 ml y agitar', no: ['Pesar 100 g de agua', 'Completar con glicerina', 'No hace falta completar'], por: 'El agua es c.s.p. 100 ml: se completa el volumen al final. Por eso no se pesa en la balanza.', esc: { rec: 'frasco', color: '#e7c3b6', nivel: 0.85 } },
    { q: 'Si no hay magma de bentonita, ¿qué usa la fórmula alternativa?', ok: 'Celulosa microcristalina 2 g + CMC 2 g hidratadas en 30 ml de agua', no: ['Carbopol neutralizado con TEA', 'Goma arábiga', 'Talco'], por: 'Nota del práctico: la bentonita (suspensor) se reemplaza por celulosa microcristalina y CMC.' },
  ],
  envase: ENV_LIQ,
  leyendas: { si: ['externo', 'agitese'], no: ['interno', 'esteril'], por: 'El práctico lo pide explícitamente: "Agítese antes de usar". Es una suspensión.' },
  controles: { si: LIQ_ACUOSO, por: POR_LIQ },
},

{
  id: 'tp1-oleocalcareo', tp: 1, n: 3, nombre: 'Linimento oleocalcáreo', sin: 'Linimento de calcio, FA VII', ff: 'Linimento (emulsión W/O)',
  uso: 'Emoliente, limpieza, dermatitis del pañal, quemaduras', lote: 100, u: 'g',
  ing: [
    { id: 'aceOliva', q: 50, u: 'g', fn: ['vehiculo', 'formador'] },
    { id: 'aguaCal', u: 'g', csp: 'calc', fn: ['formador', 'vehiculo'] },
  ],
  pasos: [
    { q: '¿Cómo se prepara?', ok: 'Agitar enérgicamente en recipiente tapado hasta emulsionar', no: ['Calentar a baño María y batir', 'Agregar un Tween y agitar', 'Mezclar en mortero con glicerina'], por: 'Se agitan enérgicamente el aceite y el agua de cal en un recipiente tapado. No lleva emulgente agregado.', esc: { rec: 'frasco', color: '#e6d49a', nivel: 0.8 } },
    { q: '¿Quién es el emulgente?', ok: 'El oleato de calcio, formado por reacción química', no: ['El agua de cal', 'El ácido oleico libre', 'No tiene emulgente'], por: 'El ácido oleico del aceite reacciona con el calcio del agua de cal y forma oleato de calcio, un jabón cálcico.' },
    { q: '¿Cuál es el signo de la emulsión?', ok: 'W/O (agua en aceite)', no: ['O/W (aceite en agua)', 'O/W/O', 'No es una emulsión'], por: 'Los jabones de calcio (insolubles en agua, solubles en aceite) dan emulsiones W/O.' },
  ],
  envase: ENV_LIQ,
  leyendas: { si: ['externo', 'agitese'], no: ['interno', 'esteril'], por: 'El práctico pide "Agítese antes de usar": es una emulsión que se separa.' },
  controles: { si: LIQ_NO_ACUOSO, por: POR_LIQ + ' Acá la fase externa es oleosa: pH en dispersión al 10 %.' },
},

{
  id: 'tp1-trementina', tp: 1, n: 4, nombre: 'Linimento de trementina compuesto', sin: 'FA VI', ff: 'Linimento (emulsión)',
  uso: 'Alivio local de dolores musculares y articulares', lote: 100, u: 'ml',
  ing: [
    { id: 'trementina', q: 50, u: 'ml', fn: ['activo'] },
    { id: 'acAcetico', q: 8, u: 'ml', fn: ['activo'] },
    { id: 'huevo', q: 1, u: 'unidad', fn: ['emulgente'] },
    { id: 'agua', u: 'ml', csp: 'completar', fn: ['vehiculo'] },
  ],
  pasos: [
    { q: '¿Qué hacés primero con el huevo?', ok: 'Batir clara y yema en el mortero con unos 30 ml de agua', no: ['Separar la clara y descartarla', 'Hervirlo', 'Agregarlo directo a la trementina'], por: 'Se baten claras y yemas con unos 30 ml de agua. El filtrado por muselina es opcional.', esc: { rec: 'mortero', color: '#f0d48c', nivel: 0.35 } },
    { q: '¿Cómo incorporás la trementina?', ok: 'Poco a poco y agitando, la cantidad total', no: ['Toda de golpe', 'Disuelta en el ácido acético', 'Calentada a 70 °C'], por: 'La esencia se agrega de a poco y agitando para que el emulgente (proteínas y lecitina del huevo) la envuelva.', esc: { rec: 'frasco', color: '#efdca4', nivel: 0.6 } },
    { q: '¿Cómo y cuándo entra el ácido acético?', ok: 'Diluido en igual porción de agua, después de la trementina', no: ['Puro, al principio junto con el huevo', 'Puro, al final', 'No se agrega'], por: 'Se diluye y se agrega en ese momento para evitar la desnaturalización de la proteína y la ruptura de la emulsión.' },
    { q: '¿Cómo terminás?', ok: 'Completar con agua a 100 ml y agitar hasta emulsión perfecta', no: ['Pesar 100 g de agua', 'Calentar para espesar', 'Filtrar'], por: 'El agua es c.s.p. 100 ml: se completa el volumen al final.', esc: { rec: 'frasco', color: '#f3e3b7', nivel: 0.85 } },
  ],
  envase: ENV_LIQ,
  leyendas: { si: ['externo', 'agitese'], no: ['interno', 'esteril'], por: 'El práctico pide "Agítese antes de usar": es una emulsión.' },
  controles: { si: ['aspectoLiq', 'contenido', 'hermeticidad'], alguno: ['phDirecto', 'phDisp'], por: POR_LIQ },
},

{
  id: 'tp1-carbopol', tp: 1, n: 5, nombre: 'Gel de Carbopol', ff: 'Gel (hidrogel)',
  uso: 'Gel base, cuando la prescripción pide gel de carbopol', lote: 200, u: 'g',
  ing: [
    { id: 'carbopol', q: 1, u: 'g', fn: ['gelificante'] },
    { id: 'tea', u: 'cs', nota: 'c.s.p. pH neutro', fn: ['neutralizante'] },
    { id: 'agua', u: 'g', csp: 'calc', fn: ['vehiculo'] },
  ],
  pasos: [
    { q: '¿Cómo empezás?', ok: 'Dispersar el carbopol con la totalidad del agua, con el pilón', no: ['Disolver el carbopol en TEA', 'Echar el carbopol en agua hirviendo', 'Agregar todo el TEA primero'], por: 'Se dispersa el carbómero en toda el agua con ayuda del pilón, sin grumos.', esc: { rec: 'mortero', color: '#dfe9ee', nivel: 0.55 } },
    { q: 'Así, ¿cómo está el sistema?', ok: 'Ácido y poco viscoso: las cadenas están enrolladas', no: ['Ya gelificado', 'Alcalino y turbio', 'Separado en dos fases'], por: 'La dispersión de carbómero es ácida (a pH 3 su viscosidad es como la del agua). Todavía no gelificó.' },
    { tipo: 'ph', q: 'Agregá TEA con pipeta Pasteur, agitando, hasta que gelifique.', reactivo: 'TEA', rango: [6.5, 7.5], por: 'La TEA ioniza los COOH, las cadenas se repelen y se estiran: gelifica a pH ≈ 7. El exceso de base hace perder viscosidad.' },
    { q: 'Si en vez de TEA usaras NaOH, el gel quedaría…', ok: 'Más rígido y transparente', no: ['Más fluido y opaco', 'Igual', 'No gelificaría'], por: 'U1: con carbómero, cuanto más fuerte es la base, más rígidos y transparentes son los geles.' },
  ],
  envase: ENV_GEL,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo. Un gel es una sola fase: no lleva "Agítese antes de usar".' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

{
  id: 'tp1-alcoholgel', tp: 1, n: 6, nombre: 'Alcohol en gel', ff: 'Gel hidroalcohólico',
  uso: 'Antiséptico de manos', lote: 200, u: 'g',
  ing: [
    { id: 'carbopol', q: 1, u: 'g', fn: ['gelificante'] },
    { id: 'tea', u: 'cs', nota: 'c.s.p. pH neutro', fn: ['neutralizante'] },
    { id: 'glicerina', q: 4, u: 'g', fn: ['humectante'] },
    { id: 'alcohol70', u: 'g', csp: 'calc', fn: ['vehiculo', 'activo'] },
  ],
  pasos: [
    { q: '¿Cómo humectás el carbómero?', ok: 'En el mortero, agregando pequeñas cantidades de alcohol y desagregando grumos', no: ['Todo el alcohol de golpe', 'Con glicerina caliente', 'Con TEA pura'], por: 'Se humecta el polímero con pequeñas cantidades de alcohol y se desagregan los grumos con el pilón.', esc: { rec: 'mortero', color: '#e3eef2', nivel: 0.5 } },
    { tipo: 'ph', q: 'Gelificá con TEA en gotas, con agitación constante.', reactivo: 'TEA', rango: [6.5, 7.5], por: 'Con TEA hasta pH cercano a 7 se logra la consistencia adecuada.' },
    { q: '¿Cuándo va la glicerina y para qué?', ok: 'Al final, para dar efecto humectante', no: ['Al principio, para empastar el carbopol', 'Antes de la TEA, para neutralizar', 'No lleva glicerina'], por: 'Acá la glicerina no interviene en la gelificación: es solo humectante para la piel y se incorpora al final.' },
  ],
  envase: ENV_GEL,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo. Es una sola fase: no se agita.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

{
  id: 'tp1-cmc', tp: 1, n: 7, nombre: 'Gel de carboximetilcelulosa', ff: 'Gel (hidrogel)',
  uso: 'Gel base, cuando la prescripción pide gel de CMC', lote: 100, u: 'g',
  ing: [
    { id: 'cmc', q: 5, u: 'g', fn: ['gelificante'] },
    { id: 'glicerina', q: 10, u: 'g', fn: ['interponente', 'humectante'] },
    { id: 'nipagin', q: 0.1, u: 'g', fn: ['conservante'] },
    { id: 'nipasol', q: 0.05, u: 'g', fn: ['conservante'] },
    { id: 'agua', u: 'g', csp: 'calc', fn: ['vehiculo'] },
  ],
  pasos: [
    { q: '¿Qué hacés en el mortero?', ok: 'Una pasta con la CMC y la glicerina', no: ['Dispersar la CMC en agua fría', 'Disolver la CMC en alcohol', 'Neutralizar la CMC con TEA'], por: 'Primero se empasta la CMC con la glicerina, que actúa de interponente y evita grumos al agregar el agua.', esc: { rec: 'mortero', color: '#ece8da', nivel: 0.3 } },
    { tipo: 'temp', q: '¿A qué temperatura calentás el agua donde disolvés las nipas?', rango: [78, 82], por: 'El agua va a 80 °C: disuelve los parabenos, poco solubles en frío, y ayuda a hidratar el polímero.' },
    { q: '¿Y después de volcar el agua caliente?', ok: 'Agitar hasta alcanzar la temperatura ambiente', no: ['Neutralizar con TEA', 'Seguir calentando hasta evaporar', 'Filtrar en caliente'], por: 'Se agita hasta temperatura ambiente: gelifica al enfriar (método de obtención por enfriamiento).', esc: { rec: 'mortero', color: '#e6ebe8', nivel: 0.7 } },
    { q: '¿Qué protege cada nipa?', ok: 'Metilparabeno la fase acuosa, propilparabeno la oleosa', no: ['Las dos protegen la fase oleosa', 'Metilparabeno la oleosa, propilparabeno la acuosa', 'Son antioxidantes'], por: 'U1 Emulsiones: el metilparabeno protege la fase acuosa y el propilparabeno la oleosa.' },
  ],
  envase: ENV_GEL,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo; es una sola fase.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

{
  id: 'tp1-lidocaina', tp: 1, n: 8, nombre: 'Gel de lidocaína 1 %', ff: 'Gel (hidrogel)',
  uso: 'Anestésico local', lote: 100, u: 'g',
  nota: 'El Rp pide "gel de CMC c.s.p."; la preparación arma el gel en el momento, con los componentes del N° 7.',
  ing: [
    { id: 'lidocaina', q: 1, u: 'g', fn: ['activo'] },
    { id: 'cmc', q: 5, u: 'g', fn: ['gelificante'] },
    { id: 'glicerina', q: 10, u: 'g', fn: ['interponente', 'humectante'] },
    { id: 'nipagin', q: 0.1, u: 'g', fn: ['conservante'] },
    { id: 'nipasol', q: 0.05, u: 'g', fn: ['conservante'] },
    { id: 'agua', u: 'g', csp: 'calc', fn: ['vehiculo'] },
  ],
  pasos: [
    { q: '¿Dónde disolvés la lidocaína?', ok: 'En el agua, junto con las nipas, calentando a baño María', no: ['En la glicerina en frío', 'En la CMC seca', 'Se agrega al gel ya frío, sin disolver'], por: 'La lidocaína clorhidrato es hidrosoluble: se disuelve con las nipas en el agua a BM.', esc: { rec: 'vaso', color: '#dfe7ec', nivel: 0.55, calor: true } },
    { q: '¿Qué preparás aparte?', ok: 'Una pasta homogénea de CMC y glicerina', no: ['Una emulsión con Tween', 'Una dispersión de carbopol', 'Nada más'], por: 'Igual que en el gel N° 7: la glicerina empasta la CMC.', esc: { rec: 'mortero', color: '#ece8da', nivel: 0.3 } },
    { q: '¿Cómo terminás?', ok: 'Agregar la mezcla sobre la solución de lidocaína y agitar en caliente hasta temperatura ambiente', no: ['Neutralizar con TEA', 'Calentar hasta ebullición', 'Enfriar en heladera sin agitar'], por: 'Se agita en caliente hasta llegar a temperatura ambiente: el gel se forma al enfriar.', esc: { rec: 'vaso', color: '#e6ebe8', nivel: 0.7 } },
  ],
  envase: ENV_GEL,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo; una sola fase.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

/* ══ TPL 2 · Pastas, ungüentos y ceratos ═════════════════════════════════ */

{
  id: 'tp2-lassar', tp: 2, n: 1, nombre: 'Pomada de óxido de cinc compuesta', sin: 'Pasta Lassar, FA VI', ff: 'Pasta',
  uso: 'Escaras, heridas exudativas, dermatitis del pañal', lote: 100, u: 'g',
  ing: [
    { id: 'zno', q: 25, u: 'g', fn: ['polvo', 'activo'] },
    { id: 'almidon', q: 25, u: 'g', fn: ['polvo'] },
    { id: 'vasSolida', q: 50, u: 'g', fn: ['base'] },
  ],
  pasos: [
    { q: '¿Cómo empezás?', ok: 'Mezclar el óxido de cinc con el almidón', no: ['Fundir la vaselina con los polvos', 'Disolver el ZnO en agua', 'Poner toda la vaselina en la plancha'], por: 'Primero se mezclan los dos polvos (muy finos).', esc: { rec: 'plancha', color: '#f1efe8', nivel: 0.3 } },
    { q: '¿Cómo incorporás la vaselina?', ok: 'Triturar la mezcla con un poco de vaselina y después agregar el resto', no: ['Toda de una vez, fundida', 'Fundida a 100 °C', 'Con agua para empastar'], por: 'Se tritura con una porción de vaselina y se agrega el resto hasta una pomada homogénea en plancha. Es el método "por mezcla con el excipiente sólido".', esc: { rec: 'plancha', color: '#efece2', nivel: 0.55 } },
    { q: 'Si la receta pide "esterilizada", ¿qué cambia?', ok: 'Se reemplaza el almidón por talco', no: ['Se reemplaza la vaselina por lanolina', 'Se agrega un conservante', 'Nada'], por: 'Nota del práctico: para la pomada de óxido de cinc compuesta esterilizada, el almidón se reemplaza por talco.' },
    { q: '¿Qué la hace una pasta?', ok: 'La gran proporción de polvos insolubles', no: ['Que tiene más de 25 % de cera', 'Que tiene glicerina', 'Que es una emulsión'], por: 'Pastas: pomadas con gran proporción de polvos insolubles (ZnO, almidón). Mucha consistencia y bajo flujo.' },
  ],
  envase: ENV_POMADA,
  leyendas: { si: ['externo', 'vence6'], no: ['agitese', 'interno'], por: 'Según la Farmacopea Argentina vence a los 6 meses.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

{
  id: 'tp2-unguento', tp: 2, n: 2, nombre: 'Ungüento blanco', ff: 'Ungüento',
  uso: 'Excipiente, base hidrófoba', lote: 100, u: 'g',
  ing: [
    { id: 'ceraBlanca', q: 5, u: 'g', fn: ['consistencia', 'base'] },
    { id: 'vasSolida', u: 'g', csp: 'calc', fn: ['base'] },
  ],
  pasos: [
    { q: '¿Cómo lo preparás?', ok: 'Por simple fusión de los componentes', no: ['Por trituración en frío', 'Emulsionando con agua', 'Por disolución en alcohol'], por: 'Se prepara por simple fusión a baño María.', esc: { rec: 'vaso', color: '#f3eed8', nivel: 0.55, calor: true } },
    { q: 'Una vez fundido, ¿qué hacés?', ok: 'Batir hasta enfriamiento', no: ['Dejarlo enfriar quieto', 'Agregar agua caliente', 'Filtrarlo'], por: 'Se bate hasta enfriar: si se enfría quieto, la cera cristaliza y queda grumoso.', esc: { rec: 'vaso', color: '#f1ede0', nivel: 0.55 } },
    { q: '¿Por qué es un ungüento y no una crema?', ok: 'Es una pomada que fluye con facilidad y no está emulsionada', no: ['Porque tiene más de 25 % de cera', 'Porque lleva resina', 'Porque tiene agua'], por: 'TPL 2: hoy se llaman ungüentos las pomadas que fluyen con facilidad y no son sistemas emulsionados.' },
  ],
  envase: ENV_POMADA,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

{
  id: 'tp2-cloranfenicol', tp: 2, n: 3, nombre: 'Ungüento de cloranfenicol', ff: 'Ungüento',
  uso: 'Impétigo', lote: 100, u: 'g',
  ing: [
    { id: 'cloranfenicol', q: 1, u: 'g', fn: ['activo'] },
    { id: 'unguentoBlanco', u: 'g', csp: 'calc', fn: ['base'] },
  ],
  pasos: [
    { q: '¿Qué le hacés al cloranfenicol antes de incorporarlo?', ok: 'Pulverizarlo', no: ['Disolverlo en agua', 'Fundirlo', 'Nada'], por: 'Se incorpora homogeneizado y previamente pulverizado. En suspensión, la partícula debe ser muy fina (≤ 50 µm, U2).', esc: { rec: 'mortero', color: '#f4f1e6', nivel: 0.2 } },
    { q: '¿En qué momento lo incorporás al ungüento blanco?', ok: 'Con el ungüento ya enfriado', no: ['Durante la fusión de la cera', 'Con el ungüento a 90 °C', 'Antes de preparar el ungüento'], por: 'Se incorpora al ungüento blanco una vez enfriado. U2: el calor, lo más bajo posible, y lo sensible al final.', esc: { rec: 'plancha', color: '#f1ede0', nivel: 0.5 } },
    { q: 'Al probarlo sobre la mano notás grumos. ¿Qué hacés?', ok: 'Pasarlo con espátula a un mortero y triturar hasta eliminarlos', no: ['Calentarlo hasta que se disuelvan', 'Agregar agua', 'Envasarlo igual'], por: 'Si tiene grumos, se coloca en un mortero con espátula y se tritura hasta eliminarlos.' },
  ],
  envase: ENV_POMADA,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

{
  id: 'tp2-coldcream', tp: 2, n: 4, nombre: 'Pomada de agua de rosas', sin: 'Cerato de agua de rosas, cold cream, FA VI', ff: 'Cerato (emulsión múltiple)',
  uso: 'Refrescante y emoliente', lote: 100, u: 'g',
  ing: [
    { id: 'ceraBlanca', q: 15, u: 'g', fn: ['consistencia', 'base'] },
    { id: 'esperma', q: 12, u: 'g', fn: ['consistencia', 'base'] },
    { id: 'aceAlmendras', q: 50, u: 'g', fn: ['base', 'vehiculo'] },
    { id: 'borato', q: 0.5, u: 'g', fn: ['formador'] },
    { id: 'aguaRosas', q: 20, u: 'ml', fn: ['vehiculo', 'correctivo'] },
    { id: 'benjui', q: 2.5, u: 'ml', fn: ['correctivo'] },
    { id: 'espRosas', u: 'gotas', fn: ['correctivo'] },
  ],
  pasos: [
    { q: '¿Cómo se prepara el agua de rosas?', ok: 'Esencia en talco, agua a 35–40 °C, reposo 12 h agitando y filtrar', no: ['Hervir pétalos de rosa en agua', 'Disolver la esencia en alcohol y diluir', 'Mezclar esencia y agua fría'], por: 'Esencia de rosas en talco (o caolín o pulpa de papel), agua hervida enfriada a 35–40 °C, reposo 12 h agitando y filtrado.' },
    { q: '¿Qué fundís a baño María?', ok: 'La cera blanca y la esperma de ballena, en trozos pequeños', no: ['El borato con el aceite', 'Todo junto, incluida el agua de rosas', 'Solo el aceite de almendras'], por: 'Se funden en BM la cera y el esperma reducidos a trozos pequeños; después se agrega el aceite.', esc: { rec: 'vaso', color: '#f4efd9', nivel: 0.4, calor: true } },
    { q: '¿Cómo agregás el aceite de almendras?', ok: 'De a poco, agitando vigorosamente sin parar', no: ['Todo junto y dejar reposar', 'Frío y sin agitar', 'Después de enfriar la cera'], por: 'Nunca se deja de agitar, porque se forman grumos. Vaso de precipitados con varilla de vidrio.', esc: { rec: 'vaso', color: '#efe5b8', nivel: 0.7, calor: true } },
    { tipo: 'temp', q: 'La U2 (procedimiento FA VI) dice a qué temperatura llevar la mezcla fundida antes de pasarla al mortero. ¿Cuál?', rango: [48, 52], por: 'FA VI: se calienta la mezcla a 50 °C y se transfiere a un mortero calentado a la misma temperatura.' },
    { q: '¿Qué hacés con el borato de sodio?', ok: 'Disolverlo en el agua de rosas y verterlo poco a poco sobre la mezcla fundida, agitando', no: ['Agregarlo en polvo sobre la cera', 'Disolverlo en el aceite', 'Agregarlo al final en frío'], por: 'El borato se disuelve en el agua de rosas y esa solución se vierte de a poco sobre lo fundido, agitando siempre.', esc: { rec: 'mortero', color: '#f3eee0', nivel: 0.75 } },
    { q: '¿Qué entra al final?', ok: 'La tintura de benjuí y la esencia de rosas mezcladas, agitando hasta enfriar', no: ['El borato', 'La cera', 'Un conservante'], por: 'Por último la tintura de benjuí y la esencia mezcladas, y se agita hasta que la masa se enfríe y quede homogénea. Las esencias, siempre al final.' },
    { q: '¿Qué tipo de emulsión es?', ok: 'Triple O/W/O, que en conjunto sigue siendo W/O', no: ['O/W simple', 'W/O simple sin jabón', 'Una suspensión'], por: 'El borato forma jabones alcalinos O/W con los ácidos grasos libres, pero no alcanza: faltan ácidos (no álcali). Queda O/W/O englobada en aceite, y sigue siendo W/O.' },
    { q: '¿Por qué es refrescante?', ok: 'La acidez de la piel rompe la emulsión y el agua se evapora rápido', no: ['Porque tiene mentol', 'Porque es anhidra', 'Porque tiene alcohol'], por: 'Es inestable: en contacto con la piel ácida se rompe y el agua se pierde rápido por evaporación. El borato aumenta el poder refrescante.' },
  ],
  envase: ENV_POMADA,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

/* ══ TPL 3 · Pomadas II ══════════════════════════════════════════════════ */

{
  id: 'tp3-diadermina', tp: 3, n: 1, nombre: 'Pomada de estearato de amonio', sin: 'Diadermina, FA VI', ff: 'Pomada emulsionada',
  uso: 'Emoliente, base de otras pomadas', lote: 100, u: 'g',
  ing: [
    { id: 'acEstearico', q: 17, u: 'g', fn: ['formador', 'consistencia'] },
    { id: 'glicerina', q: 70, u: 'g', fn: ['humectante', 'vehiculo'] },
    { id: 'nh3', q: 3.5, u: 'g', fn: ['formador', 'neutralizante'] },
    { id: 'agua', u: 'g', csp: 'calc', fn: ['vehiculo'] },
  ],
  pasos: [
    { q: '¿Qué ponés a baño María?', ok: 'El ácido esteárico, la glicerina y 9,5 ml de agua, hasta fundir el esteárico', no: ['El amoníaco con el agua', 'Solo el ácido esteárico, en seco', 'Todo junto, amoníaco incluido'], por: 'Se calientan esteárico, glicerina y 9,5 ml de agua hasta fundir por completo el ácido esteárico.', esc: { rec: 'vaso', color: '#f3f0e4', nivel: 0.6, calor: true } },
    { q: '¿Cómo agregás el amoníaco?', ok: 'Poco a poco, manteniendo calor y agitación, hasta masa neutra a la fenolftaleína', no: ['Todo de golpe en frío', 'Hasta pH 3', 'Después de retirar del BM'], por: 'El amoníaco neutraliza el ácido esteárico y forma estearato de amonio: el emulgente se forma en el momento.', esc: { rec: 'vaso', color: '#f7f5ee', nivel: 0.65, calor: true } },
    { q: '¿Qué hacés al retirar del baño María?', ok: 'Triturar continuamente hasta enfriar y obtener una masa blanca homogénea', no: ['Dejarla enfriar quieta', 'Agregar vaselina', 'Filtrar en caliente'], por: 'Se tritura sin parar hasta enfriar; si hace falta, se completa con agua hasta 100 g.', esc: { rec: 'mortero', color: '#fbfaf6', nivel: 0.6 } },
    { q: 'El ácido esteárico con una base que forma el jabón en el momento es el método…', ok: 'Del jabón naciente', no: ['De la goma seca', 'Del frasco', 'De la cuña orientada'], por: 'U1: en el jabón naciente el ácido graso reacciona con una base y forma el emulgente in situ.' },
  ],
  envase: ENV_POMADA,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo. U2: se conserva en recipientes de cierre perfecto y al abrigo de la luz.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

{
  id: 'tp3-antipsorica', tp: 3, n: 2, nombre: 'Pomada antipsórica', sin: 'Pomada de Helmerich, FA VI', ff: 'Pomada',
  uso: 'Enfermedades cutáneas. Parasiticida', lote: 100, u: 'g',
  ing: [
    { id: 'azufre', q: 20, u: 'g', fn: ['activo'] },
    { id: 'carbK', q: 10, u: 'g', fn: ['activo', 'formador'] },
    { id: 'agua', q: 10, u: 'g', fn: ['vehiculo'] },
    { id: 'lanolina', q: 30, u: 'g', fn: ['base', 'emulgente'] },
    { id: 'vasSolida', q: 30, u: 'g', fn: ['base'] },
  ],
  pasos: [
    { q: '¿Qué hacés primero?', ok: 'Disolver el carbonato de potasio en el agua caliente y añadir el azufre', no: ['Mezclar el azufre con la vaselina fundida', 'Fundir todo junto', 'Disolver el azufre en agua fría'], por: 'Se disuelve el carbonato en agua caliente y se le añade el azufre.', esc: { rec: 'mortero', color: '#e9dc7a', nivel: 0.35 } },
    { q: '¿Y por otro lado?', ok: 'Fundir la lanolina y la vaselina', no: ['Emulsionar con Tween', 'Calentar el azufre', 'Nada más'], por: 'Aparte se funden lanolina y vaselina.', esc: { rec: 'vaso', color: '#efe3b8', nivel: 0.5, calor: true } },
    { q: '¿Cómo las unís?', ok: 'Agregar la mezcla grasa sobre la anterior, triturando hasta homogéneo', no: ['Agregar el azufre sobre la grasa', 'Batir en frío sin triturar', 'Filtrar'], por: 'La grasa fundida se agrega sobre la mezcla de azufre y se tritura hasta obtener un producto homogéneo.', esc: { rec: 'mortero', color: '#ece0a2', nivel: 0.7 } },
    { q: 'Según la U2, ¿por qué método se prepara?', ok: 'Por intermedio', no: ['Por disolución', 'Por mezcla con excipiente sólido', 'Por combinación química'], por: 'U2: la antipsórica y la iodoiodurada se preparan por intermedio.' },
  ],
  envase: ENV_POMADA,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo.' },
  controles: { si: [...SEMISOLIDO, 'azufre'], por: POR_SEMI + ' Además es codificada con control específico: azufre entre 18,5 y 21,5 % P/P.' },
},

{
  id: 'tp3-platsul', tp: 3, n: 3, nombre: 'Pomada antibiótica reconstituyente', sin: 'Tipo Platsul®', ff: 'Pomada',
  uso: 'Cicatrizante en quemaduras, queroplástica', lote: 100, u: 'g',
  ing: [
    { id: 'sulfaPlata', q: 1, u: 'g', fn: ['activo'] },
    { id: 'vitA', q: 248000, u: 'ui', fn: ['activo'] },
    { id: 'lidocaina', q: 0.66, u: 'g', fn: ['activo'] },
    { id: 'aCetilico', q: 0.5, u: 'g', fn: ['consistencia', 'emulgente'] },
    { id: 'aEstearilico', q: 0.5, u: 'g', fn: ['consistencia', 'emulgente'] },
    { id: 'lss', q: 1, u: 'g', fn: ['emulgente'] },
    { id: 'propilen', q: 1, u: 'ml', fn: ['humectante'] },
    { id: 'glicerina', q: 1, u: 'ml', fn: ['humectante', 'interponente'] },
    { id: 'nipagin', q: 0.01, u: 'g', fn: ['conservante'] },
    { id: 'nipasol', q: 0.02, u: 'g', fn: ['conservante'] },
    { id: 'vasSolida', u: 'g', csp: 'completar', fn: ['base'] },
  ],
  pasos: [
    { q: '¿Qué hacés primero en el mortero?', ok: 'Triturar y homogeneizar los polvos', no: ['Fundir la vaselina', 'Disolver todo en agua', 'Agregar la vaselina a los polvos'], por: 'Se colocan los polvos en el mortero, se trituran y se homogeneizan.', esc: { rec: 'mortero', color: '#eeeae0', nivel: 0.25 } },
    { q: '¿Con qué humectás los polvos?', ok: 'Con propilenglicol y laurilsulfato, y morterear', no: ['Con vaselina líquida', 'Con alcohol 96°', 'Con agua caliente'], por: 'Se humectan con propilenglicol y laurilsulfato (tensioactivo humectante) y se morterea.' },
    { q: '¿Qué agregás después?', ok: 'La glicerina, hasta obtener una pasta', no: ['La vaselina', 'Los alcoholes grasos sólidos', 'Agua'], por: 'Se añade la glicerina hasta formar una pasta.', esc: { rec: 'mortero', color: '#ebe6d8', nivel: 0.35 } },
    { q: '¿Qué fundís aparte a baño María?', ok: 'Los alcoholes cetílico y estearílico', no: ['La vaselina y la lanolina', 'La sulfadiazina', 'Los parabenos'], por: 'Los alcoholes cetílico y estearílico se funden a BM.', esc: { rec: 'vaso', color: '#f5f2e8', nivel: 0.2, calor: true } },
    { q: '¿Cómo los unís?', ok: 'Verterlos a la pasta poco a poco, sin dejar de malaxar', no: ['Toda la pasta sobre los alcoholes', 'De golpe y sin agitar', 'Después de enfriarlos'], por: 'Se vierten poco a poco sin dejar de malaxar con el pilón. Por último, la vaselina.', esc: { rec: 'mortero', color: '#efebdf', nivel: 0.6 } },
  ],
  envase: ENV_POMADA,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo. U2: si se aplicara sobre grandes quemaduras abiertas, debería ser estéril y prepararse en ambiente aséptico.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

{
  id: 'tp3-hipoglos', tp: 3, n: 4, nombre: 'Pomada reconstituyente', sin: 'Tipo Hipoglós®', ff: 'Pomada (A/O)',
  uso: 'Antiséptico y cicatrizante. Paspaduras y dermatitis del pañal', lote: 100, u: 'g',
  ing: [
    { id: 'aceHigPeces', q: 8, u: 'g', fn: ['activo'] },
    { id: 'aceBacalao', q: 2, u: 'g', fn: ['activo'] },
    { id: 'bencetonio', q: 0.01, u: 'g', fn: ['antiseptico', 'conservante'] },
    { id: 'acBorico', q: 2, u: 'g', fn: ['antiseptico'] },
    { id: 'zno', q: 15, u: 'g', fn: ['polvo', 'activo'] },
    { id: 'lanolina', q: 25, u: 'g', fn: ['base', 'emulgente'] },
    { id: 'vasSolida', q: 27, u: 'g', fn: ['base'] },
    { id: 'span', q: 1, u: 'g', fn: ['emulgente'], nota: 'El Rp dice Tween; el práctico prefiere Span 80 si lo hay' },
    { id: 'talco', q: 15, u: 'g', fn: ['polvo'] },
    { id: 'vainillina', q: 0.03, u: 'g', fn: ['correctivo'] },
    { id: 'agua', u: 'g', csp: 'calc', fn: ['vehiculo'] },
  ],
  pasos: [
    { q: '¿Cómo preparás el ácido bórico?', ok: 'Solubilizarlo en unos mililitros de agua tibia', no: ['Mezclarlo en polvo con la vaselina', 'Disolverlo en el aceite', 'Fundirlo'], por: 'Se solubiliza en unos ml de agua tibia.', esc: { rec: 'vaso', color: '#e6edf0', nivel: 0.2 } },
    { q: '¿Qué hacés con los aceites de hígado?', ok: 'Emulsionarlos con el emulgente', no: ['Fundirlos con la lanolina', 'Mezclarlos con el talco en seco', 'Agregarlos al final sin emulsionar'], por: 'Se emulsionan el aceite de peces y el de bacalao con el emulgente.' },
    { q: '¿Por qué el práctico prefiere Span 80 antes que Tween?', ok: 'Span es no iónico y lipofílico, apropiado para una pomada A/O', no: ['Tween es catiónico', 'Span es más hidrofílico', 'Tween no es emulgente'], por: 'Para A/O conviene un emulgente lipofílico (HLB bajo). El Tween solo es demasiado hidrofílico para estabilizar una A/O.' },
    { q: '¿Qué mezclás en el mortero?', ok: 'Cloruro de bencetonio, óxido de cinc y talco', no: ['La lanolina con la vaselina', 'La vainillina con el ácido bórico', 'Solo el ZnO'], por: 'En el mortero van bencetonio, ZnO y talco; luego se incorporan la solución bórica y la emulsión hasta una pasta.', esc: { rec: 'mortero', color: '#f1efe6', nivel: 0.35 } },
    { q: '¿Cómo entra la base de vaselina y lanolina?', ok: 'Previamente fundida y tibia, de manera gradual, mezclando', no: ['Fría y de golpe', 'Hirviendo', 'Antes que los polvos'], por: 'La base vaselina-lanolina se funde, se deja tibia y se incorpora gradualmente hasta homogeneizar.', esc: { rec: 'mortero', color: '#f0e9cf', nivel: 0.7 } },
    { q: '¿Cuándo y cómo va la vainillina?', ok: 'Al final, disuelta en alcohol', no: ['Al principio con los polvos', 'Disuelta en la solución de ácido bórico', 'Fundida con la lanolina'], por: 'Cuando el preparado está casi terminado, se incorpora la vainillina disuelta en alcohol. Los aromas van al final.' },
  ],
  envase: ENV_POMADA,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

{
  id: 'tp3-atomo', tp: 3, n: 5, nombre: 'Pomada antiinflamatoria', sin: 'Tipo Átomo Desinflamante®', ff: 'Pomada',
  uso: 'Rubefaciente y anestésico local: esguinces, torceduras, mialgias, en masajes', lote: 100, u: 'g',
  ing: [
    { id: 'salAmilo', q: 2.2, u: 'g', fn: ['activo'] },
    { id: 'alcanfor', q: 2, u: 'g', fn: ['activo'] },
    { id: 'mentol', q: 1.3, u: 'g', fn: ['activo'] },
    { id: 'terpineol', q: 2, u: 'g', fn: ['activo'] },
    { id: 'eucaliptol', q: 1.1, u: 'g', fn: ['activo'] },
    { id: 'guayacol', q: 0.35, u: 'g', fn: ['activo'] },
    { id: 'nipagin', q: 0.16, u: 'g', fn: ['conservante'] },
    { id: 'acEstearico', q: 3.6, u: 'g', fn: ['consistencia'] },
    { id: 'carbowax', q: 13.6, u: 'g', fn: ['base', 'consistencia'] },
    { id: 'vasSolida', u: 'g', csp: 'calc', fn: ['base'] },
  ],
  pasos: [
    { q: '¿Qué fundís a baño María?', ok: 'El ácido esteárico, el Carbowax y la vaselina', no: ['Las esencias con el mentol', 'Todo junto, esencias incluidas', 'Solo la vaselina'], por: 'Se funden esteárico, Carbowax y vaselina a BM.', esc: { rec: 'vaso', color: '#f3efe0', nivel: 0.6, calor: true } },
    { q: '¿Después?', ok: 'Homogeneizar agitando hasta enfriamiento', no: ['Agregar ya las esencias en caliente', 'Dejar enfriar quieto', 'Agregar agua'], por: 'Se homogeneiza sin dejar de agitar hasta enfriar.', esc: { rec: 'vaso', color: '#f1ede2', nivel: 0.6 } },
    { q: '¿Por qué las esencias entran recién al enfriar?', ok: 'Porque son volátiles y el calor las pierde', no: ['Porque reaccionan con el Carbowax', 'Porque solidifican', 'Da igual cuándo'], por: 'U2: calor lo más bajo posible y lo más sensible al final. Las esencias son volátiles.' },
    { q: '¿Cómo incorporás el alcanfor?', ok: 'Disuelto en una pequeña porción de alcohol', no: ['Fundido con la vaselina', 'En polvo grueso', 'Disuelto en agua'], por: 'El alcanfor va disuelto en un poco de alcohol, después de las esencias y el metilparabeno.' },
    { q: 'Una pomada con Carbowax NO se envasa en…', ok: 'Plástico', no: ['Vidrio opaco', 'Pomo de aluminio', 'Cualquiera sirve'], por: 'U2: cuando la fórmula contiene Carbowax no se emplea el plástico.' },
  ],
  envase: { ok: ['poteVidrio', 'pomoAl'], por: 'U2: con Carbowax no se usa plástico. Vidrio opaco o pomo de aluminio recubierto.' },
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

{
  id: 'tp3-bases', tp: 3, n: 6, nombre: 'Bases para pomadas A a F', ff: 'Excipientes', teoria: true,
  uso: 'Reconocer el tipo de cada base', lote: 100, u: 'g', ing: [],
  pasos: [
    { q: 'Base A: cera blanca 5 + petrolato blanco 95. ¿Qué tipo es?', ok: 'Hidrocarbonada, anhidra y oclusiva', no: ['De absorción', 'Emulsionada', 'Hidrosoluble'], por: 'Base grasa hidrocarbonada: forma película protectora, disminuye la pérdida de agua, emoliente.' },
    { q: 'Base B: aceite mineral 50 + petrolato 50, comparada con la A…', ok: 'Es más blanda y extensible', no: ['Es más dura', 'Es hidrosoluble', 'Absorbe agua'], por: 'El aceite mineral la hace más blanda y extensible que la A.' },
    { q: 'Base C: colesterol + alcohol estearílico + cera + petrolato. ¿Qué es?', ok: 'Base de absorción: incorpora agua formando A/O', no: ['Hidrocarbonada sin capacidad de absorber agua', 'Emulsión O/W', 'Base hidrosoluble'], por: 'El colesterol es emulgente W/O: la base anhidra absorbe agua y forma A/O.' },
    { q: 'Base D: alcohol cetílico + lanolina + petrolato. ¿Qué componente le permite incorporar agua?', ok: 'La lanolina', no: ['El petrolato', 'El alcohol cetílico solo', 'Ninguno'], por: 'La lanolina permite incorporar agua formando A/O (índice de agua 200 por su colesterol).' },
    { q: 'Base E: alcoholes grasos + NaOH + ácido esteárico + parabenos + agua. ¿Qué es?', ok: 'Base emulsionada, con agua, cercana a una crema', no: ['Base de absorción anhidra', 'Hidrocarbonada', 'Hidrosoluble sin grasa'], por: 'Tiene fase acuosa y oleosa; el NaOH con el esteárico forma el jabón. Vehiculiza activos hidro y liposolubles.' },
    { q: 'Base F: PEG 4000 40 + PEG 400 60. ¿Qué aporta cada PEG?', ok: 'El 4000 da consistencia y el 400 plasticidad', no: ['El 4000 plasticidad y el 400 consistencia', 'Los dos son emulgentes', 'Los dos son conservantes'], por: 'Base hidrosoluble, sin grasa, lavable. El PEG de PM alto es sólido; el de PM bajo es líquido.' },
    { q: '¿Cuál de las seis es la más fácil de lavar con agua?', ok: 'La F, de polietilenglicoles', no: ['La A', 'La C', 'La D'], por: 'Los excipientes hidrófilos (PEG) son lavables, no grasos y no oclusivos.' },
  ],
},

/* ══ TPL 4 · Dermocosmética ══════════════════════════════════════════════ */

{
  id: 'tp4-cremabase', tp: 4, n: 1, nombre: 'Crema base', ff: 'Crema (emulsión)',
  uso: 'Base para formulaciones dermocosméticas', lote: 100, u: 'g',
  ing: [
    { id: 'ceraAuto', q: 20, u: 'g', fn: ['emulgente', 'base'] },
    { id: 'vasLiquida', q: 15, u: 'g', fn: ['base'] },
    { id: 'propilen', q: 4, u: 'ml', fn: ['humectante'] },
    { id: 'nipagin', q: 0.2, u: 'g', fn: ['conservante'] },
    { id: 'nipasol', q: 0.02, u: 'g', fn: ['conservante'] },
    { id: 'agua', u: 'g', csp: 'completar', fn: ['vehiculo'] },
  ],
  pasos: [
    { q: '¿Qué va en la fase oleosa?', ok: 'La cera autoemulsionable con la vaselina líquida', no: ['El propilenglicol con el agua', 'Los conservantes', 'Todo junto'], por: 'Fase oleosa: cera y vaselina líquida, fundidas a BM.', esc: { rec: 'vaso', color: '#f4f0e2', nivel: 0.35, calor: true } },
    { tipo: 'temp', q: '¿A qué temperatura llevás las dos fases?', rango: [70, 75], por: 'Las dos fases a 70–75 °C, y cuando están a la misma temperatura se mezclan.' },
    { q: '¿Qué volcás sobre qué?', ok: 'La fase oleosa sobre la fase acuosa', no: ['La acuosa sobre la oleosa', 'Las dos a un tercer recipiente frío', 'Da igual'], por: 'El práctico indica volcar la fase oleosa sobre la acuosa, con ambas a la misma temperatura.', esc: { rec: 'vaso', color: '#f7f5ee', nivel: 0.75, calor: true } },
    { q: '¿Y después?', ok: 'Batir hasta enfriamiento', no: ['Dejar enfriar quieto', 'Hervir', 'Filtrar'], por: 'Se mezclan y se baten hasta enfriar.', esc: { rec: 'vaso', color: '#fbfaf5', nivel: 0.75 } },
    { q: '¿Cuándo entran los conservantes?', ok: 'Cuando se enfría, previamente mortereados', no: ['Con la fase oleosa caliente', 'En el agua hirviendo', 'No lleva'], por: 'Cuando la crema se enfría se agregan los conservantes, previamente mortereados. Se pueden incorporar fragancias.' },
  ],
  envase: ENV_POMADA,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

{
  id: 'tp4-despigmentante', tp: 4, n: 2, nombre: 'Crema despigmentante', ff: 'Crema',
  uso: 'Aclarado de manchas: melasma, lentigo solar, pecas', lote: 50, u: 'g',
  ing: [
    { id: 'hidroquinona', q: 1.5, u: 'g', fn: ['activo'] },
    { id: 'acGlicolico', q: 5, u: 'g', fn: ['activo'] },
    { id: 'bisulfito', q: 0.75, u: 'g', fn: ['antioxidante'] },
    { id: 'cremaBase', u: 'g', csp: 'calc', fn: ['base', 'vehiculo'] },
  ],
  pasos: [
    { q: '¿Qué pulverizás juntos en el mortero?', ok: 'La hidroquinona con el bisulfito de sodio', no: ['La hidroquinona con el ácido glicólico', 'El bisulfito con la crema base', 'La hidroquinona sola'], por: 'Hidroquinona y bisulfito se pulverizan bien juntos: el bisulfito la protege desde el principio.', esc: { rec: 'mortero', color: '#f1eee4', nivel: 0.2 } },
    { q: '¿Para qué está el bisulfito?', ok: 'Antioxidante: evita que la hidroquinona se oxide y oscurezca la crema', no: ['Es despigmentante', 'Es exfoliante', 'Es conservante antimicrobiano'], por: 'Se agrega siempre con la hidroquinona para que no se oxide.' },
    { q: '¿Qué sigue?', ok: 'Agregar el ácido glicólico y homogeneizar, y por último la crema base', no: ['Agregar la crema base y después calentar', 'Disolver todo en agua', 'Agregar el glicólico al final'], por: 'Se agrega el glicólico, se homogeneiza y por último se incorpora la crema base.', esc: { rec: 'mortero', color: '#f6f3ea', nivel: 0.6 } },
    { q: '¿Qué condición legal tiene?', ok: 'No puede prepararse sin prescripción: la hidroquinona es tóxica celular', no: ['Es de venta libre', 'Solo requiere rótulo de cosmético', 'Solo para uso veterinario'], por: 'Nada que lleve hidroquinona o derivados puede prepararse sin prescripción.' },
  ],
  envase: ENV_POMADA,
  leyendas: { si: ['externo', 'receta'], no: ['agitese', 'interno'], por: 'Lleva hidroquinona: se prepara solo con prescripción.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

{
  id: 'tp4-psoriasis', tp: 4, n: 3, nombre: 'Pomada para la psoriasis', ff: 'Pomada',
  uso: 'Dermatosis inflamatorias y psoriasis, tratamientos cortos', lote: 100, u: 'g',
  ing: [
    { id: 'clobetasol', q: 0.05, u: 'g', fn: ['activo'], nota: '0,05 %' },
    { id: 'acSalicilico', q: 2, u: 'g', fn: ['activo'], nota: '2 %' },
    { id: 'clotrimazol', q: 3, u: 'g', fn: ['activo'], nota: '3 %' },
    { id: 'vasSolida', u: 'g', csp: 'calc', fn: ['base'] },
  ],
  pasos: [
    { q: '¿Cómo se prepara?', ok: 'Pulverizar los polvos y agregar la vaselina poco a poco', no: ['Fundir todo a baño María', 'Emulsionar con agua', 'Disolver los activos en alcohol'], por: 'Se pulverizan los polvos y se agrega poco a poco la vaselina.', esc: { rec: 'plancha', color: '#f2efe6', nivel: 0.5 } },
    { q: '¿Qué aporta el clotrimazol?', ok: 'Acción fungicida', no: ['Acción corticoide', 'Acción queratolítica', 'Es el excipiente'], por: 'Clobetasol: corticoide. Salicílico: analgésico y antiinflamatorio (y queratolítico). Clotrimazol: fungicida.' },
    { q: 'Receta al 0,05 % de clobetasol en 100 g. ¿Cuántos gramos?', ok: '0,05 g', no: ['0,5 g', '5 g', '0,005 g'], por: '0,05 % de 100 g = 0,05 g.' },
  ],
  envase: ENV_POMADA,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo. Con corticoide: solo tratamientos a corto plazo.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

{
  id: 'tp4-ordene', tp: 4, n: 4, nombre: 'Crema de ordeñe', ff: 'Crema (emulsión)',
  uso: 'Piel reseca y agrietada; pequeñas lastimaduras, grietas, irritaciones', lote: 100, u: 'g',
  ing: [
    { id: 'vitA', q: 100000, u: 'ui', fn: ['activo'] },
    { id: 'vitE', q: 100, u: 'ui', fn: ['activo', 'antioxidante'] },
    { id: 'clorhex', q: 0.5, u: 'g', fn: ['antiseptico'] },
    { id: 'vasLiquida', q: 5, u: 'g', fn: ['base'] },
    { id: 'glicerina', q: 5, u: 'g', fn: ['humectante'] },
    { id: 'vasSolida', q: 5, u: 'g', fn: ['base'] },
    { id: 'acEstearico', q: 10, u: 'g', fn: ['formador', 'consistencia'] },
    { id: 'aCetilico', q: 2, u: 'g', fn: ['consistencia', 'emulgente'] },
    { id: 'carbNa', q: 1, u: 'g', fn: ['formador'] },
    { id: 'borato', q: 0.4, u: 'g', fn: ['formador'] },
    { id: 'agua', u: 'g', csp: 'calc', fn: ['vehiculo'] },
  ],
  pasos: [
    { q: 'Preparación (1): ¿qué va en el agua y la glicerina?', ok: 'Carbonato de sodio y borato pulverizados, más la clorhexidina', no: ['Las vitaminas', 'El ácido esteárico', 'La vaselina sólida'], por: 'Se pulverizan carbonato y borato y se disuelven con la clorhexidina en el agua y la glicerina.', esc: { rec: 'vaso', color: '#e9eff1', nivel: 0.55 } },
    { q: 'Preparación (2): ¿qué fundís?', ok: 'La vaselina sólida y el alcohol cetílico', no: ['El borato con el agua', 'La glicerina', 'La clorhexidina'], por: 'Se funden vaselina sólida y alcohol cetílico; fundidos, se disuelven las vitaminas y se agrega el esteárico.', esc: { rec: 'vaso', color: '#f3eed8', nivel: 0.3, calor: true } },
    { q: '¿Dónde disolvés las vitaminas A y E?', ok: 'En la fase grasa fundida', no: ['En el agua con el borato', 'En la glicerina', 'Se agregan en polvo al final'], por: 'Son liposolubles: se disuelven en la vaselina y el alcohol cetílico fundidos.' },
    { q: '¿Cómo las unís?', ok: 'Agitar enérgicamente agregando la (2) sobre la (1)', no: ['La (1) sobre la (2) sin agitar', 'Enfriar las dos por separado y mezclar', 'Filtrar la (1)'], por: 'Agitar enérgicamente agregando 2 en 1: la fase grasa sobre la acuosa.', esc: { rec: 'vaso', color: '#f6f3ea', nivel: 0.75 } },
    { q: 'El ácido esteárico con carbonato y borato forman…', ok: 'Un jabón que actúa de emulgente (jabón naciente)', no: ['Un gel de carbómero', 'Una sal insoluble que precipita', 'Un conservante'], por: 'U1: el ácido graso con una base forma el jabón emulgente in situ.' },
  ],
  envase: ENV_POMADA,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

{
  id: 'tp4-estrias', tp: 4, n: 5, nombre: 'Crema para las estrías', ff: 'Crema',
  uso: 'Tratamiento de estrías', lote: 100, u: 'g',
  ing: [
    { id: 'vitA', q: 0.5, u: 'g', fn: ['activo'], nota: '600.000 UI' },
    { id: 'vitD2', q: 0.002, u: 'g', fn: ['activo'] },
    { id: 'vitE', q: 0.05, u: 'g', fn: ['antioxidante'] },
    { id: 'alantoina', q: 0.25, u: 'g', fn: ['activo'] },
    { id: 'propilen', u: 'cs', fn: ['humectante'] },
    { id: 'fragancia', u: 'gotas', fn: ['correctivo'] },
    { id: 'cremaBase', u: 'g', csp: 'calc', fn: ['base', 'vehiculo'] },
  ],
  pasos: [
    { q: 'La vitamina A viene granulada. ¿Qué hacés?', ok: 'Llevarla a polvo muy fino y vehiculizarla con 1 ml de aceite de almendras', no: ['Disolverla en agua', 'Fundirla', 'Agregarla granulada a la crema'], por: 'Se lleva a polvo muy fino y, si es granulada, se vehiculiza con 1 ml de aceite de almendras.', esc: { rec: 'mortero', color: '#f3e9b7', nivel: 0.2 } },
    { q: '¿Qué sigue?', ok: 'Agregar la alantoína y las demás vitaminas, homogeneizar y humectar con propilenglicol', no: ['Agregar la crema base', 'Agregar la fragancia', 'Calentar a 80 °C'], por: 'Se agregan alantoína y vitaminas, se homogeneiza y se humecta con propilenglicol.', esc: { rec: 'mortero', color: '#f2ecd0', nivel: 0.3 } },
    { q: '¿Qué va al final?', ok: 'La fragancia, después de incorporar la crema base', no: ['El propilenglicol', 'La vitamina A', 'La alantoína'], por: 'Se incorpora la crema base, se homogeneiza y al final se agrega la fragancia.', esc: { rec: 'mortero', color: '#f7f4ea', nivel: 0.7 } },
    { q: '¿Qué función tiene la vitamina E acetato en esta fórmula?', ok: 'Antioxidante', no: ['Regeneradora de epitelios', 'Humectante', 'Vehículo'], por: 'Vit A, D2 y alantoína: regeneradoras de epitelios. Vit E acetato: antioxidante. Propilenglicol: humectante.' },
  ],
  envase: ENV_POMADA,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

{
  id: 'tp4-acne', tp: 4, n: 6, nombre: 'Crema para el acné', ff: 'Crema',
  uso: 'Antiacneica', lote: 100, u: 'g',
  ing: [
    { id: 'acSalicilico', q: 5, u: 'g', fn: ['activo'] },
    { id: 'acRetinoico', q: 0.05, u: 'g', fn: ['activo'] },
    { id: 'cremaBase', u: 'g', csp: 'calc', fn: ['base', 'vehiculo'] },
  ],
  pasos: [
    { q: '¿Cómo se prepara?', ok: 'Pulverizar los polvos e incorporarlos a la crema base', no: ['Disolverlos en agua caliente', 'Fundirlos con la crema', 'Emulsionarlos con Tween'], por: 'Se pulverizan los polvos y luego se incorporan a la crema base.', esc: { rec: 'plancha', color: '#f5f1e3', nivel: 0.5 } },
    { q: '¿Qué función cumple cada activo?', ok: 'Salicílico queratolítico; retinoico exfoliante', no: ['Salicílico exfoliante; retinoico queratolítico', 'Los dos son humectantes', 'Salicílico conservante'], por: 'Ácido salicílico: queratolítico. Ácido retinoico: exfoliante.' },
    { q: 'En acné, el ácido retinoico se usa al 0,05 %. ¿Y en anti-age?', ok: '0,1 – 0,001 %', no: ['5 %', '30 – 50 %', '1 – 2 %'], por: 'Nota del práctico: en acné 0,05 %; en anti-age 0,1–0,001 %.' },
  ],
  envase: ENV_POMADA,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},

{
  id: 'tp4-manos', tp: 4, n: 7, nombre: 'Crema humectante para las manos', ff: 'Crema',
  uso: 'Humectante', lote: 100, u: 'g',
  ing: [
    { id: 'vitA', q: 1, u: 'g', fn: ['activo'] },
    { id: 'urea', q: 5, u: 'g', fn: ['humectante', 'activo'] },
    { id: 'cremaBase', u: 'g', csp: 'calc', fn: ['base', 'vehiculo'] },
  ],
  pasos: [
    { q: '¿Cómo se prepara?', ok: 'Pulverizar los polvos (vitamina A granulada en 1 ml de aceite de almendras) e incorporarlos a la crema base', no: ['Disolver la urea en la crema caliente', 'Fundir la urea', 'Emulsionar con agua'], por: 'Se pulverizan los polvos; si la vitamina A es granulada se vehiculiza en 1 ml de aceite de almendras. Luego, la crema base.', esc: { rec: 'plancha', color: '#f6f2e6', nivel: 0.5 } },
    { q: 'La urea está al 5 %. ¿Qué acción tiene?', ok: 'Humectante (3–5 %)', no: ['Exfoliante', 'Conservante', 'Emulgente'], por: 'Urea 3–5 %: humectante. 30–50 %: exfoliante.' },
    { q: '¿Y si la receta pidiera urea al 40 %?', ok: 'Sería exfoliante', no: ['Seguiría siendo humectante', 'Sería conservante', 'No se puede preparar'], por: 'Del 30 al 50 % la urea es exfoliante.' },
  ],
  envase: ENV_POMADA,
  leyendas: { si: ['externo'], no: ['agitese', 'interno'], por: 'Uso externo.' },
  controles: { si: SEMISOLIDO, por: POR_SEMI },
},
];

export const TPS = [
  { n: 1, nombre: 'Lociones, linimentos y geles' },
  { n: 2, nombre: 'Pastas, ungüentos y ceratos' },
  { n: 3, nombre: 'Pomadas II' },
  { n: 4, nombre: 'Dermocosmética' },
];

export const formula = (id) => FORMULAS.find((f) => f.id === id) || null;

/* ═══════════════════════════════════════════════════════════════════════════
   GALENA — catálogo del laboratorio
   Todo lo que hay en la estantería, las funciones que puede cumplir un
   componente, los envases, las leyendas del rótulo y los controles de calidad.
   Las fórmulas (formulas.js) solo nombran ids de acá.

   La estantería trae distractores A PROPÓSITO: los pares que se confunden en
   el parcial (vaselina líquida / sólida, nipagin / nipasol, ácido bórico /
   borato, Span / Tween, carbonato de sodio / de potasio). Si el juego solo
   mostrara lo que va en la fórmula, buscar no enseñaría nada.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Tipo de frasco: define el dibujo y la categoría de la estantería. */
export const ESTANTE = {
  // ── Polvos ─────────────────────────────────────────────────────────────
  zno:          { n: 'Óxido de cinc', t: 'polvo' },
  talco:        { n: 'Talco', t: 'polvo' },
  almidon:      { n: 'Almidón', t: 'polvo' },
  caolin:       { n: 'Caolín', t: 'polvo' },
  calamina:     { n: 'Calamina', t: 'polvo' },
  azufre:       { n: 'Azufre precipitado', t: 'polvo' },
  mentol:       { n: 'Mentol', t: 'polvo' },
  alcanfor:     { n: 'Alcanfor', t: 'polvo' },
  borato:       { n: 'Borato de sodio', t: 'polvo', ojo: 'No confundir con el ácido bórico' },
  acBorico:     { n: 'Ácido bórico', t: 'polvo', ojo: 'No confundir con el borato de sodio' },
  carbNa:       { n: 'Carbonato de sodio', t: 'polvo' },
  carbK:        { n: 'Carbonato de potasio', t: 'polvo' },
  bisulfito:    { n: 'Bisulfito de sodio', t: 'polvo' },
  nipagin:      { n: 'Metilparabeno (nipagin)', t: 'polvo' },
  nipasol:      { n: 'Propilparabeno (nipasol)', t: 'polvo' },
  urea:         { n: 'Urea', t: 'polvo' },
  alantoina:    { n: 'Alantoína', t: 'polvo' },
  vainillina:   { n: 'Vainillina', t: 'polvo' },
  // ── Gelificantes y polímeros ───────────────────────────────────────────
  carbopol:     { n: 'Carbopol (carbómero)', t: 'polvo' },
  cmc:          { n: 'Carboximetilcelulosa sódica (CMC)', t: 'polvo' },
  mc:           { n: 'Metilcelulosa', t: 'polvo' },
  celMicro:     { n: 'Celulosa microcristalina', t: 'polvo' },
  aerosil:      { n: 'Aerosil (dióxido de silicio)', t: 'polvo' },
  pvp:          { n: 'PVP (Kollidon)', t: 'polvo' },
  magma:        { n: 'Magma de bentonita', t: 'liquido' },
  peg400:       { n: 'PEG 400', t: 'liquido' },
  carbowax:     { n: 'Carbowax 1500 (PEG)', t: 'grasa' },
  // ── Activos ────────────────────────────────────────────────────────────
  cloranfenicol:{ n: 'Cloranfenicol', t: 'activo' },
  lidocaina:    { n: 'Lidocaína clorhidrato', t: 'activo' },
  procaina:     { n: 'Procaína', t: 'activo' },
  sulfaPlata:   { n: 'Sulfadiazina de plata', t: 'activo' },
  hidroquinona: { n: 'Hidroquinona', t: 'activo' },
  acGlicolico:  { n: 'Ácido glicólico 70 %', t: 'liquido' },
  acSalicilico: { n: 'Ácido salicílico', t: 'activo' },
  acRetinoico:  { n: 'Ácido retinoico', t: 'activo' },
  clobetasol:   { n: 'Clobetasol', t: 'activo' },
  clotrimazol:  { n: 'Clotrimazol', t: 'activo' },
  vitA:         { n: 'Vitamina A', t: 'activo' },
  vitD2:        { n: 'Vitamina D2', t: 'activo' },
  vitE:         { n: 'Vitamina E acetato', t: 'liquido' },
  bencetonio:   { n: 'Cloruro de bencetonio', t: 'activo' },
  benzalconio:  { n: 'Cloruro de benzalconio', t: 'activo' },
  clorhex:      { n: 'Clorhexidina gluconato', t: 'liquido' },
  // ── Líquidos ───────────────────────────────────────────────────────────
  agua:         { n: 'Agua destilada', t: 'liquido' },
  aguaCal:      { n: 'Agua de cal', t: 'liquido' },
  aguaRosas:    { n: 'Agua de rosas', t: 'liquido' },
  alcohol70:    { n: 'Alcohol 70°', t: 'liquido' },
  alcohol96:    { n: 'Alcohol 96°', t: 'liquido' },
  glicerina:    { n: 'Glicerina', t: 'liquido' },
  propilen:     { n: 'Propilenglicol', t: 'liquido' },
  sorbitol:     { n: 'Sorbitol', t: 'liquido' },
  tea:          { n: 'Trietanolamina (TEA)', t: 'liquido' },
  nh3:          { n: 'Amoníaco', t: 'liquido' },
  naoh:         { n: 'Hidróxido de sodio', t: 'liquido' },
  acAcetico:    { n: 'Ácido acético', t: 'liquido' },
  trementina:   { n: 'Esencia de trementina', t: 'liquido' },
  espRosas:     { n: 'Esencia de rosas', t: 'liquido' },
  benjui:       { n: 'Tintura de benjuí', t: 'liquido' },
  fragancia:    { n: 'Fragancia', t: 'liquido' },
  salAmilo:     { n: 'Salicilato de amilo', t: 'liquido' },
  salMetilo:    { n: 'Salicilato de metilo', t: 'liquido' },
  terpineol:    { n: 'Terpineol', t: 'liquido' },
  eucaliptol:   { n: 'Eucaliptol', t: 'liquido' },
  guayacol:     { n: 'Guayacol', t: 'liquido' },
  tween:        { n: 'Tween 80', t: 'liquido' },
  span:         { n: 'Span 80', t: 'liquido' },
  // ── Grasas y ceras ─────────────────────────────────────────────────────
  vasSolida:    { n: 'Vaselina sólida', t: 'grasa', ojo: 'La líquida es otro frasco' },
  vasLiquida:   { n: 'Vaselina líquida', t: 'liquido', ojo: 'La sólida es otro frasco' },
  lanolina:     { n: 'Lanolina', t: 'grasa' },
  ceraBlanca:   { n: 'Cera blanca', t: 'grasa' },
  carnauba:     { n: 'Cera de carnauba', t: 'grasa' },
  esperma:      { n: 'Esperma de ballena', t: 'grasa' },
  ceraAuto:     { n: 'Cera autoemulsionable no iónica', t: 'grasa' },
  acEstearico:  { n: 'Ácido esteárico', t: 'grasa' },
  acOleico:     { n: 'Ácido oleico', t: 'liquido' },
  aCetilico:    { n: 'Alcohol cetílico', t: 'grasa' },
  aEstearilico: { n: 'Alcohol estearílico', t: 'grasa' },
  colesterol:   { n: 'Colesterol', t: 'grasa' },
  lss:          { n: 'Laurilsulfato de sodio', t: 'polvo' },
  aceOliva:     { n: 'Aceite de oliva', t: 'liquido' },
  aceAlmendras: { n: 'Aceite de almendras', t: 'liquido' },
  aceRicino:    { n: 'Aceite de ricino', t: 'liquido' },
  aceHigPeces:  { n: 'Aceite de hígado de peces', t: 'liquido' },
  aceBacalao:   { n: 'Aceite de hígado de bacalao', t: 'liquido' },
  // ── Otros ──────────────────────────────────────────────────────────────
  huevo:        { n: 'Huevo', t: 'otro' },
  // ── Preparados de otros prácticos ──────────────────────────────────────
  unguentoBlanco:{ n: 'Ungüento blanco (preparado)', t: 'grasa' },
  cremaBase:    { n: 'Crema base (preparada)', t: 'grasa' },
};

export const CATEGORIAS = [
  { id: 'todo', n: 'Todo' },
  { id: 'polvo', n: 'Polvos' },
  { id: 'liquido', n: 'Líquidos' },
  { id: 'grasa', n: 'Grasas y ceras' },
  { id: 'activo', n: 'Activos' },
  { id: 'otro', n: 'Otros' },
];

/** Funciones que se le pueden asignar a un componente en la receta. */
export const FUNCIONES = {
  activo:       'Principio activo',
  vehiculo:     'Vehículo',
  base:         'Base o excipiente graso',
  consistencia: 'Da consistencia',
  emulgente:    'Emulgente',
  formador:     'Forma el emulgente al reaccionar',
  gelificante:  'Gelificante',
  neutralizante:'Neutralizante (base)',
  suspensor:    'Suspensor o viscosante',
  humectante:   'Humectante',
  interponente: 'Interponente (empasta polvos)',
  conservante:  'Conservante',
  antiseptico:  'Antiséptico',
  antioxidante: 'Antioxidante',
  polvo:        'Polvo protector o absorbente',
  correctivo:   'Correctivo (aroma)',
};

export const ENVASES = {
  frascoAmbar:  { n: 'Frasco de vidrio ámbar con tapa a rosca', forma: 'frasco' },
  gotero:       { n: 'Frasco gotero', forma: 'gotero' },
  potePlastico: { n: 'Pote de plástico con tapa a rosca', forma: 'pote' },
  poteVidrio:   { n: 'Pote de vidrio opaco con tapa a rosca', forma: 'pote' },
  pomoAl:       { n: 'Pomo de aluminio recubierto por dentro', forma: 'pomo' },
  tuboPlastico: { n: 'Tubo de plástico blanco colapsible', forma: 'pomo' },
  sobre:        { n: 'Sobre de papel', forma: 'sobre' },
};

export const LEYENDAS = {
  externo:   'Uso externo',
  agitese:   'Agítese antes de usar',
  receta:    'Venta bajo receta',
  vence6:    'Vencimiento: 6 meses',
  esteril:   'Estéril',
  interno:   'Uso interno',
  heladera:  'Conservar en heladera',
  inflamable:'Inflamable',
};

export const CONTROLES = {
  aspectoLiq:  'Aspecto: partículas extrañas, color, limpidez',
  aspectoNegro:'Aspecto: capa fina sobre superficie negra, placa de vidrio, lupa',
  contenido:   'Control de contenido (no menos de lo del rótulo)',
  hermeticidad:'Hermeticidad del cierre (rotar y dejar tapa abajo)',
  phDirecto:   'pH en forma directa',
  phDisp:      'pH en dispersión al 10 % en agua',
  azufre:      'Valoración de azufre (18,5–21,5 % P/P)',
  esterilidad: 'Ensayo de esterilidad',
};

/** Instrumento de medida según la unidad. */
export const INSTRUMENTOS = {
  balanza: { n: 'Balanza', mide: 'g' },
  probeta: { n: 'Probeta', mide: 'ml' },
  pipeta:  { n: 'Pipeta', mide: 'ml' },
};

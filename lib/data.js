/* =====================================================================
   DONNÉES — Parfums, contraintes, templates de textures
   ===================================================================== */

// ---------- PARFUMS ----------
export const PARFUMS = {
  // FRUITS ROUGES
  framboise:  { label: "Framboise",       famille: "fruit_rouge", forme: "puree", acide: true,  enzyme: false },
  fraise:     { label: "Fraise",          famille: "fruit_rouge", forme: "puree", acide: true,  enzyme: false },
  cassis:     { label: "Cassis",          famille: "fruit_rouge", forme: "puree", acide: true,  enzyme: false },
  mure:       { label: "Mûre",            famille: "fruit_rouge", forme: "puree", acide: true,  enzyme: false },
  myrtille:   { label: "Myrtille",        famille: "fruit_rouge", forme: "puree", acide: true,  enzyme: false },
  groseille:  { label: "Groseille",       famille: "fruit_rouge", forme: "puree", acide: true,  enzyme: false },
  grenade:    { label: "Grenade",         famille: "fruit_rouge", forme: "puree", acide: true,  enzyme: false },
  cerise:     { label: "Cerise",          famille: "fruit_rouge", forme: "puree", acide: true,  enzyme: false },
  // FRUITS À NOYAU
  abricot:    { label: "Abricot",         famille: "fruit_noyau", forme: "puree", acide: true,  enzyme: false },
  peche:      { label: "Pêche",           famille: "fruit_noyau", forme: "puree", acide: true,  enzyme: false },
  prune:      { label: "Prune",           famille: "fruit_noyau", forme: "puree", acide: true,  enzyme: false },
  mirabelle:  { label: "Mirabelle",       famille: "fruit_noyau", forme: "puree", acide: true,  enzyme: false },
  // FRUITS À PÉPINS
  poire:      { label: "Poire",           famille: "fruit_pepin", forme: "puree", acide: false, enzyme: false, peu_acide_ph: true },
  pomme:      { label: "Pomme",           famille: "fruit_pepin", forme: "puree", acide: false, enzyme: false },
  coing:      { label: "Coing",           famille: "fruit_pepin", forme: "puree", acide: true,  enzyme: false },
  raisin:     { label: "Raisin",          famille: "fruit_pepin", forme: "puree", acide: false, enzyme: false },
  // FRUITS EXOTIQUES
  mangue:     { label: "Mangue",          famille: "fruit_exo",   forme: "puree", acide: true,  enzyme: true,  peu_acide_ph: true },
  passion:    { label: "Fruit de la passion", famille: "fruit_exo", forme: "puree", acide: true,  enzyme: false },
  ananas:     { label: "Ananas",          famille: "fruit_exo",   forme: "puree", acide: true,  enzyme: true  },
  kiwi:       { label: "Kiwi",            famille: "fruit_exo",   forme: "puree", acide: true,  enzyme: true  },
  banane:     { label: "Banane",          famille: "fruit_exo",   forme: "puree", acide: false, enzyme: false, peu_acide_ph: true },
  coco:       { label: "Noix de coco (purée)", famille: "fruit_exo", forme: "puree", acide: false, enzyme: false, peu_acide_ph: true },
  litchi:     { label: "Litchi",          famille: "fruit_exo",   forme: "puree", acide: false, enzyme: false, peu_acide_ph: true },
  figue:      { label: "Figue",           famille: "fruit_exo",   forme: "puree", acide: false, enzyme: true,  peu_acide_ph: true },
  fpassion_mangue: { label: "Mangue-passion", famille: "fruit_exo", forme: "puree", acide: true, enzyme: true },
  // AGRUMES
  citron:     { label: "Citron jaune",    famille: "agrume",      forme: "puree", acide: true,  enzyme: false },
  citron_vert:{ label: "Citron vert",     famille: "agrume",      forme: "puree", acide: true,  enzyme: false },
  yuzu:       { label: "Yuzu",            famille: "agrume",      forme: "puree", acide: true,  enzyme: false },
  orange:     { label: "Orange",          famille: "agrume",      forme: "puree", acide: true,  enzyme: false },
  mandarine:  { label: "Mandarine",       famille: "agrume",      forme: "puree", acide: true,  enzyme: false },
  pamplemousse:{ label: "Pamplemousse",   famille: "agrume",      forme: "puree", acide: true,  enzyme: false },
  bergamote:  { label: "Bergamote",       famille: "agrume",      forme: "puree", acide: true,  enzyme: false },
  // LÉGUMES
  rhubarbe:   { label: "Rhubarbe",        famille: "vegetal",     forme: "puree", acide: true,  enzyme: false },
  carotte:    { label: "Carotte",         famille: "vegetal",     forme: "puree", acide: false, enzyme: false },
  betterave:  { label: "Betterave",       famille: "vegetal",     forme: "puree", acide: false, enzyme: false },
  potiron:    { label: "Potiron",         famille: "vegetal",     forme: "puree", acide: false, enzyme: false },
  marron:     { label: "Marron (crème de marron)", famille: "vegetal", forme: "puree", acide: false, enzyme: false },
  // CHOCOLATS
  choc_noir:   { label: "Chocolat noir 70 %",          famille: "chocolat", forme: "couverture", acide: false, enzyme: false, mg: 40 },
  choc_noir64: { label: "Chocolat noir 64 %",          famille: "chocolat", forme: "couverture", acide: false, enzyme: false, mg: 38 },
  choc_lait:   { label: "Chocolat au lait 40 %",       famille: "chocolat", forme: "couverture", acide: false, enzyme: false, mg: 38 },
  choc_blanc:  { label: "Chocolat blanc 35 %",         famille: "chocolat", forme: "couverture", acide: false, enzyme: false, mg: 38 },
  choc_blond:  { label: "Chocolat blond / caramélisé", famille: "chocolat", forme: "couverture", acide: false, enzyme: false, mg: 38 },
  choc_ruby:   { label: "Chocolat ruby",               famille: "chocolat", forme: "couverture", acide: true,  enzyme: false, mg: 36 },
  // PRALINÉS / GIANDUJA
  praline_no: { label: "Praliné noisette 60 %", famille: "praline", forme: "pate", acide: false, enzyme: false },
  praline_am: { label: "Praliné amande 60 %",   famille: "praline", forme: "pate", acide: false, enzyme: false },
  praline_pi: { label: "Praliné pistache",      famille: "praline", forme: "pate", acide: false, enzyme: false },
  praline_pe: { label: "Praliné pécan",         famille: "praline", forme: "pate", acide: false, enzyme: false },
  praline_se: { label: "Praliné sésame",        famille: "praline", forme: "pate", acide: false, enzyme: false },
  gianduja:   { label: "Gianduja",              famille: "praline", forme: "pate", acide: false, enzyme: false },
  gianduja_lait: { label: "Gianduja lait",      famille: "praline", forme: "pate", acide: false, enzyme: false },
  // PÂTES DE FRUITS SECS
  pate_noisette:  { label: "Pâte de noisette pure 100 %",  famille: "fruit_sec", forme: "pate", acide: false, enzyme: false },
  pate_amande:    { label: "Pâte d'amande pure 100 %",     famille: "fruit_sec", forme: "pate", acide: false, enzyme: false },
  pate_pistache:  { label: "Pâte de pistache pure 100 %",  famille: "fruit_sec", forme: "pate", acide: false, enzyme: false },
  pate_pecan:     { label: "Pâte de pécan",                famille: "fruit_sec", forme: "pate", acide: false, enzyme: false },
  pate_macadamia: { label: "Pâte de macadamia",            famille: "fruit_sec", forme: "pate", acide: false, enzyme: false },
  pate_sesame:    { label: "Pâte de sésame (tahini)",      famille: "fruit_sec", forme: "pate", acide: false, enzyme: false },
  pate_cacahuete: { label: "Pâte de cacahuète",            famille: "fruit_sec", forme: "pate", acide: false, enzyme: false },
  // ÉPICES (infusion)
  vanille:    { label: "Vanille (gousse)",       famille: "epice", forme: "infusion", acide: false, enzyme: false },
  cannelle:   { label: "Cannelle",                famille: "epice", forme: "infusion", acide: false, enzyme: false },
  cardamome:  { label: "Cardamome verte",         famille: "epice", forme: "infusion", acide: false, enzyme: false },
  gingembre:  { label: "Gingembre frais",         famille: "epice", forme: "infusion", acide: false, enzyme: false },
  tonka:      { label: "Fève tonka",              famille: "epice", forme: "infusion", acide: false, enzyme: false },
  anis:       { label: "Anis étoilé / badiane",   famille: "epice", forme: "infusion", acide: false, enzyme: false },
  safran:     { label: "Safran",                  famille: "epice", forme: "infusion", acide: false, enzyme: false },
  poivre_t:   { label: "Poivre Timut",            famille: "epice", forme: "infusion", acide: false, enzyme: false },
  reglisse:   { label: "Réglisse",                famille: "epice", forme: "infusion", acide: false, enzyme: false },
  muscade:    { label: "Noix de muscade",         famille: "epice", forme: "infusion", acide: false, enzyme: false },
  fleur_oranger:{ label: "Fleur d'oranger",       famille: "epice", forme: "infusion", acide: false, enzyme: false },
  rose:       { label: "Eau de rose",             famille: "epice", forme: "infusion", acide: false, enzyme: false },
  basilic:    { label: "Basilic",                 famille: "epice", forme: "infusion", acide: false, enzyme: false },
  verveine:   { label: "Verveine",                famille: "epice", forme: "infusion", acide: false, enzyme: false },
  menthe:     { label: "Menthe fraîche",          famille: "epice", forme: "infusion", acide: false, enzyme: false },
  lavande:    { label: "Lavande",                 famille: "epice", forme: "infusion", acide: false, enzyme: false },
  // FÈVES / THÉS / CACAO
  cafe:        { label: "Café",                       famille: "infusion", forme: "infusion", acide: false, enzyme: false },
  cafe_grain:  { label: "Café (grains torréfiés)",    famille: "infusion", forme: "infusion", acide: false, enzyme: false },
  the_matcha:  { label: "Thé matcha",                 famille: "infusion", forme: "poudre",   acide: false, enzyme: false },
  the_earl:    { label: "Thé Earl Grey",              famille: "infusion", forme: "infusion", acide: false, enzyme: false },
  the_jasmin:  { label: "Thé au jasmin",              famille: "infusion", forme: "infusion", acide: false, enzyme: false },
  the_vert:    { label: "Thé vert sencha",            famille: "infusion", forme: "infusion", acide: false, enzyme: false },
  the_noir:    { label: "Thé noir",                   famille: "infusion", forme: "infusion", acide: false, enzyme: false },
  chai:        { label: "Mélange chaï",               famille: "infusion", forme: "infusion", acide: false, enzyme: false },
  cacao_pdr:   { label: "Cacao en poudre 100 %",      famille: "infusion", forme: "poudre",   acide: false, enzyme: false },
  // CARAMEL
  caramel:    { label: "Caramel",                  famille: "caramel", forme: "pate", acide: false, enzyme: false },
  // Parfum neutre — utilisé par les templates sans ingrédient principal variable
  nature:     { label: "",                          famille: "neutre",  forme: "nature", acide: false, enzyme: false }
};

// ---------- CONTRAINTES ----------
export const CONTRAINTES = [
  { id: "vegan",   label: "Vegan",        desc: "Sans œuf, lait, gélatine, miel" },
  { id: "lactose", label: "Sans lactose", desc: "Sans lait, beurre, crème animale" },
  { id: "gluten",  label: "Sans gluten",  desc: "Substitutions farines + gomme guar" },
  { id: "igbas",     label: "IG bas",       desc: "Sucre de coco, oligofructose, érythritol" },
  { id: "bien_etre", label: "Bien-être",   desc: "IG bas + oléagineux + fibres + sans laitiers" }
];

// ---------- LIBELLÉS DE FAMILLES (pour groupement dans le sélecteur) ----------
export const FAMILLE_LABELS = {
  fruit_rouge: "Fruits rouges",
  fruit_noyau: "Fruits à noyau",
  fruit_pepin: "Fruits à pépins",
  fruit_exo:   "Fruits exotiques",
  agrume:      "Agrumes",
  vegetal:     "Légumes / racines",
  chocolat:    "Chocolats",
  praline:     "Pralinés / Gianduja",
  fruit_sec:   "Pâtes de fruits secs",
  epice:       "Épices et fleurs",
  infusion:    "Fèves / thés / cacao",
  caramel:     "Caramel"
};
export const FAMILLE_ORDER = ["fruit_rouge","fruit_noyau","fruit_pepin","fruit_exo","agrume","vegetal","chocolat","praline","fruit_sec","epice","infusion","caramel"];

// ---------- INGRÉDIENTS FONCTIONNELS ----------
// Référence technique utilisée par les templates V2.
// Chaque entrée : label (affiché), role, dose (guide), note (technique, usage).
export const INGREDIENTS = {
  // ── GÉLIFIANTS ──────────────────────────────────────────────────────────────
  pectine_nh: {
    label: 'Pectine NH',
    role: 'gélifiant',
    dose: '0.8–1.2 %',
    note: 'Thermoreversible. Nécessite pH < 3.8 et calcium. Activer à 85 °C. Ajouter acide tartrique sur fruits peu acides.',
  },
  pectine_x58: {
    label: 'Pectine X58',
    role: 'gélifiant',
    dose: '1.0–1.5 %',
    note: 'Gélifie sans acide ni calcium libre. Idéale lait végétal et crémeux vegan.',
  },
  gelatine: {
    label: 'Gélatine (feuilles 200 Bloom)',
    role: 'gélifiant',
    dose: '1.5–2.5 %',
    note: 'Thermoreversible. Faire fondre dans liquide à 60–70 °C. Remplacer par agar × 0.4 en version vegan.',
  },
  agar: {
    label: 'Agar-agar',
    role: 'gélifiant',
    dose: '0.6–1.0 %',
    note: 'Gel irréversible après refroidissement à 45 °C. Bouillir 2 min. Texture moins élastique que gélatine.',
  },
  carraghenane: {
    label: 'Carraghénane kappa',
    role: 'gélifiant',
    dose: '0.3–0.6 %',
    note: 'Gel élastique en milieu laitier ou lait végétal riche en potassium. Bouillir 2 min.',
  },
  gel_chia: {
    label: 'Gel de chia (5 % chia)',
    role: 'gélifiant',
    dose: '10–15 % (préparé à l\'avance)',
    note: 'Hydrater 5 g chia dans 95 g eau froide, 30 min. Texture mucilagineuse. Pour crémeux vegan bien-être.',
  },
  // ── ÉPAISSISSANTS / STABILISANTS / FIBRES ───────────────────────────────────
  gomme_xanthane: {
    label: 'Gomme xanthane',
    role: 'épaississant',
    dose: '0.1–0.3 %',
    note: 'Liant à froid. Disperser dans matière grasse avant incorporation pour éviter grumeaux.',
  },
  gomme_guar: {
    label: 'Gomme de guar',
    role: 'épaississant',
    dose: '0.2–0.5 %',
    note: 'Épaissit à froid. Moins visqueux que xanthane à dose égale. Sans gluten.',
  },
  inuline: {
    label: 'Inuline / oligofructose',
    role: 'fibre prébiotique',
    dose: '2–5 %',
    note: 'IG ≈ 0. Apport crémeux léger. Renforce texture en basse teneur en sucre. Bien-être / IG bas.',
  },
  psyllium: {
    label: 'Psyllium (enveloppe)',
    role: 'fibre épaississante',
    dose: '1–3 %',
    note: 'Gonfle dans l\'eau. Texture filandreuse si surdosé. Pour bien-être — augmente satiété.',
  },
  amidon_mais: {
    label: 'Amidon de maïs (Maïzena)',
    role: 'épaississant',
    dose: '3–6 %',
    note: 'Épaissit à 85 °C. Texture neutre. Base crémeux et sauces cuites.',
  },
  arrow_root: {
    label: 'Arrow-root',
    role: 'épaississant',
    dose: '3–5 %',
    note: 'Épaissit à 75 °C. Texture plus lumineuse et moins opaque que Maïzena. Sans gluten.',
  },
  fecule_pdt: {
    label: 'Fécule de pomme de terre',
    role: 'épaississant',
    dose: '2–5 %',
    note: 'Épaissit à 70 °C. Texture légèrement plus collante que Maïzena. Éviter surchauffe (se liquéfie).',
  },
  fibres_pois: {
    label: 'Fibres de pois',
    role: 'fibre texturante',
    dose: '2–4 %',
    note: 'Fibre soluble et insoluble. IG bas. Légère couleur beige. Bien-être.',
  },
  // ── PROTÉINES / ÉMULSIFIANTS ─────────────────────────────────────────────────
  lecithine: {
    label: 'Lécithine de tournesol',
    role: 'émulsifiant',
    dose: '0.3–0.5 %',
    note: 'Stabilise eau/matière grasse. Améliore foisonnement sans lactoprotéines. Pour mousses SL/vegan.',
  },
  blanc_sec: {
    label: 'Blanc d\'œuf en poudre (albumine)',
    role: 'protéine foisonnante',
    dose: '1–2 %',
    note: 'Foisonnement sans eau libre. Mousse stable sans crème fraîche. Pour mousses sans lactose.',
  },
  proteines_pois: {
    label: 'Protéines de pois isolées',
    role: 'protéine structurante',
    dose: '2–4 %',
    note: 'Alternative vegan à albumine. Léger goût de pois si surdosé. Combiner avec lécithine.',
  },
  aquafaba: {
    label: 'Aquafaba (eau de pois chiches)',
    role: 'agent foisonnant vegan',
    dose: '30–50 g par blanc remplacé',
    note: 'Monter en neige ferme. Ajouter crème de tartre 0.1 % pour stabiliser. Pour biscuit vegan.',
  },
  proteines_riz: {
    label: 'Protéines de riz',
    role: 'protéine structurante',
    dose: '2–4 %',
    note: 'Hypoallergénique. Texture légèrement sableuse si surdosé. Bien-être et vegan.',
  },
  // ── SUCRANTS ALTERNATIFS ──────────────────────────────────────────────────────
  sucre_coco: {
    label: 'Sucre de coco',
    role: 'sucrant IG bas',
    dose: '1:1 saccharose',
    note: 'IG ≈ 35. Léger goût caramélisé. Coloration légèrement plus foncée en cuisson.',
  },
  sirop_agave: {
    label: 'Sirop d\'agave',
    role: 'sucrant liquide',
    dose: '0.75:1 saccharose (plus sucrant)',
    note: 'IG ≈ 15–19. Haute teneur en fructose. Hygroscopique — réduire légèrement la teneur en eau.',
  },
  sirop_erable: {
    label: 'Sirop d\'érable',
    role: 'sucrant aromatisant',
    dose: '0.8:1 saccharose',
    note: 'IG ≈ 54. Arôme marqué. Contient minéraux. Bien-être et vegan.',
  },
  erythritol: {
    label: 'Érythritol',
    role: 'sucrant IG 0',
    dose: '1.3:1 saccharose (moins sucrant)',
    note: 'IG = 0. Sensation de fraîcheur en bouche (endothermique). Ne pas dépasser 10–12 % formule.',
  },
  dattes: {
    label: 'Pâte de dattes',
    role: 'sucrant naturel',
    dose: '15–25 %',
    note: 'IG ≈ 42–55. Humectant. Apporte moelleux et liant naturel. Bien-être et vegan.',
  },
  // ── MATIÈRES GRASSES ──────────────────────────────────────────────────────────
  huile_coco: {
    label: 'Huile de coco vierge',
    role: 'matière grasse structurante',
    dose: '4–8 %',
    note: 'Solide sous 25 °C. Stabilise mousses SL/vegan. Léger arôme coco si non désodorisée.',
  },
  beurre_cacao: {
    label: 'Beurre de cacao',
    role: 'matière grasse cristallisante',
    dose: '2–5 %',
    note: 'Cristallisation lente. Texture fondante et brillante. Sans arôme parasite.',
  },
  puree_cajou: {
    label: 'Purée de cajou',
    role: 'matière grasse végétale',
    dose: '8–15 %',
    note: 'Onctuosité neutre. Remplace partiellement crème animale en version bien-être et vegan.',
  },
  boisson_avoine: {
    label: 'Boisson d\'avoine (barista)',
    role: 'base liquide végétale',
    dose: 'Remplace lait 1:1',
    note: 'Version barista (émulsifiée). Léger goût d\'avoine. Préférer pour bien-être (fibres bêta-glucane).',
  },
  // ── ACTIVATEURS ───────────────────────────────────────────────────────────────
  acide_tartrique: {
    label: 'Acide tartrique',
    role: 'activateur gélifiant',
    dose: '0.1–0.3 %',
    note: 'Abaisse pH pour activer pectine NH sur fruits peu acides (coco, banane, poire, litchi, figue, mangue).',
  },
  acide_citrique: {
    label: 'Acide citrique',
    role: 'activateur / conservateur',
    dose: '0.1–0.2 %',
    note: 'Acidification douce. Renforce arôme fruit. Abaisse pH sur purées peu acides.',
  },
};

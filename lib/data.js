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

// ---------- INGRÉDIENTS GLACÉS (POD / PAC / MG / MSNG / lactose) ----------
// Utilisés par les templates glaces/sorbets et le module de validation.
// pod      = Pouvoir Sucrant (saccharose = 100)
// pac      = Pouvoir Anti-Cristallisant (saccharose = 100)
// mg_g     = Matière Grasse pour 100 g de l'ingrédient
// msng_g   = Matière Sèche Non Grasse pour 100 g (protéines + lactose + minéraux)
// lactose_g = Lactose pour 100 g — sous-ensemble de MSNG, risque de sableux si cumulé > 12 %
// eau_g    = Eau pour 100 g (extrait_sec_g = 100 − eau_g)
export const INGREDIENTS_GLACE = {

  // ── SUCRANTS ─────────────────────────────────────────────────────────────────
  saccharose: {
    label: 'Saccharose',
    pod: 100, pac: 100,
    mg_g: 0, msng_g: 0, lactose_g: 0, eau_g: 0.5,
  },
  dextrose: {
    label: 'Dextrose monohydraté',
    pod: 70, pac: 190,
    mg_g: 0, msng_g: 0, lactose_g: 0, eau_g: 9,
    note: 'PAC élevé — booster anticongelant. Apporte légère astringence si > 8 %.',
  },
  glucose_de38: {
    label: 'Glucose atomisé DE38',
    pod: 50, pac: 53,
    mg_g: 0, msng_g: 0, lactose_g: 0, eau_g: 6,
    note: 'Faible POD — augmente l\'extrait sec sans sucrer. Idéal pour ajuster ES total.',
  },
  glucose_de60: {
    label: 'Glucose atomisé DE60',
    pod: 70, pac: 80,
    mg_g: 0, msng_g: 0, lactose_g: 0, eau_g: 6,
  },
  sucre_inverti: {
    label: 'Sucre inverti (Trimoline)',
    pod: 125, pac: 190,
    mg_g: 0, msng_g: 0, lactose_g: 0, eau_g: 22,
    note: 'Fort PAC et fort POD. Contient 22 % d\'eau — réduire la phase aqueuse en conséquence.',
  },
  fructose: {
    label: 'Fructose',
    pod: 170, pac: 190,
    mg_g: 0, msng_g: 0, lactose_g: 0, eau_g: 0.5,
    note: 'Très sucrant. En substitution partielle du saccharose — max 4–5 % seul.',
  },
  miel_glace: {
    label: 'Miel',
    pod: 130, pac: 190,
    mg_g: 0, msng_g: 3, lactose_g: 0, eau_g: 17,
    note: 'PAC proche du sucre inverti (fructose + glucose libres). Composition variable selon la fleur.',
  },
  sirop_erable_glace: {
    label: 'Sirop d\'érable grade A',
    pod: 65, pac: 105,
    mg_g: 0, msng_g: 1, lactose_g: 0, eau_g: 34,
    note: 'Arôme marqué. 34 % d\'eau — réduire la phase aqueuse en conséquence.',
  },
  sucre_coco_glace: {
    label: 'Sucre de fleur de coco',
    pod: 90, pac: 100,
    mg_g: 0, msng_g: 2, lactose_g: 0, eau_g: 3,
    note: 'IG ≈ 35. Notes caramélisées légères. PAC proche saccharose.',
  },
  pate_dattes_glace: {
    label: 'Pâte de dattes Medjool',
    pod: 70, pac: 100,
    mg_g: 0, msng_g: 3, lactose_g: 0, eau_g: 21,
    note: 'PAC ≈ saccharose — ne pas substituer 1:1 sans recalibrer le PAC. 21 % d\'eau.',
  },
  erythritol_glace: {
    label: 'Érythritol',
    pod: 70, pac: 220,
    mg_g: 0, msng_g: 0, lactose_g: 0, eau_g: 0,
    note: 'PAC très élevé — brûlure froide en bouche au-delà de 30 %. Max 10–12 % en formule.',
  },
  xylitol: {
    label: 'Xylitol',
    pod: 100, pac: 200,
    mg_g: 0, msng_g: 0, lactose_g: 0, eau_g: 0,
    note: 'PAC élevé. Léger effet laxatif au-delà de 40 g/jour.',
  },

  // ── LAITIERS ─────────────────────────────────────────────────────────────────
  lait_entier: {
    label: 'Lait entier UHT',
    pod: 0, pac: 0,
    mg_g: 3.5, msng_g: 8.5, lactose_g: 4.7, eau_g: 88,
  },
  poudre_lait_0: {
    label: 'Lait écrémé en poudre',
    pod: 0, pac: 0,
    mg_g: 1, msng_g: 96, lactose_g: 52, eau_g: 4,
    note: 'Fort apport MSNG. Total lactose > 12 % formule → risque de sableux par cristallisation.',
  },
  creme_35: {
    label: 'Crème UHT 35 % MG',
    pod: 0, pac: 0,
    mg_g: 35, msng_g: 5.5, lactose_g: 3, eau_g: 59,
  },
  beurre_laitier: {
    label: 'Beurre doux 82 % MG',
    pod: 0, pac: 0,
    mg_g: 82, msng_g: 1.5, lactose_g: 0.7, eau_g: 16,
  },
  yaourt_nature: {
    label: 'Yaourt nature entier',
    pod: 0, pac: 0,
    mg_g: 3.5, msng_g: 11, lactose_g: 4, eau_g: 85,
  },
  mascarpone: {
    label: 'Mascarpone',
    pod: 0, pac: 0,
    mg_g: 47, msng_g: 5, lactose_g: 2.5, eau_g: 48,
  },
  jaunes_oeufs: {
    label: 'Jaunes d\'œufs',
    pod: 0, pac: 0,
    mg_g: 32, msng_g: 4, lactose_g: 0, eau_g: 49,
    note: 'Apportent émulsion et structure (custard). Ne contiennent pas de lactose.',
  },

  // ── VÉGÉTAUX / SANS LACTOSE ───────────────────────────────────────────────────
  lait_coco_glace: {
    label: 'Lait de coco entier',
    pod: 0, pac: 0,
    mg_g: 21, msng_g: 4, lactose_g: 0, eau_g: 74,
    note: 'Se brouille si turbinage < −7 °C. Turbiner à −7/−8 °C minimum.',
  },
  creme_coco_glace: {
    label: 'Crème de coco 24 % MG',
    pod: 0, pac: 0,
    mg_g: 24, msng_g: 4, lactose_g: 0, eau_g: 71,
  },
  boisson_amande_glace: {
    label: 'Boisson d\'amande non sucrée',
    pod: 0, pac: 0,
    mg_g: 1.1, msng_g: 1, lactose_g: 0, eau_g: 97,
    note: 'Très faible MSNG — compenser avec protéines de pois pour la structure.',
  },
  boisson_avoine_glace: {
    label: 'Boisson d\'avoine non sucrée',
    pod: 0, pac: 0,
    mg_g: 1.5, msng_g: 7, lactose_g: 0, eau_g: 90,
    note: 'Meilleure rondeur que la boisson d\'amande — préférer pour les glaces vegan.',
  },
  huile_coco_glace: {
    label: 'Huile de coco désodorisée',
    pod: 0, pac: 0,
    mg_g: 100, msng_g: 0, lactose_g: 0, eau_g: 0,
  },
  beurre_cacao_glace: {
    label: 'Beurre de cacao',
    pod: 0, pac: 0,
    mg_g: 100, msng_g: 0, lactose_g: 0, eau_g: 0,
  },
  proteines_pois_glace: {
    label: 'Protéines de pois isolées 80 %',
    pod: 0, pac: 0,
    mg_g: 6, msng_g: 92, lactose_g: 0, eau_g: 2,
    note: 'Analogue vegan de la poudre de lait écrémé pour MSNG. Hydrater minimum 12 h.',
  },

  // ── COUVERTURES CHOCOLAT ─────────────────────────────────────────────────────
  // pod = contribution directe du sucre interne (% saccharose équivalent dans 100 g)
  // msng_g = cacao sec dégraissé (matière sèche non grasse structurante, sans lactose)
  couv_noire_70: {
    label: 'Couverture noire 70 %',
    pod: 37, pac: 0,
    mg_g: 40, msng_g: 12, lactose_g: 0, eau_g: 1,
    sucre_interne_g: 37,
    note: '~37 % sucre (POD=37), ~40 % MG beurre cacao, ~12 % cacao sec dégraissé.',
  },
  couv_noire_64: {
    label: 'Couverture noire 64 %',
    pod: 36, pac: 0,
    mg_g: 38, msng_g: 8, lactose_g: 0, eau_g: 1,
    sucre_interne_g: 36,
    note: '~36 % sucre, ~38 % MG, ~8 % cacao sec dégraissé.',
  },
  couv_lait_40: {
    label: 'Couverture lait 40 %',
    pod: 40, pac: 0,
    mg_g: 38, msng_g: 22, lactose_g: 12, eau_g: 1,
    sucre_interne_g: 40,
    note: 'Contient ~12 % lactose — comptabiliser dans le total MSNG et surveiller risque sableux.',
  },
  couv_blanche_35: {
    label: 'Couverture blanche 35 %',
    pod: 41, pac: 0,
    mg_g: 38, msng_g: 21, lactose_g: 11, eau_g: 1,
    sucre_interne_g: 41,
    note: 'Pas de cacao sec — toute la MSNG vient du lait. Surveiller lactose total.',
  },
  cacao_poudre_glace: {
    label: 'Cacao en poudre 100 %',
    pod: 0, pac: 0,
    mg_g: 22, msng_g: 78, lactose_g: 0, eau_g: 4,
    note: 'Forte MSNG non lactée — apporte structure sans risque de sableux.',
  },

  // ── STABILISANTS / ÉMULSIFIANTS ───────────────────────────────────────────────
  // pod/pac/mg/msng/lactose ≈ 0 pour tous — impact sur indicateurs négligeable à dose d'emploi
  gomme_caroube_glace: {
    label: 'Gomme caroube',
    pod: 0, pac: 0,
    mg_g: 0, msng_g: 0, lactose_g: 0, eau_g: 10,
    dose_min_pct: 0.15, dose_max_pct: 0.40,
    note: 'Neutralise l\'eau libre. Synergique avec gomme guar (mix 50/50 classique).',
  },
  gomme_guar_glace: {
    label: 'Gomme guar',
    pod: 0, pac: 0,
    mg_g: 0, msng_g: 0, lactose_g: 0, eau_g: 10,
    dose_min_pct: 0.15, dose_max_pct: 0.40,
  },
  gomme_tara_glace: {
    label: 'Gomme tara',
    pod: 0, pac: 0,
    mg_g: 0, msng_g: 0, lactose_g: 0, eau_g: 10,
    dose_min_pct: 0.15, dose_max_pct: 0.30,
    note: 'Préférer pour versions vegan — plus neutre en goût que la caroube.',
  },
  xanthane_glace: {
    label: 'Gomme xanthane',
    pod: 0, pac: 0,
    mg_g: 0, msng_g: 0, lactose_g: 0, eau_g: 13,
    dose_min_pct: 0.05, dose_max_pct: 0.20,
    note: 'En appoint uniquement — sorbet : caroube + xanthane 70/30.',
  },
  emulsifiant_e471: {
    label: 'Mono- et diglycérides (E471)',
    pod: 0, pac: 0,
    mg_g: 80, msng_g: 0, lactose_g: 0, eau_g: 5,
    dose_min_pct: 0.10, dose_max_pct: 0.30,
    note: 'Améliore la texture en bouche et l\'overrun au turbinage.',
  },
  stab_mix_glace: {
    label: 'Stabilisant mix glace (Stab2000, Procrema)',
    pod: 0, pac: 0,
    mg_g: 0, msng_g: 0, lactose_g: 0, eau_g: 8,
    dose_min_pct: 0.50, dose_max_pct: 1.00,
    note: 'Mix gommes + émulsifiants. Dose selon fabricant. Alternative aux mixes maison.',
  },
  acide_citrique_glace: {
    label: 'Acide citrique',
    pod: 0, pac: 0,
    mg_g: 0, msng_g: 0, lactose_g: 0, eau_g: 0,
    dose_min_pct: 0.05, dose_max_pct: 0.15,
    note: 'Sorbet : ajouter sur fruits peu acides (mangue, poire, banane) pour stabiliser couleur et pH.',
  },

  // Phase aqueuse pure — utilisée pour les lignes d'ajustement d'eau dans les templates glace
  eau_pure: {
    label: 'Eau',
    pod: 0, pac: 0,
    mg_g: 0, msng_g: 0, lactose_g: 0, eau_g: 100,
  },
};

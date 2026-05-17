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
  poire:      { label: "Poire",           famille: "fruit_pepin", forme: "puree", acide: false, enzyme: false },
  pomme:      { label: "Pomme",           famille: "fruit_pepin", forme: "puree", acide: false, enzyme: false },
  coing:      { label: "Coing",           famille: "fruit_pepin", forme: "puree", acide: true,  enzyme: false },
  raisin:     { label: "Raisin",          famille: "fruit_pepin", forme: "puree", acide: false, enzyme: false },
  // FRUITS EXOTIQUES
  mangue:     { label: "Mangue",          famille: "fruit_exo",   forme: "puree", acide: true,  enzyme: true  },
  passion:    { label: "Fruit de la passion", famille: "fruit_exo", forme: "puree", acide: true,  enzyme: false },
  ananas:     { label: "Ananas",          famille: "fruit_exo",   forme: "puree", acide: true,  enzyme: true  },
  kiwi:       { label: "Kiwi",            famille: "fruit_exo",   forme: "puree", acide: true,  enzyme: true  },
  banane:     { label: "Banane",          famille: "fruit_exo",   forme: "puree", acide: false, enzyme: false },
  coco:       { label: "Noix de coco (purée)", famille: "fruit_exo", forme: "puree", acide: false, enzyme: false },
  litchi:     { label: "Litchi",          famille: "fruit_exo",   forme: "puree", acide: false, enzyme: false },
  figue:      { label: "Figue",           famille: "fruit_exo",   forme: "puree", acide: false, enzyme: true  },
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
  caramel:    { label: "Caramel",                  famille: "caramel", forme: "pate", acide: false, enzyme: false }
};

// ---------- CONTRAINTES ----------
export const CONTRAINTES = [
  { id: "vegan",   label: "Vegan",        desc: "Sans œuf, lait, gélatine, miel" },
  { id: "lactose", label: "Sans lactose", desc: "Sans lait, beurre, crème animale" },
  { id: "gluten",  label: "Sans gluten",  desc: "Substitutions farines + gomme guar" },
  { id: "igbas",   label: "IG bas",       desc: "Sucre de coco, oligofructose, érythritol" }
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

// Résolution du prix par synonyme puis par famille.
//
// Pourquoi ce module existe
// -------------------------
// `ingredients-metier.js` fait foi, mais il ne contient que 58 entrées. Sur les
// 23 317 lignes de la bibliothèque, 32 % y trouvent un prix : le coût matière
// affiché portait donc sur moins d'un quart de la masse réelle, et l'écart ne
// se voyait pas — un ingrédient sans prix compte pour zéro, si bien qu'une
// recette paraît d'autant moins chère qu'on en connaît moins les ingrédients.
//
// Deux causes distinctes, deux remèdes :
//
// 1. **Des synonymes.** « Sucre », « Lait », « Crème », « Œufs » sont les
//    libellés les plus fréquents du corpus, et ce sont des variantes d'entrées
//    qui existent déjà sous un nom plus précis. Rien à tarifer, juste à relier.
//
// 2. **Des familles sans l'article exact.** Une purée de yuzu n'est pas au
//    référentiel, mais cinq autres purées y sont : leur moyenne vaut mieux que
//    zéro. Ces prix sont **dérivés du référentiel lui-même**, jamais inventés,
//    et remontés avec `source: 'famille'` pour que la fiche les marque d'un °.
//
// Guillaume a tranché le 2026-08-26 : mieux vaut un prix approché signalé qu'un
// coût silencieusement sous-évalué. La mercuriale permet de corriger n'importe
// quel prix par override, et un prix de famille est précisément ce qui appelle
// une correction.

import { INGREDIENTS_METIER } from './ingredients-metier.js';

export function normaliseNom(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
    .replace(/[’']/g, "'")
    .replace(/\([^)]*\)/g, ' ')
    .replace(/«[^»]*»|"[^"]*"/g, ' ')
    .replace(/\b\d+([,.]\d+)?\s*%/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── 1. Synonymes vers une entrée existante ───────────────────────────────────
// Clé = libellé normalisé rencontré dans le corpus, valeur = clé du référentiel.
// Le prix reste celui du référentiel : ce n'est pas une approximation.

export const SYNONYMES = {
  'sucre':                    'Sucre semoule',
  'sucre cristal':            'Sucre semoule',
  'saccharose':               'Sucre semoule',
  'sucre blanc':              'Sucre semoule',
  'sucre en poudre':          'Sucre semoule',
  'cassonnade':               'Cassonade',
  'vergeoise':                'Cassonade',
  'lait':                     'Lait entier',
  'lait frais entier':        'Lait entier',
  'lait entier frais':        'Lait entier',
  'lait demi-ecreme':         'Lait entier',
  'creme':                    'Crème liquide 35%',
  'creme liquide':            'Crème liquide 35%',
  'creme uht':                'Crème UHT 35 %',
  'creme fleurette':          'Crème liquide 35%',
  'creme fraiche':            'Crème liquide 35%',
  'creme fraiche fluide':     'Crème liquide 35%',
  'creme montee':             'Crème liquide 35%',
  'creme entiere':            'Crème liquide 35%',
  'oeufs':                    'Œufs entiers',
  'oeuf':                     'Œuf entier',
  'oeuf entier':              'Œuf entier',
  'oeufs entiers pasteurises': 'Œufs entiers',
  'jaunes':                   "Jaunes d'œufs",
  'jaune':                    "Jaune d'œuf",
  "jaune oeuf frais":         "Jaune d'œuf",
  "jaunes d'oeufs pasteurises": "Jaunes d'œufs",
  'blancs':                   "Blancs d'œufs",
  'blanc':                    "Blanc d'œuf",
  "blancs d'oeufs pasteurises": "Blancs d'œufs",
  "blancs d'oeufs pasteurises vieux": "Blancs d'œufs",
  'blanc oeuf frais':         "Blanc d'œuf",
  'beurre extra-fin':         'Beurre doux',
  'beurre extra fin':         'Beurre doux',
  'beurre frais':             'Beurre doux',
  'beurre sec':               'Beurre doux',
  'beurre de tourage':        'Beurre doux',
  'beurre pommade':           'Beurre doux',
  'beurre motte':             'Beurre doux',
  'farine t 55':              'Farine T55',
  'farine t 45':              'Farine T45',
  'farine de gruau':          'Farine T45',
  'farine gruau':             'Farine T45',
  'farine tradition':         'Farine T55',
  'farine blanche 55':        'Farine T55',
  'eau minerale':             'Eau',
  'eau froide':               'Eau',
  'eau de coulage':           'Eau',
  'eau de bassinage':         'Eau',
  'sel fin':                  'Sel',
  'sel de guerande':          'Sel',
  'gros sel':                 'Sel',
  'fleurs de sel':            'Fleur de sel',
  'gelatine':                 'Gélatine 200 bloom',
  'gelatine feuille':         'Gélatine en feuilles',
  'feuilles de gelatine':     'Gélatine en feuilles',
  'gelatine en feuille':      'Gélatine en feuilles',
  'masse gelatine':           'Gélatine 200 bloom',
  'sirop de glucose':         'Glucose',
  'glucose atomise':          'Glucose',
  'fecule':                   'Fécule de maïs',
  'maizena':                  'Fécule de maïs',
  'levure':                   'Levure chimique',
  'baking':                   'Levure chimique',
  'baking powder':            'Levure chimique',
  'backing':                  'Levure chimique',
  'poudre d amande':          "Poudre d'amande",
  'amande en poudre':         "Poudre d'amande",
  'poudre d amandes':         "Poudre d'amande",
  'feuilletine':              'Feuilletine (paillettes)',
  'praline':                  'Praliné noisette',
  'praline noisette':         'Praliné noisette',
  "poudre d'amandes":         "Poudre d'amande",
  'amande poudre':            "Poudre d'amande",
  'amandes en poudre':        "Poudre d'amande",
  'pistache':                 'Pâte de pistache',
  'miel':                     "Miel d'acacia",
  'puree de fruits rouges':   'Purée de framboise',
  'pate de noisettes':        'Pâte de noisette',
};

// ── 1 bis. Préparations dont le prix se déduit d'une composition connue ──────
// Un tant-pour-tant, c'est poudre d'amande et sucre glace à parts égales : son
// prix se calcule, il ne se saisit pas. Idem pour un sirop à 30°B.

const COMPOSITIONS = [
  { motif: /^tant[ -]?pour[ -]?tant\b/, parts: [["Poudre d'amande", 0.5], ['Sucre glace', 0.5]],
    nom: 'tant-pour-tant (amande + sucre glace)' },
  { motif: /^sirops? (a|à) 30|^sirop a 1260/, parts: [['Sucre semoule', 0.57], ['Eau', 0.43]],
    nom: 'sirop à 30°B (sucre + eau)' },
];

function ficheComposition(comp, table) {
  let prix = 0;
  for (const [cle, part] of comp.parts) {
    const v = table[cle]?.prix_eur_par_g;
    if (v == null) return null;
    prix += v * part;
  }
  return {
    prix_eur_par_g: Math.round(prix * 1e6) / 1e6,
    prix_unitaire_eur: null, unite_prix: null, fournisseur: null,
    date_maj_prix: null, prix_variable_saison: false,
    allergenes_inco: [], traces_possibles: [],
    conservation_j_froid: null, conservation_j_ambiant: null, conservation_j_surgele: null,
    instructions_conservation: null, apres_ouverture: null,
    _famille: comp.nom,
    _derive_de: comp.parts.map(([c]) => c),
  };
}

// ── 2. Prix de famille, dérivés du référentiel ───────────────────────────────
// Chaque famille pointe les entrées du référentiel dont elle tire sa moyenne :
// le prix se recalcule tout seul si l'une d'elles change. Aucun chiffre n'est
// saisi ici.

const FAMILLES = [
  { nom: 'purée de fruit',
    motif: /^(purees?|pulpes?|coulis)\b|^puree d|^pulpe d/,
    depuis: ['Purée de framboise', 'Purée de fraise', 'Purée de mangue',
             'Purée de fruit de la passion', "Purée d'abricot"] },
  { nom: 'couverture / chocolat',
    motif: /^(couvertures?|chocolats?)\b/,
    depuis: ['Chocolat noir 70%', 'Couverture noir 64%', 'Couverture lait',
             'Couverture blanc', 'Couverture blond'] },
  { nom: 'crème',
    motif: /^cremes?\b/,
    depuis: ['Crème liquide 35%', 'Crème UHT 35 %'] },
  { nom: 'lait',
    motif: /^laits?\b/,
    depuis: ['Lait entier', 'Lait UHT entier'] },
  { nom: 'beurre',
    motif: /^beurres?\b/,
    depuis: ['Beurre doux', 'Beurre'] },
  { nom: 'farine',
    motif: /^farines?\b/,
    depuis: ['Farine T45', 'Farine T55', 'Farine'] },
  { nom: 'sucre',
    motif: /^sucres?\b/,
    depuis: ['Sucre semoule', 'Sucre glace', 'Cassonade'] },
  { nom: 'gélatine',
    motif: /^gelatines?\b|^masse gelatine/,
    depuis: ['Gélatine 200 bloom', 'Gélatine en feuilles'] },
  { nom: 'œufs',
    motif: /^oeufs?\b/,
    depuis: ['Œufs entiers', 'Œuf entier'] },
  { nom: "jaunes d'œufs",
    motif: /^jaunes?\b/,
    depuis: ["Jaunes d'œufs", "Jaune d'œuf"] },
  { nom: "blancs d'œufs",
    motif: /^blancs?\b/,
    depuis: ["Blancs d'œufs", "Blanc d'œuf"] },
];

function moyenne(cles, table) {
  const p = cles.map(c => table[c]?.prix_eur_par_g).filter(v => typeof v === 'number');
  return p.length ? p.reduce((a, b) => a + b, 0) / p.length : null;
}

/** Fiche de famille : le prix moyen, sans fournisseur ni conservation — une
 *  moyenne n'a ni l'un ni l'autre, et prétendre le contraire tromperait. */
function ficheFamille(fam, table) {
  const prix = moyenne(fam.depuis, table);
  if (prix == null) return null;
  return {
    prix_eur_par_g: Math.round(prix * 1e6) / 1e6,
    prix_unitaire_eur: null,
    unite_prix: null,
    fournisseur: null,
    date_maj_prix: null,
    prix_variable_saison: false,
    allergenes_inco: [],
    traces_possibles: [],
    conservation_j_froid: null,
    conservation_j_ambiant: null,
    conservation_j_surgele: null,
    instructions_conservation: null,
    apres_ouverture: null,
    _famille: fam.nom,
    _derive_de: fam.depuis,
  };
}

const _cacheIndex = new WeakMap();

function index(table) {
  let idx = _cacheIndex.get(table);
  if (idx) return idx;
  idx = { parNom: new Map(), familles: [], compositions: [] };
  for (const cle of Object.keys(table)) {
    const k = normaliseNom(cle);
    if (!idx.parNom.has(k)) idx.parNom.set(k, cle);
  }
  for (const comp of COMPOSITIONS) {
    const fiche = ficheComposition(comp, table);
    if (fiche) idx.compositions.push({ motif: comp.motif, fiche });
  }
  for (const fam of FAMILLES) {
    const fiche = ficheFamille(fam, table);
    if (fiche) idx.familles.push({ motif: fam.motif, fiche });
  }
  _cacheIndex.set(table, idx);
  return idx;
}

/**
 * Résout le prix d'un libellé.
 * @returns {{fiche: object, source: 'referentiel'|'synonyme'|'famille'}|null}
 */
export function resoudrePrix(nom, table = INGREDIENTS_METIER) {
  if (!nom) return null;
  if (table[nom]) return { fiche: table[nom], source: 'referentiel' };

  const n = normaliseNom(nom);
  const idx = index(table);

  const exact = idx.parNom.get(n);
  if (exact) return { fiche: table[exact], source: 'referentiel' };

  const syn = SYNONYMES[n];
  if (syn && table[syn]) return { fiche: table[syn], source: 'synonyme' };

  // les compositions avant les familles : « tant-pour-tant amandes » ne doit
  // pas tomber dans la famille « amande »
  for (const { motif, fiche } of idx.compositions) {
    if (motif.test(n)) return { fiche, source: 'famille' };
  }

  for (const { motif, fiche } of idx.familles) {
    if (motif.test(n)) return { fiche, source: 'famille' };
  }

  return null;
}

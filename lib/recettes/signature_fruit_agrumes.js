// Signature Fruit — Agrumes (Ravifruit)
// 9 applications × agrumes : glace, sorbet, mousse, crémeux, confit,
// marshmallow, espuma, glaçage, biscuit.
// source_interne jamais affiché en UI.

const SRC = { fichier_pdf: 'Signature_Fruit_English.pdf', page: null, chef: null };

// ─── BASE COMMUNE GLACE (pour 500 g de base) ────────────────────────────────
// Lait entier 278 · Saccharose 50 · Sucre inverti 8 · Glucose poudre 30
// Crème 35% 83 · Lait poudre 0% 18 · Stab glace 3 · Jaunes d'œufs 33 = 503 g

// ─── BASE COMMUNE SORBET (pour 500 g de base) ───────────────────────────────
// Eau 223 · Saccharose 158 · Glucose poudre 118 · Stab sorbet 2 = 501 g

// ════════════════════════════════════════════════════════════════════════════
//  GLACES TURBINÉES
// ════════════════════════════════════════════════════════════════════════════

function glaceAgrume({ id, nom, parfum, pureeNom, pureeG }) {
  const baseG = 503;
  const total = baseG + pureeG;
  const p = (g) => Math.round(g / total * 100);
  return {
    id,
    nom,
    categorie: 'glaces_sorbets',
    sous_categorie: 'glace_turbinee',
    description: `Crème glacée ${parfum} sur base laitière équilibrée. Turbinage après maturation minimum 4 h.`,
    masse_totale_g: total,
    ingredients: [
      { nom: pureeNom,              g: pureeG, pct: p(pureeG), role: 'fruit'      },
      { nom: 'Lait entier',         g: 278,    pct: p(278),    role: 'eau'        },
      { nom: 'Crème liquide 35%',   g: 83,     pct: p(83),     role: 'mg'         },
      { nom: 'Saccharose',          g: 50,     pct: p(50),     role: 'sucrant'    },
      { nom: 'Glucose poudre',      g: 30,     pct: p(30),     role: 'sucrant'    },
      { nom: 'Jaunes d\'œufs',      g: 33,     pct: p(33),     role: 'liant'      },
      { nom: 'Lait poudre 0%',      g: 18,     pct: p(18),     role: 'structure'  },
      { nom: 'Sucre inverti',       g: 8,      pct: p(8),      role: 'sucrant'    },
      { nom: 'Stabilisateur glace', g: 3,      pct: p(3),      role: 'structure'  },
    ],
    procede: [
      'Prémélanger la moitié du saccharose avec le stabilisateur.',
      'Chauffer le lait et la crème.',
      'À 25 °C incorporer le lait poudre, l\'autre moitié du saccharose et le glucose poudre.',
      'À 35 °C ajouter les jaunes et le sucre inverti.',
      'À 45 °C incorporer le mélange saccharose/stabilisateur en pluie.',
      'Cuire à 85 °C. Refroidir rapidement à 4 °C.',
      'Verser la base froide (4 °C) sur la purée décongelée. Mixer.',
      'Laisser maturer minimum 4 h à 4 °C. Turbiner.',
    ],
    cuisson: { temperature_c: 85, duree_min: null, mode: 'bain direct' },
    temperatures: { service_c: -12, conservation_c: -18 },
    contraintes: { vegan: false, sans_lactose: false, sans_gluten: true, ig_bas: false },
    a_verifier: false,
    allergenes: ['lait', 'oeuf'],
    tags: ['glace', 'turbiné', parfum, 'agrume', 'pasteurisation'],
    parfum_principal: parfum,
    note_concepteur: null,
    source_interne: SRC,
  };
}

const GLACES = [
  glaceAgrume({ id: 'sfa-glace-citron',          nom: 'Glace citron jaune',     parfum: 'citron',           pureeNom: 'Purée de citron',           pureeG: 270 }),
  glaceAgrume({ id: 'sfa-glace-citron-concasse', nom: 'Glace citron concassé',  parfum: 'citron concassé',  pureeNom: 'Purée de citron concassé',  pureeG: 270 }),
  glaceAgrume({ id: 'sfa-glace-citron-vert',     nom: 'Glace citron vert',      parfum: 'citron vert',      pureeNom: 'Purée de citron vert',      pureeG: 270 }),
  glaceAgrume({ id: 'sfa-glace-yuzu',            nom: 'Glace yuzu',             parfum: 'yuzu',             pureeNom: 'Purée de yuzu',             pureeG: 270 }),
  glaceAgrume({ id: 'sfa-glace-mandarine',       nom: 'Glace mandarine',        parfum: 'mandarine',        pureeNom: 'Purée de mandarine',        pureeG: 500 }),
  glaceAgrume({ id: 'sfa-glace-orange',          nom: 'Glace orange',           parfum: 'orange',           pureeNom: 'Purée d\'orange',           pureeG: 500 }),
  glaceAgrume({ id: 'sfa-glace-sudachi',         nom: 'Glace sudachi',          parfum: 'sudachi',          pureeNom: 'Purée de sudachi',          pureeG: 500 }),
];

// ════════════════════════════════════════════════════════════════════════════
//  SORBETS
// ════════════════════════════════════════════════════════════════════════════

function sorbetAgrume({ id, nom, parfum, pureeNom, pureeG, eauAjoutG = 0 }) {
  const baseG = 501;
  const total = baseG + pureeG + eauAjoutG;
  const p = (g) => Math.round(g / total * 100);
  const ingredients = [
    { nom: pureeNom,                g: pureeG, pct: p(pureeG), role: 'fruit'   },
    { nom: 'Eau (base)',            g: 223,    pct: p(223),    role: 'eau'     },
    { nom: 'Saccharose',            g: 158,    pct: p(158),    role: 'sucrant' },
    { nom: 'Glucose poudre',        g: 118,    pct: p(118),    role: 'sucrant' },
    { nom: 'Stabilisateur sorbet',  g: 2,      pct: p(2),      role: 'structure' },
  ];
  if (eauAjoutG > 0) {
    ingredients.push({ nom: 'Eau (ajout purée)', g: eauAjoutG, pct: p(eauAjoutG), role: 'eau' });
  }
  return {
    id,
    nom,
    categorie: 'glaces_sorbets',
    sous_categorie: 'sorbet_eau',
    description: `Sorbet ${parfum} sur base sirop équilibrée. Turbinage après maturation minimum 4 h.`,
    masse_totale_g: total,
    ingredients,
    procede: [
      'Prémélanger la moitié du saccharose avec le stabilisateur.',
      'Chauffer l\'eau.',
      'À 25 °C incorporer l\'autre moitié du saccharose et le glucose poudre.',
      'À 45 °C incorporer le mélange saccharose/stabilisateur en pluie.',
      'Cuire à 85 °C. Refroidir rapidement à 4 °C.',
      eauAjoutG > 0
        ? 'Verser la base froide sur la purée décongelée, ajouter l\'eau d\'ajout. Mixer.'
        : 'Verser la base froide (4 °C) sur la purée décongelée. Mixer.',
      'Laisser maturer minimum 4 h à 4 °C. Turbiner.',
    ],
    cuisson: { temperature_c: 85, duree_min: null, mode: 'bain direct' },
    temperatures: { service_c: -11, conservation_c: -18 },
    contraintes: { vegan: true, sans_lactose: true, sans_gluten: true, ig_bas: false },
    a_verifier: false,
    allergenes: [],
    tags: ['sorbet', 'turbiné', parfum, 'agrume', 'vegan'],
    parfum_principal: parfum,
    note_concepteur: eauAjoutG > 0 ? 'La dilution par l\'eau compense l\'intensité élevée de la purée pour atteindre le Brix cible.' : null,
    source_interne: SRC,
  };
}

const SORBETS = [
  sorbetAgrume({ id: 'sfa-sorbet-citron',           nom: 'Sorbet citron jaune',      parfum: 'citron',           pureeNom: 'Purée de citron',           pureeG: 270 }),
  sorbetAgrume({ id: 'sfa-sorbet-citron-concasse',  nom: 'Sorbet citron concassé',   parfum: 'citron concassé',  pureeNom: 'Purée de citron concassé',  pureeG: 270 }),
  sorbetAgrume({ id: 'sfa-sorbet-citron-vert',      nom: 'Sorbet citron vert',       parfum: 'citron vert',      pureeNom: 'Purée de citron vert',      pureeG: 215, eauAjoutG: 155 }),
  sorbetAgrume({ id: 'sfa-sorbet-yuzu',             nom: 'Sorbet yuzu',              parfum: 'yuzu',             pureeNom: 'Purée de yuzu',             pureeG: 215, eauAjoutG: 155 }),
  sorbetAgrume({ id: 'sfa-sorbet-sudachi',          nom: 'Sorbet sudachi',           parfum: 'sudachi',          pureeNom: 'Purée de sudachi',          pureeG: 410, eauAjoutG: 90  }),
  sorbetAgrume({ id: 'sfa-sorbet-mandarine',        nom: 'Sorbet mandarine',         parfum: 'mandarine',        pureeNom: 'Purée de mandarine',        pureeG: 410, eauAjoutG: 90  }),
  sorbetAgrume({ id: 'sfa-sorbet-orange',           nom: 'Sorbet orange',            parfum: 'orange',           pureeNom: 'Purée d\'orange',           pureeG: 930 }),
  sorbetAgrume({ id: 'sfa-sorbet-orange-sanguine',  nom: 'Sorbet orange sanguine',   parfum: 'orange sanguine',  pureeNom: 'Purée d\'orange sanguine',  pureeG: 750 }),
  sorbetAgrume({ id: 'sfa-sorbet-pamplemousse',     nom: 'Sorbet pamplemousse rose', parfum: 'pamplemousse rose',pureeNom: 'Purée de pamplemousse rose',pureeG: 345 }),
];

// ════════════════════════════════════════════════════════════════════════════
//  MOUSSES — MERINGUE ITALIENNE
// ════════════════════════════════════════════════════════════════════════════
// Meringue italienne : blancs 70 g · sucre 115 g · eau 30 g → 215 g total
// Recette utilise 160 g de meringue + crème 35% 240 g
// Gélatine et gomme caroube varient selon l'agrume.
// *Yuzu et Sudachi : hydrater la gélatine avec l'intégralité de la purée.

function mousseAgrume({ id, nom, parfum, pureeNom, pureeG, gelatineG, caroupeG, noteHydratation = false }) {
  const merG = 160, cremeG = 240;
  const total = merG + cremeG + pureeG + gelatineG + caroupeG;
  const p = (g) => Math.round(g / total * 100);
  return {
    id,
    nom,
    categorie: 'mousses',
    sous_categorie: 'mousse_fruit',
    description: `Mousse ${parfum} à la meringue italienne, légère et fruitée.`,
    masse_totale_g: total,
    ingredients: [
      { nom: pureeNom,              g: pureeG,     pct: p(pureeG),     role: 'fruit'     },
      { nom: 'Crème 35% montée',    g: cremeG,     pct: p(cremeG),     role: 'mg'        },
      { nom: 'Meringue italienne',  g: merG,       pct: p(merG),       role: 'structure' },
      { nom: 'Gélatine 200 Bloom',  g: gelatineG,  pct: p(gelatineG),  role: 'gélifiant' },
      { nom: 'Gomme caroube',       g: caroupeG,   pct: p(caroupeG),   role: 'structure' },
    ],
    procede: [
      noteHydratation
        ? 'Hydrater la gélatine dans la totalité de la purée pendant 20 minutes.'
        : 'Hydrater la gélatine dans 1/3 de la purée pendant 20 minutes.',
      'Chauffer à 45 °C et incorporer le reste de la purée et la gomme caroube. Mixer.',
      'Réserver au réfrigérateur jusqu\'à début de prise.',
      'Verser sur la meringue italienne, puis incorporer délicatement la crème montée.',
      'Utiliser immédiatement.',
    ],
    cuisson: { temperature_c: null, duree_min: null, mode: null },
    temperatures: { service_c: 4, conservation_c: 4 },
    contraintes: { vegan: false, sans_lactose: false, sans_gluten: true, ig_bas: false },
    a_verifier: false,
    allergenes: ['lait', 'oeuf'],
    tags: ['mousse', 'meringue italienne', parfum, 'agrume', 'entremets'],
    parfum_principal: parfum,
    note_concepteur: noteHydratation ? 'Hydrater la gélatine avec la totalité de la purée (technique spécifique aux agrumes concentrés).' : null,
    source_interne: SRC,
  };
}

const MOUSSES = [
  mousseAgrume({ id: 'sfa-mousse-citron',          nom: 'Mousse citron jaune',      parfum: 'citron',            pureeNom: 'Purée de citron',            pureeG: 220, gelatineG: 9,  caroupeG: 6 }),
  mousseAgrume({ id: 'sfa-mousse-citron-concasse', nom: 'Mousse citron concassé',   parfum: 'citron concassé',   pureeNom: 'Purée de citron concassé',   pureeG: 500, gelatineG: 12, caroupeG: 10 }),
  mousseAgrume({ id: 'sfa-mousse-citron-vert',     nom: 'Mousse citron vert',       parfum: 'citron vert',       pureeNom: 'Purée de citron vert',       pureeG: 220, gelatineG: 9,  caroupeG: 6 }),
  mousseAgrume({ id: 'sfa-mousse-mandarine',       nom: 'Mousse mandarine',         parfum: 'mandarine',         pureeNom: 'Purée de mandarine',         pureeG: 600, gelatineG: 14, caroupeG: 10 }),
  mousseAgrume({ id: 'sfa-mousse-orange',          nom: 'Mousse orange',            parfum: 'orange',            pureeNom: 'Purée d\'orange',            pureeG: 600, gelatineG: 14, caroupeG: 10 }),
  mousseAgrume({ id: 'sfa-mousse-orange-sanguine', nom: 'Mousse orange sanguine',   parfum: 'orange sanguine',   pureeNom: 'Purée d\'orange sanguine',   pureeG: 600, gelatineG: 14, caroupeG: 10 }),
  mousseAgrume({ id: 'sfa-mousse-pamplemousse',    nom: 'Mousse pamplemousse rose', parfum: 'pamplemousse rose', pureeNom: 'Purée de pamplemousse rose', pureeG: 600, gelatineG: 14, caroupeG: 10 }),
  mousseAgrume({ id: 'sfa-mousse-sudachi',         nom: 'Mousse sudachi',           parfum: 'sudachi',           pureeNom: 'Purée de sudachi',           pureeG: 220, gelatineG: 10, caroupeG: 6,  noteHydratation: true }),
  mousseAgrume({ id: 'sfa-mousse-yuzu',            nom: 'Mousse yuzu',              parfum: 'yuzu',              pureeNom: 'Purée de yuzu',              pureeG: 220, gelatineG: 8,  caroupeG: 6,  noteHydratation: true }),
];

// ════════════════════════════════════════════════════════════════════════════
//  CRÉMEUX
// ════════════════════════════════════════════════════════════════════════════
// Ingrédients communs : Sucre 90 g · Stab glace 5 g · Jaunes 90 g · Beurre 82% 140 g
// Groupe A (purée seule) : purée 650 g · Pectine NH variable
// Groupe B (purée diluée) : purée réduite + eau 340 g · Pectine NH variable · sucre +50 g

function creameuxGroupeA({ id, nom, parfum, pureeNom, pureeG, pectineG }) {
  const sucreG = 90, stabG = 5, jaunesG = 90, beurrG = 140;
  const total = pureeG + pectineG + sucreG + stabG + jaunesG + beurrG;
  const p = (g) => Math.round(g / total * 100);
  return {
    id, nom,
    categorie: 'cremes',
    sous_categorie: 'cremeux_fruit',
    description: `Crémeux ${parfum}, cuit à 85 °C, onctueux et riche en fruit.`,
    masse_totale_g: total,
    ingredients: [
      { nom: pureeNom,            g: pureeG,   pct: p(pureeG),   role: 'fruit'     },
      { nom: 'Beurre 82%',        g: beurrG,   pct: p(beurrG),   role: 'mg'        },
      { nom: 'Jaunes d\'œufs',    g: jaunesG,  pct: p(jaunesG),  role: 'liant'     },
      { nom: 'Saccharose',        g: sucreG,   pct: p(sucreG),   role: 'sucrant'   },
      { nom: 'Pectine NH',        g: pectineG, pct: p(pectineG), role: 'gélifiant' },
      { nom: 'Stabilisateur glace', g: stabG,  pct: p(stabG),    role: 'structure' },
    ],
    procede: [
      'Mélanger le sucre, la pectine NH et le stabilisateur.',
      'Chauffer la purée et les jaunes à 45 °C.',
      'Incorporer le mélange de poudres en pluie fine en fouettant.',
      'Cuire à 85 °C.',
      'Refroidir à 35–40 °C, laisser maturer 30 min.',
      'Incorporer le beurre pommade. Mixer.',
    ],
    cuisson: { temperature_c: 85, duree_min: null, mode: 'bain direct' },
    temperatures: { service_c: 4, conservation_c: 4 },
    contraintes: { vegan: false, sans_lactose: false, sans_gluten: true, ig_bas: false },
    a_verifier: false,
    allergenes: ['lait', 'oeuf'],
    tags: ['crémeux', parfum, 'agrume', 'insert', 'entremets'],
    parfum_principal: parfum,
    note_concepteur: null,
    source_interne: SRC,
  };
}

function creameuxGroupeB({ id, nom, parfum, pureeNom, pureeG, pectineG }) {
  const eauG = 340, sucreG = 90 + 50, stabG = 5, jaunesG = 90, beurrG = 140;
  const total = pureeG + eauG + pectineG + sucreG + stabG + jaunesG + beurrG;
  const p = (g) => Math.round(g / total * 100);
  return {
    id, nom,
    categorie: 'cremes',
    sous_categorie: 'cremeux_fruit',
    description: `Crémeux ${parfum} dilué (forte acidité), cuit à 85 °C.`,
    masse_totale_g: total,
    ingredients: [
      { nom: pureeNom,              g: pureeG,   pct: p(pureeG),   role: 'fruit'     },
      { nom: 'Eau',                 g: eauG,     pct: p(eauG),     role: 'eau'       },
      { nom: 'Beurre 82%',          g: beurrG,   pct: p(beurrG),   role: 'mg'        },
      { nom: 'Jaunes d\'œufs',      g: jaunesG,  pct: p(jaunesG),  role: 'liant'     },
      { nom: 'Saccharose',          g: sucreG,   pct: p(sucreG),   role: 'sucrant'   },
      { nom: 'Pectine NH',          g: pectineG, pct: p(pectineG), role: 'gélifiant' },
      { nom: 'Stabilisateur glace', g: stabG,    pct: p(stabG),    role: 'structure' },
    ],
    procede: [
      'Mélanger le sucre, la pectine NH et le stabilisateur.',
      'Chauffer la purée, l\'eau et les jaunes à 45 °C.',
      'Incorporer le mélange de poudres en pluie fine en fouettant.',
      'Cuire à 85 °C.',
      'Refroidir à 35–40 °C, laisser maturer 30 min.',
      'Incorporer le beurre pommade. Mixer.',
    ],
    cuisson: { temperature_c: 85, duree_min: null, mode: 'bain direct' },
    temperatures: { service_c: 4, conservation_c: 4 },
    contraintes: { vegan: false, sans_lactose: false, sans_gluten: true, ig_bas: false },
    a_verifier: false,
    allergenes: ['lait', 'oeuf'],
    tags: ['crémeux', parfum, 'agrume', 'insert', 'entremets'],
    parfum_principal: parfum,
    note_concepteur: 'La forte teneur en eau compense l\'acidité élevée de la purée et équilibre le Brix.',
    source_interne: SRC,
  };
}

const CREMEUX = [
  // Groupe A — purée seule (agrumes doux)
  creameuxGroupeA({ id: 'sfa-cremeux-citron-concasse', nom: 'Crémeux citron concassé',   parfum: 'citron concassé',   pureeNom: 'Purée de citron concassé',   pureeG: 650, pectineG: 18 }),
  creameuxGroupeA({ id: 'sfa-cremeux-mandarine',       nom: 'Crémeux mandarine',         parfum: 'mandarine',         pureeNom: 'Purée de mandarine',         pureeG: 650, pectineG: 14 }),
  creameuxGroupeA({ id: 'sfa-cremeux-orange',          nom: 'Crémeux orange',            parfum: 'orange',            pureeNom: 'Purée d\'orange',            pureeG: 650, pectineG: 15 }),
  creameuxGroupeA({ id: 'sfa-cremeux-orange-sanguine', nom: 'Crémeux orange sanguine',   parfum: 'orange sanguine',   pureeNom: 'Purée d\'orange sanguine',   pureeG: 650, pectineG: 15 }),
  creameuxGroupeA({ id: 'sfa-cremeux-pamplemousse',    nom: 'Crémeux pamplemousse rose', parfum: 'pamplemousse rose', pureeNom: 'Purée de pamplemousse rose', pureeG: 650, pectineG: 14 }),
  // Groupe B — purée diluée (agrumes acides)
  creameuxGroupeB({ id: 'sfa-cremeux-citron',      nom: 'Crémeux citron jaune',  parfum: 'citron',       pureeNom: 'Purée de citron',       pureeG: 280, pectineG: 20 }),
  creameuxGroupeB({ id: 'sfa-cremeux-citron-vert', nom: 'Crémeux citron vert',   parfum: 'citron vert',  pureeNom: 'Purée de citron vert',   pureeG: 280, pectineG: 19 }),
  creameuxGroupeB({ id: 'sfa-cremeux-sudachi',     nom: 'Crémeux sudachi',       parfum: 'sudachi',      pureeNom: 'Purée de sudachi',       pureeG: 240, pectineG: 15 }),
  creameuxGroupeB({ id: 'sfa-cremeux-yuzu',        nom: 'Crémeux yuzu',          parfum: 'yuzu',         pureeNom: 'Purée de yuzu',          pureeG: 240, pectineG: 16 }),
];

// ════════════════════════════════════════════════════════════════════════════
//  CONFITS
// ════════════════════════════════════════════════════════════════════════════
// Base commune : Glucose poudre 115 g · Sucre 115 g · Pectine NH 14 g
// Groupe A (purée 750 g + jus citron) · Groupe B (purée 455 g + poire 245 g + gélatine)

const BASE_CONFIT_GLUC = 115;
const BASE_CONFIT_SUCR = 115;
const BASE_CONFIT_PECT = 14;

function confitGroupeA({ id, nom, parfum, pureeNom, pureeG = 750, extraGlucG = 0, extraSucrG = 0, jusNom = null, jusG = 0, pectineExtra = 1 }) {
  const total = pureeG + jusG + (BASE_CONFIT_GLUC + extraGlucG) + (BASE_CONFIT_SUCR + extraSucrG) + (BASE_CONFIT_PECT + pectineExtra);
  const p = (g) => Math.round(g / total * 100);
  const ingredients = [
    { nom: pureeNom,       g: pureeG,                             pct: p(pureeG),                             role: 'fruit'     },
    { nom: 'Glucose poudre', g: BASE_CONFIT_GLUC + extraGlucG,   pct: p(BASE_CONFIT_GLUC + extraGlucG),      role: 'sucrant'   },
    { nom: 'Saccharose',   g: BASE_CONFIT_SUCR + extraSucrG,     pct: p(BASE_CONFIT_SUCR + extraSucrG),      role: 'sucrant'   },
    { nom: 'Pectine NH',   g: BASE_CONFIT_PECT + pectineExtra,   pct: p(BASE_CONFIT_PECT + pectineExtra),    role: 'gélifiant' },
  ];
  if (jusNom && jusG > 0) {
    ingredients.push({ nom: jusNom, g: jusG, pct: p(jusG), role: 'acidifiant' });
  }
  return {
    id, nom,
    categorie: 'confits',
    sous_categorie: 'confit_fruit',
    description: `Confit ${parfum}, texture fondante, utilisable en insert, nappage sponge ou garnissage.`,
    masse_totale_g: total,
    ingredients,
    procede: [
      'Chauffer la purée.',
      'À 40 °C incorporer le glucose poudre en fouettant.',
      'À 50 °C incorporer le mélange sucre-pectine en fouettant.',
      'Cuire à 85 °C pendant 1 minute.',
      jusNom ? `Hors du feu, ajouter le ${jusNom.toLowerCase()}.` : null,
      'Refroidir à 4 °C. Mixer pour lisser avant utilisation.',
    ].filter(Boolean),
    cuisson: { temperature_c: 85, duree_min: 1, mode: 'bain direct' },
    temperatures: { service_c: 4, conservation_c: 4 },
    contraintes: { vegan: true, sans_lactose: true, sans_gluten: true, ig_bas: false },
    a_verifier: false,
    allergenes: [],
    tags: ['confit', parfum, 'agrume', 'insert', 'vegan'],
    parfum_principal: parfum,
    note_concepteur: null,
    source_interne: SRC,
  };
}

function confitGroupeB({ id, nom, parfum, pureeNom, pureeG = 455, extraSucrG, gelatineG = 2 }) {
  const poireG = 245;
  const glucoseG = BASE_CONFIT_GLUC + 35;
  const sucreG   = BASE_CONFIT_SUCR + extraSucrG;
  const pectineG = BASE_CONFIT_PECT;
  const total = pureeG + poireG + glucoseG + sucreG + pectineG + gelatineG;
  const p = (g) => Math.round(g / total * 100);
  return {
    id, nom,
    categorie: 'confits',
    sous_categorie: 'confit_fruit',
    description: `Confit ${parfum} et poire, texture soyeuse, insert entremets et tarte.`,
    masse_totale_g: total,
    ingredients: [
      { nom: pureeNom,          g: pureeG,   pct: p(pureeG),   role: 'fruit'     },
      { nom: 'Purée de poire',  g: poireG,   pct: p(poireG),   role: 'fruit'     },
      { nom: 'Glucose poudre',  g: glucoseG, pct: p(glucoseG), role: 'sucrant'   },
      { nom: 'Saccharose',      g: sucreG,   pct: p(sucreG),   role: 'sucrant'   },
      { nom: 'Pectine NH',      g: pectineG, pct: p(pectineG), role: 'gélifiant' },
      { nom: 'Gélatine 200 Bloom', g: gelatineG, pct: p(gelatineG), role: 'gélifiant' },
    ],
    procede: [
      'Hydrater la gélatine dans 14 g d\'eau froide (7× son poids) pendant 15 min.',
      'Chauffer les purées ensemble.',
      'À 40 °C incorporer le glucose poudre en fouettant.',
      'À 50 °C incorporer le mélange sucre-pectine en fouettant.',
      'Cuire à 85 °C pendant 1 minute.',
      'Hors du feu, ajouter la gélatine hydratée. Mélanger.',
      'Refroidir à 4 °C. Mixer pour lisser avant utilisation.',
    ],
    cuisson: { temperature_c: 85, duree_min: 1, mode: 'bain direct' },
    temperatures: { service_c: 4, conservation_c: 4 },
    contraintes: { vegan: false, sans_lactose: true, sans_gluten: true, ig_bas: false },
    a_verifier: false,
    allergenes: [],   // la gélatine n'est pas un allergène INCO — voir contraintes.vegan
    tags: ['confit', parfum, 'poire', 'agrume', 'insert'],
    parfum_principal: parfum,
    note_concepteur: null,
    source_interne: SRC,
  };
}

const CONFITS = [
  confitGroupeA({ id: 'sfa-confit-mandarine',        nom: 'Confit mandarine',         parfum: 'mandarine',         pureeNom: 'Purée de mandarine',         jusNom: 'Jus de citron', jusG: 8 }),
  confitGroupeA({ id: 'sfa-confit-orange',           nom: 'Confit orange',            parfum: 'orange',            pureeNom: 'Purée d\'orange',            jusNom: 'Jus de citron', jusG: 8 }),
  confitGroupeA({ id: 'sfa-confit-orange-sanguine',  nom: 'Confit orange sanguine',   parfum: 'orange sanguine',   pureeNom: 'Purée d\'orange sanguine',   jusNom: 'Jus de citron', jusG: 8 }),
  confitGroupeA({ id: 'sfa-confit-pamplemousse',     nom: 'Confit pamplemousse rose', parfum: 'pamplemousse rose', pureeNom: 'Purée de pamplemousse rose', extraGlucG: 15, extraSucrG: 15 }),
  confitGroupeB({ id: 'sfa-confit-citron',           nom: 'Confit citron et poire',   parfum: 'citron et poire',   pureeNom: 'Purée de citron',       extraSucrG: 25 }),
  confitGroupeB({ id: 'sfa-confit-citron-vert',      nom: 'Confit citron vert et poire', parfum: 'citron vert et poire', pureeNom: 'Purée de citron vert', extraSucrG: 30 }),
  confitGroupeB({ id: 'sfa-confit-sudachi',          nom: 'Confit sudachi et poire',  parfum: 'sudachi et poire',  pureeNom: 'Purée de sudachi',      extraSucrG: 30 }),
  confitGroupeB({ id: 'sfa-confit-yuzu',             nom: 'Confit yuzu et poire',     parfum: 'yuzu et poire',     pureeNom: 'Purée de yuzu',         extraSucrG: 30 }),
];

// ════════════════════════════════════════════════════════════════════════════
//  MARSHMALLOWS
// ════════════════════════════════════════════════════════════════════════════
// Groupe A (base purée) : Gélatine A 36 g · Sucre inverti A 165 g
//   Purée A 350 g · Purée B 100 g · Sucre B 250 g · Sucre inverti B 100 g
//   Lemon & Orange : +5 g zeste
// Groupe B (base eau, agrumes concentrés) : Gélatine A 39 g · Sucre inverti A 180 g
//   Purée A 250 g · Eau B 135 g · Sucre B 290 g · Sucre inverti B 105 g

function marshmallowGroupeA({ id, nom, parfum, pureeNom, zesteG = 0 }) {
  const gelG = 36, invAG = 165, pureeAG = 350, pureeBG = 100, sucreBG = 250, invBG = 100;
  const total = gelG + invAG + pureeAG + pureeBG + sucreBG + invBG + zesteG;
  const p = (g) => Math.round(g / total * 100);
  const ingredients = [
    { nom: pureeNom + ' (A)',     g: pureeAG,  pct: p(pureeAG),  role: 'fruit'     },
    { nom: pureeNom + ' (B)',     g: pureeBG,  pct: p(pureeBG),  role: 'fruit'     },
    { nom: 'Sucre semoule (B)',   g: sucreBG,  pct: p(sucreBG),  role: 'sucrant'   },
    { nom: 'Sucre inverti (A)',   g: invAG,    pct: p(invAG),    role: 'sucrant'   },
    { nom: 'Sucre inverti (B)',   g: invBG,    pct: p(invBG),    role: 'sucrant'   },
    { nom: 'Gélatine 200 Bloom',  g: gelG,     pct: p(gelG),     role: 'gélifiant' },
  ];
  if (zesteG > 0) ingredients.push({ nom: 'Zeste d\'agrume', g: zesteG, pct: p(zesteG), role: 'arôme' });
  return {
    id, nom,
    categorie: 'decors',
    sous_categorie: 'marshmallow',
    description: `Guimauve ${parfum} soufflée, roulée sucre glace/amidon.`,
    masse_totale_g: total,
    ingredients,
    procede: [
      'Hydrater la gélatine dans la purée A (couper les feuilles si besoin) pendant 20 min.',
      'Cuire le sucre B, le sucre inverti B et la purée B à 110 °C.',
      'Verser le sucre inverti A et la gélatine hydratée dans la cuve du batteur.',
      zesteG > 0 ? 'Ajouter le zeste d\'agrume dans la cuve.' : null,
      'Verser le mélange cuit à 110 °C et fouetter.',
      'Fouetter jusqu\'à refroidissement à 25–28 °C.',
      'Pocher ou couler en cadre. Sécher 12 h. Détailler et rouler dans un mélange à parts égales de sucre glace et fécule.',
    ].filter(Boolean),
    cuisson: { temperature_c: 110, duree_min: null, mode: 'sucre cuit' },
    temperatures: { service_c: 18, conservation_c: 18 },
    contraintes: { vegan: false, sans_lactose: true, sans_gluten: true, ig_bas: false },
    a_verifier: false,
    allergenes: [],   // la gélatine n'est pas un allergène INCO — voir contraintes.vegan
    tags: ['guimauve', 'marshmallow', parfum, 'agrume', 'décor', 'confiserie'],
    parfum_principal: parfum,
    note_concepteur: zesteG > 0 ? 'L\'ajout de zeste renforce l\'intensité aromatique.' : null,
    source_interne: SRC,
  };
}

function marshmallowGroupeB({ id, nom, parfum, pureeNom }) {
  const gelG = 39, invAG = 180, pureeAG = 250, eauBG = 135, sucreBG = 290, invBG = 105;
  const total = gelG + invAG + pureeAG + eauBG + sucreBG + invBG;
  const p = (g) => Math.round(g / total * 100);
  return {
    id, nom,
    categorie: 'decors',
    sous_categorie: 'marshmallow',
    description: `Guimauve ${parfum} sur base eau — technique adaptée aux purées très concentrées.`,
    masse_totale_g: total,
    ingredients: [
      { nom: pureeNom,             g: pureeAG,  pct: p(pureeAG),  role: 'fruit'     },
      { nom: 'Sucre semoule (B)',   g: sucreBG,  pct: p(sucreBG),  role: 'sucrant'   },
      { nom: 'Sucre inverti (A)',   g: invAG,    pct: p(invAG),    role: 'sucrant'   },
      { nom: 'Sucre inverti (B)',   g: invBG,    pct: p(invBG),    role: 'sucrant'   },
      { nom: 'Eau (partie B)',      g: eauBG,    pct: p(eauBG),    role: 'eau'       },
      { nom: 'Gélatine 200 Bloom',  g: gelG,     pct: p(gelG),     role: 'gélifiant' },
    ],
    procede: [
      'Hydrater la gélatine dans la purée (couper les feuilles) pendant 20 min. Faire fondre au micro-ondes.',
      'Cuire le sucre B, le sucre inverti B et l\'eau B à 110 °C.',
      'Verser le sucre inverti A et la gélatine fondue dans la cuve du batteur.',
      'Verser le mélange cuit à 110 °C et fouetter.',
      'Fouetter jusqu\'à refroidissement à 25–28 °C.',
      'Pocher ou couler en cadre. Sécher 12 h. Détailler et rouler dans sucre glace/fécule.',
    ],
    cuisson: { temperature_c: 110, duree_min: null, mode: 'sucre cuit' },
    temperatures: { service_c: 18, conservation_c: 18 },
    contraintes: { vegan: false, sans_lactose: true, sans_gluten: true, ig_bas: false },
    a_verifier: false,
    allergenes: [],   // la gélatine n'est pas un allergène INCO — voir contraintes.vegan
    tags: ['guimauve', 'marshmallow', parfum, 'agrume', 'décor', 'confiserie'],
    parfum_principal: parfum,
    note_concepteur: 'La partie B est cuite avec de l\'eau (non de la purée) pour éviter la coagulation des protéines à haute température.',
    source_interne: SRC,
  };
}

const MARSHMALLOWS = [
  marshmallowGroupeA({ id: 'sfa-marshmallow-citron',          nom: 'Guimauve citron',           parfum: 'citron',           pureeNom: 'Purée de citron',           zesteG: 5 }),
  marshmallowGroupeA({ id: 'sfa-marshmallow-citron-vert',     nom: 'Guimauve citron vert',      parfum: 'citron vert',      pureeNom: 'Purée de citron vert' }),
  marshmallowGroupeA({ id: 'sfa-marshmallow-mandarine',       nom: 'Guimauve mandarine',        parfum: 'mandarine',        pureeNom: 'Purée de mandarine' }),
  marshmallowGroupeA({ id: 'sfa-marshmallow-orange',          nom: 'Guimauve orange',           parfum: 'orange',           pureeNom: 'Purée d\'orange',           zesteG: 5 }),
  marshmallowGroupeA({ id: 'sfa-marshmallow-orange-sanguine', nom: 'Guimauve orange sanguine',  parfum: 'orange sanguine',  pureeNom: 'Purée d\'orange sanguine' }),
  marshmallowGroupeA({ id: 'sfa-marshmallow-pamplemousse',    nom: 'Guimauve pamplemousse rose',parfum: 'pamplemousse rose',pureeNom: 'Purée de pamplemousse rose' }),
  marshmallowGroupeB({ id: 'sfa-marshmallow-sudachi',         nom: 'Guimauve sudachi',          parfum: 'sudachi',          pureeNom: 'Purée de sudachi' }),
  marshmallowGroupeB({ id: 'sfa-marshmallow-yuzu',            nom: 'Guimauve yuzu',             parfum: 'yuzu',             pureeNom: 'Purée de yuzu' }),
];

// ════════════════════════════════════════════════════════════════════════════
//  ESPUMAS (1 siphon + 2 cartouches)
// ════════════════════════════════════════════════════════════════════════════
// Purée 350 g (dont 25 g pour hydrater la gélatine)
// Sucre 40 g · Gélatine 5 g · Stabilisateur sorbet 2 g

function espumaAgrume({ id, nom, parfum, pureeNom }) {
  const pureeG = 350, sucreG = 40, gelG = 5, stabG = 2;
  const total = pureeG + sucreG + gelG + stabG;
  const p = (g) => Math.round(g / total * 100);
  return {
    id, nom,
    categorie: 'decors',
    sous_categorie: 'espuma',
    description: `Espuma ${parfum} en siphon, texture aérienne et arôme intense.`,
    masse_totale_g: total,
    ingredients: [
      { nom: pureeNom,                g: pureeG, pct: p(pureeG), role: 'fruit'     },
      { nom: 'Saccharose',            g: sucreG, pct: p(sucreG), role: 'sucrant'   },
      { nom: 'Gélatine 200 Bloom',    g: gelG,   pct: p(gelG),   role: 'gélifiant' },
      { nom: 'Stabilisateur sorbet',  g: stabG,  pct: p(stabG),  role: 'structure' },
    ],
    procede: [
      'Hydrater la gélatine dans 25 g de purée pendant 15–20 min.',
      'Chauffer 100 g de purée à 50 °C avec le sucre et le stabilisateur.',
      'Ajouter la gélatine hydratée. Mélanger.',
      'Incorporer au fouet avec le reste de la purée.',
      'Verser dans le siphon immédiatement (ou réserver).',
      'Gazer avec 2 cartouches. Réfrigérer au moins 2 h à 4 °C avant utilisation.',
    ],
    cuisson: { temperature_c: null, duree_min: null, mode: null },
    temperatures: { service_c: 4, conservation_c: 4 },
    contraintes: { vegan: false, sans_lactose: true, sans_gluten: true, ig_bas: false },
    a_verifier: false,
    allergenes: [],   // la gélatine n'est pas un allergène INCO — voir contraintes.vegan
    tags: ['espuma', 'siphon', parfum, 'agrume', 'décor', 'dessert à l\'assiette'],
    parfum_principal: parfum,
    note_concepteur: null,
    source_interne: SRC,
  };
}

const ESPUMAS = [
  espumaAgrume({ id: 'sfa-espuma-citron',          nom: 'Espuma citron',           parfum: 'citron',           pureeNom: 'Purée de citron'           }),
  espumaAgrume({ id: 'sfa-espuma-citron-concasse',  nom: 'Espuma citron concassé',  parfum: 'citron concassé',  pureeNom: 'Purée de citron concassé'  }),
  espumaAgrume({ id: 'sfa-espuma-citron-vert',      nom: 'Espuma citron vert',      parfum: 'citron vert',      pureeNom: 'Purée de citron vert'      }),
  espumaAgrume({ id: 'sfa-espuma-mandarine',        nom: 'Espuma mandarine',        parfum: 'mandarine',        pureeNom: 'Purée de mandarine'        }),
  espumaAgrume({ id: 'sfa-espuma-orange',           nom: 'Espuma orange',           parfum: 'orange',           pureeNom: 'Purée d\'orange'           }),
  espumaAgrume({ id: 'sfa-espuma-orange-sanguine',  nom: 'Espuma orange sanguine',  parfum: 'orange sanguine',  pureeNom: 'Purée d\'orange sanguine'  }),
  espumaAgrume({ id: 'sfa-espuma-pamplemousse',     nom: 'Espuma pamplemousse rose',parfum: 'pamplemousse rose',pureeNom: 'Purée de pamplemousse rose' }),
  espumaAgrume({ id: 'sfa-espuma-sudachi',          nom: 'Espuma sudachi',          parfum: 'sudachi',          pureeNom: 'Purée de sudachi'          }),
  espumaAgrume({ id: 'sfa-espuma-yuzu',             nom: 'Espuma yuzu',             parfum: 'yuzu',             pureeNom: 'Purée de yuzu'             }),
];

// ════════════════════════════════════════════════════════════════════════════
//  GLAÇAGES
// ════════════════════════════════════════════════════════════════════════════
// Base commune : Glucose 130 g · Pectine NH 9 g · Sucre 130 g · Stab sorbet 5 g
// Variables : Purée · Eau · Sucre supplémentaire (agrumes concentrés)

function glacageAgrume({ id, nom, parfum, pureeNom, pureeG, eauG, sucreSupplG = 0, tempMin, tempMax, note = null }) {
  const glucG = 130, pectG = 9, sucreBaseG = 130, stabG = 5;
  const sucreTotal = sucreBaseG + sucreSupplG;
  const total = glucG + pectG + sucreTotal + stabG + pureeG + eauG;
  const p = (g) => Math.round(g / total * 100);
  return {
    id, nom,
    categorie: 'glacages',
    sous_categorie: 'glacage_miroir',
    description: `Glaçage miroir ${parfum}. Application spatule, tarte ou velour selon température.`,
    masse_totale_g: total,
    ingredients: [
      { nom: pureeNom,               g: pureeG,     pct: p(pureeG),     role: 'fruit'     },
      { nom: 'Eau',                  g: eauG,       pct: p(eauG),       role: 'eau'       },
      { nom: 'Saccharose',           g: sucreTotal, pct: p(sucreTotal), role: 'sucrant'   },
      { nom: 'Glucose',              g: glucG,      pct: p(glucG),      role: 'sucrant'   },
      { nom: 'Pectine NH',           g: pectG,      pct: p(pectG),      role: 'gélifiant' },
      { nom: 'Stabilisateur sorbet', g: stabG,      pct: p(stabG),      role: 'structure' },
    ],
    procede: [
      'Chauffer les liquides (purée + eau) et le glucose à 50 °C.',
      'Incorporer au fouet le mélange sucre, pectine NH et stabilisateur.',
      'Porter à ébullition 1 minute.',
      'Refroidir à 4 °C minimum 4 h.',
      `Réchauffer, mixer et utiliser à ${tempMin}–${tempMax} °C.`,
    ],
    cuisson: { temperature_c: 100, duree_min: 1, mode: 'ébullition' },
    temperatures: { service_c: tempMin, conservation_c: 4 },
    contraintes: { vegan: true, sans_lactose: true, sans_gluten: true, ig_bas: false },
    a_verifier: false,
    allergenes: [],
    tags: ['glaçage', 'miroir', parfum, 'agrume', 'vegan'],
    parfum_principal: parfum,
    note_concepteur: note,
    source_interne: SRC,
  };
}

const GLACAGES = [
  glacageAgrume({ id: 'sfa-glacage-citron',          nom: 'Glaçage citron',          parfum: 'citron',           pureeNom: 'Purée de citron',           pureeG: 200, eauG: 300, sucreSupplG: 50, tempMin: 40, tempMax: 42, note: 'Température d\'utilisation plus élevée pour une meilleure prise sur entremets.' }),
  glacageAgrume({ id: 'sfa-glacage-mandarine',        nom: 'Glaçage mandarine',       parfum: 'mandarine',        pureeNom: 'Purée de mandarine',        pureeG: 420, eauG: 120, tempMin: 27, tempMax: 28 }),
  glacageAgrume({ id: 'sfa-glacage-orange',           nom: 'Glaçage orange',          parfum: 'orange',           pureeNom: 'Purée d\'orange',           pureeG: 400, eauG: 120, tempMin: 27, tempMax: 28 }),
  glacageAgrume({ id: 'sfa-glacage-orange-sanguine',  nom: 'Glaçage orange sanguine', parfum: 'orange sanguine',  pureeNom: 'Purée d\'orange sanguine',  pureeG: 400, eauG: 120, tempMin: 27, tempMax: 28 }),
  glacageAgrume({ id: 'sfa-glacage-sudachi',          nom: 'Glaçage sudachi',         parfum: 'sudachi',          pureeNom: 'Purée de sudachi',          pureeG: 100, eauG: 400, sucreSupplG: 70, tempMin: 35, tempMax: 37 }),
  glacageAgrume({ id: 'sfa-glacage-yuzu',             nom: 'Glaçage yuzu',            parfum: 'yuzu',             pureeNom: 'Purée de yuzu',             pureeG: 100, eauG: 400, sucreSupplG: 50, tempMin: 35, tempMax: 37 }),
];

// ════════════════════════════════════════════════════════════════════════════
//  BISCUITS (plaque 40×60 cm)
// ════════════════════════════════════════════════════════════════════════════
// Base commune : Sucre 200 g · Blancs en poudre 40 g · Jaunes 65 g · Beurre fondu 100 g
//   Amandes poudre 175 g · Farine 175 g · Levure 4 g
// Groupe A (purée seule) : 500 g purée
// Groupe A+ : 500 g purée + 25 g blancs poudre extra
// Groupe B (dilué) : 125 g purée + 375 g eau + 25 g blancs poudre extra

function biscuitGroupeA({ id, nom, parfum, pureeNom, pureeG = 500, extrablancsG = 0 }) {
  const sucreG = 200, blancsG = 40 + extrablancsG, jaunesG = 65, beurrG = 100;
  const amandesG = 175, farineG = 175, levureG = 4;
  const total = sucreG + blancsG + jaunesG + beurrG + amandesG + farineG + levureG + pureeG;
  const p = (g) => Math.round(g / total * 100);
  return {
    id, nom,
    categorie: 'biscuits',
    sous_categorie: 'biscuit_leger',
    description: `Biscuit ${parfum} pour plaque 40×60 cm. Moelleux et fruité, cuit 8–10 min à 200 °C.`,
    masse_totale_g: total,
    ingredients: [
      { nom: pureeNom,             g: pureeG,   pct: p(pureeG),   role: 'fruit'      },
      { nom: 'Sucre semoule',      g: sucreG,   pct: p(sucreG),   role: 'sucrant'    },
      { nom: 'Amandes en poudre',  g: amandesG, pct: p(amandesG), role: 'structure'  },
      { nom: 'Farine T55',         g: farineG,  pct: p(farineG),  role: 'structure'  },
      { nom: 'Blancs d\'œufs en poudre', g: blancsG, pct: p(blancsG), role: 'liant' },
      { nom: 'Beurre 82% fondu froid', g: beurrG, pct: p(beurrG), role: 'mg'       },
      { nom: 'Jaunes d\'œufs',     g: jaunesG,  pct: p(jaunesG),  role: 'liant'     },
      { nom: 'Levure chimique',    g: levureG,  pct: p(levureG),  role: 'levant'    },
    ],
    procede: [
      'Au batteur, monter la purée, les blancs en poudre et le sucre.',
      'Ajouter les jaunes à vitesse lente.',
      'À la maryse, incorporer farine, levure et amandes poudre tamisées ensemble.',
      'Terminer avec le beurre fondu froid.',
      'Étaler immédiatement sur plaque. Cuire 8–10 min à 200 °C.',
    ],
    cuisson: { temperature_c: 200, duree_min: 9, mode: 'four ventilé' },
    temperatures: { service_c: 18, conservation_c: 4 },
    contraintes: { vegan: false, sans_lactose: false, sans_gluten: false, ig_bas: false },
    a_verifier: false,
    allergenes: ['fruits_a_coque', 'gluten', 'lait', 'oeuf'],
    tags: ['biscuit', parfum, 'agrume', 'plaque', 'entremets'],
    parfum_principal: parfum,
    note_concepteur: null,
    source_interne: SRC,
  };
}

function biscuitGroupeB({ id, nom, parfum, pureeNom }) {
  const pureeG = 125, eauG = 375, sucreG = 200, blancsG = 40 + 25, jaunesG = 65, beurrG = 100;
  const amandesG = 175, farineG = 175, levureG = 4;
  const total = sucreG + blancsG + jaunesG + beurrG + amandesG + farineG + levureG + pureeG + eauG;
  const p = (g) => Math.round(g / total * 100);
  return {
    id, nom,
    categorie: 'biscuits',
    sous_categorie: 'biscuit_leger',
    description: `Biscuit ${parfum} dilué — purée concentrée allongée à l'eau. Plaque 40×60 cm.`,
    masse_totale_g: total,
    ingredients: [
      { nom: pureeNom,             g: pureeG,   pct: p(pureeG),   role: 'fruit'      },
      { nom: 'Eau',                g: eauG,     pct: p(eauG),     role: 'eau'        },
      { nom: 'Sucre semoule',      g: sucreG,   pct: p(sucreG),   role: 'sucrant'    },
      { nom: 'Amandes en poudre',  g: amandesG, pct: p(amandesG), role: 'structure'  },
      { nom: 'Farine T55',         g: farineG,  pct: p(farineG),  role: 'structure'  },
      { nom: 'Blancs d\'œufs en poudre', g: blancsG, pct: p(blancsG), role: 'liant' },
      { nom: 'Beurre 82% fondu froid', g: beurrG, pct: p(beurrG), role: 'mg'       },
      { nom: 'Jaunes d\'œufs',     g: jaunesG,  pct: p(jaunesG),  role: 'liant'     },
      { nom: 'Levure chimique',    g: levureG,  pct: p(levureG),  role: 'levant'    },
    ],
    procede: [
      'Mélanger la purée et l\'eau.',
      'Au batteur, monter le mélange purée/eau, les blancs en poudre et le sucre.',
      'Ajouter les jaunes à vitesse lente.',
      'À la maryse, incorporer farine, levure et amandes poudre tamisées ensemble.',
      'Terminer avec le beurre fondu froid.',
      'Étaler immédiatement sur plaque. Cuire 8–10 min à 200 °C.',
    ],
    cuisson: { temperature_c: 200, duree_min: 9, mode: 'four ventilé' },
    temperatures: { service_c: 18, conservation_c: 4 },
    contraintes: { vegan: false, sans_lactose: false, sans_gluten: false, ig_bas: false },
    a_verifier: false,
    allergenes: ['fruits_a_coque', 'gluten', 'lait', 'oeuf'],
    tags: ['biscuit', parfum, 'agrume', 'plaque', 'entremets'],
    parfum_principal: parfum,
    note_concepteur: 'La purée est diluée avec de l\'eau pour équilibrer l\'intensité des agrumes très concentrés.',
    source_interne: SRC,
  };
}

const BISCUITS_SFA = [
  biscuitGroupeA({ id: 'sfa-biscuit-citron',          nom: 'Biscuit citron',          parfum: 'citron',          pureeNom: 'Purée de citron'          }),
  biscuitGroupeA({ id: 'sfa-biscuit-citron-concasse',  nom: 'Biscuit citron concassé', parfum: 'citron concassé', pureeNom: 'Purée de citron concassé' }),
  biscuitGroupeA({ id: 'sfa-biscuit-mandarine',        nom: 'Biscuit mandarine',       parfum: 'mandarine',       pureeNom: 'Purée de mandarine',       extrablancsG: 25 }),
  biscuitGroupeB({ id: 'sfa-biscuit-sudachi',          nom: 'Biscuit sudachi',         parfum: 'sudachi',         pureeNom: 'Purée de sudachi'         }),
  biscuitGroupeB({ id: 'sfa-biscuit-yuzu',             nom: 'Biscuit yuzu',            parfum: 'yuzu',            pureeNom: 'Purée de yuzu'            }),
];

// ════════════════════════════════════════════════════════════════════════════
//  EXPORT
// ════════════════════════════════════════════════════════════════════════════

export const RECETTES_SIGNATURE_FRUIT_AGRUMES = [
  ...GLACES,
  ...SORBETS,
  ...MOUSSES,
  ...CREMEUX,
  ...CONFITS,
  ...MARSHMALLOWS,
  ...ESPUMAS,
  ...GLACAGES,
  ...BISCUITS_SFA,
];

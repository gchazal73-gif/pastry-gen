/**
 * templates_mousses.js — Templates B·Concept pour les mousses aux fruits
 * ========================================================================
 * Ratios vérifiés contre :
 *   - Jordi Bordas, "Pastelería más saludable, ligera y sabrosa" (2021)
 *     • Mousse de framboise   : purée 62,4 % / agar 0,24 % / huile coco 10,1 % / blancs 15,3 % / sucrant 8 %
 *     • Mousse de mangue      : purée 63,2 % / agar 0,31 % / huile coco 10 %   / blancs 14,9 % / sucrant 8 %
 *     • Mousse coco (vegan)   : lait coco 70,6 % / agar 0,27 % / aquafaba 14,1 % / sucrant 11,9 %
 *   - Jordi Bordas, So Good #13 (version professionnelle)
 *     • Mousse litchi légère  : purée 63,2 % / gélatine 1,28 % / crème 10 % / albumine 2,3 % / sucre+glucose 15,5 %
 *   - Eddie Benghanem, "Le Grand Cours de Pâtisserie" (classiques de référence)
 *   - Weiss "Livre du Savoir-Faire" (mousses chocolat)
 *
 * PRINCIPES B·CONCEPT (Bordas) :
 *   • Purée de fruit très haute (60-63 %) → intensité maximale
 *   • Aération par BLANCS MONTÉS (pas de crème fouettée)
 *   • Matière grasse : huile de coco 10 % comme stabilisateur
 *   • Émulsifiant : lécithine 0,1 %
 *   • Gélifiant : agar-agar + amidon (version saine) OU gélatine (version pro)
 *   • Sucrant : oligofructose ou sucre de coco (IG bas par défaut)
 *   • PAS de meringue italienne au sirop cuit, PAS d'anglaise
 *
 * 4 TEMPLATES :
 *   1. mousse_bconcept_fruit      — Bordas authentique (agar + huile coco + blancs)
 *   2. mousse_legere_classique    — Classique français (gélatine + crème fouettée)
 *   3. mousse_bavaroise_fruit     — Anglaise + crème fouettée (Benghanem/Weiss)
 *   4. mousse_meringue_italienne  — Meringue italienne + crème fouettée (Benghanem)
 *
 * Interface engine.js :
 *   { label, description, parfumsCompat, formats?, lines[], process(pid, c) }
 *   Ligne : { label, pct, getIngredient(pid,c), actif?(pid,c), pctOverride?(pid,c) }
 *
 * NOTE : pctOverride reçoit (parfumId, c) — le format est dans c.format.
 */

import { PARFUMS } from './data.js';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const isPeuAcide  = (pid) => PARFUMS[pid]?.peu_acide_ph === true;
const hasEnzyme   = (pid) => PARFUMS[pid]?.enzyme === true;
const parfumLabel = (pid) => PARFUMS[pid]?.label?.toLowerCase() ?? 'fruit';
const pureeNom    = (pid) => `Purée de ${parfumLabel(pid)}`;

// ── Substitutions selon contraintes ──────────────────────────────────────────

/** Crème 35% ou crème de coco (SL/vegan) */
const creme   = (c) => c.vegan || c.lactose ? 'Crème de coco 24 % MG' : 'Crème liquide 35 % MG';
/** Lait ou boisson d'avoine */
const lait    = (c) => c.vegan || c.lactose ? "Boisson d'avoine (barista)" : 'Lait entier UHT';
/** Sucrant IG bas ou semoule */
const sucrant = (c) => c.igbas || c.bien_etre ? 'Sucre de coco' : 'Sucre semoule';
/** Gélifiant principal pour mousses classiques */
const gelifiantClassique = (c) => c.vegan ? 'Agar-agar' : 'Gélatine feuilles 200 Bloom';
/** Dose gélifiant en % — agar = 0,4 × gélatine */
const doseGelClassique   = (base, c) => c.vegan ? base * 0.4 : base;
/** Jaunes ou aquafaba */
const jaunes  = (c) => c.vegan ? 'Aquafaba (eau de pois chiches)' : "Jaune d'œuf pasteurisé";
/** Blancs ou aquafaba */
const blancs  = (c) => c.vegan ? 'Aquafaba (eau de pois chiches)' : "Blanc d'œuf pasteurisé";

// ── Notes techniques ──────────────────────────────────────────────────────────

const noteEnzyme = (pid) => hasEnzyme(pid)
  ? `⚠ ${PARFUMS[pid].label} contient une protéase qui détruit la gélatine. `
  + `Chauffer la purée à 85 °C — 2 min pour dénaturer l'enzyme avant utilisation.`
  : null;

const noteAcide = (pid) => isPeuAcide(pid)
  ? `Fruit peu acide (pH > 3,8) : ajout d'acide tartrique pour abaisser le pH `
  + `et activer la pectine / stabiliser la gélatine.`
  : null;

// ── parfumsCompat partagé ────────────────────────────────────────────────────

const PARFUMS_COMPAT_MOUSSES = [
  "framboise","fraise","cassis","mure","myrtille","groseille","grenade","cerise",
  "abricot","peche","prune","mirabelle",
  "poire","pomme","coing","raisin",
  "mangue","passion","ananas","kiwi","banane","coco","litchi","figue","fpassion_mangue",
  "citron","citron_vert","yuzu","orange","mandarine","pamplemousse","bergamote",
  "rhubarbe","marron",
];

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1 — Mousse B·Concept aux fruits (Bordas authentique)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * RATIOS B·CONCEPT (moyennés sur mousses framboise + mangue + litchi Bordas) :
 *
 *   Purée de fruit        62,0 %   ← haute teneur = intensité maximale
 *   Amidon de maïs         3,5 %   ← épaissit la base gélifiée
 *   Gélifiant (agar)       0,3 %   ← agar 0,3 % OU gélatine 0,8 % (pro)
 *   Eau hydratation        0,0 %   ← agar ne nécessite pas de pré-hydratation
 *   Huile de coco désod.  10,0 %   ← source de MG, stabilise l'émulsion
 *   Lécithine de tournesol 0,1 %   ← émulsifiant
 *   Blancs d'œufs         16,0 %   ← agent aérant (meringue légère)
 *   Oligofructose/suc.coco 8,0 %   ← sucrant IG bas (Bordas par défaut)
 *   Acide tartrique (+0,1% si peu acide)
 *                        ──────
 *                        100,0 %   ← blancs absorbent le solde
 *
 * SOURCE : Bordas, "Pastelería más saludable" pp. 156, 182 + So Good #13
 */
export const TPL_MOUSSE_BCONCEPT_FRUIT = {
  label: 'Mousse aux fruits — agar et huile de coco',
  description:
    'Mousse haute-teneur en fruit (60-62 %), légèreté par blancs montés (pas de crème fouettée), '
  + 'matière grasse par huile de coco désodorisée, gélifiant agar-agar + amidon. '
  + 'Sans lactose et vegan par défaut. Intensité aromatique maximale.',
  parfumsCompat: PARFUMS_COMPAT_MOUSSES,
  formats: {
    verrine:  'Verrine',
    insert:   'Insert entremets',
    entremet: 'Entremets moulé',
  },
  lines: [
    {
      label: 'Purée de fruit',
      pct: 62,
      getIngredient: (pid, _c) => ({
        nom: pureeNom(pid),
        note: noteEnzyme(pid),
      }),
    },
    {
      label: 'Amidon de maïs',
      pct: 3.5,
      getIngredient: () => ({
        nom: 'Amidon de maïs (Maïzena)',
        note: 'Épaissit la base gélifiée avant incorporation des blancs. Mélanger à froid avant chauffage.',
      }),
    },
    {
      label: 'Gélifiant',
      pct: 0.3,
      pctOverride: (_pid, c) => c.vegan ? 0.3 : 0.8,
      getIngredient: (_pid, c) => ({
        nom: c.vegan ? 'Agar-agar' : 'Gélatine feuilles 200 Bloom',
        note: c.vegan
          ? 'Porter la purée à ébullition 2 min. Gel irréversible à 45 °C.'
          : 'Version pro — hydrater 10 min dans 5× son poids en eau froide.',
      }),
    },
    {
      label: 'Eau (hydratation gélatine)',
      pct: 4,
      actif: (_pid, c) => !c.vegan,
      getIngredient: () => ({ nom: 'Eau' }),
    },
    {
      label: 'Huile de coco désodorisée',
      pct: 10,
      getIngredient: () => ({
        nom: 'Huile de coco désodorisée',
        note: "Stabilise l'émulsion fruit/air. Fondre à 35 °C avant usage. Sans goût parasite (version désodorisée).",
      }),
    },
    {
      label: 'Lécithine de tournesol',
      pct: 0.1,
      getIngredient: () => ({
        nom: 'Lécithine de tournesol',
        note: 'Émulsifiant. Disperser dans la matière grasse (huile coco) avant incorporation.',
      }),
    },
    {
      label: 'Acide tartrique',
      pct: 0.1,
      actif: (pid) => isPeuAcide(pid),
      getIngredient: (pid) => ({
        nom: 'Acide tartrique',
        note: noteAcide(pid),
      }),
    },
    {
      label: "Blancs d'œufs (meringue légère)",
      pct: 0,
      pctOverride: (pid, c) => {
        let fixed = 62 + 3.5 + 0.1; // purée + amidon + lécithine
        fixed += c.vegan ? 0.3 : (0.8 + 4); // gélifiant + eau si non-vegan
        fixed += 10; // huile coco
        if (isPeuAcide(pid)) fixed += 0.1;
        return Math.max(0, 100 - fixed - 8); // blancs = 100 - fixed - sucrant(8%)
      },
      getIngredient: (_pid, c) => ({
        nom: blancs(c),
        note: c.vegan
          ? 'Aquafaba : ajouter crème de tartre 0,1 % pour stabiliser. Monter 10 min à vitesse élevée.'
          : 'Monter 3 min à vitesse moyenne, puis 7 min après ajout du sucrant — meringue légère et brillante.',
      }),
    },
    {
      label: 'Sucrant (oligofructose)',
      pct: 8,
      getIngredient: (_pid, c) => ({
        nom: c.igbas || c.bien_etre ? 'Oligofructose en poudre' : 'Sucre de coco',
        note: 'Ajouter progressivement pendant le montage des blancs.',
      }),
    },
  ],

  process: (pid, c) => {
    const steps = [];

    if (!c.vegan) {
      steps.push('Hydrater la gélatine 10 min dans 5× son poids en eau froide.');
    }

    if (hasEnzyme(pid)) {
      steps.push(
        `Chauffer toute la purée de ${parfumLabel(pid)} à 85 °C — maintenir 2 min `
      + "pour dénaturer la protéase. Refroidir à 30 °C avant usage."
      );
    }

    steps.push(
      "Mélanger l'amidon de maïs et l'agar (ou préparer la masse gélatine). "
    + 'Chauffer la moitié de la purée à 30 °C dans une casserole, '
    + "ajouter le mélange amidon en pluie en fouettant, puis porter à ébullition 2 min "
    + "(agar) ou dissoudre la masse gélatine hors du feu (gélatine)."
    );

    if (isPeuAcide(pid)) {
      steps.push("Incorporer l'acide tartrique à la purée chaude.");
    }

    steps.push(
      "Fondre l'huile de coco à 35 °C. Disperser la lécithine dans l'huile. "
    + 'Combiner avec la base purée chaude et la moitié de purée froide restante. '
    + "Émulsionner 1 min au mixeur plongeant jusqu'à texture lisse et brillante. "
    + 'Laisser refroidir à 30 °C.'
    );

    steps.push(
      `Monter les ${blancs(c).toLowerCase()} à vitesse moyenne 3 min`
    + (c.vegan ? ' (avec crème de tartre 0,1 %)' : '')
    + ". Ajouter l'oligofructose (ou sucre de coco) progressivement. "
    + 'Augmenter à vitesse élevée et monter 7 min supplémentaires — '
    + 'meringue légère, brillante, qui tient au fouet sans être trop serrée.'
    );

    steps.push(
      'Lorsque la base purée est à 30 °C, incorporer la base émulsionnée dans la meringue '
    + 'à la maryse en 2-3 fois, en soulevant délicatement pour ne pas casser les blancs.'
    );

    steps.push(
      'Couler immédiatement. Réfrigérer 4 h minimum (verrine) ou surgeler (insert / entremets moulé).'
    );

    return steps;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 2 — Mousse légère classique aux fruits
// ─────────────────────────────────────────────────────────────────────────────
/**
 * RATIOS (version française classique, Benghanem / Weiss) :
 *
 *   Purée de fruit        40,0 %
 *   Sucrant                7,0 %
 *   Gélifiant (gélatine)   1,0 %  ← 0,3 % agar si vegan
 *   Eau hydratation        5,0 %  ← 0 % si vegan
 *   Crème fouettée        47,0 %  ← crème de coco si SL/vegan
 *                         ──────
 *                         100,0 %
 *
 * GÉLATINE par format (Benghanem, mousse exotique p. 459) :
 *   Verrine  → 0,7 % gélatine
 *   Insert   → 1,2 % gélatine
 *   Entremets moulé → 2,0 % gélatine
 */
export const TPL_MOUSSE_LEGERE_CLASSIQUE = {
  label: 'Mousse légère classique aux fruits',
  description:
    'Version française classique (Benghanem / Weiss) — purée de fruit 40 %, '
  + 'légèreté par crème fouettée. Texture onctueuse, moins fruitée que le B·Concept.',
  parfumsCompat: PARFUMS_COMPAT_MOUSSES,
  formats: {
    verrine:  'Verrine',
    insert:   'Insert entremets',
    entremet: 'Entremets moulé',
  },
  lines: [
    {
      label: 'Purée de fruit',
      pct: 40,
      getIngredient: (pid, _c) => ({
        nom: pureeNom(pid),
        note: noteEnzyme(pid),
      }),
    },
    {
      label: 'Sucrant',
      pct: 7,
      getIngredient: (_pid, c) => ({ nom: sucrant(c) }),
    },
    {
      label: 'Gélifiant',
      pct: 1.0,
      pctOverride: (_pid, c) => {
        if (c.vegan) return 0.3; // agar, dose fixe indépendante du format
        // Gélatine : ajustée par format (c.format vient de l'engine)
        const doses = { verrine: 0.7, insert: 1.2, entremet: 2.0 };
        return doses[c.format] ?? 1.0;
      },
      getIngredient: (_pid, c) => ({
        nom: gelifiantClassique(c),
        note: c.vegan
          ? 'Agar : porter à ébullition 2 min dans le liquide chaud.'
          : 'Hydrater 10 min dans 5× son poids en eau froide.',
      }),
    },
    {
      label: 'Eau (hydratation gélatine)',
      pct: 5,
      actif: (_pid, c) => !c.vegan,
      getIngredient: () => ({ nom: 'Eau' }),
    },
    {
      label: 'Acide tartrique',
      pct: 0.1,
      actif: (pid) => isPeuAcide(pid),
      getIngredient: (pid) => ({ nom: 'Acide tartrique', note: noteAcide(pid) }),
    },
    {
      label: 'Crème fouettée',
      pct: 0,
      pctOverride: (pid, c) => {
        const gelPct = c.vegan ? 0.3 : (doses => doses[c.format] ?? 1.0)({ verrine: 0.7, insert: 1.2, entremet: 2.0 });
        let fixed = 40 + 7 + gelPct;
        if (!c.vegan) fixed += 5;
        if (isPeuAcide(pid)) fixed += 0.1;
        return Math.max(0, 100 - fixed);
      },
      getIngredient: (_pid, c) => ({ nom: creme(c) }),
    },
  ],

  process: (pid, c) => {
    const steps = [];
    if (!c.vegan) steps.push('Hydrater la gélatine 10 min dans 5× son poids en eau froide.');
    if (hasEnzyme(pid)) steps.push(`Chauffer la purée de ${parfumLabel(pid)} à 85 °C — 2 min. Refroidir.`);
    steps.push(
      `Chauffer 1/3 de la purée à ${c.vegan ? '100' : '65–70'} °C. `
    + (c.vegan
        ? "Porter à ébullition 2 min avec l'agar. Incorporer la purée froide restante."
        : "Dissoudre la masse gélatine hors du feu. Incorporer la purée froide restante.")
    + ' Refroidir à 30–35 °C.'
    );
    if (isPeuAcide(pid)) steps.push("Incorporer l'acide tartrique à la purée gélifiée.");
    steps.push(`Monter la ${creme(c).toLowerCase()} en pics souples.`);
    steps.push('Incorporer la crème fouettée à la purée gélifiée en 2–3 fois à la maryse.');
    steps.push('Couler immédiatement. Réfrigérer 3 h (verrine) ou surgeler.');
    return steps;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 3 — Mousse bavaroise aux fruits
// ─────────────────────────────────────────────────────────────────────────────
/**
 * RATIOS (Benghanem, bavarois framboise p. 452 — recalculés sur masse réelle) :
 *
 *   Lait (base anglaise)   17,0 %   ← lait d'avoine si SL/vegan
 *   Jaunes d'œufs          14,0 %   ← aquafaba si vegan
 *   Sucrant                12,0 %
 *   Purée de fruit         29,0 %
 *   Gélifiant (gélatine)    0,9 %   ← 0,36 % agar si vegan
 *   Eau hydratation         4,5 %   ← 0 % si vegan
 *   Crème fouettée         22,6 %   ← crème de coco si SL/vegan
 *                          ──────
 *                          100,0 %
 *
 * SOURCE : Benghanem p. 452
 */
export const TPL_MOUSSE_BAVAROISE_FRUIT = {
  label: 'Mousse bavaroise aux fruits',
  description:
    'Crème anglaise (lait + jaunes) + purée de fruit gélifiée, allégée à la crème fouettée. '
  + 'Texture riche et onctueuse. Classique français (Benghanem). '
  + 'Moins fruitée que le B·Concept.',
  parfumsCompat: PARFUMS_COMPAT_MOUSSES,
  formats: {
    verrine:  'Verrine',
    entremet: 'Entremets moulé',
  },
  lines: [
    {
      label: 'Lait (base anglaise)',
      pct: 17,
      getIngredient: (_pid, c) => ({ nom: lait(c) }),
    },
    {
      label: "Jaunes d'œufs",
      pct: 14,
      getIngredient: (_pid, c) => ({
        nom: jaunes(c),
        note: c.vegan ? 'Aquafaba : ajouter 2 % amidon de maïs pour lier.' : null,
      }),
    },
    {
      label: 'Sucrant',
      pct: 12,
      getIngredient: (_pid, c) => ({ nom: sucrant(c) }),
    },
    {
      label: 'Purée de fruit',
      pct: 29,
      getIngredient: (pid, _c) => ({
        nom: pureeNom(pid),
        note: noteEnzyme(pid),
      }),
    },
    {
      label: 'Gélifiant',
      pct: 0.9,
      pctOverride: (_pid, c) => doseGelClassique(0.9, c),
      getIngredient: (_pid, c) => ({
        nom: gelifiantClassique(c),
        note: c.vegan ? 'Agar : bouillir 2 min.' : 'Hydrater 10 min dans 5× son poids en eau froide.',
      }),
    },
    {
      label: 'Eau (hydratation gélatine)',
      pct: 4.5,
      actif: (_pid, c) => !c.vegan,
      getIngredient: () => ({ nom: 'Eau' }),
    },
    {
      label: 'Acide tartrique',
      pct: 0.1,
      actif: (pid) => isPeuAcide(pid),
      getIngredient: (pid) => ({ nom: 'Acide tartrique', note: noteAcide(pid) }),
    },
    {
      label: 'Crème fouettée',
      pct: 0,
      pctOverride: (pid, c) => {
        let fixed = 17 + 14 + 12 + 29;
        fixed += doseGelClassique(0.9, c);
        if (!c.vegan) fixed += 4.5;
        if (isPeuAcide(pid)) fixed += 0.1;
        return Math.max(0, 100 - fixed);
      },
      getIngredient: (_pid, c) => ({ nom: creme(c) }),
    },
  ],

  process: (pid, c) => {
    const steps = [];
    if (!c.vegan) steps.push('Hydrater la gélatine 10 min dans 5× son poids en eau froide.');
    if (hasEnzyme(pid)) steps.push(`Chauffer la purée de ${parfumLabel(pid)} à 85 °C — 2 min. Refroidir.`);
    steps.push(
      `Anglaise : porter ${lait(c).toLowerCase()} à frémissement. `
    + `Fouetter les ${c.vegan ? 'aquafaba' : 'jaunes'} avec le ${sucrant(c).toLowerCase()}. `
    + 'Verser le liquide chaud, reverser en casserole, cuire à 82 °C sans bouillir.'
    );
    steps.push(
      c.vegan
        ? "Incorporer la purée + agar. Porter à ébullition 2 min. Refroidir à 35 °C."
        : "Hors du feu, dissoudre la masse gélatine. Filtrer. Incorporer la purée de fruit. Refroidir à 35 °C."
    );
    if (isPeuAcide(pid)) steps.push("Incorporer l'acide tartrique à la base refroidie.");
    steps.push(`Monter la crème (2) en pics souples${c.vegan || c.lactose ? ' (crème de coco froide)' : ''}.`);
    steps.push('À 35 °C, incorporer délicatement la crème fouettée à la maryse. Travailler rapidement.');
    steps.push('Couler immédiatement. Réfrigérer 4 h ou surgeler.');
    return steps;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 4 — Mousse meringue italienne aux fruits
// ─────────────────────────────────────────────────────────────────────────────
/**
 * RATIOS (Benghanem, mousse fruits des bois p. 456 + mousse exotique p. 459) :
 *
 *   Purée de fruit         55,0 %   ← Benghanem : 35-56 %
 *   Gélifiant (gélatine)    0,7 %   ← Benghanem fruits des bois : 4g/600g
 *   Eau hydratation         3,5 %
 *   Blancs d'œufs           5,0 %
 *   Sucre (sirop MI)        8,0 %
 *   Glucose (sirop MI)      4,0 %
 *   Eau (sirop MI)          3,0 %
 *   Crème fouettée         20,8 %
 *                          ──────
 *                          100,0 %
 *
 * Format entremets → gélatine 2,5 % (Benghanem mousse exotique p. 459).
 * SOURCE : Benghanem pp. 456, 459.
 */
export const TPL_MOUSSE_MERINGUE_ITALIENNE = {
  label: 'Mousse aux fruits — Meringue italienne',
  description:
    'Purée de fruit gélifiée, légèreté par meringue italienne (blancs + sirop 118 °C) '
  + 'et crème fouettée. La classique des mousses fruits. '
  + 'Vérifiée sur Benghanem — gélatine adaptée par format.',
  parfumsCompat: PARFUMS_COMPAT_MOUSSES,
  formats: {
    verrine:  'Verrine',
    insert:   'Insert entremets',
    entremet: 'Entremets moulé',
  },
  lines: [
    {
      label: 'Purée de fruit',
      pct: 55,
      getIngredient: (pid, _c) => ({
        nom: pureeNom(pid),
        note: noteEnzyme(pid),
      }),
    },
    {
      label: 'Gélifiant',
      pct: 0.7,
      pctOverride: (_pid, c) => {
        if (c.vegan) return 0.28; // agar
        const doses = { verrine: 0.7, insert: 1.5, entremet: 2.5 };
        return doses[c.format] ?? 0.7;
      },
      getIngredient: (_pid, c) => ({
        nom: gelifiantClassique(c),
        note: c.vegan
          ? 'Agar : bouillir 2 min dans la purée chaude.'
          : 'Hydrater 10 min dans 5× son poids en eau froide. Dose adaptée selon le format (verrine < insert < entremets).',
      }),
    },
    {
      label: 'Eau (hydratation gélatine)',
      pct: 3.5,
      actif: (_pid, c) => !c.vegan,
      getIngredient: () => ({ nom: 'Eau' }),
    },
    {
      label: 'Blancs — meringue italienne',
      pct: 5,
      getIngredient: (_pid, c) => ({
        nom: blancs(c),
        note: c.vegan ? 'Aquafaba : crème de tartre 0,1 % pour stabiliser.' : null,
      }),
    },
    {
      label: 'Sucrant — sirop meringue',
      pct: 8,
      getIngredient: (_pid, c) => ({ nom: sucrant(c) }),
    },
    {
      label: 'Glucose DE38 — sirop meringue',
      pct: 4,
      getIngredient: () => ({
        nom: 'Sirop de glucose DE38',
        note: 'Évite la recristallisation. Apporte souplesse à la meringue.',
      }),
    },
    {
      label: 'Eau — sirop meringue',
      pct: 3,
      getIngredient: () => ({ nom: 'Eau' }),
    },
    {
      label: 'Acide tartrique',
      pct: 0.1,
      actif: (pid) => isPeuAcide(pid),
      getIngredient: (pid) => ({ nom: 'Acide tartrique', note: noteAcide(pid) }),
    },
    {
      label: 'Crème fouettée',
      pct: 0,
      pctOverride: (pid, c) => {
        const gelPct = c.vegan ? 0.28 : ({ verrine: 0.7, insert: 1.5, entremet: 2.5 }[c.format] ?? 0.7);
        let fixed = 55 + gelPct + 5 + 8 + 4 + 3;
        if (!c.vegan) fixed += 3.5;
        if (isPeuAcide(pid)) fixed += 0.1;
        return Math.max(0, 100 - fixed);
      },
      getIngredient: (_pid, c) => ({ nom: creme(c) }),
    },
  ],

  process: (pid, c) => {
    const steps = [];
    if (!c.vegan) steps.push('Hydrater la gélatine 10 min dans 5× son poids en eau froide.');
    if (hasEnzyme(pid)) steps.push(`Chauffer la purée de ${parfumLabel(pid)} à 85 °C — 2 min. Refroidir.`);
    steps.push(
      'Chauffer 1/3 de la purée à 65 °C. '
    + (c.vegan ? "Dissoudre l'agar, porter à ébullition 2 min." : "Dissoudre la masse gélatine hors du feu.")
    + ' Incorporer la purée froide restante. Refroidir à 30 °C.'
    );
    if (isPeuAcide(pid)) steps.push("Incorporer l'acide tartrique à la purée.");
    steps.push(
      `Sirop meringue : cuire l'eau, le ${sucrant(c).toLowerCase()} et le glucose à 118 °C.`
    );
    steps.push(
      `Monter les ${blancs(c).toLowerCase()} en neige souple`
    + (c.vegan ? ' avec crème de tartre 0,1 %' : '')
    + ". Verser le sirop à 118 °C en filet fin sans cesser de fouetter. "
    + "Fouetter jusqu'à refroidissement — meringue brillante, ferme et tiède (40 °C)."
    );
    steps.push(`Monter la crème fouettée${c.vegan || c.lactose ? ' de coco' : ''} en pics souples.`);
    steps.push(
      'Incorporer la crème fouettée dans la meringue à la maryse. '
    + 'Ajouter la purée gélifiée en 2 fois délicatement.'
    );
    steps.push('Couler immédiatement. Surgeler (entremets) ou réfrigérer 4 h (verrine).');
    return steps;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export const TEMPLATES_MOUSSES = {
  /** B·Concept authentique Bordas — purée 62 %, blancs, agar, huile coco */
  mousse_bconcept_fruit:      TPL_MOUSSE_BCONCEPT_FRUIT,
  /** Classique français — purée 40 %, gélatine, crème fouettée */
  mousse_legere_classique:    TPL_MOUSSE_LEGERE_CLASSIQUE,
  /** Bavaroise — anglaise + purée + crème fouettée (Benghanem) */
  mousse_bavaroise_fruit:     TPL_MOUSSE_BAVAROISE_FRUIT,
  /** Meringue italienne — purée + MI sirop 118 °C + crème (Benghanem) */
  mousse_meringue_italienne:  TPL_MOUSSE_MERINGUE_ITALIENNE,
};

/** Familles de parfums compatibles avec les mousses fruits */
export const MOUSSES_FRUIT_FAMILLES = [
  'fruit_rouge', 'fruit_noyau', 'fruit_pepin', 'fruit_exo', 'agrume', 'vegetal',
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLEAU RÉCAPITULATIF (documentation interne)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Template                    | Purée | Crème | Blancs | Gélifiant | Source
 * ────────────────────────────|-------|-------|--------|-----------|─────────────────
 * mousse_bconcept_fruit       | 62 %  |  0 %  | 16 %   | agar 0,3 %| Bordas (2021)
 * mousse_legere_classique     | 40 %  | 47 %  |  0 %   | gél. 1 %  | Weiss / Benghanem
 * mousse_bavaroise_fruit      | 29 %  | 23 %  |  0 %   | gél. 0,9 %| Benghanem p. 452
 * mousse_meringue_italienne   | 55 %  | 21 %  |  5 %   | gél. 0,7 %| Benghanem p. 456
 */

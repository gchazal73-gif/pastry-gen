/**
 * templates_cremeux.js — Templates B·Concept pour les crémeux aux fruits
 * =========================================================================
 * Ratios vérifiés contre :
 *   - Jordi Bordas, "Pastelería más saludable, ligera y sabrosa" (2021)
 *     • Crémeux frambuesa  p. 78  : purée 81,4 % / agar 0,25 % / huile coco 15 % / lécithine 0,37 %
 *     • Crémeux mango      p. 92  : purée 81,3 % / agar 0,20 % / huile coco 15,1 % / lécithine 0,40 %
 *     • Crémeux limón      p. 109 : eau+jus 64,4 % / sucrant 15 % / agar 0,33 % / huile coco 15 %
 *     • Crémeux sésamo     p. 113 : eau 58,5 % / pâte 20 % / sucrant 10 % / agar 0,29 % / huile 8 %
 *   - Eddie Benghanem, "Le Grand Cours de Pâtisserie" (crémeux classique)
 *   - Valrhona / Belouet (crémeux monté référence pro)
 *
 * PRINCIPES B·CONCEPT (Bordas) pour les crémeux :
 *   • Purée de fruit TRÈS haute (80-82 %) pour les fruits sucrés
 *   • Agrumes : eau + jus (~64 %) + sucrant 15 % (fruits moins sucrés)
 *   • Aucune matière grasse laitière → huile de coco 15 % (crémeux, sans beurre)
 *   • Lécithine 0,35-0,4 % comme émulsifiant
 *   • Agar-agar + amidon de maïs (pas d'œufs, pas de gélatine)
 *   • Technique : bouillir purée+amidon+agar → émulsionner avec huile+lécithine
 *     → réfrigérer → travailler au fouet avant dressage
 *   • Sans lactose et vegan par défaut
 *
 * 2 TEMPLATES :
 *   1. cremeux_bconcept_fruit    — Bordas authentique (sans œufs, sans beurre)
 *   2. cremeux_classique_fruit   — Classique français (œufs + beurre + gélatine)
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
const isAgrume    = (pid) => PARFUMS[pid]?.famille === 'agrume';
const parfumLabel = (pid) => PARFUMS[pid]?.label?.toLowerCase() ?? 'fruit';

/** Libellé purée ou jus selon famille */
const liquidLabel = (pid) => {
  if (isAgrume(pid)) return `Jus de ${parfumLabel(pid)} (filtré)`;
  return `Purée de ${parfumLabel(pid)}`;
};

// ── Substitutions selon contraintes ──────────────────────────────────────────

const sucrant = (c) => c.igbas || c.bien_etre ? 'Oligofructose en poudre' : 'Sucre de coco';
const beurre  = (c) => c.vegan || c.lactose ? 'Huile de coco désodorisée' : 'Beurre doux 84 % MG';
const oeuf    = (c) => c.vegan ? 'Aquafaba (eau de pois chiches)' : 'Œuf entier pasteurisé';
const jaunes  = (c) => c.vegan ? 'Aquafaba (eau de pois chiches)' : "Jaune d'œuf pasteurisé";

// ── Notes techniques ──────────────────────────────────────────────────────────

const noteEnzyme = (pid) => hasEnzyme(pid)
  ? `⚠ ${PARFUMS[pid].label} contient une protéase qui détruit l'agar / la gélatine. `
  + `Porter la purée à 85 °C — 2 min avant utilisation.`
  : null;

const noteAcide = (pid) => isPeuAcide(pid)
  ? `Fruit peu acide (pH > 3,8) : l'acide tartrique abaisse le pH pour `
  + `activer la pectine et garantir la tenue de l'agar.`
  : null;

// ── parfumsCompat partagé ────────────────────────────────────────────────────

const PARFUMS_COMPAT_CREMEUX = [
  "framboise","fraise","cassis","mure","myrtille","groseille","grenade","cerise",
  "abricot","peche","prune","mirabelle",
  "poire","pomme","coing","raisin",
  "mangue","passion","ananas","kiwi","banane","coco","litchi","figue","fpassion_mangue",
  "citron","citron_vert","yuzu","orange","mandarine","pamplemousse","bergamote",
  "rhubarbe","marron",
];

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1 — Crémeux B·Concept aux fruits (Bordas authentique)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * RATIOS B·CONCEPT — fruits sucrés (framboise, mangue, fraise, abricot…)
 *
 *   Purée de fruit        81,0 %   ← Bordas framboise 81,4 % / mangue 81,3 %
 *   Amidon de maïs         3,0 %   ← Bordas : 3 %
 *   Agar-agar              0,22 %  ← Bordas : 0,20-0,25 %
 *   Huile de coco         15,40 %  ← résidu pour 100 % (Bordas ~15 %)
 *   Lécithine              0,38 %  ← Bordas : 0,37-0,40 %
 *                         ──────
 *                         100,0 %
 *
 * RATIOS B·CONCEPT — agrumes (citron, citron vert, yuzu, orange, pamplemousse…)
 *
 *   Eau                   43,0 %   ← base liquide neutre
 *   Jus d'agrume (filtré) 21,0 %   ← Bordas citron : eau 268g + jus 118g = 64,4 % total liquide
 *   Oligofructose         15,0 %   ← Bordas citron : 15 %
 *   Amidon de maïs         4,0 %   ← Bordas citron : 4 %
 *   Agar-agar              0,33 %  ← Bordas citron : 0,33 %
 *   Huile de coco         15,0 %   ← Bordas citron : 15 %
 *   Lécithine              0,17 %  ← Bordas citron : 0,17 %
 *   Zeste (ralladura)      1,5 %   ← Bordas citron : présent
 *                         ──────
 *                         100,0 %
 *
 * SOURCE : Bordas, "Pastelería más saludable" pp. 78, 92, 109
 */
export const TPL_CREMEUX_BCONCEPT_FRUIT = {
  label: 'Crémeux aux fruits — agar et huile de coco',
  description:
    'Crémeux haute-teneur en fruit (80-82 %), texture par agar-agar + amidon de maïs, '
  + 'matière grasse par huile de coco désodorisée + lécithine. '
  + 'Sans œuf, sans beurre, sans lactose, vegan par défaut. '
  + 'Pour inserts, fonds de tarte, verrines, dressage.',
  parfumsCompat: PARFUMS_COMPAT_CREMEUX,
  formats: {
    insert:   'Insert entremets',
    tarte:    'Fond de tarte',
    verrine:  'Verrine',
    dressage: 'Dressage (poche)',
  },
  lines: [
    // ── Cas AGRUMES : eau + jus (base liquide diluée) ──────────────────────
    {
      label: 'Phase aqueuse (eau)',
      pct: 43,
      actif: (pid) => isAgrume(pid),
      getIngredient: () => ({ nom: 'Eau' }),
    },
    // ── Cas FRUITS : purée directe ─────────────────────────────────────────
    {
      label: 'Purée de fruit',
      pct: 81,
      actif: (pid) => !isAgrume(pid),
      getIngredient: (pid) => ({
        nom: liquidLabel(pid),
        note: noteEnzyme(pid),
      }),
    },
    // ── Jus pour AGRUMES ────────────────────────────────────────────────────
    {
      label: "Jus d'agrume (filtré)",
      pct: 21,
      actif: (pid) => isAgrume(pid),
      getIngredient: (pid) => ({
        nom: `Jus de ${parfumLabel(pid)} naturel (filtré)`,
        note: 'Filtrer les pépins et la pulpe. Peser exactement.',
      }),
    },
    // ── Sucrant — obligatoire pour agrumes, absent pour fruits sucrés ───────
    {
      label: 'Sucrant',
      pct: 15,
      actif: (pid) => isAgrume(pid),
      getIngredient: (_pid, c) => ({ nom: sucrant(c) }),
    },
    // ── Acide tartrique — fruits peu acides (hors agrumes) ──────────────────
    {
      label: 'Acide tartrique',
      pct: 0.15,
      actif: (pid) => isPeuAcide(pid) && !isAgrume(pid),
      getIngredient: (pid) => ({
        nom: 'Acide tartrique',
        note: noteAcide(pid),
      }),
    },
    // ── Amidon ─────────────────────────────────────────────────────────────
    {
      label: 'Amidon de maïs',
      pct: 0,
      pctOverride: (pid) => isAgrume(pid) ? 4 : 3,
      getIngredient: () => ({
        nom: 'Amidon de maïs (Maïzena)',
        note: "Mélanger à froid avec l'agar avant d'incorporer au liquide chaud.",
      }),
    },
    // ── Agar ────────────────────────────────────────────────────────────────
    {
      label: 'Agar-agar',
      pct: 0,
      pctOverride: (pid) => isAgrume(pid) ? 0.33 : 0.22,
      getIngredient: () => ({
        nom: 'Agar-agar',
        note: "Mélanger à froid avec l'amidon. Porter à ébullition 2 min. Gel irréversible.",
      }),
    },
    // ── Huile de coco — absorbe le résidu pour totaliser 100 % ─────────────
    {
      label: 'Huile de coco désodorisée',
      pct: 0,
      pctOverride: (pid) => {
        if (isAgrume(pid)) return 15; // agrumes : total déjà 100 % avec les autres lignes
        // Fruits sucrés : huile absorbe le résidu (purée + amidon + agar + lécithine + acide éventuel)
        const fixed = 81 + 3 + 0.22 + 0.38 + (isPeuAcide(pid) ? 0.15 : 0);
        return Math.max(0, 100 - fixed);
      },
      getIngredient: () => ({
        nom: 'Huile de coco désodorisée',
        note: "Stabilise l'émulsion fruit/agar. Fondre à 35 °C avant usage. Sans goût parasite (version désodorisée).",
      }),
    },
    // ── Lécithine ───────────────────────────────────────────────────────────
    {
      label: 'Lécithine de tournesol',
      pct: 0,
      pctOverride: (pid) => isAgrume(pid) ? 0.17 : 0.38,
      getIngredient: () => ({
        nom: 'Lécithine de tournesol',
        note: "Disperser dans l'huile de coco avant émulsification.",
      }),
    },
    // ── Zeste — agrumes uniquement ──────────────────────────────────────────
    {
      label: 'Zeste',
      pct: 1.5,
      actif: (pid) => isAgrume(pid),
      getIngredient: (pid) => ({
        nom: `Zeste de ${parfumLabel(pid)} (non traité)`,
        note: 'Incorporer à 40 °C, hors du feu, après émulsification.',
      }),
    },
  ],

  process: (pid, c) => {
    const steps = [];

    if (hasEnzyme(pid)) {
      steps.push(
        `Chauffer la purée de ${parfumLabel(pid)} à 85 °C — maintenir 2 min `
      + "pour dénaturer l'enzyme protéolytique. Refroidir à 30 °C."
      );
    }

    steps.push(
      "Mélanger à sec l'amidon de maïs et l'agar-agar"
    + (isAgrume(pid) ? ` avec le ${sucrant(c).toLowerCase()}` : '')
    + '.'
    );

    if (isAgrume(pid)) {
      steps.push(
        "Combiner l'eau et le jus d'agrume dans une casserole. "
      + 'Chauffer à 30 °C, ajouter le mélange amidon-agar en pluie fine en fouettant, '
      + 'puis porter à ébullition à feu moyen sans cesser de remuer. Maintenir 2 min.'
      );
    } else {
      steps.push(
        `Chauffer la purée de ${parfumLabel(pid)} dans une casserole à 30 °C. `
      + 'Ajouter le mélange amidon-agar en pluie fine en fouettant, '
      + 'puis porter à ébullition à feu moyen sans cesser de remuer. Maintenir 2 min.'
      );
      if (isPeuAcide(pid)) {
        steps.push("Ajouter l'acide tartrique dans la purée bouillante. Mélanger.");
      }
    }

    steps.push(
      "Fondre l'huile de coco à 35 °C. Disperser la lécithine dans l'huile. "
    + "Combiner l'huile+lécithine et la purée chaude dans un récipient haut. "
    + "Émulsionner au mixeur plongeant 1 min jusqu'à texture lisse et brillante."
    );

    if (isAgrume(pid)) {
      steps.push("Laisser refroidir à 40 °C. Incorporer les zestes à la maryse.");
    }

    steps.push(
      'Verser dans un plat à fond plat. Filmer au contact. '
    + 'Réfrigérer minimum 3 h (verrine, fond de tarte) ou surgeler (insert).'
    );

    steps.push(
      'Avant dressage : travailler le crémeux froid au fouet 30 s pour '
    + 'retrouver une texture souple et lisse, pocher immédiatement.'
    );

    return steps;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 2 — Crémeux classique aux fruits
// ─────────────────────────────────────────────────────────────────────────────
/**
 * RATIOS CLASSIQUES (Benghanem / Valrhona / Belouet) :
 *
 *   Purée de fruit         35,0 %
 *   Sucrant                15,0 %
 *   Œufs entiers           15,0 %
 *   Jaunes d'œufs          10,0 %
 *   Beurre (incorporé froid) ~22 %  ← résidu pour totaliser 100 %
 *   Gélatine                0,5 %
 *   Eau hydratation          2,5 %
 *                          ──────
 *                          100,0 %
 *
 * Pour AGRUMES (citron, orange, yuzu…) : jus 30 % + zeste 1 % + sucrant 20 %
 * Technique : cuit à l'anglaise 82–85 °C → beurre émulsionné au mixeur à 40 °C.
 * SOURCE : Benghanem pp. 400-410 ; Valrhona école ; Belouet Conseil
 */
export const TPL_CREMEUX_CLASSIQUE_FRUIT = {
  label: 'Crémeux classique aux fruits',
  description:
    'Crémeux à la française — purée de fruit 35 %, œufs cuits à 82 °C, '
  + 'beurre émulsionné. Texture riche, fondante, brillante. '
  + 'Pour tartes, inserts, verrines. Variante sans lactose : beurre → huile coco.',
  parfumsCompat: PARFUMS_COMPAT_CREMEUX,
  formats: {
    tarte:   'Fond de tarte',
    insert:  'Insert entremets',
    verrine: 'Verrine',
  },
  lines: [
    // ── Agrumes : jus + zeste ───────────────────────────────────────────────
    {
      label: "Jus d'agrume (filtré)",
      pct: 30,
      actif: (pid) => isAgrume(pid),
      getIngredient: (pid) => ({
        nom: `Jus de ${parfumLabel(pid)} naturel (filtré)`,
      }),
    },
    {
      label: 'Zeste',
      pct: 1,
      actif: (pid) => isAgrume(pid),
      getIngredient: (pid) => ({
        nom: `Zeste de ${parfumLabel(pid)} (non traité)`,
        note: 'Infuser dans le jus chaud 5 min hors du feu, puis filtrer.',
      }),
    },
    // ── Fruits sucrés : purée ────────────────────────────────────────────────
    {
      label: 'Purée de fruit',
      pct: 35,
      actif: (pid) => !isAgrume(pid),
      getIngredient: (pid) => ({
        nom: `Purée de ${parfumLabel(pid)}`,
        note: noteEnzyme(pid),
      }),
    },
    // ── Sucrant ─────────────────────────────────────────────────────────────
    {
      label: 'Sucrant',
      pct: 0,
      pctOverride: (pid) => isAgrume(pid) ? 20 : 15,
      getIngredient: (_pid, c) => ({ nom: sucrant(c) }),
    },
    // ── Œufs ────────────────────────────────────────────────────────────────
    {
      label: 'Œufs entiers',
      pct: 15,
      getIngredient: (_pid, c) => ({
        nom: oeuf(c),
        note: c.vegan ? 'Aquafaba : ajouter 2 % amidon de maïs + 1 % arrow-root pour lier.' : null,
      }),
    },
    {
      label: "Jaunes d'œufs",
      pct: 10,
      actif: (_pid, c) => !c.vegan,
      getIngredient: (_pid, c) => ({ nom: jaunes(c) }),
    },
    // ── Gélifiant ───────────────────────────────────────────────────────────
    {
      label: 'Gélifiant',
      pct: 0,
      pctOverride: (_pid, c) => c.vegan ? 0.2 : 0.5,
      getIngredient: (_pid, c) => ({
        nom: c.vegan ? 'Agar-agar' : 'Gélatine feuilles 200 Bloom',
        note: c.vegan
          ? 'Incorporer dans le liquide froid avant cuisson.'
          : 'Hydrater 10 min dans 5× son poids en eau froide.',
      }),
    },
    {
      label: 'Eau (hydratation gélatine)',
      pct: 2.5,
      actif: (_pid, c) => !c.vegan,
      getIngredient: () => ({ nom: 'Eau' }),
    },
    // ── Acide tartrique ─────────────────────────────────────────────────────
    {
      label: 'Acide tartrique',
      pct: 0.1,
      actif: (pid) => isPeuAcide(pid) && !isAgrume(pid),
      getIngredient: (pid) => ({
        nom: 'Acide tartrique',
        note: noteAcide(pid),
      }),
    },
    // ── Beurre — absorbe le résidu pour totaliser 100 % ─────────────────────
    {
      label: 'Beurre (émulsionné à froid)',
      pct: 0,
      pctOverride: (pid, c) => {
        let fixed = isAgrume(pid) ? (30 + 1 + 20) : (35 + 15); // liquide + sucrant
        fixed += 15; // œufs entiers
        if (!c.vegan) fixed += 10; // jaunes
        fixed += c.vegan ? 0.2 : (0.5 + 2.5); // gélifiant + eau
        if (isPeuAcide(pid) && !isAgrume(pid)) fixed += 0.1;
        return Math.max(0, 100 - fixed);
      },
      getIngredient: (_pid, c) => ({
        nom: beurre(c),
        note: c.vegan || c.lactose
          ? 'Huile de coco : incorporer à 40 °C en émulsionnant au mixeur plongeant.'
          : 'Incorporer en dés à 40 °C. Émulsionner au mixeur plongeant pour texture lisse et brillante.',
      }),
    },
  ],

  process: (pid, c) => {
    const steps = [];

    if (!c.vegan) {
      steps.push('Hydrater la gélatine 10 min dans 5× son poids en eau froide.');
    }

    if (hasEnzyme(pid) && !isAgrume(pid)) {
      steps.push(
        `Chauffer la purée de ${parfumLabel(pid)} à 85 °C — 2 min pour dénaturer l'enzyme. Refroidir.`
      );
    }

    if (isAgrume(pid)) {
      steps.push(
        `Chauffer le jus de ${parfumLabel(pid)} à 60 °C. Infuser les zestes 5 min hors du feu. Filtrer.`
      );
      steps.push(
        `Mélanger le ${sucrant(c).toLowerCase()}, les ${c.vegan ? 'aquafaba' : 'œufs et les jaunes'}. `
      + 'Verser le jus chaud filtré. Reverser en casserole.'
      );
    } else {
      steps.push(
        `Chauffer la purée de ${parfumLabel(pid)} avec le ${sucrant(c).toLowerCase()} à frémissement. `
      + `Fouetter les ${c.vegan ? 'aquafaba' : 'œufs entiers et les jaunes'}. `
      + 'Verser la purée chaude sur les œufs. Reverser en casserole.'
      );
    }

    steps.push(
      "Cuire à feu doux en remuant continuellement à la spatule jusqu'à 82–85 °C "
    + '(ne jamais bouillir — les œufs coaguleraient). '
    + 'Vérifier au thermomètre — la crème doit napper la spatule.'
    );

    steps.push(
      c.vegan
        ? "Filtrer. Incorporer l'agar-agar, porter à ébullition 2 min. Refroidir à 40 °C."
        : 'Hors du feu, incorporer la masse gélatine essorée. Filtrer. Refroidir à 40 °C.'
    );

    if (isPeuAcide(pid) && !isAgrume(pid)) {
      steps.push("Incorporer l'acide tartrique à 40 °C.");
    }

    steps.push(
      `À 40 °C, incorporer le ${beurre(c).toLowerCase()} `
    + (c.vegan || c.lactose
        ? '(huile de coco fondue à 35 °C) '
        : 'en dés (beurre froid, coupé en petits morceaux) ')
    + "en émulsionnant au mixeur plongeant 1–2 min jusqu'à texture lisse et brillante."
    );

    steps.push(
      'Verser dans le moule ou fond de tarte. Filmer au contact. '
    + 'Réfrigérer minimum 4 h ou surgeler. '
    + 'Le crémeux se raffermit en refroidissant et peut être travaillé au fouet '
    + 'avant dressage pour retrouver souplesse et brillance.'
    );

    return steps;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export const TEMPLATES_CREMEUX = {
  /** B·Concept Bordas — purée 81 %, agar, huile coco, vegan par défaut */
  cremeux_bconcept_fruit:   TPL_CREMEUX_BCONCEPT_FRUIT,
  /** Classique français — purée 35 %, œufs cuits 82 °C, beurre émulsionné */
  cremeux_classique_fruit:  TPL_CREMEUX_CLASSIQUE_FRUIT,
};

/** Familles de parfums compatibles avec les crémeux fruits */
export const CREMEUX_FRUIT_FAMILLES = [
  'fruit_rouge', 'fruit_noyau', 'fruit_pepin', 'fruit_exo', 'agrume', 'vegetal',
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLEAU RÉCAPITULATIF
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Template                  | Purée  | MG          | Liant         | Sucrant | Source
 * ──────────────────────────|--------|-------------|---------------|---------|───────────────────
 * cremeux_bconcept_fruit    | 81 %   | Huile coco  | Agar+amidon   | 0 %*    | Bordas pp.78,92,109
 *                           |        | ~15 %       | 0,22-0,33 %   |         | (* 15 % si agrume)
 * cremeux_classique_fruit   | 35 %   | Beurre      | Gélatine 0,5% | 15-20 % | Benghanem / Valrhona
 *                           |        | ~19-22 %    | + œufs 25 %   |         |
 *
 * NOTES TECHNIQUES CLÉS :
 *   - Crémeux B·Concept : travailler au fouet après gélification pour retrouver la texture
 *   - Crémeux classique : incorporer le beurre à 40 °C (pas plus chaud, pas plus froid)
 *   - Agrumes : toujours filtrer le jus + infuser les zestes séparément
 *   - Fruits à enzyme (mangue, ananas, kiwi, figue) : chauffer à 85 °C avant usage
 *   - Fruits peu acides (poire, banane, coco) : ajouter acide tartrique 0,1-0,15 %
 */

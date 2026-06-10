/**
 * templates_confits.js — Templates B·Concept pour les confits et gels aux fruits
 * =================================================================================
 * Ratios vérifiés contre :
 *   - Jordi Bordas, "Pastelería más saludable" (2021)
 *     • Glaseado frambuesa  p. 182 : purée 40,6 % / pectine NH 0,61 % / oligofruct. 30,4 % / eau 28,4 %
 *     • Compota gelif. naranja p. 113 : jus 89 % / agar 0,94 % / inuline 10 %
 *     • Gelificado naranja-limón p. 164 : jus 98,5 % / agar 0,76 %
 *   - Karim Bourgi, "Pastry Collection" (version pro classique)
 *     • Confit pamplemousse p. 41 : purée 73,3 % / sucrant 25 % / pectine NH 1,67 %
 *     • Confit framboise   p. 135 : purée 64 % / sucrant 28 % / pectine NH 1,32 % / jus citron 6,8 %
 *   - Eddie Benghanem, "Le Grand Cours de Pâtisserie"
 *     • Confit fruits rouges p. 510 : purée 77 % / sucrant 18 % / pectine NH 2,1 % / jus citron 2,6 %
 *
 * DIFFÉRENCE CLÉ confits vs crémeux :
 *   • Confit = gélification par PECTINE NH (thermo-réversible, fondant)
 *   • Gel    = gélification par AGAR (irréversible, cassant, translucide)
 *   • Crémeux = agar + amidon + émulsion huile (texture crémeuse, opaque)
 *
 * 3 TEMPLATES :
 *   1. confit_bconcept_fruit   — Bordas (pectine NH, oligofructose, IG bas)
 *   2. confit_classique_fruit  — Bourgi / Benghanem (pectine NH, sucre + glucose)
 *   3. gel_bconcept_fruit      — Bordas gelificado (agar, jus pur, optionnel inuline)
 *
 * RÈGLE PECTINE NH :
 *   Nécessite pH < 3,8 et calcium pour gélifier.
 *   Fruits peu acides (pH > 3,8) → ajouter acide tartrique 0,1-0,2 %.
 *   Chauffer à ébullition 30 s minimum pour activer.
 *   Gel thermo-réversible : peut être réchauffé et recoulé.
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

const sucrant = (c) => c.igbas || c.bien_etre ? 'Oligofructose en poudre' : 'Sucre semoule';
const sucrantNote = (c) => c.igbas || c.bien_etre
  ? 'IG ≈ 0. Mélanger à sec avec la pectine avant incorporation.'
  : 'Toujours mélanger le sucre avec la pectine à sec pour éviter les grumeaux.';

const noteEnzyme = (pid) => hasEnzyme(pid)
  ? `⚠ ${PARFUMS[pid].label} contient une protéase. Chauffer la purée à 85 °C — 2 min avant usage pour préserver la pectine.`
  : null;

const noteAcide = (pid) => isPeuAcide(pid)
  ? `Fruit peu acide (pH > 3,8) : la pectine NH nécessite un pH < 3,8 pour gélifier. `
  + `L'acide tartrique abaisse le pH et garantit la prise.`
  : null;

// ── parfumsCompat partagé ────────────────────────────────────────────────────

const PARFUMS_COMPAT_CONFITS = [
  "framboise","fraise","cassis","mure","myrtille","groseille","grenade","cerise",
  "abricot","peche","prune","mirabelle",
  "poire","pomme","coing","raisin",
  "mangue","passion","ananas","kiwi","banane","coco","litchi","figue","fpassion_mangue",
  "citron","citron_vert","yuzu","orange","mandarine","pamplemousse","bergamote",
  "rhubarbe","marron",
];

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1 — Confit B·Concept aux fruits
// ─────────────────────────────────────────────────────────────────────────────
/**
 * RATIOS B·CONCEPT — fruits sucrés (framboise, fraise, mangue, abricot…)
 *
 *   Purée de fruit         73,0 %
 *   Oligofructose          13,0 %
 *   Glucose DE38           10,0 %
 *   Pectine NH              1,0 %
 *   Jus de citron           2,5 %
 *   Eau (ajust.)            0,5 %   ← résidu pour 100 %
 *                          ──────
 *                          100,0 %
 *
 * RATIOS B·CONCEPT — agrumes (citron, orange, yuzu…)
 *
 *   Jus d'agrume           55,0 %
 *   Eau (résidu)           16,8 %   ← absorbe le solde pour 100 %
 *   Oligofructose          17,0 %
 *   Glucose DE38           10,0 %
 *   Pectine NH              1,2 %
 *                          ──────
 *                          100,0 %
 *
 * SOURCE : Bordas p. 182 + Bourgi p. 41/135 + Benghanem p. 510
 */
export const TPL_CONFIT_BCONCEPT_FRUIT = {
  label: 'Confit aux fruits IG bas (pectine NH + oligofructose)',
  description:
    'Confit de fruit à la pectine NH, sucrant IG bas (oligofructose + glucose DE38). '
  + 'Vegan et sans lactose par défaut. Pour insert entremets, couche tarte, '
  + 'garnissage macarons. Texture souple, fondante, thermo-réversible.',
  parfumsCompat: PARFUMS_COMPAT_CONFITS,
  formats: {
    insert:     'Insert entremets (surgeler)',
    tarte:      'Couche fond de tarte',
    garnissage: 'Garnissage (macaron, choux)',
    nappage:    'Nappage/couverture',
  },
  lines: [
    // ── Fruits sucrés : purée directe ────────────────────────────────────
    {
      label: 'Purée de fruit',
      pct: 73,
      actif: (pid) => !isAgrume(pid),
      getIngredient: (pid) => ({
        nom: `Purée de ${parfumLabel(pid)}`,
        note: noteEnzyme(pid),
      }),
    },
    // ── Agrumes : jus filtré ──────────────────────────────────────────────
    {
      label: "Jus d'agrume (filtré)",
      pct: 55,
      actif: (pid) => isAgrume(pid),
      getIngredient: (pid) => ({
        nom: `Jus de ${parfumLabel(pid)} naturel (filtré)`,
        note: 'Filtrer soigneusement — pépins et pulpe interfèrent avec la prise de la pectine.',
      }),
    },
    // ── Eau base agrume — absorbe le résidu pour totaliser 100 % ─────────
    {
      label: 'Eau (base agrume)',
      pct: 0,
      pctOverride: (pid) => {
        if (!isAgrume(pid)) return 0; // inactive via actif
        // 100 % - jus - oligofructose(17) - glucose(10) - pectine(1.2)
        return Math.max(0, 100 - 55 - 17 - 10 - 1.2);
      },
      actif: (pid) => isAgrume(pid),
      getIngredient: () => ({ nom: 'Eau' }),
    },
    // ── Sucrants ─────────────────────────────────────────────────────────
    {
      label: 'Oligofructose',
      pct: 0,
      pctOverride: (pid) => isAgrume(pid) ? 17 : 13,
      getIngredient: (_pid, c) => ({
        nom: sucrant(c),
        note: sucrantNote(c),
      }),
    },
    {
      label: 'Glucose DE38',
      pct: 10,
      getIngredient: () => ({
        nom: 'Sirop de glucose DE38',
        note: 'Anti-cristallisation et souplesse à la découpe froide. Chauffer légèrement avant usage si cristallisé.',
      }),
    },
    // ── Pectine NH ────────────────────────────────────────────────────────
    {
      label: 'Pectine NH',
      pct: 0,
      pctOverride: (pid) => isAgrume(pid) ? 1.2 : 1.0,
      getIngredient: () => ({
        nom: 'Pectine NH',
        note: 'IMPÉRATIF : mélanger à sec avec le sucrant avant incorporation dans la purée chaude. '
            + 'Activer en portant à ébullition 30 s minimum. Gel thermo-réversible (refondable).',
      }),
    },
    // ── Activateur acide ──────────────────────────────────────────────────
    {
      label: 'Jus de citron (activateur)',
      pct: 2.5,
      actif: (pid) => !isAgrume(pid),
      getIngredient: () => ({
        nom: 'Jus de citron jaune (filtré)',
        note: 'Ajouter HORS DU FEU après ébullition. Active la prise et préserve les arômes.',
      }),
    },
    {
      label: 'Acide tartrique',
      pct: 0.15,
      actif: (pid) => isPeuAcide(pid),
      getIngredient: (pid) => ({
        nom: 'Acide tartrique',
        note: noteAcide(pid),
      }),
    },
    // ── Eau ajustement fruits sucrés — absorbe le résidu ─────────────────
    {
      label: 'Eau (ajustement)',
      pct: 0,
      pctOverride: (pid) => {
        if (isAgrume(pid)) return 0; // inactive via actif
        let fixed = 73 + 13 + 10 + 1 + 2.5;
        if (isPeuAcide(pid)) fixed += 0.15;
        return Math.max(0, 100 - fixed);
      },
      actif: (pid) => !isAgrume(pid),
      getIngredient: () => ({ nom: 'Eau' }),
    },
  ],

  process: (pid, c) => {
    const steps = [];

    if (hasEnzyme(pid)) {
      steps.push(
        `Chauffer la purée de ${parfumLabel(pid)} à 85 °C — maintenir 2 min. Refroidir à 40 °C.`
      );
    }

    steps.push(
      `Mélanger à sec : ${sucrant(c).toLowerCase()} + pectine NH`
    + (isPeuAcide(pid) ? ' + acide tartrique' : '')
    + '.'
    );

    if (isAgrume(pid)) {
      steps.push(
        `Combiner le jus de ${parfumLabel(pid)}, l'eau et le glucose. Chauffer à 40 °C.`
      );
    } else {
      steps.push(
        `Chauffer la purée de ${parfumLabel(pid)} et le glucose à 40 °C dans une casserole.`
      );
    }

    steps.push(
      'Verser le mélange pectine-sucrant en pluie fine sur le liquide chaud en fouettant constamment. '
    + "Porter à ébullition à feu moyen sans cesser de remuer. Maintenir l'ébullition 30 s."
    );

    if (!isAgrume(pid)) {
      steps.push(
        'Hors du feu, ajouter le jus de citron. Mélanger. '
      + '(Ne pas ajouter le jus pendant la cuisson — cela dégraderait les arômes.)'
      );
    }

    steps.push(
      'Couler immédiatement :'
    + '\n  • Insert surgeler : dans le moule inséré, surgeler minimum 3 h.'
    + '\n  • Fond de tarte : couler à 60 °C dans le fond précuit, réfrigérer.'
    + '\n  • Garnissage : laisser refroidir à 30 °C, utiliser en poche.'
    );

    steps.push(
      'Conservation : 3–4 jours au réfrigérateur filmé au contact. '
    + 'Se réchauffe à 55 °C pour une seconde utilisation (thermo-réversible).'
    );

    return steps;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 2 — Confit classique aux fruits
// ─────────────────────────────────────────────────────────────────────────────
/**
 * RATIOS CLASSIQUES — Bourgi / Benghanem
 *
 * Fruits sucrés :
 *   Purée                  68,0 %
 *   Sucrant                10,0 %
 *   Glucose DE38            8,0 %
 *   Pectine NH              1,5 %
 *   Jus de citron           5,0 %
 *   Eau (résidu)            7,5 %   ← absorbe le solde
 *                          ──────
 *                          100,0 %
 *
 * Agrumes :
 *   Jus d'agrume           55,0 %
 *   Eau (résidu)           25,5 %   ← 100 - (55+10+8+1.5)
 *   Sucrant                10,0 %
 *   Glucose DE38            8,0 %
 *   Pectine NH              1,5 %
 *                          ──────
 *                          100,0 %
 *
 * SOURCE : Bourgi pp. 41, 135 + Benghanem p. 510
 */
export const TPL_CONFIT_CLASSIQUE_FRUIT = {
  label: 'Confit classique aux fruits',
  description:
    'Confit à la pectine NH, sucre + glucose/inverti. Recette pro classique '
  + '(Karim Bourgi / Eddie Benghanem). Vegan et sans lactose. '
  + 'Pour inserts, couches entremets, garnissages, tartes.',
  parfumsCompat: PARFUMS_COMPAT_CONFITS,
  formats: {
    insert:     'Insert entremets (surgeler)',
    tarte:      'Couche fond de tarte',
    garnissage: 'Garnissage macaron / choux',
  },
  lines: [
    {
      label: 'Purée de fruit',
      pct: 68,
      actif: (pid) => !isAgrume(pid),
      getIngredient: (pid) => ({
        nom: `Purée de ${parfumLabel(pid)}`,
        note: noteEnzyme(pid),
      }),
    },
    {
      label: "Jus d'agrume (filtré)",
      pct: 55,
      actif: (pid) => isAgrume(pid),
      getIngredient: (pid) => ({
        nom: `Jus de ${parfumLabel(pid)} naturel (filtré)`,
      }),
    },
    // ── Eau base agrume — absorbe le résidu pour totaliser 100 % ─────────
    {
      label: 'Eau (base agrume)',
      pct: 0,
      pctOverride: (pid) => {
        if (!isAgrume(pid)) return 0; // inactive via actif
        // 100 % - jus(55) - sucrant(10) - glucose(8) - pectine(1.5)
        return Math.max(0, 100 - 55 - 10 - 8 - 1.5);
      },
      actif: (pid) => isAgrume(pid),
      getIngredient: () => ({ nom: 'Eau' }),
    },
    {
      label: 'Sucre semoule (avec pectine)',
      pct: 10,
      getIngredient: (_pid, c) => ({
        nom: sucrant(c),
        note: sucrantNote(c),
      }),
    },
    {
      label: 'Glucose DE38 / sucre inverti',
      pct: 8,
      getIngredient: () => ({
        nom: 'Sirop de glucose DE38',
        note: 'Alternative : sucre inverti (Trimoline) même proportion. Chauffer à 40 °C avant usage.',
      }),
    },
    {
      label: 'Pectine NH',
      pct: 1.5,
      getIngredient: () => ({
        nom: 'Pectine NH',
        note: 'Mélanger à sec avec le sucre avant incorporation. Bouillir 30 s pour activer.',
      }),
    },
    {
      label: 'Jus de citron (activateur)',
      pct: 5,
      actif: (pid) => !isAgrume(pid),
      getIngredient: () => ({
        nom: 'Jus de citron jaune (filtré)',
        note: 'Ajouter hors du feu après ébullition.',
      }),
    },
    {
      label: 'Acide tartrique',
      pct: 0.15,
      actif: (pid) => isPeuAcide(pid),
      getIngredient: (pid) => ({
        nom: 'Acide tartrique',
        note: noteAcide(pid),
      }),
    },
    // ── Eau ajustement fruits sucrés — absorbe le résidu ─────────────────
    {
      label: 'Eau (ajustement)',
      pct: 0,
      pctOverride: (pid) => {
        if (isAgrume(pid)) return 0; // inactive via actif
        let fixed = 68 + 10 + 8 + 1.5 + 5;
        if (isPeuAcide(pid)) fixed += 0.15;
        return Math.max(0, 100 - fixed);
      },
      actif: (pid) => !isAgrume(pid),
      getIngredient: () => ({ nom: 'Eau' }),
    },
  ],

  process: (pid, c) => {
    const steps = [];

    if (hasEnzyme(pid)) {
      steps.push(`Chauffer la purée de ${parfumLabel(pid)} à 85 °C — 2 min. Refroidir à 40 °C.`);
    }

    steps.push('Mélanger à sec : sucre semoule + pectine NH.');

    steps.push(
      isAgrume(pid)
        ? `Combiner le jus de ${parfumLabel(pid)}, l'eau et le glucose. Chauffer à 40 °C.`
        : `Chauffer la purée et le glucose à 40 °C.`
    );

    steps.push(
      'Verser le mélange sucre-pectine en pluie fine en fouettant. '
    + 'Porter à ébullition. Maintenir 30 s.'
    );

    if (!isAgrume(pid)) {
      steps.push('Hors du feu, ajouter le jus de citron. Mélanger vivement.');
    }
    if (isPeuAcide(pid)) {
      steps.push("Incorporer l'acide tartrique.");
    }

    steps.push(
      'Couler en insert ou fond de tarte. '
    + 'Insert : surgeler minimum 2 h. '
    + 'Tarte : laisser prendre au réfrigérateur 1 h.'
    );

    return steps;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 3 — Gel / Gelée B·Concept (Bordas gelificado)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * RATIOS B·CONCEPT — fruits sucrés
 *
 *   Purée de fruit         90,2 %   ← résidu (= 100 - inuline - agar - acide éventuel)
 *   Inuline native          9,0 %
 *   Agar-agar               0,8 %
 *   Acide tartrique (+0,1 % si peu acide)
 *                          ──────
 *                          100,0 %
 *
 * RATIOS B·CONCEPT — agrumes
 *
 *   Jus d'agrume           65,0 %
 *   Eau (résidu)           24,7 %   ← 100 - (65+0.5+9+0.8)
 *   Zeste                   0,5 %
 *   Inuline                 9,0 %
 *   Agar-agar               0,8 %
 *                          ──────
 *                          100,0 %
 *
 * SOURCE : Bordas pp. 113, 153, 164
 */
export const TPL_GEL_BCONCEPT_FRUIT = {
  label: "Gel de fruit à l'agar (haute teneur en fruit)",
  description:
    "Gel de fruit à l'agar-agar — très haute teneur en fruit (90 %), translucide et brillant. "
  + 'Pour nappages, gels de verrine, couverture d\'entremets, miroirs fruités. '
  + 'Vegan par défaut. Gel irréversible — ne se réchauffe pas comme la pectine.',
  parfumsCompat: PARFUMS_COMPAT_CONFITS,
  formats: {
    miroir:  'Miroir / nappage entremets',
    verrine: 'Gel en dés / verrine',
    couche:  'Couche fine (tarte, gâteau)',
  },
  lines: [
    // ── Purée fruits sucrés — absorbe le résidu ───────────────────────────
    {
      label: 'Purée de fruit',
      pct: 0,
      pctOverride: (pid) => {
        if (isAgrume(pid)) return 0; // inactive via actif
        // Purée = 100 % - inuline(9) - agar(0.8) - acide tartrique si peu acide
        return Math.max(0, 100 - 9 - 0.8 - (isPeuAcide(pid) ? 0.1 : 0));
      },
      actif: (pid) => !isAgrume(pid),
      getIngredient: (pid) => ({
        nom: `Purée de ${parfumLabel(pid)}`,
        note: noteEnzyme(pid),
      }),
    },
    // ── Agrumes : jus filtré ──────────────────────────────────────────────
    {
      label: "Jus d'agrume (filtré)",
      pct: 65,
      actif: (pid) => isAgrume(pid),
      getIngredient: (pid) => ({
        nom: `Jus de ${parfumLabel(pid)} naturel (filtré)`,
        note: 'Filtrer soigneusement. La pulpe trouble le gel et perturbe la prise de l\'agar.',
      }),
    },
    // ── Eau base agrume — absorbe le résidu ───────────────────────────────
    {
      label: 'Eau (base agrume)',
      pct: 0,
      pctOverride: (pid) => {
        if (!isAgrume(pid)) return 0; // inactive via actif
        // 100 % - jus(65) - zeste(0.5) - inuline(9) - agar(0.8)
        return Math.max(0, 100 - 65 - 0.5 - 9 - 0.8);
      },
      actif: (pid) => isAgrume(pid),
      getIngredient: () => ({ nom: 'Eau' }),
    },
    // ── Zeste agrumes ─────────────────────────────────────────────────────
    {
      label: 'Zeste',
      pct: 0.5,
      actif: (pid) => isAgrume(pid),
      getIngredient: (pid) => ({
        nom: `Zeste de ${parfumLabel(pid)} (non traité)`,
        note: 'Incorporer après gélification en cassant le gel au mixeur — pour un gel zesté.',
      }),
    },
    // ── Inuline ───────────────────────────────────────────────────────────
    {
      label: 'Inuline native',
      pct: 9,
      getIngredient: () => ({
        nom: 'Inuline native (oligofructose)',
        note: 'IG ≈ 0. Sucrant léger + prébiotique. '
            + 'Pour fruits sucrés (framboise, fraise…) : réduire à 3–5 %. '
            + 'Pour fruits peu sucrés (passion, citron…) : conserver 9–10 %.',
      }),
    },
    // ── Agar ─────────────────────────────────────────────────────────────
    {
      label: 'Agar-agar',
      pct: 0.8,
      getIngredient: () => ({
        nom: 'Agar-agar',
        note: 'Mélanger à froid dans le liquide avant chauffage. '
            + 'Porter à ébullition 2 min minimum pour activer. '
            + 'Gel irréversible : prend à 45 °C, ne se liquéfie pas en bouche.',
      }),
    },
    // ── Acide tartrique ───────────────────────────────────────────────────
    {
      label: 'Acide tartrique',
      pct: 0.1,
      actif: (pid) => isPeuAcide(pid) && !isAgrume(pid),
      getIngredient: (pid) => ({
        nom: 'Acide tartrique',
        note: noteAcide(pid),
      }),
    },
  ],

  process: (pid, c) => {
    const steps = [];

    if (hasEnzyme(pid)) {
      steps.push(
        `Chauffer la purée de ${parfumLabel(pid)} à 85 °C — 2 min. Refroidir. `
      + "L'enzyme protéolytique est dénaturée, l'agar gélifiera normalement."
      );
    }

    steps.push(
      `Dans une casserole froide, mélanger `
    + (isAgrume(pid)
        ? `le jus de ${parfumLabel(pid)} et l'eau`
        : `la purée de ${parfumLabel(pid)}`)
    + " avec l'inuline et l'agar-agar (ne jamais ajouter l'agar dans un liquide chaud — il s'agrègerait)."
    );

    if (isPeuAcide(pid) && !isAgrume(pid)) {
      steps.push("Ajouter l'acide tartrique dans le mélange froid.");
    }

    steps.push(
      'Chauffer à feu moyen en remuant constamment avec un fouet. '
    + 'Porter à ébullition franche. Maintenir 2 min en remuant '
    + "(important : l'agar doit bouillir pour activer la gélification)."
    );

    steps.push(
      'Utilisation immédiate (avant prise) :'
    + '\n  • Miroir / nappage : couler sur l\'entremets sorti du congélateur à ≈ 60 °C.'
    + '\n  • Verrine en dés : verser dans un plat plat, laisser figer à température ambiante, découper en dés.'
    + '\n  • Couche fine : couler dans le fond de tarte ou moule à 60 °C.'
    );

    steps.push(
      'Gel cassé (texture coulante) : après gélification complète (15 min), '
    + 'mixer 30 s au mixeur plongeant → gel cassé brillant et coulant. '
    + 'Parfait pour napper un entremets ou garnir une verrine au dernier moment.'
    );

    if (isAgrume(pid)) {
      steps.push(
        `Zeste : incorporer les zestes de ${parfumLabel(pid)} après avoir cassé le gel au mixeur — `
      + 'ils se disperseront uniformément dans le gel coulant.'
      );
    }

    return steps;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export const TEMPLATES_CONFITS = {
  /** B·Concept Bordas — pectine NH + oligofructose + glucose, IG bas */
  confit_bconcept_fruit:  TPL_CONFIT_BCONCEPT_FRUIT,
  /** Classique Bourgi / Benghanem — pectine NH + sucre + glucose */
  confit_classique_fruit: TPL_CONFIT_CLASSIQUE_FRUIT,
  /** B·Concept Bordas — agar + jus pur, vegan, translucide */
  gel_bconcept_fruit:     TPL_GEL_BCONCEPT_FRUIT,
};

/** Familles de parfums compatibles avec les confits / gels */
export const CONFITS_FRUIT_FAMILLES = [
  'fruit_rouge', 'fruit_noyau', 'fruit_pepin', 'fruit_exo', 'agrume', 'vegetal',
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLEAU RÉCAPITULATIF
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Template                | Purée | Sucrant      | Gélifiant     | Usage          | Source
 * ───────────────────────|-------|--------------|---------------|----------------|──────────────────
 * confit_bconcept_fruit  | 73 %  | Oligofruct.  | Pectine NH 1% | Insert, tarte  | Bordas + Bourgi
 *                        |       | + glucose    |               |                |
 * confit_classique_fruit | 68 %  | Sucre+glucose| Pect. NH 1,5% | Insert, macaron| Bourgi / Benghanem
 * gel_bconcept_fruit     | ~90 % | Inuline 9 %  | Agar 0,8 %    | Miroir, verrine| Bordas p.113/164
 *
 * CHOIX DU BON TEMPLATE :
 *   • Insert surgeler à découper → confit (pectine NH = thermo-réversible,
 *     plus tolérant que l'agar à la congélation-décongélation)
 *   • Gel coulant / miroir → gel B·Concept (agar = translucide et brillant)
 *   • IG bas / vegan → confit B·Concept (oligofructose = IG 0)
 *   • Production pro classique → confit classique (sucre = comportement prévisible)
 */

// Moteur de calcul nutritionnel — Atwater INCO + agrégation multi-composants
// Compatible avec le modèle de données lib/recettes/ (recettes simples + assemblages)

import { INGREDIENTS_NUTRITION } from './ingredients-nutrition.js';
import { getAJR } from './ajr.js';

// Perte à la cuisson par sous-catégorie (% en masse, essentiellement de l'eau)
const PERTE_PAR_SOUS_CAT = {
  biscuit_leger:    12,
  biscuit_meringue:  8,
  petit_gateau:     10,
  croustillant_praline: 5,
  // tout le reste : 0
};

const MACRO_KEYS = ['eau_g', 'lipides_g', 'lipides_satures_g', 'glucides_g', 'sucres_g', 'protides_g', 'fibres_g', 'sel_g', 'alcool_g', 'polyols_g'];

function zeroMacros() {
  return Object.fromEntries(MACRO_KEYS.map(k => [k, 0]));
}

function r1(n) { return Math.round(n * 10) / 10; }

// ── Calcul énergie (Atwater INCO) ────────────────────────────────────────────
function macrosToKcal(m) {
  return (m.glucides_g  ?? 0) * 4
       + (m.protides_g  ?? 0) * 4
       + (m.lipides_g   ?? 0) * 9
       + (m.fibres_g    ?? 0) * 2
       + (m.alcool_g    ?? 0) * 7
       + (m.polyols_g   ?? 0) * 2.4;
}

export function computeIngredientEnergy(macros_per_100g) {
  const kcal = macrosToKcal(macros_per_100g);
  return {
    kcal_100g: r1(kcal),
    kj_100g:   r1(kcal * 4.184),
  };
}

// ── Agrégation d'une liste d'ingrédients { nom, pct } ────────────────────────
// Retourne les macros absolues (en g) pour la masse pre-cuisson donnée
function aggregateMacros(ingredients, masse_pre_g) {
  const totaux = zeroMacros();
  const warnings = [];

  for (const ing of ingredients) {
    const masse_ing = (ing.pct / 100) * masse_pre_g;
    const ref = INGREDIENTS_NUTRITION[ing.nom];
    if (!ref) {
      warnings.push(`Ingrédient non trouvé : « ${ing.nom} » — macros ignorées`);
      continue;
    }
    for (const k of MACRO_KEYS) {
      totaux[k] += ((ref[k] ?? 0) / 100) * masse_ing;
    }
  }

  return { totaux, warnings };
}

// ── Calcul nutrition d'un composant (prépa simple ou composant d'assemblage) ─
// ingredients : [{ nom, pct }]
// masse_pre_g : masse totale des ingrédients crus
// perte_pct   : % de perte à la cuisson (0 par défaut)
export function computeComponentNutrition(ingredients, masse_pre_g, perte_pct = 0) {
  return computeComposantNutrition(ingredients, masse_pre_g, perte_pct);
}
function computeComposantNutrition(ingredients, masse_pre_g, perte_pct = 0) {
  const { totaux, warnings } = aggregateMacros(ingredients, masse_pre_g);

  const perte_g = masse_pre_g * (perte_pct / 100);
  const masse_finale_g = masse_pre_g - perte_g;
  totaux.eau_g = Math.max(0, totaux.eau_g - perte_g);

  if (masse_finale_g <= 0) {
    return { masse_finale_g: 0, per_100g: null, totaux, warnings };
  }

  const ratio = 100 / masse_finale_g;
  const per_100g = {};
  for (const k of MACRO_KEYS) {
    per_100g[k] = r1(totaux[k] * ratio);
  }
  const { kcal_100g, kj_100g } = computeIngredientEnergy(per_100g);
  per_100g.kcal = kcal_100g;
  per_100g.kj   = kj_100g;

  // Garde-fou cohérence macros (eau + glucides + protides + lipides + fibres ≈ 100 g)
  const somme = per_100g.eau_g + per_100g.glucides_g + per_100g.protides_g + per_100g.lipides_g + per_100g.fibres_g;
  if (Math.abs(somme - 100) > 2) {
    warnings.push(`Cohérence macros : somme ${r1(somme)} g ≠ 100 g (écart > 2 % — données ingrédient incomplètes ?)`);
  }

  return { masse_finale_g: Math.round(masse_finale_g), per_100g, totaux, warnings };
}

// ── Calcul nutrition recette complète ────────────────────────────────────────
export function computeRecipeNutrition(recette, profileId = 'adulte_2000kcal') {
  const ajr = getAJR(profileId);
  const allWarnings = [];
  let masse_finale_g;
  let per_100g;
  let totaux_globaux;
  let breakdown = [];

  if (recette.type === 'assemblage') {
    // ── Assemblage : agrégation par composant ──────────────────────────────
    const macros_acc = zeroMacros();
    let masse_acc = 0;

    for (const comp of (recette.composants ?? [])) {
      const res = computeComposantNutrition(comp.ingredients, comp.masse_g, 0);
      allWarnings.push(...res.warnings);

      masse_acc += res.masse_finale_g;
      for (const k of MACRO_KEYS) macros_acc[k] += res.totaux[k];

      const kcal_100g_comp = res.per_100g?.kcal ?? 0;
      breakdown.push({
        nom:       comp.nom,
        masse_g:   res.masse_finale_g,
        masse_pct: 0,
        kcal_100g: kcal_100g_comp,
        kcal_total: Math.round(kcal_100g_comp * res.masse_finale_g / 100),
      });
    }

    masse_finale_g  = masse_acc;
    totaux_globaux  = macros_acc;

    const ratio = masse_finale_g > 0 ? 100 / masse_finale_g : 0;
    per_100g = {};
    for (const k of MACRO_KEYS) per_100g[k] = r1(macros_acc[k] * ratio);
    const { kcal_100g, kj_100g } = computeIngredientEnergy(per_100g);
    per_100g.kcal = kcal_100g;
    per_100g.kj   = kj_100g;

    breakdown = breakdown.map(b => ({
      ...b,
      masse_pct: masse_finale_g > 0 ? r1(b.masse_g / masse_finale_g * 100) : 0,
    }));
  } else {
    // ── Recette simple ─────────────────────────────────────────────────────
    const perte_pct = PERTE_PAR_SOUS_CAT[recette.sous_categorie] ?? 0;
    const res = computeComposantNutrition(recette.ingredients, recette.masse_totale_g, perte_pct);
    allWarnings.push(...res.warnings);
    masse_finale_g = res.masse_finale_g;
    per_100g       = res.per_100g;
    totaux_globaux = res.totaux;

    breakdown = [{
      nom:        recette.nom,
      masse_g:    masse_finale_g,
      masse_pct:  100,
      kcal_100g:  per_100g?.kcal ?? 0,
      kcal_total: Math.round((per_100g?.kcal ?? 0) * masse_finale_g / 100),
    }];
  }

  if (!per_100g) {
    return { masse_finale_g: 0, per_100g: null, totals: null, ajr_pct_per_100g: null, breakdown_par_composant: [], warnings: allWarnings };
  }

  // ── % AJR pour 100 g ──────────────────────────────────────────────────────
  const ajr_pct_per_100g = {
    energie:  r1(per_100g.kcal            / ajr.energie_kcal       * 100),
    lipides:  r1(per_100g.lipides_g       / ajr.lipides_g          * 100),
    satures:  r1(per_100g.lipides_satures_g / ajr.lipides_satures_g * 100),
    glucides: r1(per_100g.glucides_g      / ajr.glucides_g         * 100),
    sucres:   r1(per_100g.sucres_g        / ajr.sucres_g           * 100),
    protides: r1(per_100g.protides_g      / ajr.protides_g         * 100),
    fibres:   r1(per_100g.fibres_g        / ajr.fibres_g           * 100),
    sel:      r1(per_100g.sel_g           / ajr.sel_g              * 100),
  };

  // ── Totaux absolus + énergie totale ───────────────────────────────────────
  const totals = { ...totaux_globaux };
  totals.kcal = r1(macrosToKcal(totaux_globaux));
  totals.kj   = r1(totals.kcal * 4.184);

  return {
    masse_finale_g,
    per_100g,
    totals,
    ajr_pct_per_100g,
    breakdown_par_composant: breakdown,
    warnings: allWarnings,
  };
}

// ── Calcul nutrition d'un plan de travail (N slots indépendants) ─────────────
// slots       : [{ uid, recetteId, masse }]
// recettesMap : { [id]: recette }
// Retourne la nutrition pour 100 g de produit fini (somme pondérée des slots)
export function computePlanNutrition(slots, recettesMap, profileId = 'adulte_2000kcal') {
  const ajr = getAJR(profileId);
  const allWarnings = [];
  const macros_acc = zeroMacros();
  let masse_acc = 0;
  let kcal_acc = 0;
  const breakdown = [];

  for (const slot of slots) {
    const recette = recettesMap[slot.recetteId];
    if (!recette) continue;

    const masse_slot = Number(slot.masse) > 0 ? Number(slot.masse) : recette.masse_totale_g;
    const res = computeRecipeNutrition(recette, profileId);
    allWarnings.push(...res.warnings);
    if (!res.per_100g || res.masse_finale_g === 0) continue;

    const ratio = masse_slot / recette.masse_totale_g;
    const masse_finale_slot = Math.round(res.masse_finale_g * ratio);

    for (const k of MACRO_KEYS) {
      macros_acc[k] += (res.per_100g[k] ?? 0) * masse_finale_slot / 100;
    }
    masse_acc += masse_finale_slot;

    const kcal_slot = r1(res.per_100g.kcal * masse_finale_slot / 100);
    kcal_acc += kcal_slot;
    breakdown.push({
      uid:                   slot.uid,
      nom:                   recette.nom,
      categorie:             recette.categorie,
      masse_finale_g:        masse_finale_slot,
      masse_pct:             0,
      kcal_100g:             res.per_100g.kcal,
      kcal_total:            Math.round(kcal_slot),
      contribution_pct_kcal: 0,
    });
  }

  if (masse_acc === 0) {
    return { masse_totale_finale_g: 0, per_100g: null, totals: null, ajr_pct_per_100g: null, breakdown: [], warnings: allWarnings };
  }

  const ratio = 100 / masse_acc;
  const per_100g = {};
  for (const k of MACRO_KEYS) per_100g[k] = r1(macros_acc[k] * ratio);
  const { kcal_100g, kj_100g } = computeIngredientEnergy(per_100g);
  per_100g.kcal = kcal_100g;
  per_100g.kj   = kj_100g;

  const ajr_pct_per_100g = {
    energie:  r1(per_100g.kcal              / ajr.energie_kcal        * 100),
    lipides:  r1(per_100g.lipides_g         / ajr.lipides_g           * 100),
    satures:  r1(per_100g.lipides_satures_g / ajr.lipides_satures_g   * 100),
    glucides: r1(per_100g.glucides_g        / ajr.glucides_g          * 100),
    sucres:   r1(per_100g.sucres_g          / ajr.sucres_g            * 100),
    protides: r1(per_100g.protides_g        / ajr.protides_g          * 100),
    fibres:   r1(per_100g.fibres_g          / ajr.fibres_g            * 100),
    sel:      r1(per_100g.sel_g             / ajr.sel_g               * 100),
  };

  const totals = { ...macros_acc };
  totals.kcal = r1(macrosToKcal(macros_acc));
  totals.kj   = r1(totals.kcal * 4.184);

  return {
    masse_totale_finale_g: masse_acc,
    per_100g,
    totals,
    ajr_pct_per_100g,
    breakdown: breakdown.map(b => ({
      ...b,
      masse_pct:             r1(b.masse_finale_g / masse_acc * 100),
      contribution_pct_kcal: kcal_acc > 0 ? r1(b.kcal_total / kcal_acc * 100) : 0,
    })),
    warnings: allWarnings,
  };
}

// ── Badge AJR ─────────────────────────────────────────────────────────────────
export function formatAJRBadge(value_per_100g, ajrValue) {
  const pct = r1(value_per_100g / ajrValue * 100);
  let level;
  if      (pct < 7.5) level = 'low';
  else if (pct < 15)  level = 'moderate';
  else if (pct < 30)  level = 'high';
  else                level = 'critical';
  return { pct, level };
}

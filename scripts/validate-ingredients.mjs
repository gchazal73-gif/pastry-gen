#!/usr/bin/env node
/**
 * Valide la cohérence de la bibliothèque d'ingrédients locale
 * (lib/ingredients-db.js) :
 *   1. Somme des macros ≈ 100 g (tolérance : avert. > 2 g, erreur > 5 g)
 *   2. sucres_g ≤ glucides_g
 *   3. POD/PAC dans des plages plausibles
 *   4. Unicité des identifiants
 *
 * Usage : npm run validate-ingredients
 * Aucune connexion réseau requise.
 */

import { INGREDIENTS_DB, TEMPLATE_TARGETS } from '../lib/ingredients-db.js';

function fmt(n) { return n == null ? 'N/A' : Number(n).toFixed(2); }

function main() {
  console.log("🔍 Validation de la bibliothèque d'ingrédients (données locales)…\n");

  let errors   = 0;
  let warnings = 0;

  // ── 0. Unicité des ids ────────────────────────────────────────────────────
  const seen = new Set();
  for (const ing of INGREDIENTS_DB) {
    if (seen.has(ing.id)) {
      console.error(`❌ ERREUR   [${ing.id}] identifiant en double`);
      errors++;
    }
    seen.add(ing.id);
  }

  for (const ing of INGREDIENTS_DB) {
    // ── 1. Vérification macros ──────────────────────────────────────────────
    const sum =
      (ing.eau_g      ?? 0) +
      (ing.glucides_g ?? 0) +
      (ing.protides_g ?? 0) +
      (ing.lipides_g  ?? 0) +
      (ing.fibres_g   ?? 0) +
      (ing.cendres_g  ?? 0);

    const diff = Math.abs(sum - 100);

    if (diff > 5) {
      console.error(`❌ ERREUR   [${ing.id}] somme macros = ${sum.toFixed(1)} g (écart ${diff.toFixed(1)} g)`);
      errors++;
    } else if (diff > 2) {
      console.warn( `⚠  WARNING  [${ing.id}] somme macros = ${sum.toFixed(1)} g (écart ${diff.toFixed(1)} g)`);
      warnings++;
    }

    // ── 2. sucres ≤ glucides ────────────────────────────────────────────────
    if (ing.sucres_g != null && ing.glucides_g != null &&
        ing.sucres_g > ing.glucides_g + 0.1) {
      console.error(`❌ ERREUR   [${ing.id}] sucres_g (${fmt(ing.sucres_g)}) > glucides_g (${fmt(ing.glucides_g)})`);
      errors++;
    }

    // ── 3. POD/PAC plausibles ───────────────────────────────────────────────
    if (ing.pod != null && (ing.pod < 0 || ing.pod > 220)) {
      console.warn(`⚠  WARNING  [${ing.id}] POD atypique : ${ing.pod} (plage attendue 0-220)`);
      warnings++;
    }
    if (ing.pac != null && (ing.pac < 0 || ing.pac > 250)) {
      console.warn(`⚠  WARNING  [${ing.id}] PAC atypique : ${ing.pac} (plage attendue 0-250)`);
      warnings++;
    }
  }

  // ── Rapport final ─────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────────');
  console.log(`Ingrédients    : ${INGREDIENTS_DB.length}`);
  console.log(`Templates      : ${TEMPLATE_TARGETS.length}`);
  console.log(`Erreurs        : ${errors}`);
  console.log(`Avertissements : ${warnings}`);
  console.log('──────────────────────────────────────────────');

  if (errors === 0 && warnings === 0) {
    console.log('✅ Tous les ingrédients sont valides.');
  } else if (errors === 0) {
    console.log('✅ Aucune erreur bloquante (des avertissements sont présents).');
  } else {
    console.error('❌ Des erreurs ont été détectées — corriger avant de déployer.');
    process.exit(1);
  }
}

main();

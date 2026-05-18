#!/usr/bin/env node
/**
 * Valide la cohérence de la bibliothèque d'ingrédients :
 *   1. Somme des macros ≈ 100 g (tolérance : avert. > 2 g, erreur > 5 g)
 *   2. sucres_g ≤ glucides_g
 *   3. POD/PAC dans des plages plausibles (0-200)
 *
 * Usage : npm run validate-ingredients
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = resolve(__dir, '..');

// Lecture manuelle de .env.local (pas de dépendance dotenv nécessaire)
function loadEnv(file) {
  try {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx < 0) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  } catch { /* .env.local absent : on continue avec les vars d'env existantes */ }
}

loadEnv(resolve(root, '.env.local'));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY requises.');
  process.exit(1);
}

async function fetchAll(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Fetch ${table} échoué : ${res.status}`);
  return res.json();
}

function fmt(n) { return n == null ? 'N/A' : n.toFixed(2); }

async function main() {
  console.log('🔍 Validation de la bibliothèque d\'ingrédients…\n');

  const [ingredients, templates] = await Promise.all([
    fetchAll('ingredients'),
    fetchAll('template_targets'),
  ]);

  let errors   = 0;
  let warnings = 0;

  // ── 1. Vérification macros ──────────────────────────────────────────────
  for (const ing of ingredients) {
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

    // ── 2. sucres ≤ glucides ─────────────────────────────────────────────
    if (ing.sucres_g != null && ing.glucides_g != null &&
        ing.sucres_g > ing.glucides_g + 0.1) {
      console.error(`❌ ERREUR   [${ing.id}] sucres_g (${fmt(ing.sucres_g)}) > glucides_g (${fmt(ing.glucides_g)})`);
      errors++;
    }

    // ── 3. POD/PAC plausibles ────────────────────────────────────────────
    if (ing.pod != null && (ing.pod < 0 || ing.pod > 220)) {
      console.warn(`⚠  WARNING  [${ing.id}] POD atypique : ${ing.pod} (plage attendue 0-220)`);
      warnings++;
    }
    if (ing.pac != null && (ing.pac < 0 || ing.pac > 250)) {
      console.warn(`⚠  WARNING  [${ing.id}] PAC atypique : ${ing.pac} (plage attendue 0-250)`);
      warnings++;
    }
  }

  // ── Rapport final ───────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────────');
  console.log(`Ingrédients  : ${ingredients.length}`);
  console.log(`Templates    : ${templates.length}`);
  console.log(`Erreurs      : ${errors}`);
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

main().catch(err => { console.error(err); process.exit(1); });

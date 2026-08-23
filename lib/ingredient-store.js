/* =====================================================================
   INGREDIENT STORE — accès à la bibliothèque d'ingrédients (100 % local)
   ---------------------------------------------------------------------
   Les données proviennent de lib/ingredients-db.js (export figé de
   l'ancienne base Supabase, 2026-08-22). Aucun appel réseau : l'appli
   fonctionne hors ligne et ne dépend d'aucun service tiers.

   Les fonctions restent asynchrones pour ne rien casser côté appelants
   (composants qui font déjà `await fetchIngredients()`).
   ===================================================================== */

import { INGREDIENTS_DB, TEMPLATE_TARGETS } from './ingredients-db.js';

export async function fetchIngredients({ familles } = {}) {
  return getIngredients({ familles });
}

export async function fetchIngredientById(id) {
  return getIngredientById(id);
}

export async function fetchTemplateTarget(templateId) {
  return getTemplateTarget(templateId);
}

// Versions synchrones — à préférer dans le nouveau code.
export function getIngredients({ familles } = {}) {
  let list = INGREDIENTS_DB;
  if (familles?.length) list = list.filter(i => familles.includes(i.famille));
  return [...list].sort((a, b) => a.nom_fr.localeCompare(b.nom_fr, 'fr'));
}

export function getIngredientById(id) {
  return INGREDIENTS_DB.find(i => i.id === id) ?? null;
}

export function getTemplateTarget(templateId) {
  return TEMPLATE_TARGETS.find(t => t.template_id === templateId) ?? null;
}

// Familles par template — vide : tous les templates utilisent le chemin V1 local
export const TEMPLATE_FAMILLES = {};

// Templates pour lesquels le PAC est pertinent (produits glacés uniquement)
export const FROZEN_TEMPLATES = new Set([
  'sorbet', 'glace', 'glace_fruit',
  'glace_lait', 'glace_creme', 'glace_chocolat', 'sorbet_fruit', 'glace_fruits_secs',
]);

// Mapping ID bibliothèque → slug V1 PARFUMS (pour compatibilité engine existant)
export const INGREDIENT_TO_PARFUM_V1 = {
  // ── Fruits frais ────────────────────────────────────────────────────────
  'framboise-fraiche':   'framboise',
  'fraise-fraiche':      'fraise',
  'cassis-frais':        'cassis',
  'myrtille-fraiche':    'myrtille',
  'mure-fraiche':        'mure',
  'cerise-fraiche':      'cerise',
  'abricot-frais':       'abricot',
  'peche-fraiche':       'peche',
  'pomme-fraiche':       'pomme',
  'poire-fraiche':       'poire',
  'mangue-fraiche':      'mangue',
  'fruit-passion-frais': 'passion',
  'ananas-frais':        'ananas',
  'banane-fraiche':      'banane',
  'kiwi-frais':          'kiwi',
  'coco-chair-fraiche':  'coco',
  'citron-frais':        'citron',
  'citron-vert-frais':   'citron_vert',
  'orange-fraiche':      'orange',
  'marron-chataigne':    'marron',
  // ── Purées de fruits ────────────────────────────────────────────────────
  'puree-framboise-10':  'framboise',
  'puree-mangue-10':     'mangue',
  'puree-passion-10':    'passion',
  'puree-fraise-10':     'fraise',
  'puree-citron-10':     'citron',
  'puree-abricot-10':    'abricot',
  'puree-cassis-10':     'cassis',
  'puree-yuzu-10':       'yuzu',
  // ── Chocolats & couvertures ─────────────────────────────────────────────
  'couverture-noire-70':    'choc_noir',
  'couverture-noire-66':    'choc_noir64',
  'couverture-lait-40':     'choc_lait',
  'couverture-blanche':     'choc_blanc',
  'cacao-poudre-non-sucre': 'cacao_pdr',
  'pate-cacao':             'choc_noir',    // masse de cacao ≈ chocolat noir 100 %
  'beurre-cacao':           'choc_blanc',   // MG pure, approximation chocolat blanc
  'gianduja':               'gianduja',
  // ── Pralinés ────────────────────────────────────────────────────────────
  'praline-amande-50-50':   'praline_am',
  'praline-noisette-50-50': 'praline_no',
  // ── Pâtes de fruits secs / oléagineux ───────────────────────────────────
  'pate-pistache-pure':  'pate_pistache',
  'pate-noisette-pure':  'pate_noisette',
  'pate-amande-pure':    'pate_amande',
  'poudre-amande':       'pate_amande',     // approximation : même profil lipidique
  'amande-entiere':      'pate_amande',     // approximation
  'noisette-entiere':    'pate_noisette',   // approximation
  'pistache-non-salee':  'pate_pistache',   // approximation
};

// Ancien nom conservé pour compatibilité ascendante.
export const SUPABASE_TO_PARFUM_V1 = INGREDIENT_TO_PARFUM_V1;

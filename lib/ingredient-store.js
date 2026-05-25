import { supabase } from './supabase.js';

export async function fetchIngredients({ familles } = {}) {
  let query = supabase.from('ingredients').select('*').order('nom_fr');
  if (familles?.length) query = query.in('famille', familles);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchIngredientById(id) {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function fetchTemplateTarget(templateId) {
  const { data, error } = await supabase
    .from('template_targets')
    .select('*')
    .eq('template_id', templateId)
    .single();
  if (error) return null;
  return data;
}

// Familles affichées dans le sélecteur d'ingrédient principal par template
export const TEMPLATE_FAMILLES = {
  mousse_fruits:          ['fruits_frais', 'purees_fruits'],
  cremeux:                ['fruits_frais', 'purees_fruits', 'chocolats_couvertures', 'oleagineux'],
  ganache_montee_noir:    ['chocolats_couvertures'],
  ganache_montee_lait:    ['chocolats_couvertures'],
  ganache_montee_blanc:   ['chocolats_couvertures'],
  ganache_montee_fruit:   ['fruits_frais', 'purees_fruits'],
  ganache_montee_praline:  ['oleagineux'],
  croustillant_praline:    ['oleagineux'],
  dacquoise:               ['oleagineux'],
  financier:               ['oleagineux'],
  sorbet:                  ['fruits_frais', 'purees_fruits'],
};

// Templates pour lesquels le PAC est pertinent (produits glacés uniquement)
export const FROZEN_TEMPLATES = new Set([
  'sorbet', 'glace', 'glace_fruit',
  'glace_lait', 'glace_creme', 'glace_chocolat', 'sorbet_fruit', 'glace_fruits_secs',
]);

// Mapping ID Supabase → slug V1 PARFUMS (pour compatibilité engine existant)
export const SUPABASE_TO_PARFUM_V1 = {
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
  'couverture-noire-70':    'choc_noir',    // corrigé : était 'chocolat_noir'
  'couverture-noire-66':    'choc_noir64',  // corrigé : était 'chocolat_noir'
  'couverture-lait-40':     'choc_lait',    // corrigé : était 'chocolat_lait'
  'couverture-blanche':     'choc_blanc',   // corrigé : était 'chocolat_blanc'
  'cacao-poudre-non-sucre': 'cacao_pdr',
  'pate-cacao':             'choc_noir',    // masse de cacao ≈ chocolat noir 100 %
  'beurre-cacao':           'choc_blanc',   // MG pure, approximation chocolat blanc
  'gianduja':               'gianduja',
  // ── Pralinés ────────────────────────────────────────────────────────────
  'praline-amande-50-50':   'praline_am',   // corrigé : était 'praline'
  'praline-noisette-50-50': 'praline_no',   // corrigé : était 'praline'
  // ── Pâtes de fruits secs / oléagineux ───────────────────────────────────
  'pate-pistache-pure':  'pate_pistache',   // corrigé : était 'pistache'
  'pate-noisette-pure':  'pate_noisette',   // corrigé : était 'noisette'
  'pate-amande-pure':    'pate_amande',
  'poudre-amande':       'pate_amande',     // approximation : même profil lipidique
  'amande-entiere':      'pate_amande',     // approximation
  'noisette-entiere':    'pate_noisette',   // approximation
  'pistache-non-salee':  'pate_pistache',   // approximation
};

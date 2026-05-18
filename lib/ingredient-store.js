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
  mousse_fruits:  ['fruits_frais', 'purees_fruits'],
  cremeux:        ['fruits_frais', 'purees_fruits', 'chocolats_couvertures', 'oleagineux'],
  ganache_montee: ['chocolats_couvertures', 'oleagineux'],
  sorbet:         ['fruits_frais', 'purees_fruits'],
};

// Mapping ID Supabase → slug V1 PARFUMS (pour compatibilité engine existant)
export const SUPABASE_TO_PARFUM_V1 = {
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
  'puree-framboise-10':  'framboise',
  'puree-mangue-10':     'mangue',
  'puree-passion-10':    'passion',
  'puree-fraise-10':     'fraise',
  'puree-citron-10':     'citron',
  'puree-abricot-10':    'abricot',
  'puree-cassis-10':     'cassis',
  'puree-yuzu-10':       'yuzu',
  'couverture-noire-70': 'chocolat_noir',
  'couverture-noire-66': 'chocolat_noir',
  'couverture-lait-40':  'chocolat_lait',
  'couverture-blanche':  'chocolat_blanc',
  'praline-amande-50-50': 'praline',
  'praline-noisette-50-50': 'praline',
  'pate-pistache-pure':  'pistache',
  'pate-noisette-pure':  'noisette',
};

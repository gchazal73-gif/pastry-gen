/* =====================================================================
   MOTEUR ACCORDS — suggestions à partir d'un parfumId
   ===================================================================== */

import { ACCORDS_PARFUMS, COMPOSITIONS_ENTREMETS } from './data_accords.js';
import { TEMPLATES }                               from './templates.js';

/**
 * Retourne les accords parfums référencés pour un parfumId.
 * @param {string} parfumId
 * @returns {{ id: string, note: string }[]}
 */
export function suggererAccords(parfumId) {
  return ACCORDS_PARFUMS[parfumId] ?? [];
}

/**
 * Retourne les textures dont parfumsCompat inclut parfumId.
 * @param {string} parfumId
 * @returns {{ textureId: string, label: string, description: string }[]}
 */
export function suggererTextures(parfumId) {
  if (!parfumId || parfumId === 'nature') return [];
  return Object.entries(TEMPLATES)
    .filter(([, tpl]) => tpl.parfumsCompat.includes(parfumId))
    .map(([id, tpl]) => ({ textureId: id, label: tpl.label, description: tpl.description }));
}

/**
 * Retourne les compositions qui font appel à ce parfum.
 * Si aucune correspondance, retourne toutes les compositions.
 * @param {string} parfumId
 * @returns {import('./data_accords.js').COMPOSITIONS_ENTREMETS}
 */
export function suggererCompositions(parfumId) {
  if (!parfumId || parfumId === 'nature') return COMPOSITIONS_ENTREMETS;
  const matches = COMPOSITIONS_ENTREMETS.filter(c => c.parfums.includes(parfumId));
  return matches.length > 0 ? matches : COMPOSITIONS_ENTREMETS;
}

// Point d'entrée de la bibliothèque de recettes.
//
// Deux poids, deux usages
// -----------------------
// `CATALOGUE` est l'index léger : nom, famille, contraintes, allergènes, noms
// d'ingrédients, calories. Statique, il part avec la page. Il suffit à la liste,
// aux filtres et aux tris.
//
// Les recettes **complètes** — procédés et pesées, 55 % du poids — se chargent
// à la demande par `chargerRecette(id)` ou `chargerRecettes()`, en import
// dynamique. Turbopack les sort dans un chunk séparé, qui n'est téléchargé que
// si l'utilisateur ouvre une fiche ou monte un plan de travail.
//
// **Ne jamais réintroduire `import { RECETTES } from './complet.js'` dans une
// page ou un composant** : cela ramènerait les 6,5 Mo dans le bundle initial et
// annulerait tout l'intérêt du découpage. Le test `catalogue.test.js` vérifie la
// cohérence des deux, pas cette règle-ci — elle tient à la relecture.

export { CATALOGUE, NB_RECETTES, INGREDIENTS_CONNUS } from './catalogue.js';
export { CATEGORIES, FAMILLES, SOUS_CAT_LABELS, getFamille } from './taxonomie.js';

let _cache = null;

/** Toutes les recettes complètes. Le premier appel télécharge le chunk. */
export async function chargerRecettes() {
  if (!_cache) {
    const mod = await import('./complet.js');
    _cache = mod.RECETTES;
  }
  return _cache;
}

/** Une recette complète par son id, ou `null` si l'id est inconnu. */
export async function chargerRecette(id) {
  const toutes = await chargerRecettes();
  return toutes.find(r => r.id === id) ?? null;
}

/** Plusieurs recettes complètes, dans l'ordre des ids demandés. */
export async function chargerPlusieurs(ids) {
  const toutes = await chargerRecettes();
  const parId = new Map(toutes.map(r => [r.id, r]));
  return ids.map(id => parId.get(id)).filter(Boolean);
}

/** Vrai si le corpus complet est déjà en mémoire — pour éviter un état de
 *  chargement inutile quand il a déjà été demandé. */
export function corpusCharge() {
  return _cache !== null;
}

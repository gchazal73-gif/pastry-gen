#!/usr/bin/env node
/**
 * Génère `lib/recettes/catalogue.js` — l'index léger de la bibliothèque.
 *
 * Pourquoi
 * --------
 * La page Bibliothèque et le plan de travail importaient `RECETTES` en
 * statique. Tout partait donc au navigateur : les 3 896 recettes avec leurs
 * procédés et leurs pesées, soit 6,5 Mo de données pour afficher une liste de
 * noms. Or `procede` et `ingredients` pèsent à eux deux 55 % du total et ne
 * servent qu'à la fiche ouverte.
 *
 * Le catalogue ne garde que ce dont la liste a besoin — plus deux champs
 * précalculés qui évitent d'avoir à tout charger :
 *   - `ingredients_noms` : les noms seuls, pour le filtre par ingrédient et
 *     pour la liste déroulante des ingrédients ;
 *   - `kcal_100g` : la valeur énergétique, pour le tri par calories. Elle était
 *     recalculée à chaque clic pour les 3 896 recettes — et lue sous un nom de
 *     champ qui n'existe pas (`per_100g.energie_kcal` au lieu de
 *     `per_100g.kcal`), si bien que le tri ne triait rien.
 *
 * Fichier généré : ne pas l'éditer à la main. `lib/__tests__/catalogue.test.js`
 * vérifie qu'il correspond aux fichiers source ; s'il échoue, relancer ce
 * script.
 *
 *   node scripts/genere-catalogue.mjs
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');

const { RECETTES } = await import(join(RACINE, 'lib/recettes/complet.js'));
const { computeRecipeNutrition } = await import(join(RACINE, 'lib/nutrition.js'));

/** Les noms d'ingrédients, assemblages compris, dédoublonnés et ordonnés. */
function nomsIngredients(r) {
  const lignes = r.type === 'assemblage'
    ? (r.composants ?? []).flatMap(c => c.ingredients ?? [])
    : (r.ingredients ?? []);
  return [...new Set(lignes.map(i => i.nom).filter(Boolean))];
}

function kcal(r) {
  try {
    const v = computeRecipeNutrition(r)?.per_100g?.kcal;
    return Number.isFinite(v) ? Math.round(v * 10) / 10 : null;
  } catch {
    return null;
  }
}

export function entreeCatalogue(r) {
  return {
    id:               r.id,
    nom:              r.nom,
    categorie:        r.categorie,
    sous_categorie:   r.sous_categorie,
    famille:          r.famille ?? null,
    type:             r.type ?? null,
    description:      r.description ?? '',
    masse_totale_g:   r.masse_totale_g ?? null,
    parfum_principal: r.parfum_principal ?? null,
    a_verifier:       Boolean(r.a_verifier),
    contraintes:      r.contraintes ?? { vegan: false, sans_lactose: false, sans_gluten: false, ig_bas: false },
    allergenes:       r.allergenes ?? [],
    tags:             r.tags ?? [],
    ingredients_noms: nomsIngredients(r),
    kcal_100g:        kcal(r),
  };
}

const entrees = RECETTES.map(entreeCatalogue);

const js = `// FICHIER GÉNÉRÉ — ne pas éditer à la main.
// Produit par \`node scripts/genere-catalogue.mjs\` depuis lib/recettes/complet.js.
// Vérifié par lib/__tests__/catalogue.test.js : si ce test échoue, régénérer.
//
// Index léger de la bibliothèque : tout ce que la liste, les filtres et les tris
// demandent, sans les procédés ni les pesées — qui font 55 % du poids et ne
// servent qu'à la fiche ouverte. Les recettes complètes se chargent à la demande
// par \`chargerRecette(id)\` dans lib/recettes/index.js.

export const CATALOGUE = ${JSON.stringify(entrees, null, 0)};

export const NB_RECETTES = ${entrees.length};

/** Tous les noms d'ingrédients du corpus, dédoublonnés, triés en français. */
export const INGREDIENTS_CONNUS = ${JSON.stringify(
  [...new Set(entrees.flatMap(e => e.ingredients_noms))].sort((a, b) => a.localeCompare(b, 'fr')),
  null, 0)};
`;

const sortie = join(RACINE, 'lib/recettes/catalogue.js');
writeFileSync(sortie, js, 'utf-8');

const mo = n => (n / 1048576).toFixed(2) + ' Mo';
console.log(`catalogue : ${entrees.length} recettes -> ${sortie}`);
console.log(`  poids JSON        : ${mo(JSON.stringify(entrees).length)}`);
console.log(`  ingrédients connus: ${[...new Set(entrees.flatMap(e => e.ingredients_noms))].length}`);
console.log(`  kcal manquantes   : ${entrees.filter(e => e.kcal_100g === null).length}`);

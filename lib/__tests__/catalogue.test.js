import { describe, it, expect } from 'vitest';
import { CATALOGUE, NB_RECETTES, INGREDIENTS_CONNUS } from '../recettes/catalogue.js';
import { RECETTES } from '../recettes/complet.js';
import { entreeCatalogue } from '../../scripts/genere-catalogue.mjs';

// `lib/recettes/catalogue.js` est généré depuis `complet.js`. Sans ce test, une
// recette ajoutée ou renommée à la main disparaîtrait silencieusement des
// filtres et des tris — la liste lit le catalogue, pas les fichiers source.
// Si ce test échoue : `node scripts/genere-catalogue.mjs`.

describe('catalogue', () => {
  it('couvre exactement les recettes du corpus', () => {
    expect(NB_RECETTES).toBe(RECETTES.length);
    expect(CATALOGUE.length).toBe(RECETTES.length);
    expect(CATALOGUE.map(e => e.id)).toEqual(RECETTES.map(r => r.id));
  });

  it('correspond au corpus, champ par champ', () => {
    const attendu = RECETTES.map(entreeCatalogue);
    // comparaison globale : un diff sur 3 896 entrées reste lisible en JSON
    expect(JSON.stringify(CATALOGUE)).toBe(JSON.stringify(attendu));
  });

  it('porte les champs dont dépendent la liste, les filtres et les tris', () => {
    for (const e of CATALOGUE.slice(0, 50)) {
      expect(typeof e.id).toBe('string');
      expect(typeof e.nom).toBe('string');
      expect(Array.isArray(e.ingredients_noms)).toBe(true);
      expect(Array.isArray(e.allergenes)).toBe(true);
      expect(e.contraintes).toBeTypeOf('object');
    }
  });

  it('donne des calories exploitables — le tri en dépend', () => {
    // Le tri lisait `per_100g.energie_kcal`, champ qui n'existe pas : toutes les
    // recettes valaient 0 et l'ordre ne changeait jamais. Le champ précalculé
    // doit être réellement renseigné, pas seulement présent.
    // 601 recettes restent à 0 : leurs ingrédients n'ont pas d'équivalent dans
    // `ingredients-nutrition.js` (288 entrées). C'est le même trou de couverture
    // que pour les allergènes, et il reste à combler — mais le seuil doit dire
    // la vérité du corpus, pas un objectif.
    const chiffrees = CATALOGUE.filter(e => typeof e.kcal_100g === 'number' && e.kcal_100g > 0);
    expect(chiffrees.length).toBeGreaterThan(CATALOGUE.length * 0.8);
  });

  it('liste les ingrédients connus sans doublon et triés', () => {
    expect(new Set(INGREDIENTS_CONNUS).size).toBe(INGREDIENTS_CONNUS.length);
    const trie = [...INGREDIENTS_CONNUS].sort((a, b) => a.localeCompare(b, 'fr'));
    expect(INGREDIENTS_CONNUS).toEqual(trie);
  });

  it('contient tous les ingrédients cités par les recettes', () => {
    const connus = new Set(INGREDIENTS_CONNUS);
    const manquants = new Set();
    for (const e of CATALOGUE) {
      for (const n of e.ingredients_noms) if (!connus.has(n)) manquants.add(n);
    }
    expect([...manquants]).toEqual([]);
  });
});

import { describe, it, expect } from 'vitest';
import { calculerCoutRecette, calculerCoutAvecRatios, formatPrix, formatPrixCourt } from '../cout.js';

// ── Bibliothèque de test inline ───────────────────────────────────────────────
// dateRecente : il y a 30 jours (toujours < 180 j quel que soit le jour du test)
const dateRecente = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);

const METIER = {
  'Sucre semoule': {
    prix_eur_par_g: 0.0011, prix_variable_saison: false, date_maj_prix: dateRecente,
  },
  'Crème liquide 35%': {
    prix_eur_par_g: 0.0025, prix_variable_saison: false, date_maj_prix: dateRecente,
  },
  'Purée de framboise': {
    prix_eur_par_g: 0.0120, prix_variable_saison: true,  date_maj_prix: dateRecente,
  },
  'Beurre doux': {
    prix_eur_par_g: 0.0085, prix_variable_saison: false, date_maj_prix: '2020-01-01',
  },
  'Eau': {
    prix_eur_par_g: 0.0000, prix_variable_saison: false, date_maj_prix: null,
  },
};

// ── Test 1 : calcul de coût simple ───────────────────────────────────────────
// sucre 100g × 0,0011 + crème 200g × 0,0025 = 0,11 + 0,50 = 0,61 €
describe('calculerCoutRecette — calcul simple', () => {
  const lignes = [
    { ingredient: 'Sucre semoule',     g: 100 },
    { ingredient: 'Crème liquide 35%', g: 200 },
  ];

  it('coût total = 0,61 €', () => {
    expect(calculerCoutRecette(lignes, METIER).cout_total_eur).toBeCloseTo(0.61, 2);
  });

  it('coût pour 100 g = 0,61 / 300 × 100 ≈ 0,2033 €', () => {
    expect(calculerCoutRecette(lignes, METIER).cout_pour_100g_eur).toBeCloseTo(0.2033, 3);
  });

  it('taux de couverture = 100 %', () => {
    expect(calculerCoutRecette(lignes, METIER).taux_couverture_pct).toBe(100);
  });
});

// ── Test 2 : ingrédient inconnu ──────────────────────────────────────────────
// sucre 200g connu, gélatine 20g inconnue → couverture 200/220 ≈ 90,9 %
describe('calculerCoutRecette — ingrédient sans prix', () => {
  const lignes = [
    { ingredient: 'Sucre semoule',     g: 200 },
    { ingredient: 'Gélatine inconnue', g: 20  },
  ];

  it('ingrédient inconnu dans ingredients_sans_prix', () => {
    expect(calculerCoutRecette(lignes, METIER).ingredients_sans_prix).toContain('Gélatine inconnue');
  });

  it('taux couverture ≈ 90,9 %', () => {
    expect(calculerCoutRecette(lignes, METIER).taux_couverture_pct).toBeCloseTo(90.9, 1);
  });

  it('coût total = uniquement les ingrédients connus', () => {
    expect(calculerCoutRecette(lignes, METIER).cout_total_eur).toBeCloseTo(200 * 0.0011, 4);
  });
});

// ── Test 3 : formatPrix ──────────────────────────────────────────────────────
describe('formatPrix', () => {
  it('virgule française, 2 décimales : 12,34 €', () => {
    expect(formatPrix(12.34)).toBe('12,34 €');
  });
  it('0,00 €', () => {
    expect(formatPrix(0)).toBe('0,00 €');
  });
  it('entier : 100,00 €', () => {
    expect(formatPrix(100)).toBe('100,00 €');
  });
});

// ── Test 4 : formatPrixCourt ─────────────────────────────────────────────────
describe('formatPrixCourt', () => {
  it('entier → sans décimales', () => {
    expect(formatPrixCourt(12)).toBe('12 €');
  });
  it('non-entier → virgule française, 2 décimales', () => {
    expect(formatPrixCourt(12.50)).toBe('12,50 €');
  });
});

// ── Test 5 : multiplicateurs revient / PVTTC ─────────────────────────────────
describe('calculerCoutAvecRatios', () => {
  const lignes = [
    { ingredient: 'Sucre semoule',     g: 500 },
    { ingredient: 'Crème liquide 35%', g: 500 },
  ];

  it('prix de revient = coût × 2 par défaut', () => {
    const r = calculerCoutAvecRatios(lignes, METIER);
    expect(r.prix_de_revient_eur).toBeCloseTo(r.cout_total_eur * 2, 2);
  });

  it('PVTTC = coût × 5 par défaut', () => {
    const r = calculerCoutAvecRatios(lignes, METIER);
    expect(r.pvttc_eur).toBeCloseTo(r.cout_total_eur * 5, 2);
  });

  it('multiplicateurs personnalisés ×3 / ×7', () => {
    const r = calculerCoutAvecRatios(lignes, METIER, { multiplicateur_revient: 3, multiplicateur_pvttc: 7 });
    expect(r.prix_de_revient_eur).toBeCloseTo(r.cout_total_eur * 3, 2);
    expect(r.pvttc_eur).toBeCloseTo(r.cout_total_eur * 7, 2);
  });
});

// ── Test 6 : prix obsolète ───────────────────────────────────────────────────
// Beurre doux : date_maj_prix 2020-01-01 → > 180 jours
describe('calculerCoutRecette — prix obsolète', () => {
  it('date_maj_prix > 6 mois → dans prix_obsolete', () => {
    const r = calculerCoutRecette([{ ingredient: 'Beurre doux', g: 100 }], METIER);
    expect(r.prix_obsolete).toContain('Beurre doux');
  });

  it('date récente → absent de prix_obsolete', () => {
    const r = calculerCoutRecette([{ ingredient: 'Sucre semoule', g: 100 }], METIER);
    expect(r.prix_obsolete).not.toContain('Sucre semoule');
  });
});

// ── Test 7 : prix variable saison ────────────────────────────────────────────
describe('calculerCoutRecette — prix variable saison', () => {
  it('purée framboise → dans prix_variable_saison', () => {
    const r = calculerCoutRecette([{ ingredient: 'Purée de framboise', g: 200 }], METIER);
    expect(r.prix_variable_saison).toContain('Purée de framboise');
  });

  it('sucre semoule → absent de prix_variable_saison', () => {
    const r = calculerCoutRecette([{ ingredient: 'Sucre semoule', g: 100 }], METIER);
    expect(r.prix_variable_saison).not.toContain('Sucre semoule');
  });
});

// ── Test 8 : eau à prix zéro ─────────────────────────────────────────────────
// L'eau a prix_eur_par_g = 0 → pas un ingrédient sans prix
describe('calculerCoutRecette — eau à prix zéro', () => {
  it('pas dans ingredients_sans_prix', () => {
    const r = calculerCoutRecette([
      { ingredient: 'Sucre semoule', g: 100 },
      { ingredient: 'Eau',           g: 100 },
    ], METIER);
    expect(r.ingredients_sans_prix).not.toContain('Eau');
  });

  it('taux de couverture = 100 %', () => {
    const r = calculerCoutRecette([
      { ingredient: 'Sucre semoule', g: 100 },
      { ingredient: 'Eau',           g: 100 },
    ], METIER);
    expect(r.taux_couverture_pct).toBe(100);
  });
});

// ── Test 9 : recette vide ────────────────────────────────────────────────────
describe('calculerCoutRecette — recette vide', () => {
  it('pas de crash, coût = 0', () => {
    const r = calculerCoutRecette([], METIER);
    expect(r.cout_total_eur).toBe(0);
    expect(r.taux_couverture_pct).toBe(0);
    expect(r.ingredients_sans_prix).toHaveLength(0);
  });
});

// ── Test 10 : parts % par ligne ──────────────────────────────────────────────
// sucre : 100g × 0,0011 = 0,11 € sur 0,61 € total → 18,0 %
// crème : 200g × 0,0025 = 0,50 € sur 0,61 € total → 82,0 %
describe('calculerCoutRecette — parts % par ligne', () => {
  const lignes = [
    { ingredient: 'Sucre semoule',     g: 100 },
    { ingredient: 'Crème liquide 35%', g: 200 },
  ];

  it('part sucre ≈ 18 %', () => {
    const r = calculerCoutRecette(lignes, METIER);
    expect(r.cout_par_ligne[0].part_pct).toBeCloseTo(18, 0);
  });

  it('part crème ≈ 82 %', () => {
    const r = calculerCoutRecette(lignes, METIER);
    expect(r.cout_par_ligne[1].part_pct).toBeCloseTo(82, 0);
  });
});

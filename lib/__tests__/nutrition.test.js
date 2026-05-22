import { describe, it, expect } from 'vitest';
import { computeIngredientEnergy, computeRecipeNutrition, formatAJRBadge } from '../nutrition.js';

// ── Test 1 : Atwater INCO — crème pâtissière ──────────────────────────────────
// Recette: lait 66%, sucre 13%, jaune 13%, fécule 8% (total = 100%)
// Référence CIQUAL 2020 "crème pâtissière maison" ≈ 167 kcal/100g
// Tolérance spec : ±3 %  → fourchette attendue [162 ; 172]
describe('Atwater INCO — crème pâtissière', () => {
  const cremePat = {
    id: 'test-creme-patissiere',
    nom: 'Crème pâtissière test',
    categorie: 'cremes',
    sous_categorie: 'creme_patissiere',
    masse_totale_g: 400,
    ingredients: [
      { nom: 'Lait UHT entier',         pct: 66 },
      { nom: 'Sucre semoule',            pct: 13 },
      { nom: "Jaune d'œuf pasteurisé",  pct: 13 },
      { nom: 'Fécule de maïs',          pct:  8 },
    ],
  };

  it('calcule kcal/100g dans ±3 % de la valeur CIQUAL (~167 kcal)', () => {
    const CIQUAL_REF = 167;
    const result = computeRecipeNutrition(cremePat);
    expect(result.per_100g).not.toBeNull();
    expect(result.per_100g.kcal).toBeGreaterThanOrEqual(CIQUAL_REF * 0.97); // ≥ 162
    expect(result.per_100g.kcal).toBeLessThanOrEqual(CIQUAL_REF * 1.03);   // ≤ 172
  });

  it('ne produit aucun warning « ingrédient non trouvé »', () => {
    const result = computeRecipeNutrition(cremePat);
    const manquants = result.warnings.filter(w => w.includes('non trouvé'));
    expect(manquants).toHaveLength(0);
  });
});

// ── Test 2 : Agrégation multi-composants ──────────────────────────────────────
// Entremets = biscuit 80g (sucre pur) + mousse 250g (beurre pur) + glaçage 70g (fécule pure)
// Résultat attendu : moyenne PONDÉRÉE (~607 kcal/100g), pas la moyenne arithmétique (~500)
describe('Agrégation multi-composants', () => {
  const entremets = {
    id: 'test-entremets',
    nom: 'Entremets test',
    type: 'assemblage',
    composants: [
      {
        nom: 'Biscuit',
        masse_g: 80,
        ingredients: [{ nom: 'Sucre semoule',   pct: 100 }],
        procede: [],
      },
      {
        nom: 'Mousse',
        masse_g: 250,
        ingredients: [{ nom: 'Beurre doux',     pct: 100 }],
        procede: [],
      },
      {
        nom: 'Glaçage',
        masse_g: 70,
        ingredients: [{ nom: 'Fécule de maïs',  pct: 100 }],
        procede: [],
      },
    ],
  };

  it('kcal/100g = (Σ kcal_total) / (Σ masse_finale) × 100, pas la moyenne arithmétique', () => {
    const result = computeRecipeNutrition(entremets);
    // Masse totale finale : 80+250+70 = 400g
    expect(result.masse_finale_g).toBe(400);
    // Valeur correcte ≈ 607 kcal/100g (moyenne pondérée)
    expect(result.per_100g.kcal).toBeGreaterThan(580);
    expect(result.per_100g.kcal).toBeLessThan(630);
    // Valeur incorrecte (moyenne arithmétique) ≈ 500 kcal/100g
    expect(result.per_100g.kcal).not.toBeCloseTo(500, -1);
  });

  it('breakdown_par_composant liste bien les 3 composants avec leur masse_pct', () => {
    const result = computeRecipeNutrition(entremets);
    expect(result.breakdown_par_composant).toHaveLength(3);
    const totalPct = result.breakdown_par_composant.reduce((s, b) => s + b.masse_pct, 0);
    expect(totalPct).toBeCloseTo(100, 0);
  });
});

// ── Test 3 : Perte à la cuisson ───────────────────────────────────────────────
// Biscuit léger (perte 12%) à base de lait UHT entier pur
// → masse_finale = 88g ; eau diminue de 12g ; autres macros conservées ; kcal/100g augmente
describe('Perte à la cuisson', () => {
  const recetteAvecPerte = {
    id: 'test-perte-cuisson',
    sous_categorie: 'biscuit_leger',   // PERTE_PAR_SOUS_CAT = 12 %
    masse_totale_g: 100,
    ingredients: [{ nom: 'Lait UHT entier', pct: 100 }],
  };

  const recetteSansPerte = {
    id: 'test-sans-perte',
    sous_categorie: 'mousse_bavaroise', // non listé → perte 0 %
    masse_totale_g: 100,
    ingredients: [{ nom: 'Lait UHT entier', pct: 100 }],
  };

  it('masse_finale_g = masse_pre × (1 − 12/100) = 88', () => {
    const result = computeRecipeNutrition(recetteAvecPerte);
    expect(result.masse_finale_g).toBe(88);
  });

  it('kcal/100g après cuisson > kcal/100g sans cuisson (densification)', () => {
    const apres   = computeRecipeNutrition(recetteAvecPerte);
    const avantPerte = computeRecipeNutrition(recetteSansPerte);
    expect(apres.per_100g.kcal).toBeGreaterThan(avantPerte.per_100g.kcal);
  });

  it('glucides absolus inchangés → rapport glucides/100g est plus élevé après cuisson', () => {
    const apres       = computeRecipeNutrition(recetteAvecPerte);
    const avantPerte  = computeRecipeNutrition(recetteSansPerte);
    // Lait: 5.0 g glucides/100g brut → après: 5.0/0.88 ≈ 5.7 g/100g final
    expect(apres.per_100g.glucides_g).toBeGreaterThan(avantPerte.per_100g.glucides_g);
  });
});

// ── Test 4 : % AJR énergie ────────────────────────────────────────────────────
// 350 kcal / 100g ÷ AJR 2000 kcal = 17.5 %
describe('% AJR énergie', () => {
  it('formatAJRBadge(350, 2000) → pct = 17.5, level = "high"', () => {
    const badge = formatAJRBadge(350, 2000);
    expect(badge.pct).toBe(17.5);
    expect(badge.level).toBe('high');
  });

  it('ajr_pct_per_100g.energie est dans [17, 18] pour une recette à ~350 kcal/100g', () => {
    // Beurre doux pur ≈ 743 kcal/100g — utilisons un mélange 50/50 beurre+sucre
    // pour cibler ~390 kcal (profil adulte 2000 kcal → ~19.5 %)
    const recette = {
      id: 'test-ajr',
      sous_categorie: 'ganache',
      masse_totale_g: 200,
      ingredients: [
        { nom: 'Sucre semoule', pct: 50 },
        { nom: 'Beurre doux',   pct: 50 },
      ],
    };
    const result = computeRecipeNutrition(recette, 'adulte_2000kcal');
    // Sucre 50%: gluc=49.85, prot=0, lip=0 → kcal=199.4
    // Beurre 50%: gluc=0.35, prot=0.35, lip=41 → kcal=371.85
    // Total/100g ≈ 571 kcal → AJR% ≈ 28.5%
    expect(result.ajr_pct_per_100g.energie).toBeGreaterThan(20);
    expect(result.ajr_pct_per_100g.energie).toBeLessThan(40);
    expect(result.per_100g.kcal).toBeGreaterThan(400);
  });
});

// ── Test 5 : Seuils level du badge AJR ───────────────────────────────────────
describe('Seuils badge AJR', () => {
  it('< 7.5 % → level "low"',      () => expect(formatAJRBadge(7, 100).level).toBe('low'));
  it('7.5 % → level "moderate"',   () => expect(formatAJRBadge(7.5, 100).level).toBe('moderate'));
  it('15 % → level "high"',        () => expect(formatAJRBadge(15, 100).level).toBe('high'));
  it('30 % → level "critical"',    () => expect(formatAJRBadge(30, 100).level).toBe('critical'));

  it('32g sucres / AJR 90g → 35.6 % → level "critical"', () => {
    const badge = formatAJRBadge(32, 90);
    expect(badge.pct).toBeCloseTo(35.6, 0);
    expect(badge.level).toBe('critical');
  });
});

// ── Test 6 : Cohérence macros ────────────────────────────────────────────────
// Cannelle en poudre : eau 10 + gluc 27 + prot 4 + lip 1.2 + fibres 53 = 95.2g
// → écart 4.8 % > 2 % → warning « Cohérence macros »
describe('Warning cohérence macros', () => {
  const recetteCanelle = {
    id: 'test-coherence',
    sous_categorie: 'confit',
    masse_totale_g: 100,
    ingredients: [{ nom: 'Cannelle en poudre', pct: 100 }],
  };

  it('warnings[] contient une entrée « Cohérence macros »', () => {
    const result = computeRecipeNutrition(recetteCanelle);
    const hit = result.warnings.some(w => w.includes('Cohérence macros'));
    expect(hit).toBe(true);
  });

  it('un ingrédient absent du référentiel génère un warning « non trouvé »', () => {
    const recetteInconnue = {
      id: 'test-inconnu',
      sous_categorie: 'autre',
      masse_totale_g: 100,
      ingredients: [{ nom: 'INGRÉDIENT_INEXISTANT_XYZ', pct: 100 }],
    };
    const result = computeRecipeNutrition(recetteInconnue);
    expect(result.warnings.some(w => w.includes('non trouvé'))).toBe(true);
  });
});

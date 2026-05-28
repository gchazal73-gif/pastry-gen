import { describe, it, expect } from 'vitest';
import {
  calculerDlcRecette,
  getRecommandationsConservation,
  DLC_PAR_TEXTURE,
  DISCLAIMER_DLC,
} from '../conservation.js';

// ── Bibliothèque de test inline ───────────────────────────────────────────────

const METIER = {
  'Crème liquide 35%': {
    conservation_j_froid: 21, conservation_j_ambiant: null, conservation_j_surgele: null,
  },
  'Lait entier': {
    conservation_j_froid: 5, conservation_j_ambiant: null, conservation_j_surgele: null,
  },
  'Beurre doux': {
    conservation_j_froid: 60, conservation_j_ambiant: null, conservation_j_surgele: null,
  },
  'Sucre semoule': {
    conservation_j_froid: null, conservation_j_ambiant: 730, conservation_j_surgele: null,
  },
  'Farine de blé T55': {
    conservation_j_froid: null, conservation_j_ambiant: 365, conservation_j_surgele: null,
  },
};

// ── Test 1 : DLC dictée par le barème texture ─────────────────────────────────
// mousse_fruits : barème = 3 j froid ; ingrédients (crème 21j, sucre null) → 3j
describe('calculerDlcRecette — barème texture dominant', () => {
  const lignes = [
    { ingredient: 'Crème liquide 35%', g: 200 },
    { ingredient: 'Sucre semoule',     g: 50  },
  ];

  it('dlc_finale_j = 3 (barème mousse_fruits)', () => {
    const r = calculerDlcRecette(lignes, 'mousse_fruits', METIER);
    expect(r.dlc_finale_j).toBe(3);
  });

  it('dlc_texture_j = 3', () => {
    const r = calculerDlcRecette(lignes, 'mousse_fruits', METIER);
    expect(r.dlc_texture_j).toBe(3);
  });

  it('aucun ingredient_limitant car barème < ingrédients', () => {
    const r = calculerDlcRecette(lignes, 'mousse_fruits', METIER);
    expect(r.ingredients_limitants).toHaveLength(0);
  });
});

// ── Test 2 : DLC dictée par un ingrédient ────────────────────────────────────
// ganache_montee_noir : barème = 5 j ; lait entier = 5 j → égalité ; si lait = 3j → dicte
describe('calculerDlcRecette — ingrédient limitant', () => {
  const METIER_LAIT_COURT = {
    ...METIER,
    'Lait entier': { conservation_j_froid: 2 },
  };

  const lignes = [
    { ingredient: 'Crème liquide 35%', g: 200 },
    { ingredient: 'Lait entier',       g: 100 },
  ];

  it('dlc_finale_j = 2 (lait entier dicte)', () => {
    const r = calculerDlcRecette(lignes, 'ganache_montee_noir', METIER_LAIT_COURT);
    expect(r.dlc_finale_j).toBe(2);
  });

  it('ingredients_limitants contient Lait entier', () => {
    const r = calculerDlcRecette(lignes, 'ganache_montee_noir', METIER_LAIT_COURT);
    expect(r.ingredients_limitants).toContain('Lait entier');
  });

  it('dlc_ingredient_min_j = 2', () => {
    const r = calculerDlcRecette(lignes, 'ganache_montee_noir', METIER_LAIT_COURT);
    expect(r.dlc_ingredient_min_j).toBe(2);
  });
});

// ── Test 3 : texture inconnue ─────────────────────────────────────────────────
describe('calculerDlcRecette — texture inconnue', () => {
  it('sous_categorie_connue = false', () => {
    const r = calculerDlcRecette([], 'texture_inexistante', METIER);
    expect(r.sous_categorie_connue).toBe(false);
  });

  it('dlc_texture_j = null', () => {
    const r = calculerDlcRecette([], 'texture_inexistante', METIER);
    expect(r.dlc_texture_j).toBeNull();
  });
});

// ── Test 4 : ingrédients sans DLC ────────────────────────────────────────────
// Sucre et farine ont conservation_j_froid = null → dans ingredients_sans_dlc
describe('calculerDlcRecette — ingrédients sans données DLC', () => {
  const lignes = [
    { ingredient: 'Sucre semoule',     g: 100 },
    { ingredient: 'Farine de blé T55', g: 100 },
    { ingredient: 'Beurre doux',       g: 100 },
  ];

  it('sucre et farine dans ingredients_sans_dlc', () => {
    const r = calculerDlcRecette(lignes, 'sable_breton', METIER);
    expect(r.ingredients_sans_dlc).toContain('Sucre semoule');
    expect(r.ingredients_sans_dlc).toContain('Farine de blé T55');
  });

  it('beurre doux absent de ingredients_sans_dlc', () => {
    const r = calculerDlcRecette(lignes, 'sable_breton', METIER);
    expect(r.ingredients_sans_dlc).not.toContain('Beurre doux');
  });
});

// ── Test 5 : disclaimer toujours présent ─────────────────────────────────────
describe('calculerDlcRecette — disclaimer réglementaire', () => {
  it('disclaimer est la constante DISCLAIMER_DLC', () => {
    const r = calculerDlcRecette([], 'cremeux', METIER);
    expect(r.disclaimer).toBe(DISCLAIMER_DLC);
  });

  it('DISCLAIMER_DLC mentionne DGCCRF', () => {
    expect(DISCLAIMER_DLC).toContain('DGCCRF');
  });
});

// ── Test 6 : DLC surgélation propagée depuis barème ──────────────────────────
describe('calculerDlcRecette — DLC surgélation', () => {
  it('dlc_surgele_j = 90 pour cremeux', () => {
    const r = calculerDlcRecette([], 'cremeux', METIER);
    expect(r.dlc_surgele_j).toBe(90);
  });

  it('dlc_surgele_j = null pour glace_lait (conservation surgélation uniquement)', () => {
    // glace_lait : j_froid = null, j_surgele = 30
    const r = calculerDlcRecette([], 'glace_lait', METIER);
    expect(r.dlc_finale_j).toBeNull();
    expect(r.dlc_surgele_j).toBe(30);
  });
});

// ── Test 7 : getRecommandationsConservation ───────────────────────────────────
describe('getRecommandationsConservation', () => {
  it('DLC ≤ 3 j → alerte_chaine_froid = true', () => {
    const dlc = calculerDlcRecette(
      [{ ingredient: 'Crème liquide 35%', g: 200 }],
      'mousse_fruits',
      METIER,
    );
    const rec = getRecommandationsConservation(dlc);
    expect(rec.alerte_chaine_froid).toBe(true);
  });

  it('DLC > 3 j → alerte_chaine_froid = false', () => {
    const dlc = calculerDlcRecette(
      [{ ingredient: 'Beurre doux', g: 200 }],
      'ganache_montee_noir',  // 5 j
      METIER,
    );
    const rec = getRecommandationsConservation(dlc);
    expect(rec.alerte_chaine_froid).toBe(false);
  });

  it('etiquette contient +4 °C', () => {
    const dlc = calculerDlcRecette([], 'ganache_montee_blanc', METIER);
    const rec = getRecommandationsConservation(dlc);
    expect(rec.etiquette).toContain('+4 °C');
  });

  it('plan_travail contient le disclaimer', () => {
    const dlc = calculerDlcRecette([], 'cremeux', METIER);
    const rec = getRecommandationsConservation(dlc);
    expect(rec.plan_travail).toContain('DGCCRF');
  });

  it('texture inconnue → message générique sans crash', () => {
    const dlc = calculerDlcRecette([], 'texture_xyz', METIER);
    const rec = getRecommandationsConservation(dlc);
    expect(rec.etiquette).toBeTruthy();
    expect(rec.alerte_chaine_froid).toBe(false);
  });
});

// ── Test 8 : couverture DLC_PAR_TEXTURE ──────────────────────────────────────
describe('DLC_PAR_TEXTURE — couverture des templates', () => {
  const TEMPLATES_ATTENDUS = [
    'mousse_fruits', 'cremeux',
    'ganache_montee_noir', 'ganache_montee_lait', 'ganache_montee_blanc',
    'ganache_montee_fruit', 'ganache_montee_praline', 'ganache_insert',
    'sable_breton', 'pate_sucree', 'streusel', 'croustillant_praline',
    'biscuit_cuillere', 'dacquoise', 'financier', 'madeleine', 'cake_voyage',
    'glace_lait', 'glace_creme', 'glace_chocolat', 'glace_fruits_secs', 'sorbet_fruit',
    'glacage_miroir_neutre', 'glacage_miroir_cacao', 'glacage_miroir_chocolat',
    'glacage_rocher', 'velours_pistolet',
    'confit_fruit', 'gelee_fruit_pate',
  ];

  it('tous les templates ont un barème DLC', () => {
    for (const t of TEMPLATES_ATTENDUS) {
      expect(DLC_PAR_TEXTURE[t], `Barème manquant pour ${t}`).toBeDefined();
    }
  });
});

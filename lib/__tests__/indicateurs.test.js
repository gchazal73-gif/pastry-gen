import { describe, it, expect, beforeAll } from 'vitest';
import { calculerIndicateurs, indicateursPourTexture } from '../engine_indicateurs.js';

// ── Données de test ───────────────────────────────────────────────────────────
// Purée de framboise avec 10 % de sucre ajouté — valeurs représentatives CIQUAL
const mockFramboise = {
  eau_g: 79, lipides_g: 0.7, sucres_g: 13.5, fibres_g: 6.0,
  lactose_g: 0, pod: 65, pac: 65, ph: 3.2,
};

// Mousse framboise classique post-normalisation (total = 100 %)
// Valeurs calculées analytiquement depuis le template + FALLBACK
const lignesMouseFramboise = [
  { role: 'Parfum (purée de fruit)', ingredient: 'Purée framboise 10 %', pct: 42 },
  { role: 'Sucrant',                 ingredient: 'Sucre semoule',          pct: 14 },
  { role: 'Gélifiant',               ingredient: 'Gélatine 200 Bloom',     pct: 1.6 },
  { role: 'Inuline de chicorée',     ingredient: 'Inuline HP',             pct: 4 },
  { role: "Agent d'aération",        ingredient: 'Crème UHT 35 % MG',      pct: 28 },
  { role: 'Eau / phase aqueuse',     ingredient: 'Eau minérale',            pct: 10.4 },
];

// ── 1-5 : Mousse framboise classique ─────────────────────────────────────────
describe('Mousse framboise classique — indicateurs de base', () => {
  let result;
  // Calcul unique réutilisé dans chaque test
  beforeAll(() => {
    result = calculerIndicateurs(lignesMouseFramboise, mockFramboise);
  });

  it('ES ≈ 39.2 % (extrait sec total)', () => {
    // eau = 0.42×79 + 0.14×0.3 + 0.016×9 + 0.04×5 + 0.28×60 + 0.104×100 = 60.77
    // es = 100 − 60.77 = 39.23
    expect(result.es).toBeGreaterThan(38.5);
    expect(result.es).toBeLessThan(40.0);
  });

  it('MG ≈ 10.1 % (matières grasses)', () => {
    // 0.42×0.7 + 0.28×35 = 0.294 + 9.8 = 10.09
    expect(result.mg).toBeGreaterThan(9.5);
    expect(result.mg).toBeLessThan(11.0);
  });

  it('Sucres ≈ 20.6 % (sucres totaux)', () => {
    // 0.42×13.5 + 0.14×99.7 + 0.04×3 + 0.28×3.1 = 5.67+13.96+0.12+0.87 = 20.62
    expect(result.sucres).toBeGreaterThan(19.5);
    expect(result.sucres).toBeLessThan(22.0);
  });

  it('Fibres ≈ 6.1 % (fibres totales)', () => {
    // 0.42×6.0 + 0.04×90 = 2.52 + 3.6 = 6.12
    expect(result.fibres).toBeGreaterThan(5.5);
    expect(result.fibres).toBeLessThan(7.0);
  });

  it('pH = 3.2 (uniquement la purée de fruit contribue)', () => {
    // seul le parfum a ph != null → moyenne pondérée triviale = ph_framboise
    expect(result.ph).toBe(3.2);
  });
});

// ── 6 : Rôle non reconnu → _manquants non vide, aucune valeur NaN ────────────
describe('Rôle non reconnu', () => {
  it('_manquants non vide + aucune valeur NaN', () => {
    const lignes = [
      { role: 'Zeste de yuzu confit', ingredient: 'Yuzu confit', pct: 30 },
      { role: 'Sucrant',              ingredient: 'Sucre semoule', pct: 70 },
    ];
    const result = calculerIndicateurs(lignes, null);
    expect(result._manquants).toHaveLength(1);
    expect(result._manquants[0]).toBe('Zeste de yuzu confit');
    for (const [key, v] of Object.entries(result)) {
      if (typeof v === 'number') {
        expect(isNaN(v), `${key} est NaN`).toBe(false);
      }
    }
  });
});

// ── 7 : POD null quand couverture < 70 % ─────────────────────────────────────
describe('POD null si masse couverte < 70 %', () => {
  it('pod et pac sont null quand 60 % de la recette est inconnue', () => {
    const lignes = [
      { role: 'Sucrant',         ingredient: 'Sucre', pct: 40 },
      { role: 'RÔLE_INCONNU_XZ', ingredient: 'Machin', pct: 60 },
    ];
    const result = calculerIndicateurs(lignes, null);
    expect(result.pod).toBeNull();
    expect(result.pac).toBeNull();
    expect(result.masse_couverte_pct).toBeCloseTo(40, 0);
  });
});

// ── 8 : Cohérence interne — saccharose pur ───────────────────────────────────
describe('Cohérence interne — saccharose 100 %', () => {
  it('es ≈ 99.7, sucres ≈ 99.7, mg ≈ 0, lactose = 0', () => {
    const lignes = [{ role: 'Sucrant', ingredient: 'Saccharose', pct: 100 }];
    const result = calculerIndicateurs(lignes, null);
    expect(result.es).toBeCloseTo(99.7, 0);
    expect(result.sucres).toBeCloseTo(99.7, 0);
    expect(result.mg).toBeCloseTo(0, 1);
    expect(result.lactose).toBe(0);
    expect(result.masse_couverte_pct).toBe(100);
  });
});

// ── 9 : Performance ──────────────────────────────────────────────────────────
describe('Performance', () => {
  it('1 000 calculs sur 15 lignes < 50 ms', () => {
    const lignes = Array.from({ length: 15 }, () => ({
      role: 'Sucrant', ingredient: 'Sucre', pct: 100 / 15,
    }));
    const t0 = Date.now();
    for (let i = 0; i < 1000; i++) calculerIndicateurs(lignes, null);
    expect(Date.now() - t0).toBeLessThan(50);
  });
});

// ── 10 : Glace lait via dataKey ───────────────────────────────────────────────
describe('Glace lait — résolution via dataKey INGREDIENTS_GLACE', () => {
  // Recette glace lait équilibrée (total = 100 %)
  const lignesGlaceLait = [
    { role: 'Lait entier',    ingredient: 'Lait entier UHT',        pct: 50, dataKey: 'lait_entier' },
    { role: 'Crème',          ingredient: 'Crème UHT 35 %',          pct: 10, dataKey: 'creme_35' },
    { role: 'Saccharose',     ingredient: 'Saccharose',              pct: 15, dataKey: 'saccharose' },
    { role: 'Glucose',        ingredient: 'Glucose atomisé DE38',    pct: 6,  dataKey: 'glucose_de38' },
    { role: 'Poudre de lait', ingredient: 'Lait écrémé en poudre',  pct: 7,  dataKey: 'poudre_lait_0' },
    { role: 'Eau',            ingredient: 'Eau',                     pct: 12 },
  ];
  // mg = 0.50×3.5 + 0.10×35 + 0.07×1 = 1.75+3.5+0.07 = 5.32 %  ✓ [4–7]
  // eau_total = 0.50×88 + 0.10×59 + 0.15×0.5 + 0.06×6 + 0.07×4 + 0.12×100
  //           = 44 + 5.9 + 0.075 + 0.36 + 0.28 + 12 = 62.615
  // es = 100 − 62.615 = 37.385 %  ✓ [34–38]

  it('ES dans [34–38 %] (calculé depuis INGREDIENTS_GLACE)', () => {
    const result = calculerIndicateurs(lignesGlaceLait, null);
    expect(result.es).toBeGreaterThanOrEqual(34);
    expect(result.es).toBeLessThanOrEqual(38);
  });

  it('MG dans [4–7 %] (calculé depuis INGREDIENTS_GLACE)', () => {
    const result = calculerIndicateurs(lignesGlaceLait, null);
    expect(result.mg).toBeGreaterThanOrEqual(4);
    expect(result.mg).toBeLessThanOrEqual(7);
  });
});

// ── 11 : Recette 100 % inconnue — pas d'exception ────────────────────────────
describe('Recette 100 % inconnue', () => {
  it('ne lance pas d\'exception et retourne masse_couverte_pct = 0, pod = null', () => {
    const lignes = [
      { role: 'INCONNNU_A', ingredient: 'MachinA', pct: 50 },
      { role: 'INCONNNU_B', ingredient: 'MachinB', pct: 50 },
    ];
    expect(() => calculerIndicateurs(lignes, null)).not.toThrow();
    const result = calculerIndicateurs(lignes, null);
    expect(result.masse_couverte_pct).toBe(0);
    expect(result.pod).toBeNull();
    expect(result.pac).toBeNull();
    expect(result._manquants).toHaveLength(2);
  });
});

// ── 12 : indicateursPourTexture ───────────────────────────────────────────────
describe('indicateursPourTexture', () => {
  it('mousse_fruits → ne contient pas pod, pac, msng', () => {
    const keys = indicateursPourTexture('mousse_fruits');
    expect(keys).not.toContain('pod');
    expect(keys).not.toContain('pac');
    expect(keys).not.toContain('msng');
    expect(keys).toContain('sucres');
    expect(keys).toContain('h2o_libre');
  });

  it('glace_lait → contient pod, pac, msng', () => {
    const keys = indicateursPourTexture('glace_lait');
    expect(keys).toContain('pod');
    expect(keys).toContain('pac');
    expect(keys).toContain('msng');
    expect(keys).not.toContain('sucres');
  });
});

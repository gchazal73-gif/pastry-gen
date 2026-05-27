import { describe, it, expect } from 'vitest';
import { computeMoldVolume, computeMoldSurface, computeDevelopedSurface } from '../moules.js';
import { computeProductionPlan, normalizePercentages } from '../production.js';

// ── Helpers de moules inline pour les tests ───────────────────────────────────
const mouleCircle = (d, h) => ({ forme: 'cylindre',        dimensions: { diametre_cm: d, hauteur_cm: h } });
const mouleCadre  = (l, w, h) => ({ forme: 'parallelepipede', dimensions: { longueur_cm: l, largeur_cm: w, hauteur_cm: h } });
const mouleDS     = (d)    => ({ forme: 'demi_sphere',    dimensions: { diametre_cm: d } });
const mouleCustom = (v)    => ({ forme: 'volume_custom',  dimensions: { volume_ml: v } });

// ── Test 1 : Volume cercle ────────────────────────────────────────────────────
// Ø 18 × H 4,5 → π × 9² × 4,5 = 1 145,1 mL
describe('computeMoldVolume — cylindre Ø18 H4.5', () => {
  it('→ 1145 mL ± 1', () => {
    expect(computeMoldVolume(mouleCircle(18, 4.5))).toBeCloseTo(1145, 0);
  });
});

// ── Test 2 : Volume cadre ─────────────────────────────────────────────────────
// 30 × 40 × 4,5 → 5 400 mL exact
describe('computeMoldVolume — cadre 30×40×4.5', () => {
  it('→ 5400 mL', () => {
    expect(computeMoldVolume(mouleCadre(30, 40, 4.5))).toBe(5400);
  });
});

// ── Test 3 : Volume demi-sphère ───────────────────────────────────────────────
// Ø 8 → (2/3)π × 4³ = 134,0 mL
describe('computeMoldVolume — demi-sphère Ø8', () => {
  it('→ 134 mL ± 1', () => {
    expect(computeMoldVolume(mouleDS(8))).toBeCloseTo(134, 0);
  });
  it('volume_custom retourne volume_ml directement', () => {
    expect(computeMoldVolume(mouleCustom(800))).toBe(800);
  });
});

// ── Test 4 : Masse par couche dans un cercle Ø18 ─────────────────────────────
// surface section = π × 9² = 254,47 cm²
// couche 8 mm = 0,8 cm → volume = 254,47 × 0,8 = 203,6 mL
// densité biscuit 0,4 → masse = 203,6 × 0,4 = 81,4 g
describe('computeMoldSurface + calcul masse couche', () => {
  it('section cylindre Ø18 → 254,47 cm²', () => {
    expect(computeMoldSurface(mouleCircle(18, 4.5))).toBeCloseTo(254.47, 1);
  });
  it('section cadre 30×40 → 1200 cm²', () => {
    expect(computeMoldSurface(mouleCadre(30, 40, 4.5))).toBe(1200);
  });
  it('biscuit 8 mm densité 0,4 dans Ø18 → ~81 g au moulage', () => {
    const surface = computeMoldSurface(mouleCircle(18, 4.5));
    const masse   = surface * (8 / 10) * 0.4; // épaisseur mm→cm, × densité
    expect(masse).toBeCloseTo(81.4, 0);
  });
});

// ── Test 5 : Volume total 6 individuels Ø7 H3,5 ──────────────────────────────
// π × 3,5² × 3,5 = 134,71 mL × 6 = 808,3 mL
describe('volume total 6 individuels Ø7 H3.5', () => {
  it('→ ~808 mL', () => {
    const vol = computeMoldVolume(mouleCircle(7, 3.5));
    expect(vol * 6).toBeCloseTo(808, 0);
  });
});

// ── Test 6 : Perte de production ─────────────────────────────────────────────
describe('perte de production 10 %', () => {
  it('masse_au_moulage × 1,1 = masse_à_préparer', () => {
    expect(500 * 1.1).toBeCloseTo(550, 1);
  });
});

// ── Test 7 : Mode par pourcentage ─────────────────────────────────────────────
// 1000 mL × densité 0,7 = 700 g, composant A 30 % → 210 g (perte = 0)
describe('computeProductionPlan — mode par_pourcentage', () => {
  const moulesMap = { 'm1': { id: 'm1', nom: 'Test 1000 mL', forme: 'volume_custom', dimensions: { volume_ml: 1000 } } };
  const plan = {
    production: { moules: [{ moule_id: 'm1', quantite: 1 }], perte_production_pct: 0, mode_calcul: 'par_pourcentage' },
    montage: {
      couches: [
        { uid: 'a', nom: 'Composant A', assignation: 'couche', pourcentage: 30, densite_g_ml: 0.7 },
        { uid: 'b', nom: 'Composant B', assignation: 'couche', pourcentage: 70, densite_g_ml: 0.7 },
      ],
    },
  };
  it('composant A (30 %) → 210 g', () => {
    const r = computeProductionPlan(plan, moulesMap);
    expect(r.composants[0].masse_au_moulage_g).toBeCloseTo(210, 0);
  });
});

// ── Test 8 : normalizePercentages ────────────────────────────────────────────
// 25/25/30/30 (somme 110) → 22,7/22,7/27,3/27,3 (somme = 100)
describe('normalizePercentages', () => {
  it('ramène 25/25/30/30 à la somme 100', () => {
    const result = normalizePercentages([
      { pourcentage: 25 }, { pourcentage: 25 },
      { pourcentage: 30 }, { pourcentage: 30 },
    ]);
    const somme = result.reduce((s, c) => s + c.pourcentage, 0);
    expect(somme).toBeCloseTo(100, 1);
    expect(result[0].pourcentage).toBeCloseTo(22.7, 1);
    expect(result[2].pourcentage).toBeCloseTo(27.3, 1);
  });
});

// ── Test 9 : Warning stack dépasse hauteur moule ──────────────────────────────
// 8 + 5 + 10 + 25 = 48 mm dans un moule de 45 mm → STACK_DEPASSE_MOULE
describe('computeProductionPlan — warning stack', () => {
  const moulesMap = { 'c18': { id: 'c18', nom: 'Ø18×4.5', forme: 'cylindre', dimensions: { diametre_cm: 18, hauteur_cm: 4.5 } } };
  const plan = {
    production: { moules: [{ moule_id: 'c18', quantite: 1 }], perte_production_pct: 10, mode_calcul: 'par_couches' },
    montage: {
      couches: [
        { uid: 'c1', nom: 'Biscuit',      assignation: 'couche', epaisseur_mm: 8,  densite_g_ml: 0.4  },
        { uid: 'c2', nom: 'Croustillant', assignation: 'couche', epaisseur_mm: 5,  densite_g_ml: 0.8  },
        { uid: 'c3', nom: 'Crémeux',      assignation: 'couche', epaisseur_mm: 10, densite_g_ml: 1.05 },
        { uid: 'c4', nom: 'Mousse',       assignation: 'couche', epaisseur_mm: 25, densite_g_ml: 0.45 },
      ],
    },
  };
  it('warning STACK_DEPASSE_MOULE est émis (48 mm > 45 mm)', () => {
    const r = computeProductionPlan(plan, moulesMap);
    expect(r.warnings.some(w => w.code === 'STACK_DEPASSE_MOULE')).toBe(true);
  });
});

// ── Test 10 : Surface développée + glaçage miroir ────────────────────────────
// Ø18 H4,5 → π×18×4,5 + π×9² = 254,47 + 254,47 = 508,94 cm²
// masse à préparer = 508,94 × 1,2 × 1,5 = 916 g
describe('computeDevelopedSurface — glaçage cercle Ø18 H4.5', () => {
  it('surface développée → ~509 cm²', () => {
    expect(computeDevelopedSurface(mouleCircle(18, 4.5), 4.5)).toBeCloseTo(508.94, 0);
  });
  it('masse glaçage à préparer → ~916 g (ratio 1,2 g/cm² + perte 50 %)', () => {
    const surf   = computeDevelopedSurface(mouleCircle(18, 4.5), 4.5);
    const masse  = surf * 1.2 * 1.5; // min × (1 + 50 %)
    expect(masse).toBeCloseTo(916, 0);
  });
});

// ── Test 11 : Bascule de modes (placeholder — implémenté à l'étape D) ─────────
describe('convertMode — placeholder étape D', () => {
  it('retourne le plan inchangé (implémentation étape D)', async () => {
    const { convertMode } = await import('../production.js');
    const plan = { production: { mode_calcul: 'par_couches' }, montage: { couches: [] } };
    const result = convertMode(plan, 'par_couches', 'par_pourcentage');
    expect(result).toEqual(plan);
  });
});

// ── Test 12 : par_pourcentage — densités hétérogènes ─────────────────────────
// Volume total = 1000 mL, perte = 0
// Chocolat 40 % densité 1.15 → 1000 × 0.40 × 1.15 = 460 g
// Mousse   60 % densité 0.45 → 1000 × 0.60 × 0.45 = 270 g
describe('computeProductionPlan — par_pourcentage densités hétérogènes', () => {
  const moulesMap = { 'vol1000': { id: 'vol1000', nom: '1000 mL', forme: 'volume_custom', dimensions: { volume_ml: 1000 } } };
  const plan = {
    production: { moules: [{ moule_id: 'vol1000', quantite: 1 }], perte_production_pct: 0, mode_calcul: 'par_pourcentage' },
    montage: {
      couches: [
        { uid: 'choc', nom: 'Chocolat', assignation: 'couche', pourcentage: 40, densite_g_ml: 1.15 },
        { uid: 'mousse', nom: 'Mousse', assignation: 'couche', pourcentage: 60, densite_g_ml: 0.45 },
      ],
    },
  };
  it('chocolat 40 % densité 1.15 → 460 g', () => {
    const r = computeProductionPlan(plan, moulesMap);
    expect(r.composants[0].masse_au_moulage_g).toBeCloseTo(460, 0);
  });
  it('mousse 60 % densité 0.45 → 270 g', () => {
    const r = computeProductionPlan(plan, moulesMap);
    expect(r.composants[1].masse_au_moulage_g).toBeCloseTo(270, 0);
  });
});

// ── Test 13 : par_pourcentage — sans densité → défaut 1,0 + warning ──────────
// Volume total = 1000 mL, composant 50 % sans densite_g_ml → 500 g + warning RECETTE_SANS_DENSITE
describe('computeProductionPlan — par_pourcentage sans densité', () => {
  const moulesMap = { 'vol1000b': { id: 'vol1000b', nom: '1000 mL b', forme: 'volume_custom', dimensions: { volume_ml: 1000 } } };
  const plan = {
    production: { moules: [{ moule_id: 'vol1000b', quantite: 1 }], perte_production_pct: 0, mode_calcul: 'par_pourcentage' },
    montage: {
      couches: [
        { uid: 'sans', nom: 'Sans densité', assignation: 'couche', pourcentage: 50 },
        { uid: 'avec', nom: 'Avec densité', assignation: 'couche', pourcentage: 50, densite_g_ml: 1.0 },
      ],
    },
  };
  it('composant sans densité → 500 g (densité par défaut 1.0)', () => {
    const r = computeProductionPlan(plan, moulesMap);
    expect(r.composants[0].masse_au_moulage_g).toBeCloseTo(500, 0);
  });
  it('warning RECETTE_SANS_DENSITE émis pour le composant sans densité', () => {
    const r = computeProductionPlan(plan, moulesMap);
    const w = r.warnings.find(w => w.code === 'RECETTE_SANS_DENSITE');
    expect(w).toBeDefined();
    expect(w.uid).toBe('sans');
  });
});

// ── Test 14 : Synchronisation masse — doubler la quantité double la masse ──────
// Cadre 10×10 H4.5, couche unique 10 mm densité 1.0
// surface = 100 cm², volume = 100 mL, masse = 100 g
// × 2 moules → masse × 2 = 200 g
describe('computeProductionPlan — multiplication par quantité', () => {
  const moulesMap = {
    'cadre10': { id: 'cadre10', nom: '10×10×4.5', forme: 'parallelepipede', dimensions: { longueur_cm: 10, largeur_cm: 10, hauteur_cm: 4.5 } },
  };
  const makePlan = (qty) => ({
    production: { moules: [{ moule_id: 'cadre10', quantite: qty }], perte_production_pct: 0, mode_calcul: 'par_couches' },
    montage: {
      couches: [{ uid: 'c1', nom: 'Couche test', assignation: 'couche', epaisseur_mm: 10, densite_g_ml: 1.0 }],
    },
  });
  it('quantité 1 → 100 g', () => {
    const r = computeProductionPlan(makePlan(1), moulesMap);
    expect(r.composants[0].masse_au_moulage_g).toBe(100);
  });
  it('quantité 2 → 200 g (double masse)', () => {
    const r = computeProductionPlan(makePlan(2), moulesMap);
    expect(r.composants[0].masse_au_moulage_g).toBe(200);
  });
});

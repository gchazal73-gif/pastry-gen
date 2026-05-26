import { describe, it, expect } from 'vitest';
import { reequilibrerNonGlace } from '../engine_reequilibrage.js';
import { calculerIndicateurs } from '../engine_indicateurs.js';

// Recette de base : sucre + crème + eau
const BASE = [
  { role: 'Saccharose',    ingredient: 'Sucre semoule',    pct: 20, g: 160 },
  { role: 'Crème',         ingredient: 'Crème UHT 35 %',  pct: 50, g: 400 },
  { role: 'Phase aqueuse', ingredient: 'Eau',               pct: 30, g: 240 },
];
const MASSE = 800;

// ── 1 : early return pour texture sans fourchettes ────────────────────────────
describe('reequilibrerNonGlace — texture inconnue', () => {
  it('retourne journal vide et lignes avec g recalculés', () => {
    const result = reequilibrerNonGlace(BASE, 'texture_inconnue', MASSE, {});
    expect(result.journal).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    // g doit être recalculé
    const sucre = result.lignes.find(l => l.ingredient === 'Sucre semoule');
    expect(sucre.g).toBeCloseTo(20 * MASSE / 100, 1);
  });
});

// ── 2 : MG trop élevée — mousse_fruits mg:[8,16] ─────────────────────────────
describe('reequilibrerNonGlace — MG trop élevée', () => {
  // Crème 50 % → mg ≈ 17.5 % (> 16)
  const result = reequilibrerNonGlace(BASE, 'mousse_fruits', MASSE, {});

  it('réduit la crème (ingrédient riche en lipides)', () => {
    const creme = result.lignes.find(l => l.ingredient === 'Crème UHT 35 %');
    expect(creme.pct).toBeLessThan(50);
  });

  it('mg dans la fourchette après rééquilibrage', () => {
    const indic = calculerIndicateurs(result.lignes, null);
    expect(indic.mg).toBeGreaterThanOrEqual(8);
    expect(indic.mg).toBeLessThanOrEqual(16);
  });

  it('crée au moins une entrée dans le journal', () => {
    expect(result.journal.length).toBeGreaterThan(0);
    expect(result.journal[0].param).toBe('mg');
    expect(result.journal[0].regle).toContain('→');
  });

  it('recalcule g selon la masse', () => {
    for (const l of result.lignes) {
      expect(l.g).toBeCloseTo(l.pct * MASSE / 100, 1);
    }
  });
});

// ── 3 : Sucres trop bas — mousse_fruits sucres:[14,26] ───────────────────────
describe('reequilibrerNonGlace — sucres trop bas', () => {
  const lignesBasSucres = [
    { role: 'Saccharose',    ingredient: 'Sucre semoule',   pct:  5, g: 0 },
    { role: 'Crème',         ingredient: 'Crème UHT 35 %', pct: 30, g: 0 },
    { role: 'Phase aqueuse', ingredient: 'Eau',              pct: 65, g: 0 },
  ];
  // sucres ≈ 5×0.997 + 30×0.031 = 5.9 % < 14

  const result = reequilibrerNonGlace(lignesBasSucres, 'mousse_fruits', MASSE, {});

  it('augmente le saccharose', () => {
    const sucre = result.lignes.find(l => l.ingredient === 'Sucre semoule');
    expect(sucre.pct).toBeGreaterThan(5);
  });

  it('sucres dans la fourchette après rééquilibrage', () => {
    const indic = calculerIndicateurs(result.lignes, null);
    expect(indic.sucres).toBeGreaterThanOrEqual(14);
    expect(indic.sucres).toBeLessThanOrEqual(26);
  });
});

// ── 4 : ES trop élevé (trop sec) — cremeux es:[30,45] ────────────────────────
describe('reequilibrerNonGlace — ES trop élevé', () => {
  const lignesEsHaut = [
    { role: 'Saccharose',    ingredient: 'Sucre semoule',   pct: 35, g: 0 },
    { role: 'Crème',         ingredient: 'Crème UHT 35 %', pct: 50, g: 0 },
    { role: 'Phase aqueuse', ingredient: 'Eau',              pct: 15, g: 0 },
  ];
  // eau ≈ 0.35×0.3 + 0.5×60 + 0.15×100 = 45.1 → es ≈ 54.9 > 45

  const result = reequilibrerNonGlace(lignesEsHaut, 'cremeux', MASSE, {});

  it('ES dans la fourchette après rééquilibrage', () => {
    const indic = calculerIndicateurs(result.lignes, null);
    expect(indic.es).toBeGreaterThanOrEqual(30);
    expect(indic.es).toBeLessThanOrEqual(45);
  });

  it('journal contient une entrée pour es', () => {
    const entreeEs = result.journal.find(e => e.param === 'es');
    expect(entreeEs).toBeDefined();
  });
});

// ── 5 : Conservation de la masse totale (somme pct ≈ 100) ────────────────────
describe('reequilibrerNonGlace — invariant masse', () => {
  it('la somme des pct reste ≈ 100 après rééquilibrage', () => {
    const result = reequilibrerNonGlace(BASE, 'mousse_fruits', MASSE, {});
    const total = result.lignes.reduce((s, l) => s + l.pct, 0);
    expect(total).toBeCloseTo(100, 0);
  });
});

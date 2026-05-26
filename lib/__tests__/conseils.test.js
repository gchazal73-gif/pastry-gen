import { describe, it, expect } from 'vitest';
import { calculerBreakdown } from '../engine_indicateurs.js';
import { conseilsChiffres } from '../engine_conseils.js';

// ── 1 : calculerBreakdown ─────────────────────────────────────────────────────
describe('calculerBreakdown', () => {
  const lignes = [
    { role: 'Saccharose',          ingredient: 'Sucre semoule',    pct: 20, dataKey: null },
    { role: 'Crème',               ingredient: 'Crème UHT 35 %',  pct: 30, dataKey: 'creme_35' },
    { role: 'Ingrédient inconnu',  ingredient: 'Mystère',         pct: 50, dataKey: null },
  ];

  it('ligne non reconnue → resolu: false, pas de per_100g', () => {
    const bd = calculerBreakdown(lignes, null);
    const inconnu = bd.find(l => l.ingredient === 'Mystère');
    expect(inconnu.resolu).toBe(false);
    expect(inconnu.per_100g).toBeUndefined();
  });

  it('ligne avec dataKey reconnu → resolu: true, lipides > 0', () => {
    const bd = calculerBreakdown(lignes, null);
    const creme = bd.find(l => l.ingredient === 'Crème UHT 35 %');
    expect(creme.resolu).toBe(true);
    expect(creme.per_100g.lipides).toBeGreaterThan(0);
  });

  it('saccharose (FALLBACK) → pod=100, sucres≈99.7', () => {
    const bd = calculerBreakdown(lignes, null);
    const sac = bd.find(l => l.role === 'Saccharose');
    expect(sac.resolu).toBe(true);
    expect(sac.per_100g.pod).toBe(100);
    expect(sac.per_100g.sucres).toBeCloseTo(99.7, 1);
  });

  it('pct conservé identique pour chaque ligne', () => {
    const bd = calculerBreakdown(lignes, null);
    for (const [i, l] of lignes.entries()) {
      expect(bd[i].pct).toBe(l.pct);
    }
  });
});

// ── 2 : conseilsChiffres ──────────────────────────────────────────────────────
describe('conseilsChiffres', () => {
  // Breakdown de test : crème (lipides) + saccharose
  const breakdown = [
    {
      role: 'Crème', ingredient: 'Crème UHT 35 %', pct: 30, resolu: true,
      per_100g: { eau: 60, lipides: 35, msng: 0, sucres: 3.1, fibres: 0, lactose: 3.1, pod: null, pac: null },
    },
    {
      role: 'Saccharose', ingredient: 'Sucre semoule', pct: 20, resolu: true,
      per_100g: { eau: 0.3, lipides: 0, msng: 0, sucres: 99.7, fibres: 0, lactose: 0, pod: 100, pac: 100 },
    },
  ];

  const f_ok = [
    { key: 'mg', label: 'Matières grasses', unite: '%', valeur: 5, min: 4, max: 7, statut: 'ok', conseil: null },
  ];
  const f_hors_haut = [
    { key: 'mg', label: 'Matières grasses', unite: '%', valeur: 12, min: 4, max: 7, statut: 'hors', conseil: 'Réduire la MG.' },
  ];
  const f_hors_bas = [
    { key: 'mg', label: 'Matières grasses', unite: '%', valeur: 2, min: 4, max: 7, statut: 'hors', conseil: 'Augmenter la MG.' },
  ];

  it('statut "ok" → conseil_chiffre null', () => {
    const result = conseilsChiffres(breakdown, f_ok);
    expect(result[0].conseil_chiffre).toBeNull();
  });

  it('mg trop élevé → conseil_chiffre non null, ingrédient = crème', () => {
    const result = conseilsChiffres(breakdown, f_hors_haut);
    expect(result[0].conseil_chiffre).not.toBeNull();
    expect(result[0].conseil_chiffre.ingredient).toBe('Crème UHT 35 %');
  });

  it('mg trop élevé → pct_cible < pct_actuel (réduire)', () => {
    const result = conseilsChiffres(breakdown, f_hors_haut);
    const cc = result[0].conseil_chiffre;
    expect(cc.pct_cible).toBeLessThan(cc.pct_actuel);
  });

  it('mg trop bas → pct_cible > pct_actuel (augmenter)', () => {
    const result = conseilsChiffres(breakdown, f_hors_bas);
    const cc = result[0].conseil_chiffre;
    expect(cc.pct_cible).toBeGreaterThan(cc.pct_actuel);
  });

  it("description contient le nom de l'ingrédient et une flèche →", () => {
    const result = conseilsChiffres(breakdown, f_hors_haut);
    expect(result[0].conseil_chiffre.description).toContain('Crème UHT 35 %');
    expect(result[0].conseil_chiffre.description).toContain('→');
  });

  it('préserve les propriétés existantes de la fourchette (conseil, statut)', () => {
    const result = conseilsChiffres(breakdown, f_hors_haut);
    expect(result[0].conseil).toBe('Réduire la MG.');
    expect(result[0].statut).toBe('hors');
  });

  it('indicateur sans champ actionnable (h2o_libre) → conseil_chiffre null', () => {
    const f_h2o = [
      { key: 'h2o_libre', label: 'Eau libre', unite: '%', valeur: 5, min: 10, max: 25, statut: 'hors', conseil: null },
    ];
    const result = conseilsChiffres(breakdown, f_h2o);
    expect(result[0].conseil_chiffre).toBeNull();
  });

  it('aucune ligne résolue avec lipides > 0 → conseil_chiffre null', () => {
    const bdVide = [
      { role: 'Eau', ingredient: 'Eau', pct: 50, resolu: true,
        per_100g: { eau: 100, lipides: 0, msng: 0, sucres: 0, fibres: 0, lactose: 0, pod: 0, pac: 0 } },
    ];
    const result = conseilsChiffres(bdVide, f_hors_haut);
    expect(result[0].conseil_chiffre).toBeNull();
  });
});

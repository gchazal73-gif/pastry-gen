import { describe, it, expect } from 'vitest';
import { FOURCHETTES_TEXTURE, verifierFourchettes } from '../fourchettes.js';
import { calculerIndicateurs } from '../engine_indicateurs.js';

// ── 1 : Couverture du référentiel ─────────────────────────────────────────────
describe('FOURCHETTES_TEXTURE — couverture du référentiel', () => {
  const TEXTURES_GLACE    = ['glace_lait', 'glace_creme', 'glace_chocolat', 'sorbet_fruit', 'glace_fruits_secs'];
  const TEXTURES_ENTREMETS = ['mousse_fruits', 'cremeux'];

  it('contient les 5 textures glacées avec pod/pac/msng', () => {
    for (const t of TEXTURES_GLACE) {
      expect(FOURCHETTES_TEXTURE[t], `${t} manquant`).toBeDefined();
      expect(FOURCHETTES_TEXTURE[t].pod, `${t}.pod manquant`).toBeDefined();
      expect(FOURCHETTES_TEXTURE[t].pac, `${t}.pac manquant`).toBeDefined();
      expect(FOURCHETTES_TEXTURE[t].msng, `${t}.msng manquant`).toBeDefined();
    }
  });

  it('mousse_fruits et cremeux ont sucres/h2o_libre/ph, pas pod/pac/msng', () => {
    for (const t of TEXTURES_ENTREMETS) {
      const f = FOURCHETTES_TEXTURE[t];
      expect(f.sucres,    `${t}.sucres manquant`).toBeDefined();
      expect(f.h2o_libre, `${t}.h2o_libre manquant`).toBeDefined();
      expect(f.ph,        `${t}.ph manquant`).toBeDefined();
      expect(f.pod,  `${t} ne devrait pas avoir pod`).toBeUndefined();
      expect(f.pac,  `${t} ne devrait pas avoir pac`).toBeUndefined();
      expect(f.msng, `${t} ne devrait pas avoir msng`).toBeUndefined();
    }
  });

  it('toutes les fourchettes sont des tableaux [min, max] avec min < max', () => {
    for (const [texture, fourchettes] of Object.entries(FOURCHETTES_TEXTURE)) {
      for (const [key, range] of Object.entries(fourchettes)) {
        expect(Array.isArray(range), `${texture}.${key} n'est pas un tableau`).toBe(true);
        expect(range).toHaveLength(2);
        expect(range[0], `${texture}.${key} min >= max`).toBeLessThan(range[1]);
      }
    }
  });
});

// ── 2 : verifierFourchettes — statuts ────────────────────────────────────────
describe('verifierFourchettes — statuts ok / attention / hors / inconnu', () => {
  it('statut "ok" quand valeur dans fourchette', () => {
    // glace_lait mg [4, 7] → 5.5 → ok
    const indic = { mg: 5.5, msng: 10, pod: 19, pac: 27, es: 36 };
    const result = verifierFourchettes(indic, 'glace_lait');
    const mg = result.find(r => r.key === 'mg');
    expect(mg.statut).toBe('ok');
    expect(mg.conseil).toBeNull();
  });

  it('statut "hors" quand valeur nettement hors fourchette', () => {
    // glace_lait mg [4, 7] → 1 → hors
    const indic = { mg: 1, msng: 10, pod: 19, pac: 27, es: 36 };
    const result = verifierFourchettes(indic, 'glace_lait');
    const mg = result.find(r => r.key === 'mg');
    expect(mg.statut).toBe('hors');
    expect(mg.conseil).not.toBeNull();
  });

  it('statut "attention" quand valeur dans la marge ±10 % de la largeur', () => {
    // glace_lait mg [4, 7] largeur=3, marge=0.3 → 3.8 (écart 0.2 < 0.3) → attention
    const indic = { mg: 3.8, msng: 10, pod: 19, pac: 27, es: 36 };
    const result = verifierFourchettes(indic, 'glace_lait');
    const mg = result.find(r => r.key === 'mg');
    expect(mg.statut).toBe('attention');
  });

  it('statut "inconnu" quand valeur null', () => {
    const indic = { mg: null, msng: 10, pod: 19, pac: 27, es: 36 };
    const result = verifierFourchettes(indic, 'glace_lait');
    const mg = result.find(r => r.key === 'mg');
    expect(mg.statut).toBe('inconnu');
    expect(mg.valeur).toBeNull();
  });

  it('retourne [] pour une texture inconnue', () => {
    expect(verifierFourchettes({}, 'texture_inexistante')).toEqual([]);
  });
});

// ── 3 : MSNG calculé depuis dataKey ──────────────────────────────────────────
describe('MSNG calculé depuis INGREDIENTS_GLACE via dataKey', () => {
  // Recette glace lait (total = 100 %)
  // msng = 0.50×8.5 + 0.10×5.5 + 0.07×96 = 4.25 + 0.55 + 6.72 = 11.52
  // → dans [9, 12] pour glace_lait → 'ok'
  const lignesGlaceLait = [
    { role: 'Lait entier',    ingredient: 'Lait entier UHT',       pct: 50, dataKey: 'lait_entier' },
    { role: 'Crème',          ingredient: 'Crème UHT 35 %',         pct: 10, dataKey: 'creme_35' },
    { role: 'Saccharose',     ingredient: 'Saccharose',             pct: 15, dataKey: 'saccharose' },
    { role: 'Glucose',        ingredient: 'Glucose atomisé DE38',   pct: 6,  dataKey: 'glucose_de38' },
    { role: 'Poudre de lait', ingredient: 'Lait écrémé en poudre', pct: 7,  dataKey: 'poudre_lait_0' },
    { role: 'Eau',            ingredient: 'Eau',                    pct: 12 },
  ];

  it('msng ≈ 11.5 % (dans la fourchette glace_lait [9–12])', () => {
    const result = calculerIndicateurs(lignesGlaceLait, null);
    expect(result.msng).toBeGreaterThanOrEqual(9);
    expect(result.msng).toBeLessThanOrEqual(12);
  });

  it('verifierFourchettes donne "ok" pour msng avec cette recette', () => {
    const indic = calculerIndicateurs(lignesGlaceLait, null);
    const rapport = verifierFourchettes(indic, 'glace_lait');
    const msng = rapport.find(r => r.key === 'msng');
    expect(msng.statut).toBe('ok');
  });
});

// ── 4 : Intégration engine_glaces — cohérence re-exports ─────────────────────
describe('engine_glaces.js — re-exports backward-compat', () => {
  it('re-exporte calculerIndicateurs et verifierFourchettes depuis engine_glaces', async () => {
    const mod = await import('../engine_glaces.js');
    expect(typeof mod.calculerIndicateurs).toBe('function');
    expect(typeof mod.verifierFourchettes).toBe('function');
    expect(typeof mod.reequilibrer).toBe('function');
  });
});

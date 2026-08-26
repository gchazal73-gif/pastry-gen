import { describe, it, expect } from 'vitest';
import { resoudreParFamille, normaliseLibelle } from '../allergenes-familles.js';
import { getIngredientAllergenes, getRecetteAllergenes, formatLabelInco } from '../allergenes.js';

// Référentiel minimal : tout le reste doit passer par la déduction.
const METIER = {
  'Crème liquide 35%': { allergenes_inco: ['lait'], traces_possibles: ['gluten'] },
};

describe('normaliseLibelle', () => {
  it('minuscule avant la ligature, sinon Œ majuscule survit', () => {
    expect(normaliseLibelle('Œufs entiers')).toBe('oeufs entiers');
    expect(normaliseLibelle('ŒUFS')).toBe('oeufs');
  });

  it('retire parenthèses, pourcentages et marques', () => {
    expect(normaliseLibelle('couverture Guanaja 70% (Valrhona)')).toBe('couverture guanaja');
    expect(normaliseLibelle('Crème fraîche fluide (32/34% MG)')).toBe('creme fraiche fluide');
  });
});

describe('résolution par famille — les trois issues', () => {
  it('déduit la famille porteuse', () => {
    expect(resoudreParFamille('Crème UHT')).toEqual({ allergenes_inco: ['lait'], source: 'deduction' });
    expect(resoudreParFamille('Farine T55').allergenes_inco).toEqual(['gluten']);
    expect(resoudreParFamille('Jaunes d’œufs pasteurisés').allergenes_inco).toEqual(['oeufs']);
  });

  it('reconnaît une famille sans allergène, ce qui n’est pas une ignorance', () => {
    for (const nom of ['Sucre semoule', 'Eau minérale', 'Purée de framboise', 'Pectine NH']) {
      expect(resoudreParFamille(nom).source).toBe('famille_sans_allergene');
      expect(resoudreParFamille(nom).allergenes_inco).toEqual([]);
    }
  });

  it('laisse inconnu ce qu’il ne sait pas rattacher', () => {
    expect(resoudreParFamille('Gourmandise framboise').source).toBe('inconnu');
  });
});

describe('faux positifs classiques — les exclusions doivent tenir', () => {
  it('les farines sans gluten ne sont pas du gluten', () => {
    for (const f of ['Farine de riz', 'Farine de sarrasin', 'Farine de châtaigne', 'Fécule de maïs']) {
      expect(resoudreParFamille(f).allergenes_inco).not.toContain('gluten');
    }
  });

  it('les laits végétaux ne sont pas du lait, le beurre de cacao non plus', () => {
    for (const f of ['Lait de coco', 'Lait de soja', 'Beurre de cacao']) {
      expect(resoudreParFamille(f).allergenes_inco).not.toContain('lait');
    }
  });

  it('la noix de coco et la noix de muscade ne sont pas des fruits à coque', () => {
    expect(resoudreParFamille('Noix de coco râpée').allergenes_inco).toEqual([]);
    expect(resoudreParFamille('Noix de muscade').allergenes_inco).not.toContain('fruits_a_coque_noix');
  });

  it('« blond » d’un sucre n’est pas un chocolat blond', () => {
    expect(resoudreParFamille('Cassonade blonde').allergenes_inco).not.toContain('lait');
    expect(resoudreParFamille('Chocolat blond').allergenes_inco).toContain('lait');
  });

  it('« blanc » de chocolat blanc n’est pas un blanc d’œuf', () => {
    expect(resoudreParFamille('Chocolat blanc 35%').allergenes_inco).not.toContain('oeufs');
    expect(resoudreParFamille('Blancs d’œufs').allergenes_inco).toContain('oeufs');
  });
});

describe('faux négatifs — les pièges dans l’autre sens', () => {
  it('le lait d’amande contient de l’amande', () => {
    expect(resoudreParFamille("Lait d'amande").allergenes_inco).toContain('fruits_a_coque_amande');
  });

  it('un cru lacté porte le lait sans que le mot apparaisse', () => {
    expect(resoudreParFamille('Couverture Jivara').allergenes_inco).toContain('lait');
    expect(resoudreParFamille('Ivoire 35%').allergenes_inco).toContain('lait');
  });

  it('un cru non identifié reste inconnu plutôt que déclaré sans allergène', () => {
    // Le déclarer sans allergène ferait disparaître le lait d'un cru lacté :
    // c'est le faux négatif le plus grave que ce module puisse produire.
    expect(resoudreParFamille('Couverture Ashanti').source).toBe('inconnu');
  });

  it('le praliné porte amande et noisette', () => {
    const r = resoudreParFamille('Praliné noisette 60%');
    expect(r.allergenes_inco).toContain('fruits_a_coque_noisette');
  });
});

describe('intégration dans le moteur', () => {
  it('le référentiel prime sur la déduction et garde les traces', () => {
    const r = getIngredientAllergenes('Crème liquide 35%', METIER);
    expect(r.source).toBe('referentiel');
    expect(r.traces_possibles).toEqual(['gluten']);
  });

  it('la déduction ne prétend jamais connaître les traces', () => {
    const r = getIngredientAllergenes('Crème UHT', METIER);
    expect(r.source).toBe('deduction');
    expect(r.traces_possibles).toEqual([]);
  });

  it('sépare les allergènes vérifiés des allergènes déduits', () => {
    const lignes = [
      { nom: 'Crème liquide 35%', g: 100 },   // référentiel  -> lait vérifié
      { nom: 'Farine T55',        g: 200 },   // déduction    -> gluten déduit
      { nom: 'Sucre semoule',     g: 50  },   // famille sûre -> rien
      { nom: 'Gourmandise fraise', g: 10 },   // inconnu
    ];
    const r = getRecetteAllergenes(lignes, METIER);
    expect(r.allergenes_verifies).toEqual(['lait']);
    expect(r.allergenes_deduits).toEqual(['gluten']);
    expect(r.ingredients_sans_donnees).toEqual(['Gourmandise fraise']);
    expect(r.lignes_par_source).toEqual({
      referentiel: 1, deduction: 1, famille_sans_allergene: 1, inconnu: 1,
    });
  });

  it('un allergène attesté au référentiel sur une ligne n’est pas marqué déduit', () => {
    const lignes = [
      { nom: 'Crème liquide 35%', g: 100 },   // lait, référentiel
      { nom: 'Crème UHT',         g: 100 },   // lait, déduction
    ];
    const r = getRecetteAllergenes(lignes, METIER);
    expect(r.allergenes_verifies).toEqual(['lait']);
    expect(r.allergenes_deduits).toEqual([]);
  });

  it('marque les déduits d’un ° et fournit la note séparément', () => {
    const l = formatLabelInco(['gluten', 'lait'], [], ['gluten']);
    expect(l.texte).toContain('Gluten°');
    expect(l.texte).not.toContain('Lait°');
    expect(l.aDesDeduits).toBe(true);
    expect(l.note).toMatch(/déduit du libellé/);
    // la note reste hors du libellé légal, chaque surface la rend à sa façon
    expect(l.html).not.toContain('déduit du libellé');
  });

  it('sans déduit, le rendu est celui d’avant et la note est vide', () => {
    const l = formatLabelInco(['lait'], []);
    expect(l.texte).toBe('Contient : Lait.');
    expect(l.note).toBe('');
    expect(l.aDesDeduits).toBe(false);
  });
});

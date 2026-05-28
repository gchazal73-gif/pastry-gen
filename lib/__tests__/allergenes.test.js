import { describe, it, expect } from 'vitest';
import {
  getIngredientAllergenes,
  getRecetteAllergenes,
  formatLabelInco,
  listeAllergenesManquants,
  LABELS_ALLERGENES,
} from '../allergenes.js';

// ── Bibliothèque de test inline ───────────────────────────────────────────────

const METIER = {
  'Crème liquide 35%': {
    allergenes_inco: ['lait'], traces_possibles: [],
  },
  'Farine de blé T55': {
    allergenes_inco: ['gluten'], traces_possibles: ['oeufs'],
  },
  'Beurre doux': {
    allergenes_inco: ['lait'], traces_possibles: [],
  },
  'Noisette brute': {
    allergenes_inco: ['fruits_a_coque_noisette'], traces_possibles: ['gluten', 'lait'],
  },
  'Huile de coco': {
    allergenes_inco: [], traces_possibles: [],
  },
  'Eau': {
    allergenes_inco: [], traces_possibles: [],
  },
};

// ── Test 1 : getIngredientAllergenes ─────────────────────────────────────────
describe('getIngredientAllergenes', () => {
  it("retourne les allergènes d'un ingrédient connu", () => {
    const r = getIngredientAllergenes('Crème liquide 35%', METIER);
    expect(r.allergenes_inco).toContain('lait');
    expect(r.connu).toBe(true);
  });

  it('ingrédient inconnu → connu = false, tableaux vides', () => {
    const r = getIngredientAllergenes('Ingrédient XYZ', METIER);
    expect(r.connu).toBe(false);
    expect(r.allergenes_inco).toHaveLength(0);
    expect(r.traces_possibles).toHaveLength(0);
  });

  it('normalisation casse/espaces — lookup insensible à la casse', () => {
    const r = getIngredientAllergenes('crème liquide 35%', METIER);
    expect(r.connu).toBe(true);
    expect(r.allergenes_inco).toContain('lait');
  });

  it('ingrédient sans allergène (huile de coco) → tableaux vides, connu = true', () => {
    const r = getIngredientAllergenes('Huile de coco', METIER);
    expect(r.connu).toBe(true);
    expect(r.allergenes_inco).toHaveLength(0);
    expect(r.traces_possibles).toHaveLength(0);
  });
});

// ── Test 2 : getRecetteAllergenes — union allergènes ─────────────────────────
// crème (lait) + farine (gluten, trace oeufs) → presents=[lait,gluten], traces=[oeufs]
describe('getRecetteAllergenes — union et traces', () => {
  const lignes = [
    { ingredient: 'Crème liquide 35%', g: 200 },
    { ingredient: 'Farine de blé T55', g: 100 },
  ];

  it('allergenes_presents contient lait et gluten', () => {
    const r = getRecetteAllergenes(lignes, METIER);
    expect(r.allergenes_presents).toContain('lait');
    expect(r.allergenes_presents).toContain('gluten');
  });

  it('traces_possibles contient oeufs (trace de farine, pas présent directement)', () => {
    const r = getRecetteAllergenes(lignes, METIER);
    expect(r.traces_possibles).toContain('oeufs');
  });

  it('oeufs absent de allergenes_presents', () => {
    const r = getRecetteAllergenes(lignes, METIER);
    expect(r.allergenes_presents).not.toContain('oeufs');
  });
});

// ── Test 3 : trace promue si allergène présent ailleurs ──────────────────────
// noisette (fruits_a_coque_noisette, trace gluten+lait) + farine (gluten, trace oeufs)
// → gluten est allergène direct (via farine) → ne doit PAS apparaître dans traces
describe('getRecetteAllergenes — trace non dupliquée si allergène direct', () => {
  const lignes = [
    { ingredient: 'Noisette brute',    g: 50  },
    { ingredient: 'Farine de blé T55', g: 150 },
  ];

  it('gluten est dans allergenes_presents, pas dans traces_possibles', () => {
    const r = getRecetteAllergenes(lignes, METIER);
    expect(r.allergenes_presents).toContain('gluten');
    expect(r.traces_possibles).not.toContain('gluten');
  });

  it('lait (trace noisette) reste dans traces si pas allergène direct', () => {
    const r = getRecetteAllergenes(lignes, METIER);
    expect(r.traces_possibles).toContain('lait');
    expect(r.allergenes_presents).not.toContain('lait');
  });
});

// ── Test 4 : ingrédients sans données ────────────────────────────────────────
describe('getRecetteAllergenes — ingrédients sans données', () => {
  const lignes = [
    { ingredient: 'Beurre doux',      g: 100 },
    { ingredient: 'Ingrédient FAKE',  g: 50  },
  ];

  it('ingrédient inconnu dans ingredients_sans_donnees', () => {
    const r = getRecetteAllergenes(lignes, METIER);
    expect(r.ingredients_sans_donnees).toContain('Ingrédient FAKE');
  });

  it('ingrédient connu absent de ingredients_sans_donnees', () => {
    const r = getRecetteAllergenes(lignes, METIER);
    expect(r.ingredients_sans_donnees).not.toContain('Beurre doux');
  });
});

// ── Test 5 : répartition par allergène ───────────────────────────────────────
describe('getRecetteAllergenes — repartition', () => {
  const lignes = [
    { ingredient: 'Crème liquide 35%', g: 200 },
    { ingredient: 'Beurre doux',       g: 100 },
    { ingredient: 'Farine de blé T55', g: 100 },
  ];

  it('repartition liste les allergènes avec leurs ingrédients sources', () => {
    const r = getRecetteAllergenes(lignes, METIER);
    const lait = r.repartition.find(x => x.allergene === 'lait');
    expect(lait).toBeDefined();
    expect(lait.ingredients).toContain('Crème liquide 35%');
    expect(lait.ingredients).toContain('Beurre doux');
  });

  it('repartition inclut le label lisible', () => {
    const r = getRecetteAllergenes(lignes, METIER);
    const gluten = r.repartition.find(x => x.allergene === 'gluten');
    expect(gluten.label).toBe('Gluten');
  });
});

// ── Test 6 : formatLabelInco ─────────────────────────────────────────────────
describe('formatLabelInco', () => {
  it('allergènes seuls → "Contient : Lait, Gluten."', () => {
    const r = formatLabelInco(['lait', 'gluten'], []);
    expect(r.texte).toBe('Contient : Lait, Gluten.');
  });

  it('texte vide si aucun allergène ni trace', () => {
    const r = formatLabelInco([], []);
    expect(r.texte).toBe('');
    expect(r.html).toBe('');
  });

  it('traces seules → "Peut contenir des traces de : Œufs."', () => {
    const r = formatLabelInco([], ['oeufs']);
    expect(r.texte).toBe('Peut contenir des traces de : Œufs.');
  });

  it('les deux → contient + traces dans le même texte', () => {
    const r = formatLabelInco(['lait'], ['oeufs']);
    expect(r.texte).toContain('Contient : Lait.');
    expect(r.texte).toContain('Peut contenir des traces de : Œufs.');
  });

  it('html contient des balises <strong>', () => {
    const r = formatLabelInco(['lait'], []);
    expect(r.html).toContain('<strong>Lait</strong>');
  });
});

// ── Test 7 : listeAllergenesManquants ────────────────────────────────────────
describe('listeAllergenesManquants', () => {
  it('retourne les noms sans entrée dans le référentiel', () => {
    const lignes = [
      { ingredient: 'Beurre doux',    g: 100 },
      { ingredient: 'XYZ inconnu',    g: 50  },
      { ingredient: 'Eau',            g: 200 },
      { ingredient: 'ABC inconnu',    g: 30  },
    ];
    const manquants = listeAllergenesManquants(lignes, METIER);
    expect(manquants).toContain('XYZ inconnu');
    expect(manquants).toContain('ABC inconnu');
    expect(manquants).not.toContain('Beurre doux');
    expect(manquants).not.toContain('Eau');
  });

  it('recette complète → liste vide', () => {
    const lignes = [
      { ingredient: 'Beurre doux',       g: 100 },
      { ingredient: 'Crème liquide 35%', g: 200 },
    ];
    expect(listeAllergenesManquants(lignes, METIER)).toHaveLength(0);
  });
});

// ── Test 8 : LABELS_ALLERGENES — couverture des 21 IDs ───────────────────────
describe('LABELS_ALLERGENES', () => {
  const IDS_INCO = [
    'gluten', 'crustaces', 'oeufs', 'poissons', 'arachides', 'soja', 'lait',
    'fruits_a_coque_amande', 'fruits_a_coque_noisette', 'fruits_a_coque_noix',
    'fruits_a_coque_cajou', 'fruits_a_coque_pecan', 'fruits_a_coque_pistache',
    'fruits_a_coque_macadamia', 'fruits_a_coque_bresil',
    'celeri', 'moutarde', 'sesame', 'sulfites', 'lupin', 'mollusques',
  ];

  it('les 21 identifiants INCO ont tous un label', () => {
    for (const id of IDS_INCO) {
      expect(LABELS_ALLERGENES[id], `Label manquant pour ${id}`).toBeDefined();
    }
  });
});

// Bibliothèque de moules — géométrie + presets
// Formes supportées : cylindre | parallelepipede | demi_sphere | tronc_cone | volume_custom

const r1 = n => Math.round(n * 10) / 10;

// ── Fonctions géométriques ────────────────────────────────────────────────────

export function computeMoldVolume(moule) {
  const d = moule.dimensions;
  switch (moule.forme) {
    case 'cylindre':
      return Math.PI * Math.pow(d.diametre_cm / 2, 2) * d.hauteur_cm;
    case 'parallelepipede':
      return d.longueur_cm * d.largeur_cm * d.hauteur_cm;
    case 'demi_sphere':
      return (2 / 3) * Math.PI * Math.pow(d.diametre_cm / 2, 3);
    case 'tronc_cone': {
      const R1 = d.rayon_haut_cm ?? 0;
      const R2 = d.rayon_bas_cm  ?? 0;
      return (Math.PI * d.hauteur_cm / 3) * (R1 * R1 + R1 * R2 + R2 * R2);
    }
    case 'volume_custom':
      return d.volume_ml ?? 0;
    default:
      return 0;
  }
}

// Surface de section transversale (cm²) — utilisée pour le calcul des couches
export function computeMoldSurface(moule) {
  const d = moule.dimensions;
  switch (moule.forme) {
    case 'cylindre':
      return Math.PI * Math.pow(d.diametre_cm / 2, 2);
    case 'parallelepipede':
      return d.longueur_cm * d.largeur_cm;
    case 'demi_sphere':
      return Math.PI * Math.pow(d.diametre_cm / 2, 2);
    case 'volume_custom':
      return d.surface_cm2 ?? 0;
    default:
      return 0;
  }
}

// Surface développée (cm²) pour calcul du glaçage — manteau + dessus
// hauteur_cm : hauteur réelle de l'entremets (peut différer de la hauteur utile du moule)
export function computeDevelopedSurface(moule, hauteur_cm) {
  const d = moule.dimensions;
  const h = hauteur_cm ?? d.hauteur_cm ?? 0;
  switch (moule.forme) {
    case 'cylindre': {
      const R = d.diametre_cm / 2;
      // manteau (côté) + dessus
      return Math.PI * d.diametre_cm * h + Math.PI * R * R;
    }
    case 'parallelepipede': {
      const perimetre = 2 * (d.longueur_cm + d.largeur_cm);
      return perimetre * h + d.longueur_cm * d.largeur_cm;
    }
    default:
      return 0;
  }
}

// ── Constructeurs seed ────────────────────────────────────────────────────────

function makeCircle(id, nom, d, h, format, est_individuel = false) {
  return {
    id, nom,
    type: 'cercle',
    forme: 'cylindre',
    dimensions: { diametre_cm: d, hauteur_cm: h, longueur_cm: null, largeur_cm: null, volume_ml: null },
    volume_calcule_ml: r1(Math.PI * Math.pow(d / 2, 2) * h),
    format,
    est_individuel,
    notes: '',
  };
}

function makeFrame(id, nom, l, w, h, format) {
  return {
    id, nom,
    type: 'cadre',
    forme: 'parallelepipede',
    dimensions: { diametre_cm: null, longueur_cm: l, largeur_cm: w, hauteur_cm: h, volume_ml: null },
    volume_calcule_ml: l * w * h,
    format,
    est_individuel: false,
    notes: '',
  };
}

function makeDemiSphere(id, nom, d) {
  return {
    id, nom,
    type: 'demi_sphere',
    forme: 'demi_sphere',
    dimensions: { diametre_cm: d, hauteur_cm: null, longueur_cm: null, largeur_cm: null, volume_ml: null },
    volume_calcule_ml: r1((2 / 3) * Math.PI * Math.pow(d / 2, 3)),
    format: 'individuel',
    est_individuel: true,
    notes: '',
  };
}

function makeSilicone(id, nom, volume_ml, notes = '') {
  return {
    id, nom,
    type: 'moule_silicone',
    forme: 'volume_custom',
    dimensions: { diametre_cm: null, hauteur_cm: null, longueur_cm: null, largeur_cm: null, volume_ml },
    volume_calcule_ml: volume_ml,
    format: 'entremets',
    est_individuel: false,
    notes,
  };
}

function makeSilikomart(id, nom, volume_ml, forme, dimensions, format, est_individuel = false, notes = '') {
  return {
    id, nom,
    marque: 'Silikomart',
    type: forme === 'cylindre' ? 'cercle' : forme === 'parallelepipede' ? 'cadre' : 'moule_silicone',
    forme,
    dimensions,
    volume_calcule_ml: volume_ml,
    format,
    est_individuel,
    notes,
  };
}

// ── Presets ───────────────────────────────────────────────────────────────────

export const MOULES_PRESETS = [
  // Cercles entremets H 4,5 cm — Ø 14 à 28 cm
  ...[14, 16, 18, 20, 22, 24, 26, 28].map(d =>
    makeCircle(`cercle-${d}x45`, `Cercle Ø ${d} cm × 4,5 cm`, d, 4.5, 'entremets')
  ),

  // Cercles individuels H 3,5 cm — Ø 6, 7, 8 cm
  ...[6, 7, 8].map(d =>
    makeCircle(`cercle-individuel-${d}x35`, `Cercle individuel Ø ${d} cm × 3,5 cm`, d, 3.5, 'individuel', true)
  ),

  // Cercles tarte H 2 cm — Ø 18 à 28 cm
  ...[18, 20, 22, 24, 26, 28].map(d =>
    makeCircle(`cercle-tarte-${d}x20`, `Cercle tarte Ø ${d} cm × 2 cm`, d, 2, 'tarte')
  ),

  // Cercles tarte individuels H 2 cm — Ø 7, 8, 9 cm
  ...[7, 8, 9].map(d =>
    makeCircle(`cercle-tarte-individuel-${d}x20`, `Cercle tarte individuel Ø ${d} cm × 2 cm`, d, 2, 'tarte', true)
  ),

  // Cadres entremets H 4,5 cm
  makeFrame('cadre-30x40x45',  'Cadre 30 × 40 cm × 4,5 cm',         30, 40, 4.5, 'entremets'),
  makeFrame('cadre-36x56x45',  'Cadre 36 × 56 cm × 4,5 cm',         36, 56, 4.5, 'entremets'),
  makeFrame('cadre-57x37x45',  'Cadre pâtissier 57 × 37 cm × 4,5 cm', 57, 37, 4.5, 'entremets'),
  makeFrame('cadre-16x16x45',  'Cadre 16 × 16 cm × 4,5 cm',         16, 16, 4.5, 'entremets'),
  makeFrame('cadre-20x20x45',  'Cadre 20 × 20 cm × 4,5 cm',         20, 20, 4.5, 'entremets'),

  // Cadres tarte H 2 cm
  makeFrame('cadre-tarte-30x40x20', 'Cadre tarte 30 × 40 cm × 2 cm', 30, 40, 2, 'tarte'),
  makeFrame('cadre-tarte-16x16x20', 'Cadre tarte 16 × 16 cm × 2 cm', 16, 16, 2, 'tarte'),

  // Demi-sphères — Ø 3, 4, 6, 8 cm
  ...[3, 4, 6, 8].map(d =>
    makeDemiSphere(`demi-sphere-${d}`, `Demi-sphère Ø ${d} cm`, d)
  ),

  // Moules silicone — capacité fabricant (volume_custom)
  makeSilicone('silicone-buche-25',       'Moule silicone bûche 25 cm',          1200, 'Gouttière bûche 25 cm — capacité fabricant'),
  makeSilicone('silicone-savarin',        'Moule silicone savarin',               600,  'Savarin Ø 20 cm env.'),
  makeSilicone('silicone-demi-sphere-7',  'Moule silicone demi-sphère Ø 7 cm',   180,  'Ø 7 cm, 1 cavité'),

  // ── Silikomart professionnels ─────────────────────────────────────────────
  // Volumes fabricant vérifiés — volume_custom utilisé pour tous (formes non-standard)

  // Entremets ronds
  makeSilikomart('silikomart-eclipse-1000',   'Silikomart Eclipse 1000',       1050, 'volume_custom',
    { diametre_cm: 18, hauteur_cm: 4.5, longueur_cm: null, largeur_cm: null, volume_ml: 1050 },
    'entremets'),
  makeSilikomart('silikomart-vague',           'Silikomart Vague',              1100, 'volume_custom',
    { diametre_cm: 20, hauteur_cm: 4.5, longueur_cm: null, largeur_cm: null, volume_ml: 1100 },
    'entremets'),
  makeSilikomart('silikomart-universo-1200',   'Silikomart Universo 1200',      1200, 'volume_custom',
    { diametre_cm: 18, hauteur_cm: 6,   longueur_cm: null, largeur_cm: null, volume_ml: 1200 },
    'entremets'),
  makeSilikomart('silikomart-universo-600',    'Silikomart Universo 600',        600, 'volume_custom',
    { diametre_cm: 14, hauteur_cm: 4.5, longueur_cm: null, largeur_cm: null, volume_ml:  600 },
    'entremets'),

  // Bûches
  makeSilikomart('silikomart-buche-250x90',    'Silikomart Bûche/1 (grande)',   1300, 'volume_custom',
    { diametre_cm: null, hauteur_cm: 7, longueur_cm: 25, largeur_cm: 9, volume_ml: 1300 },
    'buche', false, 'Gouttière 25×9cm h7cm — Silikomart BÛCHE/1'),
  makeSilikomart('silikomart-buche-220x60',    'Silikomart Bûche midi',          565, 'volume_custom',
    { diametre_cm: null, hauteur_cm: 5, longueur_cm: 22, largeur_cm: 6, volume_ml:  565 },
    'buche', false, 'Gouttière 22×6cm h5cm — Silikomart BÛCHE midi'),

  // Individuels
  makeSilikomart('silikomart-stone-85',        'Silikomart Stone 85 (8 cav.)',     85, 'volume_custom',
    { diametre_cm: 6.5, hauteur_cm: 3,   longueur_cm: null, largeur_cm: null, volume_ml:  85 },
    'individuel', true, '8 cavités Ø 6.5cm h 3cm'),
  makeSilikomart('silikomart-tourbillon-28',   'Silikomart Tourbillon 28 (6 cav.)', 28, 'volume_custom',
    { diametre_cm: 7.5, hauteur_cm: 0.8, longueur_cm: null, largeur_cm: null, volume_ml:  28 },
    'individuel', true, '6 cavités Ø 7.5cm h 0.8cm'),
  makeSilikomart('silikomart-tourbillon-100',  'Silikomart Tourbillon 100 (2 cav.)', 106, 'volume_custom',
    { diametre_cm: 14,  hauteur_cm: 0.9, longueur_cm: null, largeur_cm: null, volume_ml: 106 },
    'individuel', true, '2 cavités Ø 14cm h 0.9cm'),
];

export const MOULES_MAP = Object.fromEntries(MOULES_PRESETS.map(m => [m.id, m]));

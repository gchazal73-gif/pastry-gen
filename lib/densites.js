// Densités de référence par composant pâtissier (g/mL)
// Surchargeable recette par recette via recette.densite_g_ml

export const DENSITES = {
  // Biscuits
  biscuit_leger:          0.40,
  biscuit_meringue:       0.35,
  financier:              0.55,
  petit_gateau:           0.50,

  // Fonds & croustillants
  croustillant_praline:   0.80,
  pate_sucree:            0.80,
  pate_sablee:            0.80,
  streusel:               0.60,

  // Crèmes & crémeux
  cremeux_fruit:          1.05,
  cremeux_chocolat:       1.02,
  creme_cuite:            1.05,
  namelaka:               0.95,

  // Ganaches
  ganache_cadre:          1.05,
  ganache_montee:         0.70,

  // Mousses
  mousse_chocolat:        0.55,
  mousse_fruit:           0.50,

  // Confits & gelées
  confit_fruit:           1.15,
  gelee:                  1.10,

  // Glaçages & finitions
  glacage_miroir:         1.30,
  glacage_rocher:         0.95,
  nappage:                1.20,

  // Caramels & pâtes de fruit
  caramel:                1.25,
  pate_de_fruit:          1.30,

  // Glaces & sorbets
  glace:                  0.90,
  sorbet:                 0.85,
};

export const DENSITE_DEFAUT = 1.0;

export function getDensite(sous_categorie) {
  return DENSITES[sous_categorie] ?? DENSITE_DEFAUT;
}

// Assignation par défaut selon la catégorie (pour la UI)
export const ASSIGNATION_DEFAUT = {
  biscuits:      'couche',
  cremes:        'couche',
  mousses:       'couche',
  croustillants: 'couche',
  pates:         'couche',
  ganaches:      'couche',
  confits:       'couche',
  glacages:      'habillage',
  decors:        'habillage',
  glaces_sorbets:'couche',
  sirops:        'libre',
  caramels:      'couche',
  assemblages:   'couche',
};

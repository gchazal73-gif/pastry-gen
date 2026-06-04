import { RECETTES_BISCUITS }      from './biscuits.js';
import { RECETTES_CREMES }         from './cremes.js';
import { RECETTES_MOUSSES }        from './mousses.js';
import { RECETTES_CROUSTILLANTS }  from './croustillants.js';
import { RECETTES_PATES }          from './pates.js';
import { RECETTES_GANACHES }       from './ganaches.js';
import { RECETTES_GLACAGES }       from './glacages.js';
import { RECETTES_CONFITS }        from './confits.js';
import { RECETTES_SIROPS }         from './sirops.js';
import { RECETTES_GLACES_SORBETS } from './glaces_sorbets.js';
import { RECETTES_CARAMELS }       from './caramels.js';
import { RECETTES_DECORS }         from './decors.js';
import { RECETTES_BOISSONS }       from './boissons.js';
import { RECETTES_ASSEMBLAGES }             from './assemblages.js';
import { RECETTES_SIGNATURE_FRUIT_AGRUMES } from './signature_fruit_agrumes.js';
import { RECETTES_BONBONS }                 from './bonbons.js';
import { RECETTES_CONFISERIES }             from './confiseries.js';
import { RECETTES_CONFITURES }              from './confitures.js';

const BISCUITS_VOYAGE = new Set([
  'cake', 'biscuit_moelleux', 'brownie', 'madeleine', 'cake_voyage', 'mi_cuit',
]);

function getFamille(categorie, sous_categorie) {
  switch (categorie) {
    case 'glaces_sorbets': return 'glacerie';
    case 'assemblages':    return 'assemblages';
    case 'biscuits':       return BISCUITS_VOYAGE.has(sous_categorie) ? 'gateaux_voyage' : 'biscuits';
    case 'pates':
    case 'croustillants':  return 'pates_fonds';
    case 'cremes':
    case 'mousses':        return 'cremes_mousses';
    case 'ganaches':
    case 'bonbons':        return 'chocolaterie';
    case 'caramels':       return 'caramels_pralines';
    case 'glacages':       return 'finitions_decors';
    case 'decors':         return sous_categorie === 'marshmallow' ? 'confiserie' : 'finitions_decors';
    case 'confits':        return sous_categorie === 'guimauve'    ? 'confiserie' : 'fruits_conserves';
    case 'confiseries':    return 'confiserie';
    case 'confitures':     return 'fruits_conserves';
    case 'boissons':
    case 'sirops':         return 'boissons';
    default:               return null;
  }
}

const _raw = [
  ...RECETTES_ASSEMBLAGES,
  ...RECETTES_SIGNATURE_FRUIT_AGRUMES,
  ...RECETTES_BISCUITS,
  ...RECETTES_CREMES,
  ...RECETTES_MOUSSES,
  ...RECETTES_CROUSTILLANTS,
  ...RECETTES_PATES,
  ...RECETTES_GANACHES,
  ...RECETTES_GLACAGES,
  ...RECETTES_CONFITS,
  ...RECETTES_SIROPS,
  ...RECETTES_GLACES_SORBETS,
  ...RECETTES_CARAMELS,
  ...RECETTES_DECORS,
  ...RECETTES_BOISSONS,
  ...RECETTES_BONBONS,
  ...RECETTES_CONFISERIES,
  ...RECETTES_CONFITURES,
];

export const RECETTES = _raw.map(r => ({
  ...r,
  famille: getFamille(r.categorie, r.sous_categorie),
}));

export const CATEGORIES = {
  biscuits:       { label: "Biscuits & cakes",        ordre: 1  },
  cremes:         { label: "Crèmes",                  ordre: 2  },
  mousses:        { label: "Mousses",                 ordre: 3  },
  croustillants:  { label: "Croustillants & inserts", ordre: 4  },
  pates:          { label: "Pâtes & fonds",           ordre: 5  },
  ganaches:       { label: "Ganaches",                ordre: 6  },
  glacages:       { label: "Glaçages",                ordre: 7  },
  confits:        { label: "Confits & gelées",        ordre: 8  },
  sirops:         { label: "Sirops & imbibage",       ordre: 9  },
  glaces_sorbets: { label: "Glaces & sorbets",        ordre: 10 },
  caramels:       { label: "Caramels & pralinés",     ordre: 11 },
  decors:         { label: "Décors & finitions",      ordre: 12 },
  boissons:       { label: "Boissons",                ordre: 13 },
  assemblages:    { label: "Assemblages",              ordre: 14 },
  bonbons:        { label: "Bonbons & chocolats",      ordre: 15 },
  confiseries:    { label: "Confiseries",              ordre: 16 },
  confitures:     { label: "Confitures & marmelades",  ordre: 17 },
};

export const FAMILLES = {
  glacerie:          { label: 'Glacerie',            ordre: 1  },
  assemblages:       { label: 'Assemblages',          ordre: 2  },
  biscuits:          { label: 'Biscuits',             ordre: 3  },
  gateaux_voyage:    { label: 'Gâteaux de voyage',   ordre: 4  },
  pates_fonds:       { label: 'Pâtes & Fonds',        ordre: 5  },
  cremes_mousses:    { label: 'Crèmes & Mousses',     ordre: 6  },
  chocolaterie:      { label: 'Chocolaterie',          ordre: 7  },
  caramels_pralines: { label: 'Caramels & Pralinés',  ordre: 8  },
  finitions_decors:  { label: 'Finitions & Décors',   ordre: 9  },
  fruits_conserves:  { label: 'Fruits & Conserves',   ordre: 10 },
  confiserie:        { label: 'Confiserie',            ordre: 11 },
  boissons:          { label: 'Boissons',              ordre: 12 },
};

export const SOUS_CAT_LABELS = {
  // Glacerie
  glace_turbinee:        'Glaces turbinées',
  gelato:                'Gelatos',
  glace_fruit:           'Glaces aux fruits',
  glace_chocolat:        'Glaces chocolat',
  sorbet_fruit:          'Sorbets fruits',
  sorbet_eau:            'Sorbets eau',
  sherbet:               'Sherbets',
  sorbet_chocolat:       'Sorbets chocolat',
  semifreddo:            'Semifreddos',
  granita:               'Granités',
  parfait:               'Parfaits',
  mousse_glacee:         'Mousses glacées',
  ice_pop:               'Ice pops',
  bombe_glacee:          'Bombes glacées',
  souffle_glace:         'Soufflés glacés',
  parfait_glace:         'Parfaits glacés',
  // Assemblages
  entremet_moule:        'Entremets moule',
  entremet:              'Entremets',
  entremet_cadre:        'Entremets cadre',
  entremet_cercle:       'Entremets cercle',
  entremet_gateau:       'Entremets gâteau',
  entremet_chocolat:     'Entremets chocolat',
  entremets_individuels: 'Entremets individuels',
  charlotte:             'Charlottes',
  vacherin:              'Vacherins',
  buche_roulee:          'Bûches roulées',
  tarte:                 'Tartes',
  tartelette:            'Tartelettes',
  chausson:              'Chaussons',
  gateau:                'Gâteaux',
  gateau_classique:      'Gâteaux classiques',
  cheesecake:            'Cheesecakes',
  dessert_individuel:    'Desserts individuels',
  dessert_assiette:      "Desserts à l'assiette",
  travel_cake:           'Travel cakes',
  choux:                 'Choux',
  chou:                  'Choux',
  baba:                  'Babas',
  feuillete:             'Feuilletés',
  pavlova:               'Pavlovas',
  cookie:                'Cookies',
  petit_gateau:          'Petits gâteaux',
  // Biscuits
  biscuit_leger:         'Biscuits légers',
  biscuit_entremets:     'Biscuits entremets',
  biscuit_cuillere:      'Biscuits cuillère',
  biscuit_joconde:       'Joconde',
  dacquoise:             'Dacquoise',
  biscuit_meringue:      'Meringues (biscuit)',
  meringue:              'Meringues',
  macaron:               'Macarons',
  biscuit_moelleux:      'Biscuits moelleux',
  madeleine:             'Madeleines',
  mi_cuit:               'Mi-cuits',
  moelleux_choc:         'Moelleux chocolat',
  muffin:                'Muffins',
  clafoutis:             'Clafoutis',
  souffle_chaud:         'Soufflés chauds',
  cake:                  'Cakes',
  cake_voyage:           'Cakes de voyage',
  brownie:               'Brownies',
  biscuit_sec:           'Biscuits secs',
  tuile:                 'Tuiles',
  mirliton:              'Mirlitons',
  rocher:                'Rochers',
  gaufre:                'Gaufres',
  crepe:                 'Crêpes',
  pancake:               'Pancakes',
  pate_frite:            'Pâtes frites',
  scone:                 'Scones',
  biscuit_pate_a_choux:  'Choux (biscuit)',
  viennoiserie:          'Viennoiseries',
  confiserie:            'Confiseries',
  // Pâtes & Fonds
  pate_sucree:           'Pâte sucrée',
  pate_sablee:           'Pâte sablée',
  pate_brisee:           'Pâte brisée',
  pate_linzer:           'Pâte Linzer',
  pate_a_foncer:         'Pâte à foncer',
  pate_amandes:          'Pâte aux amandes',
  pate_levee:            'Pâtes levées',
  pate_a_baba:           'Pâte à baba',
  pate_a_choux:          'Pâte à choux',
  pate_feuilletee:       'Pâte feuilletée',
  croustillant_praline:  'Croustillant praliné',
  streusel:              'Streusel',
  croustillant_chocolat: 'Croustillant chocolat',
  duja:                  'Duja',
  pate_aromatique:       'Pâte aromatique',
  pate_speciale:         'Pâtes spéciales',
  // Crèmes & Mousses
  creme_patissiere:      'Crème pâtissière',
  creme_anglaise:        'Crème anglaise',
  creme_mousseline:      'Crème mousseline',
  creme_chiboust:        'Crème chiboust',
  creme_diplomate:       'Crème diplomate',
  cremeux_fruit:         'Crémeux aux fruits',
  cremeux_chocolat:      'Crémeux chocolat',
  cremeux_monte:         'Crémeux montés',
  panna_cotta:           'Panna cotta',
  creme_dessert:         'Crèmes dessert',
  creme_brulee:          'Crèmes brûlées',
  creme_cuite:           'Crèmes cuites',
  chantilly:             'Chantilly',
  creme_au_beurre:       'Crème au beurre',
  creme_marrons:         'Crème de marrons',
  creme_amandes:         "Crème d'amandes",
  creme_frangipane:      'Frangipane',
  ganache:               'Ganaches',
  mousse:                'Mousses',
  mousse_fruit:          'Mousses aux fruits',
  mousse_fruits:         'Mousses aux fruits',
  mousse_bavaroise:      'Mousses bavaroises',
  bavarois:              'Bavarois',
  mousse_chocolat:       'Mousses chocolat',
  mousse_patebombe:      'Mousses pâte à bombe',
  mousse_legere:         'Mousses légères',
  mousse_autre:          'Autres mousses',
  // Chocolaterie
  ganache_montee:        'Ganaches montées',
  ganache_enrobage:      'Ganaches enrobage',
  ganache_patissiere:    'Ganaches pâtissières',
  ganache_flexible:      'Ganaches flexibles',
  ganache_cremeux:       'Ganaches crémeuses',
  namelaka:              'Namelaka',
  ganache_entremets:     'Ganaches entremets',
  ganache_caramel:       'Ganaches caramel',
  ganache_fruits:        'Ganaches aux fruits',
  ganache_confiseur:     'Ganaches confiseur',
  ganache_bonbon:        'Ganaches bonbon',
  truffe:                'Truffes',
  bonbon_moule:          'Bonbons moulés',
  bonbon_cadre:          'Bonbons cadre',
  bonbon_praline:        'Bonbons pralinés',
  mendiant:              'Mendiants',
  // Caramels & Pralinés
  praline:               'Pralinés',
  praline_cade:          'Pralinés Cade',
  caramel_confiserie:    'Caramels confiserie',
  caramel_confiseur:     'Caramels confiseur',
  amandes_caramelisees:  'Amandes caramélisées',
  nougatine:             'Nougatines',
  pate_de_fruits_a_coque:"Pâtes de fruits à coque",
  creme_tartiner:        'Crèmes à tartiner',
  caramel_sauce:         'Sauces caramel',
  caramel_mou:           'Caramels mous',
  // Finitions & Décors
  glacage_miroir:        'Glaçages miroir',
  glacage_chocolat:      'Glaçages chocolat',
  glacage_enrobage:      'Glaçages enrobage',
  glacage_neutre:        'Glaçages neutres',
  glacage_praline:       'Glaçages pralinés',
  glacage_nappage:       'Nappages',
  glacage_blanc:         'Glaçages blancs',
  glacage_fruits:        'Glaçages aux fruits',
  glacage_eau:           "Glaçages à l'eau",
  espuma:                'Espumas',
  enrobage:              'Enrobages',
  pulverisation:         'Pulvérisations',
  chocolat_plastique:    'Chocolat plastique',
  // Fruits & Conserves
  confit_fruit:          'Confits de fruits',
  confit_fruits_rouges:  'Confits fruits rouges',
  confit_agrumes:        "Confits d'agrumes",
  confit_fruits:         'Confits de fruits',
  gel_fruits:            'Gels de fruits',
  pate_fruits:           'Pâtes de fruits',
  nougat:                'Nougats',
  confiture_fruit:       'Confitures',
  gelee_fruit:           'Gelées de fruits',
  confiture_legume:      'Confitures légumes',
  // Confiserie
  guimauve:              'Guimauves',
  marshmallow:           'Guimauves',
  sucre_cuit:            'Sucres cuits',
  nougat_dur:            'Nougats durs',
  praline_amande:        'Pralines amande',
  pate_amande_chocolat:  "Pâtes d'amande chocolat",
  gomme:                 'Gommes',
  reglisse:              'Réglisses',
  effervescent:          'Bonbons effervescents',
  fruit_confit:          'Fruits confits',
  caramel_lait:          'Caramels au lait',
  liqueur_sucre:         'Liqueurs sucrées',
  // Boissons
  chocolat_chaud:        'Chocolat chaud',
};

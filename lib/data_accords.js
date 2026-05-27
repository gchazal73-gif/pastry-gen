/* =====================================================================
   ACCORDS & COMPOSITIONS — référentiel des associations classiques
   ===================================================================== */

// ── Accords parfums ───────────────────────────────────────────────────────
// Chaque entrée : liste de { id: parfumId, note: description courte }

export const ACCORDS_PARFUMS = {

  /* FRUITS ROUGES */
  framboise: [
    { id: 'litchi',      note: 'accord de référence — douceur florale qui arrondit l\'acidité' },
    { id: 'rose',        note: 'floral délicat — quelques gouttes en finition' },
    { id: 'citron_vert', note: 'acidulé vif, rehausse les arômes sans les couvrir' },
    { id: 'vanille',     note: 'base arrondie, soutient sans masquer la framboise' },
    { id: 'choc_blanc',  note: 'douceur lactée en contraste avec l\'acidité' },
  ],
  fraise: [
    { id: 'rhubarbe',    note: 'accord classique printemps — contraste acide/doux' },
    { id: 'basilic',     note: 'herbal frais, equilibre sucré-végétal' },
    { id: 'citron_vert', note: 'vivacité agrumée, prolonge la fraîcheur' },
    { id: 'vanille',     note: 'rondeur fondante, accord indémodable' },
    { id: 'choc_blanc',  note: 'douceur lactée, structure délicate' },
  ],
  cassis: [
    { id: 'poire',       note: 'accord classique — fraîcheur fruitée complémentaire' },
    { id: 'bergamote',   note: 'agrume floral, élève les notes de cassis' },
    { id: 'citron_vert', note: 'acide vif, renforce le caractère du cassis' },
    { id: 'vanille',     note: 'arrondit la puissance du cassis' },
    { id: 'choc_noir',   note: 'amertume cacaotée, alliance bourguignonne' },
  ],
  cerise: [
    { id: 'choc_noir',   note: 'accord classique — amertume et fruit rouge' },
    { id: 'pate_amande', note: 'amaretto naturel, accord alsacien' },
    { id: 'vanille',     note: 'fond doux, accord intemporel' },
    { id: 'anis',        note: 'signature anisée, rappelle le kirsch' },
    { id: 'cafe',        note: 'bittersweet, accord contemporain' },
  ],
  myrtille: [
    { id: 'citron',      note: 'acidité franche, net et vif' },
    { id: 'vanille',     note: 'base ronde, classique en fond' },
    { id: 'the_earl',    note: 'bergamote du thé, accord floral complexe' },
    { id: 'choc_blanc',  note: 'douceur en miroir de l\'acidité' },
    { id: 'lavande',     note: 'provence — floral discret, surprenant' },
  ],
  mure: [
    { id: 'choc_noir',   note: 'amertume intense, accord automnal' },
    { id: 'vanille',     note: 'fond doux, soutien neutre' },
    { id: 'cannelle',    note: 'épice douce, accord de saison' },
    { id: 'poire',       note: 'fraîcheur sucrée en contrepoint' },
    { id: 'anis',        note: 'herbal doux, accent de tarte' },
  ],

  /* FRUITS À NOYAU */
  abricot: [
    { id: 'passion',     note: 'exotisme acidulé qui prolonge la note abricot' },
    { id: 'vanille',     note: 'fond doux, classique en confiserie' },
    { id: 'pate_amande', note: 'amande et noyau d\'abricot, duo naturel' },
    { id: 'lavande',     note: 'floral provençal, accord estival' },
    { id: 'tonka',       note: 'fève tonka, profondeur vanillée-amandée' },
  ],
  peche: [
    { id: 'framboise',   note: 'accord classique — douceur et acidité' },
    { id: 'vanille',     note: 'rondeur, soutien délicat' },
    { id: 'lavande',     note: 'floral doux, été provençal' },
    { id: 'menthe',      note: 'fraîcheur vive, accord contemporain' },
    { id: 'citron_vert', note: 'vivacité, accentue la fraîcheur de la pêche' },
  ],
  prune: [
    { id: 'choc_noir',   note: 'amertume noble, accord d\'automne' },
    { id: 'vanille',     note: 'fond sucré équilibrant' },
    { id: 'anis',        note: 'signature anisée classique' },
    { id: 'cannelle',    note: 'épice chaude, accord hivernal' },
    { id: 'caramel',     note: 'profondeur sucrée-amère' },
  ],

  /* FRUITS EXOTIQUES */
  mangue: [
    { id: 'passion',     note: 'duo tropical incontournable' },
    { id: 'citron_vert', note: 'acidulé vif, fraîcheur tropicale' },
    { id: 'coco',        note: 'onctuosité douce, île tropicale' },
    { id: 'vanille',     note: 'fond doux, soutien neutre' },
    { id: 'gingembre',   note: 'épice fraîche, accord indo-caraïbe' },
  ],
  passion: [
    { id: 'mangue',      note: 'duo classique — douceur et acidité tropicale' },
    { id: 'coco',        note: 'onctueux en contrepoint de l\'acidité' },
    { id: 'vanille',     note: 'fond arrondi, équilibre l\'acide' },
    { id: 'citron_vert', note: 'vivacité agrumée, double acidité vive' },
    { id: 'banane',      note: 'douceur sucrée, ancrage tropical' },
  ],
  coco: [
    { id: 'citron_vert', note: 'acidulé vif, fraîcheur caraïbe' },
    { id: 'passion',     note: 'tropical acidulé, accord classique' },
    { id: 'mangue',      note: 'douceur exotique complémentaire' },
    { id: 'vanille',     note: 'fond doux, soutient la noix de coco' },
    { id: 'the_matcha',  note: 'vert-laiteux, accord japon-caraïbes' },
  ],
  ananas: [
    { id: 'coco',        note: 'piña colada — accord tropical classique' },
    { id: 'passion',     note: 'double acidité tropicale' },
    { id: 'citron_vert', note: 'vivacité vive, accentue la fraîcheur' },
    { id: 'vanille',     note: 'fond arrondi, soutient sans couvrir' },
    { id: 'gingembre',   note: 'épice fraîche, accord antillais' },
  ],
  litchi: [
    { id: 'framboise',   note: 'accord iconique — acidité et floral' },
    { id: 'rose',        note: 'floral élégant, finesse extrême' },
    { id: 'citron_vert', note: 'vivacité légère, accord asiatique' },
    { id: 'vanille',     note: 'fond doux, ancre le litchi' },
    { id: 'the_jasmin',  note: 'floral oriental, accord subtil' },
  ],
  banane: [
    { id: 'choc_lait',   note: 'accord grand classique, banana split' },
    { id: 'caramel',     note: 'douceur profonde, accord brûlé' },
    { id: 'vanille',     note: 'fond neutre-doux, soutien classique' },
    { id: 'praline_no',  note: 'noisette grillée, rondeur prononcée' },
    { id: 'coco',        note: 'douceur tropicale complémentaire' },
  ],
  figue: [
    { id: 'choc_noir',   note: 'amertume en contrepoint de la douceur figues' },
    { id: 'pate_amande', note: 'accord méditerranéen naturel' },
    { id: 'cannelle',    note: 'épice douce, accord automnal' },
    { id: 'lavande',     note: 'floral provençal, accord ensoleillé' },
    { id: 'vanille',     note: 'fond sucré, élève la figue' },
  ],
  marron: [
    { id: 'vanille',     note: 'duo intemporel, base de mont-blanc' },
    { id: 'choc_noir',   note: 'amertume noble, accent automnal' },
    { id: 'cassis',      note: 'acidité franche, contraste fruité-terreux' },
    { id: 'tonka',       note: 'profondeur vanillée-amandée' },
    { id: 'cafe',        note: 'bittersweet, accord terrien' },
  ],

  /* AGRUMES */
  citron: [
    { id: 'framboise',   note: 'acidulé fruité — tarte citron-framboise' },
    { id: 'fraise',      note: 'fraîcheur estivale, accord printanier' },
    { id: 'the_matcha',  note: 'vert-acidulé, accord japonisant' },
    { id: 'vanille',     note: 'fond doux équilibrant' },
    { id: 'myrtille',    note: 'accord net et vif' },
  ],
  citron_vert: [
    { id: 'mangue',      note: 'tropical acidulé, accord caraïbe' },
    { id: 'passion',     note: 'double acidité vive tropicale' },
    { id: 'coco',        note: 'vivacité en contrepoint de l\'onctueux' },
    { id: 'framboise',   note: 'acidité complémentaire, duo vif' },
    { id: 'ananas',      note: 'fraîcheur tropicale renforcée' },
  ],
  yuzu: [
    { id: 'vanille',     note: 'fond doux, contraste avec l\'agrume' },
    { id: 'fraise',      note: 'fruité doux, note japonisante' },
    { id: 'the_matcha',  note: 'accord japon — vert et agrumé' },
    { id: 'coco',        note: 'onctueux en contrepoint de l\'acidité yuzu' },
    { id: 'citron',      note: 'double agrume, accord tonique' },
  ],
  orange: [
    { id: 'choc_noir',   note: 'accord classique — Grand Marnier en pâtisserie' },
    { id: 'cannelle',    note: 'épice de Noël, accord chaleureux' },
    { id: 'cafe',        note: 'amertume commune, accord intense' },
    { id: 'vanille',     note: 'fond doux, soutient l\'orange' },
    { id: 'cardamome',   note: 'épice subtile, accord oriental' },
  ],

  /* CHOCOLATS */
  choc_noir: [
    { id: 'framboise',   note: 'acidité fruitée — duo de référence' },
    { id: 'cerise',      note: 'accord classique type forêt-noire' },
    { id: 'orange',      note: 'amertume partagée, accord Grand Marnier' },
    { id: 'cafe',        note: 'double amertume, puissance maximale' },
    { id: 'caramel',     note: 'sucré-amer, profondeur intense' },
  ],
  choc_lait: [
    { id: 'caramel',     note: 'accord doux-sucré, rondeur totale' },
    { id: 'cafe',        note: 'bittersweet, réveille le chocolat au lait' },
    { id: 'praline_no',  note: 'noisette et lait, accord gianduja naturel' },
    { id: 'banane',      note: 'banana split, classique revisité' },
    { id: 'vanille',     note: 'fond doux, souligne la douceur lactée' },
  ],
  choc_blanc: [
    { id: 'framboise',   note: 'contraste acide-doux, accord contemporain' },
    { id: 'fraise',      note: 'fruité doux sur fond lacté' },
    { id: 'passion',     note: 'exotisme acidulé en contrepoint de la douceur' },
    { id: 'the_matcha',  note: 'vert-laiteux, accord japonisant' },
    { id: 'citron_vert', note: 'vivacité agrumée sur fond lacté' },
  ],
  choc_blond: [
    { id: 'cafe',        note: 'caramélisé + torréfié, accord brûlé' },
    { id: 'caramel',     note: 'double caramélisation, profondeur' },
    { id: 'praline_no',  note: 'noisette grillée, accord naturel' },
    { id: 'vanille',     note: 'fond doux, prolonge le caramélisé' },
    { id: 'banane',      note: 'douceur tropicale, accord fondant' },
  ],
  choc_ruby: [
    { id: 'framboise',   note: 'fruit rouge acidulé — accord de référence ruby' },
    { id: 'litchi',      note: 'floral doux, duo berry-lychee' },
    { id: 'rose',        note: 'floral élégant sur fond fruité' },
    { id: 'fraise',      note: 'berries printaniers, accord net' },
    { id: 'rhubarbe',    note: 'acidité franche, accord de saison' },
  ],

  /* PRALINÉS */
  praline_no: [
    { id: 'choc_lait',   note: 'gianduja naturel, accord fondamental' },
    { id: 'cafe',        note: 'torréfié-grillé, puissance douce' },
    { id: 'caramel',     note: 'sucré profond, rondeur complète' },
    { id: 'vanille',     note: 'fond neutre-doux, soutien classique' },
    { id: 'framboise',   note: 'acidité fruitée en contrepoint du gras' },
  ],
  praline_pi: [
    { id: 'choc_blanc',  note: 'douceur lactée, fond discret' },
    { id: 'framboise',   note: 'accord iconique — le duo pistache-framboise' },
    { id: 'citron',      note: 'acidulé vif, relève la pistache' },
    { id: 'rose',        note: 'floral doux, accord oriental' },
    { id: 'myrtille',    note: 'accord moderne — vert et violet' },
  ],
  pate_pistache: [
    { id: 'framboise',   note: 'accord iconique de la pâtisserie française' },
    { id: 'rose',        note: 'floral oriental, duo méditerranéen' },
    { id: 'citron_vert', note: 'vivacité agrumée, relève la pistache' },
    { id: 'choc_blanc',  note: 'fond lacté discret, soutien' },
    { id: 'myrtille',    note: 'accord fruité-végétal, contemporain' },
  ],

  /* ÉPICES & INFUSIONS */
  vanille: [
    { id: 'caramel',     note: 'duo fondamental de la crème brûlée' },
    { id: 'tonka',       note: 'profondeur amandée-vanillée' },
    { id: 'praline_no',  note: 'noisette fondue, fond parfumé' },
    { id: 'framboise',   note: 'acidité fruitée sur fond lacté' },
    { id: 'peche',       note: 'accord estival classique' },
  ],
  caramel: [
    { id: 'vanille',     note: 'duo de référence, profondeur sucrée' },
    { id: 'tonka',       note: 'note vanillée-amandée, beurre salé sublimé' },
    { id: 'cafe',        note: 'bittersweet, accord moka-caramel' },
    { id: 'choc_lait',   note: 'fondant doux, profondeur lactée' },
    { id: 'praline_no',  note: 'noisette caramélisée, accord naturel' },
  ],
  cafe: [
    { id: 'choc_noir',   note: 'double amertume, puissance maximale' },
    { id: 'caramel',     note: 'moka classique, rondeur sucrée' },
    { id: 'vanille',     note: 'fond doux, équilibre l\'amertume' },
    { id: 'tonka',       note: 'accord subtil et raffiné' },
    { id: 'cardamome',   note: 'café cardamome, accord moyen-oriental' },
  ],
  tonka: [
    { id: 'choc_noir',   note: 'amertume et fève, accord puissant' },
    { id: 'caramel',     note: 'sucré profond, beurre salé naturel' },
    { id: 'cafe',        note: 'torréfié, accord très proche' },
    { id: 'vanille',     note: 'duo vanille-tonka, fondamental' },
    { id: 'praline_no',  note: 'noisette grillée, accord terrien' },
  ],
  the_matcha: [
    { id: 'citron_vert', note: 'vert-agrumé, accord japonisant' },
    { id: 'framboise',   note: 'acidité fruitée sur fond vert' },
    { id: 'fraise',      note: 'fruité doux, contraste vert-rose' },
    { id: 'coco',        note: 'laiteux tropical, duo asiatique' },
    { id: 'yuzu',        note: 'double accord japonais, très élégant' },
  ],
};

// ── Compositions d'entremets ──────────────────────────────────────────────

const S = { printemps: 'printemps', ete: 'été', automne: 'automne', hiver: 'hiver' };

export const COMPOSITIONS_ENTREMETS = [

  /* ── Printemps ── */
  {
    id: 'fraisier_revisite',
    nom: 'Fraisier revisité',
    saison: S.printemps,
    parfums: ['fraise', 'citron_vert', 'vanille'],
    couches: [
      { couche: 'Base',     texture: 'Biscuit joconde',    parfum: 'nature'     },
      { couche: 'Insert',   texture: 'Crémeux',            parfum: 'citron_vert'},
      { couche: 'Corps',    texture: 'Mousse légère',      parfum: 'fraise'     },
      { couche: 'Finition', texture: 'Glaçage miroir',     parfum: 'fraise'     },
    ],
    description: 'Mousse fraise aérée sur insert citron vert acidulé, biscuit joconde imbibé vanille.',
  },
  {
    id: 'framboise_litchi_rose',
    nom: 'Framboise, Litchi & Rose',
    saison: S.printemps,
    parfums: ['framboise', 'litchi', 'rose'],
    couches: [
      { couche: 'Base',     texture: 'Dacquoise amande',   parfum: 'nature'     },
      { couche: 'Insert',   texture: 'Crémeux',            parfum: 'framboise'  },
      { couche: 'Corps',    texture: 'Mousse légère',      parfum: 'litchi'     },
      { couche: 'Finition', texture: 'Glaçage miroir',     parfum: 'framboise'  },
    ],
    description: 'Mousse litchi aérée, insert framboise acidulé, base dacquoise amande. Eau de rose en finition.',
  },
  {
    id: 'rhubarbe_fraise',
    nom: 'Rhubarbe & Fraise',
    saison: S.printemps,
    parfums: ['rhubarbe', 'fraise', 'vanille'],
    couches: [
      { couche: 'Base',     texture: 'Sablé breton',       parfum: 'nature'     },
      { couche: 'Insert',   texture: 'Confit',             parfum: 'rhubarbe'   },
      { couche: 'Corps',    texture: 'Mousse légère',      parfum: 'fraise'     },
      { couche: 'Finition', texture: 'Nappage neutre',     parfum: 'vanille'    },
    ],
    description: 'Confit rhubarbe légèrement acide, mousse fraise fondante, sablé breton croustillant.',
  },

  /* ── Été ── */
  {
    id: 'vacherin_mangue_passion',
    nom: 'Vacherin Mangue-Passion',
    saison: S.ete,
    parfums: ['mangue', 'passion', 'coco'],
    couches: [
      { couche: 'Base',     texture: 'Meringue croquante', parfum: 'nature'     },
      { couche: 'Insert',   texture: 'Sorbet',             parfum: 'passion'    },
      { couche: 'Corps',    texture: 'Mousse légère',      parfum: 'mangue'     },
      { couche: 'Décor',    texture: 'Crème montée',       parfum: 'coco'       },
    ],
    description: 'Mousse mangue soyeuse, insert sorbet passion acidulé, meringue croquante en base.',
  },
  {
    id: 'abricot_lavande',
    nom: 'Abricot & Lavande',
    saison: S.ete,
    parfums: ['abricot', 'lavande', 'vanille'],
    couches: [
      { couche: 'Base',     texture: 'Financier amande',   parfum: 'nature'     },
      { couche: 'Insert',   texture: 'Confit',             parfum: 'abricot'    },
      { couche: 'Corps',    texture: 'Mousse légère',      parfum: 'abricot'    },
      { couche: 'Finition', texture: 'Nappage miroir',     parfum: 'lavande'    },
    ],
    description: 'Mousse abricot ensoleillée, insert confit acidulé, financier amande, touche de lavande provençale.',
  },
  {
    id: 'agrumes_matcha',
    nom: 'Yuzu & Thé Matcha',
    saison: S.ete,
    parfums: ['yuzu', 'the_matcha', 'citron_vert'],
    couches: [
      { couche: 'Base',     texture: 'Biscuit dacquoise',  parfum: 'nature'     },
      { couche: 'Insert',   texture: 'Crémeux',            parfum: 'yuzu'       },
      { couche: 'Corps',    texture: 'Mousse légère',      parfum: 'the_matcha' },
      { couche: 'Finition', texture: 'Glaçage',            parfum: 'citron_vert'},
    ],
    description: 'Mousse matcha veloutée, crémeux yuzu vibrant, biscuit dacquoise, glaçage citron vert.',
  },

  /* ── Automne ── */
  {
    id: 'mont_blanc_revisite',
    nom: 'Mont-Blanc revisité',
    saison: S.automne,
    parfums: ['marron', 'cassis', 'vanille'],
    couches: [
      { couche: 'Base',     texture: 'Meringue moelleuse', parfum: 'nature'     },
      { couche: 'Insert',   texture: 'Confit',             parfum: 'cassis'     },
      { couche: 'Corps',    texture: 'Mousse légère',      parfum: 'marron'     },
      { couche: 'Finition', texture: 'Crème légère',       parfum: 'vanille'    },
    ],
    description: 'Mousse marron dense sur insert cassis acidulé, meringue croustillante, crème vanille en pointe.',
  },
  {
    id: 'poire_chocolat',
    nom: 'Poire Belle-Hélène',
    saison: S.automne,
    parfums: ['poire', 'choc_noir', 'vanille'],
    couches: [
      { couche: 'Base',     texture: 'Brownie chocolat',   parfum: 'choc_noir'  },
      { couche: 'Insert',   texture: 'Confit',             parfum: 'poire'      },
      { couche: 'Corps',    texture: 'Mousse',             parfum: 'choc_noir'  },
      { couche: 'Finition', texture: 'Glaçage miroir',     parfum: 'choc_noir'  },
    ],
    description: 'Mousse chocolat intense, insert poire fondant, brownie croustillant en base.',
  },
  {
    id: 'praline_cafe',
    nom: 'Praliné Noisette & Café',
    saison: S.automne,
    parfums: ['praline_no', 'cafe', 'caramel'],
    couches: [
      { couche: 'Base',     texture: 'Biscuit joconde',    parfum: 'cafe'       },
      { couche: 'Croustillant', texture: 'Praliné feuilleté', parfum: 'praline_no' },
      { couche: 'Insert',   texture: 'Crémeux',            parfum: 'cafe'       },
      { couche: 'Corps',    texture: 'Mousse',             parfum: 'praline_no' },
    ],
    description: 'Mousse praliné noisette, crémeux café intense, croustillant feuilleté, biscuit café.',
  },

  /* ── Hiver ── */
  {
    id: 'vanille_tonka',
    nom: 'Bûche Vanille & Tonka',
    saison: S.hiver,
    parfums: ['vanille', 'tonka', 'caramel'],
    couches: [
      { couche: 'Base',     texture: 'Biscuit roulé',      parfum: 'vanille'    },
      { couche: 'Croustillant', texture: 'Caramel feuilleté', parfum: 'caramel' },
      { couche: 'Insert',   texture: 'Crémeux',            parfum: 'tonka'      },
      { couche: 'Corps',    texture: 'Mousse légère',      parfum: 'vanille'    },
    ],
    description: 'Mousse vanille grand cru, crémeux tonka profond, caramel feuilleté, biscuit roulé.',
  },
  {
    id: 'foret_noire',
    nom: 'Forêt-Noire revisitée',
    saison: S.hiver,
    parfums: ['choc_noir', 'cerise', 'vanille'],
    couches: [
      { couche: 'Base',     texture: 'Biscuit chocolat',   parfum: 'choc_noir'  },
      { couche: 'Insert',   texture: 'Confit',             parfum: 'cerise'     },
      { couche: 'Corps',    texture: 'Mousse',             parfum: 'choc_noir'  },
      { couche: 'Décor',    texture: 'Crème chantilly',    parfum: 'vanille'    },
    ],
    description: 'Mousse chocolat noir intense, insert cerise kirschée, biscuit moelleux, chantilly vanille.',
  },
  {
    id: 'orangette_epices',
    nom: 'Orangette & Épices',
    saison: S.hiver,
    parfums: ['orange', 'choc_noir', 'cannelle'],
    couches: [
      { couche: 'Base',     texture: 'Financier amande',   parfum: 'nature'     },
      { couche: 'Croustillant', texture: 'Praliné amande', parfum: 'nature'     },
      { couche: 'Insert',   texture: 'Crémeux',            parfum: 'orange'     },
      { couche: 'Corps',    texture: 'Mousse',             parfum: 'choc_noir'  },
    ],
    description: 'Mousse chocolat noir, crémeux orange Grand Marnier, croustillant amande, financier épicé.',
  },
];

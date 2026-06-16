/* ==========================================================================
   lib/glacerie.js
   Données et normes pour le tableau analytique glaces & sorbets
   Sources :
     - Fruits : Francisco J. Migoya / CIA "Frozen Desserts" p. 410-421
     - PAC / POD références : Corvitto "Los Secretos del Helado" (cité par Migoya)
     - Normes : litterature glace pro (CFP, ENSP, L. Caviezel)
   ========================================================================== */

// ---------------------------------------------------------------------------
// 1. TABLE DES FRUITS
//    sugar_pct  = % sucres moyens pour 100 g de purée/jus (source Migoya)
//    solids_pct = % d'extrait sec total pour 100 g (source Migoya)
//    acid_pct   = % d'acidité (source Migoya)
//    pac        = contribution PAC pour 100 g de purée
//                 Calcul : sugar_pct × 1.80
//                 (sucres fruit = mix fructose/glucose, PAC moyen ≈ 180 vs saccharose=100)
//    pod        = contribution POD pour 100 g de purée
//                 Calcul : sugar_pct × 1.00
//                 (fructose POD=170, glucose POD=70 → moyenne ≈ 120 ; on prend 100 pour rester conservateur)
// ---------------------------------------------------------------------------
export const FRUITS_GLACE = {
  pomme:        { label: 'Pomme',               sugar_pct: 13, solids_pct: 14, acid_pct: 0.8  },
  abricot:      { label: 'Abricot',             sugar_pct:  9, solids_pct: 14, acid_pct: 1.7  },
  avocat:       { label: 'Avocat',              sugar_pct:  1, solids_pct: 27, acid_pct: 0.2  },
  banane:       { label: 'Banane',              sugar_pct: 17, solids_pct: 25, acid_pct: 0.3  },
  mure:         { label: 'Mûre',               sugar_pct:  8, solids_pct: 16, acid_pct: 1.5  },
  cassis:       { label: 'Cassis',             sugar_pct: 10, solids_pct: 15, acid_pct: 3.2  },
  myrtille:     { label: 'Myrtille',           sugar_pct: 11, solids_pct: 15, acid_pct: 0.3  },
  cactus_pear:  { label: 'Figue de Barbarie',  sugar_pct: 11, solids_pct: 19, acid_pct: 0.1  },
  cerise:       { label: 'Cerise',             sugar_pct: 14, solids_pct: 19, acid_pct: 0.5  },
  noix_coco:    { label: 'Noix de coco (purée)', sugar_pct: 0, solids_pct: 56, acid_pct: 0   },
  canneberge:   { label: 'Canneberge',         sugar_pct:  4, solids_pct: 16, acid_pct: 3.0  },
  figue:        { label: 'Figue',              sugar_pct: 15, solids_pct: 23, acid_pct: 0.4  },
  groseille:    { label: 'Groseille à maq.',   sugar_pct: 11, solids_pct: 15, acid_pct: 1.8  },
  raisin:       { label: 'Raisin',             sugar_pct: 16, solids_pct: 21, acid_pct: 0.3  },
  pamplemousse: { label: 'Pamplemousse',       sugar_pct:  6, solids_pct: 10, acid_pct: 2.0  },
  goyave:       { label: 'Goyave',             sugar_pct:  7, solids_pct: 15, acid_pct: 0.4  },
  melon_jaune:  { label: 'Melon jaune',        sugar_pct: 10, solids_pct:  8, acid_pct: 0.2  },
  kiwi:         { label: 'Kiwi',               sugar_pct: 14, solids_pct: 16, acid_pct: 3.0  },
  citron:       { label: 'Citron jaune',       sugar_pct:  2, solids_pct:  9, acid_pct: 5.0  },
  citron_vert:  { label: 'Citron vert',        sugar_pct:  1, solids_pct:  9, acid_pct: 5.0  },
  litchi:       { label: 'Litchi',             sugar_pct: 17, solids_pct: 15, acid_pct: 0.3  },
  mandarine:    { label: 'Mandarine',          sugar_pct: 13, solids_pct: 12, acid_pct: 1.0  },
  mangue:       { label: 'Mangue',             sugar_pct: 11, solids_pct: 15, acid_pct: 0.5  },
  melon:        { label: 'Melon (cantaloup)',  sugar_pct:  7, solids_pct:  8, acid_pct: 0.2  },
  orange:       { label: 'Orange',             sugar_pct: 11, solids_pct: 10, acid_pct: 1.2  },
  papaye:       { label: 'Papaye',             sugar_pct:  8, solids_pct: 15, acid_pct: 0.1  },
  passion:      { label: 'Fruit de la passion',sugar_pct: 11, solids_pct: 15, acid_pct: 3.0  },
  peche:        { label: 'Pêche',              sugar_pct:  9, solids_pct: 14, acid_pct: 0.4  },
  poire:        { label: 'Poire',              sugar_pct: 10, solids_pct: 17, acid_pct: 0.1  },
  kaki:         { label: 'Kaki (Persimmon)',   sugar_pct: 14, solids_pct: 14, acid_pct: 0.2  },
  ananas:       { label: 'Ananas',             sugar_pct: 13, solids_pct: 14, acid_pct: 1.1  },
  prune:        { label: 'Prune',              sugar_pct: 11, solids_pct: 19, acid_pct: 0.6  },
  grenade:      { label: 'Grenade',            sugar_pct: 13, solids_pct: 20, acid_pct: 1.2  },
  framboise:    { label: 'Framboise',          sugar_pct:  7, solids_pct: 14, acid_pct: 1.6  },
  groseille_r:  { label: 'Groseille rouge',    sugar_pct:  6, solids_pct: 16, acid_pct: 1.8  },
  fraise:       { label: 'Fraise',             sugar_pct:  7, solids_pct: 11, acid_pct: 1.6  },
  tomate:       { label: 'Tomate',             sugar_pct:  3, solids_pct: 16, acid_pct: 0.5  },
  pasteque:     { label: 'Pastèque',           sugar_pct:  9, solids_pct:  7, acid_pct: 0.2  },
  yuzu:         { label: 'Yuzu',               sugar_pct:  3, solids_pct: 11, acid_pct: 4.5  },
  bergamote:    { label: 'Bergamote',          sugar_pct:  4, solids_pct: 10, acid_pct: 5.5  },
};

// Dériver PAC/POD/MG/MSNG/eau pour chaque fruit (compatibles avec le calculateur)
for (const [, f] of Object.entries(FRUITS_GLACE)) {
  f.pac        = +(f.sugar_pct * 1.80).toFixed(2);  // PAC ≈ sucrés × 1.80 (fructose+glucose PAC moy≈180)
  f.pod        = +(f.sugar_pct * 1.00).toFixed(2);  // POD ≈ sucrés × 1.00 (fructose+glucose POD moy≈100)
  f.mg_g       = 0;                                  // 0 sauf avocat/coco (traitables en custom)
  f.msng_g     = 0;
  f.lactose_g  = 0;
  f.eau_g      = 100 - f.solids_pct;
}

// Correction coco : ~21 % MG (lait/purée de coco)
FRUITS_GLACE.noix_coco.mg_g = 21;
// Correction avocat : ~15 % MG (chair d'avocat)
FRUITS_GLACE.avocat.mg_g = 15;


// ---------------------------------------------------------------------------
// 2. GROUPES D'INGRÉDIENTS pour le sélecteur
//    Chaque groupe contient des clés de INGREDIENTS_GLACE (lib/data.js)
// ---------------------------------------------------------------------------
export const GROUPES_INGREDIENTS_GLACE = [
  {
    label: 'Sucrants',
    keys: ['saccharose','dextrose','glucose_de38','glucose_de60','sucre_inverti','fructose',
           'miel_glace','sirop_erable_glace','sucre_coco_glace','pate_dattes_glace',
           'erythritol_glace','xylitol'],
  },
  {
    label: 'Laitiers',
    keys: ['lait_entier','poudre_lait_0','creme_35','beurre_laitier','yaourt_nature',
           'mascarpone','jaunes_oeufs'],
  },
  {
    label: 'Végétaux / sans lactose',
    keys: ['lait_coco_glace','creme_coco_glace','boisson_amande_glace','boisson_avoine_glace',
           'huile_coco_glace','beurre_cacao_glace','proteines_pois_glace'],
  },
  {
    label: 'Couvertures & cacao',
    keys: ['couv_noire_70','couv_noire_64','couv_lait_40','couv_blanche_35','cacao_poudre_glace'],
  },
  {
    label: 'Pâtes de fruits secs',
    keys: ['pate_noisette_glace','pate_amande_glace','pate_pistache_glace','pate_cajou_glace',
           'pate_pecan_glace','pate_macadamia_glace','pate_sesame_glace','pate_cacahuete_glace'],
  },
  {
    label: 'Pralinés & Gianduja',
    keys: ['praline_noisette_glace','praline_amande_glace','praline_pistache_glace',
           'praline_pecan_glace','praline_sesame_glace','gianduja_glace'],
  },
  {
    label: 'Stabilisants & émulsifiants',
    keys: ['gomme_caroube_glace','gomme_guar_glace','gomme_tara_glace','xanthane_glace',
           'emulsifiant_e471','stab_mix_glace','acide_citrique_glace'],
  },
  {
    label: 'Phase aqueuse',
    keys: ['eau_pure'],
  },
];

// ---------------------------------------------------------------------------
// 3. NORMES PAR TYPE DE PRODUIT (pour 1000 g de mix)
//    PAC = Σ(g × pac_ingredient) / 100
//    POD = Σ(g × pod_ingredient) / 100
//    ES, MG, MSNG, Lact. exprimés en % du mix total
//    Sources : Corvitto / Caviezel / ENSP / Migoya
// ---------------------------------------------------------------------------
export const NORMS_GLACE = {
  sorbet: {
    label: 'Sorbet',
    color: '#4fc3f7',
    ES:      { min: 28, max: 36,  unit: '%',   label: 'Extrait sec (ES)' },
    MG:      { min:  0, max:  2,  unit: '%',   label: 'Matières grasses (MG)' },
    MSNG:    { min:  0, max:  2,  unit: '%',   label: 'MS Non Grasse (MSNG)' },
    Lact:    { min:  0, max:  2,  unit: '%',   label: 'Lactose' },
    PAC:     { min: 260, max: 340, unit: '',   label: 'PAC (anti-cristallisant)' },
    POD:     { min: 160, max: 260, unit: '',   label: 'POD (pouvoir sucrant)' },
  },
  glace: {
    label: 'Crème glacée',
    color: '#f48fb1',
    ES:      { min: 36, max: 44,  unit: '%',   label: 'Extrait sec (ES)' },
    MG:      { min:  8, max: 12,  unit: '%',   label: 'Matières grasses (MG)' },
    MSNG:    { min:  8, max: 12,  unit: '%',   label: 'MS Non Grasse (MSNG)' },
    Lact:    { min:  0, max: 12,  unit: '%',   label: 'Lactose (max 12 % → risque sableux)' },
    PAC:     { min: 230, max: 280, unit: '',   label: 'PAC (anti-cristallisant)' },
    POD:     { min: 160, max: 240, unit: '',   label: 'POD (pouvoir sucrant)' },
  },
  gelato: {
    label: 'Gelato',
    color: '#a5d6a7',
    ES:      { min: 34, max: 42,  unit: '%',   label: 'Extrait sec (ES)' },
    MG:      { min:  4, max:  8,  unit: '%',   label: 'Matières grasses (MG)' },
    MSNG:    { min:  9, max: 12,  unit: '%',   label: 'MS Non Grasse (MSNG)' },
    Lact:    { min:  0, max: 12,  unit: '%',   label: 'Lactose (max 12 % → risque sableux)' },
    PAC:     { min: 220, max: 270, unit: '',   label: 'PAC (anti-cristallisant)' },
    POD:     { min: 150, max: 230, unit: '',   label: 'POD (pouvoir sucrant)' },
  },
  sherbet: {
    label: 'Sherbet (laitier)',
    color: '#ce93d8',
    ES:      { min: 30, max: 38,  unit: '%',   label: 'Extrait sec (ES)' },
    MG:      { min:  1, max:  5,  unit: '%',   label: 'Matières grasses (MG)' },
    MSNG:    { min:  2, max:  6,  unit: '%',   label: 'MS Non Grasse (MSNG)' },
    Lact:    { min:  0, max:  6,  unit: '%',   label: 'Lactose' },
    PAC:     { min: 240, max: 300, unit: '',   label: 'PAC (anti-cristallisant)' },
    POD:     { min: 160, max: 250, unit: '',   label: 'POD (pouvoir sucrant)' },
  },
};

// ---------------------------------------------------------------------------
// 4. CALCUL DU BILAN ANALYTIQUE
//    Prend un tableau de lignes { ingredient, quantite_g }
//    ingredient est soit une clé INGREDIENTS_GLACE, soit { from: 'fruit', key: clé FRUITS_GLACE }
// ---------------------------------------------------------------------------
export function calculerBilan(lignes, INGREDIENTS_GLACE) {
  let totQte   = 0;
  let totES    = 0;
  let totMG    = 0;
  let totMSNG  = 0;
  let totLact  = 0;
  let totPAC   = 0;
  let totPOD   = 0;

  const lignesCalc = lignes.map(l => {
    const q   = parseFloat(l.quantite_g) || 0;
    let ing   = null;

    if (l.type === 'fruit' && l.fruitKey) {
      const f = FRUITS_GLACE[l.fruitKey];
      if (!f) return { ...l, q, es: 0, mg: 0, msng: 0, lact: 0, pac: 0, pod: 0 };
      ing = { pac: f.pac, pod: f.pod, mg_g: f.mg_g, msng_g: f.msng_g, lactose_g: f.lactose_g, eau_g: f.eau_g };
    } else if (l.ingredientKey && INGREDIENTS_GLACE[l.ingredientKey]) {
      ing = INGREDIENTS_GLACE[l.ingredientKey];
    }

    if (!ing) return { ...l, q, es: 0, mg: 0, msng: 0, lact: 0, pac: 0, pod: 0 };

    const es   = q * (1 - ing.eau_g / 100);
    const mg   = q * ing.mg_g   / 100;
    const msng = q * ing.msng_g / 100;
    const lact = q * ing.lactose_g / 100;
    const pac  = q * ing.pac / 100;
    const pod  = q * ing.pod / 100;

    totQte  += q;
    totES   += es;
    totMG   += mg;
    totMSNG += msng;
    totLact += lact;
    totPAC  += pac;
    totPOD  += pod;

    return { ...l, q, es, mg, msng, lact, pac, pod };
  });

  const pct = v => totQte > 0 ? (v / totQte * 100) : 0;

  return {
    lignes:  lignesCalc,
    totaux: {
      qte:      totQte,
      es_g:     totES,
      mg_g:     totMG,
      msng_g:   totMSNG,
      lact_g:   totLact,
      pac:      totPAC,       // valeur absolue (pour normes rapportées à 1000 g, × 1000/totQte)
      pod:      totPOD,       // idem
      // en % du mix
      es_pct:   pct(totES),
      mg_pct:   pct(totMG),
      msng_pct: pct(totMSNG),
      lact_pct: pct(totLact),
      // PAC / POD normalisés pour 1000 g (convention pro)
      pac_1000: totQte > 0 ? totPAC * 1000 / totQte : 0,
      pod_1000: totQte > 0 ? totPOD * 1000 / totQte : 0,
    },
  };
}

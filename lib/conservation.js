// Moteur de conservation et DLC indicative
// Les durées sont calculées sur la base de références professionnelles.
// La DLC réglementaire relève de la responsabilité du professionnel et peut
// nécessiter une validation analytique (DGCCRF).

export const DISCLAIMER_DLC =
  'Ces durées sont calculées sur la base de références professionnelles. ' +
  'La DLC réglementaire relève de la responsabilité du professionnel et peut ' +
  'nécessiter une validation analytique (DGCCRF).';

// ── DLC indicative par texture (jours à +4 °C) ───────────────────────────────
// Source : barèmes professionnels pâtisserie / confiserie ; adapté HACCP.
// null = non applicable (ex. glaces : conservation surgélation, pas réfrigération)

export const DLC_PAR_TEXTURE = {
  // Mousses & crémeux — émulsion fragile, ae élevée
  mousse_fruits:           { j_froid: 3,  j_surgele: 90,  j_ambiant: null },
  cremeux:                 { j_froid: 4,  j_surgele: 90,  j_ambiant: null },

  // Ganaches montées — crème foisonnée + chocolat
  ganache_montee_noir:     { j_froid: 5,  j_surgele: 60,  j_ambiant: null },
  ganache_montee_lait:     { j_froid: 4,  j_surgele: 60,  j_ambiant: null },
  ganache_montee_blanc:    { j_froid: 3,  j_surgele: 60,  j_ambiant: null },
  ganache_montee_fruit:    { j_froid: 3,  j_surgele: 60,  j_ambiant: null },
  ganache_montee_praline:  { j_froid: 5,  j_surgele: 60,  j_ambiant: null },

  // Insert — ganache non montée, ae plus basse
  ganache_insert:          { j_froid: 7,  j_surgele: 90,  j_ambiant: null },

  // Biscuits secs & friables — faible ae, stable à température ambiante
  sable_breton:            { j_froid: null, j_surgele: 60, j_ambiant: 14 },
  pate_sucree:             { j_froid: null, j_surgele: 60, j_ambiant: 14 },
  streusel:                { j_froid: null, j_surgele: 60, j_ambiant: 7  },
  croustillant_praline:    { j_froid: 5,   j_surgele: 60, j_ambiant: 3  },

  // Biscuits moelleux — ae intermédiaire
  biscuit_cuillere:        { j_froid: 3,  j_surgele: 30,  j_ambiant: 1  },
  dacquoise:               { j_froid: 3,  j_surgele: 30,  j_ambiant: 2  },
  financier:               { j_froid: 5,  j_surgele: 60,  j_ambiant: 3  },
  madeleine:               { j_froid: 7,  j_surgele: 60,  j_ambiant: 3  },
  cake_voyage:             { j_froid: 7,  j_surgele: 90,  j_ambiant: 5  },

  // Glaces & sorbets — conservation exclusivement en surgélation
  glace_lait:              { j_froid: null, j_surgele: 30, j_ambiant: null },
  glace_creme:             { j_froid: null, j_surgele: 30, j_ambiant: null },
  glace_chocolat:          { j_froid: null, j_surgele: 30, j_ambiant: null },
  glace_fruits_secs:       { j_froid: null, j_surgele: 30, j_ambiant: null },
  sorbet_fruit:            { j_froid: null, j_surgele: 30, j_ambiant: null },

  // Glaçages & enrobages — en froid sur entremets
  glacage_miroir_neutre:   { j_froid: 7,  j_surgele: 90,  j_ambiant: null },
  glacage_miroir_cacao:    { j_froid: 7,  j_surgele: 90,  j_ambiant: null },
  glacage_miroir_chocolat: { j_froid: 7,  j_surgele: 90,  j_ambiant: null },
  glacage_rocher:          { j_froid: 7,  j_surgele: 90,  j_ambiant: null },
  velours_pistolet:        { j_froid: 7,  j_surgele: 90,  j_ambiant: null },

  // Compotes & gelées — ae variable selon teneur en sucre
  confit_fruit:            { j_froid: 14, j_surgele: 180, j_ambiant: null },
  gelee_fruit_pate:        { j_froid: 14, j_surgele: 180, j_ambiant: null },
};

// ── Normalisation (même logique que cout.js / allergenes.js) ─────────────────

function normalise(s) {
  return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

function lookupMetier(nom, metier) {
  if (!nom) return null;
  if (metier[nom]) return metier[nom];
  const nomN = normalise(nom);
  for (const [key, val] of Object.entries(metier)) {
    if (normalise(key) === nomN) return val;
  }
  return null;
}

// ── calculerDlcRecette ────────────────────────────────────────────────────────
// Retourne la DLC indicative d'une préparation.
//
// Règle : DLC = min(barème texture, DLC la plus courte parmi les ingrédients)
// — Si un ingrédient a une conservation_j_froid inférieure au barème, c'est lui
//   qui dicte la DLC finale (maillon le plus faible).
// — Si sousCategorie est inconnu → dlc_texture = null
// — Toujours joindre DISCLAIMER_DLC à l'affichage.
//
// lignes          : [{ ingredient|nom, g }]
// sousCategorie   : clé dans DLC_PAR_TEXTURE
// ingredientsMetier : lib/ingredients-metier.js

export function calculerDlcRecette(lignes, sousCategorie, ingredientsMetier = {}) {
  const bareme         = DLC_PAR_TEXTURE[sousCategorie] ?? null;
  const dlc_texture    = bareme?.j_froid ?? null;

  let dlc_ingredient_min = null;
  const ingredients_sans_dlc = [];
  const ingredients_limitants = [];

  for (const ligne of lignes) {
    const nom = ligne.ingredient ?? ligne.nom ?? '';
    const m   = lookupMetier(nom, ingredientsMetier);

    if (!m || m.conservation_j_froid == null) {
      ingredients_sans_dlc.push(nom);
      continue;
    }

    const j = m.conservation_j_froid;
    if (dlc_ingredient_min === null || j < dlc_ingredient_min) {
      dlc_ingredient_min = j;
    }
  }

  // DLC finale : minimum entre barème texture et contrainte ingrédient
  let dlc_finale_j = dlc_texture;
  if (dlc_ingredient_min !== null) {
    if (dlc_finale_j === null || dlc_ingredient_min < dlc_finale_j) {
      dlc_finale_j = dlc_ingredient_min;
    }
  }

  // Identifier les ingrédients qui dictent la DLC (= valeur égale au minimum)
  if (dlc_ingredient_min !== null && dlc_ingredient_min <= (dlc_texture ?? Infinity)) {
    for (const ligne of lignes) {
      const nom = ligne.ingredient ?? ligne.nom ?? '';
      const m   = lookupMetier(nom, ingredientsMetier);
      if (m && m.conservation_j_froid === dlc_ingredient_min) {
        ingredients_limitants.push(nom);
      }
    }
  }

  // Conservation surgelée et ambiante du barème (si disponible)
  const dlc_surgele_j  = bareme?.j_surgele  ?? null;
  const dlc_ambiant_j  = bareme?.j_ambiant  ?? null;

  return {
    sousCategorie,
    dlc_finale_j,
    dlc_texture_j:       dlc_texture,
    dlc_ingredient_min_j: dlc_ingredient_min,
    dlc_surgele_j,
    dlc_ambiant_j,
    ingredients_limitants,
    ingredients_sans_dlc,
    sous_categorie_connue: bareme !== null,
    disclaimer: DISCLAIMER_DLC,
  };
}

// ── getRecommandationsConservation ────────────────────────────────────────────
// Génère les recommandations textuelles pour l'étiquetage et le plan de travail.
// Retourne un objet { etiquette, plan_travail, alerte_chaine_froid }

export function getRecommandationsConservation(dlcResultat) {
  const { dlc_finale_j, dlc_surgele_j, dlc_ambiant_j, sous_categorie_connue } = dlcResultat;

  const lignesFroid   = [];
  const lignesPlan    = [];
  let   alerteChaineF = false;

  if (!sous_categorie_connue) {
    return {
      etiquette:          'Conservation : consulter le professionnel.',
      plan_travail:       'Texture inconnue — DLC non calculable.',
      alerte_chaine_froid: false,
    };
  }

  // Température de conservation principale
  if (dlc_finale_j !== null) {
    lignesFroid.push(`À conserver à +4 °C maximum.`);
    lignesFroid.push(`À consommer dans les ${dlc_finale_j} jour${dlc_finale_j > 1 ? 's' : ''} suivant la fabrication.`);
    alerteChaineF = dlc_finale_j <= 3;
  }

  if (dlc_surgele_j !== null) {
    lignesFroid.push(`Surgélation possible : consommer dans les ${dlc_surgele_j} jours.`);
    lignesPlan.push(`Surgélation : DLC ${dlc_surgele_j} j à −18 °C.`);
  }

  if (dlc_ambiant_j !== null) {
    lignesFroid.push(`Peut être conservé à température ambiante (< 20 °C) : ${dlc_ambiant_j} jour${dlc_ambiant_j > 1 ? 's' : ''}.`);
  }

  if (alerteChaineF) {
    lignesPlan.push('⚠ DLC ≤ 3 j — chaîne du froid stricte, pas de rupture admissible.');
  }

  if (dlcResultat.ingredients_limitants.length > 0) {
    const src = dlcResultat.ingredients_limitants.join(', ');
    lignesPlan.push(`DLC dictée par : ${src}.`);
  }

  lignesPlan.push(DISCLAIMER_DLC);

  return {
    etiquette:           lignesFroid.join(' '),
    plan_travail:        lignesPlan.join('\n'),
    alerte_chaine_froid: alerteChaineF,
  };
}

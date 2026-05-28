// Moteur allergènes INCO — règlement UE 1169/2011
// Utilise lib/ingredients-metier.js comme source de données

// ── Labels d'affichage pour les 21 allergènes INCO ───────────────────────────

export const LABELS_ALLERGENES = {
  gluten:                    'Gluten',
  crustaces:                 'Crustacés',
  oeufs:                     'Œufs',
  poissons:                  'Poissons',
  arachides:                 'Arachides',
  soja:                      'Soja',
  lait:                      'Lait',
  fruits_a_coque_amande:     'Amandes',
  fruits_a_coque_noisette:   'Noisettes',
  fruits_a_coque_noix:       'Noix',
  fruits_a_coque_cajou:      'Noix de cajou',
  fruits_a_coque_pecan:      'Noix de pécan',
  fruits_a_coque_pistache:   'Pistaches',
  fruits_a_coque_macadamia:  'Noix de macadamia',
  fruits_a_coque_bresil:     'Noix du Brésil',
  celeri:                    'Céleri',
  moutarde:                  'Moutarde',
  sesame:                    'Sésame',
  sulfites:                  'Sulfites / dioxyde de soufre',
  lupin:                     'Lupin',
  mollusques:                'Mollusques',
};

// ── Normalisation (même logique que cout.js) ──────────────────────────────────

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

// ── getIngredientAllergenes ───────────────────────────────────────────────────
// Retourne { allergenes_inco[], traces_possibles[], connu }
// connu = false si l'ingrédient n'est pas dans le référentiel

export function getIngredientAllergenes(nom, ingredientsMetier = {}) {
  const m = lookupMetier(nom, ingredientsMetier);
  if (!m) {
    return { allergenes_inco: [], traces_possibles: [], connu: false };
  }
  return {
    allergenes_inco:  m.allergenes_inco  ?? [],
    traces_possibles: m.traces_possibles ?? [],
    connu: true,
  };
}

// ── getRecetteAllergenes ──────────────────────────────────────────────────────
// lignes : [{ ingredient|nom, g }]  (même format que cout.js)
// Retourne :
//   allergenes_presents[]   — identifiants INCO présents (union de toutes les lignes)
//   traces_possibles[]      — identifiants INCO en traces (hors allergènes_presents)
//   ingredients_sans_donnees[] — noms sans entrée dans le référentiel
//   repartition[]           — [{ allergene, ingredients[] }] pour l'affichage détaillé

export function getRecetteAllergenes(lignes, ingredientsMetier = {}) {
  const allergenesSet  = new Set();
  const tracesSet      = new Set();
  const sansDonnees    = [];
  const repartitionMap = {};

  for (const ligne of lignes) {
    const nom = ligne.ingredient ?? ligne.nom ?? '';
    const { allergenes_inco, traces_possibles, connu } = getIngredientAllergenes(nom, ingredientsMetier);

    if (!connu) {
      sansDonnees.push(nom);
      continue;
    }

    for (const a of allergenes_inco) {
      allergenesSet.add(a);
      if (!repartitionMap[a]) repartitionMap[a] = [];
      repartitionMap[a].push(nom);
    }

    for (const t of traces_possibles) {
      if (!allergenesSet.has(t)) tracesSet.add(t);
    }
  }

  // Retirer de tracesSet ce qui est déjà dans allergenesSet
  for (const a of allergenesSet) tracesSet.delete(a);

  const repartition = Object.entries(repartitionMap).map(([allergene, ingredients]) => ({
    allergene,
    label: LABELS_ALLERGENES[allergene] ?? allergene,
    ingredients,
  }));

  return {
    allergenes_presents:       [...allergenesSet],
    traces_possibles:          [...tracesSet],
    ingredients_sans_donnees:  sansDonnees,
    repartition,
  };
}

// ── formatLabelInco ───────────────────────────────────────────────────────────
// Génère les mentions INCO obligatoires sous deux formes.
//
// Retourne :
//   texte      : string plain-text (pour impression/étiquette)
//   html       : string HTML avec <strong> sur les allergènes (spec INCO)
//   complet    : false si ingredients_sans_donnees non vide (données manquantes)

export function formatLabelInco(allergenesPresentIds, tracesIds) {
  const labels     = allergenesPresentIds.map(id => LABELS_ALLERGENES[id] ?? id);
  const labelsTrace = tracesIds.map(id => LABELS_ALLERGENES[id] ?? id);

  let texte = '';
  let html  = '';

  if (labels.length > 0) {
    const allergenesTxt  = labels.join(', ');
    const allergenesHtml = labels.map(l => `<strong>${l}</strong>`).join(', ');
    texte += `Contient : ${allergenesTxt}.`;
    html  += `Contient : ${allergenesHtml}.`;
  }

  if (labelsTrace.length > 0) {
    const sep = labels.length > 0 ? ' ' : '';
    const tracesTxt  = labelsTrace.join(', ');
    const tracesHtml = labelsTrace.map(l => `<strong>${l}</strong>`).join(', ');
    texte += `${sep}Peut contenir des traces de : ${tracesTxt}.`;
    html  += `${sep}Peut contenir des traces de : ${tracesHtml}.`;
  }

  return { texte, html };
}

// ── listeAllergenesManquants ──────────────────────────────────────────────────
// Retourne les noms d'ingrédients sans données allergènes dans le référentiel

export function listeAllergenesManquants(lignes, ingredientsMetier = {}) {
  return lignes
    .map(l => l.ingredient ?? l.nom ?? '')
    .filter(nom => nom && !lookupMetier(nom, ingredientsMetier));
}

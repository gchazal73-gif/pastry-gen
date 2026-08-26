// Moteur allergènes INCO — règlement UE 1169/2011
//
// Résolution en trois étages, du plus sûr au plus faible :
//   1. `lib/ingredients-metier.js` — le référentiel, qui fait foi. Il porte les
//      allergènes *et* les traces possibles, informations qu'aucune déduction ne
//      peut inventer. 58 ingrédients seulement.
//   2. `lib/allergenes-familles.js` — déduction de la famille depuis le libellé.
//      Couvre le gros du corpus, mais reste une lecture de nom : elle ne connaît
//      jamais les traces, et la fiche doit le signaler.
//   3. familles identifiées sans allergène (sucre, eau, purée de fruit…) : ce
//      n'est pas une absence d'information, c'en est une.
// Ce qui échappe aux trois sort en `ingredients_sans_donnees`, et là seulement
// la fiche déclare qu'elle ne sait pas.

import { resoudreParFamille } from './allergenes-familles.js';

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
  if (m) {
    return {
      allergenes_inco:  m.allergenes_inco  ?? [],
      traces_possibles: m.traces_possibles ?? [],
      connu: true,
      source: 'referentiel',
    };
  }

  // Étage 2 et 3 : lecture de la famille dans le libellé. Aucune déduction ne
  // peut connaître les traces possibles — elles restent vides, et c'est une
  // limite à afficher, pas à masquer.
  const { allergenes_inco, source } = resoudreParFamille(nom);
  return {
    allergenes_inco,
    traces_possibles: [],
    connu: source !== 'inconnu',
    source,
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
  // Un allergène n'est « vérifié » que s'il vient du référentiel sur au moins
  // une ligne. Attesté par déduction seule, il reste déduit : c'est cette
  // distinction que porte la déclaration imprimée.
  const verifies       = new Set();
  const parSource      = { referentiel: 0, deduction: 0, famille_sans_allergene: 0, inconnu: 0 };

  for (const ligne of lignes) {
    const nom = ligne.ingredient ?? ligne.nom ?? '';
    const { allergenes_inco, traces_possibles, connu, source } =
      getIngredientAllergenes(nom, ingredientsMetier);

    parSource[source] = (parSource[source] ?? 0) + 1;

    if (!connu) {
      sansDonnees.push(nom);
      continue;
    }

    for (const a of allergenes_inco) {
      allergenesSet.add(a);
      if (source === 'referentiel') verifies.add(a);
      if (!repartitionMap[a]) repartitionMap[a] = [];
      repartitionMap[a].push({ nom, source });
    }

    for (const t of traces_possibles) {
      if (!allergenesSet.has(t)) tracesSet.add(t);
    }
  }

  // Retirer de tracesSet ce qui est déjà dans allergenesSet
  for (const a of allergenesSet) tracesSet.delete(a);

  const repartition = Object.entries(repartitionMap).map(([allergene, entrees]) => ({
    allergene,
    label: LABELS_ALLERGENES[allergene] ?? allergene,
    ingredients: entrees.map(e => e.nom),
    verifie: entrees.some(e => e.source === 'referentiel'),
  }));

  const presents = [...allergenesSet];
  return {
    allergenes_presents:       presents,
    allergenes_verifies:       presents.filter(a => verifies.has(a)),
    allergenes_deduits:        presents.filter(a => !verifies.has(a)),
    traces_possibles:          [...tracesSet],
    ingredients_sans_donnees:  sansDonnees,
    lignes_par_source:         parSource,
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

// `deduitsIds` — allergènes attestés par la seule lecture du libellé, sans
// fiche au référentiel. Ils sont marqués d'un ° et expliqués en note : sur une
// déclaration remise à un client, l'origine de l'information compte autant que
// l'information. Paramètre optionnel — omis, le rendu est celui d'avant.
export function formatLabelInco(allergenesPresentIds, tracesIds, deduitsIds = []) {
  const deduits = new Set(deduitsIds);
  const marque  = id => (deduits.has(id) ? '°' : '');
  const nom     = id => (LABELS_ALLERGENES[id] ?? id);

  const labels      = allergenesPresentIds.map(id => nom(id) + marque(id));
  const labelsHtml  = allergenesPresentIds.map(id => `<strong>${nom(id)}</strong>${marque(id)}`);
  const labelsTrace = tracesIds.map(nom);

  let texte = '';
  let html  = '';

  if (labels.length > 0) {
    texte += `Contient : ${labels.join(', ')}.`;
    html  += `Contient : ${labelsHtml.join(', ')}.`;
  }

  if (labelsTrace.length > 0) {
    const sep = labels.length > 0 ? ' ' : '';
    const tracesHtml = labelsTrace.map(l => `<strong>${l}</strong>`).join(', ');
    texte += `${sep}Peut contenir des traces de : ${labelsTrace.join(', ')}.`;
    html  += `${sep}Peut contenir des traces de : ${tracesHtml}.`;
  }

  // La note reste à part : chaque surface la rend à sa façon (petit texte en
  // pied d'étiquette, ligne grisée à l'écran). L'inclure dans `html` obligerait
  // chaque appelant à la styler au milieu de la mention légale.
  const aDesDeduits = allergenesPresentIds.some(id => deduits.has(id));
  const note = aDesDeduits
    ? '° déduit du libellé de l’ingrédient, non confirmé par une fiche fournisseur.'
    : '';

  return { texte, html, note, aDesDeduits };
}

// ── listeAllergenesManquants ──────────────────────────────────────────────────
// Retourne les noms d'ingrédients sans données allergènes dans le référentiel

export function listeAllergenesManquants(lignes, ingredientsMetier = {}) {
  return lignes
    .map(l => l.ingredient ?? l.nom ?? '')
    .filter(nom => nom && !lookupMetier(nom, ingredientsMetier));
}

/**
 * Calculateur d'équilibre fonctionnel — méthode B·Concept (Bordas / Hawke)
 *
 * Prend en entrée les lignes d'une recette (rôle + %) et les compositions
 * des ingrédients pour calculer la composition globale, la comparer aux
 * fourchettes cibles du template, et générer des suggestions de rééquilibrage.
 */

// Compositions de repli par rôle (quand l'ingrédient précis n'est pas connu)
const FALLBACK_BY_ROLE = {
  // Sucres
  sucrant:    { eau_g:0,   sucres_g:100, lipides_g:0,  protides_g:0,  fibres_g:0,  pod:100, pac:100 },
  sucre_aer:  { eau_g:0,   sucres_g:100, lipides_g:0,  protides_g:0,  fibres_g:0,  pod:100, pac:100 },
  // Gélifiants
  gelifiant:  { eau_g:9,   sucres_g:0,   lipides_g:0,  protides_g:88, fibres_g:0,  pod:0,   pac:0   },
  // Corps gras / aération crème
  aeration:   { eau_g:60,  sucres_g:3,   lipides_g:35, protides_g:2,  fibres_g:0,  pod:0,   pac:0   },
  creme:      { eau_g:60,  sucres_g:3,   lipides_g:35, protides_g:2,  fibres_g:0,  pod:0,   pac:0   },
  mg:         { eau_g:15,  sucres_g:0.7, lipides_g:84, protides_g:0.7,fibres_g:0,  pod:0,   pac:0   },
  // Fibres / structure
  fibre:      { eau_g:5,   sucres_g:3,   lipides_g:0,  protides_g:0,  fibres_g:90, pod:10,  pac:0   },
  stab:       { eau_g:13,  sucres_g:0,   lipides_g:0,  protides_g:7,  fibres_g:79, pod:0,   pac:0   },
  // Émulsifiants / mineurs
  emulsifiant:{ eau_g:2,   sucres_g:0,   lipides_g:97, protides_g:3,  fibres_g:0,  pod:0,   pac:0   },
  epaissi:    { eau_g:12,  sucres_g:0.5, lipides_g:0.1,protides_g:0.3,fibres_g:0.1,pod:0,   pac:0   },
  calcium:    { eau_g:0,   sucres_g:0,   lipides_g:0,  protides_g:0,  fibres_g:0,  pod:0,   pac:0   },
  // Jaunes / œufs
  jaune:      { eau_g:49,  sucres_g:0.3, lipides_g:32, protides_g:16, fibres_g:0,  pod:0,   pac:0   },
  oeuf:       { eau_g:75,  sucres_g:0.6, lipides_g:11, protides_g:13, fibres_g:0,  pod:0,   pac:0   },
  // Eau
  eau:        { eau_g:100, sucres_g:0,   lipides_g:0,  protides_g:0,  fibres_g:0,  pod:0,   pac:0   },
  phase_aq:   { eau_g:100, sucres_g:0,   lipides_g:0,  protides_g:0,  fibres_g:0,  pod:0,   pac:0   },
};

const ROLE_KEYWORD_MAP = [
  [/parfum|purée de fruit|ingrédient principal/i, 'parfum'],
  [/sucrant/i,                                     'sucrant'],
  [/sucre.*aération/i,                             'sucre_aer'],
  [/gélifiant/i,                                   'gelifiant'],
  [/crème.*corps gras|crème.*liquide/i,            'creme'],
  [/agent d.aération|aération/i,                   'aeration'],
  [/matière grasse de finition/i,                  'mg'],
  [/inuline|structure.*fibre/i,                    'fibre'],
  [/stabilisant|xanthane/i,                        'stab'],
  [/émulsifiant/i,                                 'emulsifiant'],
  [/épaississant/i,                                'epaissi'],
  [/calcium/i,                                     'calcium'],
  [/jaune/i,                                       'jaune'],
  [/œuf|oeuf/i,                                    'oeuf'],
  [/phase aqueuse|eau/i,                           'eau'],
];

function getRoleKey(roleLabel) {
  for (const [re, key] of ROLE_KEYWORD_MAP) {
    if (re.test(roleLabel)) return key;
  }
  return null;
}

function round1(v) { return Math.round(v * 10) / 10; }

/**
 * Calcule la composition d'une recette et retourne un rapport d'équilibre.
 *
 * @param {Object}   params
 * @param {Array}    params.lignes          — lignes V1 : { role, pct, ... }
 * @param {Object}   params.mainIngredient  — ingrédient principal depuis Supabase (peut être null)
 * @param {Object}   params.cibles          — { eau:{min,max,label}, ... } depuis template_targets
 * @param {number}   params.masse           — grammes cible
 * @param {Object}   params.contraintes     — { vegan, lactose, igbas, gluten }
 * @returns {Object} rapport
 */
export function calculateRecipe({ lignes, mainIngredient, cibles, masse, contraintes = {} }) {
  let eau = 0, sucres = 0, lipides = 0, protides = 0, fibres = 0;
  let pod = 0, pac = 0;
  let hasPod = false, hasPac = false;

  for (const ligne of lignes) {
    const f = ligne.pct / 100;
    const roleKey = getRoleKey(ligne.role);
    let comp;

    if (/parfum/i.test(ligne.role) && mainIngredient) {
      comp = mainIngredient;
    } else if (roleKey && FALLBACK_BY_ROLE[roleKey]) {
      comp = FALLBACK_BY_ROLE[roleKey];
      // Adaptation contraintes vegan
      if (contraintes.vegan) {
        if (roleKey === 'aeration')  comp = { ...comp, eau_g:68, lipides_g:24, sucres_g:6, protides_g:2 }; // crème coco
        if (roleKey === 'gelifiant') comp = { ...comp, eau_g:8, protides_g:4, fibres_g:82 }; // pectine NH
        if (roleKey === 'mg')        comp = { ...comp, eau_g:0, lipides_g:100, protides_g:0, sucres_g:0 }; // huile coco
      }
      if (contraintes.igbas && roleKey === 'sucrant') {
        comp = { ...comp, pod:90, pac:90 }; // sucre coco
      }
    } else {
      continue;
    }

    eau      += f * (comp.eau_g      ?? 0);
    sucres   += f * (comp.sucres_g   ?? 0);
    lipides  += f * (comp.lipides_g  ?? 0);
    protides += f * (comp.protides_g ?? 0);
    fibres   += f * (comp.fibres_g   ?? 0);

    if (comp.pod != null) { pod += f * comp.pod; hasPod = true; }
    if (comp.pac != null) { pac += f * comp.pac; hasPac = true; }
  }

  const composition = {
    eau:         round1(eau),
    sucres:      round1(sucres),
    lipides:     round1(lipides),
    protides:    round1(protides),
    fibres:      round1(fibres),
    extrait_sec: round1(100 - eau),
    pod:         hasPod ? round1(pod) : null,
    pac:         hasPac ? round1(pac) : null,
  };

  // Vérification contre les fourchettes cibles
  const equilibre = {};
  for (const [key, target] of Object.entries(cibles ?? {})) {
    const valeur = composition[key];
    if (valeur == null) continue;
    const ok  = valeur >= target.min && valeur <= target.max;
    const ecart = ok ? 0 : valeur < target.min ? valeur - target.min : valeur - target.max;
    equilibre[key] = { valeur, min: target.min, max: target.max, label: target.label, ok, ecart: round1(ecart) };
  }

  // Suggestions de rééquilibrage
  const suggestions = [];
  const e = equilibre;

  if (e.eau && !e.eau.ok) {
    suggestions.push(e.eau.ecart < 0
      ? `Eau totale trop faible (${e.eau.valeur}%) — augmenter la phase aqueuse ou réduire les matières sèches.`
      : `Eau totale trop élevée (${e.eau.valeur}%) — réduire la phase aqueuse ou augmenter l'extrait sec.`);
  }
  if (e.sucres && !e.sucres.ok) {
    suggestions.push(e.sucres.ecart < 0
      ? `Sucres insuffisants (${e.sucres.valeur}%) — augmenter saccharose ou dextrose.`
      : `Sucres excessifs (${e.sucres.valeur}%) — substituer par glucose atomisé DE38 (POD 50, sans sucrant).`);
  }
  if (e.lipides && !e.lipides.ok) {
    suggestions.push(e.lipides.ecart < 0
      ? `Matière grasse insuffisante (${e.lipides.valeur}%) — augmenter la crème ou le beurre.`
      : `Matière grasse excessive (${e.lipides.valeur}%) — réduire la crème ou le beurre.`);
  }
  if (e.pod && !e.pod.ok) {
    suggestions.push(e.pod.ecart < 0
      ? `POD trop faible (${e.pod.valeur}) — ajouter trimoline ou miel pour augmenter le pouvoir sucrant.`
      : `POD trop élevé (${e.pod.valeur}) — remplacer une partie du saccharose par glucose DE38 (POD 50).`);
  }
  if (e.pac && !e.pac.ok) {
    suggestions.push(e.pac.ecart < 0
      ? `PAC trop faible (${e.pac.valeur}) — ajouter dextrose ou trimoline pour améliorer l'antifreeze.`
      : `PAC trop élevé (${e.pac.valeur}) — réduire les monosaccharides.`);
  }

  const ok = Object.values(equilibre).every(v => v.ok);

  return { composition, equilibre, suggestions, ok };
}

/* =====================================================================
   ENGINE INDICATEURS — calcul des indicateurs d'équilibre physico-chimique
   Applicable à toutes les textures (entremets, glaces, confits, ganaches…).
   Source de données : INGREDIENTS_GLACE (dataKey) › mainIngredient (bibliothèque locale) › FALLBACK
   ===================================================================== */

import { INGREDIENTS_GLACE } from './data.js';

// ── Textures glacées (POD / PAC / MSNG pertinents) ────────────────────────────
const TEXTURES_GLACEES = new Set([
  'glace_lait', 'glace_creme', 'glace_chocolat',
  'sorbet_fruit', 'glace_fruits_secs', 'sorbet', 'glace',
]);

const INDICATEURS_GLACE     = ['es', 'mg', 'msng', 'pod', 'pac', 'lactose', 'h2o_libre'];
const INDICATEURS_NON_GLACE = ['es', 'mg', 'sucres', 'fibres', 'lactose', 'h2o_libre', 'ph'];

// ── Table FALLBACK par rôle ───────────────────────────────────────────────────
// Valeurs pour 100 g d'ingrédient.
// pod / pac : unitaires (saccharose = 100).
// ph : null sauf ingrédients naturellement acides.
const FALLBACK = {
  sucrant:             { eau_g:0.3,  lipides_g:0,    sucres_g:99.7, fibres_g:0,    lactose_g:0,   pod:100, pac:100, ph:null },
  sucre_aer:           { eau_g:0.3,  lipides_g:0,    sucres_g:99.7, fibres_g:0,    lactose_g:0,   pod:100, pac:100, ph:null },
  sucrant_anti_cristal:{ eau_g:6,    lipides_g:0,    sucres_g:38,   fibres_g:0.5,  lactose_g:0,   pod:50,  pac:53,  ph:null },
  glucose_atomise:     { eau_g:6,    lipides_g:0,    sucres_g:38,   fibres_g:0.5,  lactose_g:0,   pod:50,  pac:53,  ph:null },
  dextrose:            { eau_g:0.5,  lipides_g:0,    sucres_g:99,   fibres_g:0,    lactose_g:0,   pod:70,  pac:190, ph:null },
  sucrant_inverti:     { eau_g:22,   lipides_g:0,    sucres_g:75,   fibres_g:0,    lactose_g:0,   pod:125, pac:190, ph:null },
  sucrant_dattes:      { eau_g:21,   lipides_g:0.5,  sucres_g:67,   fibres_g:8,    lactose_g:0,   pod:70,  pac:100, ph:null },
  sucrant_erable:      { eau_g:34,   lipides_g:0.1,  sucres_g:60,   fibres_g:0,    lactose_g:0,   pod:65,  pac:105, ph:null },
  gelifiant:           { eau_g:9,    lipides_g:0,    sucres_g:0,    fibres_g:0,    lactose_g:0,   pod:0,   pac:0,   ph:null },
  eau:                 { eau_g:100,  lipides_g:0,    sucres_g:0,    fibres_g:0,    lactose_g:0,   pod:0,   pac:0,   ph:null },
  lait_coco:           { eau_g:77,   lipides_g:17,   sucres_g:5,    fibres_g:0,    lactose_g:0,   pod:0,   pac:0,   ph:null },
  aeration:            { eau_g:60,   lipides_g:35,   sucres_g:3.1,  fibres_g:0,    lactose_g:3.1, pod:0,   pac:0,   ph:null },
  creme:               { eau_g:60,   lipides_g:35,   sucres_g:3.1,  fibres_g:0,    lactose_g:3.1, pod:0,   pac:0,   ph:null },
  phase_aq_chaude:     { eau_g:60,   lipides_g:35,   sucres_g:3.1,  fibres_g:0,    lactose_g:3.1, pod:0,   pac:0,   ph:null },
  phase_aq_froide:     { eau_g:60,   lipides_g:35,   sucres_g:3.1,  fibres_g:0,    lactose_g:3.1, pod:0,   pac:0,   ph:null },
  mg:                  { eau_g:15,   lipides_g:84,   sucres_g:0.7,  fibres_g:0,    lactose_g:0.7, pod:0,   pac:0,   ph:null },
  mg_cacao:            { eau_g:0,    lipides_g:100,  sucres_g:0,    fibres_g:0,    lactose_g:0,   pod:0,   pac:0,   ph:null },
  emulsifiant:         { eau_g:2,    lipides_g:97,   sucres_g:0,    fibres_g:0,    lactose_g:0,   pod:0,   pac:0,   ph:null },
  epaissi:             { eau_g:12,   lipides_g:0.1,  sucres_g:0.5,  fibres_g:0.1,  lactose_g:0,   pod:0,   pac:0,   ph:null },
  fibre:               { eau_g:5,    lipides_g:0,    sucres_g:3,    fibres_g:90,   lactose_g:0,   pod:10,  pac:0,   ph:null },
  stab:                { eau_g:13,   lipides_g:0,    sucres_g:0,    fibres_g:79,   lactose_g:0,   pod:0,   pac:0,   ph:null },
  oeuf:                { eau_g:75,   lipides_g:11,   sucres_g:0.6,  fibres_g:0,    lactose_g:0,   pod:0,   pac:0,   ph:null },
  jaune:               { eau_g:49,   lipides_g:32,   sucres_g:0.3,  fibres_g:0,    lactose_g:0,   pod:0,   pac:0,   ph:null },
  blanc_sec:           { eau_g:8,    lipides_g:0.5,  sucres_g:5,    fibres_g:0,    lactose_g:0,   pod:0,   pac:0,   ph:null },
  emulsion:            { eau_g:2,    lipides_g:38,   sucres_g:36,   fibres_g:5,    lactose_g:0,   pod:36,  pac:0,   ph:null },
  couverture:          { eau_g:2,    lipides_g:38,   sucres_g:36,   fibres_g:5,    lactose_g:0,   pod:36,  pac:0,   ph:null },
  praline:             { eau_g:2,    lipides_g:55,   sucres_g:20,   fibres_g:4,    lactose_g:0,   pod:20,  pac:0,   ph:null },
  amande:              { eau_g:5,    lipides_g:50,   sucres_g:4,    fibres_g:11,   lactose_g:0,   pod:0,   pac:0,   ph:null },
  farine:              { eau_g:14,   lipides_g:1.5,  sucres_g:1,    fibres_g:3,    lactose_g:0,   pod:0,   pac:0,   ph:null },
  acide:               { eau_g:92,   lipides_g:0.3,  sucres_g:2.5,  fibres_g:0.3,  lactose_g:0,   pod:0,   pac:0,   ph:2.3 },
  calcium:             { eau_g:0,    lipides_g:0,    sucres_g:0,    fibres_g:0,    lactose_g:0,   pod:0,   pac:0,   ph:null },
  sel:                 { eau_g:0,    lipides_g:0,    sucres_g:0,    fibres_g:0,    lactose_g:0,   pod:0,   pac:0,   ph:null },
};

// ── Correspondances rôle → clé FALLBACK ──────────────────────────────────────
const ROLE_MAP = [
  [/couverture.*émulsion|émulsion.*couverture/i,           'emulsion'],
  [/^couverture$/i,                                        'couverture'],
  [/parfum|purée de fruit|ingrédient principal/i,          'parfum'],
  [/sucrant anti.cristal/i,                                'sucrant_anti_cristal'],
  [/sucrant.*dattes|pâte de dattes/i,                      'sucrant_dattes'],
  [/sucrant.*érable|sirop.*érable/i,                       'sucrant_erable'],
  [/trimoline|sucre inverti/i,                             'sucrant_inverti'],
  [/sucrant/i,                                             'sucrant'],
  [/^saccharose$/i,                                        'sucrant'],
  [/^sucre/i,                                              'sucrant'],
  [/glucose de38|glucose.*atomis/i,                        'glucose_atomise'],
  [/dextrose/i,                                            'dextrose'],
  [/gélifiant|pectine|gélatine|agar/i,                     'gelifiant'],
  [/phase aqueuse chaude/i,                                'phase_aq_chaude'],
  [/phase aqueuse froide/i,                                'phase_aq_froide'],
  [/phase aqueuse/i,                                       'eau'],
  [/^eau\b/i,                                              'eau'],
  [/humidification/i,                                      'eau'],
  [/lait de coco|lait coco/i,                              'lait_coco'],
  [/crème.*corps gras|crème.*liquide/i,                    'creme'],
  [/^crème/i,                                              'creme'],
  [/agent d.aération|aération/i,                           'aeration'],
  [/matière grasse de finition/i,                          'mg'],
  [/beurre de cacao/i,                                     'mg_cacao'],
  [/beurre/i,                                              'mg'],
  [/huile/i,                                               'mg_cacao'],
  [/inuline|psyllium|structure.*fibre/i,                   'fibre'],
  [/stabilisant|xanthane/i,                                'stab'],
  [/émulsifiant|lécithine/i,                               'emulsifiant'],
  [/épaississant|amidon|arrow.?root|fécule/i,              'epaissi'],
  [/calcium/i,                                             'calcium'],
  [/albumine|blanc.*poudre|poudre.*blanc/i,                'blanc_sec'],
  [/jaune/i,                                               'jaune'],
  [/œuf|oeuf/i,                                            'oeuf'],
  [/praliné|pâte oléagineuse/i,                            'praline'],
  [/poudre.*amande|amande.*poudre|poudre.*noisette/i,      'amande'],
  [/farine|mix sans gluten/i,                              'farine'],
  [/jus de citron|acide tartrique|acide citrique|acidit/i, 'acide'],
  [/^sel\b/i,                                              'sel'],
  [/levure/i,                                              'sel'],
];

function getRoleKey(roleLabel) {
  for (const [re, key] of ROLE_MAP) {
    if (re.test(roleLabel)) return key;
  }
  return null;
}

// ── Résolution de la source de données pour une ligne ─────────────────────────
function resolveSource(ligne, mainIngredient) {
  // Priorité 1 : dataKey → INGREDIENTS_GLACE
  if (ligne.dataKey) {
    const g = INGREDIENTS_GLACE[ligne.dataKey];
    if (g) {
      const sucres_g = g.sucre_interne_g
        ?? Math.max(0, 100 - (g.eau_g ?? 0) - (g.mg_g ?? 0) - (g.msng_g ?? 0) - (g.lactose_g ?? 0));
      return {
        eau_g:     g.eau_g     ?? 0,
        lipides_g: g.mg_g      ?? 0,
        msng_g:    g.msng_g    ?? 0,
        sucres_g,
        fibres_g:  0,
        lactose_g: g.lactose_g ?? 0,
        pod:       g.pod       ?? null,
        pac:       g.pac       ?? null,
        ph:        null,
        _source: 'glace',
      };
    }
  }

  // Priorité 2 : rôle parfum + mainIngredient (bibliothèque locale)
  const roleKey = getRoleKey(ligne.role ?? '');
  if (roleKey === 'parfum' && mainIngredient) {
    return {
      eau_g:     mainIngredient.eau_g      ?? null,
      lipides_g: mainIngredient.lipides_g  ?? null,
      msng_g:    mainIngredient.msng       ?? null,
      sucres_g:  mainIngredient.sucres_g   ?? null,
      fibres_g:  mainIngredient.fibres_g   ?? null,
      lactose_g: mainIngredient.lactose_g  ?? null,
      pod:       mainIngredient.pod        ?? null,
      pac:       mainIngredient.pac        ?? null,
      ph:        mainIngredient.ph         ?? null,
      _source: 'bibliotheque',
    };
  }

  // Priorité 3 : FALLBACK par rôle (rôle 'parfum' sans mainIngredient → non résolu)
  if (roleKey && roleKey !== 'parfum' && FALLBACK[roleKey]) {
    return { ...FALLBACK[roleKey], _source: 'fallback' };
  }

  return null;
}

function r2(v) { return Math.round(v * 100) / 100; }

// ── Calcul des indicateurs ────────────────────────────────────────────────────
/**
 * Calcule les indicateurs physico-chimiques d'une recette à partir de ses lignes.
 *
 * @param {Array}       lignes         — lignes de la recette ({ role, pct, dataKey? })
 * @param {object|null} mainIngredient — données bibliothèque de l'ingrédient principal (parfum)
 * @returns {{
 *   es: number,                 // Extrait sec total %
 *   mg: number,                 // Matières grasses %
 *   sucres: number,             // Sucres totaux %
 *   fibres: number,             // Fibres %
 *   lactose: number,            // Lactose %
 *   pod: number|null,           // Pouvoir édulcorant (null si couverture masse < 70 %)
 *   pac: number|null,           // Pouvoir anti-cristallisant
 *   ph: number|null,            // pH moyen pondéré (null si aucun ingrédient acide)
 *   h2o_libre: number,          // Eau libre estimée %
 *   masse_couverte_pct: number, // % de la masse totale avec données connues
 *   _manquants: string[],       // rôles sans correspondance trouvée
 * }}
 */
export function calculerIndicateurs(lignes, mainIngredient = null) {
  let eau = 0, lipides = 0, msng = 0, sucres = 0, fibres = 0, lactose = 0;
  let pod = 0, pac = 0;
  let phNumerateur = 0, phDenominateur = 0;
  let masseCouvertePct = 0;
  const manquants = [];

  for (const l of lignes) {
    const f = l.pct / 100;
    const src = resolveSource(l, mainIngredient);

    if (!src) {
      manquants.push(l.role ?? l.ingredient ?? '?');
      continue;
    }

    masseCouvertePct += l.pct;

    eau     += f * (src.eau_g     ?? 0);
    lipides += f * (src.lipides_g ?? 0);
    msng    += f * (src.msng_g    ?? 0);
    sucres  += f * (src.sucres_g  ?? 0);
    fibres  += f * (src.fibres_g  ?? 0);
    lactose += f * (src.lactose_g ?? 0);

    if (src.pod != null) pod += f * src.pod;
    if (src.pac != null) pac += f * src.pac;

    if (src.ph != null) {
      phNumerateur  += f * src.ph;
      phDenominateur += f;
    }
  }

  const couvertageOk = masseCouvertePct >= 70;

  return {
    es:      r2(100 - eau),
    mg:      r2(lipides),
    msng:    r2(msng),
    sucres:  r2(sucres),
    fibres:  r2(fibres),
    lactose: r2(lactose),
    pod:     couvertageOk ? r2(pod) : null,
    pac:     couvertageOk ? r2(pac) : null,
    ph:      phDenominateur > 0 ? r2(phNumerateur / phDenominateur) : null,
    h2o_libre: r2(Math.max(0, eau - sucres * 0.6)),
    masse_couverte_pct: r2(masseCouvertePct),
    _manquants: manquants,
  };
}

// ── Décomposition par ligne (pour les conseils chiffrés) ──────────────────────
/**
 * Retourne, pour chaque ligne, les valeurs nutritionnelles résolues (pour 100 g).
 * Utilisé par engine_conseils pour identifier le principal contributeur par indicateur.
 *
 * @param {Array}       lignes
 * @param {object|null} mainIngredient
 * @returns {Array<{ role, ingredient, pct, resolu, per_100g? }>}
 */
export function calculerBreakdown(lignes, mainIngredient = null) {
  return lignes.map(l => {
    const src = resolveSource(l, mainIngredient);
    if (!src) return { role: l.role, ingredient: l.ingredient, pct: l.pct, resolu: false };
    return {
      role:       l.role,
      ingredient: l.ingredient,
      pct:        l.pct,
      resolu:     true,
      per_100g: {
        eau:     src.eau_g     ?? 0,
        lipides: src.lipides_g ?? 0,
        msng:    src.msng_g    ?? 0,
        sucres:  src.sucres_g  ?? 0,
        fibres:  src.fibres_g  ?? 0,
        lactose: src.lactose_g ?? 0,
        pod:     src.pod       ?? null,
        pac:     src.pac       ?? null,
      },
    };
  });
}

// ── Indicateurs pertinents par texture ────────────────────────────────────────
/**
 * Retourne la liste des clés d'indicateurs à afficher pour une texture donnée.
 * Textures glacées → pod/pac/msng ; toutes autres → sucres/fibres/pH/h2o_libre.
 *
 * @param {string} textureId
 * @returns {string[]}
 */
export function indicateursPourTexture(textureId) {
  return TEXTURES_GLACEES.has(textureId)
    ? INDICATEURS_GLACE
    : INDICATEURS_NON_GLACE;
}

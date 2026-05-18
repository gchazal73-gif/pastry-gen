/**
 * Calculateur d'équilibre fonctionnel — méthode B·Concept (Bordas / Hawke)
 */

const FALLBACK_BY_ROLE = {
  sucrant:          { eau_g:0,   sucres_g:100, lipides_g:0,   protides_g:0,   fibres_g:0,  pod:100, pac:100 },
  sucre_aer:        { eau_g:0,   sucres_g:100, lipides_g:0,   protides_g:0,   fibres_g:0,  pod:100, pac:100 },
  gelifiant:        { eau_g:9,   sucres_g:0,   lipides_g:0,   protides_g:88,  fibres_g:0,  pod:0,   pac:0   },
  aeration:         { eau_g:60,  sucres_g:3,   lipides_g:35,  protides_g:2,   fibres_g:0,  pod:0,   pac:0   },
  creme:            { eau_g:60,  sucres_g:3,   lipides_g:35,  protides_g:2,   fibres_g:0,  pod:0,   pac:0   },
  mg:               { eau_g:15,  sucres_g:0.7, lipides_g:84,  protides_g:0.7, fibres_g:0,  pod:0,   pac:0   },
  fibre:            { eau_g:5,   sucres_g:3,   lipides_g:0,   protides_g:0,   fibres_g:90, pod:10,  pac:0   },
  stab:             { eau_g:13,  sucres_g:0,   lipides_g:0,   protides_g:7,   fibres_g:79, pod:0,   pac:0   },
  emulsifiant:      { eau_g:2,   sucres_g:0,   lipides_g:97,  protides_g:3,   fibres_g:0,  pod:0,   pac:0   },
  epaissi:          { eau_g:12,  sucres_g:0.5, lipides_g:0.1, protides_g:0.3, fibres_g:0.1,pod:0,   pac:0   },
  calcium:          { eau_g:0,   sucres_g:0,   lipides_g:0,   protides_g:0,   fibres_g:0,  pod:0,   pac:0   },
  jaune:            { eau_g:49,  sucres_g:0.3, lipides_g:32,  protides_g:16,  fibres_g:0,  pod:0,   pac:0   },
  oeuf:             { eau_g:75,  sucres_g:0.6, lipides_g:11,  protides_g:13,  fibres_g:0,  pod:0,   pac:0   },
  eau:              { eau_g:100, sucres_g:0,   lipides_g:0,   protides_g:0,   fibres_g:0,  pod:0,   pac:0   },
  phase_aq:         { eau_g:100, sucres_g:0,   lipides_g:0,   protides_g:0,   fibres_g:0,  pod:0,   pac:0   },
  // Ingrédients ajoutés par le rééquilibreur
  glucose_atomise:  { eau_g:6,   sucres_g:38,  lipides_g:0,   protides_g:0.3, fibres_g:0.5, pod:50,  pac:38  },
  dextrose:         { eau_g:0.5, sucres_g:99,  lipides_g:0,   protides_g:0,   fibres_g:0,   pod:80,  pac:190 },
  // Rôles ganache montée
  emulsion:            { eau_g:2,  sucres_g:36, lipides_g:38, protides_g:7,  fibres_g:5,   pod:36, pac:0  },
  phase_aq_chaude:     { eau_g:60, sucres_g:3,  lipides_g:35, protides_g:2,  fibres_g:0,   pod:0,  pac:0  },
  phase_aq_froide:     { eau_g:60, sucres_g:3,  lipides_g:35, protides_g:2,  fibres_g:0,   pod:0,  pac:0  },
  sucrant_anti_cristal:{ eau_g:20, sucres_g:76, lipides_g:0,  protides_g:0,  fibres_g:0.5, pod:38, pac:40 },
};

const ROLE_KEYWORD_MAP = [
  [/couverture.*émulsion|émulsion.*couverture/i,   'emulsion'],
  [/parfum|purée de fruit|ingrédient principal/i,  'parfum'],
  [/sucrant anti.cristal/i,                        'sucrant_anti_cristal'],
  [/sucrant/i,                                     'sucrant'],
  [/sucre.*aération/i,                             'sucre_aer'],
  [/glucose.*atomis/i,                             'glucose_atomise'],
  [/dextrose/i,                                    'dextrose'],
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
  [/phase aqueuse chaude/i,                        'phase_aq_chaude'],
  [/phase aqueuse froide/i,                        'phase_aq_froide'],
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
 */
export function calculateRecipe({ lignes, mainIngredient, cibles, contraintes = {} }) {
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
      if (contraintes.vegan) {
        if (roleKey === 'aeration')  comp = { ...comp, eau_g:68, lipides_g:24, sucres_g:6, protides_g:2 };
        if (roleKey === 'gelifiant') comp = { ...comp, eau_g:8, protides_g:4, fibres_g:82 };
        if (roleKey === 'mg')        comp = { ...comp, eau_g:0, lipides_g:100, protides_g:0, sucres_g:0 };
      }
      if (contraintes.igbas && roleKey === 'sucrant') {
        comp = { ...comp, pod:90, pac:90 };
      }
      if (contraintes.igbas && roleKey === 'sucrant_anti_cristal') {
        // Oligofructose : très faibles sucres digestibles, IG bas
        comp = { ...comp, pod:20, pac:10, sucres_g:5, fibres_g:90, eau_g:3 };
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

  const equilibre = {};
  for (const [key, target] of Object.entries(cibles ?? {})) {
    const valeur = composition[key];
    if (valeur == null) continue;
    const ok  = valeur >= target.min && valeur <= target.max;
    const ecart = ok ? 0 : valeur < target.min ? valeur - target.min : valeur - target.max;
    equilibre[key] = { valeur, min: target.min, max: target.max, label: target.label, ok, ecart: round1(ecart) };
  }

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

// ─── Rééquilibreur automatique ────────────────────────────────────────────────

function findIdx(lignes, re) {
  return lignes.findIndex(l => re.test(l.role));
}

function shiftPct(lignes, fromRe, toRe, amount) {
  const fi = findIdx(lignes, fromRe);
  const ti = findIdx(lignes, toRe);
  if (fi < 0 || ti < 0) return 0;
  const cap = Math.max(0, lignes[fi].pct - 0.5);
  const delta = Math.min(Math.abs(amount), cap);
  if (delta < 0.05) return 0;
  lignes[fi].pct -= delta;
  lignes[ti].pct += delta;
  return delta;
}

function upsertLigne(lignes, role, ingredient, note, deltaPct, fromRe) {
  // Reduce source ligne
  const fi = findIdx(lignes, fromRe);
  if (fi < 0) return 0;
  const cap = Math.max(0, lignes[fi].pct - 0.5);
  const delta = Math.min(deltaPct, cap);
  if (delta < 0.1) return 0;
  lignes[fi].pct -= delta;
  // Add or grow destination ligne
  const existing = lignes.find(l => l.ingredient === ingredient);
  if (existing) {
    existing.pct += delta;
  } else {
    lignes.push({ role, ingredient, note: note ?? null, pct: delta });
  }
  return delta;
}

/**
 * Rééquilibre automatiquement les lignes d'une recette selon la méthode Bordas.
 * Retourne les lignes ajustées, le rapport final, le journal des ajustements et
 * les warnings pour les paramètres encore hors cible après maxIter itérations.
 */
export function autoBalance({ lignes, mainIngredient, cibles, masse, contraintes = {}, maxIter = 3 }) {
  const journal = [];
  let current = lignes.map(l => ({ ...l }));

  for (let iter = 0; iter < maxIter; iter++) {
    const rapport = calculateRecipe({ lignes: current, mainIngredient, cibles, masse, contraintes });
    if (rapport.ok) break;

    const e = rapport.equilibre;
    let adjusted = false;

    // ── Priorité 1 : sucres / POD / PAC ─────────────────────────────────────

    // POD trop élevé → remplacer une partie du saccharose par glucose atomisé DE38
    if (!adjusted && e.pod && !e.pod.ok && e.pod.ecart > 0) {
      const si = findIdx(current, /sucrant/i);
      if (si >= 0 && !/sucre de coco/i.test(current[si].ingredient)) {
        // delta_pod = -X * 0.5 (car POD saccharose=100, GA=50 → diff=50, divisé par 100)
        const X = Math.min(e.pod.ecart / 0.5, current[si].pct - 0.5);
        const actual = upsertLigne(
          current,
          'Glucose atomisé DE38',
          'Glucose atomisé DE38',
          'POD 50 — substitut à faible pouvoir sucrant anticongelant',
          X,
          /sucrant/i
        );
        if (actual >= 0.1) {
          journal.push({
            iteration: iter + 1,
            ingredient: current[si].ingredient,
            pctBefore: round1(current[si].pct + actual),
            pctApres: round1(current[si].pct),
            gBefore: round1((current[si].pct + actual) * masse / 100),
            gApres: round1(current[si].pct * masse / 100),
            parametre: 'pod',
            parametreLabel: e.pod.label,
            valeurAvant: e.pod.valeur,
            cible: `[${e.pod.min}–${e.pod.max}]`,
            regle: `Substitution de ${round1(actual)}% de saccharose par glucose atomisé DE38 (POD 50) pour abaisser le POD de ${e.pod.valeur} vers la cible max ${e.pod.max}, sans modifier la masse totale de sucrant (méthode Bordas — équilibre POD/PAC).`,
          });
          adjusted = true;
        }
      }
    }

    // PAC trop faible → remplacer une partie du saccharose par dextrose (PAC 190)
    if (!adjusted && e.pac && !e.pac.ok && e.pac.ecart < 0) {
      const si = findIdx(current, /sucrant/i);
      if (si >= 0) {
        // delta_pac = X * (190-100)/100 = X * 0.9
        const X = Math.min(Math.abs(e.pac.ecart) / 0.9, current[si].pct - 0.5);
        const actual = upsertLigne(
          current,
          'Dextrose',
          'Dextrose (D-glucose)',
          'PAC 190 — monosaccharide anticongelant',
          X,
          /sucrant/i
        );
        if (actual >= 0.1) {
          journal.push({
            iteration: iter + 1,
            ingredient: current[si].ingredient,
            pctBefore: round1(current[si].pct + actual),
            pctApres: round1(current[si].pct),
            gBefore: round1((current[si].pct + actual) * masse / 100),
            gApres: round1(current[si].pct * masse / 100),
            parametre: 'pac',
            parametreLabel: e.pac.label,
            valeurAvant: e.pac.valeur,
            cible: `[${e.pac.min}–${e.pac.max}]`,
            regle: `Substitution de ${round1(actual)}% de saccharose par dextrose (PAC 190) pour relever le pouvoir anticongelant de ${e.pac.valeur} vers la cible min ${e.pac.min} (méthode Bordas — antifreeze).`,
          });
          adjusted = true;
        }
      }
    }

    // Sucres hors fourchette → ajuster sucrant vs phase aqueuse
    if (!adjusted && e.sucres && !e.sucres.ok) {
      const si = findIdx(current, /sucrant/i);
      const before = si >= 0 ? current[si].pct : 0;
      if (e.sucres.ecart > 0) {
        // trop élevé : réduire sucrant, compenser sur eau
        const delta = shiftPct(current, /sucrant/i, /eau|phase aqueuse/i, e.sucres.ecart);
        if (delta >= 0.1) {
          journal.push({
            iteration: iter + 1,
            ingredient: current[si].ingredient,
            pctBefore: round1(before),
            pctApres: round1(current[si].pct),
            gBefore: round1(before * masse / 100),
            gApres: round1(current[si].pct * masse / 100),
            parametre: 'sucres',
            parametreLabel: e.sucres.label,
            valeurAvant: e.sucres.valeur,
            cible: `[${e.sucres.min}–${e.sucres.max}]`,
            regle: `Réduction du sucrant de ${round1(before)}% à ${round1(current[si].pct)}% pour abaisser les sucres totaux (${e.sucres.valeur}% → cible max ${e.sucres.max}%) — compensation sur la phase aqueuse (méthode Bordas).`,
          });
          adjusted = true;
        }
      } else {
        // trop faible : augmenter sucrant, réduire eau
        const delta = shiftPct(current, /eau|phase aqueuse/i, /sucrant/i, -e.sucres.ecart);
        if (delta >= 0.1) {
          journal.push({
            iteration: iter + 1,
            ingredient: current[si].ingredient,
            pctBefore: round1(before),
            pctApres: round1(current[si].pct),
            gBefore: round1(before * masse / 100),
            gApres: round1(current[si].pct * masse / 100),
            parametre: 'sucres',
            parametreLabel: e.sucres.label,
            valeurAvant: e.sucres.valeur,
            cible: `[${e.sucres.min}–${e.sucres.max}]`,
            regle: `Augmentation du sucrant de ${round1(before)}% à ${round1(current[si].pct)}% pour atteindre les sucres cibles (${e.sucres.valeur}% → cible min ${e.sucres.min}%) — réduction de la phase aqueuse (méthode Bordas).`,
          });
          adjusted = true;
        }
      }
    }

    // ── Priorité 2 : matières grasses ────────────────────────────────────────
    if (!adjusted && e.lipides && !e.lipides.ok) {
      const cremeRe = /crème|creme|corps gras|aération/i;
      const mgRe    = /matière grasse/i;
      const eauRe   = /eau|phase aqueuse/i;
      const ci = findIdx(current, cremeRe);
      const mi = findIdx(current, mgRe);
      const lipIdx = ci >= 0 ? ci : mi;
      const lipRe  = ci >= 0 ? cremeRe : mgRe;
      const lipidPerPct = ci >= 0 ? 0.35 : 0.84;
      const before = lipIdx >= 0 ? current[lipIdx].pct : 0;

      if (lipIdx >= 0) {
        const needed = Math.abs(e.lipides.ecart) / lipidPerPct;
        if (e.lipides.ecart > 0) {
          const delta = shiftPct(current, lipRe, eauRe, needed);
          if (delta >= 0.1) {
            journal.push({
              iteration: iter + 1,
              ingredient: current[lipIdx].ingredient,
              pctBefore: round1(before),
              pctApres: round1(current[lipIdx].pct),
              gBefore: round1(before * masse / 100),
              gApres: round1(current[lipIdx].pct * masse / 100),
              parametre: 'lipides',
              parametreLabel: e.lipides.label,
              valeurAvant: e.lipides.valeur,
              cible: `[${e.lipides.min}–${e.lipides.max}]`,
              regle: `Réduction de la MG (${current[lipIdx].ingredient}) pour corriger les lipides (${e.lipides.valeur}% → cible max ${e.lipides.max}%) — compensation phase aqueuse (méthode Bordas — équilibre MG).`,
            });
            adjusted = true;
          }
        } else {
          const delta = shiftPct(current, eauRe, lipRe, needed);
          if (delta >= 0.1) {
            journal.push({
              iteration: iter + 1,
              ingredient: current[lipIdx].ingredient,
              pctBefore: round1(before),
              pctApres: round1(current[lipIdx].pct),
              gBefore: round1(before * masse / 100),
              gApres: round1(current[lipIdx].pct * masse / 100),
              parametre: 'lipides',
              parametreLabel: e.lipides.label,
              valeurAvant: e.lipides.valeur,
              cible: `[${e.lipides.min}–${e.lipides.max}]`,
              regle: `Augmentation de la MG (${current[lipIdx].ingredient}) vers la cible lipides (${e.lipides.valeur}% → cible min ${e.lipides.min}%) — réduction phase aqueuse (méthode Bordas — équilibre MG).`,
            });
            adjusted = true;
          }
        }
      }
    }

    // ── Priorité 3 : hydratation ──────────────────────────────────────────────
    if (!adjusted && e.eau && !e.eau.ok) {
      const eauRe  = /eau|phase aqueuse/i;
      const compRe = findIdx(current, /sucrant/i) >= 0 ? /sucrant/i : /fibre|structure/i;
      const ei = findIdx(current, eauRe);
      const before = ei >= 0 ? current[ei].pct : 0;

      if (ei >= 0) {
        if (e.eau.ecart > 0) {
          const delta = shiftPct(current, eauRe, compRe, e.eau.ecart);
          if (delta >= 0.1) {
            journal.push({
              iteration: iter + 1,
              ingredient: current[ei].ingredient,
              pctBefore: round1(before),
              pctApres: round1(current[ei].pct),
              gBefore: round1(before * masse / 100),
              gApres: round1(current[ei].pct * masse / 100),
              parametre: 'eau',
              parametreLabel: e.eau.label,
              valeurAvant: e.eau.valeur,
              cible: `[${e.eau.min}–${e.eau.max}]`,
              regle: `Réduction de l'eau libre (${e.eau.valeur}% → cible max ${e.eau.max}%) — report sur l'extrait sec (méthode Bordas — équilibre hydrique).`,
            });
            adjusted = true;
          }
        } else {
          const delta = shiftPct(current, compRe, eauRe, -e.eau.ecart);
          if (delta >= 0.1) {
            journal.push({
              iteration: iter + 1,
              ingredient: current[ei].ingredient,
              pctBefore: round1(before),
              pctApres: round1(current[ei].pct),
              gBefore: round1(before * masse / 100),
              gApres: round1(current[ei].pct * masse / 100),
              parametre: 'eau',
              parametreLabel: e.eau.label,
              valeurAvant: e.eau.valeur,
              cible: `[${e.eau.min}–${e.eau.max}]`,
              regle: `Augmentation de la phase aqueuse (${e.eau.valeur}% → cible min ${e.eau.min}%) — réduction de l'extrait sec (méthode Bordas — équilibre hydrique).`,
            });
            adjusted = true;
          }
        }
      }
    }

    if (!adjusted) break;
  }

  const finalLignes = current.map(l => ({ ...l, g: round1((l.pct * masse) / 100) }));
  const finalRapport = calculateRecipe({ lignes: finalLignes, mainIngredient, cibles, masse, contraintes });

  const warnings = Object.values(finalRapport.equilibre ?? {})
    .filter(ev => !ev.ok)
    .map(ev => `${ev.label} : ${ev.valeur} hors fourchette cible [${ev.min}–${ev.max}]`);

  return { lignes: finalLignes, rapport: finalRapport, journal, warnings };
}

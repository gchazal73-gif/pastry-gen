/* =====================================================================
   ENGINE GLACES — module de validation et rééquilibrage
   Calcule POD / PAC / MG / MSNG / ES total à partir des lignes d'une
   recette glacée et les compare aux fourchettes professionnelles cibles.
   ===================================================================== */

import { INGREDIENTS_GLACE } from './data.js';

// ── Fourchettes cibles par texture ────────────────────────────────────────────
// [min, max] par indicateur, exprimés pour 100 g de mix avant turbinage.
// pod / pac : valeurs absolues (saccharose = 100 comme référence unitaire).
// mg / msng / es : pourcentages de la masse totale.
const CIBLES = {
  glace_lait:        { mg:[4,7],   msng:[9,12],  pod:[16,22], pac:[25,30], es:[34,38] },
  glace_creme:       { mg:[8,12],  msng:[8,11],  pod:[16,22], pac:[25,30], es:[36,42] },
  glace_chocolat:    { mg:[10,15], msng:[8,11],  pod:[18,22], pac:[25,28], es:[38,44] },
  sorbet_fruit:      { mg:[0,2],   msng:[0,2],   pod:[22,26], pac:[28,33], es:[30,35] },
  glace_fruits_secs: { mg:[10,14], msng:[9,11],  pod:[18,22], pac:[25,28], es:[38,42] },
};

const LABELS = {
  mg:   { label: 'MG totale',   unite: '%' },
  msng: { label: 'MSNG',        unite: '%' },
  pod:  { label: 'POD',         unite: ''  },
  pac:  { label: 'PAC',         unite: ''  },
  es:   { label: 'Extrait sec', unite: '%' },
};

function r1(v) { return Math.round(v * 10) / 10; }

// ── Lookup ingrédient par dataKey ─────────────────────────────────────────────
function ing(dataKey) {
  return dataKey ? (INGREDIENTS_GLACE[dataKey] ?? null) : null;
}

// ── Calcul des indicateurs ────────────────────────────────────────────────────
/**
 * Calcule les 5 indicateurs glace à partir des lignes générées.
 * Chaque ligne doit porter un champ `dataKey` référençant INGREDIENTS_GLACE.
 * Les lignes sans dataKey (stabilisants, procédé) sont ignorées.
 *
 * @param {Array} lignes  — lignes de la recette (pct, dataKey)
 * @returns {{ mg, msng, lactose, pod, pac, es, partiel }}
 *   `partiel: true` si des lignes sans dataKey apportent une masse non nulle
 *   (ex. purée de fruit en sorbet — sucres naturels non comptabilisés).
 */
export function calculerIndicateurs(lignes) {
  let mg = 0, msng = 0, lactose = 0, pod = 0, pac = 0, eau = 0;
  let masseSansKey = 0;

  for (const l of lignes) {
    const f = l.pct / 100;
    const i = ing(l.dataKey);
    if (!i) {
      masseSansKey += l.pct;
      continue;
    }
    mg      += f * i.mg_g;
    msng    += f * i.msng_g;
    lactose += f * i.lactose_g;
    pod     += f * i.pod;
    pac     += f * i.pac;
    eau     += f * i.eau_g;
  }

  return {
    mg:      r1(mg),
    msng:    r1(msng),
    lactose: r1(lactose),
    pod:     r1(pod),
    pac:     r1(pac),
    es:      r1(100 - eau),
    partiel: masseSansKey > 5,
  };
}

// ── Vérification des fourchettes ──────────────────────────────────────────────
/**
 * Compare les indicateurs calculés aux fourchettes cibles de la texture.
 * statut : 'ok' | 'attention' (écart ≤ 10 % de la largeur de la fourchette)
 *                              | 'hors' (au-delà)
 *
 * @param {object} indicateurs  — résultat de calculerIndicateurs()
 * @param {string} textureId    — clé dans CIBLES
 * @returns {Array<{key, label, unite, valeur, min, max, statut, conseil}>}
 */
export function verifierFourchettes(indicateurs, textureId) {
  const cibles = CIBLES[textureId];
  if (!cibles) return [];

  return Object.entries(cibles).map(([key, [min, max]]) => {
    const { label, unite } = LABELS[key] ?? { label: key, unite: '' };
    const valeur = indicateurs[key] ?? null;
    if (valeur === null) {
      return { key, label, unite, valeur: null, min, max, statut: 'inconnu', conseil: null };
    }

    const ok = valeur >= min && valeur <= max;
    const marge = (max - min) * 0.10;
    const proche = !ok && valeur >= min - marge && valeur <= max + marge;
    const statut = ok ? 'ok' : proche ? 'attention' : 'hors';
    const conseil = ok ? null : _conseil(key, valeur, min, max);

    return { key, label, unite, valeur, min, max, statut, conseil };
  });
}

function _conseil(key, valeur, min, max) {
  const bas = valeur < min;
  switch (key) {
    case 'pod':
      return bas
        ? 'POD trop faible — augmenter le saccharose ou ajouter du sucre inverti.'
        : 'POD trop élevé — substituer une partie du saccharose par du glucose atomisé DE38 (POD 50).';
    case 'pac':
      return bas
        ? 'PAC trop faible — glace trop dure à −18 °C. Remplacer 2–3 % de saccharose par du dextrose (PAC 190).'
        : 'PAC trop élevé — glace fondra vite. Réduire le dextrose, augmenter le glucose atomisé DE38 (PAC 53).';
    case 'msng':
      return bas
        ? 'MSNG insuffisante — texture manque de corps. Augmenter légèrement la poudre de lait écrémé.'
        : 'MSNG trop élevée — risque de sableux (cristallisation du lactose). Formule rééquilibrée automatiquement.';
    case 'mg':
      return bas
        ? 'MG insuffisante — texture pauvre. Formule rééquilibrée automatiquement.'
        : 'MG excessive — glace lourde, risque de beurrage au turbinage. Formule rééquilibrée automatiquement.';
    case 'es':
      return bas
        ? 'Extrait sec trop faible — l\'eau cristallise en gros cristaux. Augmenter le glucose atomisé DE38 ou la poudre de lait.'
        : 'Extrait sec trop élevé — glace pâteuse. Réduire les matières sèches ou augmenter la phase aqueuse.';
    default:
      return null;
  }
}

// ── Helpers rééquilibreur ─────────────────────────────────────────────────────

function findByKey(lignes, ...dataKeys) {
  return lignes.find(l => dataKeys.includes(l.dataKey)) ?? null;
}

function findPhaseAq(lignes) {
  return findByKey(lignes,
    'lait_entier', 'lait_coco_glace', 'boisson_avoine_glace', 'boisson_amande_glace'
  );
}

function findCreme(lignes) {
  return findByKey(lignes, 'creme_35', 'creme_coco_glace');
}

function findHauteMSNG(lignes) {
  return findByKey(lignes, 'poudre_lait_0', 'proteines_pois_glace');
}

function upsertByKey(lignes, dataKey, props, deltaPct, fromLine) {
  const cap = Math.max(0, fromLine.pct - 0.5);
  const delta = Math.min(deltaPct, cap);
  if (delta < 0.1) return 0;
  fromLine.pct = r1(fromLine.pct - delta);
  const existing = lignes.find(l => l.dataKey === dataKey);
  if (existing) {
    existing.pct = r1(existing.pct + delta);
  } else {
    lignes.push({ ...props, pct: r1(delta) });
  }
  return delta;
}

// ── Rééquilibreur automatique ─────────────────────────────────────────────────
/**
 * Ajuste automatiquement les pourcentages pour rapprocher la recette des
 * fourchettes cibles (POD, PAC, MG, MSNG). Retourne les lignes corrigées,
 * le journal des ajustements, les encarts à afficher à l'utilisateur et
 * les warnings restants si la convergence n'est pas complète.
 *
 * @param {Array}  lignes      — lignes issues de genererRecette()
 * @param {string} textureId   — clé dans CIBLES
 * @param {number} masse       — masse totale en grammes (pour recalcul des g)
 * @param {object} contraintes — { vegan, lactose, ... }
 * @param {number} maxIter     — itérations max (défaut 10)
 */
export function reequilibrer(lignes, textureId, masse, contraintes = {}, maxIter = 10) {
  const journal = [];
  const encarts = [];
  const current = lignes.map(l => ({ ...l }));

  for (let iter = 0; iter < maxIter; iter++) {
    const indic = calculerIndicateurs(current);
    const rapport = verifierFourchettes(indic, textureId);
    const horsOuAttention = rapport.filter(r => r.statut !== 'ok' && r.statut !== 'inconnu');
    if (horsOuAttention.length === 0) break;

    let adjusted = false;

    for (const r of horsOuAttention) {
      if (adjusted) break;
      const bas = r.valeur < r.min;

      // ── POD ────────────────────────────────────────────────────────────────
      if (r.key === 'pod') {
        const sacLine = findByKey(current, 'saccharose');
        if (!sacLine) continue;

        if (!bas) {
          // POD trop élevé : saccharose → glucose DE38 (POD 50)
          // Δpod = X × (100-50)/100 = X × 0.5
          const excess = r.valeur - r.max;
          const X = Math.min(excess / 0.5, sacLine.pct - 0.5);
          const delta = upsertByKey(current, 'glucose_de38', {
            role: 'Glucose atomisé DE38', ingredient: 'Glucose atomisé DE38',
            note: 'POD 50 — substitut faible pouvoir sucrant anticongelant', dataKey: 'glucose_de38',
          }, X, sacLine);
          if (delta >= 0.1) {
            journal.push({ iter: iter+1, param: 'pod', regle: `+${r1(delta)}% glucose DE38, −${r1(delta)}% saccharose — POD ${r.valeur} → cible ≤ ${r.max}` });
            adjusted = true;
          }
        } else {
          // POD trop faible : phase aqueuse → saccharose
          const phaq = findPhaseAq(current);
          if (phaq && phaq.pct > 5) {
            const deficit = r.min - r.valeur;
            const X = Math.min(deficit, phaq.pct - 5);
            if (X >= 0.1) {
              sacLine.pct = r1(sacLine.pct + X);
              phaq.pct    = r1(phaq.pct - X);
              journal.push({ iter: iter+1, param: 'pod', regle: `+${r1(X)}% saccharose, −${r1(X)}% ${phaq.ingredient} — POD ${r.valeur} → cible ≥ ${r.min}` });
              adjusted = true;
            }
          }
        }
      }

      // ── PAC ────────────────────────────────────────────────────────────────
      if (r.key === 'pac' && !adjusted) {
        const sacLine = findByKey(current, 'saccharose');

        if (bas && sacLine) {
          // PAC trop faible : saccharose → dextrose (PAC 190)
          // Δpac = X × (190-100)/100 = X × 0.9
          const deficit = r.min - r.valeur;
          const X = Math.min(deficit / 0.9, sacLine.pct - 0.5);
          const delta = upsertByKey(current, 'dextrose', {
            role: 'Dextrose monohydraté', ingredient: 'Dextrose monohydraté',
            note: 'PAC 190 — monosaccharide anticongelant', dataKey: 'dextrose',
          }, X, sacLine);
          if (delta >= 0.1) {
            journal.push({ iter: iter+1, param: 'pac', regle: `+${r1(delta)}% dextrose, −${r1(delta)}% saccharose — PAC ${r.valeur} → cible ≥ ${r.min}` });
            adjusted = true;
          }
        } else if (!bas) {
          // PAC trop élevé : dextrose → glucose DE38 (PAC 53)
          // Δpac = X × (190-53)/100 = X × 1.37
          const dextLine = findByKey(current, 'dextrose');
          if (dextLine) {
            const excess = r.valeur - r.max;
            const X = Math.min(excess / 1.37, dextLine.pct - 0.5);
            const delta = upsertByKey(current, 'glucose_de38', {
              role: 'Glucose atomisé DE38', ingredient: 'Glucose atomisé DE38',
              note: 'PAC 53 — substitut pour abaisser le PAC', dataKey: 'glucose_de38',
            }, X, dextLine);
            if (delta >= 0.1) {
              journal.push({ iter: iter+1, param: 'pac', regle: `+${r1(delta)}% glucose DE38, −${r1(delta)}% dextrose — PAC ${r.valeur} → cible ≤ ${r.max}` });
              adjusted = true;
            }
          }
        }
      }

      // ── MSNG ───────────────────────────────────────────────────────────────
      if (r.key === 'msng' && !adjusted) {
        const hauteMSNG = findHauteMSNG(current);
        const phaq      = findPhaseAq(current);
        if (!hauteMSNG || !phaq) continue;

        const iHaute = ing(hauteMSNG.dataKey);
        const iPhaq  = ing(phaq.dataKey);
        const diffMSNG = ((iHaute?.msng_g ?? 0) - (iPhaq?.msng_g ?? 0)) / 100;
        if (diffMSNG <= 0) continue;

        if (!bas) {
          // MSNG trop élevée : poudre lait → phase aqueuse
          const excess = r.valeur - r.max;
          const X = Math.min(excess / diffMSNG, hauteMSNG.pct - 0.5);
          if (X >= 0.1) {
            hauteMSNG.pct = r1(hauteMSNG.pct - X);
            phaq.pct      = r1(phaq.pct + X);
            journal.push({ iter: iter+1, param: 'msng', regle: `−${r1(X)}% ${hauteMSNG.ingredient} +${r1(X)}% ${phaq.ingredient} — MSNG ${r.valeur} → cible ≤ ${r.max}` });
            encarts.push({
              type:    'attention',
              titre:   'MSNG rééquilibrée automatiquement',
              message: `La matière sèche non grasse était trop élevée (${r.valeur} %, cible ≤ ${r.max} %). `
                     + `${r1(X)} % de ${hauteMSNG.ingredient} ont été remplacés par ${phaq.ingredient} `
                     + `pour écarter le risque de texture sableuse (cristallisation du lactose à −18 °C).`,
            });
            adjusted = true;
          }
        } else if (phaq.pct > 5) {
          // MSNG insuffisante : phase aqueuse → poudre lait
          const deficit = r.min - r.valeur;
          const X = Math.min(deficit / diffMSNG, phaq.pct - 5);
          if (X >= 0.1) {
            hauteMSNG.pct = r1(hauteMSNG.pct + X);
            phaq.pct      = r1(phaq.pct - X);
            journal.push({ iter: iter+1, param: 'msng', regle: `+${r1(X)}% ${hauteMSNG.ingredient} −${r1(X)}% ${phaq.ingredient} — MSNG ${r.valeur} → cible ≥ ${r.min}` });
            adjusted = true;
          }
        }
      }

      // ── MG ─────────────────────────────────────────────────────────────────
      if (r.key === 'mg' && !adjusted) {
        const cremeL = findCreme(current);
        const phaq   = findPhaseAq(current);
        if (!cremeL || !phaq) continue;

        const iCreme = ing(cremeL.dataKey);
        const iPhaq  = ing(phaq.dataKey);
        const diffMG = ((iCreme?.mg_g ?? 0) - (iPhaq?.mg_g ?? 0)) / 100;
        if (diffMG <= 0) continue;

        if (!bas) {
          // MG trop élevée : crème → phase aqueuse
          const excess = r.valeur - r.max;
          const X = Math.min(excess / diffMG, cremeL.pct - 0.5);
          if (X >= 0.1) {
            cremeL.pct = r1(cremeL.pct - X);
            phaq.pct   = r1(phaq.pct + X);
            journal.push({ iter: iter+1, param: 'mg', regle: `−${r1(X)}% ${cremeL.ingredient} +${r1(X)}% ${phaq.ingredient} — MG ${r.valeur} → cible ≤ ${r.max}` });
            encarts.push({
              type:    'attention',
              titre:   'MG rééquilibrée automatiquement',
              message: `La matière grasse était trop élevée (${r.valeur} %, cible ≤ ${r.max} %). `
                     + `${r1(X)} % de ${cremeL.ingredient} ont été remplacés par ${phaq.ingredient} `
                     + `pour éviter le beurrage au turbinage.`,
            });
            adjusted = true;
          }
        } else if (phaq.pct > 5) {
          // MG insuffisante : phase aqueuse → crème
          const deficit = r.min - r.valeur;
          const X = Math.min(deficit / diffMG, phaq.pct - 5);
          if (X >= 0.1) {
            cremeL.pct = r1(cremeL.pct + X);
            phaq.pct   = r1(phaq.pct - X);
            journal.push({ iter: iter+1, param: 'mg', regle: `+${r1(X)}% ${cremeL.ingredient} −${r1(X)}% ${phaq.ingredient} — MG ${r.valeur} → cible ≥ ${r.min}` });
            encarts.push({
              type:    'attention',
              titre:   'MG rééquilibrée automatiquement',
              message: `La matière grasse était insuffisante (${r.valeur} %, cible ≥ ${r.min} %). `
                     + `${r1(X)} % de ${phaq.ingredient} ont été remplacés par ${cremeL.ingredient} `
                     + `pour améliorer l'onctuosité.`,
            });
            adjusted = true;
          }
        }
      }
    }

    if (!adjusted) break;
  }

  // Recalcul des grammes
  const finalLignes = current.map(l => ({ ...l, g: r1(l.pct * masse / 100) }));

  const indicsFinals = calculerIndicateurs(finalLignes);
  const warnings = verifierFourchettes(indicsFinals, textureId)
    .filter(r => r.statut !== 'ok' && r.statut !== 'inconnu')
    .map(r => `${r.label} : ${r.valeur}${r.unite} hors fourchette [${r.min}–${r.max}]`);

  // Avertissement calcul partiel (sorbet : sucres naturels du fruit non comptabilisés)
  if (indicsFinals.partiel) {
    encarts.push({
      type:    'info',
      titre:   'Calcul partiel — sucres naturels du fruit non inclus',
      message: 'La purée de fruit apporte des sucres naturels (fructose, glucose) qui contribuent au POD et au PAC réels. '
             + 'Les indicateurs affichés sous-estiment légèrement le POD et le PAC. '
             + 'Vérifier que la valeur Brix de la purée est bien prise en compte dans la formulation finale.',
    });
  }

  return { lignes: finalLignes, journal, encarts, warnings };
}

// ── Export des fourchettes (utile pour l'UI) ──────────────────────────────────
export function getCibles(textureId) {
  return CIBLES[textureId] ?? null;
}

export const TEXTURES_GLACEES = Object.keys(CIBLES);

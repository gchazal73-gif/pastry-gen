/* =====================================================================
   ENGINE GLACES — rééquilibrage automatique des recettes glacées
   Délègue le calcul des indicateurs à engine_indicateurs.js
   et les fourchettes à fourchettes.js.
   ===================================================================== */

import { INGREDIENTS_GLACE } from './data.js';
import { calculerIndicateurs } from './engine_indicateurs.js';
import { FOURCHETTES_TEXTURE, verifierFourchettes } from './fourchettes.js';

export { calculerIndicateurs, verifierFourchettes };

function r1(v) { return Math.round(v * 10) / 10; }

// ── Lookup ingrédient par dataKey ─────────────────────────────────────────────
function ing(dataKey) {
  return dataKey ? (INGREDIENTS_GLACE[dataKey] ?? null) : null;
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
  if (indicsFinals._manquants?.length > 0 || indicsFinals.masse_couverte_pct < 95) {
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
  return FOURCHETTES_TEXTURE[textureId] ?? null;
}

export const TEXTURES_GLACEES = [
  'glace_lait', 'glace_creme', 'glace_chocolat', 'sorbet_fruit', 'glace_fruits_secs',
];

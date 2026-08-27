/* =====================================================================
   ENGINE RÉÉQUILIBRAGE — rééquilibrage automatique des recettes non glacées
   Utilise calculerBreakdown pour identifier les paires d'ingrédients et
   FOURCHETTES_TEXTURE pour les cibles. Même interface que engine_glaces.js.
   ===================================================================== */

import { calculerIndicateurs, calculerBreakdown } from './engine_indicateurs.js';
import { resoudreFourchettes, verifierFourchettes, SEUIL_COUVERTURE_PCT } from './fourchettes.js';

function r1(v) { return Math.round(v * 10) / 10; }

// Indicateurs directement actionnables par transfert entre ingrédients.
// inverser=true : l'indicateur croît quand le champ baisse (es = 100 − eau).
const IND_CONFIG = {
  es:      { champ: 'eau',     inverser: true  },
  mg:      { champ: 'lipides', inverser: false },
  sucres:  { champ: 'sucres',  inverser: false },
  fibres:  { champ: 'fibres',  inverser: false },
  lactose: { champ: 'lactose', inverser: false },
};

// Ne jamais modifier l'ingrédient parfum/purée — c'est le choix du pâtissier.
const PARFUM_RE = /parfum|purée de fruit|ingrédient principal/i;

/**
 * Identifie la paire (rich, lean) à utiliser pour corriger un indicateur.
 * rich = ingrédient le plus concentré en `champ`.
 * lean = ingrédient le moins concentré en `champ` ; en cas d'égalité, préférer
 * celui avec le plus d'eau (agent de dilution neutre).
 */
function trouverPaire(bd, champ) {
  const resolved = bd.filter(l => l.resolu && !PARFUM_RE.test(l.role ?? ''));
  if (resolved.length < 2) return null;

  const avecChamp = resolved.filter(l => (l.per_100g[champ] ?? 0) > 0);
  if (!avecChamp.length) return null;

  const rich = avecChamp.reduce((a, b) =>
    a.per_100g[champ] >= b.per_100g[champ] ? a : b
  );

  const leanCandidates = resolved.filter(l => l.ingredient !== rich.ingredient);
  if (!leanCandidates.length) return null;

  const lean = leanCandidates.reduce((a, b) => {
    const da = a.per_100g[champ] ?? 0;
    const db = b.per_100g[champ] ?? 0;
    if (da !== db) return da <= db ? a : b;
    return (a.per_100g.eau ?? 0) >= (b.per_100g.eau ?? 0) ? a : b;
  });

  const diff = (rich.per_100g[champ] ?? 0) - (lean.per_100g[champ] ?? 0);
  if (diff < 1) return null;

  return { rich, lean, diff };
}

/**
 * Rééquilibre automatiquement une recette non glacée selon FOURCHETTES_TEXTURE.
 *
 * Algorithme : pour chaque indicateur hors fourchette, trouve la paire
 * (rich, lean) la plus contrastée pour ce champ et transfère le Δ% calculé
 * pour atteindre la valeur cible (milieu de la fourchette).
 *
 * @param {Array}       lignes        — lignes issues de genererRecette()
 * @param {string}      textureId     — clé dans FOURCHETTES_TEXTURE
 * @param {number}      masse         — masse totale en grammes
 * @param {object}      contraintes   — { vegan, lactose, … }
 * @param {object|null} mainIngredient — ingrédient principal de la bibliothèque (parfum)
 * @param {number}      maxIter       — itérations max (défaut 8)
 * @returns {{ lignes, journal, encarts, warnings }}
 */
export function reequilibrerNonGlace(lignes, textureId, masse, contraintes = {}, mainIngredient = null, maxIter = 8) {
  // Passe par le résolveur : les IDs de TEMPLATES ne sont pas des clés de
  // FOURCHETTES_TEXTURE, et tester la table en direct faisait sortir la
  // fonction avant toute itération pour *toutes* les textures générables.
  if (!resoudreFourchettes(textureId)) {
    const finalLignes = lignes.map(l => ({ ...l, g: r1(l.pct * masse / 100) }));
    return { lignes: finalLignes, journal: [], encarts: [], warnings: [] };
  }

  // Garde de couverture. Les indicateurs se calculent sur les seules lignes
  // résolues : es = 100 − eau compte la masse inconnue en matière sèche. Une
  // mousse à 38 % de couverture affiche ES 90 % là où la cible est 30–42 %,
  // et le rééquilibrage, en poursuivant ce fantôme, dégrade une recette saine
  // (MG mesurée 11,4 % dans la fourchette → 2,9 % hors, en trois itérations).
  // Tant que la résolution des ingrédients n'est pas faite, on s'abstient.
  const indicInit = calculerIndicateurs(lignes, mainIngredient);
  if ((indicInit.masse_couverte_pct ?? 0) < SEUIL_COUVERTURE_PCT) {
    const finalLignes = lignes.map(l => ({ ...l, g: r1(l.pct * masse / 100) }));
    const manquants = indicInit._manquants ?? [];
    return {
      lignes: finalLignes,
      journal: [],
      encarts: [],
      warnings: [
        `Rééquilibrage non appliqué : ${indicInit.masse_couverte_pct} % de la masse ` +
        `seulement est résolue (seuil ${SEUIL_COUVERTURE_PCT} %). Les indicateurs ne ` +
        `sont pas fiables${manquants.length ? ` — ingrédients sans données : ${manquants.join(', ')}` : ''}.`,
      ],
    };
  }

  const journal = [];
  const encarts  = [];
  const current  = lignes.map(l => ({ ...l }));

  for (let iter = 0; iter < maxIter; iter++) {
    const indic = calculerIndicateurs(current, mainIngredient);
    const rapport = verifierFourchettes(indic, textureId);
    const horsOuAttention = rapport.filter(r => r.statut === 'hors');
    if (horsOuAttention.length === 0) break;

    let adjusted = false;
    const bd = calculerBreakdown(current, mainIngredient);

    for (const r of horsOuAttention) {
      if (adjusted) break;
      const cfg = IND_CONFIG[r.key];
      if (!cfg) continue;

      const { champ, inverser } = cfg;
      const paire = trouverPaire(bd, champ);
      if (!paire) continue;

      const { rich, lean, diff } = paire;
      const cible = (r.min + r.max) / 2;

      // Δ% à transférer entre rich et lean.
      // non-inverser : X = (valeur − cible) × 100 / diff
      //   X > 0 → trop haut  → réduire rich, augmenter lean
      //   X < 0 → trop bas   → réduire lean, augmenter rich
      // inverser (es via eau) : signe opposé car es = 100 − eau.
      const signe = inverser ? -1 : 1;
      const X_raw = signe * (r.valeur - cible) * 100 / diff;

      let delta, fromIngredient, toIngredient;

      if (X_raw > 0) {
        const fromLine = current.find(l => l.ingredient === rich.ingredient);
        const toLine   = current.find(l => l.ingredient === lean.ingredient);
        if (!fromLine || !toLine) continue;
        const cap = Math.max(0, fromLine.pct - 0.5);
        delta = r1(Math.min(X_raw, cap));
        if (delta < 0.1) continue;
        fromLine.pct = r1(fromLine.pct - delta);
        toLine.pct   = r1(toLine.pct + delta);
        fromIngredient = rich.ingredient;
        toIngredient   = lean.ingredient;
      } else {
        const X = -X_raw;
        const fromLine = current.find(l => l.ingredient === lean.ingredient);
        const toLine   = current.find(l => l.ingredient === rich.ingredient);
        if (!fromLine || !toLine) continue;
        const cap = Math.max(0, fromLine.pct - 0.5);
        delta = r1(Math.min(X, cap));
        if (delta < 0.1) continue;
        fromLine.pct = r1(fromLine.pct - delta);
        toLine.pct   = r1(toLine.pct + delta);
        fromIngredient = lean.ingredient;
        toIngredient   = rich.ingredient;
      }

      journal.push({
        iter:  iter + 1,
        param: r.key,
        regle: `−${delta}% ${fromIngredient} +${delta}% ${toIngredient} — ${r.label} ${r.valeur}${r.unite} → cible [${r.min}–${r.max}]${r.unite}`,
      });
      adjusted = true;
    }

    if (!adjusted) break;
  }

  const finalLignes = current.map(l => ({ ...l, g: r1(l.pct * masse / 100) }));

  const indicsFinals = calculerIndicateurs(finalLignes, mainIngredient);
  const warnings = verifierFourchettes(indicsFinals, textureId)
    .filter(r => r.statut !== 'ok' && r.statut !== 'inconnu')
    .map(r => `${r.label} : ${r.valeur}${r.unite} hors fourchette [${r.min}–${r.max}]${r.unite}`);

  return { lignes: finalLignes, journal, encarts, warnings };
}

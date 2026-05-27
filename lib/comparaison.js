/* =====================================================================
   COMPARAISON — génération de N recettes en parallèle + diff visuel
   Utilisé par le mode Comparer de la page générateur.
   ===================================================================== */

import { genererRecette }                             from './engine.js';
import { reequilibrer }                               from './engine_glaces.js';
import { reequilibrerNonGlace }                       from './engine_reequilibrage.js';
import { calculerIndicateurs, calculerBreakdown }     from './engine_indicateurs.js';
import { verifierFourchettes }                        from './fourchettes.js';
import { conseilsChiffres }                           from './engine_conseils.js';
import { PARFUMS }                                     from './data.js';
import { TEMPLATES }                                   from './templates.js';

// Indicateurs affichés dans le bandeau de comparaison (ordre d'affichage)
const INDICATEURS_BANDEAU = ['es', 'mg', 'sucres', 'fibres', 'lactose', 'h2o_libre', 'ph', 'pod', 'pac'];

// ── Libellés automatiques pour les colonnes ──────────────────────────────────
const LABEL_CONTRAINTE = {
  vegan:     'Vegan',
  lactose:   'Sans lactose',
  gluten:    'Sans gluten',
  igbas:     'IG bas',
  bien_etre: 'Bien-être',
};

function labelContraintes(contraintes) {
  if (contraintes.length === 0) return 'Classique';
  return contraintes.map(c => LABEL_CONTRAINTE[c] ?? c).join(' + ');
}

// ── Génération d'une colonne ─────────────────────────────────────────────────

function genererColonne({ textureId, parfumId, masse, contraintes = [], format = null, label = null }) {
  const tpl = TEMPLATES[textureId];
  if (!tpl) throw new Error(`Texture inconnue : ${textureId}`);

  // c : forme attendue par les rééquilibreurs (même pattern que RecipeForm)
  const c = {
    vegan:   contraintes.includes('vegan'),
    lactose: contraintes.includes('lactose') || contraintes.includes('vegan'),
    gluten:  contraintes.includes('gluten'),
    igbas:   contraintes.includes('igbas'),
    format:  format ?? null,
  };

  const recette = genererRecette({ textureId, parfumId, masse, contraintes, format: format ?? null });

  let finalLignes = recette.lignes;
  let encarts = [];

  const isGlace = tpl.famille_texture === 'glaces_sorbets';

  if (isGlace) {
    const { lignes, encarts: e } = reequilibrer(recette.lignes, textureId, masse, c);
    finalLignes = lignes;
    encarts = e ?? [];
  } else {
    const { lignes, encarts: e } = reequilibrerNonGlace(recette.lignes, textureId, masse, c, null);
    finalLignes = lignes;
    encarts = e ?? [];
  }

  const indicateurs = calculerIndicateurs(finalLignes, null);
  const fourchettes = verifierFourchettes(indicateurs, textureId);
  const breakdown   = calculerBreakdown(finalLignes, null);
  const fourchettesAvecConseils = conseilsChiffres(breakdown, fourchettes);

  return {
    params: {
      textureId,
      parfumId,
      masse,
      contraintes,
      format: format ?? null,
      label:  label ?? labelContraintes(contraintes),
    },
    recette: { ...recette, lignes: finalLignes, encarts },
    indicateurs,
    fourchettes: fourchettesAvecConseils,
  };
}

// ── Diff des lignes d'ingrédients ────────────────────────────────────────────

function calculerDiffLignes(colonnes) {
  // Collecter tous les rôles dans l'ordre (première occurrence)
  const rolesOrdonnes = [];
  const rolesSeen = new Set();
  for (const col of colonnes) {
    for (const l of col.recette.lignes) {
      if (!rolesSeen.has(l.role)) {
        rolesSeen.add(l.role);
        rolesOrdonnes.push(l.role);
      }
    }
  }

  return rolesOrdonnes.map(role => {
    const parColonne = colonnes.map(col =>
      col.recette.lignes.find(l => l.role === role) ?? null
    );

    const presents = parColonne.filter(Boolean);
    // estDiff si au moins une colonne diffère en % ou en ingrédient
    const estDiff = presents.length > 0 && presents.some(
      v => Math.abs(v.pct - presents[0].pct) > 0.05 || v.ingredient !== presents[0].ingredient
    );
    const absentes = parColonne
      .map((v, i) => (v === null ? i : -1))
      .filter(i => i >= 0);

    return {
      role,
      parColonne: parColonne.map(v => v
        ? { ingredient: v.ingredient, pct: v.pct, g: v.g, note: v.note ?? null }
        : null
      ),
      estDiff,
      absentes,
    };
  });
}

// ── Diff des indicateurs (bandeau supérieur) ─────────────────────────────────

function calculerDiffIndicateurs(colonnes) {
  const result = {};
  for (const key of INDICATEURS_BANDEAU) {
    const valeurs = colonnes.map(col => col.indicateurs?.[key] ?? null);
    const presents = valeurs.filter(v => v !== null);
    const estDiff  = presents.length > 1 &&
      presents.some(v => Math.abs(v - presents[0]) > 0.1);
    const min = presents.length > 0 ? Math.min(...presents) : null;
    const max = presents.length > 0 ? Math.max(...presents) : null;
    result[key] = { valeurs, min, max, estDiff };
  }
  return result;
}

// ── API publique ─────────────────────────────────────────────────────────────

/**
 * Génère une grille de N recettes et calcule le diff visuel.
 *
 * @param {{
 *   scenario: 'versions'|'parfums'|'textures'|'libre',
 *   colonnes: Array<{
 *     textureId:   string,
 *     parfumId:    string,
 *     masse:       number,
 *     contraintes: string[],
 *     format?:     string|null,
 *     label?:      string,
 *   }>
 * }} opts
 * @returns {{
 *   colonnes: Array<{ params, recette, indicateurs, fourchettes }>,
 *   diff: { lignesUnifiees, indicateurs }
 * }}
 */
export function genererComparaison({ scenario, colonnes }) {
  const colonnesGenerees = colonnes.map(p => genererColonne(p));

  return {
    colonnes: colonnesGenerees,
    diff: {
      lignesUnifiees: calculerDiffLignes(colonnesGenerees),
      indicateurs:    calculerDiffIndicateurs(colonnesGenerees),
    },
  };
}

// ── Helpers scénarios ─────────────────────────────────────────────────────────

/**
 * Scénario "versions" — même texture + parfum, 4 versions de contraintes.
 * Génère les colonnes : Classique / Sans lactose / Vegan / Bien-être.
 */
export function colonnesVersions({ textureId, parfumId, masse, format = null }) {
  return [
    { contraintes: [],             label: 'Classique'    },
    { contraintes: ['lactose'],    label: 'Sans lactose' },
    { contraintes: ['vegan'],      label: 'Vegan'        },
    { contraintes: ['bien_etre'],  label: 'Bien-être'    },
  ].map(c => ({ textureId, parfumId, masse, format, ...c }));
}

/**
 * Scénario "parfums" — même texture + contraintes, N parfums différents.
 */
export function colonnesParfums({ textureId, parfumIds, masse, contraintes = [], format = null }) {
  return parfumIds.map(parfumId => ({
    textureId,
    parfumId,
    masse,
    contraintes,
    format,
    label: PARFUMS[parfumId]?.label ?? parfumId,
  }));
}

/**
 * Scénario "textures" — même parfum + contraintes, N textures différentes.
 */
export function colonnesTextures({ textureIds, parfumId, masse, contraintes = [], format = null }) {
  return textureIds.map(textureId => ({
    textureId,
    parfumId,
    masse,
    contraintes,
    format,
    label: TEMPLATES[textureId]?.label ?? textureId,
  }));
}

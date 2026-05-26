/* =====================================================================
   ENGINE CONSEILS — conseils chiffrés par indicateur hors fourchette
   Identifie le principal contributeur et simule un ajustement quantitatif.
   ===================================================================== */

function r1(v) { return Math.round(v * 10) / 10; }

// Mapping indicateur → champ résolu dans calculerBreakdown.per_100g
// inverser=true : l'indicateur croît quand le champ baisse (es = 100 − eau)
const INDICATEUR_CONFIG = {
  es:      { champ: 'eau',     inverser: true  },
  mg:      { champ: 'lipides', inverser: false },
  msng:    { champ: 'msng',    inverser: false },
  sucres:  { champ: 'sucres',  inverser: false },
  fibres:  { champ: 'fibres',  inverser: false },
  lactose: { champ: 'lactose', inverser: false },
  pod:     { champ: 'pod',     inverser: false },
  pac:     { champ: 'pac',     inverser: false },
  // h2o_libre et ph : non directement actionnables par un ingrédient unique
};

/**
 * Enrichit chaque entrée de fourchettes avec un conseil chiffré (si applicable).
 *
 * Pour chaque indicateur hors fourchette ou en attention, identifie le principal
 * contributeur (ligne dont pct × per_100g[champ] est le plus élevé) et calcule
 * l'ajustement en pourcentage nécessaire pour atteindre la valeur cible (milieu
 * de la fourchette).
 *
 * @param {Array} breakdown   — résultat de calculerBreakdown()
 * @param {Array} fourchettes — résultat de verifierFourchettes()
 * @returns {Array} — même structure que fourchettes, avec conseil_chiffre ajouté
 */
export function conseilsChiffres(breakdown, fourchettes) {
  return fourchettes.map(f => {
    if ((f.statut !== 'hors' && f.statut !== 'attention') || f.valeur == null) {
      return { ...f, conseil_chiffre: null };
    }

    const cfg = INDICATEUR_CONFIG[f.key];
    if (!cfg) return { ...f, conseil_chiffre: null };

    const { champ, inverser = false } = cfg;

    const lignesValides = breakdown.filter(
      l => l.resolu && l.per_100g[champ] != null && l.per_100g[champ] > 0
    );
    if (lignesValides.length === 0) return { ...f, conseil_chiffre: null };

    // Ligne avec la contribution absolue la plus forte (pct × per_100g[champ])
    const lignePrincipale = lignesValides.reduce((a, b) =>
      a.pct * a.per_100g[champ] >= b.pct * b.per_100g[champ] ? a : b
    );

    const per100g = lignePrincipale.per_100g[champ];
    const cible = (f.min + f.max) / 2;

    // Δ% à appliquer sur pct de cet ingrédient pour atteindre la cible.
    // inverser=true (es via eau) : augmenter l'ingrédient fait baisser es, donc signe inversé.
    const signe = inverser ? -1 : 1;
    const delta_raw = signe * (cible - f.valeur) * 100 / per100g;

    const pct_actuel = r1(lignePrincipale.pct);
    const pct_cible  = r1(Math.max(0.5, pct_actuel + delta_raw));
    const delta_reel = r1(pct_cible - pct_actuel);

    if (Math.abs(delta_reel) < 0.1) return { ...f, conseil_chiffre: null };

    const action    = delta_reel > 0 ? 'Augmenter' : 'Réduire';
    const signe_str = delta_reel > 0 ? '+' : '';
    const indic_apres = r1(cible);
    const description = `${action} « ${lignePrincipale.ingredient} » de ${pct_actuel} % à ${pct_cible} % (${signe_str}${delta_reel} %) → ${f.label} ≈ ${indic_apres}${f.unite}`;

    return {
      ...f,
      conseil_chiffre: {
        ingredient:       lignePrincipale.ingredient,
        role:             lignePrincipale.role,
        pct_actuel,
        pct_cible,
        delta_pct:        delta_reel,
        indicateur_apres: indic_apres,
        description,
      },
    };
  });
}

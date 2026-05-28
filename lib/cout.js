// Moteur de calcul du coût matière
// Données : lib/ingredients-metier.js (clé = nom ingrédient, valeur = { prix_eur_par_g, ... })
// Formats d'entrée acceptés : lignes du générateur V3 ({ ingredient, g }) ou
//   recettes bibliothèque ({ nom, g })

const SEUIL_OBSOLETE_JOURS = 180;

// ── Formatage ─────────────────────────────────────────────────────────────────

export function formatPrix(eur) {
  return `${eur.toFixed(2).replace('.', ',')} €`;
}

export function formatPrixCourt(eur) {
  const arrondi = Math.round(eur);
  return arrondi === eur
    ? `${arrondi} €`
    : `${eur.toFixed(2).replace('.', ',')} €`;
}

// ── Lookup normalisant ────────────────────────────────────────────────────────

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

// ── calculerCoutRecette ───────────────────────────────────────────────────────

export function calculerCoutRecette(lignes, ingredientsMetier = {}) {
  const cout_par_ligne         = [];
  const ingredients_sans_prix  = [];
  const prix_obsolete          = [];
  const prix_variable_saison   = [];

  let masse_total_g      = 0;
  let masse_avec_prix_g  = 0;
  let cout_total_eur     = 0;

  const maintenant = Date.now();

  for (const ligne of lignes) {
    const nom     = ligne.ingredient ?? ligne.nom ?? '';
    const masse_g = ligne.g ?? 0;
    masse_total_g += masse_g;

    const m = lookupMetier(nom, ingredientsMetier);

    if (!m || m.prix_eur_par_g == null) {
      ingredients_sans_prix.push(nom);
      cout_par_ligne.push({ ingredient: nom, masse_g, prix_eur_par_g: null, cout_eur: 0, part_pct: null });
      continue;
    }

    if (m.date_maj_prix) {
      const jours = (maintenant - new Date(m.date_maj_prix).getTime()) / 86_400_000;
      if (jours > SEUIL_OBSOLETE_JOURS) prix_obsolete.push(nom);
    }

    if (m.prix_variable_saison) prix_variable_saison.push(nom);

    const cout_eur = masse_g * m.prix_eur_par_g;
    masse_avec_prix_g += masse_g;
    cout_total_eur    += cout_eur;

    cout_par_ligne.push({
      ingredient:    nom,
      masse_g,
      prix_eur_par_g: m.prix_eur_par_g,
      cout_eur:      Math.round(cout_eur * 10000) / 10000,
      part_pct:      null,
    });
  }

  // Parts % par ligne (calculées une fois le total connu)
  for (const l of cout_par_ligne) {
    l.part_pct = (cout_total_eur > 0 && l.cout_eur != null)
      ? Math.round((l.cout_eur / cout_total_eur) * 1000) / 10
      : null;
  }

  const cout_total         = Math.round(cout_total_eur * 100) / 100;
  const cout_pour_100g_eur = masse_total_g > 0
    ? Math.round((cout_total_eur / masse_total_g * 100) * 10000) / 10000
    : 0;
  const taux_couverture_pct = masse_total_g > 0
    ? Math.round((masse_avec_prix_g / masse_total_g) * 1000) / 10
    : 0;

  return {
    cout_total_eur:       cout_total,
    cout_pour_100g_eur,
    cout_par_ligne,
    ingredients_sans_prix,
    prix_obsolete,
    prix_variable_saison,
    taux_couverture_pct,
  };
}

// ── calculerCoutAvecRatios ────────────────────────────────────────────────────
// multiplicateur_revient et multiplicateur_pvttc : passés en paramètre pour
// rester compatible avec localStorage (lu dans le composant appelant).

export function calculerCoutAvecRatios(lignes, ingredientsMetier = {}, {
  multiplicateur_revient = 2,
  multiplicateur_pvttc   = 5,
} = {}) {
  const base = calculerCoutRecette(lignes, ingredientsMetier);
  return {
    ...base,
    multiplicateur_revient,
    multiplicateur_pvttc,
    prix_de_revient_eur: Math.round(base.cout_total_eur * multiplicateur_revient * 100) / 100,
    pvttc_eur:           Math.round(base.cout_total_eur * multiplicateur_pvttc   * 100) / 100,
  };
}

// Overrides de prix en localStorage — ne jamais modifier ingredients-metier.js directement.
// Structure : { [nomIngredient]: { prix_eur_par_g, prix_unitaire_eur, unite_prix, fournisseur, date_maj_prix } }

const KEY = 'pastry-gen-mercuriale-overrides';

const PRIX_FIELDS = ['prix_eur_par_g', 'prix_unitaire_eur', 'unite_prix', 'fournisseur', 'date_maj_prix'];

export function getOverrides() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function setOverride(nom, data) {
  if (typeof window === 'undefined') return;
  const overrides = getOverrides();
  overrides[nom] = { ...(overrides[nom] ?? {}), ...data };
  localStorage.setItem(KEY, JSON.stringify(overrides));
}

export function clearOverride(nom) {
  if (typeof window === 'undefined') return;
  const overrides = getOverrides();
  delete overrides[nom];
  localStorage.setItem(KEY, JSON.stringify(overrides));
}

// Fusionne INGREDIENTS_METIER (base) avec les overrides localStorage.
// Ne remplace QUE les champs prix — allergènes et conservation inchangés.
export function getMergedMetier(INGREDIENTS_METIER) {
  const overrides = getOverrides();
  if (Object.keys(overrides).length === 0) return INGREDIENTS_METIER;
  const merged = { ...INGREDIENTS_METIER };
  for (const [nom, data] of Object.entries(overrides)) {
    if (!merged[nom]) continue;
    const patch = {};
    for (const field of PRIX_FIELDS) {
      if (data[field] !== undefined) patch[field] = data[field];
    }
    merged[nom] = { ...merged[nom], ...patch };
  }
  return merged;
}

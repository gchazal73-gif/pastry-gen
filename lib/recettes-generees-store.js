// Store localStorage pour les recettes générées sauvegardées
// Clé : 'pastry-gen-recettes-generees'
// Chaque entrée est compatible avec le format attendu par le Plan de travail.

const STORE_KEY = 'pastry-gen-recettes-generees';

function read() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]'); }
  catch { return []; }
}

function write(list) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); }
  catch {}
}

// ── Lecture ───────────────────────────────────────────────────────────────────

export function getRecettesGenerees() {
  return read();
}

// ── Conversion recette générée → format bibliothèque ─────────────────────────
// La recette générée (moteur V1/V2) a : textureId, parfumId, texture, parfum,
// masse, lignes[], process[], date, contraintes: {vegan, lactose, gluten, igbas}
// On la convertit en objet compatible avec addSlot() du Plan de travail.

function toEntreeCompatible(recette, nom, id) {
  return {
    id,
    nom,
    categorie:       'generees',
    sous_categorie:  recette.textureId ?? '',
    masse_totale_g:  recette.masse    ?? 500,
    ingredients:     (recette.lignes ?? []).map(l => ({
      nom:  l.ingredient,
      g:    l.g,
      pct:  l.pct,
      role: l.role ?? '',
    })),
    procede:           recette.process  ?? [],
    parfum_principal:  recette.parfum   ?? null,
    contraintes: {
      vegan:         recette.contraintes?.vegan   ?? false,
      sans_lactose:  recette.contraintes?.lactose ?? false,
      sans_gluten:   recette.contraintes?.gluten  ?? false,
    },
    _generated:   true,
    _generatedAt: Date.now(),
  };
}

// ── Sauvegarde ────────────────────────────────────────────────────────────────

export function saveRecetteGeneree(recette, nom) {
  const id    = `gen-${Date.now()}`;
  const entry = toEntreeCompatible(recette, nom, id);
  const list  = read();
  list.unshift(entry);
  write(list);
  return entry;
}

// ── Suppression ───────────────────────────────────────────────────────────────

export function deleteRecetteGeneree(id) {
  write(read().filter(r => r.id !== id));
}

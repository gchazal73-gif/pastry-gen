// Utilitaire : ajoute une recette au Plan de travail depuis n'importe quelle page,
// en manipulant directement le localStorage (même clé que la page plan-de-travail).

import { getDensite, getDefaultEpaisseur, ASSIGNATION_DEFAUT } from './densites.js';

const PLAN_KEY = 'pastry-gen-plan';

function genUid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// recette doit être compatible format bibliothèque :
//   { id, nom, masse_totale_g, categorie, sous_categorie, densite_g_ml? }
export function ajouterRecetteAuPlan(recette) {
  let plan;
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    plan = raw ? JSON.parse(raw) : null;
  } catch { plan = null; }

  const slots   = plan?.slots                 ?? [];
  const couches = plan?.montage?.couches      ?? [];
  const prod    = plan?.production            ?? {};
  const montage = plan?.montage               ?? {};

  const uid = genUid();

  slots.push({ uid, recetteId: recette.id, masse: recette.masse_totale_g ?? '' });

  couches.push({
    uid,
    nom:              recette.nom,
    sous_categorie:   recette.sous_categorie ?? '',
    assignation:      ASSIGNATION_DEFAUT[recette.categorie] ?? 'couche',
    epaisseur_mm:     getDefaultEpaisseur(recette.sous_categorie ?? ''),
    densite_g_ml:     recette.densite_g_ml ?? getDensite(recette.sous_categorie ?? ''),
    masse_g_libre:    recette.masse_totale_g ?? 0,
    masse_g_override: null,
    pourcentage:      0,
  });

  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify({
      ...plan,
      slots,
      production: prod,
      montage:    { ...montage, couches },
    }));
  } catch {}
}

// Moteur de calcul de production — géométrie moules + masses par composant
// Compatible avec le plan de travail (slots + production + montage)

import { computeMoldVolume, computeMoldSurface, computeDevelopedSurface } from './moules.js';

const r1 = n => Math.round(n * 10) / 10;
const r0 = n => Math.round(n);

// ── normalizePercentages ──────────────────────────────────────────────────────
// Ramène la somme des pourcentages à 100 % proportionnellement.
export function normalizePercentages(couches) {
  const somme = couches.reduce((s, c) => s + (c.pourcentage ?? 0), 0);
  if (somme === 0) return couches;
  return couches.map(c => ({
    ...c,
    pourcentage: r1((c.pourcentage ?? 0) / somme * 100),
  }));
}

// ── convertMode ───────────────────────────────────────────────────────────────
// Placeholder étape D — conversion couches ↔ pourcentage
export function convertMode(plan, _from, _to) {
  return plan;
}

// ── computeProductionPlan ─────────────────────────────────────────────────────
// plan      : { production: { moules[], perte_production_pct, mode_calcul,
//                              moule_reference_id },
//               montage:    { couches[] } }
// moulesMap : { [id]: moule }
//
// Chaque couche : { uid, nom, assignation, densite_g_ml,
//                   epaisseur_mm,        // mode par_couches
//                   pourcentage,         // mode par_pourcentage
//                   masse_g_libre,       // assignation = 'libre'
//                   masse_g_override,    // surcharge manuelle
//                   // pour habillage :
//                   ratio_glacage_g_par_cm2, perte_glacage_pct }
export function computeProductionPlan(plan, moulesMap) {
  const warnings = [];
  const { production, montage } = plan;
  const {
    moules: mouleSlots = [],
    perte_production_pct = 10,
    mode_calcul = 'par_couches',
    moule_reference_id = null,
  } = production ?? {};
  const { couches = [] } = montage ?? {};

  // ── Résolution des moules ─────────────────────────────────────────────────
  const moulesResolus = mouleSlots
    .filter(ms => (ms.quantite ?? 0) > 0)
    .map(ms => {
      const moule = moulesMap[ms.moule_id];
      if (!moule) {
        warnings.push({ code: 'MOULE_INCONNU', message: `Moule introuvable : « ${ms.moule_id} »` });
        return null;
      }
      return {
        ...ms,
        moule,
        volume_ml:    r1(computeMoldVolume(moule)),
        surface_cm2:  r1(computeMoldSurface(moule)),
      };
    })
    .filter(Boolean);

  // ── Aucun moule valide ────────────────────────────────────────────────────
  if (moulesResolus.length === 0) {
    return {
      moules: [],
      moule_reference_id: null,
      volume_reference_ml: 0,
      volume_total_ml: 0,
      nb_moules_total: 0,
      masse_totale_au_moulage_g: 0,
      masse_totale_a_preparer_g: 0,
      composants: couches.map(c => ({ ...c, volume_ml: 0, masse_moule_reference_g: 0, masse_au_moulage_g: 0, masse_a_preparer_g: 0 })),
      perte_production_pct,
      warnings,
    };
  }

  const volume_total_ml = r1(moulesResolus.reduce((s, ms) => s + ms.volume_ml * ms.quantite, 0));
  const nb_moules_total = moulesResolus.reduce((s, ms) => s + ms.quantite, 0);

  // Moule de référence : celui désigné par l'utilisateur, sinon le premier
  const mouleRef = (moule_reference_id
    ? moulesResolus.find(ms => ms.moule_id === moule_reference_id)
    : null) ?? moulesResolus[0];
  const volume_reference_ml = mouleRef?.volume_ml ?? 0;

  const principal = moulesResolus[0]; // moule de référence pour habillage + contrôle stack

  // ── Contrôle stack (mode couches) ─────────────────────────────────────────
  if (mode_calcul === 'par_couches') {
    const sommeMm = couches
      .filter(c => c.assignation === 'couche')
      .reduce((s, c) => s + (c.epaisseur_mm ?? 0), 0);
    const hauteurMm = (principal.moule.dimensions.hauteur_cm ?? 0) * 10;
    if (hauteurMm > 0 && sommeMm > hauteurMm) {
      warnings.push({
        code: 'STACK_DEPASSE_MOULE',
        message: `Stack de ${sommeMm} mm pour un moule de ${hauteurMm} mm de haut`,
        somme_mm: sommeMm,
        hauteur_moule_mm: hauteurMm,
      });
    }
  }

  // ── Calcul des composants ─────────────────────────────────────────────────
  let composants;

  if (mode_calcul === 'par_couches') {
    composants = couches.map(couche => {
      // Composant libre : masse saisie manuellement
      if (couche.assignation === 'libre') {
        const m = couche.masse_g_libre ?? 0;
        return {
          ...couche,
          volume_ml:          null,
          masse_au_moulage_g: couche.masse_g_override ?? m,
          masse_a_preparer_g: r0((couche.masse_g_override ?? m) * (1 + perte_production_pct / 100)),
        };
      }

      // Habillage : calcul par surface développée
      if (couche.assignation === 'habillage') {
        const ratio      = couche.ratio_glacage_g_par_cm2 ?? 1.2;
        const perteGlac  = couche.perte_glacage_pct       ?? 50;
        const h          = principal.moule.dimensions.hauteur_cm ?? 0;
        const surfDev    = computeDevelopedSurface(principal.moule, h);
        const qte_total  = moulesResolus.reduce((s, ms) => s + ms.quantite, 0);
        const masseMin   = r1(surfDev * ratio * qte_total);
        const masseAuMoulage   = couche.masse_g_override ?? masseMin;
        const masseAPreparer   = r0(masseAuMoulage * (1 + perteGlac / 100));
        return {
          ...couche,
          volume_ml:          null,
          surface_dev_cm2:    r1(surfDev),
          masse_au_moulage_g: masseAuMoulage,
          masse_a_preparer_g: masseAPreparer,
        };
      }

      // Couche standard : surface × épaisseur × densité
      const densite = couche.densite_g_ml ?? 1.0;
      if (!couche.densite_g_ml) {
        warnings.push({
          code: 'RECETTE_SANS_DENSITE',
          message: `Composant « ${couche.nom ?? couche.uid} » sans densité — valeur par défaut 1,0 g/mL utilisée`,
          uid: couche.uid,
        });
      }

      let volumeTotal = 0;
      let masseTotal  = 0;
      for (const ms of moulesResolus) {
        const vol   = ms.surface_cm2 * (couche.epaisseur_mm / 10); // mm → cm
        volumeTotal += vol * ms.quantite;
        masseTotal  += vol * densite * ms.quantite;
      }

      const masseAuMoulage  = couche.masse_g_override ?? r0(masseTotal);
      const masseAPreparer  = r0(masseAuMoulage * (1 + perte_production_pct / 100));

      return {
        ...couche,
        volume_ml:          r1(volumeTotal),
        masse_au_moulage_g: masseAuMoulage,
        masse_a_preparer_g: masseAPreparer,
      };
    });

  } else {
    // ── Mode par_pourcentage ─────────────────────────────────────────────────
    const sommePct = couches.reduce((s, c) => s + (c.pourcentage ?? 0), 0);
    if (Math.abs(sommePct - 100) > 0.5) {
      warnings.push({
        code: 'POURCENTAGES_HORS_100',
        message: `Somme des % : ${r1(sommePct)} (écart ${r1(Math.abs(sommePct - 100))} %)`,
        ecart:       r1(Math.abs(sommePct - 100)),
        somme_pct:   r1(sommePct),
      });
    }

    composants = couches.map(couche => {
      if (couche.assignation === 'libre') {
        const m = couche.masse_g_libre ?? 0;
        return {
          ...couche,
          volume_ml:               null,
          masse_moule_reference_g: null,
          masse_au_moulage_g:      couche.masse_g_override ?? m,
          masse_a_preparer_g:      r0((couche.masse_g_override ?? m) * (1 + perte_production_pct / 100)),
        };
      }
      const pct     = couche.pourcentage ?? 0;
      const densite = couche.densite_g_ml ?? 1.0;
      if (!couche.densite_g_ml) {
        warnings.push({
          code: 'RECETTE_SANS_DENSITE',
          message: `Composant « ${couche.nom ?? couche.uid} » sans densité — valeur par défaut 1,0 g/mL utilisée`,
          uid: couche.uid,
        });
      }
      const masseRefMoule  = r0(volume_reference_ml * pct / 100 * densite);
      const masseAuMoulage = couche.masse_g_override ?? r0(volume_total_ml * pct / 100 * densite);
      const masseAPreparer = r0(masseAuMoulage * (1 + perte_production_pct / 100));
      return {
        ...couche,
        volume_ml:               r1(volume_total_ml * pct / 100),
        masse_moule_reference_g: masseRefMoule,
        masse_au_moulage_g:      masseAuMoulage,
        masse_a_preparer_g:      masseAPreparer,
      };
    });
  }

  // ── Agrégats finaux ───────────────────────────────────────────────────────
  const masseTotaleAuMoulage  = composants.reduce((s, c) => s + (c.masse_au_moulage_g ?? 0), 0);
  const masseTotaleAPreparer  = composants.reduce((s, c) => s + (c.masse_a_preparer_g ?? 0), 0);

  return {
    moules: moulesResolus.map(ms => ({
      id:                  ms.moule_id,
      nom:                 ms.moule.nom,
      quantite:            ms.quantite,
      volume_ml:           ms.volume_ml,
      surface_section_cm2: ms.surface_cm2,
      est_reference:       ms.moule_id === mouleRef?.moule_id,
    })),
    moule_reference_id:        mouleRef?.moule_id ?? null,
    volume_reference_ml,
    volume_total_ml,
    nb_moules_total,
    masse_totale_au_moulage_g: r0(masseTotaleAuMoulage),
    masse_totale_a_preparer_g: r0(masseTotaleAPreparer),
    composants,
    perte_production_pct,
    warnings,
  };
}

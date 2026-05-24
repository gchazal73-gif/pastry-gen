import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import styles from '../../app/plan-de-travail/plan.module.css';

export default function RecapMiseEnPlace({ slots, recettesMap, productionResult, barSegments = [] }) {
  const [triAlpha,   setTriAlpha]   = useState(true);
  const [expanded,   setExpanded]   = useState({});

  const colorByUid = useMemo(
    () => Object.fromEntries(barSegments.map(s => [s.uid, s.color])),
    [barSegments],
  );

  // ── Calcul des ingrédients consolidés ─────────────────────────────────────
  const { ingredients, masseTotale } = useMemo(() => {
    if (!productionResult) return { ingredients: [], masseTotale: 0 };

    const composantsMap = Object.fromEntries(
      productionResult.composants.map(c => [c.uid, c]),
    );

    // Map : nomIngredient → { total_g, detail: [{ uid, nom_recette, masse_g, color }] }
    const map = {};

    slots.forEach(slot => {
      const recette  = recettesMap[slot.recetteId];
      const composant = composantsMap[slot.uid];
      if (!recette || !composant) return;

      const masseRecette = composant.masse_a_preparer_g ?? 0;
      if (masseRecette <= 0) return;

      const color = colorByUid[slot.uid] ?? '#888';

      const ingList = recette.type === 'assemblage'
        ? recette.composants?.flatMap(c =>
            (c.ingredients ?? []).map(ing => ({
              ...ing,
              _compMasse: (c.masse_g / recette.masse_totale_g) * masseRecette,
            }))
          ) ?? []
        : (recette.ingredients ?? []).map(ing => ({ ...ing, _compMasse: masseRecette }));

      ingList.forEach(ing => {
        const g = Math.round(ing.pct / 100 * ing._compMasse);
        if (g <= 0) return;
        if (!map[ing.nom]) map[ing.nom] = { total_g: 0, detail: [] };
        map[ing.nom].total_g += g;
        const existing = map[ing.nom].detail.find(d => d.uid === slot.uid);
        if (existing) {
          existing.masse_g += g;
        } else {
          map[ing.nom].detail.push({ uid: slot.uid, nom_recette: recette.nom, masse_g: g, color });
        }
      });
    });

    let entries = Object.entries(map);
    if (triAlpha) {
      entries = entries.sort((a, b) => a[0].localeCompare(b[0], 'fr'));
    } else {
      entries = entries.sort((a, b) => b[1].total_g - a[1].total_g);
    }

    const masseTotale = entries.reduce((s, [, v]) => s + v.total_g, 0);
    return {
      ingredients: entries.map(([nom, v]) => ({ nom, ...v })),
      masseTotale,
    };
  }, [slots, recettesMap, productionResult, colorByUid, triAlpha]);

  function toggleExpand(nom) {
    setExpanded(prev => ({ ...prev, [nom]: !prev[nom] }));
  }

  // ── Détail de la production ───────────────────────────────────────────────
  const detailMoules = useMemo(() => {
    if (!productionResult) return '';
    return productionResult.moules
      .map(m => `${m.quantite > 1 ? `${m.quantite} × ` : ''}${m.nom}`)
      .join(' · ');
  }, [productionResult]);

  if (!productionResult || ingredients.length === 0) {
    return (
      <div className={styles.recap}>
        <p className={styles.recapTitle}>Mise en place — Production complète</p>
        <p className={styles.recapEmpty}>
          {productionResult
            ? 'Aucun ingrédient calculé. Vérifiez les pourcentages.'
            : 'Sélectionnez des moules pour voir la mise en place.'}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.mepSection}>
      {/* En-tête */}
      <div className={styles.mepHeader}>
        <p className={styles.recapTitle}>Mise en place — Production complète</p>
        <div className={styles.mepHeaderStats}>
          <div className={styles.mepStatRow}>
            <span className={styles.mepStatLabel}>Moules</span>
            <span className={styles.mepStatVal}>{detailMoules}</span>
          </div>
          <div className={styles.mepStatRow}>
            <span className={styles.mepStatLabel}>Volume total</span>
            <span className={styles.mepStatVal}>{productionResult.volume_total_ml} mL</span>
          </div>
          <div className={styles.mepStatRow}>
            <span className={styles.mepStatLabel}>Masse à préparer</span>
            <span className={`${styles.mepStatVal} ${styles.mepStatValBold}`}>{masseTotale} g</span>
          </div>
        </div>
      </div>

      {/* Tri */}
      <div className={styles.mepSortRow}>
        <button
          className={`${styles.mepSortBtn}${triAlpha ? ` ${styles.mepSortBtnActive}` : ''}`}
          onClick={() => setTriAlpha(true)}
        >
          A → Z
        </button>
        <button
          className={`${styles.mepSortBtn}${!triAlpha ? ` ${styles.mepSortBtnActive}` : ''}`}
          onClick={() => setTriAlpha(false)}
        >
          <ArrowUpDown size={10} strokeWidth={2} style={{ marginRight: 3 }} />
          Quantité
        </button>
      </div>

      {/* Liste ingrédients */}
      <div className={styles.mepList}>
        {ingredients.map(ing => {
          const open = !!expanded[ing.nom];
          return (
            <div key={ing.nom} className={styles.mepIngRow}>
              <button
                className={styles.mepIngToggle}
                onClick={() => toggleExpand(ing.nom)}
                aria-expanded={open}
              >
                <span className={styles.mepIngNom}>{ing.nom}</span>
                <span className={styles.mepIngTotal}>{ing.total_g} g</span>
                {open
                  ? <ChevronUp size={11} strokeWidth={2} className={styles.mepChevron} />
                  : <ChevronDown size={11} strokeWidth={2} className={styles.mepChevron} />}
              </button>
              {open && (
                <div className={styles.mepIngDetail}>
                  {ing.detail.map(d => (
                    <div key={d.uid} className={styles.mepIngDetailRow}>
                      <span className={styles.mepIngDetailDot} style={{ background: d.color }} />
                      <span className={styles.mepIngDetailNom}>{d.nom_recette}</span>
                      <span className={styles.mepIngDetailG}>{d.masse_g} g</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.mepFooter}>
        {ingredients.length} ingrédient{ingredients.length > 1 ? 's' : ''} · {masseTotale} g au total
      </div>
    </div>
  );
}

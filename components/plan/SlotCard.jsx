import { X } from 'lucide-react';
import styles from '../../app/plan-de-travail/plan.module.css';

const SOUS_CAT_LABELS = {
  biscuit_leger:        'Biscuit léger',
  biscuit_meringue:     'Biscuit meringué',
  petit_gateau:         'Petit gâteau',
  cremeux_fruit:        'Crémeux',
  creme_cuite:          'Crème cuite',
  mousse_chocolat:      'Mousse chocolat',
  mousse_fruit:         'Mousse fruit',
  croustillant_praline: 'Croustillant',
};

export default function SlotCard({
  slot, recette, onMasseChange, onRemove, kcalInfo,
  modePct = false,
  pourcentage = 0,
  onPourcentageChange,
  masseRef = null,
  masseTotale = null,
  segColor = '#457b9d',
}) {
  const sousLabel = SOUS_CAT_LABELS[recette.sous_categorie] ?? recette.sous_categorie;

  return (
    <div className={styles.slot}>
      {/* Bande couleur en mode composition */}
      {modePct && (
        <div className={styles.slotColorBar} style={{ background: segColor }} />
      )}

      <div className={styles.slotInfo}>
        <div className={styles.slotNom}>{recette.nom}</div>
        <div className={styles.slotSub}>
          {sousLabel}{recette.parfum_principal ? ` · ${recette.parfum_principal}` : ''}
        </div>
        {recette.type === 'assemblage' && recette.composants?.length > 0 && (
          <div className={styles.slotSub} style={{ opacity: 0.7, fontStyle: 'italic' }}>
            {recette.composants.map(c => c.nom).join(' · ')}
          </div>
        )}

        {modePct ? (
          /* ── Mode composition par % ── */
          <div className={styles.slotPctArea}>
            <div className={styles.slotPctRow}>
              <span className={styles.slotMasseLabel}>Part</span>
              <input
                type="number"
                className={styles.slotPctInput}
                value={pourcentage === 0 ? '' : pourcentage}
                placeholder="0"
                min={0}
                max={100}
                step={1}
                onChange={e => onPourcentageChange?.(slot.uid, e.target.value)}
                onBlur={e => {
                  if (e.target.value === '') onPourcentageChange?.(slot.uid, 0);
                }}
              />
              <span className={styles.slotMasseUnit}>%</span>
            </div>
            {(masseRef !== null || masseTotale !== null) && (
              <div className={styles.slotMasseDual}>
                {masseRef !== null && (
                  <span className={styles.slotMasseRef} title="Par moule de référence">
                    {masseRef} g /moule réf.
                  </span>
                )}
                {masseTotale !== null && (
                  <span className={styles.slotMasseTotale} title="Total production à préparer">
                    {masseTotale} g total
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── Mode couches (existant) ── */
          <div className={styles.slotMasse}>
            <span className={styles.slotMasseLabel}>Masse</span>
            <input
              type="number"
              className={styles.slotMasseInput}
              value={slot.masse}
              min={1}
              onChange={e => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v > 0) onMasseChange(slot.uid, v);
                else if (e.target.value === '') onMasseChange(slot.uid, '');
              }}
              onBlur={() => {
                if (!slot.masse || Number(slot.masse) <= 0) onMasseChange(slot.uid, recette.masse_totale_g);
              }}
            />
            <span className={styles.slotMasseUnit}>g</span>
            <span className={styles.slotBase}>(base {recette.masse_totale_g} g)</span>
          </div>
        )}

        {kcalInfo && (
          <div className={styles.slotKcal}>
            {kcalInfo.kcal_100g} kcal/100g · {kcalInfo.contribution_pct_kcal} % des kcal
          </div>
        )}
      </div>

      <button
        className={styles.slotRemove}
        onClick={() => onRemove(slot.uid)}
        aria-label={`Retirer ${recette.nom}`}
      >
        <X size={13} strokeWidth={2} />
      </button>
    </div>
  );
}

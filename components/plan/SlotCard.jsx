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

export default function SlotCard({ slot, recette, onMasseChange, onRemove }) {
  const sousLabel = SOUS_CAT_LABELS[recette.sous_categorie] ?? recette.sous_categorie;

  return (
    <div className={styles.slot}>
      <div className={styles.slotInfo}>
        <div className={styles.slotNom}>{recette.nom}</div>
        <div className={styles.slotSub}>{sousLabel}{recette.parfum_principal ? ` · ${recette.parfum_principal}` : ''}</div>
        {recette.type === 'assemblage' && recette.composants?.length > 0 && (
          <div className={styles.slotSub} style={{ opacity: 0.7, fontStyle: 'italic' }}>
            {recette.composants.map(c => c.nom).join(' · ')}
          </div>
        )}
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

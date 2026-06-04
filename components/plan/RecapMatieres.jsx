import { useMemo } from 'react';
import styles from '../../app/plan-de-travail/plan.module.css';

function accumIngredients(recette, masse, totaux) {
  if (!Number.isFinite(masse) || masse <= 0) return;
  if (recette.type === 'assemblage') {
    const refMasse = Number(recette.masse_totale_g);
    if (!Number.isFinite(refMasse) || refMasse <= 0) return;
    const ratio = masse / refMasse;
    recette.composants?.forEach(comp => {
      const compMasse = Number(comp.masse_g) * ratio;
      if (!Number.isFinite(compMasse)) return;
      comp.ingredients?.forEach(ing => {
        const g = Math.round(Number(ing.pct) / 100 * compMasse);
        if (!Number.isFinite(g)) return;
        totaux[ing.nom] = (totaux[ing.nom] ?? 0) + g;
      });
    });
  } else {
    recette.ingredients?.forEach(ing => {
      const g = Math.round(Number(ing.pct) / 100 * masse);
      if (!Number.isFinite(g)) return;
      totaux[ing.nom] = (totaux[ing.nom] ?? 0) + g;
    });
  }
}

export default function RecapMatieres({ slots, recettesMap }) {
  const recap = useMemo(() => {
    const totaux = {};
    slots.forEach(slot => {
      const recette = recettesMap[slot.recetteId];
      if (!recette) return;
      const slotMasse = Number(slot.masse);
      const defaultMasse = Number(recette.masse_totale_g);
      const masse = slotMasse > 0 ? slotMasse : (defaultMasse > 0 ? defaultMasse : 0);
      accumIngredients(recette, masse, totaux);
    });
    return Object.entries(totaux).sort((a, b) => b[1] - a[1]);
  }, [slots, recettesMap]);

  const totalGeneral = recap.reduce((sum, [, g]) => sum + (Number.isFinite(g) ? g : 0), 0);

  return (
    <div className={styles.recap}>
      <p className={styles.recapTitle}>Récapitulatif matières</p>

      {recap.length === 0 ? (
        <p className={styles.recapEmpty}>Ajoutez des recettes pour voir le récap.</p>
      ) : (
        <>
          <p className={styles.recapTotal}>{totalGeneral} g au total · {recap.length} ingrédients</p>
          <table className="ingredients">
            <thead>
              <tr>
                <th>Ingrédient</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {recap.map(([nom, g]) => (
                <tr key={nom}>
                  <td>{nom}</td>
                  <td className="qty">{Number.isFinite(g) ? `${g} g` : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total">
                <td>Total général</td>
                <td className="qty">{totalGeneral} g</td>
              </tr>
            </tfoot>
          </table>
        </>
      )}
    </div>
  );
}

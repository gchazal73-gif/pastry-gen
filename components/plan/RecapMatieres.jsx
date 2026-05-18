import { useMemo } from 'react';
import styles from '../../app/plan-de-travail/plan.module.css';

export default function RecapMatieres({ slots, recettesMap }) {
  const recap = useMemo(() => {
    const totaux = {};
    slots.forEach(slot => {
      const recette = recettesMap[slot.recetteId];
      if (!recette) return;
      const masse = Number(slot.masse) > 0 ? Number(slot.masse) : recette.masse_totale_g;
      recette.ingredients.forEach(ing => {
        const g = Math.round(ing.pct / 100 * masse);
        totaux[ing.nom] = (totaux[ing.nom] ?? 0) + g;
      });
    });
    return Object.entries(totaux).sort((a, b) => b[1] - a[1]);
  }, [slots, recettesMap]);

  const totalGeneral = recap.reduce((sum, [, g]) => sum + g, 0);

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
                  <td className="qty">{g} g</td>
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

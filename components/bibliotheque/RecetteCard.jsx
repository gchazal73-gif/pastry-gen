import styles from '../../app/bibliotheque/bibliotheque.module.css';

const SOUS_CAT_LABELS = {
  biscuit_leger:       'Biscuit léger',
  biscuit_meringue:    'Biscuit meringué',
  petit_gateau:        'Petit gâteau',
  cremeux_fruit:       'Crémeux',
  creme_cuite:         'Crème cuite',
  mousse_chocolat:     'Mousse',
  mousse_fruit:        'Mousse',
  croustillant_praline:'Croustillant',
};

const CONTRAINTES_BADGES = [
  { key: 'vegan',        label: 'Vegan'       },
  { key: 'sans_gluten',  label: 'SG'          },
  { key: 'sans_lactose', label: 'SL'          },
];

export default function RecetteCard({ recette, selected, onSelect, onAddToPlan, categories }) {
  const sousLabel = SOUS_CAT_LABELS[recette.sous_categorie] ?? recette.sous_categorie;

  return (
    <div
      className={`${styles.card} ${selected ? styles.cardSelected : ''}`}
      onClick={() => onSelect(recette)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(recette)}
    >
      <div className={styles.cardCat}>{sousLabel}</div>
      <div className={styles.cardNom}>{recette.nom}</div>
      {recette.parfum_principal && (
        <div className={styles.cardParfum}>{recette.parfum_principal}</div>
      )}
      <div className={styles.cardFooter}>
        <div className={styles.cardBadges}>
          {CONTRAINTES_BADGES
            .filter(({ key }) => recette.contraintes[key])
            .map(({ key, label }) => (
              <span key={key} className={styles.cardBadge}>{label}</span>
            ))}
          {recette.a_verifier && (
            <span className={styles.cardBadgeWarn}>⚠ À vérifier</span>
          )}
        </div>
        {onAddToPlan && (
          <button
            className={styles.cardAddBtn}
            onClick={e => { e.stopPropagation(); onAddToPlan(recette); }}
            title="Ajouter au plan de travail"
            aria-label={`Ajouter ${recette.nom} au plan`}
          >
            + Ajouter
          </button>
        )}
      </div>
    </div>
  );
}

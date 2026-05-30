'use client';

import { RECETTES, CATEGORIES } from '../../lib/recettes/index.js';
import styles from '../../app/bibliotheque/bibliotheque.module.css';

const CONTRAINTES = [
  { id: 'vegan',        label: 'Vegan'        },
  { id: 'sans_gluten',  label: 'Sans gluten'  },
  { id: 'sans_lactose', label: 'Sans lactose' },
];

const TRI_OPTIONS = [
  { value: '',         label: 'Par défaut' },
  { value: 'nom',      label: 'Nom A→Z'   },
  { value: 'calories', label: 'Calories ↑' },
  { value: 'masse',    label: 'Masse ↑'   },
];

export default function FilterPanel({
  filtreCategorie, setFiltreCategorie,
  filtresContraintes, setFiltresContraintes,
  recherche, setRecherche,
  tri, setTri,
  filtreIngredient, setFiltreIngredient,
  tousLesIngredients = [],
  filtreFavoris, setFiltreFavoris, nbFavoris = 0,
}) {
  const cats = Object.entries(CATEGORIES).sort((a, b) => a[1].ordre - b[1].ordre);
  const catCounts = {};
  RECETTES.forEach(r => { catCounts[r.categorie] = (catCounts[r.categorie] || 0) + 1; });

  function toggleContrainte(id) {
    setFiltresContraintes(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  const hasFilters = filtreCategorie || filtresContraintes.length > 0 || recherche.trim() || tri || filtreIngredient.trim() || filtreFavoris;

  return (
    <aside className={styles.filterPanel}>
      <div className={styles.filterSection}>
        <p className={styles.filterTitle}>Recherche</p>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Nom, parfum, tag…"
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
        />
      </div>

      {nbFavoris > 0 && (
        <div className={styles.filterSection}>
          <button
            className={`${styles.catItem} ${filtreFavoris ? styles.catItemActive : ''}`}
            onClick={() => setFiltreFavoris(f => !f)}
          >
            <span>♥ Mes favoris</span>
            <span className={styles.catCount}>{nbFavoris}</span>
          </button>
        </div>
      )}

      <div className={styles.filterSection}>
        <p className={styles.filterTitle}>Par ingrédient</p>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Ex : gélatine, beurre…"
          value={filtreIngredient}
          onChange={e => setFiltreIngredient(e.target.value)}
          list="ingredients-list"
        />
        <datalist id="ingredients-list">
          {tousLesIngredients.map(nom => (
            <option key={nom} value={nom} />
          ))}
        </datalist>
        {filtreIngredient && (
          <button
            style={{ fontSize: 11, marginTop: 4, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => setFiltreIngredient('')}
          >
            ✕ Effacer
          </button>
        )}
      </div>

      <div className={styles.filterSection}>
        <p className={styles.filterTitle}>Catégorie</p>
        <div className={styles.catList}>
          <button
            className={`${styles.catItem} ${!filtreCategorie ? styles.catItemActive : ''}`}
            onClick={() => setFiltreCategorie('')}
          >
            <span>Toutes</span>
            <span className={styles.catCount}>{RECETTES.length}</span>
          </button>
          {cats.map(([id, cat]) => {
            const count = catCounts[id] || 0;
            if (count === 0) return null;
            return (
              <button
                key={id}
                className={`${styles.catItem} ${filtreCategorie === id ? styles.catItemActive : ''}`}
                onClick={() => setFiltreCategorie(filtreCategorie === id ? '' : id)}
              >
                <span>{cat.label}</span>
                <span className={styles.catCount}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.filterSection}>
        <p className={styles.filterTitle}>Contraintes</p>
        <div className={styles.constraintList}>
          {CONTRAINTES.map(({ id, label }) => {
            const active = filtresContraintes.includes(id);
            return (
              <label
                key={id}
                className={`${styles.constraintItem} ${active ? styles.constraintItemActive : ''}`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleContrainte(id)}
                />
                {label}
              </label>
            );
          })}
        </div>
      </div>

      <div className={styles.filterSection}>
        <p className={styles.filterTitle}>Tri</p>
        <select
          className={styles.triSelect}
          value={tri}
          onChange={e => setTri(e.target.value)}
        >
          {TRI_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          className="secondary"
          style={{ width: '100%', fontSize: '12px' }}
          onClick={() => {
            setFiltreCategorie('');
            setFiltresContraintes([]);
            setRecherche('');
            setTri('');
            setFiltreIngredient('');
            setFiltreFavoris(false);
          }}
        >
          Réinitialiser
        </button>
      )}
    </aside>
  );
}

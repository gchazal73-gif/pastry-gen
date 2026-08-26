'use client';

import { CATALOGUE, NB_RECETTES, FAMILLES, SOUS_CAT_LABELS } from '../../lib/recettes/index.js';
import styles from '../../app/bibliotheque/bibliotheque.module.css';

const CONTRAINTES = [
  { id: 'vegan',        label: 'Vegan'        },
  { id: 'sans_gluten',  label: 'Sans gluten'  },
  { id: 'sans_lactose', label: 'Sans lactose' },
];

const TRI_OPTIONS = [
  { value: 'nom',      label: 'Alphabétique A→Z'     },
  { value: 'famille',  label: 'Par famille'           },
  { value: 'valide',   label: 'Validées en premier'   },
  { value: 'calories', label: 'Calories ↑'            },
  { value: 'masse',    label: 'Masse ↑'               },
];

function buildFamilleStats() {
  const counts = {};
  const sousCats = {};
  for (const r of CATALOGUE) {
    if (!r.famille) continue;
    counts[r.famille] = (counts[r.famille] || 0) + 1;
    if (!sousCats[r.famille]) sousCats[r.famille] = {};
    const sc = r.sous_categorie;
    sousCats[r.famille][sc] = (sousCats[r.famille][sc] || 0) + 1;
  }
  return { counts, sousCats };
}

const { counts: FAMILLE_COUNTS, sousCats: FAMILLE_SOUS_CATS } = buildFamilleStats();

export default function FilterPanel({
  filtreFamille, setFiltreFamille,
  filtreSousCat, setFiltreSousCat,
  filtresContraintes, setFiltresContraintes,
  recherche, setRecherche,
  tri, setTri,
  filtreIngredient, setFiltreIngredient,
  tousLesIngredients = [],
  filtreFavoris, setFiltreFavoris, nbFavoris = 0,
}) {
  const familles = Object.entries(FAMILLES).sort((a, b) => a[1].ordre - b[1].ordre);

  function toggleContrainte(id) {
    setFiltresContraintes(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  function selectFamille(id) {
    if (filtreFamille === id) {
      setFiltreFamille('');
      setFiltreSousCat('');
    } else {
      setFiltreFamille(id);
      setFiltreSousCat('');
    }
  }

  function selectSousCat(sc) {
    setFiltreSousCat(filtreSousCat === sc ? '' : sc);
  }

  const hasFilters = filtreFamille || filtreSousCat || filtresContraintes.length > 0
    || recherche.trim() || (tri && tri !== 'nom') || filtreIngredient.trim() || filtreFavoris;

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
        <p className={styles.filterTitle}>Famille</p>
        <div className={styles.catList}>
          <button
            className={`${styles.catItem} ${!filtreFamille ? styles.catItemActive : ''}`}
            onClick={() => { setFiltreFamille(''); setFiltreSousCat(''); }}
          >
            <span>Toutes</span>
            <span className={styles.catCount}>{NB_RECETTES}</span>
          </button>

          {familles.map(([id, fam]) => {
            const count = FAMILLE_COUNTS[id] || 0;
            if (count === 0) return null;
            const isActive = filtreFamille === id;
            const sousCatEntries = Object.entries(FAMILLE_SOUS_CATS[id] || {})
              .sort((a, b) => b[1] - a[1]);

            return (
              <div key={id}>
                <button
                  className={`${styles.catItem} ${isActive ? styles.catItemActive : ''}`}
                  onClick={() => selectFamille(id)}
                >
                  <span>{fam.label}</span>
                  <span className={styles.catCount}>{count}</span>
                </button>

                {isActive && sousCatEntries.length > 0 && (
                  <div className={styles.sousCatList}>
                    {sousCatEntries.map(([sc, cnt]) => (
                      <button
                        key={sc}
                        className={`${styles.sousCatItem} ${filtreSousCat === sc ? styles.sousCatItemActive : ''}`}
                        onClick={() => selectSousCat(sc)}
                      >
                        <span>{SOUS_CAT_LABELS[sc] ?? sc.replace(/_/g, ' ')}</span>
                        <span className={styles.catCount}>{cnt}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
            setFiltreFamille('');
            setFiltreSousCat('');
            setFiltresContraintes([]);
            setRecherche('');
            setTri('nom');
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

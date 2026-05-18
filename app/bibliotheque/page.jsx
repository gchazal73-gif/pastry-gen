'use client';

import { useState, useMemo } from 'react';
import { RECETTES, CATEGORIES } from '../../lib/recettes/index.js';
import FilterPanel  from '../../components/bibliotheque/FilterPanel.jsx';
import RecetteCard  from '../../components/bibliotheque/RecetteCard.jsx';
import RecetteDetail from '../../components/bibliotheque/RecetteDetail.jsx';
import styles from './bibliotheque.module.css';

export default function BibliothequePage() {
  const [filtreCategorie,   setFiltreCategorie]   = useState('');
  const [filtresContraintes, setFiltresContraintes] = useState([]);
  const [recherche,          setRecherche]          = useState('');
  const [selected,           setSelected]           = useState(null);
  const [masse,              setMasse]              = useState(null);

  const recettesFiltrees = useMemo(() => {
    let r = RECETTES;
    if (filtreCategorie) r = r.filter(x => x.categorie === filtreCategorie);
    for (const c of filtresContraintes) {
      if (c === 'vegan')        r = r.filter(x => x.contraintes.vegan);
      if (c === 'sans_gluten')  r = r.filter(x => x.contraintes.sans_gluten);
      if (c === 'sans_lactose') r = r.filter(x => x.contraintes.sans_lactose);
    }
    if (recherche.trim()) {
      const q = recherche.toLowerCase();
      r = r.filter(x =>
        x.nom.toLowerCase().includes(q) ||
        x.parfum_principal.toLowerCase().includes(q) ||
        x.tags.some(t => t.toLowerCase().includes(q)) ||
        x.description.toLowerCase().includes(q)
      );
    }
    return r;
  }, [filtreCategorie, filtresContraintes, recherche]);

  function handleSelect(recette) {
    setSelected(recette);
    setMasse(recette.masse_totale_g);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className="page-title">Bibliothèque de recettes</h1>
        <p className="page-subtitle">
          {recettesFiltrees.length} recette{recettesFiltrees.length !== 1 ? 's' : ''} affichée{recettesFiltrees.length !== 1 ? 's' : ''}
          {recettesFiltrees.length !== RECETTES.length && ` · ${RECETTES.length} au total`}
        </p>
      </div>

      <div className={`${styles.grid} ${selected ? styles.gridWithDetail : ''}`}>
        <FilterPanel
          filtreCategorie={filtreCategorie}
          setFiltreCategorie={setFiltreCategorie}
          filtresContraintes={filtresContraintes}
          setFiltresContraintes={setFiltresContraintes}
          recherche={recherche}
          setRecherche={setRecherche}
        />

        <div className={styles.cards}>
          {recettesFiltrees.length === 0 ? (
            <div className="empty">
              <div className="icon">🔍</div>
              <p>Aucune recette ne correspond aux filtres sélectionnés.</p>
            </div>
          ) : (
            <div className={styles.cardsGrid}>
              {recettesFiltrees.map(r => (
                <RecetteCard
                  key={r.id}
                  recette={r}
                  selected={selected?.id === r.id}
                  onSelect={handleSelect}
                  categories={CATEGORIES}
                />
              ))}
            </div>
          )}
        </div>

        {selected && (
          <RecetteDetail
            recette={selected}
            masse={masse}
            setMasse={setMasse}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}

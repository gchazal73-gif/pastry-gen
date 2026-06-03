'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { RECETTES, CATEGORIES } from '../../lib/recettes/index.js';
import { getDensite, getDefaultEpaisseur, ASSIGNATION_DEFAUT } from '../../lib/densites.js';
import { computeRecipeNutrition } from '../../lib/nutrition.js';
import FilterPanel   from '../../components/bibliotheque/FilterPanel.jsx';
import RecetteCard   from '../../components/bibliotheque/RecetteCard.jsx';
import RecetteDetail from '../../components/bibliotheque/RecetteDetail.jsx';
import styles from './bibliotheque.module.css';
import { getFavoris, toggleFavori } from '../../lib/favoris-store.js';

const PLAN_KEY = 'pastry-gen-plan';

function genUid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function BibliothequePage() {
  const [filtreCategorie,    setFiltreCategorie]    = useState('');
  const [filtresContraintes, setFiltresContraintes]  = useState([]);
  const [recherche,          setRecherche]           = useState('');
  const [tri,                setTri]                 = useState('');
  const [filtreIngredient,   setFiltreIngredient]    = useState('');
  const [favoris,            setFavoris]             = useState(getFavoris);
  const [filtreFavoris,      setFiltreFavoris]       = useState(false);
  const [selected,           setSelected]            = useState(null);
  const [masse,              setMasse]               = useState(null);
  const [toast,              setToast]               = useState(false);
  const toastTimer = useRef(null);


  const tousLesIngredients = useMemo(() => {
    const set = new Set();
    RECETTES.forEach(r => {
      if (r.type === 'assemblage') {
        r.composants?.forEach(comp =>
          comp.ingredients?.forEach(ing => set.add(ing.nom))
        );
      } else {
        r.ingredients?.forEach(ing => set.add(ing.nom));
      }
    });
    return [...set].sort((a, b) => a.localeCompare(b, 'fr'));
  }, []);

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
    if (filtreFavoris) r = r.filter(x => favoris.includes(x.id));
    if (filtreIngredient.trim()) {
      const q = filtreIngredient.toLowerCase();
      r = r.filter(recette => {
        const ings = recette.type === 'assemblage'
          ? recette.composants?.flatMap(c => c.ingredients ?? [])
          : recette.ingredients ?? [];
        return ings.some(ing => ing.nom.toLowerCase().includes(q));
      });
    }
    if (tri === 'nom')      r = [...r].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    if (tri === 'masse')    r = [...r].sort((a, b) => (a.masse_totale_g ?? 0) - (b.masse_totale_g ?? 0));
    if (tri === 'calories') {
      const cache = new Map();
      const kcal = x => {
        if (!cache.has(x.id)) {
          try { cache.set(x.id, computeRecipeNutrition(x)?.per_100g?.energie_kcal ?? 0); }
          catch { cache.set(x.id, 0); }
        }
        return cache.get(x.id);
      };
      r = [...r].sort((a, b) => kcal(a) - kcal(b));
    }
    return r;
  }, [filtreCategorie, filtresContraintes, recherche, tri, filtreIngredient, filtreFavoris, favoris]);

  function handleToggleFavori(e, id) {
    e.stopPropagation();
    setFavoris(toggleFavori(id));
  }

  function handleSelect(recette) {
    if (selected?.id === recette.id) {
      setSelected(null);
      return;
    }
    setSelected(recette);
    setMasse(recette.masse_totale_g);
  }

  function addToPlan(recette) {
    const uid = genUid();
    try {
      const raw  = localStorage.getItem(PLAN_KEY);
      const data = raw ? JSON.parse(raw) : {
        slots: [],
        production: { moules: [], perte_production_pct: 10, mode_calcul: 'par_couches', moule_reference_id: null },
        montage: { couches: [] },
      };
      data.slots = [...(data.slots ?? []), { uid, recetteId: recette.id, masse: recette.masse_totale_g }];
      data.montage ??= { couches: [] };
      data.montage.couches = [...(data.montage.couches ?? []), {
        uid,
        nom:              recette.nom,
        sous_categorie:   recette.sous_categorie ?? '',
        assignation:      ASSIGNATION_DEFAUT[recette.categorie] ?? 'couche',
        epaisseur_mm:     getDefaultEpaisseur(recette.sous_categorie ?? ''),
        densite_g_ml:     recette.densite_g_ml ?? getDensite(recette.sous_categorie ?? ''),
        masse_g_libre:    recette.masse_totale_g,
        masse_g_override: null,
        pourcentage:      0,
      }];
      localStorage.setItem(PLAN_KEY, JSON.stringify(data));
    } catch { /* ignore */ }

    clearTimeout(toastTimer.current);
    setToast(true);
    toastTimer.current = setTimeout(() => setToast(false), 2000);
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
          tri={tri}
          setTri={setTri}
          filtreIngredient={filtreIngredient}
          setFiltreIngredient={setFiltreIngredient}
          tousLesIngredients={tousLesIngredients}
          filtreFavoris={filtreFavoris}
          setFiltreFavoris={setFiltreFavoris}
          nbFavoris={favoris.length}
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
                  onAddToPlan={addToPlan}
                  categories={CATEGORIES}
                  isFavori={favoris.includes(r.id)}
                  onToggleFavori={handleToggleFavori}
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

      {toast && (
        <div className={styles.toast} role="status" aria-live="polite">
          Ajouté au plan ✓
        </div>
      )}
    </div>
  );
}

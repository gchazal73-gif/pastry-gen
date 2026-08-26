'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { CATALOGUE, NB_RECETTES, INGREDIENTS_CONNUS, chargerRecette,
         CATEGORIES, FAMILLES } from '../../lib/recettes/index.js';
import { getDensite, getDefaultEpaisseur, ASSIGNATION_DEFAUT } from '../../lib/densites.js';
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
  const [filtreFamille,      setFiltreFamille]       = useState('');
  const [filtreSousCat,      setFiltreSousCat]       = useState('');
  const [filtresContraintes, setFiltresContraintes]  = useState([]);
  const [recherche,          setRecherche]           = useState('');
  const [tri,                setTri]                 = useState('nom');
  const [filtreIngredient,   setFiltreIngredient]    = useState('');
  const [favoris,            setFavoris]             = useState(getFavoris);
  const [filtreFavoris,      setFiltreFavoris]       = useState(false);
  const [selected,           setSelected]            = useState(null);
  const [masse,              setMasse]               = useState(null);
  const [toast,              setToast]               = useState(false);
  const [chargementFiche,    setChargementFiche]     = useState(null);
  const toastTimer = useRef(null);

  // Restaurer le tri depuis localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem('bibliotheque-sort');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setTri(stored);
  }, []);

  // Persister le tri à chaque changement
  useEffect(() => {
    localStorage.setItem('bibliotheque-sort', tri);
  }, [tri]);

  const tousLesIngredients = INGREDIENTS_CONNUS;

  const recettesFiltrees = useMemo(() => {
    let r = CATALOGUE;
    if (filtreFamille)  r = r.filter(x => x.famille === filtreFamille);
    if (filtreSousCat)  r = r.filter(x => x.sous_categorie === filtreSousCat);
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
      // `ingredients_noms` est précalculé au catalogue : le filtre par
      // ingrédient n'a plus besoin des pesées, donc plus besoin du corpus.
      r = r.filter(recette => recette.ingredients_noms.some(n => n.toLowerCase().includes(q)));
    }
    if (tri === 'nom')      r = [...r].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    if (tri === 'famille')  r = [...r].sort((a, b) => (a.famille ?? '').localeCompare(b.famille ?? '', 'fr') || a.nom.localeCompare(b.nom, 'fr'));
    if (tri === 'valide')   r = [...r].sort((a, b) => (a.a_verifier ? 1 : 0) - (b.a_verifier ? 1 : 0) || a.nom.localeCompare(b.nom, 'fr'));
    if (tri === 'masse')    r = [...r].sort((a, b) => (a.masse_totale_g ?? 0) - (b.masse_totale_g ?? 0));
    if (tri === 'calories') r = [...r].sort((a, b) => (a.kcal_100g ?? 0) - (b.kcal_100g ?? 0));
    return r;
  }, [filtreFamille, filtreSousCat, filtresContraintes, recherche, tri, filtreIngredient, filtreFavoris, favoris]);

  function handleToggleFavori(e, id) {
    e.stopPropagation();
    setFavoris(toggleFavori(id));
  }

  // La liste ne connaît que l'index : la fiche a besoin du procédé et des
  // pesées, qui arrivent par import dynamique au moment du clic.
  async function handleSelect(entree) {
    if (selected?.id === entree.id) {
      setSelected(null);
      return;
    }
    setChargementFiche(entree.id);
    const complete = await chargerRecette(entree.id);
    setChargementFiche(null);
    if (!complete) return;
    setSelected(complete);
    setMasse(complete.masse_totale_g);
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
          {recettesFiltrees.length !== NB_RECETTES && ` · ${NB_RECETTES} au total`}
        </p>
      </div>

      <div className={`${styles.grid} ${selected ? styles.gridWithDetail : ''}`}>
        <FilterPanel
          filtreFamille={filtreFamille}
          setFiltreFamille={setFiltreFamille}
          filtreSousCat={filtreSousCat}
          setFiltreSousCat={setFiltreSousCat}
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
                  selected={selected?.id === r.id || chargementFiche === r.id}
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

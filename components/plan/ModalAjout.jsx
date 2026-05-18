'use client';

import { useState, useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import { RECETTES, CATEGORIES } from '../../lib/recettes/index.js';
import styles from '../../app/plan-de-travail/plan.module.css';

export default function ModalAjout({ open, onClose, onAdd }) {
  const [recherche,        setRecherche]        = useState('');
  const [filtreCategorie,  setFiltreCategorie]  = useState('');

  // Réinitialiser les filtres à chaque ouverture
  useEffect(() => {
    if (open) { setRecherche(''); setFiltreCategorie(''); }
  }, [open]);

  // Fermer sur Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const cats = Object.entries(CATEGORIES)
    .sort((a, b) => a[1].ordre - b[1].ordre)
    .filter(([id]) => RECETTES.some(r => r.categorie === id));

  const recettesFiltrees = useMemo(() => {
    let r = RECETTES;
    if (filtreCategorie) r = r.filter(x => x.categorie === filtreCategorie);
    if (recherche.trim()) {
      const q = recherche.toLowerCase();
      r = r.filter(x =>
        x.nom.toLowerCase().includes(q) ||
        x.parfum_principal.toLowerCase().includes(q) ||
        x.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return r;
  }, [filtreCategorie, recherche]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Ajouter une recette">
        {/* En-tête */}
        <div className={styles.modalHead}>
          <h2 className={styles.modalTitle}>Ajouter une recette</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Fermer">
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Filtres */}
        <div className={styles.modalFilters}>
          <input
            className={styles.modalSearch}
            type="text"
            placeholder="Rechercher…"
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            autoFocus
          />
          <div className={styles.modalChips}>
            <button
              className={`chip ${!filtreCategorie ? 'active' : ''}`}
              onClick={() => setFiltreCategorie('')}
            >
              Toutes
            </button>
            {cats.map(([id, cat]) => (
              <button
                key={id}
                className={`chip ${filtreCategorie === id ? 'active' : ''}`}
                onClick={() => setFiltreCategorie(filtreCategorie === id ? '' : id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        <div className={styles.modalList}>
          {recettesFiltrees.length === 0 ? (
            <div className={styles.modalEmpty}>Aucune recette trouvée.</div>
          ) : (
            recettesFiltrees.map(r => (
              <div
                key={r.id}
                className={styles.modalItem}
                onClick={() => { onAdd(r); onClose(); }}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && (onAdd(r), onClose())}
              >
                <div>
                  <div className={styles.modalItemNom}>{r.nom}</div>
                  <div className={styles.modalItemSub}>{r.parfum_principal || r.sous_categorie.replace(/_/g, ' ')}</div>
                </div>
                <div className={styles.modalItemCat}>{CATEGORIES[r.categorie]?.label ?? r.categorie}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

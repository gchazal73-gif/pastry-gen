'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { RECETTES } from '../../lib/recettes/index.js';
import SlotCard      from '../../components/plan/SlotCard.jsx';
import RecapMatieres from '../../components/plan/RecapMatieres.jsx';
import ModalAjout    from '../../components/plan/ModalAjout.jsx';
import styles from './plan.module.css';

const STORAGE_KEY = 'pastry-gen-plan';

function genUid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function PlanDeTravailPage() {
  const [slots,      setSlots]      = useState([]);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [hydrated,   setHydrated]   = useState(false);

  // Charger depuis localStorage côté client uniquement
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSlots(JSON.parse(raw).slots ?? []);
    } catch {}
    setHydrated(true);
  }, []);

  // Persister à chaque changement
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ slots }));
  }, [slots, hydrated]);

  const recettesMap = useMemo(() => {
    const map = {};
    RECETTES.forEach(r => { map[r.id] = r; });
    return map;
  }, []);

  const addSlot = useCallback((recette) => {
    setSlots(prev => [...prev, { uid: genUid(), recetteId: recette.id, masse: recette.masse_totale_g }]);
  }, []);

  const removeSlot = useCallback((uid) => {
    setSlots(prev => prev.filter(s => s.uid !== uid));
  }, []);

  const updateMasse = useCallback((uid, masse) => {
    setSlots(prev => prev.map(s => s.uid === uid ? { ...s, masse } : s));
  }, []);

  function clearPlan() {
    if (slots.length === 0) return;
    if (window.confirm('Vider le plan de travail ? Cette action est irréversible.')) {
      setSlots([]);
    }
  }

  return (
    <div className={styles.page}>
      {/* En-tête */}
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Plan de travail</h1>
          <p className="page-subtitle">
            {slots.length === 0
              ? 'Aucune recette — ajoutez des préparations depuis la bibliothèque'
              : `${slots.length} préparation${slots.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className={styles.headerActions}>
          {slots.length > 0 && (
            <button className="secondary" onClick={clearPlan} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Trash2 size={14} strokeWidth={2} />
              Vider
            </button>
          )}
          <button className="primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setModalOpen(true)}>
            <Plus size={16} strokeWidth={2.5} />
            Ajouter une recette
          </button>
        </div>
      </div>

      {/* Corps */}
      {slots.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <p className={styles.emptyText}>Votre plan est vide. Ajoutez des recettes depuis la bibliothèque pour composer votre production.</p>
          <button className="primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setModalOpen(true)}>
            <Plus size={16} strokeWidth={2.5} />
            Ajouter une recette
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {/* Colonne gauche — slots */}
          <div>
            <div className={styles.slotsList}>
              {slots.map(slot => {
                const recette = recettesMap[slot.recetteId];
                if (!recette) return null;
                return (
                  <SlotCard
                    key={slot.uid}
                    slot={slot}
                    recette={recette}
                    onMasseChange={updateMasse}
                    onRemove={removeSlot}
                  />
                );
              })}
            </div>
            <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
              <Plus size={16} strokeWidth={2} />
              Ajouter une recette
            </button>
          </div>

          {/* Colonne droite — récap */}
          <RecapMatieres slots={slots} recettesMap={recettesMap} />
        </div>
      )}

      {/* Modal */}
      <ModalAjout
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addSlot}
      />
    </div>
  );
}

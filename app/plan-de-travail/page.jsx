'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Trash2, FileText, ShoppingCart } from 'lucide-react';
import { RECETTES }             from '../../lib/recettes/index.js';
import { MOULES_PRESETS }       from '../../lib/moules.js';
import { computePlanNutrition } from '../../lib/nutrition.js';
import { getDensite, getDefaultEpaisseur, ASSIGNATION_DEFAUT } from '../../lib/densites.js';
import SlotCard          from '../../components/plan/SlotCard.jsx';
import RecapMatieres     from '../../components/plan/RecapMatieres.jsx';
import RecapNutrition    from '../../components/plan/RecapNutrition.jsx';
import ModalAjout        from '../../components/plan/ModalAjout.jsx';
import PanneauProduction from '../../components/plan/PanneauProduction.jsx';
import styles from './plan.module.css';

const STORAGE_KEY       = 'pastry-gen-plan';
const STORAGE_KEY_MOULES = 'moules-user';

function genUid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const PRODUCTION_DEFAUT = { moules: [], perte_production_pct: 10, mode_calcul: 'par_couches' };
const MONTAGE_DEFAUT    = { couches: [] };

export default function PlanDeTravailPage() {
  const [slots,      setSlots]      = useState([]);
  const [production, setProduction] = useState(PRODUCTION_DEFAUT);
  const [montage,    setMontage]    = useState(MONTAGE_DEFAUT);
  const [userMoules, setUserMoules] = useState([]);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [hydrated,   setHydrated]   = useState(false);
  const [profilAJR,  setProfilAJR]  = useState('adulte_2000kcal');

  // Charger depuis localStorage côté client uniquement
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setSlots(data.slots      ?? []);
        setProduction(data.production ?? PRODUCTION_DEFAUT);
        setMontage(data.montage   ?? MONTAGE_DEFAUT);
      }
    } catch {}
    try {
      const rawMoules = localStorage.getItem(STORAGE_KEY_MOULES);
      if (rawMoules) setUserMoules(JSON.parse(rawMoules));
    } catch {}
    setHydrated(true);
  }, []);

  // Persister à chaque changement
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ slots, production, montage }));
  }, [slots, production, montage, hydrated]);

  const recettesMap = useMemo(() => {
    const map = {};
    RECETTES.forEach(r => { map[r.id] = r; });
    return map;
  }, []);

  const allMoules = useMemo(() => [
    ...MOULES_PRESETS.map(m => ({ ...m, _preset: true })),
    ...userMoules.map(m => ({ ...m, _preset: false })),
  ], [userMoules]);

  const planNutrition = useMemo(() => {
    if (slots.length === 0) return null;
    return computePlanNutrition(slots, recettesMap, profilAJR);
  }, [slots, recettesMap, profilAJR]);

  const breakdownByUid = useMemo(() => {
    if (!planNutrition) return {};
    return Object.fromEntries(planNutrition.breakdown.map(b => [b.uid, b]));
  }, [planNutrition]);

  const addSlot = useCallback((recette) => {
    const uid = genUid();
    setSlots(prev => [...prev, { uid, recetteId: recette.id, masse: recette.masse_totale_g }]);
    setMontage(prev => ({
      ...prev,
      couches: [...prev.couches, {
        uid,
        nom:            recette.nom,
        sous_categorie: recette.sous_categorie ?? '',
        assignation:    ASSIGNATION_DEFAUT[recette.categorie] ?? 'couche',
        epaisseur_mm:   getDefaultEpaisseur(recette.sous_categorie ?? ''),
        densite_g_ml:   recette.densite_g_ml ?? getDensite(recette.sous_categorie ?? ''),
        masse_g_libre:  recette.masse_totale_g,
        masse_g_override: null,
      }],
    }));
  }, []);

  const removeSlot = useCallback((uid) => {
    setSlots(prev => prev.filter(s => s.uid !== uid));
    setMontage(prev => ({ ...prev, couches: prev.couches.filter(c => c.uid !== uid) }));
  }, []);

  const updateMasse = useCallback((uid, masse) => {
    setSlots(prev => prev.map(s => s.uid === uid ? { ...s, masse } : s));
  }, []);

  function clearPlan() {
    if (slots.length === 0) return;
    if (window.confirm('Vider le plan de travail ? Cette action est irréversible.')) {
      setSlots([]);
      setProduction(PRODUCTION_DEFAUT);
      setMontage(MONTAGE_DEFAUT);
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
            <>
              <button
                className="secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => window.open('/plan-de-travail/imprimer#fiches', '_blank')}
              >
                <FileText size={14} strokeWidth={2} />
                Fiches
              </button>
              <button
                className="secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => window.open('/plan-de-travail/imprimer#economat', '_blank')}
              >
                <ShoppingCart size={14} strokeWidth={2} />
                Économat
              </button>
              <button
                className="secondary"
                onClick={clearPlan}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Trash2 size={14} strokeWidth={2} />
                Vider
              </button>
            </>
          )}
          <button
            className="primary"
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setModalOpen(true)}
          >
            <Plus size={16} strokeWidth={2.5} />
            Ajouter une recette
          </button>
        </div>
      </div>

      {/* Corps */}
      {slots.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <p className={styles.emptyText}>
            Votre plan est vide. Ajoutez des recettes depuis la bibliothèque pour composer votre production.
          </p>
          <button
            className="primary"
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setModalOpen(true)}
          >
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
                    kcalInfo={breakdownByUid[slot.uid]}
                  />
                );
              })}
            </div>
            <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
              <Plus size={16} strokeWidth={2} />
              Ajouter une recette
            </button>
          </div>

          {/* Colonne droite — production + récap matières + nutrition */}
          <div className={styles.rightPanel}>
            <PanneauProduction
              production={production}
              setProduction={setProduction}
              montage={montage}
              setMontage={setMontage}
              allMoules={allMoules}
            />
            <RecapMatieres slots={slots} recettesMap={recettesMap} />
            <RecapNutrition
              planNutrition={planNutrition}
              profilAJR={profilAJR}
              onProfilChange={setProfilAJR}
            />
          </div>
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

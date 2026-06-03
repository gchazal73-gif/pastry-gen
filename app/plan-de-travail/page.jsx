'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Trash2, FileText, ShoppingCart } from 'lucide-react';
import { RECETTES }             from '../../lib/recettes/index.js';
import { MOULES_PRESETS }       from '../../lib/moules.js';
import { computeProductionPlan, normalizePercentages } from '../../lib/production.js';
import { computePlanNutrition } from '../../lib/nutrition.js';
import { getDensite, getDefaultEpaisseur, ASSIGNATION_DEFAUT } from '../../lib/densites.js';
import SlotCard          from '../../components/plan/SlotCard.jsx';
import RecapMatieres     from '../../components/plan/RecapMatieres.jsx';
import RecapMiseEnPlace  from '../../components/plan/RecapMiseEnPlace.jsx';
import RecapNutrition    from '../../components/plan/RecapNutrition.jsx';
import RecapMetier       from '../../components/plan/RecapMetier.jsx';
import ModalAjout        from '../../components/plan/ModalAjout.jsx';
import PanneauProduction from '../../components/plan/PanneauProduction.jsx';
import styles from './plan.module.css';

const STORAGE_KEY        = 'pastry-gen-plan';
const STORAGE_KEY_MOULES = 'moules-user';

function genUid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const PRODUCTION_DEFAUT = {
  moules: [],
  perte_production_pct: 10,
  mode_calcul: 'par_couches',
  moule_reference_id: null,
};
const MONTAGE_DEFAUT = { couches: [] };

export default function PlanDeTravailPage() {
  const [slots,      setSlots]      = useState([]);
  const [production, setProduction] = useState(PRODUCTION_DEFAUT);
  const [montage,    setMontage]    = useState(MONTAGE_DEFAUT);
  const [userMoules, setUserMoules] = useState([]);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [hydrated,   setHydrated]   = useState(false);
  const [profilAJR,  setProfilAJR]  = useState('adulte_2000kcal');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSlots(data.slots      ?? []);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProduction({ ...PRODUCTION_DEFAUT, ...(data.production ?? {}) });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMontage(data.montage   ?? MONTAGE_DEFAUT);
      }
    } catch {}
    try {
      const rawMoules = localStorage.getItem(STORAGE_KEY_MOULES);
      if (rawMoules) setUserMoules(JSON.parse(rawMoules));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ slots, production, montage }));
  }, [slots, production, montage, hydrated]);

  // Auto-setter le moule de référence
  useEffect(() => {
    if (!hydrated) return;
    const ids = production.moules.map(ms => ms.moule_id);
    if (ids.length === 0) {
      if (production.moule_reference_id !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProduction(prev => ({ ...prev, moule_reference_id: null }));
      }
      return;
    }
    if (!production.moule_reference_id || !ids.includes(production.moule_reference_id)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProduction(prev => ({ ...prev, moule_reference_id: ids[0] }));
    }
  }, [production.moules, production.moule_reference_id, hydrated]);

  // Bascule automatique de mode selon la présence de moules.
  useEffect(() => {
    if (!hydrated) return;
    const hasActiveMoules = production.moules.some(ms => (ms.quantite ?? 0) > 0);

    if (hasActiveMoules) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProduction(prev => {
        if (prev.mode_calcul === 'par_pourcentage') return prev;
        return { ...prev, mode_calcul: 'par_pourcentage' };
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMontage(prev => {
        if (prev.couches.length === 0) return prev;
        if (!prev.couches.every(c => (c.pourcentage ?? 0) === 0)) return prev;
        const eq = Math.round(1000 / prev.couches.length) / 10;
        return { ...prev, couches: prev.couches.map(c => ({ ...c, pourcentage: eq })) };
      });
    } else {
      setProduction(prev => {
        if (prev.mode_calcul === 'par_couches') return prev;
        return { ...prev, mode_calcul: 'par_couches' };
      });
    }
  }, [production.moules, hydrated]);

  const recettesMap = useMemo(() => {
    const map = {};
    RECETTES.forEach(r => { map[r.id] = r; });
    return map;
  }, []);

  const allMoules = useMemo(() => [
    ...MOULES_PRESETS.map(m => ({ ...m, _preset: true })),
    ...userMoules.map(m => ({ ...m, _preset: false })),
  ], [userMoules]);

  // Levé depuis PanneauProduction pour le partager avec RecapMiseEnPlace
  const moulesMap = useMemo(
    () => Object.fromEntries(allMoules.map(m => [m.id, m])),
    [allMoules],
  );

  const productionResult = useMemo(() => {
    if (production.moules.filter(ms => (ms.quantite ?? 0) > 0).length === 0) return null;
    return computeProductionPlan({ production, montage }, moulesMap);
  }, [production, montage, moulesMap]);

  const composantsMap = useMemo(() => {
    if (!productionResult) return {};
    return Object.fromEntries(productionResult.composants.map(c => [c.uid, c]));
  }, [productionResult]);

  // Map uid → couche (pour passer les % aux SlotCards)
  const coucheByUid = useMemo(
    () => Object.fromEntries(montage.couches.map(c => [c.uid, c])),
    [montage.couches],
  );

  // Segments pour la barre empilée (calculés ici, passés à PanneauProduction)
  const SEGMENT_COLORS = ['#e63946','#457b9d','#2a9d8f','#e9c46a','#f4a261','#a8dadc','#8338ec','#fb5607'];
  const barSegments = useMemo(() =>
    slots.map((slot, idx) => {
      const recette = recettesMap[slot.recetteId];
      const couche  = coucheByUid[slot.uid];
      return {
        uid:   slot.uid,
        nom:   recette?.nom ?? '?',
        pct:   couche?.pourcentage ?? 0,
        color: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
      };
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [slots, recettesMap, coucheByUid]);

  const planNutrition = useMemo(() => {
    if (slots.length === 0) return null;
    return computePlanNutrition(slots, recettesMap, profilAJR);
  }, [slots, recettesMap, profilAJR]);

  const breakdownByUid = useMemo(() => {
    if (!planNutrition) return {};
    return Object.fromEntries(planNutrition.breakdown.map(b => [b.uid, b]));
  }, [planNutrition]);

  // ── Callbacks ──────────────────────────────────────────────────────────────

  const addSlot = useCallback((recette) => {
    const uid = genUid();
    setSlots(prev => [...prev, { uid, recetteId: recette.id, masse: recette.masse_totale_g }]);
    setMontage(prev => ({
      ...prev,
      couches: [...prev.couches, {
        uid,
        nom:              recette.nom,
        sous_categorie:   recette.sous_categorie ?? '',
        assignation:      ASSIGNATION_DEFAUT[recette.categorie] ?? 'couche',
        epaisseur_mm:     getDefaultEpaisseur(recette.sous_categorie ?? ''),
        densite_g_ml:     recette.densite_g_ml ?? getDensite(recette.sous_categorie ?? ''),
        masse_g_libre:    recette.masse_totale_g,
        masse_g_override: null,
        pourcentage:      0,
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

  const updatePourcentage = useCallback((uid, pct) => {
    const n = parseFloat(pct);
    setMontage(prev => ({
      ...prev,
      couches: prev.couches.map(c =>
        c.uid === uid ? { ...c, pourcentage: isNaN(n) ? 0 : Math.max(0, n) } : c,
      ),
    }));
  }, []);

  const normalizePourcentages = useCallback(() => {
    setMontage(prev => {
      const total = prev.couches.reduce((s, c) => s + (c.pourcentage ?? 0), 0);
      if (total === 0) {
        // Distribution égale si tout est à 0
        const eq = Math.round(100 / prev.couches.length * 10) / 10;
        return { ...prev, couches: prev.couches.map(c => ({ ...c, pourcentage: eq })) };
      }
      return { ...prev, couches: normalizePercentages(prev.couches) };
    });
  }, []);

  function clearPlan() {
    if (slots.length === 0) return;
    if (window.confirm('Vider le plan de travail ? Cette action est irréversible.')) {
      setSlots([]);
      setProduction(PRODUCTION_DEFAUT);
      setMontage(MONTAGE_DEFAUT);
    }
  }

  const modePct  = production.mode_calcul === 'par_pourcentage';
  const nbMoules = production.moules.reduce((s, ms) => s + (ms.quantite ?? 1), 0);
  const miseEnPlaceActive = modePct && productionResult !== null;

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
              {slots.map((slot, idx) => {
                const recette   = recettesMap[slot.recetteId];
                if (!recette) return null;
                const couche    = coucheByUid[slot.uid];
                const composant = composantsMap[slot.uid];
                const segColor  = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
                return (
                  <SlotCard
                    key={slot.uid}
                    slot={slot}
                    recette={recette}
                    onMasseChange={updateMasse}
                    onRemove={removeSlot}
                    kcalInfo={breakdownByUid[slot.uid]}
                    modePct={modePct}
                    pourcentage={couche?.pourcentage ?? 0}
                    onPourcentageChange={updatePourcentage}
                    masseRef={composant?.masse_moule_reference_g ?? null}
                    masseTotale={composant?.masse_a_preparer_g ?? null}
                    nbMoules={nbMoules}
                    segColor={segColor}
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
              moulesMap={moulesMap}
              productionResult={productionResult}
              composantsMap={composantsMap}
              barSegments={barSegments}
              onNormalize={normalizePourcentages}
            />
            {miseEnPlaceActive ? (
              <RecapMiseEnPlace
                slots={slots}
                recettesMap={recettesMap}
                productionResult={productionResult}
                barSegments={barSegments}
              />
            ) : (
              <RecapMatieres slots={slots} recettesMap={recettesMap} />
            )}
            <RecapNutrition
              planNutrition={planNutrition}
              profilAJR={profilAJR}
              onProfilChange={setProfilAJR}
            />
            <RecapMetier slots={slots} recettesMap={recettesMap} />
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

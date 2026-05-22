'use client';

import { useState, useMemo } from 'react';
import {
  Plus, X, GripVertical, Pencil, RotateCcw,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { computeProductionPlan } from '../../lib/production.js';
import styles from '../../app/plan-de-travail/plan.module.css';

const ASSIGNATION_CYCLE = { couche: 'habillage', habillage: 'libre', libre: 'couche' };

const ASSIGNATION_LABELS = { couche: 'Couche', habillage: 'Habillage', libre: 'Libre' };

const ASSIGNATION_STYLE = {
  couche:    styles.stackAssignCouche,
  habillage: styles.stackAssignHabillage,
  libre:     styles.stackAssignLibre,
};

const TYPE_FILTER_OPTIONS = [
  { id: '',               label: 'Tous'        },
  { id: 'cercle',         label: 'Cercles'     },
  { id: 'cadre',          label: 'Cadres'      },
  { id: 'demi_sphere',    label: 'Demi-sph.'   },
  { id: 'moule_silicone', label: 'Silicone'    },
  { id: '_user',          label: 'Mes moules'  },
];

export default function PanneauProduction({ production, setProduction, montage, setMontage, allMoules }) {
  const [dragIdx,        setDragIdx]        = useState(null);
  const [overIdx,        setOverIdx]        = useState(null);
  const [overridingUid,  setOverridingUid]  = useState(null);
  const [overrideVal,    setOverrideVal]    = useState('');
  const [mouleModalOpen, setMouleModalOpen] = useState(false);
  const [showWarnings,   setShowWarnings]   = useState(false);

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

  const stackIndicator = useMemo(() => {
    if (!productionResult || production.moules.length === 0) return null;
    const ms    = production.moules[0];
    const moule = moulesMap[ms.moule_id];
    if (!moule?.dimensions?.hauteur_cm) return null;
    const hauteurMm = moule.dimensions.hauteur_cm * 10;
    const sommeMm   = montage.couches
      .filter(c => c.assignation === 'couche')
      .reduce((s, c) => s + (Number(c.epaisseur_mm) || 0), 0);
    return { sommeMm, hauteurMm, pct: Math.min(100, (sommeMm / hauteurMm) * 100) };
  }, [productionResult, production.moules, montage.couches, moulesMap]);

  // ── Moule operations ──────────────────────────────────────────────────────

  function addMoule(moule) {
    if (production.moules.some(ms => ms.moule_id === moule.id)) return;
    setProduction(prev => ({
      ...prev,
      moules: [...prev.moules, { moule_id: moule.id, quantite: 1 }],
    }));
  }

  function removeMoule(moule_id) {
    setProduction(prev => ({
      ...prev,
      moules: prev.moules.filter(ms => ms.moule_id !== moule_id),
    }));
  }

  function setQty(moule_id, val) {
    const n = parseInt(val, 10);
    setProduction(prev => ({
      ...prev,
      moules: prev.moules.map(ms =>
        ms.moule_id === moule_id ? { ...ms, quantite: isNaN(n) || n < 1 ? 1 : n } : ms,
      ),
    }));
  }

  function setPerte(val) {
    const n = parseFloat(val);
    setProduction(prev => ({
      ...prev,
      perte_production_pct: isNaN(n) ? 0 : Math.max(0, Math.min(100, n)),
    }));
  }

  // ── Stack operations ──────────────────────────────────────────────────────

  function setEpaisseur(uid, val) {
    const n = parseFloat(val);
    setMontage(prev => ({
      ...prev,
      couches: prev.couches.map(c =>
        c.uid === uid ? { ...c, epaisseur_mm: isNaN(n) ? '' : n } : c,
      ),
    }));
  }

  function cycleAssignation(uid) {
    setMontage(prev => ({
      ...prev,
      couches: prev.couches.map(c =>
        c.uid === uid
          ? { ...c, assignation: ASSIGNATION_CYCLE[c.assignation] ?? 'couche' }
          : c,
      ),
    }));
  }

  function startOverride(uid, currentMasse) {
    setOverridingUid(uid);
    setOverrideVal(String(currentMasse ?? ''));
  }

  function commitOverride(uid) {
    const v = parseFloat(overrideVal);
    setMontage(prev => ({
      ...prev,
      couches: prev.couches.map(c =>
        c.uid === uid ? { ...c, masse_g_override: isNaN(v) ? null : v } : c,
      ),
    }));
    setOverridingUid(null);
  }

  function resetOverride(uid) {
    setMontage(prev => ({
      ...prev,
      couches: prev.couches.map(c =>
        c.uid === uid ? { ...c, masse_g_override: null } : c,
      ),
    }));
  }

  // ── Drag-and-drop ─────────────────────────────────────────────────────────

  function handleDragStart(e, idx) {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, idx) {
    e.preventDefault();
    setOverIdx(idx);
  }

  function handleDrop(e, idx) {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      setMontage(prev => {
        const next      = [...prev.couches];
        const [moved]   = next.splice(dragIdx, 1);
        next.splice(idx, 0, moved);
        return { ...prev, couches: next };
      });
    }
    setDragIdx(null);
    setOverIdx(null);
  }

  function handleDragEnd() {
    setDragIdx(null);
    setOverIdx(null);
  }

  if (montage.couches.length === 0) return null;

  return (
    <div className={styles.prodPanel}>
      <div className={styles.prodPanelTitle}>Production</div>

      {/* ── Moules ─────────────────────────────────────────────────────── */}
      <div className={styles.prodSection}>
        <div className={styles.prodSectionTitle}>Moules</div>

        {production.moules.length === 0 ? (
          <p className={styles.prodEmptyMoules}>Aucun moule sélectionné</p>
        ) : (
          production.moules.map(ms => {
            const moule = moulesMap[ms.moule_id];
            if (!moule) return null;
            const vol = productionResult?.moules?.find(m => m.id === ms.moule_id)?.volume_ml;
            return (
              <div key={ms.moule_id} className={styles.prodMouleRow}>
                <div className={styles.prodMouleInfo}>
                  <div className={styles.prodMouleNom}>{moule.nom}</div>
                  {vol != null && <div className={styles.prodMouleVol}>{vol} mL</div>}
                </div>
                <div className={styles.prodMouleControls}>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    step={1}
                    value={ms.quantite}
                    onChange={e => setQty(ms.moule_id, e.target.value)}
                    className={styles.prodQtyInput}
                    aria-label="Quantité"
                  />
                  <button
                    className={styles.prodMouleRemove}
                    onClick={() => removeMoule(ms.moule_id)}
                    aria-label="Retirer ce moule"
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                </div>
              </div>
            );
          })
        )}

        <button className={styles.prodAddMoule} onClick={() => setMouleModalOpen(true)}>
          <Plus size={13} strokeWidth={2.5} />
          Ajouter un moule
        </button>
      </div>

      {/* ── Perte % ────────────────────────────────────────────────────── */}
      <div className={styles.prodPerteRow}>
        <span className={styles.prodPerteLabel}>Perte production</span>
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={production.perte_production_pct}
          onChange={e => setPerte(e.target.value)}
          className={styles.prodPerteInput}
        />
        <span className={styles.prodPerteUnit}>%</span>
      </div>

      {/* ── Stack ──────────────────────────────────────────────────────── */}
      <div className={styles.prodSection}>
        <div className={styles.prodSectionTitle}>Montage — bas → haut</div>

        {montage.couches.map((couche, idx) => {
          const computed      = composantsMap[couche.uid];
          const masseAuMoulage = computed?.masse_au_moulage_g;
          const hasOverride    = couche.masse_g_override != null;
          const isOverriding   = overridingUid === couche.uid;

          return (
            <div
              key={couche.uid}
              className={[
                styles.stackItem,
                dragIdx === idx                       ? styles.stackItemDragging : '',
                overIdx === idx && dragIdx !== idx    ? styles.stackItemOver     : '',
              ].filter(Boolean).join(' ')}
              draggable
              onDragStart={e => handleDragStart(e, idx)}
              onDragOver={e  => handleDragOver(e, idx)}
              onDrop={e      => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
            >
              <span className={styles.stackHandle} aria-hidden="true">
                <GripVertical size={13} strokeWidth={2} />
              </span>

              <button
                type="button"
                className={`${styles.stackAssign} ${ASSIGNATION_STYLE[couche.assignation] ?? ''}`}
                onClick={() => cycleAssignation(couche.uid)}
                title="Cliquer pour changer l'assignation"
              >
                {ASSIGNATION_LABELS[couche.assignation]}
              </button>

              <div className={styles.stackNom}>{couche.nom}</div>

              {couche.assignation === 'couche' && (
                <input
                  type="number"
                  min={1}
                  max={50}
                  step={0.5}
                  value={couche.epaisseur_mm ?? ''}
                  onChange={e => setEpaisseur(couche.uid, e.target.value)}
                  className={styles.stackEpaisseur}
                  aria-label="Épaisseur (mm)"
                  title="Épaisseur en mm"
                />
              )}

              <div className={styles.stackMasseArea}>
                {isOverriding ? (
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={overrideVal}
                    onChange={e => setOverrideVal(e.target.value)}
                    onBlur={() => commitOverride(couche.uid)}
                    onKeyDown={e => {
                      if (e.key === 'Enter')  commitOverride(couche.uid);
                      if (e.key === 'Escape') setOverridingUid(null);
                    }}
                    className={styles.prodMasseOverrideInput}
                    autoFocus
                  />
                ) : (
                  <span className={`${styles.stackMasse}${hasOverride ? ` ${styles.stackMasseOverridden}` : ''}`}>
                    {masseAuMoulage != null ? `${masseAuMoulage} g` : '—'}
                  </span>
                )}

                {!isOverriding && (
                  <button
                    type="button"
                    className={styles.stackMasseBtn}
                    onClick={() => startOverride(couche.uid, masseAuMoulage)}
                    title="Surcharger la masse"
                  >
                    <Pencil size={10} strokeWidth={2} />
                  </button>
                )}

                {hasOverride && !isOverriding && (
                  <button
                    type="button"
                    className={styles.stackMasseBtn}
                    onClick={() => resetOverride(couche.uid)}
                    title="Réinitialiser"
                  >
                    <RotateCcw size={10} strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Stack indicator ────────────────────────────────────────────── */}
      {stackIndicator && (
        <div className={styles.prodStackIndicator}>
          <div className={styles.prodStackIndicatorLabel}>
            Stack : {stackIndicator.sommeMm} / {stackIndicator.hauteurMm} mm
          </div>
          <div className={styles.prodStackBar}>
            <div
              className={`${styles.prodStackBarFill}${stackIndicator.sommeMm > stackIndicator.hauteurMm ? ` ${styles.prodStackBarOver}` : ''}`}
              style={{ width: `${stackIndicator.pct}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Totaux ─────────────────────────────────────────────────────── */}
      {productionResult && (
        <div className={styles.prodTotals}>
          <div className={styles.prodTotalRow}>
            <span>Au moulage</span>
            <span className={styles.prodTotalVal}>{productionResult.masse_totale_au_moulage_g} g</span>
          </div>
          <div className={styles.prodTotalRow}>
            <span>À préparer (+{production.perte_production_pct}%)</span>
            <span className={styles.prodTotalVal}>{productionResult.masse_totale_a_preparer_g} g</span>
          </div>
        </div>
      )}

      {/* ── Warnings ───────────────────────────────────────────────────── */}
      {productionResult?.warnings?.length > 0 && (
        <div className={styles.prodWarnings}>
          <button
            className={styles.prodWarningsToggle}
            onClick={() => setShowWarnings(v => !v)}
          >
            {showWarnings ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {productionResult.warnings.length} avertissement{productionResult.warnings.length > 1 ? 's' : ''}
          </button>
          {showWarnings && productionResult.warnings.map((w, i) => (
            <div key={i} className={styles.prodWarning}>{w.message}</div>
          ))}
        </div>
      )}

      {/* ── Modal sélection moule ──────────────────────────────────────── */}
      {mouleModalOpen && (
        <ModalSelectionMoule
          allMoules={allMoules}
          selectedIds={production.moules.map(ms => ms.moule_id)}
          onSelect={moule => { addMoule(moule); setMouleModalOpen(false); }}
          onClose={() => setMouleModalOpen(false)}
        />
      )}
    </div>
  );
}

// ── Modal inline ──────────────────────────────────────────────────────────────

function ModalSelectionMoule({ allMoules, selectedIds, onSelect, onClose }) {
  const [filtre,    setFiltre]    = useState('');
  const [recherche, setRecherche] = useState('');

  const liste = useMemo(() => {
    let l = allMoules.filter(m => !selectedIds.includes(m.id));
    if (filtre === '_user')  l = l.filter(m => !m._preset);
    else if (filtre)         l = l.filter(m => m.type === filtre);
    if (recherche.trim()) {
      const q = recherche.toLowerCase();
      l = l.filter(m => m.nom.toLowerCase().includes(q));
    }
    return l;
  }, [allMoules, selectedIds, filtre, recherche]);

  return (
    <div
      className={styles.overlay}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Sélectionner un moule"
      >
        <div className={styles.modalHead}>
          <h2 className={styles.modalTitle}>Sélectionner un moule</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Fermer">
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div className={styles.modalFilters}>
          <div className={styles.modalChips}>
            {TYPE_FILTER_OPTIONS.map(f => (
              <button
                key={f.id}
                className={`chip${filtre === f.id ? ' active' : ''}`}
                onClick={() => setFiltre(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            className={styles.modalSearch}
            placeholder="Rechercher…"
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.modalList}>
          {liste.length === 0 ? (
            <div className={styles.modalEmpty}>Aucun moule disponible</div>
          ) : (
            liste.map(moule => (
              <div
                key={moule.id}
                className={styles.modalItem}
                onClick={() => onSelect(moule)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') onSelect(moule);
                }}
              >
                <div>
                  <div className={styles.modalItemNom}>{moule.nom}</div>
                  <div className={styles.modalItemSub}>{moule.volume_calcule_ml} mL</div>
                </div>
                <div className={styles.modalItemCat}>{moule.type}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

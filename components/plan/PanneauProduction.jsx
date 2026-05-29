'use client';

import { useState, useMemo } from 'react';
import {
  Plus, X, GripVertical, Pencil, RotateCcw,
  ChevronDown, ChevronUp, Star,
} from 'lucide-react';
import styles from '../../app/plan-de-travail/plan.module.css';

const ASSIGNATION_CYCLE  = { couche: 'habillage', habillage: 'libre', libre: 'couche' };
const ASSIGNATION_LABELS = { couche: 'Couche', habillage: 'Habillage', libre: 'Libre' };
const ASSIGNATION_STYLE  = {
  couche:    styles.stackAssignCouche,
  habillage: styles.stackAssignHabillage,
  libre:     styles.stackAssignLibre,
};

const TYPE_FILTER_OPTIONS = [
  { id: '',               label: 'Tous'       },
  { id: 'cercle',         label: 'Cercles'    },
  { id: 'cadre',          label: 'Cadres'     },
  { id: 'demi_sphere',    label: 'Demi-sph.'  },
  { id: 'moule_silicone', label: 'Silicone'   },
  { id: '_user',          label: 'Mes moules' },
];

export default function PanneauProduction({
  production, setProduction,
  montage, setMontage,
  allMoules,
  moulesMap,
  productionResult,
  composantsMap,
  barSegments = [],
  onNormalize,
}) {
  const [dragIdx,        setDragIdx]        = useState(null);
  const [overIdx,        setOverIdx]        = useState(null);
  const [overridingUid,  setOverridingUid]  = useState(null);
  const [overrideVal,    setOverrideVal]    = useState('');
  const [mouleModalOpen, setMouleModalOpen] = useState(false);
  const [showWarnings,   setShowWarnings]   = useState(false);

  const modePct = production.mode_calcul === 'par_pourcentage';

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

  // Pourcentage total pour l'indicateur
  const sommePct = useMemo(
    () => montage.couches.reduce((s, c) => s + (c.pourcentage ?? 0), 0),
    [montage.couches],
  );
  const pctOk    = Math.abs(sommePct - 100) <= 0.5;
  const pctEcart = Math.round((100 - sommePct) * 10) / 10;

  // ── Mode toggle ──────────────────────────────────────────────────────────

  function toggleMode() {
    setProduction(prev => ({
      ...prev,
      mode_calcul: prev.mode_calcul === 'par_couches' ? 'par_pourcentage' : 'par_couches',
    }));
  }

  // ── Moule operations ─────────────────────────────────────────────────────

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

  function setMouleRef(moule_id) {
    setProduction(prev => ({ ...prev, moule_reference_id: moule_id }));
  }

  function setPerte(val) {
    const n = parseFloat(val);
    setProduction(prev => ({
      ...prev,
      perte_production_pct: isNaN(n) ? 0 : Math.max(0, Math.min(100, n)),
    }));
  }

  // ── Stack operations ─────────────────────────────────────────────────────

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

  // ── Drag-and-drop ────────────────────────────────────────────────────────

  function handleDragStart(e, idx) { setDragIdx(idx); e.dataTransfer.effectAllowed = 'move'; }
  function handleDragOver(e, idx)  { e.preventDefault(); setOverIdx(idx); }
  function handleDrop(e, idx) {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      setMontage(prev => {
        const next    = [...prev.couches];
        const [moved] = next.splice(dragIdx, 1);
        next.splice(idx, 0, moved);
        return { ...prev, couches: next };
      });
    }
    setDragIdx(null); setOverIdx(null);
  }
  function handleDragEnd() { setDragIdx(null); setOverIdx(null); }

  if (montage.couches.length === 0) return null;

  const totalMoules = production.moules.reduce((s, ms) => s + (ms.quantite ?? 1), 0);

  return (
    <div className={styles.prodPanel}>

      {/* ── Mode toggle ────────────────────────────────────────────────── */}
      <div className={styles.prodModeToggle}>
        <button
          className={`${styles.prodModeBtn}${!modePct ? ` ${styles.prodModeBtnActive}` : ''}`}
          onClick={() => !modePct || toggleMode()}
        >
          Montage par couches
        </button>
        <button
          className={`${styles.prodModeBtn}${modePct ? ` ${styles.prodModeBtnActive}` : ''}`}
          onClick={() => modePct || toggleMode()}
        >
          Composition par %
        </button>
      </div>

      {/* ── Moules ─────────────────────────────────────────────────────── */}
      <div className={styles.prodSection}>
        <div className={styles.prodSectionTitle}>Moules</div>

        {production.moules.length === 0 ? (
          <p className={styles.prodEmptyMoules}>Aucun moule — ajoutez-en pour calculer les masses</p>
        ) : (
          production.moules.map(ms => {
            const moule   = moulesMap[ms.moule_id];
            if (!moule) return null;
            const vol     = productionResult?.moules?.find(m => m.id === ms.moule_id)?.volume_ml;
            const isRef   = production.moule_reference_id === ms.moule_id;
            return (
              <div key={ms.moule_id} className={styles.prodMouleRow}>
                <button
                  className={`${styles.prodMouleRefBtn}${isRef ? ` ${styles.prodMouleRefBtnActive}` : ''}`}
                  onClick={() => setMouleRef(ms.moule_id)}
                  title={isRef ? 'Moule de référence' : 'Définir comme moule de référence'}
                  aria-label="Moule de référence"
                >
                  <Star size={11} strokeWidth={isRef ? 0 : 2} fill={isRef ? 'currentColor' : 'none'} />
                </button>
                <div className={styles.prodMouleInfo}>
                  <div className={styles.prodMouleNom}>{moule.nom}</div>
                  {vol != null && (
                    <div className={styles.prodMouleVol}>
                      {vol} mL{isRef ? <span className={styles.prodMouleRefTag}> · réf.</span> : ''}
                    </div>
                  )}
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

      {/* ── Récap volumes (si moules sélectionnés) ─────────────────────── */}
      {productionResult && (
        <div className={styles.prodVolumeStats}>
          <div className={styles.prodVolumeRow}>
            <span className={styles.prodVolumeLabel}>Moule réf.</span>
            <span className={styles.prodVolumeVal}>{productionResult.volume_reference_ml} mL</span>
          </div>
          <div className={styles.prodVolumeRow}>
            <span className={styles.prodVolumeLabel}>Production totale</span>
            <span className={styles.prodVolumeVal}>
              {productionResult.volume_total_ml} mL
              <span className={styles.prodVolumeSub}> · {totalMoules} moule{totalMoules > 1 ? 's' : ''}</span>
            </span>
          </div>
        </div>
      )}

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

      {/* ═══════════════════════════════════════════════════════════════════
          Mode Composition par %
      ═══════════════════════════════════════════════════════════════════ */}
      {modePct && (
        <>
          {/* Barre empilée */}
          {barSegments.length > 0 && sommePct > 0 && (
            <div className={styles.stackedBarWrapper}>
              <div className={styles.stackedBar}>
                {barSegments.filter(s => s.pct > 0).map(seg => (
                  <div
                    key={seg.uid}
                    className={styles.stackedBarSeg}
                    style={{
                      width: `${Math.min(100, (seg.pct / Math.max(sommePct, 100)) * 100)}%`,
                      background: seg.color,
                    }}
                    title={`${seg.nom} — ${seg.pct} %`}
                  />
                ))}
              </div>
              <div className={styles.stackedBarLegend}>
                {barSegments.filter(s => s.pct > 0).map(seg => (
                  <span key={seg.uid} className={styles.stackedBarLegendItem}>
                    <span className={styles.stackedBarLegendDot} style={{ background: seg.color }} />
                    {seg.nom} {seg.pct} %
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Indicateur % total — visible uniquement si ko */}
          {pctOk ? (
            <div className={`${styles.pctSommaire} ${styles.pctSommaireOk}`}>
              <span className={styles.pctSommaireLabel}>
                Total : <strong>100 %</strong>
              </span>
              <button className={styles.pctNormalize} onClick={onNormalize}>
                Normaliser à 100 %
              </button>
            </div>
          ) : (
            <div className={`${styles.pctSommaire} ${styles.pctSommaireKo}`}>
              <span className={styles.pctSommaireLabel}>
                Total : <strong>{Math.round(sommePct * 10) / 10} %</strong>
                <span> — {pctEcart > 0 ? `il manque ${pctEcart} %` : `dépasse de ${Math.abs(pctEcart)} %`}</span>
              </span>
              <button className={styles.pctNormalize} onClick={onNormalize}>
                Normaliser à 100 %
              </button>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          Mode Montage par couches (stack manager)
      ═══════════════════════════════════════════════════════════════════ */}
      {!modePct && (
        <>
          <div className={styles.prodSection}>
            <div className={styles.prodSectionTitle}>Montage — bas → haut</div>

            {montage.couches.map((couche, idx) => {
              const computed       = composantsMap[couche.uid];
              const masseAuMoulage = computed?.masse_au_moulage_g;
              const hasOverride    = couche.masse_g_override != null;
              const isOverriding   = overridingUid === couche.uid;

              return (
                <div
                  key={couche.uid}
                  className={[
                    styles.stackItem,
                    dragIdx === idx                    ? styles.stackItemDragging : '',
                    overIdx === idx && dragIdx !== idx ? styles.stackItemOver     : '',
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

          {/* Stack indicator */}
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
        </>
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
      {productionResult?.warnings?.filter(w => w.code !== 'POURCENTAGES_HORS_100').length > 0 && (
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
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSelect(moule); }}
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

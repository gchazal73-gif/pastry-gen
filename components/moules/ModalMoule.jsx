'use client';

import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { computeMoldVolume } from '../../lib/moules.js';
import styles from '../../app/moules/moules.module.css';

const FORMES = [
  { id: 'cylindre',        label: 'Cercle / Cylindre',      desc: 'Entremets rond, cercle à tarte' },
  { id: 'parallelepipede', label: 'Cadre / Rectangulaire',  desc: 'Cadre pâtissier, moule carré' },
  { id: 'demi_sphere',     label: 'Demi-sphère',            desc: 'Insert bombé, décor' },
  { id: 'volume_custom',   label: 'Volume libre',           desc: 'Silicone — capacité fabricant en mL' },
];

const FORMAT_OPTIONS = [
  { id: 'entremets',    label: 'Entremets' },
  { id: 'tarte',        label: 'Tarte / fond' },
  { id: 'individuel',   label: 'Individuel' },
  { id: 'buche',        label: 'Bûche' },
  { id: 'petit_gateau', label: 'Petit gâteau' },
];

const DEFAULT_DIMS = {
  cylindre:        { diametre_cm: 18,  hauteur_cm: 4.5 },
  parallelepipede: { longueur_cm: 30,  largeur_cm: 40, hauteur_cm: 4.5 },
  demi_sphere:     { diametre_cm: 6 },
  volume_custom:   { volume_ml: 500 },
};

function deriveType(forme, format) {
  if (forme === 'parallelepipede') return 'cadre';
  if (forme === 'demi_sphere')     return 'demi_sphere';
  if (forme === 'volume_custom')   return 'moule_silicone';
  // cylindre
  if (format === 'tarte')          return 'tarte';
  return 'cercle';
}

function buildAutoNom(forme, dims) {
  switch (forme) {
    case 'cylindre':
      return `Cercle Ø ${dims.diametre_cm ?? '?'} cm × H ${dims.hauteur_cm ?? '?'} cm`;
    case 'parallelepipede':
      return `Cadre ${dims.longueur_cm ?? '?'} × ${dims.largeur_cm ?? '?'} × H ${dims.hauteur_cm ?? '?'} cm`;
    case 'demi_sphere':
      return `Demi-sphère Ø ${dims.diametre_cm ?? '?'} cm`;
    case 'volume_custom':
      return `Moule silicone ${dims.volume_ml ?? '?'} mL`;
    default:
      return '';
  }
}

export default function ModalMoule({ open, initial, onSave, onClose }) {
  const [forme,    setForme]    = useState('cylindre');
  const [format,   setFormat]   = useState('entremets');
  const [nom,      setNom]      = useState('');
  const [dims,     setDims]     = useState({ ...DEFAULT_DIMS.cylindre });
  const [estIndiv, setEstIndiv] = useState(false);
  const [notes,    setNotes]    = useState('');

  useEffect(() => {
    if (!open) return;
    if (initial) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForme(initial.forme  ?? 'cylindre');
      setFormat(initial.format ?? 'entremets');
      setNom(initial.nom ?? '');
      setDims({ ...(initial.dimensions ?? DEFAULT_DIMS[initial.forme ?? 'cylindre']) });
      setEstIndiv(initial.est_individuel ?? false);
      setNotes(initial.notes ?? '');
    } else {
      setForme('cylindre');
      setFormat('entremets');
      setNom('');
      setDims({ ...DEFAULT_DIMS.cylindre });
      setEstIndiv(false);
      setNotes('');
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function handleFormeChange(f) {
    setForme(f);
    setDims({ ...DEFAULT_DIMS[f] });
  }

  function setDim(key, strVal) {
    const n = parseFloat(strVal);
    setDims(prev => ({ ...prev, [key]: isNaN(n) ? '' : n }));
  }

  const volume = useMemo(() => {
    const d = dims;
    const hasVal = (...keys) => keys.every(k => d[k] && Number(d[k]) > 0);
    const ok = {
      cylindre:        hasVal('diametre_cm', 'hauteur_cm'),
      parallelepipede: hasVal('longueur_cm', 'largeur_cm', 'hauteur_cm'),
      demi_sphere:     hasVal('diametre_cm'),
      volume_custom:   hasVal('volume_ml'),
    }[forme];
    if (!ok) return null;
    const v = computeMoldVolume({ forme, dimensions: d });
    return isNaN(v) || v <= 0 ? null : Math.round(v);
  }, [forme, dims]);

  function handleSave() {
    const nomFinal = nom.trim() || buildAutoNom(forme, dims);
    onSave({
      id:   initial?.id ?? null,
      nom:  nomFinal,
      type: deriveType(forme, format),
      forme,
      dimensions: {
        diametre_cm: dims.diametre_cm ?? null,
        longueur_cm: dims.longueur_cm ?? null,
        largeur_cm:  dims.largeur_cm  ?? null,
        hauteur_cm:  dims.hauteur_cm  ?? null,
        volume_ml:   dims.volume_ml   ?? null,
      },
      volume_calcule_ml: volume ?? 0,
      format,
      est_individuel: estIndiv,
      notes,
    });
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={initial ? 'Modifier le moule' : 'Ajouter un moule'}>

        {/* En-tête */}
        <div className={styles.modalHead}>
          <h2 className={styles.modalTitle}>{initial ? 'Modifier le moule' : 'Ajouter un moule'}</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Fermer">
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Corps */}
        <div className={styles.modalBody}>

          {/* Forme */}
          <div>
            <label className={styles.fieldLabelSub} style={{ display: 'block', fontWeight: 500, color: 'var(--ink)', marginBottom: 8, fontSize: 13 }}>
              Forme
            </label>
            <div className={styles.formeGrid}>
              {FORMES.map(f => (
                <button
                  key={f.id}
                  type="button"
                  className={`${styles.formeBtn}${forme === f.id ? ` ${styles.formeBtnActive}` : ''}`}
                  onClick={() => handleFormeChange(f.id)}
                >
                  <span className={styles.formeBtnLabel}>{f.label}</span>
                  <span className={styles.formeBtnDesc}>{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions — cylindre */}
          {forme === 'cylindre' && (
            <div className={styles.dimsRow}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Diamètre (cm)</label>
                <input type="number" min={1} step={0.5} value={dims.diametre_cm ?? ''} onChange={e => setDim('diametre_cm', e.target.value)} />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Hauteur utile (cm)</label>
                <input type="number" min={0.5} step={0.5} value={dims.hauteur_cm ?? ''} onChange={e => setDim('hauteur_cm', e.target.value)} />
              </div>
            </div>
          )}

          {/* Dimensions — parallélépipède */}
          {forme === 'parallelepipede' && (
            <>
              <div className={styles.dimsRow}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Longueur (cm)</label>
                  <input type="number" min={1} step={1} value={dims.longueur_cm ?? ''} onChange={e => setDim('longueur_cm', e.target.value)} />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Largeur (cm)</label>
                  <input type="number" min={1} step={1} value={dims.largeur_cm ?? ''} onChange={e => setDim('largeur_cm', e.target.value)} />
                </div>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Hauteur utile (cm)</label>
                <input type="number" min={0.5} step={0.5} value={dims.hauteur_cm ?? ''} onChange={e => setDim('hauteur_cm', e.target.value)} />
              </div>
            </>
          )}

          {/* Dimensions — demi-sphère */}
          {forme === 'demi_sphere' && (
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Diamètre (cm)</label>
              <input type="number" min={1} step={0.5} value={dims.diametre_cm ?? ''} onChange={e => setDim('diametre_cm', e.target.value)} />
            </div>
          )}

          {/* Dimensions — volume libre */}
          {forme === 'volume_custom' && (
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Capacité fabricant (mL)</label>
              <input type="number" min={1} step={10} value={dims.volume_ml ?? ''} onChange={e => setDim('volume_ml', e.target.value)} />
            </div>
          )}

          {/* Volume live */}
          <div className={styles.volumePreview}>
            <span className={styles.volumePreviewLabel}>Volume calculé</span>
            <span className={styles.volumePreviewValue}>
              {volume != null ? `${volume} mL` : '—'}
            </span>
          </div>

          {/* Nom */}
          <div className="field" style={{ marginBottom: 0 }}>
            <label>
              Nom{' '}
              <span className={styles.fieldLabelSub}>(optionnel — auto si vide)</span>
            </label>
            <input
              type="text"
              placeholder={buildAutoNom(forme, dims)}
              value={nom}
              onChange={e => setNom(e.target.value)}
            />
          </div>

          {/* Format + Individuel */}
          <div className={styles.dimsRow} style={{ alignItems: 'end' }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Format</label>
              <select value={format} onChange={e => setFormat(e.target.value)}>
                {FORMAT_OPTIONS.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>
            <label className={styles.checkboxRow} style={{ paddingBottom: 10 }}>
              <input
                type="checkbox"
                checked={estIndiv}
                onChange={e => setEstIndiv(e.target.checked)}
              />
              Individuel
            </label>
          </div>

          {/* Notes */}
          <div className="field" style={{ marginBottom: 0 }}>
            <label>
              Notes{' '}
              <span className={styles.fieldLabelSub}>(optionnel)</span>
            </label>
            <input
              type="text"
              placeholder="Référence fabricant, capacité officielle…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Pied */}
        <div className={styles.modalFoot}>
          <button className="secondary" onClick={onClose}>Annuler</button>
          <button
            className="primary"
            style={{ width: 'auto', paddingLeft: 20, paddingRight: 20 }}
            onClick={handleSave}
            disabled={volume == null}
          >
            {initial ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}

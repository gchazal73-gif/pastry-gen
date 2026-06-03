'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { MOULES_PRESETS, computeMoldVolume } from '../../lib/moules.js';
import ModalMoule from '../../components/moules/ModalMoule.jsx';
import styles from './moules.module.css';

const STORAGE_KEY = 'moules-user';

const TYPE_FILTERS = [
  { id: '',              label: 'Tous'         },
  { id: 'cercle',        label: 'Cercles'      },
  { id: 'cadre',         label: 'Cadres'       },
  { id: 'demi_sphere',   label: 'Demi-sphères' },
  { id: 'moule_silicone', label: 'Silicone'    },
  { id: '_silikomart',   label: 'Silikomart'   },
  { id: '_user',         label: 'Mes moules'   },
];

const FORMAT_LABELS = {
  entremets:    'Entremets',
  tarte:        'Tarte',
  individuel:   'Individuel',
  buche:        'Bûche',
  petit_gateau: 'Petit gâteau',
};

function genId(nom) {
  return `user-${nom.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`;
}

export default function MoulesPage() {
  const [userMoules,    setUserMoules]    = useState([]);
  const [hydrated,      setHydrated]      = useState(false);
  const [filtreType,    setFiltreType]    = useState('');
  const [recherche,     setRecherche]     = useState('');
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editingMoule,  setEditingMoule]  = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setUserMoules(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userMoules));
  }, [userMoules, hydrated]);

  const tousLesMoules = useMemo(() => [
    ...MOULES_PRESETS.map(m => ({ ...m, _preset: true })),
    ...userMoules.map(m => ({ ...m, _preset: false })),
  ], [userMoules]);

  const moulesFiltres = useMemo(() => {
    let list = tousLesMoules;
    if      (filtreType === '_user')       list = list.filter(m => !m._preset);
    else if (filtreType === '_silikomart') list = list.filter(m => m.marque === 'Silikomart');
    else if (filtreType)                   list = list.filter(m => m.type === filtreType);
    if (recherche.trim()) {
      const q = recherche.toLowerCase();
      list = list.filter(m =>
        m.nom.toLowerCase().includes(q) ||
        (m.notes ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [tousLesMoules, filtreType, recherche]);

  const saveMoule = useCallback((moule) => {
    const isUpdate = userMoules.some(m => m.id === moule.id);
    if (isUpdate) {
      setUserMoules(prev => prev.map(m => m.id === moule.id ? moule : m));
    } else {
      setUserMoules(prev => [...prev, { ...moule, id: moule.id || genId(moule.nom) }]);
    }
  }, [userMoules]);

  const deleteMoule = useCallback((id) => {
    if (window.confirm('Supprimer ce moule de votre bibliothèque ?')) {
      setUserMoules(prev => prev.filter(m => m.id !== id));
    }
  }, []);

  function openNew()         { setEditingMoule(null);  setModalOpen(true); }
  function openEdit(moule)   { setEditingMoule(moule); setModalOpen(true); }

  return (
    <div className={styles.page}>

      {/* En-tête */}
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Moules</h1>
          <p className="page-subtitle">
            {moulesFiltres.length} moule{moulesFiltres.length !== 1 ? 's' : ''}
            {userMoules.length > 0 && ` · ${userMoules.length} personnalisé${userMoules.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          className="primary"
          style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={openNew}
        >
          <Plus size={16} strokeWidth={2.5} />
          Ajouter un moule
        </button>
      </div>

      {/* Filtres */}
      <div className={styles.filterBar}>
        <div className={styles.chips}>
          {TYPE_FILTERS.map(f => (
            <button
              key={f.id}
              className={`chip${filtreType === f.id ? ' active' : ''}`}
              onClick={() => setFiltreType(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Rechercher…"
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
        />
      </div>

      {/* Grille */}
      {moulesFiltres.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⭕</div>
          <p className={styles.emptyText}>Aucun moule ne correspond à la recherche.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {moulesFiltres.map(moule => (
            <MouleCard
              key={moule.id}
              moule={moule}
              onEdit={() => openEdit(moule)}
              onDelete={() => deleteMoule(moule.id)}
              formatLabels={FORMAT_LABELS}
            />
          ))}
          <button className={styles.addTile} onClick={openNew}>
            <Plus size={20} strokeWidth={1.5} />
            <span>Nouveau moule</span>
          </button>
        </div>
      )}

      <ModalMoule
        open={modalOpen}
        initial={editingMoule}
        onSave={saveMoule}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

// ── Carte moule ───────────────────────────────────────────────────────────────

function MouleCard({ moule, onEdit, onDelete, formatLabels }) {
  const vol    = Math.round(computeMoldVolume(moule));
  const dimStr = getDimStr(moule);

  return (
    <div className={`${styles.card}${moule._preset ? '' : ` ${styles.cardUser}`}`}>
      <div className={styles.cardShape}>
        <ShapeIcon forme={moule.forme} />
      </div>
      <div>
        <div className={styles.cardNom}>{moule.nom}</div>
        {dimStr && <div className={styles.cardDim}>{dimStr}</div>}
        {moule.notes && <div className={styles.cardNotes}>{moule.notes}</div>}
        <div className={styles.cardFooter}>
          <span className={styles.cardVol}>{vol} mL</span>
          {moule.format && moule.format !== 'entremets' && (
            <span className={styles.cardBadge}>{formatLabels[moule.format] ?? moule.format}</span>
          )}
          {moule.est_individuel && <span className={styles.cardBadgeInd}>individuel</span>}
          {moule.marque && <span className={styles.cardBadge}>{moule.marque}</span>}
        </div>
        <Link href="/plan-de-travail" className={styles.cardUsePlan}>
          Utiliser dans le plan →
        </Link>
      </div>
      {!moule._preset && (
        <div className={styles.cardActions}>
          <button className={styles.cardBtn} onClick={onEdit} aria-label="Modifier">
            <Edit2 size={12} strokeWidth={2} />
          </button>
          <button
            className={`${styles.cardBtn} ${styles.cardBtnDanger}`}
            onClick={onDelete}
            aria-label="Supprimer"
          >
            <Trash2 size={12} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}

const SVG_PROPS = {
  width: 40, height: 40, viewBox: '0 0 40 40', fill: 'none',
  stroke: 'currentColor', strokeWidth: '1.5',
  strokeLinecap: 'round', strokeLinejoin: 'round',
  'aria-hidden': true,
};

function ShapeIcon({ forme }) {
  if (forme === 'cylindre') return (
    <svg {...SVG_PROPS}>
      {/* top ellipse */}
      <ellipse cx="20" cy="12" rx="12" ry="4" />
      {/* sides + curved base */}
      <path d="M8 12v17c0 3 5.4 5 12 5s12-2 12-5V12" />
    </svg>
  );

  if (forme === 'parallelepipede') return (
    <svg {...SVG_PROPS}>
      {/* front face */}
      <rect x="5" y="19" width="21" height="16" rx="1" />
      {/* top face (perspective) */}
      <path d="M5 19l8-9h22l-8 9z" />
      {/* right face (perspective) */}
      <path d="M26 19l8-9v16l-8 9" />
    </svg>
  );

  if (forme === 'demi_sphere') return (
    <svg {...SVG_PROPS}>
      {/* dome arc */}
      <path d="M8 26a12 12 0 0 1 24 0" />
      {/* base ellipse */}
      <ellipse cx="20" cy="26" rx="12" ry="3.5" />
    </svg>
  );

  /* volume_custom — moule silicone ondulé */
  return (
    <svg {...SVG_PROPS}>
      {/* wavy opening */}
      <path d="M8 19 C11 13 14 13 17 19 C20 25 23 25 26 19 C29 13 32 13 32 19" />
      {/* body sides + base */}
      <path d="M8 19 L8 31 Q8 33 10 33 L30 33 Q32 33 32 31 L32 19" />
    </svg>
  );
}

function getDimStr(moule) {
  const d = moule.dimensions;
  if (!d) return '';
  switch (moule.forme) {
    case 'cylindre':        return `Ø ${d.diametre_cm} × H ${d.hauteur_cm} cm`;
    case 'parallelepipede': return `${d.longueur_cm} × ${d.largeur_cm} × H ${d.hauteur_cm} cm`;
    case 'demi_sphere':     return `Ø ${d.diametre_cm} cm`;
    case 'volume_custom':   return d.volume_ml ? `${d.volume_ml} mL (fabricant)` : '';
    default:                return '';
  }
}

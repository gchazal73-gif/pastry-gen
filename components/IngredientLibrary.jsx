'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchIngredients } from '@/lib/ingredient-store.js';

const FAMILLE_LABELS = {
  aromates_epices:        'Aromates & Épices',
  Chocolats:              'Chocolats',
  chocolats_couvertures:  'Chocolats',
  emulsifiants:           'Émulsifiants',
  farines_amidons:        'Farines & Amidons',
  Fruits_frais:           'Fruits frais',
  fruits_frais:           'Fruits frais',
  gelifiants:             'Gélifiants',
  matieres_grasses:       'Matières grasses',
  oeufs:                  'Œufs',
  Oleagineux:             'Oléagineux',
  oleagineux:             'Oléagineux',
  produits_laitiers:      'Produits laitiers',
  Purees:                 'Purées',
  purees_fruits:          'Purées',
  sucres:                 'Sucres',
};

function MacroChip({ label, value, unit }) {
  if (value == null) return null;
  return (
    <div className="macro-chip">
      <span>{label}</span>
      <strong>{value}{unit}</strong>
    </div>
  );
}

function IngredientDetail({ ing, onClose }) {
  const macros = [
    ['Eau',      ing.eau_g,      'g'],
    ['Glucides', ing.glucides_g, 'g'],
    ['Sucres',   ing.sucres_g,   'g'],
    ['Lipides',  ing.lipides_g,  'g'],
    ['Protides', ing.protides_g, 'g'],
    ['Fibres',   ing.fibres_g,   'g'],
  ];
  const fonctionnel = [
    ['pH',      ing.ph,                  ''],
    ['POD',     ing.pod,                 ''],
    ['PAC',     ing.pac,                 ''],
    ['Pectine', ing.pectine_naturelle_g, 'g'],
  ];

  return (
    <div className="ing-detail">
      <div className="ing-detail-header">
        <div>
          <h3 style={{ margin: '0 0 2px', fontSize: 18, fontWeight: 600 }}>{ing.nom_fr}</h3>
          {ing.nom_en && <div className="sub">{ing.nom_en}</div>}
        </div>
        <button className="secondary" onClick={onClose} style={{ padding: '6px 10px' }}>✕</button>
      </div>

      <div className="ing-detail-meta">
        <span className="badge">{FAMILLE_LABELS[ing.famille] ?? ing.famille}</span>
        {ing.source_donnees && (
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Source : {ing.source_donnees}</span>
        )}
      </div>

      {ing.notes && (
        <div className="note" style={{ margin: '12px 0', fontSize: 12 }}>{ing.notes}</div>
      )}

      <h4>Composition pour 100 g</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {macros.map(([lbl, val, unit]) => <MacroChip key={lbl} label={lbl} value={val} unit={unit} />)}
      </div>

      {fonctionnel.some(([, v]) => v != null) && (
        <>
          <h4>Données fonctionnelles</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {fonctionnel.map(([lbl, val, unit]) => <MacroChip key={lbl} label={lbl} value={val} unit={unit} />)}
          </div>
        </>
      )}
    </div>
  );
}

function IngredientCard({ ing, onClick }) {
  return (
    <div className="ing-card" onClick={() => onClick(ing)} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(ing)}>
      <div className="ing-card-nom">{ing.nom_fr}</div>
      <div className="ing-card-sub">{FAMILLE_LABELS[ing.famille] ?? ing.famille}</div>
      {ing.source_donnees && (
        <div className="ing-card-source">{ing.source_donnees}</div>
      )}
    </div>
  );
}

export default function IngredientLibrary() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [famFilters, setFamFilters]   = useState([]);
  const [selected, setSelected]       = useState(null);
  const [viewMode, setViewMode]       = useState('grid');
  const [erreur, setErreur]           = useState(false);

  useEffect(() => {
    fetchIngredients()
      .then(setIngredients)
      .catch(err => { console.error(err); setErreur(true); })
      .finally(() => setLoading(false));
  }, []);

  // Les données sont locales (lib/ingredients-db.js) : la bibliothèque est
  // toujours peuplée, seul un échec de chargement reste à signaler.
  function sousTitre() {
    if (loading) return 'Chargement…';
    if (erreur) return 'La bibliothèque n’a pas pu être chargée';
    return `${ingredients.length} ingrédients · données CIQUAL / Bordas`;
  }

  function toggleFam(fam) {
    setFamFilters(prev => prev.includes(fam) ? prev.filter(f => f !== fam) : [...prev, fam]);
  }

  const familles = useMemo(() => [...new Set(ingredients.map(i => i.famille))].sort(), [ingredients]);

  const filtered = useMemo(() => {
    let list = ingredients;
    if (famFilters.length > 0) list = list.filter(i => famFilters.includes(i.famille));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.nom_fr?.toLowerCase().includes(q) || i.nom_en?.toLowerCase().includes(q));
    }
    return list;
  }, [ingredients, famFilters, search]);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Bibliothèque d&apos;ingrédients</h1>
        <p className="page-subtitle">{sousTitre()}</p>
      </div>

      <div className="lib-toolbar">
        <input
          type="text"
          className="lib-search"
          placeholder="Rechercher par nom…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="lib-view-toggle">
          <button className={viewMode === 'grid'  ? 'active' : ''} onClick={() => setViewMode('grid')}  title="Vue cartes">⊞</button>
          <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')} title="Vue tableau">☰</button>
        </div>
      </div>

      {familles.length > 0 && (
        <div className="lib-chips">
          {familles.map(fam => (
            <button
              key={fam}
              className={`chip${famFilters.includes(fam) ? ' active' : ''}`}
              onClick={() => toggleFam(fam)}
            >
              {FAMILLE_LABELS[fam] ?? fam}
            </button>
          ))}
        </div>
      )}

      <div className={`lib-layout${selected ? ' with-detail' : ''}`}>
        <div className="lib-list">
          {viewMode === 'grid' ? (
            <div className="ing-grid">
              {filtered.map(ing => (
                <IngredientCard key={ing.id} ing={ing} onClick={setSelected} />
              ))}
              {!loading && filtered.length === 0 && (
                <p style={{ color: 'var(--muted)', padding: '24px 0' }}>Aucun ingrédient correspondant.</p>
              )}
            </div>
          ) : (
            <table className="ing-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Famille</th>
                  <th style={{ textAlign: 'right' }}>Eau</th>
                  <th style={{ textAlign: 'right' }}>Glucides</th>
                  <th style={{ textAlign: 'right' }}>Lipides</th>
                  <th style={{ textAlign: 'right' }}>Protides</th>
                  <th style={{ textAlign: 'right' }}>POD</th>
                  <th style={{ textAlign: 'right' }}>PAC</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ing => (
                  <tr key={ing.id} className="ing-row" onClick={() => setSelected(ing)}>
                    <td>{ing.nom_fr}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{FAMILLE_LABELS[ing.famille] ?? ing.famille}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{ing.eau_g      ?? '–'}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{ing.glucides_g ?? '–'}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{ing.lipides_g  ?? '–'}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{ing.protides_g ?? '–'}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{ing.pod        ?? '–'}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{ing.pac        ?? '–'}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 11 }}>{ing.source_donnees ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <IngredientDetail ing={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  );
}

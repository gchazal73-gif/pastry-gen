'use client';

import { useState, useEffect, useMemo } from 'react';
import { Download, RotateCcw, Pencil } from 'lucide-react';
import { INGREDIENTS_METIER } from '../../lib/ingredients-metier.js';
import { getOverrides, setOverride, clearOverride } from '../../lib/mercuriale-store.js';
import styles from './mercuriale.module.css';

const SEUIL_OBSOLETE_JOURS = 180;

const FOURNISSEURS = ['Metro', 'Valrhona', 'Capfruit', 'Sevarome', 'Louis François'];

function getDaysOld(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function statusOf(entry) {
  if (entry.prix_eur_par_g == null) return 'none';
  const age = getDaysOld(entry.date_maj_prix);
  if (age === null || age > SEUIL_OBSOLETE_JOURS) return 'obsolete';
  return 'ok';
}

function exportCSV(rows) {
  const header = 'nom,fournisseur,prix_unitaire_eur,unite_prix,prix_eur_par_g,date_maj_prix';
  const lines = rows.map(([nom, m]) =>
    [nom, m.fournisseur ?? '', m.prix_unitaire_eur ?? '', m.unite_prix ?? '',
     m.prix_eur_par_g ?? '', m.date_maj_prix ?? '']
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  const csv = [header, ...lines].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'mercuriale.csv' });
  a.click();
  URL.revokeObjectURL(url);
}

export default function MercurialePage() {
  const [overrides,      setOverridesState]  = useState({});
  const [editingNom,     setEditingNom]       = useState(null);
  const [editValues,     setEditValues]       = useState({});
  const [filtreSupplier, setFiltreSupplier]   = useState('');
  const [filtreObsolete, setFiltreObsolete]   = useState(false);
  const [recherche,      setRecherche]        = useState('');

  // Charge les overrides depuis localStorage
  useEffect(() => { setOverridesState(getOverrides()); }, []);

  // Vue fusionnée (INGREDIENTS_METIER + overrides state — pas de localStorage direct)
  const mergedEntries = useMemo(() => {
    const result = {};
    for (const [nom, base] of Object.entries(INGREDIENTS_METIER)) {
      const ov = overrides[nom];
      result[nom] = ov ? { ...base, ...ov } : base;
    }
    return result;
  }, [overrides]);

  // Compteurs d'en-tête
  const nbTotal    = Object.keys(mergedEntries).length;
  const nbObsolete = useMemo(
    () => Object.values(mergedEntries).filter(e => statusOf(e) === 'obsolete').length,
    [mergedEntries],
  );

  // Liste filtrée
  const lignesFiltrees = useMemo(() => {
    let rows = Object.entries(mergedEntries);
    if (filtreSupplier === '_aucun') {
      rows = rows.filter(([, m]) => !m.fournisseur);
    } else if (filtreSupplier) {
      rows = rows.filter(([, m]) => m.fournisseur === filtreSupplier);
    }
    if (filtreObsolete) rows = rows.filter(([, m]) => statusOf(m) === 'obsolete');
    if (recherche.trim()) {
      const q = recherche.toLowerCase();
      rows = rows.filter(([nom]) => nom.toLowerCase().includes(q));
    }
    return rows;
  }, [mergedEntries, filtreSupplier, filtreObsolete, recherche]);

  // ── Édition inline ───────────────────────────────────────────────────────

  function startEdit(nom, entry) {
    setEditingNom(nom);
    setEditValues({
      prix_unitaire_eur: entry.prix_unitaire_eur ?? '',
      unite_prix:        entry.unite_prix ?? '',
      prix_eur_par_g:    entry.prix_eur_par_g ?? '',
      fournisseur:       entry.fournisseur ?? '',
    });
  }

  function cancelEdit() { setEditingNom(null); setEditValues({}); }

  function saveEdit() {
    const data = {
      prix_unitaire_eur: editValues.prix_unitaire_eur !== '' ? parseFloat(editValues.prix_unitaire_eur) : null,
      unite_prix:        editValues.unite_prix || null,
      prix_eur_par_g:    editValues.prix_eur_par_g !== '' ? parseFloat(editValues.prix_eur_par_g) : null,
      fournisseur:       editValues.fournisseur || null,
      date_maj_prix:     new Date().toISOString().slice(0, 10),
    };
    setOverride(editingNom, data);
    setOverridesState(getOverrides());
    setEditingNom(null);
  }

  function handleReset(nom) {
    clearOverride(nom);
    setOverridesState(getOverrides());
    if (editingNom === nom) setEditingNom(null);
  }

  // ── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>

      {/* En-tête */}
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Mercuriale</h1>
          <p className="page-subtitle">
            {nbTotal} ingrédients · {nbObsolete} prix obsolètes ({'>'}6 mois)
          </p>
        </div>
        <button
          className="secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, width: 'auto' }}
          onClick={() => exportCSV(lignesFiltrees)}
        >
          <Download size={14} strokeWidth={2} />
          Exporter CSV
        </button>
      </div>

      {/* Filtres */}
      <div className={styles.filterBar}>
        <div className={styles.chips}>
          <button
            className={`chip${filtreSupplier === '' ? ' active' : ''}`}
            onClick={() => setFiltreSupplier('')}
          >Tous</button>
          {FOURNISSEURS.map(f => (
            <button
              key={f}
              className={`chip${filtreSupplier === f ? ' active' : ''}`}
              onClick={() => setFiltreSupplier(filtreSupplier === f ? '' : f)}
            >{f}</button>
          ))}
          <button
            className={`chip${filtreSupplier === '_aucun' ? ' active' : ''}`}
            onClick={() => setFiltreSupplier(filtreSupplier === '_aucun' ? '' : '_aucun')}
          >Sans fournisseur</button>
        </div>
        <div className={styles.filterRight}>
          <label className={styles.toggleObsolete}>
            <input
              type="checkbox"
              checked={filtreObsolete}
              onChange={e => setFiltreObsolete(e.target.checked)}
            />
            Prix obsolètes seulement
          </label>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Rechercher…"
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
          />
        </div>
      </div>

      {/* Tableau */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Ingrédient</th>
              <th className={styles.th}>Fournisseur</th>
              <th className={styles.th} style={{ textAlign: 'right' }}>Prix unitaire</th>
              <th className={styles.th}>Unité</th>
              <th className={styles.th} style={{ textAlign: 'right' }}>€ / g</th>
              <th className={styles.th}>Dernière MAJ</th>
              <th className={styles.th}>Statut</th>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {lignesFiltrees.map(([nom, entry]) => {
              const isEditing  = editingNom === nom;
              const hasOverride = !!overrides[nom];
              const status     = statusOf(entry);
              const daysOld    = getDaysOld(entry.date_maj_prix);

              return (
                <tr
                  key={nom}
                  className={[
                    styles.tr,
                    isEditing ? styles.trEditing : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => !isEditing && startEdit(nom, entry)}
                >
                  {/* Ingrédient */}
                  <td className={styles.td}>
                    <span className={styles.nomCell}>
                      {nom}
                      {hasOverride && (
                        <Pencil size={10} strokeWidth={2} className={styles.editedIcon} title="Modifié localement" />
                      )}
                    </span>
                  </td>

                  {/* Fournisseur */}
                  <td className={styles.td}>
                    {isEditing ? (
                      <input
                        className={styles.inputEdit}
                        value={editValues.fournisseur}
                        placeholder="ex. Metro"
                        onClick={e => e.stopPropagation()}
                        onChange={e => setEditValues(p => ({ ...p, fournisseur: e.target.value }))}
                      />
                    ) : (
                      <span className={styles.muted}>{entry.fournisseur ?? '—'}</span>
                    )}
                  </td>

                  {/* Prix unitaire */}
                  <td className={styles.td} style={{ textAlign: 'right' }}>
                    {isEditing ? (
                      <input
                        className={`${styles.inputEdit} ${styles.inputNum}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={editValues.prix_unitaire_eur}
                        placeholder="0.00"
                        onClick={e => e.stopPropagation()}
                        onChange={e => setEditValues(p => ({ ...p, prix_unitaire_eur: e.target.value }))}
                      />
                    ) : (
                      entry.prix_unitaire_eur != null
                        ? `${Number(entry.prix_unitaire_eur).toFixed(2)} €`
                        : <span className={styles.muted}>—</span>
                    )}
                  </td>

                  {/* Unité */}
                  <td className={styles.td}>
                    {isEditing ? (
                      <input
                        className={styles.inputEdit}
                        value={editValues.unite_prix}
                        placeholder="ex. kg"
                        onClick={e => e.stopPropagation()}
                        onChange={e => setEditValues(p => ({ ...p, unite_prix: e.target.value }))}
                        style={{ width: 60 }}
                      />
                    ) : (
                      <span className={styles.muted}>{entry.unite_prix ?? '—'}</span>
                    )}
                  </td>

                  {/* Prix/g */}
                  <td className={styles.td} style={{ textAlign: 'right' }}>
                    {isEditing ? (
                      <input
                        className={`${styles.inputEdit} ${styles.inputNum}`}
                        type="number"
                        step="0.0001"
                        min="0"
                        value={editValues.prix_eur_par_g}
                        placeholder="0.0000"
                        onClick={e => e.stopPropagation()}
                        onChange={e => setEditValues(p => ({ ...p, prix_eur_par_g: e.target.value }))}
                      />
                    ) : (
                      entry.prix_eur_par_g != null
                        ? entry.prix_eur_par_g.toFixed(4)
                        : <span className={styles.muted}>—</span>
                    )}
                  </td>

                  {/* Dernière MAJ */}
                  <td className={styles.td}>
                    <span className={styles.muted}>
                      {entry.date_maj_prix
                        ? `${entry.date_maj_prix}${daysOld !== null ? ` (${daysOld} j)` : ''}`
                        : '—'}
                    </span>
                  </td>

                  {/* Statut */}
                  <td className={styles.td}>
                    {status === 'ok'       && <span className={`${styles.badge} ${styles.badgeOk}`}>À jour</span>}
                    {status === 'obsolete' && <span className={`${styles.badge} ${styles.badgeObsolete}`}>Obsolète</span>}
                    {status === 'none'     && <span className={`${styles.badge} ${styles.badgeNone}`}>Pas de prix</span>}
                  </td>

                  {/* Actions */}
                  <td className={styles.td} onClick={e => e.stopPropagation()}>
                    {isEditing ? (
                      <div className={styles.actionRow}>
                        <button className={styles.btnSave} onClick={saveEdit}>Enregistrer</button>
                        <button className={styles.btnCancel} onClick={cancelEdit}>Annuler</button>
                      </div>
                    ) : (
                      hasOverride && (
                        <button
                          className={styles.btnReset}
                          onClick={() => handleReset(nom)}
                          title="Réinitialiser au prix source"
                        >
                          <RotateCcw size={11} strokeWidth={2} />
                          Réinitialiser
                        </button>
                      )
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {lignesFiltrees.length === 0 && (
          <div className={styles.empty}>
            <p>Aucun ingrédient ne correspond aux filtres.</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import LightboxFiche from './LightboxFiche';
import { LABELS_INDICATEURS } from '@/lib/fourchettes.js';

/* ── Helpers ────────────────────────────────────────────────────────────── */

function fmtG(g) {
  if (g == null) return '—';
  if (g >= 100) return `${g.toFixed(0)} g`;
  if (g >= 10)  return `${g.toFixed(1)} g`;
  return `${g.toFixed(2)} g`;
}

function fmtInd(key, v) {
  if (v == null) return '—';
  const { unite } = LABELS_INDICATEURS[key] ?? { unite: '' };
  return `${v < 10 ? v.toFixed(2) : v.toFixed(1)}${unite}`;
}

/* ── Bandeau indicateurs ─────────────────────────────────────────────────── */

function BandeauIndicateurs({ diffIndicateurs, nbCols, colonnes }) {
  const cles = Object.keys(diffIndicateurs).filter(k =>
    diffIndicateurs[k].valeurs.some(v => v !== null)
  );
  if (cles.length === 0) return null;

  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--line)',
      borderRadius: 10, padding: '12px 16px', marginBottom: 16,
      overflowX: 'auto',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', color: 'var(--muted)', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              fontSize: 10, paddingBottom: 6, paddingRight: 16 }}>
              Indicateur
            </th>
            {colonnes.map((col, i) => (
              <th key={i} style={{ textAlign: 'right', fontSize: 11, color: 'var(--ink)',
                fontWeight: 600, paddingBottom: 6, minWidth: 64, paddingLeft: 8 }}>
                {col.params.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cles.map(key => {
            const d = diffIndicateurs[key];
            const { label } = LABELS_INDICATEURS[key] ?? { label: key };
            return (
              <tr key={key}>
                <td style={{ color: 'var(--muted)', paddingRight: 16, paddingBottom: 3,
                  fontSize: 11, whiteSpace: 'nowrap' }}>
                  {label}
                </td>
                {d.valeurs.map((v, i) => {
                  const isMin = d.estDiff && v !== null && v === d.min && d.min !== d.max;
                  const isMax = d.estDiff && v !== null && v === d.max && d.min !== d.max;
                  return (
                    <td key={i} style={{
                      textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                      fontWeight: d.estDiff ? 600 : 400, paddingLeft: 8, paddingBottom: 3,
                      color: isMin ? 'var(--ok)' : isMax ? 'var(--warn)' : 'var(--ink)',
                    }}>
                      {fmtInd(key, v)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Colonne recette compacte ─────────────────────────────────────────────── */

function ColonneCompacte({ colonne, lignesUnifiees, colIdx, onChoisir, onDetail }) {
  const { params, recette, fourchettes } = colonne;
  const nbHors = fourchettes.filter(f => f.statut === 'hors').length;
  const nbAttn = fourchettes.filter(f => f.statut === 'attention').length;
  const statutColor = nbHors > 0 ? 'var(--bad)' : nbAttn > 0 ? 'var(--warn)' : 'var(--ok)';
  const statutLabel = nbHors > 0 ? `${nbHors} hors fourchette`
    : nbAttn > 0 ? `${nbAttn} à vérifier` : '✓ Équilibré';

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10,
      display: 'flex', flexDirection: 'column', minWidth: 0,
    }}>
      {/* En-tête */}
      <div style={{
        padding: '12px 14px 10px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--bg)', borderRadius: '10px 10px 0 0',
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{params.label}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          {recette.texture}{recette.parfum ? ` · ${recette.parfum}` : ''}
        </div>
        {fourchettes.length > 0 && (
          <div style={{ fontSize: 10, color: statutColor, fontWeight: 600, marginTop: 4 }}>
            {statutLabel}
          </div>
        )}
      </div>

      {/* Tableau compact */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 380 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              {['Ingrédient', '%', 'g'].map((h, i) => (
                <th key={h} style={{
                  textAlign: i === 0 ? 'left' : 'right',
                  padding: i === 0 ? '5px 10px' : i === 2 ? '5px 10px 5px 4px' : '5px 6px',
                  fontSize: 10, color: 'var(--muted)', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  borderBottom: '1px solid var(--line)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignesUnifiees.map((lu, idx) => {
              const v = lu.parColonne[colIdx];
              const absent = v === null;
              const autresPresents = lu.parColonne.filter((x, i) => i !== colIdx && x !== null);
              const diffPct = !absent && lu.estDiff && autresPresents.length > 0
                ? v.pct - autresPresents[0].pct
                : null;

              return (
                <tr key={idx} style={{
                  background: absent ? 'var(--bg)'
                    : lu.estDiff ? 'rgba(139,90,60,0.04)' : 'transparent',
                  opacity: absent ? 0.5 : 1,
                }}>
                  <td style={{ padding: '6px 10px', fontSize: 12,
                    borderBottom: '1px solid var(--line)',
                    color: absent ? 'var(--muted)' : 'var(--ink)' }}>
                    {absent
                      ? <em style={{ fontSize: 11 }}>— absent —</em>
                      : v.ingredient}
                  </td>
                  <td style={{
                    padding: '6px 6px', textAlign: 'right',
                    borderBottom: '1px solid var(--line)',
                    fontWeight: lu.estDiff && !absent ? 600 : 400,
                    color: lu.estDiff && !absent ? 'var(--accent)' : 'var(--muted)',
                    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', fontSize: 12,
                  }}>
                    {absent ? '—' : (
                      <>
                        {v.pct.toFixed(1)} %
                        {diffPct !== null && Math.abs(diffPct) >= 0.1 && (
                          <sup style={{
                            fontSize: 8,
                            color: diffPct > 0 ? 'var(--ok)' : 'var(--bad)',
                            marginLeft: 2,
                          }}>
                            {diffPct > 0 ? '+' : ''}{diffPct.toFixed(1)}
                          </sup>
                        )}
                      </>
                    )}
                  </td>
                  <td style={{ padding: '6px 10px 6px 4px', textAlign: 'right',
                    borderBottom: '1px solid var(--line)',
                    color: absent ? 'var(--muted)' : 'var(--ink)',
                    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', fontSize: 12 }}>
                    {absent ? '—' : fmtG(v.g)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
        <button className="secondary" style={{ flex: 1, fontSize: 12 }}
          onClick={() => onDetail(colonne)}>
          Détail ⤢
        </button>
        <button className="primary"
          style={{ flex: 1, margin: 0, fontSize: 12, padding: '8px 10px' }}
          onClick={() => onChoisir(colonne)}>
          Choisir ↩
        </button>
      </div>
    </div>
  );
}

/* ── Composant principal ─────────────────────────────────────────────────── */

/**
 * @param {{
 *   comparaison: { colonnes, diff }  — résultat de genererComparaison()
 *   onChoisir:   (colonne) => void   — sélectionne une recette et ferme la grille
 * }}
 */
export default function GrilleComparaison({ comparaison, onChoisir }) {
  const [lightboxRecette, setLightboxRecette] = useState(null);

  if (!comparaison) return null;

  const { colonnes, diff } = comparaison;
  const nbCols = colonnes.length;
  const colMinWidth = nbCols >= 4 ? 230 : 300;

  return (
    <div>
      <BandeauIndicateurs
        diffIndicateurs={diff.indicateurs}
        nbCols={nbCols}
        colonnes={colonnes}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${nbCols}, minmax(${colMinWidth}px, 1fr))`,
        gap: 14,
        overflowX: 'auto',
      }}>
        {colonnes.map((col, i) => (
          <ColonneCompacte
            key={i}
            colonne={col}
            lignesUnifiees={diff.lignesUnifiees}
            colIdx={i}
            onChoisir={onChoisir}
            onDetail={c => setLightboxRecette(c.recette)}
          />
        ))}
      </div>

      {lightboxRecette && (
        <LightboxFiche
          recette={lightboxRecette}
          onClose={() => setLightboxRecette(null)}
        />
      )}
    </div>
  );
}

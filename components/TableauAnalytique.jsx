'use client';

/* ==========================================================================
   components/TableauAnalytique.jsx
   Tableau analytique interactif — Glaces & Sorbets
   Calcule PAC, POD, ES, MG, MSNG, Lactose en temps réel
   ========================================================================== */

import { useState, useMemo } from 'react';
import { INGREDIENTS_GLACE } from '@/lib/data.js';
import { FRUITS_GLACE, GROUPES_INGREDIENTS_GLACE, NORMS_GLACE, calculerBilan } from '@/lib/glacerie.js';
import { Plus, Trash2, Snowflake } from 'lucide-react';

// ── Constantes ──────────────────────────────────────────────────────────────
const PRODUIT_TYPES = [
  { id: 'sorbet', label: 'Sorbet' },
  { id: 'glace',  label: 'Crème glacée' },
  { id: 'gelato', label: 'Gelato' },
  { id: 'sherbet', label: 'Sherbet' },
];

const FRUIT_KEYS = Object.keys(FRUITS_GLACE).sort((a, b) =>
  FRUITS_GLACE[a].label.localeCompare(FRUITS_GLACE[b].label, 'fr')
);

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n, dec = 1) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return n.toFixed(dec);
}

function StatusDot({ value, norm }) {
  if (!norm || value === null || isNaN(value)) return null;
  let color = '#4caf50'; // vert
  if (value < norm.min || value > norm.max) color = '#f44336'; // rouge
  else if (value < norm.min * 1.05 || value > norm.max * 0.95) color = '#ff9800'; // orange
  return (
    <span
      title={`Norme : ${norm.min}–${norm.max}${norm.unit}`}
      style={{
        display: 'inline-block',
        width: 8, height: 8, borderRadius: '50%',
        background: color, marginLeft: 4, flexShrink: 0,
      }}
    />
  );
}

function NormeBar({ label, value, norm, unit = '' }) {
  if (!norm) return null;
  const { min, max } = norm;
  const clamp = v => Math.max(0, Math.min(100, v));
  const range = max - min;
  // Position de la valeur dans la plage étendue [min*0.5, max*1.5]
  const extMin = min * 0.6;
  const extMax = max * 1.5;
  const extRange = extMax - extMin;
  const posPct = clamp(((value - extMin) / extRange) * 100);
  const minPct = clamp(((min - extMin) / extRange) * 100);
  const maxPct = clamp(((max - extMin) / extRange) * 100);

  let statusColor = '#4caf50';
  if (value < min || value > max) statusColor = '#f44336';
  else if (value < min + range * 0.05 || value > max - range * 0.05) statusColor = '#ff9800';

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--muted, #7a7269)' }}>{label}</span>
        <span style={{
          fontSize: 13, fontWeight: 600, color: statusColor,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {fmt(value, unit === '%' ? 1 : 0)}{unit}
          {' '}
          <span style={{ fontWeight: 400, fontSize: 11, color: 'var(--muted, #7a7269)' }}>
            ({min}–{max}{unit})
          </span>
        </span>
      </div>
      <div style={{
        position: 'relative', height: 8, borderRadius: 4,
        background: 'var(--line, #e6e1d9)',
      }}>
        {/* Zone verte (norme) */}
        <div style={{
          position: 'absolute',
          left: `${minPct}%`,
          width: `${maxPct - minPct}%`,
          height: '100%',
          background: 'rgba(76,175,80,0.25)',
          borderRadius: 4,
        }} />
        {/* Curseur valeur */}
        <div style={{
          position: 'absolute',
          left: `${posPct}%`,
          transform: 'translateX(-50%)',
          width: 12, height: 12,
          borderRadius: '50%',
          background: statusColor,
          top: -2,
          boxShadow: '0 0 0 2px rgba(0,0,0,0.3)',
        }} />
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function TableauAnalytique() {
  const [produit, setProduit] = useState('sorbet');
  const [rows, setRows] = useState([
    // Ligne eau par défaut pour sorbet
    { id: 'r1', type: 'standard', ingredientKey: 'eau_pure',  quantite: '', fruitKey: '' },
    { id: 'r2', type: 'standard', ingredientKey: 'saccharose', quantite: '', fruitKey: '' },
    { id: 'r3', type: 'fruit',    ingredientKey: '',           quantite: '', fruitKey: 'fraise' },
  ]);

  const norms = NORMS_GLACE[produit];

  // ── Calcul du bilan ──────────────────────────────────────────────────────
  const bilan = useMemo(() => {
    const lignes = rows.map(r => ({
      type:          r.type,
      ingredientKey: r.ingredientKey,
      fruitKey:      r.fruitKey,
      quantite_g:    parseFloat(r.quantite) || 0,
    }));
    return calculerBilan(lignes, INGREDIENTS_GLACE);
  }, [rows]);

  const t = bilan.totaux;

  // ── Gestion des lignes ───────────────────────────────────────────────────
  function addRow() {
    setRows(prev => [...prev, {
      id: `r${Date.now()}`,
      type: 'standard',
      ingredientKey: 'saccharose',
      quantite: '',
      fruitKey: '',
    }]);
  }

  function addFruitRow() {
    setRows(prev => [...prev, {
      id: `r${Date.now()}`,
      type: 'fruit',
      ingredientKey: '',
      quantite: '',
      fruitKey: FRUIT_KEYS[0],
    }]);
  }

  function removeRow(id) {
    setRows(prev => prev.filter(r => r.id !== id));
  }

  function updateRow(id, field, value) {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      // Si on passe en mode fruit, vider ingredientKey
      if (field === 'type') {
        updated.ingredientKey = '';
        updated.fruitKey = value === 'fruit' ? FRUIT_KEYS[0] : '';
      }
      return updated;
    }));
  }

  function clearAll() {
    setRows([{
      id: `r${Date.now()}`,
      type: 'standard',
      ingredientKey: 'eau_pure',
      quantite: '',
      fruitKey: '',
    }]);
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

      {/* ── Panneau gauche : tableau saisie ── */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px', borderBottom: '1px solid var(--line, #e6e1d9)',
          background: 'var(--accent-soft, #f1e6dc)',
        }}>
          <Snowflake size={18} strokeWidth={1.8} style={{ color: '#4fc3f7' }} />
          <h2 style={{ margin: 0, fontSize: 16, color: 'var(--ink, #2b2622)' }}>Composition du mix</h2>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {PRODUIT_TYPES.map(p => (
              <button
                key={p.id}
                onClick={() => setProduit(p.id)}
                style={{
                  padding: '4px 12px', borderRadius: 20, border: 'none',
                  fontSize: 12, cursor: 'pointer', fontWeight: 500,
                  background: produit === p.id ? '#4fc3f7' : '#fff',
                  color: produit === p.id ? '#000' : 'var(--ink, #2b2622)',
                  transition: 'all 0.15s',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tableau */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--accent-soft, #f1e6dc)' }}>
                <th style={th}>Ingrédient</th>
                <th style={{ ...th, width: 90 }}>Qté (g)</th>
                <th style={{ ...th, width: 75 }}>ES (g)</th>
                <th style={{ ...th, width: 75 }}>MG (g)</th>
                <th style={{ ...th, width: 75 }}>MSNG (g)</th>
                <th style={{ ...th, width: 70 }}>Lact. (g)</th>
                <th style={{ ...th, width: 70 }}>PAC</th>
                <th style={{ ...th, width: 70 }}>POD</th>
                <th style={{ ...th, width: 36 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const calc = bilan.lignes[idx];
                const q = parseFloat(row.quantite) || 0;
                return (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--line, #e6e1d9)' }}>
                    {/* Sélecteur ingrédient */}
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {/* Toggle fruit / standard */}
                        <button
                          onClick={() => updateRow(row.id, 'type', row.type === 'fruit' ? 'standard' : 'fruit')}
                          title={row.type === 'fruit' ? 'Passer en ingrédient standard' : 'Passer en purée de fruit'}
                          style={{
                            padding: '2px 6px', borderRadius: 4, border: 'none',
                            fontSize: 10, cursor: 'pointer', flexShrink: 0,
                            background: row.type === 'fruit' ? '#4fc3f7' : 'var(--line, #e6e1d9)',
                            color: row.type === 'fruit' ? '#000' : 'var(--muted, #7a7269)',
                          }}
                        >
                          {row.type === 'fruit' ? '🍓' : '🧂'}
                        </button>

                        {row.type === 'fruit' ? (
                          <select
                            value={row.fruitKey}
                            onChange={e => updateRow(row.id, 'fruitKey', e.target.value)}
                            style={selectSt}
                          >
                            {FRUIT_KEYS.map(k => (
                              <option key={k} value={k}>{FRUITS_GLACE[k].label}</option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={row.ingredientKey}
                            onChange={e => updateRow(row.id, 'ingredientKey', e.target.value)}
                            style={selectSt}
                          >
                            {GROUPES_INGREDIENTS_GLACE.map(g => (
                              <optgroup key={g.label} label={g.label}>
                                {g.keys.map(k => (
                                  <option key={k} value={k}>{INGREDIENTS_GLACE[k]?.label ?? k}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>

                    {/* Quantité */}
                    <td style={td}>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={row.quantite}
                        placeholder="0"
                        onChange={e => updateRow(row.id, 'quantite', e.target.value)}
                        style={{
                          width: '100%', background: 'transparent',
                          border: '1px solid var(--line, #e6e1d9)', borderRadius: 4,
                          padding: '3px 6px', color: 'var(--ink, #2b2622)',
                          fontSize: 13, textAlign: 'right',
                        }}
                      />
                    </td>

                    {/* Valeurs calculées */}
                    <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: q ? 'var(--ink, #2b2622)' : 'var(--muted, #7a7269)' }}>{q ? fmt(calc?.es)   : '—'}</td>
                    <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: q ? 'var(--ink, #2b2622)' : 'var(--muted, #7a7269)' }}>{q ? fmt(calc?.mg)   : '—'}</td>
                    <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: q ? 'var(--ink, #2b2622)' : 'var(--muted, #7a7269)' }}>{q ? fmt(calc?.msng) : '—'}</td>
                    <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: q ? 'var(--ink, #2b2622)' : 'var(--muted, #7a7269)' }}>{q ? fmt(calc?.lact) : '—'}</td>
                    <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: (calc?.pac > 0 && q) ? '#0288d1' : 'var(--muted, #7a7269)' }}>{q && calc?.pac > 0 ? fmt(calc?.pac, 0) : '—'}</td>
                    <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: (calc?.pod > 0 && q) ? '#2e7d32' : 'var(--muted, #7a7269)' }}>{q && calc?.pod > 0 ? fmt(calc?.pod, 0) : '—'}</td>

                    {/* Supprimer */}
                    <td style={{ ...td, textAlign: 'center' }}>
                      <button
                        onClick={() => removeRow(row.id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--muted, #7a7269)', padding: 4,
                          display: 'flex', alignItems: 'center',
                        }}
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* ── Ligne totaux ── */}
              <tr style={{
                background: 'var(--accent-soft, #f1e6dc)',
                fontWeight: 700, borderTop: '2px solid var(--ink, #2b2622)',
              }}>
                <td style={{ ...td, fontSize: 12, color: 'var(--muted, #7a7269)' }}>TOTAL</td>
                <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(t.qte, 0)} g</td>
                <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(t.es_g, 0)} g
                  <StatusDot value={t.es_pct} norm={norms?.ES} />
                </td>
                <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(t.mg_g, 0)} g
                  <StatusDot value={t.mg_pct} norm={norms?.MG} />
                </td>
                <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(t.msng_g, 0)} g
                  <StatusDot value={t.msng_pct} norm={norms?.MSNG} />
                </td>
                <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(t.lact_g, 0)} g
                  <StatusDot value={t.lact_pct} norm={norms?.Lact} />
                </td>
                <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#0288d1' }}>
                  {fmt(t.pac_1000, 0)}
                  <StatusDot value={t.pac_1000} norm={norms?.PAC} />
                </td>
                <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#2e7d32' }}>
                  {fmt(t.pod_1000, 0)}
                  <StatusDot value={t.pod_1000} norm={norms?.POD} />
                </td>
                <td style={td} />
              </tr>

              {/* ── Ligne % ── */}
              {t.qte > 0 && (
                <tr style={{ fontSize: 11, color: 'var(--muted, #7a7269)' }}>
                  <td style={{ ...td }}>% du mix</td>
                  <td style={{ ...td, textAlign: 'right' }}>100 %</td>
                  <td style={{ ...td, textAlign: 'right' }}>{fmt(t.es_pct)} %</td>
                  <td style={{ ...td, textAlign: 'right' }}>{fmt(t.mg_pct)} %</td>
                  <td style={{ ...td, textAlign: 'right' }}>{fmt(t.msng_pct)} %</td>
                  <td style={{ ...td, textAlign: 'right' }}>{fmt(t.lact_pct)} %</td>
                  <td style={{ ...td, textAlign: 'right', color: '#0288d1' }}>
                    ×1000&thinsp;g&thinsp;=&thinsp;{fmt(t.pac_1000, 0)}
                  </td>
                  <td style={{ ...td, textAlign: 'right', color: '#2e7d32' }}>
                    ×1000&thinsp;g&thinsp;=&thinsp;{fmt(t.pod_1000, 0)}
                  </td>
                  <td style={td} />
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', gap: 8, padding: '12px 16px',
          borderTop: '1px solid var(--line, #e6e1d9)',
        }}>
          <button className="secondary" onClick={addRow} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Plus size={14} /> Ingrédient
          </button>
          <button className="secondary" onClick={addFruitRow} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Plus size={14} /> 🍓 Purée de fruit
          </button>
          <button
            onClick={clearAll}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--muted, #7a7269)', fontSize: 12,
            }}
          >
            Vider
          </button>
        </div>
      </div>

      {/* ── Panneau droit : normes ── */}
      <div className="panel">
        <h3 style={{ margin: '0 0 16px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
            background: norms?.color ?? '#4fc3f7',
          }} />
          Bilan — {norms?.label}
        </h3>

        <NormeBar label="Extrait sec (ES)" value={t.es_pct}   norm={norms?.ES}   unit="%" />
        <NormeBar label="Matières grasses" value={t.mg_pct}   norm={norms?.MG}   unit="%" />
        <NormeBar label="MS Non Grasse"    value={t.msng_pct} norm={norms?.MSNG} unit="%" />
        <NormeBar label="Lactose"          value={t.lact_pct} norm={norms?.Lact} unit="%" />

        <div style={{ height: 1, background: 'var(--line, #e6e1d9)', margin: '16px 0' }} />

        <NormeBar label="PAC (×1000 g)" value={t.pac_1000} norm={norms?.PAC} unit="" />
        <NormeBar label="POD (×1000 g)" value={t.pod_1000} norm={norms?.POD} unit="" />

        {/* Légende */}
        <div style={{ marginTop: 20, fontSize: 11, color: 'var(--muted, #7a7269)', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Légende</div>
          <div><b>PAC</b> = Σ(g × coeff) / 100 · 1000/masse</div>
          <div><b>POD</b> = Σ(g × coeff) / 100 · 1000/masse</div>
          <div><b>ES</b> = extrait sec total</div>
          <div><b>MSNG</b> = MS non grasse (lait, protéines…)</div>
          <div style={{ marginTop: 8 }}>
            <span style={{ color: '#4caf50' }}>●</span> dans la norme &nbsp;
            <span style={{ color: '#ff9800' }}>●</span> limite &nbsp;
            <span style={{ color: '#f44336' }}>●</span> hors norme
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Styles inline partagés ────────────────────────────────────────────────────
const th = {
  padding: '8px 12px', textAlign: 'left', fontSize: 11,
  fontWeight: 600, color: 'var(--muted, #7a7269)',
  textTransform: 'uppercase', letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
};

const td = {
  padding: '7px 12px', verticalAlign: 'middle',
};

const selectSt = {
  flex: 1, minWidth: 0, background: 'transparent',
  border: '1px solid var(--line, #e6e1d9)', borderRadius: 4,
  padding: '3px 6px', color: 'var(--ink, #2b2622)',
  fontSize: 13,
};

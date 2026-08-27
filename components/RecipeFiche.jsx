'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PARFUMS } from '@/lib/data.js';
import { TEMPLATES } from '@/lib/templates.js';
import { suggererAccords, suggererTextures, suggererCompositions } from '@/lib/moteur_accords.js';
import { togglePlannifiee } from '@/lib/compositions-store.js';
import { INGREDIENTS_METIER } from '@/lib/ingredients-metier.js';
import { getMergedMetier } from '@/lib/mercuriale-store.js';
import { calculerCoutAvecRatios, formatPrix } from '@/lib/cout.js';
import { getRecetteAllergenes, formatLabelInco } from '@/lib/allergenes.js';
import { calculerDlcRecette, getRecommandationsConservation } from '@/lib/conservation.js';

function formatG(g) {
  if (g >= 100) return `${g.toFixed(0)} g`;
  if (g >= 10)  return `${g.toFixed(1)} g`;
  return `${g.toFixed(2)} g`;
}

function StatusDot({ ok }) {
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: ok ? 'var(--ok)' : 'var(--bad)', marginRight: 6,
    }} />
  );
}

function BalanceJournal({ journal, warnings }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="accordion">
      <button className="accordion-trigger" onClick={() => setOpen(o => !o)}>
        <span>
          Comment cette recette a été équilibrée
          {journal.length > 0 && (
            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>
              {journal.length} ajustement{journal.length > 1 ? 's' : ''}
            </span>
          )}
        </span>
        <span className={`accordion-arrow${open ? ' open' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="accordion-body">
          {journal.length === 0 ? (
            <div style={{ color: 'var(--ok)', fontWeight: 500, fontSize: 13 }}>
              ✓ Recette équilibrée sans ajustement — toutes les valeurs sont dans les cibles.
            </div>
          ) : (
            <>
              {warnings.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  {warnings.map((w, i) => (
                    <div key={i} className="note" style={{ borderColor: 'var(--warn)', marginBottom: 6 }}>
                      ⚠ {w}
                    </div>
                  ))}
                </div>
              )}
              {journal.map((entry, i) => (
                <div key={i} className="journal-entry">
                  <div className="journal-entry-header">
                    <span className="journal-badge">Itération {entry.iteration}</span>
                    <span className="journal-ingredient">{entry.ingredient}</span>
                    <span className="journal-delta">
                      {entry.pctBefore}% → {entry.pctApres}%
                      &nbsp;({entry.gBefore} g → {entry.gApres} g)
                    </span>
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <span className="journal-param">{entry.parametreLabel} = {entry.valeurAvant} </span>
                    <span style={{ color: 'var(--muted)', fontSize: 11 }}>cible {entry.cible}</span>
                  </div>
                  <div className="journal-rule">{entry.regle}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Utilitaires partagés ─────────────────────────────────────────────────────

function RangeBar({ pct, color }) {
  return (
    <div style={{ position: 'relative', height: 4, background: 'var(--line)', borderRadius: 2 }}>
      <div style={{
        position: 'absolute', top: '50%', left: `${pct}%`,
        transform: 'translate(-50%, -50%)',
        width: 8, height: 8, borderRadius: '50%',
        background: color,
        border: '2px solid var(--card)',
        boxShadow: `0 0 0 1.5px ${color}`,
      }} />
    </div>
  );
}

const ACTIONS_V2 = {
  eau:     { bas: v => `Eau totale trop faible (${v}%) — augmenter la phase aqueuse (lait, purée de fruit, eau).`,     haut: v => `Eau totale trop élevée (${v}%) — réduire la phase aqueuse ou augmenter l'extrait sec.` },
  sucres:  { bas: v => `Sucres insuffisants (${v}%) — augmenter le saccharose ou ajouter du dextrose.`,                haut: v => `Sucres excessifs (${v}%) — substituer par glucose atomisé DE38 (sans pouvoir sucrant).` },
  lipides: { bas: v => `Matière grasse insuffisante (${v}%) — augmenter la crème ou le beurre.`,                       haut: v => `Matière grasse excessive (${v}%) — réduire la crème ou le beurre.` },
  pod:     { bas: v => `POD trop faible (${v}) — ajouter trimoline, miel ou dextrose (pouvoir sucrant élevé).`,        haut: v => `POD trop élevé (${v}) — remplacer une partie du saccharose par glucose DE38 (POD 50).` },
  pac:     { bas: v => `PAC trop faible (${v}) — ajouter dextrose ou sucre inverti (PAC 190) pour assouplir.`,         haut: v => `PAC trop élevé (${v}) — réduire les monosaccharides.` },
};

function badgeV2(equilibre) {
  const n = Object.values(equilibre).filter(e => !e.ok).length;
  return n === 0 ? { bg: '#e3efe6', color: 'var(--ok)',   label: '✓ Équilibré'    }
       : n <= 2  ? { bg: '#fce8d4', color: 'var(--warn)', label: '⚠ À ajuster'    }
                 : { bg: '#fde8e8', color: 'var(--bad)',  label: '✗ Déséquilibré' };
}

function badgeV3(fourchettes) {
  const nb    = fourchettes.filter(f => f.statut === 'hors').length;
  const allOk = fourchettes.every(f => f.statut === 'ok' || f.statut === 'inconnu');
  return allOk  ? { bg: '#e3efe6', color: 'var(--ok)',   label: '✓ Équilibré'    }
       : nb >= 3 ? { bg: '#fde8e8', color: 'var(--bad)',  label: '✗ Déséquilibré' }
                 : { bg: '#fce8d4', color: 'var(--warn)', label: '⚠ À ajuster'    };
}

// ── Composants de ligne ───────────────────────────────────────────────────────

function IndicateurRow({ label, valeur, unite, min, max, statut, conseil, conseil_chiffre }) {
  const COLOR  = { ok: 'var(--ok)', attention: 'var(--warn)', hors: 'var(--bad)', inconnu: 'var(--muted)' };
  const SYMBOL = { ok: '✓', attention: '⚠', hors: '✗', inconnu: '?' };
  const color  = COLOR[statut]  ?? 'var(--muted)';
  const symbol = SYMBOL[statut] ?? '?';
  const pct = valeur != null
    ? Math.min(100, Math.max(0, ((valeur - min) / (max - min)) * 100))
    : 0;
  const hasMsg = conseil || conseil_chiffre;
  return (
    <>
      <tr>
        <td style={{ fontSize: 12, paddingRight: 8 }}>
          <span style={{ color, fontWeight: 700, marginRight: 6, fontSize: 11 }}>{symbol}</span>
          <span style={{ color: 'var(--muted)' }}>{label}</span>
        </td>
        <td style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', textAlign: 'right', paddingRight: 8, color }}>
          {valeur != null ? valeur.toFixed(valeur < 10 ? 2 : 1) : '—'}{unite}
        </td>
        <td style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right', whiteSpace: 'nowrap' }}>
          [{min} – {max}]{unite}
        </td>
        <td style={{ paddingLeft: 12, width: 80 }}>
          <RangeBar pct={pct} color={color} />
        </td>
      </tr>
      {hasMsg && (
        <tr>
          <td colSpan={4} style={{ paddingBottom: 8, paddingLeft: 18 }}>
            {conseil && (
              <div style={{ fontSize: 11, color: statut === 'hors' ? 'var(--bad)' : 'var(--warn)' }}>
                ↳ {conseil}
              </div>
            )}
            {conseil_chiffre && (
              <div style={{
                fontFamily: 'monospace', background: 'var(--bg)', borderRadius: 4,
                padding: '3px 8px', fontSize: 11, marginTop: conseil ? 4 : 0,
                display: 'inline-block',
              }}>
                → {conseil_chiffre.description}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function GlaceJournal({ journal, warnings = [] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="accordion">
      <button className="accordion-trigger" onClick={() => setOpen(o => !o)}>
        <span>
          Ajustements automatiques
          <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>
            {journal.length} ajustement{journal.length > 1 ? 's' : ''}
          </span>
        </span>
        <span className={`accordion-arrow${open ? ' open' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="accordion-body">
          {warnings.map((w, i) => (
            <div key={i} className="note" style={{ borderColor: 'var(--warn)', marginBottom: 6 }}>⚠ {w}</div>
          ))}
          {journal.map((entry, i) => (
            <div key={i} className="journal-entry">
              <div className="journal-entry-header">
                <span className="journal-badge">Itération {entry.iter}</span>
                <span className="journal-param" style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>{entry.param}</span>
              </div>
              <div className="journal-rule">{entry.regle}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EquilibreRow({ label, valeur, min, max, ok, paramKey }) {
  const pct   = Math.min(100, Math.max(0, ((valeur - min) / (max - min)) * 100));
  const color = ok ? 'var(--ok)' : 'var(--bad)';
  const dir   = valeur < min ? 'bas' : 'haut';
  const msg   = !ok ? ACTIONS_V2[paramKey]?.[dir]?.(valeur) : null;
  return (
    <>
      <tr>
        <td style={{ fontSize: 12, color: 'var(--muted)', paddingRight: 8 }}>
          <StatusDot ok={ok} />{label}
        </td>
        <td style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', textAlign: 'right', paddingRight: 8 }}>
          {valeur}
        </td>
        <td style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right', whiteSpace: 'nowrap' }}>
          [{min} – {max}]
        </td>
        <td style={{ paddingLeft: 12, width: 80 }}>
          <RangeBar pct={pct} color={color} />
        </td>
      </tr>
      {msg && (
        <tr>
          <td colSpan={4} style={{ paddingBottom: 8, paddingLeft: 18 }}>
            <span style={{ fontSize: 11, color: 'var(--bad)' }}>↳ {msg}</span>
          </td>
        </tr>
      )}
    </>
  );
}

const SAISON_COLORS = {
  printemps: { bg: '#e8f5e9', color: '#2e7d32' },
  été:       { bg: '#fff3e0', color: '#e65100' },
  automne:   { bg: '#fbe9e7', color: '#bf360c' },
  hiver:     { bg: '#e3f2fd', color: '#1565c0' },
};

function PillBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11, padding: '4px 12px', borderRadius: 20,
        border: '1px solid var(--line)', cursor: 'pointer',
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? '#fff' : 'var(--ink)',
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </button>
  );
}

function EncartAccords({ parfumId, textureId }) {
  const [open,        setOpen]        = useState(false);
  const [onglet,      setOnglet]      = useState('accords');
  const [plannifiees, setPlannifiees] = useState(() => {
    if (typeof window === 'undefined') return [];
    try { const raw = localStorage.getItem('pastry-gen-mes-compositions'); return raw ? JSON.parse(raw) : []; }
    catch { return []; }
  });

  const handleToggle = useCallback((id) => {
    setPlannifiees(togglePlannifiee(id));
  }, []);

  const accords  = useMemo(() => suggererAccords(parfumId),      [parfumId]);
  const textures = useMemo(() => suggererTextures(parfumId),     [parfumId]);
  const compos   = useMemo(() => suggererCompositions(parfumId), [parfumId]);

  if (!parfumId || parfumId === 'nature') return null;

  return (
    <div className="accordion">
      <button className="accordion-trigger" onClick={() => setOpen(o => !o)}>
        <span>
          Idées d&apos;accords &amp; compositions
          {!open && accords.length > 0 && (
            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>
              {accords.length} accord{accords.length > 1 ? 's' : ''} · {compos.length} composition{compos.length > 1 ? 's' : ''}
            </span>
          )}
        </span>
        <span className={`accordion-arrow${open ? ' open' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="accordion-body">

          {/* Onglets */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            <PillBtn active={onglet === 'accords'}  onClick={() => setOnglet('accords')}>
              Accords parfums {accords.length > 0 && `(${accords.length})`}
            </PillBtn>
            <PillBtn active={onglet === 'textures'} onClick={() => setOnglet('textures')}>
              Textures compatibles {textures.length > 0 && `(${textures.length})`}
            </PillBtn>
            <PillBtn active={onglet === 'compos'}   onClick={() => setOnglet('compos')}>
              Compositions {compos.length > 0 && `(${compos.length})`}
            </PillBtn>
          </div>

          {/* Tab — Accords parfums */}
          {onglet === 'accords' && (
            accords.length === 0
              ? <p style={{ fontSize: 12, color: 'var(--muted)' }}>Aucun accord référencé pour ce parfum.</p>
              : accords.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '8px 0', borderBottom: '1px solid var(--line)',
                }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                    padding: '2px 10px', borderRadius: 20,
                    background: 'var(--bg)', border: '1px solid var(--line)',
                    minWidth: 90, textAlign: 'center',
                  }}>
                    {PARFUMS[a.id]?.label ?? a.id}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                    {a.note}
                  </span>
                </div>
              ))
          )}

          {/* Tab — Textures compatibles */}
          {onglet === 'textures' && (
            textures.length === 0
              ? <p style={{ fontSize: 12, color: 'var(--muted)' }}>Aucune texture compatible trouvée.</p>
              : textures.map((t, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                  <div style={{
                    fontSize: 12, fontWeight: 600,
                    color: t.textureId === textureId ? 'var(--accent)' : 'var(--ink)',
                    marginBottom: 2,
                  }}>
                    {t.label}
                    {t.textureId === textureId && (
                      <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 6, fontWeight: 400 }}>
                        ← texture actuelle
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>
                    {t.description}
                  </div>
                </div>
              ))
          )}

          {/* Tab — Compositions */}
          {onglet === 'compos' && (
            compos.length === 0
              ? <p style={{ fontSize: 12, color: 'var(--muted)' }}>Aucune composition référencée.</p>
              : compos.map((comp, i) => {
                const sc      = SAISON_COLORS[comp.saison] ?? { bg: 'var(--bg)', color: 'var(--muted)' };
                const estPlan = plannifiees.includes(comp.id);
                const tpl     = comp.textureIdPrincipal ? TEMPLATES[comp.textureIdPrincipal] : null;
                const genUrl  = (comp.textureIdPrincipal && comp.parfumIdPrincipal)
                  ? `/?textureId=${comp.textureIdPrincipal}&parfumId=${comp.parfumIdPrincipal}`
                  : null;
                return (
                  <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, marginRight: 8 }}>{comp.nom}</span>
                        <span style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 12,
                          background: sc.bg, color: sc.color, fontWeight: 600,
                          textTransform: 'capitalize',
                        }}>
                          {comp.saison}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggle(comp.id)}
                        title={estPlan ? 'Retirer de mes compositions' : 'Planifier cette composition'}
                        style={{
                          fontSize: 10, padding: '3px 8px',
                          border: `1px solid ${estPlan ? 'var(--accent)' : 'var(--line)'}`,
                          borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                          background: estPlan ? 'var(--accent)' : 'transparent',
                          color: estPlan ? '#fff' : 'var(--ink)',
                          fontWeight: estPlan ? 600 : 400,
                        }}
                      >
                        {estPlan ? '✓ Planifié' : '+ Planifier'}
                      </button>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 8px', lineHeight: 1.4 }}>
                      {comp.description}
                    </p>
                    <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', marginBottom: genUrl ? 8 : 0 }}>
                      <tbody>
                        {comp.couches.map((couche, j) => (
                          <tr key={j}>
                            <td style={{ color: 'var(--muted)', paddingRight: 10, paddingBottom: 3, width: 70 }}>
                              {couche.couche}
                            </td>
                            <td style={{ fontWeight: 500, paddingRight: 10, paddingBottom: 3 }}>
                              {couche.texture}
                            </td>
                            <td style={{ color: 'var(--muted)', paddingBottom: 3 }}>
                              {couche.parfum !== 'nature' ? (PARFUMS[couche.parfum]?.label ?? couche.parfum) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {genUrl && (
                      <Link
                        href={genUrl}
                        style={{
                          display: 'block', textAlign: 'center', fontSize: 11,
                          padding: '6px', border: '1px solid var(--line)', borderRadius: 6,
                          color: 'var(--accent)', fontWeight: 600, textDecoration: 'none',
                          background: 'var(--bg)',
                        }}
                      >
                        Générer {tpl?.label ?? comp.textureIdPrincipal} →
                      </Link>
                    )}
                  </div>
                );
              })
          )}
        </div>
      )}
    </div>
  );
}

// ── Encart coût matière ───────────────────────────────────────────────────────

function EncartCout({ lignes }) {
  const [open, setOpen] = useState(false);
  const [multRevient, setMultRevient] = useState(() => {
    if (typeof window === 'undefined') return 2;
    try { const r = parseFloat(localStorage.getItem('pastry-gen-mult-revient')); return !isNaN(r) && r > 0 ? r : 2; }
    catch { return 2; }
  });
  const [multPvttc,   setMultPvttc]   = useState(() => {
    if (typeof window === 'undefined') return 5;
    try { const p = parseFloat(localStorage.getItem('pastry-gen-mult-pvttc')); return !isNaN(p) && p > 0 ? p : 5; }
    catch { return 5; }
  });

  const handleMult = (key, raw) => {
    const n = parseFloat(raw);
    if (isNaN(n) || n <= 0) return;
    if (key === 'revient') {
      setMultRevient(n);
      try { localStorage.setItem('pastry-gen-mult-revient', n); } catch {}
    } else {
      setMultPvttc(n);
      try { localStorage.setItem('pastry-gen-mult-pvttc', n); } catch {}
    }
  };

  const cout = useMemo(
    () => calculerCoutAvecRatios(lignes, getMergedMetier(INGREDIENTS_METIER), { multiplicateur_revient: multRevient, multiplicateur_pvttc: multPvttc }),
    [lignes, multRevient, multPvttc],
  );

  return (
    <div className="accordion">
      <button className="accordion-trigger" onClick={() => setOpen(o => !o)}>
        <span>
          Coût matière
          {!open && cout.cout_total_eur > 0 && (
            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>
              {formatPrix(cout.cout_total_eur)} · PVTTC {formatPrix(cout.pvttc_eur)}
            </span>
          )}
        </span>
        <span className={`accordion-arrow${open ? ' open' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="accordion-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {[
              ['Coût matière', cout.cout_total_eur],
              ['Coût/100 g',   cout.cout_pour_100g_eur],
              ['Prix de revient', cout.prix_de_revient_eur],
              ['PVTTC',        cout.pvttc_eur],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}>
                <span style={{ color: 'var(--muted)', marginRight: 4 }}>{lbl}</span>
                <strong>{formatPrix(val)}</strong>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 12, marginBottom: 12 }}>
            <span style={{ color: 'var(--muted)' }}>Multiplicateurs :</span>
            {[['revient', 'Revient ×', multRevient], ['pvttc', 'PVTTC ×', multPvttc]].map(([key, lbl, val]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {lbl}
                <input
                  type="number" min="1" step="0.1" value={val}
                  onChange={e => handleMult(key, e.target.value)}
                  style={{ width: 52, padding: '2px 4px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 4 }}
                />
              </label>
            ))}
          </div>

          {cout.taux_couverture_pct < 100 && (
            <div className="note" style={{ borderColor: 'var(--warn)', fontSize: 12, marginBottom: 8 }}>
              ⚠ Couverture {cout.taux_couverture_pct} % — prix manquants : {cout.ingredients_sans_prix.join(', ')}.
              Le coût affiché est donc sous-évalué.
            </div>
          )}
          {/* Un prix de famille est une moyenne du référentiel, pas le prix de
              l'article : à distinguer avant de s'en servir pour fixer un prix. */}
          {cout.part_prix_approche_pct > 0 && (
            <div className="note" style={{ fontSize: 12, marginBottom: 8, color: 'var(--muted)' }}>
              ° {cout.part_prix_approche_pct} % du coût repose sur un prix de famille,
              faute de l&apos;article exact au référentiel : {cout.ingredients_prix_approche.join(', ')}.
              Corrigeable dans la Mercuriale.
            </div>
          )}
          {cout.prix_obsolete.length > 0 && (
            <div className="note" style={{ borderColor: 'var(--warn)', fontSize: 12, marginBottom: 8 }}>
              ⚠ Prix datant de plus de 6 mois : {cout.prix_obsolete.join(', ')}.
            </div>
          )}
          {cout.prix_variable_saison.length > 0 && (
            <div className="note" style={{ fontSize: 12, marginBottom: 8 }}>
              Prix saisonniers : {cout.prix_variable_saison.join(', ')}.
            </div>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Ingrédient', 'Quantité', 'Coût', '%'].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: 11, color: 'var(--muted)', fontWeight: 600, paddingBottom: 4 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cout.cout_par_ligne.map((l, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ paddingTop: 5, paddingBottom: 5 }}>{l.ingredient}</td>
                  <td style={{ textAlign: 'right', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{l.masse_g.toFixed(0)} g</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {l.prix_eur_par_g !== null ? formatPrix(l.cout_eur) : '—'}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {l.part_pct !== null ? `${l.part_pct} %` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Encart allergènes INCO ────────────────────────────────────────────────────

function EncartAllergenes({ lignes }) {
  const [open, setOpen] = useState(false);

  const result = useMemo(() => getRecetteAllergenes(lignes, INGREDIENTS_METIER), [lignes]);
  const label  = useMemo(
    () => formatLabelInco(result.allergenes_presents, result.traces_possibles,
                          result.allergenes_deduits),
    [result],
  );

  const hasData = result.allergenes_presents.length > 0 || result.traces_possibles.length > 0;

  return (
    <div className="accordion">
      <button className="accordion-trigger" onClick={() => setOpen(o => !o)}>
        <span>
          Allergènes INCO
          {!open && (
            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>
              {result.allergenes_presents.length > 0
                ? `${result.allergenes_presents.length} allergène${result.allergenes_presents.length > 1 ? 's' : ''}`
                : hasData ? 'traces uniquement' : 'aucun allergène déclaré'}
            </span>
          )}
        </span>
        <span className={`accordion-arrow${open ? ' open' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="accordion-body">
          {result.ingredients_sans_donnees.length > 0 && (
            <div className="note" style={{ borderColor: 'var(--warn)', fontSize: 12, marginBottom: 10 }}>
              ⚠ Données manquantes pour : {result.ingredients_sans_donnees.join(', ')}.
              Les allergènes ne peuvent être garantis.
            </div>
          )}

          {label.texte ? (
            <>
              <div
                style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 14px', fontSize: 13, lineHeight: 1.5, marginBottom: label.note ? 4 : 12 }}
                dangerouslySetInnerHTML={{ __html: label.html }}
              />
              {label.note && (
                <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 12 }}>
                  {label.note}
                </div>
              )}
            </>
          ) : (
            !result.ingredients_sans_donnees.length && (
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
                Aucun allergène majeur identifié sur la base des données disponibles.
              </div>
            )
          )}

          {result.repartition.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 6 }}>Sources</div>
              {result.repartition.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '4px 0', borderBottom: '1px solid var(--line)', fontSize: 12 }}>
                  <span style={{ fontWeight: 600, minWidth: 120 }}>{r.label}</span>
                  <span style={{ color: 'var(--muted)' }}>{r.ingredients.join(', ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Encart conservation & DLC ─────────────────────────────────────────────────

function EncartConservation({ lignes, textureId }) {
  const [open, setOpen] = useState(false);

  const dlc  = useMemo(() => calculerDlcRecette(lignes, textureId, INGREDIENTS_METIER), [lignes, textureId]);
  const reco = useMemo(() => getRecommandationsConservation(dlc), [dlc]);

  return (
    <div className="accordion">
      <button className="accordion-trigger" onClick={() => setOpen(o => !o)}>
        <span>
          Conservation &amp; DLC indicative
          {!open && dlc.dlc_finale_j !== null && (
            <span style={{ marginLeft: 8, fontSize: 11, color: reco.alerte_chaine_froid ? 'var(--bad)' : 'var(--muted)', fontWeight: 400 }}>
              {reco.alerte_chaine_froid ? '⚠ ' : ''}{dlc.dlc_finale_j} j à +4 °C
            </span>
          )}
        </span>
        <span className={`accordion-arrow${open ? ' open' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="accordion-body">
          {reco.alerte_chaine_froid && (
            <div className="note" style={{ borderColor: 'var(--bad)', marginBottom: 10 }}>
              ⚠ DLC ≤ 3 j — chaîne du froid stricte, pas de rupture admissible.
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {[
              dlc.dlc_finale_j   !== null && ['Réfrigéré +4 °C',   `${dlc.dlc_finale_j} j`],
              dlc.dlc_surgele_j  !== null && ['Surgelé −18 °C',     `${dlc.dlc_surgele_j} j`],
              dlc.dlc_ambiant_j  !== null && ['Ambiant < 20 °C',    `${dlc.dlc_ambiant_j} j`],
            ].filter(Boolean).map(([lbl, val]) => (
              <div key={lbl} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}>
                <span style={{ color: 'var(--muted)', marginRight: 4 }}>{lbl}</span>
                <strong>{val}</strong>
              </div>
            ))}
          </div>

          {!dlc.sous_categorie_connue && (
            <div className="note" style={{ fontSize: 12, marginBottom: 8 }}>
              Texture non référencée — DLC non calculable.
            </div>
          )}
          {dlc.ingredients_limitants.length > 0 && (
            <div className="note" style={{ fontSize: 12, marginBottom: 8 }}>
              Ingrédient(s) limitant(s) : {dlc.ingredients_limitants.join(', ')}.
            </div>
          )}
          {dlc.ingredients_sans_dlc.length > 0 && (
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
              Données DLC manquantes : {dlc.ingredients_sans_dlc.join(', ')}.
            </div>
          )}

          <div className="note" style={{ fontSize: 11, color: 'var(--muted)', borderColor: 'var(--muted)' }}>
            {dlc.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecipeFiche({ recette }) {
  if (!recette) {
    return (
      <div id="output">
        <div className="empty">
          <div className="icon">·  ·  ·</div>
          <div>Choisis une texture, un ingrédient et clique sur <strong>Générer la recette</strong>.</div>
        </div>
      </div>
    );
  }

  const { texture, description, parfum, masse, formatLabel, contraintes: c, badges, lignes, process: proc, date, rapport, ingredientDb, journal = [], warnings = [], indicateurs = null, fourchettes = null, encarts = [], journalGlace = [] } = recette;
  const totalG = lignes.reduce((s, l) => s + l.g, 0);

  const badgesRendus = badges.length > 0
    ? badges.map((b, i) => <span key={i} className={`badge ${b.type}`}>{b.label}</span>)
    : <span className="badge">Recette classique</span>;

  function copierFiche() {
    const fiche = document.getElementById('fiche');
    if (!fiche) return;
    const range = document.createRange();
    range.selectNode(fiche);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    try { document.execCommand('copy'); alert('Fiche copiée dans le presse-papier.'); }
    catch { alert('Impossible de copier. Sélectionne manuellement.'); }
    sel.removeAllRanges();
  }

  return (
    <div id="output">
      <div className="fiche-actions">
        <button className="secondary" onClick={() => window.print()}>Imprimer / Export PDF</button>
        <button className="secondary" onClick={copierFiche}>Copier en texte</button>
      </div>

      <div className="fiche" id="fiche">
        {/* En-tête */}
        <div className="fiche-head">
          <div className="fiche-title">
            <h3>{[texture, parfum].filter(Boolean).join(' ')}</h3>
            <div className="sub">{description}</div>
          </div>
          <div className="fiche-meta">
            <div><strong>{formatG(masse)}</strong> de produit fini</div>
            {formatLabel && <div>{formatLabel}</div>}
            <div>Édité le {date}</div>
          </div>
        </div>

        <div className="badges">{badgesRendus}</div>

        {/* Ingrédients */}
        <div className="section">
          <h4>Recette — ingrédients</h4>
          <table className="ingredients">
            <thead>
              <tr>
                <th>Rôle</th>
                <th>Ingrédient</th>
                <th style={{ textAlign: 'right' }}>%</th>
                <th style={{ textAlign: 'right' }}>Quantité</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l, i) => (
                <tr key={i}>
                  <td className="role">{l.role}</td>
                  <td>
                    {l.ingredient}
                    {l.note && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{l.note}</div>}
                  </td>
                  <td className="pct">{l.pct.toFixed(1)} %</td>
                  <td className="qty">{formatG(l.g)}</td>
                </tr>
              ))}
              <tr className="total">
                <td></td>
                <td>Total</td>
                <td className="pct">100,0 %</td>
                <td className="qty">{formatG(totalG)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Rapport d&apos;équilibre */}
        {rapport && (
          <div className="section">
            <h4>
              Rapport d&apos;équilibre
              {(() => { const b = badgeV2(rapport.equilibre); return (
                <span style={{
                  marginLeft: 10, fontSize: 11, fontWeight: 600, padding: '2px 7px',
                  borderRadius: 12, background: b.bg, color: b.color,
                  textTransform: 'none', letterSpacing: 0,
                }}>{b.label}</span>
              ); })()}
            </h4>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: 6 }}>Paramètre</th>
                  <th style={{ textAlign: 'right', fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: 6 }}>Valeur</th>
                  <th style={{ textAlign: 'right', fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: 6 }}>Cible</th>
                  <th style={{ paddingLeft: 12, width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(rapport.equilibre).map(([key, e]) => (
                  <EquilibreRow key={key} paramKey={key} {...e} />
                ))}
              </tbody>
            </table>

            {/* Composition chiffrée */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: ingredientDb?.notes ? 14 : 0 }}>
              {[
                ['Eau', rapport.composition.eau, '%'],
                ['Sucres', rapport.composition.sucres, '%'],
                ['Lipides', rapport.composition.lipides, '%'],
                ['Protides', rapport.composition.protides, '%'],
                ['Extrait sec', rapport.composition.extrait_sec, '%'],
                rapport.composition.pod != null && ['POD', rapport.composition.pod, ''],
                rapport.composition.pac != null && ['PAC', rapport.composition.pac, ''],
              ].filter(Boolean).map(([lbl, val, unit]) => (
                <div key={lbl} style={{
                  background: 'var(--bg)', border: '1px solid var(--line)',
                  borderRadius: 8, padding: '6px 12px', fontSize: 12,
                }}>
                  <span style={{ color: 'var(--muted)', marginRight: 4 }}>{lbl}</span>
                  <strong>{val}{unit}</strong>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Journal de rééquilibrage */}
        {rapport && (
          <div className="section">
            <BalanceJournal journal={journal} warnings={warnings} />
          </div>
        )}

        {/* Indicateurs d&apos;équilibre */}
        {fourchettes && fourchettes.length > 0 && (
          <div className="section">
            <h4>
              Indicateurs d&apos;équilibre
              {(() => { const b = badgeV3(fourchettes); return (
                <span style={{
                  marginLeft: 10, fontSize: 11, fontWeight: 600, padding: '2px 7px',
                  borderRadius: 12, background: b.bg, color: b.color,
                  textTransform: 'none', letterSpacing: 0,
                }}>{b.label}</span>
              ); })()}
            </h4>

            {encarts.map((e, i) => (
              <div key={i} className="note" style={{
                borderColor: e.type === 'attention' ? 'var(--warn)' : 'var(--ok)',
                marginBottom: 8,
              }}>
                <strong>{e.titre}</strong><br />{e.message}
              </div>
            ))}

            {indicateurs?.masse_couverte_pct != null && indicateurs.masse_couverte_pct < 99 && (
              <div className="note" style={{ borderColor: 'var(--muted)', marginBottom: 8, fontSize: 12, color: 'var(--muted)' }}>
                Données partielles — {indicateurs.masse_couverte_pct.toFixed(0)} % de la masse identifiée.
                Les indicateurs marqués ? sont estimés ou absents.
              </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8, marginBottom: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: 6 }}>Indicateur</th>
                  <th style={{ textAlign: 'right', fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: 6 }}>Valeur</th>
                  <th style={{ textAlign: 'right', fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: 6 }}>Fourchette</th>
                  <th style={{ paddingLeft: 12, width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {fourchettes.map(f => <IndicateurRow key={f.key} {...f} />)}
              </tbody>
            </table>

          </div>
        )}

        {/* Idées d'accords & compositions */}
        {recette.parfumId && recette.parfumId !== 'nature' && (
          <div className="section">
            <EncartAccords parfumId={recette.parfumId} textureId={recette.textureId} />
          </div>
        )}

        {/* Journal de rééquilibrage glace */}
        {journalGlace.length > 0 && (
          <div className="section">
            <GlaceJournal journal={journalGlace} warnings={warnings} />
          </div>
        )}

        {/* Coût matière */}
        <div className="section">
          <EncartCout lignes={lignes} />
        </div>

        {/* Allergènes INCO */}
        <div className="section">
          <EncartAllergenes lignes={lignes} />
        </div>

        {/* Conservation & DLC */}
        <div className="section">
          <EncartConservation lignes={lignes} textureId={recette.textureId} />
        </div>

        {/* Mode opératoire */}
        <div className="section">
          <h4>Mode opératoire</h4>
          <ol className="process">
            {proc.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>

        {/* Note du concepteur */}
        <div className="section">
          <h4>Note du concepteur</h4>
          <div className="note">
            Recette construite selon une logique fonctionnelle : chaque ligne porte un rôle
            (parfum, gélifiant, émulsifiant, etc.) permettant de substituer un ingrédient
            par un autre de même fonction. Les pourcentages sont exprimés sur la masse
            totale du produit fini.
            {c.vegan && <><br />Version vegan : gélatine remplacée par pectine NH (amidée), crème par lait de coco, jaunes par lécithine de tournesol.</>}
            {c.igbas && <><br />Version IG bas : sucre semoule remplacé par sucre de coco. L&apos;inuline de chicorée contribue à abaisser l&apos;IG global.</>}
          </div>
        </div>

        {/* Fiche ingrédient (bibliothèque locale) */}
        {ingredientDb && (
          <div className="section" style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
            <h4>Données nutritionnelles — {ingredientDb.nom_fr}</h4>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
              Source : {ingredientDb.source_donnees}
            </div>
            {ingredientDb.notes && (
              <div className="note" style={{ marginBottom: 10, fontSize: 12 }}>{ingredientDb.notes}</div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                ['Eau', ingredientDb.eau_g, 'g'],
                ['Glucides', ingredientDb.glucides_g, 'g'],
                ['Sucres', ingredientDb.sucres_g, 'g'],
                ['Lipides', ingredientDb.lipides_g, 'g'],
                ['Protides', ingredientDb.protides_g, 'g'],
                ['Fibres', ingredientDb.fibres_g, 'g'],
                ingredientDb.ph != null && ['pH', ingredientDb.ph, ''],
                ingredientDb.pod != null && ['POD', ingredientDb.pod, ''],
                ingredientDb.pac != null && ['PAC', ingredientDb.pac, ''],
                ingredientDb.pectine_naturelle_g != null && ['Pectine', ingredientDb.pectine_naturelle_g, 'g'],
              ].filter(Boolean).map(([lbl, val, unit]) => val != null && (
                <div key={lbl} style={{
                  background: 'var(--bg)', border: '1px solid var(--line)',
                  borderRadius: 8, padding: '5px 10px', fontSize: 11,
                }}>
                  <span style={{ color: 'var(--muted)', marginRight: 3 }}>{lbl}</span>
                  <strong>{val}{unit}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

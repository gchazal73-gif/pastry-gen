'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PARFUMS } from '@/lib/data.js';
import { TEMPLATES } from '@/lib/templates.js';
import { suggererAccords, suggererTextures, suggererCompositions } from '@/lib/moteur_accords.js';
import { togglePlannifiee } from '@/lib/compositions-store.js';

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

function IndicateurRow({ label, valeur, unite, min, max, statut }) {
  const COLOR  = { ok: 'var(--ok)', attention: 'var(--warn)', hors: 'var(--bad)', inconnu: 'var(--muted)' };
  const SYMBOL = { ok: '✓', attention: '⚠', hors: '✗', inconnu: '?' };
  const color  = COLOR[statut]  ?? 'var(--muted)';
  const symbol = SYMBOL[statut] ?? '?';
  const pct = valeur != null
    ? Math.min(100, Math.max(0, ((valeur - min) / (max - min)) * 100))
    : 0;
  return (
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
        <div style={{ position: 'relative', height: 6, background: 'var(--line)', borderRadius: 3 }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 3,
            width: `${pct}%`, background: color,
          }} />
        </div>
      </td>
    </tr>
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

function EquilibreRow({ label, valeur, min, max, ok }) {
  const pct = Math.min(100, Math.max(0, ((valeur - min) / (max - min)) * 100));
  return (
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
        <div style={{ position: 'relative', height: 6, background: 'var(--line)', borderRadius: 3 }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 3,
            width: `${pct}%`,
            background: ok ? 'var(--ok)' : 'var(--bad)',
          }} />
        </div>
      </td>
    </tr>
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
  const [plannifiees, setPlannifiees] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pastry-gen-mes-compositions');
      if (raw) setPlannifiees(JSON.parse(raw));
    } catch {}
  }, []);

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
          Idées d'accords &amp; compositions
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

        {/* Rapport d'équilibre */}
        {rapport && (
          <div className="section">
            <h4>
              Rapport d'équilibre
              <span style={{
                marginLeft: 10, fontSize: 11, fontWeight: 600, padding: '2px 7px',
                borderRadius: 12,
                background: rapport.ok ? '#e3efe6' : '#fce8d4',
                color: rapport.ok ? 'var(--ok)' : 'var(--warn)',
                textTransform: 'none', letterSpacing: 0,
              }}>
                {rapport.ok ? '✓ Équilibré' : '⚠ À ajuster'}
              </span>
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
                  <EquilibreRow key={key} {...e} />
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

            {/* Suggestions */}
            {rapport.suggestions.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {rapport.suggestions.map((s, i) => (
                  <div key={i} className="note" style={{ marginBottom: 6 }}>{s}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Journal de rééquilibrage */}
        {rapport && (
          <div className="section">
            <BalanceJournal journal={journal} warnings={warnings} />
          </div>
        )}

        {/* Indicateurs d'équilibre */}
        {fourchettes && fourchettes.length > 0 && (
          <div className="section">
            <h4>
              Indicateurs d'équilibre
              <span style={{
                marginLeft: 10, fontSize: 11, fontWeight: 600, padding: '2px 7px',
                borderRadius: 12,
                background: fourchettes.every(f => f.statut === 'ok' || f.statut === 'inconnu') ? '#e3efe6'
                  : fourchettes.some(f => f.statut === 'hors') ? '#fce8d4' : '#fff8e1',
                color: fourchettes.every(f => f.statut === 'ok' || f.statut === 'inconnu') ? 'var(--ok)'
                  : fourchettes.some(f => f.statut === 'hors') ? 'var(--warn)' : 'var(--warn)',
                textTransform: 'none', letterSpacing: 0,
              }}>
                {fourchettes.every(f => f.statut === 'ok' || f.statut === 'inconnu') ? '✓ Équilibré'
                  : fourchettes.some(f => f.statut === 'hors') ? '✗ Hors fourchette'
                  : '⚠ À vérifier'}
              </span>
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

            {fourchettes.filter(f => f.conseil || f.conseil_chiffre).map((f, i) => (
              <div key={i} className="note" style={{
                borderColor: f.statut === 'hors' ? 'var(--bad)' : 'var(--warn)',
                marginBottom: 6, fontSize: 12,
              }}>
                {f.conseil && <div>{f.conseil}</div>}
                {f.conseil_chiffre && (
                  <div style={{
                    fontFamily: 'monospace', background: 'var(--bg)', borderRadius: 4,
                    padding: '4px 8px', fontSize: 11, marginTop: f.conseil ? 6 : 0,
                  }}>
                    → {f.conseil_chiffre.description}
                  </div>
                )}
              </div>
            ))}
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
            {c.igbas && <><br />Version IG bas : sucre semoule remplacé par sucre de coco. L'inuline de chicorée contribue à abaisser l'IG global.</>}
          </div>
        </div>

        {/* Fiche ingrédient Supabase */}
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

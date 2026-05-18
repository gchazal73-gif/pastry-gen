'use client';

import { useState } from 'react';

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

  const { texture, description, parfum, masse, contraintes: c, badges, lignes, process: proc, date, rapport, ingredientDb, journal = [], warnings = [] } = recette;
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
            <h3>{texture} {parfum}</h3>
            <div className="sub">{description}</div>
          </div>
          <div className="fiche-meta">
            <div><strong>{formatG(masse)}</strong> de produit fini</div>
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { COMPOSITIONS_ENTREMETS } from '@/lib/data_accords.js';
import { togglePlannifiee }       from '@/lib/compositions-store.js';
import { PARFUMS }                from '@/lib/data.js';
import { TEMPLATES }              from '@/lib/templates.js';

const SAISONS = ['printemps', 'été', 'automne', 'hiver'];

const SAISON_META = {
  printemps: { emoji: '🌸', bg: '#e8f5e9', color: '#2e7d32' },
  été:       { emoji: '☀',  bg: '#fff3e0', color: '#e65100' },
  automne:   { emoji: '🍂', bg: '#fbe9e7', color: '#bf360c' },
  hiver:     { emoji: '❄',  bg: '#e3f2fd', color: '#1565c0' },
};

export default function CompositionsPage() {
  const [filtre,      setFiltre]      = useState(null);
  const [plannifiees, setPlannifiees] = useState([]);
  const [hydrated,    setHydrated]    = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pastry-gen-mes-compositions');
      if (raw) setPlannifiees(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  function handleToggle(id) {
    setPlannifiees(togglePlannifiee(id));
  }

  const nbPlan = plannifiees.length;
  const composFiltrees = COMPOSITIONS_ENTREMETS.filter(c => {
    if (filtre === '_plan') return plannifiees.includes(c.id);
    if (filtre)             return c.saison === filtre;
    return true;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Mes compositions</h1>
        <p className="page-subtitle">
          {hydrated && nbPlan > 0
            ? `${nbPlan} composition${nbPlan > 1 ? 's' : ''} planifiée${nbPlan > 1 ? 's' : ''} · cliquez sur une recette pour la générer`
            : '12 entremets saisonniers — planifiez vos prochaines créations'}
        </p>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <button
          className={filtre === null ? 'primary' : 'secondary'}
          style={{ fontSize: 12, padding: '6px 14px' }}
          onClick={() => setFiltre(null)}
        >
          Toutes ({COMPOSITIONS_ENTREMETS.length})
        </button>
        {SAISONS.map(s => {
          const meta = SAISON_META[s] ?? {};
          const count = COMPOSITIONS_ENTREMETS.filter(c => c.saison === s).length;
          return (
            <button
              key={s}
              className={filtre === s ? 'primary' : 'secondary'}
              style={{ fontSize: 12, padding: '6px 14px' }}
              onClick={() => setFiltre(filtre === s ? null : s)}
            >
              {meta.emoji} {s.charAt(0).toUpperCase() + s.slice(1)} ({count})
            </button>
          );
        })}
        {hydrated && nbPlan > 0 && (
          <button
            className={filtre === '_plan' ? 'primary' : 'secondary'}
            style={{ fontSize: 12, padding: '6px 14px' }}
            onClick={() => setFiltre(filtre === '_plan' ? null : '_plan')}
          >
            ✓ Planifiées ({nbPlan})
          </button>
        )}
      </div>

      {/* Grille */}
      {composFiltrees.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0', fontSize: 14 }}>
          Aucune composition dans ce filtre.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: 16,
        }}>
          {composFiltrees.map(comp => (
            <CarteComposition
              key={comp.id}
              comp={comp}
              planifiee={hydrated && plannifiees.includes(comp.id)}
              onToggle={handleToggle}
              hydrated={hydrated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CarteComposition({ comp, planifiee, onToggle, hydrated }) {
  const meta = SAISON_META[comp.saison] ?? { emoji: '', bg: 'var(--bg)', color: 'var(--muted)' };
  const tpl  = comp.textureIdPrincipal ? TEMPLATES[comp.textureIdPrincipal] : null;
  const genUrl = (comp.textureIdPrincipal && comp.parfumIdPrincipal)
    ? `/?textureId=${comp.textureIdPrincipal}&parfumId=${comp.parfumIdPrincipal}`
    : null;
  const genLabel = tpl ? `Générer ${tpl.label}` : null;

  return (
    <div style={{
      background: 'var(--card)',
      border: planifiee ? '2px solid var(--accent)' : '1px solid var(--line)',
      borderRadius: 10,
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{comp.nom}</div>
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 12,
            background: meta.bg, color: meta.color, fontWeight: 600,
          }}>
            {meta.emoji} {comp.saison}
          </span>
        </div>
        {hydrated && (
          <button
            onClick={() => onToggle(comp.id)}
            style={{
              fontSize: 11, padding: '4px 10px',
              border: `1px solid ${planifiee ? 'var(--accent)' : 'var(--line)'}`,
              borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap',
              background: planifiee ? 'var(--accent)' : 'transparent',
              color: planifiee ? '#fff' : 'var(--ink)',
              fontWeight: planifiee ? 600 : 400,
              flexShrink: 0,
            }}
          >
            {planifiee ? '✓ Planifié' : '+ Planifier'}
          </button>
        )}
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.45 }}>
        {comp.description}
      </p>

      {/* Couches */}
      <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
        <tbody>
          {comp.couches.map((c, i) => (
            <tr key={i}>
              <td style={{
                color: 'var(--muted)', paddingRight: 8, paddingBottom: 3,
                width: 80, verticalAlign: 'top',
              }}>
                {c.couche}
              </td>
              <td style={{ fontWeight: 500, paddingRight: 8, paddingBottom: 3, verticalAlign: 'top' }}>
                {c.texture}
              </td>
              <td style={{ color: 'var(--muted)', paddingBottom: 3, verticalAlign: 'top' }}>
                {c.parfum !== 'nature' ? (PARFUMS[c.parfum]?.label ?? c.parfum) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Lien générateur */}
      {genUrl && (
        <Link
          href={genUrl}
          style={{
            display: 'block', textAlign: 'center', fontSize: 12,
            padding: '8px 12px', border: '1px solid var(--line)',
            borderRadius: 8, color: 'var(--accent)', fontWeight: 600,
            textDecoration: 'none', background: 'var(--bg)',
          }}
        >
          {genLabel} →
        </Link>
      )}
    </div>
  );
}

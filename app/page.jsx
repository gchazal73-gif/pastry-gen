'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import RecipeForm        from '@/components/RecipeForm';
import RecipeFiche       from '@/components/RecipeFiche';
import GrilleComparaison from '@/components/GrilleComparaison';
import {
  genererComparaison,
  colonnesVersions,
  colonnesParfums,
  colonnesTextures,
} from '@/lib/comparaison.js';
import { TEMPLATES }                        from '@/lib/templates.js';
import { PARFUMS, FAMILLE_LABELS, FAMILLE_ORDER } from '@/lib/data.js';

export default function GenerateurPage() {
  const [recette,          setRecette]          = useState(null);
  const [modeComparaison,  setModeComparaison]  = useState(false);
  const [formKey,          setFormKey]          = useState(0);
  const [urlParams,        setUrlParams]        = useState({ textureId: null, parfumId: null });

  // Pré-remplissage du formulaire depuis les paramètres URL (lien "Générer" depuis /compositions)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const tId = p.get('textureId');
    const pId = p.get('parfumId');
    if (tId) {
      setUrlParams({ textureId: tId, parfumId: pId });
      setFormKey(k => k + 1);
    }
  }, []);
  const [comparaison,      setComparaison]      = useState(null);
  const [scenario,         setScenario]         = useState('versions');
  const [formParams,       setFormParams]       = useState(null);
  const [selectedParfums,  setSelectedParfums]  = useState([]);
  const [selectedTextures, setSelectedTextures] = useState([]);

  function regenerer(sc, parfums, textures, params) {
    const p = params ?? formParams;
    if (!p) return;
    let cols;
    if (sc === 'versions') {
      cols = colonnesVersions(p);
    } else if (sc === 'parfums') {
      if (parfums.length < 2) return;
      cols = colonnesParfums({ ...p, parfumIds: parfums.slice(0, 4) });
    } else {
      if (textures.length < 2) return;
      cols = colonnesTextures({ ...p, textureIds: textures.slice(0, 4) });
    }
    setComparaison(genererComparaison({ scenario: sc, colonnes: cols }));
  }

  function handleComparer(params) {
    const tpl = TEMPLATES[params.textureId];
    const initParfums = [
      params.parfumId,
      ...tpl.parfumsCompat.filter(p => p !== params.parfumId && PARFUMS[p]),
    ].slice(0, 4);
    const initTextures = Object.keys(TEMPLATES)
      .filter(id => TEMPLATES[id].parfumsCompat.includes(params.parfumId))
      .slice(0, 4);

    setFormParams(params);
    setSelectedParfums(initParfums);
    setSelectedTextures(initTextures);
    setScenario('versions');
    regenerer('versions', initParfums, initTextures, params);
    setModeComparaison(true);
  }

  function handleChoisir(colonne) {
    setRecette(colonne.recette);
    setModeComparaison(false);
  }

  function changerScenario(sc) {
    setScenario(sc);
    regenerer(sc, selectedParfums, selectedTextures);
  }

  function toggleParfum(id) {
    const next = selectedParfums.includes(id)
      ? selectedParfums.filter(p => p !== id)
      : [...selectedParfums, id];
    if (next.length < 2 || next.length > 4) return;
    setSelectedParfums(next);
    regenerer('parfums', next, selectedTextures);
  }

  function toggleTexture(id) {
    const next = selectedTextures.includes(id)
      ? selectedTextures.filter(t => t !== id)
      : [...selectedTextures, id];
    if (next.length < 2 || next.length > 4) return;
    setSelectedTextures(next);
    regenerer('textures', selectedParfums, next);
  }

  const parfumGroupes = useMemo(() => {
    if (!formParams) return {};
    const groups = {};
    for (const id of TEMPLATES[formParams.textureId].parfumsCompat) {
      if (!PARFUMS[id]) continue;
      const fam = PARFUMS[id].famille;
      if (!fam) continue;
      if (!groups[fam]) groups[fam] = [];
      groups[fam].push(id);
    }
    return groups;
  }, [formParams]);

  const parfumFamilles = FAMILLE_ORDER.filter(f => parfumGroupes[f]);

  const texturesCompat = useMemo(() => {
    if (!formParams) return [];
    return Object.entries(TEMPLATES)
      .filter(([, tpl]) => tpl.parfumsCompat.includes(formParams.parfumId))
      .map(([id, tpl]) => ({ id, label: tpl.label }));
  }, [formParams]);

  /* ── Mode comparaison ─────────────────────────────────────────────────── */

  if (modeComparaison) {
    const tplParfumsCount = formParams
      ? TEMPLATES[formParams.textureId].parfumsCompat.filter(id => PARFUMS[id]).length
      : 0;

    return (
      <div className="page-content">

        {/* Panneau de contrôle */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--line)',
          borderRadius: 10, padding: '16px 20px', marginBottom: 20,
        }}>

          {/* Titre + retour */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            <button
              className="secondary"
              style={{ fontSize: 12, padding: '6px 12px', whiteSpace: 'nowrap' }}
              onClick={() => setModeComparaison(false)}
            >
              ← Retour
            </button>
            <div>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Mode comparaison</span>
              {formParams && (
                <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 8 }}>
                  {TEMPLATES[formParams.textureId]?.label}
                  {formParams.parfumId && PARFUMS[formParams.parfumId]
                    ? ` · ${PARFUMS[formParams.parfumId].label}`
                    : ''}
                </span>
              )}
            </div>
          </div>

          {/* Onglets scénario */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'versions', label: 'Versions',  disabled: false },
              { id: 'parfums',  label: 'Parfums',   disabled: tplParfumsCount < 2 },
              { id: 'textures', label: 'Textures',  disabled: texturesCompat.length < 2 },
            ].map(tab => (
              <button
                key={tab.id}
                className={scenario === tab.id ? 'primary' : 'secondary'}
                style={{ fontSize: 12, padding: '6px 14px' }}
                onClick={() => changerScenario(tab.id)}
                disabled={tab.disabled}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sélecteur parfums */}
          {scenario === 'parfums' && (
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 11, color: 'var(--muted)', margin: '0 0 10px' }}>
                {selectedParfums.length} parfum{selectedParfums.length > 1 ? 's' : ''} sélectionné{selectedParfums.length > 1 ? 's' : ''} — min 2, max 4
              </p>
              {parfumFamilles.map(fam => (
                <div key={fam} style={{ marginBottom: 10 }}>
                  <div style={{
                    fontSize: 10, color: 'var(--muted)', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
                  }}>
                    {FAMILLE_LABELS[fam] ?? fam}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {parfumGroupes[fam].map(id => {
                      const checked = selectedParfums.includes(id);
                      const atMax   = !checked && selectedParfums.length >= 4;
                      const atMin   = checked && selectedParfums.length <= 2;
                      return (
                        <label
                          key={id}
                          style={{
                            display: 'inline-flex', alignItems: 'center', fontSize: 12,
                            padding: '4px 10px', border: '1px solid var(--line)',
                            borderRadius: 20, userSelect: 'none',
                            cursor: (atMax || atMin) ? 'default' : 'pointer',
                            opacity: (atMax || atMin) ? 0.45 : 1,
                            background: checked ? 'var(--accent)' : 'transparent',
                            color: checked ? '#fff' : 'var(--ink)',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleParfum(id)}
                            style={{ display: 'none' }}
                          />
                          {PARFUMS[id].label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sélecteur textures */}
          {scenario === 'textures' && (
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 11, color: 'var(--muted)', margin: '0 0 10px' }}>
                {selectedTextures.length} texture{selectedTextures.length > 1 ? 's' : ''} sélectionnée{selectedTextures.length > 1 ? 's' : ''} — min 2, max 4
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {texturesCompat.map(({ id, label }) => {
                  const checked = selectedTextures.includes(id);
                  const atMax   = !checked && selectedTextures.length >= 4;
                  const atMin   = checked && selectedTextures.length <= 2;
                  return (
                    <label
                      key={id}
                      style={{
                        display: 'inline-flex', alignItems: 'center', fontSize: 12,
                        padding: '4px 10px', border: '1px solid var(--line)',
                        borderRadius: 20, userSelect: 'none',
                        cursor: (atMax || atMin) ? 'default' : 'pointer',
                        opacity: (atMax || atMin) ? 0.45 : 1,
                        background: checked ? 'var(--accent)' : 'transparent',
                        color: checked ? '#fff' : 'var(--ink)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTexture(id)}
                        style={{ display: 'none' }}
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <GrilleComparaison comparaison={comparaison} onChoisir={handleChoisir} />
      </div>
    );
  }

  /* ── Mode générateur normal ───────────────────────────────────────────── */

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Créer une recette</h1>
        <p className="page-subtitle">
          Sélectionne une texture et un ingrédient principal pour générer une recette équilibrée.
        </p>
      </div>
      <div className="layout">
        <RecipeForm
          key={formKey}
          onRecette={setRecette}
          onComparer={handleComparer}
          defaultTextureId={urlParams.textureId}
          defaultParfumId={urlParams.parfumId}
        />
        <RecipeFiche recette={recette} />
      </div>
    </div>
  );
}

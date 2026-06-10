'use client';

import { useState, useEffect } from 'react';
import { TEMPLATES } from '@/lib/templates.js';
import { PARFUMS, CONTRAINTES, FAMILLE_LABELS, FAMILLE_ORDER } from '@/lib/data.js';
import { genererRecette } from '@/lib/engine.js';

export default function RecipeForm({ onRecette, onComparer = null, defaultTextureId = null, defaultParfumId = null }) {
  const textureIds    = Object.keys(TEMPLATES);
  const initTextureId = (defaultTextureId && TEMPLATES[defaultTextureId]) ? defaultTextureId : textureIds[0];

  const [textureId,    setTextureId]    = useState(initTextureId);
  const [masse,        setMasse]        = useState(800);
  const [contraintes,  setContraintes]  = useState([]);
  const [format,       setFormat]       = useState('');
  const [parfumLocalId, setParfumLocalId] = useState(() => {
    const t = TEMPLATES[initTextureId];
    if (defaultParfumId && defaultTextureId && t && t.parfumsCompat.includes(defaultParfumId)) return defaultParfumId;
    return t?.parfumsCompat.find(id => id !== 'nature') ?? t?.parfumsCompat[0] ?? '';
  });

  const tpl = TEMPLATES[textureId];

  // Réinitialiser format et parfum local quand on change de texture
  useEffect(() => {
    const t = TEMPLATES[textureId];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormat(t.formats ? Object.keys(t.formats)[0] : '');
    if (t.parfumsCompat.length > 1) {
      setParfumLocalId(prev => {
        if (prev && t.parfumsCompat.includes(prev)) return prev;
        if (defaultParfumId && t.parfumsCompat.includes(defaultParfumId)) return defaultParfumId;
        return t.parfumsCompat[0] ?? '';
      });
    }
  }, [textureId]);

  function getParfumId() {
    if (tpl.parfumsCompat.length > 1) return parfumLocalId || tpl.parfumsCompat[0] || null;
    return tpl.parfumsCompat[0] || null;
  }

  function handleComparer() {
    const parfumId = getParfumId();
    if (!parfumId) return;
    onComparer?.({ textureId, parfumId, masse, contraintes, format: format || null });
  }

  function toggleContrainte(id) {
    setContraintes(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  function handleGenerer() {
    const parfumId = getParfumId();
    if (!parfumId || !PARFUMS[parfumId]) return;
    const recette = genererRecette({ textureId, parfumId, masse, contraintes, format: format || null });
    onRecette(recette);
  }

  // Grouper les parfums par famille PARFUMS pour les optgroups
  const parfumGroupes = {};
  for (const id of tpl.parfumsCompat) {
    if (id === 'nature') continue;
    const fam = PARFUMS[id]?.famille;
    if (!fam) continue;
    if (!parfumGroupes[fam]) parfumGroupes[fam] = [];
    parfumGroupes[fam].push(id);
  }
  const parfumFamilles = FAMILLE_ORDER.filter(f => parfumGroupes[f]);

  const canGenerate = tpl.parfumsCompat.length <= 1 || !!parfumLocalId;

  return (
    <div className="panel">
      <h2>Paramètres de la recette</h2>

      <div className="field">
        <label htmlFor="texture">Texture</label>
        <select id="texture" value={textureId} onChange={e => setTextureId(e.target.value)}>
          {textureIds.map(id => (
            <option key={id} value={id}>{TEMPLATES[id].label}</option>
          ))}
        </select>
      </div>

      {tpl.parfumsCompat.length > 1 && (
        <div className="field">
          <label htmlFor="parfum-local">Parfum / arôme</label>
          <select
            id="parfum-local"
            value={parfumLocalId}
            onChange={e => setParfumLocalId(e.target.value)}
          >
            {tpl.parfumsCompat.includes('nature') && (
              <option value="nature">Sans infusion (nature)</option>
            )}
            {parfumFamilles.map(fam => (
              <optgroup key={fam} label={FAMILLE_LABELS[fam] ?? fam}>
                {parfumGroupes[fam].map(id => (
                  <option key={id} value={id}>{PARFUMS[id].label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {tpl.formats && (
        <div className="field">
          <label htmlFor="format">Format</label>
          <select id="format" value={format} onChange={e => setFormat(e.target.value)}>
            {Object.entries(tpl.formats).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </div>
      )}

      <div className="field">
        <label htmlFor="masse">Masse cible (g)</label>
        <input
          type="number"
          id="masse"
          value={masse}
          min={50}
          step={50}
          onChange={e => setMasse(parseFloat(e.target.value) || 800)}
        />
      </div>

      <div className="field">
        <label>Contraintes (optionnelles)</label>
        <div className="checks">
          {CONTRAINTES.map(c => (
            <label
              key={c.id}
              className={`check${contraintes.includes(c.id) ? ' active' : ''}`}
            >
              <input
                type="checkbox"
                value={c.id}
                checked={contraintes.includes(c.id)}
                onChange={() => toggleContrainte(c.id)}
              />
              <div>
                <div className="check-label">{c.label}</div>
                <div className="check-desc">{c.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="primary"
          style={{ flex: 1 }}
          onClick={handleGenerer}
          disabled={!canGenerate}
        >
          Générer
        </button>
        {onComparer && (
          <button
            className="secondary"
            style={{ flex: 1 }}
            onClick={handleComparer}
            disabled={!canGenerate}
            title="Comparer 4 versions (classique / sans lactose / vegan / bien-être)"
          >
            Comparer ▤
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { TEMPLATES } from '@/lib/templates.js';
import { PARFUMS, CONTRAINTES, FAMILLE_ORDER, FAMILLE_LABELS } from '@/lib/data.js';
import { genererRecette } from '@/lib/engine.js';

export default function RecipeForm({ onRecette }) {
  const textureIds = Object.keys(TEMPLATES);
  const [textureId, setTextureId] = useState(textureIds[0]);
  const [parfumId, setParfumId] = useState('');
  const [masse, setMasse] = useState(800);
  const [contraintes, setContraintes] = useState([]);

  const parfumsCompat = TEMPLATES[textureId].parfumsCompat;

  useEffect(() => {
    setParfumId(parfumsCompat[0] || '');
  }, [textureId]);

  function toggleContrainte(id) {
    setContraintes(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  function handleGenerer() {
    if (!parfumId) return;
    const recette = genererRecette({ textureId, parfumId, masse, contraintes });
    onRecette(recette);
  }

  const groupes = {};
  for (const pid of parfumsCompat) {
    const fam = PARFUMS[pid].famille;
    if (!groupes[fam]) groupes[fam] = [];
    groupes[fam].push(pid);
  }

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

      <div className="field">
        <label htmlFor="parfum">Ingrédient principal (parfum)</label>
        <select id="parfum" value={parfumId} onChange={e => setParfumId(e.target.value)}>
          {FAMILLE_ORDER.map(fam => {
            if (!groupes[fam] || groupes[fam].length === 0) return null;
            return (
              <optgroup key={fam} label={FAMILLE_LABELS[fam] || fam}>
                {groupes[fam].map(pid => (
                  <option key={pid} value={pid}>{PARFUMS[pid].label}</option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

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

      <button className="primary" onClick={handleGenerer}>Générer la recette</button>
    </div>
  );
}

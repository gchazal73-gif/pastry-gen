'use client';

import { useState, useEffect } from 'react';
import { TEMPLATES } from '@/lib/templates.js';
import { PARFUMS, CONTRAINTES } from '@/lib/data.js';
import { genererRecette } from '@/lib/engine.js';
import { fetchIngredients, fetchTemplateTarget, TEMPLATE_FAMILLES, SUPABASE_TO_PARFUM_V1, FROZEN_TEMPLATES } from '@/lib/ingredient-store.js';
import { autoBalance } from '@/lib/calculator.js';

const FAMILLE_LABELS_FR = {
  fruits_frais:           'Fruits frais',
  purees_fruits:          'Purées de fruits',
  chocolats_couvertures:  'Chocolats & couvertures',
  oleagineux:             'Oléagineux',
};

export default function RecipeForm({ onRecette }) {
  const textureIds = Object.keys(TEMPLATES);
  const [textureId, setTextureId]     = useState(textureIds[0]);
  const [masse, setMasse]             = useState(800);
  const [contraintes, setContraintes] = useState([]);

  // Bibliothèque Supabase
  const [dbIngredients, setDbIngredients]     = useState([]);
  const [selectedDbId, setSelectedDbId]       = useState('');
  const [loadingDb, setLoadingDb]             = useState(false);

  // Charger les ingrédients compatibles avec la texture sélectionnée
  useEffect(() => {
    const familles = TEMPLATE_FAMILLES[textureId];
    if (!familles) return;
    setLoadingDb(true);
    setSelectedDbId('');
    fetchIngredients({ familles })
      .then(data => {
        setDbIngredients(data);
        if (data.length > 0) setSelectedDbId(data[0].id);
      })
      .catch(console.error)
      .finally(() => setLoadingDb(false));
  }, [textureId]);

  function toggleContrainte(id) {
    setContraintes(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  async function handleGenerer() {
    if (!selectedDbId) return;

    // Mapping vers l'ID V1 (PARFUMS)
    const parfumId = SUPABASE_TO_PARFUM_V1[selectedDbId];
    if (!parfumId || !PARFUMS[parfumId]) {
      alert(`Ingrédient "${selectedDbId}" non mappé vers V1 — recette non générée.`);
      return;
    }

    // Vérifier compatibilité avec le template
    const tpl = TEMPLATES[textureId];
    if (!tpl.parfumsCompat.includes(parfumId)) {
      alert(`Ce parfum n'est pas encore compatible avec le template "${tpl.label}".`);
      return;
    }

    // Génération V1
    const recette = genererRecette({ textureId, parfumId, masse, contraintes });

    // Rééquilibrage automatique V2
    const dbIngredient = dbIngredients.find(i => i.id === selectedDbId) ?? null;
    const templateTarget = await fetchTemplateTarget(textureId);
    const rawCibles = templateTarget?.cibles ?? null;
    // PAC non pertinent hors produits glacés
    const cibles = rawCibles && !FROZEN_TEMPLATES.has(textureId)
      ? (({ pac: _pac, ...rest }) => rest)(rawCibles)
      : rawCibles;
    const c = {
      vegan:   contraintes.includes('vegan'),
      lactose: contraintes.includes('lactose') || contraintes.includes('vegan'),
      igbas:   contraintes.includes('igbas'),
    };

    let finalLignes = recette.lignes;
    let rapport = null;
    let journal = [];
    let warnings = [];

    if (cibles) {
      const balanced = autoBalance({ lignes: recette.lignes, mainIngredient: dbIngredient, cibles, masse, contraintes: c });
      finalLignes = balanced.lignes;
      rapport     = balanced.rapport;
      journal     = balanced.journal;
      warnings    = balanced.warnings;
    }

    onRecette({ ...recette, lignes: finalLignes, rapport, journal, warnings, ingredientDb: dbIngredient });
  }

  // Grouper les ingrédients Supabase par famille
  const groupes = {};
  for (const ing of dbIngredients) {
    if (!groupes[ing.famille]) groupes[ing.famille] = [];
    groupes[ing.famille].push(ing);
  }
  const famillesPresentes = Object.keys(groupes).sort();

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
        <label htmlFor="parfum">
          Ingrédient principal
          {loadingDb && <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>chargement…</span>}
        </label>
        <select
          id="parfum"
          value={selectedDbId}
          onChange={e => setSelectedDbId(e.target.value)}
          disabled={loadingDb}
        >
          {dbIngredients.length === 0 && !loadingDb && (
            <option value="">— aucun ingrédient disponible —</option>
          )}
          {famillesPresentes.map(fam => (
            <optgroup key={fam} label={FAMILLE_LABELS_FR[fam] ?? fam}>
              {groupes[fam].map(ing => (
                <option key={ing.id} value={ing.id}>{ing.nom_fr}</option>
              ))}
            </optgroup>
          ))}
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

      <button className="primary" onClick={handleGenerer} disabled={loadingDb || !selectedDbId}>
        Générer la recette
      </button>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { TEMPLATES } from '@/lib/templates.js';
import { PARFUMS, CONTRAINTES, FAMILLE_LABELS, FAMILLE_ORDER } from '@/lib/data.js';
import { genererRecette } from '@/lib/engine.js';
import { fetchIngredients, fetchTemplateTarget, TEMPLATE_FAMILLES, SUPABASE_TO_PARFUM_V1, FROZEN_TEMPLATES } from '@/lib/ingredient-store.js';
import { autoBalance } from '@/lib/calculator.js';
import { reequilibrer } from '@/lib/engine_glaces.js';
import { calculerIndicateurs, calculerBreakdown } from '@/lib/engine_indicateurs.js';
import { verifierFourchettes } from '@/lib/fourchettes.js';
import { conseilsChiffres } from '@/lib/engine_conseils.js';

const FAMILLE_LABELS_SUPA = {
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
  const [format, setFormat]           = useState('');
  const [parfumLocalId, setParfumLocalId] = useState('');

  // Bibliothèque Supabase
  const [dbIngredients, setDbIngredients]     = useState([]);
  const [selectedDbId, setSelectedDbId]       = useState('');
  const [loadingDb, setLoadingDb]             = useState(false);

  const tpl     = TEMPLATES[textureId];
  const hasSupa = !!TEMPLATE_FAMILLES[textureId];
  const isGlace = tpl.famille_texture === 'glaces_sorbets';
  // Sélecteur parfum local : glaces + glaçages + inserts avec plusieurs parfums possibles
  const showLocalParfumSelector = !hasSupa && tpl.parfumsCompat.length > 1;

  // Réinitialiser format et parfum local quand on change de texture
  useEffect(() => {
    const t = TEMPLATES[textureId];
    setFormat(t.formats ? Object.keys(t.formats)[0] : '');
    const needsLocalParfum = !TEMPLATE_FAMILLES[textureId] && t.parfumsCompat.length > 1;
    if (needsLocalParfum) {
      setParfumLocalId(t.parfumsCompat[0] ?? '');
    }
  }, [textureId]);

  // Charger les ingrédients Supabase uniquement pour les templates qui en ont besoin
  useEffect(() => {
    if (!hasSupa) { setDbIngredients([]); setSelectedDbId(''); return; }
    setLoadingDb(true);
    setSelectedDbId('');
    fetchIngredients({ familles: TEMPLATE_FAMILLES[textureId] })
      .then(data => {
        setDbIngredients(data);
        if (data.length > 0) setSelectedDbId(data[0].id);
      })
      .catch(console.error)
      .finally(() => setLoadingDb(false));
  }, [textureId, hasSupa]);

  function toggleContrainte(id) {
    setContraintes(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  async function handleGenerer() {
    let parfumId;
    if (hasSupa) {
      if (!selectedDbId) return;
      parfumId = SUPABASE_TO_PARFUM_V1[selectedDbId];
      if (!parfumId || !PARFUMS[parfumId]) {
        alert(`Ingrédient "${selectedDbId}" non mappé vers V1 — recette non générée.`);
        return;
      }
      if (!tpl.parfumsCompat.includes(parfumId)) {
        alert(`Ce parfum n'est pas encore compatible avec le template "${tpl.label}".`);
        return;
      }
    } else if (showLocalParfumSelector) {
      parfumId = parfumLocalId || tpl.parfumsCompat[0];
      if (!parfumId || !PARFUMS[parfumId]) return;
    } else {
      parfumId = tpl.parfumsCompat[0];
    }

    // Génération V1
    const recette = genererRecette({ textureId, parfumId, masse, contraintes, format: format || null });

    // Rééquilibrage glace V3 (court-circuite le V2 Supabase)
    if (isGlace) {
      const cv = {
        vegan:   contraintes.includes('vegan'),
        lactose: contraintes.includes('lactose') || contraintes.includes('vegan'),
        gluten:  contraintes.includes('gluten'),
        igbas:   contraintes.includes('igbas'),
        format:  format || null,
      };
      const { lignes: lignesR, journal: journalGlace, encarts, warnings } = reequilibrer(recette.lignes, textureId, masse, cv);
      const indicateurs = calculerIndicateurs(lignesR, null);
      const fourchettes = verifierFourchettes(indicateurs, textureId);
      const breakdown = calculerBreakdown(lignesR, null);
      const fourchettesAvecConseils = conseilsChiffres(breakdown, fourchettes);
      onRecette({ ...recette, lignes: lignesR, rapport: null, journal: [], warnings, ingredientDb: null, indicateurs, fourchettes: fourchettesAvecConseils, encarts, journalGlace });
      return;
    }

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
      gluten:  contraintes.includes('gluten'),
      igbas:   contraintes.includes('igbas'),
      format:  format || null,
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

    const indicateurs = calculerIndicateurs(finalLignes, dbIngredient ?? null);
    const fourchettes = verifierFourchettes(indicateurs, textureId);
    const breakdown = calculerBreakdown(finalLignes, dbIngredient ?? null);
    const fourchettesAvecConseils = conseilsChiffres(breakdown, fourchettes);
    onRecette({ ...recette, lignes: finalLignes, rapport, journal, warnings, ingredientDb: dbIngredient, indicateurs, fourchettes: fourchettesAvecConseils, encarts: [], journalGlace: [] });
  }

  // Grouper les ingrédients Supabase par famille
  const groupesSupa = {};
  for (const ing of dbIngredients) {
    if (!groupesSupa[ing.famille]) groupesSupa[ing.famille] = [];
    groupesSupa[ing.famille].push(ing);
  }
  const famillesSupa = Object.keys(groupesSupa).sort();

  // Grouper les textures par famille_texture pour le sélecteur
  const textureGroupes = { _default: [], glaces_sorbets: [], glacages: [], inserts: [] };
  for (const id of textureIds) {
    const fam = TEMPLATES[id].famille_texture ?? '_default';
    if (!textureGroupes[fam]) textureGroupes[fam] = [];
    textureGroupes[fam].push(id);
  }

  // Grouper les parfums locaux (glaces/sorbets) par famille PARFUMS
  const parfumGroupes = {};
  if (isGlace) {
    for (const id of tpl.parfumsCompat) {
      if (id === 'nature') continue;
      const fam = PARFUMS[id]?.famille;
      if (!fam) continue;
      if (!parfumGroupes[fam]) parfumGroupes[fam] = [];
      parfumGroupes[fam].push(id);
    }
  }
  const parfumFamilles = FAMILLE_ORDER.filter(f => parfumGroupes[f]);

  return (
    <div className="panel">
      <h2>Paramètres de la recette</h2>

      <div className="field">
        <label htmlFor="texture">Texture</label>
        <select id="texture" value={textureId} onChange={e => setTextureId(e.target.value)}>
          {textureGroupes['_default'].length > 0 && (
            <optgroup label="Pâtisseries">
              {textureGroupes['_default'].map(id => (
                <option key={id} value={id}>{TEMPLATES[id].label}</option>
              ))}
            </optgroup>
          )}
          {textureGroupes['glaces_sorbets'].length > 0 && (
            <optgroup label="Glaces et sorbets">
              {textureGroupes['glaces_sorbets'].map(id => (
                <option key={id} value={id}>{TEMPLATES[id].label}</option>
              ))}
            </optgroup>
          )}
          {textureGroupes['glacages'].length > 0 && (
            <optgroup label="Glaçages">
              {textureGroupes['glacages'].map(id => (
                <option key={id} value={id}>{TEMPLATES[id].label}</option>
              ))}
            </optgroup>
          )}
          {textureGroupes['inserts'].length > 0 && (
            <optgroup label="Inserts">
              {textureGroupes['inserts'].map(id => (
                <option key={id} value={id}>{TEMPLATES[id].label}</option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Sélecteur Supabase (ganaches, crémeux, mousses, etc.) */}
      {hasSupa && (
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
            {famillesSupa.map(fam => (
              <optgroup key={fam} label={FAMILLE_LABELS_SUPA[fam] ?? fam}>
                {groupesSupa[fam].map(ing => (
                  <option key={ing.id} value={ing.id}>{ing.nom_fr}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {/* Sélecteur local parfum (glaces, sorbets, glaçages, inserts) */}
      {showLocalParfumSelector && (
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

      <button
        className="primary"
        onClick={handleGenerer}
        disabled={loadingDb || (hasSupa && !selectedDbId) || (showLocalParfumSelector && !parfumLocalId)}
      >
        Générer la recette
      </button>
    </div>
  );
}

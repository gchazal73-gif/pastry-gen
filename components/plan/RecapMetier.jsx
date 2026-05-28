'use client';

import { useMemo, useState } from 'react';
import { INGREDIENTS_METIER } from '../../lib/ingredients-metier.js';
import { calculerCoutAvecRatios, formatPrix } from '../../lib/cout.js';
import { getRecetteAllergenes, formatLabelInco } from '../../lib/allergenes.js';
import { calculerDlcRecette, getRecommandationsConservation, DISCLAIMER_DLC } from '../../lib/conservation.js';

function lignesFromRecette(recette, masse) {
  if (recette.type === 'assemblage') {
    const ratio = masse / recette.masse_totale_g;
    return recette.composants.flatMap(comp =>
      comp.ingredients.map(ing => ({ nom: ing.nom, g: ing.pct / 100 * comp.masse_g * ratio }))
    );
  }
  return recette.ingredients.map(ing => ({ nom: ing.nom, g: ing.pct / 100 * masse }));
}

export default function RecapMetier({ slots, recettesMap }) {
  const [coutOpen,  setCoutOpen]  = useState(false);
  const [alOpen,    setAlOpen]    = useState(false);
  const [consOpen,  setConsOpen]  = useState(false);

  const slotsData = useMemo(() =>
    slots.map(s => {
      const recette = recettesMap[s.recetteId];
      if (!recette) return null;
      const masse = Number(s.masse) > 0 ? Number(s.masse) : recette.masse_totale_g;
      return { recette, masse, lignes: lignesFromRecette(recette, masse) };
    }).filter(Boolean),
    [slots, recettesMap],
  );

  const allLignes = useMemo(() => slotsData.flatMap(s => s.lignes), [slotsData]);

  const coutTotal = useMemo(
    () => calculerCoutAvecRatios(allLignes, INGREDIENTS_METIER),
    [allLignes],
  );

  const allergenesTotal = useMemo(
    () => getRecetteAllergenes(allLignes, INGREDIENTS_METIER),
    [allLignes],
  );

  const allergenesLabel = useMemo(
    () => formatLabelInco(allergenesTotal.allergenes_presents, allergenesTotal.traces_possibles),
    [allergenesTotal],
  );

  const dlcMin = useMemo(() => {
    let minJ = null;
    for (const { recette, lignes } of slotsData) {
      const dlc = calculerDlcRecette(lignes, recette.sous_categorie, INGREDIENTS_METIER);
      if (dlc.dlc_finale_j !== null && (minJ === null || dlc.dlc_finale_j < minJ)) {
        minJ = dlc.dlc_finale_j;
      }
    }
    return minJ;
  }, [slotsData]);

  if (slotsData.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>

      {/* Coût matière */}
      <div className="accordion" style={{ marginBottom: 4 }}>
        <button className="accordion-trigger" onClick={() => setCoutOpen(o => !o)}>
          <span>
            Coût matière total
            {!coutOpen && coutTotal.cout_total_eur > 0 && (
              <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>
                {formatPrix(coutTotal.cout_total_eur)} · PVTTC {formatPrix(coutTotal.pvttc_eur)}
              </span>
            )}
          </span>
          <span className={`accordion-arrow${coutOpen ? ' open' : ''}`}>▼</span>
        </button>
        {coutOpen && (
          <div className="accordion-body">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {[
                ['Coût matière', coutTotal.cout_total_eur],
                ['Prix de revient', coutTotal.prix_de_revient_eur],
                ['PVTTC', coutTotal.pvttc_eur],
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '5px 10px', fontSize: 12 }}>
                  <span style={{ color: 'var(--muted)', marginRight: 4 }}>{lbl}</span>
                  <strong>{formatPrix(val)}</strong>
                </div>
              ))}
            </div>
            {slotsData.map(({ recette, masse, lignes }, i) => {
              const c = calculerCoutAvecRatios(lignes, INGREDIENTS_METIER);
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--line)', fontSize: 12 }}>
                  <span>{recette.nom}</span>
                  <span style={{ color: 'var(--muted)' }}>{masse} g · {formatPrix(c.cout_total_eur)}</span>
                </div>
              );
            })}
            {coutTotal.taux_couverture_pct < 100 && (
              <div className="note" style={{ borderColor: 'var(--warn)', fontSize: 12, marginTop: 8 }}>
                ⚠ Couverture {coutTotal.taux_couverture_pct} % — certains ingrédients sans prix.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Allergènes INCO */}
      <div className="accordion" style={{ marginBottom: 4 }}>
        <button className="accordion-trigger" onClick={() => setAlOpen(o => !o)}>
          <span>
            Allergènes INCO — plan complet
            {!alOpen && (
              <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>
                {allergenesTotal.allergenes_presents.length} allergène{allergenesTotal.allergenes_presents.length !== 1 ? 's' : ''}
              </span>
            )}
          </span>
          <span className={`accordion-arrow${alOpen ? ' open' : ''}`}>▼</span>
        </button>
        {alOpen && (
          <div className="accordion-body">
            {allergenesTotal.ingredients_sans_donnees.length > 0 && (
              <div className="note" style={{ borderColor: 'var(--warn)', fontSize: 12, marginBottom: 8 }}>
                ⚠ Données manquantes pour {allergenesTotal.ingredients_sans_donnees.length} ingrédient{allergenesTotal.ingredients_sans_donnees.length > 1 ? 's' : ''}.
              </div>
            )}
            {allergenesLabel.texte ? (
              <div
                style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 14px', fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}
                dangerouslySetInnerHTML={{ __html: allergenesLabel.html }}
              />
            ) : (
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>Aucun allergène majeur identifié.</div>
            )}
            {allergenesTotal.repartition.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '4px 0', borderBottom: '1px solid var(--line)', fontSize: 12 }}>
                <span style={{ fontWeight: 600, minWidth: 120 }}>{r.label}</span>
                <span style={{ color: 'var(--muted)' }}>{r.ingredients.join(', ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conservation */}
      <div className="accordion">
        <button className="accordion-trigger" onClick={() => setConsOpen(o => !o)}>
          <span>
            Conservation — DLC minimale du plan
            {!consOpen && dlcMin !== null && (
              <span style={{ marginLeft: 8, fontSize: 11, color: dlcMin <= 3 ? 'var(--bad)' : 'var(--muted)', fontWeight: 400 }}>
                {dlcMin <= 3 ? '⚠ ' : ''}{dlcMin} j à +4 °C
              </span>
            )}
          </span>
          <span className={`accordion-arrow${consOpen ? ' open' : ''}`}>▼</span>
        </button>
        {consOpen && (
          <div className="accordion-body">
            {dlcMin !== null && (
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                DLC du plan : {dlcMin} j à +4 °C maximum.
              </div>
            )}
            {slotsData.map(({ recette, lignes }, i) => {
              const dlc  = calculerDlcRecette(lignes, recette.sous_categorie, INGREDIENTS_METIER);
              const reco = getRecommandationsConservation(dlc);
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--line)', fontSize: 12 }}>
                  <span>{recette.nom}</span>
                  <span style={{ color: reco.alerte_chaine_froid ? 'var(--bad)' : 'var(--muted)' }}>
                    {dlc.dlc_finale_j !== null ? `${dlc.dlc_finale_j} j` : 'n/a'}
                  </span>
                </div>
              );
            })}
            <div className="note" style={{ fontSize: 11, color: 'var(--muted)', borderColor: 'var(--muted)', marginTop: 10 }}>
              {DISCLAIMER_DLC}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

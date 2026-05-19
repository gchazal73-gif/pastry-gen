'use client';

import { useState, useEffect, useMemo } from 'react';
import { Printer } from 'lucide-react';
import { RECETTES } from '../../../lib/recettes/index.js';
import styles from './imprimer.module.css';

/* ── Helper : accumulation ingrédients (prépas simples + assemblages) ───── */
function accumIngredients(recette, masse, totaux) {
  if (recette.type === 'assemblage') {
    const ratio = masse / recette.masse_totale_g;
    recette.composants.forEach(comp => {
      const compMasse = comp.masse_g * ratio;
      comp.ingredients.forEach(ing => {
        const g = Math.round(ing.pct / 100 * compMasse);
        totaux[ing.nom] = (totaux[ing.nom] ?? 0) + g;
      });
    });
  } else {
    recette.ingredients.forEach(ing => {
      const g = Math.round(ing.pct / 100 * masse);
      totaux[ing.nom] = (totaux[ing.nom] ?? 0) + g;
    });
  }
}

/* ── Sous-composant : tableau ingrédients ────────────────────────────────── */
function TableIngredients({ ingredients, total }) {
  return (
    <table className="ingredients">
      <thead>
        <tr>
          <th>Ingrédient</th>
          <th style={{ textAlign: 'right' }}>g</th>
          <th style={{ textAlign: 'right' }}>%</th>
        </tr>
      </thead>
      <tbody>
        {ingredients.map((ing, i) => (
          <tr key={i}>
            <td>{ing.nom}</td>
            <td className="qty">{ing.g_calc} g</td>
            <td className="pct">{ing.pct} %</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="total">
          <td>Total</td>
          <td className="qty">{total} g</td>
          <td className="pct">100 %</td>
        </tr>
      </tfoot>
    </table>
  );
}

/* ── Sous-composant : fiche technique d'un slot ──────────────────────────── */
function FicheTechnique({ slot, recette, today, isLast }) {
  const masse = Number(slot.masse) > 0 ? Number(slot.masse) : recette.masse_totale_g;
  const { temperature_c, duree_min, mode } = recette.cuisson;
  const cuissonText = [
    temperature_c && `${temperature_c} °C`,
    mode,
    duree_min && `${duree_min} min`,
  ].filter(Boolean).join(' · ');

  const isAssemblage = recette.type === 'assemblage';
  const ratio = masse / recette.masse_totale_g;

  return (
    <div className={`${styles.fiche} ${isLast ? styles.ficheLast : ''}`}>
      <div className={styles.ficheHeader}>
        <div>
          <div className={styles.ficheTitre}>{recette.nom}</div>
          <div className={styles.ficheSous}>
            {recette.sous_categorie.replace(/_/g, ' ')}
            {recette.parfum_principal ? ` · ${recette.parfum_principal}` : ''}
          </div>
        </div>
        <div className={styles.ficheMeta}>
          <span className={styles.ficheMasseVal}>{masse} g</span>
          <span>{today}</span>
        </div>
      </div>

      {isAssemblage ? (
        <>
          {recette.composants.map((comp, ci) => {
            const compMasse = Math.round(comp.masse_g * ratio);
            const compIngs = comp.ingredients.map(ing => ({
              ...ing,
              g_calc: Math.round(ing.pct / 100 * compMasse),
            }));
            return (
              <div key={ci}>
                <div className="section">
                  <h4>{comp.nom} — {compMasse} g</h4>
                  <TableIngredients ingredients={compIngs} total={compMasse} />
                </div>
                <div className="section">
                  <ol className="process">
                    {comp.procede.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                </div>
              </div>
            );
          })}

          {recette.montage?.length > 0 && (
            <div className="section">
              <h4>Montage</h4>
              <ol className="process">
                {recette.montage.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="section">
            <h4>Ingrédients</h4>
            <TableIngredients
              ingredients={recette.ingredients.map(ing => ({
                ...ing,
                g_calc: Math.round(ing.pct / 100 * masse),
              }))}
              total={masse}
            />
          </div>

          <div className="section">
            <h4>Procédé</h4>
            <ol className="process">
              {recette.procede.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        </>
      )}

      {cuissonText && (
        <div className="section">
          <h4>Cuisson</h4>
          <p style={{ margin: 0, fontSize: 14 }}>{cuissonText}</p>
        </div>
      )}

      {recette.note_concepteur && (
        <div className="section">
          <h4>Note du concepteur</h4>
          <div className="note">{recette.note_concepteur}</div>
        </div>
      )}
    </div>
  );
}

/* ── Sous-composant : bon d'économat ─────────────────────────────────────── */
function BonEconomat({ recap, slotsWithRecettes, today, totalGeneral }) {
  return (
    <div className={styles.economat}>
      <div className={styles.economHeader}>
        <div className={styles.economTitle}>Bon d'économat</div>
        <div className={styles.economMeta}>
          <span>Date : {today}</span>
          <span>{slotsWithRecettes.length} préparation{slotsWithRecettes.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="section">
        <h4>Préparations du plan</h4>
        <ul className={styles.economPreps}>
          {slotsWithRecettes.map(({ slot, recette }) => {
            const masse = Number(slot.masse) > 0 ? Number(slot.masse) : recette.masse_totale_g;
            return <li key={slot.uid}>{recette.nom} — {masse} g</li>;
          })}
        </ul>
      </div>

      <div className="section">
        <h4>Ingrédients</h4>
        <table className="ingredients">
          <thead>
            <tr>
              <th>Ingrédient</th>
              <th style={{ textAlign: 'right' }}>Quantité</th>
              <th className={styles.checkCol}>✓</th>
            </tr>
          </thead>
          <tbody>
            {recap.map(([nom, g]) => (
              <tr key={nom}>
                <td>{nom}</td>
                <td className="qty">{g} g</td>
                <td className={styles.checkCol}>□</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total">
              <td>Total</td>
              <td className="qty">{totalGeneral} g</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ── Page principale ─────────────────────────────────────────────────────── */
export default function ImprimerPage() {
  const [slots,    setSlots]    = useState([]);
  const [mode,     setMode]     = useState('fiches');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Lire le mode depuis le hash : #economat → bon d'économat
    if (window.location.hash === '#economat') setMode('economat');

    try {
      const raw = localStorage.getItem('pastry-gen-plan');
      if (raw) setSlots(JSON.parse(raw).slots ?? []);
    } catch {}
    setHydrated(true);
  }, []);

  const recettesMap = useMemo(() => {
    const map = {};
    RECETTES.forEach(r => { map[r.id] = r; });
    return map;
  }, []);

  const slotsWithRecettes = useMemo(() =>
    slots.map(s => ({ slot: s, recette: recettesMap[s.recetteId] })).filter(x => x.recette),
    [slots, recettesMap]
  );

  // Agrégation par nom exact, triée alphabétiquement (fr)
  const recap = useMemo(() => {
    const totaux = {};
    slotsWithRecettes.forEach(({ slot, recette }) => {
      const masse = Number(slot.masse) > 0 ? Number(slot.masse) : recette.masse_totale_g;
      accumIngredients(recette, masse, totaux);
    });
    return Object.entries(totaux).sort((a, b) => a[0].localeCompare(b[0], 'fr'));
  }, [slotsWithRecettes]);

  const totalGeneral = recap.reduce((s, [, g]) => s + g, 0);
  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  if (!hydrated) return null;

  if (slotsWithRecettes.length === 0) {
    return (
      <div className={styles.shell}>
        <div className={styles.controls}>
          <span className={styles.brand}>pastry-gen</span>
        </div>
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--muted)' }}>
          <p style={{ marginBottom: 16 }}>Le plan de travail est vide.</p>
          <button className="secondary" onClick={() => window.close()}>Fermer</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* Barre de contrôle — masquée à l'impression */}
      <div className={styles.controls}>
        <span className={styles.brand}>pastry-gen</span>

        <div className={styles.modeToggle}>
          <button
            className={mode === 'fiches' ? styles.modeActive : styles.modeBtn}
            onClick={() => setMode('fiches')}
          >
            Fiches techniques ({slotsWithRecettes.length})
          </button>
          <button
            className={mode === 'economat' ? styles.modeActive : styles.modeBtn}
            onClick={() => setMode('economat')}
          >
            Bon d'économat
          </button>
        </div>

        <button className={styles.printBtn} onClick={() => window.print()}>
          <Printer size={15} strokeWidth={2} />
          Imprimer
        </button>
      </div>

      {/* Zone imprimable */}
      <div className={styles.printArea}>
        {mode === 'fiches' ? (
          slotsWithRecettes.map(({ slot, recette }, i) => (
            <FicheTechnique
              key={slot.uid}
              slot={slot}
              recette={recette}
              today={today}
              isLast={i === slotsWithRecettes.length - 1}
            />
          ))
        ) : (
          <BonEconomat
            recap={recap}
            slotsWithRecettes={slotsWithRecettes}
            today={today}
            totalGeneral={totalGeneral}
          />
        )}
      </div>
    </div>
  );
}

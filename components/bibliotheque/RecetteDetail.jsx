'use client';

import { useState, useMemo } from 'react';
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import styles from '../../app/bibliotheque/bibliotheque.module.css';
import { computeRecipeNutrition } from '../../lib/nutrition.js';
import { INGREDIENTS_METIER } from '../../lib/ingredients-metier.js';
import { getMergedMetier }     from '../../lib/mercuriale-store.js';
import { calculerCoutAvecRatios, formatPrix } from '../../lib/cout.js';

const STORAGE_KEY = 'pastry-gen-plan';

function genUid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const ROLE_LABELS = {
  mg:        'Matière grasse',
  sucrant:   'Sucrant',
  liant:     'Liant',
  structure: 'Structure',
  aeration:  'Aération',
  parfum:    'Parfum',
  fruit:     'Fruit',
  gelifiant: 'Gélifiant',
  eau:       'Eau',
  emulsion:  'Émulsion',
  texture:   'Texture',
};

const ALLERGEN_LABELS = {
  gluten:         'Gluten',
  oeuf:           'Œufs',
  lactose:        'Lait',
  fruits_a_coque: 'Fruits à coque',
  arachides:      'Arachides',
  soja:           'Soja',
};

const PRESETS = [
  { label: '×0.5', mult: 0.5 },
  { label: '×1',   mult: 1   },
  { label: '×2',   mult: 2   },
];

function lignesFromRecette(recette, masse) {
  const ratio = masse / recette.masse_totale_g;
  if (recette.type === 'assemblage') {
    return recette.composants.flatMap(comp =>
      comp.ingredients.map(ing => ({
        nom: ing.nom,
        g: (ing.pct / 100) * comp.masse_g * ratio,
      }))
    );
  }
  return recette.ingredients.map(ing => ({
    nom: ing.nom,
    g:   (ing.pct / 100) * masse,
  }));
}

function IngredientsTable({ ingredients, total }) {
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
            <td>
              {ing.nom}
              <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {ROLE_LABELS[ing.role] ?? ing.role}
              </span>
            </td>
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

export default function RecetteDetail({ recette, masse, setMasse, onClose }) {
  const [added,       setAdded]       = useState(false);
  const [profilAJR,   setProfilAJR]   = useState('adulte_2000kcal');
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const masseNum = Number(masse) > 0 ? Number(masse) : recette.masse_totale_g;

  const nutrition = useMemo(() => computeRecipeNutrition(recette, profilAJR), [recette, profilAJR]);
  const metier = useMemo(
    () => typeof getMergedMetier === 'function'
      ? getMergedMetier(INGREDIENTS_METIER)
      : INGREDIENTS_METIER,
    [],
  );
  const cout = useMemo(
    () => calculerCoutAvecRatios(lignesFromRecette(recette, masseNum), metier),
    [recette, masseNum, metier],
  );
  const isAssemblage = recette.type === 'assemblage';
  const ratio = masseNum / recette.masse_totale_g;

  function ajouterAuPlan() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : { slots: [] };
      const slots = data.slots ?? [];
      slots.push({ uid: genUid(), recetteId: recette.id, masse: masseNum });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ slots }));
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch {}
  }

  const { temperature_c, duree_min, mode } = recette.cuisson;
  const { service_c, conservation_c } = recette.temperatures;

  return (
    <div className={styles.detailPanel}>
      {/* En-tête */}
      <div className={styles.detailHead}>
        <div>
          <h2 className={styles.detailNom}>{recette.nom}</h2>
          <p className={styles.detailSub}>{recette.sous_categorie.replace(/_/g, ' ')}</p>
        </div>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer le détail">
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {recette.a_verifier && (
        <div style={{ marginBottom: 12 }}>
          <span className="badge warn">⚠ À vérifier</span>
        </div>
      )}

      <p className={styles.detailDesc}>{recette.description}</p>

      {/* Sélecteur de masse */}
      <div className={styles.massSelector}>
        <span className={styles.massLabel}>Masse</span>
        <input
          type="number"
          className={styles.massInput}
          value={masse}
          min={1}
          onChange={e => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v > 0) setMasse(v);
            else if (e.target.value === '') setMasse('');
          }}
          onBlur={() => {
            if (!masse || Number(masse) <= 0) setMasse(recette.masse_totale_g);
          }}
        />
        <span className={styles.massUnit}>g</span>
        <div className={styles.massPresets}>
          {PRESETS.map(({ label, mult }) => {
            const target = Math.round(recette.masse_totale_g * mult);
            return (
              <button
                key={label}
                className={`${styles.massPreset} ${Number(masse) === target ? styles.massPresetActive : ''}`}
                onClick={() => setMasse(target)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        className={`${styles.ajouterBtn}${added ? ` ${styles.ajouterBtnAdded}` : ''}`}
        onClick={ajouterAuPlan}
        disabled={added}
      >
        {added ? '✓ Ajouté au plan' : <><Plus size={14} strokeWidth={2.5} />Ajouter au plan</>}
      </button>

      {isAssemblage ? (
        /* ── Vue assemblage : un accordion par composant ── */
        <>
          {recette.composants.map((comp, ci) => {
            const compMasse = Math.round(comp.masse_g * ratio);
            const compIngs = comp.ingredients.map(ing => ({
              ...ing,
              g_calc: Math.round(ing.pct / 100 * compMasse),
            }));
            return (
              <div key={ci} className="section">
                <h4>{comp.nom} <span style={{ fontWeight: 400, color: 'var(--muted)' }}>— {compMasse} g</span></h4>
                <IngredientsTable ingredients={compIngs} total={compMasse} />
                <ol className="process" style={{ marginTop: 8 }}>
                  {comp.procede.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
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
        /* ── Vue préparation simple ── */
        <>
          <div className="section">
            <h4>Ingrédients</h4>
            <IngredientsTable
              ingredients={recette.ingredients.map(ing => ({
                ...ing,
                g_calc: Math.round(ing.pct / 100 * masseNum),
              }))}
              total={masseNum}
            />
          </div>

          <div className="section">
            <h4>Procédé</h4>
            <ol className="process">
              {recette.procede.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </>
      )}

      {/* Cuisson */}
      {(temperature_c || duree_min || mode) && (
        <div className="section">
          <h4>Cuisson</h4>
          <div className={styles.infoGrid}>
            {temperature_c && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>Température</div>
                <div className={styles.infoValue}>{temperature_c} °C</div>
              </div>
            )}
            {duree_min && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>Durée</div>
                <div className={styles.infoValue}>{duree_min} min</div>
              </div>
            )}
            {mode && (
              <div className={`${styles.infoItem} ${!temperature_c ? '' : styles.infoItemFull}`}>
                <div className={styles.infoLabel}>Mode</div>
                <div className={styles.infoValue}>{mode}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Températures */}
      {(service_c || conservation_c) && (
        <div className="section">
          <h4>Températures</h4>
          <div className={styles.infoGrid}>
            {service_c && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>Service</div>
                <div className={styles.infoValue}>{service_c} °C</div>
              </div>
            )}
            {conservation_c && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>Conservation</div>
                <div className={styles.infoValue}>{conservation_c} °C</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Allergènes */}
      {recette.allergenes.length > 0 && (
        <div className="section">
          <h4>Allergènes</h4>
          <div className="badges">
            {recette.allergenes.map(a => (
              <span key={a} className="badge warn">{ALLERGEN_LABELS[a] ?? a}</span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {recette.tags.length > 0 && (
        <div className="section">
          <h4>Tags</h4>
          <div className={styles.tags}>
            {recette.tags.map(t => (
              <span key={t} className={styles.tag}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Note du concepteur */}
      {recette.note_concepteur && (
        <div className="section">
          <h4>Note du concepteur</h4>
          <div className="note">{recette.note_concepteur}</div>
        </div>
      )}

      {/* Coût matière */}
      {cout.cout_total_eur > 0 && (
        <div className="section">
          <h4>Coût matière</h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Coût matière</div>
              <div className={styles.infoValue}>{formatPrix(cout.cout_total_eur)}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Pour 100 g</div>
              <div className={styles.infoValue}>{formatPrix(cout.cout_pour_100g_eur * 100)}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Prix de revient</div>
              <div className={styles.infoValue}>{formatPrix(cout.prix_de_revient_eur)}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>PVTTC estimé</div>
              <div className={styles.infoValue} style={{ fontWeight: 600, color: 'var(--accent)' }}>
                {formatPrix(cout.pvttc_eur)}
              </div>
            </div>
          </div>
          {cout.taux_couverture_pct < 100 && (
            <div className="note" style={{ fontSize: 11, marginTop: 6, borderColor: 'var(--warn)' }}>
              ⚠ Couverture {cout.taux_couverture_pct} % — {cout.ingredients_sans_prix.length} ingrédient{cout.ingredients_sans_prix.length > 1 ? 's' : ''} sans prix.
            </div>
          )}
        </div>
      )}

      {/* Valeurs nutritionnelles */}
      {nutrition.per_100g && (
        <div className={`section ${styles.nutritionSection}`}>
          <div className={styles.nutritionHeader}>
            <h4 style={{ margin: 0 }}>Pour 100 g de produit fini</h4>
            <select
              className={styles.profilSelect}
              value={profilAJR}
              onChange={e => setProfilAJR(e.target.value)}
            >
              <option value="adulte_2000kcal">Adulte 2000 kcal</option>
              <option value="femme_1800kcal">Femme 1800 kcal</option>
            </select>
          </div>

          <NutritionTable per_100g={nutrition.per_100g} ajr={nutrition.ajr_pct_per_100g} />
          <AJRBarChart ajr={nutrition.ajr_pct_per_100g} />

          {nutrition.breakdown_par_composant.length > 1 && (
            <div className={styles.breakdown}>
              <button
                className={styles.breakdownToggle}
                onClick={() => setBreakdownOpen(o => !o)}
              >
                Détail par composant
                {breakdownOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
              {breakdownOpen && (
                <table className={`ingredients ${styles.breakdownTable}`}>
                  <thead>
                    <tr>
                      <th>Composant</th>
                      <th style={{ textAlign: 'right' }}>Masse</th>
                      <th style={{ textAlign: 'right' }}>%</th>
                      <th style={{ textAlign: 'right' }}>kcal/100g</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nutrition.breakdown_par_composant.map((b, i) => (
                      <tr key={i}>
                        <td>{b.nom}</td>
                        <td className="qty">{b.masse_g} g</td>
                        <td className="pct">{b.masse_pct} %</td>
                        <td className="qty">{b.kcal_100g}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {nutrition.warnings.length > 0 && (
            <div className={styles.nutritionWarnings}>
              {nutrition.warnings.map((w, i) => (
                <div key={i} className={styles.nutritionWarning}>⚠ {w}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sous-composants nutrition ─────────────────────────────────────────────────

const AJR_LEVEL_CLASS = {
  low:      styles.ajrLow,
  moderate: styles.ajrModerate,
  high:     styles.ajrHigh,
  critical: styles.ajrCritical,
};

function ajrLevel(pct) {
  if (pct < 7.5) return 'low';
  if (pct < 15)  return 'moderate';
  if (pct < 30)  return 'high';
  return 'critical';
}

const NUTRITION_ROWS = [
  { key: 'energie',  label: 'Énergie',             unit: 'kcal', valueKey: 'kcal',              indent: false },
  { key: 'lipides',  label: 'Lipides',              unit: 'g',    valueKey: 'lipides_g',         indent: false },
  { key: 'satures',  label: 'dont acides saturés',  unit: 'g',    valueKey: 'lipides_satures_g', indent: true  },
  { key: 'glucides', label: 'Glucides',              unit: 'g',    valueKey: 'glucides_g',        indent: false },
  { key: 'sucres',   label: 'dont sucres',           unit: 'g',    valueKey: 'sucres_g',          indent: true  },
  { key: 'protides', label: 'Protéines',             unit: 'g',    valueKey: 'protides_g',        indent: false },
  { key: 'fibres',   label: 'Fibres',                unit: 'g',    valueKey: 'fibres_g',          indent: false },
  { key: 'sel',      label: 'Sel',                   unit: 'g',    valueKey: 'sel_g',             indent: false },
];

function NutritionTable({ per_100g, ajr }) {
  return (
    <table className={`ingredients ${styles.nutritionTable}`}>
      <thead>
        <tr>
          <th>Nutriment</th>
          <th style={{ textAlign: 'right' }}>Pour 100 g</th>
          <th style={{ textAlign: 'right' }}>% AJR</th>
        </tr>
      </thead>
      <tbody>
        {NUTRITION_ROWS.map(({ key, label, unit, valueKey, indent }) => {
          const val  = per_100g[valueKey] ?? 0;
          const pct  = ajr[key] ?? 0;
          const lvl  = ajrLevel(pct);
          return (
            <tr key={key}>
              <td style={indent ? { paddingLeft: 18, color: 'var(--muted)' } : undefined}>{label}</td>
              <td className="qty">{val} {unit}</td>
              <td className={`pct ${AJR_LEVEL_CLASS[lvl]}`}>{pct} %</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const BAR_ROWS = [
  { key: 'energie',  label: 'Énergie'  },
  { key: 'lipides',  label: 'Lipides'  },
  { key: 'satures',  label: 'Saturés'  },
  { key: 'glucides', label: 'Glucides' },
  { key: 'sucres',   label: 'Sucres'   },
  { key: 'protides', label: 'Protéines'},
  { key: 'fibres',   label: 'Fibres'   },
  { key: 'sel',      label: 'Sel'      },
];

function AJRBarChart({ ajr }) {
  return (
    <div className={styles.ajrChart}>
      <div className={styles.ajrChartLabel}>% AJR pour 100 g</div>
      {BAR_ROWS.map(({ key, label }) => {
        const pct = ajr[key] ?? 0;
        const lvl = ajrLevel(pct);
        const width = Math.min(100, pct);
        return (
          <div key={key} className={styles.ajrRow}>
            <span className={styles.ajrBarLabel}>{label}</span>
            <div className={styles.ajrBarTrack}>
              <div
                className={`${styles.ajrBarFill} ${AJR_LEVEL_CLASS[lvl]}`}
                style={{ width: `${width}%` }}
              />
              {pct > 100 && <div className={styles.ajrOverflow} />}
            </div>
            <span className={`${styles.ajrBarPct} ${AJR_LEVEL_CLASS[lvl]}`}>{pct} %</span>
          </div>
        );
      })}
    </div>
  );
}

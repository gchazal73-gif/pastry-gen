'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from '../../app/plan-de-travail/plan.module.css';

const NUTRITION_ROWS = [
  { key: 'energie',  label: 'Énergie',            unit: 'kcal', valueKey: 'kcal',              indent: false },
  { key: 'lipides',  label: 'Lipides',             unit: 'g',    valueKey: 'lipides_g',         indent: false },
  { key: 'satures',  label: 'dont acides saturés', unit: 'g',    valueKey: 'lipides_satures_g', indent: true  },
  { key: 'glucides', label: 'Glucides',             unit: 'g',    valueKey: 'glucides_g',        indent: false },
  { key: 'sucres',   label: 'dont sucres',          unit: 'g',    valueKey: 'sucres_g',          indent: true  },
  { key: 'protides', label: 'Protéines',            unit: 'g',    valueKey: 'protides_g',        indent: false },
  { key: 'fibres',   label: 'Fibres',               unit: 'g',    valueKey: 'fibres_g',          indent: false },
  { key: 'sel',      label: 'Sel',                  unit: 'g',    valueKey: 'sel_g',             indent: false },
];

const BAR_ROWS = [
  { key: 'energie',  label: 'Énergie'   },
  { key: 'lipides',  label: 'Lipides'   },
  { key: 'satures',  label: 'Saturés'   },
  { key: 'glucides', label: 'Glucides'  },
  { key: 'sucres',   label: 'Sucres'    },
  { key: 'protides', label: 'Protéines' },
  { key: 'fibres',   label: 'Fibres'    },
  { key: 'sel',      label: 'Sel'       },
];

const CATEGORIE_LABELS = {
  biscuits:      'Biscuit',
  cremes:        'Crème',
  mousses:       'Mousse',
  croustillants: 'Croustillant',
  pates:         'Pâte / fond',
  ganaches:      'Ganache',
  glacages:      'Glaçage',
  glaces_sorbets:'Glace',
  decors:        'Décor',
  assemblages:   'Assemblage',
};

function ajrLevel(pct) {
  if (pct < 7.5) return 'low';
  if (pct < 15)  return 'moderate';
  if (pct < 30)  return 'high';
  return 'critical';
}

const LEVEL_CLASS = {
  low:      styles.ajrLow,
  moderate: styles.ajrModerate,
  high:     styles.ajrHigh,
  critical: styles.ajrCritical,
};

function NutritionTable({ per_100g, ajr }) {
  return (
    <table className={`ingredients ${styles.nutriTable}`}>
      <thead>
        <tr>
          <th>Nutriment</th>
          <th style={{ textAlign: 'right' }}>Pour 100 g</th>
          <th style={{ textAlign: 'right' }}>% AJR</th>
        </tr>
      </thead>
      <tbody>
        {NUTRITION_ROWS.map(({ key, label, unit, valueKey, indent }) => {
          const val = per_100g[valueKey] ?? 0;
          const pct = ajr[key] ?? 0;
          const lvl = ajrLevel(pct);
          return (
            <tr key={key}>
              <td style={indent ? { paddingLeft: 18, color: 'var(--muted)' } : undefined}>{label}</td>
              <td className="qty">{val} {unit}</td>
              <td className={`pct ${LEVEL_CLASS[lvl]}`}>{pct} %</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

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
                className={`${styles.ajrBarFill} ${LEVEL_CLASS[lvl]}`}
                style={{ width: `${width}%` }}
              />
              {pct > 100 && <div className={styles.ajrOverflow} />}
            </div>
            <span className={`${styles.ajrBarPct} ${LEVEL_CLASS[lvl]}`}>{pct} %</span>
          </div>
        );
      })}
    </div>
  );
}

export default function RecapNutrition({ planNutrition, profilAJR, onProfilChange }) {
  const [detailOpen, setDetailOpen] = useState(false);

  if (!planNutrition?.per_100g) return null;

  const { per_100g, ajr_pct_per_100g, breakdown, warnings } = planNutrition;

  return (
    <div className={styles.nutriPanel}>
      <div className={styles.nutriHeader}>
        <p className={styles.recapTitle} style={{ margin: 0 }}>Pour 100 g de produit fini</p>
        <select
          className={styles.nutriProfilSelect}
          value={profilAJR}
          onChange={e => onProfilChange(e.target.value)}
        >
          <option value="adulte_2000kcal">Adulte 2000 kcal</option>
          <option value="femme_1800kcal">Femme 1800 kcal</option>
        </select>
      </div>

      <NutritionTable per_100g={per_100g} ajr={ajr_pct_per_100g} />
      <AJRBarChart ajr={ajr_pct_per_100g} />

      {breakdown.length > 1 && (
        <div className={styles.nutriBreakdown}>
          <button
            className={styles.nutriBreakdownToggle}
            onClick={() => setDetailOpen(o => !o)}
          >
            Détail par composant
            {detailOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {detailOpen && (
            <table className={`ingredients ${styles.nutriBreakdownTable}`}>
              <thead>
                <tr>
                  <th>Composant</th>
                  <th style={{ textAlign: 'right' }}>Masse</th>
                  <th style={{ textAlign: 'right' }}>%</th>
                  <th style={{ textAlign: 'right' }}>kcal/100g</th>
                  <th style={{ textAlign: 'right' }}>Contrib.</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((b, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{b.nom}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {CATEGORIE_LABELS[b.categorie] ?? b.categorie}
                      </div>
                    </td>
                    <td className="qty">{b.masse_finale_g} g</td>
                    <td className="pct">{b.masse_pct} %</td>
                    <td className="qty">{b.kcal_100g}</td>
                    <td className="pct">{b.contribution_pct_kcal} %</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total">
                  <td>Total</td>
                  <td className="qty">{planNutrition.masse_totale_finale_g} g</td>
                  <td className="pct">100 %</td>
                  <td className="qty">{per_100g.kcal}</td>
                  <td className="pct">100 %</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}

      {warnings.length > 0 && (
        <div className={styles.nutriWarnings}>
          {[...new Set(warnings)].map((w, i) => (
            <div key={i} className={styles.nutriWarning}>⚠ {w}</div>
          ))}
        </div>
      )}
    </div>
  );
}

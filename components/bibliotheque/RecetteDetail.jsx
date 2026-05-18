'use client';

import { X } from 'lucide-react';
import styles from '../../app/bibliotheque/bibliotheque.module.css';

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

export default function RecetteDetail({ recette, masse, setMasse, onClose }) {
  const masseNum = Number(masse) > 0 ? Number(masse) : recette.masse_totale_g;

  const ingredients = recette.ingredients.map(ing => ({
    ...ing,
    g_calc: Math.round(ing.pct / 100 * masseNum),
  }));

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

      {/* Ingrédients */}
      <div className="section">
        <h4>Ingrédients</h4>
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
              <td className="qty">{masseNum} g</td>
              <td className="pct">100 %</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Procédé */}
      <div className="section">
        <h4>Procédé</h4>
        <ol className="process">
          {recette.procede.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Cuisson */}
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
    </div>
  );
}

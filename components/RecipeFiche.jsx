'use client';

function formatG(g) {
  if (g >= 100) return `${g.toFixed(0)} g`;
  if (g >= 10)  return `${g.toFixed(1)} g`;
  return `${g.toFixed(2)} g`;
}

export default function RecipeFiche({ recette }) {
  if (!recette) {
    return (
      <div id="output">
        <div className="empty">
          <div className="icon">·  ·  ·</div>
          <div>Choisis une texture, un parfum et clique sur <strong>Générer la recette</strong>.</div>
        </div>
      </div>
    );
  }

  const { texture, description, parfum, masse, contraintes: c, badges, lignes, process, date } = recette;
  const totalG = lignes.reduce((s, l) => s + l.g, 0);

  const badgesRendus = badges.length > 0
    ? badges.map((b, i) => <span key={i} className={`badge ${b.type}`}>{b.label}</span>)
    : <span className="badge">Recette classique</span>;

  function copierFiche() {
    const fiche = document.getElementById('fiche');
    if (!fiche) return;
    const range = document.createRange();
    range.selectNode(fiche);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    try {
      document.execCommand('copy');
      alert('Fiche copiée dans le presse-papier.');
    } catch {
      alert('Impossible de copier. Sélectionne manuellement.');
    }
    sel.removeAllRanges();
  }

  return (
    <div id="output">
      <div className="fiche-actions">
        <button className="secondary" onClick={() => window.print()}>Imprimer / Export PDF</button>
        <button className="secondary" onClick={copierFiche}>Copier en texte</button>
      </div>

      <div className="fiche" id="fiche">
        <div className="fiche-head">
          <div className="fiche-title">
            <h3>{texture} {parfum}</h3>
            <div className="sub">{description}</div>
          </div>
          <div className="fiche-meta">
            <div><strong>{formatG(masse)}</strong> de produit fini</div>
            <div>Édité le {date}</div>
          </div>
        </div>

        <div className="badges">{badgesRendus}</div>

        <div className="section">
          <h4>Recette — ingrédients</h4>
          <table className="ingredients">
            <thead>
              <tr>
                <th>Rôle</th>
                <th>Ingrédient</th>
                <th style={{ textAlign: 'right' }}>%</th>
                <th style={{ textAlign: 'right' }}>Quantité</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l, i) => (
                <tr key={i}>
                  <td className="role">{l.role}</td>
                  <td>
                    {l.ingredient}
                    {l.note && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{l.note}</div>}
                  </td>
                  <td className="pct">{l.pct.toFixed(1)} %</td>
                  <td className="qty">{formatG(l.g)}</td>
                </tr>
              ))}
              <tr className="total">
                <td></td>
                <td>Total</td>
                <td className="pct">100,0 %</td>
                <td className="qty">{formatG(totalG)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section">
          <h4>Mode opératoire</h4>
          <ol className="process">
            {process.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>

        <div className="section">
          <h4>Note du concepteur</h4>
          <div className="note">
            Recette construite selon une logique fonctionnelle : chaque ligne porte un rôle
            (parfum, gélifiant, émulsifiant, etc.) qui permet de substituer un ingrédient
            par un autre de même fonction. Les pourcentages sont exprimés sur la masse
            totale du produit fini.
            {c.vegan && <><br />Version vegan : gélatine remplacée par pectine NH (amidée), crème par lait de coco, jaunes par lécithine de tournesol.</>}
            {c.igbas && <><br />Version IG bas : sucre semoule remplacé par sucre de coco. L'inuline de chicorée contribue à abaisser l'IG global.</>}
          </div>
        </div>
      </div>
    </div>
  );
}

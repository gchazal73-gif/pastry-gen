/* =====================================================================
   MOTEUR + UI — assemble la recette à partir d'un template
   et gère l'interaction utilisateur.
   ===================================================================== */

// ---------- Calcule la recette pour un texture / parfum / contraintes ----------
function genererRecette({ textureId, parfumId, masse, contraintes }) {
  const tpl = TEMPLATES[textureId];
  if (!tpl) throw new Error("Texture inconnue : " + textureId);

  const c = {
    vegan:   contraintes.includes("vegan"),
    lactose: contraintes.includes("lactose") || contraintes.includes("vegan"),
    gluten:  contraintes.includes("gluten"),
    igbas:   contraintes.includes("igbas")
  };

  // 1) construire les lignes brutes
  const lignes = [];
  for (const l of tpl.lines) {
    const actif = l.actif ? l.actif(parfumId, c) : true;
    if (!actif) continue;
    const ing = l.getIngredient(parfumId, c);
    if (!ing || !ing.nom) continue;
    const pct = l.pctOverride ? l.pctOverride(parfumId, c) : l.pct;
    if (pct <= 0) continue;
    lignes.push({ role: l.label, ingredient: ing.nom, note: ing.note || null, pct });
  }

  // 2) normaliser à 100 % via la phase aqueuse / eau
  const totalPct = lignes.reduce((s, l) => s + l.pct, 0);
  if (Math.abs(totalPct - 100) > 0.01) {
    const idxAjust = lignes.findIndex(l => /eau|phase aqueuse/i.test(l.role));
    if (idxAjust >= 0) {
      const delta = 100 - totalPct;
      lignes[idxAjust].pct = Math.max(0, lignes[idxAjust].pct + delta);
    } else {
      lignes.forEach(l => l.pct = l.pct * (100 / totalPct));
    }
  }

  // 3) grammes
  for (const l of lignes) l.g = (l.pct * masse) / 100;

  // 4) badges
  const badges = [];
  if (c.vegan)                  badges.push({ label: "Vegan", type: "ok" });
  if (c.lactose && !c.vegan)    badges.push({ label: "Sans lactose", type: "ok" });
  if (c.gluten)                 badges.push({ label: "Sans gluten", type: "ok" });
  if (c.igbas)                  badges.push({ label: "IG bas", type: "ok" });

  return {
    texture: tpl.label,
    description: tpl.description,
    parfum: PARFUMS[parfumId].label,
    masse,
    contraintes: c,
    badges,
    lignes,
    process: tpl.process(parfumId, c),
    date: new Date().toLocaleDateString("fr-FR")
  };
}

// ---------- Initialisation de l'interface ----------
function initUI() {
  // sélecteur de texture
  const selTexture = document.getElementById("texture");
  for (const [id, t] of Object.entries(TEMPLATES)) {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = t.label;
    selTexture.appendChild(opt);
  }

  // sélecteur de parfum (rafraîchi à chaque changement de texture)
  const selParfum = document.getElementById("parfum");
  function refreshParfums() {
    const tpl = TEMPLATES[selTexture.value];
    selParfum.innerHTML = "";
    const groups = {};
    for (const pid of tpl.parfumsCompat) {
      const fam = PARFUMS[pid].famille;
      if (!groups[fam]) groups[fam] = [];
      groups[fam].push(pid);
    }
    for (const fam of FAMILLE_ORDER) {
      if (!groups[fam] || groups[fam].length === 0) continue;
      const og = document.createElement("optgroup");
      og.label = FAMILLE_LABELS[fam] || fam;
      for (const pid of groups[fam]) {
        const opt = document.createElement("option");
        opt.value = pid;
        opt.textContent = PARFUMS[pid].label;
        og.appendChild(opt);
      }
      selParfum.appendChild(og);
    }
  }
  selTexture.addEventListener("change", refreshParfums);
  refreshParfums();

  // contraintes
  const wrap = document.getElementById("contraintes");
  for (const c of CONTRAINTES) {
    const div = document.createElement("label");
    div.className = "check";
    div.innerHTML = `
      <input type="checkbox" value="${c.id}">
      <div>
        <div class="check-label">${c.label}</div>
        <div class="check-desc">${c.desc}</div>
      </div>`;
    const input = div.querySelector("input");
    input.addEventListener("change", () => div.classList.toggle("active", input.checked));
    wrap.appendChild(div);
  }

  // bouton générer
  document.getElementById("generer").addEventListener("click", () => {
    const contraintes = Array.from(document.querySelectorAll("#contraintes input:checked")).map(i => i.value);
    const r = genererRecette({
      textureId: selTexture.value,
      parfumId: selParfum.value,
      masse: parseFloat(document.getElementById("masse").value) || 800,
      contraintes
    });
    renderRecette(r);
  });
}

// ---------- Rendu de la fiche-recette ----------
function renderRecette(r) {
  const out = document.getElementById("output");
  const c = r.contraintes;

  let badges = r.badges.map(b => `<span class="badge ${b.type}">${b.label}</span>`).join("");
  if (!badges) badges = `<span class="badge">Recette classique</span>`;

  const rows = r.lignes.map(l => `
    <tr>
      <td class="role">${l.role}</td>
      <td>
        ${l.ingredient}
        ${l.note ? `<div style="font-size:12px;color:var(--muted);margin-top:2px">${l.note}</div>` : ""}
      </td>
      <td class="pct">${l.pct.toFixed(1)} %</td>
      <td class="qty">${formatG(l.g)}</td>
    </tr>
  `).join("");

  const totalG = r.lignes.reduce((s, l) => s + l.g, 0);

  out.innerHTML = `
    <div class="fiche-actions">
      <button class="secondary" onclick="window.print()">Imprimer / Export PDF</button>
      <button class="secondary" onclick="copierFiche()">Copier en texte</button>
    </div>

    <div class="fiche" id="fiche">
      <div class="fiche-head">
        <div class="fiche-title">
          <h3>${r.texture} ${r.parfum}</h3>
          <div class="sub">${r.description}</div>
        </div>
        <div class="fiche-meta">
          <div><strong>${formatG(r.masse)}</strong> de produit fini</div>
          <div>Édité le ${r.date}</div>
        </div>
      </div>

      <div class="badges">${badges}</div>

      <div class="section">
        <h4>Recette — ingrédients</h4>
        <table class="ingredients">
          <thead>
            <tr>
              <th>Rôle</th>
              <th>Ingrédient</th>
              <th style="text-align:right">%</th>
              <th style="text-align:right">Quantité</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="total">
              <td></td>
              <td>Total</td>
              <td class="pct">100,0 %</td>
              <td class="qty">${formatG(totalG)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <h4>Mode opératoire</h4>
        <ol class="process">
          ${r.process.map(s => `<li>${s}</li>`).join("")}
        </ol>
      </div>

      <div class="section">
        <h4>Note du concepteur</h4>
        <div class="note">
          Recette construite selon une logique fonctionnelle : chaque ligne porte un rôle
          (parfum, gélifiant, émulsifiant, etc.) qui permet de substituer un ingrédient
          par un autre de même fonction. Les pourcentages sont exprimés sur la masse
          totale du produit fini.
          ${c.vegan ? "<br>Version vegan : gélatine remplacée par pectine NH (amidée), crème par lait de coco, jaunes par lécithine de tournesol." : ""}
          ${c.igbas ? "<br>Version IG bas : sucre semoule remplacé par sucre de coco. L'inuline de chicorée contribue à abaisser l'IG global." : ""}
        </div>
      </div>
    </div>
  `;
}

// ---------- Petits utilitaires ----------
function formatG(g) {
  if (g >= 100) return `${g.toFixed(0)} g`;
  if (g >= 10)  return `${g.toFixed(1)} g`;
  return `${g.toFixed(2)} g`;
}

function copierFiche() {
  const fiche = document.getElementById("fiche");
  if (!fiche) return;
  const range = document.createRange();
  range.selectNode(fiche);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  try {
    document.execCommand("copy");
    alert("Fiche copiée dans le presse-papier.");
  } catch (e) {
    alert("Impossible de copier. Sélectionne manuellement et copie.");
  }
  sel.removeAllRanges();
}

// ---------- Démarrage ----------
document.addEventListener("DOMContentLoaded", initUI);

import { PARFUMS } from './data.js';
import { TEMPLATES } from './templates.js';

export function genererRecette({ textureId, parfumId, masse, contraintes, format = null }) {
  const tpl = TEMPLATES[textureId];
  if (!tpl) throw new Error("Texture inconnue : " + textureId);

  const bien_etre = contraintes.includes("bien_etre");
  const c = {
    vegan:     contraintes.includes("vegan"),
    lactose:   contraintes.includes("lactose") || contraintes.includes("vegan"),
    gluten:    contraintes.includes("gluten"),
    igbas:     contraintes.includes("igbas") || bien_etre,
    bien_etre,
    format,
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
    const dataKey = typeof l.dataKey === 'function' ? l.dataKey(parfumId, c) : (l.dataKey ?? null);
    lignes.push({ role: l.label, ingredient: ing.nom, note: ing.note || null, pct, dataKey });
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
  if (c.vegan)                      badges.push({ label: "Vegan", type: "ok" });
  if (c.lactose && !c.vegan)        badges.push({ label: "Sans lactose", type: "ok" });
  if (c.gluten)                     badges.push({ label: "Sans gluten", type: "ok" });
  if (c.igbas && !c.bien_etre)      badges.push({ label: "IG bas", type: "ok" });
  if (c.bien_etre)                  badges.push({ label: "Bien-être", type: "ok" });

  const formatLabel = (format && tpl.formats) ? (tpl.formats[format] ?? null) : null;

  return {
    texture: tpl.label,
    description: tpl.description,
    parfum: PARFUMS[parfumId].label,
    masse,
    contraintes: c,
    formatLabel,
    badges,
    lignes,
    process: tpl.process(parfumId, c),
    date: new Date().toLocaleDateString("fr-FR")
  };
}


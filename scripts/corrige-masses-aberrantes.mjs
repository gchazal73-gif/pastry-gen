#!/usr/bin/env node
/**
 * Corrige les lignes dont le poids a reçu le facteur kilo une fois de trop.
 *
 * Symptôme : une recette pèse des centaines de kilos parce qu'une de ses lignes
 * vaut exactement 1 000 fois sa valeur plausible. Vérifié sur les fiches
 * sources (`recettes-extraites/_uniques.json`) :
 *
 *   Crème anglaise à la menthe   crème liquide  1 500 000 g   -> 1 500 g
 *   Madeleine au miel béton      sucre          1 300 000 g   -> 1 300 g
 *   Appareil macaron à la rose   tant pour tant   780 000 g   ->   780 g
 *   Sirop à 30°B                 sucre semoule    500 000 g   ->   500 g
 *
 * Dans la fiche « Madeleine », le libellé source porte encore les quantités
 * d'origine (« Sucre 650 g ») et toutes les autres lignes ont été doublées par
 * le parseur : 1 300 g est bien la valeur cohérente avec le reste de la fiche.
 * Les quatre divisions tombent sur des recettes plausibles, et c'est le critère
 * retenu — pas une intuition sur le chiffre.
 *
 * Une ligne n'est corrigée que si les quatre conditions tiennent :
 *   - la recette dépasse 50 kg, ce qui n'a pas de sens pour une préparation ;
 *   - une seule ligne fait plus de 90 % de la masse ;
 *   - divisée par 1 000, cette ligne redevient du même ordre que les autres ;
 *   - la recette retombe entre 100 g et 50 kg.
 *
 *   node scripts/corrige-masses-aberrantes.mjs           # rapport
 *   node scripts/corrige-masses-aberrantes.mjs --write   # applique
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIB = join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'recettes');
const ECRIRE = process.argv.includes('--write');

const RX_ID = /\bid:\s*['"]([^'"]+)['"]/g;
const RX_ING = /^([ \t]*)\{\s*nom:\s*"((?:[^"\\]|\\.)*)"\s*,\s*g:\s*(-?[\d.]+)\s*,\s*pct:\s*(-?[\d.]+)\s*,\s*role:\s*"([^"]*)"\s*\},?[ \t]*$/;

function pourcentages(poids) {
  const total = poids.reduce((a, b) => a + b, 0);
  if (total <= 0) return poids.map(() => 0);
  const exacts = poids.map(g => (g / total) * 1000);
  const bas = exacts.map(Math.floor);
  let reste = 1000 - bas.reduce((a, b) => a + b, 0);
  const ordre = exacts.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; k < ordre.length && reste > 0; k++, reste--) bas[ordre[k][1]]++;
  return bas.map(v => v / 10);
}

let corrigees = 0;
const rapport = [];

for (const f of readdirSync(LIB).filter(x => x.endsWith('.js') && x !== 'index.js' && x !== 'catalogue.js')) {
  const chemin = join(LIB, f);
  let src = readFileSync(chemin, 'utf-8');

  const bornes = [];
  RX_ID.lastIndex = 0;
  let m;
  while ((m = RX_ID.exec(src)) !== null) bornes.push([m.index, m[1]]);

  for (let k = bornes.length - 1; k >= 0; k--) {
    const debut = bornes[k][0];
    const fin = k + 1 < bornes.length ? bornes[k + 1][0] : src.length;
    const lignes = src.slice(debut, fin).split('\n');

    const idx = [];
    lignes.forEach((l, i) => { if (RX_ING.test(l)) idx.push(i); });
    // deux lignes suffisent : un sirop à 30°B, c'est du sucre et de l'eau
    if (idx.length < 2) continue;

    const poids = idx.map(i => parseFloat(lignes[i].match(RX_ING)[3]));
    const total = poids.reduce((a, b) => a + b, 0);
    if (total <= 50000) continue;

    const iMax = poids.indexOf(Math.max(...poids));
    if (poids[iMax] / total <= 0.9) continue;

    const corrige = poids[iMax] / 1000;
    const autres = poids.filter((_, j) => j !== iMax);
    const maxAutres = Math.max(...autres);
    const nouveauTotal = total - poids[iMax] + corrige;
    // la ligne corrigée doit redevenir du même ordre que les autres, et la
    // recette retomber dans une échelle de laboratoire
    if (!(corrige <= maxAutres * 20 && corrige >= maxAutres / 20)) continue;
    if (!(nouveauTotal >= 100 && nouveauTotal <= 50000)) continue;

    poids[iMax] = corrige;
    const pcts = pourcentages(poids);
    idx.forEach((i, j) => {
      const [, ind, nom, , , role] = lignes[i].match(RX_ING);
      const virgule = lignes[i].trimEnd().endsWith(',') ? ',' : '';
      lignes[i] = `${ind}{ nom: "${nom}", g: ${poids[j]}, pct: ${pcts[j]}, role: "${role}" }${virgule}`;
    });

    const majees = lignes.map(l =>
      l.replace(/^(\s*masse_totale_g:\s*)-?[\d.]+(,?)\s*$/, `$1${Math.round(nouveauTotal)}$2`)
       .replace(/^(\s*a_verifier:\s*)(true|false)(,?)\s*$/, '$1true$3'));

    rapport.push([bornes[k][1], lignes[idx[iMax]].match(RX_ING)[2],
                  Math.round(total), Math.round(nouveauTotal)]);
    corrigees++;
    src = src.slice(0, debut) + majees.join('\n') + src.slice(fin);
  }

  if (ECRIRE) writeFileSync(chemin, src, 'utf-8');
}

console.log(`recettes corrigées : ${corrigees}`);
for (const [id, nom, avant, apres] of rapport) {
  console.log(`  ${id}\n    « ${nom} » — recette ${avant} g -> ${apres} g`);
}
console.log(ECRIRE ? '\nFichiers réécrits, recettes repassées à a_verifier.'
                   : "\nRapport seul — relancer avec --write pour appliquer.");

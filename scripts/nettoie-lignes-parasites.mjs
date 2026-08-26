#!/usr/bin/env node
/**
 * Retire des listes d'ingrédients les lignes qui n'en sont pas.
 *
 * Les fiches sources portent en tête de tableau une unité de rendement —
 * « par pâton », « par moule », « par pièces », « par cake ». L'extraction les
 * a prises pour des ingrédients, avec le nombre voisin en guise de poids. Elles
 * gonflent `masse_totale_g`, faussent tous les `pct` de la recette, et sortent
 * en « allergène inconnu » puisqu'aucune famille ne leur correspond.
 *
 * Ne PAS confondre avec « Masse gélatine », « Masse Pérou » ou « Masse à
 * soufflé » : ce sont de vraies préparations. Seul le préfixe `par ` est visé.
 *
 * Après retrait, `masse_totale_g` et les `pct` sont recalculés sur la somme
 * restante, avec répartition à la plus forte reste pour que la somme des
 * pourcentages tombe juste à 100.
 *
 *   node scripts/nettoie-lignes-parasites.mjs           # rapport
 *   node scripts/nettoie-lignes-parasites.mjs --write   # applique
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIB = join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'recettes');
const ECRIRE = process.argv.includes('--write');

const PARASITE = /^\s*par\s/i;

const RX_ID = /\bid:\s*['"]([^'"]+)['"]/g;
// une ligne d'ingrédient complète, telle que l'écrit l'import
const RX_ING = /^([ \t]*)\{\s*nom:\s*"((?:[^"\\]|\\.)*)"\s*,\s*g:\s*(-?[\d.]+)\s*,\s*pct:\s*(-?[\d.]+)\s*,\s*role:\s*"([^"]*)"\s*\},?[ \t]*$/;

/** Pourcentages à une décimale dont la somme fait exactement 100. */
function pourcentages(poids) {
  const total = poids.reduce((a, b) => a + b, 0);
  if (total <= 0) return poids.map(() => 0);
  const exacts = poids.map(g => (g / total) * 1000);
  const bas = exacts.map(Math.floor);
  let reste = 1000 - bas.reduce((a, b) => a + b, 0);
  const ordre = exacts
    .map((v, i) => [v - Math.floor(v), i])
    .sort((a, b) => b[0] - a[0]);
  for (let k = 0; k < ordre.length && reste > 0; k++, reste--) bas[ordre[k][1]]++;
  return bas.map(v => v / 10);
}

let recettes = 0, touchees = 0, lignesRetirees = 0;
const exemples = [];

for (const f of readdirSync(LIB).filter(x => x.endsWith('.js') && x !== 'index.js')) {
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
    recettes++;

    const idx = [];
    lignes.forEach((l, i) => { if (RX_ING.test(l)) idx.push(i); });
    if (!idx.length) continue;
    const aRetirer = idx.filter(i => PARASITE.test(lignes[i].match(RX_ING)[2]));
    if (!aRetirer.length) continue;

    const gardes = idx.filter(i => !aRetirer.includes(i));
    if (gardes.length < 2) continue;   // il ne resterait pas une recette

    const poids = gardes.map(i => parseFloat(lignes[i].match(RX_ING)[3]));
    const pcts = pourcentages(poids);
    const total = poids.reduce((a, b) => a + b, 0);

    gardes.forEach((i, j) => {
      const [, ind, nom, g, , role] = lignes[i].match(RX_ING);
      const virgule = lignes[i].trimEnd().endsWith(',') ? ',' : '';
      lignes[i] = `${ind}{ nom: "${nom}", g: ${g}, pct: ${pcts[j]}, role: "${role}" }${virgule}`;
    });

    if (exemples.length < 10) {
      exemples.push([bornes[k][1], aRetirer.map(i => lignes[i].match(RX_ING)[2])]);
    }
    lignesRetirees += aRetirer.length;
    touchees++;

    const restantes = lignes.filter((_, i) => !aRetirer.includes(i))
      .map(l => l.replace(/^(\s*masse_totale_g:\s*)-?[\d.]+(,?)\s*$/, `$1${Math.round(total)}$2`));
    src = src.slice(0, debut) + restantes.join('\n') + src.slice(fin);
  }

  if (ECRIRE) writeFileSync(chemin, src, 'utf-8');
}

console.log(`recettes parcourues : ${recettes}`);
console.log(`recettes nettoyées  : ${touchees}`);
console.log(`lignes retirées     : ${lignesRetirees}`);
console.log('\nexemples :');
for (const [id, noms] of exemples) console.log(`  ${id} — ${noms.map(n => JSON.stringify(n)).join(', ')}`);
console.log(ECRIRE ? '\nFichiers réécrits.' : "\nRapport seul — relancer avec --write pour appliquer.");

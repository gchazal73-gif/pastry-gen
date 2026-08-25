#!/usr/bin/env node
/**
 * Recalcule le champ `allergenes` de toutes les recettes de lib/recettes/.
 *
 * Pourquoi ce script existe
 * -------------------------
 * Le champ était posé à l'import par une table de regex qui cherchait « ble »
 * sans frontière de mot : elle accrochait *bleu*, *lipo­soluble*, *érable*,
 * *préalable*, *sable*. Symétriquement, les farines de riz, de sarrasin et de
 * châtaigne étaient comptées comme gluten alors qu'elles n'en contiennent pas.
 * Le vocabulaire avait aussi dérivé au fil des imports : `oeuf` et `oeufs`,
 * `arachide` et `arachides`, `fruits_a_coque` et `fruits_a_coque_noisette`
 * coexistaient, et deux clés n'étaient pas des allergènes du tout (`gélatine`,
 * `lactose`).
 *
 * Ce script rejoue le calcul sur tout le corpus, avec des règles ancrées sur
 * des frontières de mot et une liste d'exclusions explicite.
 *
 * Portée
 * ------
 * Ce champ ne sert qu'à l'affichage de la bibliothèque. Le moteur INCO qui fait
 * foi est `lib/allergenes.js`, alimenté par `lib/ingredients-metier.js` — et
 * celui-là ne connaît que 58 ingrédients, soit 32 % des lignes du corpus. Les
 * deux chantiers sont distincts : celui-ci corrige l'étiquette, pas le moteur.
 *
 *   node scripts/recalc-allergenes.mjs           # rapport, n'écrit rien
 *   node scripts/recalc-allergenes.mjs --write   # applique
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIB = join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'recettes');
const ECRIRE = process.argv.includes('--write');

// L'ordre compte : passer en minuscules AVANT de traiter la ligature, sinon
// « Œufs entiers » garde son Œ majuscule et l'allergène œuf n'est pas détecté.
const norm = s => (s || '')
  .toLowerCase()
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[œæ]/g, m => (m === 'œ' ? 'oe' : 'ae'))
  .replace(/[’']/g, "'")
  .replace(/\s+/g, ' ').trim();

/* Chaque règle : [allergène, motif, exclusions].
   Une exclusion l'emporte sur le motif — « farine de riz » n'est pas du gluten,
   « lait d'amande » n'est pas du lait, « noix de coco » n'est pas un fruit à
   coque au sens du règlement (l'annexe II ne la liste pas). */
const REGLES = [
  ['gluten',
    /farine|\bbles?\b|\bfroment\b|\bepeautre\b|\bseigle\b|\borge\b|\bavoine\b|\bmalt\b|gluten|semoule de ble|chapelure|\bpains?\b|\bbrioche|\bbiscuits?\b|\bsables?\b|\bspeculoos\b|\bgavotte|\bfeuilletine\b|crepes? dentelle|\bstreu?sel\b|\bcrumble\b|\bgenoise\b|\bmadeleines?\b|\bpate (a|sucree|sablee|brisee|feuilletee|levee)\b|feuilletage|\bcroissant|\bdetrempe\b|\bgruau\b|\blevain\b|\bcookies?\b|\bviennois/,
    /farine de (riz|sarrasin|chataigne|mais|coco|noisette|amande|pois chiche|banane|lupin|millet|quinoa|teff|soja)|farine d'(amande|avoine sans gluten)|fecule|maizena|\bpate d'amande\b|amidon de (mais|riz|pomme)/],

  ['lait',
    /\blaits?\b|\bcremes?\b|\bbeurres?\b|mascarpone|\bfromage|\byaourt|ricotta|lactose|\bmsng\b|petit-?lait|babeurre|\bkefir\b|faisselle|\bskyr\b|\bcaille\b|couverture (lactee|ivoire|dulcey|blonde)|\bjivara\b|\bivoire\b|\bdulcey\b|\bopalys\b|\bgianduja\b|chocolats? (au )?lait|chocolats? blancs?|\bdulce de leche\b|\bdulche\b|\bconfiture de lait\b|creme fraiche|\bfromage blanc\b/,
    /laits? d'(amande|avoine|riz|soja|coco|noisette)|laits? de (coco|soja|riz|amande|avoine)|beurre de cacao|creme de (riz|marron|coco|cassis|pistache sans)|creme de tartre/],

  ['oeuf',
    /\boeufs?\b|\bjaunes?\b|meringue|\bdorure\b|\balbumine\b|\bpoudre de blancs?\b|\bblancs? (d'oeufs?|en neige|montes)/,
    /\bblancs? (de (poireau|volaille|poulet))\b/],

  // « blanc » seul est ambigu (chocolat blanc, vin blanc, poivre blanc…) :
  // il n'est retenu que si rien d'autre ne l'explique, d'où une règle à part.
  ['oeuf',
    /(?<!chocolat )(?<!couverture )(?<!vin )(?<!rhum )(?<!poivre )(?<!sucre )(?<!amande )(?<!fromage )(?<!pain )\bblancs?\b/,
    /chocolat|couverture|\bvin\b|\brhum\b|poivre|sucre|amande|fromage|\bpain\b|poireau|volaille/],

  ['fruits_a_coque',
    /\bamandes?\b|\bnoisettes?\b|\bpistaches?\b|\bnoix\b|\bpecan\b|\bcajou\b|\bmacadamia\b|\bbresil\b|\bpraline?s?\b|\bpralin\b|\bgianduja\b|\bduja\b|\bnougat\b|\bmarzipan\b|\bmassepain\b|\bfrangipane\b|\bnougatine\b|\bpistachio\b/,
    /noix de coco|noix de muscade|\bcoco rape|lait de coco|huile de coco/],

  ['arachide', /\barachides?\b|\bcacahue?tes?\b|\bpeanut/, null],
  ['soja',     /\bsoja\b|\blecithine\b|\btofu\b|\bmiso\b|\bedamame\b/, null],
  ['sesame',   /\bsesames?\b|\btahini?\b|\bgomasio\b/, null],
  ['sulfites', /\bsulfites?\b|\bdioxyde de soufre\b|\bso2\b|\be22[0-8]\b|\bvin blanc\b|\bvin rouge\b/, null],
  ['moutarde', /\bmoutardes?\b/, null],
  ['celeri',   /\bceleris?\b/, null],
  ['poisson',  /\bsaumon\b|\bthon\b|\bpoissons?\b|\banchois\b|\bcabillaud\b|\bcolin\b|\btruite\b|\bsardine/, null],
  ['crustaces', /\bcrevettes?\b|\bhomards?\b|\bcrabes?\b|\blangoustines?\b|\becrevisse/, null],
  ['mollusques', /\bhuitres?\b|\bmoules? de bouchot\b|\bcoquilles? saint|\bcalamars?\b|\bseiche\b|\bpoulpe\b/, null],
  ['lupin',    /\blupin\b/, null],
];

function allergenesDe(noms) {
  const out = new Set();
  for (const nomBrut of noms) {
    const n = norm(nomBrut);
    if (!n) continue;
    for (const [allergene, motif, exclusion] of REGLES) {
      if (exclusion && exclusion.test(n)) continue;
      if (motif.test(n)) out.add(allergene);
    }
  }
  return [...out].sort();
}

/* Repérage textuel : chaque recette est un objet `{ ... }` dont l'entrée est
   `id:`. On remplace la ligne `allergenes: [...]` comprise entre cet id et le
   suivant. Rien d'autre n'est touché.

   Les deux styles de guillemets doivent être acceptés : signature_fruit_agrumes.js
   écrit ses clés en apostrophes simples, et une regex limitée aux guillemets
   doubles laissait ses 70 recettes hors du passage. */
const RX_ID = /\bid:\s*['"]([^'"]+)['"]/g;
const RX_ALLERG = /(\n(\s*)allergenes:\s*)\[[^\]]*\](,?)/;

let total = 0, modifiees = 0, sansChamp = [];
const diff = { ajouts: {}, retraits: {} };
const exemples = [];

for (const f of readdirSync(LIB).filter(x => x.endsWith('.js') && x !== 'index.js')) {
  const chemin = join(LIB, f);
  let src = readFileSync(chemin, 'utf-8');

  const bornes = [];
  RX_ID.lastIndex = 0;
  let m;
  while ((m = RX_ID.exec(src)) !== null) bornes.push([m.index, m[1]]);

  // de la fin vers le début : les indices amont restent valides après édition
  for (let k = bornes.length - 1; k >= 0; k--) {
    const debut = bornes[k][0];
    const fin = k + 1 < bornes.length ? bornes[k + 1][0] : src.length;
    const bloc = src.slice(debut, fin);
    total++;

    const noms = [...bloc.matchAll(/\{\s*nom:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')\s*,\s*g:/g)]
      .map(x => x[1] ?? x[2]);
    const attendu = allergenesDe(noms);

    const ma = bloc.match(RX_ALLERG);
    if (!ma) { sansChamp.push(bornes[k][1]); continue; }
    const actuel = (bloc.match(/allergenes:\s*\[([^\]]*)\]/)?.[1] || '')
      .split(',').map(x => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);

    if (JSON.stringify([...actuel].sort()) === JSON.stringify(attendu)) continue;
    modifiees++;
    for (const a of attendu) if (!actuel.includes(a)) diff.ajouts[a] = (diff.ajouts[a] || 0) + 1;
    for (const a of actuel) if (!attendu.includes(a)) diff.retraits[a] = (diff.retraits[a] || 0) + 1;
    if (exemples.length < 15) exemples.push([bornes[k][1], actuel.join(','), attendu.join(',')]);

    const remplacement = bloc.replace(RX_ALLERG,
      (_, tete, _indent, virgule) => `${tete}[${attendu.map(a => `"${a}"`).join(', ')}]${virgule}`);
    src = src.slice(0, debut) + remplacement + src.slice(fin);
  }

  if (ECRIRE) writeFileSync(chemin, src, 'utf-8');
}

console.log(`recettes parcourues : ${total}`);
console.log(`allergènes modifiés : ${modifiees}`);
if (sansChamp.length) console.log(`sans champ allergenes : ${sansChamp.length} (${sansChamp.slice(0, 5).join(', ')})`);
console.log('\najouts   :', diff.ajouts);
console.log('retraits :', diff.retraits);
console.log('\nexemples :');
for (const [id, av, ap] of exemples) console.log(`  ${id}\n     avant : [${av}]\n     après : [${ap}]`);
console.log(ECRIRE ? '\nFichiers réécrits.' : "\nRapport seul — relancer avec --write pour appliquer.");

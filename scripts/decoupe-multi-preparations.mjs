#!/usr/bin/env node
/**
 * Découpe les recettes dont les préparations 2..n sont restées en texte.
 *
 * Les fiches sources enchaînent plusieurs préparations dans un même document :
 * une pâte, puis une crème, puis une ganache, chacune introduite par un titre
 * de la forme « Ganache montée manjari tonka : 15 g par moules » et suivie de
 * ses propres pesées. L'extraction n'a retenu que la première : ses pesées sont
 * devenues `ingredients`, tout le reste — titres, pesées, procédés — a été
 * versé en vrac dans `procede`.
 *
 * Conséquences, mesurées sur le corpus : 82 % de la matière de ces recettes est
 * absente de `masse_totale_g`, donc du coût, de la nutrition et surtout des
 * allergènes — 245 recettes portent dans une préparation enfouie un allergène
 * qu'elles ne déclarent pas.
 *
 * L'application sait déjà afficher une recette à plusieurs préparations : c'est
 * le type `assemblage`, rendu par RecetteDetail.jsx avec un tableau et un
 * procédé par composant. Ce script ne touche donc à aucune vue ; il remet
 * simplement ces recettes dans la forme que l'application attend.
 *
 * Le piège, celui-là même qui a fait échouer l'extraction : un titre porte une
 * quantité, exactement comme un ingrédient.
 *
 *     Crumble : 20 g par pièce        ← titre de préparation
 *     Beurre              220 g       ← ingrédient
 *
 * Seul « par <unité> » les sépare de façon fiable. Le script refuse de découper
 * dès qu'il rencontre une structure qu'il ne sait pas lire, plutôt que de
 * produire un composant douteux.
 *
 *   node scripts/decoupe-multi-preparations.mjs            # rapport
 *   node scripts/decoupe-multi-preparations.mjs --detail   # rapport + 5 fiches en entier
 *   node scripts/decoupe-multi-preparations.mjs --write    # applique
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const LIB     = join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'recettes');
const ECRIRE  = process.argv.includes('--write');
const DETAIL  = process.argv.includes('--detail');

// Fichier à ne jamais réécrire : il contient des fabriques et des fonctions,
// pas seulement des données. Une réémission le détruirait.
const NON_REECRIVABLES = new Set(['signature_fruit_agrumes.js']);
const NON_DONNEES      = new Set(['index.js', 'complet.js', 'catalogue.js', 'taxonomie.js']);

// ── Classification des lignes ────────────────────────────────────────────────

// « Ganache montée : 15 g par moules », « Enrobage violet: 6 g par pièce »
const RX_TITRE = /^\s*(.{2,70}?)\s*:?\s*(\d+[.,]?\d*)\s*(?:g|kg|gr)\s+(?:par|pour)\s+\S+/i;

// « Beurre			150 g », « Sucre semoule		150g »
const RX_ING = /^\s*(.{2,45}?)[ \t]+(\d+[.,]?\d*)\s*(g|kg|gr|ml|cl|l|pi[eè]ces?|feuilles?|f[eè]ves?|gousses?)\.?\s*$/i;

// Une ligne de prose : ponctuation de phrase, ou simplement longue.
const RX_PROSE = /[.!?](\s|$)/;

const CONVERSIONS = [
  // Fournies par Guillaume ; toute unité de compte non listée reste non convertie.
  [/g[eé]latine/i,        'feuille', 2],
  [/vanille/i,            'gousse',  6],
  [/(?:oe|œ)uf|jaune|blanc/i, 'piece', 55],
  [/citron|orange|agrume|zeste/i, 'piece', 5],
];

function enGrammes(valeur, unite, nom) {
  const v = parseFloat(String(valeur).replace(',', '.'));
  const u = unite.toLowerCase();
  if (u === 'g' || u === 'gr') return v;
  if (u === 'kg')              return v * 1000;
  if (u === 'ml')              return v;          // densité 1, usage pâtissier
  if (u === 'cl')              return v * 10;
  if (u === 'l')               return v * 1000;
  const classe = /feuille/.test(u) ? 'feuille' : /gousse/.test(u) ? 'gousse' : 'piece';
  for (const [rx, cl, poids] of CONVERSIONS) {
    if (cl === classe && rx.test(nom)) return v * poids;
  }
  return null;   // non convertible : on ne devine pas
}

// Une cellule qui n'est qu'une pesée : « 150 g », « 1,5 kg », « 2 fèves ».
const RX_CELLULE_QTE = /^(\d+[.,]?\d*)\s*(g|kg|gr|ml|cl|l|pi[e\u00e8]ces?|feuilles?|f[e\u00e8]ves?|gousses?)\.?$/i;

function classe(ligne) {
  const brut = String(ligne).replace(/\u00a0/g, ' ');
  const s = brut.replace(/\s+/g, ' ').trim();
  if (!s) return { type: 'vide' };

  const t = s.match(RX_TITRE);
  if (t) return { type: 'titre', nom: t[1].replace(/[:\-\u2013\u2022]\s*$/, '').trim() };

  // « par pièce » sans titre reconnaissable, ou toute mention de rendement :
  // ce n'est pas un ingrédient, on ne l'avale pas silencieusement.
  if (/\b(?:par|pour)\s+(?:pi[e\u00e8]ce|p[a\u00e2]ton|moule|cercle|cake|personne|part)/i.test(s)) {
    return { type: 'rendement', texte: s };
  }

  // Source tabulée : découper en cellules et prendre la PREMIÈRE pesée.
  // Certaines fiches portent deux colonnes — une grande série et une petite —
  // et lire la dernière divisait silencieusement la recette par deux.
  const cellules = brut.split(/\t+|\s{2,}/).map(x => x.trim()).filter(Boolean);
  if (cellules.length >= 2) {
    const k = cellules.findIndex((c, i) => i > 0 && RX_CELLULE_QTE.test(c));
    const nom = cellules[0].replace(/[:\-\u2013\u2022]\s*$/, '').trim();
    if (k > 0 && nom.length >= 2 && /[a-z\u00e0-\u00ff]/i.test(nom) && !RX_PROSE.test(nom)
        && !/\d+\s*(?:g|kg|gr|ml|cl|l)\b/i.test(nom)) {
      const q = cellules[k].match(RX_CELLULE_QTE);
      const colonnes = cellules.filter((c, i) => i > 0 && RX_CELLULE_QTE.test(c)).length;
      return { type: 'ingredient', nom, g: enGrammes(q[1], q[2], nom), brut: s, colonnes };
    }
  }

  const i = s.match(RX_ING);
  if (i && !RX_PROSE.test(i[1]) && /[a-z\u00e0-\u00ff]/i.test(i[1])
      && !/\d+\s*(?:g|kg|gr|ml|cl|l)\b/i.test(i[1])) {
    const nom = i[1].replace(/[:\-\u2013\u2022]\s*$/, '').trim();
    return { type: 'ingredient', nom, g: enGrammes(i[2], i[3], nom), brut: s, colonnes: 1 };
  }

  // Titre nu (« Crumble »), qualifié plus bas seulement s'il précède des pesées.
  if (s.length <= 60 && !/\d/.test(s) && !RX_PROSE.test(s)) {
    return { type: 'titre_nu', nom: s.replace(/[:\-–•]\s*$/, '').trim() };
  }

  return { type: 'prose', texte: s };
}

/** Pourcentages à une décimale dont la somme fait exactement 100. */
function pourcentages(poids) {
  const total = poids.reduce((a, b) => a + b, 0);
  if (total <= 0) return poids.map(() => 0);
  const exacts = poids.map(g => (g / total) * 1000);
  const bas    = exacts.map(Math.floor);
  let reste    = 1000 - bas.reduce((a, b) => a + b, 0);
  const ordre  = exacts.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; k < ordre.length && reste > 0; k++, reste--) bas[ordre[k][1]]++;
  return bas.map(v => v / 10);
}

// ── Découpage d'une recette ──────────────────────────────────────────────────

function decouper(recette, roleDe) {
  const lignes = (recette.procede ?? []).map(classe);

  // Un titre nu ne compte que s'il introduit au moins deux pesées.
  for (let i = 0; i < lignes.length; i++) {
    if (lignes[i].type !== 'titre_nu') continue;
    const suite = lignes.slice(i + 1, i + 3);
    lignes[i] = (suite.length === 2 && suite.every(x => x.type === 'ingredient'))
      ? { type: 'titre', nom: lignes[i].nom }
      : { type: 'prose', texte: lignes[i].nom };
  }

  const segments = [];
  let courant = null;
  const proseBase = [];
  const avertissements = [];

  for (const l of lignes) {
    if (l.type === 'titre') {
      courant = { nom: l.nom, ingredients: [], procede: [] };
      segments.push(courant);
      continue;
    }
    if (l.type === 'vide') continue;
    if (l.type === 'rendement') {
      // Mention de rendement isolée : conservée en note, jamais en ingrédient.
      (courant ? courant.procede : proseBase).push(l.texte);
      continue;
    }
    if (l.type === 'ingredient') {
      if (!courant) { avertissements.push(`pesée hors préparation : ${l.brut}`); continue; }
      courant.ingredients.push(l);
      continue;
    }
    (courant ? courant.procede : proseBase).push(l.texte ?? l.nom);
  }

  const utiles = segments.filter(s => s.ingredients.length >= 2);
  if (!utiles.length) return null;
  if (utiles.length !== segments.length) {
    for (const s of segments) {
      if (s.ingredients.length < 2) avertissements.push(`préparation « ${s.nom} » sans pesées, laissée en procédé`);
    }
  }

  const composants = [];

  // Composant 1 : les pesées déjà extraites, avec la prose qui les précédait.
  const baseG = (recette.ingredients ?? []).map(i => i.g ?? 0);
  composants.push({
    nom:         'Préparation 1',
    masse_g:     Math.round(baseG.reduce((a, b) => a + b, 0)),
    ingredients: (recette.ingredients ?? []).map(i => ({ ...i })),
    procede:     proseBase,
  });

  for (const s of utiles) {
    const inconnues = s.ingredients.filter(i => i.g === null);
    for (const i of inconnues) avertissements.push(`unité non convertie : ${i.brut}`);
    const gardes = s.ingredients.filter(i => i.g !== null);
    if (gardes.length < 2) { avertissements.push(`préparation « ${s.nom} » : trop de pesées illisibles`); continue; }
    const poids = gardes.map(i => i.g);
    const pcts  = pourcentages(poids);
    composants.push({
      nom:         s.nom,
      masse_g:     Math.round(poids.reduce((a, b) => a + b, 0)),
      ingredients: gardes.map((i, k) => ({
        nom:  i.nom,
        g:    Math.round(i.g * 10) / 10,
        pct:  pcts[k],
        role: roleDe(i.nom),
      })),
      procede: s.procede,
    });
  }

  if (composants.length < 2) return null;

  // « Montage » n'est pas une étape de la dernière préparation : c'est
  // l'assemblage de toutes. L'application a un champ pour ça.
  let montage = null;
  const dernier = composants[composants.length - 1];
  const iM = dernier.procede.findIndex(l => /^\s*montage\b/i.test(l));
  if (iM >= 0) {
    const bloc = dernier.procede.slice(iM);
    dernier.procede = dernier.procede.slice(0, iM);
    montage = bloc.filter(l => !/^\s*montage\s*:?\s*$/i.test(l));
    if (!montage.length) montage = null;
  }

  return { composants, montage, avertissements };
}

// ── Sérialisation ────────────────────────────────────────────────────────────

const S = v => JSON.stringify(v);

function emetIngredient(i, ind) {
  return `${ind}{ nom: ${S(i.nom)}, g: ${i.g}, pct: ${i.pct}, role: ${S(i.role ?? '')} },`;
}

function emetRecette(r, ind = '  ') {
  const L = [`${ind}{`];
  const p = ind + '  ';

  L.push(`${p}id: ${S(r.id)},`);
  L.push(`${p}type: "assemblage",`);
  L.push(`${p}nom: ${S(r.nom)},`);
  L.push(`${p}categorie: ${S(r.categorie)},`);
  if (r.sous_categorie) L.push(`${p}sous_categorie: ${S(r.sous_categorie)},`);
  if (r.description)    L.push(`${p}description: ${S(r.description)},`);
  L.push(`${p}masse_totale_g: ${r.masse_totale_g},`);

  L.push(`${p}composants: [`);
  for (const c of r.composants) {
    L.push(`${p}  {`);
    L.push(`${p}    nom: ${S(c.nom)},`);
    L.push(`${p}    masse_g: ${c.masse_g},`);
    L.push(`${p}    ingredients: [`);
    for (const i of c.ingredients) L.push(emetIngredient(i, p + '      '));
    L.push(`${p}    ],`);
    L.push(`${p}    procede: [`);
    for (const s of c.procede) L.push(`${p}      ${S(s)},`);
    L.push(`${p}    ],`);
    L.push(`${p}  },`);
  }
  L.push(`${p}],`);

  if (Array.isArray(r.montage) && r.montage.length) {
    L.push(`${p}montage: [`);
    for (const x of r.montage) L.push(`${p}  ${S(x)},`);
    L.push(`${p}],`);
  }

  for (const k of ['cuisson', 'temperatures', 'contraintes', 'a_verifier', 'allergenes',
                   'tags', 'parfum_principal', 'note_concepteur', 'source_interne']) {
    if (r[k] === undefined || r[k] === null) continue;
    L.push(`${p}${k}: ${S(r[k])},`);
  }
  L.push(`${ind}},`);
  return L.join('\n');
}

/**
 * Remplace, dans le texte source, le bloc de la recette `id` par `texte`.
 * Les fichiers de données ont une mise en forme parfaitement régulière —
 * un objet de recette s'ouvre sur une ligne « ␣␣{ » et se ferme sur « ␣␣}, » —
 * vérifiée fichier par fichier avant d'écrire quoi que ce soit. On remplace
 * bloc par bloc plutôt que de réémettre le fichier entier : les 3 457 recettes
 * intactes gardent leur formatage d'origine, et le diff ne montre que ce qui
 * change réellement.
 */
function remplaceBlocs(src, parId) {
  const lignes = src.split('\n');
  const sortie = [];
  for (let i = 0; i < lignes.length; i++) {
    if (lignes[i] !== '  {') { sortie.push(lignes[i]); continue; }
    let j = i;
    while (j < lignes.length && lignes[j] !== '  },') j++;
    if (j >= lignes.length) throw new Error('bloc de recette non refermé');
    const bloc = lignes.slice(i, j + 1);
    const m = bloc.find(l => /^    id: /.test(l))?.match(/^    id: "((?:[^"\\]|\\.)*)"/);
    const remplacement = m && parId.get(m[1]);
    if (remplacement) sortie.push(...remplacement.split('\n'));
    else sortie.push(...bloc);
    i = j;
  }
  return sortie.join('\n');
}

// ── Parcours ─────────────────────────────────────────────────────────────────

const fichiers = readdirSync(LIB)
  .filter(f => f.endsWith('.js') && !NON_DONNEES.has(f));

// Table des rôles, apprise sur le corpus lui-même : les ingrédients enfouis
// emploient le même vocabulaire que ceux déjà extraits.
const roleParNom = new Map();
{
  const compte = new Map();
  for (const f of fichiers) {
    const mod = await import(pathToFileURL(join(LIB, f)).href);
    for (const arr of Object.values(mod)) {
      if (!Array.isArray(arr)) continue;
      for (const r of arr) {
        const toutes = r.composants
          ? r.composants.flatMap(c => c.ingredients ?? [])
          : (r.ingredients ?? []);
        for (const i of toutes) {
          if (!i?.nom || !i.role) continue;
          const cle = i.nom.toLowerCase().trim();
          if (!compte.has(cle)) compte.set(cle, new Map());
          const m = compte.get(cle);
          m.set(i.role, (m.get(i.role) ?? 0) + 1);
        }
      }
    }
  }
  for (const [cle, m] of compte) {
    roleParNom.set(cle, [...m.entries()].sort((a, b) => b[1] - a[1])[0][0]);
  }
}
const roleDe = nom => roleParNom.get(String(nom).toLowerCase().trim()) ?? '';

let vues = 0, decoupees = 0, composantsCrees = 0, masseRecuperee = 0;
const avertis = [], exemples = [], bloquees = [];

for (const f of fichiers) {
  const chemin = join(LIB, f);
  const mod    = await import(pathToFileURL(chemin).href);
  const nomExport = Object.keys(mod).find(k => Array.isArray(mod[k]));
  if (!nomExport) continue;
  const recettes = mod[nomExport];

  const parId = new Map();
  for (const r of recettes) {
    if (r.type === 'assemblage' || r.composants) continue;
    vues++;
    const d = decouper(r, roleDe);
    if (!d) continue;

    if (NON_REECRIVABLES.has(f)) { bloquees.push(`${r.id} (${f})`); continue; }

    const masse = d.composants.reduce((a, c) => a + c.masse_g, 0);
    masseRecuperee  += masse - (r.masse_totale_g ?? 0);
    composantsCrees += d.composants.length - 1;
    decoupees++;
    if (d.avertissements.length) avertis.push([r.id, d.avertissements]);
    if (exemples.length < 5) exemples.push([r, d]);

    parId.set(r.id, emetRecette({
      ...r,
      composants:     d.composants,
      masse_totale_g: masse,
      montage:        d.montage ?? r.montage ?? null,
      // Le nom de la première préparation n'existe pas dans la source : elle
      // est la seule à ne pas être introduite par un titre. À nommer à la main.
      a_verifier:     true,
    }));
  }

  if (parId.size && ECRIRE) {
    const src = readFileSync(chemin, 'utf-8');
    const out = remplaceBlocs(src, parId);
    if (out === src) throw new Error(`aucun bloc remplacé dans ${f} — mise en forme inattendue`);
    writeFileSync(chemin, out, 'utf-8');
  }
}

// ── Rapport ──────────────────────────────────────────────────────────────────

console.log(`recettes simples parcourues : ${vues}`);
console.log(`recettes à découper         : ${decoupees}`);
console.log(`composants à créer          : ${composantsCrees}`);
console.log(`masse remise dans les calculs : ${Math.round(masseRecuperee / 1000)} kg`);
if (bloquees.length) {
  console.log(`\n⚠ ${bloquees.length} recette(s) dans un fichier non réécrivable, laissées telles quelles :`);
  bloquees.forEach(b => console.log('   ' + b));
}
if (avertis.length) {
  console.log(`\n${avertis.length} recette(s) avec avertissement :`);
  for (const [id, a] of avertis.slice(0, 25)) console.log(`   ${id} — ${a.slice(0, 3).join(' | ')}`);
  if (avertis.length > 25) console.log(`   … ${avertis.length - 25} de plus`);
}
if (DETAIL) {
  for (const [r, d] of exemples) {
    console.log(`\n${'─'.repeat(70)}\n${r.nom}  (${r.id})`);
    for (const c of d.composants) {
      console.log(`  ▸ ${c.nom} — ${c.masse_g} g`);
      c.ingredients.forEach(i => console.log(`      ${String(i.nom).padEnd(32)} ${i.g} g   ${i.pct} %   ${i.role}`));
      c.procede.forEach(s => console.log(`      · ${String(s).slice(0, 100)}`));
    }
  }
}
console.log(ECRIRE ? '\nFichiers réécrits.' : '\nRapport seul — relancer avec --write pour appliquer.');

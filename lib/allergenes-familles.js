// Résolution des allergènes par famille, à partir du seul libellé.
//
// Pourquoi ce module existe
// -------------------------
// `lib/ingredients-metier.js` fait foi, mais il ne contient que 58 ingrédients.
// Sur les 23 436 lignes de la bibliothèque, 32 % seulement y trouvent une
// correspondance exacte : le reste sortait en « allergènes non vérifiables »,
// y compris sur *sucre*, *lait*, *œufs* et *crème*, faute d'un libellé
// identique au mot près.
//
// Mapper les 3 544 libellés distincts vers ces 58 fiches serait sans fin — et
// inutile : pour un allergène, seule la **famille** compte. « Crème liquide
// 35 % », « Crème UHT » et « Crème fraîche fluide (32/34 % MG) » disent la même
// chose. Ce module lit la famille dans le libellé.
//
// Trois issues possibles, et la troisième compte autant que les autres :
//   'deduction'              — la famille porte un ou plusieurs allergènes
//   'famille_sans_allergene' — famille identifiée, aucun allergène à déclarer
//                              (sucre, eau, purée de fruit, pectine…). Ce n'est
//                              pas une ignorance : c'est une information que le
//                              moteur ne savait pas exprimer jusqu'ici.
//   'inconnu'                — libellé non rattaché : là, et là seulement, la
//                              fiche doit signaler qu'elle ne sait pas.
//
// Les identifiants émis sont ceux du règlement UE 1169/2011 utilisés par
// `lib/allergenes.js` — y compris la granularité des fruits à coque.

// ── Normalisation ────────────────────────────────────────────────────────────
// L'ordre compte : minuscules AVANT la ligature, sinon « Œufs entiers » garde
// son Œ majuscule et n'est jamais reconnu.

const MARQUES = /\b(valrhona|boiron|capfruit|sevarome|patisfrance|ancel|unipatis|metro|pcb|imperial|louis ?francois|cacao ?barry|barry|callebaut|felchlin|weiss|michel ?cluizel|sosa|selbaco|ravifruit|sicoly|adamance)\b/g;

export function normaliseLibelle(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
    .replace(/[’']/g, "'")
    .replace(/\([^)]*\)/g, ' ')          // (Boiron), (32/34% MG), (200 bloom)
    .replace(/«[^»]*»|"[^"]*"/g, ' ')
    .replace(/\b\d+([,.]\d+)?\s*%/g, ' ') // 35%, 64 %
    .replace(MARQUES, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Familles porteuses d'allergènes ──────────────────────────────────────────
// [motif, identifiants INCO, exclusions]. Une exclusion l'emporte sur le motif.
// Les exclusions ne sont pas cosmétiques : farine de riz, lait de coco, beurre
// de cacao et noix de coco sont les faux positifs classiques.

export const REGLES_FAMILLE = [
  // Céréales contenant du gluten
  [/\bfarines?\b|\bbles?\b|\bfroment\b|\bepeautre\b|\bseigle\b|\borges?\b|\bavoines?\b|\bmalt\b|\bgluten\b|\bsemoule de ble\b|\bchapelure\b|\bgruau\b|\bmanitoba\b|\bkamut\b|\bpetit epeautre\b/,
   ['gluten'],
   /\bfarines? de (riz|sarrasin|chataigne|mais|coco|noisette|amande|pois chiche|banane|lupin|millet|quinoa|teff|soja|lentille)\b|\bfarines? d'(amande|avoine sans gluten)\b|\bfecule\b|\bmaizena\b|\bamidon de (mais|riz|pomme)\b/],

  // Préparations céréalières : le nom suffit à établir la présence de farine
  [/\bpains?\b|\bbrioche|\bbiscuits?\b|\bsables?\b|\bspeculoos\b|\bgavottes?\b|\bfeuilletine\b|\bcrepes? dentelle\b|\bstreu?sels?\b|\bcrumbles?\b|\bgenoises?\b|\bmadeleines?\b|\bfinanciers?\b|\bcookies?\b|\bcakes?\b|\bpate (a|sucree|sablee|brisee|feuilletee|levee|a choux|a foncer)\b|\bfeuilletage\b|\bcroissants?\b|\bdetrempe\b|\blevains?\b|\bpoolish\b|\bviennois|\bjoconde\b|\bcigarettes?\b|\btuiles?\b|\bpain de genes\b|\bboudoirs?\b|\bcuilleres?\b/,
   ['gluten'],
   /\bpate d'amande\b|\bpate de (fruit|marron|pistache|noisette|praline|vanille|cacao)\b|\bpains? de sucre\b/],

  // Lait
  [/\blaits?\b|\bcremes?\b|\bbeurres?\b|\bmascarpone\b|\bfromages?\b|\byaourts?\b|\bricotta\b|\blactose\b|\bmsng\b|\bpetit-?lait\b|\bbabeurre\b|\bkefir\b|\bfaisselle\b|\bskyr\b|\bcaille\b|\bcouverture (lactee|ivoire|dulcey|blonde|opalys|jivara|azelia|bahibe|tanariva|orelys)\b|\bjivara\b|\bivoire\b|\bdulcey\b|\bopalys\b|\bazelia\b|\bgianduja\b|\bchocolats? (au )?lait\b|\bchocolats? blancs?\b|\bdulce de leche\b|\bdulche\b|\bconfiture de lait\b|\bcreme fraiche\b|\bfromage blanc\b|\bpoudre de lait\b|\bmatiere grasse laitiere\b|\bmg laitiere\b|\bcream[ -]?cheese\b|\bphiladelphia\b|\bsaint ?moret\b|\bkiri\b|\bchantilly\b|\bclotted cream\b/,
   ['lait'],
   /\blaits? d'(amande|avoine|riz|soja|coco|noisette)\b|\blaits? de (coco|soja|riz|amande|avoine)\b|\bbeurre de cacao\b|\bcreme de (riz|marron|marrons|coco|cassis|mure|framboise)\b|\bcreme de tartre\b|\bcreme patissiere vegetale\b/],

  // Œufs
  [/\boeufs?\b|\bjaunes?\b|\bmeringues?\b|\bdorure\b|\balbumine\b|\bpoudre de blancs?\b|\bblancs? (d'oeufs?|en neige|montes|pasteurises)\b/,
   ['oeufs'],
   /\bblancs? de (poireau|volaille|poulet)\b/],

  // « blanc » isolé : ambigu (chocolat blanc, vin blanc, poivre blanc, sucre
  // blanc, amande blanche). Règle séparée, avec exclusions larges.
  [/\bblancs?\b/,
   ['oeufs'],
   /\bchocolat|\bcouverture|\bvin\b|\brhum\b|\bpoivre|\bsucre|\bamande|\bfromage|\bpain\b|\bpoireau|\bvolaille|\bchoco\b|\bbeurre\b/],

  // Fruits à coque — identifiants INCO granulaires
  [/\bamandes?\b|\bamande (blanche|brute|hachee|effilee|en poudre)\b|\bmassepain\b|\bmarzipan\b|\bfrangipane\b|\bpate d'amande\b|\bcalisson\b/,
   ['fruits_a_coque_amande'], null],
  [/\bnoisettes?\b|\bgianduja\b|\bduja\b|\bnutella\b/,          ['fruits_a_coque_noisette'], null],
  [/\bpistaches?\b|\bpistachio\b/,                              ['fruits_a_coque_pistache'], null],
  [/\bnoix\b|\bcerneaux\b/,                                     ['fruits_a_coque_noix'],
   /\bnoix de coco\b|\bnoix de muscade\b|\bnoix de cajou\b|\bnoix de pecan\b|\bnoix de macadamia\b|\bnoix du bresil\b/],
  [/\bpecans?\b|\bnoix de pecan\b/,                             ['fruits_a_coque_pecan'], null],
  [/\bcajous?\b|\bnoix de cajou\b/,                             ['fruits_a_coque_cajou'], null],
  [/\bmacadamia\b/,                                             ['fruits_a_coque_macadamia'], null],
  [/\bnoix du bresil\b/,                                        ['fruits_a_coque_bresil'], null],

  // Praliné : amande et noisette sauf mention contraire (usage professionnel).
  [/\bpralines?\b|\bpralin\b|\bnougatines?\b|\bnougats?\b|\bpralicrack\b/,
   ['fruits_a_coque_amande', 'fruits_a_coque_noisette'],
   /\bpralines? rose|\bpraline de lyon\b/],

  [/\barachides?\b|\bcacahue?tes?\b|\bpeanut/,                  ['arachides'], null],
  [/\bsojas?\b|\blecithines?\b|\btofu\b|\bmiso\b|\bedamame\b/,  ['soja'], null],
  [/\bsesames?\b|\btahini?\b|\bgomasio\b/,                      ['sesame'], null],
  [/\bsulfites?\b|\bdioxyde de soufre\b|\bso2\b|\be22[0-8]\b/,  ['sulfites'], null],

  // Crus de couverture lactés ou blancs : ils portent l'allergène lait alors
  // que le mot « lait » n'apparaît pas dans le libellé.
  [/\b(jivara|bahibe|azelia|tanariva|orelys|dulcey|ivoire|opalys|waina|zephyr|alunga|ghana lait|lactee superieure|caramelia|chocolat blond|couverture blonde|inspiration (amande|pistache|framboise|passion))\b/,
   ['lait'], null],
  [/\bvins?\b|\bchampagnes?\b|\bcremant\b|\bporto\b|\bbanyuls\b|\bmarsala\b|\bxeres\b|\bsaure?nes\b/,
   ['sulfites'], null],
  [/\bmoutardes?\b/,                                            ['moutarde'], null],
  [/\bceleris?\b/,                                              ['celeri'], null],
  [/\blupin\b/,                                                 ['lupin'], null],
  [/\bsaumons?\b|\bthons?\b|\bpoissons?\b|\banchois\b|\bcabillaud\b|\bcolin\b|\btruites?\b|\bsardines?\b|\bgelatine de poisson\b/,
   ['poissons'], null],
  [/\bcrevettes?\b|\bhomards?\b|\bcrabes?\b|\blangoustines?\b|\becrevisses?\b/, ['crustaces'], null],
  [/\bhuitres?\b|\bcoquilles? saint\b|\bcalamars?\b|\bseiches?\b|\bpoulpes?\b|\bmoules? de bouchot\b/,
   ['mollusques'], null],
];

// ── Familles sans allergène ──────────────────────────────────────────────────
// Identifiées et sans rien à déclarer. Distinguer ce cas de « inconnu » est
// tout l'intérêt : une recette de sorbet n'a pas d'allergène, et la fiche doit
// pouvoir l'affirmer au lieu de se taire.

export const FAMILLES_SANS_ALLERGENE = [
  // sucres et texturants
  /^(sucres?|saccharose|cassonn?ades?|vergeoises?|muscovado|panela|glucoses?|sirop de glucose|glucose atomise|dextrose|trimoline|sucre inverti|isomalt|sorbitol|maltitol|erythritol|xylitol|stevia|fructose|oligofructose|inuline|miels?)\b/,
  /^(pectines?|agar|agar-agar|gelatines?|masse gelatine|xantane|gomme|carraghenane|kappa|iota|neutrose|super neutrose|stab|stabilisateur|esdl|emulsifiant|mono ?et ?diglycerides|fecules?|maizena|amidons?|poudre a creme|creme de tartre)\b/,
  // levants
  /^(levures?|levure chimique|levure fraiche|levure seche|baking|backing|baking ?powder|bicarbonates?|poudre a lever|acide (citrique|tartrique|ascorbique|malique|lactique))\b/,
  // eau, alcools neutres, sel
  /^(eaux?|eau minerale|eau de source|eau froide|eau de coulage|eau de bassinage|glace|sels?|fleurs? de sel|sel fin|sel de guerande|gros sel)\b/,
  // fruits et dérivés de fruits
  /^(purees?|pulpes?|jus|coulis|compotes?|confits?|zestes?|segments?|cubes?|brunoise|des|brisures?|morceaux|eclats?|lamelles?|batonnets?|quartiers?)\b/,
  /^(fraises?|framboises?|cassis|mures?|myrtilles?|groseilles?|abricots?|peches?|poires?|pommes?|mangues?|passion|fruits? de la passion|citrons?|oranges?|mandarines?|clementines?|pamplemousses?|yuzu|sudachi|combava|bergamotes?|ananas|bananes?|cerises?|griottes?|rhubarbe|melons?|pasteques?|figues?|raisins?|dattes?|pruneaux?|prunes?|mirabelles?|quetsches?|coings?|kiwis?|litchis?|goyaves?|papayes?|fruits? rouges?|fruits? exotiques?)\b/,
  // aromates, épices, colorants
  /^(vanilles?|gousses?|aromes?|essences?|extraits?|colorants?|oxyde|dioxyde|epices?|cannelle|gingembre|safran|poivres?|piments?|menthe|basilic|romarin|thym|verveine|lavande|cardamome|girofle|muscade|badiane|anis|reglisse|tonka|the |thes?|cafes?|infusions?|fleurs? d'oranger|eau de rose)\b/,
  // matières grasses végétales et cacao
  /^(huiles?|beurre de cacao|cacaos?|poudre de cacao|cacao poudre|masse de cacao|grues?|grue de cacao|chocolats? noirs?|couvertures? noires?|guanaja|caraibe|manjari|araguani|abinao|extra ?bitter|equatoriale noire)\b/,
  // divers non allergènes
  /^(nappage neutre|glacage neutre|sirops?|alcools?|rhums?|kirsch|cointreau|grand ?marnier|calvados|armagnac|cognac|liqueurs?|charbon|spiruline|matcha|curcuma)\b/,
  // Spiritueux : les distillats sont exemptés d'étiquetage allergène (UE
  // 1169/2011 annexe II), y compris le whisky issu d'orge.
  /^(whisky|whiskey|bourbon|vodka|gin|tequila|malibu|get ?27|manzana|triple sec|curacao|amaretto|limoncello|pastis|absinthe)\b/,
  // Farines et laits végétaux sans gluten — l'exclusion de la règle gluten les
  // sortait de cette famille sans les rattacher à aucune autre.
  /^farines? de (riz|sarrasin|chataigne|mais|coco|pois chiche|banane|millet|quinoa|teff|lentille)\b/,
  /^(fecules?|amidons?|maizena|tapioca|arrow-?root)\b/,
  // Crus de couverture noirs
  // Crus de couverture NOIRS, nommément. Un cru absent de cette liste reste
  // « inconnu » : le déclarer sans allergène ferait disparaître le lait d'un
  // cru lacté, et c'est le faux négatif le plus grave qu'on puisse produire.
  // À faire relire par Guillaume — cette liste est du métier, pas du code.
  /^((couvertures?|chocolats?) noirs?e?s?|(couvertures?|chocolats?) (guanaja|manjari|araguani|caraibes?|abinao|extra ?bitter|extra ?amer|porcelana|alpaco|andoa|illanka|nyangbo|tainori|macae|satilia noire|ocoa|equatoriale noire|force noire|fleur de cao|inaya|mi-?amere|caraque|force noire|tanzanie|saint ?domingue))\b/,
  // Pâtes et purées d'aromates (la règle gluten les exclut, rien ne les
  // rattachait ensuite)
  /^(pates? de (vanille|marron|marrons|caramel|cacao|fruit|fruits|coco|citron|orange|café|cafe|the)|creme de marrons?|marmelades?|gelees?|confitures?|pepites de cacao|grues? de cacao)\b/,
  // Texturants et additifs
  /^(gellan|psyllium|xanthane|gomme (xanthane|arabique|guar|adragante)|stabilisant|stabilisant-emulsifiant|poudre a flan|gelee dessert|oxyde de titane|pate d'oxyde|dioxyde de titane|sucre (glace|cristal|semoule|roux|blond))\b/,
  // Gélatine sous toutes ses formes (pas un allergène INCO)
  /\bgelatines?\b|\bmasse gelatine\b|\bfeuilles? de gelatine\b/,
  // Noix de coco : hors annexe II
  /^(noix de coco|cocos?\b|coco rapee?|coco poudre|poudre de coco|copeaux de coco|lait de coco|creme de coco|huile de coco)\b/,
];

// ── Résolution ───────────────────────────────────────────────────────────────

/**
 * @param {string} nom  libellé brut de la ligne de recette
 * @returns {{allergenes_inco: string[], source: 'deduction'|'famille_sans_allergene'|'inconnu'}}
 */
export function resoudreParFamille(nom) {
  const n = normaliseLibelle(nom);
  if (!n) return { allergenes_inco: [], source: 'inconnu' };

  const trouves = new Set();
  for (const [motif, ids, exclusion] of REGLES_FAMILLE) {
    if (exclusion && exclusion.test(n)) continue;
    if (motif.test(n)) for (const id of ids) trouves.add(id);
  }
  if (trouves.size > 0) {
    return { allergenes_inco: [...trouves].sort(), source: 'deduction' };
  }

  for (const motif of FAMILLES_SANS_ALLERGENE) {
    if (motif.test(n)) return { allergenes_inco: [], source: 'famille_sans_allergene' };
  }

  return { allergenes_inco: [], source: 'inconnu' };
}

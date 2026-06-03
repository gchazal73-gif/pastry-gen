// Moteur de calcul nutritionnel — Atwater INCO + agrégation multi-composants
// Compatible avec le modèle de données lib/recettes/ (recettes simples + assemblages)

import { INGREDIENTS_NUTRITION } from './ingredients-nutrition.js';
import { getAJR } from './ajr.js';

// ── Aliases manuels ───────────────────────────────────────────────────────────
// Clé = nom utilisé dans les recettes, valeur = clé exacte dans INGREDIENTS_NUTRITION
const NUTRITION_ALIASES = {
  // Beurre (toutes variantes → même macros que beurre doux)
  'Beurre':                         'Beurre doux',
  'Beurre mou':                     'Beurre doux',
  'Beurre pommade':                 'Beurre doux',
  'Beurre froid':                   'Beurre doux',
  'Beurre sec':                     'Beurre doux',
  'Beurre sec 84%':                 'Beurre doux',
  'Beurre 82%':                     'Beurre doux',
  'Beurre 84%':                     'Beurre doux',
  'Beurre clarifié':                'Beurre doux',
  'Beurre demi-sel':                'Beurre doux',
  'Beurre de tourage 82%':          'Beurre doux',
  'Beurre 82% (détrempe)':          'Beurre doux',
  'Beurre 82% (froid)':             'Beurre doux',
  'Beurre 82% (mou)':               'Beurre doux',
  'Beurre 82% fondu froid':         'Beurre fondu',
  'Beurre sec (beurre manié)':      'Beurre doux',
  'Beurre sec (tourage)':           'Beurre doux',

  // Œufs
  "Blancs d'œufs en poudre":        "Poudre de blanc d'œuf",
  "Poudre de blancs d'œufs":        "Poudre de blanc d'œuf",
  "Jaune d'œuf cuit tamisé":        "Jaunes d'œufs",
  'Demi-œuf':                       "Œufs entiers",

  // Crème
  'Crème liquide':                  'Crème liquide 35%',
  'Crème liquide 40%':              'Crème liquide 35%',
  'Crème fraîche':                  'Crème liquide 35%',
  'Crème 35% montée':               'Crème liquide 35%',
  'Crème 35% (sauce)':              'Crème liquide 35%',

  // Lait
  'Lait':                           'Lait entier',
  'Lait tiède':                     'Lait entier',
  'Lait 2.5%':                      'Lait entier',
  'Lait 3.2%':                      'Lait entier',
  'Lait demi-écrémé':               'Lait entier',
  'Lait écrémé':                    'Poudre de lait 0%',
  'Lait brûlé':                     'Lait entier',
  'Lait en poudre 0%':              'Poudre de lait écrémé',
  'Lait poudre 0%':                 'Poudre de lait écrémé',
  'Lait infusé amande':             'Lait entier',
  'Lait infusé cannelle':           'Lait entier',
  'Lait infusé épices':             'Lait entier',
  'Lait infusé espresso-cardamome': 'Lait entier',
  'Lait infusé pain de seigle':     'Lait entier',
  'Lait infusé popcorn':            'Lait entier',
  'Lait infusé thym':               'Lait entier',
  'Lait écrémé infusé coco':        'Lait entier',
  'Réduction de lait entier':       'Lait entier',

  // Sucres
  'Sucre':                          'Sucre semoule',
  'Sucre brun':                     'Cassonade',
  'Sucre brun (cassonade)':         'Cassonade',
  'Sucre brun foncé':               'Cassonade',
  'Sucre de canne roux':            'Cassonade',
  'Sucre demerara':                 'Cassonade',

  // Glucose / sirop
  'Sirop de glucose':               'Sirop de glucose DE 38/40',
  'Glucose atomisé':                'Glucose',
  'Glucose poudre':                 'Glucose',
  'Sirop 30°B':                     'Sucre semoule',
  'Sirop à 30°B':                   'Sucre semoule',

  // Farines / amidons
  'Farine de force':                'Farine T45',
  'Farine de force (13–15% prot.)': 'Farine T45',
  'Farine de force (13–15%)':       'Farine T45',
  'Farine de gruau':                'Farine T45',

  // Amandes / noisettes / pistaches
  "Poudre d'amandes":               "Poudre d'amande",
  "Poudre d'amande torréfiée":      "Poudre d'amande",
  "Amandes en poudre":              "Poudre d'amande",
  "Amandes effilées":               "Poudre d'amande",
  "Amandes entières brutes":        "Poudre d'amande",
  "Amandes torréfiées":             "Poudre d'amande",
  "Extrait d'amande pur":           "Poudre d'amande",
  'Poudre de noisettes':            'Poudre de noisette',
  'Noisettes entières (avec peau)': 'Noisettes',
  'Poudre de noisette torréfiée':   'Poudre de noisette',
  'Pistaches mondées':              'Pâte de pistache',
  'Pistaches Antep':                'Pâte de pistache',
  'Poudre de pistache Antep':       'Pâte de pistache',
  'Noix de pécan crues':            'Noisettes',

  // Pralinés / pâtes
  'Praliné noisettes':              'Praliné noisette',
  'Praliné noisette artisanal':     'Praliné noisette',
  'Praliné noisette 60%':           'Praliné noisette 60%',
  'Praliné amande-noisette 50% Valrhona': 'Praliné noisette',
  'Praliné amande-noisette Valrhona':     'Praliné noisette',
  'Praliné pistache':               'Pâte de pistache',
  'Praliné pistache Valrhona':      'Pâte de pistache',
  'Praliné pécan Valrhona 50%':     'Praliné noisette',
  'Pâte de noisette 100%':          'Pâte de noisette',
  'Pâte de pistache pure':          'Pâte de pistache',
  'Pâte de pistache Sosa':          'Pâte de pistache',
  'Pâte de pistache Antep Sosa':    'Pâte de pistache',
  'Pâte de pistache pure Sosa':     'Pâte de pistache',
  'Pâte de praline':                'Pâte de praliné',
  'Pâte de praline pure':           'Pâte de praliné',
  "Pâte d'amande 70%":              "Pâte d'amande",
  "Pâte d'amandes 50%":             "Pâte d'amande",
  "Pâte d'amandes 70%":             "Pâte d'amande",

  // Chocolats Valrhona (regroupés par type)
  'Chocolat 70% Guanaja':           'Chocolat noir 67%',
  'Chocolat Guanaja 70%':           'Chocolat noir 67%',
  'Chocolat Araguani 72%':          'Chocolat noir 67%',
  'Chocolat Coeur de Guanaja P125 80%': 'Chocolat noir 67%',
  'Chocolat noir 74%':              'Chocolat noir 67%',
  'Chocolat Caraïbe 66%':           'Couverture noir 64%',
  'Chocolat Caraïbe 66% (pépites)': 'Couverture noir 64%',
  'Chocolat Illanka 63%':           'Couverture noir 64%',
  'Chocolat Alpaco 66%':            'Couverture noir 64%',
  'Chocolat Manjari 64%':           'Couverture noir 64%',
  'Chocolat noir Manjari 64%':      'Couverture noir 64%',
  'Chocolat lait':                  'Chocolat au lait 40%',
  'Chocolat lait 35%':              'Chocolat au lait 40%',
  'Chocolat Jivara 40%':            'Chocolat au lait 40%',
  'Chocolat lait Jivara':           'Chocolat au lait 40%',
  'Chocolat lait Jivara 40%':       'Chocolat au lait 40%',
  'Chocolat lait Valrhona Jivara 40%': 'Chocolat au lait 40%',
  'Chocolat lait Bahibe 46%':       'Chocolat au lait 40%',
  'Chocolat lait Tanariva 33%':     'Chocolat au lait 40%',
  'Chocolat blanc 30%':             'Couverture blanc',
  'Chocolat blanc 35%':             'Couverture blanc',
  'Chocolat blanc Ivoire':          'Couverture blanc',
  'Chocolat blanc Opalys 33%':      'Couverture blanc',
  'Chocolat blond Dulcey':          'Couverture blond',
  'Gianduja':                       'Gianduja fondu',
  'Gianduja lait Valrhona 36%':     'Gianduja fondu',
  'Pépites de cacao':               'Poudre de cacao',
  "Grué d'amande (ou cacao)":       'Poudre de cacao',

  // Gélatine (variantes de nommage)
  'Gélatine 200 Bloom':             'Gélatine 200 bloom',
  'Gélatine feuilles':              'Gélatine 200 bloom',
  'Masse gélatine 200 bloom':       'Gélatine 200 bloom',

  // Fruits / purées
  'Fraises fraîches':               'Purée de fraises',
  'Jus citron':                     'Purée de citron',
  "Jus d'orange":                   "Purée d'orange",
  "Jus d'orange sanguine":          "Purée d'orange sanguine",

  // Divers
  'Mascarpone froid':               'Mascarpone',
  'Cream cheese 65%':               'Mascarpone',
  'Sel de Guérande':                'Sel',
  "Flocons d'avoine":               'Farine T45',
  'Feuilletine':                    'Feuilletine (paillettes)',
  'Feuilletine (paillettes wafer)': 'Feuilletine (paillettes)',
  'Crêpes dentelle':                'Feuilletine (paillettes)',
  "Huile d'olive extra-vierge":     'Huile de colza',
  'Huile de noix':                  'Huile de colza',
  'Huile de pépin de raisin':       'Huile de pépins de raisin',
  'Stabilisateur':                  'Gélatine 200 bloom',
  'Stabilisateur glace':            'Gélatine 200 bloom',
  'Stabilisateur sorbet':           'Gélatine 200 bloom',
  'Gomme de xanthane':              'Gélatine 200 bloom',

  // Eau (variantes)
  'Eau froide':                      'Eau',
  'Eau tiède':                       'Eau',
  'Eau infusée menthe poivrée':      'Eau',

  // Purées — variantes de nommage
  'Purée fraises':                   'Purée de fraises',
  'Purée framboises':                'Purée de framboises',
  'Pulpe de framboises':             'Purée de framboises',
  'Pulpe abricots':                  "Purée d'abricots",
  'Purée cassis':                    'Purée de cassis',
  'Pulpe de fruits':                 'Purée de fraises',
  'Pulpe de fruit de la Passion':    'Purée de fruits de la Passion',
  'Pulpe fruits passion':            'Purée de fruits de la Passion',
  'Purée fruit de la passion':       'Purée de fruits de la Passion',
  'Purée pamplemousse rose':         'Purée de pamplemousse rose',
  'Purée de poires':                 'Purée de poire Williams',
  'Purée de pommes McIntosh rôties': 'Purée de pomme Granny Smith',
  'Réduction jus de mandarine':      'Purée de mandarine',
  "Raisins macérés à l'orange":      'Raisins secs',
  'Banane (tranches)':               'Banane (mixée)',
  'Purée/jus de citron vert':        'Purée de citron vert',
  'Purée de citron concassé':        'Purée de citron',

  // Chocolat / cacao
  'Chocolat mexicain':               'Chocolat au lait 40%',

  // Alcools
  'Bière Black and Tan':             'Blanc sec',

  // Texturants
  'Stabilisant-émulsifiant':         'Gomme arabique',
  'Stabilisateur sorbet + xanthane': 'Gomme arabique',
  'Glaçage neutre Valrhona Absolu Cristal': 'Glaçage neutre',
  'Solution acide citrique':         'Acide citrique',

  // Semi-préparés (approximation des macros dominantes)
  'Meringue italienne':              'Sucre semoule',
  'Craquelin (farine+cassonade+beurre pommade)': 'Farine T45',
  'Streusel cacao cuit':             'Poudre de cacao',
  'Streusel pistache cuit':          'Pâte de pistache',
  'Pâte feuilletée classique':       'Farine T45',
  'Pâte feuilletée classique (à réaliser la veille)': 'Farine T45',
  'Pâte à choux (lait+eau+beurre+farine+œufs)': 'Farine T45',

  // Zestes / aromates (macros négligeables / approximées)
  'Zeste citron vert':               'Purée de citron vert',
  "Zeste d'agrume":                  'Purée de citron vert',
  "Épices pain d'épices":            'Cassonade',
  'Arôme alimentaire':               'Eau',

  // Céréales
  'Céréales croustillantes (blé soufflé)': 'Céréales croustillantes',

  // Farines de blé
  'Farine T55':                   'Farine T45',
  'Farine T65':                   'Farine T45',
  'Farine T80':                   'Farine T45',

  // Sucres
  'Sucre glace':                  'Sucre semoule',
  'Sucre inverti':                'Sucre semoule',
  'Sucre muscovado':              'Cassonade',
  'Sucre vergeoise':              'Cassonade',

  // Pectines
  'Pectine NH':                   'Pectine X58',
  'Pectine jaune':                'Pectine X58',

  // Produits laitiers
  'Fromage frais':                'Mascarpone',
  'Fromage blanc':                'Lait entier',

  // Chocolats (70%, 65%, 60%)
  'Chocolat noir 70%':            'Chocolat noir 67%',
  'Chocolat noir 65%':            'Chocolat noir 67%',
  'Chocolat noir 60%':            'Couverture noir 64%',
  'Chocolat blanc 35%':           'Couverture blanc',

  // Fruits frais (approximés sur la purée correspondante)
  'Pomme':                        'Purée de pomme Granny Smith',
  'Pommes':                       'Purée de pomme Granny Smith',
  'Pommes golden':                'Purée de pomme Granny Smith',
  "Pommes Granny Smith":          'Purée de pomme Granny Smith',
  'Pommes Reine des reinettes':   'Purée de pomme Granny Smith',
  'Poires':                       'Purée de poire Williams',
  'Poire':                        'Purée de poire Williams',

  // Alcools
  'Alcool de poire':              'Kirsch',

  // Arômes / épices (quantités négligeables, macros ≈ 0)
  'Vanille liquide':              'Eau',
  'Poudre de vanille':            'Eau',
  'Cannelle en poudre':           'Eau',

  // Ingrédients de structure (approximés)
  'Poudre à crème':               'Fécule de maïs',

  // Farines spéciales
  'Farine de seigle':             'Farine T45',
  'Farine de gruau':              'Farine T45',

  // Corps gras
  'Huile de noisettes':           'Huile de colza',

  // Sucres et sirops
  "Sirop d'érable":               'Sucre semoule',
  'Miel de châtaignier':          'Miel',
  'Miel toutes fleurs':           'Miel',

  // Fruits secs / confits
  'Cranberries séchées':          'Raisins secs',
  'Gingembre confit':             'Abricots secs',
  'Fruits confits':               'Abricots secs',
  'Citron confit':                'Abricots secs',
  "Dés de citron confit":         'Abricots secs',
  "Dés d'oranges confites":       'Abricots secs',
  'Abricots moelleux':            'Abricots secs',
  'Pruneaux':                     'Abricots secs',

  // Chocolats
  'Chocolat noir 64%':            'Couverture noir 64%',
  'Chocolat au lait 34%':         'Chocolat au lait 40%',

  // Produits laitiers
  'Crème fraîche épaisse':        'Crème liquide 35%',

  // Aromates
  'Thé Earl Grey':                'Eau',
  'Thé matcha':                   'Eau',
  'Infusion':                     'Eau',

  // Sucre inverti (trimoline)
  'Trimoline':                    'Sucre inverti',

  // Poudres de fruits secs
  'Poudre de noisettes grillées et salées': 'Poudre de noisette',
  'Poudre de noisettes grillées': 'Poudre de noisette',

  // Purées
  'Purée de pommes vertes':       'Purée de pomme Granny Smith',
  'Jus de pommes':                'Purée de pomme Granny Smith',

  // Levées
  'Beurre noisette':              'Beurre fondu',
  'Farine de gruau':              'Farine T45',

  // Noix de coco
  'Noix de coco râpée':           'Noix de coco râpée',

  // Feuilletine
  'Paillettes feuilletine':       'Feuilletine (paillettes)',
  'Pailletée feuilletine':        'Feuilletine (paillettes)',

  // Épices
  'Quatre-épices':                'Cannelle en poudre',

  // Aromates (quantités négligeables)
  "Fleur d'oranger":              'Eau',
  'Citronnelle':                  'Eau',
  "Essence d'amande amère":       'Eau',
  'Gingembre frais':              'Gingembre frais',

  // Alcools supplémentaires
  'Alcool Malibu':                'Rhum brun',
  'Malibu':                       'Rhum brun',

  // Fruits
  'Ananas':                       "Purée d'ananas",
  'Ananas frais':                 "Purée d'ananas",

  // Pâtes dérivées
  'Feuilles de brick':            'Farine T45',

  // Produits confiserie / glaçage
  'Pâte à glacer':                'Chocolat noir 67%',
  'Pâte à glacer noire':          'Chocolat noir 67%',
  'Fondant':                      'Sucre semoule',
  'Nappage blond':                'Glaçage neutre',

  // Benghanem B7 — crèmes, bavarois, mousses
  'Poudre à flan':                'Fécule de maïs',
  'Café fort infusé':             'Eau',
  'Café moulu':                   'Eau',
  'Extrait de café':              'Eau',
  'Nescafé':                      'Eau',
  'Pulpe de mangue':              'Purée de mangue',
  'Pulpe de mangues':             'Purée de mangues',
  'Pulpe de banane':              'Banane (mixée)',
  'Purée de banane':              'Banane (mixée)',
  'Pulpe de poires':              'Purée de poire Williams',
  'Pulpe de poire':               'Purée de poire Williams',
  'Riz pour risotto':             'Riz blanc cru',
  'Gianduja noisettes':           'Gianduja fondu',
  'Dextrose':                     'Glucose',
  'Lait concentré non sucré':     'Lait entier',
  'Chocolat noir 66%':            'Chocolat noir 67%',
  'Chocolat noir 72%':            'Chocolat noir 67%',
  'Sirop d\'orgeat':              'Sucre semoule',
};

// ── Résolution automatique des suffixes contextuels entre parenthèses ────────
// "Sucre semoule (CA)" → "Sucre semoule", "Eau (1)" → "Eau", etc.
function resolveNomIngredient(nom, table) {
  // 1. Correspondance exacte
  if (table[nom]) return nom;

  // 2. Alias manuel
  if (NUTRITION_ALIASES[nom]) {
    const alias = NUTRITION_ALIASES[nom];
    return table[alias] ? alias : nom;
  }

  // 3. Suppression du suffixe entre parenthèses : "Beurre (CA)" → "Beurre"
  const sansParenthese = nom.replace(/\s*\([^)]+\)\s*$/, '').trim();
  if (sansParenthese !== nom && table[sansParenthese]) return sansParenthese;

  // 4. Alias du nom sans parenthèse
  if (sansParenthese !== nom && NUTRITION_ALIASES[sansParenthese]) {
    const alias = NUTRITION_ALIASES[sansParenthese];
    return table[alias] ? alias : sansParenthese;
  }

  return nom;
}

// Perte à la cuisson par sous-catégorie (% en masse, essentiellement de l'eau)
const PERTE_PAR_SOUS_CAT = {
  biscuit_leger:    12,
  biscuit_meringue:  8,
  petit_gateau:     10,
  croustillant_praline: 5,
  // tout le reste : 0
};

const MACRO_KEYS = ['eau_g', 'lipides_g', 'lipides_satures_g', 'glucides_g', 'sucres_g', 'protides_g', 'fibres_g', 'sel_g', 'alcool_g', 'polyols_g'];

function zeroMacros() {
  return Object.fromEntries(MACRO_KEYS.map(k => [k, 0]));
}

function r1(n) { return Math.round(n * 10) / 10; }

// ── Calcul énergie (Atwater INCO) ────────────────────────────────────────────
function macrosToKcal(m) {
  return (m.glucides_g  ?? 0) * 4
       + (m.protides_g  ?? 0) * 4
       + (m.lipides_g   ?? 0) * 9
       + (m.fibres_g    ?? 0) * 2
       + (m.alcool_g    ?? 0) * 7
       + (m.polyols_g   ?? 0) * 2.4;
}

export function computeIngredientEnergy(macros_per_100g) {
  const kcal = macrosToKcal(macros_per_100g);
  return {
    kcal_100g: r1(kcal),
    kj_100g:   r1(kcal * 4.184),
  };
}

// ── Agrégation d'une liste d'ingrédients { nom, pct } ────────────────────────
// Retourne les macros absolues (en g) pour la masse pre-cuisson donnée
function aggregateMacros(ingredients, masse_pre_g) {
  const totaux = zeroMacros();
  const warnings = [];

  for (const ing of ingredients) {
    const masse_ing = (ing.pct / 100) * masse_pre_g;
    const nomResolu = resolveNomIngredient(ing.nom, INGREDIENTS_NUTRITION);
    const ref = INGREDIENTS_NUTRITION[nomResolu];
    if (!ref) {
      warnings.push(`Ingrédient non trouvé : « ${ing.nom} » — macros ignorées`);
      continue;
    }
    for (const k of MACRO_KEYS) {
      totaux[k] += ((ref[k] ?? 0) / 100) * masse_ing;
    }
  }

  return { totaux, warnings };
}

// ── Calcul nutrition d'un composant (prépa simple ou composant d'assemblage) ─
// ingredients : [{ nom, pct }]
// masse_pre_g : masse totale des ingrédients crus
// perte_pct   : % de perte à la cuisson (0 par défaut)
export function computeComponentNutrition(ingredients, masse_pre_g, perte_pct = 0) {
  return computeComposantNutrition(ingredients, masse_pre_g, perte_pct);
}
function computeComposantNutrition(ingredients, masse_pre_g, perte_pct = 0) {
  const { totaux, warnings } = aggregateMacros(ingredients, masse_pre_g);

  const perte_g = masse_pre_g * (perte_pct / 100);
  const masse_finale_g = masse_pre_g - perte_g;
  totaux.eau_g = Math.max(0, totaux.eau_g - perte_g);

  if (masse_finale_g <= 0) {
    return { masse_finale_g: 0, per_100g: null, totaux, warnings };
  }

  const ratio = 100 / masse_finale_g;
  const per_100g = {};
  for (const k of MACRO_KEYS) {
    per_100g[k] = r1(totaux[k] * ratio);
  }
  const { kcal_100g, kj_100g } = computeIngredientEnergy(per_100g);
  per_100g.kcal = kcal_100g;
  per_100g.kj   = kj_100g;

  // Garde-fou cohérence macros (eau + glucides + protides + lipides + fibres ≈ 100 g)
  const somme = per_100g.eau_g + per_100g.glucides_g + per_100g.protides_g + per_100g.lipides_g + per_100g.fibres_g;
  if (Math.abs(somme - 100) > 2) {
    warnings.push(`Cohérence macros : somme ${r1(somme)} g ≠ 100 g (écart > 2 % — données ingrédient incomplètes ?)`);
  }

  return { masse_finale_g: Math.round(masse_finale_g), per_100g, totaux, warnings };
}

// ── Calcul nutrition recette complète ────────────────────────────────────────
export function computeRecipeNutrition(recette, profileId = 'adulte_2000kcal') {
  const ajr = getAJR(profileId);
  const allWarnings = [];
  let masse_finale_g;
  let per_100g;
  let totaux_globaux;
  let breakdown = [];

  if (recette.type === 'assemblage') {
    // ── Assemblage : agrégation par composant ──────────────────────────────
    const macros_acc = zeroMacros();
    let masse_acc = 0;

    for (const comp of (recette.composants ?? [])) {
      const res = computeComposantNutrition(comp.ingredients, comp.masse_g, 0);
      allWarnings.push(...res.warnings);

      masse_acc += res.masse_finale_g;
      for (const k of MACRO_KEYS) macros_acc[k] += res.totaux[k];

      const kcal_100g_comp = res.per_100g?.kcal ?? 0;
      breakdown.push({
        nom:       comp.nom,
        masse_g:   res.masse_finale_g,
        masse_pct: 0,
        kcal_100g: kcal_100g_comp,
        kcal_total: Math.round(kcal_100g_comp * res.masse_finale_g / 100),
      });
    }

    masse_finale_g  = masse_acc;
    totaux_globaux  = macros_acc;

    const ratio = masse_finale_g > 0 ? 100 / masse_finale_g : 0;
    per_100g = {};
    for (const k of MACRO_KEYS) per_100g[k] = r1(macros_acc[k] * ratio);
    const { kcal_100g, kj_100g } = computeIngredientEnergy(per_100g);
    per_100g.kcal = kcal_100g;
    per_100g.kj   = kj_100g;

    breakdown = breakdown.map(b => ({
      ...b,
      masse_pct: masse_finale_g > 0 ? r1(b.masse_g / masse_finale_g * 100) : 0,
    }));
  } else {
    // ── Recette simple ─────────────────────────────────────────────────────
    const perte_pct = PERTE_PAR_SOUS_CAT[recette.sous_categorie] ?? 0;
    const res = computeComposantNutrition(recette.ingredients, recette.masse_totale_g, perte_pct);
    allWarnings.push(...res.warnings);
    masse_finale_g = res.masse_finale_g;
    per_100g       = res.per_100g;
    totaux_globaux = res.totaux;

    breakdown = [{
      nom:        recette.nom,
      masse_g:    masse_finale_g,
      masse_pct:  100,
      kcal_100g:  per_100g?.kcal ?? 0,
      kcal_total: Math.round((per_100g?.kcal ?? 0) * masse_finale_g / 100),
    }];
  }

  if (!per_100g) {
    return { masse_finale_g: 0, per_100g: null, totals: null, ajr_pct_per_100g: null, breakdown_par_composant: [], warnings: allWarnings };
  }

  // ── % AJR pour 100 g ──────────────────────────────────────────────────────
  const ajr_pct_per_100g = {
    energie:  r1(per_100g.kcal            / ajr.energie_kcal       * 100),
    lipides:  r1(per_100g.lipides_g       / ajr.lipides_g          * 100),
    satures:  r1(per_100g.lipides_satures_g / ajr.lipides_satures_g * 100),
    glucides: r1(per_100g.glucides_g      / ajr.glucides_g         * 100),
    sucres:   r1(per_100g.sucres_g        / ajr.sucres_g           * 100),
    protides: r1(per_100g.protides_g      / ajr.protides_g         * 100),
    fibres:   r1(per_100g.fibres_g        / ajr.fibres_g           * 100),
    sel:      r1(per_100g.sel_g           / ajr.sel_g              * 100),
  };

  // ── Totaux absolus + énergie totale ───────────────────────────────────────
  const totals = { ...totaux_globaux };
  totals.kcal = r1(macrosToKcal(totaux_globaux));
  totals.kj   = r1(totals.kcal * 4.184);

  return {
    masse_finale_g,
    per_100g,
    totals,
    ajr_pct_per_100g,
    breakdown_par_composant: breakdown,
    warnings: allWarnings,
  };
}

// ── Calcul nutrition d'un plan de travail (N slots indépendants) ─────────────
// slots       : [{ uid, recetteId, masse }]
// recettesMap : { [id]: recette }
// Retourne la nutrition pour 100 g de produit fini (somme pondérée des slots)
export function computePlanNutrition(slots, recettesMap, profileId = 'adulte_2000kcal') {
  const ajr = getAJR(profileId);
  const allWarnings = [];
  const macros_acc = zeroMacros();
  let masse_acc = 0;
  let kcal_acc = 0;
  const breakdown = [];

  for (const slot of slots) {
    const recette = recettesMap[slot.recetteId];
    if (!recette) continue;

    const masse_slot = Number(slot.masse) > 0 ? Number(slot.masse) : recette.masse_totale_g;
    const res = computeRecipeNutrition(recette, profileId);
    allWarnings.push(...res.warnings);
    if (!res.per_100g || res.masse_finale_g === 0) continue;

    const ratio = masse_slot / recette.masse_totale_g;
    const masse_finale_slot = Math.round(res.masse_finale_g * ratio);

    for (const k of MACRO_KEYS) {
      macros_acc[k] += (res.per_100g[k] ?? 0) * masse_finale_slot / 100;
    }
    masse_acc += masse_finale_slot;

    const kcal_slot = r1(res.per_100g.kcal * masse_finale_slot / 100);
    kcal_acc += kcal_slot;
    breakdown.push({
      uid:                   slot.uid,
      nom:                   recette.nom,
      categorie:             recette.categorie,
      masse_finale_g:        masse_finale_slot,
      masse_pct:             0,
      kcal_100g:             res.per_100g.kcal,
      kcal_total:            Math.round(kcal_slot),
      contribution_pct_kcal: 0,
    });
  }

  if (masse_acc === 0) {
    return { masse_totale_finale_g: 0, per_100g: null, totals: null, ajr_pct_per_100g: null, breakdown: [], warnings: allWarnings };
  }

  const ratio = 100 / masse_acc;
  const per_100g = {};
  for (const k of MACRO_KEYS) per_100g[k] = r1(macros_acc[k] * ratio);
  const { kcal_100g, kj_100g } = computeIngredientEnergy(per_100g);
  per_100g.kcal = kcal_100g;
  per_100g.kj   = kj_100g;

  const ajr_pct_per_100g = {
    energie:  r1(per_100g.kcal              / ajr.energie_kcal        * 100),
    lipides:  r1(per_100g.lipides_g         / ajr.lipides_g           * 100),
    satures:  r1(per_100g.lipides_satures_g / ajr.lipides_satures_g   * 100),
    glucides: r1(per_100g.glucides_g        / ajr.glucides_g          * 100),
    sucres:   r1(per_100g.sucres_g          / ajr.sucres_g            * 100),
    protides: r1(per_100g.protides_g        / ajr.protides_g          * 100),
    fibres:   r1(per_100g.fibres_g          / ajr.fibres_g            * 100),
    sel:      r1(per_100g.sel_g             / ajr.sel_g               * 100),
  };

  const totals = { ...macros_acc };
  totals.kcal = r1(macrosToKcal(macros_acc));
  totals.kj   = r1(totals.kcal * 4.184);

  return {
    masse_totale_finale_g: masse_acc,
    per_100g,
    totals,
    ajr_pct_per_100g,
    breakdown: breakdown.map(b => ({
      ...b,
      masse_pct:             r1(b.masse_finale_g / masse_acc * 100),
      contribution_pct_kcal: kcal_acc > 0 ? r1(b.kcal_total / kcal_acc * 100) : 0,
    })),
    warnings: allWarnings,
  };
}

// ── Badge AJR ─────────────────────────────────────────────────────────────────
export function formatAJRBadge(value_per_100g, ajrValue) {
  const pct = r1(value_per_100g / ajrValue * 100);
  let level;
  if      (pct < 7.5) level = 'low';
  else if (pct < 15)  level = 'moderate';
  else if (pct < 30)  level = 'high';
  else                level = 'critical';
  return { pct, level };
}

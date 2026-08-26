# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Langue

Tout le projet est en français : noms de fichiers, exports (`genererRecette`,
`calculerIndicateurs`, `FOURCHETTES_TEXTURE`), commentaires, interface, données.
Le vocabulaire est celui du métier — POD, PAC, MSNG, extrait sec, mercuriale,
DLC, fourchette — et il est signifiant : ne pas le traduire ni l'angliciser.

## Commandes

```sh
npm run dev                  # Next 16, http://localhost:3000
npm run build && npm start
npm run lint                 # eslint 9, config plate (eslint.config.mjs)
npm test                     # vitest run — pas de fichier de config, il ramasse lib/__tests__/*.test.js

npx vitest run lib/__tests__/cout.test.js     # un fichier
npx vitest run -t "coût matière"              # un cas par son nom
npx vitest                                     # mode veille

npm run validate-ingredients # cohérence de la bibliothèque locale `lib/ingredients-db.js`
```

`validate-ingredients` ne demande **aucune variable d'environnement ni accès
réseau** : il lit `lib/ingredients-db.js`. Il vérifie l'unicité des `id`, que les
macros somment à 100 g, que `sucres_g ≤ glucides_g` et que POD/PAC restent
plausibles. État actuel : 96 ingrédients, 4 cibles de template, 0 erreur,
8 avertissements.

## Deux chemins de recettes, à ne jamais confondre

**1. Le générateur (chemin « V1 », local)** — `app/page.jsx` → `lib/engine.js`.
`genererRecette({ textureId, parfumId, masse, contraintes })` croise 9 templates
de texture (`lib/templates*.js`) et 84 parfums (`lib/data.js#PARFUMS`) : il pose
des lignes en %, les **normalise à 100 % en absorbant l'écart sur la phase
aqueuse** (à défaut, au prorata), puis passe en grammes. Les contraintes
(`vegan`, `lactose`, `gluten`, `igbas`, `bien_etre`) sont résolues *dans* le
template, ligne par ligne, via `actif()` / `getIngredient()` / `pctOverride()`.

**2. La bibliothèque (figée)** — `lib/recettes/*.js`, **1 594 recettes** extraites
de PDF professionnels, agrégées par `lib/recettes/index.js`, qui leur ajoute au
passage une `famille` calculée depuis `categorie` + `sous_categorie`
(`getFamille`). Trois taxonomies coexistent et sont toutes exportées de là :
`CATEGORIES` (17, l'origine du fichier), `FAMILLES` (12, ce que voit
l'utilisateur), `SOUS_CAT_LABELS` (l'étiquette d'affichage).

Les deux produisent des lignes **de forme différente** — `{ ingredient, g, pct,
role, dataKey }` pour le générateur, `{ nom, g, pct, role }` pour la
bibliothèque. Les moteurs d'analyse acceptent les deux (voir l'en-tête de
`lib/cout.js`) ; toujours savoir laquelle on tient.

## L'étage de calcul

Un seul jeu de moteurs sert les deux chemins :

| Module | Rôle |
|---|---|
| `engine_indicateurs.js` | `calculerIndicateurs` / `calculerBreakdown` — le socle : ES, MG, MSNG, sucres, fibres, lactose, POD, PAC, pH, eau libre |
| `fourchettes.js` | `FOURCHETTES_TEXTURE` + `verifierFourchettes` — les cibles professionnelles par texture |
| `engine_glaces.js` / `engine_reequilibrage.js` | rééquilibrage automatique, glacé et non glacé, **même interface** |
| `engine_conseils.js` | pour chaque indicateur hors fourchette, le contributeur principal et l'ajustement chiffré |
| `nutrition.js` + `ajr.js` | Atwater INCO, agrégation des assemblages, % AJR |
| `cout.js`, `allergenes.js`, `conservation.js` | coût matière, allergènes UE 1169/2011, DLC indicative |
| `production.js` + `moules.js` | géométrie du moule → volume → masses par couche |
| `moteur_accords.js` + `data_accords.js` | accords de parfums et textures compatibles |

## Les allergènes se résolvent en trois étages

`allergenes.js` interroge d'abord `ingredients-metier.js` — le référentiel, qui
fait foi et qui seul connaît les **traces possibles**. Mais il ne contient que
58 ingrédients : 32 % des lignes du corpus y trouvent une correspondance exacte.
Le reste passe par `allergenes-familles.js`, qui lit la **famille** dans le
libellé (« Crème UHT », « Crème fraîche fluide (32/34 % MG) » et « Crème liquide
35 % » disent toutes *lait*).

Trois issues, et la troisième compte autant que les deux premières :
`deduction` (la famille porte un allergène), `famille_sans_allergene` (famille
identifiée, rien à déclarer — le sucre n'a pas d'allergène, et le dire est une
information) et `inconnu`. Seul ce dernier fait dire à la fiche qu'elle ne sait
pas. Répartition actuelle : 32 % / 28 % / 36 % / 4 %.

`getRecetteAllergenes` sépare `allergenes_verifies` de `allergenes_deduits` : un
allergène attesté au référentiel sur au moins une ligne est vérifié, sinon il
reste déduit. `formatLabelInco` le marque d'un ° et fournit la note d'explication
**à part** du libellé légal, à charge de chaque surface de la rendre.

Deux pièges à ne pas rouvrir. Une **déduction ne connaît jamais les traces** :
`traces_possibles` reste vide hors référentiel, et c'est une limite à afficher,
pas à combler. Et un **cru de couverture non listé reste `inconnu`** : le
déclarer sans allergène ferait disparaître le lait d'un cru lacté. La liste des
crus noirs dans `allergenes-familles.js` est du métier, pas du code — elle se
relit, elle ne se devine pas.

`engine_indicateurs` résout chaque ligne **en cascade** : `INGREDIENTS_GLACE`
par `dataKey`, sinon l'ingrédient passé en `mainIngredient`, sinon la table
`FALLBACK` par rôle. La cascade ne lève jamais d'erreur — elle retombe
silencieusement sur le fallback.

D'où le piège principal du dépôt : **le rôle est une chaîne, et il est apparié
par expression régulière**. La table qui fait foi est `ROLE_MAP` (40 entrées,
lue par `getRoleKey`) dans `engine_indicateurs.js` ; s'y ajoutent
`INDICATEUR_CONFIG` dans `engine_conseils.js`, et `IND_CONFIG` + `PARFUM_RE`
dans `engine_reequilibrage.js`. L'ordre de `ROLE_MAP` compte — le premier motif
qui accroche gagne, et les entrées ancrées (`^crème`, `^eau\b`, `^sel\b`) sont
là pour ça : une nouvelle ligne mal placée détourne des rôles existants.
Renommer un `role` ou un `label` de template ne casse rien visiblement : le
calcul bascule sur une valeur générique et le résultat devient faux sans un
message. Même chose pour les ingrédients, appariés par leur **nom français
exact** entre `lib/ingredients-nutrition.js` (288 entrées, macros),
`lib/ingredients-metier.js` (58 entrées, prix / allergènes / conservation) et les
recettes — `NUTRITION_ALIASES` existe justement pour rattraper les variantes
(« Beurre pommade » → « Beurre doux »). Renommer un ingrédient, c'est le
renommer partout.

## Pas de base : la bibliothèque d'ingrédients est locale

**Il n'y a plus de Supabase.** La dépendance a été retirée le 2026-08-23 :
`lib/supabase.js` est supprimé, `@supabase/supabase-js` ne figure plus dans
`package.json`, et l'application ne fait plus **aucun appel réseau**. Elle se
construit, se teste et se déploie sans la moindre variable d'environnement.

Les données vivent dans `lib/ingredients-db.js` — export figé de l'ancienne base
au 2026-08-22 : `INGREDIENTS_DB` (96 ingrédients) et `TEMPLATE_TARGETS` (4).

`lib/ingredient-store.js` sert cette table. Ses trois `fetch*` restent
**asynchrones par compatibilité** avec les appelants qui font déjà `await` ;
les versions synchrones `getIngredients` / `getIngredientById` /
`getTemplateTarget` sont à préférer dans le nouveau code.

Une seule page en dépend : `/ingredients` (`components/IngredientLibrary.jsx`,
qui n'utilise que `fetchIngredients`). Tout le reste du module est exporté et
jamais importé — `fetchIngredientById`, `fetchTemplateTarget`, les trois
getters synchrones, `TEMPLATE_FAMILLES`, `FROZEN_TEMPLATES` et
`INGREDIENT_TO_PARFUM_V1`. `SUPABASE_TO_PARFUM_V1` subsiste en simple alias de
ce dernier : ne pas s'y fier, c'est un vestige.

La bibliothèque étant désormais toujours peuplée, le cas « aucune base
branchée » n'existe plus : `IngredientLibrary` ne signale qu'un échec de
chargement.

La migration `docs/archive-supabase-20260528_*.sql` (archivée, plus jouée)
ajoutait des colonnes coût / allergènes / DLC qui **doublaient**
`lib/ingredients-metier.js`. Les moteurs `cout`, `allergenes` et `conservation`
ont toujours lu le fichier local, et c'est lui qui fait autorité.

## État côté navigateur

Aucun backend applicatif : tout ce que l'utilisateur produit vit dans
`localStorage`, sous le préfixe `pastry-gen-` — `-plan` (le plan de travail, que
la `Sidebar` relit pour son badge et suit d'un onglet à l'autre par l'événement
`storage`), `-mes-compositions`, `-favoris`, `-recettes-generees`,
`-mercuriale-overrides`, `-mult-revient` / `-mult-pvttc` (coefficients de prix,
défauts 2 et 5), `-sidebar-collapsed`.

Les stores de `lib/*-store.js` gardent tous un `typeof window === 'undefined'` :
les pages sont bien des composants client, mais Next les rend d'abord côté
serveur. Ne pas retirer cette garde.

Les prix se corrigent **par override en `localStorage`**, jamais en éditant
`ingredients-metier.js` — son en-tête le dit, et la Mercuriale en dépend.

## Routes et rendu

`components/Sidebar.jsx#NAV_ITEMS` est la carte du site : les entrées
`active: false` (Templates, Mes recettes, Profils, Paramètres) sont des
emplacements réservés, pas des pages cassées. `/recettes` redirige en permanence
vers `/bibliotheque` (`next.config.ts`).

`app/layout.tsx` pose la coquille, puis tout passe par `ClientShell` (sidebar +
barre mobile). Les pages sont des `.jsx` en `'use client'`, sauf
`app/ingredients/page.tsx` et `app/glacerie/page.jsx`, restées composants
serveur pour déléguer à un composant client — c'est ce qui leur permet
d'exporter `metadata`. Une page qu'on bascule en client perd ce droit. Alias
d'import : `@/*` → racine du dépôt.

## Tests

`vitest`, sans fichier de configuration, dans `lib/__tests__/` à côté de ce
qu'ils couvrent (allergènes, conseils, conservation, coût, fourchettes,
indicateurs, nutrition, production, rééquilibrage). Ils **injectent leurs
propres tables de données en ligne** au lieu d'importer les vraies : modifier
`ingredients-metier.js` ne les fera pas rougir. Ils gardent la *logique* des
moteurs, pas la justesse des données — pour celle-ci, `validate-ingredients` et
la relecture.

## Traçabilité des recettes

Chaque recette porte un `source_interne { fichier_pdf, page, nom_original, chef,
date_extraction }` et un drapeau `a_verifier`. **1 007 des 1 594 recettes sont
encore à `a_verifier: true`** : une donnée de la bibliothèque n'est pas une
donnée vérifiée, et le drapeau est la seule chose qui le dise.

`lib/recettes/_extraction.log.md` est le journal d'extraction — jamais chargé
par l'application, à tenir à jour quand on ajoute un lot. Les PDF sources vivent
dans `/_sources/`, non versionné (voir `.gitignore`).

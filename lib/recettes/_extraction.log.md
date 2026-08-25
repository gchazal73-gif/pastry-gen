# Journal d'extraction — bibliothèque de recettes

Ce fichier est un journal de traçabilité interne. Il n'est jamais chargé par l'application.
Chaque entrée documente l'origine d'une recette extraite d'une source PDF.

---

## 2026-05-18 — Recettes de test (données génériques)

| ID recette                         | Fichier PDF | Page | Nom original dans la source       | Statut     |
|------------------------------------|-------------|------|-----------------------------------|------------|
| biscuit-joconde-01                 | —           | —    | Biscuit de test — recette générique | ✓ validé  |
| dacquoise-noisette-01              | —           | —    | Biscuit de test — recette générique | ✓ validé  |
| financier-amande-01                | —           | —    | Biscuit de test — recette générique | ✓ validé  |
| cremeux-framboise-01               | —           | —    | Recette de test — recette générique | ✓ validé  |
| creme-patissiere-vanille-01        | —           | —    | Recette de test — recette générique | ✓ validé  |
| mousse-chocolat-noir-01            | —           | —    | Recette de test — recette générique | ✓ validé  |
| mousse-framboise-01                | —           | —    | Recette de test — recette générique | ✓ validé  |
| croustillant-praline-feuilletine-01 | —          | —    | Recette de test — recette générique | ✓ validé  |

---

## Format d'une entrée future (extraction PDF)

```
| <id-recette>  | <fichier.pdf> | <p.XX> | <Titre exact dans le livre> | ✓ validé / ⚠ à vérifier |
```

Placer les PDFs source dans `_sources/` (gitignore — non versionné).

---

## 2026-06-01 — Lenôtre T2 — Extraction complète (6 batches)

Source : **Chocolats et confiserie de l'école Lenôtre T2**, François Legras & Stéphane Glacier, Éditions Jérôme Villette 2000. Contributions de Philippe Bertrand (MOF 1996 / Barry Callebaut). 133 pages.

### Bonbons chocolat (bonbons.js) — 20 entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| tablette-noix-coco-ln2 | Lenotre T2 | 13 | La Tablette noix de coco | ✓ validé |
| moka-ln2 | Lenotre T2 | 17 | Le Moka | ✓ validé |
| panache-ln2 | Lenotre T2 | 19 | Le Panaché | ⚠ à vérifier |
| bouchee-gianduja-pistache-ln2 | Lenotre T2 | 21 | La Bouchée gianduja pistache | ✓ validé |
| barbade-ln2 | Lenotre T2 | 23 | Le Barbade | ⚠ à vérifier (sucre double) |
| ganache-framboise-ln2 | Lenotre T2 | 35 | Ganache framboise | ✓ validé |
| menthe-fraiche-ln2 | Lenotre T2 | 39 | La Menthe fraîche | ✓ validé |
| citron-vert-ln2 | Lenotre T2 | 41 | Le Citron vert | ✓ validé |
| miel-chataignier-ln2 | Lenotre T2 | 43 | Ganache miel de châtaignier | ⚠ à vérifier (incohérence FR/EN) |
| gingembre-ln2 | Lenotre T2 | 53 | Le Gingembre | ✓ validé |
| quatre-epices-ln2 | Lenotre T2 | 54 | Le Quatre-épices | ✓ validé |
| barbarie-ln2 | Lenotre T2 | 57 | Le Barbarie | ⚠ à vérifier |
| licorie-ln2 | Lenotre T2 | 59 | Le Licorie | ✓ validé |
| anis-ln2 | Lenotre T2 | 61 | L'Anis | ⚠ à vérifier (pct > 100 %) |
| pistachier-ln2 | Lenotre T2 | 91 | Le Pistachier | ✓ validé |
| sesame-ln2 | Lenotre T2 | 97 | Le Sésame | ⚠ à vérifier (pct) |
| valencia-cafe-ln2 | Lenotre T2 | 93 | Le Valencia café | ✓ validé |
| zebre-ln2 | Lenotre T2 | 93 | Le Zébré | ⚠ à vérifier (masses gianduja) |
| chocolat-blanc-cerise-ln2 | Lenotre T2 | 87 | Chocolat blanc/cerise (Bertrand) | ✓ validé |
| caramel-fraise-ln2 | Lenotre T2 | 87 | Caramel fraise (Bertrand) | ✓ validé |

### Confiseries sucrées (confiseries.js) — 12 entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| praline-montespan-ln2 | Lenotre T2 | 31 | Praline de Montespan | ✓ validé |
| praline-rouge-ln2 | Lenotre T2 | 33 | Praline rouge | ✓ validé |
| nougat-pur-miel-ln2 | Lenotre T2 | 45 | Le Nougat pur miel | ✓ validé |
| nougat-blanc-ln2 | Lenotre T2 | 46 | Le Nougat blanc | ✓ validé |
| nougat-pistache-ln2 | Lenotre T2 | 49 | Le Nougat pistache | ✓ validé |
| nougat-dur-coriandre-ln2 | Lenotre T2 | 51 | Nougat dur au coriandre | ✓ validé |
| bonbon-pate-amande-orange-ln2 | Lenotre T2 | 47 | Bonbon pâte d'amande/choco/orange | ⚠ à vérifier (pct) |
| bonbon-pate-amande-cafe-ln2 | Lenotre T2 | 47 | Bonbon pâte d'amande/choco/café | ⚠ à vérifier (pct) |
| marrons-glaces-ln2 | Lenotre T2 | 89 | Marrons glacés | ✓ validé |
| toffee-ln2 | Lenotre T2 | 101 | Toffee | ✓ validé |
| liqueur-irlandaise-ln2 | Lenotre T2 | 106 | Liqueur irlandaise | ✓ validé |
| liqueur-framboise-ln2 | Lenotre T2 | 107 | Liqueur framboise | ✓ validé |

### Caramels confiserie (caramels.js) — 4 entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| caramel-vanille-ln2 | Lenotre T2 | 99 | Caramel vanille | ✓ validé |
| caramel-chocolat-ln2 | Lenotre T2 | 100 | Caramel chocolat | ✓ validé |
| caramel-gingembre-citron-orange-ln2 | Lenotre T2 | 101 | Caramel gingembre/citron/orange | ⚠ à vérifier |
| caramel-pistache-ln2 | Lenotre T2 | 102 | Caramel pistache | ✓ validé |

### Confitures & gelées (confitures.js — nouveau fichier) — 7 entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| confiture-abricots-ln2 | Lenotre T2 | 63 | Confiture d'abricots | ✓ validé |
| confiture-fraise-cannelle-ln2 | Lenotre T2 | 64 | Confiture fraise/cannelle | ✓ validé |
| confiture-rhubarbe-cassis-ln2 | Lenotre T2 | 65 | Confiture rhubarbe/cassis | ✓ validé |
| confiture-tomate-citron-vert-ln2 | Lenotre T2 | 65 | Confiture tomate/citron vert | ✓ validé |
| gelee-groseille-ln2 | Lenotre T2 | 67 | Gelée de groseille | ✓ validé |
| gelee-pomme-ln2 | Lenotre T2 | 68 | Gelée de pomme | ✓ validé |
| confiture-poire-banane-ln2 | Lenotre T2 | 68 | Confiture poire/banane | ⚠ à vérifier (pct > 100 %) |

### Assemblages — tartes & entremets (assemblages.js) — 7 entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| tarte-choc-framboise-ln2 | Lenotre T2 | 25 | Tarte chocolat framboise | ⚠ à vérifier (scan) |
| tarte-fondante-chocolat-ln2 | Lenotre T2 | 27 | Tarte fondante au chocolat | ⚠ à vérifier (scan) |
| tarte-bourbon-chocolat-ln2 | Lenotre T2 | 29 | Tarte bourbon au chocolat | ⚠ à vérifier (scan) |
| longchamps-ln2 | Lenotre T2 | 69 | Le Longchamps | ⚠ à vérifier (scan) |
| bora-bora-ln2 | Lenotre T2 | 73 | Le Bora-bora | ⚠ à vérifier (scan) |
| intense-ln2 | Lenotre T2 | 79 | L'Intense | ⚠ à vérifier (scan) |
| mayorque-ln2 | Lenotre T2 | 81 | Le Mayorque | ⚠ à vérifier (scan) |

**Total Lenôtre T2 : 50 nouvelles entrées** (+ 1 nouvelle catégorie : confitures, ordre 17)

---

## 2026-06-02 — Benghanem — Batch 1 : LES PÂTES (pp. 13–52)

Source : **Le Grand Cours de Pâtisserie — L'essentiel de la pâtisserie**, Eddie Benghanem, 292 pages, 475 entrées TOC.

### Pâtes de base (pates.js) — 8 entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| pate-brisee-eb | Benghanem | 14 | Pâte brisée de base (pâte à foncer) | ✓ validé |
| pate-brisee-noisette-eb | Benghanem | 14 | Pâte brisée à la noisette | ✓ validé |
| pate-sucree-eb | Benghanem | 21 | Pâte sucrée | ✓ validé |
| pate-sablee-eb | Benghanem | 25 | Pâte sablée de base | ✓ validé |
| sable-breton-eb | Benghanem | 25 | Sablé breton | ✓ validé |
| pate-linzer-eb | Benghanem | 36 | Pâte Linzer | ✓ validé |
| pate-crumble-eb | Benghanem | 40 | Pâte à crumble | ✓ validé |
| pate-etirer-eb | Benghanem | 46 | Pâte à étirer | ✓ validé |

### Cookies (biscuits.js) — 5 entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| cookie-cacahuete-eb | Benghanem | 49 | Cookies au beurre de cacahuètes | ✓ validé |
| cookie-chocolat-noisette-eb | Benghanem | 49 | Cookies au chocolat noir et noisettes | ✓ validé |
| cookie-tout-chocolat-eb | Benghanem | 49 | Cookies tout chocolat | ✓ validé |
| cookie-raisins-secs-eb | Benghanem | 49 | Cookies aux raisins secs | ✓ validé |
| cookie-sucre-brun-eb | Benghanem | 49 | Cookies au sucre brun | ✓ validé |

### Assemblages (assemblages.js) — 11 entrées

| ID recette | PDF | Page | Titre original | Moule | Statut |
|---|---|---|---|---|---|
| chaussons-pommes-eb | Benghanem | 15 | Chaussons aux pommes | ø 120 mm | ✓ validé |
| tarte-normande-pommes-eb | Benghanem | 16 | Tarte normande aux pommes | ø 24 cm | ✓ validé |
| cheesecake-eb | Benghanem | 18 | Cheesecake | cadre 20×20×2 cm | ✓ validé |
| tarte-bourdaloue-eb | Benghanem | 21 | Tarte bourdaloue | ø 20 cm | ✓ validé |
| tarte-bourdaloue-mousse-chocolat-eb | Benghanem | 22 | Tarte bourdaloue mousse au chocolat | ø 5 cm indiv. | ⚠ lait OCR corrigé |
| tartelettes-citron-framboise-eb | Benghanem | 24 | Tartelettes citron-framboise | demi-sphères ø 5/3 cm | ✓ validé |
| sable-breton-pomme-verte-eb | Benghanem | 26 | Sablé breton acidulé à la pomme verte | cadre 20×20 cm | ✓ validé |
| sables-bretons-caramel-demis-sel-eb | Benghanem | 26 | Sablés bretons au caramel demi-sel | ø 6 cm | ✓ validé |
| tarte-linzer-framboise-eb | Benghanem | 36 | Tarte linzer à la framboise | ø 22 cm | ✓ validé |
| gateau-basque-eb | Benghanem | 44 | Gâteau basque | ø 22 cm × h 2 cm | ✓ validé |
| crumble-pommes-eb | Benghanem | 40 | Crumble aux pommes | ø 8 cm indiv. | ✓ validé |

**Total Benghanem Batch 1 : 24 nouvelles entrées**

---

## 2026-06-03 — Benghanem — Batch 2 : LES PÂTES À CAKES (pp. 54–79)

### Cakes / Brownies / Muffins / Scones (biscuits.js) — 12 entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| cake-citron-eb | Benghanem | 54 | Cake au citron | ✓ validé |
| cake-marbre-eb | Benghanem | 54 | Cake marbré chocolat vanille | ✓ validé |
| cake-huile-olive-eb | Benghanem | 56 | Cake à l'huile d'olive | ✓ validé |
| cake-pain-epices-eb | Benghanem | 56 | Cake pain d'épices | ✓ validé |
| cake-fruits-confits-base-eb | Benghanem | 56 | Cake aux fruits confits | ✓ validé |
| cake-tout-chocolat-eb | Benghanem | 56 | Cake tout chocolat | ✓ validé |
| cake-citron-the-eb | Benghanem | 57 | Cake au citron et au thé Earl Grey | ✓ validé |
| cake-sucre-brun-eb | Benghanem | 66 | Cake au sucre brun (base) | ✓ validé |
| pain-de-genes-eb | Benghanem | 69 | Pain de Gênes | ✓ validé |
| brownie-eb | Benghanem | 74 | Brownie au chocolat | ✓ validé |
| muffins-nature-eb | Benghanem | 76 | Muffins nature | ✓ validé |
| scones-eb | Benghanem | 78 | Scones | ⚠ 40cl crème fraîche corrigé en 40g |

### Assemblages (assemblages.js) — 6 entrées

| ID recette | PDF | Page | Titre original | Moule | Statut |
|---|---|---|---|---|---|
| cake-pims-citron-eb | Benghanem | 58 | Cake au citron façon Pim's | ø 12cm ×h 4cm | ✓ validé |
| cake-fruits-eb | Benghanem | 60 | Cake aux fruits | 27×9cm | ✓ validé |
| nonnettes-eb | Benghanem | 72 | Nonnettes | 60 moules indiv. | ⚠ à vérifier (nutrition confits approx.) |
| brownie-ganache-lait-eb | Benghanem | 74 | Brownie ganache chocolat au lait | ovales 13×5cm | ✓ validé |
| scones-beurre-confiture-eb | Benghanem | 78 | Scones beurre-confiture | ø 6cm | ✓ validé |
| layer-scone-eb | Benghanem | 79 | Layer scone | 5 cercles ø18cm | ✓ validé |

**Total Benghanem Batch 2 : 18 nouvelles entrées**

---

## 2026-06-03 — Benghanem — Batch 3 : PÂTES LIQUIDES + CHOUX (pp. 81–95)

### Biscuits standalone (biscuits.js) — 8 entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| clafoutis-nature-eb | Benghanem | 81 | Clafoutis nature | ✓ validé |
| crepes-nature-eb | Benghanem | 84 | Crêpes nature | ✓ validé |
| pancakes-ricotta-eb | Benghanem | 85 | Pancakes lemon ricotta | ✓ validé |
| pate-a-beignets-eb | Benghanem | 86 | Pâte à beignets | ✓ validé |
| bugnes-eb | Benghanem | 86 | Pâte à bugnes | ✓ validé |
| canneles-eb | Benghanem | 89 | Cannelés | ✓ validé |
| gaufres-liquides-eb | Benghanem | 90 | Gaufres (pâte liquide) | ✓ validé |
| gaufres-pate-dure-eb | Benghanem | 90 | Gaufres (pâte dure) | ✓ validé |

### Pâte de base (pates.js) — 1 entrée

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| craquelin-eb | Benghanem | 94 | Craquelin | ✓ validé |

### Assemblages (assemblages.js) — 4 entrées

| ID recette | PDF | Page | Titre original | Moule | Statut |
|---|---|---|---|---|---|
| far-breton-eb | Benghanem | 81 | Far breton | plat ø 22 cm | ✓ validé |
| clafoutis-amandes-pommes-eb | Benghanem | 82 | Clafoutis aux amandes et pommes | 12 ramequins ø 6 cm | ✓ validé |
| beignets-confit-framboises-eb | Benghanem | 87 | Beignets garnis au confit | emporte-pièce ø 5 cm | ✓ validé |
| choux-chocolat-eb | Benghanem | 95 | Choux au chocolat | choux ø 3 cm | ✓ validé |

**Note B3 :** pate-a-choux-eb et saint-honore-eb déjà présents (extractions antérieures). 4 doublons B1 supprimés de pates.js (pate-brisee-noisette-eb, pate-sucree-eb, sable-breton-eb, pate-linzer-eb).

**Total Benghanem Batch 3 : 13 nouvelles entrées**

---

## 2026-06-03 — Benghanem — Batch 4 : PÂTES À BISCUITS (pp. 100–121)

Entrées pré-existantes (non recréées) : genoise-eb, dacquoise-amandes-eb, dacquoise-noisettes-eb, biscuit-cuillere-eb, biscuit-chocolat-sf-eb, biscuit-joconde-eb, charlotte-chocolat-eb, opera-eb, opera-pistache-framboise-eb

### Biscuits standalone (biscuits.js) — 3 entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| biscuits-de-reims-eb | Benghanem | 100 | Biscuits de Reims | ✓ validé |
| dacquoise-croustillante-praline-eb | Benghanem | 109 | Dacquoises croustillantes au praliné | ✓ validé |
| biscuit-pate-choux-eb | Benghanem | 114 | Biscuit pâte à choux | ✓ validé |

### Assemblages (assemblages.js) — 5 entrées

| ID recette | PDF | Page | Titre original | Moule | Statut |
|---|---|---|---|---|---|
| tiramisu-caramel-cafe-eb | Benghanem | 103 | Tiramisu minute caramel-café | verrines | ✓ validé |
| fraisier-noisette-choc-blanc-eb | Benghanem | 110 | Fraisier noisette–chocolat blanc | cadre 20×20 | ✓ validé |
| tarte-fondante-chocolat-eb | Benghanem | 112 | Tarte fondante au chocolat | 27×9 cm | ✓ validé |
| chocolat-framboise-eb | Benghanem | 113 | Chocolat framboise | bandes plaque | ✓ validé |
| omelette-norvegienne-citron-eb | Benghanem | 121 | Omelette norvégienne citron | ø 18 cm × h 12 cm | ✓ validé |

**Total Benghanem Batch 4 : 8 nouvelles entrées**

---

## 2026-06-03 — Benghanem — Batch 5 : FEUILLETÉES & LEVÉES (pp. 130–145)

Entrées pré-existantes (non recréées) : feuilletage-classique/inverse/rapide-eb, pate-brioche-eb, pate-a-baba-eb, pate-croissants-eb

### Pâtes de base (pates.js) — 2 entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| pate-savarin-eb | Benghanem | 141 | Pâte à savarin | ✓ validé |
| pate-pain-de-mie-eb | Benghanem | 144 | Pâte à pain de mie | ✓ validé |

### Assemblages (assemblages.js) — 7 entrées

| ID recette | PDF | Page | Titre original | Moule | Statut |
|---|---|---|---|---|---|
| millefeuille-vanille-eb | Benghanem | 130 | Millefeuille à la vanille | bandes 15×2 cm | ✓ validé |
| kouglof-eb | Benghanem | 133 | Kouglof | moule à kouglof | ✓ validé |
| brioche-tropezienne-eb | Benghanem | 134 | Brioche tropézienne | 30 moules brioches | ✓ validé |
| bostock-eb | Benghanem | 135 | Bostock | 30 moules brioches | ✓ validé |
| croissants-amandes-eb | Benghanem | 139 | Croissants aux amandes | plaque | ✓ validé |
| baba-nature-eb | Benghanem | 142 | Baba nature | demi-sphères ø 8 cm | ⚠ a_verifier |
| savarin-pina-colada-eb | Benghanem | 143 | Savarin façon Piña colada | anneau ø 22 cm | ✓ validé |

**Total Benghanem Batch 5 : 9 nouvelles entrées**

---

## 2026-06-03 — Benghanem — Batch 6 : LES PETITS FOURS (pp. 150–170)

Entrées pré-existantes (non recréées) : financier-nature-eb, moelleux-amandes-eb, meringue-*-eb, macarons-*-eb

### Biscuits standalone (biscuits.js) — 6 entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| madeleines-eb | Benghanem | 153 | Madeleines | ✓ validé |
| tuiles-amandes-eb | Benghanem | 157 | Tuiles aux amandes | ✓ validé |
| pate-cigarettes-eb | Benghanem | 160 | Pâte à cigarettes | ✓ validé |
| palets-raisins-eb | Benghanem | 164 | Palets aux raisins | ✓ validé |
| rocher-coco-eb | Benghanem | 165 | Rocher coco | ✓ validé |
| speculoos-eb | Benghanem | 168 | Spéculoos classique | ✓ validé |

### Assemblages (assemblages.js) — 5 entrées

| ID recette | PDF | Page | Titre original | Moule | Statut |
|---|---|---|---|---|---|
| financier-croustillant-noisette-eb | Benghanem | 150 | Financiers croustillants noisette | 3×8 cm | ✓ validé |
| madeleine-pina-colada-eb | Benghanem | 155 | Madeleines piña colada | ovales 13×5 cm | ✓ validé |
| moelleux-coco-fraise-eb | Benghanem | 166 | Moelleux coco-fraise | savarins ø 8 cm | ✓ validé |
| tarte-chocolat-caramel-sable-eb | Benghanem | 167 | Tarte chocolat caramel | ø 10 cm | ✓ validé |
| tarte-sablee-creme-speculoos-eb | Benghanem | 170 | Tarte sablée crème spéculoos | 27×9 cm | ✓ validé |

**Total Benghanem Batch 6 : 11 nouvelles entrées**
Nutrition : noix de coco râpée (CIQUAL) + aliases paillettes feuilletine, quatre-épices
Nutrition : gingembre frais (CIQUAL) + aliases beurre noisette, fleur d'oranger, citronnelle, Malibu, ananas…
Nutrition : +1 entrée CIQUAL (miel) + ~30 nouveaux aliases (farine de seigle, huile de noisettes, sirop d'érable, fruits confits, thé, trimoline…)
Nutrition : +3 entrées CIQUAL (beurre de cacao, purée de citron, abricots secs) + ~45 nouveaux aliases (Farine T55, sucre glace, chocolats 70%, pommes, etc.)

---

## 2026-06-03 — Benghanem — Batch 7 : LES CRÈMES (pp. 177–241)

### Crèmes de base (cremes.js) — 10 nouvelles entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| creme-patissiere-cafe-eb | Benghanem | 359 | Crème pâtissière au café | ✓ validé |
| ganache-montee-noir-eb | Benghanem | 400 | Ganache montée chocolat noir Manjari | ✓ validé |
| ganache-montee-lait-eb | Benghanem | 400 | Ganache montée chocolat au lait Jivara | ✓ validé |
| mousse-marrons-eb | Benghanem | 436 | Mousse aux marrons | ✓ validé |
| bavarois-base-eb | Benghanem | 450 | Bavarois de base | ✓ validé |
| bavarois-framboise-eb | Benghanem | 452 | Bavarois à la framboise | ✓ validé |
| bavarois-chocolat-lait-eb | Benghanem | 454 | Bavarois au chocolat au lait | ✓ validé |
| mousse-fruits-bois-eb | Benghanem | 456 | Mousse aux fruits des bois | ✓ validé |
| mousse-exotique-eb | Benghanem | 458 | Mousse aux fruits exotiques | ✓ validé |
| sabayon-chocolat-eb | Benghanem | 468 | Sabayon au chocolat | ✓ validé |

**Note :** ganache-chocolat-noir-eb et ganache-chocolat-blanc-eb déjà présents dans ganaches.js — doublons supprimés de cremes.js.

### Assemblages (assemblages.js) — 15 nouvelles entrées

| ID recette | PDF | Page | Titre original | Moule | Statut |
|---|---|---|---|---|---|
| ile-flottante-eb | Benghanem | 352 | Île flottante | demi-sphères ø 8 cm + 8 verres | ✓ validé |
| tartelettes-chocolat-eb | Benghanem | 354 | Tartelettes au chocolat | cercles ø 6 cm (×12) | ✓ validé |
| flan-parisien-eb | Benghanem | 362 | Flan parisien | moule tarte ø 22 cm | ✓ validé |
| flan-chocolat-cafe-eb | Benghanem | 362 | Flan chocolat-café | cercle ø 20 cm × 4 cm | ✓ validé |
| souffles-chocolat-eb | Benghanem | 384 | Soufflés au chocolat | 10 ramequins ø 10 cm | ✓ validé |
| merveilleuse-eb | Benghanem | 390 | Merveilleuse | tapis silicone demi-sphères | ✓ validé |
| succes-dragee-noisette-eb | Benghanem | 392 | Succès dragée-noisette | disques ø 10 cm | ✓ validé |
| creme-caramel-eb | Benghanem | 394 | Crème caramel | 12 petits pots | ✓ validé |
| tarte-fraises-eb | Benghanem | 412 | Tarte aux fraises | silicone 27×9 cm + demi-sphères ø 2 cm | ✓ validé |
| tarte-vanille-eb | Benghanem | 414 | Tarte à la vanille | silicone 27×9 cm | ✓ validé |
| riz-au-lait-imperatrice-eb | Benghanem | 460 | Riz au lait impératrice | 10 verrines | ✓ validé |
| entremets-coco-mangue-eb | Benghanem | 462 | Entremets coco-mangue | cadre inox 30 cm carré | ✓ validé |
| tarte-amandine-eb | Benghanem | 470 | Tarte amandine | cercles ø 10 cm (×10) | ✓ validé |
| dartois-eb | Benghanem | 474 | Dartois | plaque 30×10 cm | ✓ validé |
| tarte-orange-eb | Benghanem | 442 | Tarte à l'orange | cadre inox 20 cm carré | ✓ validé |

**Total Benghanem Batch 7 : 25 nouvelles entrées** (10 crèmes + 15 assemblages)
Nutrition : +1 CIQUAL (riz blanc cru) + 17 nouveaux aliases (poudre à flan, Nescafé, pulpes de fruits, dextrose, gianduja noisettes, chocolats 66–72%…)

---

## 2026-06-03 — Benghanem — Batch 8 : LES GLACES & LA CONFISERIE (pp. 242–285)

### Glaces & Sorbets (glaces_sorbets.js) — 4 nouvelles entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| glace-chocolat-eb | Benghanem | 480 | Glace au chocolat noir | ✓ validé |
| glace-noix-coco-eb | Benghanem | 480 | Glace à la noix de coco | ✓ validé |
| sorbet-chocolat-eb | Benghanem | 484 | Sorbet au chocolat | ✓ validé |
| parfait-glace-agrumes-eb | Benghanem | 486 | Parfait glacé aux agrumes | ✓ validé |

### Confits / Guimauves / Nougats / Pâtes de fruits (confits.js) — 10 nouvelles entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| pate-fruits-citron-eb | Benghanem | 508 | Pâte de fruits au citron | ✓ validé |
| pate-fruits-exotique-eb | Benghanem | 508 | Pâte de fruits exotique | ✓ validé |
| pate-fruits-rouges-eb | Benghanem | 508 | Pâte de fruits aux fruits rouges | ✓ validé |
| pate-fruits-bois-eb | Benghanem | 508 | Pâte de fruits aux fruits des bois | ✓ validé |
| confit-citron-eb | Benghanem | 510 | Confit de citron | ✓ validé |
| confit-orange-eb | Benghanem | 510 | Confit d'orange | ✓ validé |
| guimauve-blancs-eb | Benghanem | 516 | Guimauve aux blancs d'œufs | ✓ validé |
| guimauve-fraise-entremets-eb | Benghanem | 516 | Guimauve à la fraise (entremets) | ✓ validé |
| guimauve-mangue-entremets-eb | Benghanem | 516 | Guimauve à la mangue (entremets) | ✓ validé |
| nougat-chocolat-eb | Benghanem | 518 | Nougat au chocolat | ✓ validé |

### Caramels variantes + Crèmes à tartiner + Praliné + Nougatine (caramels.js) — 11 nouvelles entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| caramels-exotiques-eb | Benghanem | 522 | Caramels aux fruits exotiques | ✓ validé |
| caramels-cassis-eb | Benghanem | 522 | Caramels au cassis | ✓ validé |
| caramels-cafe-pecan-eb | Benghanem | 524 | Caramels au café et noix de pécan | ✓ validé |
| caramels-tonka-amandes-eb | Benghanem | 524 | Caramels fève de tonka et amandes | ✓ validé |
| caramels-noisettes-eb | Benghanem | 524 | Caramels aux noisettes | ✓ validé |
| caramels-citron-pistache-eb | Benghanem | 524 | Caramels citron-pistache | ✓ validé |
| nougatine-eb | Benghanem | 526 | Nougatine (+ anneaux, disques, opalines) | ✓ validé |
| praline-cacahuetes-eb | Benghanem | 528 | Praliné aux cacahuètes | ✓ validé |
| creme-tartiner-caramel-eb | Benghanem | 520 | Crème à tartiner caramel demi-sel Dulcey | ✓ validé |
| creme-tartiner-fruits-rouges-eb | Benghanem | 520 | Crème à tartiner aux fruits rouges | ✓ validé |
| creme-tartiner-pistache-eb | Benghanem | 520 | Crème à tartiner pistache | ⚠ a_verifier (praliné approché) |
| creme-tartiner-noisette-eb | Benghanem | 520 | Crème à tartiner noisette-amande | ✓ validé |
| creme-tartiner-exotique-eb | Benghanem | 520 | Crème à tartiner fruits exotiques | ✓ validé |

### Ganaches confiserie (ganaches.js) — 2 nouvelles entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| ganache-bonbons-caramel-eb | Benghanem | 538 | Ganache caramel (bonbons) | ✓ validé |
| ganache-bonbons-citron-vert-eb | Benghanem | 538 | Ganache citron vert (bonbons) | ✓ validé |

### Bonbons moulés (bonbons.js) — 5 nouvelles entrées

| ID recette | PDF | Page | Titre original | Statut |
|---|---|---|---|---|
| bonbons-caramel-demi-sel-eb | Benghanem | 542 | Bonbons au caramel demi-sel | ✓ validé |
| bonbons-passion-eb | Benghanem | 544 | Bonbons jaunes — ganache Passion | ✓ validé |
| bonbons-caramel-citron-vert-eb | Benghanem | 544 | Bonbons verts — caramel citron vert | ✓ validé |
| bonbons-caramel-fruits-bois-eb | Benghanem | 544 | Bonbons rouges — caramel fruits des bois | ✓ validé |
| bonbons-praline-agrumes-eb | Benghanem | 544 | Bonbons orange — praliné agrumes | ✓ validé |

**Total Benghanem Batch 8 : 34 nouvelles entrées** (4 glaces + 10 confits + 13 caramels/crèmes à tartiner + 2 ganaches + 5 bonbons)

---

## Récapitulatif Benghanem — Livre complet (B1–B8)

| Batch | Pages livre | Thème | Nouvelles entrées |
|---|---|---|---|
| B1 | 13–52 | Pâtes + assemblages | 24 |
| B2 | 54–79 | Cakes, brownies, scones | 18 |
| B3 | 81–95 | Pâtes liquides, choux | 13 |
| B4 | 100–121 | Biscuits, dacquoises | 8 |
| B5 | 130–145 | Feuilletées, levées | 9 |
| B6 | 150–170 | Petits fours | 11 |
| B7 | 177–241 | Les crèmes | 25 |
| B8 | 242–285 | Glaces & confiserie | 34 |
| **Total** | **13–285** | | **142 entrées** |

**Non extraits (pp. 286–292) :** index, bibliographie, table des matières — aucune recette.

---

## 2026-08-25 — Correction de masse : pourcentages recalculés (aucune extraction)

Pas un lot d'extraction : une correction de données sur la bibliothèque existante.

**Cause racine.** Sur 118 recettes, `pct` avait été calculé comme
`g / masse_totale_g × 100` au lieu de `g / Σg × 100`. Tant que
`masse_totale_g = Σg` le résultat était juste ; dès que les deux divergeaient,
les pourcentages devenaient faux et leur somme s'écartait de 100 — jusqu'à
179 % (`mayorque-ln2`) et 144 % (`tarte-bourbon-chocolat-ln2`).

**Impact.** `engine_indicateurs.js` fait `const f = l.pct / 100` : tous les
indicateurs (ES, MG, MSNG, sucres, POD, PAC) étaient gonflés à proportion de
l'écart. `nutrition.js` répartissait les masses sur la même base faussée.

**Correction appliquée** — 98 recettes, 13 fichiers :
- `pct` recalculé sur Σg, une décimale, répartition à la plus forte reste pour
  une somme exacte de 100. 97 recettes prises sur le critère `|Σpct−100| > 1,5`,
  plus `zebre-ln2` dont les erreurs se compensaient (99 % sur une ligne, 0 % sur
  cinq autres) et que ce critère avait laissé passer.
- **Ni `g`, ni `masse_totale_g`, ni aucun autre champ n'ont été touchés.** Sans
  le PDF source, on ne peut pas trancher entre un total erroné et un ingrédient
  perdu à l'extraction : recalculer l'un ou l'autre aurait masqué le problème.

**Drapeaux posés** : 84 recettes passées à `a_verifier: true` (82 + 2), portant
le total de 1 006 à 1 090.

**Reste à vérifier sur source** — 96 recettes, toutes flaguées :
- 92 où `Σg ≠ masse_totale_g` d'au moins 2 % (dont 14 au-delà de 30 %) ;
- 4 dont une ligne a un `g` nul ou absent : `glacage-griotte`,
  `nappage-melon`, `nappage-orange`, `compotee-bergamote`.

Les 25 recettes dont l'écart reste sous 2 % n'ont pas été flaguées : ce sont des
arrondis délibérés de la masse de référence (992 g notés 1 000, 910 notés 900).

**Invariant obtenu** : plus aucune recette marquée `a_verifier: false` ne
présente d'incohérence arithmétique. Vérifié : build 12/12, lint 0 erreur,
148 tests, 1 594 recettes, 0 id manquant ou dupliqué.

---

## 2026-08-25 — Import des 7 dernières catégories du disque (2 302 recettes)

**Ce qui bloquait.** Le reliquat annoncé « ~5 500 fichiers » ne tenait pas au
volume mais au format. `parse_fiches_v2.py` ne globait que `*.xlsx` et
`parse_docx.py` que `*.docx`, tous deux **sans récursion**. Or les sept
catégories restantes comptent **2 480 `.xls`** (binaire Excel 97) et
**1 345 `.doc`** (binaire Word), rangés en sous-dossiers parfois profonds
(`Le Meurice - Opera/Recette Meurice/Toutes les recettes/Recettes FAUCHON/...`).
Rien de tout cela n'était visible des parseurs.

**Outils ajoutés** — `recettes-extraites/_scripts/` :
- `parse_any.py` — parcours récursif, lecture native du `.xls` via `xlrd` en
  présentant à `parse_fiches_v2` un objet compatible openpyxl (monkeypatch de
  `openpyxl.load_workbook`). Toute la logique de choix de feuille et de colonne
  de quantité est réutilisée telle quelle.
- `parse_docx_sections.py` — découpage d'un document Word en **une fiche par
  préparation**. Le corpus Pierre Hermé enchaîne cinq à dix préparations par
  document, chacune avec sa composition au gramme et son procédé ; la lecture
  globale les écrasait en une seule fiche au procédé vide. Le titre n'est pas
  reconnu à sa ponctuation (le « : » final manque dans la moitié du corpus)
  mais à sa position : ligne courte, non-ingrédient, suivie d'au moins deux
  lignes d'ingrédients.
- `.doc` → `.docx` par LibreOffice headless (1 251 conversions).

**Conversions d'unités** (table validée par Guillaume, `COUNT_TO_G`) : gousse de
vanille 6 g, œuf entier 55 g, zeste d'agrume 5 g, feuille de gélatine 2 g,
jaune 20 g, blanc 35 g. Chaque ligne convertie garde son libellé d'origine dans
`converti_depuis`. Sans cette table, toute fiche portant « 3 feuilles de
gélatine » était inexploitable.

### Deux catégories nouvelles

`classiques` — 216 desserts composés (tarte, éclair, Paris-Brest, Saint-Honoré,
mille-feuille, bûche, vacherin). Leur composition extraite est une **liste
unique** où pâte, crème et fruits sont mêlés : inexploitable par le générateur
de textures, d'où une catégorie hors des familles qui l'alimentent.
`assemblages` reste distincte : elle décrit les mêmes desserts étage par étage
(champ `composants`, procédé de chaque préparation). Deux schémas, deux
familles — les confondre ferait passer les secondes pour des assemblages
appauvris.

`traiteur` — 19 fiches salées (poulet, pesto, mayonnaise, jambon-beurre,
pickles) venues des dossiers traiteur et snacking. Ce n'est pas de la
pâtisserie, mais les fiches sont exploitables ; elles sont simplement rangées à
part.

**Écarté volontairement :**

| Motif | Nombre |
|---|---|
| Feuilles de montage Fauchon / Le Meurice (ingrédients = d'autres recettes) | ~200 |
| Sous-recettes dont un ingrédient reste non pesé (« 1 pièce », « 2 pamplemousses ») | 424 |
| Nom inexploitable (le découpage a pris une ligne de quantité pour un titre) | 218 |
| Encore non classées | 332 |

**Classifieur** : 26 familles ajoutées à `REGLES` (sablés, cookies, financiers,
génoises, parfaits glacés, guimauves, garnitures, gels agar, décors chocolat,
nougats, craquelins, boissons chaudes, fruits pochés…) et tolérance au pluriel :
la moitié des règles était écrite au singulier, si bien que « Meringues
arlequins » ou « Sablés bretons » passaient entre les mailles.

## 2026-08-25 — Passe allergènes sur tout le corpus

`scripts/recalc-allergenes.mjs` (rejouable, `--write` pour appliquer).

**Ce qui était faux.** La règle gluten cherchait `ble` sans frontière de mot :
elle accrochait *bleu*, *liposoluble*, *érable*, *préalable*, *sable*.
Symétriquement, farine de riz, de sarrasin et de châtaigne étaient comptées
comme gluten. Le vocabulaire avait aussi dérivé au fil des imports — `oeuf` et
`oeufs`, `arachide` et `arachides`, `fruits_a_coque` et
`fruits_a_coque_noisette` coexistaient, et deux clés n'étaient pas des
allergènes du tout : `gélatine` (l'information utile est
`contraintes.vegan`) et `lactose`.

**Pièges rencontrés en écrivant le script**, tous vérifiés avant écriture :
- la ligature **`Œ` majuscule** n'est pas couverte par `.replace(/œ/g,…)` : il
  faut passer en minuscules **avant**. Sans cela « Œufs entiers » ne déclenchait
  pas l'allergène œuf — 417 recettes auraient perdu leur mention ;
- `semoule` accrochait « **sucre** semoule » : 1 150 faux gluten ;
- `moules?` accrochait les **moules à pâtisserie**, pas des mollusques ;
- seules les lignes de la forme `{ nom: "…", g: … }` doivent être lues : les
  `nom:` de recette et de composant sont des noms de préparations, et le seul
  mot « dacquoise » suffisait à déduire du gluten ;
- `signature_fruit_agrumes.js` écrit ses clés en **apostrophes simples** : une
  regex limitée aux guillemets doubles laissait ses 70 recettes hors du passage.

**Résultat** : 370 recettes corrigées, vocabulaire ramené à dix identifiants
INCO, plus aucune recette sans champ `allergenes`. Le script est idempotent.

**Ce que cette passe ne corrige pas.** Ce champ ne sert qu'à l'affichage de la
bibliothèque. Le moteur qui fait foi — `lib/allergenes.js`, utilisé par le plan
de travail et la fiche recette — lit `lib/ingredients-metier.js`, qui ne connaît
que **58 ingrédients**. Sur les 3 719 libellés distincts du corpus, 3 665 n'y ont
aucune entrée : **68 % des lignes** sont donc « non vérifiables » à l'impression,
et pas sur des ingrédients exotiques — *sucre*, *lait*, *œufs*, *crème*,
*gélatine* en font partie, faute de correspondance de libellé. Le remède tient
en deux temps : une table d'alias sur le modèle de `NUTRITION_ALIASES`
(`creme`, `creme liquide`, `creme uht`, `creme fraiche fluide (32/34% mg)` →
`Crème liquide 35%`), puis l'extension du référentiel lui-même.

**Vérifié** : 3 896 recettes, 0 id dupliqué, 0 recette sans famille, 0 somme de
pourcentages hors tolérance, 12 routes construites, lint 0 erreur, 148 tests.

**À surveiller** : `lib/recettes` passe de 2,9 à 7,3 Mo, et le chunk client de
2,20 Mo à 6,03 Mo (0,38 → 0,98 Mo gzip). La bibliothèque est importée
statiquement par `FilterPanel` : au prochain lot, il faudra charger les
catégories à la demande.

**Reste sur le disque** : `Dossier EQUILIBRE`, `Livre a rentrer en Excel`
(PDF, non traités), et les 332 fiches non classées ci-dessus.

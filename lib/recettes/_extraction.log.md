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
Nutrition : +1 entrée CIQUAL (miel) + ~30 nouveaux aliases (farine de seigle, huile de noisettes, sirop d'érable, fruits confits, thé, trimoline…)
Nutrition : +3 entrées CIQUAL (beurre de cacao, purée de citron, abricots secs) + ~45 nouveaux aliases (Farine T55, sucre glace, chocolats 70%, pommes, etc.)

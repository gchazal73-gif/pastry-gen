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

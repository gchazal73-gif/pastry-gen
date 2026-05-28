-- Migration V3 : colonnes coût matière, allergènes INCO, conservation/DLC
-- Date : 2026-05-28
-- Toutes les colonnes sont ajoutées avec IF NOT EXISTS et des défauts sûrs.
-- Réversible : voir rollback en fin de fichier (commenté).

ALTER TABLE ingredients
  -- ── Coût matière ────────────────────────────────────────────────────────────
  ADD COLUMN IF NOT EXISTS prix_unitaire_eur      NUMERIC(10,4),
  ADD COLUMN IF NOT EXISTS unite_prix             TEXT,
  ADD COLUMN IF NOT EXISTS prix_eur_par_g         NUMERIC(10,6),
  ADD COLUMN IF NOT EXISTS fournisseur            TEXT,
  ADD COLUMN IF NOT EXISTS date_maj_prix          DATE,
  ADD COLUMN IF NOT EXISTS prix_variable_saison   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS devise                 CHAR(3) NOT NULL DEFAULT 'EUR',

  -- ── Allergènes INCO (règlement UE 1169/2011) ────────────────────────────────
  -- Valeurs possibles pour allergenes_inco et traces_possibles :
  --   gluten, crustaces, oeufs, poissons, arachides, soja, lait,
  --   fruits_a_coque_amande, fruits_a_coque_noisette, fruits_a_coque_noix,
  --   fruits_a_coque_cajou, fruits_a_coque_pecan, fruits_a_coque_pistache,
  --   fruits_a_coque_macadamia, fruits_a_coque_bresil,
  --   celeri, moutarde, sesame, sulfites, lupin, mollusques
  ADD COLUMN IF NOT EXISTS allergenes_inco         TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS traces_possibles        TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS nom_inco                TEXT,
  ADD COLUMN IF NOT EXISTS mentions_additionnelles TEXT[]  NOT NULL DEFAULT '{}',

  -- ── Conservation ─────────────────────────────────────────────────────────────
  ADD COLUMN IF NOT EXISTS conservation_j_froid    NUMERIC(6,1),  -- jours à +4 °C
  ADD COLUMN IF NOT EXISTS conservation_j_ambiant  NUMERIC(6,1),  -- jours à 20 °C
  ADD COLUMN IF NOT EXISTS conservation_j_surgele  NUMERIC(6,1),  -- jours à −18 °C
  ADD COLUMN IF NOT EXISTS instructions_conservation TEXT,
  ADD COLUMN IF NOT EXISTS apres_ouverture          TEXT;

-- Index GIN pour requêtes "contient allergène X"
CREATE INDEX IF NOT EXISTS idx_ingredients_allergenes_inco
  ON ingredients USING GIN (allergenes_inco);

CREATE INDEX IF NOT EXISTS idx_ingredients_traces_possibles
  ON ingredients USING GIN (traces_possibles);

-- Commentaires de colonnes
COMMENT ON COLUMN ingredients.prix_eur_par_g IS
  'Valeur canonique pour le moteur de coût en € / g HT. Calculée depuis prix_unitaire_eur + unite_prix.';
COMMENT ON COLUMN ingredients.allergenes_inco IS
  'Allergènes INCO obligatoires (règlement UE 1169/2011). Identifiants : gluten, crustaces, oeufs, poissons, arachides, soja, lait, fruits_a_coque_*, celeri, moutarde, sesame, sulfites, lupin, mollusques.';
COMMENT ON COLUMN ingredients.traces_possibles IS
  'Allergènes présents en traces de fabrication (information facultative mais recommandée). Mêmes identifiants que allergenes_inco.';
COMMENT ON COLUMN ingredients.conservation_j_froid IS
  'DLC indicative en jours à +4 °C — ingrédient seul, non assemblé.';
COMMENT ON COLUMN ingredients.conservation_j_ambiant IS
  'DLC indicative en jours à température ambiante (20 °C) — ingrédient conditionné fermé.';
COMMENT ON COLUMN ingredients.conservation_j_surgele IS
  'DLC indicative en jours à −18 °C — ingrédient surgelé ou pouvant être surgelé.';
COMMENT ON COLUMN ingredients.apres_ouverture IS
  'Durée de conservation après ouverture du conditionnement, ex: ''3 j au réfrigérateur''.';

-- ── Rollback (à décommenter si besoin) ────────────────────────────────────────
-- DROP INDEX IF EXISTS idx_ingredients_allergenes_inco;
-- DROP INDEX IF EXISTS idx_ingredients_traces_possibles;
-- ALTER TABLE ingredients
--   DROP COLUMN IF EXISTS prix_unitaire_eur,
--   DROP COLUMN IF EXISTS unite_prix,
--   DROP COLUMN IF EXISTS prix_eur_par_g,
--   DROP COLUMN IF EXISTS fournisseur,
--   DROP COLUMN IF EXISTS date_maj_prix,
--   DROP COLUMN IF EXISTS prix_variable_saison,
--   DROP COLUMN IF EXISTS devise,
--   DROP COLUMN IF EXISTS allergenes_inco,
--   DROP COLUMN IF EXISTS traces_possibles,
--   DROP COLUMN IF EXISTS nom_inco,
--   DROP COLUMN IF EXISTS mentions_additionnelles,
--   DROP COLUMN IF EXISTS conservation_j_froid,
--   DROP COLUMN IF EXISTS conservation_j_ambiant,
--   DROP COLUMN IF EXISTS conservation_j_surgele,
--   DROP COLUMN IF EXISTS instructions_conservation,
--   DROP COLUMN IF EXISTS apres_ouverture;

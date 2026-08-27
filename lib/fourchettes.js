/* =====================================================================
   FOURCHETTES DE RÉFÉRENCE PROFESSIONNELLE — tous types de textures
   Format : { indicateur: [min, max] }
   Utilisé par verifierFourchettes() pour le validateur de recette.
   ===================================================================== */

// ── Labels et unités pour tous les indicateurs ───────────────────────────────
export const LABELS_INDICATEURS = {
  es:        { label: 'Extrait sec',   unite: '%' },
  mg:        { label: 'MG totales',    unite: '%' },
  msng:      { label: 'MSNG',          unite: '%' },
  sucres:    { label: 'Sucres totaux', unite: '%' },
  fibres:    { label: 'Fibres',        unite: '%' },
  lactose:   { label: 'Lactose',       unite: '%' },
  pod:       { label: 'POD',           unite: ''  },
  pac:       { label: 'PAC',           unite: ''  },
  ph:        { label: 'pH',            unite: ''  },
  h2o_libre: { label: 'Eau libre',     unite: '%' },
};

// ── Fourchettes par texture ───────────────────────────────────────────────────
export const FOURCHETTES_TEXTURE = {

  // ── Glaces ──────────────────────────────────────────────────────────────────
  glace_lait:        { mg:[4,7],    msng:[9,12],   pod:[16,22], pac:[25,30], es:[34,38] },
  glace_creme:       { mg:[8,12],   msng:[8,11],   pod:[16,22], pac:[25,30], es:[36,42] },
  glace_chocolat:    { mg:[10,15],  msng:[8,11],   pod:[18,22], pac:[25,28], es:[38,44] },
  sorbet_fruit:      { mg:[0,2],    msng:[0,2],    pod:[22,26], pac:[28,33], es:[30,35] },
  glace_fruits_secs: { mg:[10,14],  msng:[9,11],   pod:[18,22], pac:[25,28], es:[38,42] },

  // ── Mousses & crémeux ────────────────────────────────────────────────────────
  mousse_fruits: {
    es:[30,42],      mg:[8,16],     sucres:[14,26],
    fibres:[2,10],   lactose:[0,5], h2o_libre:[40,62], ph:[2.8,4.5],
  },
  cremeux: {
    es:[30,45],      mg:[12,24],    sucres:[12,26],
    fibres:[0,4],    lactose:[2,8], h2o_libre:[35,55], ph:[3.0,6.5],
  },

  // ── Ganaches montées ─────────────────────────────────────────────────────────
  ganache_montee_noir: {
    es:[38,55], mg:[22,40], sucres:[16,32], lactose:[0,4], h2o_libre:[20,44],
  },
  ganache_montee_lait: {
    es:[38,55], mg:[20,38], sucres:[20,36], lactose:[2,7], h2o_libre:[20,44],
  },
  ganache_montee_blanc: {
    es:[38,55], mg:[20,38], sucres:[22,38], lactose:[3,8], h2o_libre:[20,44],
  },
  ganache_montee_fruit: {
    es:[35,50], mg:[18,34], sucres:[18,34],
    fibres:[0,4], lactose:[1,6], h2o_libre:[25,48],
  },
  ganache_montee_praline: {
    es:[40,58], mg:[26,44], sucres:[16,30],
    fibres:[1,5], lactose:[0,3], h2o_libre:[18,40],
  },

  // ── Inserts ──────────────────────────────────────────────────────────────────
  ganache_insert: {
    es:[40,58], mg:[25,44], sucres:[18,34], lactose:[0,6], h2o_libre:[18,42],
  },

  // ── Fonds biscuités (avant cuisson) ─────────────────────────────────────────
  sable_breton: { es:[48,62], mg:[22,38], sucres:[20,36], fibres:[0,3], lactose:[2,8] },
  pate_sucree:  { es:[45,58], mg:[18,32], sucres:[20,34], fibres:[0,3], lactose:[2,7] },
  streusel:     { es:[50,65], mg:[25,40], sucres:[18,32], fibres:[1,4], lactose:[1,6] },

  // ── Biscuits structurants & moelleux (avant cuisson) ────────────────────────
  dacquoise:          { es:[45,60], mg:[8,20],  sucres:[30,50], fibres:[3,15] },
  biscuit_cuillere:   { es:[40,55], mg:[4,12],  sucres:[28,48], fibres:[0,3]  },
  financier:          { es:[48,62], mg:[18,32], sucres:[28,44], fibres:[3,12] },
  madeleine:          { es:[42,58], mg:[18,32], sucres:[28,44], fibres:[0,3],  lactose:[2,8] },
  cake_voyage:        { es:[40,58], mg:[18,34], sucres:[26,42], fibres:[0,4],  lactose:[2,8] },
  croustillant_praline:{ es:[50,68], mg:[25,45], sucres:[18,34], fibres:[2,8] },

  // ── Confits & gelées ─────────────────────────────────────────────────────────
  confit_fruit:    { es:[55,72], sucres:[50,70], fibres:[1,8], lactose:[0,1], ph:[2.5,4.5] },
  gelee_fruit_pate:{ es:[60,76], sucres:[55,72], fibres:[0,5], lactose:[0,1], ph:[2.8,4.2] },

  // ── Glaçages ─────────────────────────────────────────────────────────────────
  glacage_miroir_neutre:  { es:[45,62], mg:[2,10],  sucres:[40,58] },
  glacage_miroir_cacao:   { es:[45,62], mg:[5,14],  sucres:[36,54] },
  glacage_miroir_chocolat:{ es:[48,65], mg:[12,24], sucres:[32,50] },
  glacage_rocher:         { es:[55,75], mg:[25,45], sucres:[22,40] },
  velours_pistolet:       { es:[55,75], mg:[45,65], sucres:[14,28] },
};

// ── Correspondance texture générable → famille de fourchettes ────────────────
/*
   Deux vocabulaires cohabitaient sans se rencontrer : le générateur nomme ses
   textures par template (« mousse_bconcept_fruit »), les fourchettes par
   famille physico-chimique (« mousse_fruits »). Aucune clé commune. Résultat :
   verifierFourchettes() retournait [] en silence, reequilibrerNonGlace()
   sortait en tête de fonction, et le rapport d'équilibre ne s'affichait jamais.

   Cette table relie les deux. Elle est volontairement grossière : les quatre
   mousses partagent aujourd'hui la même fourchette, alors qu'une mousse à la
   meringue italienne et une bavaroise n'ont pas le même profil sucres/MG.
   C'est un branchement, pas un référentiel — les fourchettes propres à chaque
   template viendront de la mesure sur la bibliothèque.
*/
export const TEXTURE_VERS_FOURCHETTE = {
  mousse_bconcept_fruit:     'mousse_fruits',
  mousse_legere_classique:   'mousse_fruits',
  mousse_bavaroise_fruit:    'mousse_fruits',
  mousse_meringue_italienne: 'mousse_fruits',
  cremeux_bconcept_fruit:    'cremeux',
  cremeux_classique_fruit:   'cremeux',
  confit_bconcept_fruit:     'confit_fruit',
  confit_classique_fruit:    'confit_fruit',
  gel_bconcept_fruit:        'gelee_fruit_pate',
};

/**
 * Résout un identifiant de texture — clé directe de FOURCHETTES_TEXTURE ou
 * identifiant de template — vers ses fourchettes cibles.
 *
 * @param {string} textureId
 * @returns {{ cle: string, fourchettes: object } | null}
 */
export function resoudreFourchettes(textureId) {
  if (!textureId) return null;
  if (FOURCHETTES_TEXTURE[textureId]) {
    return { cle: textureId, fourchettes: FOURCHETTES_TEXTURE[textureId] };
  }
  const cle = TEXTURE_VERS_FOURCHETTE[textureId];
  if (cle && FOURCHETTES_TEXTURE[cle]) {
    return { cle, fourchettes: FOURCHETTES_TEXTURE[cle] };
  }
  return null;
}

// Seuil de masse résolue en dessous duquel les indicateurs ne veulent rien
// dire. Aligné sur celui qui annule pod/pac dans engine_indicateurs.js.
export const SEUIL_COUVERTURE_PCT = 70;

// ── Conseils correctifs par indicateur ───────────────────────────────────────
function _conseil(key, valeur, min, max) {
  const bas = valeur < min;
  switch (key) {
    case 'pod':
      return bas
        ? 'POD trop faible — augmenter le saccharose ou ajouter du sucre inverti.'
        : 'POD trop élevé — substituer une partie du saccharose par du glucose atomisé DE38 (POD 50).';
    case 'pac':
      return bas
        ? 'PAC trop faible — glace trop dure à −18 °C. Remplacer 2–3 % de saccharose par du dextrose (PAC 190).'
        : 'PAC trop élevé — glace fondra vite. Réduire le dextrose, augmenter le glucose atomisé DE38 (PAC 53).';
    case 'msng':
      return bas
        ? 'MSNG insuffisante — texture manque de corps. Augmenter légèrement la poudre de lait écrémé.'
        : 'MSNG trop élevée — risque de sableux (cristallisation du lactose). Rééquilibrer automatiquement.';
    case 'mg':
      return bas
        ? 'MG insuffisante — texture pauvre en gras. Augmenter la crème ou le beurre de cacao.'
        : 'MG excessive — risque de beurrage. Réduire la crème ou augmenter la phase aqueuse.';
    case 'es':
      return bas
        ? 'Extrait sec trop faible — produit trop humide, tenue insuffisante. Réduire la phase aqueuse ou augmenter les matières sèches.'
        : 'Extrait sec trop élevé — produit trop dense ou cristallisé. Augmenter la phase aqueuse.';
    case 'sucres':
      return bas
        ? 'Sucres insuffisants — manque de douceur et de conservation. Augmenter le saccharose ou le sucre inverti.'
        : 'Sucres excessifs — risque de cristallisation et de déséquilibre gustatif. Substituer par du glucose atomisé DE38.';
    case 'fibres':
      return bas
        ? 'Fibres insuffisantes — ajouter de l\'inuline ou augmenter la proportion de purée de fruit.'
        : 'Fibres trop élevées — texture peut devenir visqueuse. Réduire l\'inuline ou la purée fibreuse.';
    case 'lactose':
      return bas
        ? null
        : 'Lactose élevé — risque de texture sableuse en bouche. Réduire la poudre de lait ou la crème.';
    case 'h2o_libre':
      return bas
        ? 'Eau libre trop faible — produit sec, prise de masse rapide. Augmenter la phase aqueuse.'
        : 'Eau libre trop élevée — risque de synérèse ou de texture molle. Augmenter les sucres ou les matières sèches.';
    case 'ph':
      return bas
        ? 'pH très acide — peut déstabiliser la gélatine ou les émulsions. Envisager une source moins acide.'
        : 'pH trop neutre pour un fruit — vérifier la qualité de la purée ou ajouter un correcteur d\'acidité.';
    default:
      return null;
  }
}

// ── Vérificateur de fourchettes ───────────────────────────────────────────────
/**
 * Compare les indicateurs calculés aux fourchettes cibles de la texture.
 *
 * @param {object} indicateurs  — résultat de calculerIndicateurs()
 * @param {string} textureId    — clé de FOURCHETTES_TEXTURE ou de TEMPLATES
 * @returns {Array<{key, label, unite, valeur, min, max, statut, conseil}>}
 *   statut : 'ok' | 'attention' (écart ≤ 10 % de la largeur) | 'hors' | 'inconnu'
 * @throws {Error} si la texture ne résout vers aucune fourchette. Un retour
 *   vide passait inaperçu jusqu'à l'écran : le bloc indicateurs disparaissait
 *   sans rien signaler. Mieux vaut casser bruyamment.
 */
export function verifierFourchettes(indicateurs, textureId) {
  const resolu = resoudreFourchettes(textureId);
  if (!resolu) {
    throw new Error(
      `Aucune fourchette pour la texture « ${textureId} ». Ajouter une entrée ` +
      `dans FOURCHETTES_TEXTURE, ou une correspondance dans TEXTURE_VERS_FOURCHETTE.`,
    );
  }

  // Sous le seuil de couverture, les valeurs sont calculées sur une fraction
  // des lignes seulement : es = 100 − eau compte la masse non résolue en
  // matière sèche. Les comparer aux fourchettes produirait des « hors » rouges
  // sur des recettes possiblement saines. On les déclare inconnues.
  const couverture = indicateurs?.masse_couverte_pct;
  const fiable = couverture == null || couverture >= SEUIL_COUVERTURE_PCT;

  return Object.entries(resolu.fourchettes).map(([key, [min, max]]) => {
    const { label, unite } = LABELS_INDICATEURS[key] ?? { label: key, unite: '' };
    const valeur = fiable ? (indicateurs[key] ?? null) : null;

    if (valeur === null) {
      return { key, label, unite, valeur: null, min, max, statut: 'inconnu', conseil: null };
    }

    const ok     = valeur >= min && valeur <= max;
    const marge  = (max - min) * 0.10;
    const proche = !ok && valeur >= min - marge && valeur <= max + marge;
    const statut = ok ? 'ok' : proche ? 'attention' : 'hors';
    const conseil = ok ? null : _conseil(key, valeur, min, max);

    return { key, label, unite, valeur, min, max, statut, conseil };
  });
}

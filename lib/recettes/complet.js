// Bibliothèque complète — 3 896 recettes avec procédés et pesées, ~6,5 Mo.
//
// NE PAS IMPORTER STATIQUEMENT depuis une page ou un composant : ce module
// entraîne tout le corpus dans le bundle client. Passer par
// `chargerRecettes()` / `chargerRecette(id)` de ./index.js, qui le charge en
// import dynamique, à la demande. La liste et les filtres se contentent de
// ./catalogue.js.

import { RECETTES_BISCUITS }      from './biscuits.js';
import { RECETTES_CREMES }         from './cremes.js';
import { RECETTES_MOUSSES }        from './mousses.js';
import { RECETTES_CROUSTILLANTS }  from './croustillants.js';
import { RECETTES_PATES }          from './pates.js';
import { RECETTES_GANACHES }       from './ganaches.js';
import { RECETTES_GLACAGES }       from './glacages.js';
import { RECETTES_CONFITS }        from './confits.js';
import { RECETTES_SIROPS }         from './sirops.js';
import { RECETTES_GLACES_SORBETS } from './glaces_sorbets.js';
import { RECETTES_CARAMELS }       from './caramels.js';
import { RECETTES_DECORS }         from './decors.js';
import { RECETTES_BOISSONS }       from './boissons.js';
import { RECETTES_ASSEMBLAGES }             from './assemblages.js';
import { RECETTES_SIGNATURE_FRUIT_AGRUMES } from './signature_fruit_agrumes.js';
import { RECETTES_BONBONS }                 from './bonbons.js';
import { RECETTES_CONFISERIES }             from './confiseries.js';
import { RECETTES_CONFITURES }              from './confitures.js';
import { RECETTES_CLASSIQUES }              from './classiques.js';
import { RECETTES_TRAITEUR }                from './traiteur.js';
import { getFamille } from './taxonomie.js';

const _raw = [
  ...RECETTES_ASSEMBLAGES,
  ...RECETTES_SIGNATURE_FRUIT_AGRUMES,
  ...RECETTES_BISCUITS,
  ...RECETTES_CREMES,
  ...RECETTES_MOUSSES,
  ...RECETTES_CROUSTILLANTS,
  ...RECETTES_PATES,
  ...RECETTES_GANACHES,
  ...RECETTES_GLACAGES,
  ...RECETTES_CONFITS,
  ...RECETTES_SIROPS,
  ...RECETTES_GLACES_SORBETS,
  ...RECETTES_CARAMELS,
  ...RECETTES_DECORS,
  ...RECETTES_BOISSONS,
  ...RECETTES_BONBONS,
  ...RECETTES_CONFISERIES,
  ...RECETTES_CONFITURES,
  ...RECETTES_CLASSIQUES,
  ...RECETTES_TRAITEUR,
];

export const RECETTES = _raw.map(r => ({
  ...r,
  famille: getFamille(r.categorie, r.sous_categorie),
}));


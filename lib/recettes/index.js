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

export const RECETTES = [
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
];

export const CATEGORIES = {
  biscuits:       { label: "Biscuits & cakes",        ordre: 1  },
  cremes:         { label: "Crèmes",                  ordre: 2  },
  mousses:        { label: "Mousses",                 ordre: 3  },
  croustillants:  { label: "Croustillants & inserts", ordre: 4  },
  pates:          { label: "Pâtes & fonds",           ordre: 5  },
  ganaches:       { label: "Ganaches",                ordre: 6  },
  glacages:       { label: "Glaçages",                ordre: 7  },
  confits:        { label: "Confits & gelées",        ordre: 8  },
  sirops:         { label: "Sirops & imbibage",       ordre: 9  },
  glaces_sorbets: { label: "Glaces & sorbets",        ordre: 10 },
  caramels:       { label: "Caramels & pralinés",     ordre: 11 },
  decors:         { label: "Décors & finitions",      ordre: 12 },
  boissons:       { label: "Boissons",                ordre: 13 },
  assemblages:    { label: "Assemblages",              ordre: 14 },
  bonbons:        { label: "Bonbons & chocolats",      ordre: 15 },
  confiseries:    { label: "Confiseries",              ordre: 16 },
};

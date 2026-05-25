/* =====================================================================
   TEMPLATES — chaque texture définit ses lignes fonctionnelles
   Chaque ligne porte un rôle (parfum, gélifiant, émulsifiant, etc.)
   et un % par défaut. Les fonctions getIngredient/pctOverride/actif
   permettent d'adapter la recette au parfum et aux contraintes.
   ===================================================================== */

import { PARFUMS } from './data.js';

/* ── Mappings parfum → dataKey INGREDIENTS_GLACE ────────────────── */
const COUV_DK = {
  choc_noir:   'couv_noire_70',
  choc_noir64: 'couv_noire_64',
  choc_lait:   'couv_lait_40',
  choc_blanc:  'couv_blanche_35',
};
const FSEC_DK = {
  praline_no:    'praline_noisette_glace',
  praline_am:    'praline_amande_glace',
  praline_pi:    'praline_pistache_glace',
  praline_pe:    'praline_pecan_glace',
  praline_se:    'praline_sesame_glace',
  gianduja:      'gianduja_glace',
  gianduja_lait: 'gianduja_glace',
  pate_noisette: 'pate_noisette_glace',
  pate_amande:   'pate_amande_glace',
  pate_pistache: 'pate_pistache_glace',
  pate_pecan:    'pate_pecan_glace',
  pate_macadamia:'pate_macadamia_glace',
  pate_sesame:   'pate_sesame_glace',
  pate_cacahuete:'pate_cacahuete_glace',
};
const INFUSION_ING = {
  vanille:      { nom: "Gousse de vanille grattée",         note: "Infuser dans le lait à 65 °C, 30 min" },
  cafe:         { nom: "Café en grains torréfiés",          note: "50–60 g/kg, infuser 30 min à 65 °C, filtrer" },
  cafe_grain:   { nom: "Café en grains torréfiés",          note: "50–60 g/kg, infuser 30 min à 65 °C, filtrer" },
  the_matcha:   { nom: "Poudre de matcha bio",              note: "Tamiser dans le lait froid avant pasteurisation" },
  the_earl:     { nom: "Thé Earl Grey (feuilles)",          note: "20 g/kg, infuser 10 min à 80 °C, filtrer" },
  the_jasmin:   { nom: "Thé au jasmin (feuilles)",          note: "20 g/kg, infuser 8 min à 75 °C, filtrer" },
  the_vert:     { nom: "Thé vert sencha",                   note: "Infuser à 75 °C max pour éviter l'amertume" },
  the_noir:     { nom: "Thé noir (feuilles)",               note: "15 g/kg, infuser 5 min à 85 °C, filtrer" },
  chai:         { nom: "Mélange chaï",                      note: "20 g/kg, infuser 20 min à 80 °C, filtrer" },
  cannelle:     { nom: "Cannelle en bâtons",                note: "Casser les bâtons, infuser 45 min à 65 °C" },
  cardamome:    { nom: "Cardamome verte concassée",          note: "12–15 g/kg, infuser 30 min à 65 °C, filtrer" },
  tonka:        { nom: "Fève tonka râpée",                  note: "Infuser à froid 12–24 h au réfrigérateur. Max 1 g/kg." },
  gingembre:    { nom: "Gingembre frais râpé",              note: "30 g/kg, infuser 20 min à 70 °C, filtrer" },
  anis:         { nom: "Anis étoilé",                       note: "8–10 étoiles/kg, infuser 45 min à 65 °C, filtrer" },
  rose:         { nom: "Eau de rose",                       note: "Incorporer à froid après refroidissement" },
  fleur_oranger:{ nom: "Eau de fleur d'oranger",            note: "Incorporer à froid après refroidissement" },
  verveine:     { nom: "Verveine fraîche ou sèche",         note: "30 g frais / 10 g sec par kg, infuser 20 min à 80 °C" },
  menthe:       { nom: "Menthe fraîche",                    note: "50 g/kg, infuser 2 h au réfrigérateur, filtrer" },
  lavande:      { nom: "Lavande culinaire",                 note: "5 g/kg max — goût savonneux si surdosé" },
  basilic:      { nom: "Basilic frais",                     note: "40 g/kg, infuser 1 h au réfrigérateur, filtrer" },
  safran:       { nom: "Pistils de safran",                 note: "0.5–1 g/kg — infuser dans le lait chaud 1 h" },
  poivre_t:     { nom: "Poivre Timut concassé",             note: "8–10 g/kg, infuser 20 min à 65 °C, filtrer" },
  reglisse:     { nom: "Réglisse (bâton)",                  note: "Infuser 30 min à 70 °C" },
  muscade:      { nom: "Noix de muscade râpée",             note: "2–3 g/kg, ajouter en fin de pasteurisation" },
  caramel:      { nom: "Caramel à sec",                     note: "Cuire jusqu'à ambre, déglacer avec la crème, incorporer au lait" },
};

function _infStep(p, base) {
  const ing = INFUSION_ING[p];
  if (!ing) return null;
  if (['rose','fleur_oranger'].includes(p))
    return `Réserver ${ing.nom.toLowerCase()} — à incorporer à froid après pasteurisation.`;
  if (['tonka','menthe','basilic'].includes(p))
    return `Infusion à froid : ${ing.nom.toLowerCase()} dans le ${base} froid. ${ing.note}`;
  return `Infusion : ${ing.nom.toLowerCase()} dans le ${base} chaud (voir note fiche). Filtrer avant pasteurisation.`;
}

export const TEMPLATES = {

  /* ----------------------- MOUSSE AUX FRUITS ----------------------- */
  mousse_fruits: {
    label: "Mousse aux fruits",
    description: "Mousse aérée à base de purée de fruit, structurée par gélifiant et foisonnement adapté à la contrainte.",
    parfumsCompat: [
      "framboise","fraise","cassis","mure","myrtille","groseille","grenade","cerise",
      "abricot","peche","prune","mirabelle",
      "poire","pomme","coing","raisin",
      "mangue","passion","ananas","kiwi","banane","coco","litchi","figue","fpassion_mangue",
      "citron","citron_vert","yuzu","orange","mandarine","pamplemousse","bergamote",
      "rhubarbe","marron"
    ],

    lines: [
      { role: "parfum", label: "Parfum (purée de fruit)", pct: 42,
        getIngredient: (p) => ({
          nom: `Purée de ${PARFUMS[p].label.toLowerCase()}`,
          note: PARFUMS[p].enzyme ? "Pasteuriser à 90 °C 1 min avant usage pour inactiver les enzymes" : null
        })
      },
      { role: "sucrant", label: "Sucrant", pct: 14,
        getIngredient: (_p, c) => (c.igbas || c.bien_etre) ? { nom: "Sucre de coco" } : { nom: "Sucre semoule" },
        pctOverride: (_p, c) => (c.igbas || c.bien_etre) ? 12 : 14
      },
      { role: "gelifiant", label: "Gélifiant", pct: 1.6,
        getIngredient: (_p, c) => c.vegan
          ? { nom: "Pectine NH", note: "Mélanger à sec avec une partie du sucrant avant incorporation. Activer à 85 °C." }
          : { nom: "Gélatine (feuilles 200 Bloom)", note: "Hydrater dans eau froide 20 min, essorer avant usage" },
        pctOverride: (_p, c) => c.vegan ? 1.2 : 1.6
      },
      { role: "inuline", label: "Inuline de chicorée", pct: 4,
        getIngredient: () => ({ nom: "Inuline de chicorée", note: "Apporte corps sans sucre ajouté" })
      },
      { role: "psyllium", label: "Psyllium (enveloppe)", pct: 2,
        getIngredient: () => ({ nom: "Psyllium (enveloppe)", note: "Disperser dans la phase froide avant chauffage" }),
        actif: (_p, c) => !!c.bien_etre
      },
      { role: "lecithine", label: "Lécithine de tournesol", pct: 0.4,
        getIngredient: () => ({ nom: "Lécithine de tournesol", note: "Ajouter à 40 °C et mixer pour stabiliser l'émulsion" }),
        actif: (_p, c) => !!(c.lactose || c.vegan)
      },
      { role: "blanc_sec", label: "Albumine (blanc d'œuf en poudre)", pct: 1.5,
        getIngredient: () => ({ nom: "Albumine (blanc d'œuf en poudre)", note: "Réhydrater dans eau froide 30 min avant montage" }),
        actif: (_p, c) => !!c.lactose && !c.vegan
      },
      { role: "huile_coco", label: "Huile de coco vierge", pct: 4,
        getIngredient: () => ({ nom: "Huile de coco vierge", note: "Fondre doucement à 35 °C. Stabilise la structure sans laitier." }),
        actif: (_p, c) => !!(c.lactose || c.vegan)
      },
      { role: "aeration", label: "Agent d'aération", pct: 22,
        getIngredient: (_p, c) => {
          if (c.vegan)   return { nom: "Meringue végétale (aquafaba)", note: "Monter aquafaba en neige avec xanthane, serrer progressivement avec le sucrant" };
          if (c.lactose) return { nom: "Meringue italienne (blancs pasteurisés)", note: "Sirop à 118 °C versé en filet sur blancs en cours de montage" };
          return { nom: "Crème UHT 35 % MG montée souple", note: "Monter au bec d'oiseau, ne pas trop serrer" };
        },
        pctOverride: (_p, c) => c.vegan ? 22 : c.lactose ? 18 : 28
      },
      { role: "sucre_aer", label: "Sucrant de l'aération", pct: 8,
        getIngredient: (_p, c) => (c.igbas || c.bien_etre)
          ? { nom: "Sucre de coco (pour meringue)" }
          : { nom: "Sucre semoule (pour meringue)" },
        actif: (_p, c) => !!(c.vegan || c.lactose)
      },
      { role: "stab", label: "Gomme xanthane", pct: 0.15,
        getIngredient: () => ({ nom: "Gomme xanthane", note: "Stabilise les bulles de la meringue végétale" }),
        actif: (_p, c) => !!c.vegan
      },
      { role: "acide", label: "Acide tartrique", pct: 0.15,
        getIngredient: () => ({ nom: "Acide tartrique", note: "Abaisse le pH pour activer la pectine NH sur ce fruit peu acide" }),
        actif: (p, c) => !!c.vegan && (!PARFUMS[p].acide || !!PARFUMS[p].peu_acide_ph)
      },
      { role: "calcium", label: "Lactate de calcium", pct: 0.4,
        getIngredient: () => ({ nom: "Lactate de calcium", note: "Ions calcium indispensables à la prise de la pectine NH" }),
        actif: (_p, c) => !!c.vegan
      },
      { role: "eau", label: "Eau / phase aqueuse", pct: 6,
        getIngredient: () => ({ nom: "Eau" })
      }
    ],

    process: (p, c) => {
      const steps = [];
      const parfum = PARFUMS[p].label.toLowerCase();
      if (PARFUMS[p].enzyme) {
        steps.push(`Pasteuriser la purée de ${parfum} à 90 °C pendant 1 min, refroidir rapidement.`);
      }
      if (c.vegan) {
        const needsAcide = !PARFUMS[p].acide || !!PARFUMS[p].peu_acide_ph;
        steps.push(`Mélanger à sec la pectine NH avec une partie du sucrant.`);
        if (needsAcide) {
          steps.push(`Dissoudre l'acide tartrique dans l'eau froide.`);
          steps.push(`Chauffer la purée de ${parfum} + l'eau acidulée + le lactate de calcium à 40 °C, verser le mélange pectine/sucrant en pluie en fouettant, porter à 85 °C, mixer.`);
        } else {
          steps.push(`Chauffer la purée de ${parfum} + l'eau + le lactate de calcium à 40 °C, verser le mélange pectine/sucrant en pluie, porter à 85 °C, mixer.`);
        }
        steps.push(`Réserver la base à 50–55 °C (ne pas laisser figer).`);
        steps.push(`Monter l'aquafaba avec la gomme xanthane au batteur. Serrer en ajoutant le sucrant en pluie.`);
        steps.push(`Verser la base fruit à 50 °C sur la meringue végétale, lisser délicatement à la maryse.`);
      } else {
        steps.push(`Hydrater la gélatine dans eau froide (ratio 1:5) pendant 20 min, essorer.`);
        const psylNote = c.bien_etre ? " Incorporer le psyllium dans la base tiédie et lisser au mixeur." : "";
        steps.push(`Chauffer la purée de ${parfum} + l'inuline à 45 °C, dissoudre la gélatine essorée, mixer.${psylNote}`);
        steps.push(`Refroidir à 25–28 °C.`);
        if (c.lactose) {
          steps.push(`Réhydrater l'albumine dans eau froide 30 min. Incorporer la lécithine, puis l'huile de coco fondue à 35 °C dans la base, mixer.`);
          steps.push(`Cuire un sirop sucre + eau à 118 °C. Monter les blancs pasteurisés et verser le sirop en filet pour une meringue italienne ferme.`);
          steps.push(`Détendre 1/3 de meringue dans la base, puis incorporer le reste à la maryse.`);
        } else {
          steps.push(`Monter la crème UHT 35 % MG au bec d'oiseau.`);
          steps.push(`Détendre 1/3 de crème montée dans la base à 25 °C, puis incorporer le reste à la maryse.`);
        }
      }
      steps.push(`Dresser immédiatement dans le moule, lisser, surgeler à −18 °C minimum 4 h avant démoulage.`);
      return steps;
    }
  },

  /* ----------------------- CRÉMEUX ----------------------- */
  cremeux: {
    label: "Crémeux",
    description: "Texture onctueuse émulsionnée, structurée par gélifiant et matière grasse.",
    parfumsCompat: Object.keys(PARFUMS),

    lines: [
      { role: "phase_aq", label: "Phase aqueuse", pct: 30,
        getIngredient: (p, c) => {
          const f = PARFUMS[p].famille;
          const isFruit = ["fruit_rouge","fruit_noyau","fruit_exo","fruit_pepin","agrume","vegetal"].includes(f);
          if (isFruit) {
            const note = PARFUMS[p].enzyme ? "Pasteuriser à 90 °C pendant 1 min pour inactiver les enzymes" : null;
            return { nom: `Purée de ${PARFUMS[p].label.toLowerCase()}`, note };
          }
          let base;
          if (c.bien_etre) {
            base = "Boisson d'avoine (barista)";
          } else if (c.vegan || c.lactose) {
            base = "Boisson d'amande non sucrée";
          } else {
            base = "Lait entier UHT";
          }
          if (f === "epice" || f === "infusion") {
            return { nom: base, note: `À infuser avec ${PARFUMS[p].label.toLowerCase()} (8–12 min hors feu, à couvert, puis filtrer et rectifier le poids)` };
          }
          return { nom: base };
        },
        pctOverride: (p) => {
          const isFruit = ["fruit_rouge","fruit_noyau","fruit_exo","fruit_pepin","agrume","vegetal"].includes(PARFUMS[p].famille);
          return isFruit ? 38 : 28;
        }
      },
      { role: "creme", label: "Crème / corps gras liquide", pct: 22,
        getIngredient: (_p, c) => (c.vegan || c.lactose) ? { nom: "Lait de coco entier" } : { nom: "Crème UHT 35 % MG" }
      },
      { role: "sucrant", label: "Sucrant", pct: 12,
        getIngredient: (_p, c) => {
          if (c.bien_etre) return { nom: "Sirop d'érable", note: "Réduire légèrement la phase aqueuse en conséquence" };
          if (c.igbas)     return { nom: "Sucre de coco" };
          return { nom: "Sucre semoule" };
        }
      },
      { role: "parfum_solid", label: "Parfum (couverture / pâte)", pct: 20,
        getIngredient: (p) => {
          const f = PARFUMS[p].famille;
          if (f === "chocolat")  return { nom: PARFUMS[p].label, note: "Couverture fondue à 45 °C" };
          if (f === "praline")   return { nom: PARFUMS[p].label };
          if (f === "fruit_sec") return { nom: PARFUMS[p].label };
          if (f === "caramel")   return { nom: "Caramel", note: "Décuire avec un peu de phase aqueuse chaude" };
          return null;
        },
        actif: (p) => ["chocolat","praline","fruit_sec","caramel"].includes(PARFUMS[p].famille),
        pctOverride: (p) => {
          const f = PARFUMS[p].famille;
          if (f === "chocolat" && (p === "choc_noir" || p === "choc_noir64")) return 22;
          if (f === "chocolat") return 24;
          if (f === "praline")  return 18;
          if (f === "fruit_sec") return 16;
          if (f === "caramel")   return 14;
          return 20;
        }
      },
      { role: "parfum_pdr", label: "Parfum (poudre)", pct: 6,
        getIngredient: (p) => {
          if (p === "the_matcha") return { nom: "Poudre de thé matcha", note: "Tamiser puis disperser au mixeur" };
          if (p === "cacao_pdr")  return { nom: "Cacao en poudre 100 %", note: "Tamiser puis disperser au mixeur" };
          return { nom: PARFUMS[p].label };
        },
        actif: (p) => PARFUMS[p].forme === "poudre",
        pctOverride: (p) => p === "the_matcha" ? 4 : p === "cacao_pdr" ? 8 : 6
      },
      { role: "emulsifiant", label: "Émulsifiant", pct: 0.5,
        getIngredient: (_p, c) => c.vegan
          ? { nom: "Lécithine de tournesol", note: "Ajouter à 40 °C et mixer au mixeur plongeant pour parfaire l'émulsion" }
          : { nom: "Jaunes d'œufs pasteurisés", note: "Apportent émulsion + structure (cuisson à la nappe 82–84 °C)" },
        pctOverride: (_p, c) => c.vegan ? 0.5 : 10
      },
      { role: "epaissi", label: "Épaississant", pct: 3,
        getIngredient: () => ({ nom: "Amidon de maïs", note: "Disperser à froid dans la phase aqueuse" }),
        actif: (p, c) => c.vegan || PARFUMS[p].famille === "agrume"
      },
      { role: "gelifiant", label: "Gélifiant", pct: 0.8,
        getIngredient: (p, c) => {
          if (c.bien_etre) return { nom: "Gel de chia (5 % chia)", note: "Hydrater 5 g chia dans 95 g eau froide 30 min, incorporer à la base tiédie" };
          if (!c.vegan)    return { nom: "Gélatine (feuilles 200 Bloom)", note: "Hydrater dans eau froide 20 min, essorer avant usage" };
          const f = PARFUMS[p].famille;
          const isFruit = ["fruit_rouge","fruit_noyau","fruit_exo","fruit_pepin","agrume","vegetal"].includes(f);
          if (isFruit) return { nom: "Agar-agar", note: "Disperser à froid dans la phase aqueuse, porter à ébullition 2 min" };
          return { nom: "Pectine X58", note: "Mélanger à sec avec le sucrant, disperser à 40 °C en fouettant, porter à 85 °C" };
        },
        pctOverride: (_p, c) => {
          if (c.bien_etre) return 12;
          if (!c.vegan)    return 0.8;
          return 0.4;
        }
      },
      { role: "psyllium", label: "Psyllium (enveloppe)", pct: 1.5,
        getIngredient: () => ({ nom: "Psyllium (enveloppe)", note: "Disperser dans la phase froide avant chauffage" }),
        actif: (_p, c) => !!c.bien_etre
      },
      { role: "mg", label: "Matière grasse de finition", pct: 8,
        getIngredient: (_p, c) => (c.vegan || c.lactose)
          ? { nom: "Beurre de cacao", note: "Cristallise et apporte le fondant à 36 °C" }
          : { nom: "Beurre doux", note: "À 18–22 °C, ajouté à la fin pour lisser" },
        actif: (p) => PARFUMS[p].famille !== "chocolat"
      },
      { role: "fibre", label: "Inuline de chicorée", pct: 3,
        getIngredient: () => ({ nom: "Inuline de chicorée", note: "Apporte corps sans sucre ajouté" })
      }
    ],

    process: (p, c) => {
      const steps = [];
      const parfum = PARFUMS[p].label.toLowerCase();
      const f = PARFUMS[p].famille;
      const forme = PARFUMS[p].forme;

      if (PARFUMS[p].enzyme) {
        steps.push(`Pasteuriser la purée de ${parfum} à 90 °C pendant 1 min, refroidir.`);
      }
      if (forme === "infusion") {
        steps.push(`Chauffer la phase aqueuse + la crème à 80 °C, infuser ${parfum} 8–12 min à couvert hors du feu, filtrer et rectifier le poids.`);
      }
      if (c.bien_etre) {
        steps.push(`Préparer le gel de chia : hydrater 5 g de chia dans 95 g d'eau froide, laisser gonfler 30 min.`);
        if (c.vegan || c.lactose) {
          steps.push(`Disperser l'amidon et le psyllium à froid dans la boisson d'avoine.`);
          steps.push(`Porter la boisson d'avoine + le lait de coco + le sirop d'érable + l'inuline à ébullition (1 min). Incorporer le gel de chia hors du feu, mixer.`);
        } else {
          steps.push(`Disperser le psyllium à froid dans la boisson d'avoine.`);
          steps.push(`Chauffer la boisson d'avoine + la crème + le sirop d'érable à 45 °C, verser sur les jaunes blanchis, cuire à 82–84 °C (à la nappe). Incorporer le gel de chia hors du feu, l'inuline, mixer.`);
        }
        let dest = "";
        if (f === "chocolat")                                dest = " sur la couverture fondue à 45 °C (en 3 fois)";
        else if (f === "praline" || f === "fruit_sec")       dest = ` sur ${parfum}`;
        else if (f === "caramel")                            dest = " dans le caramel";
        else if (forme === "poudre")                         dest = " avec la poudre tamisée";
        if (dest) steps.push(`Verser${dest}, émulsionner au mixeur plongeant.`);
        if (c.vegan) steps.push(`Hors du feu, ajouter la lécithine, mixer 2 min.`);
      } else if (c.vegan) {
        const isFruit = ["fruit_rouge","fruit_noyau","fruit_exo","fruit_pepin","agrume","vegetal"].includes(f);
        const gelifLabel = isFruit ? "l'agar-agar" : "la pectine X58";
        steps.push(`Disperser à froid ${gelifLabel} et l'amidon dans la phase aqueuse.`);
        steps.push(`Porter la phase aqueuse + le lait de coco + le sucre + l'inuline à ébullition en fouettant (1 min) pour activer le gélifiant.`);
        let dest = "";
        if (f === "chocolat")                                dest = ", puis verser en 3 fois sur la couverture fondue à 45 °C";
        else if (f === "praline" || f === "fruit_sec")       dest = `, puis verser sur ${parfum}`;
        else if (f === "caramel")                            dest = `, puis incorporer le caramel`;
        else if (forme === "poudre")                         dest = `, puis ajouter la poudre tamisée`;
        steps.push(`Hors du feu, ajouter la lécithine de tournesol${dest}, mixer 2 min au mixeur plongeant.`);
      } else {
        steps.push(`Hydrater la gélatine dans eau froide (ratio 1:5) pendant 20 min, essorer.`);
        steps.push(`Chauffer la phase aqueuse + la crème + le sucre à 45 °C, verser sur les jaunes blanchis, remettre sur feu doux jusqu'à 82–84 °C (à la nappe).`);
        steps.push(`Hors du feu, ajouter la gélatine essorée et l'inuline, mixer.`);
        if (f === "chocolat")                          steps.push(`Verser en 3 fois sur la couverture fondue à 45 °C, émulsionner au mixeur plongeant.`);
        else if (f === "praline" || f === "fruit_sec") steps.push(`Verser sur ${parfum}, émulsionner au mixeur plongeant.`);
        else if (f === "caramel")                      steps.push(`Verser sur le caramel décuit, émulsionner.`);
        else if (forme === "poudre")                   steps.push(`Ajouter la poudre tamisée, mixer au mixeur plongeant.`);
      }
      if (!c.vegan && !c.lactose && f !== "chocolat") {
        steps.push(`À 35 °C, ajouter le beurre à 20 °C en parcelles, mixer pour parfaire l'émulsion.`);
      } else if ((c.vegan || c.lactose) && f !== "chocolat") {
        steps.push(`À 40 °C, ajouter le beurre de cacao fondu, mixer.`);
      }
      steps.push(`Couler dans le moule, filmer au contact, réserver au froid positif 6 h ou surgeler.`);
      return steps;
    }
  },

  /* ----------------------- GANACHE MONTÉE NOIR ----------------------- */
  ganache_montee_noir: {
    label: "Ganache montée noir",
    description: "Ganache chocolat noir foisonnée, riche en beurre de cacao, structurée par cristallisation et aération au batteur.",
    parfumsCompat: ["choc_noir", "choc_noir64"],

    lines: [
      { role: "emulsion", label: "Couverture noire (émulsion)", pct: 44,
        getIngredient: (p, c) => {
          if (c.vegan || c.lactose) {
            return { nom: `${PARFUMS[p].label} (sans lait)`, note: "La plupart des couvertures noires > 65 % sont naturellement sans lait — vérifier l'étiquette. Fondre à 45 °C" };
          }
          return { nom: PARFUMS[p].label, note: "Fondre à 45 °C" };
        },
        pctOverride: (p) => p === "choc_noir" ? 44 : 42
      },
      { role: "phase_aq_chaude", label: "Phase aqueuse chaude", pct: 20,
        getIngredient: (_p, c) => ({
          nom: (c.vegan || c.lactose) ? "Crème de coco 35 % MG" : "Crème UHT 35 % MG",
          note: "Note du concepteur : infuser un arôme à chaud si souhaité (vanille, café grain, épice, zestes) — 10 min à couvert hors feu, filtrer et rectifier la masse"
        })
      },
      { role: "phase_aq_froide", label: "Phase aqueuse froide", pct: 28,
        getIngredient: (_p, c) => ({
          nom: (c.vegan || c.lactose) ? "Crème de coco 35 % MG (froide, +4 °C)" : "Crème UHT 35 % MG (froide, +4 °C)",
          note: "Conserver au froid jusqu'à l'ajout — sera foisonnée avec la ganache"
        })
      },
      { role: "sucrant_anti_cristal", label: "Sucrant anti-cristal", pct: 5,
        getIngredient: (_p, c) => c.igbas
          ? { nom: "Oligofructose", note: "Substitut IG bas — même rôle anti-cristallisation que le glucose" }
          : { nom: "Glucose DE38", note: "Limite la cristallisation du sucre au repos" }
      },
      { role: "eau", label: "Eau d'ajustement", pct: 3,
        getIngredient: () => ({ nom: "Eau" })
      }
    ],

    process: (p, c) => {
      const choc = PARFUMS[p].label;
      const cremeChaude = (c.vegan || c.lactose) ? "la crème de coco" : "la crème UHT 35 %";
      const cremeFroide = (c.vegan || c.lactose) ? "la crème de coco froide" : "la crème UHT 35 % froide";
      return [
        `Chauffer ${cremeChaude} avec le glucose à 70–75 °C.`,
        `Verser en 3 fois sur ${choc} fondu à 45 °C. Mixer au mixeur plongeant en cercles serrés, sans incorporer d'air, jusqu'à obtention d'une émulsion lisse et brillante.`,
        `Ajouter ${cremeFroide} d'un coup, mixer 30 s.`,
        `Filmer au contact. Repos minimum 12 h à +4 °C.`,
        `Foisonner au batteur à vitesse moyenne (vitesse 3/6) jusqu'au bec d'oiseau souple. Arrêter dès que la texture est pochable — ne pas grainer. Utiliser immédiatement en poche.`,
      ];
    }
  },

  /* ----------------------- GANACHE MONTÉE LAIT ----------------------- */
  ganache_montee_lait: {
    label: "Ganache montée lait",
    description: "Ganache chocolat au lait foisonnée, texture soyeuse et goût doux, s'associe aux parfums caramel, café et fruits secs.",
    parfumsCompat: ["choc_lait", "choc_blond"],

    lines: [
      { role: "emulsion", label: "Couverture lait (émulsion)", pct: 38,
        getIngredient: (p, c) => {
          if (c.vegan || c.lactose) {
            return { nom: `${PARFUMS[p].label} (vegan / sans lait)`, note: "Utiliser une couverture lait vegan à base de poudre végétale. Fondre à 45 °C" };
          }
          return { nom: PARFUMS[p].label, note: "Fondre à 45 °C" };
        }
      },
      { role: "phase_aq_chaude", label: "Phase aqueuse chaude", pct: 22,
        getIngredient: (_p, c) => ({
          nom: (c.vegan || c.lactose) ? "Crème de coco 35 % MG" : "Crème UHT 35 % MG",
          note: "Note du concepteur : la ganache lait appelle les parfums caramel, café, tonka, épices douces — infuser 10 min hors feu, filtrer et rectifier la masse"
        })
      },
      { role: "phase_aq_froide", label: "Phase aqueuse froide", pct: 28,
        getIngredient: (_p, c) => ({
          nom: (c.vegan || c.lactose) ? "Crème de coco 35 % MG (froide, +4 °C)" : "Crème UHT 35 % MG (froide, +4 °C)",
          note: "Conserver au froid jusqu'à l'ajout"
        })
      },
      { role: "sucrant_anti_cristal", label: "Sucrant anti-cristal", pct: 5,
        getIngredient: (_p, c) => c.igbas
          ? { nom: "Oligofructose", note: "Substitut IG bas — même rôle anti-cristallisation que le glucose" }
          : { nom: "Glucose DE38", note: "Limite la cristallisation du sucre au repos" }
      },
      { role: "eau", label: "Eau d'ajustement", pct: 7,
        getIngredient: () => ({ nom: "Eau" })
      }
    ],

    process: (p, c) => {
      const choc = PARFUMS[p].label;
      const cremeChaude = (c.vegan || c.lactose) ? "la crème de coco" : "la crème UHT 35 %";
      const cremeFroide = (c.vegan || c.lactose) ? "la crème de coco froide" : "la crème UHT 35 % froide";
      return [
        `Chauffer ${cremeChaude} avec le glucose à 70–75 °C.`,
        `Verser en 3 fois sur ${choc} fondu à 45 °C. Mixer au mixeur plongeant en cercles serrés, sans incorporer d'air.`,
        `Ajouter ${cremeFroide} d'un coup, mixer 30 s.`,
        `Filmer au contact. Repos minimum 12 h à +4 °C.`,
        `Foisonner au batteur à vitesse moyenne (vitesse 3/6) jusqu'au bec d'oiseau souple. La ganache lait est plus souple que le noir — surveiller la texture et arrêter dès le bec d'oiseau. Utiliser immédiatement en poche.`,
      ];
    }
  },

  /* ----------------------- GANACHE MONTÉE BLANC ----------------------- */
  ganache_montee_blanc: {
    label: "Ganache montée blanc",
    description: "Ganache chocolat blanc foisonnée, légère et délicate, idéale pour les parfums floraux, thés et fruits.",
    parfumsCompat: ["choc_blanc", "choc_ruby"],

    lines: [
      { role: "emulsion", label: "Couverture blanche (émulsion)", pct: 32,
        getIngredient: (p, c) => {
          if (c.vegan || c.lactose) {
            return { nom: `${PARFUMS[p].label} (vegan / sans lait)`, note: "Couverture à base de beurre de cacao + sucre + poudre végétale (≥ 35 % MG). Fondre à 40 °C" };
          }
          return {
            nom: PARFUMS[p].label,
            note: p === "choc_ruby"
              ? "Fondre à 40 °C — le ruby est sensible à la chaleur, ne pas dépasser 45 °C"
              : "Fondre à 40 °C — le blanc fond à température plus basse que le noir ou le lait"
          };
        }
      },
      { role: "phase_aq_chaude", label: "Phase aqueuse chaude", pct: 20,
        getIngredient: (_p, c) => ({
          nom: (c.vegan || c.lactose) ? "Crème de coco 35 % MG" : "Crème UHT 35 % MG",
          note: "Note du concepteur : le blanc et le ruby s'associent aux infusions florales (rose, jasmin, fleur d'oranger), thés délicats, zestes d'agrumes — infuser 8 min hors feu, filtrer"
        })
      },
      { role: "phase_aq_froide", label: "Phase aqueuse froide", pct: 38,
        getIngredient: (_p, c) => ({
          nom: (c.vegan || c.lactose) ? "Crème de coco 35 % MG (froide, +4 °C)" : "Crème UHT 35 % MG (froide, +4 °C)",
          note: "Volume plus élevé que sur les ganaches noir/lait — le blanc a moins de beurre de cacao, la crème froide apporte la structure au foisonnage"
        })
      },
      { role: "sucrant_anti_cristal", label: "Sucrant anti-cristal", pct: 5,
        getIngredient: (_p, c) => c.igbas
          ? { nom: "Oligofructose", note: "Substitut IG bas — même rôle anti-cristallisation que le glucose" }
          : { nom: "Glucose DE38", note: "Limite la cristallisation du sucre au repos" }
      },
      { role: "eau", label: "Eau d'ajustement", pct: 5,
        getIngredient: () => ({ nom: "Eau" })
      }
    ],

    process: (p, c) => {
      const choc = PARFUMS[p].label;
      const cremeChaude = (c.vegan || c.lactose) ? "la crème de coco" : "la crème UHT 35 %";
      const cremeFroide = (c.vegan || c.lactose) ? "la crème de coco froide" : "la crème UHT 35 % froide";
      const tempFusion = p === "choc_ruby" ? "40 °C (ne pas dépasser 45 °C)" : "40 °C";
      return [
        `Chauffer ${cremeChaude} avec le glucose à 70 °C (ne pas dépasser — le blanc est sensible à la surcuisson).`,
        `Verser en 3 fois sur ${choc} fondu à ${tempFusion}. Mixer au mixeur plongeant en cercles serrés, sans incorporer d'air.`,
        `Ajouter ${cremeFroide} d'un coup, mixer 30 s.`,
        `Filmer au contact. Repos minimum 12 h à +4 °C (critique pour le blanc qui cristallise plus lentement que le noir).`,
        `Foisonner au batteur à vitesse lente–moyenne (vitesse 2–3/6) — le blanc est plus fragile au grainage. Arrêter dès le bec d'oiseau souple. Utiliser immédiatement en poche.`,
      ];
    }
  },

  /* ----------------------- GANACHE MONTÉE FRUIT ----------------------- */
  ganache_montee_fruit: {
    label: "Ganache montée fruit",
    description: "Ganache chocolat blanc + purée de fruit foisonnée, structurée par gélifiant pour compenser l'eau de la purée.",
    parfumsCompat: [
      "framboise","fraise","cassis","mure","myrtille","groseille","grenade","cerise",
      "abricot","peche","prune","mirabelle",
      "poire","pomme","coing",
      "mangue","passion","ananas","kiwi","banane","coco","litchi","figue","fpassion_mangue",
      "citron","citron_vert","yuzu","orange","mandarine","pamplemousse","bergamote",
      "marron","rhubarbe"
    ],

    lines: [
      { role: "parfum", label: "Parfum (purée de fruit)", pct: 28,
        getIngredient: (p, _c) => ({
          nom: p === "marron" ? PARFUMS[p].label : `Purée de ${PARFUMS[p].label.toLowerCase()}`,
          note: PARFUMS[p].enzyme
            ? "Pasteuriser à 90 °C pendant 1 min pour inactiver les enzymes avant usage"
            : null
        }),
        pctOverride: (p) => PARFUMS[p].acide ? 30 : 28
      },
      { role: "emulsion", label: "Couverture blanche (émulsion)", pct: 25,
        getIngredient: (_p, c) => {
          if (c.vegan || c.lactose) return { nom: "Couverture blanche vegan (≥ 35 % MG)", note: "Fondre à 40 °C" };
          return { nom: "Chocolat blanc 35 %", note: "Fondre à 40 °C" };
        },
        pctOverride: (p) => PARFUMS[p].acide ? 22 : 25
      },
      { role: "phase_aq_froide", label: "Phase aqueuse froide", pct: 33,
        getIngredient: (_p, c) => ({
          nom: (c.vegan || c.lactose) ? "Crème de coco 35 % MG (froide, +4 °C)" : "Crème UHT 35 % MG (froide, +4 °C)",
          note: "Conserver au froid jusqu'à l'ajout — sera foisonnée avec la ganache"
        })
      },
      { role: "sucrant_anti_cristal", label: "Sucrant anti-cristal", pct: 4,
        getIngredient: (_p, c) => c.igbas
          ? { nom: "Oligofructose", note: "Substitut IG bas" }
          : { nom: "Glucose DE38", note: "Limite la cristallisation — réduit aussi l'acidité perçue" }
      },
      { role: "gelifiant", label: "Gélifiant", pct: 1,
        getIngredient: (_p, c) => c.vegan
          ? { nom: "Pectine X58", note: "Mélanger à sec avec le glucose avant dispersion dans la purée froide — activer à 65 °C" }
          : { nom: "Gélatine en poudre 220 Bloom", note: "Hydrater dans 6× son poids d'eau froide pendant 20 min" },
        pctOverride: (_p, c) => c.vegan ? 0.6 : 1
      },
      { role: "eau", label: "Eau d'ajustement", pct: 9,
        getIngredient: () => ({ nom: "Eau" })
      }
    ],

    process: (p, c) => {
      const steps = [];
      const nomPuree = p === "marron"
        ? PARFUMS[p].label.toLowerCase()
        : `la purée de ${PARFUMS[p].label.toLowerCase()}`;
      const cremeFroide = (c.vegan || c.lactose) ? "la crème de coco froide" : "la crème UHT 35 % froide";

      if (PARFUMS[p].enzyme) {
        steps.push(`Pasteuriser ${nomPuree} à 90 °C pendant 1 min pour inactiver les enzymes. Refroidir à 55 °C.`);
      }
      if (!c.vegan) {
        steps.push(`Hydrater la gélatine dans 6× son poids d'eau froide pendant 20 min.`);
        steps.push(`Chauffer ${nomPuree} avec le glucose à 60 °C. Incorporer la gélatine essorée hors du feu, mixer pour dissoudre.`);
      } else {
        steps.push(`Mélanger à sec la pectine X58 avec le glucose. Disperser dans ${nomPuree} froide, chauffer à 65 °C en fouettant pour activer la pectine.`);
      }
      steps.push(`Verser en 3 fois sur le chocolat blanc fondu à 40 °C. Mixer au mixeur plongeant en cercles serrés, sans incorporer d'air.`);
      steps.push(`Ajouter ${cremeFroide} d'un coup, mixer 30 s.`);
      steps.push(`Filmer au contact. Repos minimum 12 h à +4 °C.`);
      steps.push(`Foisonner au batteur à vitesse moyenne (vitesse 3/6) jusqu'au bec d'oiseau souple. Le gélifiant stabilise la texture — ne pas trop foisonner. Utiliser immédiatement en poche.`);
      return steps;
    }
  },

  /* ----------------------- GANACHE MONTÉE PRALINÉ ----------------------- */
  ganache_montee_praline: {
    label: "Ganache montée praliné",
    description: "Ganache praliné ou pâte oléagineuse foisonnée, structurée par la matière grasse du fruit sec.",
    parfumsCompat: [
      "praline_no","praline_am","praline_pi","praline_pe","praline_se",
      "pate_noisette","pate_amande","pate_pistache","pate_pecan",
      "pate_macadamia","pate_sesame","pate_cacahuete",
      "gianduja","gianduja_lait"
    ],

    lines: [
      { role: "parfum", label: "Parfum (praliné / pâte oléagineuse)", pct: 28,
        getIngredient: (p, _c) => ({
          nom: PARFUMS[p].label,
          note: PARFUMS[p].famille === "fruit_sec"
            ? "Pâte pure 100 % — conserver à 22–24 °C, mélanger avant usage pour homogénéiser les matières grasses"
            : "À 22–24 °C — ajouter après l'émulsion initiale de la couverture"
        }),
        pctOverride: (p) => PARFUMS[p].famille === "fruit_sec" ? 24 : 28
      },
      { role: "emulsion", label: "Couverture (émulsion)", pct: 14,
        getIngredient: (p, c) => {
          const usesBlanche = PARFUMS[p].famille === "fruit_sec";
          if (c.vegan || c.lactose) {
            return { nom: usesBlanche ? "Couverture blanche vegan (≥ 35 % MG)" : "Couverture lait vegan", note: "Fondre à 45 °C" };
          }
          return {
            nom: usesBlanche ? "Chocolat blanc 35 %" : "Chocolat au lait 40 %",
            note: usesBlanche
              ? "Fondre à 40 °C — apporte la structure sans dominer la pâte pure"
              : "Fondre à 45 °C — complémente le praliné sans alourdir l'ensemble"
          };
        },
        pctOverride: (p) => PARFUMS[p].famille === "fruit_sec" ? 12 : 14
      },
      { role: "phase_aq_chaude", label: "Phase aqueuse chaude", pct: 18,
        getIngredient: (_p, c) => ({
          nom: (c.vegan || c.lactose) ? "Crème de coco 35 % MG" : "Crème UHT 35 % MG"
        })
      },
      { role: "phase_aq_froide", label: "Phase aqueuse froide", pct: 32,
        getIngredient: (_p, c) => ({
          nom: (c.vegan || c.lactose) ? "Crème de coco 35 % MG (froide, +4 °C)" : "Crème UHT 35 % MG (froide, +4 °C)",
          note: "Conserver au froid jusqu'à l'ajout"
        })
      },
      { role: "sucrant_anti_cristal", label: "Sucrant anti-cristal", pct: 4,
        getIngredient: (_p, c) => c.igbas
          ? { nom: "Oligofructose", note: "Substitut IG bas" }
          : { nom: "Glucose DE38", note: "Limite la cristallisation du sucre au repos" }
      },
      { role: "eau", label: "Eau d'ajustement", pct: 4,
        getIngredient: () => ({ nom: "Eau" })
      }
    ],

    process: (p, c) => {
      const praline = PARFUMS[p].label;
      const cremeChaude = (c.vegan || c.lactose) ? "la crème de coco" : "la crème UHT 35 %";
      const cremeFroide = (c.vegan || c.lactose) ? "la crème de coco froide" : "la crème UHT 35 % froide";
      const isPateP = PARFUMS[p].famille === "fruit_sec";
      const couverture = isPateP
        ? (c.vegan || c.lactose ? "la couverture blanche vegan" : "le chocolat blanc 35 %")
        : (c.vegan || c.lactose ? "la couverture lait vegan" : "le chocolat au lait 40 %");
      const tempFusion = isPateP ? "40 °C" : "45 °C";
      return [
        `Chauffer ${cremeChaude} avec le glucose à 70–75 °C.`,
        `Verser en 3 fois sur ${couverture} fondu à ${tempFusion}. Mixer au mixeur plongeant, sans incorporer d'air.`,
        `Ajouter ${praline} à 22–24 °C, mixer pour homogénéiser l'ensemble.`,
        `Ajouter ${cremeFroide} d'un coup, mixer 30 s.`,
        `Filmer au contact. Repos minimum 12 h à +4 °C.`,
        `Foisonner au batteur à vitesse moyenne (vitesse 3/6) jusqu'au bec d'oiseau souple. Le praliné alourdit la ganache — la texture doit rester soyeuse et pochable, ne pas chercher une tenue ferme. Utiliser immédiatement en poche.`,
      ];
    }
  },

  /* =====================================================================
     FAMILLE 2 — SABLÉS / CROUSTILLANTS / STREUSELS
     ===================================================================== */

  /* ----------------------- SABLÉ BRETON ----------------------- */
  sable_breton: {
    label: "Sablé breton",
    description: "Biscuit sablé breton au beurre demi-sel, texture fondante-craquante, base classique de tartes et entremets.",
    parfumsCompat: ["nature"],
    formats: {
      epais: "Épais — 8 mm",
      fin:   "Fin — 4 mm",
    },

    lines: [
      { role: "mg", label: "Beurre demi-sel", pct: 40,
        getIngredient: (_p, c) => (c.vegan || c.lactose)
          ? { nom: "Beurre végétal demi-sel", note: "À 18–22 °C, consistance pommade — choisir une margarine avec ≥ 80 % MG" }
          : { nom: "Beurre demi-sel", note: "À 18–22 °C, consistance pommade — le sel est structurant et participe au goût" }
      },
      { role: "sucrant", label: "Sucrant", pct: 20,
        getIngredient: (_p, c) => c.igbas
          ? { nom: "Sucre de coco", note: "IG 35 — apporte des notes caramélisées légères" }
          : { nom: "Sucre semoule" }
      },
      { role: "liant", label: "Jaunes d'œufs", pct: 8,
        getIngredient: () => ({ nom: "Jaunes d'œufs", note: "À température ambiante" }),
        actif: (_p, c) => !c.vegan
      },
      { role: "liant", label: "Lécithine de tournesol", pct: 2,
        getIngredient: () => ({ nom: "Lécithine de tournesol en poudre", note: "Émulsifiant végétal — disperse dans la matière grasse avant d'ajouter la farine" }),
        actif: (_p, c) => c.vegan
      },
      { role: "farine", label: "Farine", pct: 30,
        getIngredient: (_p, c) => c.gluten
          ? { nom: "Mix sans gluten (60 % farine de riz + 40 % poudre d'amande)", note: "Ajouter 0,2 % de gomme xanthane — la pâte sera plus fragile, manipuler froide" }
          : { nom: "Farine T55", note: "Tamisée" }
      },
      { role: "levure", label: "Levure chimique", pct: 2,
        getIngredient: () => ({ nom: "Levure chimique" })
      },
      { role: "eau", label: "Humidification vegan", pct: 6,
        getIngredient: () => ({ nom: "Eau ou lait végétal", note: "Compense l'humidité des jaunes d'œufs — incorporer progressivement après la lécithine" }),
        actif: (_p, c) => c.vegan
      },
    ],

    process: (_p, c) => {
      const beurre    = (c.vegan || c.lactose) ? "le beurre végétal" : "le beurre demi-sel";
      const liant     = c.vegan ? "la lécithine" : "les jaunes d'œufs";
      const farine    = c.gluten ? "le mix sans gluten" : "la farine T55";
      const sucre     = c.igbas ? "le sucre de coco" : "le sucre semoule";
      const epais     = c.format !== 'fin';
      const epaisseur = epais ? "8" : "4";
      const temp      = epais ? "175" : "180";
      const duree     = epais ? "16–18" : "10–12";
      return [
        `Sortir ${beurre} 1 h avant pour qu'il soit souple sans être fondu.`,
        `Dans la cuve du batteur muni de la feuille, sabler ${beurre} avec ${farine} et la levure jusqu'à obtention d'une texture sableuse grossière.`,
        `Ajouter ${sucre} et ${liant}. Mélanger à vitesse lente jusqu'à incorporation — ne pas travailler la pâte au-delà.`,
        `Étaler entre deux feuilles de papier sulfurisé à ${epaisseur} mm. Réserver au réfrigérateur 30 min minimum (la pâte est fragile à chaud).`,
        `Détailler à la forme souhaitée. Enfourner à ${temp} °C chaleur tournante.`,
        `Cuire ${duree} min. Le sablé doit être doré mais paraître encore mou à la sortie — il se raffermit en refroidissant. Laisser refroidir sur grille avant de manipuler.`,
      ];
    }
  },

  /* ----------------------- PÂTE SUCRÉE ----------------------- */
  pate_sucree: {
    label: "Pâte sucrée",
    description: "Pâte sucrée croustillante et fondante, fond de tarte classique. Méthode par crémage.",
    parfumsCompat: ["nature"],
    formats: {
      standard:    "Standard — fond de tarte (3 mm)",
      tartelette:  "Tartelette — coque fine (2 mm)",
    },

    lines: [
      { role: "mg", label: "Beurre pommade", pct: 28,
        getIngredient: (_p, c) => (c.vegan || c.lactose)
          ? { nom: "Beurre végétal pommade", note: "À 18–22 °C — utiliser une margarine avec ≥ 80 % MG" }
          : { nom: "Beurre doux pommade", note: "À 18–22 °C, texture pommade — pas fondu" }
      },
      { role: "sucrant", label: "Sucre glace", pct: 15,
        getIngredient: () => ({ nom: "Sucre glace", note: "Tamisé — le sucre glace évite le développement du réseau glutineux" })
      },
      { role: "amande", label: "Poudre d'amande", pct: 5,
        getIngredient: () => ({ nom: "Poudre d'amande", note: "Tamisée — apporte fondant et légèreté" }),
        actif: (_p, c) => !c.gluten
      },
      { role: "sel", label: "Sel fin", pct: 1,
        getIngredient: () => ({ nom: "Sel fin" })
      },
      { role: "liant", label: "Œuf entier", pct: 12,
        getIngredient: () => ({ nom: "Œuf entier", note: "Légèrement battu, à température ambiante" }),
        actif: (_p, c) => !c.vegan
      },
      { role: "liant", label: "Lécithine de tournesol", pct: 2,
        getIngredient: () => ({ nom: "Lécithine de tournesol en poudre + eau (rapport 1/5)", note: "Dissoudre la lécithine dans l'eau avant d'incorporer" }),
        actif: (_p, c) => c.vegan
      },
      { role: "farine", label: "Farine", pct: 39,
        getIngredient: (_p, c) => c.gluten
          ? { nom: "Mix sans gluten (60 % farine de riz + 40 % poudre d'amande)", note: "Ajouter 0,2 % de gomme xanthane — pâte plus friable, foncer froid" }
          : { nom: "Farine T55", note: "Tamisée — incorporer en dernier, fraser sans corser" },
        pctOverride: (_p, c) => c.gluten ? 44 : 39
      },
      { role: "eau", label: "Humidification vegan", pct: 10,
        getIngredient: () => ({ nom: "Lait végétal ou eau", note: "Compense l'humidité de l'œuf — incorporer progressivement après la lécithine" }),
        actif: (_p, c) => c.vegan
      },
    ],

    process: (_p, c) => {
      const beurre   = (c.vegan || c.lactose) ? "le beurre végétal" : "le beurre pommade";
      const liant    = c.vegan ? "le mélange lécithine-eau" : "l'œuf battu";
      const farine   = c.gluten ? "le mix sans gluten" : "la farine T55";
      const thin     = c.format === 'tartelette';
      const epais    = thin ? "2" : "3";
      const temp     = thin ? "165" : "160";
      const duree    = thin ? "10–12" : "14–16";
      const repos    = thin ? "20" : "30";
      return [
        `Crémer ${beurre} avec le sucre glace à la feuille jusqu'à blanchiment léger. Ajouter la poudre d'amande${c.gluten ? '' : ''} et le sel.`,
        `Incorporer ${liant} progressivement sans faire foisonner.`,
        `Ajouter ${farine} tamisée en une fois. Fraser (écraser sans pétrir) jusqu'à obtention d'une pâte homogène.`,
        `Former un disque, filmer et réserver au réfrigérateur ${repos} min minimum.`,
        `Abaisser à ${epais} mm sur plan fariné ou entre deux feuilles. Foncer le moule, piquer le fond, réserver 15 min au froid.`,
        `Cuire à blanc (papier sulfurisé + billes) à ${temp} °C chaleur tournante, ${duree} min, jusqu'à coloration homogène. Retirer les billes les 3 dernières minutes pour sécher le fond.`,
      ];
    }
  },

  /* ----------------------- STREUSEL ----------------------- */
  streusel: {
    label: "Streusel",
    description: "Crumble sablé beurre-sucre-amande, cuit puis incorporé en insert ou disposé en crumble sur entremet.",
    parfumsCompat: ["nature"],
    formats: {
      grossier: "Grossier — crumble (8–12 mm)",
      fin:      "Fin — insert feuilleté (3–5 mm)",
    },

    lines: [
      { role: "mg", label: "Beurre froid", pct: 25,
        getIngredient: (_p, c) => (c.vegan || c.lactose)
          ? { nom: "Beurre végétal froid", note: "Couper en dés de 1 cm, remettre au froid si ramolli" }
          : { nom: "Beurre doux froid", note: "Couper en dés de 1 cm — le froid est essentiel à la texture sableuse" }
      },
      { role: "farine", label: "Farine", pct: 25,
        getIngredient: (_p, c) => c.gluten
          ? { nom: "Farine de riz", note: "Version SG — texture légèrement plus croustillante et friable" }
          : { nom: "Farine T55" }
      },
      { role: "sucrant", label: "Cassonade", pct: 25,
        getIngredient: (_p, c) => c.igbas
          ? { nom: "Sucre de coco", note: "Notes caramélisées, IG 35" }
          : { nom: "Cassonade", note: "Les cristaux de cassonade renforcent le craquant" }
      },
      { role: "amande", label: "Poudre d'amande", pct: 25,
        getIngredient: () => ({ nom: "Poudre d'amande", note: "Tamisée — remplaçable par poudre de noisette ou de pistache" })
      },
    ],

    process: (_p, c) => {
      const beurre = (c.vegan || c.lactose) ? "le beurre végétal froid" : "le beurre froid";
      const sucre  = c.igbas ? "le sucre de coco" : "la cassonade";
      const farine = c.gluten ? "la farine de riz" : "la farine T55";
      const grossier = c.format !== 'fin';
      const temp   = grossier ? "160" : "170";
      const duree  = grossier ? "20–22" : "14–16";
      const taille = grossier ? "grossières (8–12 mm)" : "fines (3–5 mm)";
      return [
        `Dans un cul-de-poule, réunir ${farine}, ${sucre} et la poudre d'amande.`,
        grossier
          ? `Incorporer ${beurre} du bout des doigts en sablant rapidement jusqu'à l'obtention de miettes ${taille}. Ne pas chercher une pâte homogène — les grosses miettes donnent la texture crumble.`
          : `Incorporer ${beurre} en sablant, puis mixer 2–3 pulsations courtes au robot coupe pour obtenir des miettes ${taille}. Arrêter avant que la pâte ne s'amalgame.`,
        `Répartir sur une plaque tapissée de papier sulfurisé, en couche non compressée.`,
        `Enfourner à ${temp} °C chaleur tournante, ${duree} min, en remuant à mi-cuisson pour une coloration homogène.`,
        `Refroidir complètement à température ambiante avant d'utiliser. Le streusel se conserve 3 jours en boîte hermétique.`,
      ];
    }
  },

  /* ----------------------- CROUSTILLANT PRALINÉ ----------------------- */
  croustillant_praline: {
    label: "Croustillant praliné",
    description: "Insert croustillant praliné-couverture, à base de feuilletine ou riz soufflé selon le format.",
    famille_texture: 'inserts',
    parfumsCompat: [
      "praline_no","praline_am","praline_pi","praline_pe","praline_se",
      "pate_noisette","pate_amande","pate_pistache","pate_pecan",
      "pate_macadamia","pate_sesame","pate_cacahuete",
      "gianduja","gianduja_lait"
    ],
    formats: {
      feuilletine:  "Feuilletine — fondant-craquant (contient gluten)",
      riz_souffle:  "Riz soufflé — aéré, sans gluten",
    },

    lines: [
      { role: "parfum", label: "Praliné / pâte oléagineuse", pct: 55,
        getIngredient: (p, _c) => ({
          nom: PARFUMS[p].label,
          note: PARFUMS[p].famille === "fruit_sec"
            ? "Pâte pure 100 % — tempérer à 22–24 °C pour fluidifier avant incorporation"
            : "À 22–24 °C — mélanger avant usage pour homogénéiser les matières grasses"
        }),
        pctOverride: (p) => PARFUMS[p].famille === "fruit_sec" ? 48 : 55
      },
      { role: "emulsion", label: "Couverture (liaison)", pct: 12,
        getIngredient: (p, c) => {
          if (c.bien_etre) {
            return { nom: "Couverture noire 70 % (min 70 % cacao)", note: "Sans sucre raffiné ajouté — fondre à 40–45 °C, incorporer au praliné tiède" };
          }
          const usesBlanc = PARFUMS[p].famille === "fruit_sec";
          if (c.vegan || c.lactose) {
            return { nom: usesBlanc ? "Couverture blanche vegan (≥ 35 % MG)" : "Couverture lait vegan", note: "Fondre à 40–45 °C, incorporer au praliné tiède" };
          }
          return {
            nom: usesBlanc ? "Chocolat blanc 35 %" : "Chocolat au lait 40 %",
            note: "Fondre à 40–45 °C, incorporer au praliné tiède"
          };
        },
        pctOverride: (p) => PARFUMS[p].famille === "fruit_sec" ? 10 : 12
      },
      { role: "croustillant", label: "Élément croustillant", pct: 30,
        getIngredient: (_p, c) => {
          const useRiz = c.gluten || c.format === 'riz_souffle';
          return useRiz
            ? { nom: "Riz soufflé", note: "Naturellement sans gluten — incorporer en dernier pour préserver les éclats" }
            : { nom: "Feuilletine (pailletée feuilletée / crêpes dentelles)", note: "Écraser grossièrement avant incorporation — ne pas pulvériser" };
        },
        pctOverride: (p) => PARFUMS[p].famille === "fruit_sec" ? 38 : 30
      },
      { role: "mg", label: "Beurre de cacao", pct: 3,
        getIngredient: () => ({ nom: "Beurre de cacao", note: "Fondu à 40 °C — favorise la cristallisation et la tenue à température ambiante" }),
        pctOverride: (p) => PARFUMS[p].famille === "fruit_sec" ? 4 : 3
      },
    ],

    process: (p, c) => {
      const praline    = PARFUMS[p].label;
      const isPate     = PARFUMS[p].famille === "fruit_sec";
      const couverture = c.bien_etre
        ? "la couverture noire 70 %"
        : isPate
          ? (c.vegan || c.lactose ? "la couverture blanche vegan" : "le chocolat blanc 35 %")
          : (c.vegan || c.lactose ? "la couverture lait vegan"   : "le chocolat au lait 40 %");
      const useRiz     = c.gluten || c.format === 'riz_souffle';
      const element    = useRiz ? "le riz soufflé" : "la feuilletine";
      const epaisseur  = useRiz ? "4–5" : "3–4";
      return [
        `Fondre ${couverture} à 40–45 °C. Fondre le beurre de cacao à 40 °C.`,
        `Tempérer ${praline} à 22–24 °C${isPate ? " — la pâte pure doit être fluide mais non huileuse" : ""}.`,
        `Mélanger le praliné avec le beurre de cacao fondu. Incorporer ${couverture} fondu, remuer jusqu'à homogénéité.`,
        `Ajouter ${element} d'un coup et mélanger délicatement à la spatule — préserver les éclats, ne pas trop travailler.`,
        `Étaler immédiatement à ${epaisseur} mm sur une feuille de papier guitare. Recouvrir d'une seconde feuille, lisser au rouleau.`,
        `Retirer délicatement la feuille supérieure et parsemer de fleur de sel (qs) — appuyer légèrement pour fixer les cristaux avant cristallisation.`,
        `Réserver à +4 °C 30 min jusqu'à cristallisation complète. Surgeler 1 h minimum. Détailler impérativement surgelé à la forme souhaitée.`,
        c.bien_etre ? `Note du concepteur : pour un praliné maison sans sucre raffiné, mixer des fruits secs torréfiés avec du sirop d'érable réduit (rapport 2:1 fruits secs / sirop). Utiliser de préférence une couverture noire 70 % minimum.` : null,
      ].filter(Boolean);
    }
  },

  /* =====================================================================
     FAMILLE 3 — BISCUITS / CAKES MOELLEUX
     ===================================================================== */

  /* ----------------------- BISCUIT CUILLÈRE ----------------------- */
  biscuit_cuillere: {
    label: "Biscuit cuillère",
    description: "Biscuit léger monté par double sabayon (jaunes/blancs séparés), structure alvéolée, idéal pour la charlotte et le tiramisu.",
    parfumsCompat: ["nature"],
    formats: {
      classique: "Classique — à la poche, 8 cm (180 °C, 10–12 min)",
      boudoir:   "Boudoir — longueur 12 cm, séché (170 °C, 14–16 min)",
    },

    lines: [
      // — Chemin standard (non-vegan) —
      { role: "jaunes", label: "Jaunes d'œufs", pct: 22,
        getIngredient: () => ({ nom: "Jaunes d'œufs", note: "À température ambiante" }),
        actif: (_p, c) => !c.vegan
      },
      { role: "sucrant_jaunes", label: "Sucrant (jaunes)", pct: 10,
        getIngredient: (_p, c) => c.igbas
          ? { nom: "Sucre de coco", note: "Blanchir les jaunes jusqu'à ruban" }
          : { nom: "Sucre semoule", note: "Blanchir les jaunes jusqu'au ruban" },
        actif: (_p, c) => !c.vegan
      },
      { role: "blancs", label: "Blancs d'œufs", pct: 40,
        getIngredient: () => ({ nom: "Blancs d'œufs", note: "Sans trace de jaune ni de gras — monter en neige ferme" }),
        actif: (_p, c) => !c.vegan
      },
      { role: "sucrant_blancs", label: "Sucrant (meringue)", pct: 15,
        getIngredient: (_p, c) => c.igbas
          ? { nom: "Sucre de coco", note: "Incorporer en 3 fois dès que les blancs moussent" }
          : { nom: "Sucre semoule", note: "Incorporer en 3 fois dès que les blancs moussent" },
        actif: (_p, c) => !c.vegan
      },
      // — Chemin vegan (aquafaba) —
      { role: "blancs", label: "Aquafaba (vegan)", pct: 55,
        getIngredient: () => ({ nom: "Aquafaba (eau de pois chiche)", note: "Réduire de 30 % à feu doux pour concentrer avant de monter — plus stable" }),
        actif: (_p, c) => c.vegan
      },
      { role: "sucrant_blancs", label: "Sucrant (aquafaba)", pct: 25,
        getIngredient: (_p, c) => c.igbas
          ? { nom: "Sucre de coco", note: "Incorporer en 3 fois pour stabiliser l'aquafaba" }
          : { nom: "Sucre semoule", note: "Incorporer en 3 fois pour stabiliser l'aquafaba" },
        actif: (_p, c) => c.vegan
      },
      // — Farine (commune aux deux chemins) —
      { role: "farine", label: "Farine", pct: 13,
        getIngredient: (_p, c) => c.gluten
          ? { nom: "Fécule de maïs + farine de riz (50/50)", note: "Tamiser ensemble — texture plus délicate, sécher légèrement plus longtemps" }
          : { nom: "Farine T45", note: "Tamisée — incorporer en pluie par mouvements enveloppants" },
        pctOverride: (_p, c) => c.vegan ? 20 : 13
      },
    ],

    process: (_p, c) => {
      const boudoir = c.format === 'boudoir';
      const sucre   = c.igbas ? "le sucre de coco" : "le sucre semoule";
      const farine  = c.gluten ? "le mélange fécule-farine de riz" : "la farine T45";
      const temp    = boudoir ? "170" : "180";
      const duree   = boudoir ? "14–16" : "10–12";
      if (c.vegan) {
        return [
          `Réduire l'aquafaba de 30 % à feu doux pour la concentrer. Refroidir complètement.`,
          `Monter l'aquafaba au batteur à vitesse maximale. Incorporer ${sucre} en 3 fois dès que la mousse prend, jusqu'à meringue ferme brillante.`,
          `Incorporer ${farine} tamisée en pluie, en 3 fois, par mouvements enveloppants — ne pas casser la mousse.`,
          `Dresser à la poche (douille lisse 12 mm) en bâtons de ${boudoir ? '12' : '8'} cm sur plaque tapissée.${boudoir ? '' : ' Saupoudrer de sucre glace 2 fois à 5 min d\'intervalle.'}`,
          `Enfourner à ${temp} °C chaleur tournante. Cuire ${duree} min${boudoir ? ' — les boudoirs doivent être fermes et légèrement secs' : ' — la surface doit rester souple mais non collante'}.`,
          `Laisser refroidir sur grille. Conserver dans une boîte hermétique — le biscuit absorbe rapidement l'humidité.`,
        ];
      }
      return [
        `Blanchir les jaunes avec ${sucre} (moitié) au batteur jusqu'au ruban (mélange pâle et triplé de volume).`,
        `Dans une cuve propre, monter les blancs en neige souple, puis incorporer le reste de ${sucre} en 3 fois pour obtenir une meringue ferme et brillante.`,
        `Incorporer délicatement les jaunes blanchis dans la meringue par mouvements enveloppants.`,
        `Ajouter ${farine} tamisée en pluie en 3 fois. Travailler rapidement sans insister — les bords de la cuve en premier.`,
        `Dresser à la poche (douille lisse 12 mm) en bâtons de ${boudoir ? '12' : '8'} cm sur plaque tapissée.${boudoir ? '' : ' Saupoudrer de sucre glace 2 fois à 5 min d\'intervalle.'}`,
        `Enfourner immédiatement à ${temp} °C chaleur tournante, ${duree} min. Ne pas ouvrir le four. Refroidir sur grille.`,
      ];
    }
  },

  /* ----------------------- DACQUOISE ----------------------- */
  dacquoise: {
    label: "Dacquoise",
    description: "Biscuit meringué aux fruits secs, croustillant en surface, moelleux à cœur. Naturellement sans gluten.",
    parfumsCompat: [
      "pate_noisette","pate_amande","pate_pistache","pate_pecan","pate_macadamia","pate_sesame",
      "praline_no","praline_am","praline_pi","praline_pe","praline_se",
      "gianduja","gianduja_lait"
    ],
    formats: {
      disque:  "Disque — dresser en spirale (170 °C, 18 min)",
      feuille: "Feuille — étaler 5 mm (170 °C, 14 min)",
    },

    lines: [
      { role: "blancs", label: "Blancs d'œufs", pct: 40,
        getIngredient: (_p, c) => c.vegan
          ? { nom: "Aquafaba (eau de pois chiche réduite)", note: "Réduire de 30 % avant de monter — essentiel pour la tenue" }
          : { nom: "Blancs d'œufs", note: "À température ambiante, sans trace de gras" }
      },
      { role: "sucrant", label: "Sucre glace", pct: 20,
        getIngredient: (_p, c) => c.igbas
          ? { nom: "Sucre de coco (mixé finement)", note: "Tamiser pour obtenir une poudre fine" }
          : { nom: "Sucre glace", note: "Tamisé — incorporer dans les blancs montés" }
      },
      { role: "parfum", label: "Poudre de fruits secs", pct: 35,
        getIngredient: (p, _c) => ({
          nom: PARFUMS[p].famille === "praline"
            ? PARFUMS[p].label
            : `Poudre de ${PARFUMS[p].label.toLowerCase().replace(/^pâte de |^pâte d'/, '')}`,
          note: PARFUMS[p].famille === "praline"
            ? "Note du concepteur : le praliné contient ~40 % de sucre — réduire le sucre glace de 8 g pour 100 g de poudre si vous recherchez moins de douceur"
            : "Poudre ou pâte pure : mixer finement si nécessaire, tamiser avant incorporation"
        })
      },
      { role: "fecule", label: "Fécule de maïs", pct: 5,
        getIngredient: () => ({ nom: "Fécule de maïs", note: "Tamisée — stabilise la meringue à la cuisson" })
      },
    ],

    process: (p, c) => {
      const poudre  = PARFUMS[p].famille === "praline"
        ? PARFUMS[p].label.toLowerCase()
        : `la poudre de ${PARFUMS[p].label.toLowerCase().replace(/^pâte de |^pâte d'/, '')}`;
      const blancs  = c.vegan ? "l'aquafaba réduite" : "les blancs d'œufs";
      const feuille = c.format === 'feuille';
      const duree   = feuille ? "14" : "18";
      return [
        c.vegan ? `Réduire l'aquafaba de 30 % à feu doux. Refroidir complètement avant de monter.` : `Sortir les blancs 30 min avant — à température ambiante ils montent mieux.`,
        `Monter ${blancs} en neige souple. Incorporer le sucre glace tamisé en 3 fois pour obtenir une meringue ferme et brillante.`,
        `Mélanger ${poudre} avec la fécule tamisée. Incorporer délicatement dans la meringue par mouvements enveloppants.`,
        `${feuille ? 'Étaler à la palette à 5 mm sur papier sulfurisé.' : 'Dresser à la poche (douille lisse 14 mm) en spirale serrée sur gabarit papier.'}`,
        `Saupoudrer légèrement de sucre glace — il fond et forme la croûte craquante caractéristique.`,
        `Enfourner à 170 °C chaleur tournante, ${duree} min. La dacquoise est cuite quand la surface résiste légèrement à la pression du doigt. Refroidir sur grille avant décollage.`,
      ];
    }
  },

  /* ----------------------- FINANCIER ----------------------- */
  financier: {
    label: "Financier",
    description: "Petit gâteau moelleux au beurre noisette, base aux fruits secs. Texture dense et humide, bords caramélisés.",
    parfumsCompat: [
      "pate_noisette","pate_amande","pate_pistache","pate_pecan","pate_macadamia",
      "praline_no","praline_am","praline_pi"
    ],
    formats: {
      mini:  "Mini — moule 5 cm (200 °C, 8 min)",
      grand: "Grand — moule 10×5 cm (180 °C, 12 min)",
    },

    lines: [
      { role: "mg", label: "Beurre noisette", pct: 35,
        getIngredient: (_p, c) => (c.vegan || c.lactose)
          ? { nom: "Huile de noisette ou beurre végétal", note: "Ne pas faire brunir — incorporer tiède (40 °C)" }
          : { nom: "Beurre noisette", note: "Cuire à 160 °C jusqu'à coloration noisette et odeur de noix. Passer au chinois, refroidir à 40 °C avant incorporation" }
      },
      { role: "parfum", label: "Poudre de fruits secs", pct: 22,
        getIngredient: (p, _c) => ({
          nom: PARFUMS[p].famille === "praline"
            ? PARFUMS[p].label
            : `Poudre de ${PARFUMS[p].label.toLowerCase().replace(/^pâte de |^pâte d'/, '')}`,
          note: "Tamisée avec le sucre glace avant incorporation"
        })
      },
      { role: "sucrant", label: "Sucre glace", pct: 25,
        getIngredient: (_p, c) => c.igbas
          ? { nom: "Sucre de coco (mixé fin)", note: "Tamiser finement" }
          : { nom: "Sucre glace", note: "Tamisé avec la poudre de fruits secs" }
      },
      { role: "farine", label: "Farine", pct: 8,
        getIngredient: (_p, c) => c.gluten
          ? { nom: "Fécule de maïs", note: "Version SG — texture légèrement plus fondante" }
          : { nom: "Farine T55", note: "Tamisée avec le sucre et la poudre" }
      },
      { role: "blancs", label: "Blancs d'œufs", pct: 10,
        getIngredient: (_p, c) => c.vegan
          ? { nom: "Aquafaba (eau de pois chiche)", note: "Ne pas monter — utiliser liquide comme les blancs" }
          : { nom: "Blancs d'œufs", note: "Non montés — incorporer liquides à température ambiante" }
      },
    ],

    process: (p, c) => {
      const poudre    = PARFUMS[p].famille === "praline"
        ? PARFUMS[p].label.toLowerCase()
        : `la poudre de ${PARFUMS[p].label.toLowerCase().replace(/^pâte de |^pâte d'/, '')}`;
      const beurre    = (c.vegan || c.lactose) ? "l'huile de noisette" : "le beurre noisette";
      const blancs    = c.vegan ? "l'aquafaba" : "les blancs d'œufs";
      const mini      = c.format === 'mini';
      const temp      = mini ? "200" : "180";
      const duree     = mini ? "8" : "12";
      return [
        (c.vegan || c.lactose)
          ? `Chauffer l'huile de noisette à 40 °C.`
          : `Réaliser le beurre noisette : cuire le beurre à feu moyen jusqu'à coloration dorée et odeur noisette. Passer au chinois, laisser refroidir à 40 °C.`,
        `Mélanger ${poudre} tamisée avec le sucre glace et la farine.`,
        `Incorporer ${blancs} (non montés) en fouettant jusqu'à pâte homogène.`,
        `Verser ${beurre} tiède en filet en mélangeant. La pâte doit être lisse et brillante.`,
        `Laisser reposer 30 min à température ambiante (optionnel mais améliore la tenue).`,
        `Beurrer et fariner les moules${c.vegan ? ' (ou huiler)' : ''}. Remplir aux ¾. Enfourner à ${temp} °C chaleur tournante, ${duree} min. Les bords doivent être dorés, le centre légèrement gonflé. Démouler tiède sur grille.`,
      ];
    }
  },

  /* ----------------------- MADELEINE ----------------------- */
  madeleine: {
    label: "Madeleine",
    description: "Madeleine classique avec bosse obtenue par choc thermique. Mie moelleuse, beurre parfumé, croûte fine.",
    parfumsCompat: ["nature"],

    lines: [
      { role: "mg", label: "Beurre fondu", pct: 35,
        getIngredient: (_p, c) => (c.vegan || c.lactose)
          ? { nom: "Beurre végétal fondu", note: "Faire brunir légèrement si possible pour les notes noisette" }
          : { nom: "Beurre doux fondu", note: "Faire brunir légèrement (beurre noisette léger) puis refroidir à 40 °C" }
      },
      { role: "sucrant", label: "Sucre semoule", pct: 28,
        getIngredient: (_p, c) => c.igbas
          ? { nom: "Sucre de coco" }
          : { nom: "Sucre semoule" }
      },
      { role: "liant", label: "Œufs entiers", pct: 20,
        getIngredient: (_p, c) => c.vegan
          ? { nom: "Aquafaba (eau de pois chiche)", note: "Utiliser non montée, liquide" }
          : { nom: "Œufs entiers", note: "À température ambiante, légèrement battus" }
      },
      { role: "farine", label: "Farine T55", pct: 14,
        getIngredient: (_p, c) => c.gluten
          ? { nom: "Mix sans gluten (50 % fécule de maïs + 50 % farine de riz)", note: "Tamiser — texture légèrement plus dense, la bosse reste présente" }
          : { nom: "Farine T55", note: "Tamisée" }
      },
      { role: "levure", label: "Levure chimique", pct: 1,
        getIngredient: () => ({ nom: "Levure chimique" })
      },
      { role: "parfum_miel", label: "Miel / sirop d'agave", pct: 2,
        getIngredient: (_p, c) => c.vegan
          ? { nom: "Sirop d'agave", note: "Remplace le miel — même rôle hygroscopique pour la conservation" }
          : { nom: "Miel d'acacia", note: "Contribue au moelleux et à la conservation (hygroscopique)" }
      },
    ],

    process: (_p, c) => {
      const beurre = (c.vegan || c.lactose) ? "le beurre végétal" : "le beurre";
      const liant  = c.vegan ? "l'aquafaba" : "les œufs";
      const sucre  = c.igbas ? "le sucre de coco" : "le sucre semoule";
      const farine = c.gluten ? "le mix sans gluten" : "la farine T55";
      const miel   = c.vegan ? "le sirop d'agave" : "le miel";
      return [
        `Faire fondre ${beurre} et le faire légèrement brunir (beurre noisette léger). Refroidir à 40 °C.`,
        `Fouetter ${liant} avec ${sucre} et ${miel} jusqu'à mélange homogène (ne pas faire mousser).`,
        `Incorporer ${farine} tamisée et la levure. Mélanger à la spatule sans insister.`,
        `Verser ${beurre} tiède en filet en mélangeant jusqu'à pâte lisse.`,
        `Filmer au contact. Repos au réfrigérateur minimum 1 h (idéalement 12 h) — le choc thermique chaud/froid crée la bosse.`,
        `Préchauffer le four à 220 °C chaleur tournante. Beurrer et fariner les moules${c.vegan ? ' (ou huiler)' : ''}, réfrigérer les moules garnis 10 min. Enfourner à 220 °C pendant 4 min puis baisser à 180 °C pour 7–8 min. La bosse se forme dans les premières minutes — ne pas ouvrir le four. Démouler tiède sur grille.`,
      ];
    }
  },

  /* ----------------------- CAKE VOYAGE ----------------------- */
  cake_voyage: {
    label: "Cake voyage",
    description: "Cake moelleux longue conservation, texture serrée et humide. La crème assure le moelleux plusieurs jours.",
    parfumsCompat: ["nature"],
    formats: {
      moule_cake:    "Moule à cake — 24×8 cm (170 °C, 45–50 min)",
      mini_bouchee:  "Mini-bouchées — moule silicone (180 °C, 18–20 min)",
    },

    lines: [
      { role: "mg", label: "Beurre pommade", pct: 25,
        getIngredient: (_p, c) => (c.vegan || c.lactose)
          ? { nom: "Beurre végétal pommade (≥ 80 % MG)", note: "À 18–22 °C — même rôle de foisonnement que le beurre" }
          : { nom: "Beurre doux pommade", note: "À 18–22 °C — crémer vigoureusement avec le sucre" }
      },
      { role: "sucrant", label: "Sucre semoule", pct: 22,
        getIngredient: (_p, c) => c.igbas
          ? { nom: "Sucre de coco" }
          : { nom: "Sucre semoule" }
      },
      { role: "liant", label: "Œufs entiers", pct: 25,
        getIngredient: (_p, c) => c.vegan
          ? { nom: "Aquafaba (eau de pois chiche)", note: "Incorporer en 3 fois comme les œufs — si le mélange tranche, ajouter 1 c.s. de farine" }
          : { nom: "Œufs entiers", note: "À température ambiante — incorporer en 3 fois pour éviter de trancher l'appareil" }
      },
      { role: "farine", label: "Farine T55", pct: 20,
        getIngredient: (_p, c) => c.gluten
          ? { nom: "Mix sans gluten (60 % farine de riz + 40 % poudre d'amande)", note: "Tamiser avec la levure" }
          : { nom: "Farine T55", note: "Tamisée avec la levure" },
        pctOverride: (_p, c) => c.gluten ? 23 : 20
      },
      { role: "levure", label: "Levure chimique", pct: 2,
        getIngredient: () => ({ nom: "Levure chimique" })
      },
      { role: "creme", label: "Crème liquide", pct: 6,
        getIngredient: (_p, c) => (c.vegan || c.lactose)
          ? { nom: "Crème de coco (ou crème végétale à fouetter)", note: "Incorporer en dernier — assure le moelleux longue durée" }
          : { nom: "Crème liquide 35 % MG", note: "Incorporer en dernier — assure le moelleux longue durée" },
        pctOverride: (_p, c) => c.gluten ? 3 : 6
      },
    ],

    process: (_p, c) => {
      const beurre = (c.vegan || c.lactose) ? "le beurre végétal" : "le beurre pommade";
      const liant  = c.vegan ? "l'aquafaba" : "les œufs";
      const farine = c.gluten ? "le mix sans gluten" : "la farine T55";
      const creme  = (c.vegan || c.lactose) ? "la crème de coco" : "la crème liquide";
      const sucre  = c.igbas ? "le sucre de coco" : "le sucre semoule";
      const mini   = c.format === 'mini_bouchee';
      const temp   = mini ? "180" : "170";
      const duree  = mini ? "18–20" : "45–50";
      const verif  = mini ? "lame sèche" : "sonde à 90 °C à cœur ou lame sèche";
      return [
        `Crémer ${beurre} avec ${sucre} au batteur (feuille) à vitesse moyenne, 3–4 min, jusqu'à mélange pâle et aéré.`,
        `Incorporer ${liant} en 3 fois — attendre que chaque ajout soit absorbé avant le suivant. Si le mélange tranche légèrement, ajouter 1 c.s. de farine avant le prochain œuf.`,
        `Incorporer ${farine} tamisée avec la levure en 2 fois, à vitesse lente — travailler le minimum pour ne pas développer le gluten.`,
        `Ajouter ${creme} en filet, mélanger à la spatule jusqu'à pâte homogène et brillante.`,
        `${mini ? 'Remplir les moules aux ¾.' : 'Verser dans le moule à cake beurré-fariné. Lisser le dessus, tracer un sillon beurré au centre pour orienter la fissure.'}`,
        `Enfourner à ${temp} °C chaleur tournante, ${duree} min. Vérifier la cuisson : ${verif}. Laisser refroidir 10 min dans le moule, démouler sur grille.`,
      ];
    }
  },

  /* =====================================================================
     FAMILLE 4 — GLACES ET SORBETS
     Indicateurs POD/PAC/MG/MSNG/ES validés par lib/engine_glaces.js
     ===================================================================== */

  glace_lait: {
    label: "Glace au lait",
    description: "Glace à base de lait entier pasteurisée — arôme par infusion, épice ou fleur.",
    famille_texture: "glaces_sorbets",
    parfumsCompat: [
      'vanille','cafe','cafe_grain','the_matcha','the_earl','the_jasmin','the_vert','the_noir','chai',
      'cannelle','cardamome','tonka','gingembre','anis','rose','fleur_oranger',
      'verveine','menthe','lavande','basilic','safran','poivre_t','reglisse','muscade','caramel','nature',
    ],
    lines: [
      // ── Base laitière (1 seule active selon contrainte)
      { label: "Base laitière", dataKey: 'lait_entier', pct: 55,
        actif: (_p, c) => !c.lactose && !c.vegan && !c.bien_etre,
        getIngredient: () => ({ nom: "Lait entier UHT" }) },
      { label: "Base laitière", dataKey: 'boisson_avoine_glace', pct: 55,
        actif: (_p, c) => (c.lactose || c.vegan) && !c.bien_etre,
        getIngredient: () => ({ nom: "Boisson d'avoine non sucrée" }) },
      { label: "Base laitière", dataKey: 'boisson_avoine_glace', pct: 52,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Boisson d'avoine non sucrée" }) },
      // ── Crème
      { label: "Crème", dataKey: 'creme_35', pct: 8,
        actif: (_p, c) => !c.lactose && !c.vegan && !c.bien_etre,
        getIngredient: () => ({ nom: "Crème UHT 35 % MG" }) },
      { label: "Crème", dataKey: 'creme_coco_glace', pct: 12,
        actif: (_p, c) => c.lactose || c.vegan || c.bien_etre,
        getIngredient: () => ({ nom: "Crème de coco 24 % MG" }) },
      // ── MSNG
      { label: "Lait écrémé en poudre", dataKey: 'poudre_lait_0', pct: 4.5,
        actif: (_p, c) => !c.lactose && !c.vegan && !c.bien_etre,
        getIngredient: () => ({ nom: "Lait écrémé en poudre", note: "Disperser à froid avant chauffage" }) },
      { label: "Protéines de pois", dataKey: 'proteines_pois_glace', pct: 2,
        actif: (_p, c) => c.lactose || c.vegan || c.bien_etre,
        getIngredient: () => ({ nom: "Protéines de pois isolées 80 %", note: "Hydrater 12 h avant usage" }) },
      // ── Sucrants classique / SL / vegan
      { label: "Saccharose", dataKey: 'saccharose', pct: 13,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Saccharose" }) },
      { label: "Glucose atomisé DE38", dataKey: 'glucose_de38', pct: 5,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Glucose atomisé DE38", note: "Réduit la cristallisation grossière" }) },
      { label: "Dextrose", dataKey: 'dextrose', pct: 5,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Dextrose (glucose DE 99)", note: "PAC élevé — abaisse le point de congélation" }) },
      // ── Sucrants bien-être
      { label: "Sirop d'érable", dataKey: 'sirop_erable_glace', pct: 12,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Sirop d'érable pur" }) },
      { label: "Sucre de coco", dataKey: 'sucre_coco_glace', pct: 4,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Sucre de fleur de coco" }) },
      { label: "Dextrose", dataKey: 'dextrose', pct: 7,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Dextrose (glucose DE 99)", note: "Obligatoire pour compenser le faible PAC des sucrants bien-être" }) },
      // ── Fibres (bien-être)
      { label: "Psyllium (fibres)", dataKey: null, pct: 1,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Psyllium blond en poudre", note: "Disperser dans la phase froide 10 min avant pasteurisation" }) },
      // ── Infusion / arôme
      { label: "Infusion / arôme", dataKey: null, pct: 2,
        actif: (p) => p !== 'nature',
        getIngredient: (p) => INFUSION_ING[p] || { nom: `Arôme — ${PARFUMS[p]?.label ?? p}` } },
      // ── Stabilisant
      { label: "Stabilisant", dataKey: 'stab_mix_glace', pct: 0.5,
        getIngredient: () => ({ nom: "Stabilisant mix glace", note: "Disperser dans une partie du sucre avant incorporation" }) },
      // ── Eau d'équilibrage (normalisée par l'engine)
      { label: "Eau ajustement", dataKey: 'eau_pure', pct: 7,
        getIngredient: () => ({ nom: "Eau" }) },
    ],
    process: (p, c) => {
      const base   = (c.lactose || c.vegan || c.bien_etre) ? "boisson d'avoine" : "lait entier";
      const creme  = (c.lactose || c.vegan || c.bien_etre) ? "crème de coco" : "crème UHT 35 %";
      const msng   = (!c.lactose && !c.vegan && !c.bien_etre) ? "poudre de lait écrémé" : "protéines de pois";
      const sucres = c.bien_etre ? "sirop d'érable, sucre de coco et dextrose" : "saccharose, glucose DE38 et dextrose";
      const etapes = [];
      const infStep = _infStep(p, base);
      if (infStep) etapes.push(infStep);
      etapes.push(`Mélanger à froid : ${base}, ${creme}, ${msng} et stabilisant (dispersé dans une partie du sucre).`);
      etapes.push(`Incorporer ${sucres}. Chauffer progressivement à 85 °C, maintenir 15 s.`);
      if (['rose','fleur_oranger'].includes(p))
        etapes.push(`Refroidir à +4 °C. Incorporer l'arôme à froid.`);
      else
        etapes.push(`Refroidir rapidement à +4 °C (bain-marie froid ou cellule).`);
      etapes.push(`Maturation : 4–12 h minimum à +4 °C pour hydrater les stabilisants.`);
      etapes.push(`Turbiner jusqu'à texture crémeuse (overrun 20–30 %).`);
      etapes.push(`Durcissement : bac filmé au contact, à −18 °C au moins 2 h avant service.`);
      return etapes;
    },
  },

  glace_creme: {
    label: "Glace à la crème (custard)",
    description: "Glace riche à base de crème et jaunes d'œufs cuits — texture veloutée style crème anglaise.",
    famille_texture: "glaces_sorbets",
    parfumsCompat: [
      'vanille','cafe','cafe_grain','the_matcha','the_earl','the_jasmin','the_vert','the_noir','chai',
      'cannelle','cardamome','tonka','gingembre','anis','rose','fleur_oranger',
      'verveine','menthe','lavande','basilic','safran','poivre_t','reglisse','muscade','caramel','nature',
    ],
    lines: [
      // ── Base laitière
      { label: "Base laitière", dataKey: 'lait_entier', pct: 40,
        actif: (_p, c) => !c.lactose && !c.vegan && !c.bien_etre,
        getIngredient: () => ({ nom: "Lait entier UHT" }) },
      { label: "Base laitière", dataKey: 'boisson_avoine_glace', pct: 42,
        actif: (_p, c) => (c.lactose || c.vegan) && !c.bien_etre,
        getIngredient: () => ({ nom: "Boisson d'avoine non sucrée" }) },
      { label: "Base laitière", dataKey: 'boisson_avoine_glace', pct: 38,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Boisson d'avoine non sucrée" }) },
      // ── Crème
      { label: "Crème", dataKey: 'creme_35', pct: 20,
        actif: (_p, c) => !c.lactose && !c.vegan && !c.bien_etre,
        getIngredient: () => ({ nom: "Crème UHT 35 % MG" }) },
      { label: "Crème", dataKey: 'creme_coco_glace', pct: 22,
        actif: (_p, c) => (c.lactose || c.vegan) && !c.bien_etre,
        getIngredient: () => ({ nom: "Crème de coco 24 % MG" }) },
      { label: "Crème", dataKey: 'creme_coco_glace', pct: 18,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Crème de coco 24 % MG" }) },
      // ── Jaunes d'œufs (inactifs si vegan)
      { label: "Jaunes d'œufs", dataKey: 'jaunes_oeufs', pct: 9,
        actif: (_p, c) => !c.vegan,
        getIngredient: () => ({ nom: "Jaunes d'œufs frais", note: "Tempérer avec le lait chaud avant incorporation — éviter la coagulation" }) },
      // ── MSNG
      { label: "Lait écrémé en poudre", dataKey: 'poudre_lait_0', pct: 4.5,
        actif: (_p, c) => !c.lactose && !c.vegan && !c.bien_etre,
        getIngredient: () => ({ nom: "Lait écrémé en poudre", note: "Disperser à froid avant chauffage" }) },
      { label: "Protéines de pois", dataKey: 'proteines_pois_glace', pct: 2,
        actif: (_p, c) => c.lactose || c.vegan || c.bien_etre,
        pctOverride: (_p, c) => c.vegan ? 4 : 2,
        getIngredient: () => ({ nom: "Protéines de pois isolées 80 %", note: "Hydrater 12 h avant usage" }) },
      // ── Sucrants classique
      { label: "Saccharose", dataKey: 'saccharose', pct: 12,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Saccharose" }) },
      { label: "Glucose atomisé DE38", dataKey: 'glucose_de38', pct: 4,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Glucose atomisé DE38", note: "Réduit la cristallisation" }) },
      { label: "Dextrose", dataKey: 'dextrose', pct: 6,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Dextrose (glucose DE 99)", note: "PAC élevé — point de congélation abaissé" }) },
      // ── Sucrants bien-être
      { label: "Sirop d'érable", dataKey: 'sirop_erable_glace', pct: 12,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Sirop d'érable pur" }) },
      { label: "Sucre de coco", dataKey: 'sucre_coco_glace', pct: 3,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Sucre de fleur de coco" }) },
      { label: "Dextrose", dataKey: 'dextrose', pct: 7,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Dextrose (glucose DE 99)", note: "Obligatoire pour compenser le faible PAC des sucrants bien-être" }) },
      { label: "Psyllium (fibres)", dataKey: null, pct: 1,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Psyllium blond en poudre", note: "Disperser dans la phase froide avant pasteurisation" }) },
      // ── Infusion / arôme
      { label: "Infusion / arôme", dataKey: null, pct: 2,
        actif: (p) => p !== 'nature',
        getIngredient: (p) => INFUSION_ING[p] || { nom: `Arôme — ${PARFUMS[p]?.label ?? p}` } },
      // ── Stabilisant
      { label: "Stabilisant", dataKey: 'stab_mix_glace', pct: 0.4,
        getIngredient: () => ({ nom: "Stabilisant mix glace", note: "Disperser dans une partie du sucre" }) },
      // ── Eau d'équilibrage
      { label: "Eau ajustement", dataKey: 'eau_pure', pct: 2,
        getIngredient: () => ({ nom: "Eau" }) },
    ],
    process: (p, c) => {
      const base    = (c.lactose || c.vegan || c.bien_etre) ? "boisson d'avoine" : "lait entier";
      const creme   = (c.lactose || c.vegan || c.bien_etre) ? "crème de coco" : "crème UHT 35 %";
      const msng    = (!c.lactose && !c.vegan && !c.bien_etre) ? "poudre de lait écrémé" : "protéines de pois";
      const sucres  = c.bien_etre ? "sirop d'érable, sucre de coco et dextrose" : "saccharose, glucose DE38 et dextrose";
      const avecOeufs = !c.vegan;
      const etapes = [];
      const infStep = _infStep(p, base);
      if (infStep) etapes.push(infStep);
      etapes.push(`Mélanger à froid : ${base}, ${creme} et ${msng}. Disperser le stabilisant dans une partie du sucre.`);
      if (avecOeufs) {
        etapes.push(`Blanchir les jaunes d'œufs avec ${sucres}.`);
        etapes.push(`Chauffer ${base} + ${creme} à 70 °C. Tempérer les jaunes en versant le liquide chaud en filet. Remettre à feu doux et cuire à 82 °C en remuant (nappe la cuillère). Ne pas faire bouillir.`);
      } else {
        etapes.push(`Incorporer ${sucres} et les poudres dans le mélange froid. Chauffer à 82 °C en remuant, maintenir 15 s.`);
      }
      if (['rose','fleur_oranger'].includes(p))
        etapes.push(`Refroidir à +4 °C. Incorporer l'arôme à froid.`);
      else
        etapes.push(`Refroidir rapidement à +4 °C.`);
      etapes.push(`Maturation : 8–24 h à +4 °C — développe les arômes et hydrate les stabilisants.`);
      etapes.push(`Turbiner jusqu'à texture crémeuse et veloutée (overrun 15–25 %).`);
      etapes.push(`Durcissement : bac filmé au contact, à −18 °C au moins 4 h avant service.`);
      return etapes;
    },
  },

  glace_chocolat: {
    label: "Glace chocolat",
    description: "Glace intense à base de couverture — MG et MSNG partiellement apportés par le chocolat.",
    famille_texture: "glaces_sorbets",
    parfumsCompat: ['choc_noir','choc_noir64','choc_lait','choc_blanc'],
    lines: [
      // ── Base laitière
      { label: "Base laitière", dataKey: 'lait_entier', pct: 44,
        actif: (_p, c) => !c.lactose && !c.vegan && !c.bien_etre,
        getIngredient: () => ({ nom: "Lait entier UHT" }) },
      { label: "Base laitière", dataKey: 'boisson_avoine_glace', pct: 44,
        actif: (_p, c) => c.lactose || c.vegan || c.bien_etre,
        getIngredient: () => ({ nom: "Boisson d'avoine non sucrée" }) },
      // ── Crème
      { label: "Crème", dataKey: 'creme_35', pct: 12,
        actif: (_p, c) => !c.lactose && !c.vegan && !c.bien_etre,
        getIngredient: () => ({ nom: "Crème UHT 35 % MG" }) },
      { label: "Crème", dataKey: 'creme_coco_glace', pct: 14,
        actif: (_p, c) => c.lactose || c.vegan || c.bien_etre,
        getIngredient: () => ({ nom: "Crème de coco 24 % MG" }) },
      // ── MSNG — réduit pour choc_lait/blanc (couverture apporte déjà beaucoup de MSNG laitière)
      { label: "Lait écrémé en poudre", dataKey: 'poudre_lait_0', pct: 3,
        actif: (_p, c) => !c.lactose && !c.vegan && !c.bien_etre,
        pctOverride: (p) => (p === 'choc_lait' || p === 'choc_blanc') ? 1 : 3,
        getIngredient: () => ({ nom: "Lait écrémé en poudre", note: "Réduit automatiquement pour couverture lait/blanc (MSNG déjà élevée)" }) },
      { label: "Protéines de pois", dataKey: 'proteines_pois_glace', pct: 2,
        actif: (_p, c) => c.lactose || c.vegan || c.bien_etre,
        getIngredient: () => ({ nom: "Protéines de pois isolées 80 %", note: "Hydrater 12 h avant usage" }) },
      // ── Couverture chocolat (dataKey dynamique selon parfum)
      { label: "Couverture chocolat", dataKey: (p) => COUV_DK[p] ?? null, pct: 20,
        getIngredient: (p) => ({
          nom: ({ choc_noir:"Couverture noire 70 %", choc_noir64:"Couverture noire 64 %",
                  choc_lait:"Couverture lait 40 %", choc_blanc:"Couverture blanche 35 %" })[p] ?? PARFUMS[p].label,
          note: "Fondre au bain-marie à 45 °C. Incorporer en filet dans le lait chaud en émulsionnant.",
        }) },
      // ── Sucrants (PAC compensé car pac=0 pour les couvertures)
      { label: "Saccharose", dataKey: 'saccharose', pct: 3,
        getIngredient: () => ({ nom: "Saccharose" }) },
      { label: "Glucose atomisé DE38", dataKey: 'glucose_de38', pct: 3,
        getIngredient: () => ({ nom: "Glucose atomisé DE38" }) },
      { label: "Dextrose", dataKey: 'dextrose', pct: 7,
        getIngredient: () => ({ nom: "Dextrose (glucose DE 99)", note: "PAC élevé — compense le pac=0 de la couverture" }) },
      { label: "Sucre inverti", dataKey: 'sucre_inverti', pct: 4,
        getIngredient: () => ({ nom: "Sucre inverti (Trimoline)", note: "PAC fort + moelleux. Contient 22 % d'eau — ajuster l'eau en conséquence." }) },
      // ── Stabilisant
      { label: "Stabilisant", dataKey: 'stab_mix_glace', pct: 0.5,
        getIngredient: () => ({ nom: "Stabilisant mix glace", note: "Disperser dans le saccharose avant incorporation" }) },
      // ── Eau d'équilibrage
      { label: "Eau ajustement", dataKey: 'eau_pure', pct: 3.5,
        getIngredient: () => ({ nom: "Eau" }) },
    ],
    process: (p, c) => {
      const base  = (c.lactose || c.vegan || c.bien_etre) ? "boisson d'avoine" : "lait entier";
      const creme = (c.lactose || c.vegan || c.bien_etre) ? "crème de coco" : "crème UHT 35 %";
      const msng  = (!c.lactose && !c.vegan && !c.bien_etre) ? "poudre de lait écrémé" : "protéines de pois";
      const couv  = ({ choc_noir:"couverture noire 70 %", choc_noir64:"couverture noire 64 %",
                        choc_lait:"couverture lait 40 %", choc_blanc:"couverture blanche 35 %" })[p] ?? "couverture chocolat";
      return [
        `Fondre la ${couv} au bain-marie à 45 °C (ou micro-ondes par impulsions de 30 s).`,
        `Mélanger à froid : ${base}, ${creme}, ${msng} et stabilisant (dispersé dans le saccharose).`,
        `Chauffer le mélange laitier à 40–45 °C. Incorporer dextrose, glucose et sucre inverti.`,
        `Verser le lait chaud en filet sur la couverture fondue en émulsionnant au mixeur plongeant — obtenir une ganache lisse et brillante.`,
        `Chauffer l'ensemble à 85 °C, maintenir 15 s. Refroidir rapidement à +4 °C.`,
        `Maturation : 4–12 h à +4 °C.`,
        `Turbiner jusqu'à texture crémeuse et intense (overrun cible 15–20 %, dense).`,
        `Durcissement : bac filmé au contact, à −18 °C au moins 2 h avant service.`,
      ];
    },
  },

  sorbet_fruit: {
    label: "Sorbet aux fruits",
    description: "Sorbet sans produit laitier — 50 % purée de fruit, structuré par sucrants et stabilisants.",
    famille_texture: "glaces_sorbets",
    parfumsCompat: [
      'framboise','fraise','cassis','mure','myrtille','groseille','grenade','cerise',
      'abricot','peche','prune','mirabelle',
      'poire','pomme','coing','raisin',
      'mangue','passion','ananas','kiwi','banane','coco','litchi','figue','fpassion_mangue',
      'citron','citron_vert','yuzu','orange','mandarine','pamplemousse','bergamote',
      'rhubarbe','carotte','betterave','potiron','marron',
    ],
    lines: [
      // ── Purée de fruit (dataKey null — sucres naturels non comptabilisés, encart informatif)
      { label: "Purée / pulpe de fruit", dataKey: null, pct: 50,
        getIngredient: (p) => ({
          nom: `Purée de ${PARFUMS[p].label.toLowerCase()}`,
          note: PARFUMS[p].enzyme ? "Pasteuriser à 90 °C 1 min pour inactiver les enzymes (bromélaïne, papaïne…)" : null,
        }) },
      // ── Sucrants classique
      { label: "Saccharose", dataKey: 'saccharose', pct: 14,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Saccharose" }) },
      { label: "Glucose atomisé DE38", dataKey: 'glucose_de38', pct: 8,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Glucose atomisé DE38", note: "Indispensable en sorbet — évite la cristallisation grossière" }) },
      { label: "Dextrose", dataKey: 'dextrose', pct: 3,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Dextrose (glucose DE 99)" }) },
      { label: "Sucre inverti", dataKey: 'sucre_inverti', pct: 3,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Sucre inverti (Trimoline)", note: "Maintient le PAC et retarde la cristallisation" }) },
      // ── Sucrants bien-être
      { label: "Sirop d'érable", dataKey: 'sirop_erable_glace', pct: 12,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Sirop d'érable pur" }) },
      { label: "Sucre de coco", dataKey: 'sucre_coco_glace', pct: 4,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Sucre de fleur de coco" }) },
      { label: "Dextrose", dataKey: 'dextrose', pct: 10,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Dextrose (glucose DE 99)", note: "Indispensable pour le PAC en sorbet bien-être" }) },
      // ── Acidité (sur fruits naturellement peu acides)
      { label: "Acide citrique", dataKey: 'acide_citrique_glace', pct: 0.1,
        actif: (p) => !PARFUMS[p].acide,
        getIngredient: () => ({ nom: "Acide citrique", note: "Stabilise la couleur et le pH sur ce fruit peu acide" }) },
      // ── Stabilisant
      { label: "Stabilisant", dataKey: 'stab_mix_glace', pct: 0.4,
        getIngredient: () => ({ nom: "Stabilisant mix glace", note: "Disperser dans le saccharose. Mix caroube + xanthane 70/30 possible." }) },
      // ── Eau d'équilibrage
      { label: "Eau ajustement", dataKey: 'eau_pure', pct: 22,
        getIngredient: () => ({ nom: "Eau" }) },
    ],
    process: (p, c) => {
      const fruit  = PARFUMS[p].label.toLowerCase();
      const sucres = c.bien_etre
        ? "sirop d'érable, sucre de coco et dextrose"
        : "saccharose, glucose DE38, dextrose et sucre inverti";
      const etapes = [];
      if (PARFUMS[p].enzyme) {
        etapes.push(`Pasteuriser la purée de ${fruit} à 90 °C pendant 1 min pour inactiver les enzymes. Refroidir rapidement.`);
      }
      etapes.push(`Chauffer l'eau avec ${sucres} et le stabilisant (dispersé dans une partie du sucre) à 85 °C. Refroidir à 25–30 °C.`);
      etapes.push(`Incorporer la purée de ${fruit} froide au sirop refroidi. Mélanger soigneusement.`);
      if (!PARFUMS[p].acide) {
        etapes.push(`Ajouter l'acide citrique dissous dans un peu d'eau froide — stabilise couleur et pH.`);
      }
      etapes.push(`Maturation : 2–4 h à +4 °C avant turbinage.`);
      etapes.push(`Turbiner jusqu'à texture lisse et homogène (overrun cible 0–10 %, dense).`);
      etapes.push(`Durcissement : bac filmé au contact, à −18 °C au moins 2 h.`);
      return etapes;
    },
  },

  glace_fruits_secs: {
    label: "Glace fruits secs / pralinés",
    description: "Glace riche à base de praliné ou pâte de fruit sec — MG et POD partiellement apportés par le fruit sec.",
    famille_texture: "glaces_sorbets",
    parfumsCompat: [
      'praline_no','praline_am','praline_pi','praline_pe','praline_se','gianduja','gianduja_lait',
      'pate_noisette','pate_amande','pate_pistache','pate_pecan','pate_macadamia','pate_sesame','pate_cacahuete',
    ],
    lines: [
      // ── Base laitière
      { label: "Base laitière", dataKey: 'lait_entier', pct: 43,
        actif: (_p, c) => !c.lactose && !c.vegan,
        getIngredient: () => ({ nom: "Lait entier UHT" }) },
      { label: "Base laitière", dataKey: 'boisson_avoine_glace', pct: 43,
        actif: (_p, c) => c.lactose || c.vegan,
        getIngredient: () => ({ nom: "Boisson d'avoine non sucrée" }) },
      // ── Crème
      { label: "Crème", dataKey: 'creme_35', pct: 12,
        actif: (_p, c) => !c.lactose && !c.vegan,
        getIngredient: () => ({ nom: "Crème UHT 35 % MG" }) },
      { label: "Crème", dataKey: 'creme_coco_glace', pct: 14,
        actif: (_p, c) => c.lactose || c.vegan,
        getIngredient: () => ({ nom: "Crème de coco 24 % MG" }) },
      // ── MSNG
      { label: "Lait écrémé en poudre", dataKey: 'poudre_lait_0', pct: 5,
        actif: (_p, c) => !c.lactose && !c.vegan,
        getIngredient: () => ({ nom: "Lait écrémé en poudre", note: "Disperser à froid avant chauffage" }) },
      { label: "Protéines de pois", dataKey: 'proteines_pois_glace', pct: 2.5,
        actif: (_p, c) => c.lactose || c.vegan,
        getIngredient: () => ({ nom: "Protéines de pois isolées 80 %", note: "Hydrater 12 h avant usage" }) },
      // ── Praliné ou pâte de fruit sec (dataKey et pct dynamiques)
      { label: "Praliné / pâte de fruit sec", dataKey: (p) => FSEC_DK[p] ?? null, pct: 22,
        pctOverride: (p) => PARFUMS[p].famille === 'fruit_sec' ? 14 : 22,
        getIngredient: (p) => ({
          nom: PARFUMS[p].label,
          note: PARFUMS[p].famille === 'fruit_sec'
            ? "Pâte 100 % — ramollir à 35–40 °C, incorporer en émulsionnant"
            : "Incorporer à 35–40 °C dans la base tiédie",
        }) },
      // ── Sucrants classique
      { label: "Saccharose", dataKey: 'saccharose', pct: 7,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Saccharose" }) },
      { label: "Glucose atomisé DE38", dataKey: 'glucose_de38', pct: 5,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Glucose atomisé DE38" }) },
      { label: "Dextrose", dataKey: 'dextrose', pct: 4,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Dextrose (glucose DE 99)" }) },
      // ── Sucrants bien-être
      { label: "Sirop d'érable", dataKey: 'sirop_erable_glace', pct: 10,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Sirop d'érable pur" }) },
      { label: "Sucre de coco", dataKey: 'sucre_coco_glace', pct: 4,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Sucre de fleur de coco" }) },
      { label: "Dextrose", dataKey: 'dextrose', pct: 6,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Dextrose (glucose DE 99)", note: "Compense le faible PAC des sucrants bien-être" }) },
      // ── Stabilisant
      { label: "Stabilisant", dataKey: 'stab_mix_glace', pct: 0.5,
        getIngredient: () => ({ nom: "Stabilisant mix glace", note: "Disperser dans le sucre avant incorporation" }) },
      // ── Eau d'équilibrage
      { label: "Eau ajustement", dataKey: 'eau_pure', pct: 1.5,
        getIngredient: () => ({ nom: "Eau" }) },
    ],
    process: (p, c) => {
      const base    = (c.lactose || c.vegan) ? "boisson d'avoine" : "lait entier";
      const creme   = (c.lactose || c.vegan) ? "crème de coco" : "crème UHT 35 %";
      const msng    = (!c.lactose && !c.vegan) ? "poudre de lait écrémé" : "protéines de pois";
      const sucres  = c.bien_etre ? "sirop d'érable, sucre de coco et dextrose" : "saccharose, glucose DE38 et dextrose";
      const isPate  = PARFUMS[p].famille === 'fruit_sec';
      const fruit   = PARFUMS[p].label;
      return [
        `Ramollir ${isPate ? 'la pâte de ' + fruit.toLowerCase() : 'le ' + fruit.toLowerCase()} à 35–40 °C au bain-marie jusqu'à consistance crémeuse.`,
        `Mélanger à froid : ${base}, ${creme}, ${msng} et stabilisant (dispersé dans le sucre).`,
        `Incorporer ${sucres}. Chauffer à 60–65 °C.`,
        `Verser le liquide tiède en filet sur ${isPate ? 'la pâte' : 'le praliné'} en émulsionnant au mixeur plongeant — obtenir une préparation lisse.`,
        `Poursuivre la chauffe à 85 °C, maintenir 15 s. Refroidir rapidement à +4 °C.`,
        `Maturation : 4–12 h à +4 °C.`,
        `Turbiner jusqu'à texture crémeuse et riche (overrun cible 15–20 %).`,
        `Durcissement : bac filmé au contact, à −18 °C au moins 2 h avant service.`,
      ];
    },
  },

  /* =====================================================================
     FAMILLE 5 — GLAÇAGES
     Couche extérieure de finition — non comptabilisée dans la masse
     intérieure de l'entremets. Température de coulage critique : cf.
     process() de chaque texture.
     Entremets receveur : −18 °C min (miroirs + rocher), −25 °C (velours).
     Articulation scratchpad : masse glaçage hors masse intérieure ;
     compter dans le poids final et la nutrition pour 100 g si souhaité.
     ===================================================================== */

  /* ----------------------- GLAÇAGE MIROIR NEUTRE ----------------------- */
  glacage_miroir_neutre: {
    label: "Glaçage miroir neutre",
    description: "Glaçage transparent brillant, neutre ou parfumé à la purée de fruit. Coulage à 30–35 °C sur entremets congelé (−18 °C minimum).",
    famille_texture: 'glacages',
    parfumsCompat: [
      'nature',
      'framboise','fraise','cassis','mure','myrtille','groseille','grenade','cerise',
      'abricot','peche','prune','mirabelle',
      'poire','pomme','coing','raisin',
      'mangue','passion','ananas','kiwi','banane','coco','litchi','figue','fpassion_mangue',
      'citron','citron_vert','yuzu','orange','mandarine','pamplemousse','bergamote',
      'rhubarbe','carotte','betterave','potiron','marron',
    ],
    lines: [
      // ── Eau (normalisée par l'engine — absorbe aussi l'eau de gélatine)
      { role: "eau", label: "Eau", pct: 28,
        getIngredient: () => ({ nom: "Eau" }) },
      // ── Sucrant classique / SL / vegan
      { role: "sucrant", label: "Saccharose", pct: 33,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Saccharose" }) },
      // ── Sucrant bien-être (22 % saccharose + 11 % sirop d'érable)
      { role: "sucrant", label: "Saccharose", pct: 22,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Saccharose" }) },
      { role: "sucrant_be", label: "Sirop d'érable", pct: 11,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Sirop d'érable pur", note: "IG ≈ 54 — légère couleur ambrée sur le nappage" }) },
      // ── Anti-cristal
      { role: "anti_cristal", label: "Glucose atomisé DE38", pct: 22,
        getIngredient: () => ({ nom: "Glucose atomisé DE38", note: "Donne brillance et limite la cristallisation au repos" }) },
      // ── Purée de fruit ou eau — toujours active (nature → eau, fruit → purée)
      { role: "puree", label: "Purée de fruit / phase aqueuse", pct: 12,
        getIngredient: (p) => p === 'nature'
          ? { nom: "Eau", note: "Remplace la purée de fruit — nappage transparent sans arôme ajouté" }
          : { nom: `Purée de ${PARFUMS[p].label.toLowerCase()}`,
              note: PARFUMS[p].enzyme ? "Pasteuriser à 90 °C 1 min pour inactiver les enzymes avant usage" : null }
      },
      // ── Gélifiant classique / SL
      { role: "gelifiant", label: "Gélatine 200 Bloom", pct: 1.8,
        actif: (_p, c) => !c.vegan,
        getIngredient: () => ({ nom: "Gélatine (feuilles 200 Bloom)", note: "Hydrater dans eau froide 20 min, essorer, fondre dans le sirop chaud à 60 °C minimum" }) },
      // ── Gélifiant vegan — pectine 325NH95 + agar (2 lignes)
      { role: "gelifiant_v", label: "Pectine 325NH95", pct: 1.2,
        actif: (_p, c) => c.vegan,
        getIngredient: () => ({ nom: "Pectine 325NH95 (amidée)", note: "Mélanger à sec avec le saccharose avant incorporation — activer à 85 °C" }) },
      { role: "gelifiant_v2", label: "Agar-agar", pct: 0.4,
        actif: (_p, c) => c.vegan,
        getIngredient: () => ({ nom: "Agar-agar", note: "Renforce la tenue — bouillir avec la pectine 2 min" }) },
      // ── Nappage brillant
      { role: "nappage", label: "Nappage neutre brillant", pct: 3,
        getIngredient: (_p, c) => c.vegan
          ? { nom: "Nappage neutre vegan (à base de pectine)", note: "Chauffer à 65–70 °C avant incorporation" }
          : { nom: "Nappage neutre brillant", note: "Chauffer à 65–70 °C avant incorporation" } },
      // ── Acide citrique — légèrement dosé selon version
      { role: "acide", label: "Acide citrique", pct: 0.1,
        actif: (_p, c) => !c.vegan,
        getIngredient: () => ({ nom: "Acide citrique", note: "Renforce l'arôme fruit et stabilise le pH" }) },
      { role: "acide", label: "Acide citrique", pct: 0.2,
        actif: (_p, c) => c.vegan,
        getIngredient: () => ({ nom: "Acide citrique", note: "Dose légèrement supérieure pour compenser l'absence de gélatine" }) },
    ],
    process: (p, c) => {
      const base = p === 'nature' ? "l'eau" : `la purée de ${PARFUMS[p].label.toLowerCase()}`;
      const sucrant = c.bien_etre ? "le saccharose et le sirop d'érable" : "le saccharose";
      const etapes = [];
      if (c.vegan) {
        etapes.push(`Mélanger à sec : pectine 325NH95, agar et une cuillerée de saccharose. Réserver.`);
      } else {
        etapes.push(`Hydrater la gélatine dans eau froide 20 min, essorer.`);
      }
      etapes.push(`Chauffer ${base} avec ${sucrant} et le glucose à 50 °C en fouettant.`);
      if (c.vegan) {
        etapes.push(`Verser le mélange pectine-sucre en pluie. Porter à ébullition, maintenir 2 min en fouettant.`);
      } else {
        etapes.push(`Porter à ébullition, maintenir 30 s. Hors feu, incorporer la gélatine essorée. Mixer 30 s.`);
      }
      etapes.push(`Ajouter l'acide citrique + le nappage neutre (chauffé à 70 °C). Mixer 15 s.`);
      etapes.push(`Laisser refroidir à 30–35 °C en remuant régulièrement. Indice : le glaçage nappe la spatule proprement sans filandre.`);
      etapes.push(`Couler en pluie ou au seau sur entremets surgelé à cœur (−18 °C minimum). Un seul passage — ne pas repasser la spatule. Égoutter 30 s avant de poser sur le carton.`);
      if (c.vegan) {
        etapes.push(`Conservation : la pectine NH est thermoréversible — réchauffer à 60 °C si le glaçage a pris, refroidir à 32 °C avant de recouler.`);
      }
      return etapes;
    },
  },

  /* ----------------------- GLAÇAGE MIROIR CACAO ----------------------- */
  glacage_miroir_cacao: {
    label: "Glaçage miroir cacao",
    description: "Glaçage brillant noir au cacao en poudre, sans couverture. Coulage à 35 °C sur entremets congelé (−18 °C minimum).",
    famille_texture: 'glacages',
    parfumsCompat: ['nature'],
    lines: [
      // ── Eau (normalisée — absorbe l'eau de gélatine et le petit delta de calcul)
      { role: "eau", label: "Eau", pct: 20,
        getIngredient: () => ({ nom: "Eau" }) },
      // ── Sucrant classique / SL / vegan
      { role: "sucrant", label: "Saccharose", pct: 25,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Saccharose" }) },
      // ── Sucrant bien-être (18 % saccharose + 7 % sucre fleur de coco)
      { role: "sucrant", label: "Saccharose", pct: 18,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Saccharose" }) },
      { role: "sucrant_be", label: "Sucre de fleur de coco", pct: 7,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Sucre de fleur de coco", note: "IG ≈ 35 — légère note caramélisée compatible avec le cacao" }) },
      // ── Anti-cristal
      { role: "anti_cristal", label: "Glucose atomisé DE38", pct: 25,
        getIngredient: () => ({ nom: "Glucose atomisé DE38", note: "Donne brillance et limite la cristallisation" }) },
      // ── Phase crémeuse — bien-être remplace laitier par coco
      { role: "mg_aq", label: "Phase crémeuse", pct: 13,
        actif: (_p, c) => !c.lactose && !c.vegan && !c.bien_etre,
        getIngredient: () => ({ nom: "Crème UHT 35 % MG", note: "Chauffer séparément à 70 °C avant incorporation" }) },
      { role: "mg_aq", label: "Phase crémeuse", pct: 13,
        actif: (_p, c) => c.lactose || c.vegan || c.bien_etre,
        getIngredient: () => ({ nom: "Lait de coco entier", note: "Chauffer à 70 °C avant incorporation — bien agiter la boîte avant usage" }) },
      // ── Cacao
      { role: "cacao", label: "Cacao en poudre 100 %", pct: 8,
        getIngredient: () => ({ nom: "Cacao en poudre 100 % non sucré", note: "Tamiser avant incorporation pour éviter les grumeaux" }) },
      // ── Gélifiant classique / SL
      { role: "gelifiant", label: "Gélatine 200 Bloom", pct: 1.5,
        actif: (_p, c) => !c.vegan,
        getIngredient: () => ({ nom: "Gélatine (feuilles 200 Bloom)", note: "Hydrater dans eau froide 20 min, essorer" }) },
      // ── Gélifiant vegan — pectine 325NH95 + agar
      { role: "gelifiant_v", label: "Pectine 325NH95", pct: 1.2,
        actif: (_p, c) => c.vegan,
        getIngredient: () => ({ nom: "Pectine 325NH95 (amidée)", note: "Mélanger à sec avec le saccharose avant dispersion" }) },
      { role: "gelifiant_v2", label: "Agar-agar", pct: 0.3,
        actif: (_p, c) => c.vegan,
        getIngredient: () => ({ nom: "Agar-agar", note: "Bouillir avec la pectine 2 min" }) },
    ],
    process: (_p, c) => {
      const creme = (c.lactose || c.vegan || c.bien_etre) ? "lait de coco" : "crème UHT 35 %";
      const sucrant = c.bien_etre ? "saccharose + sucre de fleur de coco" : "saccharose";
      const etapes = [];
      if (c.vegan) {
        etapes.push(`Mélanger à sec : pectine 325NH95, agar et une cuillerée de saccharose.`);
      } else {
        etapes.push(`Hydrater la gélatine dans eau froide 20 min, essorer.`);
      }
      etapes.push(`Chauffer l'eau avec ${sucrant} et le glucose à 60 °C.`);
      etapes.push(`Tamiser le cacao en poudre en pluie en fouettant. Porter à frémissement (85–90 °C), cuire 2 min.`);
      etapes.push(`Incorporer ${creme} chaud (70 °C) en remuant.`);
      if (c.vegan) {
        etapes.push(`Verser le mélange pectine-sucre en fouettant. Porter à ébullition, maintenir 2 min.`);
      } else {
        etapes.push(`Incorporer la gélatine essorée hors feu. Mixer au mixeur plongeant 2 min.`);
      }
      etapes.push(`Passer au chinois fin. Laisser refroidir à 35 °C en remuant régulièrement.`);
      etapes.push(`Indice : napper la spatule sans grain de cacao visible. Couler à 35 °C sur entremets surgelé à cœur (−18 °C minimum). Ne pas lisser après pose — la surface s'opacifie en refroidissant.`);
      return etapes;
    },
  },

  /* ----------------------- GLAÇAGE MIROIR CHOCOLAT ----------------------- */
  glacage_miroir_chocolat: {
    label: "Glaçage miroir chocolat",
    description: "Glaçage brillant opaque avec couverture et lait concentré. Peut être coloré. Coulage à 30–32 °C (blanc/lait/blond) ou 32–34 °C (noir).",
    famille_texture: 'glacages',
    parfumsCompat: ['choc_blanc', 'choc_lait', 'choc_noir', 'choc_noir64', 'choc_blond'],
    lines: [
      // ── Eau (normalisée — représente ~13 % eau libre + eau gélatine)
      { role: "eau", label: "Eau", pct: 13,
        getIngredient: () => ({ nom: "Eau" }) },
      // ── Sucrant classique / SL / vegan
      { role: "sucrant", label: "Saccharose", pct: 22,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Saccharose" }) },
      // ── Sucrant bien-être (15 % saccharose + 7 % sucre fleur de coco)
      { role: "sucrant", label: "Saccharose", pct: 15,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Saccharose" }) },
      { role: "sucrant_be", label: "Sucre de fleur de coco", pct: 7,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Sucre de fleur de coco" }) },
      // ── Anti-cristal
      { role: "anti_cristal", label: "Glucose atomisé DE38", pct: 22,
        getIngredient: () => ({ nom: "Glucose atomisé DE38" }) },
      // ── Opacifiant laitier classique
      { role: "opacifiant", label: "Lait concentré sucré", pct: 13,
        actif: (_p, c) => !c.lactose && !c.vegan && !c.bien_etre,
        getIngredient: () => ({ nom: "Lait concentré sucré", note: "Apporte opacité et brillance — ne pas substituer par du lait entier sucré" }) },
      // ── Opacifiant végétal (SL / vegan / bien-être)
      { role: "opacifiant", label: "Concentré végétal", pct: 13,
        actif: (_p, c) => c.lactose || c.vegan || c.bien_etre,
        getIngredient: (_p, c) => c.bien_etre
          ? { nom: "Crème de cajou mixée (100 g cajous + 50 ml eau)", note: "Mixer cajous trempés 8 h — texture crémeuse et neutre" }
          : { nom: "Lait de coco concentré (réduit 1/2)", note: "Réduire lait de coco entier de moitié à feu doux — remplace le lait concentré sucré" } },
      // ── Couverture (dynamique selon parfum)
      { role: "couverture", label: "Couverture chocolat", pct: 22,
        getIngredient: (p, c) => {
          const noms = {
            choc_blanc:  "Couverture blanche 35 %",
            choc_lait:   "Couverture lait 40 %",
            choc_noir:   "Couverture noire 70 %",
            choc_noir64: "Couverture noire 64 %",
            choc_blond:  "Couverture blond caramélisé",
          };
          const nom = noms[p] ?? "Couverture chocolat";
          return {
            nom: (c.vegan || c.lactose) ? `${nom} (version sans lait)` : nom,
            note: "Hacher finement, fondre au bain-marie à 45 °C"
          };
        }
      },
      // ── Gélifiant classique / SL
      { role: "gelifiant", label: "Gélatine 200 Bloom", pct: 1.5,
        actif: (_p, c) => !c.vegan,
        getIngredient: () => ({ nom: "Gélatine (feuilles 200 Bloom)", note: "Hydrater dans eau froide 20 min, essorer" }) },
      // ── Gélifiant vegan — pectine X58 (gélifie au contact du calcium de la couverture)
      { role: "gelifiant_v", label: "Gélifiant vegan (pectine X58)", pct: 1.2,
        actif: (_p, c) => c.vegan,
        getIngredient: () => ({ nom: "Pectine X58 + lactate de calcium (3:1)", note: "X58 gélifie au contact du calcium — ajouter 0,3 % de lactate de calcium si couverture noire ou blanche vegan (peu de calcium naturel)" }) },
    ],
    process: (p, c) => {
      const noms = {
        choc_blanc:  "couverture blanche 35 %",
        choc_lait:   "couverture lait 40 %",
        choc_noir:   "couverture noire 70 %",
        choc_noir64: "couverture noire 64 %",
        choc_blond:  "couverture blond caramélisé",
      };
      const couv = noms[p] ?? "couverture chocolat";
      const tempCoulage = (p === 'choc_noir' || p === 'choc_noir64') ? "32–34" : "30–32";
      const opacifiant = (c.lactose || c.vegan || c.bien_etre) ? "le concentré végétal" : "le lait concentré sucré";
      const sucrant = c.bien_etre ? "saccharose + sucre de coco" : "saccharose";
      const etapes = [];
      if (c.vegan) {
        etapes.push(`Disperser la pectine X58 dans le saccharose. Dissoudre le lactate de calcium dans l'eau froide (si couverture noire ou blanche vegan).`);
      } else {
        etapes.push(`Hydrater la gélatine dans eau froide 20 min, essorer.`);
      }
      etapes.push(`Chauffer l'eau avec ${sucrant} et le glucose à 103 °C (sirop dense).`);
      etapes.push(`Hors feu : incorporer ${opacifiant}, puis ${c.vegan ? "le mélange pectine-sucre" : "la gélatine essorée"}. Mixer 30 s.`);
      etapes.push(`Verser en 3 fois sur la ${couv} hachée et fondue à 45 °C en décrivant des cercles serrés au mixeur plongeant — émulsion complète, aucun grain visible.`);
      etapes.push(`Colorant liposoluble (optionnel) : incorporer qs (0,5–2 %) dans le glaçage à 45 °C avant refroidissement, bien mixer.`);
      etapes.push(`Laisser refroidir à ${tempCoulage} °C en remuant régulièrement. Indice : le glaçage coule lentement sur la spatule sans filandre.`);
      etapes.push(`Couler en pluie sur entremets surgelé à cœur (−18 °C minimum). Égoutter 30 s avant de poser sur le carton.`);
      etapes.push(`Conservation : 5 jours à +4 °C sous film. Réchauffer au bain-marie à 35 °C, laisser redescendre à la température de coulage avant réemploi.`);
      return etapes;
    },
  },

  /* ----------------------- GLAÇAGE ROCHER ----------------------- */
  glacage_rocher: {
    label: "Glaçage rocher",
    description: "Glaçage craquant chocolat-huile-éclats. Surface mate, son sec à la fourchette. Coulage à 38–40 °C sur entremets congelé (−18 °C minimum).",
    famille_texture: 'glacages',
    parfumsCompat: ['choc_noir', 'choc_noir64', 'choc_lait', 'choc_blond', 'praline_no', 'praline_am', 'praline_pi', 'praline_pe'],
    lines: [
      // ── Couverture — type selon parfum, pct adapté à la présence du praliné
      { role: "couverture", label: "Couverture chocolat", pct: 50,
        pctOverride: (p) => PARFUMS[p].famille === 'praline' ? 50 : 65,
        getIngredient: (p, c) => {
          const famille = PARFUMS[p].famille;
          let nom;
          if (famille === 'praline') {
            nom = p === 'praline_pi'
              ? "Couverture blanche 35 %"
              : p === 'praline_pe' ? "Couverture noire 64 %"
              : "Couverture lait 40 %";
          } else {
            const noms = {
              choc_noir:   "Couverture noire 70 %",
              choc_noir64: "Couverture noire 64 %",
              choc_lait:   "Couverture lait 40 %",
              choc_blond:  "Couverture blond caramélisé",
            };
            nom = noms[p] ?? "Couverture chocolat";
          }
          return {
            nom: (c.vegan || c.lactose) ? `${nom} (version sans lait)` : nom,
            note: "Fondre au bain-marie à 45 °C"
          };
        }
      },
      // ── Huile neutre désodorisée
      { role: "huile", label: "Huile neutre désodorisée", pct: 20,
        getIngredient: () => ({ nom: "Huile de pépin de raisin ou tournesol désodorisée", note: "Neutre en goût — ne jamais utiliser d'huile d'olive ni d'huile aromatisée" }) },
      // ── Beurre de cacao
      { role: "mg_cristal", label: "Beurre de cacao", pct: 5,
        getIngredient: () => ({ nom: "Beurre de cacao", note: "Fond à 40 °C — favorise la cristallisation rapide et le son sec caractéristique" }) },
      // ── Praliné fluide (actif seulement si parfum = famille praliné)
      { role: "praline", label: "Praliné fluide", pct: 15,
        actif: (p) => PARFUMS[p].famille === 'praline',
        getIngredient: (p) => ({
          nom: PARFUMS[p].label,
          note: "À 22–24 °C — mélanger avant usage pour homogénéiser les matières grasses"
        })
      },
      // ── Éclats croustillants — riz soufflé pour SL / vegan / bien-être
      { role: "eclats", label: "Éclats croustillants", pct: 10,
        getIngredient: (_p, c) => (c.lactose || c.vegan || c.bien_etre)
          ? { nom: "Riz soufflé caramélisé", note: "Sans lactose — caraméliser au four 150 °C 10 min avec un peu de sucre de coco" }
          : { nom: "Noisettes torréfiées concassées (ou feuilletine en version sans praliné)", note: "Torréfier à 150 °C 12 min, concasser grossièrement avant incorporation" }
      },
    ],
    process: (p, c) => {
      const famille = PARFUMS[p].famille;
      const couv = famille === 'praline'
        ? (p === 'praline_pi' ? "couverture blanche 35 %" : p === 'praline_pe' ? "couverture noire 64 %" : "couverture lait 40 %")
        : ({ choc_noir:"couverture noire 70 %", choc_noir64:"couverture noire 64 %", choc_lait:"couverture lait 40 %", choc_blond:"couverture blond" })[p] ?? "couverture";
      const eclats = (c.lactose || c.vegan || c.bien_etre) ? "riz soufflé caramélisé" : "noisettes torréfiées concassées";
      return [
        `Fondre la ${couv} + beurre de cacao au bain-marie à 45 °C. Incorporer l'huile en filet en fouettant — la préparation doit être lisse et fluide.`,
        ...(famille === 'praline' ? [`Incorporer ${PARFUMS[p].label.toLowerCase()} à 22–24 °C en remuant. Ne pas dépasser 40 °C — risque de séparation des matières grasses.`] : []),
        `Laisser refroidir à 38–40 °C. Indice : fluide mais légèrement plus épais que l'eau, coule en filet fin.`,
        `Incorporer les ${eclats} à la spatule en dernier — préserver les éclats, ne pas trop travailler.`,
        `Couler ou tremper sur entremets surgelé à cœur (−18 °C minimum). Le rocher cristallise en 30–45 s — tenir l'entremets immobile jusqu'à prise complète.`,
        `Égoutter 1 min. Poser sur carton. Indice de qualité : surface mate, son sec et franc à la fourchette. Conserver sous +20 °C.`,
      ];
    },
  },

  /* ----------------------- VELOURS PISTOLET ----------------------- */
  velours_pistolet: {
    label: "Velours pistolet",
    description: "Mélange couverture-beurre de cacao à pulvériser. Effet mat pelliculaire sur entremets à −25 °C minimum. Finition exclusivement esthétique.",
    famille_texture: 'glacages',
    parfumsCompat: ['choc_blanc', 'choc_lait', 'choc_noir', 'choc_noir64', 'choc_blond', 'choc_ruby'],
    lines: [
      // ── Couverture (porte le parfum et la couleur — 60 % de la formule)
      { role: "couverture", label: "Couverture chocolat", pct: 60,
        getIngredient: (p, c) => {
          const noms = {
            choc_blanc:  "Couverture blanche 35 %",
            choc_lait:   "Couverture lait 40 %",
            choc_noir:   "Couverture noire 70 %",
            choc_noir64: "Couverture noire 64 %",
            choc_blond:  "Couverture blond caramélisé",
            choc_ruby:   "Couverture ruby",
          };
          const nom = noms[p] ?? "Couverture chocolat";
          return {
            nom: (c.vegan || c.lactose) ? `${nom} (version sans lait)` : nom,
            note: "Fondre au bain-marie à 45 °C séparément du beurre de cacao"
          };
        }
      },
      // ── Beurre de cacao (40 % — donne la fluidité et l'effet pelliculaire)
      { role: "mg_cristal", label: "Beurre de cacao", pct: 40,
        getIngredient: () => ({ nom: "Beurre de cacao", note: "Fondre à 45 °C séparément — mélanger à la couverture fondue juste avant usage" }) },
    ],
    process: (p, _c) => {
      const noms = {
        choc_blanc:  "couverture blanche 35 %",
        choc_lait:   "couverture lait 40 %",
        choc_noir:   "couverture noire 70 %",
        choc_noir64: "couverture noire 64 %",
        choc_blond:  "couverture blond caramélisé",
        choc_ruby:   "couverture ruby",
      };
      const couv = noms[p] ?? "couverture";
      return [
        `⚙️ Équipement requis : pistolet alimentaire à buse large chauffé (Wagner W550/W690 ou Sata HVLP). Préchauffer la buse 5–10 min. Travailler en espace confiné ou cabine.`,
        `Fondre séparément la ${couv} à 45 °C et le beurre de cacao à 45 °C. Mélanger. Mixer 30 s au mixeur plongeant.`,
        `Colorant liposoluble (optionnel) : incorporer qs (0,5–2 %) dans le mélange à 45 °C — bien mixer avant de verser dans le pistolet.`,
        `Maintenir le mélange à 38–40 °C dans le pistolet pendant le travail (bain-marie chauffant ou gobelet double-paroi).`,
        `Sortir l'entremets du surgélateur : −25 °C minimum obligatoire pour l'effet pelliculaire mat optimal. Au-dessus de −18 °C, le velours ne forme pas de pellicule correcte.`,
        `Pulvériser à 25–30 cm de distance en mouvements circulaires réguliers. Deux couches légères valent mieux qu'une épaisse — évite les coulures et l'effet peau d'orange.`,
        `Indice de qualité : voile mat uniforme, aspect velouté homogène sans grain visible. Remettre au froid immédiatement. Service à +4 °C.`,
        `Note : le profil bien-être ne s'applique pas à cette texture — finition exclusivement esthétique, sans contribution aromatique significative.`,
      ];
    },
  },

  /* =====================================================================
     FAMILLE 6 — INSERTS
     Couches intérieures d'un entremets — coulées en cadre et surgelées
     avant détaillage. Épaisseur : cf. process() de chaque texture.
     Surgélation obligatoire avant découpe pour les 4 textures.
     ===================================================================== */

  /* ─────────────────────── CONFIT DE FRUIT ─────────────────────── */
  confit_fruit: {
    label: "Confit de fruit",
    description: "Confit tendre à base de purée de fruit, pectine NH amidée et gélatine (ou pectine 325NH95 + agar vegan) — fond en bouche, tenue à la coupe grâce à la gélification double.",
    famille_texture: 'inserts',
    parfumsCompat: [
      'framboise','fraise','cassis','mure','myrtille','groseille','grenade','cerise',
      'abricot','peche','prune','mirabelle',
      'poire','pomme','coing','raisin',
      'mangue','passion','ananas','kiwi','banane','coco','litchi','figue','fpassion_mangue',
      'citron','citron_vert','yuzu','orange','mandarine','pamplemousse','bergamote',
      'rhubarbe','carotte','betterave','potiron','marron',
    ],
    lines: [
      { role: "eau", label: "Eau",
        pct: 4,
        getIngredient: () => ({ nom: "Eau" }) },
      { role: "puree", label: "Purée de fruit",
        pct: 60,
        getIngredient: (p) => ({
          nom: `Purée de ${PARFUMS[p].label.toLowerCase()}`,
          note: PARFUMS[p].enzyme
            ? "Pasteuriser à 90 °C 1 min pour inactiver les enzymes avant d'incorporer la pectine"
            : null,
        }) },
      { role: "sucrant", label: "Saccharose",
        pct: 25,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Saccharose" }) },
      { role: "sucrant_be", label: "Saccharose (réduit)",
        pct: 14,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Saccharose", note: "Dose réduite au profit de la pâte de dattes" }) },
      { role: "sucrant_be2", label: "Pâte de dattes",
        pct: 11,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Pâte de dattes 100 %", note: "IG ≈ 42 — apporte du fondant et une note caramélisée légère" }) },
      { role: "glucose", label: "Glucose atomisé DE38",
        pct: 8,
        getIngredient: () => ({ nom: "Glucose atomisé DE38", note: "Limite la cristallisation et améliore le brillant en coupe" }) },
      { role: "gelifiant1", label: "Pectine NH amidée",
        pct: 1.2,
        getIngredient: () => ({ nom: "Pectine NH amidée (thermoréversible)", note: "Mélanger à sec avec une part du saccharose — incorporer en pluie dans la purée chauffée à 40 °C" }) },
      { role: "gelifiant2", label: "Gélatine 200 Bloom",
        pct: 1.0,
        actif: (_p, c) => !c.vegan,
        getIngredient: () => ({ nom: "Gélatine (feuilles 200 Bloom)", note: "Hydrater dans eau froide 20 min, essorer, incorporer hors feu à 65 °C" }) },
      { role: "gelifiant2_v", label: "Pectine 325NH95",
        pct: 0.5,
        actif: (_p, c) => c.vegan,
        getIngredient: () => ({ nom: "Pectine 325NH95 (amidée vegan)", note: "Mélanger à sec avec la pectine NH — activer ensemble à 85 °C" }) },
      { role: "gelifiant3_v", label: "Agar-agar",
        pct: 0.2,
        actif: (_p, c) => c.vegan,
        getIngredient: () => ({ nom: "Agar-agar", note: "Renforce la tenue — bouillir 2 min avec la pectine 325NH95" }) },
      { role: "acide", label: "Jus de citron",
        pct: 1.0,
        getIngredient: () => ({ nom: "Jus de citron frais", note: "Incorporer en fin de cuisson — active la pectine et équilibre le sucré" }) },
    ],
    process: (p, c) => {
      const fruit     = PARFUMS[p].label.toLowerCase();
      const gelifiant = c.vegan
        ? "la pectine 325NH95 + l'agar-agar mélangés à sec"
        : "les feuilles de gélatine essorées";
      const sucrant = c.bien_etre ? "le saccharose réduit + la pâte de dattes" : "le saccharose";
      return [
        `Mélanger à sec la pectine NH amidée avec une partie du saccharose (env. 20 g).`,
        `Chauffer la purée de ${fruit} + l'eau à 40 °C. Verser la pectine sucrée en pluie sans cesser de remuer. Porter à ébullition 2 min.`,
        `Ajouter le glucose atomisé et ${sucrant}. Cuire à 103 °C (Brix cible : 55–65 °Brix — vérifier au réfractomètre).`,
        `Hors feu, incorporer ${gelifiant}${c.vegan ? " actionnés préalablement à 85 °C" : ""}. Ajouter le jus de citron frais.`,
        `Couler immédiatement en cadre inox 5–10 mm d'épaisseur sur feuille guitare. Lisser à la spatule coudée.`,
        `Laisser refroidir à +4 °C jusqu'à gélification complète (30–45 min). Surgeler 4 h minimum. Détailler impérativement surgelé.`,
        `Indice de qualité : surface brillante, coupe nette sans déchirure, texture fondante et fruitée en bouche.`,
      ];
    },
  },

  /* ─────────────────────── GELÉE FRUIT PÂTISSIÈRE ─────────────────────── */
  gelee_fruit_pate: {
    label: "Gelée de fruit pâtissière",
    description: "Gelée ferme à haute teneur en fruit et forte réduction sucrée, pectine jaune slow-set ou 325NH95 (vegan) — texture tranchable, brillante, à couler en cadre 8–10 mm.",
    famille_texture: 'inserts',
    parfumsCompat: [
      'framboise','fraise','cassis','mure','myrtille','groseille','grenade','cerise',
      'abricot','peche','prune','mirabelle',
      'poire','pomme','coing','raisin',
      'mangue','passion','ananas','kiwi','banane','coco','litchi','figue','fpassion_mangue',
      'citron','citron_vert','yuzu','orange','mandarine','pamplemousse','bergamote',
      'rhubarbe','carotte','betterave','potiron','marron',
    ],
    lines: [
      { role: "eau", label: "Eau",
        pct: 6,
        getIngredient: () => ({ nom: "Eau" }) },
      { role: "puree", label: "Purée de fruit",
        pct: 50,
        getIngredient: (p) => ({
          nom: `Purée de ${PARFUMS[p].label.toLowerCase()}`,
          note: PARFUMS[p].enzyme
            ? "Pasteuriser à 90 °C 1 min pour inactiver les enzymes avant d'incorporer la pectine"
            : null,
        }) },
      { role: "sucrant", label: "Saccharose",
        pct: 30,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Saccharose" }) },
      { role: "sucrant_be", label: "Saccharose (réduit)",
        pct: 18,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Saccharose", note: "Dose réduite — la pâte de dattes assure le fondant" }) },
      { role: "sucrant_be2", label: "Pâte de dattes",
        pct: 12,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Pâte de dattes 100 %", note: "IG ≈ 42 — texture plus dense que le saccharose pur, préfiltrer si nécessaire" }) },
      { role: "glucose", label: "Glucose DE38",
        pct: 12,
        getIngredient: () => ({ nom: "Glucose atomisé DE38", note: "Évite la re-cristallisation lors de la cuisson à haute teneur en sucre" }) },
      { role: "gelifiant", label: "Pectine jaune slow-set",
        pct: 1.5,
        actif: (_p, c) => !c.vegan,
        getIngredient: () => ({ nom: "Pectine jaune slow-set (LM ou HM selon cible Brix)", note: "Mélanger à sec avec 10 % du saccharose total — incorporer en pluie à 40 °C. Activer à ébullition 2 min" }) },
      { role: "gelifiant_v", label: "Pectine 325NH95",
        pct: 1.8,
        actif: (_p, c) => c.vegan,
        getIngredient: () => ({ nom: "Pectine 325NH95 (amidée — vegan)", note: "Dose supérieure à la jaune — mélanger à sec avec le sucre, incorporer en pluie à 40 °C" }) },
      { role: "acidite", label: "Acide tartrique",
        pct: 0.5,
        pctOverride: (p) => PARFUMS[p]?.peu_acide_ph ? 0.8 : 0.5,
        getIngredient: () => ({ nom: "Acide tartrique en solution (50/50 eau)", note: "Diluer dans quelques gouttes d'eau froide — incorporer hors feu juste avant coulage pour déclencher la gélification" }) },
    ],
    process: (p, c) => {
      const fruit     = PARFUMS[p].label.toLowerCase();
      const gelifiant = c.vegan ? "la pectine 325NH95" : "la pectine jaune slow-set";
      const sucrant   = c.bien_etre ? "le saccharose réduit + la pâte de dattes" : "le saccharose";
      const acideDose = PARFUMS[p]?.peu_acide_ph ? "0,8 %" : "0,5 %";
      return [
        `Mélanger à sec ${gelifiant} avec 10 % du saccharose total.`,
        `Chauffer la purée de ${fruit} + l'eau à 40 °C. Incorporer en pluie le mélange pectine-sucre sans cesser de remuer. Porter à ébullition 2 min.`,
        `Ajouter le glucose atomisé et ${sucrant}. Cuire à 106–108 °C (Brix cible : 75–78 °Brix — contrôle réfractomètre obligatoire).`,
        `Hors feu, incorporer l'acide tartrique en solution (${acideDose}) dilué dans quelques gouttes d'eau froide. Mélanger rapidement — la gélification s'amorce dans les minutes suivantes.`,
        `Couler immédiatement en cadre inox 8–10 mm sur feuille guitare. Lisser à la spatule coudée. Ne pas déplacer avant gélification.`,
        `Laisser cristalliser à température ambiante 12 h minimum (ou 4 h + surgélation 2 h). Détailler impérativement surgelé à la forme souhaitée.`,
        `Indice de qualité : surface brillante, coupe nette, texture ferme mais fondante en bouche — l'insert tient à la découpe sans s'écraser.`,
      ];
    },
  },

  /* ─────────────────────── GANACHE INSERT ─────────────────────── */
  ganache_insert: {
    label: "Ganache insert",
    description: "Ganache fondante pour insert — couverture chocolat ou praliné émulsionné avec crème (ou lait de coco), coulée en cadre 6–8 mm et surgelée avant détaillage.",
    famille_texture: 'inserts',
    parfumsCompat: [
      'choc_noir','choc_noir64','choc_lait','choc_blanc','choc_blond','choc_ruby',
      'praline_no','praline_am','praline_pi','praline_pe','praline_se',
      'gianduja','gianduja_lait',
      'pate_noisette','pate_amande','pate_pistache','pate_pecan',
      'pate_macadamia','pate_sesame','pate_cacahuete',
    ],
    lines: [
      { role: "liquide", label: "Crème UHT 35 %",
        pct: 40,
        actif: (_p, c) => !c.lactose && !c.vegan && !c.bien_etre,
        getIngredient: () => ({ nom: "Crème liquide UHT 35 % MG", note: "Chauffer à 80 °C avec le glucose et le sucre inverti" }) },
      { role: "liquide_sl", label: "Lait de coco",
        pct: 40,
        actif: (_p, c) => c.lactose || c.vegan || c.bien_etre,
        getIngredient: (_p, c) => ({
          nom: "Lait de coco 17–22 % MG",
          note: c.vegan
            ? "Version vegan — note coco subtile, compatible avec toutes les couvertures"
            : "Version sans lactose / bien-être — note coco légère",
        }) },
      { role: "glucose", label: "Glucose DE38",
        pct: 5,
        getIngredient: () => ({ nom: "Glucose atomisé DE38", note: "Favorise l'onctuosité et limite la cristallisation de la ganache" }) },
      { role: "sucrant2", label: "Sucre inverti (Trimoline)",
        pct: 5,
        actif: (_p, c) => !c.bien_etre,
        getIngredient: () => ({ nom: "Sucre inverti (Trimoline)", note: "Prolonge le fondant et la conservation — ajouter avec le glucose dans la crème chaude" }) },
      { role: "sucrant2_be", label: "Sirop d'érable",
        pct: 5,
        actif: (_p, c) => c.bien_etre,
        getIngredient: () => ({ nom: "Sirop d'érable pur", note: "IG ≈ 54 — remplace le sucre inverti, note boisée discrète" }) },
      { role: "couverture", label: "Couverture",
        pct: 45,
        pctOverride: (p) => {
          const fam = PARFUMS[p].famille;
          return (fam === 'praline' || fam === 'fruit_sec') ? 30 : 45;
        },
        getIngredient: (p, c) => {
          const fam = PARFUMS[p].famille;
          if (fam === 'chocolat') {
            const noms = {
              choc_noir:   'Couverture noire 70 %',
              choc_noir64: 'Couverture noire 64 %',
              choc_lait:   'Couverture lait 40 %',
              choc_blanc:  'Couverture blanche 35 %',
              choc_blond:  'Couverture blond caramélisé',
              choc_ruby:   'Couverture ruby',
            };
            const nom = noms[p] ?? 'Couverture chocolat';
            return { nom: (c.lactose || c.vegan) ? `${nom} (sans lait)` : nom, note: "Fondre à 45 °C au bain-marie avant d'émulsionner" };
          }
          const needsBlanc = fam === 'fruit_sec' || p === 'praline_pi' || p === 'praline_pe';
          const nom = needsBlanc ? 'Couverture blanche 35 %' : 'Couverture lait 40 %';
          return { nom: (c.lactose || c.vegan) ? `${nom} (sans lait)` : nom, note: "Couverture de liaison — fondre à 40–45 °C, incorporer au praliné fondu" };
        },
      },
      { role: "praline", label: "Praliné / pâte oléagineuse",
        pct: 15,
        actif: (p) => {
          const fam = PARFUMS[p].famille;
          return fam === 'praline' || fam === 'fruit_sec';
        },
        getIngredient: (p) => ({
          nom: PARFUMS[p].label,
          note: PARFUMS[p].famille === 'fruit_sec'
            ? "Pâte pure 100 % — tempérer à 22–24 °C pour fluidifier avant incorporation"
            : "Tempérer à 22–24 °C — homogénéiser avant usage",
        }) },
      { role: "mg", label: "Beurre doux",
        pct: 5,
        actif: (_p, c) => !c.lactose && !c.vegan && !c.bien_etre,
        getIngredient: () => ({ nom: "Beurre doux 84 % MG", note: "Incorporer en petits dés à 30–35 °C pour l'émulsion finale — mixeur plongeant 30 s" }) },
      { role: "mg_sl", label: "Beurre de cacao",
        pct: 5,
        actif: (_p, c) => c.lactose || c.vegan || c.bien_etre,
        getIngredient: () => ({ nom: "Beurre de cacao", note: "Fondre à 40 °C — incorporer à 30–35 °C pour l'émulsion finale" }) },
      { role: "lecithine", label: "Lécithine de soja",
        pct: 0.5,
        actif: (_p, c) => c.vegan,
        getIngredient: () => ({ nom: "Lécithine de soja en poudre", note: "Incorporer avec le beurre de cacao — améliore l'émulsification en l'absence de protéines du lait" }) },
    ],
    process: (p, c) => {
      const fam       = PARFUMS[p].famille;
      const isPraline = fam === 'praline' || fam === 'fruit_sec';
      const couv = (() => {
        if (fam === 'chocolat') {
          const noms = {
            choc_noir:   'couverture noire 70 %',
            choc_noir64: 'couverture noire 64 %',
            choc_lait:   'couverture lait 40 %',
            choc_blanc:  'couverture blanche 35 %',
            choc_blond:  'couverture blond caramélisé',
            choc_ruby:   'couverture ruby',
          };
          const base = noms[p] ?? 'couverture';
          return (c.lactose || c.vegan) ? `${base} (sans lait)` : base;
        }
        const needsBlanc = fam === 'fruit_sec' || p === 'praline_pi' || p === 'praline_pe';
        const base = needsBlanc ? 'couverture blanche 35 %' : 'couverture lait 40 %';
        return (c.lactose || c.vegan) ? `${base} (sans lait)` : base;
      })();
      const liquide  = (c.lactose || c.vegan || c.bien_etre) ? "le lait de coco" : "la crème UHT 35 %";
      const mg       = (c.lactose || c.vegan || c.bien_etre) ? "le beurre de cacao fondu à 40 °C" : "le beurre doux en petits dés";
      const sucrant2 = c.bien_etre ? "le sirop d'érable" : "le sucre inverti (Trimoline)";
      return [
        `Fondre la ${couv} à 45 °C au bain-marie ou au micro-ondes par impulsions de 30 s.`,
        `Chauffer ${liquide} avec le glucose atomisé et ${sucrant2} à 80 °C.`,
        `Verser en 3 fois sur la couverture fondue en mélangeant par cercles concentriques. Émulsionner au mixeur plongeant 30 s.`,
        isPraline ? `Incorporer ${PARFUMS[p].label.toLowerCase()} (tempéré à 22–24 °C) dans la ganache à 35 °C. Mélanger jusqu'à homogénéité.` : null,
        `Incorporer ${mg}${c.vegan ? " et la lécithine de soja," : ","} mixer 30 s. Température finale : 30–35 °C.`,
        `Couler en cadre inox 6–8 mm sur feuille guitare à 30–35 °C. Lisser à la spatule coudée.`,
        `Cristalliser à +4 °C 4 h. Surgeler 4 h minimum. Détailler impérativement surgelé.`,
        `Indice de qualité : coupe nette, texture fondante et soyeuse en bouche — pas de grain, pas de séparation visible.`,
      ].filter(Boolean);
    },
  },

};

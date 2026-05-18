/* =====================================================================
   TEMPLATES — chaque texture définit ses lignes fonctionnelles
   Chaque ligne porte un rôle (parfum, gélifiant, émulsifiant, etc.)
   et un % par défaut. Les fonctions getIngredient/pctOverride/actif
   permettent d'adapter la recette au parfum et aux contraintes.
   ===================================================================== */

import { PARFUMS } from './data.js';

export const TEMPLATES = {

  /* ----------------------- MOUSSE AUX FRUITS ----------------------- */
  mousse_fruits: {
    label: "Mousse aux fruits",
    description: "Mousse aérée à base de purée de fruit, structurée par gélifiant et meringue.",
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
          note: PARFUMS[p].enzyme ? "Purée riche en enzymes : pasteuriser à 90 °C 1 min avant usage" : null
        })
      },
      { role: "sucrant", label: "Sucrant", pct: 14,
        getIngredient: (_p, c) => c.igbas ? { nom: "Sucre de coco" } : { nom: "Sucre semoule" }
      },
      { role: "gelifiant", label: "Gélifiant", pct: 1.6,
        getIngredient: (_p, c) => c.vegan
          ? { nom: "Pectine NH (amidée)", note: "Mélangée à un sec (sucre/inuline) avant incorporation" }
          : { nom: "Gélatine en poudre 220 Bloom", note: "Hydrater dans 6× son poids d'eau froide 20 min" },
        pctOverride: (_p, c) => c.vegan ? 1.2 : 1.6
      },
      { role: "fibre", label: "Structure / fibre", pct: 5,
        getIngredient: (_p, c) => ({
          nom: c.vegan ? "Inuline de chicorée (longue chaîne)" : "Inuline de chicorée",
          note: "Apporte du corps sans ajouter de sucre"
        })
      },
      { role: "aeration", label: "Agent d'aération", pct: 22,
        getIngredient: (_p, c) => {
          if (c.vegan)   return { nom: "Meringue à base de blancs végétaux reconstitués", note: "Eau + protéine de pois 8 % + xanthane 0,15 %" };
          if (c.lactose) return { nom: "Meringue italienne (blancs d'œufs pasteurisés + sirop de sucre)" };
          return { nom: "Crème UHT 35 % MG montée souple", note: "Monter au bec d'oiseau, ne pas trop serrer" };
        },
        pctOverride: (_p, c) => c.vegan ? 22 : c.lactose ? 18 : 28
      },
      { role: "sucre_aer", label: "Sucre de l'aération", pct: 8,
        getIngredient: (_p, c) => c.igbas
          ? { nom: "Sucre de coco (pour meringue)" }
          : { nom: "Sucre semoule (pour meringue)" },
        actif: (_p, c) => c.vegan || c.lactose
      },
      { role: "stab", label: "Stabilisant", pct: 0.15,
        getIngredient: () => ({ nom: "Gomme xanthane", note: "Limite la coalescence des bulles dans une mousse vegan" }),
        actif: (_p, c) => c.vegan
      },
      { role: "calcium", label: "Source de calcium", pct: 0.4,
        getIngredient: () => ({ nom: "Lactate de calcium", note: "Active la pectine NH en milieu peu acide" }),
        actif: (p, c) => c.vegan && !PARFUMS[p].acide
      },
      { role: "eau", label: "Eau / phase aqueuse", pct: 4,
        getIngredient: () => ({ nom: "Eau" })
      }
    ],

    process: (p, c) => {
      const steps = [];
      const parfum = PARFUMS[p].label.toLowerCase();
      if (PARFUMS[p].enzyme) {
        steps.push(`Pasteuriser la purée de ${parfum} à 90 °C pendant 1 min, refroidir.`);
      }
      if (c.vegan) {
        steps.push(`Mélanger à sec la pectine NH avec une partie du sucre et l'inuline.`);
        steps.push(`Chauffer la purée de ${parfum} avec l'eau et le lactate de calcium à 40 °C, ajouter le mélange sec en pluie, porter à 85 °C en mixant.`);
        steps.push(`Réserver à 50–55 °C (la base ne doit pas figer avant le montage).`);
      } else {
        steps.push(`Hydrater la gélatine dans 6× son poids d'eau froide pendant 20 min.`);
        steps.push(`Chauffer la purée de ${parfum} avec l'inuline à 45 °C, dissoudre la gélatine essorée, mixer.`);
        steps.push(`Refroidir à 25–28 °C.`);
      }
      if (c.vegan) {
        steps.push(`Préparer les blancs végétaux : mixer eau, protéine de pois et xanthane, foisonner au batteur. Serrer avec le sucre en pluie.`);
        steps.push(`Verser délicatement la base fruit à 50 °C sur la meringue, lisser à la maryse.`);
      } else if (c.lactose) {
        steps.push(`Cuire un sirop sucre + eau à 118 °C. Monter les blancs et verser le sirop en filet pour une meringue italienne.`);
        steps.push(`Détendre 1/3 de meringue dans la base, puis incorporer le reste à la maryse.`);
      } else {
        steps.push(`Monter la crème au bec d'oiseau.`);
        steps.push(`Détendre 1/3 de crème montée dans la base à 25 °C, puis incorporer le reste à la maryse.`);
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
          const base = (c.lactose || c.vegan) ? "Boisson d'amande non sucrée" : "Lait entier UHT";
          if (f === "epice" || f === "infusion") {
            return { nom: base, note: `À infuser avec ${PARFUMS[p].label.toLowerCase()} (8–12 min hors feu, à couvert, puis filtrer et ajuster le poids)` };
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
        getIngredient: (_p, c) => c.igbas ? { nom: "Sucre de coco" } : { nom: "Sucre semoule" }
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
        getIngredient: (_p, c) => c.vegan
          ? { nom: "Agar-agar", note: "À combiner avec l'amidon pour une sensation crémeuse" }
          : { nom: "Gélatine en poudre 220 Bloom", note: "Hydrater dans 6× son poids d'eau froide" },
        pctOverride: (_p, c) => c.vegan ? 0.4 : 0.8
      },
      { role: "mg", label: "Matière grasse de finition", pct: 8,
        getIngredient: (_p, c) => (c.vegan || c.lactose)
          ? { nom: "Beurre de cacao", note: "Cristallise et apporte le fondant à 36 °C" }
          : { nom: "Beurre doux", note: "À 18–22 °C, ajouté à la fin pour lisser" },
        actif: (p) => PARFUMS[p].famille !== "chocolat"
      },
      { role: "fibre", label: "Structure / fibre", pct: 3,
        getIngredient: () => ({ nom: "Inuline de chicorée" })
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
      if (c.vegan) {
        steps.push(`Disperser à froid l'agar-agar et l'amidon dans la phase aqueuse.`);
      } else {
        steps.push(`Hydrater la gélatine dans 6× son poids d'eau froide pendant 20 min.`);
      }
      if (c.vegan) {
        steps.push(`Porter la phase aqueuse + le lait de coco + le sucre + l'inuline à ébullition en fouettant (1 min) pour activer agar et amidon.`);
        let dest = "";
        if (f === "chocolat")                                dest = ", puis verser en 3 fois sur la couverture fondue à 45 °C";
        else if (f === "praline" || f === "fruit_sec")       dest = `, puis verser sur ${parfum}`;
        else if (f === "caramel")                            dest = `, puis incorporer le caramel`;
        else if (forme === "poudre")                         dest = `, puis ajouter la poudre tamisée`;
        steps.push(`Hors du feu, ajouter la lécithine de tournesol${dest}, mixer 2 min au mixeur plongeant pour parfaire l'émulsion.`);
      } else {
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

};

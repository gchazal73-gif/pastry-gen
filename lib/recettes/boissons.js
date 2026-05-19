export const RECETTES_BOISSONS = [
  {
    id: "chocolat-chaud-noir",
    nom: "Chocolat chaud",
    categorie: "boissons",
    sous_categorie: "chocolat_chaud",
    description: "Chocolat chaud émulsionné, texture lisse et brillante. Simple et puissant, à servir à 65°C.",
    masse_totale_g: 1237,
    ingredients: [
      { nom: "Lait UHT entier",   g: 1000, pct: 81,   role: "eau"       },
      { nom: "Amidon de maïs",    g: 7,    pct: 0.5,  role: "structure" },
      { nom: "Chocolat noir 67%", g: 230,  pct: 18.5, role: "parfum"    },
    ],
    procede: [
      "Dans une casserole, mélanger le lait et l'amidon.",
      "Porter à ébullition.",
      "Verser sur le chocolat, émulsionner au mixeur plongeant.",
      "Réchauffer si nécessaire à 65°C. Servir aussitôt ou stocker en chocolatière.",
    ],
    cuisson: { temperature_c: null, duree_min: null, mode: null },
    temperatures: { service_c: 65, conservation_c: 4 },
    contraintes: { vegan: false, sans_lactose: false, sans_gluten: true, ig_bas: false },
    a_verifier: false,
    allergenes: ["lait"],
    tags: ["chocolat chaud", "boisson", "chocolat noir", "service"],
    parfum_principal: "chocolat noir",
    note_concepteur: "Pour une texture plus onctueuse : ajouter de l'amidon de maïs (0,5%), de la gomme de caroube ou de guar (0,1%).",
    source_interne: {
      fichier_pdf: "210902_WEISS_LE LIVRE DU SAVOIR FAIRE_EXE_BD.pdf",
      page: 56,
      chef: null,
    },
  },
];

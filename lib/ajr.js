// Valeurs nutritionnelles de référence — règlement européen INCO 1169/2011
// Adulte type 2000 kcal. Source : Annexe XIII du règlement.

const AJR_ADULTE_2000KCAL = {
  energie_kcal:        2000,
  energie_kj:          8400,
  lipides_g:             70,
  lipides_satures_g:     20,
  glucides_g:           260,
  sucres_g:              90,
  protides_g:            50,
  fibres_g:              25,   // référence ANSES (INCO ne fixe pas de VNR pour les fibres)
  sel_g:                  6,
};

// Profil femme 1800 kcal — ratios INCO ajustés à l'apport énergétique
const AJR_FEMME_1800KCAL = {
  energie_kcal:        1800,
  energie_kj:          7560,
  lipides_g:             63,
  lipides_satures_g:     18,
  glucides_g:           234,
  sucres_g:              81,
  protides_g:            45,
  fibres_g:              25,
  sel_g:                  6,
};

const PROFILS = {
  adulte_2000kcal: AJR_ADULTE_2000KCAL,
  femme_1800kcal:  AJR_FEMME_1800KCAL,
};

export function getAJR(profileId = 'adulte_2000kcal') {
  return PROFILS[profileId] ?? AJR_ADULTE_2000KCAL;
}

export { AJR_ADULTE_2000KCAL, AJR_FEMME_1800KCAL };

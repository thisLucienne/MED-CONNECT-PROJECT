// Interface Patient
export interface Patient {
    id: string;
    nom: string;
    prenom: string;
    dateNaissance: string;
    sexe: 'M' | 'F';
    telephone: string;
    email: string;
    adresse: string;
    numeroSecuriteSociale: string;
    groupeSanguin?: string;
    dateInscription: string;
    statut: 'actif' | 'inactif';
}

// Interface pour le formulaire d'ajout
export interface PatientForm {
    nom: string;
    prenom: string;
    dateNaissance: string;
    sexe: 'M' | 'F' | '';
    telephone: string;
    email: string;
    adresse: string;
    numeroSecuriteSociale: string;
    groupeSanguin?: string;
}
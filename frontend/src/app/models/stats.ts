// Interface pour les statistiques principales
export interface Stats {
    totalPatients: number;
    patientsGrowth: number;
    medecinsActifs: number;
    medecinsGrowth: number;
    dossiersMedicaux: number;
    dossiersGrowth: number;
    consultations: number;
    consultationsGrowth: number;
}

// Interface pour les activités récentes
export interface Activity {
    id: number;
    description: string;
    time: string;
    isRecent: boolean;
}
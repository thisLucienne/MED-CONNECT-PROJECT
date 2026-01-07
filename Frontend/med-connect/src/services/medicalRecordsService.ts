import httpService from './httpService';
import { ENDPOINTS } from '../config/api';

// Types pour les dossiers médicaux
export interface MedicalRecord {
  id: string;
  titre: string;
  description?: string;
  type: 'CONSULTATION' | 'URGENCE' | 'SUIVI';
  statut: 'OUVERT' | 'FERME' | 'EN_COURS';
  dateCreation: string;
  dateMiseAJour: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  documents?: Document[];
  ordonnances?: Prescription[];
  allergies?: Allergy[];
  commentaires?: Comment[];
}

export interface Document {
  id: string;
  nom: string;
  type: string;
  url: string;
  taille: number;
  dateUpload: string;
  uploadePar: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Prescription {
  id: string;
  medicament: string;
  dosage: string;
  duree: string;
  dateCreation: string;
  medecin: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Allergy {
  id: string;
  nom: string;
  dateAjout: string;
}

export interface Comment {
  id: string;
  contenu: string;
  dateCreation: string;
  auteur: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface CreateMedicalRecordData {
  titre: string;
  description?: string;
  type: 'CONSULTATION' | 'URGENCE' | 'SUIVI';
}

export interface MedicalRecordsResponse {
  success: boolean;
  data: {
    dossiers: MedicalRecord[];
    total: number;
  };
  pagination: {
    page: number;
    limite: number;
  };
}

class MedicalRecordsService {
  // Obtenir la liste des dossiers médicaux
  async getMedicalRecords(page: number = 1, limite: number = 20): Promise<MedicalRecordsResponse> {
    try {
      const response = await httpService.get<MedicalRecordsResponse>(
        `${ENDPOINTS.DOSSIERS.LIST}?page=${page}&limite=${limite}`
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des dossiers');
    }
  }

  // Obtenir un dossier complet par ID
  async getMedicalRecord(dossierId: string): Promise<{ success: boolean; data: MedicalRecord }> {
    try {
      const response = await httpService.get<{ success: boolean; data: MedicalRecord }>(
        ENDPOINTS.DOSSIERS.GET(dossierId)
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du dossier');
    }
  }

  // Créer un nouveau dossier médical
  async createMedicalRecord(data: CreateMedicalRecordData): Promise<{ success: boolean; data: MedicalRecord }> {
    try {
      const response = await httpService.post<{ success: boolean; data: MedicalRecord }>(
        ENDPOINTS.DOSSIERS.CREATE,
        data
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du dossier');
    }
  }

  // Ajouter un document à un dossier
  async addDocument(dossierId: string, file: FormData): Promise<{ success: boolean; data: Document }> {
    try {
      const response = await httpService.post<{ success: boolean; data: Document }>(
        ENDPOINTS.DOSSIERS.ADD_DOCUMENT(dossierId),
        file,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout du document');
    }
  }

  // Ajouter un commentaire à un dossier
  async addComment(dossierId: string, contenu: string): Promise<{ success: boolean; data: Comment }> {
    try {
      const response = await httpService.post<{ success: boolean; data: Comment }>(
        ENDPOINTS.DOSSIERS.ADD_COMMENT(dossierId),
        { contenu }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout du commentaire');
    }
  }

  // Donner accès à un médecin
  async grantDoctorAccess(dossierId: string, medecinId: string, typeAcces: 'LECTURE' | 'ECRITURE' = 'LECTURE'): Promise<{ success: boolean }> {
    try {
      const response = await httpService.post<{ success: boolean }>(
        `/dossiers/${dossierId}/acces`,
        { medecinId, typeAcces }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'octroi d\'accès');
    }
  }

  // Révoquer l'accès d'un médecin
  async revokeDoctorAccess(dossierId: string, medecinId: string): Promise<{ success: boolean }> {
    try {
      const response = await httpService.delete<{ success: boolean }>(
        `/dossiers/${dossierId}/acces/${medecinId}`
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la révocation d\'accès');
    }
  }

  // Supprimer un dossier médical
  async deleteMedicalRecord(dossierId: string): Promise<{ success: boolean }> {
    try {
      const response = await httpService.delete<{ success: boolean }>(
        `/dossiers/${dossierId}`
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du dossier');
    }
  }

  // Télécharger un dossier médical complet (PDF)
  async downloadMedicalRecord(dossierId: string): Promise<Blob> {
    try {
      const response = await httpService.get(
        `/dossiers/${dossierId}/download`,
        {
          responseType: 'blob',
        }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du téléchargement du dossier');
    }
  }

  // Télécharger un document spécifique
  async downloadDocument(dossierId: string, documentId: string): Promise<Blob> {
    try {
      const response = await httpService.get(
        `/dossiers/${dossierId}/documents/${documentId}/download`,
        {
          responseType: 'blob',
        }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du téléchargement du document');
    }
  }

  // Obtenir la liste des médecins ayant accès à un dossier
  async getDoctorAccess(dossierId: string): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await httpService.get<{ success: boolean; data: any[] }>(
        `/dossiers/${dossierId}/acces`
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des accès');
    }
  }

  // Rechercher des médecins pour partage
  async searchDoctors(query: string): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await httpService.get<{ success: boolean; data: any[] }>(
        `/messages/medecins/recherche?q=${encodeURIComponent(query)}`
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la recherche de médecins');
    }
  }
}

export default new MedicalRecordsService();
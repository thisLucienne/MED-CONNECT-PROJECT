import httpService from './httpService';
import { ENDPOINTS } from '../config/api';

// Types pour les dossiers médicaux
export interface MedicalRecord {
  id: string;
  patientId: string;
  titre: string;
  description?: string;
  type: 'CONSULTATION' | 'URGENCE' | 'SUIVI';
  dateCreation: string;
  dateModification: string;
  statut: 'ouvert' | 'ferme';
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
  dateAjout: string;
}

export interface Prescription {
  id: string;
  medicament: string;
  dosage?: string;
  duree?: string;
  dateAjout: string;
  medecinNom: string;
}

export interface Allergy {
  id: string;
  nom: string;
  dateAjout: string;
}

export interface Comment {
  id: string;
  contenu: string;
  auteurNom: string;
  dateAjout: string;
}

export interface CreateRecordData {
  titre: string;
  description?: string;
  type: 'CONSULTATION' | 'URGENCE' | 'SUIVI';
}

export interface AddCommentData {
  contenu: string;
}

class MedicalRecordService {
  // Créer un dossier médical
  async createRecord(recordData: CreateRecordData): Promise<{ success: boolean; message: string; data: MedicalRecord }> {
    try {
      const response = await httpService.post(ENDPOINTS.DOSSIERS.CREATE, recordData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du dossier');
    }
  }

  // Obtenir la liste des dossiers
  async getRecords(page: number = 1, limit: number = 20): Promise<{ success: boolean; data: MedicalRecord[]; pagination: any }> {
    try {
      const response = await httpService.get(`${ENDPOINTS.DOSSIERS.LIST}?page=${page}&limite=${limit}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des dossiers');
    }
  }

  // Obtenir un dossier complet
  async getRecord(recordId: string): Promise<{ success: boolean; data: MedicalRecord }> {
    try {
      const response = await httpService.get(ENDPOINTS.DOSSIERS.GET(recordId));
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du dossier');
    }
  }

  // Ajouter un document (avec upload)
  async addDocument(recordId: string, file: any, name: string, type: string): Promise<{ success: boolean; message: string; data: Document }> {
    try {
      const formData = new FormData();
      formData.append('fichier', file);
      formData.append('nom', name);
      formData.append('type', type);

      const response = await httpService.post(
        ENDPOINTS.DOSSIERS.ADD_DOCUMENT(recordId),
        formData,
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

  // Ajouter un commentaire
  async addComment(recordId: string, commentData: AddCommentData): Promise<{ success: boolean; message: string; data: Comment }> {
    try {
      const response = await httpService.post(ENDPOINTS.DOSSIERS.ADD_COMMENT(recordId), commentData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout du commentaire');
    }
  }

  // Donner accès à un médecin
  async grantDoctorAccess(recordId: string, doctorId: string, accessType: 'LECTURE' | 'ECRITURE' = 'LECTURE'): Promise<{ success: boolean; message: string }> {
    try {
      const response = await httpService.post(`/dossiers/${recordId}/acces`, {
        medecinId: doctorId,
        typeAcces: accessType
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'octroi d\'accès');
    }
  }

  // Révoquer l'accès d'un médecin
  async revokeDoctorAccess(recordId: string, doctorId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await httpService.delete(`/dossiers/${recordId}/acces/${doctorId}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la révocation d\'accès');
    }
  }
}

export default new MedicalRecordService();
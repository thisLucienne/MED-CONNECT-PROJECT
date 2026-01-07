import httpService from './httpService';
import { ENDPOINTS } from '../config/api';

// Types pour les médecins
export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  specialty?: string;
  licenseNumber?: string;
  dateAutorisation?: string;
  typeAcces?: 'LECTURE' | 'ECRITURE';
}

export interface ConnectedDoctor extends Doctor {
  dateAutorisation: string;
  typeAcces: 'LECTURE' | 'ECRITURE';
  isOnline?: boolean;
  lastConnection?: string;
}

class DoctorsService {
  // Obtenir la liste des médecins connectés (qui ont accès aux dossiers du patient)
  async getConnectedDoctors(): Promise<{ success: boolean; data: ConnectedDoctor[] }> {
    try {
      const response = await httpService.get<{ success: boolean; data: ConnectedDoctor[] }>(
        ENDPOINTS.HEALTH.CONNECTED_DOCTORS
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des médecins connectés');
    }
  }

  // Obtenir tous les médecins disponibles
  async getAllDoctors(page: number = 1, limite: number = 20, specialty?: string): Promise<{ success: boolean; data: Doctor[] }> {
    try {
      let url = `/medecins?page=${page}&limite=${limite}`;
      if (specialty && specialty !== 'all') {
        url += `&specialty=${encodeURIComponent(specialty)}`;
      }
      
      const response = await httpService.get<{ success: boolean; data: Doctor[] }>(url);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des médecins');
    }
  }

  // Obtenir toutes les spécialités disponibles
  async getSpecialties(): Promise<{ success: boolean; data: string[] }> {
    try {
      const response = await httpService.get<{ success: boolean; data: string[] }>(
        '/medecins/specialites'
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des spécialités');
    }
  }

  // Rechercher des médecins pour établir une connexion
  async searchDoctors(query: string): Promise<{ success: boolean; data: Doctor[] }> {
    try {
      const response = await httpService.get<{ success: boolean; data: Doctor[] }>(
        `/medecins/recherche?q=${encodeURIComponent(query)}`
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la recherche de médecins');
    }
  }

  // Obtenir les détails d'un médecin
  async getDoctorDetails(doctorId: string): Promise<{ success: boolean; data: Doctor }> {
    try {
      const response = await httpService.get<{ success: boolean; data: Doctor }>(
        `/medecins/${doctorId}`
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des détails du médecin');
    }
  }

  // Obtenir les dossiers partagés avec un médecin spécifique
  async getSharedRecordsWithDoctor(doctorId: string): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await httpService.get<{ success: boolean; data: any[] }>(
        `/dossiers/partages/medecin/${doctorId}`
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des dossiers partagés');
    }
  }

  // Envoyer une demande de connexion à un médecin
  async sendConnectionRequest(doctorId: string, message?: string): Promise<{ success: boolean }> {
    try {
      const response = await httpService.post<{ success: boolean }>(
        '/connexions/demandes',
        { medecinId: doctorId, message }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi de la demande de connexion');
    }
  }
}

export default new DoctorsService();
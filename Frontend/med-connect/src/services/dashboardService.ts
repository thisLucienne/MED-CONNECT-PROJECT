import httpService from './httpService';
import { ENDPOINTS } from '../config/api';

// Types pour les statistiques du dashboard
export interface DashboardStats {
  dossiers: {
    total: number;
    nouveaux: number;
  };
  messages: {
    total: number;
    nonLus: number;
  };
  medecins: {
    total: number;
    connectes: number;
  };
  resultatsLabo: {
    total: number;
    recents: number;
  };
}

export interface UserHealthInfo {
  allergies: string[];
  medicaments: string[];
  conditions: string[];
  groupeSanguin?: string;
  contactUrgence?: {
    nom: string;
    telephone: string;
  };
}

class DashboardService {
  // Obtenir les statistiques du dashboard
  async getDashboardStats(): Promise<{ success: boolean; data: DashboardStats }> {
    try {
      const response = await httpService.get<{ success: boolean; data: DashboardStats }>(
        ENDPOINTS.HEALTH.DASHBOARD
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // Obtenir les informations de santé de l'utilisateur
  async getUserHealthInfo(): Promise<{ success: boolean; data: UserHealthInfo }> {
    try {
      const response = await httpService.get<{ success: boolean; data: UserHealthInfo }>(
        ENDPOINTS.HEALTH.PARAMETERS
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des informations de santé');
    }
  }

  // Obtenir la liste des médecins connectés
  async getConnectedDoctors(): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await httpService.get<{ success: boolean; data: any[] }>(
        ENDPOINTS.HEALTH.CONNECTED_DOCTORS
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des médecins');
    }
  }

  // Obtenir le nombre de messages non lus
  async getUnreadMessagesCount(): Promise<{ success: boolean; data: { count: number } }> {
    try {
      const response = await httpService.get<{ success: boolean; data: { count: number } }>(
        '/messages/unread-count'
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des messages');
    }
  }

  // Obtenir le nombre de dossiers médicaux
  async getMedicalRecordsCount(): Promise<{ success: boolean; data: { total: number; recent: number } }> {
    try {
      const response = await httpService.get<{ success: boolean; data: { total: number; recent: number } }>(
        '/dossiers/count'
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des dossiers');
    }
  }
}

export default new DashboardService();
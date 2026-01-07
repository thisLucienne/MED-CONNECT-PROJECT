import httpService from './httpService';
import { ENDPOINTS } from '../config/api';

// Types pour le profil utilisateur
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateNaissance?: string;
  profilePicture?: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  status: string;
  isVerified: boolean;
  lastConnection?: string;
  createdAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateNaissance?: string;
  profilePicture?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserStats {
  totalVisits: number;
  totalReports: number;
  totalMessages: number;
  connectedDoctors: number;
}

class ProfileService {
  // Obtenir le profil utilisateur
  async getProfile(): Promise<{ success: boolean; data: UserProfile }> {
    try {
      console.log('📡 Appel API getProfile...');
      const response = await httpService.get<{ success: boolean; data: UserProfile }>(
        ENDPOINTS.AUTH.PROFILE
      );
      console.log('📡 Réponse getProfile reçue:', JSON.stringify(response, null, 2));
      return response;
    } catch (error: any) {
      console.error('📡 Erreur getProfile:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  }

  // Mettre à jour le profil utilisateur
  async updateProfile(profileData: UpdateProfileData): Promise<{ success: boolean; data: UserProfile }> {
    try {
      const response = await httpService.put<{ success: boolean; data: UserProfile }>(
        ENDPOINTS.AUTH.PROFILE,
        profileData
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  }

  // Changer le mot de passe
  async changePassword(passwordData: ChangePasswordData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await httpService.post<{ success: boolean; message: string }>(
        '/auth/change-password',
        passwordData
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  }

  // Obtenir les statistiques utilisateur
  async getUserStats(): Promise<{ success: boolean; data: UserStats }> {
    try {
      const response = await httpService.get<{ success: boolean; data: UserStats }>(
        '/auth/stats'
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // Uploader une photo de profil
  async uploadProfilePicture(formData: FormData): Promise<{ success: boolean; data: { url: string } }> {
    try {
      const response = await httpService.post<{ success: boolean; data: { url: string } }>(
        '/upload/profile-picture',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'upload de la photo');
    }
  }

  // Supprimer le compte
  async deleteAccount(password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await httpService.delete<{ success: boolean; message: string }>(
        '/auth/delete-account',
        { data: { password } }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du compte');
    }
  }

  // Activer/désactiver la 2FA
  async toggle2FA(enable: boolean): Promise<{ success: boolean; message: string; qrCode?: string }> {
    try {
      const response = await httpService.post<{ success: boolean; message: string; qrCode?: string }>(
        '/auth/toggle-2fa',
        { enable }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la configuration 2FA');
    }
  }
}

export default new ProfileService();
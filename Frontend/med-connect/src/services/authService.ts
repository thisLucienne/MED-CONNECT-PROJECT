import httpService from './httpService';
import { ENDPOINTS } from '../config/api';

// Types pour l'authentification
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  status: string;
  profilePicture?: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens?: {
      accessToken: string;
      refreshToken: string;
    };
    requiresVerification?: boolean;
  };
}

export interface TwoFactorData {
  userId: string;
  code: string;
}

class AuthService {
  // Connexion
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await httpService.post<AuthResponse>(
        ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // Si pas de 2FA requis, sauvegarder les tokens
      if (response.data.tokens) {
        await httpService.saveTokens(response.data.tokens);
      }

      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Erreur de connexion');
    }
  }

  // Inscription patient
  async registerPatient(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await httpService.post<AuthResponse>(
        ENDPOINTS.AUTH.REGISTER_PATIENT,
        userData
      );

      // Sauvegarder les tokens après inscription
      if (response.data.tokens) {
        await httpService.saveTokens(response.data.tokens);
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'Erreur d\'inscription';
      throw new Error(errorMessage);
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      const refreshToken = await httpService.getRefreshToken();
      
      // Appeler l'endpoint de déconnexion si on a un refresh token
      if (refreshToken) {
        await httpService.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      }
    } catch (error) {
      // Ignorer les erreurs de déconnexion côté serveur
      console.warn('Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      // Toujours nettoyer les tokens côté client
      await httpService.clearTokens();
    }
  }

  // Vérification 2FA
  async verify2FA(twoFactorData: TwoFactorData): Promise<AuthResponse> {
    try {
      const response = await httpService.post<AuthResponse>(
        ENDPOINTS.AUTH.VERIFY_2FA,
        twoFactorData
      );

      // Sauvegarder les tokens après vérification 2FA
      if (response.data.tokens) {
        await httpService.saveTokens(response.data.tokens);
      }

      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Code invalide');
    }
  }

  // Renvoyer code 2FA
  async resend2FA(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await httpService.post(
        ENDPOINTS.AUTH.RESEND_2FA,
        { userId }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Erreur lors du renvoi');
    }
  }

  // Obtenir le profil utilisateur
  async getProfile(): Promise<{ success: boolean; data: { user: User } }> {
    try {
      const response = await httpService.get(ENDPOINTS.AUTH.PROFILE);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Erreur de récupération du profil');
    }
  }

  // Mettre à jour le profil
  async updateProfile(userData: Partial<User>): Promise<AuthResponse> {
    try {
      const response = await httpService.put<AuthResponse>(
        ENDPOINTS.AUTH.PROFILE,
        userData
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Erreur de mise à jour');
    }
  }

  // Vérifier si l'utilisateur est connecté
  async isAuthenticated(): Promise<boolean> {
    const token = await httpService.getAccessToken();
    return !!token;
  }

  // Vérifier la validité du token
  async verifyToken(): Promise<boolean> {
    try {
      await httpService.get('/auth/verify-token');
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService();
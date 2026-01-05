/**
 * Service d'authentification pour l'application mobile
 * Gère la connexion, l'inscription, et la gestion des tokens
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, ApiResponse } from './api';

// Types pour l'authentification
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
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
  phone?: string;
  profilePicture?: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  status: 'ACTIVE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
  isActive2FA?: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  requiresVerification?: boolean;
}

export interface TwoFARequest {
  userId: string;
  code: string;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private isAuthenticated: boolean = false;

  private constructor() {
    this.initializeAuth();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialise l'authentification au démarrage de l'app
   */
  private async initializeAuth(): Promise<void> {
    try {
      const userStr = await AsyncStorage.getItem('currentUser');
      const token = await AsyncStorage.getItem('accessToken');

      if (userStr && token) {
        this.currentUser = JSON.parse(userStr);
        this.isAuthenticated = true;
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'auth:', error);
      await this.logout();
    }
  }

  /**
   * Connexion d'un patient
   */
  public async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials, false);

      if (response.success && response.data) {
        await this.handleSuccessfulAuth(response.data);
      }

      return response;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }

  /**
   * Inscription d'un nouveau patient
   */
  public async register(userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/register/patient', userData, false);

      if (response.success && response.data) {
        await this.handleSuccessfulAuth(response.data);
      }

      return response;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  }

  /**
   * Vérification du code 2FA
   */
  public async verifyTwoFA(verificationData: TwoFARequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/verify-2fa', verificationData, false);

      if (response.success && response.data) {
        await this.handleSuccessfulAuth(response.data);
      }

      return response;
    } catch (error) {
      console.error('Erreur lors de la vérification 2FA:', error);
      throw error;
    }
  }

  /**
   * Déconnexion
   */
  public async logout(): Promise<void> {
    try {
      // Appeler l'API de déconnexion si l'utilisateur est connecté
      if (this.isAuthenticated) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      // Ignorer les erreurs de l'API de déconnexion
      // La déconnexion locale doit toujours réussir
      console.warn('Erreur lors de la déconnexion côté serveur (ignorée):', error);
    } finally {
      // Nettoyer le stockage local dans tous les cas
      try {
        await AsyncStorage.multiRemove([
          'accessToken',
          'refreshToken',
          'currentUser'
        ]);

        // Nettoyer l'état local
        this.currentUser = null;
        this.isAuthenticated = false;

        // Nettoyer le token dans l'API client
        await apiClient.removeAuthToken();

      } catch (error) {
        console.error('Erreur lors du nettoyage local:', error);
        // Forcer le nettoyage de l'état même en cas d'erreur
        this.currentUser = null;
        this.isAuthenticated = false;
      }
    }
  }

  /**
   * Mot de passe oublié
   */
  public async forgotPassword(email: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post('/auth/forgot-password', { email }, false);
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      throw error;
    }
  }

  /**
   * Réinitialisation du mot de passe
   */
  public async resetPassword(token: string, newPassword: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post('/auth/reset-password', { token, newPassword }, false);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      throw error;
    }
  }

  /**
   * Changement de mot de passe
   */
  public async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.put('/auth/change-password', { oldPassword, newPassword });
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      throw error;
    }
  }

  /**
   * Récupération du profil utilisateur actuel
   */
  public async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/profile');
      
      if (response.success && response.data?.user) {
        this.currentUser = response.data.user;
        await AsyncStorage.setItem('currentUser', JSON.stringify(response.data.user));
        
        return {
          success: true,
          data: response.data.user
        };
      }

      return {
        success: false,
        error: response.error || 'Erreur lors de la récupération du profil'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  }

  /**
   * Gère une authentification réussie
   */
  private async handleSuccessfulAuth(authData: LoginResponse): Promise<void> {
    try {
      // Sauvegarder les tokens
      if (authData.tokens) {
        await AsyncStorage.setItem('accessToken', authData.tokens.accessToken);
        await AsyncStorage.setItem('refreshToken', authData.tokens.refreshToken);
        await apiClient.saveAuthToken(authData.tokens.accessToken);
      }

      // Sauvegarder l'utilisateur
      this.currentUser = authData.user;
      this.isAuthenticated = true;
      await AsyncStorage.setItem('currentUser', JSON.stringify(authData.user));

    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données d\'auth:', error);
      throw error;
    }
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  public getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Récupère l'utilisateur actuel
   */
  public getUser(): User | null {
    return this.currentUser;
  }

  /**
   * Vérifie si l'utilisateur est un patient
   */
  public isPatient(): boolean {
    return this.currentUser?.role === 'PATIENT';
  }

  /**
   * Vérifie si l'utilisateur est un médecin
   */
  public isDoctor(): boolean {
    return this.currentUser?.role === 'DOCTOR';
  }

  /**
   * Vérifie si l'utilisateur est un admin
   */
  public isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  /**
   * Vérifie si le compte utilisateur est actif
   */
  public isAccountActive(): boolean {
    return this.currentUser?.status === 'ACTIVE' || this.currentUser?.status === 'APPROVED';
  }

  /**
   * Vérifie si la 2FA est activée
   */
  public isTwoFAEnabled(): boolean {
    return this.currentUser?.isActive2FA === true;
  }

  /**
   * Met à jour les informations de l'utilisateur local
   */
  public async updateUserInfo(updatedUser: Partial<User>): Promise<void> {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...updatedUser };
      await AsyncStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
  }

  /**
   * Rafraîchit le token d'authentification
   */
  public async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const response = await apiClient.post<AuthTokens>('/auth/refresh-token', { refreshToken }, false);

      if (response.success && response.data) {
        await AsyncStorage.setItem('accessToken', response.data.accessToken);
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
        await apiClient.saveAuthToken(response.data.accessToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      return false;
    }
  }

  /**
   * Vérifie la validité du token actuel
   */
  public async validateToken(): Promise<boolean> {
    try {
      const response = await this.getCurrentUser();
      return response.success;
    } catch (error) {
      console.error('Token invalide:', error);
      return false;
    }
  }
}

// Instance singleton du service d'authentification
export const authService = AuthService.getInstance();
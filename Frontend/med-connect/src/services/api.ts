/**
 * Configuration de base pour les appels API
 * Ce fichier centralise la configuration HTTP pour l'application mobile
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration de l'API
const getBaseURL = () => {
  // Détection automatique de l'environnement
  if (__DEV__) {
    // En développement, utiliser l'IP de votre machine
    // Changez cette IP selon votre réseau
    return 'http://10.38.12.152:5000/api'; // Votre IP actuelle
    
    // Alternatives selon l'environnement :
    // return 'http://10.0.2.2:5000/api';     // Émulateur Android
    // return 'http://localhost:5000/api';    // Web/Expo Go
  } else {
    // En production, utiliser l'URL de production
    return 'https://your-production-api.com/api';
  }
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: 30000, // 30 secondes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 seconde
};

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Classe pour gérer les appels API
export class ApiClient {
  private static instance: ApiClient;
  private baseURL: string;
  private timeout: number;

  private constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Récupère le token d'authentification stocké
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  /**
   * Sauvegarde le token d'authentification
   */
  public async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('accessToken', token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
    }
  }

  /**
   * Supprime le token d'authentification
   */
  public async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
    }
  }

  /**
   * Prépare les headers pour les requêtes
   */
  private async getHeaders(includeAuth: boolean = true): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Effectue une requête HTTP avec retry automatique
   */
  private async makeRequest<T>(
    url: string,
    options: RequestInit,
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        // Si le token a expiré, essayer de le rafraîchir
        if (response.status === 401 && retryCount === 0) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry avec le nouveau token
            const newHeaders = await this.getHeaders();
            return this.makeRequest<T>(url, { ...options, headers: newHeaders }, retryCount + 1);
          }
        }

        throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`Erreur API ${url}:`, error);

      // Retry en cas d'erreur réseau
      if (retryCount < API_CONFIG.RETRY_ATTEMPTS && this.isRetryableError(error)) {
        await this.delay(API_CONFIG.RETRY_DELAY * (retryCount + 1));
        return this.makeRequest<T>(url, options, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Détermine si une erreur peut être retentée
   */
  private isRetryableError(error: any): boolean {
    return (
      error.name === 'AbortError' ||
      error.message.includes('Network request failed') ||
      error.message.includes('timeout')
    );
  }

  /**
   * Délai d'attente
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Rafraîchit le token d'authentification
   */
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.success && data.data.tokens) {
        await this.saveAuthToken(data.data.tokens.accessToken);
        await AsyncStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      return false;
    }
  }

  /**
   * Requête GET
   */
  public async get<T>(url: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders(includeAuth);
    return this.makeRequest<T>(url, { method: 'GET', headers });
  }

  /**
   * Requête POST
   */
  public async post<T>(
    url: string,
    body?: any,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders(includeAuth);
    return this.makeRequest<T>(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Requête PUT
   */
  public async put<T>(
    url: string,
    body?: any,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders(includeAuth);
    return this.makeRequest<T>(url, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Requête DELETE
   */
  public async delete<T>(url: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders(includeAuth);
    return this.makeRequest<T>(url, { method: 'DELETE', headers });
  }

  /**
   * Upload de fichier (multipart/form-data)
   */
  public async uploadFile<T>(
    url: string,
    formData: FormData,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {};

      if (includeAuth) {
        const token = await this.getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      // Ne pas définir Content-Type pour FormData, le navigateur le fera automatiquement
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`Erreur upload ${url}:`, error);
      throw error;
    }
  }
}

// Instance singleton de l'API client
export const apiClient = ApiClient.getInstance();
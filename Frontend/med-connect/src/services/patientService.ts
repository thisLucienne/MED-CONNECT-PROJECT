/**
 * Service pour la gestion des données patient
 */

import { apiClient, ApiResponse } from './api';
import { Patient, DashboardStats, ProfileUpdateForm } from '../types';

export class PatientService {
  private static instance: PatientService;

  private constructor() {}

  public static getInstance(): PatientService {
    if (!PatientService.instance) {
      PatientService.instance = new PatientService();
    }
    return PatientService.instance;
  }

  /**
   * Récupère le profil complet du patient
   */
  public async getProfile(): Promise<ApiResponse<Patient>> {
    try {
      return await apiClient.get<Patient>('/patients/profile');
    } catch (error) {
      console.error('Erreur lors de la récupération du profil patient:', error);
      throw error;
    }
  }

  /**
   * Met à jour le profil du patient
   */
  public async updateProfile(profileData: ProfileUpdateForm): Promise<ApiResponse<Patient>> {
    try {
      return await apiClient.put<Patient>('/patients/profile', profileData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }

  /**
   * Upload de la photo de profil
   */
  public async uploadProfilePicture(imageUri: string): Promise<ApiResponse<{ profilePicture: string }>> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      return await apiClient.uploadFile<{ profilePicture: string }>('/patients/profile/picture', formData);
    } catch (error) {
      console.error('Erreur lors de l\'upload de la photo:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques du dashboard
   */
  public async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      return await apiClient.get<DashboardStats>('/patients/dashboard');
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      throw error;
    }
  }

  /**
   * Récupère les allergies du patient
   */
  public async getAllergies(): Promise<ApiResponse<string[]>> {
    try {
      return await apiClient.get<string[]>('/patients/allergies');
    } catch (error) {
      console.error('Erreur lors de la récupération des allergies:', error);
      throw error;
    }
  }

  /**
   * Met à jour les allergies du patient
   */
  public async updateAllergies(allergies: string[]): Promise<ApiResponse<string[]>> {
    try {
      return await apiClient.put<string[]>('/patients/allergies', { allergies });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des allergies:', error);
      throw error;
    }
  }

  /**
   * Récupère les médicaments actuels du patient
   */
  public async getMedications(): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get<any[]>('/patients/medications');
    } catch (error) {
      console.error('Erreur lors de la récupération des médicaments:', error);
      throw error;
    }
  }

  /**
   * Ajoute un médicament
   */
  public async addMedication(medication: any): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post<any>('/patients/medications', medication);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du médicament:', error);
      throw error;
    }
  }

  /**
   * Met à jour un médicament
   */
  public async updateMedication(medicationId: string, medication: any): Promise<ApiResponse<any>> {
    try {
      return await apiClient.put<any>(`/patients/medications/${medicationId}`, medication);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du médicament:', error);
      throw error;
    }
  }

  /**
   * Supprime un médicament
   */
  public async deleteMedication(medicationId: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<void>(`/patients/medications/${medicationId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du médicament:', error);
      throw error;
    }
  }

  /**
   * Récupère les conditions médicales du patient
   */
  public async getConditions(): Promise<ApiResponse<string[]>> {
    try {
      return await apiClient.get<string[]>('/patients/conditions');
    } catch (error) {
      console.error('Erreur lors de la récupération des conditions:', error);
      throw error;
    }
  }

  /**
   * Met à jour les conditions médicales du patient
   */
  public async updateConditions(conditions: string[]): Promise<ApiResponse<string[]>> {
    try {
      return await apiClient.put<string[]>('/patients/conditions', { conditions });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des conditions:', error);
      throw error;
    }
  }

  /**
   * Récupère les notifications du patient
   */
  public async getNotifications(page: number = 1, limit: number = 20): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get<any>(`/patients/notifications?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  }

  /**
   * Marque une notification comme lue
   */
  public async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.put<void>(`/patients/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      throw error;
    }
  }

  /**
   * Marque toutes les notifications comme lues
   */
  public async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    try {
      return await apiClient.put<void>('/patients/notifications/read-all');
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
      throw error;
    }
  }

  /**
   * Supprime le compte patient
   */
  public async deleteAccount(): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<void>('/patients/account');
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      throw error;
    }
  }

  /**
   * Met à jour les préférences de notification
   */
  public async updateNotificationPreferences(preferences: any): Promise<ApiResponse<any>> {
    try {
      return await apiClient.put<any>('/patients/preferences/notifications', preferences);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      throw error;
    }
  }

  /**
   * Récupère les préférences de notification
   */
  public async getNotificationPreferences(): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get<any>('/patients/preferences/notifications');
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      throw error;
    }
  }
}

// Instance singleton du service patient
export const patientService = PatientService.getInstance();
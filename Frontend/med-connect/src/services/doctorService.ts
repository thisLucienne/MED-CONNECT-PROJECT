/**
 * Service pour la gestion des médecins côté patient
 */

import { apiClient, ApiResponse, PaginatedResponse } from './api';
import { Doctor } from '../types';

export interface DoctorFilters {
  search?: string;
  specialty?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Specialty {
  name: string;
  doctorCount: number;
}

export class DoctorService {
  private static instance: DoctorService;

  private constructor() {}

  public static getInstance(): DoctorService {
    if (!DoctorService.instance) {
      DoctorService.instance = new DoctorService();
    }
    return DoctorService.instance;
  }

  /**
   * Obtenir la liste des médecins disponibles
   */
  public async getAvailableDoctors(filters: DoctorFilters = {}): Promise<ApiResponse<{
    doctors: Doctor[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.specialty) params.append('specialty', filters.specialty);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const queryString = params.toString();
      const url = `/patients/doctors${queryString ? `?${queryString}` : ''}`;

      return await apiClient.get(url);
    } catch (error) {
      console.error('Erreur lors de la récupération des médecins:', error);
      throw error;
    }
  }

  /**
   * Rechercher des médecins par nom ou spécialité
   */
  public async searchDoctors(
    searchQuery: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<{
    doctors: Doctor[];
    searchQuery: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    try {
      if (!searchQuery || searchQuery.trim().length < 2) {
        throw new Error('Le terme de recherche doit contenir au moins 2 caractères');
      }

      const params = new URLSearchParams({
        q: searchQuery.trim(),
        page: page.toString(),
        limit: limit.toString()
      });

      return await apiClient.get(`/patients/doctors/search?${params.toString()}`);
    } catch (error) {
      console.error('Erreur lors de la recherche de médecins:', error);
      throw error;
    }
  }

  /**
   * Obtenir les spécialités médicales disponibles
   */
  public async getSpecialties(): Promise<ApiResponse<{
    specialties: Specialty[];
  }>> {
    try {
      return await apiClient.get('/patients/specialties');
    } catch (error) {
      console.error('Erreur lors de la récupération des spécialités:', error);
      throw error;
    }
  }

  /**
   * Obtenir les détails d'un médecin spécifique
   */
  public async getDoctorDetails(doctorId: string): Promise<ApiResponse<Doctor>> {
    try {
      return await apiClient.get(`/doctors/${doctorId}`);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du médecin:', error);
      throw error;
    }
  }

  /**
   * Obtenir les médecins par spécialité
   */
  public async getDoctorsBySpecialty(
    specialty: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<{
    doctors: Doctor[];
    specialty: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    try {
      const filters: DoctorFilters = {
        specialty,
        page,
        limit,
        sortBy: 'firstName',
        sortOrder: 'asc'
      };

      return await this.getAvailableDoctors(filters);
    } catch (error) {
      console.error('Erreur lors de la récupération des médecins par spécialité:', error);
      throw error;
    }
  }

  /**
   * Obtenir les médecins recommandés (pour l'instant, retourne les premiers médecins)
   */
  public async getRecommendedDoctors(limit: number = 5): Promise<ApiResponse<{
    doctors: Doctor[];
  }>> {
    try {
      const response = await this.getAvailableDoctors({
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            doctors: response.data.doctors
          }
        };
      }

      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des médecins recommandés:', error);
      throw error;
    }
  }

  /**
   * Vérifier la disponibilité d'un médecin
   */
  public async checkDoctorAvailability(doctorId: string): Promise<ApiResponse<{
    available: boolean;
    nextAvailableSlot?: string;
  }>> {
    try {
      return await apiClient.get(`/doctors/${doctorId}/availability`);
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      throw error;
    }
  }

  /**
   * Obtenir les avis sur un médecin
   */
  public async getDoctorReviews(
    doctorId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<{
    reviews: any[];
    averageRating: number;
    totalReviews: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      return await apiClient.get(`/doctors/${doctorId}/reviews?${params.toString()}`);
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
      throw error;
    }
  }

  /**
   * Filtrer les médecins par critères multiples
   */
  public async filterDoctors(filters: {
    specialties?: string[];
    minRating?: number;
    maxDistance?: number;
    availableToday?: boolean;
    acceptsInsurance?: string[];
    languages?: string[];
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    doctors: Doctor[];
    appliedFilters: any;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    try {
      // Pour l'instant, utiliser les filtres de base disponibles
      const basicFilters: DoctorFilters = {
        page: filters.page || 1,
        limit: filters.limit || 10,
        specialty: filters.specialties?.[0], // Prendre la première spécialité pour l'instant
        sortBy: 'firstName',
        sortOrder: 'asc'
      };

      const response = await this.getAvailableDoctors(basicFilters);

      if (response.success && response.data) {
        // Appliquer des filtres côté client pour les critères non supportés par l'API
        let filteredDoctors = response.data.doctors;

        // TODO: Implémenter les filtres avancés quand les données seront disponibles
        // if (filters.minRating) {
        //   filteredDoctors = filteredDoctors.filter(doctor => doctor.rating >= filters.minRating);
        // }

        return {
          success: true,
          data: {
            doctors: filteredDoctors,
            appliedFilters: filters,
            pagination: response.data.pagination
          }
        };
      }

      return response;
    } catch (error) {
      console.error('Erreur lors du filtrage des médecins:', error);
      throw error;
    }
  }
}

// Instance singleton du service des médecins
export const doctorService = DoctorService.getInstance();
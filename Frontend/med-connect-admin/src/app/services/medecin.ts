/**
 * EXPLICATION :
 * Ce service gère toute la logique métier pour les médecins.
 * Il utilise l'API backend au lieu de données mockées.
 * 
 * providedIn: 'root' : Ce service est un singleton accessible partout dans l'app
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Medecin, MedecinForm } from '../models/medecin';
import { environment } from '../environments/environment';

interface DoctorApiResponse {
  success: boolean;
  data: {
    doctors: any[];
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

@Injectable({
  providedIn: 'root'  // Service singleton disponible dans toute l'application
})
export class MedecinService {
  private apiUrl = environment.apiUrl;

  /**
   * BehaviorSubject pour stocker la liste des médecins
   * Maintenant alimenté par l'API backend
   */
  private medecins$: BehaviorSubject<Medecin[]> = new BehaviorSubject<Medecin[]>([]);

  constructor(private http: HttpClient) {
    // Charger les médecins au démarrage
    this.loadMedecinsFromAPI();
  }

  /**
   * Charge les médecins depuis l'API backend
   */
  private loadMedecinsFromAPI(): void {
    this.getAllDoctorsFromAPI().subscribe({
      next: (medecins) => {
        this.medecins$.next(medecins);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des médecins:', error);
        // En cas d'erreur, garder une liste vide
        this.medecins$.next([]);
      }
    });
  }

  /**
   * Récupère tous les médecins depuis l'API backend
   */
  private getAllDoctorsFromAPI(filters?: any): Observable<Medecin[]> {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return throwError(() => new Error('Token d\'authentification manquant'));
    }

    const headers = { 'Authorization': `Bearer ${token}` };
    const params = {
      limit: '100', // Récupérer jusqu'à 100 médecins
      ...filters
    };

    return this.http.get<DoctorApiResponse>(`${this.apiUrl}/admin/doctors`, { headers, params })
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error('Erreur lors de la récupération des médecins');
          }
          
          // Transformer les données de l'API vers le format Medecin
          return response.data.doctors.map(doctor => this.transformApiDoctorToMedecin(doctor));
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Transforme un médecin de l'API vers le format Medecin
   */
  private transformApiDoctorToMedecin(apiDoctor: any): Medecin {
    return {
      id: apiDoctor.id,
      nom: apiDoctor.lastName,
      prenom: apiDoctor.firstName,
      specialite: apiDoctor.specialty,
      telephone: apiDoctor.phone || '',
      email: apiDoctor.email,
      dateNaissance: '', // Non disponible dans l'API
      numeroOrdre: apiDoctor.licenseNumber,
      adresse: '', // Non disponible dans l'API
      dateInscription: new Date(apiDoctor.createdAt).toISOString().split('T')[0],
      statut: this.mapApiStatusToMedecinStatus(apiDoctor.status),
      verified: apiDoctor.status === 'APPROVED',
      experience: 0 // Non disponible dans l'API, pourrait être calculé
    };
  }

  /**
   * Mappe le statut de l'API vers le statut Medecin
   */
  private mapApiStatusToMedecinStatus(apiStatus: string): 'actif' | 'inactif' | 'en attente' {
    switch (apiStatus) {
      case 'APPROVED':
        return 'actif';
      case 'PENDING':
        return 'en attente';
      case 'REJECTED':
      case 'BLOCKED':
        return 'inactif';
      default:
        return 'en attente';
    }
  }

  /**
   * Récupère la liste de tous les médecins
   * Retourne un Observable pour que les composants puissent s'abonner
   */
  getMedecins(): Observable<Medecin[]> {
    return this.medecins$.asObservable();
  }

  /**
   * Récupère un médecin spécifique par son ID
   */
  getMedecinById(id: string): Medecin | undefined {
    return this.medecins$.value.find(m => m.id === id);
  }

  /**
   * Recharge les médecins depuis l'API
   */
  refreshMedecins(): void {
    this.loadMedecinsFromAPI();
  }

  /**
   * Recherche des médecins par nom, prénom, email, spécialité
   */
  searchMedecins(query: string): Observable<Medecin[]> {
    return this.getAllDoctorsFromAPI({ search: query });
  }

  /**
   * Filtre les médecins par spécialité
   */
  getMedecinsBySpecialite(specialite: string): Observable<Medecin[]> {
    return this.getAllDoctorsFromAPI({ specialty: specialite });
  }

  /**
   * Filtre les médecins par statut
   */
  getMedecinsByStatus(status: string): Observable<Medecin[]> {
    const apiStatus = this.mapMedecinStatusToApiStatus(status);
    return this.getAllDoctorsFromAPI({ status: apiStatus });
  }

  /**
   * Mappe le statut Medecin vers le statut API
   */
  private mapMedecinStatusToApiStatus(medecinStatus: string): string {
    switch (medecinStatus) {
      case 'actif':
        return 'APPROVED';
      case 'en attente':
        return 'PENDING';
      case 'inactif':
        return 'REJECTED';
      default:
        return 'PENDING';
    }
  }

  /**
   * Les méthodes suivantes sont conservées pour la compatibilité
   * mais ne font plus d'actions réelles car les médecins sont gérés côté backend
   */

  addMedecin(medecinForm: MedecinForm): void {
    console.warn('addMedecin: Cette fonctionnalité doit être implémentée côté backend');
    // TODO: Implémenter l'ajout via API
  }

  updateMedecin(id: string, updatedMedecin: Partial<Medecin>): void {
    console.warn('updateMedecin: Cette fonctionnalité doit être implémentée côté backend');
    // TODO: Implémenter la mise à jour via API
  }

  deleteMedecin(id: string): void {
    console.warn('deleteMedecin: Cette fonctionnalité doit être implémentée côté backend');
    // TODO: Implémenter la suppression via API
  }

  toggleMedecinStatus(id: string): void {
    console.warn('toggleMedecinStatus: Cette fonctionnalité doit être implémentée côté backend');
    // TODO: Implémenter le changement de statut via API
  }

  verifyMedecin(id: string): void {
    console.warn('verifyMedecin: Cette fonctionnalité doit être implémentée côté backend');
    // TODO: Implémenter la vérification via API
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError = (error: any) => {
    let errorMessage = 'Une erreur est survenue';

    if (error.error?.error?.message) {
      errorMessage = error.error.error.message;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Erreur MedecinService:', error);
    return throwError(() => new Error(errorMessage));
  };
}
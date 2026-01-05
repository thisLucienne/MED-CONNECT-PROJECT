import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      requiresVerification: boolean;
    };
    tokens?: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export interface VerifyTwoFARequest {
  userId: string;
  code: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface PendingDoctor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  specialty: string;
  licenseNumber: string;
  phone?: string;
  createdAt: string;
}

export interface AdminStatsResponse {
  success: boolean;
  data: {
    totalUsers: number;
    totalPatients: number;
    totalDoctors: number;
    pendingDoctors: number;
    activeDoctors: number;
    totalDossiers: number;
    totalMessages: number;
    recentActivity: Array<{
      type: string;
      message: string;
      timestamp: string;
    }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private pendingVerificationSubject = new BehaviorSubject<{userId: string, email: string} | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public pendingVerification$ = this.pendingVerificationSubject.asObservable();

  constructor(private http: HttpClient) {
    // Vérifier si l'utilisateur est déjà connecté au démarrage
    this.checkAuthStatus();
  }

  /**
   * Connexion administrateur
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            if (response.data.user.requiresVerification) {
              // 2FA requis
              this.pendingVerificationSubject.next({
                userId: response.data.user.id,
                email: response.data.user.email
              });
            } else {
              // Connexion directe (pas de 2FA)
              this.handleSuccessfulAuth(response);
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Vérification du code 2FA
   */
  verifyTwoFA(verificationData: VerifyTwoFARequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/verify-2fa`, verificationData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.handleSuccessfulAuth(response);
            this.pendingVerificationSubject.next(null);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir la liste des médecins en attente de validation
   */
  getPendingDoctors(): Observable<{success: boolean, data: PendingDoctor[]}> {
    return this.http.get<any>(`${this.apiUrl}/admin/doctors/pending`, {
      headers: this.getAuthHeaders()
    }).pipe(
      // Transform the response to match the expected format
      tap(response => {
        if (response.success && response.data.doctors) {
          // Transform the response structure
          response.data = response.data.doctors;
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Valider ou rejeter un médecin
   */
  validateDoctor(doctorId: string, action: 'approve' | 'reject', rejectionReason?: string): Observable<any> {
    const body: any = { action };
    if (action === 'reject' && rejectionReason) {
      body.rejectionReason = rejectionReason;
    }

    // Note: doctorId should be the actual doctor ID from the doctors table, not the user ID
    return this.http.post(`${this.apiUrl}/admin/doctors/${doctorId}/validate`, body, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Obtenir les statistiques admin
   */
  getAdminStats(): Observable<AdminStatsResponse> {
    return this.http.get<AdminStatsResponse>(`${this.apiUrl}/admin/stats`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Obtenir tous les utilisateurs avec filtres
   */
  getUsers(filters?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Observable<any> {
    let params = '';
    if (filters) {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      params = queryParams.toString() ? `?${queryParams.toString()}` : '';
    }

    return this.http.get(`${this.apiUrl}/admin/users${params}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Déconnexion
   */
  logout(): void {
    // Supprimer les tokens du localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');

    // Réinitialiser les subjects
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.pendingVerificationSubject.next(null);
  }

  /**
   * Obtenir le token d'accès
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Vérifier si l'utilisateur est connecté et admin
   */
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return this.isAuthenticatedSubject.value && user?.role === 'ADMIN';
  }

  /**
   * Obtenir les headers d'authentification
   */
  private getAuthHeaders(): {[key: string]: string} {
    const token = this.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Gérer une authentification réussie
   */
  private handleSuccessfulAuth(response: LoginResponse): void {
    if (response.data.tokens) {
      // Sauvegarder les tokens
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    }

    // Sauvegarder l'utilisateur
    const user: User = {
      id: response.data.user.id,
      email: response.data.user.email,
      firstName: response.data.user.firstName,
      lastName: response.data.user.lastName,
      role: response.data.user.role
    };

    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Vérifier le statut d'authentification au démarrage
   */
  private checkAuthStatus(): void {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('currentUser');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'ADMIN') {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        } else {
          this.logout();
        }
      } catch (error) {
        this.logout();
      }
    }
  }

  /**
   * Gérer les erreurs HTTP
   */
  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'Une erreur est survenue';

    if (error.error?.error?.message) {
      errorMessage = error.error.error.message;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  };
}
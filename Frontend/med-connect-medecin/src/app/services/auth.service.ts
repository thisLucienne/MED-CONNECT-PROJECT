import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterDoctorRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  specialty: string;
  licenseNumber: string;
  phone?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      status: string;
    };
    doctor?: {
      specialty: string;
      licenseNumber: string;
    };
  };
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
   * Connexion utilisateur (première étape)
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
   * Inscription d'un médecin
   */
  registerDoctor(doctorData: RegisterDoctorRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register/doctor`, doctorData)
      .pipe(
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
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Rafraîchir le token
   */
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<any>(`${this.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          if (response.success && response.data.tokens) {
            localStorage.setItem('accessToken', response.data.tokens.accessToken);
            if (response.data.tokens.refreshToken) {
              localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
            }
          }
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
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
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
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
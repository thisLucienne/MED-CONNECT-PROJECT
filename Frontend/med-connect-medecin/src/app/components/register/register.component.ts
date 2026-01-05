import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, RegisterDoctorRequest } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="header">
          <img src="logo.png" alt="logo">
          <h2>Demande d'Accès Professionnel</h2>
          <p>Rejoignez la plateforme Med-Connect en tant que professionnel de santé</p>
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="register-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Prénom *</label>
              <input 
                type="text" 
                id="firstName" 
                name="firstName"
                [(ngModel)]="doctorData.firstName" 
                required
                [disabled]="isLoading"
                class="form-control"
                placeholder="Votre prénom"
              >
            </div>

            <div class="form-group">
              <label for="lastName">Nom *</label>
              <input 
                type="text" 
                id="lastName" 
                name="lastName"
                [(ngModel)]="doctorData.lastName" 
                required
                [disabled]="isLoading"
                class="form-control"
                placeholder="Votre nom"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email Professionnel *</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              [(ngModel)]="doctorData.email" 
              required
              email
              [disabled]="isLoading"
              class="form-control"
              placeholder="votre.email@hopital.com"
            >
          </div>

          <div class="form-group">
            <label for="specialty">Spécialité Médicale *</label>
            <select 
              id="specialty" 
              name="specialty"
              [(ngModel)]="doctorData.specialty" 
              required
              [disabled]="isLoading"
              class="form-control"
            >
              <option value="">Sélectionnez votre spécialité</option>
              <option value="Médecine Générale">Médecine Générale</option>
              <option value="Cardiologie">Cardiologie</option>
              <option value="Pédiatrie">Pédiatrie</option>
              <option value="Dermatologie">Dermatologie</option>
              <option value="Gynécologie">Gynécologie</option>
              <option value="Neurologie">Neurologie</option>
              <option value="Orthopédie">Orthopédie</option>
              <option value="Psychiatrie">Psychiatrie</option>
              <option value="Radiologie">Radiologie</option>
              <option value="Anesthésie">Anesthésie</option>
              <option value="Chirurgie">Chirurgie</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div class="form-group">
            <label for="licenseNumber">Numéro de Licence/Ordre *</label>
            <input 
              type="text" 
              id="licenseNumber" 
              name="licenseNumber"
              [(ngModel)]="doctorData.licenseNumber" 
              required
              [disabled]="isLoading"
              class="form-control"
              placeholder="Ex: MED-2024/001"
              maxlength="20"
            >
            <small class="form-help">Numéro d'inscription à l'ordre des médecins</small>
          </div>

          <div class="form-group">
            <label for="phone">Téléphone</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone"
              [(ngModel)]="doctorData.phone" 
              [disabled]="isLoading"
              class="form-control"
              placeholder="6 XX XX XX XX"
            >
            <small class="form-help">Format camerounais (optionnel)</small>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="password">Mot de passe *</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                [(ngModel)]="doctorData.password" 
                required
                [disabled]="isLoading"
                class="form-control"
                placeholder="Mot de passe sécurisé"
                minlength="8"
              >
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmer le mot de passe *</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword"
                [(ngModel)]="confirmPassword" 
                required
                [disabled]="isLoading"
                class="form-control"
                placeholder="Répétez le mot de passe"
              >
            </div>
          </div>

          <div class="password-requirements">
            <h4>Exigences du mot de passe :</h4>
            <ul>
              <li>Au moins 8 caractères</li>
              <li>Une majuscule et une minuscule</li>
              <li>Un chiffre</li>
              <li>Un caractère spécial (@$!%*?&)</li>
            </ul>
          </div>

          <div class="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="acceptTerms" 
              name="acceptTerms"
              [(ngModel)]="acceptTerms" 
              required
              [disabled]="isLoading"
            >
            <label for="acceptTerms">
              J'accepte les <a href="#" target="_blank">conditions d'utilisation</a> 
              et la <a href="#" target="_blank">politique de confidentialité</a> *
            </label>
          </div>

          <!-- Messages -->
          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="validation-errors" *ngIf="validationErrors.length > 0">
            <h4>Erreurs de validation :</h4>
            <ul>
              <li *ngFor="let error of validationErrors">
                <strong>{{ error.field }}:</strong> {{ error.message }}
              </li>
            </ul>
          </div>

          <button 
            type="submit" 
            class="btn-primary"
            [disabled]="!registerForm.form.valid || isLoading || !passwordsMatch() || !acceptTerms"
          >
            <span *ngIf="isLoading">Envoi en cours...</span>
            <span *ngIf="!isLoading">Envoyer la Demande</span>
          </button>
        </form>

        <div class="login-link">
          <p>Vous avez déjà un compte ? 
            <a routerLink="/login" class="link">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      position: relative;
    }

    .register-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-width: 600px;
      width: 100%;
      padding: 40px;
      animation: slideUp 0.5s ease-out;
      position: relative;
      z-index: 2;
      max-height: 90vh;
      overflow-y: auto;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;

      img {
        height: 60px;
        margin-bottom: 20px;
      }

      h2 {
        font-size: 24px;
        color: #333;
        margin: 0 0 10px 0;
        font-weight: 600;
      }

      p {
        color: #666;
        font-size: 14px;
        margin: 0;
      }
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;

      label {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }

      .form-control {
        padding: 12px 15px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.3s, box-shadow 0.3s;

        &:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        &:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
      }

      .form-help {
        font-size: 12px;
        color: #666;
        font-style: italic;
      }
    }

    .checkbox-group {
      flex-direction: row;
      align-items: flex-start;
      gap: 10px;

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        margin-top: 2px;
        cursor: pointer;
        accent-color: #667eea;
      }

      label {
        font-size: 13px;
        line-height: 1.4;
        cursor: pointer;

        a {
          color: #667eea;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .password-requirements {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #e9ecef;

      h4 {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: #495057;
      }

      ul {
        margin: 0;
        padding-left: 20px;
        font-size: 13px;
        color: #6c757d;

        li {
          margin-bottom: 3px;
        }
      }
    }

    .success-message {
      background-color: #d4edda;
      color: #155724;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #c3e6cb;
      font-size: 14px;
      text-align: center;
    }

    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #f5c6cb;
      font-size: 14px;
      text-align: center;
    }

    .validation-errors {
      background-color: #fff3cd;
      color: #856404;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #ffeaa7;

      h4 {
        margin: 0 0 10px 0;
        font-size: 14px;
      }

      ul {
        margin: 0;
        padding-left: 20px;
        font-size: 13px;

        li {
          margin-bottom: 5px;
        }
      }
    }

    .btn-primary {
      padding: 15px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    }

    .login-link {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;

      p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }

      .link {
        color: #667eea;
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .debug-info {
      margin-top: 10px;
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 4px;
      font-family: monospace;
      
      small {
        color: #6c757d;
        font-size: 12px;
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class RegisterComponent {
  doctorData: RegisterDoctorRequest = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    specialty: '',
    licenseNumber: '',
    phone: ''
  };

  confirmPassword = '';
  acceptTerms = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  validationErrors: Array<{field: string, message: string}> = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  passwordsMatch(): boolean {
    return this.doctorData.password === this.confirmPassword;
  }

  onSubmit() {
    if (!this.passwordsMatch()) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (!this.acceptTerms) {
      this.errorMessage = 'Vous devez accepter les conditions d\'utilisation';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.validationErrors = [];

    // Nettoyer les données (supprimer le téléphone s'il est vide)
    const submitData = { ...this.doctorData };
    if (!submitData.phone?.trim()) {
      delete submitData.phone;
    }

    console.log('Envoi de la demande d\'inscription:', {
      ...submitData,
      password: '***'
    });

    this.authService.registerDoctor(submitData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Réponse d\'inscription:', response);

        if (response.success) {
          this.successMessage = `Demande envoyée avec succès ! Votre compte est en attente de validation par un administrateur. Vous recevrez un email de confirmation une fois votre compte approuvé.`;
          
          // Réinitialiser le formulaire
          this.resetForm();

          // Rediriger vers la page de connexion après 5 secondes
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 5000);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur d\'inscription:', error);

        if (error.message.includes('VALIDATION_ERROR')) {
          // Essayer de parser les erreurs de validation
          try {
            const errorData = JSON.parse(error.message.split('VALIDATION_ERROR: ')[1]);
            if (errorData.details) {
              this.validationErrors = errorData.details;
            } else {
              this.errorMessage = 'Erreur de validation des données';
            }
          } catch {
            this.errorMessage = 'Erreur de validation des données';
          }
        } else {
          this.errorMessage = error.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
        }
      }
    });
  }

  private resetForm() {
    this.doctorData = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      specialty: '',
      licenseNumber: '',
      phone: ''
    };
    this.confirmPassword = '';
    this.acceptTerms = false;
  }
}
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="header">
          <div class="logo">
            <h1>Med Connect</h1>
            <div class="admin-badge">Administration</div>
          </div>
          <h2>Connexion Administrateur</h2>
          <p>Accédez au panneau d'administration de la plateforme Med-Connect</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="login-form">
          <div class="form-group">
            <label for="email">Email Administrateur</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              [(ngModel)]="credentials.email" 
              required
              email
              [disabled]="isLoading"
              class="form-control"
              placeholder="admin@medconnect.com"
            >
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="credentials.password" 
              required
              [disabled]="isLoading"
              class="form-control"
              placeholder="Votre mot de passe"
            >
          </div>

          <div class="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="rememberMe" 
              name="rememberMe"
              [(ngModel)]="rememberMe" 
              [disabled]="isLoading"
            >
            <label for="rememberMe">Se souvenir de moi</label>
          </div>

          <!-- Message d'erreur -->
          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button 
            type="submit" 
            class="btn-primary"
            [disabled]="!loginForm.form.valid || isLoading"
          >
            <span *ngIf="isLoading">Connexion en cours...</span>
            <span *ngIf="!isLoading">Se Connecter</span>
          </button>
        </form>

        <!-- Informations de test -->
        <div class="test-info">
          <h4>🔑 Compte administrateur par défaut :</h4>
          <p><strong>Email :</strong> admin@medconnect.com</p>
          <p><strong>Mot de passe :</strong> Admin123!@#</p>
          <small>Note : Un code 2FA sera envoyé par email</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-width: 450px;
      width: 100%;
      padding: 40px;
      animation: slideUp 0.5s ease-out;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;

      .logo {
        margin-bottom: 20px;

        h1 {
          font-size: 28px;
          color: #1e3c72;
          margin: 0 0 5px 0;
          font-weight: 700;
        }

        .admin-badge {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }
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

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

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
          border-color: #1e3c72;
          box-shadow: 0 0 0 3px rgba(30, 60, 114, 0.1);
        }

        &:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        &::placeholder {
          color: #999;
        }
      }
    }

    .checkbox-group {
      flex-direction: row;
      align-items: center;
      gap: 10px;

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: #1e3c72;
      }

      label {
        font-size: 13px;
        cursor: pointer;
        margin: 0;
      }
    }

    .error-message {
      background-color: #fee;
      color: #c33;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #fcc;
      font-size: 14px;
      text-align: center;
    }

    .btn-primary {
      padding: 15px 20px;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(30, 60, 114, 0.3);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    }

    .test-info {
      margin-top: 30px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;

      h4 {
        margin: 0 0 15px 0;
        color: #495057;
        font-size: 16px;
      }

      p {
        margin: 8px 0;
        font-size: 14px;
        color: #495057;
      }

      small {
        color: #6c757d;
        font-style: italic;
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

    @media (max-width: 600px) {
      .login-card {
        padding: 30px 20px;
        margin: 10px;

        .header .logo h1 {
          font-size: 24px;
        }

        .header h2 {
          font-size: 20px;
        }
      }
    }
  `],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  rememberMe = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('Tentative de connexion admin avec :', { email: this.credentials.email });

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Réponse de connexion admin:', response);

        if (response.success) {
          // Vérifier que l'utilisateur est bien admin
          if (response.data.user.role !== 'ADMIN') {
            this.errorMessage = 'Accès refusé. Seuls les administrateurs peuvent se connecter ici.';
            return;
          }

          if (response.data.user.requiresVerification) {
            // Rediriger vers la page de vérification 2FA
            this.router.navigate(['/verify-2fa']);
          } else {
            // Connexion directe réussie
            this.router.navigate(['/dashboard']);
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur de connexion admin:', error);
        this.errorMessage = error.message || 'Erreur de connexion. Vérifiez vos identifiants.';
      }
    });
  }
}
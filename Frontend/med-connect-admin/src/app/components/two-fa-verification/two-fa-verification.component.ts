import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-two-fa-verification',
  template: `
    <div class="verification-container">
      <div class="verification-card">
        <div class="verification-header">
          <div class="logo">
            <h1>Med Connect</h1>
            <div class="admin-badge">Administration</div>
          </div>
          <h2>Vérification en deux étapes</h2>
          <p>Un code de vérification a été envoyé à votre adresse email</p>
          <p class="email" *ngIf="pendingVerification">{{ pendingVerification.email }}</p>
        </div>

        <form (ngSubmit)="onSubmit()" #verificationForm="ngForm" class="verification-form">
          <div class="form-group">
            <label for="code">Code de vérification (4 chiffres)</label>
            <input
              type="text"
              id="code"
              name="code"
              [(ngModel)]="verificationCode"
              required
              maxlength="4"
              pattern="[0-9]{4}"
              class="form-control"
              placeholder="0000"
              autocomplete="one-time-code"
            >
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="!verificationForm.form.valid || isLoading"
            >
              <span *ngIf="isLoading">Vérification...</span>
              <span *ngIf="!isLoading">Vérifier et Accéder</span>
            </button>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
        </form>

        <div class="verification-footer">
          <p>Vous n'avez pas reçu le code ?</p>
          <button type="button" class="btn btn-link" (click)="resendCode()">
            Renvoyer le code
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .verification-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      padding: 20px;
    }

    .verification-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      padding: 40px;
      width: 100%;
      max-width: 400px;
      animation: slideUp 0.5s ease-out;
    }

    .verification-header {
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
        color: #333;
        margin-bottom: 10px;
        font-size: 20px;
      }

      p {
        color: #666;
        margin-bottom: 5px;
        font-size: 14px;
      }

      .email {
        font-weight: bold;
        color: #1e3c72;
      }
    }

    .form-group {
      margin-bottom: 20px;

      label {
        display: block;
        margin-bottom: 8px;
        color: #333;
        font-weight: 500;
        font-size: 14px;
      }

      .form-control {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 18px;
        text-align: center;
        letter-spacing: 0.5em;
        transition: border-color 0.3s, box-shadow 0.3s;

        &:focus {
          outline: none;
          border-color: #1e3c72;
          box-shadow: 0 0 0 3px rgba(30, 60, 114, 0.1);
        }
      }
    }

    .form-actions {
      margin-bottom: 20px;
    }

    .btn {
      width: 100%;
      padding: 15px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;

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

    .btn-link {
      background: none;
      color: #1e3c72;
      text-decoration: underline;
      padding: 8px;
      font-size: 14px;

      &:hover {
        color: #2a5298;
      }
    }

    .error-message {
      color: #dc3545;
      text-align: center;
      margin-top: 15px;
      padding: 12px;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 6px;
      font-size: 14px;
    }

    .verification-footer {
      text-align: center;
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid #eee;

      p {
        margin-bottom: 10px;
        color: #666;
        font-size: 14px;
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
  imports: [FormsModule, CommonModule]
})
export class TwoFAVerificationComponent implements OnInit {
  verificationCode = '';
  isLoading = false;
  errorMessage = '';
  pendingVerification: {userId: string, email: string} | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // S'abonner aux données de vérification en attente
    this.authService.pendingVerification$.subscribe(pending => {
      this.pendingVerification = pending;
      if (!pending) {
        // Si pas de vérification en attente, rediriger vers login
        this.router.navigate(['/login']);
      }
    });
  }

  onSubmit() {
    if (!this.pendingVerification) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verifyTwoFA({
      userId: this.pendingVerification.userId,
      code: this.verificationCode
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Rediriger vers le dashboard admin
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Code de vérification invalide';
        this.verificationCode = '';
      }
    });
  }

  resendCode() {
    // TODO: Implémenter la fonctionnalité de renvoi de code
    console.log('Renvoi du code demandé');
  }
}
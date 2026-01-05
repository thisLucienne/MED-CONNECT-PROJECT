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
              <span *ngIf="!isLoading">Vérifier</span>
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
      background-color: #f5f5f5;
      padding: 20px;
    }

    .verification-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }

    .verification-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .verification-header h2 {
      color: #333;
      margin-bottom: 10px;
    }

    .verification-header p {
      color: #666;
      margin-bottom: 5px;
    }

    .email {
      font-weight: bold;
      color: #1C74BC;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: #333;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      text-align: center;
      letter-spacing: 0.5em;
    }

    .form-control:focus {
      outline: none;
      border-color: #1C74BC;
      box-shadow: 0 0 0 2px rgba(28, 116, 188, 0.2);
    }

    .form-actions {
      margin-bottom: 20px;
    }

    .btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-primary {
      background-color: #1C74BC;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #155a94;
    }

    .btn-primary:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .btn-link {
      background: none;
      color: #1C74BC;
      text-decoration: underline;
      padding: 5px;
    }

    .btn-link:hover {
      color: #155a94;
    }

    .error-message {
      color: #dc3545;
      text-align: center;
      margin-top: 10px;
      padding: 10px;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
    }

    .verification-footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .verification-footer p {
      margin-bottom: 10px;
      color: #666;
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
          // Rediriger vers le dashboard
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
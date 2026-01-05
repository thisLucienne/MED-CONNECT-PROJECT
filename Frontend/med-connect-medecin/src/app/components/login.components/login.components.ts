import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.components.html',
  styleUrls: ['./login.components.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  credentials = {
    identifier: '',
    password: ''
  };
  rememberMe: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  onSubmit() {
    if (!this.credentials.identifier || !this.credentials.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Préparer les données de connexion
    const loginData = {
      email: this.credentials.identifier,
      password: this.credentials.password
    };

    console.log('Tentative de connexion avec :', { email: loginData.email });

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Réponse de connexion:', response);

        if (response.success) {
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
        console.error('Erreur de connexion:', error);
        this.errorMessage = error.message || 'Erreur de connexion. Vérifiez vos identifiants.';
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
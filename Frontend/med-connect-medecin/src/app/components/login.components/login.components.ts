import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.components.html',
  styleUrls: ['./login.components.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class LoginComponent {
  credentials = {
    identifier: '',
    password: ''
  };
  rememberMe: boolean = false;

  constructor(private router: Router) { }

  onSubmit() {
    // Logique d'authentification (appel d'un Service)
    console.log('Tentative de connexion avec :', this.credentials);

    // Exemple de redirection après succès
    // if (authentification reussie) {
    //   this.router.navigate(['/dashboard']);
    // }
  }
}
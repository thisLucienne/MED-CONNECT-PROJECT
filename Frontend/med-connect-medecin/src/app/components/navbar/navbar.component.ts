import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent implements OnInit {
  userInitials = 'PS';
  userName = 'Dr. Sarah';
  userRole = 'Cardiologue';
  isMenuOpen = false;

  // Notifications
  unreadMessages = 3;
  urgentDocuments = 2;
  pendingRequests = 5;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Simuler la mise à jour des notifications
    this.updateNotifications();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    console.log('Déconnexion...');
    // Rediriger vers la page de login
    this.router.navigate(['/login']);
  }

  private updateNotifications(): void {
    // Ici, on pourrait s'abonner à un service de notifications
    // Pour l'instant, on simule avec des valeurs statiques
    setInterval(() => {
      // Simulation de nouvelles notifications
      if (Math.random() > 0.8) {
        this.unreadMessages = Math.floor(Math.random() * 10);
      }
    }, 30000); // Mise à jour toutes les 30 secondes
  }
}

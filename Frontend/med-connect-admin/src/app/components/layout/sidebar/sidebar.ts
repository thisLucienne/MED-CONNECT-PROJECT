import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent implements OnInit {
  // Menu items de navigation
  menuItems: MenuItem[] = [
    {
      label: 'Tableau de bord',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Validation Médecins',
      icon: 'validation',
      route: '/validation-medecins'
    },
    {
      label: 'Patients',
      icon: 'patients',
      route: '/patients'
    },
    {
      label: 'Médecins',
      icon: 'medecins',
      route: '/medecins'
    },
    {
      label: 'Dossiers médicaux',
      icon: 'dossiers',
      route: '/dossiers'
    },
    {
      label: 'Messagerie',
      icon: 'messagerie',
      route: '/messagerie'
    },
    {
      label: 'Paramètres',
      icon: 'parametres',
      route: '/parametres'
    }
  ];

  // Informations admin
  adminInfo = {
    name: 'Admin',
    email: 'admin@medconnect.com'
  };

  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    // Mettre à jour les informations admin si disponibles
    if (this.currentUser) {
      this.adminInfo = {
        name: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
        email: this.currentUser.email
      };
    }
  }

  // Déconnexion
  logout(): void {
    console.log('Déconnexion...');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
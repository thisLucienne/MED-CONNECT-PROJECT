import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
export class SidebarComponent {
  // Menu items de navigation
  menuItems: MenuItem[] = [
    {
      label: 'Tableau de bord',
      icon: 'dashboard',
      route: '/dashboard'
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

  // Déconnexion
  logout(): void {
    console.log('Déconnexion...');
    // TODO: Implémenter la logique de déconnexion
  }
}
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../services/theme.service';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  private themeService = inject(ThemeService);
  
  searchQuery = signal('');
  showProfileMenu = signal(false);
  notificationCount = signal(3);

  userProfile: UserProfile = {
    name: 'Dr. Admin',
    email: 'admin@medconnect.com',
    role: 'Administrateur',
    avatar: undefined
  };

  ngOnInit() {
    // Initialiser le thème
    this.themeService.initTheme();
  }

  get isDarkMode() {
    return this.themeService.darkMode();
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    console.log('Recherche:', target.value);
  }

  toggleNotifications(): void {
    console.log('Toggle notifications');
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleApps(): void {
    console.log('Toggle apps');
  }

  toggleMobileMenu(): void {
    // Émettre un événement pour ouvrir/fermer la sidebar mobile
    const event = new CustomEvent('toggleMobileSidebar');
    window.dispatchEvent(event);
  }

  toggleProfileMenu(): void {
    this.showProfileMenu.set(!this.showProfileMenu());
  }

  logout(): void {
    console.log('Logout');
    this.showProfileMenu.set(false);
  }
}

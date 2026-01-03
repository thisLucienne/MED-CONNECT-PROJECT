import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('med-connect-medecin');
  showNavbar = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Initialiser showNavbar basé sur l'URL actuelle
    this.updateNavbarVisibility(this.router.url);
    
    // Écouter les changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateNavbarVisibility(event.url);
    });
  }

  private updateNavbarVisibility(url: string): void {
    // Masquer la navbar sur la page login et les pages publiques
    const publicRoutes = ['/login', '/register', '/forgot-password', '/'];
    this.showNavbar = !publicRoutes.some(route => {
      if (route === '/') {
        return url === '/' || url === '';
      }
      return url === route || url.startsWith(route + '/');
    });
    
    // Debug: afficher l'URL et l'état de la navbar
    console.log('Current URL:', url);
    console.log('Show navbar:', this.showNavbar);
  }
}

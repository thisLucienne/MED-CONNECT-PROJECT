import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navigation',
  template: `
    <nav class="admin-nav">
      <div class="nav-brand">
        <h2>Med Connect Admin</h2>
      </div>
      
      <div class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z" stroke="currentColor" stroke-width="2"/>
          </svg>
          Tableau de bord
        </a>
        
        <a routerLink="/validation-medecins" routerLinkActive="active" class="nav-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
            <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
          </svg>
          Validation Médecins
        </a>
        
        <a routerLink="/patients" routerLinkActive="active" class="nav-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M17 20H22V18C22 16.3431 20.6569 15 19 15C18.0444 15 17.1931 15.4468 16.6438 16.1429M17 20H7M17 20V18C17 17.3438 16.8736 16.717 16.6438 16.1429M7 20H2V18C2 16.3431 3.34315 15 5 15C5.95561 15 6.80686 15.4468 7.35625 16.1429M7 20V18C7 17.3438 7.12642 16.717 7.35625 16.1429M7.35625 16.1429C8.0935 14.301 9.89482 13 12 13C14.1052 13 15.9065 14.301 16.6438 16.1429M15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7ZM21 10C21 11.1046 20.1046 12 19 12C17.8954 12 17 11.1046 17 10C17 8.89543 17.8954 8 19 8C20.1046 8 21 8.89543 21 10ZM7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 11.1046 3 10C3 8.89543 3.89543 8 5 8C6.10457 8 7 8.89543 7 10Z" stroke="currentColor" stroke-width="2"/>
          </svg>
          Patients
        </a>
      </div>
      
      <div class="nav-user">
        <div class="user-info">
          <span class="user-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
          <span class="user-role">Administrateur</span>
        </div>
        <button class="logout-btn" (click)="logout()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44772 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" stroke-width="2"/>
          </svg>
          Déconnexion
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .admin-nav {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .nav-brand h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }

    .nav-links {
      display: flex;
      gap: 8px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s;
      font-weight: 500;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      &.active {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .user-name {
        font-weight: 600;
        font-size: 14px;
      }

      .user-role {
        font-size: 12px;
        opacity: 0.8;
      }
    }

    .logout-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }

    @media (max-width: 768px) {
      .admin-nav {
        padding: 0 16px;
        height: 60px;
      }

      .nav-brand h2 {
        font-size: 20px;
      }

      .nav-links {
        display: none;
      }

      .user-info {
        display: none;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavigationComponent {
  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}